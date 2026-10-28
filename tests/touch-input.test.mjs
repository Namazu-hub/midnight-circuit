import test from 'node:test';
import assert from 'node:assert/strict';
import {bindTouchControls} from '../dist/touch-input.mjs';

// Test the event lifecycle without pretending to emulate Safari or physical touch.
function fire(target,type,props={}) {
  const event=new Event(type,{cancelable:true});
  Object.assign(event,props);target.dispatchEvent(event);return event;
}
function setup({captureFails=false}={}) {
  const doc=new EventTarget(),win=new EventTarget(),root=new EventTarget(),down=new Set(),changes=[];
  let playing=true,hit=null,starts=0;
  const buttons=['left','right','jump','pulse','laneUp','laneDown','action'].map(key=>{
    const b=new EventTarget(),classes=new Set(),captures=new Set();
    b.dataset={control:key};b.hidden=false;b.attrs={};
    b.classList={toggle:(name,on)=>on?classes.add(name):classes.delete(name),contains:name=>classes.has(name)};
    b.setAttribute=(name,value)=>b.attrs[name]=value;
    b.closest=()=>b;
    b.setPointerCapture=id=>{if(captureFails)throw Error('Capture unavailable');captures.add(id);};
    b.hasPointerCapture=id=>captures.has(id);
    b.releasePointerCapture=id=>{captures.delete(id);fire(b,'lostpointercapture',{pointerId:id});};
    return b;
  });
  doc.elementFromPoint=()=>hit;
  const controller=bindTouchControls({buttons,root,doc,win,isPlaying:()=>playing,onStart:()=>starts++,onChange:(key,on)=>{
    changes.push([key,on]);if(on)down.add(key);else down.delete(key);
  }});
  return {doc,win,root,buttons,down,changes,controller,
    start:(key,id=1,extra={})=>fire(buttons.find(b=>b.dataset.control===key),'pointerdown',{pointerId:id,pointerType:'touch',button:0,...extra}),
    end:(id=1,type='pointerup')=>fire(doc,type,{pointerId:id}),
    move:(key,id=1,extra={})=>{hit=buttons.find(b=>b.dataset.control===key)||null;fire(doc,'pointermove',{pointerId:id,pointerType:'touch',buttons:1,clientX:10,clientY:10,...extra});},
    playing:value=>playing=value,starts:()=>starts
  };
}
test('release outside the original button clears input and visual pressed state',()=>{
 const f=setup();assert.equal(f.start('left').defaultPrevented,true);assert.deepEqual([...f.down],['left']);
 f.end();assert.equal(f.down.size,0);assert.equal(f.buttons[0].attrs['aria-pressed'],'false');assert.equal(f.buttons[0].classList.contains('pressed'),false);
});
test('independent fingers support movement plus jump and repeated contacts on one button',()=>{
 const f=setup();f.start('right',1);f.start('jump',2);f.start('right',3);f.end(1);
 assert.deepEqual([...f.down].sort(),['jump','right']);f.end(2);assert.deepEqual([...f.down],['right']);f.end(3);assert.equal(f.down.size,0);
 assert.deepEqual(f.changes.filter(([key])=>key==='right'),[['right',true],['right',false]]);
});
test('dragging across direction buttons switches input and dragging outside stops it',()=>{
 const f=setup();f.start('left');f.move('right');assert.deepEqual([...f.down],['right']);
 f.move(null);assert.equal(f.down.size,0);f.move('left');assert.deepEqual([...f.down],['left']);
 f.end();f.move('right');assert.equal(f.down.size,0);
});
test('pointer cancellation, lost capture and capture failure never leave held input',()=>{
 for(const captureFails of [false,true]){const f=setup({captureFails});f.start('left');f.end(1,'pointercancel');assert.equal(f.down.size,0);}
 const f=setup();f.start('jump');fire(f.buttons[2],'lostpointercapture',{pointerId:1});assert.equal(f.down.size,0);f.end();assert.equal(f.down.size,0);
});
test('blur, pagehide, visibility loss and explicit reset release every contact',()=>{
 for(const kind of ['blur','pagehide','visibilitychange','clear']){
  const f=setup();f.start('left',1);f.start('jump',2);
  if(kind==='clear')f.controller.clear();else if(kind==='visibilitychange'){f.doc.hidden=true;fire(f.doc,kind);}else fire(f.win,kind);
  assert.equal(f.down.size,0,kind);f.move('right');assert.equal(f.down.size,0);
 }
});
test('touch fallback retains another finger until all native touches end',()=>{
 const f=setup();f.start('right');fire(f.doc,'touchend',{touches:[{}]});assert.equal(f.down.has('right'),true);
 fire(f.doc,'touchend',{touches:[]});assert.equal(f.down.size,0);
 f.start('right');fire(f.doc,'touchcancel');assert.equal(f.down.size,0);
});
test('callout, selection and dragging are prevented and release input',()=>{
 for(const type of ['contextmenu','selectstart','dragstart']){
  const f=setup();f.start('left');assert.equal(fire(f.root,type).defaultPrevented,true);assert.equal(f.down.size,0);
 }
});
test('paused input and non-primary mouse buttons are ignored; a lost mouse release recovers',()=>{
 const f=setup();f.playing(false);f.start('right');assert.equal(f.down.size,0);assert.equal(f.starts(),0);
 f.playing(true);f.start('right',1,{pointerType:'mouse',button:2});assert.equal(f.down.size,0);
 f.start('right',1,{pointerType:'mouse'});f.move('right',1,{pointerType:'mouse',buttons:0});assert.equal(f.down.size,0);
 f.start('left');f.playing(false);f.move('right');assert.equal(f.down.size,0);
});
test('hidden lane controls cannot acquire input during a slide',()=>{
 const f=setup();f.buttons[4].hidden=true;f.start('left');f.move('laneUp');assert.equal(f.down.size,0);
});

test('ACTION shares contact lifecycle and disabled controls cannot acquire sliding input',()=>{const f=setup(),a=f.buttons.find(b=>b.dataset.control==='action');f.start('right',1);f.start('action',2);assert.ok(f.down.has('action'));f.end(2);assert.deepEqual([...f.down],['right']);a.disabled=true;f.move('action',1);assert.equal(f.down.size,0);f.start('action',3);assert.equal(f.down.size,0);});
