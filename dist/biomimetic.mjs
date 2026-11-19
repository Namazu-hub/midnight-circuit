import {installBioEnemies,drawBioSpecimen} from './bio-enemies.mjs?v=4.15.0';
import {installWireRuns,drawWireRun} from './bio-wire.mjs?v=4.15.0';
import {doorReady} from './rooms.mjs?v=4.14.0';
import {installSkeleton,drawSkeleton} from './wire-skeleton.mjs?v=4.15.0';
import {installWorkshop,drawWorkshop} from './bio-workshop.mjs?v=4.15.0';
import {installHandRigs,drawHandRigs} from './hand-machines.mjs?v=4.15.0';
// Original Stage 2 geometry: topology inspired by the supplied branching map,
// with no source artwork included in the game.
export function redesignBiomimetic(L){
 const dialogue=L.students.flatMap(s=>s.lines);
 Object.assign(L,{name:'人体模倣研究室',en:'BIOMIMETIC HAND LAB',location:'02 / BIOMIMETIC HAND LAB',tagline:'腱と関節をつなぎ、もう一度つかむ。',theme:'biomimetic',biomimetic:true,width:18000,minY:-1580,maxY:800,killY:1100,spawn:{x:90,y:470},mechanic:'腱ワイヤー・関節機構・把持',tip:'緑の二重丸で X／PULSE。谷底への落下は即死、復帰は科研費 ¥50。扉は C／ACTION。',platforms:[],enemies:[],chips:[],drinks:[],gears:[],winds:[],lasers:[],presses:[],gravityZones:[],portals:[],rain:[],sticky:[],signs:[],route:[],checkpoints:[],relays:[],sections:[]});
 const pad=(x,y,w=200,extra={})=>L.platforms.push({x,y,w,h:20,type:'platform',...extra});
 const floor=(x,y,w)=>L.platforms.push({x,y,w,h:y<0?20:100,type:y<0?'platform':'ground'});
 const route=(x,y)=>L.route.push({x,y,service:y!==510&&y!==-600});
 // Side rooms have separate physics bounds. Door pairs describe their vertical connections.
 L.rooms=[
  ['entry',0,2170,0,0,'#1e3543'],['spool',2200,3460,-750,0,'#392f49'],
  ['link',3500,5900,-945,0,'#253a4c'],['shaft',6000,7120,-940,0,'#373047'],
  ['grasp',7200,9900,-160,0,'#34424a'],['skeleton',10000,11300,-65,0,'#2c2b41'],
  ['extensor',11900,13400,-1580,0,'#31434e'],['palm',14000,15500,0,830,'#343246'],
  ['pinch',16300,17950,-1220,0,'#344653']
 ].map(([id,left,right,minY,maxY,ink])=>({id,left,right,minY,maxY,ink}));
 L.doors=[];
 const passage=(from,x,y,to,xx,yy,arrow,checks=[],backChecks=[])=>{
  const add=(room,x,y,to,toX,toY,arrow,checks)=>L.doors.push({id:room+'-'+to+'-'+x,room,x,y,to,toX,toY,arrow,checks,kind:'passage'});
  add(from,x,y,to,xx,yy,arrow,checks);add(to,xx,yy,from,x,y,({'→':'←','↑':'↓','↓':'↑'})[arrow],backChecks);
 };
 const lock=(path,label)=>[{path,label}];
 passage('entry',2030,510,'spool',2310,510,'→',lock('level.wireRuns.2.cleared','輪に乗り継いで最後に跳び出す'));
 passage('spool',3240,-255,'link',3590,-600,'→',lock('level.wireRuns.0.cleared','最後の輪でパルスを放ち、跳び出す'));
 passage('link',3820,-600,'extensor',12030,-1320,'↑');
 passage('link',4010,-600,'palm',14120,800,'↓');
 passage('palm',15360,800,'link',5420,-600,'↑',lock('level.handRigs.0.locked','指骨橋の張力を固定'));
 passage('link',5770,-600,'shaft',6075,-600,'→',lock('level.handRigs.0.locked','指骨橋の張力を固定'));
 passage('shaft',7010,360,'grasp',7300,510,'→',lock('level.wireRuns.1.cleared','最後の輪でパルスを放ち、跳び出す'));
 passage('grasp',7660,510,'pinch',16420,-930,'↑');
 passage('grasp',9740,510,'skeleton',10075,510,'→',lock('level.handRigs.1.delivered','三指ハンドで試験片を対岸へ'));
 floor(0,510,1020);floor(1510,510,660);floor(2200,510,420);pad(3040,-255,380);
 floor(3500,-600,900);
 L.relays.push({id:'bio-joints',x:4200,y:-630,mode:'tendon',worldRepair:true,effectText:'関節校正完了。右の巻取り台で腱を張ろう',label:'指関節の校正',on:false});
 pad(4400,-600,620,{type:'ghost',requiresRepair:true,group:'bio-joints',bioFinger:true});
 floor(5020,-600,880);floor(6000,-600,290);pad(6790,360,330);
 floor(7200,510,1000);
 L.relays.push({id:'bio-grasp',x:7960,y:480,mode:'tendon',worldRepair:true,label:'三指把持の校正',on:false,effectText:'把持の校正完了。右の三指ハンドで試験片を運ぼう'});
 pad(8190,509,164,{gripSpecimen:true});floor(8820,510,1080);floor(10000,510,1300);
 pad(10255,400,175);pad(10510,404,175);pad(10680,396,140);pad(10775,290,160);L.goal={x:11180,y:510};
 floor(11900,-1320,1500);floor(14000,800,490);floor(14990,800,510);floor(16300,-930,450);floor(17280,-930,670);
 for(const [x,y,w] of [[12220,-1420,180],[17330,-1035,185]])pad(x,y,w);
 L.gears=[{x:12300,y:-1462},{x:15060,y:758},{x:17410,y:-1076}];
 L.drinks=[{x:690,y:475},{x:5500,y:-635},{x:7400,y:475}];
 L.checkpoints=[{x:825,y:510},{x:16475,y:-930},{x:14185,y:800},{x:2360,y:510},{x:3650,y:-600},{x:6130,y:-600},{x:7360,y:510},{x:10135,y:510}];L.checkpoint=L.checkpoints[0];
 L.fallZones=[{room:'entry',x:0,y:675,w:2170,h:520},{room:'pinch',x:16300,y:-670,w:1650,h:600},{room:'grasp',x:7200,y:690,w:2700,h:600},{room:'spool',x:2200,y:660,w:1260,h:460},{room:'shaft',x:6000,y:560,w:1120,h:560},{room:'link',x:3500,y:-220,w:2400,h:1250}];
 for(const [x,y] of [[2030,510],[3240,-255],[3820,-600],[12520,-1320],[4340,-600],[5770,-600],[7010,360],[7660,510],[17080,-930],[8130,510],[9740,510],[11180,510]])route(x,y);
 L.vendorSites=[{x:250,y:510},{x:3650,y:-600},{x:7450,y:510}];
 for(let i=0;i<10;i++)L.chips.push({x:320+i*47,y:485});
 for(const a of L.platforms.filter(a=>a.w>=600))for(let x=a.x+100;x<a.x+a.w-60;x+=180)L.chips.push({x,y:a.y-45});
 const foe=(x,y,bone=false)=>L.enemies.push({x,y:y-28,baseY:y-28,w:32,h:28,min:x-65,max:x+65,speed:45,dir:1,alive:true,kind:bone?'mouse-hop':'resistor',bioShape:bone?'bone':'hand',clock:0,state:'patrol',stateTime:0});
 for(const [x,y] of [[580,510],[1650,510],[3900,-600],[5300,-600],[5700,-600],[7300,510],[9000,510],[9500,510],[12420,-1320],[12880,-1320],[14400,800],[15000,800],[16600,-930],[17400,-930]])foe(x,y,x%3===0);
 L.students=[{x:400,y:510,name:'人体模倣の研究生',color:'#c6b8f1',lines:['腱を引くと、指が曲がる。戻すには反対側のワイヤーも必要。',...dialogue.slice(0,3)]},{x:15200,y:800,name:'機構設計の研究生',color:'#8edbcc',lines:['関節を増やすだけでは、狙った姿勢にはならないんだ。',...dialogue.slice(3)]},{x:9060,y:510,name:'把持実験の研究生',color:'#e5b1bf',lines:['強く握るより、三つの接触点を安定させる。']}];
 for(const st of L.students)st.room=L.rooms.find(r=>st.x>=r.left&&st.x<r.right).id;
 installBioEnemies(L);installHandRigs(L);installWorkshop(L);installSkeleton(L);installWireRuns(L);
 for(const [x,y] of [[1230,310],[14710,530],[14800,385],[16990,-1120]])L.chips.push({x,y});
 for(let i=0;i<4;i++)L.chips.push({x:6650+i*12,y:-665+i*55});

}
export function drawBioLab(c,g,reduced){
 if(!g.level.biomimetic)return;
 c.save();
 const room=g.level.rooms.find(r=>r.id===g.rooms.active);
 const top=room.minY-30,bottom=Math.max(610,room.maxY+150),w=room.right-room.left;
 c.fillStyle=room.ink;c.fillRect(room.left,top,w,bottom-top);
 c.strokeStyle='#698193';c.lineWidth=4;c.strokeRect(room.left+10,top+12,w-20,bottom-top-24);
 for(let x=room.left+105;x<room.right;x+=245){
  c.strokeStyle='#69819355';c.lineWidth=3;c.beginPath();
  if(['link','palm','grasp','pinch'].includes(room.id)){
   const y=({link:-720,palm:640,grasp:340,pinch:-1080})[room.id];
   for(let j=0;j<3;j++){c.moveTo(x-42,y+74);c.lineTo(x+j*20,y-j*12);c.lineTo(x+54+j*15,y-18-j*9);}
  }else{c.moveTo(x,top+24);c.lineTo(x,bottom-40);c.moveTo(x+32,top+84);c.arc(x,top+84,32,0,Math.PI*2);}
  c.stroke();
 }
 for(const d of g.level.doors.filter(d=>d.room===room.id)){
  const open=g.rooms.transition?.door===d?Math.min(1,g.rooms.transition.time*3)*21:0,ready=doorReady(g,d);
  c.fillStyle='#111f2a';c.fillRect(d.x-37,d.y-96,74,96);
  c.strokeStyle=ready?'#94dcca':'#dca071';c.lineWidth=4;c.strokeRect(d.x-38,d.y-96,76,96);
  for(const dir of [-1,1]){c.fillStyle='#45596c';c.fillRect(d.x+(dir<0?-31:2)+dir*open,d.y-88,29,85);}
  c.fillStyle=ready?'#b5ffe1':'#ffbf80';c.font='bold 29px sans-serif';c.textAlign='center';c.fillText(ready?d.arrow:'×',d.x,d.y-48);
 }
 drawWireRun(c,g);
 for(const a of g.level.platforms.filter(a=>a.bioFinger)){
 const extension=g.level.handRigs[0].extension,on=extension===1;
 for(let j=0;j<3;j++){
  const drums=g.level.wireControls.filter(o=>o.relay===a.group);
  const curl=(1-extension)*(.74+j*.11-.09*drums[0].angle-.06*drums[1].angle),rootY=a.y+30+j*16;
  const jointX=a.x+a.w*.45*Math.cos(curl),jointY=rootY-a.w*.45*Math.sin(curl);
  const tipX=jointX+a.w*.55*Math.cos(curl*1.7),tipY=jointY-a.w*.55*Math.sin(curl*1.7);
  c.strokeStyle=on?'#a3e8d0':'#bd9cbd';c.lineWidth=14;c.beginPath();
  c.moveTo(a.x,rootY);c.lineTo(jointX,jointY);c.lineTo(tipX,tipY);c.stroke();
  for(const [x,y] of [[a.x,rootY],[jointX,jointY],[tipX,tipY]]){
   c.fillStyle='#dae5dc';c.beginPath();c.arc(x,y,16,0,Math.PI*2);c.fill();
   c.fillStyle='#34485b';c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill();
  }
  c.strokeStyle='#8ee4dc';c.lineWidth=2;c.beginPath();c.moveTo(a.x-65,a.y+100);c.lineTo(jointX,jointY);c.stroke();
 }
 c.fillStyle='#49647a';c.fillRect(a.x-85,a.y+15,75,100);c.fillStyle='#bad6d2';c.fillRect(a.x-65,a.y+35,35,40);
 }
 drawHandRigs(c,g);drawWorkshop(c,g);drawSkeleton(c,g,reduced);
 c.restore();
}
export function drawBioEnemy(c,e){
 if(!e.bioShape)return false;if(e.kind.startsWith('bio-')){drawBioSpecimen(c,e);return true;}c.save();c.translate(e.x,e.y);c.fillStyle=e.bioShape==='bone'?'#f2e6cc':'#dcb5c9';
 if(e.bioShape==='bone'){c.fillRect(5,10,23,8);for(const [x,y] of [[4,8],[4,20],[29,8],[29,20]]){c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill();}}
 else{c.fillRect(5,9,24,18);for(let i=0;i<4;i++)c.fillRect(5+i*6,i%2?0:3,5,15);c.fillRect(-1,14,9,7);c.fillStyle='#455168';c.fillRect(9,19,15,3);}
 c.restore();return true;
}
