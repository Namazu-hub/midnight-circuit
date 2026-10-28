import {configurePrinterGates} from './printer-progress.mjs?v=4.9b';
import {extendNozzle} from './printer-nozzle.mjs?v=4.9b';
import {extendPeeling} from './printer-peeling.mjs?v=4.9b';
// Stage-local v4.8 layout; preserves the old room graph and repair identities.
export function extendWorkshop(L){
 extendPeeling(L);extendNozzle(L);configurePrinterGates(L);
 const pad=(x,y,w=120,extra={})=>L.platforms.push({x,y,w,h:18,type:'platform',recovery:true,...extra});
 for(const [x,y] of [[2100,600],[2230,520],[3470,590],[3610,500],[11800,400],[11900,290]])pad(x,y);
 for(const [x,y] of [[2040,650],[2390,650],[3430,650],[3820,650]])L.chips.push({x,y});
 L.recoveryRoutes=[{room:'B',from:[2150,680],steps:[[2150,600],[2280,520],[2460,510]]},{room:'C',from:[3500,680],steps:[[3520,590],[3660,500],[3860,510]]}];
 L.printerControls.push({id:'recall-cargo',x:11000,y:480,label:'搬送船を呼ぶ'});
 L.tethers=[{id:'cable-end',socket:'fan1',room:'D',x:4130,y:480,toX:4280,toY:260,length:440,printSite:'cable-stairs'}];
 L.printerControls.push({id:'cable-end',x:4130,y:480,label:'ケーブルを持つ／戻す'});
 const cableSite={id:'cable-stairs',room:'D',x:4500,y:480,kind:'stairs',required:true,blocks:[[4300,400,120],[4200,300,170],[4300,200,160]]};L.printSites.push(cableSite);L.printerControls.push({id:'site-cable-stairs',x:4500,y:480,label:'ケーブル用階段の造形'});for(const [x,y,w] of cableSite.blocks)pad(x,y,w,{printSite:cableSite.id});
 L.platforms=L.platforms.filter(a=>!([3970,4190].includes(a.x)&&[400,290].includes(a.y)));
 L.vendorSites=[{x:300,y:510},{x:12970,y:510},{x:5110,y:510}];
 const student=L.students.find(s=>s.name==='前室の学生');if(student)student.name='徹夜中の学生';
}
export function workshopAction(g,id){if(id==='recall-cargo'){g.printer.journey.cargo={x:10650,waiting:true};return true;}return false;}
