// Stage 06: production creates the terrain; no player fabrication menu.
export const PCB_ROOMS=[['A','停止したライン'],['B','ペースト印刷'],['C','部品実装'],['D','部品供給・電磁石'],['E','リフロー炉'],['F','外観検査 AOI'],['G','出荷ヤード'],['H','夜明けの研究室']];
export function redesignPCB(L){
 const old=L.students.flatMap(s=>s.lines);
 Object.assign(L,{pcb:true,width:16000,minY:-100,killY:740,spawn:{x:90,y:470},platforms:[],enemies:[],chips:[],gears:[],drinks:[],winds:[],lasers:[],relays:[],signs:[],checkpoints:[],presses:[],gravityZones:[],portals:[],rails:[],route:[],rain:[],sticky:[],sections:[],students:[],cables:[],doors:[],tethers:[]});
 L.rooms=PCB_ROOMS.map(([id,name],i)=>({id,name,left:i*2000,right:(i+1)*2000,minY:-100,maxY:100}));
 const pad=(x,y,w,h=18,extra={})=>{const a={x,y,w,h,type:'platform',...extra};L.platforms.push(a);return a;};
 for(const [i,r] of L.rooms.entries()){
  const x=r.left;if(r.id==='C'){pad(x,510,420,200);pad(x+1350,510,650,200);}else if(r.id==='E'){pad(x,510,750,200);pad(x+1350,510,650,200);}else pad(x,510,2000,200);
  L.checkpoints.push({x:x+100,y:510});L.sections.push({x,name:r.name});
  if(i<7){const require=['power','paste','placement','magnet','reflow','aoi','restored'][i];L.relays.push({id:require,label:r.name,on:false,mode:'pcb',worldRepair:true,x:x+1500,y:480});L.doors.push({id:'pcb-'+r.id,room:r.id,x:x+1900,y:510,to:L.rooms[i+1].id,toX:x+2090,toY:510,requires:[require],label:'次の工程へ'});if(i<6)L.doors.push({id:'pcb-'+r.id+'-back',room:L.rooms[i+1].id,x:x+2090,y:510,to:r.id,toX:x+1900,toY:510,label:'前の工程へ'});}
  for(const [off,y] of [[420,400],[630,290],[1520,400]])if(!['C','E'].includes(r.id))pad(x+off,y,180);
  for(let k=0;k<6;k++)L.chips.push({x:x+440+k*26,y:365});
 }
 L.rooms.push({id:'S',name:'不良品保管庫',left:16000,right:17600,minY:0,maxY:0});L.width=17600;pad(16000,510,1600,200);L.doors.push({id:'pcb-reject',room:'F',x:11740,y:510,to:'S',toX:16090,toY:510,requires:['aoi'],checks:[{id:'ng',label:'NG 搬送を選択',path:'pcb.aoiMode'}],label:'不良品ラインへ'},{id:'pcb-reject-back',room:'S',x:16090,y:510,to:'F',toX:11740,toY:510,label:'検査ラインへ戻る'});L.doors.find(d=>d.id==='pcb-F').checks=[{id:'ok',label:'OK 出荷ラインを選択',path:'pcb.aoiMode',equals:false}];L.chips.push(...Array.from({length:12},(_,i)=>({x:16300+i*35,y:475})));L.pcbControls=[['rework',16350,480,'再検査・OKへ'],['recall-power',1080,480,'電源ユニット再供給'],['stencil',2500,480,'ステンシル位置'],['fiducial',4320,480,'基準マークを移動'],['belt',6380,480,'正転・停止・逆転'],['jumper',6510,480,'ジャンパ線を持つ'],['jumper-socket',6980,480,'断線パッドへ接続'],['resupply',6280,480,'部品の再供給'],['polarity',7480,480,'磁極 N/S'],['exhaust',8240,480,'吸煙ダクト'],['magnet',7190,480,'電磁石 ON/OFF'],['cool',8500,370,'冷却ファン'],['aoi-mode',10440,480,'OK/NG 搬送先'],['aoi-recall',11210,480,'検査キャリアを呼び戻す'],['ground',10900,480,'アース端子'],['boss-belt',12400,480,'搬送方向'],['boss-fiducial',12560,480,'基準マーク・照準をずらす'],['boss-magnet',12700,260,'電磁石'],['boss-cool',13350,260,'局所冷却'],['boss-aoi',13540,150,'AOI照準'],['feeder',13050,480,'フィーダーを停止']].map(([id,x,y,label])=>({id,x,y,label}));
 L.tethers.push({id:'jumper',socket:'jumper-socket',room:'D',x:6510,y:480,toX:6980,toY:480,length:580});
 pad(400,462,450,18,{type:'conveyor',belt:0,pcbBelt:true});
 pad(2650,300,550,18,{pcbManaged:true,pcbRole:'stencil'});pad(3330,400,300);
 for(const [i,x,y,w] of [[0,4420,450,520],[1,5000,340,420]])pad(x,y,w,22,{pcbManaged:true,pcbRole:'board',boardIndex:i});
 for(let i=0;i<3;i++)pad(4500+i*120,400-i*45,95,30,{pcbManaged:true,pcbRole:'component',slot:i});
 pad(7300,400,220,20,{pcbManaged:true,pcbRole:'magnet-frame'});
 pad(8800,510,540,20,{pcbManaged:true,pcbRole:'solder'});pad(8410,410,220);
 pad(11120,510,190,20,{pcbManaged:true,pcbRole:'aoi-lift'});pad(11300,220,350);pad(11670,350,160);
 for(const [x,y,w] of [[12380,400,180],[12600,290,180],[13280,290,180],[13440,180,250]])pad(x,y,w);
 for(let i=0;i<4;i++)pad(12800+i*120,420-i*65,150,20,{pcbManaged:true,pcbRole:'boss-component',slot:i});
 L.presses.push({x:1680,y:100,w:80,h:100,floorY:510,clock:0,phase:0});L.rain.push({x:1650,y:510,w:200,clock:0,phase:0});
 L.vendorSites=[{x:300,y:510},{x:12210,y:510}];
 L.drinks=[{x:680,y:250},{x:7450,y:370},{x:12080,y:475}];L.gears=[{x:3550,y:365},{x:11530,y:180},{x:14320,y:475}];L.goal={x:15880,y:510};L.route=[{x:15880,y:510}];L.checkpoint=L.checkpoints[0];
 const quotes=[['基板がまだできてないんだけど','まだ3時だから大丈夫！','明日じゃなくて今日な','電源入らない……',...old],['部品が一個余ったんだよね','何が余ったの？','マイコン','ブリッジしてる……吸い取り線どこ？'],['0402って人の手で付けるサイズじゃないでしょ','シルク印刷、左右逆だった','量産って、1枚目が一番緊張するよね'],['部品が足りないのに、基板だけ100枚届いた','基板、届くの来週だって','こて先、また酸化してる'],['フラックスの匂いで目が覚めた','明日の俺が何とかする','もう明日の俺だよ'],['テスターで当てたら全部導通してるんだけど','基板のREV.8が最新って何？','REV.7までは全部試作だから'],['発注してから間違いに気付くの、なんなんだろう'],['おっ、基板できてる！','マジ？ さっきまで止まってたのに','なんか自動で復旧したっぽい','発注した基板、なんか全部実装済みで届いてるんだけど','サービス良すぎない？'],['不良品にも、まだ使える部品はあるんだよ','REV.7までは全部試作だから']];
 for(const [i,r] of L.rooms.entries())L.students.push({x:r.id==='G'?12025:r.left+210,y:510,room:r.id,react:['power','paste','placement','magnet','reflow','aoi','restored','restored',null][i],name:i===7?'デモ担当の学生':'実装班の学生',color:'#f4bd90',lines:quotes[i],after:i===0?['……あれ、勝手に動いてない？','自動復旧機能なんて付けたっけ？']:quotes[i]});
 for(let i=0;i<7;i++)L.chips.push({x:9830+i*14,y:345});pad(9820,380,140);
 const gateLabels={power:'電源接続完了',paste:'ペースト印刷完了',placement:'部品実装完了',magnet:'ジャンパ線・搬送復旧',reflow:'冷却・はんだ硬化',aoi:'AOI検査完了',restored:'侵食コアを停止'};const gateHints={power:'電源ユニットをソケットへ',paste:'ステンシルを切り替えて印刷機の先へ',placement:'基板に乗り、ノズルの実装を待とう',magnet:'ジャンパ線と電磁石を確認',reflow:'上層の冷却ファンを操作',aoi:'検査床でしばらく静止',restored:'制御部のコアを停止'};for(const d of L.doors){d.gateLabels=gateLabels;d.gateHints=gateHints;}
 L.tip='ACTIONで装置操作。製造工程とゲートのチェックを見よう。';L.mechanic='巨大PCB · 実装 · リフロー · AOI · PLACE-MASTER';
}
