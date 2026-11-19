// Original Stage 2 geometry: topology inspired by the supplied branching map,
// with no source artwork included in the game.
export function redesignBiomimetic(L){
 const dialogue=L.students.flatMap(s=>s.lines);
 Object.assign(L,{name:'東郷研究室・人体模倣',en:'BIOMIMETIC HAND LAB',theme:'biomimetic',biomimetic:true,width:10000,minY:-1450,maxY:800,killY:1100,spawn:{x:90,y:470},mechanic:'腱ワイヤー・関節機構・把持',tip:'腱の巻取り塔から関節回廊へ。校正した指を橋にして把持試験室へ。',platforms:[],enemies:[],chips:[],drinks:[],gears:[],winds:[],lasers:[],presses:[],gravityZones:[],portals:[],rain:[],sticky:[],signs:[],route:[],checkpoints:[],relays:[],sections:[]});
 const pad=(x,y,w=200,extra={})=>L.platforms.push({x,y,w,h:20,type:'platform',...extra});
 const floor=(x,y,w)=>L.platforms.push({x,y,w,h:y<0?20:100,type:y<0?'platform':'ground'});
 const route=(x,y)=>L.route.push({x,y,service:y!==510&&y!==-600});
 const room=(x,y,w,h,name)=>{L.sections.push({x,name});return {x,y,w,h,name};};
 L.bioRooms=[room(0,20,2200,590,'東郷研究室 / 展示・前室'),room(2250,-760,1100,1380,'腱ワイヤー巻取り塔'),room(3350,-760,2500,400,'関節リンク回廊'),room(3500,-1440,1800,480,'伸筋・拮抗ワイヤー室'),room(3600,-280,2400,1180,'掌の機構・整備室'),room(6000,-760,1100,1380,'屈曲・伸展の縦坑'),room(7200,20,2800,590,'把持試験・実験台'),room(7600,-980,1800,600,'精密ピンチ・標本室')];
 floor(0,510,2200);route(600,510);route(1500,510);route(2100,510);
 // Two-way switchback stairs beside a visibly cable-driven elevator.
 for(let i=0;i<9;i++){const x=2300+(i%2)*270,y=400-i*120;pad(x,y,240);route(x+110,y);}
 pad(2850,-600,500);route(3100,-600);
 floor(3350,-600,1050);route(3650,-600);route(4160,-600);
 L.relays.push({id:'bio-joints',x:4200,y:-630,mode:'joints',puzzleType:'joints',difficulty:2,effectText:'関節固定！ 指骨の橋が伸びた',label:'指関節の校正',on:false});
 pad(4400,-600,620,{type:'ghost',requiresRepair:true,group:'bio-joints',bioFinger:true});
 floor(5020,-600,980);route(4630,-600);route(5200,-600);route(5850,-600);
 for(let i=0;i<4;i++){const x=6100+i*300,y=-360+i*240;pad(x,y,180);route(x+90,y);}
 floor(6800,510,1400);route(7050,510);route(7900,510);
 L.relays.push({id:'bio-grasp',x:7960,y:480,mode:'joints',puzzleType:'joints',difficulty:3,label:'三指把持の校正',on:false,effectText:'把持安定！ 掌の橋を固定'});
 pad(8200,510,620,{type:'ghost',requiresRepair:true,group:'bio-grasp',bioFinger:true});floor(8820,510,1180);route(8500,510);route(9200,510);route(9810,510);L.goal={x:9810,y:510};
 // Upper loop: climb from the joint corridor and rejoin it beyond the bridge.
 for(let i=0;i<5;i++)pad(3500+i*170,-720-i*120,200);
 floor(4180,-1320,850);for(let i=0;i<6;i++)pad(5150+(i%2)*190,-1200+i*120,200);
 // Lower loop: a deep service room with two independent return shafts.
 floor(3600,800,2400);for(const start of [3630,5680])for(let i=0;i<11;i++)pad(start+(i%2)*130,680-i*120,190);
 for(let i=0;i<5;i++)pad(3970+i*330,400,220);
 // Final optional tower and a high horizontal return to the grasp experiment.
 for(let i=0;i<11;i++)pad(7370+(i%2)*210,390-i*120,190);
 floor(7800,-930,1400);for(let i=0;i<11;i++)pad(9270+(i%2)*180,-810+i*120,190);
 L.gears=[{x:4750,y:-1365},{x:4800,y:755},{x:8770,y:-975}];
 L.drinks=[{x:1200,y:475},{x:5500,y:-635},{x:7000,y:475}];
 L.checkpoints=[{x:2000,y:510},{x:3600,y:-600},{x:7050,y:510}];L.checkpoint=L.checkpoints[0];
 L.vendorSites=[{x:250,y:510},{x:3650,y:-600},{x:7100,y:510}];
 for(const a of L.platforms.filter(a=>a.w>=600))for(let x=a.x+100;x<a.x+a.w-60;x+=180)L.chips.push({x,y:a.y-45});
 const foe=(x,y,bone=false)=>L.enemies.push({x,y:y-28,baseY:y-28,w:32,h:28,min:x-65,max:x+65,speed:45,dir:1,alive:true,kind:bone?'mouse-hop':'resistor',bioShape:bone?'bone':'hand',clock:0,state:'patrol',stateTime:0});
 for(const [x,y] of [[850,510],[1650,510],[3900,-600],[5300,-600],[5700,-600],[7300,510],[9000,510],[9500,510],[4500,-1320],[4880,-1320],[4200,800],[5100,800],[8200,-930],[8700,-930]])foe(x,y,x%3===0);
 L.students=[{x:400,y:510,name:'人体模倣の研究生',color:'#c6b8f1',lines:['腱を引くと、指が曲がる。戻すには反対側のワイヤーも必要。',...dialogue.slice(0,3)]},{x:5510,y:800,name:'機構設計の研究生',color:'#8edbcc',lines:['関節を増やすだけでは、狙った姿勢にはならないんだ。',...dialogue.slice(3)]},{x:9060,y:510,name:'把持実験の研究生',color:'#e5b1bf',lines:['強く握るより、三つの接触点を安定させる。']}];
 L.signs=[{x:350,y:250,text:'東郷研究室 / 人体模倣'},{x:2400,y:90,text:'腱ワイヤー / 上層へ'},{x:4050,y:-800,text:'指関節を校正して橋を固定'},{x:7850,y:280,text:'三指把持 / 接触点をそろえる'}];
 L.bioLift={x:3050,y:300,w:160,h:20,type:'moving',axis:'y',range:420,period:9,phase:0};L.platforms.push(L.bioLift);
}
export function drawBioLab(c,g){
 if(!g.level.biomimetic)return;
 c.save();
 for(const r of g.level.bioRooms){if(r.x+r.w<g.camera||r.x>g.camera+1500)continue;
 c.fillStyle='#17283f';c.fillRect(r.x,r.y,r.w,r.h);c.strokeStyle='#52647f';c.lineWidth=5;c.strokeRect(r.x+12,r.y+12,r.w-24,r.h-24);
 c.fillStyle='#b7dedc';c.font='bold 20px sans-serif';c.fillText(r.name,r.x+40,r.y+55);
 for(let x=r.x+60;x<r.x+r.w;x+=220){c.strokeStyle='#39546e';c.lineWidth=3;c.beginPath();c.moveTo(x,r.y+90);c.lineTo(x,r.y+r.h-40);c.stroke();for(let y=r.y+140;y<r.y+r.h-40;y+=180){c.strokeStyle='#6a85a0';c.beginPath();c.arc(x,y,24,0,Math.PI*2);c.stroke();}}
 }
 for(const a of g.level.platforms.filter(a=>a.bioFinger)){
 const on=g.level.relays.find(r=>r.id===a.group)?.on;c.strokeStyle=on?'#a3e8d0':'#bd9cbd';c.lineWidth=14;
 for(let j=0;j<3;j++){c.beginPath();c.moveTo(a.x,a.y+30+j*16);c.lineTo(a.x+a.w*.45,a.y+(on?30+j*16:-110-j*35));c.lineTo(a.x+a.w,a.y+(on?30+j*16:-240-j*55));c.stroke();
 for(const [xx,yy] of [[a.x,a.y+30+j*16],[a.x+a.w*.45,a.y+(on?30+j*16:-110-j*35)],[a.x+a.w,a.y+(on?30+j*16:-240-j*55)]]){c.fillStyle='#dae5dc';c.beginPath();c.arc(xx,yy,16,0,Math.PI*2);c.fill();c.fillStyle='#34485b';c.beginPath();c.arc(xx,yy,7,0,Math.PI*2);c.fill();}
 c.strokeStyle='#8ee4dc';c.lineWidth=2;c.beginPath();c.moveTo(a.x-65,a.y+100);c.lineTo(a.x+a.w*.45,a.y+(on?30+j*16:-110-j*35));c.stroke();c.strokeStyle=on?'#a3e8d0':'#bd9cbd';c.lineWidth=14;}
 c.fillStyle='#49647a';c.fillRect(a.x-85,a.y+15,75,100);c.fillStyle='#bad6d2';c.fillRect(a.x-65,a.y+35,35,40);
 }
 const lift=g.level.platforms.find(a=>a.axis==='y'&&a.type==='moving');
 if(lift){c.strokeStyle='#9fdac9';c.lineWidth=3;c.beginPath();c.moveTo(lift.x+80,-730);c.lineTo(lift.x+80,lift.y);c.stroke();}
 c.restore();
}
export function drawBioEnemy(c,e){
 if(!e.bioShape)return false;c.save();c.translate(e.x,e.y);c.fillStyle=e.bioShape==='bone'?'#f2e6cc':'#dcb5c9';
 if(e.bioShape==='bone'){c.fillRect(5,10,23,8);for(const [x,y] of [[4,8],[4,20],[29,8],[29,20]]){c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fill();}}
 else{c.fillRect(5,9,24,18);for(let i=0;i<4;i++)c.fillRect(5+i*6,i%2?0:3,5,15);c.fillRect(-1,14,9,7);c.fillStyle='#455168';c.fillRect(9,19,15,3);}
 c.restore();return true;
}
