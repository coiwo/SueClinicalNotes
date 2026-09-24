import {requireAccess} from "~/server/access";
import { db } from "~/server/db";
import Workspace from "./workspace";
import Link from 'next/link';
export const dynamic = "force-dynamic";
export default async function HomePage() {
 await requireAccess();
 const patients = await db.patient.findMany({where:{archivedAt:null},orderBy:{updatedAt:"desc"},include:{visits:{orderBy:[{date:"desc"},{version:"desc"}]},_count:{select:{encounters:true}}}});
 return <><nav className="main-nav"><Link href="/">Patient workspace</Link><Link href="/patients">Patient list</Link><Link href="/patients/new">New patient</Link><Link href="/payers">Payer references</Link></nav><Workspace sampleTables={[]} patients={patients.map(p=>({id:p.id,identifier:p.identifier,payer:p.payer,area:p.primaryTreatmentArea,count:p._count.encounters,visits:p.visits.map(v=>({id:v.id,date:v.date,pain:v.painScore,note:v.generatedNote,version:v.version,status:v.status}))}))}/></>;
}
