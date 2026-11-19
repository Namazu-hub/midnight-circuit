import {pulseRing} from './bio-wire.mjs?v=4.14.0';
const CX=10600;
const pins=[
 {x:10342,y:357,name:'左肩'},
 {x:10820,y:253,name:'右肘'},
 {x:CX,y:315,name:'胸骨'}
];
export function installSkeleton(L){
 L.skeleton={phase:0,time:0,active:false,done:false,aim:CX-200};
}
const cycle=t=>t%4.7;
export function slack(s){return cycle(s.time)>=1.95;}
export function exposedPin(s){return pins[s.phase];}
const reach=115;
export function skeletonHint(g){
 const s=g.level.skeleton;
 if(s.done)return 'ワイヤーをすべて解除　出口 →';
 const pin=exposedPin(s),dx=pin.x-g.player.x-14,dy=pin.y-g.player.y-20;
 const near=Math.hypot(dx,dy)<reach;
 const direction=Math.abs(dx)>85?(dx>0?'→':'←'):(dy<0?'↑':'↓');
 if(!near)return (s.phase+1)+'/3　'+pin.name+'の輪 '+direction+'　足場から近づく';
 return slack(s)?'◎ '+pin.name+'の輪が開いた！　X／PULSE':'× 張力あり　攻撃をかわし、輪が開くのを待つ';
}
function lerp(a,b,u){return a+(b-a)*u;}
function armPose(s,side){
 const clock=cycle(s.time),activeSide=s.phase===0?-1:1;
 const shoulder=[CX+side*48,271],rest=[CX+side*183,337];
 if(s.phase>=(side<0?1:2)){
  return {shoulder,elbow:[shoulder[0]+side*24,363],hand:[shoulder[0]+side*8,454]};
 }
 let reach=0;
 if(s.active&&side===activeSide){
  if(clock<1.2)reach=-.12*Math.sin(Math.PI*clock/1.2);
  else if(clock<1.7)reach=(clock-1.2)/.5;
  else if(clock<2.05)reach=1;
  else reach=Math.max(0,1-(clock-2.05)/.7);
 }
 const hand=[lerp(rest[0],s.aim,reach),lerp(rest[1],493,reach)];
 const dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1],d=Math.hypot(dx,dy);
 const bend=Math.sqrt(Math.max(0,190*190-d*d/4));
 return {shoulder,elbow:[(shoulder[0]+hand[0])/2+side*dy/d*bend,(shoulder[1]+hand[1])/2-side*dx/d*bend],hand};
}
function legPose(s,side){
 const hip=[CX+side*22,368],rest=[CX+side*64,494];
 const clock=cycle(s.time);
 const striking=s.active&&s.phase===2&&side===(s.aim<CX?-1:1);
 let foot=rest;
 if(striking){
  const lift=Math.min(1,clock/.8),drop=Math.min(1,Math.max(0,(clock-1.2)/.5));
  const recover=Math.max(0,1-Math.max(0,clock-2.05)/.65);
  foot=[lerp(rest[0],s.aim,lift*recover),rest[1]-80*lift*(1-drop)*recover];
 }
 return {hip,knee:[(hip[0]+foot[0])/2+side*20,(hip[1]+foot[1])/2-12],foot};
}
export function tickSkeleton(g,activated,dt,hit){
 const s=g.level.skeleton;if(!s||s.done||g.rooms.active!=='skeleton')return;
 const p=g.player;
 if(!s.active){
  if(p.x<10115||!g.level.handRigs[1].delivered||!g.level.handRigs[0].locked)return;
  s.active=true;s.time=0;g.events.push({type:'handNotice',text:'骨格試験機 起動 · 緩んだワイヤー端子にパルス'});
 }
 g.cooldown=Math.min(g.cooldown,.6);g.pulse=Math.min(g.pulse,.3);s.time+=dt;const clock=cycle(s.time);
 if(clock<1.2){
  const minX=s.phase===0?CX-345:s.phase===1?CX:CX-165;
  const maxX=s.phase===0?CX:s.phase===1?CX+345:CX+165;
  s.aim=Math.max(minX,Math.min(maxX,p.x+14));
 }
 if(clock>=1.45&&clock<2.05){
  const [x,y]=s.phase===2?legPose(s,s.aim<CX?-1:1).foot:armPose(s,s.phase===0?-1:1).hand;
  if(p.x+p.w>x-38&&p.x<x+38&&p.y+p.h>y-28&&p.y<y+22){hit(g,x);if(!s.active||g.gameOver)return;}
 }
 const pin=exposedPin(s);
 if(activated&&slack(s)&&Math.hypot(p.x+14-pin.x,p.y+20-pin.y)<reach){
  s.phase++;s.done=s.phase===pins.length;s.active=!s.done;s.time=0;
  g.events.push({type:'actionStep',x:pin.x,y:pin.y,text:s.done?'張力解除 · 骨格試験機は停止した':pin.name+'のワイヤーを解放'});
 }
}
function line(c,pts,color,w){
 c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.stroke();
}
function circle(c,p,r,col){c.fillStyle=col;c.beginPath();c.arc(...p,r,0,Math.PI*2);c.fill();}
export function drawSkeleton(c,g){
 const s=g.level.skeleton;if(!s||g.rooms.active!=='skeleton')return;
 c.save();c.lineCap='round';c.font='bold 16px sans-serif';c.textAlign='center';
 const ivory='#dfdac6',joint='#788d95',wire='#e7ba79';
 line(c,[[CX-390,65],[CX+390,65]],'#506983',12);
 c.save();if(s.done){c.translate(CX,506);c.scale(1,.45);c.translate(-CX,-506);}
 line(c,[[CX,243],[CX,365]],ivory,12);
 for(let i=0;i<5;i++)for(const dir of [-1,1])line(c,[[CX,271+i*13],[CX+dir*(42-i*3),264+i*13],[CX+dir*(31-i*3),280+i*13]],ivory,6);
 line(c,[[CX-28,356],[CX,375],[CX+28,356],[CX-28,356]],ivory,9);
 for(const dir of [-1,1]){
  const a=armPose(s,dir),{hip,knee,foot}=legPose(s,dir);
  line(c,[hip,knee,foot,[foot[0]+dir*25,foot[1]+4]],ivory,10);
  line(c,[[CX,262],a.shoulder,a.elbow,a.hand],ivory,11);
  for(const p of [knee,hip,a.shoulder,a.elbow,a.hand]){circle(c,p,9,joint);circle(c,p,3,'#304451');}
  for(let i=0;i<4;i++)line(c,[[a.hand[0]+(i-1.5)*6,a.hand[1]],[a.hand[0]+(i-1.5)*8,a.hand[1]+18]],ivory,4);
  const cut=s.phase>=(dir<0?1:2),anchor=[CX+dir*209,71];
  line(c,[anchor,cut?[anchor[0]+dir*8,155]:a.elbow],cut?'#536674':wire,2);
  if(!cut)line(c,[[CX+dir*100,72],a.shoulder],'#94c9bd',2);
 }
 circle(c,[CX,224],28,ivory);c.fillStyle=ivory;c.fillRect(CX-18,232,36,21);
 for(const dir of [-1,1])circle(c,[CX+dir*11,225],7,'#253647');
 for(let i=-1;i<=1;i++)line(c,[[CX+i*7,245],[CX+i*7,252]],'#52606b',2);
 c.restore();
 if(s.active){
  const pin=exposedPin(s),loose=slack(s);
  const endpoint=s.phase===2?[CX,277]:s.phase===0?armPose(s,-1).shoulder:armPose(s,1).elbow;
  line(c,[[pin.x,pin.y],[pin.x,loose?pin.y+20:97],[endpoint[0],loose?endpoint[1]+14:97],endpoint],loose?'#82e6c4':wire,2);
  c.fillStyle=loose?'#8fffd51b':'#ffbf8010';c.beginPath();c.arc(pin.x,pin.y,reach,0,Math.PI*2);c.fill();
  c.fillStyle='#263642';c.beginPath();c.arc(pin.x,pin.y,19,0,Math.PI*2);c.fill();
  pulseRing(c,pin.x,pin.y,loose,g.time);
  c.fillStyle='#f4f2de';c.fillText(pin.name+(loose?'　X／PULSE':'　×'),pin.x,pin.y-44);
  if(cycle(s.time)<1.7){line(c,[[s.aim-33,502],[s.aim+33,502]],'#ff957d',5);}
 }
 c.fillStyle='#c5dcd9';c.fillText(s.done?'骨格試験機 · 停止':'骨格試験機　'+s.phase+' / 3',CX,98);
 c.restore();
}
