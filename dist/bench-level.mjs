import {installBenchMachines} from './bench-machines.mjs?v=4.10.0';
// Stage 1 only: stepped workbenches over two explorable service basements.
export function redesignBench(L){
 L.relays=[{id:'bench-wire',x:7900,y:40,on:false,mode:'floor-sequence',worldRepair:true,step:0,contact:-1,label:'床ボタンの順序配線',effectText:'通電！ 光の橋が開通した'}];
 L.tip='床ボタンで配線。起動順序の記録は地下サーバールームに。';
 // Remove the introductory overhead tray and obsolete invisible repair stairs.
 L.platforms=L.platforms.filter(p=>!(p.x===260&&p.y===400));
 L.chips=L.chips.filter(p=>!(p.x===325&&p.y===365));
 // The old pulse-only trays neither teach the wiring sequence nor form useful routes.
 L.platforms=L.platforms.filter(p=>p.type!=='ghost');
 // Old service stairs bypassed the paid lift through the collectible shelf.
 // Keep that shelf, reached by riding the lift and jumping left.
 L.platforms=L.platforms.filter(p=>!(p.type==='platform'&&p.x<850&&p.x!==670));
 L.chips=L.chips.filter(p=>!(p.x<850&&p.y<440));
 L.chips.push({x:690,y:250},{x:805,y:250},{x:1045,y:190});
 L.wireButtons=[7780,7900,8020].map(x=>({x,y:70,w:64}));
 L.platforms.push({x:7740,y:70,w:450,h:20,type:'platform'});
 // The restored circuit has a visible, traversable result beside its terminal.
 L.platforms.push({x:8190,y:70,w:110,h:20,type:'ghost',group:'bench-wire',requiresRepair:true,benchExitBridge:true},
  {x:8300,y:70,w:100,h:20,type:'platform',benchSurface:true});
 Object.assign(L.goal,{x:8350,y:70});Object.assign(L.route.at(-1),L.goal);
 L.wireHints=[{x:3980,y:1320}];
 L.benchMap=true;L.minY=-220;L.killY=1650;L.maxY=1100;
 const old=L.platforms.filter(p=>p.type==='ground');
 const spans=[];
 for(const p of old){
  const heights=p.x===0?[510]:p.x===3480?[510,450,510]:p.x===4720?[510,430,470,510]:[510,450,510];
  const n=heights.length,unit=p.w/n;
  heights.forEach((y,i)=>{const x=Math.round(p.x+i*unit),end=Math.round(p.x+(i+1)*unit);spans.push({...p,x,w:end-x,y,h:690-y,benchSurface:true,benchDeck:true});});
 }
 const surface=x=>spans.find(p=>x>=p.x&&x<p.x+p.w)?.y??510;
 L.platforms=L.platforms.filter(p=>p.type!=='ground').concat(spans);
 // A tall insulated cabinet blocks the first floor route. Its top is above
 // normal double-jump reach; the tool lift provides the actual passage.
 L.platforms.push({x:1010,y:-310,w:70,h:1110,type:'ground',benchSurface:true,benchBarrier:true});
 // Move floor-bound objects with their supporting bench; keep upper shelves intact.
 for(const e of L.enemies)if(e.y===482){e.y=surface(e.x)-e.h;e.baseY=e.y;const p=spans.find(p=>e.x>=p.x&&e.x<p.x+p.w);if(p){e.min=Math.max(e.min,p.x+15);e.max=Math.min(e.max,p.x+p.w-e.w-15);}}
 for(const a of [...L.students,...L.checkpoints])if(a.y===510)a.y=surface(a.x);
 for(const a of L.drinks)if(a.y===475)a.y=surface(a.x)-35;
 for(const a of L.chips)if(a.y===465)a.y=surface(a.x)-45;
 for(const r of L.relays)if(r.y===480)r.y=surface(r.x)-30;
 for(const r of L.route)if(r.y===510)r.y=surface(r.x);
 const pad=(x,y,w=150,extra={})=>L.platforms.push({x,y,w,h:20,type:'platform',benchSurface:true,...extra});
 // Former pulse-only trays become ordinary maintenance decking; the narrow
 // remaining openings still admit deliberate access to the basements.
 pad(4530,500,120);pad(5930,500,140);
 // Visible shafts occupy existing breaks in the surface route. Shelves catch a
 // missed jump; all return rises <=120px and all exit gaps <=180px.
 const rooms=[{id:'archive',role:'hint',x:3210,y:740,w:1510,h:640,floorY:1380,name:'01 / SERVER ARCHIVE',subtitle:'配線記録室',entry:3330,exit:4535,accent:'#88d9d7'},
 {id:'workshop',role:'supply',x:5930,y:730,w:1220,h:370,floorY:1100,name:'02 / SERVICE WORKSHOP',subtitle:'夜勤の保守室',entry:6040,exit:6970,accent:'#e8c18c'}];
 L.benchRooms=rooms;
 pad(3210,760,250);pad(3210,900,250);pad(3210,1040,250);pad(3210,1180,250);
 pad(3210,1380,1510,{h:80}); // deep branch, return is a switchback of service trays
 const return1=[[3520,1260],[3750,1140],[3980,1020],[4210,900],[4380,900],[4535,900],[4535,780],[4535,660],[4535,540]];
 return1.forEach(([x,y])=>pad(x,y,170));
 pad(5930,750,250);pad(5930,890,250);pad(5930,1100,1220,{h:80});
 const return2=[[6200,980],[6420,860],[6640,860],[6870,860],[6970,860],[6970,740],[6970,620],[6970,500]];
 return2.forEach(([x,y])=>pad(x,y,170));
 L.benchReturns=[return1,return2];
 // Separate lethal gaps from the two safe, visibly framed shafts.
 L.fallZones=[{x:0,y:800,w:3210,h:850},{x:4720,y:800,w:1210,h:850},{x:7150,y:800,w:1250,h:850}];
 // Existing three collection parts: put one in each branch; no extra mandatory repair.
 L.gears[1]={x:3590,y:1335};L.gears[2]={x:6300,y:1055};
 for(const [i,room] of rooms.entries()){for(const x of i===0?[3345,3430,3515]:[6050,6110,6170,6390,6440,6610,6740])L.chips.push({x,y:room.floorY-45});}
 L.drinks.push({x:4190,y:1340});
 L.benchSupplies=[{x:6830,y:1100,w:64,h:42,opened:false,drinkTaken:false}];
 L.students.push({x:6510,y:1100,name:'夜勤中の研究生',lines:['サーバーより先に、こっちがスリープしそう。','予備の工具箱？ おやつしか入ってない日もある。','朝まで持つかな。この補給も、僕も。'],color:'#e8c18c'});
 // Keep furniture, checkpoints and people off risers and away from one another.
 L.students.find(s=>s.name==='卒論中の学生').x=5490;
 L.students.find(s=>s.name==='卒論中の学生').y=surface(5490);
 L.students[0].x=160;
 Object.assign(L.enemies[0],{x:380,min:340,max:445});
 L.chips.slice(0,4).forEach((c,i)=>{c.x=300+i*35;});
 L.vendorSites=[240,1350,3540,6360].map(x=>({x,y:surface(x)}));
 // Reward the descent without introducing an underground respawn trap.
 L.benchBeacons=[{x:3330,y:590,label:'SERVER / LOG',accent:'#88d9d7'},{x:6040,y:580,label:'SERVICE / SUPPLY',accent:'#e8c18c'}];
 // Structural walls have the same geometry in drawing and collision. Open tops
 // and the right-hand return shafts remain accessible.
 for(const [x,y,w,h] of [[3180,740,30,720],[4720,740,30,720],[5900,730,30,450],[7150,730,30,450]])L.platforms.push({x,y,w,h,type:'ground',benchSurface:true,benchWall:true});
 const extras=[[1500,510,'resistor'],[2800,450,'capacitor'],[3900,450,'resistor'],[5100,430,'resistor'],[6600,450,'capacitor'],[7350,510,'resistor'],[3800,1380,'resistor'],[6660,1100,'resistor']];
 for(const [x,y,kind] of extras){const floor=y>700?y:surface(x);L.enemies.push({x,y:floor-28,baseY:floor-28,w:32,h:28,min:x-40,max:x+50,speed:42,dir:1,alive:true,kind,clock:0,state:'patrol',stateTime:0});}
 // Old shelves and expansion stairs used to occupy the same 10px band.
 // Merge intersecting surfaces at nearly equal heights, preserving the higher top.
 const trays=L.platforms.filter(p=>p.type==='platform'&&p.h===20),other=L.platforms.filter(p=>!trays.includes(p));
 const merged=[];
 for(const p of trays.sort((a,b)=>a.y-b.y||a.x-b.x)){
  const a=merged.find(a=>Math.abs(a.y-p.y)<=12&&a.x<p.x+p.w&&p.x<a.x+a.w);
  if(a){const end=Math.max(a.x+a.w,p.x+p.w);a.x=Math.min(a.x,p.x);a.w=end-a.x;a.y=Math.min(a.y,p.y);}
  else merged.push({...p});
 }
 L.platforms=other.concat(merged);
 installBenchMachines(L);
 L.sections=[{x:0,name:'研究机の稜線'},{x:3210,name:'サーバー記録室'},{x:5930,name:'夜勤の保守室'},{x:7150,name:'制御盤デッキ'}];
}
