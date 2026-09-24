import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {validSession} from './access-store';
export const COOKIE_NAME='sue_session';
export async function requireAccess(){const token=(await cookies()).get(COOKIE_NAME)?.value;if(!await validSession(token))redirect('/login');}
