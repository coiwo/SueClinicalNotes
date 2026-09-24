'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {requireAccess} from '~/server/access';
import {db} from '~/server/db';

const payer=z.enum(['Aetna','Cigna','Cigna_ASH','BCBS','UHC','other']);
const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(`${v}T12:00:00Z`);return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===v;});
const text=(v:FormDataEntryValue|null,max=4000)=>typeof v==='string'?v.trim().slice(0,max):'';
const common=z.object({date:dateSchema,painScore:z.union([z.literal(''),z.coerce.number().int().min(0).max(10)]),area:z.string().trim().min(1).max(100),subjective:z.string().trim().max(4000),objective:z.string().trim().max(4000),assessment:z.string().trim().max(4000),plan:z.string().trim().max(4000),delta:z.string().trim().max(4000)});
function englishDraft(input:z.infer<typeof common>,identifier:string,kind:string){
 const sections=[['Visit',`${input.date} · ${kind}`],['Patient identifier',identifier],['Treatment area',input.area],['Patient report',input.subjective],['Objective findings',input.objective],['Assessment',input.assessment],['Plan',input.plan],['Change since prior visit',input.delta],['Pain score',input.painScore===''?'Not recorded':`${input.painScore}/10`]];
 return sections.filter(([,value])=>value).map(([title,value])=>`${title}: ${value}`).join('\n\n');
}
export async function createPatient(form:FormData){
 await requireAccess();
 const identifier=text(form.get('identifier'),80).toUpperCase();const area=text(form.get('area'),100);
 const parsed=common.safeParse({date:form.get('date'),painScore:form.get('painScore')??'',area,subjective:text(form.get('subjective')),objective:text(form.get('objective')),assessment:text(form.get('assessment')),plan:text(form.get('plan')),delta:''});
 const p=payer.safeParse(form.get('payer'));
 if(!/^[A-Z0-9][A-Z0-9-]{2,79}$/.test(identifier)||!p.success||!parsed.success||!area)throw new Error('Please check the patient ID, payer, date, treatment area, and pain score (0–10).');
 const patientId=randomUUID(),encounterId=randomUUID(),visitId=randomUUID();
 const visitDate=parsed.data.date;
 const note=englishDraft(parsed.data,identifier,'Initial draft');
 await db.$transaction(async tx=>{await tx.patient.create({data:{id:patientId,identifier,payer:p.data,primaryTreatmentArea:area,caseOpenedDate:visitDate,isDemo:true}});await tx.encounter.create({data:{id:encounterId,patientId}});await tx.visit.create({data:{id:visitId,patientId,encounterId,date:visitDate,kind:'initial',painScore:parsed.data.painScore===''?null:parsed.data.painScore as number,treatmentAreas:[area],narrativeDelta:parsed.data.subjective,generatedNote:note,payerFlags:[{type:'source_status',message:'No payer rules have been verified from source documents.',resolved:false}]}});});
 revalidatePath('/');revalidatePath('/patients');redirect(`/patients/${patientId}`);
}
export async function saveFollowUp(form:FormData){
 await requireAccess();const patientId=text(form.get('patientId'),80),editVisitId=text(form.get('editVisitId'),80);
 const parsed=common.safeParse({date:form.get('date'),painScore:form.get('painScore')??'',area:text(form.get('area'),100),subjective:text(form.get('subjective')),objective:text(form.get('objective')),assessment:text(form.get('assessment')),plan:text(form.get('plan')),delta:text(form.get('delta'))});
 if(!patientId||!parsed.success)throw new Error('Please enter a valid date, treatment area, and pain score from 0 to 10.');
 if(!parsed.data.delta&&!parsed.data.subjective&&!parsed.data.objective&&!parsed.data.assessment&&!parsed.data.plan&&parsed.data.painScore==='')throw new Error('Please enter at least one fact from this visit, such as a visit change, patient report, finding, plan, or pain score.');
 const patient=await db.patient.findFirst({where:{id:patientId,archivedAt:null},include:{visits:{orderBy:[{date:'desc'},{version:'desc'}],take:1}}});if(!patient)throw new Error('Patient not found.');
 const target=editVisitId?await db.visit.findFirst({where:{id:editVisitId,patientId,status:'draft'}}):null;if(editVisitId&&!target)throw new Error('This draft is no longer editable.');
 const encounterId=target?.encounterId??randomUUID(); const date=parsed.data.date;
 const editedNote=target?text(form.get('draftText'),4000):'';
 const note=editedNote||englishDraft(parsed.data,patient.identifier,target?'Draft revision':'Follow-up draft');
 await db.$transaction(async tx=>{if(!target)await tx.encounter.create({data:{id:encounterId,patientId}});const current=target?await tx.visit.findMany({where:{encounterId},orderBy:{version:'desc'},take:1}):[];const version=(current[0]?.version??0)+1;await tx.visit.create({data:{id:randomUUID(),patientId,encounterId,version,date,kind:target?.kind??'follow_up',painScore:parsed.data.painScore===''?target?.painScore??null:parsed.data.painScore as number,treatmentAreas:[parsed.data.area],narrativeDelta:parsed.data.delta||parsed.data.subjective||target?.narrativeDelta||'',generatedNote:note,payerFlags:[{type:'source_status',message:'No payer rules have been verified from source documents.',resolved:false}]}});});
 revalidatePath('/');revalidatePath(`/patients/${patientId}`);redirect(`/patients/${patientId}`);
}
export async function finalizeDraft(form:FormData){await requireAccess();const patientId=text(form.get('patientId'),80),visitId=text(form.get('visitId'),80);const result=await db.visit.updateMany({where:{id:visitId,patientId,status:'draft'},data:{status:'finalized',finalizedAt:new Date()}});if(result.count!==1)throw new Error('Draft not found; it may already be finalized.');revalidatePath(`/patients/${patientId}`);redirect(`/patients/${patientId}`);}
export async function updatePatient(form:FormData){await requireAccess();const id=text(form.get('id'),80),identifier=text(form.get('identifier'),80).toUpperCase(),area=text(form.get('area'),100),p=payer.safeParse(form.get('payer'));if(!id||!/^[A-Z0-9][A-Z0-9-]{2,79}$/.test(identifier)||!area||!p.success)throw new Error('Please check the patient ID, payer, and treatment area.');const patient=await db.patient.findFirst({where:{id,isDemo:true,archivedAt:null},select:{id:true}});if(!patient)throw new Error('This fictional test patient is not available to edit.');await db.patient.update({where:{id:patient.id},data:{identifier,primaryTreatmentArea:area,payer:p.data}});revalidatePath('/');revalidatePath(`/patients/${id}`);redirect(`/patients/${id}`);}
export async function linkDemoAppointment(form:FormData){await requireAccess();const appointmentId=text(form.get('appointmentId'),100),patientId=text(form.get('patientId'),100);if(!appointmentId||!patientId)throw new Error('Please choose an appointment and patient.');const appointment=await db.appointment.findFirst({where:{id:appointmentId,isDemo:true}});const patient=await db.patient.findFirst({where:{id:patientId,isDemo:true,archivedAt:null}});if(!appointment||!patient)throw new Error('Only fictional test appointments and test patients can be linked in this preview.');await db.appointment.update({where:{id:appointment.id},data:{patientId:patient.id}});revalidatePath('/appointments');redirect('/appointments');}
