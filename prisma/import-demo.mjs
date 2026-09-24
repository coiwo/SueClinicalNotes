import {readFile} from "node:fs/promises";
import {PrismaClient} from "../generated/prisma/index.js";
const db=new PrismaClient();
try {
 const {sourceText}=JSON.parse(await readFile(new URL("../storage/demo/sample.json",import.meta.url),"utf8"));
 await db.$transaction(async tx=>{
 const p=await tx.patient.upsert({where:{identifier:"DEMO-SAMPLE-001"},update:{},create:{identifier:"DEMO-SAMPLE-001",payer:"other",primaryTreatmentArea:"Low back / lumbar",caseOpenedDate:"2025-01-14",isDemo:true}});
 const e=await tx.encounter.upsert({where:{id:"demo-source-encounter"},update:{},create:{id:"demo-source-encounter",patientId:p.id}});
 if(!await tx.visit.findUnique({where:{id:"demo-source-note"}})) await tx.visit.create({data:{id:"demo-source-note",patientId:p.id,encounterId:e.id,date:"2025-01-14",kind:"follow_up",painScore:5,romData:{},treatmentAreas:["Low back / lumbar"],cptCodes:[{code:"97813",units:1,sourceOnly:true},{code:"97814",units:1,sourceOnly:true},{code:"97811",units:2,sourceOnly:true},{code:"97026",modifier:"GP",units:1,sourceOnly:true}],narrativeDelta:"Patient reports improvement after the prior treatment. Previous numeric pain score not provided.",generatedNote:sourceText,payerFlags:[{message:"Payer not provided; coding and coverage not verified.",resolved:false}]}});
 });
 console.log("De-identified sample stored under DEMO-SAMPLE-001; original file untouched.");
} finally {await db.$disconnect();}
