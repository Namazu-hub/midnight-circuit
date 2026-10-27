import {overlap,clamp} from './world.mjs?v=4.4b';
import {grant} from './research.mjs?v=4.4b';
export const PRINTER={arena:5400,end:6600,intro:9,bossHP:18,frameTime:6,spawnCap:3};
const near=(g,o,d=90)=>Math.hypot(g.player.x+14-o.x,g.player.y+20-o.y)<d;
const tell=(g,text)=>g.events.push({type:'repairStep',text});
const relay=(g,id)=>g.level.relays.find(r=>r.id===id);
export function setupPrinter(g){if(!g.level.printer)return;g.printer={carried:null,gear:false,safety:false,prints:[0,0],target:0,fans:[false,false],incident:false,seenIntro:false,bossPaid:false,bolts:[],foes:[foe('spool',620,462),foe('tangle',2250,625),foe('head',2950,110),foe('tangle',3520,625),foe('head',4630,100)],boss:newBoss()};}
const foe=(kind,x,y)=>({kind,x,y,origin:x,alive:true,clock:0,v:0,w:kind==='spool'?48:40,h:kind==='spool'?48:40});
function newBoss(){return {active:false,done:false,age:0,hp:18,phase:1,x:6000,y:510,clock:0,invul:0,attack:0,target:6000,feed:0,route:false,frame:0,cooled:false,medic:false,spawnClock:0,jobs:[],minions:[],warning:null};}
export function resetPrinter(g){const s=g.printer;if(!s)return;if(s.carried){g.level.printerParts.find(p=>p.id===s.carried).state='loose';s.carried=null;}if(s.boss.active&&!s.boss.done){s.boss=newBoss();s.bolts=[];const bed=g.level.platforms.find(p=>p.arenaBed);Object.assign(bed,{type:'platform',baseY:510,y:510,range:0});g.respawn={x:5230,y:470};}}
export function printerSolid(g,p){const s=g.printer;if(p.printerJam)return s.incident&&!s.safety;if(p.printerGate)return relay(g,p.printerGate).on;if(p.printerPrint!==undefined)return s.prints[p.printerPrint]>=1;if(p.printerCool)return relay(g,'cool').on||g.pulse>0;return null;}
export function printerControl(g){if(!g?.printer)return null;const s=g.printer,b=s.boss;
 if(b.active&&b.age<PRINTER.intro)return s.seenIntro?{id:'skip',label:'登場演出をスキップ'}:null;
 return g.level.printerControls.filter(o=>b.active?['supply','path','coolBoss','stop','medic'].includes(o.id):!['supply','path','coolBoss','stop','medic'].includes(o.id)).find(o=>near(g,o,85))||null;
}
export function printerObjective(g){if(!g?.printer)return '';const s=g.printer,b=s.boss;
 if(b.done)return 'SYSTEM RESTORED · 右の出口へ';
 if(b.active){if(b.age<9)return `DRAGON-01 積層造形 ${Math.floor(b.age/9*100)}%`;if(b.phase<3)return `DRAGON-01 ${b.hp}/18 · ${b.phase===1?'予兆を避け、頭を踏むか近くでパルス':'上層左で敵の製造を止められる'}`;
 return b.frame>=1?(b.cooled?'右中層の緊急停止スイッチへ':'右上層の冷却装置へ'):b.route?'拘束フレーム積層中 · 攻撃を避けよう':b.feed>0?'ドラゴンを中央へ誘導 → 左中層で造形経路切替':'左上層で材料供給 → 中央へ誘導 → 経路切替';}
 if(s.carried)return `${s.carried==='gear'?'ギア':'代替の重り'}運搬中 · 対応する装置でC／操作`;
 if(!relay(g,'feed').on)return 'A · ロールを右の重量プレートへ誘導（棚の重りでも可）';
 if(!relay(g,'drive').on)return s.gear?'B · 下層の駆動レバーを操作':'B · 高所のギアを回収し、右上層へ装着';
 if(!relay(g,'print').on)return s.safety?'C · 上層で造形先を2か所切替え、橋を積層':'C · 供給暴走！ 中層の安全スイッチへ';
 if(!relay(g,'cool').on)return 'D · 高所の2ファン → 中層の安全スイッチ';return 'E · 隔壁前で補給。C／操作でDRAGON-01戦へ';}
