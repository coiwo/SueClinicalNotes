import {requireAccess} from "~/server/access";
import { db } from "~/server/db";
import Workspace from "./workspace";
export const dynamic = "force-dynamic";
export default async function HomePage() {
 await requireAccess();
 const patients = await db.patient.findMany({where:{archivedAt:null},orderBy:{updatedAt:"desc"},include:{visits:{orderBy:[{date:"desc"},{version:"desc"}]},_count:{select:{encounters:true}}}});
 return <Workspace sampleTables={[]} patients={patients.map(p=>({id:p.id,identifier:p.identifier,payer:p.payer,area:p.primaryTreatmentArea,count:p._count.encounters,visits:p.visits.map(v=>({id:v.id,date:v.date,pain:v.painScore,note:v.generatedNote,version:v.version,status:v.status}))}))} />;
}
