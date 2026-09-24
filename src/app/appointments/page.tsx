import Link from 'next/link';
import {requireAccess} from '~/server/access';
import {db} from '~/server/db';
import {linkDemoAppointment} from '~/app/actions';
import {Shell,Heading} from '~/app/ui';

export const dynamic='force-dynamic';
export default async function AppointmentsPage(){
 await requireAccess();
 const [appointments,patients]=await Promise.all([
  db.appointment.findMany({where:{isDemo:true},include:{patient:true},orderBy:{scheduledAt:'asc'}}),
  db.patient.findMany({where:{isDemo:true,archivedAt:null},orderBy:{identifier:'asc'}}),
 ]);
 return <Shell><main className="page">
  <Heading eyebrow="APPOINTMENTS" title="预约 / Appointments" description="模拟 Square 预约资料。关联预约不会创建已完成诊疗；只有单独保存的诊疗记录会计入次数。"/>
  <div className="review-note">当前只显示虚构示例，尚未连接 Square。真实账号连接需在后续阶段设置只读权限并核实字段。</div>
  <div className="appointment-list">{appointments.map(a=><article className="appointment-card" key={a.id}><div className="appointment-time"><strong>{a.scheduledAt.slice(0,10)}</strong><span>{a.scheduledAt.slice(11,16)}</span></div><div className="appointment-body"><span className={`tag ${a.status==='cancelled'?'tag-muted':''}`}>{a.status==='scheduled'?'已预约 / Scheduled':a.status==='cancelled'?'已取消 / Cancelled':a.status}</span><h2>{a.patient?.identifier??'未关联虚构预约'}</h2><p>来源编号：{a.squareAppointmentId} · 预约状态不代表实际就诊</p>{a.status==='scheduled'&&<form action={linkDemoAppointment} className="link-appointment"><input type="hidden" name="appointmentId" value={a.id}/><label>Link this appointment to a demo patient / 关联虚构病人<select name="patientId" defaultValue={a.patientId??''} required><option value="" disabled>Choose a demo patient / 选择病人</option>{patients.map(p=><option value={p.id} key={p.id}>{p.identifier}</option>)}</select></label><button className="secondary-button">{a.patientId?'Update patient link / 更新关联':'Save patient link / 保存关联'}</button></form>}</div><span className="appointment-status">{a.status==='scheduled'?'Not yet a clinical visit / 尚未记录为诊疗':a.status==='cancelled'?'Cancelled; no link available / 已取消':'Status needs review / 状态待核实'}</span></article>)}</div>
  <p className="review-note">同步去重、取消状态更新和 Square 字段映射将在连接真实账号时验证。本示例关联仅保存在本机测试数据库，不会写回 Square。</p>
 </main></Shell>
}
