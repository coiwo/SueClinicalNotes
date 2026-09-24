import {randomBytes, scryptSync, timingSafeEqual, createHash} from 'node:crypto';
import {mkdir, readFile, writeFile, rename} from 'node:fs/promises';
import path from 'node:path';
type Session={created:number;seen:number};
type State={salt:string;hash:string;failures:number;blockedUntil:number;sessions:Record<string,Session>};
export const IDLE_MS=2*60*60*1000;
export const MAX_MS=12*60*60*1000;
const globals=globalThis as unknown as {sueAccessQueue?:Promise<unknown>};
export class AccessError extends Error { code:string; constructor(code:string){super(code);this.code=code;} }
const folder=()=>process.env.SUE_AUTH_DIR??path.join(process.cwd(),'storage','private');
const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');
async function readState():Promise<State|null>{try{return JSON.parse(await readFile(path.join(folder(),'access.json'),'utf8')) as State;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}
async function writeState(state:State){await mkdir(folder(),{recursive:true,mode:0o700});const target=path.join(folder(),'access.json');const temp=`${target}.${randomBytes(8).toString('hex')}.tmp`;await writeFile(temp,JSON.stringify(state),{mode:0o600});await rename(temp,target);}
function exclusive<T>(fn:()=>Promise<T>):Promise<T>{const result=(globals.sueAccessQueue??Promise.resolve()).then(fn);globals.sueAccessQueue=result.catch(()=>undefined);return result;}
export async function configured(){return !!await readState();}
export async function setPassword(password:string){return exclusive(async()=>{if(await readState())throw new AccessError('already_configured');if(password.length<12||password.length>128)throw new AccessError('password_length');const salt=randomBytes(24).toString('hex');const hash=scryptSync(password,salt,64).toString('hex');await writeState({salt,hash,failures:0,blockedUntil:0,sessions:{}});});}
export async function login(password:string){return exclusive(async()=>{const state=await readState();if(!state)throw new AccessError('not_configured');const now=Date.now();if(state.blockedUntil>now)throw new AccessError('locked');if(state.blockedUntil){state.failures=0;state.blockedUntil=0;}const actual=scryptSync(password,state.salt,64);if(!timingSafeEqual(actual,Buffer.from(state.hash,'hex'))){state.failures++;if(state.failures>=5)state.blockedUntil=now+15*60*1000;await writeState(state);throw new AccessError(state.blockedUntil?'locked':'incorrect');}state.failures=0;state.blockedUntil=0;for(const [key,s] of Object.entries(state.sessions)){if(now-s.seen>=IDLE_MS||now-s.created>=MAX_MS)delete state.sessions[key];}const token=randomBytes(32).toString('hex');state.sessions[hashToken(token)]={created:now,seen:now};await writeState(state);return token;});}
export async function validSession(token:string|undefined,touch=true){if(!token||!/^[a-f0-9]{64}$/.test(token))return false;return exclusive(async()=>{const state=await readState();if(!state)return false;const key=hashToken(token),session=state.sessions[key];if(!session)return false;const now=Date.now();if(now-session.seen>=IDLE_MS||now-session.created>=MAX_MS){delete state.sessions[key];await writeState(state);return false;}if(touch){session.seen=now;await writeState(state);}return true;});}
export async function logout(token:string|undefined){if(!token)return;return exclusive(async()=>{const state=await readState();if(state){delete state.sessions[hashToken(token)];await writeState(state);}});}
