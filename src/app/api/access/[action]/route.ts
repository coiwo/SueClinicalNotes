import {NextRequest,NextResponse} from 'next/server';
import {AccessError,configured,setPassword,login,logout,validSession,MAX_MS} from '~/server/access-store';
import {COOKIE_NAME} from '~/server/access';
export const runtime='nodejs';
const options={httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/'};
function json(body:object,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});}
export async function POST(req:NextRequest,{params}:{params:Promise<{action:string}>}){
 const origin=req.headers.get('origin');let local=false;
 try{const u=new URL(origin??'');local=['127.0.0.1','localhost'].includes(u.hostname)&&u.protocol==='http:';if(u.host!==req.headers.get('host')||(!local&&origin!==process.env.APP_ORIGIN))return json({error:'请求来源不正确，请从本机页面操作。'},403);}catch{return json({error:'请求来源无效。'},403);}
 const {action}=await params;
 try{
  const token=req.cookies.get(COOKIE_NAME)?.value;
  if(action==='logout'){await logout(token);const response=json({ok:true});response.cookies.set(COOKIE_NAME,'',{...options,maxAge:0});return response;}
  if(action==='session'){return await validSession(token)?json({ok:true}):json({error:'登录已过期，请重新登录。'},401);}
  if(!['setup','login'].includes(action))return json({error:'Not found'},404);
  const text=await req.text();if(text.length>4096)return json({error:'输入过长。'},400);
  let data:Record<string,unknown>;try{data=JSON.parse(text) as Record<string,unknown>;}catch{return json({error:'输入格式不正确。'},400);}
  if(typeof data?.password!=='string'||data.password.length>128||!data.password)return json({error:'请输入有效密码。'},400);
  if(action==='setup'){
   if(!local||process.env.NODE_ENV==='production')return json({error:'首次设置仅可在本机开发环境完成。'},403);
   if(data.password!==data.confirmPassword)return json({error:'两次密码不一致。'},400);
   await setPassword(data.password);
   return json({ok:true,configured:true});
  }
  if(!await configured())return json({error:'请先设置密码。'},409);
  const session=await login(data.password);const response=json({ok:true});response.cookies.set(COOKIE_NAME,session,{...options,maxAge:MAX_MS/1000});return response;
 }catch(e){if(e instanceof AccessError){const errors:Record<string,string>={already_configured:'密码已设置，请直接登录。',password_length:'请使用 12–128 个字符的密码。',not_configured:'请先设置密码。',locked:'连续输入错误，请等待 15 分钟后再试。',incorrect:'密码不正确，请重试。'};return json({error:errors[e.code]??'操作失败。'},e.code==='locked'?429:e.code==='already_configured'?409:400);}return json({error:'暂时无法完成操作，请稍后再试。'},500);}
}
