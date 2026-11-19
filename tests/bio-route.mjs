import {createGame,updateGame} from '../dist/engine.mjs';
import {exposedPin,slack} from '../dist/wire-skeleton.mjs';
import {balanced} from '../dist/hand-machines.mjs';

// Drive only public movement and action inputs, including the optional lower loop and high cable.
export function traverseBio({limit=180,trace=false}={}){
 const g=createGame(1),L=g.level,visited=new Set();let maxY=0,last='';
 for(let f=0;f<120*limit&&!g.finished&&!g.gameOver;f++){
  const room=g.rooms.active,p=g.player,foot=p.y+40,cx=p.x+14,input={};
  const steer=(x,tolerance=5)=>{input.right=cx<x-tolerance;input.left=cx>x+tolerance;};
  const door=to=>{const d=L.doors.find(d=>d.room===room&&d.to===to);steer(d.x);input.interact=Math.abs(cx-d.x)<22&&Math.abs(foot-d.y)<32&&g.rooms.cooldown===0&&!g.rooms.transition;};
  const drum=r=>{steer(r.x);input.pulse=Math.abs(cx-r.x)<32&&g.cooldown===0;};
  const [bridge,grip]=L.handRigs,[ext,flex,thumb,opp]=L.wireControls;
  const run=L.wireRuns.find(r=>r.room===room);
  visited.add(room);
  if(run){
   const ride=g.rooms.swing;
   if(ride){
    const u=(1-Math.cos(ride.time*Math.PI/1.65))/2;
    input.pulse=u>.95&&g.cooldown===0;input.left=room==='shaft'&&ride.b===run.points[1];
   }else if(!run.cleared||p.x<run.points[1][0]){
    steer(run.points[0][0]);input.pulse=Math.abs(cx-run.points[0][0])<28&&g.cooldown===0;
   }else door(room==='shaft'?'grasp':'link');
  }else if(room==='entry')door('spool');
  else if(room==='link'){
   if(ext.angle!==ext.target)door('extensor');
   else if(flex.angle!==flex.target)drum(flex);
   else if(!bridge.locked){
    steer(bridge.x);input.interact=Math.abs(cx-bridge.x)<16&&(!bridge.paid||balanced(bridge.time));
   }else if(bridge.extension<1)steer(bridge.x);
   else if(!visited.has('palm'))door('palm');
   else door('shaft');
  }else if(room==='extensor'){if(ext.angle!==ext.target)drum(ext);else door('link');}
  else if(room==='palm'){const east=L.doors.find(d=>d.room==='palm'&&d.checks.length);steer(east.x);input.interact=Math.abs(cx-east.x)<18&&g.rooms.cooldown===0;}
  else if(room==='grasp'){
   if(thumb.angle!==thumb.target)door('pinch');
   else if(opp.angle!==opp.target)drum(opp);
   else if(!grip.paid){steer(grip.x);input.interact=Math.abs(cx-grip.x)<15;}
   else if(!grip.delivered){const a=L.platforms.find(a=>a.gripSpecimen);steer(a.x+a.w/2);}
   else door('skeleton');
  }else if(room==='pinch'){if(thumb.angle!==thumb.target)drum(thumb);else door('grasp');}
  else if(room==='skeleton'){
   const s=L.skeleton;if(s.done)steer(L.goal.x);else{
    const pin=exposedPin(s);steer(pin.x);
    input.jump=pin.y<p.y-25&&Math.abs(cx-pin.x)<200&&(p.onGround||p.jumps===1&&p.vy>-60);
    input.pulse=Math.hypot(cx-pin.x,p.y+20-pin.y)<100&&slack(s)&&g.cooldown===0;
   }
  }
  if(!g.rooms.transition&&['entry','grasp','link','extensor','pinch','palm'].includes(room)&&g.cooldown===0&&!input.interact&&L.enemies.some(e=>e.alive&&Math.abs(e.x-cx)<115&&Math.abs(e.y-p.y)<70))input.pulse=true;
  updateGame(g,input,1/120);g.events=[];maxY=Math.min(maxY,p.y);
  if(g.repairSession)throw Error('Stage two opened a repair window');
  if(trace&&(last!==room||f%1200===0))console.log(f/120,room,Math.round(cx),Math.round(foot),g.research.funds,g.deaths);
  last=room;
 }
 return {g,maxY,visited,wp:g.finished?L.route.length:0};
}
