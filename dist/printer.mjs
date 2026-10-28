import {startFabrication} from './fabrication.mjs?v=4.7a';
import {feelState} from './feel.mjs?v=4.6a';
import {initJourney,tickJourney,journeyAction,journeySolid} from './printer-journey.mjs?v=4.6a';
import {roomControl,cableControl,beginDoor} from './rooms.mjs?v=4.6a';
import {initDragon,updateDragon,dragonBoxes} from './dragon.mjs?v=4.6a';
import {setupPrinterFoes,movePrinterFoes,fightPrinterFoes,createPrinterFoe,attachPrinterSurface} from './printer-enemies.mjs?v=4.6a';
import {overlap,clamp} from './world.mjs?v=4.6a';
import {grant} from './research.mjs?v=4.6a';
export const PRINTER={arena:5400,end:6600,intro:9,bossHP:18,frameTime:6,spawnCap:3};
const near=(g,o,d=90)=>Math.hypot(g.player.x+14-o.x,g.player.y+20-o.y)<d;
const tell=(g,text)=>{g.printer.feedback=.65;};
const relay=(g,id)=>g.level.relays.find(r=>r.id===id);
export function setupPrinter(g){if(!g.level.printer)return;g.printer={carried:null,gear:false,safety:false,prints:[0,0],target:0,fans:[false,false],incident:false,seenIntro:false,bossPaid:false,bolts:[],foes:[foe('spool',620,462),foe('tangle',2250,625),foe('head',2950,110),foe('tangle',3520,625),foe('head',4630,100)],boss:newBoss(),patterns:[0,0,0],pattern:0,hintLevel:0,hintUntil:0,hintText:'',idle:0,factory:{clock:0,jobs:[],made:0},patternJobs:[{progress:0},{progress:0},{progress:0}]};setupPrinterFoes(g);initJourney(g);}
const foe=(kind,x,y)=>({kind,x,y,origin:x,alive:true,clock:0,v:0,w:kind==='spool'?48:40,h:kind==='spool'?48:40});
function newBoss(){const b={active:false,done:false,age:0,hp:18,phase:1,x:6000,y:510,clock:0,invul:0,attack:0,target:6000,feed:0,route:false,frame:0,cooled:false,medic:false,spawnClock:0,jobs:[],minions:[],warning:null};initDragon(b);return b;}
export function resetPrinter(g){const s=g.printer;if(!s)return;s.journey.cargo={x:10650,waiting:true};if(s.boss.done){g.respawn={x:5480,y:470};s.ending={active:false,complete:false,age:0};}if(s.carried){g.level.printerParts.find(p=>p.id===s.carried).state='loose';s.carried=null;}if(s.boss.active&&!s.boss.done){s.boss=newBoss();s.bolts=[];const bed=g.level.platforms.find(p=>p.arenaBed);Object.assign(bed,{type:'platform',baseY:510,y:510,range:0});g.respawn={x:5230,y:470};}}
export function printerSolid(g,p){const s=g.printer;const extra=journeySolid(g,p);if(extra!==null)return extra;if(p.printerEnemy)return !!s.foes.find(e=>e.id===p.printerEnemy)?.alive;if(p.printerPattern!==undefined)return s.patterns[p.printerPattern]>=1;if(p.printerJam)return s.incident&&!s.journey.runawaySolved;if(p.printerGate)return relay(g,p.printerGate).on;if(p.printerPrint!==undefined)return s.prints[p.printerPrint]>=1;if(p.printerCool)return relay(g,'cool').on;return null;}
export function printerControl(g){if(!g?.printer)return null;const s=g.printer,b=s.boss;const d=roomControl(g);if(d)return {...d,door:true};const cable=cableControl(g);if(cable)return {id:cable.id,label:'ケーブルにつかまる'};
 if(b.active&&b.age<PRINTER.intro)return s.seenIntro?{id:'skip',label:'登場演出をスキップ'}:null;
 return g.level.printerControls.filter(o=>b.active?['supply','path','coolBoss','stop','medic'].includes(o.id):!['supply','path','coolBoss','stop','medic'].includes(o.id)).filter(o=>near(g,o,85)).sort((a,b)=>Math.hypot(g.player.x+14-a.x,g.player.y+20-a.y)-Math.hypot(g.player.x+14-b.x,g.player.y+20-b.y))[0]||null;
}
export function printerObjective(g){return g?.printer&&g.time<g.printer.hintUntil?g.printer.hintText:'';}
export function requestPrinterHint(g){if(!g?.printer)return;const s=g.printer,b=s.boss;const key=b.active?'boss'+b.phase:!relay(g,'feed').on?'feed':!relay(g,'drive').on?'drive':!relay(g,'print').on?'print':'cool';if(s.hintKey!==key){s.hintKey=key;s.hintLevel=0;}const hints={feed:['このロール、何かに使えそうだ','床の重さマークに、ロールか棚の重りを'],drive:['空のソケットと同じ形を探そう','搬送ダクトの奥に交換ギアがある'],print:['切替レバーの絵と、床の輪郭を見よう','上部制御室で暴走を止め、橋を造形'],cool:['赤く揺れる床に、風を送れそうだ','冷却塔と保守室のファンを起動し、安全装置へ'],boss1:['頭の結晶が光った隙を狙おう','攻撃後の頭へパルス。上から踏んでも効く'],boss2:['天井の製造機にも弱点がある','左上の材料装置で、援護造形を停止できる'],boss3:['中央の床と、造形レバーがつながっている','拘束と冷却の後、階段からコアへジャンプ']};s.hintText=hints[key][Math.min(s.hintLevel++,1)];s.hintUntil=g.time+7;}
function clearNewPlatform(g,a){const p=g.player;if(overlap(p,a)){p.y=a.y-p.h;p.vy=0;p.onGround=true;p.jumps=0;p.standing=a.id;}}
function restore(g,id){const r=relay(g,id);if(r.on)return;r.on=true;r.repairRank=1;for(const a of g.level.platforms)if(a.printerGate===id||id==='cool'&&a.printerCool)clearNewPlatform(g,a);g.events.push({type:'repairComplete',x:r.x,y:r.y,text:'✓ SYSTEM ONLINE'});}
function operate(g,id){const s=g.printer,b=s.boss;if(journeyAction(g,id))return;
 if(id==='skip'){if(s.seenIntro)b.age=9;return;}
 if(id==='weight'&&s.carried==='weight'){g.level.printerParts[0].state='installed';s.carried=null;restore(g,'feed');}
 if(id==='gear'&&s.carried==='gear'){s.gear=true;g.level.printerParts[1].state='installed';s.carried=null;tell(g,'24歯ギア装着。下の駆動レバーで48歯ローラーへ動力を伝えよう。');}
 if(id==='drive'){if(s.gear&&relay(g,'feed').on){restore(g,'drive');}else tell(g,'材料供給と高所のギア装着が必要');}
 if(id==='safety'){s.safety=true;tell(g,'供給暴走を遮断！ 上層で造形位置を切り替えよう。');}
 if(id==='pattern'){s.pattern=(s.pattern+1)%3;s.printing=false;tell(g,'');}
 if(id==='printStart'){if(!s.safety){tell(g,'');return;}const job=s.patternJobs[s.pattern];job.progress=s.patterns[s.pattern];if(job.charged||startFabrication(g,{kind:['stairs','bridge','shield'][s.pattern],required:s.pattern===1,x:3180,y:150},job))s.printing=true;tell(g,'');}
 if(id==='fan1'||id==='fan2'){s.fans[id==='fan1'?0:1]=true;tell(g,'ファン起動！ 2基を起動したら安全インターロックへ');}
 if(id==='cool'){if(s.fans.every(Boolean))restore(g,'cool');else tell(g,'上層の吸気・冷却ファンを両方起動しよう');}
 if(id==='enter'){if(g.level.relays.some(r=>!r.on)){tell(g,'供給・押出・造形・冷却の復旧が必要');return;}b.active=true;g.respawn={x:5230,y:470};g.player.x=Math.max(5440,g.player.x);g.player.vx=0;g.events.push({type:'dragonIntro'});}
 if(id==='medic'&&!b.medic&&g.player.hp<6){b.medic=true;g.player.hp=Math.min(6,g.player.hp+3);tell(g,'応急補修完了。この戦闘では使用済み。');}
 if(id==='supply'){b.feed=45;tell(g,b.phase<3?'援護ノズルの材料供給を45秒停止！':'拘束用材料を装填。ドラゴンを中央へ誘導し経路を切替！');}
 if(id==='path'&&b.phase===3){if(b.feed<=0){tell(g,'先に左上層の材料供給を操作');return;}if(Math.abs(b.x-6000)>220){tell(g,'ドラゴンを中央の黄色い造形床へ誘導しよう');return;}b.route=true;tell(g,'拘束経路へ切替！ ドラゴンの周囲に積層開始');}
 if(id==='coolBoss'&&b.frame<1)tell(g,'先に中央の拘束フレームを造形しよう');
 if(id==='stop'&&!b.cooled)tell(g,'拘束フレームの造形と冷却を先に完了しよう');
 if(id==='coolBoss'&&b.frame>=1){b.cooled=true;tell(g,'拘束フレーム硬化！ 右中層の緊急停止スイッチへ');}
 if(id==='stop'&&b.cooled){b.beacon=4;g.events.push({type:'coreBeacon',x:b.x,y:390});}
}
export function tickPrinter(g,input,activated,dt,hit){const s=g.printer;if(!s)return;const p=g.player,b=s.boss;s.feedback=Math.max(0,(s.feedback||0)-dt);s.idle+=dt;const signature=JSON.stringify([s.carried,s.gear,s.safety,s.patterns.map(v=>Math.floor(v)),s.fans,g.level.relays.map(r=>r.on),b.phase,b.route,b.cooled,b.done]);if(signature!==s.signature){s.signature=signature;s.idle=0;s.hintLevel=0;}tickJourney(g,dt,hit);if(s.startBoss){s.startBoss=false;operate(g,'enter');}updateDragon(b,p,dt);
 if(!b.active){
  if(!s.carried){const part=g.level.printerParts.find(q=>q.state==='loose'&&near(g,q,32));if(part){s.carried=part.id;part.state='carried';tell(g,part.id==='gear'?'ギア回収！ 右上のソケットへ':'重り回収！ 右の重量プレートへ');}}

  if(s.printing){s.patterns[s.pattern]=Math.min(1,s.patterns[s.pattern]+dt/3);if(s.pattern===1){s.prints=[s.patterns[1],s.patterns[1]];if(s.patterns[1]>=1)restore(g,'print');}if(s.patterns[s.pattern]>=1){s.printing=false;for(const a of g.level.platforms)if(a.printerPattern===s.pattern||s.pattern===1&&a.printerPrint!==undefined)clearNewPlatform(g,a);}}
  for(const a of g.level.platforms)if(a.printerGate==='feed')a.belt=relay(g,'feed').on?90:0;else if(a.printerGate==='drive')a.belt=relay(g,'drive').on?65:0;
 }
 const factory=s.factory;
 if(g.rooms?.active==='C'&&s.incident&&!s.journey.runawaySolved&&!b.active){factory.clock+=dt;if(factory.clock>9&&factory.made<4&&factory.jobs.length<1&&s.foes.filter(e=>e.alive&&e.factory).length<2){factory.clock=0;factory.jobs.push({x:3230,y:462,progress:0});factory.made++;}
 for(const job of factory.jobs){job.progress+=dt/3;if(activated&&near(g,job,180)){job.cancelled=true;grant(g,10,'造形阻止',job.x,job.y);}else if(job.progress>=1){const e=createPrinterFoe('benchy',job.x,job.y,{id:'factory-'+factory.made,room:'C',factory:true});s.foes.push(e);attachPrinterSurface(g,e);}}factory.jobs=factory.jobs.filter(j=>!j.cancelled&&j.progress<1);
 }else if(s.journey.runawaySolved)factory.jobs=[];
 const ctl=printerControl(g);if(input.interact&&ctl&&!ctl.door)operate(g,ctl.id);if(s.weightSignal){if(s.foes.some(e=>e.kind==='spool'&&e.room==='A'&&e.parked))restore(g,'feed');s.weightSignal=0;}
 fightPrinterFoes(g,activated,hit);
 if(b.active){
  const bed=g.level.platforms.find(p=>p.arenaBed);if(b.phase===3&&!b.done){Object.assign(bed,{type:'moving',baseY:496,axis:'y',range:b.route?0:14,period:4});b.y=bed.y;}
  if(!b.done)p.x=clamp(p.x,5420,6560);b.age+=dt;b.beacon=Math.max(0,(b.beacon||0)-dt);b.feed=Math.max(0,b.feed-dt);b.invul=Math.max(0,b.invul-dt);
  if(b.age>=9&&!b.done){if(!b.awake){b.awake=true;g.events.push({type:'actionStep',x:b.x,y:490,text:'造形完了 · DRAGON-01 起動！'});}s.seenIntro=true;b.clock+=dt;const cycle=b.clock%4.2;b.attack=Math.floor(b.clock/4.2)%5;
   if(cycle<1){b.target=clamp(p.x,5600,6400);b.warning=['CHARGE','TAIL','SLAM','RESIN','WIND'][b.attack];}else b.warning=null;
   if(b.phase===3){b.centerLatch=Math.max(0,(b.centerLatch||0)-dt);if(Math.abs(b.x-6000)<100&&Math.abs(p.x-6000)<130){if(!b.centerLatch)tell(g,'中央重量プレート作動！ 12秒間固定。左中層の経路スイッチへ');b.centerLatch=12;}}
   if(!b.route&&!b.centerLatch){if(cycle>=1&&cycle<2.2){if(b.attack===0||b.attack===2)b.x+=clamp(b.target-(b.attack===2?b.face*230:0)-b.x,-320*dt,320*dt);if(b.attack===4)p.x=clamp(p.x+Math.sign(p.x-b.x)*dt*120,5420,6560);}
    else if(cycle>=2.2)b.x+=clamp(p.x-b.x,-65*dt,65*dt);b.x=clamp(b.x,5620,6380);
   }
   const boxes=dragonBoxes(b),head=boxes[0],body=boxes[5],tail=boxes.at(-1);b.vulnerable=cycle>=2.2||b.centerLatch>0;
   if(activated&&near(g,{x:b.x,y:400},260)){g.cooldown=Math.min(g.cooldown,1.2);g.pulse=Math.min(g.pulse,.6);}
   if(b.phase<3&&b.invul<=0&&(activated&&b.vulnerable&&near(g,{x:head.x+head.w/2,y:head.y+head.h/2},195)||p.vy>40&&p.oldBottom<=head.y+18&&overlap(p,head))){b.hp-=p.boost>0?2:1;b.invul=.7;g.cooldown=Math.min(g.cooldown,1.2);if(p.vy>40){p.vy=-570;p.jumps=1;}g.events.push({type:'stomp',x:b.x,y:320});if(b.hp<=12&&b.phase===1){b.phase=2;tell(g,'装甲破損！ 援護ノズルが敵を造形。左上で供給停止！');}if(b.hp<=6){b.hp=6;b.phase=3;tell(g,'コア防護！ 材料供給 → 中央へ誘導 → 拘束経路 → 冷却 → 緊急停止');}}
   const core=boxes[5],cx=core.x+core.w/2,cy=core.y+core.h/2;
   if(b.cooled&&!b.done&&(activated&&Math.hypot(p.x+14-cx,p.y+20-cy)<100&&p.y+20<cy+20||p.vy>40&&p.oldBottom<=core.y+20&&overlap(p,core))){
    b.done=true;b.hp=0;b.stoppedAge=0;b.finalHit=true;s.bolts=[];b.jobs=[];b.minions=[];g.shake=.45;feelState(g).stop=.12;
    if(!s.bossPaid){s.bossPaid=true;grant(g,250,'DRAGON-01 復旧助成',cx,cy);}g.events.push({type:'dragonDefeat',x:cx,y:cy},{type:'stomp',x:cx,y:cy});p.vy=-350;
   }
   if(cycle>=1&&cycle<2.2&&!b.cooled&&g.pulse<=0){if(boxes.slice(1,9).some(a=>overlap(p,a)))hit(g,b.x);if(b.attack===1&&boxes.slice(9).some(a=>overlap(p,a)))hit(g,tail.x);if(b.attack===2&&overlap(p,head))hit(g,head.x);if(b.attack===3&&!b.shot){b.shot=true;s.bolts.push({x:head.x+head.w/2,y:head.y+head.h/2,w:20,h:20,vx:Math.sign(p.x-b.x)*200,vy:110,life:4});}}else b.shot=false;
   if(b.phase===2){b.spawnClock+=dt;if(b.feed<=0&&b.spawnClock>5&&b.jobs.length+b.minions.filter(e=>e.alive).length<3){b.spawnClock=0;b.jobs.push({x:5700+(Math.floor(g.time)%3)*260,y:470,progress:0,kind:['benchy','mini','turret'][Math.floor(g.time)%3]});}
    for(const job of b.jobs){if(activated&&near(g,job,190)){job.cancelled=true;grant(g,10,'造形阻止',job.x,job.y);}else job.progress+=dt/3;if(job.progress>=1)b.minions.push(foe(job.kind,job.x,470));}b.jobs=b.jobs.filter(j=>!j.cancelled&&j.progress<1);
   }
   for(const e of b.minions){if(!e.alive)continue;e.clock+=dt;e.x+=Math.sign(p.x-e.x)*dt*(e.kind==='benchy'?100:35);if(e.kind==='turret'&&e.clock>3){e.clock=0;s.bolts.push({x:e.x,y:e.y,w:10,h:10,vx:Math.sign(p.x-e.x)*160,vy:0,life:3});}if(activated&&near(g,e,190)||p.vy>40&&p.oldBottom<=e.y+16&&overlap(p,e)){e.alive=false;grant(g,15,'造形敵撃破',e.x,e.y);}else if(overlap(p,e)&&g.pulse<=0)hit(g,e.x);}
   b.minions=b.minions.filter(e=>e.alive);
   if(b.route)b.frame=Math.min(1,b.frame+dt/6);
  }
 }
 for(const q of s.bolts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(g.pulse>0&&near(g,q,180))q.life=0;if(q.life>0&&(!q.room||q.room===g.rooms?.active)&&overlap(p,q))hit(g,q.x);}s.bolts=s.bolts.filter(q=>q.life>0);
}
