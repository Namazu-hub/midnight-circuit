import {setupActionHand,drawActionRepairs} from './action-repairs.mjs?v=4.6a';
import {REPAIR_NAMES} from './repairs.mjs?v=4.6a';

// Incremental integration with the existing eight courses. Room order is kept
// compatible with old saves; a full five-section redesign is a separate change.
export function setupRepairStations(g){
 const L=g.level;if(L.printer)return;
 for(const r of L.relays){
  if(r.mode==='sequence')r.puzzleType='wiring';
  if(r.mode==='titration')r.puzzleType='titration';
  if(r.mode==='timing')r.puzzleType='signal';
  if(r.puzzleType){r.difficulty=g.index===6?3:g.index===5?2:1;r.repairRank=0;r.effectText=r.mode==='timing'?(g.index===3?'ノズル停止・造形床を固定！':'高所へのサービス足場が開通！'):r.mode==='titration'?'薬液を無害化・サービス足場が開通！':g.index===5?'プレスを停止・サービス足場が開通！':'サービス足場が開通！';}
 }
 const add=(x,y,type,difficulty,effect,effectText)=>{const r={id:`research-${g.index}-${type}`,x,y,on:false,optional:true,mode:type,puzzleType:type,difficulty,repairRank:0,effect,effectText,label:REPAIR_NAMES[type]};L.relays.push(r);return r;};
 if(g.index===0)add(360,480,'wiring',1,'bridge','サービス足場を起動！ 完全修理で高所ボックスを解錠。');
 if(g.index===2){add(350,465,'gears',2,'brake','台車ブレーキ復旧！ 左を押し続けると完全停止できる。');L.signs.push({x:330,y:300,text:'C 歯車を修理 → 左で停車できる'});}
 if(g.index===3){const r=add(650,480,'joints',2,'hand','ロボットアームが造形槽の橋になった！');setupActionHand(g,r);}
 if(g.index===4){add(310,480,'sensor',2,'sensor','時計リフトの振幅を校正！ 揺れ幅が小さくなり乗りやすくなる。');}
 if(g.index===5){add(500,480,'joints',3,'press','プレスの関節を校正し、安全な位置で停止！');}
 if(g.index===7){add(500,480,'logic',2,'defence','ICタレットの射撃回路が停止！ 接触には注意。');}
 for(const r of L.relays)if(r.puzzleType){r.label=REPAIR_NAMES[r.puzzleType];r.repairResult='故障';r.bonusPaid=false;}
 // Preserve old instructions for portals/basic switches; replace obsolete 3-tap advice.
 L.tip=L.tip.replace(/終点の滴定装置でXを3回、pH7へ。/,'滴定装置の近くでX。投入量を選びpH7へ。').replace(/高所の制御盤はXを3回で順番接続。/,'高所の制御盤でX。端子を選んで配線。').replace(/終点の位相計は緑の帯でX。/,'終点でX。基準波形に制御信号を合わせよう。').replace(/緑の位相に合わせてXで同期。/,'制御盤でX。位相・周波数・振幅を合わせよう。');
}

export function applyRepairEffects(g){
 for(const r of g.level.relays){if(!r.on||r.effectApplied)continue;r.effectApplied=true;
  if(r.effect==='brake')g.level.brakeRestored=true;
  if(r.effect==='sensor')for(const p of g.level.platforms)if(p.type==='moving')p.range*=.6;
  if(r.effect==='press')g.level.pressCalibrated=true;
  if(r.effect==='defence'){g.level.defenceDisabled=true;g.projectiles=g.projectiles.filter(p=>p.kind!=='bolt');}
 }
}

export function drawRepairMachines(c,g){
 drawActionRepairs(c,g);
 const h=g.level.handBridge;if(!h)return;const on=g.level.relays.find(r=>r.id===h.device)?.on;
 c.save();c.strokeStyle=on?'#82dfcd':'#68798b';c.lineWidth=16;c.lineCap='round';
 // Three articulated fingers extend horizontally as the load-bearing bridge.
 for(let i=0;i<3;i++){const y=h.y+24+i*20;c.beginPath();c.moveTo(h.x-45,y+30);c.lineTo(h.x+30,y);c.lineTo(h.x+130,on?y:y-105-i*15);c.lineTo(h.x+280,on?y:y-170-i*20);c.stroke();for(const [x,yy] of [[h.x+30,y],[h.x+130,on?y:y-105-i*15],[h.x+280,on?y:y-170-i*20]]){c.fillStyle='#d3e7ea';c.beginPath();c.arc(x,yy,11,0,Math.PI*2);c.fill();c.fillStyle='#172d3c';c.beginPath();c.arc(x,yy,5,0,Math.PI*2);c.fill();}}
 c.fillStyle='#243e53';c.fillRect(h.x-80,h.y+35,65,100);c.fillStyle=on?'#75efce':'#ffb387';c.font='14px sans-serif';c.textAlign='center';c.fillText(on?'把持姿勢固定 · 橋を渡れる':'関節エラー · 左の校正盤へ',h.x+140,h.y-28);c.restore();
}
