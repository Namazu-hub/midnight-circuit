import {expandPrinter} from './printer-expansion.mjs?v=4.5a';
// FDM-inspired fictional machine. Stage index and save identity remain unchanged.
export function redesignPrinter(L){
 const students=L.students;
 Object.assign(L,{printer:true,width:7000,minY:-100,killY:850,spawn:{x:90,y:470},platforms:[],enemies:[],chips:[],gears:[],drinks:[],winds:[],lasers:[],relays:[],signs:[],checkpoints:[],presses:[],gravityZones:[],portals:[],rails:[],route:[],rain:[],sticky:[],sections:[],students});
 const pad=(x,y,w=180,extra={})=>L.platforms.push({x,y,w,h:18,type:'platform',...extra});
 const floor=(x,w)=>L.platforms.push({x,y:510,w,h:220,type:'ground'});
 floor(0,2050);floor(2420,1020);floor(3850,3150);
 // Small tread segments form a playable sloping feed ramp.
 for(let i=0;i<11;i++)pad(500+i*20,470+i*4,22);
 // Recovery floors: a missed jump costs distance, never an unreachable pit.
 pad(2000,680,470);pad(3390,680,510);
 const decks=[[350,400],[550,290],[760,180],[1280,400],[1490,290],[1710,180],[2600,400],[2810,290],[3010,180],[3970,400],[4190,290],[4390,180],[4700,370]];
 decks.forEach(([x,y])=>pad(x,y));
 pad(960,300,220,{printerGate:'feed',type:'ghost'});
 pad(2060,460,340,{printerGate:'drive',type:'ghost'});
 pad(3450,430,180,{printerPrint:0,type:'printed'});pad(3630,350,180,{printerPrint:1,type:'printed'});
 pad(4580,300,240,{printerCool:true,type:'leaf'});
 pad(3340,300,70,{h:210,printerJam:true});
 pad(4860,410,170,{type:'moving',axis:'y',range:70,period:5});
 // Arena fits 1200 world pixels; paired paths reach every console.
 for(const [x,y] of [[5510,400],[5680,290],[5530,180],[6190,400],[6370,290],[6210,180]])pad(x,y,170,{arena:true});
 pad(5820,510,360,{arenaBed:true});
 L.relays=[['feed',950,480,'重量スイッチで材料供給'],['drive',1880,480,'ギアを装着して駆動'],['print',3100,150,'造形経路を切り替える'],['cool',4480,150,'冷却系を復旧']].map(([id,x,y,label])=>({id,x,y,label,on:false,mode:'printer',worldRepair:true,effectText:label+'：設備復旧！'}));
 L.printerControls=[
 {id:'weight',x:950,y:480,label:'重量プレート'},
 {id:'gear',x:1790,y:150,label:'欠落ギアを装着'}, {id:'drive',x:1880,y:480,label:'駆動レバー'},
 {id:'safety',x:2700,y:370,label:'暴走供給を遮断'}, {id:'print',x:3100,y:150,label:'造形先を切替'},
 {id:'fan1',x:4280,y:260,label:'吸気ファン'}, {id:'fan2',x:4480,y:150,label:'冷却ファン'}, {id:'cool',x:4790,y:340,label:'安全インターロック'},
 {id:'enter',x:5360,y:480,label:'隔壁を開けてボス戦へ'},
 {id:'supply',x:5610,y:150,label:'材料供給'}, {id:'path',x:5760,y:260,label:'拘束経路へ切替'},
 {id:'coolBoss',x:6290,y:150,label:'拘束フレームを冷却'}, {id:'stop',x:6450,y:260,label:'緊急停止'},
 {id:'medic',x:5480,y:480,label:'応急補修 HP+3（戦闘中1回）'}];
 L.printerParts=[{id:'weight',x:430,y:365,state:'loose'},{id:'gear',x:1570,y:255,state:'loose'}];
 for(const [i,x] of [0,1200,2500,3900,5400].entries()){L.sections.push({x,name:['A · FILAMENT','B · EXTRUDER','C · PRINT BED','D · COOLING','E · DRAGON-01'][i]});L.signs.push({x:x+190,y:100,text:L.sections.at(-1).name});}
 for(const [x,y] of [[100,510],[2460,510],[3910,510],[5230,510]])L.checkpoints.push({x,y});L.checkpoint=L.checkpoints[0];
 for(const [x,y] of [[830,145],[1780,145],[4470,145]])L.gears.push({x,y});
 for(const [x,y] of [[680,475],[2870,255],[4450,145],[5260,475]])L.drinks.push({x,y});
 for(const [x,y] of decks)for(let i=0;i<4;i++)L.chips.push({x:x+35+i*30,y:y-30});
 L.goal={x:6810,y:510};L.route=[{x:6800,y:510}];
 students.forEach((s,i)=>{s.x=i?3940:190;s.y=510;s.lines=s.lines.map(line=>line==='青く冷えた造形床に乗ろう。X でも固定できる。'?'ファンを2基起動して、安全インターロックを操作しよう。':line==='ノズルは黄色で予告、赤で加熱！'?'プリントヘッドが赤く光ったら、樹脂が落ちてくる！':line==='足場の表示で、冷却までの時間が分かるよ。'?'冷却を復旧すれば、ぐらつく造形足場が安定するよ。':line);});students[0].lines.push('ロールを右の重量プレートへ誘導！ 倒したら棚の重りを運ぼう。','Cか画面ボタンで装置操作。パルスは戦闘に使おう。');
 L.tip='ロールを重量プレートへ誘導。高所のギアを運び、C／操作で設備を復旧。最後はプリンターでドラゴンを拘束しよう。';L.mechanic='材料供給 → 押出 → 積層 → 冷却 → DRAGON-01';
 expandPrinter(L);
}