function restore(g,id){const r=relay(g,id);if(r.on)return;r.on=true;r.repairRank=1;g.events.push({type:'repairComplete',x:r.x,y:r.y,text:r.effectText});}
function operate(g,id){const s=g.printer,b=s.boss;
 if(id==='skip'){if(s.seenIntro)b.age=9;return;}
 if(id==='weight'&&s.carried==='weight'){g.level.printerParts[0].state='installed';s.carried=null;restore(g,'feed');}
 if(id==='gear'&&s.carried==='gear'){s.gear=true;g.level.printerParts[1].state='installed';s.carried=null;tell(g,'24歯ギア装着。下の駆動レバーで48歯ローラーへ動力を伝えよう。');}
 if(id==='drive'){if(s.gear&&relay(g,'feed').on){restore(g,'drive');}else tell(g,'材料供給と高所のギア装着が必要');}
 if(id==='safety'){s.safety=true;tell(g,'供給暴走を遮断！ 上層で造形位置を切り替えよう。');}
 if(id==='print'){if(!s.safety){tell(g,'先に中層の安全スイッチで供給暴走を止めよう');return;}s.target=s.prints[0]<1?0:1;tell(g,`ノズルを${s.target+1}番造形床へ移動。積層中！`);s.printing=true;}
 if(id==='fan1'||id==='fan2'){s.fans[id==='fan1'?0:1]=true;tell(g,'ファン起動！ 2基を起動したら安全インターロックへ');}
 if(id==='cool'){if(s.fans.every(Boolean))restore(g,'cool');else tell(g,'上層の吸気・冷却ファンを両方起動しよう');}
 if(id==='enter'){if(g.level.relays.some(r=>!r.on)){tell(g,'供給・押出・造形・冷却の復旧が必要');return;}b.active=true;g.respawn={x:5230,y:470};g.player.x=5440;g.player.vx=0;g.events.push({type:'dragonIntro'});}
 if(id==='medic'&&!b.medic&&g.player.hp<6){b.medic=true;g.player.hp=Math.min(6,g.player.hp+3);tell(g,'応急補修完了。この戦闘では使用済み。');}
 if(id==='supply'){b.feed=45;tell(g,b.phase<3?'援護ノズルの材料供給を45秒停止！':'拘束用材料を装填。ドラゴンを中央へ誘導し経路を切替！');}
 if(id==='path'&&b.phase===3){if(b.feed<=0){tell(g,'先に左上層の材料供給を操作');return;}if(Math.abs(b.x-6000)>220){tell(g,'ドラゴンを中央の黄色い造形床へ誘導しよう');return;}b.route=true;tell(g,'拘束経路へ切替！ ドラゴンの周囲に積層開始');}
 if(id==='coolBoss'&&b.frame<1)tell(g,'先に中央の拘束フレームを造形しよう');
 if(id==='stop'&&!b.cooled)tell(g,'拘束フレームの造形と冷却を先に完了しよう');
 if(id==='coolBoss'&&b.frame>=1){b.cooled=true;tell(g,'拘束フレーム硬化！ 右中層の緊急停止スイッチへ');}
 if(id==='stop'&&b.cooled&&!b.done){b.done=true;b.hp=0;s.bolts=[];b.jobs=[];b.minions=[];if(!s.bossPaid){s.bossPaid=true;grant(g,250,'DRAGON-01 復旧助成',b.x,b.y-180);}g.events.push({type:'repairComplete',x:b.x,y:b.y-180,text:'SYSTEM RESTORED · 隔壁開放。右の出口へ！'});}
}
export function tickPrinter(g,input,activated,dt,hit){const s=g.printer;if(!s)return;const p=g.player,b=s.boss;
 if(!b.active){
  if(!s.carried){const part=g.level.printerParts.find(q=>q.state==='loose'&&near(g,q,32));if(part){s.carried=part.id;part.state='carried';tell(g,part.id==='gear'?'ギア回収！ 右上のソケットへ':'重り回収！ 右の重量プレートへ');}}
  if(p.x>2500&&!s.incident){s.incident=true;tell(g,'警報：供給機構暴走！ 中層の安全スイッチで停止せよ');s.foes.push(foe('tangle',3120,470));}
  if(s.printing){s.prints[s.target]=Math.min(1,s.prints[s.target]+dt/3);if(s.prints.every(n=>n>=1))restore(g,'print');}
  for(const a of g.level.platforms)if(a.printerGate==='feed')a.belt=relay(g,'feed').on?90:0;else if(a.printerGate==='drive')a.belt=relay(g,'drive').on?65:0;
 }
 const ctl=printerControl(g);if(input.interact&&ctl)operate(g,ctl.id);
 for(const e of s.foes){if(!e.alive||b.active||Math.abs(e.x-p.x)>900)continue;e.clock+=dt;
  if(e.kind==='spool'){
   e.v=clamp(e.v+(Math.sign(p.x-e.x)*95+(e.x>500&&e.x<720?120:0))*dt,-240,240);e.y=e.x<720?462-Math.max(0,720-e.x)*.18:462;if(g.pulse<=0&&!e.parked)e.x=clamp(e.x+e.v*dt,410,1020);
   if(Math.abs(e.x+24-950)<42){restore(g,'feed');e.v=0;e.parked=true;}
  }
  if(e.kind==='head'){if(g.pulse<=0&&!s.safety)e.x=e.origin+Math.sin(e.clock*.9)*180;e.warning=e.clock%3>2.2;if(!s.safety&&Math.floor((e.clock-dt+.2)/3)!==Math.floor((e.clock+.2)/3))s.bolts.push({x:e.x+20,y:e.y+35,w:14,h:20,vx:0,vy:290,life:3});}
  if(e.kind==='tangle'){e.disabled=s.safety;e.h=e.disabled?16:35+Math.max(0,Math.sin(e.clock*2))*85;e.y=(e.origin<2500?665:510)-e.h;}
  if(e.kind==='head'&&s.safety)e.warning=false;
  if(activated&&near(g,{x:e.x+e.w/2,y:e.y+e.h/2},170)||p.vy>40&&p.oldBottom<=e.y+16&&overlap(p,e)){e.alive=false;grant(g,15,'造形トラブル除去',e.x,e.y);g.research.kills++;if(p.vy>40){p.vy=-440;p.jumps=1;}}
  else if(!e.disabled&&!e.parked&&overlap(p,e)&&g.pulse<=0)hit(g,e.x);
 }
 if(b.active){
  const bed=g.level.platforms.find(p=>p.arenaBed);if(b.phase===3&&!b.done){Object.assign(bed,{type:'moving',baseY:496,axis:'y',range:b.route?0:14,period:4});b.y=bed.y;}
  p.x=clamp(p.x,5420,b.done?6970:6560);b.age+=dt;b.feed=Math.max(0,b.feed-dt);b.invul=Math.max(0,b.invul-dt);
  if(b.age>=9&&!b.done){if(!b.awake){b.awake=true;g.events.push({type:'actionStep',x:b.x,y:490,text:'造形完了 · DRAGON-01 起動！'});}s.seenIntro=true;b.clock+=dt;const cycle=b.clock%4.2;b.attack=Math.floor(b.clock/4.2)%5;
   if(cycle<1){b.target=clamp(p.x,5600,6400);b.warning=['突進：上の足場へ','尻尾：ジャンプ！','頭部落下：赤い床から離れよう','高温樹脂：横へ回避','風圧：足場を確保'][b.attack];}else b.warning=null;
   if(b.phase===3){b.centerLatch=Math.max(0,(b.centerLatch||0)-dt);if(Math.abs(b.x-6000)<100&&Math.abs(p.x-6000)<130){if(!b.centerLatch)tell(g,'中央重量プレート作動！ 12秒間固定。左中層の経路スイッチへ');b.centerLatch=12;}}
   if(!b.route&&!b.centerLatch){if(cycle>=1&&cycle<2.2){if(b.attack===0||b.attack===2)b.x+=clamp(b.target-b.x,-320*dt,320*dt);if(b.attack===4)p.x=clamp(p.x+Math.sign(p.x-b.x)*dt*120,5420,6560);}
    else if(cycle>=2.2)b.x+=clamp(p.x-b.x,-65*dt,65*dt);b.x=clamp(b.x,5620,6380);
   }
   const body={x:b.x-80,y:b.y-160,w:160,h:160},head={x:b.x-155,y:b.y-200,w:100,h:55};
   if(activated&&near(g,{x:b.x,y:400},260)){g.cooldown=Math.min(g.cooldown,1.2);g.pulse=Math.min(g.pulse,.6);}
   if(b.phase<3&&b.invul<=0&&(activated&&near(g,{x:b.x,y:400},240)||p.vy>40&&p.oldBottom<=head.y+18&&overlap(p,head))){b.hp-=p.boost>0?2:1;b.invul=.7;g.cooldown=Math.min(g.cooldown,1.2);if(p.vy>40){p.vy=-570;p.jumps=1;}g.events.push({type:'stomp',x:b.x,y:320});if(b.hp<=12&&b.phase===1){b.phase=2;tell(g,'装甲破損！ 援護ノズルが敵を造形。左上で供給停止！');}if(b.hp<=6){b.hp=6;b.phase=3;tell(g,'コア防護！ 材料供給 → 中央へ誘導 → 拘束経路 → 冷却 → 緊急停止');}}
   if(cycle>=1&&cycle<2.2&&!b.cooled&&g.pulse<=0){if(overlap(p,body)&&g.pulse<=0)hit(g,b.x);if(b.attack===1&&overlap(p,{x:b.x-260,y:470,w:520,h:40}))hit(g,b.x);if(b.attack===2&&Math.abs(p.x-b.target)<70&&p.y>340)hit(g,b.x);if(b.attack===3&&!b.shot){b.shot=true;s.bolts.push({x:b.x-140,y:330,w:20,h:20,vx:Math.sign(p.x-b.x)*200,vy:110,life:4});}}else b.shot=false;
   if(b.phase===2){b.spawnClock+=dt;if(b.feed<=0&&b.spawnClock>5&&b.jobs.length+b.minions.filter(e=>e.alive).length<3){b.spawnClock=0;b.jobs.push({x:5700+(Math.floor(g.time)%3)*260,y:470,progress:0,kind:['mini','tangle','turret'][Math.floor(g.time)%3]});}
    for(const job of b.jobs){if(activated&&near(g,job,190)){job.cancelled=true;grant(g,10,'造形阻止',job.x,job.y);}else job.progress+=dt/3;if(job.progress>=1)b.minions.push(foe(job.kind,job.x,470));}b.jobs=b.jobs.filter(j=>!j.cancelled&&j.progress<1);
   }
   for(const e of b.minions){if(!e.alive)continue;e.clock+=dt;e.x+=Math.sign(p.x-e.x)*dt*(e.kind==='mini'?100:35);if(e.kind==='turret'&&e.clock>3){e.clock=0;s.bolts.push({x:e.x,y:e.y,w:10,h:10,vx:Math.sign(p.x-e.x)*160,vy:0,life:3});}if(activated&&near(g,e,190)||p.vy>40&&p.oldBottom<=e.y+16&&overlap(p,e)){e.alive=false;grant(g,15,'造形敵撃破',e.x,e.y);}else if(overlap(p,e)&&g.pulse<=0)hit(g,e.x);}
   b.minions=b.minions.filter(e=>e.alive);
   if(b.route)b.frame=Math.min(1,b.frame+dt/6);
  }
 }
 for(const q of s.bolts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(g.pulse>0&&near(g,q,180))q.life=0;if(q.life>0&&overlap(p,q))hit(g,q.x);}s.bolts=s.bolts.filter(q=>q.life>0);
}
