import {toolHit} from './equipment.mjs?v=4.9c';
// v4.7 stage-local additions. All state is shared across the existing room graph.
export function extendAdventure(L){
 const pad=(x,y,w,extra={})=>L.platforms.push({x,y,w,h:18,type:'platform',...extra});
 // Replace the repetitive C2 service shelves with three physical fabrication spans.
 L.platforms=L.platforms.filter(a=>a.x<12600||a.x>=15600);
 pad(12600,510,820,{h:220,type:'ground'});pad(14240,510,1360,{h:220,type:'ground'});
 const shelter=L.printSites.find(a=>a.id==='shelter');Object.assign(shelter,{x:12820,blocks:[[12880,380,36,130],[12770,380,145,18]]});
 for(const [x,y,w,h=18] of shelter.blocks)pad(x,y,w,{h,printSite:'shelter',shield:true});
 Object.assign(L.printerControls.find(a=>a.id==='site-shelter'),{x:12820});
 const sites=[
 {id:'maze-stairs',room:'C2',x:13180,y:480,kind:'stairs',required:true,blocks:[[13220,400,120],[13310,290,120],[13420,180,170]]},
 {id:'maze-bridge',room:'C2',x:13490,y:150,kind:'bridge',required:true,blocks:[[13590,180,650]]},
 {id:'maze-ramp',room:'C2',x:14480,y:480,kind:'ramp',required:true,blocks:[[14570,420,115],[14660,350,115],[14750,280,115],[14840,210,170]]},
 {id:'maze-wall',room:'C2',x:14290,y:150,kind:'shield',required:false,blocks:[[14215,185,28,260],[14215,185,180,18]]}
 ];
 for(const site of sites){L.printSites.push(site);L.printerControls.push({id:'site-'+site.id,x:site.x,y:site.y,label:'造形 '+({stairs:'階段',bridge:'橋',ramp:'坂',shield:'防護壁'})[site.kind]});for(const [x,y,w,h=18] of site.blocks)pad(x,y,w,{h,printSite:site.id,shield:site.kind==='shield'});}
 pad(14240,180,260);pad(14980,180,550);pad(14380,310,240);pad(14620,300,300);pad(14920,260,150);
 pad(14950,-180,28,{h:690,mazeLock:true});
 L.fallZones.push({room:'C2',x:13420,y:650,w:820,h:300});
 L.checkpoints=L.checkpoints.filter(c=>c.x<12600||c.x>=15600);
 L.checkpoints.push({x:12700,y:510},{x:14340,y:510});
 // Visible optional budget cache: a short shutter requires the existing 1.55x boost.
 L.printerControls.push({id:'sprint',x:7460,y:480,label:'試走ゲート'});
 pad(7990,150,70,{h:360,sprintGate:true});L.sprintRoute={start:7460,end:8020,seconds:1.65};
 L.chips.push(...Array.from({length:12},(_,i)=>({x:8080+i*24,y:475,sprintReward:true})));
 L.chips.push({x:8310,y:475,sprintReward:true});
 // Dawn is now an ordinary, controllable room. The old cutscene never emits finish.
 L.width=20100;L.rooms.push({id:'H',left:18800,right:20100,minY:0,maxY:0,name:'夜明けの研究室'});
 pad(18800,510,1300,{h:220,type:'ground'});
 L.doors.push({id:'dawn','room':'E',x:6870,y:510,to:'H',toX:18900,toY:510,requiresBoss:true,label:'隔壁を開く'});
 L.doors.push({id:'dawn-back',room:'H',x:18900,y:510,to:'E',toX:6870,toY:510,label:'扉を開く'});
 L.students.push({room:'H',x:19550,y:510,name:'試作品の設計者',color:'#b4a3dd',lines:['……できてる'],after:['……できてる'],react:'dawn'});
 L.goal={x:19970,y:510};L.route=[{x:19970,y:510}];
 // A small removable prototype unlocks an optional cache; never a story requirement.
 L.toolObstacle={x:8520,y:390,w:45,h:120};pad(8520,390,45,{h:120,toolObstacle:true});L.chips.push({x:8630,y:475});
}
export function initAdventure(g){g.printer.adventure={sprint:0,sprintWon:false,obstacleCleared:false};}
export function adventureSolid(g,a){const v=g.printer.adventure,j=g.printer.journey;
 if(a.mazeLock)return !['maze-stairs','maze-bridge','maze-ramp'].every(id=>j.sites[id]?.progress>=1);
 if(a.sprintGate)return v.sprint<=0&&!v.sprintWon;
 if(a.toolObstacle)return !v.obstacleCleared;
 return null;
}
export function adventureAction(g,id){if(id==='sprint'){const v=g.printer.adventure;if(!v.sprintWon)v.sprint=g.level.sprintRoute.seconds;return true;}return false;}
export function tickAdventure(g,dt){const v=g.printer.adventure,p=g.player;v.sprint=Math.max(0,v.sprint-dt);if(g.rooms.active==='S'&&v.sprint>0&&p.x>8020)v.sprintWon=true;
 if(g.rooms.active==='H'){g.printer.ending.active=false;g.printer.ending.complete=true;}
 const strike=g.equipment?.strike;if((strike?.id==='scraper'||g.equipment?.shots?.some(q=>q.life>0))&&g.rooms.active==='S'&&!v.obstacleCleared&&toolHit(g,g.level.toolObstacle,'resin-obstacle')){v.obstacleCleared=true;g.events.push({type:'toolBreakResin',x:8520,y:430});}
}
