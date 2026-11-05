import {createGame,updateGame} from '../dist/engine.mjs';
import {traversePCB} from './pcb-route.mjs';
// From the real stage spawn. No coordinates, HP, flags or enemy state are injected.
export function traverseCircuit({record=false,experiments=false,alternative=false,game=null}={}){
 const g=game||createGame(5),inputs=[],marks={};
 const step=(input={})=>{if(record)inputs.push(input);updateGame(g,input);g.events=[];if(g.gameOver)throw Error('circuit game over');};
 const until=(fn,control=()=>({}),limit=3000)=>{for(let i=0;i<limit;i++){if(fn())return;step(control(i));}throw Error('timeout '+JSON.stringify({p:g.player,ct:{...g.circuit,signal:{stable:g.circuit.signal.stable,output:g.circuit.signal.output}},room:g.rooms.active}));};
 const wait=seconds=>{for(let i=0;i<seconds*120;i++)step();};
 const mark=name=>{marks[name]=inputs.length;if(process.env.CT_TRACE)console.error(name,g.player.x,g.player.y,g.player.vx,g.player.vy,g.circuit.launches);};
 const go=(x,y)=>until(()=>Math.abs(g.player.x+14-x)<15&&Math.abs(g.player.y+40-y)<8&&g.player.onGround,()=>{const p=g.player,dx=x-p.x-14,dy=y-p.y-40;return {right:dx>6,left:dx<-6,jump:p.onGround&&(dy<-30||p.x>19000&&Math.abs(dx)>80&&p.standing!==null&&(dx>0?g.level.platforms[p.standing].x+g.level.platforms[p.standing].w-p.x:p.x-g.level.platforms[p.standing].x)<70||p.y>570&&((dx<0&&p.x<16670&&p.x>16580)||(dx>0&&p.x>16370&&p.x<16450)))||p.jumps===1&&p.vy>-60&&dy<-20,pulse:g.cooldown<=0&&g.circuit.guards.some(e=>e.alive&&Math.hypot(p.x-e.x,p.y-e.y)<130)};});
 const use=()=>step({interact:true});
 const settle=x=>until(()=>Math.abs(g.player.x+14-x)<10&&Math.abs(g.player.vx)<40&&g.player.onGround,()=>({right:g.player.x+14<x-8,left:g.player.x+14>x+8}));
 if(!game){const prefix=traversePCB({record:true,stopAtD:true}).inputs;for(const input of prefix)step(input);}
 go(6480,400);use();wait(1.3);if(g.rooms.active!=='S')throw Error('entry');mark('entry');
 go(16515,510);until(()=>g.circuit.parts[0].state==='seated',()=>({pulse:g.cooldown<=0&&g.circuit.parts[0].attack}));
 go(16430,510);use();if(g.circuit.parts[0].state!=='locked')throw Error('R clamp');
 const setBand=target=>{if(g.circuit.band===target)return;go(16430,510);until(()=>g.circuit.band===target,()=>({right:g.player.x+14<16428,left:g.player.x+14>16432,jump:g.player.onGround}));go(16535,510);};
 mark('color');setBand(1); // Real stomp: no remote resistance setter
 go(17010,650);until(()=>g.circuit.parts[1].state==='seated',()=>({pulse:g.cooldown<=0&&g.circuit.parts[1].attack}));
 go(16950,650);use();if(g.circuit.parts[1].state!=='locked')throw Error('C clamp');mark('clamped');
 if(experiments){go(16100,510);setBand(2);wait(7);if(g.circuit.signal.stable)throw Error('100k should fail');setBand(0);wait(3);if(g.circuit.signal.stable)throw Error('1k should fail');setBand(1);}
 go(17030,650);use();if(!g.circuit.held)throw Error('transistor pickup');
 until(()=>g.circuit.signal.stable);mark('stable');
 // Board only at the low dock, then actually ride its physical surface.
 go(17070,650);until(()=>g.circuit.liftY>595);
 until(()=>g.level.platforms[g.player.standing]?.pcbRole==='circuit-lift',()=>({right:g.player.x+14<17170,jump:g.player.onGround&&g.circuit.liftY>500}));until(()=>g.player.onGround&&g.player.y<230,()=>({}));mark('ride');
 go(17430,150);go(17380,150);mark('diode');if(!experiments)use(); // retain reversed diode in failure route
 if(alternative){go(17510,-10);use();go(17430,150);} // isolate a wrong upper branch using the lower DC maintenance route
 until(()=>g.player.x>17598,()=>({right:true}));until(()=>g.player.onGround&&g.player.y>200,()=>({left:g.player.x>17595}));go(17560,360);use(); // D4 return path on the lower maintenance balcony
 if(alternative){go(17690,360);use();}
 go(17510,150);mark('socket');use();if(!g.circuit.transistor)throw Error('socket');
 if(experiments){until(()=>g.cooldown<=0);step({pulse:true});wait(1);if(g.circuit.arm>0)throw Error('reverse diode powered motor');go(17380,150);use();go(17510,150);}
 until(()=>g.cooldown<=0);step({pulse:true});until(()=>g.circuit.arm>=.99);mark('drive');
 go(17690,150);settle(17690);step({jump:true,right:true});if(!g.circuit.launched)throw Error('coil');mark('launch');
 until(()=>g.player.onGround&&g.player.y+40< -180,()=>({right:g.player.x+14<18100,left:g.player.x+14>18130,jump:g.player.jumps===1&&g.player.vy>-70,pulse:g.cooldown<=0&&g.circuit.guards.some(e=>e.alive&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<130)}));mark('island');
 go(18300,-190);settle(18300);step({jump:true,right:true});if(!g.circuit.secondLaunched)throw Error('second coil');
 until(()=>g.player.onGround&&g.player.x>19090,()=>({right:g.player.x+14<19250,left:g.player.x+14>19280,jump:g.player.jumps===1&&g.player.vy>-70,pulse:g.cooldown<=0&&g.circuit.guards.some(e=>e.alive&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<130)}));mark('yard');
 go(19500,-190);until(()=>g.circuit.parts[2].state==='seated',()=>({pulse:g.cooldown<=0&&g.circuit.parts[2].attack}));go(19450,-190);use();if(g.circuit.parts[2].state!=='locked')throw Error('yard R');
 go(19600,-330);go(19840,-330);until(()=>g.circuit.parts[3].state==='seated',()=>({pulse:g.cooldown<=0&&g.circuit.parts[3].attack}));go(19750,-330);use();if(g.circuit.parts[3].state!=='locked')throw Error('yard C');
 go(20050,-470);go(20225,-470);until(()=>g.circuit.parts[4].state==='seated',()=>({pulse:g.cooldown<=0&&g.circuit.parts[4].attack}));go(20170,-470);use();if(g.circuit.parts[4].state!=='locked')throw Error('yard SW');
 go(20400,-470);mark('exit');
 if(!g.circuit.complete)throw Error('not complete');go(20480,-470);use();wait(1.3);if(g.rooms.active!=='D')throw Error('exit gate');
 return {g,inputs,marks};
}
if(process.argv[1]?.endsWith('/circuit-route.mjs')){const {g,inputs,marks}=traverseCircuit({record:!!process.env.RECORD});console.log({complete:g.circuit.complete,room:g.rooms.active,hp:g.player.hp,deaths:g.deaths,time:g.time,marks});if(process.env.RECORD){const {writeFileSync}=await import('node:fs');const runs=[];for(const input of inputs){const last=runs.at(-1);if(last&&JSON.stringify(last[1])===JSON.stringify(input))last[0]++;else runs.push([1,input]);}writeFileSync('dist/tools/circuit-replay.json',JSON.stringify({runs,marks}));}}
