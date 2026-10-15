import {DatabaseSync} from 'node:sqlite';import {readFileSync,readdirSync} from 'node:fs';import assert from 'node:assert/strict';import {handleChat} from './server/chat.mjs';
const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
const db={
 prepare(sql){return {bind(...args){return {
  first:async()=>sqlite.prepare(sql).get(...args)||null,
  all:async()=>({results:sqlite.prepare(sql).all(...args)}),
  run:async()=>{const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}
 }}}},
 async batch(statements){sqlite.exec('BEGIN');try{const a=[];for(const s of statements)a.push(await s.run());sqlite.exec('COMMIT');return a}catch(e){sqlite.exec('ROLLBACK');throw e}}
};
async function req(path,{method='GET',data,token,user='alice',origin='https://game.test'}={}){const r=await handleChat(new Request('https://game.test/api/chat/'+path,{method,headers:{...(user?{'oai-authenticated-user-id':user}:{}),Origin:origin,...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})}),db);return{status:r.status,...await r.json()}}
const a=await req('rooms',{method:'POST',data:{name:'Alice'}});assert.equal(a.status,201);assert.equal(a.code.length,10);
const b=await req('rooms',{method:'POST',user:'bob',data:{name:'Bob'}});assert.equal(b.status,201);assert.notEqual(a.roomId,b.roomId);
let r=await req('messages',{method:'POST',token:a.token,data:{text:'A private message',clientId:'11111111-1111-1111-1111-111111111111',roomId:b.roomId}});assert.equal(r.status,201);
r=await req('messages?roomId='+a.roomId,{token:b.token,user:'bob'});assert.equal(r.messages.length,0);assert.equal(r.roomId,b.roomId);
r=await req('messages',{token:a.token,user:'bob'});assert.equal(r.status,403);
r=await req('messages',{token:'f'.repeat(64)});assert.equal(r.status,403);
r=await req('messages',{method:'POST',token:a.token,data:{text:'A private message',clientId:'11111111-1111-1111-1111-111111111111'}});assert.equal(r.status,200);r=await req('messages',{token:a.token});assert.equal(r.messages.length,1);
r=await req('messages',{method:'POST',token:a.token,data:{text:'Spam too fast',clientId:'22222222-2222-2222-2222-222222222222'}});assert.equal(r.status,429);
const guests=[];for(let i=0;i<3;i++){const g=await req('join',{method:'POST',user:'guest'+i,data:{name:'Guest '+i,code:a.code}});assert.equal(g.status,201);guests.push(g)}
r=await req('join',{method:'POST',user:'fifth',data:{name:'Fifth',code:a.code}});assert.equal(r.status,409);
r=await req('messages',{token:guests[0].token,user:'guest0'});assert.equal(r.messages[0].body,'A private message');assert.equal(r.members.length,4);
r=await req('leave',{method:'POST',token:guests[0].token,user:'guest0',data:{}});assert.equal(r.status,200);assert.equal((await req('messages',{token:guests[0].token,user:'guest0'})).status,403);
r=await req('messages',{token:a.token,origin:'https://evil.test',method:'POST',data:{text:'crossorigin',clientId:crypto.randomUUID()}});assert.equal(r.status,403);
r=await req('rooms',{user:null,method:'POST',data:{name:'No auth'}});assert.equal(r.status,201);
r=await req('leave',{method:'POST',token:a.token,data:{}});assert.equal(r.status,200);assert.equal((await req('messages',{token:guests[1].token,user:'guest1'})).status,403);assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM chat_messages WHERE room=?').get(a.roomId).n,0);
r=await req('messages',{token:b.token,user:'bob'});assert.equal(r.status,200);assert.equal(r.messages.length,0);
sqlite.prepare('UPDATE chat_rooms SET expires=0 WHERE id=?').run(b.roomId);assert.equal((await req('messages',{token:b.token,user:'bob'})).status,403);
console.log('PASS: real SQLite room isolation; wrong-user/forged tokens denied; room-ID tampering cannot cross rooms; deduplication; send rate limits; 4-person cap; revocation, host close, expiry, and cross-origin protection.');

const host=await req('rooms',{method:'POST',user:'host2',data:{name:'Host'}});
const guest=await req('join',{method:'POST',user:'guest2',data:{name:'Friend',code:host.code}});
r=await req('game',{method:'POST',user:'guest2',token:guest.token,data:{action:'start'}});assert.equal(r.status,403);
r=await req('game',{method:'POST',user:'host2',token:host.token,data:{action:'start'}});assert.equal(r.status,200);let online=r.game;assert.equal(online.state.players.length,2);
r=await req('game',{method:'POST',user:'guest2',token:guest.token,data:{action:'roll',revision:online.revision}});assert.equal(r.status,403);
r=await req('game',{method:'POST',user:'host2',token:host.token,data:{action:'roll',revision:online.revision,dice:99}});assert.equal(r.status,200);assert(r.game.state.lastRoll>=1&&r.game.state.lastRoll<=6);
r=await req('game',{method:'POST',user:'host2',token:host.token,data:{action:'roll',revision:online.revision}});assert.equal(r.status,409);
r=await req('join',{method:'POST',user:'late',data:{name:'Late',code:host.code}});assert.equal(r.status,409);
const hv=await req('voice',{method:'POST',user:'host2',token:host.token,data:{enabled:true}}),gv=await req('voice',{method:'POST',user:'guest2',token:guest.token,data:{enabled:true}});
r=await req('signals',{method:'POST',user:'host2',token:host.token,data:{to:guest.memberId,fromEpoch:hv.voiceEpoch,toEpoch:gv.voiceEpoch,description:{type:'offer',sdp:'v=0'}}});assert.equal(r.status,200);
r=await req('signals',{user:'guest2',token:guest.token});assert.equal(r.signals.length,1);assert.equal(r.signals[0].sender,host.memberId);
r=await req('signals',{user:'host2',token:host.token});assert.equal(r.signals.length,0);
r=await req('signals',{method:'POST',user:'host2',token:host.token,data:{to:b.memberId,fromEpoch:hv.voiceEpoch,toEpoch:'forged',description:{type:'offer',sdp:'v=0'}}});assert.equal(r.status,403);
await req('voice',{method:'POST',user:'guest2',token:guest.token,data:{enabled:false}});
r=await req('signals',{method:'POST',user:'host2',token:host.token,data:{to:guest.memberId,fromEpoch:hv.voiceEpoch,toEpoch:gv.voiceEpoch,description:{type:'offer',sdp:'v=0'}}});assert.equal(r.status,403);
await req('leave',{method:'POST',user:'guest2',token:guest.token,data:{}});r=await req('messages',{user:'host2',token:host.token});assert.equal(r.game,null);
console.log('PASS: online host authority, turn checks, revision conflicts, server dice, locked roster, voice room/recipient isolation, voice epoch revocation and participant-leave recovery.');

// Expiry cleanup deletes children before parents, but leaves live rooms intact.
const {cleanupExpired}=await import('./server/chat.mjs');
sqlite.prepare('UPDATE chat_rooms SET expires=0 WHERE id=?').run(host.roomId);
await cleanupExpired(db);
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM chat_members WHERE room=?').get(host.roomId).n,0);
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM chat_rooms WHERE id=?').get(host.roomId).n,0);
const oversized=await handleChat(new Request('https://game.test/api/chat/rooms',{method:'POST',headers:{'oai-authenticated-user-id':'big'},body:JSON.stringify({name:'x',padding:'a'.repeat(21000)})}),db);
assert.equal(oversized.status,413);
console.log('PASS: expired data cleanup and streamed oversized request rejection.');
