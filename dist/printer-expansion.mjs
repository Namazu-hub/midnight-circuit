import {extendJourney} from './printer-journey.mjs?v=4.9a';
// v4.5 extends the existing four repairs instead of replacing their state/rewards.
export const PRINTER_CHAT=[
'印刷時間が23時間…！？','フィラメントが途中で切れた…','ノズルにフィラメント詰まったらしい','1家に1台3Dプリンター','残り3時間って昨日も言ってなかった？','サポート材の方が本体より重いんだけど','1層目だけは完璧だったのに…','「これ、何に使うの？」「知らん、作りたかった」','印刷失敗したけど、なんか芸術的じゃない？','積層ピッチ0.1mmでやる必要あった？','ベンチーばっかり増えていく…','3Dプリンターで3Dプリンターの部品を作ってる','研究よりプリンターの修理に時間使ってる気がする','これで最後の再印刷にする！','先輩、あのドラゴン誰が設計したんですか？'];
export function expandPrinter(L){
 L.width=18600;L.rooms=[['A',0,1200,'フィラメント倉庫'],['B',1200,2500,'押出機構'],['C',2500,3900,'造形室'],['D',3900,5400,'冷却・保守室'],['E',5400,7000,'DRAGON-01'],['S',7200,9400,'試作品保管室'],['B2',9600,12400,'搬送ダクト'],['C2',12600,15600,'造形機・上部制御室'],['D2',15800,18600,'冷却塔']].map(([id,left,right,name])=>({id,left,right,name,minY:-180}));
 L.doors=[];const pair=(id,room,x,y,to,toX,toY,requires=[])=>{L.doors.push({id,room,x,y,to,toX,toY,requires,label:'扉を開く'});L.doors.push({id:id+'-back',room:to,x:toX,y:toY,to:room,toX:x,toY:y,label:'扉を開く'});};
 pair('ab','A',1130,510,'B',1260,510,['feed']);pair('bc','B',2440,510,'C',2560,510,['drive']);pair('cd','C',3820,510,'D',3970,510,['print']);
 pair('secret','A',830,180,'S',7290,510);pair('duct','B',1490,290,'B2',9690,510);pair('gallery','C',3010,180,'C2',12690,510);pair('tower','D',4480,180,'D2',15890,510);
 // Shortcuts return collected parts to their socket, without deleting the return door.
 pair('duct-exit','B2',12280,180,'B',1790,180);pair('gallery-exit','C2',15470,180,'C',2890,290);pair('tower-exit','D2',18460,180,'D',4790,370);
 L.doors.push({id:'arena',room:'D',x:5360,y:510,to:'E',toX:5470,toY:510,requires:['feed','drive','print','cool'],boss:true,label:'隔壁を開く'});
 L.doors=L.doors.filter(d=>!d.id.endsWith('-exit-back'));L.doors.find(d=>d.id==='tower-exit').lift=true;
 L.printerControls=L.printerControls.filter(c=>c.id!=='enter');
 const set=(id,x,y)=>Object.assign(L.printerControls.find(c=>c.id===id),{x,y});
 set('print',3100,150);set('safety',15150,150);set('fan2',18150,150);
 L.printerParts.find(p=>p.id==='gear').x=12050;L.printerParts.find(p=>p.id==='gear').y=145;
 const pad=(x,y,w=180,extra={})=>L.platforms.push({x,y,w,h:18,type:'platform',...extra});
 // Every annex has a combat floor and a supported high route with tangible rewards.
 for(const [start,end] of [[7200,9400],[9600,12400],[12600,15600],[15800,18600]]){
  pad(start,510,end-start,{h:220,type:'ground'});
  for(const [off,y,w] of [[220,400,180],[420,290,220],[650,180,250],[1040,300,240],[1320,190,240],[1640,80,220],[1920,180,220],[2160,290,220]])if(start+off+w<end){pad(start+off,y,w);for(let j=0;j<5;j++)L.chips.push({x:start+off+25+j*34,y:y-28});}
  L.checkpoints.push({x:start+100,y:510},{x:end-350,y:510});
  L.drinks.push({x:start+700,y:145});
 }
 pad(11880,180,460);pad(14980,180,550);pad(17980,180,550);
 pad(3780,510,120);
 // Distinct annex challenges: orbiting transfer disks, emergency bypass, cooling terraces.
 pad(10950,310,120,{type:'orbit',range:80,period:6,power:'drive'});
 pad(11280,330,140,{type:'orbit',range:70,period:5,power:'drive',phase:2});
 pad(13620,330,70,{h:180,printerJam:true});pad(14020,380,70,{h:130,printerJam:true});
 pad(17150,340,210,{printerCool:true});pad(17450,230,210,{printerCool:true});
 for(const x of [9900,10400,11450])pad(x,510,240,{type:'conveyor',belt:75,power:'drive'});

 // Optional branch, powered by the warehouse repair, with one persistent collection.
 L.gears[0]={x:9060,y:145};pad(8940,180,300);
 L.cables=[{id:'duct-cable',room:'B2',x1:10340,y1:145,x2:11560,y2:240},{id:'escape-cable',room:'C2',x1:13340,y1:145,x2:14540,y2:240}];
 pad(11380,310,260);pad(14380,310,260);
 pad(8280,300,210,{type:'moving',axis:'x',range:200,period:7,benchy:true,power:'feed'});
 pad(10600,340,220,{type:'moving',axis:'x',range:280,period:8,benchy:true,power:'feed'});
 pad(16760,380,220,{type:'moving',axis:'y',range:130,period:7,lift:true,power:'drive'});
 pad(14760,380,200,{type:'moving',axis:'y',range:130,period:5,lift:true,power:'drive'});
 // Pattern 0 stair / 1 bridge / 2 shield. Physics and art share each exact rectangle.
 pad(3330,400,110,{printerPattern:0});pad(3430,300,110,{printerPattern:0});pad(3530,200,180,{printerPattern:0});
 pad(3300,380,32,{h:130,printerPattern:2,shield:true});L.drinks.push({x:3620,y:165});L.chips.push({x:3650,y:165});
 L.printerControls.push({id:'pattern',x:3100,y:150,label:'造形レバー'}, {id:'printStart',x:3180,y:150,label:'造形開始'});
 // Original print control serves as the same physical selector for old integrations.
 L.printerControls=L.printerControls.filter(c=>c.id!=='print');
 L.sections=L.rooms.map(r=>({x:r.left,name:r.id+' · '+r.name}));L.signs=[];
 L.printerSpawns=[
 ['spool',620,462,'A'],['benchy',790,462,'A'],['cube',880,462,'A'],
 ['badBenchy',1980,462,'B'],['tree',2260,400,'B'],
 ['head',2800,110,'C'],['tangle',3290,470,'C'],['cube',3700,462,'C'],
 ['octopus',4130,260,'D'],['head',4630,100,'D'],['tree',4960,430,'D'],
 ['benchy',7800,462,'S'],['badBenchy',8650,462,'S'],
 ['cube',10130,462,'B2'],['benchy',10820,462,'B2'],['octopus',11300,250,'B2'],['spool',11700,462,'B2'],
 ['head',13250,100,'C2'],['tangle',13700,470,'C2'],['badBenchy',14100,462,'C2'],['tree',14850,430,'C2'],
 ['octopus',16500,250,'D2'],['cube',17050,462,'D2'],['badBenchy',17600,462,'D2'],['head',17930,100,'D2']
 ].map(([kind,x,y,room],i)=>({id:'print-foe-'+i,kind,x,y,room}));
 const old=L.students;L.students=[];
 const positions=[['A',200,510,'造形待ち',0,2,'feed'],['A',850,180,'材料交換中',2,4,'feed'],['B',1340,510,'ノズル修理中',4,6,'drive'],['B2',9800,510,'搬送係',6,8,'drive'],['C',2610,510,'造形担当',8,10,'print'],['C2',12830,510,'試作品の設計者',10,12,'print'],['D',4020,510,'保守担当',12,14,'cool'],['D2',16060,510,'サポート除去中',5,7,'cool'],['S',7360,510,'試作品収集家',7,11,'feed'],['D',5200,510,'前室の学生',14,15,'boss']];
 for(const [room,x,y,name,a,b,react] of positions)L.students.push({room,x,y,name,color:'#f4bd90',lines:PRINTER_CHAT.slice(a,b),react,after:['お、動いた！……あれ、誰が直した？','これで最後の再印刷にする！']});
 // Keep every previously requested joke; old instructional sentences stay in optional hints only.
 L.students[0].lines.push(...old[0].lines.filter(l=>!/(スイッチ|ファン|プレート|パルス|Cか)/.test(l)));
 extendJourney(L);
 L.tip='小さなPICOで、巨大なプリンターを直そう。装置・扉はC／操作。迷ったら「？」のヒント。';L.mechanic='11の部屋 · 材料チェイスと造形 · DRAGON-01';
}
