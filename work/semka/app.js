'use strict';
window.portfolioImage=id=>window.PORTFOLIO_IMAGES?.[id]||`assets/${id}.jpg`;
const photos = [
 {id:'25a9ab93e4919209',title:'Тихий момент',alt:'Девушка с каре и книгами на улице'},
 {id:'1e337f6d5f7fc2ca',title:'Ритм города',alt:'Девушка с наушниками на шее'},
 {id:'830a13c07c34c931',title:'Взгляд',alt:'Крупный портрет девушки на фоне города'},
 {id:'84ba46a141a726f9',title:'Цвет и характер',alt:'Улыбающаяся девушка в бирюзовом жилете'},
 {id:'85d349d6d2d17cfb',title:'В движении',alt:'Девушка в чёрном плаще у витрины'},
 {id:'44b32cdb85a033bf',title:'Мимоходом',alt:'Девушка в белом топе и коричневой юбке'},
 {id:'39d91efa73b89d32',title:'В своём свете',alt:'Профиль девушки со светлыми волосами'},
 {id:'b9af120dbc3943b3',title:'Среди улиц',alt:'Городской портрет девушки в чёрном'},
 {id:'f9c6d139d84cddf8',title:'Встреча',alt:'Портрет из публикации фотографа Семёна'},
 {id:'ea6ce82980fa43d8',title:'На ходу',alt:'Портрет из публикации фотографа Семёна'},
 {id:'d9a150b3fb0d79e7',title:'Здесь и сейчас',alt:'Портрет из публикации фотографа Семёна'}
];
window.portfolioPhotos=photos;
const $=s=>document.querySelector(s);
const reduce=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:600px)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const galleryIndices=[1,2,3,4,5,6,7],categories={0:'portrait',1:'city',2:'portrait',3:'style',4:'style',5:'city',6:'portrait',7:'city'};
const labels={portrait:'Портрет',city:'В городе',style:'Образ'};
const section=$('.work-section'),track=$('#photo-rail'),windowEl=$('.rail-window');
let paused=false,motion=!reduce.matches,grid=false,active=0,visibleIndices=galleryIndices.slice(),filter='all',scrollFrame=0,suppressClickUntil=0,drag=null,scrollTarget=null;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
track.innerHTML=galleryIndices.map(i=>{const p=photos[i];return `<figure class="rail-card" data-card="${i}"><button class="photo-button" data-index="${i}" aria-label="Рассмотреть кадр: ${p.title}"><img src="${window.portfolioImage(p.id)}" alt="${p.alt}" width="360" height="640" loading="lazy" decoding="async" draggable="false"></button><figcaption><span>${p.title}</span><span>${labels[categories[i]]}</span></figcaption></figure>`}).join('');
function visibleCards(){return [...track.children].filter(el=>!el.hidden)}
function updateRail(){
 const cards=visibleCards(),pad=parseFloat(getComputedStyle(track).paddingLeft);
 if(!grid&&!drag){
  if(scrollTarget!==null){active=clamp(scrollTarget,0,cards.length-1);const goal=Math.max(0,cards[active].offsetLeft-pad);if(Math.abs(windowEl.scrollLeft-goal)<3)scrollTarget=null}
  else{const lead=windowEl.scrollLeft+pad;let best=Infinity;cards.forEach((c,i)=>{const d=Math.abs(c.offsetLeft-lead);if(d<best){best=d;active=i}})}
 }
 const count=visibleIndices.length;active=clamp(active,0,count-1);$('#rail-counter').textContent=`${active+1} / ${count}`;$('#rail-prev').disabled=active===0;$('#rail-next').disabled=active===count-1;
 $('.rail-progress').style.setProperty('--rail-progress',`${count>1?active/(count-1)*455:0}%`);
 const key=String(visibleIndices[active]);if(document.body.dataset.galleryPhoto!==key){document.body.dataset.galleryPhoto=key;document.dispatchEvent(new Event('portfolio-frame'))}
}
function measure(){updateRail();render()}
function render(){
 scrollFrame=0;const y=scrollY;document.body.classList.toggle('has-scrolled',y>80);const max=document.documentElement.scrollHeight-innerHeight;$('.page-progress').style.transform=`scaleX(${max>0?clamp(y/max):0})`;
 const hp=clamp(y/$('.hero').offsetHeight);window.portfolioScroll=motion?hp:0;if(motion){$('.hero-content').style.transform=`translateY(${hp*45}px)`;$('.hero-content').style.opacity=1-hp*.85}
 $('.encounter').style.setProperty('--story-p',1);
 document.querySelectorAll('.bio-paragraph').forEach(el=>{if(!motion||el.getBoundingClientRect().top<innerHeight*.82)el.classList.add('is-read')});
}
function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(render)}
addEventListener('scroll',onScroll,{passive:true});windowEl.addEventListener('scroll',updateRail,{passive:true});addEventListener('resize',measure,{passive:true});mobile.addEventListener('change',measure);
function changeMotion(){motion=!reduce.matches&&!paused;window.portfolioMotionEnabled=motion;document.body.classList.toggle('static-motion',!motion);document.body.classList.toggle('js-motion',motion);$('.motion-toggle').textContent=reduce.matches?'Движение отключено':paused?'Включить движение':'Остановить движение';$('.motion-toggle').setAttribute('aria-pressed',String(!motion));$('.motion-toggle').disabled=reduce.matches;if(!motion){$('.hero-content').style.removeProperty('transform');$('.hero-content').style.removeProperty('opacity')}document.dispatchEvent(new CustomEvent('portfolio-motion',{detail:{enabled:motion}}));measure()}
$('.motion-toggle').onclick=()=>{paused=!paused;changeMotion()};reduce.addEventListener('change',changeMotion);
function toCard(index){if(grid)return;const cards=visibleCards();active=clamp(index,0,cards.length-1);scrollTarget=active;const pad=parseFloat(getComputedStyle(track).paddingLeft);windowEl.scrollTo({left:Math.max(0,cards[active].offsetLeft-pad),behavior:motion?'smooth':'instant'});updateRail()}
$('#rail-prev').onclick=()=>toCard(active-1);$('#rail-next').onclick=()=>toCard(active+1);
windowEl.addEventListener('keydown',e=>{if(e.target!==windowEl)return;if(e.key==='ArrowRight'){e.preventDefault();toCard(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();toCard(active-1)}});
windowEl.addEventListener('pointerdown',e=>{if(grid||e.pointerType!=='mouse'||e.button!==0)return;scrollTarget=null;drag={x:e.clientX,left:windowEl.scrollLeft,id:e.pointerId,moved:false}});
windowEl.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const delta=e.clientX-drag.x;if(!drag.moved&&Math.abs(delta)>7){drag.moved=true;windowEl.classList.add('is-dragging');windowEl.setPointerCapture(e.pointerId);$('.photo-cursor').classList.remove('active')}if(drag.moved){e.preventDefault();windowEl.scrollLeft=drag.left-delta}});
function endDrag(){if(!drag)return;const moved=drag.moved,id=drag.id;drag=null;if(moved)suppressClickUntil=performance.now()+350;windowEl.classList.remove('is-dragging');if(windowEl.hasPointerCapture(id))windowEl.releasePointerCapture(id);updateRail()}
windowEl.addEventListener('wheel',()=>scrollTarget=null,{passive:true});windowEl.addEventListener('touchstart',()=>scrollTarget=null,{passive:true});windowEl.addEventListener('pointerup',endDrag);windowEl.addEventListener('pointercancel',endDrag);windowEl.addEventListener('lostpointercapture',endDrag);windowEl.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)endDrag()});
windowEl.addEventListener('click',e=>{if(e.detail>0&&performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
$('#archive-toggle').onclick=()=>{grid=!grid;scrollTarget=null;section.classList.toggle('is-grid',grid);$('#archive-toggle').setAttribute('aria-pressed',String(grid));$('#archive-toggle').innerHTML=`${grid?'Листать кадры':'Все сразу'} <span class="plus" aria-hidden="true">${grid?'−':'+'}</span>`;windowEl.scrollTo({left:0,behavior:'instant'});active=0;measure()};
function applyFilter(value){filter=value;scrollTarget=null;visibleIndices=galleryIndices.filter(i=>value==='all'||categories[i]===value);track.querySelectorAll('[data-card]').forEach(el=>el.hidden=!visibleIndices.includes(Number(el.dataset.card)));document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===value)));windowEl.scrollTo({left:0,behavior:'instant'});active=0;$('#gallery-summary').textContent=`${visibleIndices.length} ${visibleIndices.length===1?'кадр':visibleIndices.length<5?'кадра':'кадров'}`;measure()}
document.querySelectorAll('[data-filter]').forEach(b=>{const value=b.dataset.filter,count=galleryIndices.filter(i=>value==='all'||categories[i]===value).length;b.querySelector('span').textContent=count;b.onclick=()=>applyFilter(value)});
const viewer=$('#viewer'),image=$('#full-image');let viewSet=[],viewPos=0,opener=null,imageToken=0;
function renderViewer(position,direction=0){
 resetPhotoTilt();
 viewPos=(position+viewSet.length)%viewSet.length;const index=viewSet[viewPos],p=photos[index],token=++imageToken;viewer.dataset.photoIndex=index;document.dispatchEvent(new Event('portfolio-frame'));
 image.src=window.portfolioImage(p.id);image.alt=p.alt;$('#counter').textContent=`${viewPos+1} / ${viewSet.length}`;$('#photo-caption').textContent=p.title;$('#photo-category').textContent=labels[categories[index]]||'Портрет';$('#prev').disabled=$('#next').disabled=viewSet.length<2;
 $('#viewer-help').textContent=viewSet.length>1?(mobile.matches?'Листайте свайпом или кнопками':'Клавиши или кнопки · Esc — закрыть'):(mobile.matches?'Нажмите «Вернуться», чтобы закрыть кадр':'Esc или кнопка «Вернуться»');viewer.dataset.count=viewSet.length;
 const indexEl=$('#viewer-index'),indexKey=viewSet.join(',');if(indexEl.dataset.key!==indexKey){indexEl.innerHTML=viewSet.map((i,n)=>`<button aria-label="Кадр: ${photos[i].title}" data-view-position="${n}">${n+1}</button>`).join('');indexEl.dataset.key=indexKey;indexEl.querySelectorAll('button').forEach(b=>b.onclick=()=>renderViewer(Number(b.dataset.viewPosition),Number(b.dataset.viewPosition)>viewPos?1:-1))}indexEl.querySelectorAll('button').forEach((b,n)=>{if(n===viewPos)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
 const animate=()=>{if(token===imageToken&&motion&&!photoDrag)image.animate([{opacity:.2,transform:`translateX(${direction*18}px)`},{opacity:1,transform:'translateX(0)'}],{duration:240,easing:'ease-out'})};
 if(image.decode)image.decode().then(animate).catch(()=>{});else animate();
}
function openViewer(index,button){opener=button;viewSet=galleryIndices.includes(index)?visibleIndices.slice():[index];renderViewer(Math.max(0,viewSet.indexOf(index)));viewer.showModal();document.body.classList.add('locked');$('.photo-cursor').classList.remove('active')}
document.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>openViewer(Number(b.dataset.index),b));$('#viewer-close').onclick=()=>viewer.close();$('#prev').onclick=()=>renderViewer(viewPos-1,-1);$('#next').onclick=()=>renderViewer(viewPos+1,1);
viewer.addEventListener('close',()=>{resetPhotoTilt();document.body.classList.remove('locked');opener?.focus({preventScroll:true})});viewer.addEventListener('keydown',e=>{if(viewSet.length<2)return;if(e.key==='ArrowRight'){e.preventDefault();renderViewer(viewPos+1,1)}if(e.key==='ArrowLeft'){e.preventDefault();renderViewer(viewPos-1,-1)}});
// Tilt the surrounding plane; image translation remains free for swipe gestures.
const photoPlane=$('.viewer-photo'),photoStage=$('.viewer-stage');let tiltRaf=0,tiltX=0,tiltY=0,stagePress=null;
photoStage.addEventListener('pointerdown',e=>{stagePress={x:e.clientX,y:e.clientY}});
photoStage.onclick=e=>{if(e.target===photoStage&&stagePress&&Math.hypot(e.clientX-stagePress.x,e.clientY-stagePress.y)<6)viewer.close();stagePress=null};
function resetPhotoTilt(){if(tiltRaf)cancelAnimationFrame(tiltRaf);tiltRaf=0;tiltX=tiltY=0;if(photoPlane){photoPlane.style.setProperty('--tilt-x','0deg');photoPlane.style.setProperty('--tilt-y','0deg')}}
photoStage.addEventListener('pointermove',e=>{if(!motion||!fine.matches||e.pointerType==='touch'||photoDrag||!viewer.open)return;const r=photoStage.getBoundingClientRect();tiltY=clamp((e.clientX-r.left)/r.width)*2-1;tiltX=clamp((e.clientY-r.top)/r.height)*2-1;if(!tiltRaf)tiltRaf=requestAnimationFrame(()=>{tiltRaf=0;photoPlane.style.setProperty('--tilt-x',`${-tiltX*3.2}deg`);photoPlane.style.setProperty('--tilt-y',`${tiltY*4.2}deg`)})},{passive:true});
photoStage.addEventListener('pointerleave',resetPhotoTilt);photoStage.addEventListener('pointerdown',resetPhotoTilt);viewer.addEventListener('pointerleave',resetPhotoTilt);document.addEventListener('portfolio-motion',resetPhotoTilt);
let photoDrag=null;
image.addEventListener('pointerdown',e=>{if(viewSet.length<2||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0))return;photoDrag={x:e.clientX,y:e.clientY,id:e.pointerId,dx:0,horizontal:false};image.getAnimations().forEach(a=>a.cancel());image.setPointerCapture(e.pointerId)});
image.addEventListener('pointermove',e=>{if(!photoDrag||photoDrag.id!==e.pointerId)return;const dx=e.clientX-photoDrag.x,dy=e.clientY-photoDrag.y;photoDrag.dx=dx;if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy))photoDrag.horizontal=true;if(photoDrag.horizontal){e.preventDefault();image.style.transform=`translateX(${dx*.16}px)`}});
function finishPhotoDrag(e,cancelled=false){if(!photoDrag||e.pointerId!==photoDrag.id)return;const state=photoDrag,dx=e.clientX-state.x,dy=e.clientY-state.y;photoDrag=null;if(image.hasPointerCapture(e.pointerId))image.releasePointerCapture(e.pointerId);image.style.transform='';if(!cancelled&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){renderViewer(viewPos+(dx<0?1:-1),dx<0?1:-1)}else if(motion&&state.horizontal){image.animate([{transform:`translateX(${state.dx*.16}px)`},{transform:'translateX(0)'}],{duration:180,easing:'ease-out'})}}
image.addEventListener('pointerup',e=>finishPhotoDrag(e));image.addEventListener('pointercancel',e=>finishPhotoDrag(e,true));image.addEventListener('lostpointercapture',()=>{if(photoDrag){photoDrag=null;image.style.transform=''}});
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.2});document.querySelectorAll('.reveal-lines').forEach(el=>observer.observe(el));
const cursor=$('.photo-cursor');document.querySelectorAll('.photo-button').forEach(el=>{el.addEventListener('pointerenter',e=>{if(motion&&fine.matches&&!drag?.moved){cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;cursor.classList.add('active')}});el.addEventListener('pointerleave',()=>cursor.classList.remove('active'));el.addEventListener('pointermove',e=>{cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`})});
const menu=$('#site-menu'),menuToggle=$('.menu-toggle');let menuClosing=false,menuTimer=0;
menuToggle.setAttribute('aria-expanded','false');
menuToggle.onclick=()=>{clearTimeout(menuTimer);menuClosing=false;menu.classList.remove('is-closing');menu.showModal();document.body.classList.add('locked');menuToggle.setAttribute('aria-expanded','true')};
function closeMenu(destination){if(menuClosing)return;menuClosing=true;menu.classList.add('is-closing');const finish=()=>{menu.close();if(destination){const target=$(destination);if(target){target.scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});history.replaceState(null,'',destination);target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}}else menuToggle.focus({preventScroll:true})};menuTimer=setTimeout(finish,motion?470:0)}
$('#menu-close').onclick=()=>closeMenu();menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu()});menu.addEventListener('close',()=>{clearTimeout(menuTimer);menuClosing=false;menu.classList.remove('is-closing');document.body.classList.remove('locked');menuToggle.setAttribute('aria-expanded','false')});menu.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();closeMenu(a.getAttribute('href'))}));
menu.addEventListener('pointermove',e=>{if(!motion||!fine.matches)return;menu.style.setProperty('--lens-x',`${(e.clientX/innerWidth-.5)*22}px`);menu.style.setProperty('--lens-y',`${(e.clientY/innerHeight-.5)*22}px`)});
const moods=[['Тихий портрет','Взгляд, мягкий свет и всё внимание — вам.','Привет, Семён! Хочу обсудить спокойную портретную съёмку. Нравятся естественные кадры и мягкий свет.'],['Прогулка по городу','Знакомая улица, новый маршрут и вы в своём ритме.','Привет, Семён! Хочу съёмку-прогулку по городу. Нравятся живые уличные портреты. Давай обсудим идею и место.'],['Смелый образ','Характер в кадре: фактуры, движение и выразительный образ.','Привет, Семён! Есть идея съёмки с выразительным образом. Хочу обсудить одежду, настроение и локацию.']];let selectedMood=0;
document.querySelectorAll('[data-mood]').forEach(el=>el.onclick=()=>{selectedMood=Number(el.dataset.mood);document.querySelectorAll('[data-mood]').forEach(c=>{c.classList.toggle('is-selected',c===el);c.setAttribute('aria-pressed',String(c===el))});$('#mood-description').textContent=moods[selectedMood][1];$('#copy-status').textContent='';document.dispatchEvent(new Event('portfolio-frame'))});
$('#copy-idea').onclick=async()=>{const text=moods[selectedMood][2];try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Идея скопирована. Можно отправить её в директ.'}catch{$('#copy-status').textContent=text}};
$('.contact').addEventListener('pointermove',e=>{if(!motion||!fine.matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--contact-x',`${e.clientX-r.left}px`);e.currentTarget.style.setProperty('--contact-y',`${e.clientY-r.top}px`)});
changeMotion();addEventListener('load',measure,{once:true});document.fonts?.ready.then(measure);
