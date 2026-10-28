import {redesignPrinter} from './printer-level.mjs?v=4.5.2a';
import {expandRooms} from './laboratory.mjs?v=4.5.2a';
// Level coordinates use world-space pixels, with negative Y extending upwards.
const meta=[
 ['机上の大冒険','THE WORKBENCH','bench','#75efce','回路スイッチ & 光の橋','小さな一歩が、道をつなぐ。','光る制御装置の近くで X。回路を直すと光の橋が残る。'],
 ['風の温室','THE GLASS GARDEN','garden','#c1ef82','縦の風洞 & 崩れる葉','風をつかんで、温室のてっぺんへ。','風の柱で上へ！ 葉の足場は乗ると崩れ、少し待つと再生する。'],
 ['深夜の搬送ライン','THE RAIL EXPRESS','ice','#94ccff','レール走行 & 台車ジャンプ','レールの向こうへ、相棒と一緒に。','SPACE で台車ごとジャンプ。← ブレーキ、→ 加速。切れ目の手前の矢印が目印。'],
 ['3Dプリンターの夢','INSIDE THE 3D PRINTER','printer','#ffae87','造形サイクル & 可動ノズル','まだない道が、目の前に生まれる。','青い造形床は冷却中だけ足場になる。X で造形床とノズルを一時停止。'],
 ['夜明けの時計塔','THE CLOCK ASCENT','tower','#c4a6ff','縦スクロール & 時計リフト','歯車の階段を、朝の高さへ。','左右に折り返しながら上へ。3つの時計装置を X で修理しよう。'],
 ['はんだの火花通り','SOLDER STREET','solder','#ffbe7c','コンベア & プレス機','流れる基板に、はんだの星。','床の矢印に注意。プレスの黄色い予告を見て待つか、X で止めよう。'],
 ['オシロスコープの波','OSCILLOSCOPE OCEAN','scope','#8bffd2','波の足場 & 低重力','波の山をつないで、信号の向こうへ。','青緑の領域では重力が軽い。波の足場は X で固定できる。'],
 ['光学ベンチの星空','THE OPTICAL CONSTELLATION','optics','#e2a9ff','レンズ転送 & 光路修復','最後の光路をつないで、朝を呼ぼう。','レンズの近くで X を押すと光で転送。3つの光路をつないで最終装置へ。']
];
const rooms=meta.map(([name,en,theme,color,mechanic,tagline,tip],i)=>({id:i+1,name,en,theme,color,mechanic,tagline,tip,location:`0${i+1} / ${en}`,width:8400,minY:-100,killY:800,spawn:{x:90,y:466},platforms:[],enemies:[],chips:[],gears:[],drinks:[],winds:[],lasers:[],relays:[],signs:[],students:[],checkpoints:[],presses:[],gravityZones:[],portals:[],rails:[],route:[],sections:[]}));
function floor(L,x,y,w,type='ground',extra={}){L.platforms.push({x,y,w,h:180,type,...extra});}
function pad(L,x,y,w=160,type='platform',extra={}){L.platforms.push({x,y,w,h:20,type,...extra});}
function route(L,x,y,extra={}){L.route.push({x,y,...extra});}
function chips(L,x,y,n=4,dx=38){for(let i=0;i<n;i++)L.chips.push({x:x+i*dx,y});}
function foe(L,x,y,kind='resistor',span=90){L.enemies.push({x,y:y-28,baseY:y-28,w:32,h:28,min:x-span,max:x+span,speed:48,dir:1,alive:true,kind,clock:0,state:'patrol',stateTime:0});}
function cp(L,x,y){L.checkpoints.push({x,y});}
function student(L,x,y,name,lines){L.students.push({x,y,name,lines,color:L.color});}
function finish(L,x,y){L.goal={x,y};route(L,x,y);L.checkpoint=L.checkpoints[0];}
function band(L,x,y,w,kinds=['resistor','beaker']){floor(L,x,y,w);chips(L,x+140,y-45);for(let i=0;i<kinds.length;i++)foe(L,x+300+i*240,y,kinds[i],65);}
// 01: two permanent circuit bridges, alternating low and high optional routes.
{
 const L=rooms[0];L.width=8400;
 [[0,980],[1140,990],[2340,900],[3480,1050],[4720,1200],[6150,800],[7150,1250]].forEach(([x,w],i)=>band(L,x,510,w,i===0?['resistor']:['resistor','beaker','chip'].slice(0,i%2+2)));
 pad(L,980,500,160,'ghost',{group:'a'});pad(L,4530,500,190,'ghost',{group:'b'});
 L.relays=[{id:'a',x:830,y:480,on:false},{id:'b',x:4430,y:480,on:false}];
 [[2140,455,170],[3260,455,160],[5960,450,140],[6960,455,170]].forEach(a=>pad(L,...a));
 [[480,400],[670,295],[2600,390],[2820,300],[3800,400],[4000,290],[7460,400],[7680,300]].forEach(a=>pad(L,...a));
 L.gears=[{x:745,y:250},{x:4080,y:245},{x:7760,y:255}];L.drinks=[{x:600,y:475},{x:3690,y:475},{x:6500,y:475}];
 cp(L,1260,510);cp(L,3660,510);cp(L,6270,510);
 [[500,510],[830,510],[1300,510],[2000,510],[2500,510],[3120,510],[3650,510],[4430,510],[4900,510],[5740,510],[6360,510],[6800,510],[7400,510]].forEach(a=>route(L,...a));
 student(L,190,510,'計測中の先輩',['頭上ライフは、ダメージの時だけ出るよ。','抵抗くんは「！」の後に突進するよ。']);student(L,5300,510,'卒論中の学生',['ICは狙いをつけてから弾を撃つ。','上から踏むか、パルスで止めよう。']);finish(L,8210,510);
}
// 02: wind-powered climb, followed by a high canopy instead of another floor loop.
{
 const L=rooms[1];L.width=7900;L.minY=-1050;
 band(L,0,510,1000,['resistor','beaker']);band(L,1170,510,1150,['capacitor','beaker','chip']);floor(L,2500,510,650);
 pad(L,1010,445,140,'leaf');pad(L,2340,440,140,'leaf');
 L.winds.push({x:2800,y:-850,w:310,h:1400});
 [[2800,300,180,'leaf'],[3090,80,210],[2800,-140,180,'leaf'],[3080,-360,220],[2840,-600,210,'leaf']].forEach(a=>pad(L,...a));
 band(L,3200,-650,1450,['beaker','diode','capacitor']);band(L,4820,-650,1150,['diode','chip']);band(L,6170,-650,1730,['beaker','capacitor','diode']);
 pad(L,4660,-705,140,'leaf');pad(L,6000,-720,150,'leaf');pad(L,1700,380,180,'leaf');pad(L,5260,-780,190,'leaf');pad(L,6980,-790,180,'leaf');
 L.gears=[{x:1780,y:335},{x:2900,y:-660},{x:7060,y:-835}];L.drinks=[{x:650,y:475},{x:3410,y:-685},{x:6430,y:-685}];
 cp(L,2570,510);cp(L,3320,-650);cp(L,6330,-650);
 [[600,510],[950,510],[1400,510],[2200,510],[2660,510],[2960,-760],[3400,-650],[4500,-650],[5000,-650],[5820,-650],[6450,-650],[7250,-650]].forEach(a=>route(L,...a));
 student(L,190,510,'植物ロボ班の学生',['葉っぱは踏むと揺れて、やがて崩れるよ。','風の柱では、左右で行き先を調整して。']);student(L,3660,-650,'温室当番',['上まで来たね。落ち着いて旗へ。','枯れた葉も、少し待てば再生するよ。']);finish(L,7700,-650);
}
// 03: rail segments have real slopes and physical gaps. Cart locomotion is explicit.
{
 const L=rooms[2];L.width=9600;L.minY=-160;L.cart=true;
 const paths=[[[0,535],[900,535],[1400,440],[1900,440]],[[2020,440],[2600,525],[3200,525]],[[3340,525],[4000,350],[4700,350]],[[4820,350],[5600,515],[6200,515]],[[6330,515],[6900,410],[7500,410]],[[7630,410],[8200,535],[9600,535]]];
 for(const path of paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];L.rails.push({x1:a[0],y1:a[1],x2:b[0],y2:b[1]});}
 const at=x=>{const r=L.rails.find(r=>x>=r.x1&&x<=r.x2);return r.y1+(r.y2-r.y1)*(x-r.x1)/(r.x2-r.x1)-42;};
 for(const x of [650,1550,2350,2870,3600,4190,4510,5100,5750,6580,7130,7860,8540,9060]){foe(L,x,at(x),x%3===0?'diode':'resistor',25);chips(L,x-100,at(x)-105,4);}
 L.gears=[{x:1830,y:at(1830)-125},{x:4620,y:at(4620)-130},{x:7420,y:at(7420)-125}];L.drinks=[{x:450,y:at(450)-20},{x:3000,y:at(3000)-20},{x:6800,y:at(6800)-20}];
 for(const x of [2150,4970,7790])cp(L,x,at(x));
 floor(L,0,570,550,'ice');floor(L,9150,570,450,'ice');
 student(L,380,570,'搬送実験の学生',['板と一緒にジャンプ！ レールの切れ目に注意。','左でゆっくり、右で速く。パルスも使えるよ。']);
 for(const r of L.rails){route(L,r.x2-40,r.y2-42);}
 L.spawn={x:160,y:at(160)-40};finish(L,9420,at(9420));
}
// 04: printing staircase ascends inside the chamber; each step telegraphs its cooling.
{
 const L=rooms[3];L.width=8300;L.minY=-650;
 band(L,0,510,1200,['resistor','chip']);band(L,1500,510,900,['capacitor','beaker']);
 pad(L,1220,460,240,'printed',{period:4.8,phase:0});floor(L,1170,640,380);
 for(let i=0;i<6;i++){const x=2410+i*210,y=400-i*120;pad(L,x,y,185,i%2?'platform':'printed',{period:4.8,phase:i*.7});route(L,x+92,y);chips(L,x+45,y-45,3);}
 band(L,3460,-200,1200,['chip','capacitor']);band(L,4890,-200,1100,['beaker','diode']);band(L,6230,-200,2070,['chip','beaker','capacitor']);
 pad(L,4680,-245,190,'printed',{period:4.8,phase:1.6});pad(L,6000,-245,200,'printed',{period:4.8,phase:3.2});
 for(const [x,y] of [[800,250],[1840,250],[4150,-460],[5550,-460],[7160,-460]])L.lasers.push({x,baseX:x,y,w:12,h:260,phase:x*.001,nozzle:true,range:65});
 pad(L,580,380,180);pad(L,3890,-330,180);pad(L,7430,-330,200);L.gears=[{x:660,y:335},{x:3970,y:-375},{x:7520,y:-375}];L.drinks=[{x:460,y:475},{x:3660,y:-235},{x:6490,y:-235}];
 cp(L,1630,510);cp(L,3600,-200);cp(L,6390,-200);
 L.route.unshift(...[[500,510],[1080,510],[1640,510],[2270,510]].map(([x,y])=>({x,y})));
 [[3660,-200],[4520,-200],[5100,-200],[5850,-200],[6480,-200],[7700,-200]].forEach(a=>route(L,...a));
 student(L,190,510,'造形待ちの学生',['青く冷えた造形床に乗ろう。X でも固定できる。','残り時間は3時間。さっきも3時間だった。']);student(L,6800,-200,'材料班の学生',['ノズルは黄色で予告、赤で加熱！','足場の表示で、冷却までの時間が分かるよ。']);finish(L,8100,-200);
}
// 05: switchback climb across the full vertical camera range.
{
 const L=rooms[4];L.width=2800;L.minY=-1500;floor(L,0,510,2000);
 const stairs=[[600,390],[850,270],[1100,150],[1350,30],[1600,-90],[1350,-210],[1100,-330],[850,-450],[600,-570],[850,-690],[1100,-810],[1350,-930],[1600,-1050]];
 stairs.forEach(([x,y],i)=>{pad(L,x,y,210);chips(L,x+50,y-45,3);route(L,x+105,y);if([2,4,7,11].includes(i))foe(L,x+100,y,['resistor','beaker','capacitor','chip'][i%4],38);});
 floor(L,1850,-1170,950);foe(L,2000,-1170,'diode',90);foe(L,2400,-1170,'capacitor',45);
 pad(L,390,180,145,'moving',{axis:'y',range:250,period:7});pad(L,1780,-530,150,'moving',{axis:'y',range:320,period:8});
 L.relays=[{x:460,y:480,on:false},{x:680,y:-600,on:false},{x:2260,y:-1200,on:false}];L.route.unshift({x:460,y:510});
 L.gears=[{x:980,y:225},{x:1450,y:-255},{x:1680,y:-1095}];L.drinks=[{x:300,y:475},{x:1440,y:-245},{x:1200,y:-845}];cp(L,300,510);cp(L,1450,-210);cp(L,1200,-810);
 student(L,190,510,'時計係の学生',['この塔は、上へ進むコースだよ。','時計リフトもパルスで止まる。降りる時に使って。']);student(L,1850,-1170,'夜を越えた学生',['いい景色でしょう。まだ研究室は続くよ。','最後の時計も修理してね。']);route(L,1970,-1170);route(L,2260,-1170);finish(L,2600,-1170);
}
// 06: conveyor direction and press timing replace the conventional staircase rhythm.
{
 const L=rooms[5];L.width=8700;
 const floors=[[0,1100,60],[1260,1100,-70],[2550,1100,100],[3810,1050,-95],[5040,1000,110],[6210,1150,65],[7530,1170,-70]];
 for(const [x,w,belt] of floors){floor(L,x,510,w,'conveyor',{belt});chips(L,x+150,465);foe(L,x+400,510,'resistor',80);foe(L,x+710,510,'chip',30);route(L,x+200,510);route(L,x+w-120,510);}
 for(const [x,y,w] of [[1115,450,125],[2380,440,150],[3665,450,120],[4875,440,140],[6060,450,130],[7380,445,130]])pad(L,x,y,w);
 for(const [x,phase] of [[870,0],[2200,.8],[3350,1.5],[4470,2.2],[5780,.6],[7040,1.8],[8030,2.7]])L.presses.push({x,y:170,w:86,h:35,floorY:510,phase,period:3.8});
 [[500,390],[2780,380],[3030,280],[5210,380],[5450,270],[7760,380]].forEach(a=>pad(L,...a));L.gears=[{x:580,y:345},{x:3100,y:235},{x:5520,y:225}];L.drinks=[{x:620,y:475},{x:4100,y:475},{x:6510,y:475}];cp(L,1430,510);cp(L,5200,510);cp(L,7680,510);
 student(L,190,510,'基板実装中の学生',['黄色い予告のあと、プレスが下りる。','コンベアに逆らうより、ジャンプで越えよう。']);student(L,5300,380,'休憩中の院生',['パルスなら、プレスも熱も止まるよ。','モンエナ中は着地点をよく見て！']);finish(L,8490,510);
}
// 07: low gravity creates a broad aerial arc; waves carry the landing platforms.
{
 const L=rooms[6];L.width=8000;L.minY=-650;band(L,0,510,1500,['beaker','capacitor','chip']);
 L.gravityZones=[{x:1550,y:-600,w:2200,h:1250,scale:.38,jumpScale:.78}];
 const wavePads=[[1550,440],[1870,330],[2200,170],[2530,0],[2860,-170],[3190,-250],[3520,-120],[3800,240]];
 wavePads.forEach(([x,y],i)=>{pad(L,x,y,230,'wave',{axis:'y',range:28,period:4,phase:i*.55});route(L,x+115,y);chips(L,x+65,y-45,3);if(i===2||i===6)foe(L,x+100,y-30,'diode',50);});
 band(L,4020,510,1050,['capacitor','beaker']);band(L,5300,510,1100,['diode','chip']);band(L,6600,510,1400,['capacitor','beaker','diode']);pad(L,5100,420,170,'wave',{axis:'y',range:50,period:4});pad(L,6420,420,160,'wave',{axis:'y',range:65,period:3.8});
 L.gears=[{x:2320,y:70},{x:3300,y:-345},{x:6490,y:300}];L.drinks=[{x:620,y:475},{x:4430,y:475},{x:6880,y:475}];cp(L,1320,510);cp(L,4170,510);cp(L,6740,510);
 L.route.unshift({x:600,y:510},{x:1350,y:510});[[4200,510],[4900,510],[5530,510],[6250,510],[6810,510],[7460,510]].forEach(a=>route(L,...a));
 student(L,190,510,'波形観測中の学生',['青緑の領域はふわふわ、跳びすぎ注意！','波の山を見て着地しよう。']);student(L,4550,510,'信号処理班の学生',['地上の重力に戻ったよ。','コンデンサの電気は、輪の外なら安全。']);finish(L,7790,510);
}
// 08: three explicit pulse-activated lens transfers between separate benches.
{
 const L=rooms[7];L.width=8300;L.minY=-1430;
 [[0,510,1800],[2200,-480,1700],[4400,-980,1600],[6300,-390,2000]].forEach(([x,y,w])=>{band(L,x,y,w,['resistor','diode','chip']);pad(L,x+850,y-110,190,'ghost');pad(L,x+1090,y-220,180,'ghost');});
 L.portals=[{x:1640,y:450,toX:2370,toY:-520,id:'lens-a',on:false},{x:3720,y:-540,toX:4570,toY:-1020,id:'lens-b',on:false},{x:5810,y:-1040,toX:6470,toY:-430,id:'lens-c',on:false}];
 L.relays=L.portals.map(p=>({id:p.id,x:p.x,y:p.y,on:false,portal:true}));
 L.gears=[{x:1170,y:245},{x:3370,y:-745},{x:5570,y:-1245}];L.drinks=[{x:650,y:475},{x:2800,y:-515},{x:6900,y:-425}];cp(L,2360,-480);cp(L,4560,-980);cp(L,6460,-390);
 L.portals.forEach(p=>{route(L,p.x-500,p.y+60);route(L,p.x,p.y+60,{portal:p.id});});route(L,6800,-390);route(L,7550,-390);
 student(L,190,510,'光路調整中の学生',['レンズのそばで X を押すと転送されるよ。','転送先が、そのままチェックポイントになる。']);student(L,2550,-480,'光学実験の学生',['位置が変わっても、光路はつながってる。','薄い足場はパルス中に渡ろう。']);finish(L,8100,-390);
}
for(const L of rooms){
 L.signs.push({x:L.spawn.x+260,y:L.spawn.y-150,text:L.mechanic});
 if(!L.checkpoint)L.checkpoint=L.checkpoints[0];
}
// Dialogue contributed by the player, distributed across the research rooms.
const studentQuotes=[['アノードカソード逆につけちゃった！','ネジの箱ひっくり返しちゃった'],['起きたら15時だったんだよね'],['俺って夜が1番集中できっからさ'],['AIが無くなったら研究どうしよう'],['大丈夫！レポート提出までのこり10時間もある！'],['ここからは魂のヤスリがけだ'],['なんでうちの大学はクリスマスも授業あるんだろう'],['酒を飲んで進捗出すぞ〜']];
rooms.forEach((L,i)=>studentQuotes[i].forEach((line,j)=>L.students[j%L.students.length].lines.unshift(line)));
expandRooms(rooms);
redesignPrinter(rooms[3]);
export const LEVELS=rooms;
