import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';

// Run only against a freshly started isolated test server. Never use the user's
// normal port: this exercises first setup and deliberately triggers lockout.
const base=process.env.SUE_AUTH_TEST_URL;
test('login endpoints protect patient data and enforce credential boundaries', {skip:!base}, async()=>{
 const url=new URL(base);
 assert.equal(url.hostname,'127.0.0.1');
 assert.equal(url.port,'3001');
 const post=(action,data,extra={})=>fetch(`${base}/api/access/${action}`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...extra},body:JSON.stringify(data)});
 const password=randomBytes(24).toString('hex');
 const guest=await fetch(base,{redirect:'manual'});
 assert.equal(guest.status,307);assert.equal(guest.headers.get('location'),'/login');
 assert.ok(!(await guest.text()).includes('DEMO-ONLY-001'));
 assert.equal((await post('session',{})).status,401);
 assert.equal((await post('setup',{password,confirmPassword:password},{Origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await post('setup',{password:'short',confirmPassword:'short'})).status,400);
 assert.equal((await post('setup',{password,confirmPassword:'mismatch'})).status,400);
 assert.equal((await post('setup',{password,confirmPassword:password})).status,200);
 assert.equal((await post('setup',{password,confirmPassword:password})).status,409);
 assert.equal((await post('login',{password:'wrong-password'})).status,400);
 const login=await post('login',{password});assert.equal(login.status,200);
 const header=login.headers.get('set-cookie');assert.ok(header);
 assert.match(header,/HttpOnly/i);assert.match(header,/SameSite=strict/i);assert.match(header,/Max-Age=43200/i);
 const cookie=header.split(';')[0];
 assert.equal((await post('session',{}, {Cookie:cookie})).status,200);
 const home=await fetch(base,{headers:{Cookie:cookie}});assert.equal(home.status,200);
 assert.match(home.headers.get('cache-control'),/no-store/);
 const html=await home.text();for(let i=1;i<=4;i++)assert.ok(html.includes(`DEMO-ONLY-00${i}`));
 assert.equal((await post('logout',{}, {Cookie:cookie})).status,200);
 assert.equal((await post('session',{}, {Cookie:cookie})).status,401);
 assert.equal((await fetch(base,{headers:{Cookie:cookie},redirect:'manual'})).status,307);
 assert.equal((await fetch(base,{headers:{Cookie:`sue_session=${'a'.repeat(64)}`},redirect:'manual'})).status,307);
 assert.equal((await fetch(`${base}/api/auth/session`)).status,404);
 for(let i=0;i<4;i++)assert.equal((await post('login',{password:'incorrect'})).status,400);
 assert.equal((await post('login',{password:'incorrect'})).status,429);
 assert.equal((await post('login',{password})).status,429);
});
