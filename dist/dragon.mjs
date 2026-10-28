// A single articulated pose drives both rendering and collision on either side.
import {clamp,approach} from './world.mjs?v=4.7a';
export function initDragon(b){b.face=-1;b.turn=Array(14).fill(-1);b.motionTime=0;b.turnCooldown=0;b.stoppedAge=0;}
export function updateDragon(b,p,dt){if(!b.turn)initDragon(b);b.motionTime+=dt;b.turnCooldown=Math.max(0,b.turnCooldown-dt);if(b.done){b.stoppedAge+=dt;return;}
 const dx=p.x+14-b.x;if(Math.abs(dx)>105&&b.turnCooldown<=0&&Math.sign(dx)!==b.face&&!b.route){b.face=Math.sign(dx);b.turnCooldown=1.5;}
 const prev=[...b.turn];for(let i=0;i<b.turn.length;i++)b.turn[i]=approach(prev[i],i?prev[i-1]:b.face,dt*(i?2.7:4.2));
}
export function dragonPose(b){const t=b.age<8?0:b.motionTime||0,cycle=b.clock%4.2,active=cycle>=1&&cycle<2.2,wind=active&&b.attack===4,compress=b.attack===0&&cycle<1?1-cycle*.25:1;
 return Array.from({length:14},(_,i)=>{const settled=b.done&&(b.stoppedAge||0)>i*.1,turn=b.turn?.[i]??-1;
 let x=b.x+(230-i*39)*turn*compress,y=b.y-45-Math.sin(i/13*Math.PI)*20;
 if(!settled)y+=Math.sin(t*3-i*.55)*(i<2?8:12);
 if(wind)y-=35*Math.sin((cycle-1)/1.2*Math.PI);
 if(i===0){y-=45;if(b.attack===2)y+=active?75*Math.sin((cycle-1)/1.2*Math.PI):cycle<1?-20*cycle:0;}
 if(i>9&&b.attack===1)y-=active?Math.sin((cycle-1)/1.2*Math.PI+(i-10)*.4)*55:0;
 if(b.invul>0&&!settled)y-=Math.sin((.7-b.invul)*14-i*.6)*9;
 if(b.done&&!settled)y-=Math.sin(Math.min(1,(b.stoppedAge||0)/.45)*Math.PI)*28;if(settled)y+=18+Math.min(18,(b.stoppedAge||0)*8);
 return {x,y,r:i===0?42:i<9?34:Math.max(10,34-(i-8)*5),turn};});}
export function dragonCore(b){const n=dragonPose(b)[5];return {x:n.x-32,y:n.y-(b.cooled?135:24),w:64,h:60,part:'core'};}
export function dragonBoxes(b){const nodes=dragonPose(b);return nodes.map((n,i)=>i===5&&b.cooled?dragonCore(b):({x:n.x-n.r,y:n.y-n.r*.72,w:n.r*2,h:n.r*1.44,part:i===0?'head':i===5?'core':i>9?'tail':'body'}));}
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function crystal(c,n,i,b,t){const r=n.r,hue=(178+i*14+(b.phase-1)*16)%360;const lit=b.invul>0?'#fff4cf':`hsl(${hue},${b.done?12:58}%,${b.done?43:68}%)`;c.save();c.translate(Math.round(n.x/2)*2,Math.round(n.y/2)*2);
 const depth=b.done?'.4':'.9';c.strokeStyle=`rgba(119,242,235,${depth})`;c.lineWidth=3;c.beginPath();c.ellipse(0,0,r+3,r*.64,0,0,7);c.stroke();
 poly(c,[[-r,-r*.4],[-r*.6,-r*.85],[r*.5,-r*.85],[r,-r*.3],[r*.8,r*.5],[0,r*.76],[-r*.9,r*.5]],'#132b40');
 poly(c,[[-r+4,-r*.35],[-r*.55,-r*.74],[r*.48,-r*.73],[r-4,-r*.26],[r*.65,r*.4],[0,r*.62],[-r*.75,r*.4]],lit);
 poly(c,[[-r*.55,-r*.74],[0,-r*.18],[r*.48,-r*.73]],`hsl(${hue+26},76%,83%)`);
 poly(c,[[0,-r*.18],[r-4,-r*.26],[r*.65,r*.4],[0,r*.62]],`hsl(${hue-18},49%,44%)`);
 for(let y=-r*.25;y<r*.5;y+=5){c.fillStyle='#183d5044';c.fillRect(-r*.65,y,r*1.3,1);}
 if(i>0){poly(c,[[-r*.45,-r*.6],[-r*.1,-r*1.8],[r*.35,-r*.65]],'#263b60');poly(c,[[-r*.29,-r*.73],[-r*.1,-r*1.62],[r*.16,-r*.73]],`hsl(${hue+40},78%,81%)`);c.fillStyle='#ecfcff';c.fillRect(-r*.1,-r*1.4,2,r*.35);}
 if(b.phase>=2&&i%3===0){poly(c,[[-10,-22],[5,-10],[-5,2],[12,12],[2,23],[-13,0]],'#122331');c.fillStyle='#fbc484';c.fillRect(-5,-4,10,4);}
 if(i===5){c.fillStyle='#142639';c.fillRect(-16,-18,32,35);c.fillStyle=b.done?'#476977':b.cooled?'#476977':'#ffac80';c.fillRect(-9,-11,18,22);c.fillStyle='#fff4d5';if(!b.done&&!b.cooled)c.fillRect(-3,-7,6,14);}
 if([3,7].includes(i)){const stride=b.done?0:Math.sin(t*4+i)*8;poly(c,[[-13,16],[-24,37+stride],[-39,42+stride],[-38,49+stride],[-8,45],[6,21]],`hsl(${hue},35%,53%)`);for(let k=0;k<3;k++)poly(c,[[-37+k*8,43+stride],[-44+k*8,51+stride],[-32+k*8,49+stride]],'#f1d5ee');}
 c.restore();}
