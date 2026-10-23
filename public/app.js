import {reelSVG,frameIndices,mod,FRAME_COUNT} from './reel.js';
const $ = selector => document.querySelector(selector);
let collections=[], active, step=0, start=0, busy=false, interacted=false, queuedReel=null, queuedDirection=0;
const positions={};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,reduced?0:ms));
const headline=text=>String(text||'A view from the reel').replace(/\\U[0-9a-fA-F]{8}/g,'').trim();
const safeURL=url=>{try{const u=new URL(url,location.origin);return ['https:','http:'].includes(u.protocol)?u.href:'#';}catch{return '#'}};

function selected(){return active.items[mod(start+step,active.items.length)];}
function updateSelection(announce=true){
  const item=selected(), index=mod(start+step,active.items.length);
  const pending=!!item.placeholder;
  $('#counter').textContent=`${String(index+1).padStart(2,'0')} / ${String(active.items.length).padStart(2,'0')}`;
  $('#viewer-label').textContent=active.label;
  $('#viewer-frame').textContent=String(index+1).padStart(2,'0');
  $('#selected-title').textContent=headline(item.title);
  const image=$('#selected-image');
  $('#photo-link').classList.toggle('natural-size',(active.key==='instagram'||item.portrait===true||item.preserveFullImage===true)&&!!item.image);
  image.hidden=!item.image;
  $('#empty-photo').hidden=!!item.image;
  if(item.image){image.src=safeURL(item.image);image.alt=item.imageAlt||headline(item.title);image.classList.toggle('portrait',active.key==='instagram'||item.portrait===true);}
  else{$('#empty-location').textContent=active.label;}
  const destination=pending?active.url:safeURL(item.url);
  for(const anchor of [$('#photo-link'),$('#destination')]){
    if(destination&&destination!=='#'){anchor.href=destination;anchor.removeAttribute('aria-disabled');}
    else{anchor.removeAttribute('href');anchor.setAttribute('aria-disabled','true');}
  }
  $('#photo-link').setAttribute('aria-label',pending?`${active.label}: awaiting your photographs`:`${active.action}: ${headline(item.title)} (opens in a new tab)`);
  $('#destination').textContent=destination?`${active.action} ↗`:'Destination coming soon';
  $('#collection-note').textContent=pending?'A curated collection is on its way.':active.description;
  $('#empty-brand').textContent='THE GLOW UP FOUND';
  $('#empty-photo small').textContent='Your photographs will appear here';
  if(announce)$('#announcement').textContent=`${active.label}. ${pending?'Awaiting photographs.':`Picture ${index+1} of ${active.items.length}.`} ${headline(item.title)}`;
  positions[active.key]=index;
  const next=active.items[mod(index+1,active.items.length)];if(next?.image){const preload=new Image();preload.src=next.image;}
}
function renderSpareReels(){
  const holder=$('#spare-reels');holder.replaceChildren();
  // The far reel is Instagram initially; the nearest is Homebody, matching the approved mockup.
  const spare=collections.filter(c=>c!==active).sort((a,b)=>b.number-a.number);
  for(const collection of spare){
    const button=document.createElement('button');button.className='spare';
    button.setAttribute('aria-label',`Load ${collection.label} reel`);
    button.dataset.collection=collection.key;
    button.innerHTML=reelSVG(collection,`spare-${collection.key}`,positions[collection.key]);
    button.addEventListener('click',()=>loadReel(collection.key));holder.append(button);
  }
}
function mountReel(){
  $('#loaded-reel').innerHTML=reelSVG(active,'active',start,true);
  renderSpareReels();updateSelection(false);
}
async function advance(direction=1){
  if(!active.items.length)return;
  if(busy){queuedDirection=direction;return;}
  interacted=true;
  busy=true;$('#advance').setAttribute('aria-disabled','true');
  step+=direction;
  // Only the slot on the hidden, lower part of the disc is reassigned as the collection loops.
  const indices=frameIndices(step,start,active.items.length);
  document.querySelectorAll('#loaded-reel [data-slot]').forEach((node,i)=>{const item=active.items[indices[i]];node.setAttribute('href',item.image||'/assets/unexposed.svg');node.setAttribute('preserveAspectRatio',item.portrait||item.preserveFullImage?'xMidYMid meet':'xMidYMid slice');});
  $('#loaded-reel .rotor').style.transform=`rotate(${-step*360/FRAME_COUNT}deg)`;
  $('.viewer').classList.add('advancing');$('.selected-view').classList.add('changing');
  await sleep(160);updateSelection();$('.selected-view').classList.remove('changing');
  await sleep(380);$('.viewer').classList.remove('advancing');busy=false;$('#advance').removeAttribute('aria-disabled');drainQueue();
}
function drainQueue(){if(queuedReel){const key=queuedReel;queuedReel=null;queuedDirection=0;loadReel(key);}else if(queuedDirection){const direction=queuedDirection;queuedDirection=0;advance(direction);}}
async function loadReel(key){
  const target=collections.find(c=>c.key===key);if(target===active||!target?.items.length)return;
  if(busy){queuedReel=key;return;}
  interacted=true;
  busy=true;$('.viewer').classList.add('swapping');$('.selected-view').classList.add('changing');
  await sleep(280);active=target;step=0;start=positions[key];mountReel();
  $('.viewer').classList.remove('swapping');$('.selected-view').classList.remove('changing');
  updateSelection();await sleep(300);busy=false;$('#advance').focus({preventScroll:true});drainQueue();
}
$('#advance').addEventListener('click',()=>advance());$('#next').addEventListener('click',()=>advance());$('#previous').addEventListener('click',()=>advance(-1));
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}
});
$('#selected-image').addEventListener('error',()=>{
  // Keep the selected link usable even if a remote image has expired.
  $('#selected-image').hidden=true;$('#empty-photo').hidden=false;$('#empty-location').textContent=headline(selected().title);$('#empty-photo small').textContent='Open the original to see this picture';
});
let pointerStart=null;
$('.viewer').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')pointerStart={x:e.clientX,y:e.clientY};});
$('.viewer').addEventListener('pointerup',e=>{if(!pointerStart)return;const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)advance(dx<0?1:-1);});
async function init(){
  const response=await fetch('/data/site.json');if(!response.ok)throw Error('Configuration unavailable');
  const config=await response.json();
  collections=await Promise.all(config.collections.map(async c=>{
    const response=await fetch(`/data/${c.key}.json`);if(!response.ok)throw Error('Collection unavailable');
    const data=await response.json();positions[c.key]=0;
    return {...c,items:data.items.length?data.items:[{id:`${c.key}-pending`,title:c.description,image:null,url:null,placeholder:true}]};
  }));
  active=collections[0];
  const params=new URLSearchParams(location.search);active=collections.find(c=>c.key===params.get('reel'))||active;
  for(const c of collections){
    const link=document.createElement('a');link.className='direct-link';
    const name=document.createElement('span');name.textContent=c.label;
    const detail=document.createElement('small');detail.textContent=c.description;
    const state=document.createElement('span');state.className='link-state';state.textContent=c.url?'Explore ↗':'Link coming soon';
    link.append(name,detail,state);
    if(c.url){link.href=safeURL(c.url);link.target='_blank';link.rel='noopener noreferrer';}
    else link.setAttribute('aria-disabled','true');
    $('#destination-links').append(link);
  }
  mountReel();
}
init().catch(()=>{$('#selected-title').textContent='The reels are taking a moment to load.';$('#collection-note').textContent='Please refresh to try again.';});
