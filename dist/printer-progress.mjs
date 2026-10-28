// Goals and locked-door explanations read the same live state as transitions.
import {gateStatus,gateText} from './gate-status.mjs?v=4.9b';
export function configurePrinterGates(L){
 const check=(id,label,path,hint,extra={})=>({id,label,path,hint,...extra});
 const bc=L.doors.find(d=>d.id==='bc');bc.checks=[check('nozzle','ノズル詰まりを除去','printer.nozzle.done','逆転・温調後、詰まりをつかんで左へ引く')];
 const cd=L.doors.find(d=>d.id==='cd');cd.checks=[check('peel','3DBenchyを剥がす','printer.peeling.targets.benchy.done','スクレーパーで床のベンチーを剥がそう'),check('runaway','暴走造形を停止','printer.journey.runawaySolved','C2の非常用巻戻しを操作しよう',{when:'printer.incident'})];
 // Readable relay labels are gate-specific; relay identities/rewards stay unchanged.
 for(const d of L.doors)d.gateLabels={feed:'材料供給を復旧',drive:'ギア駆動を復旧',print:'造形橋を完成',cool:'冷却設備を復旧'};
 L.lowerAreas=L.rooms.map(r=>({room:r.id,kind:['B','C'].includes(r.id)?'exploration':'pit',floorY:['B','C'].includes(r.id)?680:null,fallY:755}));
}
export function printerGoal(g){if(!g?.printer)return '';const s=g.printer,b=s.boss,room=g.rooms.active;
 if(b.done)return '夜明けの研究室の出口へ';
 if(b.active){if(!s.peeling.targets.support.done)return b.age<9?'ドラゴンを造形中':'ドラゴンの支持材を剥がす';if(!b.infected&&b.story)return 'コアが侵入中';if(b.phase<3)return '攻撃後の頭部を狙う';if(!b.feed&&!b.route)return '拘束用の材料を供給';if(!b.route)return '中央へ誘導し、拘束経路へ切替';if(b.frame<1)return '拘束ケージを造形中';return b.cooled?'高所のコアを撃破':'拘束ケージを冷却';}
 if(room==='S')return '試作品を探索（任意）';
 if(!g.level.relays.find(r=>r.id==='feed').on)return 'スプールか重りを重量プレートへ';
 if(!s.chase.done)return '巨大スプールを供給ホルダーへ運ぶ';
 if(!g.level.relays.find(r=>r.id==='drive').on)return s.carried==='gear'?'ギアをソケットへ運ぶ':s.gear?'駆動レバーを起動':'搬送ダクトで交換ギアを探す';
 if(!s.nozzle.done)return 'ノズル詰まりを除去';
 if(room==='C2'){const id=['maze-stairs','maze-bridge','maze-ramp'].find(id=>s.journey.sites[id].progress<1);if(id)return { 'maze-stairs':'階段を造形して上層へ','maze-bridge':'橋を造形して対岸へ','maze-ramp':'搬送坂を造形して制御室へ'}[id];if(!s.safety)return '上部制御室の安全装置を復旧';if(!s.journey.runawaySolved)return '非常用巻戻しで暴走造形を停止';}
 if(!s.peeling.targets.benchy.done)return g.equipment.weapon?.id==='scraper'?'造形床のベンチーを剥がす':'スクレーパーを入手';
 if(!g.level.relays.find(r=>r.id==='print').on)return s.safety?'造形レバーを橋にして造形':'上部制御室の安全装置を復旧';
 if(s.incident&&!s.journey.runawaySolved)return '上部制御室で暴走造形を停止';
 if(!s.fans[0])return '階段を造形し、冷却ファンへ配線';
 if(!s.fans[1])return '冷却塔の送風方向を調整';
 if(!g.level.relays.find(r=>r.id==='cool').on)return '冷却の安全インターロックを起動';
 return '補給を済ませ、ドラゴンの隔壁へ';
}
export function printerGuidance(g,door){if(door&&!gateStatus(g,door).ready)return gateText(g,door);return '目的：'+printerGoal(g)+(g.time<g.printer.hintUntil?'\n'+g.printer.hintText:'');}
