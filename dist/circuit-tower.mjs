import {createCircuit,stepCircuit,circuitPower,RESISTORS} from './circuit-model.mjs?v=4.9d';
import {clamp,overlap} from './world.mjs?v=4.9d';
import {toolHit} from './equipment.mjs?v=4.9d';
import {grant} from './research.mjs?v=4.9d';
export const TOWER=Object.freeze({coilVelocity:980,liftSpeed:100,stun:2.2,respawnDelay:2});
const active=g=>g.rooms?.active===g.level.circuit?.room;
const close=(p,x,y,r=70)=>Math.hypot(p.x+14-x,p.y+20-y)<r;
export function setupCircuitTower(g){if(!g.level.circuit)return;g.circuit={signal:createCircuit(),band:0,forward:false,parts:g.level.circuit.parts.map(e=>({...e,homeX:e.x,homeY:e.y,state:'roam',clock:0,stun:0,dead:0,dir:1})),held:false,transistor:false,arm:0,liftY:620,liftDir:-1,complete:false,launched:false,launches:0,idle:0,hint:-1,hintTime:0,notice:'',noticeTime:0};}
export function towerControl(g){if(!active(g))return null;const s=g.circuit,p=g.player;
 const choices=s.parts.filter(e=>e.state==='seated'||e.state==='locked').map(e=>({id:'ct-pad-'+e.id,x:e.padX,y:e.padY-30,label:e.state==='locked'?'クランプを外す':'部品を固定'}));
 choices.push(...g.level.circuit.controls.filter(c=>c.id!=='ct-transistor'||!s.transistor).map(c=>({...c,label:c.id==='ct-transistor'&&s.held?'トランジスタを戻す':c.label})));
 return choices.filter(c=>close(p,c.x,c.y)).sort((a,b)=>Math.hypot(p.x+14-a.x,p.y+20-a.y)-Math.hypot(p.x+14-b.x,p.y+20-b.y))[0]||null;
}
function note(s,text){s.notice=text;s.noticeTime=3;s.idle=0;}
function resetPart(e){Object.assign(e,{x:e.homeX,y:e.homeY,state:'roam',clock:0,stun:1,dead:0});}
export function towerAction(g,id){if(!id?.startsWith('ct-')||!active(g))return false;const s=g.circuit;
 if(id==='ct-color'){s.band=(s.band+1)%RESISTORS.length;note(s,RESISTORS[s.band].label);}
 if(id==='ct-diode'){s.forward=!s.forward;note(s,s.forward?'→':'←');}
 if(id==='ct-reset'){for(const e of s.parts)if(e.state!=='locked')resetPart(e);if(!s.transistor)s.held=false;note(s,'部品を再供給');}
 if(id.startsWith('ct-pad-')){const e=s.parts.find(e=>id==='ct-pad-'+e.id);if(e?.state==='seated'){e.state='locked';note(s,'CLAMP ✓');g.events.push({type:'relay',x:e.x,y:e.y});}else if(e?.state==='locked'){e.state='roam';e.x=e.padX-110;e.stun=2;note(s,'CLAMP OPEN');}}
 if(id==='ct-transistor'&&!s.transistor){s.held=!s.held;note(s,s.held?'3端子部品を運搬中':'部品を戻した');}
 if(id==='ct-socket'){if(s.held){s.held=false;s.transistor=true;note(s,'BASE → DRIVE');g.events.push({type:'relay',x:g.player.x,y:g.player.y});}else note(s,s.transistor?'PULSE → BASE':'3端子部品の輪郭');}
 if(id==='ct-hint'){s.hint=(s.hint+1)%3;s.hintTime=9;}
 return true;
}
export function towerSolid(g,a){if(!a.pcbRole?.startsWith('circuit-'))return null;return a.pcbRole==='circuit-arm'?g.circuit.arm>=.99:true;}
export function moveCircuitTower(g,dt){const s=g.circuit;if(!s||!active(g))return;const p=g.player;
 s.coilContact=p.onGround&&g.level.platforms[p.standing]?.pcbRole==='circuit-arm';
 stepCircuit(s.signal,{resistor:s.parts[0].state==='locked',capacitor:s.parts[1].state==='locked',band:s.band},dt);
 s.idle+=dt;s.hintTime=Math.max(0,s.hintTime-dt);s.noticeTime=Math.max(0,s.noticeTime-dt);
 for(const e of s.parts){
  if(e.state==='locked'||e.state==='seated')continue;
  if(e.state==='dead'){e.dead-=dt;if(e.dead<=0)resetPart(e);continue;}
  if(e.y>720||e.x<e.min-100||e.x>e.max+100){resetPart(e);continue;}
  e.clock+=dt;e.stun=Math.max(0,e.stun-dt);const phase=e.clock%2.4;
  e.warning=!e.stun&&phase<.65;e.attack=!e.stun&&phase>=.65&&phase<1.5;
  if(phase<.65)e.dir=Math.sign(p.x+14-e.x-e.w/2)||1;
  if(e.attack&&Math.abs(p.y-e.homeY)<190){e.x=clamp(e.x+e.dir*dt*(e.kind==='resistor'?155:100),e.min,e.max);}
  e.y=e.homeY-(e.kind==='capacitor'&&e.attack?Math.sin((phase-.65)/.85*Math.PI)*38:0);
  if(Math.abs(e.x+e.w/2-e.padX)<28&&Math.abs(e.y+e.h-e.padY)<9){e.x=e.padX-e.w/2;e.y=e.padY-e.h;e.state='seated';e.warning=false;e.attack=false;note(s,'PAD '+e.id.toUpperCase());}
 }
 if(s.signal.stable){s.liftY+=s.liftDir*TOWER.liftSpeed*dt;if(s.liftY<=210){s.liftY=210;s.liftDir=1;}if(s.liftY>=620){s.liftY=620;s.liftDir=-1;}}
 else s.liftY+=clamp(620-s.liftY,-dt*100,dt*100);
 for(const a of g.level.platforms){if(!a.pcbRole?.startsWith('circuit-'))continue;const x=a.x,y=a.y;
 if(a.pcbRole==='circuit-lift'){a.y=s.liftY;a.x=a.baseX+(s.signal.stable?0:Math.sin(s.signal.time*25)*Math.min(22,s.signal.ripple*7));}
 // A non-solid ghost arm lowers to its safe fixed upper surface before collision activates.
 a.dx=a.x-x;a.dy=a.y-y;}
}
export function tickCircuitTower(g,input,activated,dt,hit){if(!active(g))return;const s=g.circuit,p=g.player,X=g.level.circuit.origin;
 for(const e of s.parts){if(e.state!=='roam')continue;
  if(toolHit(g,e,'ct-'+e.id)){e.state='dead';e.dead=TOWER.respawnDelay;g.events.push({type:'stomp',x:e.x,y:e.y});continue;}
  if(activated&&close(p,e.x+e.w/2,e.y+e.h/2,185)){e.stun=TOWER.stun;e.attack=false;g.events.push({type:'relay',x:e.x,y:e.y});}
  if(overlap(p,e)){if(p.vy>30&&p.oldBottom<=e.y+12){e.stun=TOWER.stun;e.attack=false;p.vy=-400;p.jumps=1;}else if(e.attack)hit(g,e.x);}
 }
 const powered=circuitPower(s.signal,s.forward);
 if(activated&&close(p,X+1510,120,135)){if(powered&&s.transistor){s.armTarget=1;note(s,'DRIVE ON');g.events.push({type:'relay',x:X+1650,y:150});}else note(s,!s.transistor?'BASE : OPEN':!s.forward?'DIODE : ←':'SIGNAL : UNSTABLE');}
 if(!powered)s.armTarget=0;
 // Loss of power never retracts a platform beneath a rider; wait until PICO leaves it.
 const riding=g.level.platforms[p.standing]?.pcbRole==='circuit-arm';
 s.arm=clamp(s.arm+(s.armTarget?1:riding?0:-1)*dt,0,1);
 if(s.arm>=.99&&powered&&p.x+14>X+1640&&p.x+14<X+1760&&s.coilContact&&p.y+p.h>135&&p.y+p.h<165&&input.jump){p.vy=-TOWER.coilVelocity;p.onGround=false;p.standing=null;p.jumps=1;s.launched=true;s.launches++;g.events.push({type:'spring',x:p.x+14,y:150});}
 if(s.launched&&p.onGround&&p.x>X+1950&&p.y+p.h<-180&&!s.complete){s.complete=true;const relay=g.level.relays.find(r=>r.id==='circuit-tower');relay.on=true;grant(g,80,'回路試験完了',p.x,p.y);note(s,'CIRCUIT VERIFIED');}
}
export function resetCircuitTower(g){const s=g.circuit;if(!s)return;s.held=false;s.launched=false;s.liftY=620;s.liftDir=-1;for(const e of s.parts)if(e.state!=='locked')resetPart(e);}
export function towerGoal(g){if(!active(g))return null;const s=g.circuit;
 if(s.noticeTime>0)return s.notice;
 if(s.hintTime>0)return ["波形と、足場の揺れを見比べよう","RとCの輪郭へ誘導 → ACTIONで固定。帯を回して波形を比較","上層の矢印と3端子を確認。PULSEで駆動、コイル上でJUMP"][s.hint];
 return s.complete?'回路試験完了：上層の出口へ':'回路試験塔 · '+s.parts.filter(e=>e.state==='locked').length+'/2 接続 · '+(s.signal.stable?'SIGNAL ✓':'SIGNAL ~');
}
