// Shared source for gate collision/transition permission and player-facing requirements.
const valueAt=(root,path)=>path.split('.').reduce((v,k)=>v?.[k],root);
export function gateStatus(g,door){
 const checks=(door.requires||[]).map(id=>({id,hint:door.gateHints?.[id],label:door.gateLabels?.[id]||g.level.relays.find(r=>r.id===id)?.label||id,done:!!g.level.relays.find(r=>r.id===id)?.on}));
 for(const spec of door.checks||[]){const value=valueAt(g,spec.path);checks.push({...spec,done:spec.when&&!valueAt(g,spec.when)?true:spec.equals===undefined?!!value:value===spec.equals});}
 if(door.requiresChase)checks.push({id:'chase',label:'巨大スプールを充填',done:!!g.printer?.chase.done});
 if(door.requiresBoss)checks.push({id:'boss',label:'コアを停止',done:!!g.printer?.boss.done});
 return {ready:checks.every(c=>c.done),checks,next:checks.find(c=>!c.done)};
}
export function gateText(g,door){const s=gateStatus(g,door);return [door.to+'：'+(g.level.rooms?.find(r=>r.id===door.to)?.name||'搬送ゲート'),...s.checks.map(c=>(c.done?'✓ ':'× ')+c.label),s.next?.hint|| (s.ready?'ACTIONで進む':'未完了の装置を復旧')].join('\n');}
