import {configured} from '~/server/access-store';
import LoginForm from './login-form';
export const dynamic='force-dynamic';
export default async function LoginPage(){return <LoginForm needsSetup={!await configured()}/>;}
