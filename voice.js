/*
 Callout! Bingo optional on-device Supertonic 3 narrator.
 Inference: ONNX Runtime Web. Archived open-weight model (downloads on first use).
*/
import {loadTextToSpeech,loadVoiceStyle,writeWavFile} from './supertonic-helper.js';
const BASE='https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46/';
const voices={M1:'Aiden',M2:'Hiro',M3:'Leo',F1:'Mina',F2:'Sora',F3:'Yuna'};
let voice='M1',message='Voice is off. Load Supertonic to get started.',state='idle',enabled=false,backend='';
let model=null,style=null,loading=null,playing=null,pending=null,processing=false,serial=0;
try {const v=localStorage.getItem('callout_supertonic_voice');if(voices[v])voice=v;}catch{}
function status(){return {state,message,enabled,voice,voices,backend,ready:!!(model&&style)}}
function update(st,msg){if(st)state=st;if(msg)message=msg;document.dispatchEvent(new CustomEvent('callout-voice-state',{detail:status()}))}
function stop(){
 pending=null;serial++;
 if(playing){try{playing.pause();playing.onended?.();}catch{}}
 if(model&&style)update('ready','Ready · '+voices[voice]+' · '+backend);
}
function setEnabled(v){enabled=!!v;if(!enabled)stop();update(null,enabled?'Caller is enabled.':'Caller is muted.')}
async function prepare(){
 enabled=true;
 if(model&&style){update('ready','Ready · '+voices[voice]+' · '+backend);void pump();return true;}
 if(loading)return loading;
 loading=(async()=>{
  update('loading','Loading Supertonic 3; initial model download is ~400 MB…');
  const progress=(name,i,n)=>update('loading','Loading model '+i+'/'+n+': '+name);
  let result;
  try{
   if(!navigator.gpu)throw Error('WebGPU unavailable');
   result=await loadTextToSpeech(BASE+'onnx',{executionProviders:['webgpu'],graphOptimizationLevel:'all'},progress);
   backend='WebGPU';
  }catch(err){
   console.warn('[Callout voice] WebGPU failed, trying WASM:',err);
   update('loading','WebGPU unavailable. Loading with WebAssembly…');
   result=await loadTextToSpeech(BASE+'onnx',{executionProviders:['wasm'],graphOptimizationLevel:'all'},progress);
   backend='WASM';
  }
  model=result.textToSpeech;
  update('loading','Loading voice style '+voices[voice]+'…');
  style=await loadVoiceStyle([BASE+'voice_styles/'+voice+'.json']);
  update('ready','Ready · '+voices[voice]+' · '+backend);
  void pump();return true;
 })().catch(err=>{
  console.error('[Callout voice] Initialization error',err);
  update('error','Supertonic failed to load: '+(err.message||String(err))+'. Check storage and connection, then retry.');
  throw err;
 }).finally(()=>{loading=null});
 return loading;
}
function announce(text){
 if(!enabled)return;
 const clean=String(text||'').trim().slice(0,220);
 if(!clean)return;
 pending={id:++serial,text:clean};
 if(playing){try{playing.pause();playing.onended?.()}catch{}}
 if(model&&style)void pump();
 else if(!loading)void prepare().catch(()=>{});
}
async function pump(){
 if(processing||!enabled||!model||!style||!pending)return;
 processing=true;
 try{
  while(enabled&&pending){
   const job=pending;pending=null;
   update('speaking','Generating: '+job.text);
   const out=await model.call(job.text,'en',style,6,1.05,0.3);
   if(!enabled||job.id!==serial)continue;
   const frames=Math.max(1,Math.floor(model.sampleRate*out.duration[0]));
   const buffer=writeWavFile(out.wav.slice(0,frames),model.sampleRate);
   const url=URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));
   const audio=new Audio(url);
   playing=audio;audio.volume=.90;
   try{
    await new Promise((resolve,reject)=>{
     audio.onended=resolve;
     audio.onerror=()=>reject(Error('Audio playback failed'));
     audio.play().catch(reject);
    });
   }catch(err){
    if(enabled&&job.id===serial){
     update('error','Sound was blocked. Tap Test voice after enabling audio. '+(err.message||err));
     break;
    }
   }finally{
    if(playing===audio)playing=null;
    audio.pause();URL.revokeObjectURL(url);
   }
  }
  if(enabled&&state!=='error')update('ready','Ready · '+voices[voice]+' · '+backend);
 }catch(err){
  console.error('[Callout voice] Synthesis error',err);
  update('error','Supertonic synthesis failed: '+(err.message||err));
 }finally{
  processing=false;
  if(pending&&enabled&&state!=='error')queueMicrotask(pump);
 }
}
function setVoice(v){
 if(!voices[v])return;
 voice=v;try{localStorage.setItem('callout_supertonic_voice',v)}catch{}
 if(model){
  style=null;update('loading','Loading '+voices[v]+' voice style…');
  loadVoiceStyle([BASE+'voice_styles/'+v+'.json']).then(s=>{
   if(voice!==v)return;
   style=s;update('ready','Ready · '+voices[v]+' · '+backend);void pump();
  }).catch(err=>update('error','Could not load voice: '+(err.message||err)));
 }else update(null,'Selected '+voices[v]+'.');
}
async function test(){enabled=true;await prepare();announce('Bingo! B seven. Your on-device caller is ready.')}
window.CalloutVoice={status,setEnabled,setVoice,prepare,announce,test,stop};
update();
