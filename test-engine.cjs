const assert=require('node:assert/strict'),fs=require('node:fs'),m={exports:{}};new Function('module',fs.readFileSync('public/play/engine.js','utf8'))(m);const G=m.exports;
const fresh=()=>G.create('solo',['You','Madhav']);let s=fresh();assert(G.valid(s));assert.equal(G.SIZE,100);
for(const [position,target,kind]of [[26,22,'monkey'],[56,35,'slide'],[6,22,'boost']]){s=fresh();s.players[0].pos=position-1;G.roll(s,1);G.step(s);assert.equal(s.players[0].pos,target);assert.equal(s.lastEvent.kind,kind);assert.equal(s.turn,1)}
s=fresh();s.players[0].pos=95;s.players[0].shield=true;G.roll(s,1);G.step(s);assert.equal(s.players[0].pos,96);assert(!s.players[0].shield);
s=fresh();s.players[0].pos=98;s.players[0].pots=3;G.roll(s,6);G.step(s);assert.equal(s.phase,'won');assert.equal(s.players[0].pos,99);assert(!G.roll(s,1));
s=fresh();s.players[0].pos=98;s.players[0].pots=2;G.roll(s,3);while(s.phase==='moving')G.step(s);assert.equal(s.phase,'ready');assert.equal(s.players[0].lap,2);
s=fresh();s.players[0].pos=17;G.roll(s,1);G.step(s);assert.equal(s.players[0].pots,1);s.turn=0;s.players[0].pos=17;G.roll(s,1);G.step(s);assert.equal(s.players[0].pots,1);
s=fresh();assert(G.useCard(s,0));assert(!G.useCard(s,0));G.roll(s,6);assert.equal(s.remaining,8);
let seed=8128;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);let min=999,max=0,total=0;
for(let j=0;j<500;j++){s=G.create(j%2?'solo':'friends',Array.from({length:2+j%3},(_,i)=>'P'+i));let steps=0;while(s.phase!=='won'&&steps++<5000){const p=G.current(s);if(s.phase==='ready'){if(!p.used&&p.cards.length&&rng()<.7)G.useCard(s,Math.floor(rng()*p.cards.length));G.roll(s,1+Math.floor(rng()*6))}else G.step(s,s.phase==='route'?(p.pots>=3?'shortcut':'trail'):undefined,rng);assert(G.valid(s));if(steps%11===0)s=JSON.parse(JSON.stringify(s))}assert(steps<5000);assert.equal(s.players[s.winner].pos,99);assert(s.players[s.winner].pots>=3);min=Math.min(min,s.round);max=Math.max(max,s.round);total+=s.round}
console.log('PASS: 500 complete 100-step matches, hazards/shield, boosts, collection uniqueness, save/resume and wins. Rounds:',min,'to',max,'average',(total/500).toFixed(1));
