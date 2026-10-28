import {overlap,clamp} from './world.mjs?v=4.8a';
export const LAB_RULES={repairCooldown:.65,bossHP:6,bossImmunity:1.1,magnetCooldown:3,stickyDuration:12};
export function expandRooms(rooms){
 const kinds=[['spring','coil'],['mouse-hop','silicone-a','silicone-b'],[],['silicone-a','silicone-b','coil'],['spring','mouse-erratic'],['mouse-dash','coil'],['coil','mouse-chase'],['mouse-chase','spring']];
 rooms.forEach((L,i)=>{L.rain=[];L.sticky=[];if(L.cart)return;L.platforms.filter(p=>p.h>=60&&p.w>=900&&(i!==3||p.x>=3460)).slice(0,3).forEach(b=>{
 for(let k=0;k<4;k++){const x=b.x+260+k*145,y=b.y-110*(k+1);L.platforms.push({x,y,w:145,h:20,type:'platform'});L.chips.push({x:x+65,y:y-35});}L.minY=Math.min(L.minY,b.y-580);
 kinds[i].forEach((kind,k)=>{const x=b.x+500+k*110,y=b.y-28;L.enemies.push({x,y,baseY:y,w:32,h:28,min:x-75,max:Math.min(b.x+b.w-40,x+130),speed:50,dir:k%2?-1:1,alive:true,kind,clock:k*.4,state:'patrol',stateTime:0});});});});
 const add=(i,x,y,mode,label)=>rooms[i].relays.push({id:`service-${i}`,x,y,on:false,mode,label,step:0,amount:0});
 add(0,7970,480,'sequence','電源→信号→接地');add(1,7420,-680,'titration','冷却液の中和');add(3,7770,-230,'timing','ノズル位相調整');add(5,8150,480,'sequence','搬送制御盤');add(6,7480,480,'timing','波形同期');
 for(const i of [0,5]){const L=rooms[i],x=i===0?7150:7530;const r=L.relays.at(-1);r.x=x+760;r.y=40;L.route=L.route.filter(p=>p.x<x+200);for(let k=0;k<4;k++){L.route.push({x:x+330+k*145,y:510-110*(k+1),service:true});L.platforms.push({x:x+260+k*145,y:510-110*(k+1),w:145,h:20,type:'platform'});}L.route.push({x:r.x,y:70,service:true},{x:L.goal.x,y:L.goal.y});}
 rooms[1].tip+=' 終点の滴定装置でXを3回、pH7へ。';rooms[0].tip+=' 高所の制御盤はXを3回で順番接続。';rooms[3].tip+=' 終点の位相計は緑の帯でX。';rooms[6].tip+=' 緑の位相に合わせてXで同期。';rooms[5].tip='上からネジが降る！ 黄色い予告を避け、高所の制御盤を順番接続。';
 for(const [i,x,y] of [[0,5300,510],[5,2900,510],[5,6650,510]])rooms[i].rain.push({x,y,w:560,clock:0,phase:0});
 const L=rooms[2];L.branch={start:3340,end:6200};const middle=L.rails.filter(r=>r.x1>=3340&&r.x2<=6200);for(const r of L.rails)r.lane=1;for(const lane of [0,2])for(const r of middle){const shift=lane===0?-155:155;L.rails.push({...r,lane,y1:r.y1+(r.x1===3340?0:shift),y2:r.y2+(r.x2===6200?0:shift)});}
 for(const lane of [0,2])for(const x of [3800,4400,5300,5800]){const r=L.rails.find(r=>r.lane===lane&&x>=r.x1&&x<=r.x2),y=r.y1+(r.y2-r.y1)*(x-r.x1)/(r.x2-r.x1)-70;L.enemies.push({x,y,baseY:y,w:32,h:28,min:x,max:x,speed:0,dir:1,alive:true,kind:'mouse-dash',clock:0,state:'patrol',stateTime:0});L.chips.push({x:x-80,y:y-20});}
 L.tip='Q / E または画面の上段・下段で3段レールを選択。SPACEでジャンプ、台車で敵をはね飛ばせる！';
 L.signs.push({x:3450,y:200,text:'Q 上段 / E 下段 · 台車で敵を突破！'});
 const last=rooms[7];last.boss={x:7670,y:-446,w:46,h:56,homeX:7670,floor:-390,hp:LAB_RULES.bossHP,maxHP:LAB_RULES.bossHP,clock:0,invul:0,repaired:false,state:'idle'};last.bossConsole={x:7380,y:-420,cooldown:0};last.platforms.push({x:7290,y:-510,w:150,h:20,type:'platform'},{x:7820,y:-510,w:150,h:20,type:'platform'});last.tip+=' 暴走ロボは頭を踏むかXで磁力装置。停止後、近くでXで再起動。';
 last.students.at(-1).lines.push('暴走ロボは突進後が隙！ 頭を踏むか、磁力装置の近くでX。','停止したら近くでX。壊すんじゃなくて直すんだ！');
 rooms[0].students[0].lines.push('完璧なコードを書けばデバックはいらない！');rooms[4].students[0].lines.push('見ろ！これが俺のカルノー図だ！');rooms[6].students[0].lines.push('今から深夜徒歩しません？');
}
export function repairPhase(g,r){return (g.time*.42+(r.x%7)*.1)%1;}
export function tickLab(g,input,activated,dt,hit){
 const L=g.level,p=g.player;
 for(const r of L.relays){if(!r.mode||r.on||r.puzzleType)continue;if(activated&&Math.hypot(p.x+14-r.x,p.y+20-r.y)<110){if(r.mode==='sequence'){r.step++;r.on=r.step>=3;}if(r.mode==='titration'){r.amount=clamp((r.amount||0)+2,0,6);r.on=r.amount===6;}if(r.mode==='timing')r.on=repairPhase(g,r)>=.35&&repairPhase(g,r)<=.7;g.cooldown=LAB_RULES.repairCooldown;if(r.on){p.hp=Math.min(6,p.hp+1);g.respawn={x:p.x,y:p.y};g.checkpoint=true;}g.events.push({type:r.on?'relay':'repairStep',x:r.x,y:r.y,text:r.mode==='timing'?'緑の帯でX！':r.mode==='titration'?`pH ${1+r.amount} → 目標7`:`接続 ${r.step}/3`});}}
 for(const z of L.rain||[]){if(Math.abs(p.x-(z.x+z.w/2))>800)continue;const old=z.clock;z.clock+=dt;z.phase=z.clock%2.6;if(Math.floor(old/2.6)!==Math.floor(z.clock/2.6)&&g.pulse<=0)for(let j=0;j<4;j++)g.projectiles.push({kind:'screw',x:z.x+50+j*135,y:z.y-520,w:12,h:22,vx:0,vy:340,life:1.6});}
 for(const wall of L.sticky||[]){wall.life-=dt;if(g.pulse>0&&Math.abs(p.x-wall.x)<200)wall.life=0;if(wall.life>0&&overlap(p,wall)){p.vx*=.15;p.x=p.x+14<wall.x+wall.w/2?wall.x-p.w:wall.x+wall.w;}}L.sticky=(L.sticky||[]).filter(w=>w.life>0);
 const b=L.boss;if(!b||b.repaired)return;b.invul=Math.max(0,b.invul-dt);const ctl=L.bossConsole;ctl.cooldown=Math.max(0,ctl.cooldown-dt);if(p.x<7100)return;
 b.clock+=dt;const phase=b.clock%6.5;b.state=b.hp<=0?'disabled':phase<1?'charge':phase<2.4?'rush':'recover';if(b.state==='charge')b.dir=p.x>b.x?1:-1;if(b.state==='rush')b.x=clamp(b.x+(b.dir||-1)*300*dt,7240,7950);
 const strike=()=>{if(b.invul>0||b.hp<=0)return;b.hp--;b.invul=LAB_RULES.bossImmunity;g.shake=.2;g.events.push({type:'stomp',x:b.x+23,y:b.y});};
 if(b.hp>0&&overlap(p,b)){if(p.vy>30&&p.oldBottom<=b.y+16&&b.state!=='rush'){strike();p.vy=-570;p.jumps=1;}else hit(g,b.x+23);}
 if(activated&&Math.hypot(p.x+14-ctl.x,p.y+20-ctl.y)<150&&ctl.cooldown<=0&&b.hp>0){strike();ctl.cooldown=LAB_RULES.magnetCooldown;g.cooldown=.7;g.events.push({type:'repairStep',text:'磁力ブレーキ！ 暴走を抑制'});}
 if(b.hp<=0&&activated&&Math.hypot(p.x+14-b.x,p.y+20-b.y)<130){b.repaired=true;g.events.push({type:'relay',x:b.x,y:b.y});}
}
export function drawLab(c,g){const L=g.level;c.save();c.textAlign='center';
 for(const r of L.relays){if(!r.mode||Math.abs(r.x-g.player.x)>550)continue;c.fillStyle='#102334';c.fillRect(r.x-105,r.y-115,210,68);c.font='12px sans-serif';c.fillStyle=r.on?'#82ffd1':'#fff0bd';c.fillText(r.on?'✓ 修理完了':r.label,r.x,r.y-96);
 if(r.puzzleType){c.fillStyle='#bddce2';c.fillText(r.on?r.repairResult:r.optional?'C または「修理」で調整':'X または「修理」で調整',r.x,r.y-70);continue;}
 if(r.mode==='titration'){
  c.strokeStyle='#c8e6f6';c.lineWidth=3;c.strokeRect(r.x+35,r.y-40,47,62);c.fillStyle=r.on?'#81e9bb':'#f4a8c9';c.fillRect(r.x+38,r.y-5-(r.amount||0)*3,41,24+(r.amount||0)*3);c.strokeRect(r.x+52,r.y-155,9,98);c.fillStyle='#91caff';c.fillRect(r.x+54,r.y-150,5,52-(r.amount||0)*5);c.fillRect(r.x+48,r.y-60,18,4);c.beginPath();c.arc(r.x+57,r.y-45+(g.time*35%30),3,0,Math.PI*2);c.fill();
 }
 if(r.mode==='sequence'){for(let i=0;i<3;i++){c.fillStyle=i<(r.step||0)?'#80ffca':'#546579';c.fillRect(r.x-45+i*34,r.y+38,25,8);c.font='9px sans-serif';c.fillText(['電源','信号','接地'][i],r.x-32+i*34,r.y+59);}}
 if(r.mode==='timing'&&!r.on){c.fillStyle='#344659';c.fillRect(r.x-80,r.y-80,160,10);c.fillStyle='#72d8ac';c.fillRect(r.x-24,r.y-80,56,10);c.fillStyle='white';c.fillRect(r.x-80+160*repairPhase(g,r),r.y-84,3,18);}else c.fillText(r.mode==='titration'?`pH ${1+(r.amount||0)} / 7 · Xで一滴`:`${r.step||0}/3 · Xで順番に接続`,r.x,r.y-70);}
 for(const z of L.rain||[])if(z.phase>1.7){c.strokeStyle='#ffcf77';c.setLineDash([5,8]);for(let i=0;i<4;i++){const x=z.x+56+i*135;c.beginPath();c.moveTo(x,z.y-500);c.lineTo(x,z.y);c.stroke();}c.setLineDash([]);c.fillStyle='#ffcf77';c.font='16px sans-serif';c.fillText('⚠ ネジ落下！',z.x+z.w/2,z.y-260);}
 for(const w of L.sticky||[]){c.fillStyle='#db9fea99';c.fillRect(w.x,w.y,w.w,w.h);c.strokeStyle='#ffe1fd';c.strokeRect(w.x,w.y,w.w,w.h);c.fillStyle='white';c.font='12px sans-serif';c.fillText('粘着壁 · Xで除去',w.x+w.w/2,w.y-12);}
 const b=L.boss;if(b){
 if(L.bossConsole.cooldown>2.4){c.strokeStyle='#9af6ff';c.lineWidth=6;c.beginPath();c.moveTo(L.bossConsole.x,L.bossConsole.y-20);c.lineTo(b.x+23,b.y-130);c.lineTo(b.x+23,b.y);c.stroke();}
 const ctl=L.bossConsole;c.fillStyle=ctl.cooldown>0?'#666b8f':'#91faff';c.fillRect(ctl.x-28,ctl.y-25,56,55);c.fillStyle='#112738';c.font='12px sans-serif';c.fillText('X 磁力',ctl.x,ctl.y+6);c.fillStyle=b.repaired?'#8af0bf':b.invul>0?'#fff2c6':'#cf7f91';c.fillRect(b.x,b.y,b.w,b.h);c.fillStyle='#1b2c43';c.fillRect(b.x+6,b.y+8,34,17);c.fillStyle=b.repaired?'#81ffcd':'#ffcb7e';c.fillRect(b.x+10,b.y+12,8,5);c.fillRect(b.x+28,b.y+12,8,5);c.fillStyle='#a3b8c9';c.fillRect(b.x-7,b.y+27,9,20);c.fillRect(b.x+44,b.y+27,9,20);c.fillStyle='#132134';c.fillRect(b.x-63,b.y-65,172,42);c.font='12px sans-serif';c.fillStyle='#fff0cd';c.fillText(b.repaired?'修理完了！ おかえり':b.hp<=0?'停止 · 近くでXで再起動':b.state==='charge'?'！ 突進予告':b.state==='rush'?'突進中！':'隙あり · 頭を踏もう',b.x+23,b.y-48);c.fillStyle='#ffb28b';c.fillRect(b.x-55,b.y-36,156*b.hp/6,5);}c.restore();}
