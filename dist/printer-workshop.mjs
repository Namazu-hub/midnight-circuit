// Stage-local v4.8 layout; preserves the old room graph and repair identities.
export function extendWorkshop(L){
 const pad=(x,y,w=120,extra={})=>L.platforms.push({x,y,w,h:18,type:'platform',recovery:true,...extra});
 for(const [x,y] of [[2100,600],[2230,520],[3470,590],[3610,500],[11800,400],[11900,290]])pad(x,y);
 L.recoveryRoutes=[{room:'B',from:[2150,680],steps:[[2150,600],[2280,520],[2460,510]]},{room:'C',from:[3500,680],steps:[[3520,590],[3660,500],[3900,510]]}];
 L.printerControls.push({id:'recall-cargo',x:11000,y:480,label:'搬送船を呼ぶ'});
 L.vendorSites=[{x:300,y:510},{x:12970,y:510},{x:5110,y:510}];
 const student=L.students.find(s=>s.name==='前室の学生');if(student)student.name='徹夜中の学生';
}
export function workshopAction(g,id){if(id==='recall-cargo'){g.printer.journey.cargo={x:10650,waiting:true};return true;}return false;}
