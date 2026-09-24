import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAccess} from '~/server/access';
import {db} from '~/server/db';
import {finalizeDraft,updatePatient} from '~/app/actions';
import {Shell,Heading} from '~/app/ui';
import PrintButton from '~/app/print-button';

export const dynamic='force-dynamic';
export default async function PatientPage({params}:{params:Promise<{id:string}>}){
 await requireAccess();
 const {id}=await params;
 const p=await db.patient.findFirst({where:{id,archivedAt:null},include:{visits:{orderBy:[{date:'desc'},{version:'desc'}]},encounters:true}});
 if(!p)notFound();
 return <Shell><main className="page">
  <div className="breadcrumb"><Link href="/patients">病人档案</Link> / {p.identifier}</div>
  <Heading eyebrow="PATIENT RECORD" title={p.identifier} description="病人资料与已保存的诊疗记录。" action={<><Link className="secondary-button" href={`/patients/${id}/new-visit`}>新增复诊 / New visit</Link><PrintButton/></>}/>
  <div className="summary-grid"><div><span>主要部位</span><strong>{p.primaryTreatmentArea}</strong></div><div><span>保险公司</span><strong>{p.payer}</strong></div><div><span>实际诊疗次数</span><strong>{p.encounters.length}</strong></div><div><span>保险规则状态</span><strong>待来源核实</strong></div></div>
  <div className="detail-grid"><section className="form-card"><p className="eyebrow">VISIT HISTORY</p><h2>就诊历史</h2>
   {p.visits.map(v=><article className="history-note" key={v.id}><div className="page-heading"><div><strong>{v.date} · {v.kind==='initial'?'初诊':'复诊'} · v{v.version}</strong><p>{v.status==='draft'?'草稿 Draft':'已定稿 Finalized'} · 疼痛 {v.painScore??'未记录'}{v.painScore===null?'':' / 10'}</p></div><div className="inline-actions">{v.status==='draft'&&<><Link className="secondary-button" href={`/patients/${id}/new-visit?edit=${v.id}`}>编辑草稿</Link><form action={finalizeDraft}><input type="hidden" name="patientId" value={p.id}/><input type="hidden" name="visitId" value={v.id}/><button className="secondary-button">审核并定稿</button></form></>}</div></div><pre className="note-preview">{v.generatedNote}</pre></article>)}
   {!p.visits.length&&<p>尚无病历。</p>}
  </section><aside className="form-card"><p className="eyebrow">PAYER REFERENCE</p><h2>保险资料 / {p.payer}</h2><p>目前没有经来源文件确认的保险规则。不会根据未经核实的说法提醒或阻止提交。</p><Link href={`/payers/${encodeURIComponent(p.payer)}`} className="text-link">查看保险资料 →</Link></aside></div>
  <details className="form-card edit-details"><summary>更正病人资料 / Edit patient details</summary><form action={updatePatient} className="clinical-form"><input type="hidden" name="id" value={p.id}/><label>病人编号<input name="identifier" required defaultValue={p.identifier}/></label><label>保险公司<select name="payer" defaultValue={p.payer}>{['Aetna','Cigna','Cigna_ASH','BCBS','UHC','other'].map(v=><option key={v}>{v}</option>)}</select></label><label>主要治疗部位<input name="area" required defaultValue={p.primaryTreatmentArea}/></label><button className="primary-button">保存资料</button></form></details>
 </main></Shell>
}
