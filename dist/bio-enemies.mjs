// Stage two specimens use the normal enemy lifecycle, stomp rewards and recovery.
export function installBioEnemies(L){
 const sites=[
  ['entry',760,510,'thrower'],['entry',1820,510,'palm'],
  ['spool',2870,195,'spinner'],['extensor',12800,-1320,'thrower'],
  ['link',5580,-600,'palm'],['palm',14830,585,'spinner'],
  ['shaft',6560,-390,'spinner'],['pinch',17570,-930,'thrower'],
  ['grasp',9260,510,'palm']
 ];
 for(const [room,x,y,type] of sites){
  const w=type==='palm'?48:36,h=type==='palm'?43:34;
  L.enemies.push({x,y:y-h,baseY:y-h,w,h,room,kind:'bio-'+type,bioShape:type,min:x-80,max:x+80,speed:38,dir:-1,alive:true,clock:0,state:'patrol',stateTime:0});
 }
}
function mode(e,state){e.state=state;e.stateTime=0;}
function threadTip(e){
 const u=Math.min(1,e.stateTime/.38);
 const length=e.state==='extend'?210*u:e.state==='aim'?210:0;
 return {x:e.x+18+e.aim.x*length,y:e.y+17+e.aim.y*length};
}
export function stepBioEnemy(g,e,dt,hit){
 const p=g.player,dx=p.x+p.w/2-e.x-18,dy=p.y+p.h/2-e.y-17,dist=Math.hypot(dx,dy);
 if(e.kind==='bio-spinner'&&g.pulse>0&&e.aim&&dist<290){
  mode(e,'recover');e.aim=null;g.events.push({type:'wireCut',x:e.x+18,y:e.y+17});
 }
 if(g.pulse>0)return;
 e.stateTime+=dt;e.clock+=dt;
 if(e.state==='recover'){if(e.stateTime>1.35)mode(e,'patrol');return;}
 if(e.state==='patrol'){
  if(e.kind==='bio-palm'){e.x=Math.min(e.max,Math.max(e.min,e.x+e.dir*e.speed*dt));if(e.x===e.min||e.x===e.max)e.dir*=-1;}
  const range=e.kind==='bio-thrower'?475:e.kind==='bio-spinner'?235:188;
  if(dist<range&&e.stateTime>.35){
   e.dir=dx<0?-1:1;e.aim={x:dx/Math.max(1,dist),y:dy/Math.max(1,dist)};
   e.targetX=p.x;e.targetY=p.y;mode(e,'aim');
  }
  return;
 }
 if(e.state==='aim'&&e.stateTime>=.75){
  if(e.kind==='bio-thrower'){
   const x=e.x+12,y=e.y-5,flight=.95,gravity=510;
   g.projectiles.push({room:e.room,kind:'bone',x,y,w:17,h:15,vx:(e.targetX+7-x)/flight,vy:(e.targetY+12-y)/flight-gravity*flight/2,gravity,life:2.2});
   mode(e,'recover');
  }else if(e.kind==='bio-palm'){e.launchX=e.x;mode(e,'pounce');}
  else mode(e,'extend');
 }
 if(e.state==='pounce'){
  const u=Math.min(1,e.stateTime/.76);
  e.x=e.launchX+(Math.max(e.min-65,Math.min(e.max+65,e.targetX))-e.launchX)*u;
  e.y=e.baseY-122*Math.sin(Math.PI*u);
  if(u===1){e.y=e.baseY;mode(e,'recover');}
 }
 if(e.state==='extend'){
  const tip=threadTip(e),sx=e.x+18,sy=e.y+17,tx=tip.x-sx,ty=tip.y-sy;
  const u=Math.max(0,Math.min(1,(dx*tx+dy*ty)/(tx*tx+ty*ty||1)));
  if(Math.hypot(dx-u*tx,dy-u*ty)<17)hit(g,sx);
  if(e.stateTime>.93){e.aim=null;mode(e,'recover');}
 }
}
export function drawBone(c,x,y,angle,size=1){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(size,size);c.fillStyle='#fff0d0';c.fillRect(-11,-3,22,6);
 for(const x of [-11,11])for(const y of [-3,3]){c.beginPath();c.arc(x,y,4,0,7);c.fill();}c.restore();
}
export function drawBioSpecimen(c,e){
 c.save();c.translate(e.x,e.y);const wind=e.state==='aim';
 if(e.bioShape==='thrower'){
  c.fillStyle='#8a796c';c.fillRect(8,19,18,13);c.fillStyle='#f1e3c3';c.fillRect(5,2,24,19);
  c.fillStyle='#323345';c.fillRect(8,8,5,6);c.fillRect(20,8,5,6);
  drawBone(c,17+e.dir*17,wind?-10:20,wind?-1:.4,.8);
 }else if(e.bioShape==='palm'){
  const curl=wind ? .6 : e.state==='pounce' ? 1 : 0;
  c.fillStyle='#d9988c';c.fillRect(6,16,34,24);c.fillRect(e.dir<0?-2:37,22,11,9);
  for(let i=0;i<4;i++){
   const x=8+8*i,y=3+Math.abs(i-1)*3+curl*8;c.fillStyle='#f3bd9e';c.fillRect(x,y,6,23-y);c.fillStyle='#864e56';c.fillRect(x,y+4,6,2);
  }
  c.fillStyle='#714653';c.fillRect(15,23,18,9);c.fillStyle='#ffe0a2';c.fillRect(20,25,8,4);
 }else{
  c.fillStyle='#7a8db2';c.fillRect(1,11,34,17);c.fillStyle='#b9d6d3';
  for(let i=0;i<4;i++)c.fillRect(5+7*i,5,4,27);
  c.fillStyle='#313a52';c.beginPath();c.arc(18,17,9,0,7);c.fill();c.fillStyle='#a1f3dc';c.fillRect(14,14,8,6);
  if(e.aim&&(wind||e.state==='extend')){
   const tip=threadTip(e);c.strokeStyle=wind?'#ffd095':'#a9f5e2';c.lineWidth=wind?2:4;if(wind)c.setLineDash([5,6]);
   c.beginPath();c.moveTo(18,17);c.lineTo(tip.x-e.x,tip.y-e.y);c.stroke();
  }
 }
 if(wind){c.fillStyle='#ffe29b';c.font='bold 18px monospace';c.fillText('!',13,-16);}c.restore();
}
