import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import Game from './server/rules.mjs';
import worker from './deploy/worker.mjs';
const scope={};vm.runInNewContext(fs.readFileSync('public/play/engine.js','utf8'),scope);
for(let n=1;n<=6;n++){
 const a=scope.Game.create('friends',['A','B']),b=Game.create('friends',['A','B']);a.started=b.started=0;
 for(let i=0;i<80&&a.phase!=='won';i++){
  scope.Game.roll(a,n);Game.roll(b,n);
  while(['moving','route'].includes(a.phase)){scope.Game.step(a,'trail',()=>.5);Game.step(b,'trail',()=>.5)}
  assert.equal(JSON.stringify(a),JSON.stringify(b),'Server/client rules diverged');
 }
}
let r=await worker.fetch(new Request('https://game.test/'),{});assert.equal(r.status,302);assert.equal(r.headers.get('location'),'https://game.test/play/index.html');
r=await worker.fetch(new Request('https://game.test/play/index.html'),{ASSETS:{fetch:async()=>new Response('game')}});assert.equal(await r.text(),'game');assert.equal(r.headers.get('cache-control'),'no-cache');assert.equal(r.headers.get('permissions-policy'),'camera=(), microphone=(self)');
r=await worker.fetch(new Request('https://game.test/api/chat/messages'),{});assert.equal(r.status,503);assert.equal(r.headers.get('cache-control'),'no-store');
console.log('PASS: browser/server rules parity, standalone Worker redirect/static/API paths and response headers.');
