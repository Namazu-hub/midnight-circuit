// The speed of the opposing current lies between walking and boosted running.
// Apply it to horizontal displacement so jumping and pulsing cannot skip the run.
export function courseDrift(g,dt){
 const course=g.level.boostCourse;
 if(!course)return 0;
 const x=g.player.x+g.player.w/2;
 return x>=course.start&&x<course.end?-course.current*dt:0;
}

export function drawBoostCourse(c,g,width,height,reduced){
 const a=g.level.boostCourse;
 if(!a||a.end+100<g.camera||a.start-190>g.camera+width)return;
 const y=a.floor,bench=!a.room,col=bench?'#88ddd9':'#e7adcb',can=a.start-64;
 c.save();c.textAlign='center';
 c.fillStyle=bench?'#6ce5dd15':'#e98fbf18';
 c.fillRect(a.start,g.cameraY,a.end-a.start,height);
 const slide=reduced?0:(g.time*100)%48;
 c.strokeStyle=col;c.lineWidth=2;
 for(let row=y-20;row>g.cameraY-20;row-=54){
  for(let x=a.start+48-slide;x<a.end-12;x+=48){
   c.beginPath();c.moveTo(x+10,row-4);c.lineTo(x,row);c.lineTo(x+10,row+4);c.stroke();
  }
 }
 // The first machine is a blower, the second winds a tendon belt.
 c.fillStyle='#293a48';c.fillRect(a.end-12,y-76,36,76);
 c.save();c.translate(a.end+6,y-49);
 if(!reduced)c.rotate(-g.time*5);
 c.strokeStyle=col;c.beginPath();c.arc(0,0,15,0,Math.PI*2);c.stroke();
 for(let i=0;i<4;i++){c.fillStyle=col;c.fillRect(2,-3,12,6);c.rotate(Math.PI/2);}
 c.restore();
 if(!bench){c.strokeStyle=col;for(let i=0;i<3;i++){c.beginPath();c.moveTo(a.start,y-6-i*4);c.lineTo(a.end+5,y-6-i*4);c.stroke();}}
 c.fillStyle='#1d3340';c.fillRect(can-22,y-56,44,56);
 c.fillStyle='#bbf885';c.fillRect(can-8,y-48,16,27);
 c.font='bold 14px monospace';c.fillStyle='#17333a';c.fillText('M',can,y-28);
 c.fillStyle=col;c.fillText(bench?'送風試験':'腱巻取り試験',a.end,y-85);
 c.fillStyle='#d8f3be';c.fillText(a.fee?'補給 ¥'+a.fee:'試験缶',can,y-65);
 c.fillText(g.touchInput?'DRINK →':'B →',a.start+32,y-42);
 c.restore();
}
