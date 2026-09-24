import assert from "node:assert/strict";
import {PrismaClient} from "../generated/prisma/index.js";
const db=new PrismaClient();
const rollback=new Error("INTENTIONAL_TEST_ROLLBACK");
try {
 const patients=await db.patient.findMany({where:{isDemo:true,identifier:{startsWith:"DEMO-ONLY-"}},include:{encounters:true,visits:{orderBy:{date:"asc"}}},orderBy:{identifier:"asc"}});
 assert.equal(patients.length,4);
 const expected=[[7,5,4],[5,5,5],[3,5,6],[6,4,null]];
 for(const [i,p] of patients.entries()) {
  assert.equal(p.encounters.length,3); assert.equal(p.visits.length,3);
  assert.deepEqual(p.visits.map(v=>v.painScore),expected[i]);
  assert.deepEqual(p.visits.map(v=>v.date),["2026-09-01","2026-09-08","2026-09-15"]);
  assert.ok(p.visits.every(v=>v.generatedNote.includes("FICTIONAL TEST DATA") && v.status==="draft"));
 }
 console.log("PASS: four fictional patients, twelve encounters, dates, score trends and draft content read back correctly.");
 await db.$transaction(async tx=>{
  const p=await tx.patient.create({data:{identifier:"VERIFY-ROLLBACK-ONLY",payer:"other",primaryTreatmentArea:"Test",caseOpenedDate:"2026-09-22",isDemo:true}});
  const e=await tx.encounter.create({data:{patientId:p.id}});
  const data={patientId:p.id,encounterId:e.id,date:"2026-09-22",narrativeDelta:"Fictional",generatedNote:"DRAFT FICTIONAL",painScore:0};
  await assert.rejects(tx.visit.create({data:{...data,painScore:11}}));
  await assert.rejects(tx.visit.create({data:{...data,painScore:-1}}));
  const v=await tx.visit.create({data});
  await assert.rejects(tx.visit.update({where:{id:v.id},data:{generatedNote:"Overwritten"}}));
  const v2=await tx.visit.create({data:{...data,version:2,generatedNote:"Revised fictional draft"}});
  assert.equal(await tx.encounter.count({where:{patientId:p.id}}),1);
  assert.equal(await tx.visit.count({where:{patientId:p.id}}),2);
  assert.equal((await tx.visit.findUniqueOrThrow({where:{id:v.id}})).generatedNote,"DRAFT FICTIONAL");
  await assert.rejects(tx.visit.create({data:{...data,version:2}}));
  await tx.visit.update({where:{id:v2.id},data:{status:"finalized",finalizedAt:new Date()}});
  await assert.rejects(tx.visit.update({where:{id:v2.id},data:{generatedNote:"Overwrite final"}}));
  await assert.rejects(tx.visit.delete({where:{id:v2.id}}));
  await assert.rejects(tx.visit.create({data:{...data,version:3,kind:"addendum",addendumToId:v2.id}}));
  await tx.visit.create({data:{...data,version:3,kind:"addendum",addendumToId:v2.id,correctionReason:"Fictional correction test"}});
  await assert.rejects(tx.patient.delete({where:{id:p.id}}));
  await tx.patient.update({where:{id:p.id},data:{archivedAt:new Date()}});
  assert.equal(await tx.patient.count({where:{id:p.id,archivedAt:null}}),0);
  console.log("PASS: pain bounds, version preservation, encounter count, finalization lock, addendum and archive guards.");
  throw rollback;
 }).catch(err=>{if(err!==rollback)throw err;});
 assert.equal(await db.patient.count({where:{identifier:"VERIFY-ROLLBACK-ONLY"}}),0);
 console.log("PASS: verification changes rolled back; demo records unchanged.");
} finally {await db.$disconnect();}
