// Run with: node --test tests/speech-format.test.cjs
// Checks the actual formatter embedded in index.html; no downloads or model required.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=source.indexOf('function spokenNumber(n)');
const end=source.indexOf('function voiceInfo()',start);
assert.ok(start>0 && end>start,'Production voice formatter must be present');
const context=vm.createContext({});
vm.runInContext(source.slice(start,end),context);
const say=value=>vm.runInContext('spokenCaller('+JSON.stringify(value)+')',context);

test('classic bingo voice calls contain both spoken letter and number for all 75 calls',()=>{
 for(let n=1;n<=75;n++){
  const letter='BINGO'[Math.floor((n-1)/15)];
  const phrase=say(letter+n);
  assert.match(phrase,/^(Bee|Eye|En|Gee|Oh), number [a-z ]+\.$/,letter+n);
  assert.doesNotMatch(phrase,/\d/,letter+n);
 }
});
test('boundary numbers and all five letters are spoken accurately',()=>{
 const cases={
  B1:'Bee, number one.',
  B15:'Bee, number fifteen.',
  I16:'Eye, number sixteen.',
  I30:'Eye, number thirty.',
  N31:'En, number thirty one.',
  N45:'En, number forty five.',
  G46:'Gee, number forty six.',
  G60:'Gee, number sixty.',
  O61:'Oh, number sixty one.',
  O75:'Oh, number seventy five.'
 };
 for(const [call,expected] of Object.entries(cases))assert.equal(say(call),expected);
});
test('custom caller remains supported',()=>{
 assert.equal(say('Someone says bingo'),'Next call: Someone says bingo');
});
