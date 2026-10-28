// Each contact owns its input. Releasing one finger must not release another.
export function bindTouchControls({buttons,root,doc,win,isPlaying,onChange,onStart}) {
  const contacts=new Map(),active=new Set();
  const sync=()=>{
    const next=new Set([...contacts.values()].map(v=>v.key).filter(Boolean));
    for(const key of active)if(!next.has(key))onChange(key,false);
    for(const key of next)if(!active.has(key))onChange(key,true);
    active.clear();for(const key of next)active.add(key);
    for(const b of buttons){const down=active.has(b.dataset.control);b.classList.toggle('pressed',down);b.setAttribute('aria-pressed',String(down));}
  };
  const release=id=>{const old=contacts.get(id);if(!old)return;contacts.delete(id);sync();try{if(old.owner.hasPointerCapture(id))old.owner.releasePointerCapture(id);}catch{ /* Capture may already be cancelled by Safari. */ }};
  const clear=()=>{for(const id of [...contacts.keys()])release(id);};
  const suppress=e=>{if(e.cancelable)e.preventDefault();};
  const hit=(x,y)=>{const b=doc.elementFromPoint(x,y)?.closest('[data-control]');return buttons.includes(b)&&!b.hidden&&!b.disabled?b.dataset.control:null;};
  for(const b of buttons){
    b.addEventListener('pointerdown',e=>{
      suppress(e);if(b.disabled||!isPlaying()||(e.pointerType==='mouse'&&e.button!==0))return;
      contacts.set(e.pointerId,{key:b.dataset.control,owner:b});sync();
      try{b.setPointerCapture(e.pointerId);}catch{ /* Document listeners still release it. */ }
      onStart?.();
    });
    b.addEventListener('lostpointercapture',e=>release(e.pointerId));
  }
  doc.addEventListener('pointermove',e=>{
    const contact=contacts.get(e.pointerId);if(!contact)return;
    suppress(e);
    if(!isPlaying()||(e.pointerType==='mouse'&&e.buttons===0)){release(e.pointerId);return;}
    contact.key=hit(e.clientX,e.clientY);sync();
  },{passive:false});
  for(const type of ['pointerup','pointercancel'])doc.addEventListener(type,e=>release(e.pointerId),true);
  // Fallback for browsers that end a native gesture without the expected pointerup.
  doc.addEventListener('touchend',e=>{if(e.touches.length===0)clear();},{passive:true});
  doc.addEventListener('touchcancel',clear,{passive:true});
  for(const type of ['contextmenu','selectstart','dragstart'])root.addEventListener(type,e=>{suppress(e);clear();});
  win.addEventListener('blur',clear);win.addEventListener('pagehide',clear);
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)clear();});
  return {clear};
}
