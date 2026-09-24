"use client";
import SessionGuard from "./session-guard";
import LogoutButton from "./logout-button";
import Link from "next/link";
import {useState} from "react";
type Visit={id:string;date:string;pain:number|null;note:string;version:number;status:string};
type Patient={id:string;identifier:string;payer:string;area:string;count:number;visits:Visit[]};
const chapters=[
 ["Subjective:","Subjective & history","主诉与病史"],
 ["Shen:","Examination","检查发现"],
 ["TCM Diagnosis/Pattern Identification:","TCM assessment","中医辨证"],
 ["Treatment Principles:","Treatment & timing","治疗与时间"],
 ["Frequency:","Assessment & plan","评估与计划"],
];
function sections(note:string){
 const found=chapters.map(([marker,en,zh])=>({start:note.indexOf(marker!),en,zh})).filter(x=>x.start>=0).sort((a,b)=>a.start-b.start);
 return found.map((c,i)=>({...c,text:note.slice(c.start,found[i+1]?.start??note.length).trim()}));
}
function displayDate(date:string){const [y,m,d]=date.split("-");return `${y} / ${m} / ${d}`;}
export default function Workspace({patients,sampleTables}:{patients:Patient[];sampleTables:string[][][]}){
 const [selected,setSelected]=useState(patients.find(p=>p.identifier==="DEMO-SAMPLE-001")?.id??patients[0]?.id??"");
 const [visitId,setVisitId]=useState(""); const [query,setQuery]=useState("");const [tab,setTab]=useState("structured");const [feedback,setFeedback]=useState("");
 const patient=patients.find(p=>p.id===selected); const visit=patient?.visits.find(v=>v.id===visitId)??patient?.visits[0];
 const isSample=patient?.identifier==="DEMO-SAMPLE-001"; const blocks=visit?sections(visit.note):[];
 const visible=patients.filter(p=>`${p.identifier} ${p.area} ${p.payer} ${p.identifier==="DEMO-SAMPLE-001"?"示例病人 Word 腰痛":"测试病人"}`.toLowerCase().includes(query.toLowerCase()));
 const name=(p:Patient)=>p.identifier==="DEMO-SAMPLE-001"?"示例病人 · Word 样本":`测试病人 ${p.identifier.slice(-3)}`;
 async function copy(){if(!visit)return;try{await navigator.clipboard.writeText(`DRAFT — FOR REVIEW ONLY\n${visit.note}`);setFeedback("英文草稿已复制");}catch{setFeedback("复制未成功，请切换原文视图后选中文字复制。");}}
 return <div className="app"><SessionGuard/>
  <header className="topbar"><Link className="brand" href="/"><span className="monogram">S</span><span><strong>SUE</strong><small>CLINICAL NOTES</small></span></Link><nav className="main-nav"><Link href="/">工作台</Link><Link href="/patients">病人档案</Link><Link href="/patients/new">新增病人</Link><Link href="/appointments">预约</Link><Link href="/payers">保险参考</Link></nav><LogoutButton/></header>
  <div className="demo-banner">使用虚构病人编号与已去身份的样本 · 密码保护已启用 · 当前仍为示例资料预览</div>
  <div className="app-body"><aside className="patient-panel"><div className="panel-title"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>病人档案</h1></div><span className="count">{patients.length}</span></div><label className="search"><span>搜索病人 / Search</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="编号、部位或保险公司"/></label><div className="patient-list">{visible.map(p=><button key={p.id} className={`patient-item ${p.id===selected?"selected":""}`} onClick={()=>{setSelected(p.id);setVisitId("");setFeedback("");}} aria-pressed={p.id===selected}><span className="avatar">{p.identifier==="DEMO-SAMPLE-001"?"S":p.identifier.slice(-2)}</span><span className="patient-item-text"><strong>{name(p)}</strong><small>{p.identifier}</small><span>{p.area} · {p.count} 次诊疗</span></span><span className="chevron">›</span></button>)}{!visible.length&&<p className="empty">没有找到匹配的测试病人。</p>}</div><div className="sidebar-foot"><span className="small-label">当前阶段</span><strong>病历阅读体验预览</strong><p>Square 预约和病历编辑将在后续接入。</p></div></aside>
  <main className="workspace">{patient&&visit?<><div className="breadcrumb">Patients <span>/</span> {patient.identifier}</div><section className="patient-heading"><div><p className="eyebrow">PATIENT RECORD</p><h2>{name(patient)}</h2><p>病历集中在这里，每次诊疗单独保存。</p></div><span className="pill">{isSample?"去身份样本":"虚构测试资料"}</span></section>
  <section className="summary-grid"><div><span>主要部位 / Region</span><strong>{patient.area}</strong></div><div><span>保险公司 / Payer</span><strong>{isSample?"未提供 · 待确认":patient.payer.replace("_"," / ")}</strong></div><div><span>实际诊疗 / Encounters</span><strong>{patient.count}<small> 次记录</small></strong></div><div><span>本次疼痛 / Pain</span><strong>{visit.pain??"—"}<small>{visit.pain===null?" 未记录":" / 10"}</small></strong></div></section>
  <div className="record-layout"><aside className="history"><p className="eyebrow">VISIT HISTORY</p><h3>就诊历史</h3><p className="history-hint">点击日期查看病历</p>{patient.visits.map(v=><button key={v.id} className={`visit-item ${v.id===visit.id?"active":""}`} onClick={()=>{setVisitId(v.id);setFeedback("");}} aria-pressed={v.id===visit.id}><span className="timeline-dot"/><strong>{displayDate(v.date)}</strong><small>{v.status==="draft"?"草稿 Draft":"定稿 Final"} · v{v.version}</small><span>疼痛 {v.pain??"未记录"}{v.pain===null?"":" / 10"}</span></button>)}</aside>
  <div className="note-column"><section className="note-card"><div className="note-toolbar"><div><p className="eyebrow">CLINICAL NOTE</p><h3>{isSample?"针灸复诊病历":"测试病历草稿"}</h3><span className="note-meta">{displayDate(visit.date)} <span>·</span> {patient.identifier}</span></div><span className="draft">DRAFT · 待审核</span></div><div className="note-controls"><div className="tabs" role="tablist" aria-label="病历查看方式"><button role="tab" aria-selected={tab==="structured"} onClick={()=>setTab("structured")}>分章节阅读</button><button role="tab" aria-selected={tab==="source"} onClick={()=>setTab("source")}>原文查看</button></div><button className="copy-btn" onClick={copy}>复制英文草稿</button></div><p className="copy-feedback" role="status">{feedback}</p>
  <div className="note-content">{tab==="source"||!blocks.length?<pre>{visit.note}</pre>:blocks.map((b,i)=><section className="clinical-section" key={b.start}><div className="section-heading"><span>{String(i+1).padStart(2,"0")}</span><div><h4>{b.en}</h4><small>{b.zh}</small></div></div><div className="clinical-text">{(isSample && b.en==="Assessment & plan" && sampleTables.length ? b.text.split("Assessment:")[0]! : b.text).split(/\n\s*\n/).map((para,j)=><p key={j}>{para}</p>)}{isSample && b.en==="Assessment & plan" && sampleTables.map((rows,k)=><div className="source-table" key={k}><h4>{k===0?"Diagnosis — source record":"Treatment codes — source record"}</h4><div className="table-scroll"><table><thead><tr>{rows[0]?.map((cell,c)=><th key={c} scope="col">{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row,r)=><tr key={r}>{row.map((cell,c)=><td key={c}>{cell||"—"}</td>)}</tr>)}</tbody></table></div></div>)}</div></section>)}</div><div className="note-footer">本次只整理显示方式，未由 AI 改写或补充临床事实。原文与版本均保留。</div></section>
  <section className="review-card"><div><p className="eyebrow">REVIEW BEFORE FINALIZING</p><h3>待核对信息</h3></div>{isSample?<ul><li>样本未提供保险公司，暂不套用特定保险规则。</li><li>原文总时长为 100 分钟；需确认各治疗分段、留针及同时进行项目与总时长的对应关系。</li><li>主诉为腰背痛，检查中还包含肩胛及胸背区域；请确认这些内容属于本次实际发现。</li><li>原文描述改善，但未提供上次疼痛数值及本次 ROM 角度；不自动补写数值。</li><li>CPT、单位与 GP modifier 按原文保留，尚未验证其组合或支付要求。</li></ul>:<p>这是简短的虚构数据，用于检查保存与查看功能，不用于临床或保险提交。</p>}</section>
  </div></div></>:<div className="empty">暂无病历记录。</div>}<footer>ACUPUNCTURE BY SUE <span>·</span> 私密病历工作台 · 本机预览</footer></main></div>
 </div>;
}
