// PICO hangs below a traveling eyelet. The same position drives art and movement.
export function installWireRuns(L){
 L.wireRuns=[
  {room:'spool',points:[[2480,482],[2790,195],[3160,-185]],sag:115,cleared:false},
  {room:'shaft',points:[[6200,-620],[6510,-390],[6900,285]],high:[6650,-665],sag:135,cleared:false}
 ];
}
export const currentRun=g=>g.level.wireRuns?.find(r=>r.room===g.rooms?.active);
const progress=t=>(1-Math.cos(t*Math.PI/1.65))/2;
function position(a,b,u,sag){
 return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u+4*sag*u*(1-u)];
}
export function tickWireRun(g,input,activated,dt){
 const r=currentRun(g);if(!r)return false;
 const p=g.player,near=(a)=>Math.hypot(p.x+14-a[0],p.y+20-a[1])<92;
 let ride=g.rooms.swing;
 if(!ride){
  if(!activated)return false;
  const reverse=r.cleared&&near(r.points[2]);
  if(!reverse&&!near(r.points[0]))return false;
  ride=g.rooms.swing={reverse,a:r.points[reverse?2:0],b:r.points[1],time:0};
  g.cooldown=.28;g.pulse=Math.min(g.pulse,.18);
 }else{
  ride.time+=dt;
  const u=progress(ride.time);
  if(input.jump){g.rooms.swing=null;p.vy=-540;p.jumps=1;return true;}
  if(activated){
   g.cooldown=.28;g.pulse=Math.min(g.pulse,.18);
   if(u>=.83){
    const end=r.points[ride.reverse?0:2];
    if(ride.b===end){
     g.rooms.swing=null;r.cleared=true;p.vx=ride.reverse?-260:260;p.vy=-650;p.jumps=1;
     g.events.push({type:'spring',x:p.x+14,y:p.y});return true;
    }
    const high=!ride.reverse&&ride.b===r.points[1]&&r.high&&input.left;
    ride.a=ride.b;ride.b=high?r.high:end;ride.time=0;
   }
  }
 }
 const [x,y]=position(ride.a,ride.b,progress(ride.time),r.sag);
 Object.assign(p,{x:x-14,y:y-20,vx:0,vy:0,onGround:false,standing:null,coyote:0,jumps:0,buffer:0});
 return true;
}
export function pulseRing(c,x,y,open,t){
 c.save();c.strokeStyle=open?'#91ffe0':'#e7ac75';c.lineWidth=4;
 if(open){c.beginPath();c.arc(x,y,22+(t*14)%10,0,Math.PI*2);c.stroke();}else c.setLineDash([5,5]);
 c.beginPath();c.arc(x,y,17,0,Math.PI*2);c.stroke();c.setLineDash([]);
 c.fillStyle=open?'#a9ffdf':'#edbd8e';c.font='bold 19px sans-serif';c.textAlign='center';c.fillText(open?'ϟ':'×',x,y+7);c.restore();
}
export function drawWireRun(c,g){
 const r=currentRun(g);if(!r)return;
 const ride=g.rooms.swing;
 c.save();c.translate(0,-34);
 const span=(a,b,lit)=>{
  c.strokeStyle=lit?'#73cecc':'#53727d';c.lineWidth=lit?4:2;c.beginPath();c.moveTo(...a);
  c.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+2*r.sag,...b);c.stroke();
 };
 const lit=(a,b)=>ride&&(ride.a===a&&ride.b===b||ride.a===b&&ride.b===a);
 span(r.points[0],r.points[1],lit(r.points[0],r.points[1]));span(r.points[1],r.points[2],lit(r.points[1],r.points[2]));
 if(r.high){span(r.points[1],r.high,ride?.b===r.high);span(r.high,r.points[2],ride?.a===r.high);}
 for(const p of [...r.points,...(r.high?[r.high]:[])]){
  c.fillStyle='#364e60';c.fillRect(p[0]-5,p[1]-85,10,65);
  pulseRing(c,...p,ride?ride.b===p&&progress(ride.time)>=.83:p===r.points[0]||r.cleared&&p===r.points[2],g.time);
 }
 c.restore();
 if(ride){const x=g.player.x+14,y=g.player.y;c.strokeStyle='#fce0a5';c.lineWidth=4;c.beginPath();c.moveTo(x,y-16);c.lineTo(x,y+7);c.stroke();pulseRing(c,x,y-14,progress(ride.time)>=.83,g.time);}
}
export function wireHint(g,r){
 const ride=g.rooms.swing;
 if(!ride)return '光る輪のそばで X／PULSE → ワイヤーをつかむ';
 if(progress(ride.time)<.83)return '次の輪まで振りきろう';
 if(ride.b===r.points[ride.reverse?0:2])return '◎ X／PULSE で跳び出す';
 return !ride.reverse&&r.high&&ride.b===r.points[1]?'◎ X／PULSE で乗り継ぐ　←＋パルスで上の線へ':'◎ X／PULSE で次のワイヤーへ';
}
