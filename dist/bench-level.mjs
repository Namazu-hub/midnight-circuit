// Stage 1 only: stepped workbenches over two explorable service basements.
export function redesignBench(L){
 L.benchMap=true;L.killY=1650;L.maxY=1100;
 const old=L.platforms.filter(p=>p.type==='ground');
 const spans=[];
 for(const p of old){
  const heights=p.x===0?[510]:p.x===3480?[510,450,510]:p.x===4720?[510,430,470,510]:[510,450,510];
  const n=heights.length,unit=p.w/n;
  heights.forEach((y,i)=>spans.push({...p,x:p.x+i*unit,w:unit,y,h:180,benchSurface:true}));
 }
 const surface=x=>spans.find(p=>x>=p.x&&x<p.x+p.w)?.y??510;
 L.platforms=L.platforms.filter(p=>p.type!=='ground').concat(spans);
 // Move floor-bound objects with their supporting bench; keep upper shelves intact.
 for(const e of L.enemies)if(e.y===482){e.y=surface(e.x)-e.h;e.baseY=e.y;const p=spans.find(p=>e.x>=p.x&&e.x<p.x+p.w);if(p){e.min=Math.max(e.min,p.x+15);e.max=Math.min(e.max,p.x+p.w-e.w-15);}}
 for(const a of [...L.students,...L.checkpoints])if(a.y===510)a.y=surface(a.x);
 for(const a of L.drinks)if(a.y===475)a.y=surface(a.x)-35;
 for(const a of L.chips)if(a.y===465)a.y=surface(a.x)-45;
 for(const r of L.relays)if(r.y===480)r.y=surface(r.x)-30;
 for(const r of L.route)if(r.y===510)r.y=surface(r.x);
 const pad=(x,y,w=150,extra={})=>L.platforms.push({x,y,w,h:20,type:'platform',benchSurface:true,...extra});
 // Visible shafts occupy existing breaks in the surface route. Shelves catch a
 // missed jump; all return rises <=120px and all exit gaps <=180px.
 const rooms=[{x:3210,y:760,w:1200,h:690,name:'B1 / POWER ARCHIVE',entry:3330,exit:4380},
 {x:5930,y:750,w:1150,h:420,name:'B1 / CABLE GALLERY',entry:6040,exit:6870}];
 L.benchRooms=rooms;
 pad(3210,760,250);pad(3210,900,250);pad(3210,1040,250);pad(3210,1180,250);
 pad(3210,1380,1200); // deep branch, return is a switchback of service trays
 const return1=[[3520,1260],[3750,1140],[3980,1020],[4210,900],[4380,900],[4535,900],[4535,780],[4535,660],[4535,540]];
 return1.forEach(([x,y])=>pad(x,y,170));
 pad(5930,750,250);pad(5930,890,250);pad(5930,1100,1150);
 const return2=[[6200,980],[6420,860],[6640,860],[6870,860],[6970,860],[6970,740],[6970,620],[6970,500]];
 return2.forEach(([x,y])=>pad(x,y,170));
 L.benchReturns=[return1,return2];
 // Separate lethal gaps from the two safe, visibly framed shafts.
 L.fallZones=[{x:0,y:800,w:3210,h:850},{x:4720,y:800,w:1210,h:850},{x:7150,y:800,w:1250,h:850}];
 // Existing three collection parts: put one in each branch; no extra mandatory repair.
 L.gears[1]={x:3590,y:1335};L.gears[2]={x:6300,y:1055};
 for(const room of rooms){for(let i=0;i<7;i++)L.chips.push({x:room.x+170+i*100,y:room.y+room.h-110});}
 L.drinks.push({x:4120,y:1340},{x:6720,y:1060});
 // Reward the descent without introducing an underground respawn trap.
 L.benchBeacons=[{x:3330,y:590},{x:6040,y:580}];
 L.sections=[{x:0,name:'研究机の稜線'},{x:3210,name:'地下電源室'},{x:5930,name:'配管ギャラリー'},{x:7150,name:'制御盤デッキ'}];
}