function head(c,n,next,b){const angle=Math.atan2(n.y-next.y,n.x-next.x);c.save();c.translate(n.x,n.y);c.rotate(angle);poly(c,[[-30,-30],[8,-31],[34,-14],[54,-3],[48,17],[20,30],[-27,25],[-42,0]],'#182e49');poly(c,[[-27,-24],[7,-25],[31,-9],[47,-2],[40,13],[18,22],[-24,19],[-34,0]],b.invul>0?'#fff6da':'#b4e7e0');poly(c,[[-17,-24],[-24,-61],[6,-31]],'#b4b2fc');poly(c,[[-27,19],[-35,52],[3,24]],'#8ccbd9');poly(c,[[4,-24],[18,-49],[24,-14]],'#dcd2ff');poly(c,[[5,-18],[31,-9],[19,9],[-18,2]],'#7fb4c7');c.fillStyle=b.done?'#315263':'#ffe6a6';c.fillRect(5,-16,17,8);c.fillStyle='#091b34';if(!b.done)c.fillRect(16,-16,3,8);c.fillStyle='#142941';c.fillRect(25,12,22,3);for(let x=28;x<44;x+=7)poly(c,[[x,15],[x+5,15],[x+2,20]],'#f5f4d3');for(let y=-2;y<12;y+=5){c.fillStyle='#4b7e9488';c.fillRect(-21,y,34,1);}c.restore();}
export const dragonBuildProgress=(age,i)=>clamp((age-(13-i)*.4)/1.4,0,1);
export function drawDragon(c,b,t){const nodes=dragonPose(b),age=b.age??10;
 for(let i=nodes.length-1;i>=1;i--){const n=nodes[i],next=nodes[i-1],progress=dragonBuildProgress(age,i);if(progress<=0)continue;if(dragonBuildProgress(age,i-1)>0){c.strokeStyle='#12283a';c.lineWidth=12;c.beginPath();c.moveTo(n.x,n.y);c.lineTo(next.x,next.y);c.stroke();c.strokeStyle='#7ea0b7';c.lineWidth=4;c.stroke();}
 c.save();if(progress<1){c.beginPath();c.rect(n.x-50,n.y+65-150*progress,100,150*progress);c.clip();}crystal(c,n,i,b,age<8?0:t);c.restore();}
 const hp=dragonBuildProgress(age,0);if(hp>0){c.save();if(hp<1){c.beginPath();c.rect(nodes[0].x-80,nodes[0].y+75-150*hp,160,150*hp);c.clip();}head(c,nodes[0],nodes[1],b);c.restore();}
}
