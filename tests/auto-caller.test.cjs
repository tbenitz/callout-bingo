// Run: node --test tests/auto-caller.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('function callerDelay(cfg){'),b=html.indexOf('function scheduleAuto(h)',a);
assert.ok(a>=0&&b>a,'Caller delay production function must exist');
const context=vm.createContext({});
vm.runInContext(html.slice(a,b),context);
const delay=cfg=>vm.runInContext('callerDelay('+JSON.stringify(cfg)+')',context);
test('range chooses random inclusive delays',()=>{
 const values=new Set();
 for(let i=0;i<400;i++){
  const result=delay({minSeconds:10,maxSeconds:20});
  assert.ok(Number.isInteger(result)&&result>=10&&result<=20);
  values.add(result);
 }
 assert.ok(values.size>1,'The range must actually vary');
});
test('same minimum and maximum gives a fixed caller interval',()=>{
 for(let i=0;i<20;i++)assert.equal(delay({minSeconds:15,maxSeconds:15}),15);
});
test('reversed or invalid bounds cannot cause an invalid delay',()=>{
 assert.equal(delay({minSeconds:20,maxSeconds:10}),20);
 assert.ok(delay({minSeconds:1,maxSeconds:300})>=3);
 assert.ok(delay({minSeconds:1,maxSeconds:300})<=180);
});
test('new Settings are visible throughout app and voice defaults on',()=>{
 assert.ok(html.includes('readAloud:true,customFlow:'),'Voice is on for new visitors');
 assert.ok(html.includes('data-panel="settings"'),'Settings entry must exist');
 assert.ok(html.includes('id="soundSetting"'),'Sound toggle must exist');
 assert.ok(html.includes('id="autoCallerSetting"'),'Timer enable control must exist');
 assert.ok(html.includes('id="autoMin"')&&html.includes('id="autoMax"'),'Range controls must exist');
 assert.ok(html.includes("if(!h||isObserve(h.cfg)||h.phase!=='playing')return"),'Observation games cannot auto draw');
});
