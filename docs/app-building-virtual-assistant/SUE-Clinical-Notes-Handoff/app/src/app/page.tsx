import {requireAccess} from "~/server/access";
import { readFile } from "node:fs/promises";
import { db } from "~/server/db";
import Workspace from "./workspace";
export const dynamic = "force-dynamic";
export default async function HomePage() {
 await requireAccess();
 let sampleTables: string[][][] = [];
 try { const sample = JSON.parse(await readFile("storage/demo/sample.json", "utf8")) as {tables?:string[][][]}; sampleTables=sample.tables??[]; } catch { /* Fresh clones may not include the local sample. */ }
 const patients = await db.patient.findMany({where:{isDemo:true,archivedAt:null},orderBy:{identifier:"asc"},include:{visits:{orderBy:[{date:"desc"},{version:"desc"}]},_count:{select:{encounters:true}}}});
 return <Workspace sampleTables={sampleTables} patients={patients.map(p=>({id:p.id,identifier:p.identifier,payer:p.payer,area:p.primaryTreatmentArea,count:p._count.encounters,visits:p.visits.map(v=>({id:v.id,date:v.date,pain:v.painScore,note:v.generatedNote,version:v.version,status:v.status}))}))}/>;
}
