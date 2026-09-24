import { PrismaClient } from "../generated/prisma/index.js";
const db = new PrismaClient();
try {
  if (await db.patient.count({where:{isDemo:false,archivedAt:null}})) throw new Error("Refusing demo seed alongside active non-demo patients");
  const cases = [
    {payer:"Aetna", area:"Low back", pain:[7,5,4]},
    {payer:"Cigna_ASH", area:"Neck", pain:[5,5,5]},
    {payer:"BCBS", area:"Shoulder", pain:[3,5,6]},
    {payer:"UHC", area:"Knee", pain:[6,4,null]},
  ];
  for (const [i,c] of cases.entries()) {
    const identifier=`DEMO-ONLY-00${i+1}`;
    const patient=await db.patient.upsert({where:{identifier},update:{},create:{identifier,payer:c.payer,primaryTreatmentArea:c.area,caseOpenedDate:"2026-09-01",isDemo:true}});
    for (const [j,painScore] of c.pain.entries()) {
      const id=`demo-encounter-${i+1}-${j+1}`;
      const exists=await db.encounter.findUnique({where:{id}});
      if(exists) continue;
      await db.$transaction(async tx=>{
        await tx.encounter.create({data:{id,patientId:patient.id}});
        await tx.visit.create({data:{id:`demo-note-${i+1}-${j+1}`,patientId:patient.id,encounterId:id,date:`2026-09-${String(1+j*7).padStart(2,"0")}`,kind:j===0?"initial":"follow_up",painScore,romData:{},treatmentAreas:[c.area],cptCodes:[],narrativeDelta:j===0?"Fictional baseline for development only.":painScore===null?"Current pain score not supplied in this fictional test.":`Fictional current pain score: ${painScore}/10; prior score: ${c.pain[j-1]}/10.`,generatedNote:`DRAFT — FICTIONAL TEST DATA — NOT FOR CLINICAL USE\nChart: ${identifier}\nTreatment area: ${c.area}\nPain score: ${painScore===null?"Not documented":`${painScore}/10`}\nROM, CPT codes and treatment details require clinician input.`,payerFlags:[{type:"missing_information",message:"Fictional incomplete sample; no verified payer rules applied.",resolved:false}]}});
      });
    }
  }
  const demoPatient=await db.patient.findUniqueOrThrow({where:{identifier:"DEMO-ONLY-001"}});
  const appointments=[
    {id:"demo-square-appointment-001",squareAppointmentId:"SQUARE-DEMO-001",scheduledAt:"2026-09-24T13:00:00-04:00",status:"scheduled"},
    {id:"demo-square-appointment-002",squareAppointmentId:"SQUARE-DEMO-002",scheduledAt:"2026-09-25T09:30:00-04:00",status:"scheduled"},
    {id:"demo-square-appointment-003",squareAppointmentId:"SQUARE-DEMO-003",scheduledAt:"2026-09-26T11:00:00-04:00",status:"cancelled"},
  ];
  for(const a of appointments) await db.appointment.upsert({where:{squareAppointmentId:a.squareAppointmentId},update:{},create:{...a,patientId:a.id.endsWith("001")?demoPatient.id:null,isDemo:true}});
  console.log(JSON.stringify({demoPatients:await db.patient.count({where:{isDemo:true}}),encounters:await db.encounter.count(),notes:await db.visit.count()}));
} finally {await db.$disconnect();}
