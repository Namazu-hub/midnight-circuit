import {clamp,overlap} from './world.mjs?v=4.4b';
export const ENEMY_GUIDE=[
 ['spring','横伸びバネ','縮んで予告した後、左右に伸びる。上から踏むかパルス。'],
 ['coil','電磁コイル','充電中は引き寄せ、放電中は押し戻す。パルスで停止。'],
 ['silicone-a','シリコーンA / B','二液が触れると粘着壁に硬化。混ざる前に踏むか、Xで壁を除去。'],
 ['mouse-dash','脱走ネズミ','身構えた後に猛ダッシュ。'],
 ['mouse-hop','跳ねネズミ','小さく連続ジャンプ。'],
 ['mouse-erratic','挙動不審ネズミ','立ち止まった後に方向を変える。'],
 ['mouse-chase','追跡ネズミ','見つかると追いかけてくる。'],
 ['resistor','抵抗ランナー','！のあとに突進。跳んでかわして上から踏もう。'],
 ['capacitor','コンデンサ','充電後に周囲へ放電。輪の外へ逃げるかパルス。'],
 ['chip','ICタレット','照準を合わせて弾を発射。予告線から離れよう。'],
 ['beaker','ビーカーホッパー','跳ねて着地すると薬液が残る。空中で踏むと安全。'],
 ['diode','ダイオードローン','上空で狙ってから急降下。横へよけて反撃。']
];
function patrol(e,dt,speed=e.speed){e.x+=speed*e.dir*dt;if(e.x<e.min){e.x=e.min;e.dir=1;}if(e.x>e.max){e.x=e.max;e.dir=-1;}}
export function tickEnemies(g,dt,hit){
 const p=g.player,frozen=g.pulse>0;
 for(const e of g.level.enemies){
   if(!e.alive)continue;e.active=Math.abs(e.x-p.x)<720&&Math.abs(e.y-p.y)<470;
   if(!e.active||frozen)continue;
   e.clock+=dt;e.stateTime+=dt;const dx=p.x-e.x,dy=p.y-e.y;
   if(e.kind==='spring'){
     const phase=e.clock%3.4;e.state=phase<1?'charge':phase<1.6?'extend':'recover';e.extension=e.state==='extend'?95:0;
     if(e.extension&&overlap(p,{x:e.x-e.extension,y:e.y+8,w:32+e.extension*2,h:14}))hit(g,e.x+16);
   }else if(e.kind==='coil'){
     const phase=e.clock%4;e.state=phase<2?'charge':phase<2.65?'discharge':'recover';
     if(Math.hypot(dx,dy)<190&&Math.abs(dy)<90){p.vx+=Math.sign(-dx)*(e.state==='charge'?260:e.state==='discharge'?-620:0)*dt;if(e.state==='discharge'&&Math.abs(dx)<65)hit(g,e.x);}
   }else if(e.kind.startsWith('silicone')){
     patrol(e,dt,30);const other=g.level.enemies.find(a=>a.alive&&a!==e&&a.kind.startsWith('silicone')&&a.kind!==e.kind&&overlap(e,a));
     if(other){e.alive=other.alive=false;(g.level.sticky||=[]).push({x:e.x-12,y:e.baseY-90,w:58,h:118,life:12});}
   }else if(e.kind.startsWith('mouse')){
     if(e.kind==='mouse-dash'){const phase=e.clock%3.2;e.state=phase<.8?'charge':phase<1.7?'dash':'recover';if(e.state==='charge')e.dir=dx<0?-1:1;if(e.state==='dash')patrol(e,dt,330);}
     if(e.kind==='mouse-hop'){e.state='hop';e.y=e.baseY-Math.abs(Math.sin(e.clock*3.4))*85;patrol(e,dt,85);}
     if(e.kind==='mouse-erratic'){e.state=e.clock%2<.7?'charge':'dash';if(e.state==='dash'){e.dir=Math.sin(e.clock*2)>0?1:-1;patrol(e,dt,145);}}
     if(e.kind==='mouse-chase'){e.state='chase';e.dir=dx<0?-1:1;patrol(e,dt,115);}
   }else if(e.kind==='resistor'){
     if(e.state==='patrol'){patrol(e,dt);if(Math.abs(dx)<230&&Math.abs(dy)<65){e.state='charge';e.stateTime=0;e.dir=dx<0?-1:1;}}
     else if(e.state==='charge'&&e.stateTime>.65){e.state='dash';e.stateTime=0;}
     else if(e.state==='dash'){patrol(e,dt,245);if(e.stateTime>.58){e.state='recover';e.stateTime=0;}}
     else if(e.state==='recover'&&e.stateTime>1.1){e.state='patrol';e.stateTime=0;}
   }else if(e.kind==='capacitor'){
     const phase=e.clock%4.2;e.state=phase<1.5?'patrol':phase<2.5?'charge':phase<3.15?'discharge':'recover';
     if(e.state==='patrol')patrol(e,dt,24);
     if(e.state==='discharge'&&Math.hypot(p.x+p.w/2-(e.x+16),p.y+p.h/2-(e.y+14))<78)hit(g,e.x+16);
   }else if(e.kind==='chip'){
     if(g.level.defenceDisabled){e.state='recover';e.aim=null;continue;}
     const phase=e.clock%3.3;e.state=phase<1.8?'patrol':phase<2.55?'aim':'recover';
     if(e.state==='aim'&&!e.aim){const d=Math.max(1,Math.hypot(dx,dy));e.aim={x:dx/d,y:dy/d};}
     if(e.state==='recover'&&e.aim){g.projectiles.push({kind:'bolt',x:e.x+12,y:e.y+8,w:9,h:9,vx:e.aim.x*235,vy:e.aim.y*235,life:3.6});e.aim=null;g.events.push({type:'enemyShot',x:e.x,y:e.y});}
     if(e.state==='patrol')e.aim=null;
   }else if(e.kind==='beaker'){
     const phase=e.clock%3.1,oldPhase=(e.clock-dt)%3.1;
     e.y=e.baseY-(phase<1.2?Math.sin(phase/1.2*Math.PI)*105:0);e.state=phase<1.2?'hop':phase<1.55?'spill':'recover';
     if(phase<1.2)patrol(e,dt,65);
     if(oldPhase<1.2&&phase>=1.2){g.projectiles.push({kind:'acid',x:e.x-12,y:e.baseY+24,w:56,h:8,vx:0,vy:0,life:2.3});}
   }else if(e.kind==='diode'){
     if(e.state==='patrol'){patrol(e,dt,65);e.y=e.baseY-90+Math.sin(e.clock*2)*18;if(Math.abs(dx)<140&&dy>-10&&dy<240){e.state='aim';e.stateTime=0;e.targetY=Math.min(e.baseY+90,p.y+12);}}
     else if(e.state==='aim'&&e.stateTime>.75){e.state='dive';e.stateTime=0;}
     else if(e.state==='dive'){e.y+=330*dt;if(e.y>=e.targetY){e.state='return';e.stateTime=0;}}
     else if(e.state==='return'){e.y-=95*dt;if(e.y<=e.baseY-90){e.state='patrol';e.stateTime=0;}}
   }
 }
 if(frozen)return;
 for(const q of g.projectiles){q.life-=dt;const oldY=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;
   if(q.kind==='bolt'&&g.level.platforms.some(a=>a.h>=60&&overlap(q,a)))q.life=0;
   if(q.kind==='acid'&&g.level.relays.some(r=>r.mode==='titration'&&r.on))q.life=0;
   if(q.life>0&&overlap(p,q))hit(g,q.x);
 }
 g.projectiles=g.projectiles.filter(q=>q.life>0&&Math.abs(q.x-p.x)<1100&&Math.abs(q.y-p.y)<800);
}
