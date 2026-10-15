import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const elements=new Map(),events={},docEvents={};const get=id=>{if(!elements.has(id))elements.set(id,{children:[],replaceChildren(){this.children=[]},append(x){this.children.push(x)}});return elements.get(id)};let stopped=0,enabled=true,requests=[];const track={stop(){stopped++},get enabled(){return enabled},set enabled(v){enabled=v}},stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
const scope={$:get,window:{RTCPeerConnection:class{},addEventListener:(n,f)=>events[n]=f},document:{hidden:false,addEventListener:(n,f)=>docEvents[n]=f},navigator:{mediaDevices:{getUserMedia:async()=>stream}},Room:{session:{roomId:'one',memberId:'a'},poll(){},api:async(path,args)=>{requests.push([path,args]);return path==='voice'?{voiceEpoch:'v1'}:{roomId:'one',signals:[]}}},setTimeout:()=>1,clearTimeout(){},Map,console};vm.runInNewContext(fs.readFileSync('public/play/voice.js','utf8'),scope);await get('joinVoice').onclick();assert.equal(get('voiceBar').hidden,false);assert(requests.some(x=>x[0]==='voice'&&x[1].data.enabled));get('voiceMiniMute').onclick();assert.equal(enabled,false);get('voiceMiniMute').onclick();assert.equal(enabled,true);scope.document.hidden=true;await docEvents.visibilitychange();assert(stopped>0);assert.equal(get('voiceBar').hidden,true);assert(requests.some(x=>x[0]==='voice'&&!x[1].data.enabled));console.log('PASS: opt-in mic lifecycle, mute/unmute and stop-tracks on background. Actual cross-device audio remains unverified.');

// Speaker mute must not be bypassed by per-player mute, and personal mute persists.
const audios=[];
class Peer {
 constructor(){this.iceGatheringState='complete';this.connectionState='connected'}
 addTrack(){} close(){} async createOffer(){return {type:'offer',sdp:'v=0'}}
 async setLocalDescription(x){this.localDescription=x}
}
scope.RTCPeerConnection=Peer;scope.window.RTCPeerConnection=Peer;
scope.document.createElement=tag=>{const e={remove(){},play:async()=>{}};if(tag==='audio')audios.push(e);return e};scope.document.body={append(){}};
scope.document.hidden=false;await get('joinVoice').onclick();await new Promise(r=>setImmediate(r));
events['makhan:room-update']({detail:{members:[{id:'z',name:'Friend',voice:1,voice_epoch:'peer1'}]}});await new Promise(r=>setImmediate(r));
assert.equal(audios.length,1);get('voiceSpeaker').onclick();assert.equal(audios[0].muted,true);
get('voicePeople').children[0].onclick();assert.equal(audios[0].muted,true);
get('voiceSpeaker').onclick();assert.equal(audios[0].muted,true,'Personal mute must survive speaker on');
get('voicePeople').children[0].onclick();assert.equal(audios[0].muted,false);
await get('voiceMiniLeave').onclick();
console.log('PASS: global speaker mute and independent participant mute remain consistent.');
