// One optional, fully traversable representative room; old production route stays intact.
export const CIRCUIT_ORIGIN=16000;
export function addCircuitTower(L){
 const X=CIRCUIT_ORIGIN;L.width=20600;L.minY=Math.min(L.minY,-800);
 Object.assign(L.rooms.find(r=>r.id==='S'),{name:'不良品保管庫・回路試験塔',right:X+4600,minY:-800,maxY:180});
 L.platforms=L.platforms.filter(a=>a.x<X);
 L.doors.find(d=>d.id==='pcb-reject-back').x=X+280;
 Object.assign(L.pcbControls.find(c=>c.id==='rework'),{x:X+55,y:620});
 for(const student of L.students)if(student.room==='S'){student.x=X+2070;student.y=-190;}
 for(const c of L.chips)if(c.x>=X){c.x+=1700;c.y=-225;}
 const pad=(x,y,w,h=18,role)=>L.platforms.push({x:X+x,y,w,h,type:'platform',...(role?{pcbManaged:true,pcbRole:'circuit-'+role}:{})});
 pad(0,650,440,80);pad(610,650,690,80);pad(0,510,580);pad(50,580,130); // return, not a stranded rescue floor
 pad(1100,620,180,22,'lift');pad(1330,150,250);pad(1580,150,200,22,'arm');
 pad(1320,360,420);pad(1440,-10,180);pad(1950,-190,420);pad(2260,-190,100,18,'coil2');
 pad(3090,-190,500);pad(3600,-330,320);pad(3950,-470,350);pad(4350,-470,230);
 pad(3520,-190,150,18,'carrier');pad(3890,-330,120,18,'charge-bridge');pad(4280,-800,40,330,'shutter'); // > ordinary double-jump height; coil + air jump is the route
 L.checkpoints.push({x:X+90,y:510},{x:X+1450,y:150},{x:X+3170,y:-190});
 L.doors.push({id:'pcb-circuit-in',room:'D',x:6480,y:400,to:'S',toX:X+90,toY:510,label:'回路試験塔'},
 {id:'pcb-circuit-back',room:'S',x:X+90,y:510,to:'D',toX:6480,toY:400,label:'搬送ラインへ戻る'},
 {id:'pcb-circuit-exit',room:'S',x:X+4480,y:-470,to:'D',toX:7800,toY:510,label:'試験塔を突破',checks:[{id:'circuit',label:'加速試験を完了',path:'circuit.complete'}]});
 // D entry has its own landing, distinct from ground-level terminals.
 L.platforms.push({x:6400,y:400,w:180,h:18,type:'platform'});
 L.circuit={room:'S',origin:X,parts:[
 {id:'r',kind:'resistor',x:X+220,y:474,w:60,h:36,min:X+150,max:X+530,padX:X+430,padY:510},
 {id:'c',kind:'capacitor',x:X+660,y:600,w:42,h:50,min:X+610,max:X+1030,padX:X+950,padY:650},
 {id:'r2',kind:'resistor',band:1,x:X+3170,y:-226,w:60,h:36,min:X+3130,max:X+3520,padX:X+3450,padY:-190},
 {id:'c2',kind:'capacitor',x:X+3540,y:-240,w:42,h:50,min:X+3520,max:X+3770,padX:X+3750,padY:-330},
 {id:'sw',kind:'switch',x:X+4000,y:-506,w:46,h:36,min:X+3970,max:X+4210,padX:X+4170,padY:-470}
 ],controls:[

 {id:'ct-yard-reset',x:X+3210,y:-220,label:'未固定部品を再供給'},
 {id:'ct-reset',x:X+720,y:620,label:'未固定部品を再供給'},
 {id:'ct-transistor',x:X+1030,y:620,label:'トランジスタを拾う'},
 {id:'ct-source',x:X+1690,y:330,label:'電源 AC / DC 切替'},
 {id:'ct-diode',x:X+1380,y:120,label:'D1を反転'},
 {id:'ct-diode-1',x:X+1510,y:-40,label:'D2を反転'},
 {id:'ct-diode-2',x:X+1370,y:330,label:'D3を反転'},
 {id:'ct-diode-3',x:X+1560,y:330,label:'D4を反転'},
 {id:'ct-socket',x:X+1510,y:120,label:'3端子ソケット'},
 {id:'ct-hint',x:X+820,y:620,label:'観測ヒント'}]};
 L.doors.find(d=>d.id==='pcb-D').checks=[{id:'circuit',label:'回路試験塔：複合回路と加速試験',path:'circuit.complete',hint:'高所のRC扉から試験塔へ'}];
 L.relays.push({id:'circuit-tower',optional:true,on:false,mode:'pcb',worldRepair:true,label:'回路試験塔',x:X+4480,y:-500});
 L.students.push({x:X+140,y:510,room:'S',name:'波形を見ている学生',color:'#c2dba3',lines:['部品が逃げる回路、初めて見た','抵抗の帯、何回見ても覚えられない'],after:['今度は波形も足場も落ち着いたね'],react:'circuit-tower'});
}
