'use client';export default function PrintButton({label='打印 / 保存为 PDF'}:{label?:string}){return <button type="button" className="secondary-button" onClick={()=>window.print()}>{label}</button>}
