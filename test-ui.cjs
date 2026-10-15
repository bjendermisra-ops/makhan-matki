const vm=require('vm'),fs=require('fs'),assert=require('assert');const registry=new Map(),timers=[];
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.style={};this.classList={toggle(){},add(){},remove(){}};this.open=false;this.value='';this.textContent='';this.listeners={}}
 set id(v){this._id=v;registry.set(v,this)}get id(){return this._id}
 setAttribute(k,v){this.attrs[k]=v;if(k==='id')this.id=v}append(...children){for(const c of children){c.parent=this;this.children.push(c)}}replaceChildren(...c){const detach=e=>{if(e.id)registry.delete(e.id);e.children.forEach(detach)};this.children.forEach(detach);this.children=[];this.append(...c)}
 get firstChild(){return this.children[0]}get lastChild(){return this.children.at(-1)}remove(){this.parent.children=this.parent.children.filter(x=>x!==this)}
 addEventListener(e,fn){this.listeners[e]=fn}showModal(){this.open=true}close(){this.open=false;this.listeners.close?.()}
 set innerHTML(v){this.children=[]}get innerHTML(){return''}
}
const html=fs.readFileSync('public/play/index.html','utf8');for(const m of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)){const e=new Element(m[1]);e.id=m[2]}
registry.get('count').value='2';registry.get('count').options=['2','3','4'].map(value=>({value}));for(let i=0;i<9;i++)registry.get('dice').append(new Element('i'));
const modes=['solo','friends'].map(mode=>{const e=new Element('button');e.dataset.mode=mode;return e}),document={hidden:false,getElementById:id=>registry.get(id),createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag),querySelectorAll:selector=>selector==='dialog'?[...registry.values()].filter(e=>e.tagName==='dialog'):selector==='[data-mode]'?modes:[],body:new Element('body'),addEventListener(){}};
const memory=new Map(),sandbox={document,window:{matchMedia:()=>({matches:false}),dispatchEvent(){},addEventListener(){}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout(){},console,Math,Event,CustomEvent,requestAnimationFrame:fn=>fn(),Game:(()=>{const m={exports:{}};new Function('module',fs.readFileSync('public/play/engine.js','utf8'))(m);return m.exports})()};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('public/play/game.js','utf8'),sandbox);
assert(registry.get('setup').open);assert.equal(registry.get('players').children.length,2);assert.equal(registry.get('cards').children.length,3);assert.equal(registry.get('tokens').children.length,2);
registry.get('name0').value='Santosh';registry.get('start').onclick();assert(!registry.get('setup').open);assert(vm.runInContext('state.players[0].name',sandbox)==='Santosh');
registry.get('cards').children[1].onclick();assert.equal(vm.runInContext('state.players[0].pots',sandbox),1);assert(registry.get('cards').children.every(x=>x.disabled));
registry.get('settings').onclick();assert(registry.get('settingsModal').open);registry.get('speed').onchange({target:{value:'fast'}});assert.equal(vm.runInContext('prefs.speed',sandbox),'fast');
registry.get('newGame').onclick();assert(registry.get('setup').open);modes[1].onclick();registry.get('count').value='4';registry.get('count').onchange();registry.get('start').onclick();assert.equal(vm.runInContext('state.players.length',sandbox),4);assert(vm.runInContext('state.players.every(p=>!p.ai)',sandbox));assert.equal(registry.get('players').children.length,4);assert.equal(registry.get('tokens').children.length,4);assert(memory.get('makhan-matki-v4'));
vm.runInContext(fs.readFileSync('public/play/premium.js','utf8'),sandbox);
vm.runInContext("prefs.motion=true;state.players[0].pos=98;state.players[0].pots=3;Game.roll(state,1);Game.step(state);render();finishWin();",sandbox);
assert(registry.get('winner').open);assert.equal(registry.get('roll').disabled,false);assert.equal(registry.get('roll').textContent,'PLAY AGAIN ↻');registry.get('winner').close();registry.get('roll').onclick();assert.equal(vm.runInContext('state.phase',sandbox),'ready');assert.equal(vm.runInContext('state.players.length',sandbox),4);assert(vm.runInContext('state.players.every(p=>p.pos===0&&p.pots===0)',sandbox));
console.log('PASS: 100-space UI, cards, settings, four players; winner board has enabled Play Again, which resets all players into a playable fresh match. DOM-level test, not visual browser QA.');
