import {printerControl,printerObjective,requestPrinterHint} from './printer.mjs?v=4.5a';
import {nearbyAction,actionObjective} from './action-repairs.mjs?v=4.5a';
import {beginRepair,nearbyRepair,commitRepair} from './repairs.mjs?v=4.5a';
import {createRepairUI} from './repair-ui.mjs?v=4.5a';
import {tickResearch} from './research.mjs?v=4.5a';
import {GOODS,nearVendor,purchase} from './research.mjs?v=4.5a';
import {bindTouchControls} from './touch-input.mjs?v=4.5.1a';
import {VIEW,RULES,LEVELS,clamp,createGame,updateGame,respawn} from './engine.mjs?v=4.5a';
import {drawHome,drawWorld,drawThumbnail} from './render.mjs?v=4.5a';
import {blankProgress,readProgress,recordClear} from './progress.mjs?v=4.5a';
import {ENEMY_GUIDE} from './enemies.mjs?v=4.5a';
import {FEVER_CONFIG,createFever,updateFever,feverSnapshot,drawFeverIntro,drawFeverFX} from './fever.mjs?v=4.5a';
import {drawAwakening} from './awakening.mjs?v=4.5a';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const STORAGE='midnight-circuit-save-v1';
const blank=()=>blankProgress(LEVELS.length,matchMedia('(prefers-reduced-motion: reduce)').matches);
let progress=blank(),canSave=true;
try{progress=readProgress(JSON.parse(localStorage.getItem(STORAGE)||'null'),LEVELS.length,progress.reduced);}catch{canSave=false;}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(progress));}catch{canSave=false;}$('save-status').textContent=canSave?'PROGRESS SAVED LOCALLY':'このプレイ中のみ記録';}
let selectedStage=0,savedNormal=null,feverAge=0,feverDemo=false,pauseMode='playing',lastFeverSave=0;
function checkpointFever(){if(game?.fever&&!feverDemo&&progress.pending){progress.pending.snapshot=feverSnapshot(game);progress.pending.phase=mode==='feverIntro'?'intro':'playing';save();}}
let mode='home',game=null,previousMode='home',bonus=null,particles=[],lastTime=0,accumulator=0,worldTime=0,toastUntil=0;
let touchController=null;
const pressed=new Set(),touch=new Set();let interactEdge=false,jumpEdge=false,pulseEdge=false,jumpRelease=false;
const jumpCodes=['Space','KeyZ','ArrowUp','KeyW'];
const movementCodes=['ArrowLeft','ArrowRight','KeyA','KeyD',...jumpCodes,'KeyX','ShiftLeft','ShiftRight'];
function clearInput(){touchController?.clear();pressed.clear();touch.clear();interactEdge=false;jumpEdge=false;pulseEdge=false;jumpRelease=false;document.querySelectorAll('[data-control]').forEach(b=>b.classList.remove('pressed'));}
function input(){return {left:pressed.has('ArrowLeft')||pressed.has('KeyA')||touch.has('left'),right:pressed.has('ArrowRight')||pressed.has('KeyD')||touch.has('right'),laneUp:pressed.has('KeyQ')||touch.has('laneUp'),laneDown:pressed.has('KeyE')||touch.has('laneDown'),interact:interactEdge,jump:jumpEdge,jumpRelease,pulse:pulseEdge};}
class Synth{
  constructor(){this.context=null;this.master=null;this.enabled=progress.sound;this.nextBeat=0;this.step=0;}
  init(){try{if(!this.context){this.context=new (window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.gain.value=.14;this.master.connect(this.context.destination);}if(this.context.state==='suspended')this.context.resume();}catch{this.enabled=false;progress.sound=false;syncSound();}}
  tone(f,d=.12,type='triangle',v=.3,delay=0,end=null){if(!this.enabled||!this.context)return;const at=this.context.currentTime+delay,osc=this.context.createOscillator(),gain=this.context.createGain();osc.type=type;osc.frequency.setValueAtTime(f,at);if(end)osc.frequency.exponentialRampToValueAtTime(end,at+d);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(v,at+.009);gain.gain.exponentialRampToValueAtTime(.0001,at+d);osc.connect(gain);gain.connect(this.master);osc.start(at);osc.stop(at+d+.02);}
  sound(name){const tone=(...args)=>this.tone(...args);
    if(name==='feverStart'){tone(48,.6,'sawtooth',.35,0,30);[262,330,392,523,659,784,1047].forEach((n,i)=>tone(n,.5,'triangle',.32,.6+i*.12));}
    if(name==='feverKill'){tone(600+Math.random()*600,.13,'triangle',.24);tone(100,.09,'sine',.2,0,45);}
    if(name==='feverMilestone'){[784,1047,1319].forEach((n,i)=>tone(n,.23,'triangle',.25,i*.05));}
    if(name==='portal'){tone(220,.5,'sine',.3,0,1300);}
    if(name==='railLand')tone(75,.08,'triangle',.12);
    if(name==='jump')tone(330,.14,'square',.13,0,680);
    if(name==='doublejump'){tone(590,.12,'triangle',.32,0,980);tone(980,.12,'triangle',.2,.05);}
    if(name==='chip'){tone(880,.09,'sine',.3);tone(1320,.12,'sine',.22,.045);}
    if(name==='boost'){[330,440,660,880,1320].forEach((n,i)=>tone(n,.24,'square',.12,i*.06));}
    if(name==='gear'){[660,880,1100,1320].forEach((n,i)=>tone(n,.2,'triangle',.25,i*.07));}
    if(name==='pulse'){tone(110,.5,'sawtooth',.11,0,440);tone(660,.7,'sine',.22,.1,220);}
    if(name==='stomp')tone(160,.14,'square',.2,0,70);
    if(name==='hurt'){tone(200,.22,'sawtooth',.16,0,80);}
    if(name==='spring')tone(140,.35,'triangle',.3,0,1100);
    if(name==='respawn'){tone(310,.25,'triangle',.3,0,120);}
    if(name==='checkpoint'||name==='relay'){[440,554,660,880].forEach((n,i)=>tone(n,.3,'triangle',.24,i*.1));}
    if(name==='bonus'){[440,660,880,1100,1320].forEach((n,i)=>tone(n,.23,'square',.12,i*.1));}
    if(name==='reel'){tone(220,.1,'square',.17);tone(660,.25,'triangle',.25,.04);}
    if(name==='reach'){[784,988,1175,1568].forEach((n,i)=>tone(n,.25,'square',.12,i*.13));}
    if(name==='jackpot'){[523,659,784,1047,784,1047,1319,1568].forEach((n,i)=>tone(n,.45,'triangle',.35,i*.12));[131,196,262].forEach((n,i)=>tone(n,.8,'triangle',.2,i*.3));}
  }
  music(){
    if(!this.enabled||!this.context||mode!=='playing')return;
    const tracks=[
      {root:130.81,tempo:.25,type:'triangle',notes:[0,4,7,12,7,4,9,7,4,7,11,14,12,7,4,2],bass:[0,0,5,7]},
      {root:146.83,tempo:.31,type:'sine',notes:[12,16,19,16,14,9,14,16,12,7,9,12,14,16,19,21],bass:[0,5,9,7]},
      {root:123.47,tempo:.18,type:'square',notes:[0,0,7,12,0,7,10,7,3,3,10,15,3,10,12,10],bass:[0,0,3,7]},
      {root:138.59,tempo:.22,type:'triangle',notes:[0,7,12,19,3,10,15,22,5,12,17,24,7,14,19,26],bass:[0,3,5,7]},
      {root:155.56,tempo:.3,type:'sine',notes:[0,3,7,12,10,7,5,3,5,8,12,17,15,12,10,7],bass:[0,8,5,7]},
      {root:164.81,tempo:.19,type:'square',notes:[0,7,3,7,12,7,10,7,5,12,8,12,17,12,15,12],bass:[0,3,5,7]},
      {root:130.81,tempo:.28,type:'sine',notes:[0,7,14,19,24,19,14,7,2,9,16,21,26,21,16,9],bass:[0,2,5,7]},
      {root:174.61,tempo:.24,type:'triangle',notes:[12,7,3,0,10,7,2,0,12,15,19,24,22,19,15,12],bass:[0,8,3,7]}
    ];
    const now=this.context.currentTime;if(now<this.nextBeat)return;
    const tr=game.fever?{root:196,tempo:.13,type:'square',notes:[0,4,7,12,16,12,7,4,5,9,12,17,19,17,12,9],bass:[0,5,7,7]}:game.printer?.boss.active&&!game.printer.boss.done?{root:110,tempo:.17,type:'square',notes:[0,7,12,0,3,10,15,3,5,12,17,5,7,14,19,10],bass:[0,3,5,7]}:tracks[game.index],i=this.step%16;this.nextBeat=now+tr.tempo;
    this.tone(tr.root*2**(tr.notes[i]/12),tr.tempo*.85,tr.type,.085);
    if(i%4===0)this.tone(tr.root/2*2**(tr.bass[Math.floor(i/4)]/12),tr.tempo*3,'sine',.2);
    if(i%2===0)this.tone(85,.09,'sine',.16,0,35);
    if(i%4===2)this.tone(1400,.035,'triangle',.025);
    this.step++;
  }
}
const audio=new Synth();
function syncSound(){$('sound-label').textContent=progress.sound?'ON':'OFF';$('sound-btn').setAttribute('aria-label',progress.sound?'音をオフにする':'音をオンにする');$('sound-btn').setAttribute('aria-pressed',String(progress.sound));$('footer-sound').textContent=progress.sound?'♪ 音をオフ':'♪ 音をオン';audio.enabled=progress.sound;}
function toggleSound(){progress.sound=!progress.sound;if(progress.sound)audio.init();syncSound();save();if(progress.sound)audio.sound('chip');}
$('sound-btn').addEventListener('click',toggleSound);$('footer-sound').addEventListener('click',toggleSound);
let arenaView=false,printerView=false;
function resize(){const r=canvas.getBoundingClientRect();if(r.width<=0||r.height<=0)return;VIEW.w=arenaView?1200:Math.min(printerView?1200:Infinity,Math.max(320,Math.round(r.width/r.height*600)));VIEW.pixelScale=Math.min(r.width/VIEW.w,r.height/600);canvas.width=VIEW.w;canvas.height=600;canvas.style.objectFit=printerView?'contain':'';ctx.imageSmoothingEnabled=false;}
new ResizeObserver(resize).observe($('viewport'));resize();
let lastInput='keyboard';
function inputText(text){return lastInput==='touch'?text.replace(/Cか画面ボタン|Cまたは[「『]?修理[」』]?|C／操作|Cか|Cで/g,'ACTIONで').replace(/Xで/g,'PULSEで').replace(/パルスX|X パルス/g,'PULSE'):text;}
function contextAction(){if(mode!=='playing')return;if(printerControl(game)||nearbyAction(game)||nearbyRepair(game,true))requestRepair();else if(nearVendor(game))$('shop-open').click();}
function toast(text,seconds=3.6){$('toast').textContent=inputText(text);$('toast').classList.add('visible');toastUntil=worldTime+seconds;}
function renderCards(){
  $('stage-grid').replaceChildren();
  LEVELS.forEach((L,i)=>{
    const b=document.createElement('button');b.className='stage-card'+(game?.index===i?' active':'');b.style.setProperty('--card-color',L.color);b.setAttribute('aria-label',`ステージ${i+1} ${L.name}をプレイ`);
    const art=document.createElement('canvas');art.setAttribute('aria-hidden','true');b.append(art);drawThumbnail(art,L);
    const number=document.createElement('span');number.className='stage-number';number.textContent='0'+(i+1);b.append(number);
    if(progress.completed[i]){const badge=document.createElement('span');badge.className='stage-clear';badge.textContent='✓ RESTORED';b.append(badge);}
    const info=document.createElement('div');info.className='stage-card-info';info.innerHTML=`<div class="stage-card-top"><span>${L.en.replace('THE ','')}</span><small>✦ ${progress.gears[i]} / 3</small></div><strong>${L.name}</strong><span class="mechanic">${L.mechanic}</span>`;b.append(info);
    b.addEventListener('click',()=>{startLevel(i);$('game-shell').scrollIntoView({behavior:progress.reduced?'auto':'smooth',block:'center'});});$('stage-grid').append(b);
  });
  const n=progress.completed.filter(Boolean).length;$('completion-label').textContent=`${n} / ${LEVELS.length} RESTORED`;$('start-btn').innerHTML=(n===0?'冒険をはじめる':n===LEVELS.length?'もう一度冒険する':'冒険をつづける')+' <span>→</span>';if(progress.pending)$('start-btn').innerHTML='フィーバーを再開 <span>→</span>';
}
const icons=[ 
 '<path d="M5 31h40v6H5zM8 14h26v18H8z" fill="#82c5bd"/><path d="M12 18h18v9H12z" fill="#193a42"/><path d="M36 23h6v9h-6zM15 21h10v2H15z" fill="#b6ffd9"/>',
 '<path d="M7 23 25 6l18 17v17H7z" fill="#426a53"/><path d="M25 8v31M9 23h32" stroke="#c2eca1" stroke-width="2"/><path d="M23 37V19m0 9-9-7m9 2 9-7" stroke="#9fdb80" stroke-width="4"/>',
 '<path d="M3 22h44v8H3z" fill="#f0f0e5"/><path d="M8 30h7v10H8zm27 0h7v10h-7z" fill="#718da0"/><path d="M15 11h19v11H15z" fill="#91a9b9"/><path d="M21 14h7v5h-7z" fill="#a3ffdb"/>',
 '<path d="M6 5h38v35H6z" fill="none" stroke="#aed5dd" stroke-width="4"/><path d="M8 13h34M24 13v10" stroke="#6c93ab" stroke-width="4"/><path d="M20 22h8v6h-8zM15 33h20v6H15z" fill="#ffae87"/><path d="M20 28h10v5H20z" fill="#8ce7f4"/>',
 '<path d="M13 15h24v28H13zM18 7h14v8H18zM23 1h4v6h-4z" fill="#b8a2e7"/><circle cx="25" cy="23" r="8" fill="#342e56"/><path d="M25 17v7h5" fill="none" stroke="#e7dbff" stroke-width="2"/>',
 '<path d="M5 35h40v7H5zM12 8h27v7H12zM25 15v14" stroke="#e2c0a0" stroke-width="5"/><path d="M18 27h14v6H18z" fill="#ffb16c"/>',
 '<rect x="5" y="9" width="40" height="30" rx="4" fill="#354e5c"/><path d="M9 25h5l5-10 9 19 6-11h8" stroke="#8bffd2" fill="none" stroke-width="3"/>',
 '<ellipse cx="25" cy="24" rx="12" ry="20" fill="#392b56" stroke="#e2a9ff" stroke-width="3"/><path d="M1 24h48M25 4v40" stroke="#e2a9ff"/><circle cx="25" cy="24" r="5" fill="#fff"/>' 
];
function renderMap(){
 const positions=[[12,27],[37,27],[62,27],[87,27],[87,75],[62,75],[37,75],[12,75]];
 $('map-nodes').replaceChildren();
 LEVELS.forEach((L,i)=>{const b=document.createElement('button');b.className='map-node'+(selectedStage===i?' selected':'');b.style.left=positions[i][0]+'%';b.style.top=positions[i][1]+'%';b.style.setProperty('--node-color',L.color);b.setAttribute('aria-label',`${i+1} ${L.name}${progress.completed[i]?' クリア済み':''}`);b.setAttribute('aria-pressed',String(selectedStage===i));b.innerHTML=`<span class="map-island"><svg viewBox="0 0 50 48" aria-hidden="true">${icons[i]}</svg><b>${progress.completed[i]?'✓':'0'+(i+1)}</b></span><strong>${L.name}</strong>`;b.onclick=()=>{selectedStage=i;renderMap();audio.sound('chip');};$('map-nodes').append(b);});
 const L=LEVELS[selectedStage];$('map-en').textContent=`0${selectedStage+1} / ${L.en}`;$('map-title').textContent=L.name;$('map-description').textContent=L.mechanic+' — '+L.tagline;$('map-record').textContent=`${progress.completed[selectedStage]?'RESTORED':'READY TO EXPLORE'} · PARTS ${progress.gears[selectedStage]}/3`;
}
function showMap(){clearInput();mode='map';bonus=null;syncUI();renderMap();$('game-shell').scrollIntoView({block:'center',behavior:progress.reduced?'auto':'smooth'});}
$('map-play').onclick=()=>startLevel(selectedStage);$('map-home').onclick=goHome;
function syncUI(){
  repairUI.overlay.hidden=mode!=='repair';$('repair-open').hidden=mode!=='playing'||!(printerControl(game)||nearbyAction(game)||nearbyRepair(game,true));$('shop-overlay').hidden=mode!=='shop';$('shop-open').hidden=mode!=='playing'||!game||!nearVendor(game);$('world-map').hidden=mode!=='map';$('home').hidden=mode!=='home';$('lever-btn').hidden=true;$('pause-overlay').hidden=mode!=='paused';$('result-overlay').hidden=mode!=='result';$('help-overlay').hidden=mode!=='help';$('gameover-overlay').hidden=mode!=='gameover';
  const inGame=!['feverIntro','feverOutro'].includes(mode)&&!!game&&mode!=='home'&&mode!=='map'&&!(mode==='help'&&['home','map'].includes(previousMode))&&!(mode==='bonus'&&bonus?.demo);
  $('hud').hidden=!inGame||mode==='bonus';$('pulse-hud').hidden=!inGame||mode==='bonus';$('progress-track').hidden=!inGame||mode==='bonus';$('printer-hint-btn').hidden=mode!=='playing'||!game?.printer;$('pause-btn').hidden=!['playing','feverIntro','feverOutro'].includes(mode);$('bonus-skip').hidden=mode!=='bonus';
  canvas.setAttribute('aria-label',mode==='bonus'?'パチンコ風ボーナス演出。リーチから777で修理大成功。スペースまたはレバーボタンで覚醒。':'横スクロールアクション。矢印で移動、スペースで二段ジャンプ、Xでパルス。');
  if(mode!=='playing')$('toast').classList.remove('visible');
  if(mode==='map'){$('screen-status').innerHTML='<i></i> WORLD MAP / CHOOSE A ROOM';$('bottom-message').textContent='次は、どの部屋にあかりを灯そう。';}
  else if(mode==='home'){$('screen-status').innerHTML='<i></i> SYSTEM STANDBY';$('bottom-message').textContent='おかえり、夜の冒険へ。';}
  else if(mode==='bonus'&&bonus?.demo){$('screen-status').innerHTML='<i></i> 777 / REPAIR BONUS · DEMO';$('bottom-message').textContent='覚醒せよ、夜勤の相棒。';}
  else if(game){$('screen-status').innerHTML=`<i></i> ${game.level.location} · ${mode==='playing'?'NIGHT SHIFT ACTIVE':mode==='bonus'?'REPAIR BONUS':'STANDBY'}`;}
  $('retry-btn').textContent=game?.fever?'フィーバーを最初からやり直す':'1機使ってチェックポイントから再開';
  document.body.dataset.mode=mode;
  if(mode!=='playing')clearInput();
  document.body.classList.toggle('play-session',!!game&&!['home','map'].includes(mode)&&!(mode==='help'&&['home','map'].includes(previousMode)));
}
function startLevel(i){
  if(progress.runLives<=0){mode='gameover';syncUI();return;}if(progress.pending){resumePendingFever();return;}selectedStage=i;clearInput();game=createGame(i);game.research.funds=progress.funds;game.lives=progress.runLives;particles=[];mode='playing';bonus=null;accumulator=0;
  if(progress.sound)audio.init();audio.nextBeat=0;audio.step=0;
  $('hud-number').textContent='0'+(i+1);$('hud-en').textContent=game.level.en;$('hud-name').textContent=game.level.name;$('bottom-message').textContent=game.level.tagline;
  $('relay-count').hidden=game.level.relays.length===0;syncUI();renderCards();updateHUD();canvas.focus({preventScroll:true});toast(game.level.tip,6);
}
function goHome(){checkpointFever();clearInput();mode='home';bonus=null;particles=[];syncUI();renderCards();$('toast').classList.remove('visible');}
function selectStages(){showMap();}
function pause(){if(!['playing','feverIntro','feverOutro'].includes(mode))return;pauseMode=mode;checkpointFever();mode='paused';clearInput();syncUI();$('resume-btn').focus({preventScroll:true});}
function resume(){if(!game)return;mode=pauseMode;clearInput();syncUI();canvas.focus({preventScroll:true});accumulator=0;}
function openHelp(){if(mode==='playing'&&game?.printer){requestPrinterHint(game);updateHUD();return;}if(mode==='bonus')return;previousMode=mode;mode='help';clearInput();syncUI();$('help-close').focus({preventScroll:true});}
function closeHelp(){mode=previousMode;syncUI();if(mode==='playing')canvas.focus({preventScroll:true});else $('help-btn').focus({preventScroll:true});}
function startBonus(demo=false){mode='bonus';bonus={age:0,startedAt:performance.now(),demo,reel1:false,reel2:false,won:false,pulled:false,pullAge:null};$('bonus-skip').textContent='演出をスキップ →';clearInput();syncUI();audio.sound('bonus');$('bonus-announcement').textContent='修理チャンス。パチンコ風ボーナス演出が始まります。';}
function pullLever(){if(!bonus||bonus.age<5.4||bonus.pulled)return;bonus.pulled=true;bonus.pullAge=bonus.age;$('lever-btn').hidden=true;audio.sound('pulse');$('bonus-announcement').textContent='レバー作動。覚醒ハイパー！';}
$('lever-btn').onclick=pullLever;
function endBonus(){if(!bonus)return;const demo=bonus.demo;bonus=null;if(demo){goHome();return;}showResult();}
function feverHUD(){ $('hud-number').textContent='777';$('hud-en').textContent='FEVER OVERDRIVE';$('hud-name').textContent='虹色オーバードライブ';$('relay-count').hidden=true;$('bottom-message').textContent='無敵 · ← → 移動 · SPACE ジャンプ · X 連射パルス'; }
function beginFever(demo=false,resumeSnapshot=null){
 feverDemo=demo;game=createFever(resumeSnapshot);feverAge=0;lastFeverSave=game.elapsed;mode=resumeSnapshot?'playing':'feverIntro';particles=[];clearInput();audio.nextBeat=0;audio.step=0;if(progress.sound)audio.init();feverHUD();syncUI();updateHUD();canvas.focus({preventScroll:true});if(!resumeSnapshot)audio.sound('feverStart');
}
function resumePendingFever(){const p=progress.pending;if(!p)return;savedNormal=createGame(p.index);Object.assign(savedNormal,p.result,{finished:true});beginFever(false,p.phase==='playing'?p.snapshot:null);}
function completeFever(){const f=game.fever;if(!feverDemo){progress.pending=null;save();game=savedNormal;savedNormal=null;$('hud-number').textContent='0'+(game.index+1);$('hud-en').textContent=game.level.en;$('hud-name').textContent=game.level.name;$('relay-count').hidden=game.level.relays.length===0;$('bottom-message').textContent=game.level.tagline;updateHUD();showResult();$('result-description').textContent+=` フィーバー：${f.kills}撃破・最大${f.best}コンボ！`;}else{game=null;goHome();}}
function finish(){
 if(game.fever){feverAge=0;mode='feverOutro';checkpointFever();clearInput();syncUI();audio.sound('jackpot');return;}
 const i=game.index;progress.completed[i]=true;progress.gears[i]=Math.max(progress.gears[i],game.gears);progress.chips[i]=Math.max(progress.chips[i],game.chips);progress.best[i]=progress.best[i]===null?game.elapsed:Math.min(progress.best[i],game.elapsed);
 const won=recordClear(progress,i);if(won){progress.pending={index:i,result:{gears:game.gears,chips:game.chips,elapsed:game.elapsed,research:game.research},phase:'intro',snapshot:null};savedNormal=game;save();renderCards();beginFever();}else{save();renderCards();showResult();}
}
function timeLabel(seconds){return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
function showResult(){mode='result';const all=progress.completed.every(Boolean),final=game.index===LEVELS.length-1;
  $('result-kicker').textContent=final?'DAWN HAS ARRIVED':'ROOM RESTORED';$('result-title').textContent=final?'おつかれさま、ピコ。':'あかりが、灯った。';
  $('result-description').textContent=final?(all?'8つの部屋に朝が来た。学生たちも、ようやく帰れる。':'星空に朝が来た。ほかの部屋にもあかりを灯そう。'):`${game.level.name}をクリア！ 居残り学生もひと安心。`;
  $('result-gears').textContent=`${game.gears}/3`;$('result-chips').textContent=String(game.research?.earned??game.chips);$('result-time').textContent=timeLabel(game.elapsed);
  $('research-result').textContent=game.research?`撃破 ${game.research.kills} · 修理 ${game.research.repairs} （完全 ${game.research.fullRepairs||0}） · 高所ボックス ${game.research.caches}`:'';
  $('next-btn').innerHTML=(final?'もう一度、夜の冒険へ':'次の部屋へ')+' <span>→</span>';syncUI();$('next-btn').focus({preventScroll:true});
}
function updateHUD(){if(!game)return;const target=printerControl(game)||nearbyAction(game)||nearbyRepair(game,true);const action=$('context-action');action.disabled=!target&&!nearVendor(game);action.textContent=target?(target.door?'扉':target.id?.includes('cable')?'滑走':'修理'):nearVendor(game)?'¥ 補給':'ACTION';action.setAttribute('aria-label','ACTION '+action.textContent);document.body.classList.toggle('has-cart',!!game.cart);if(!!game.printer?.boss.active!==arenaView||!!game.printer!==printerView){arenaView=!!game.printer?.boss.active;printerView=!!game.printer;resize();}$('repair-open').textContent=(printerControl(game)||nearbyAction(game))?.label||'⚙ 修理／再調整';actionHint.textContent=inputText(printerObjective(game)||actionObjective(game));actionHint.hidden=mode!=='playing'||!actionHint.textContent;if(actionHint.textContent!==actionHint.dataset.text){actionHint.dataset.text=actionHint.textContent;actionHint.dataset.until=String(worldTime+5);}actionHint.style.opacity=worldTime>Number(actionHint.dataset.until)?'.15':'1';const g=game;document.querySelectorAll('[data-control^=lane]').forEach(b=>b.hidden=!g.cart);document.querySelector('.gear-stat').hidden=!!g.fever;document.querySelector('.pulse-label>span').textContent=g.fever?'BURST':'PULSE';$('hearts').textContent=g.fever?'∞ INVINCIBLE':`HP ${g.player.hp}/${RULES.maxHP} · 残機 ${g.lives}`;$('hearts').style.color=g.player.hp>3?'#a5f082':g.player.hp>1?'#ffd66b':'#ff727a';$('hearts').setAttribute('aria-label',`ライフ${g.player.hp}`);$('repair-open').hidden=mode!=='playing'||!(printerControl(g)||nearbyAction(g)||nearbyRepair(g,true));$('shop-open').hidden=mode!=='playing'||!nearVendor(g);$('chip-count').textContent=String(g.fever?g.chips:g.research?.funds||0);$('gear-count').textContent=g.gears;$('relay-count').innerHTML=`ϟ <b>${g.level.relays.filter(r=>!r.optional&&r.on).length}/${g.level.relays.filter(r=>!r.optional).length}</b>`;
  const active=g.pulse>0,ready=g.cooldown<=0;$('pulse-status').textContent=active?'ACTIVE':ready?'READY':`${g.cooldown.toFixed(1)}s`;$('pulse-fill').style.width=(active?g.pulse/(g.fever?.pulseDuration||RULES.pulse):ready?1:1-g.cooldown/(g.fever?.attackCooldown||RULES.cooldown))*100+'%';$('pulse-fill').style.background=active?'#c7ffe8':ready?'#75efce':'#698c9e';$('progress-fill').style.width=g.progress*100+'%';
}
function burst(x,y,color,count=14){if(progress.reduced)count=Math.min(count,5);for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=30+Math.random()*150;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-50,size:2+Math.random()*3,color,life:.4+Math.random()*.45,max:.85});}}
function processEvents(){
 if(game.research&&!game.fever&&progress.funds!==game.research.funds){progress.funds=game.research.funds;save();}

  let repairNotice=null;for(const e of game.events){audio.sound(e.type);
    if(e.type==='repairOpen'){openRepair();}
    if(e.type==='actionStep'){burst(e.x,e.y,'#8affe0',18);audio.sound('relay');toast(e.text,4);}
    if(e.type==='repairComplete'){repairNotice=e.text;burst(e.x,e.y,'#ffd87a',35);audio.sound('relay');toast(e.text,6);}
    if(e.type==='researchRepair'&&!game.printer){repairNotice??=e.text;burst(e.x,e.y,'#80ffd0',30);toast(e.text,5);}
    if(e.type==='funds'&&e.text!=='科研費 +¥5')toast(e.text,2);
    if(e.type==='hurt')burst(e.x,e.y,'#ff787d',8);
    if(e.type==='feverKill')burst(e.x,e.y,'#ffe195',progress.reduced?5:22);
    if(e.type==='portal'){burst(e.x,e.y,'#dbb2ff',25);toast('光路がつながった！ 次のレンズへ。',3);}
    if(e.type==='boost'){burst(e.x,e.y,'#b6ff6b',30);toast('モンエナ！ 9秒間の虹色スピードアップ ×1.55',3);}
    if(e.type==='chip')burst(e.x,e.y,'#ffe0a0',6);
    if(e.type==='gear'){burst(e.x,e.y,'#9bffdc',26);toast(`ひみつのパーツを発見！ ${game.gears} / 3`,2.6);}
    if(e.type==='doublejump'||e.type==='spring')burst(e.x,e.y,'#9ffad8',10);
    if(e.type==='stomp')burst(e.x,e.y,'#efb5be',17);
    if(e.type==='pulse'){particles.push({x:e.x,y:e.y,vx:0,vy:0,ring:true,radius:progress.reduced?140:450,color:'#9affde',life:.8,max:.8});burst(e.x,e.y,'#75efce',20);}
    if(e.type==='checkpoint'){burst(e.x,e.y,'#75efce',30);toast('チェックポイント！ ライフも全回復。');}
    if(e.type==='relay'){burst(e.x,e.y,'#c8b1ff',25);toast(`制御装置を修理！ ${game.level.relays.filter(r=>r.on).length} / ${game.level.relays.length}`);}
    if(e.type==='respawn')toast(`再開！ HP ${game.player.hp}/6 · 残機 ${game.lives}`,2.4);
    if(e.type==='fall')audio.sound('hurt');
    if(e.type==='lifeLost'){progress.runLives=game.lives;save();toast(`残機 ${game.lives}。もう一度、挑戦！`,3);}
    if(e.type==='gameOver'){progress.runLives=0;save();mode='gameover';clearInput();syncUI();$('restart-run').focus({preventScroll:true});}
    if(e.type==='docked')toast('終点です！ 右へ進んで修理装置にタッチ。',5);
    if(e.type==='repairStep'&&!game.printer)toast(e.text,2);
    if(e.type==='locked')toast(game.level.boss&&!game.level.boss.repaired?'暴走ロボを止め、近くでXで再起動しよう！':'未修理の装置がある。高所の制御盤も確認しよう！',4.5);
    if(e.type==='finish')finish();
  }game.events=[];if(repairNotice)toast(repairNotice,6);
}
function tick(ms){
  const dt=lastTime?Math.min((ms-lastTime)/1000,.05):.016;lastTime=ms;worldTime+=dt;
  if(toastUntil<worldTime)$('toast').classList.remove('visible');
  if(mode==='repair'){repairUI.draw(progress.reduced?0:ms);}
  if(mode==='playing'){
    accumulator+=dt;let safety=0;
    while(accumulator>=1/120&&safety++<8&&mode==='playing'){(game.fever?updateFever:updateGame)(game,input(),1/120);interactEdge=false;jumpEdge=false;pulseEdge=false;jumpRelease=false;processEvents();accumulator-=1/120;}
    for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(!p.ring)p.vy+=150*dt;}particles=particles.filter(p=>p.life>0);updateHUD();audio.music();if(game.fever&&game.elapsed-lastFeverSave>3){lastFeverSave=game.elapsed;checkpointFever();}
  }else {accumulator=0;if(['feverIntro','feverOutro'].includes(mode)){feverAge+=dt;if(mode==='feverIntro'&&feverAge>=FEVER_CONFIG.intro){mode='playing';syncUI();canvas.focus({preventScroll:true});checkpointFever();toast(game.level.tip,5);}else if(mode==='feverOutro'&&feverAge>=FEVER_CONFIG.outro)completeFever();}}
  ctx.setTransform(1,0,0,1,0,0);
  if(mode==='home'||mode==='map'||(mode==='help'&&['home','map'].includes(previousMode))||(mode==='bonus'&&bonus?.demo)){
    ctx.save();if(VIEW.w<1050)ctx.translate(VIEW.w-1200,0);drawHome(ctx,worldTime);ctx.restore();
  }else if(game){drawWorld(ctx,game,mode==='playing'?worldTime:game.time,particles,progress.reduced);if(game.fever)drawFeverFX(ctx,game,game.time,progress.reduced);}
  if(['feverIntro','feverOutro'].includes(mode)||(mode==='paused'&&['feverIntro','feverOutro'].includes(pauseMode))){drawFeverIntro(ctx,feverAge,progress.reduced,(mode==='feverOutro'||pauseMode==='feverOutro'&&mode==='paused'),game?.fever);}
  if(mode==='bonus'&&bonus){bonus.age=(ms-bonus.startedAt)/1000;
    if(bonus.age>1.8&&!bonus.reel1){bonus.reel1=true;audio.sound('reach');}
    if(bonus.age>5.4&&!bonus.reel2){bonus.reel2=true;audio.sound('bonus');$('bonus-announcement').textContent='レバーを引け！ スペース、エンター、またはボタンで操作。';}
    $('lever-btn').hidden=bonus.age<5.4||bonus.pulled;
    if(bonus.pulled&&bonus.age-bonus.pullAge>1.35&&!bonus.won){bonus.won=true;audio.sound('jackpot');$('bonus-announcement').textContent='777！ 覚醒ハイパー、修理大成功！';if(bonus.demo)$('bonus-skip').textContent='タイトルへ戻る →';}
    ctx.fillStyle='#0a1021';ctx.fillRect(0,0,VIEW.w,600);const s=Math.min(1,VIEW.w/1200);ctx.save();ctx.translate((VIEW.w-1200*s)/2,(600-600*s)/2);ctx.scale(s,s);drawAwakening(ctx,bonus,worldTime,progress.reduced);ctx.restore();
    if(bonus.won&&bonus.age-bonus.pullAge>4.8&&!bonus.demo)endBonus();
  }
  requestAnimationFrame(tick);
}
$('restart-run').onclick=()=>{const {sound,reduced,best}=progress;progress={...blank(),sound,reduced,best};save();game=null;startLevel(0);};
$('start-btn').addEventListener('click',()=>{if(progress.runLives<=0){mode='gameover';syncUI();return;}if(progress.pending){resumePendingFever();return;}const i=progress.completed.findIndex(x=>!x);selectedStage=i<0?0:i;showMap();});
$('select-btn').addEventListener('click',selectStages);$('pause-btn').addEventListener('click',pause);$('resume-btn').addEventListener('click',resume);$('retry-btn').addEventListener('click',()=>{if(game.fever){const demo=feverDemo;beginFever(demo);checkpointFever();}else{respawn(game);processEvents();if(!game.gameOver)resume();}});
$('home-btn').addEventListener('click',goHome);$('brand').addEventListener('click',e=>{e.preventDefault();goHome();});$('next-btn').addEventListener('click',()=>{selectedStage=(game.index+1)%LEVELS.length;showMap();});$('result-home-btn').addEventListener('click',selectStages);
$('printer-hint-btn').addEventListener('click',openHelp);$('help-btn').addEventListener('click',openHelp);$('help-close').addEventListener('click',closeHelp);$('help-ok').addEventListener('click',closeHelp);
$('fullscreen-btn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('game-shell').requestFullscreen();}catch{toast('このブラウザでは全画面表示に対応していません。');}});
$('demo-btn').addEventListener('click',()=>{if(progress.sound)audio.init();startBonus(true);$('game-shell').scrollIntoView({block:'center',behavior:'smooth'});});
$('bonus-skip').addEventListener('click',endBonus);canvas.addEventListener('pointerdown',()=>{if(mode==='bonus'&&bonus.age>=5.4&&!bonus.pulled)pullLever();else if(mode==='playing')canvas.focus({preventScroll:true});});
$('fever-demo-btn').onclick=()=>{if(progress.pending)resumePendingFever();else{savedNormal=null;beginFever(true);} $('game-shell').scrollIntoView({block:'center',behavior:progress.reduced?'auto':'smooth'});};
$('enemy-guide').innerHTML=ENEMY_GUIDE.map(([,name,description])=>`<p><b>${name}</b> — ${description}</p>`).join('');
$('reduce-effects').checked=progress.reduced;$('reduce-effects').addEventListener('change',e=>{progress.reduced=e.target.checked;save();});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){lastInput='touch';document.body.dataset.input='touch';}},{passive:true});
document.addEventListener('keydown',e=>{lastInput='keyboard';document.body.dataset.input='keyboard';if(mode==='map'&&e.code==='Space'){e.preventDefault();return;}
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(['playing','feverIntro','feverOutro'].includes(mode))pause();else if(mode==='paused')resume();else if(mode==='shop')closeShop();else if(mode==='repair')closeRepair();else if(mode==='help')closeHelp();else if(mode==='bonus')endBonus();return;}
  if(mode==='bonus'&&['Space','Enter'].includes(e.code)){e.preventDefault();pullLever();return;}
  if(mode==='map'&&['ArrowLeft','ArrowRight','Enter'].includes(e.code)&&!e.target.closest('button')){e.preventDefault();if(e.code==='Enter')startLevel(selectedStage);else{selectedStage=(selectedStage+(e.code==='ArrowRight'?1:LEVELS.length-1))%LEVELS.length;renderMap();}return;}
  if(mode==='map'&&['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();selectedStage=(selectedStage+(e.code==='ArrowRight'?1:LEVELS.length-1))%LEVELS.length;renderMap();return;}
  if(mode!=='playing')return;if(e.code==='KeyC'){e.preventDefault();if(!e.repeat)requestRepair();return;}if(movementCodes.includes(e.code))e.preventDefault();if(e.repeat)return;
  if(jumpCodes.includes(e.code))jumpEdge=true;if(['KeyX','ShiftLeft','ShiftRight'].includes(e.code))pulseEdge=true;if(e.code==='KeyR'&&!game.fever){e.preventDefault();respawn(game);processEvents();}
  pressed.add(e.code);
});
document.addEventListener('keyup',e=>{pressed.delete(e.code);if(jumpCodes.includes(e.code)&&!jumpCodes.some(k=>pressed.has(k))&&!touch.has('jump'))jumpRelease=true;});
touchController=bindTouchControls({
  buttons:[...document.querySelectorAll('[data-control]')],root:$('touch-controls'),doc:document,win:window,
  isPlaying:()=>mode==='playing',onStart:()=>{lastInput='touch';document.body.dataset.input='touch';if(progress.sound)audio.init();},
  onChange:(key,down)=>{
    if(down){touch.add(key);if(key==='jump')jumpEdge=true;if(key==='pulse')pulseEdge=true;if(key==='action')queueMicrotask(contextAction);}
    else{touch.delete(key);if(key==='jump'&&!jumpCodes.some(k=>pressed.has(k)))jumpRelease=true;}
  }
});
const orientation=matchMedia('(orientation: landscape)');
orientation.addEventListener('change',()=>{clearInput();pause();requestAnimationFrame(resize);});
window.addEventListener('pagehide',checkpointFever);
window.addEventListener('blur',()=>{clearInput();if(['playing','feverIntro','feverOutro'].includes(mode))pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(['playing','feverIntro','feverOutro'].includes(mode))pause();}else lastTime=0;});
// Keep keyboard navigation inside the active modal.
document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){lastInput='touch';document.body.dataset.input='touch';}},{passive:true});
document.addEventListener('keydown',e=>{lastInput='keyboard';document.body.dataset.input='keyboard';if(mode==='map'&&e.code==='Space'){e.preventDefault();return;}if(e.key!=='Tab')return;const modal=document.querySelector('.modal-overlay:not([hidden])');if(!modal)return;const list=[...modal.querySelectorAll('button,input,select')].filter(el=>!el.disabled&&!el.hidden),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});

