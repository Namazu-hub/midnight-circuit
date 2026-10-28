import {setupPCBFoes,tickPCBFoes} from './pcb-enemies.mjs?v=4.9b';
import {clamp,overlap} from './world.mjs?v=4.9b';
import {roomControl} from './rooms.mjs?v=4.9b';
import {gateStatus,gateText} from './gate-status.mjs?v=4.9b';
import {tetherAction} from './tether.mjs?v=4.9b';
import {tickPCBBoss} from './pcb-boss.mjs?v=4.9b';
export const PCB_RULES=Object.freeze({batterySpeed:85,boardSpeed:85,coolRate:65,pasteSpeed:.48});
const near=(p,x,y,r=78)=>Math.hypot(p.x+14-x,p.y+20-y)<r;
export function pcbRestore(g,id){const r=g.level.relays.find(r=>r.id===id);if(r&&!r.on){r.on=true;g.events.push({type:'repairComplete',x:r.x,y:r.y,text:'✓ '+r.label});}}
export function setupPCB(g){if(!g.level.pcb)return;g.pcb={battery:{x:430,y:410,w:70,h:100},power:false,stencil:0,pasteAge:0,placement:0,placementClock:0,fiducial:0,belt:1,magnet:false,frameY:460,temp:230,fan:false,aoiMode:false,scan:0,inspected:false,lift:510,charge:0,squeegee:2200,clock:0,boss:{active:false,done:false,age:0,clock:0,phase:1,hp:6,headX:13000,target:13000,feed:0,parts:0,belt:1,magnet:false,fixed:false,temp:230,cool:false,ng:false}};setupPCBFoes(g);}
export function pcbControl(g){if(!g?.pcb)return null;const door=roomControl(g);if(door)return {...door,door:true};return g.level.pcbControls.filter(o=>o.x>=g.level.rooms.find(r=>r.id===g.rooms.active).left&&o.x<g.level.rooms.find(r=>r.id===g.rooms.active).right&&near(g.player,o.x,o.y)).sort((a,b)=>Math.hypot(g.player.x-a.x,g.player.y-a.y)-Math.hypot(g.player.x-b.x,g.player.y-b.y))[0]||null;}
export function pcbSolid(g,a){if(!g.pcb)return null;if(a.pcbRole==='component')return a.slot<g.pcb.placement;if(a.pcbRole==='solder')return g.pcb.temp<=55;if(a.pcbRole==='boss-component')return a.slot<g.pcb.boss.parts;return null;}
export function pcbAction(g,id){const s=g.pcb;if(tetherAction(g,id))return;if(id==='recall-power'&&!s.power)s.battery={x:430,y:410,w:70,h:100};if(id==='stencil')s.stencil=1-s.stencil;if(id==='fiducial'&&s.placement===0)s.fiducial=1-s.fiducial;if(id==='belt')s.belt=s.belt===1?0:s.belt===0?-1:1;if(id==='magnet')s.magnet=!s.magnet;if(id==='cool')s.fan=!s.fan;if(id==='aoi-mode')s.aoiMode=!s.aoiMode;if(id==='rework')s.aoiMode=false;if(id==='ground')s.charge=0;
 const b=s.boss;if(id==='boss-belt')b.belt=b.belt===1?0:b.belt===0?-1:1;if(id==='boss-magnet')b.magnet=!b.magnet;if(id==='boss-cool')b.cool=!b.cool;if(id==='boss-aoi'&&b.phase===4)b.ng=true;if(id==='feeder')b.feed=12;
}
export function movePCB(g,dt){const s=g.pcb;if(!s)return;s.clock+=dt;
 for(const a of g.level.platforms){if(!a.pcbManaged)continue;const ox=a.x,oy=a.y;
 if(a.pcbRole==='board'){const i=a.boardIndex;a.x=a.baseX+Math.sin(s.clock*(i?.42:.29))*190;a.y=a.baseY;}
 if(a.pcbRole==='component'){const board=g.level.platforms.find(p=>p.pcbRole==='board'&&p.boardIndex===0);a.x=board.x+60+a.slot*130+(s.fiducial?30:0);a.y=board.y-35-a.slot*48;}
 if(a.pcbRole==='stencil'){a.x=a.baseX+s.stencil*170;a.y=300-Math.sin(s.clock)*35;}
 if(a.pcbRole==='magnet-frame'){s.frameY+=clamp((s.magnet?300:460)-s.frameY,-dt*90,dt*90);a.y=s.frameY;}
 if(a.pcbRole==='aoi-lift')a.y=s.lift;
 a.dx=a.x-ox;a.dy=a.y-oy;
 }
 for(const a of g.level.platforms){if(a.pcbBelt)a.belt=s.power?90:0;if(a.baseX===6000&&a.h===200)a.belt=s.belt*65;}
}
export function tickPCB(g,input,activated,dt,hit){const s=g.pcb;if(!s)return;const p=g.player,room=g.rooms.active;
 const ctl=pcbControl(g);if(input.interact&&ctl&&!ctl.door)pcbAction(g,ctl.id);
 if(room==='A'&&!s.power){const b=s.battery,dir=(input.right?1:0)-(input.left?1:0);if(Math.abs(p.x+14-(b.x+35))<90&&p.y>390&&dir&&Math.sign(b.x-p.x)===dir){b.x+=dir*PCB_RULES.batterySpeed*dt;p.x=b.x+(dir>0?-p.w:70);p.vx=dir*PCB_RULES.batterySpeed;}if(b.x>=800){s.power=true;pcbRestore(g,'power');}if(b.x<380||b.x>1900)b.x=430;}
 if(room==='B'){s.squeegee=2250+(Math.sin(s.clock*.8)+1)*450;if(overlap(p,{x:s.squeegee,y:390,w:55,h:120})){p.x+=Math.cos(s.clock*.8)*dt*105;}if(p.x>2600&&p.x<3100&&p.onGround)p.vx*=PCB_RULES.pasteSpeed;if(s.stencil&&p.x>3230){s.pasteAge+=dt;if(s.pasteAge>.5)pcbRestore(g,'paste');}}
 if(room==='C'){const a=g.level.platforms[p.standing];if(a?.pcbRole==='board'||a?.pcbRole==='component'){s.placementClock+=dt;if(s.placementClock>1.8&&s.placement<3&&!s.drop){s.drop={slot:s.placement,age:0};s.placementClock=0;}}if(activated&&s.placement<3&&p.x>4400&&p.x<5600&&!s.drop){s.drop={slot:s.placement,age:0};s.placementClock=0;}if(s.drop){s.drop.age+=dt;if(s.drop.age>=.6){s.placement++;s.drop=null;const a=g.level.platforms.find(a=>a.pcbRole==='component'&&a.slot===s.placement-1);if(overlap(p,a)){p.y=a.y-p.h;p.vy=0;p.standing=a.id;p.onGround=true;}g.events.push({type:'relay',x:a.x,y:a.y});}}if(s.placement===3)pcbRestore(g,'placement');}
 if(room==='D'){if(s.belt!==0&&p.y>420)s.charge=Math.min(1,s.charge+Math.abs(p.vx)*dt/1500);if(s.magnet&&g.tethers[0]?.connected&&s.frameY<=310)pcbRestore(g,'magnet');}
 if(room==='E'){s.temp=clamp(s.temp+(s.fan?-PCB_RULES.coolRate:15)*dt,25,245);if(s.temp>55&&overlap(p,{x:8800,y:500,w:540,h:170}))hit(g,9000);if(s.temp<=55)pcbRestore(g,'reflow');}
 if(room==='F'){const stationary=Math.abs(p.vx)<15&&near(p,11210,480,100);if(stationary&&!s.inspected){s.scan+=dt;if(s.scan>1){s.inspected=true;const lift=g.level.platforms.find(a=>a.pcbRole==='aoi-lift');p.standing=lift.id;p.y=lift.y-p.h;p.onGround=true;g.events.push({type:'pcbDetected'});}}if(s.inspected){s.lift=Math.max(220,s.lift-dt*90);if(s.lift===220)pcbRestore(g,'aoi');}if(near(p,10900,480))s.charge=0;}
 tickPCBFoes(g,activated,dt,hit);
 if(room==='G')tickPCBBoss(g,input,activated,dt,hit);
}
export function pcbGoal(g){const s=g.pcb,b=s.boss,d=roomControl(g);if(d&&!gateStatus(g,d).ready)return gateText(g,d);
 if(b.active&&!b.done)return b.phase===1?'照準を避け、停止したヘッドを攻撃':b.phase===2?'実装された部品を足場に、ヘッドを狙う':b.phase===3?!b.fixed?'搬送を逆転し、左の固定位置で電磁石を作動':'局所冷却ではんだを固める':!b.ng?'上層のAOIをボスへ向ける':'露出したコアへ最後のパルス';
 const goals={A:s.power?'次の製造工程へ':'電源ユニットを右のソケットへ押す',B:'ステンシルをずらし、スキージの先へ',C:'基板へ乗って部品の実装を進める',D:'ジャンパ線を接続し、金属フレームを持ち上げる',E:'上層ファンで溶融はんだを冷やす',F:s.inspected?'検査された基板と出荷ゲートへ':'カメラ下の測定床で静止する',G:'出荷ラインの奥へ',H:'完成した基板を見届け、出口へ',S:'不良品を再検査し、検査ラインへ戻る'};return '製造工程 '+g.rooms.active+'：'+goals[g.rooms.active];}