function closeShop(){mode='playing';clearInput();syncUI();canvas.focus({preventScroll:true});accumulator=0;}
function renderShop(){
 $('shop-balance').textContent=`科研費 ¥${game.research.funds}`;
 $('shop-items').replaceChildren();
 for(const item of GOODS){const b=document.createElement('button');b.className='secondary-btn';b.textContent=`${item.name} — ¥${item.cost}`;b.disabled=game.research.funds<item.cost;b.onclick=()=>{const result=purchase(game,item.id);$('shop-message').textContent=result.text;progress.funds=game.research.funds;progress.runLives=game.lives;save();renderShop();updateHUD();};$('shop-items').append(b);}
}
$('shop-open').onclick=()=>{if(mode!=='playing'||!nearVendor(game))return;mode='shop';clearInput();syncUI();$('shop-message').textContent='通常の修理は無料。購入はすべて任意です。';renderShop();$('shop-close').focus();};
$('shop-close').onclick=closeShop;

function openRepair(){
 if(!game?.repairSession&&!beginRepair(game))return;
 mode='repair';clearInput();syncUI();repairUI.show(game);
}
function closeRepair(){if(!game)return;game.repairSession=null;mode='playing';clearInput();syncUI();canvas.focus({preventScroll:true});accumulator=0;}
const repairUI=createRepairUI($('game').parentElement,{
 close:closeRepair,
 spend(amount){if(game.research.funds<amount)return false;game.research.funds-=amount;progress.funds=game.research.funds;save();updateHUD();return true;},
 commit(){const result=commitRepair(game);if(result.ok){tickResearch(game);processEvents();closeRepair();updateHUD();}return result;},
 assist(){const r=game.level.relays.find(r=>r.id===game.repairSession?.id);if(!r||r.on){repairUI.feedback('復旧済みです。完全修理は調整で達成できます。');return;}if(game.research.funds<80){repairUI.feedback('科研費が足りません。手動修理は無料です。');return;}game.research.funds-=80;r.on=true;r.repairRank=1;r.repairResult='応急修理';r.step=3;r.amount=6;tickResearch(game);processEvents();closeRepair();updateHUD();toast('応急修理で装置復旧。完全修理にはもう一度調整できます。',5);}
});
function requestRepair(){if(printerControl(game)||nearbyAction(game))interactEdge=true;else openRepair();}
$('repair-open').onclick=()=>{if(mode==='playing')requestRepair();};
const actionHint=document.createElement('div');actionHint.className='action-repair-hint';actionHint.hidden=true;canvas.parentElement.append(actionHint);
if(progress.runLives<=0)mode='gameover';syncSound();renderCards();syncUI();save();requestAnimationFrame(tick);
