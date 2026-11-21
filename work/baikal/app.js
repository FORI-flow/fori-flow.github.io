const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

const routes={olkhon:{title:'Ольхон. В своём ритме.',tag:'ОСТРОВ И БОЛЬШАЯ ВОДА',image:'olkhon',text:'Сарайский пляж, берег Байкала и скала Шаманка. В канале делимся летними и осенними поездками на остров, в том числе семейными маршрутами.',url:'https://t.me/baikal_charm38/85'},listvyanka:{title:'Листвянка и Тальцы',tag:'БАЙКАЛ ЗА ОДИН ДЕНЬ',image:'forest',text:'Знакомство с Байкалом и деревянной архитектурой музея «Тальцы». В опубликованной программе — берег Листвянки, Шаман-камень и исток Ангары. Подробности экскурсии смотрите в канале.',url:'https://t.me/baikal_charm38/81'},arshan:{title:'Аршан. К горам и лесу.',tag:'ПРЕДГОРЬЯ САЯН',image:'arshan',text:'Горный воздух, лесные тропы и водопад. В историях о поездках в Аршан — мараловая ферма, дацан, местный рынок и термальный бассейн. Конкретные остановки согласуйте перед поездкой.',url:'https://t.me/baikal_charm38'},winter:{title:'Космос под ногами',tag:'БОЛЬШОЕ ГОЛОУСТНОЕ / ЗИМА',image:'ice',text:'Прозрачный лёд, узоры трещин и байкальские пузырьки. В канале опубликована зимняя программа с выездом из Иркутска, прогулкой по льду и поездкой в Большое Голоустное. Дата и выход на лёд зависят от фактических условий и решения организаторов.',url:'https://t.me/baikal_charm38/87'}};
const routeDialog=document.querySelector('#route-dialog');document.querySelectorAll('[data-route]').forEach(button=>button.addEventListener('click',()=>{const r=routes[button.dataset.route];document.querySelector('#dialog-image').src=`assets/${r.image}.jpg`;document.querySelector('#dialog-image').alt=r.title;document.querySelector('#dialog-title').textContent=r.title;document.querySelector('#dialog-tag').textContent=r.tag;document.querySelector('#dialog-text').textContent=r.text;document.querySelector('#dialog-link').href=r.url;routeDialog.showModal()}));
const photoDialog=document.querySelector('#photo-dialog');document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const im=document.querySelector('#full-photo');im.src=`assets/${button.dataset.photo}.jpg`;im.alt=button.querySelector('img').alt;photoDialog.showModal()}));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}})});
document.querySelector('#destination').addEventListener('change',event=>{const value=event.target.value;const link=document.querySelector('#telegram-link');link.href='https://t.me/baikal_charm38'+(value?'?text='+encodeURIComponent('Здравствуйте! Интересует поездка: '+value+'. Подскажите доступные даты, программу и стоимость.'): '');link.textContent=value?'Обсудить '+(value==='Листвянка и Тальцы'?'поездку':value):'Обсудить путешествие'});

// Scroll effects follow the visitor's movement and stop rendering when settled.
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
const readingTitle=document.querySelector('.reading-title');
readingTitle.innerHTML=readingTitle.innerHTML.replace(/([^<>\s]+)(?=[^<>]*(?:<|$))/g,(word)=>`<span class="word">${word}</span>`);
readingTitle.querySelectorAll('span:not(.word) .word').forEach(word=>word.classList.add('soft-word'));
const words=[...readingTitle.querySelectorAll('.word')];
const scene=document.querySelector('.pause');
const routeImages=[...document.querySelectorAll('.route')];
const galleryItems=[...document.querySelectorAll('.gallery-photo')];
const contact=document.querySelector('.contact');
let frame=0;
function renderScroll(){
 frame=0;
 if(reduced.matches)return;
 const height=innerHeight;
 const titleRect=readingTitle.getBoundingClientRect();
 const reading=clamp((height*.89-titleRect.top)/(height*.47));
 words.forEach((word,index)=>word.style.setProperty('--word-opacity',String(.2+.8*clamp(reading*1.5-index/words.length*.5))));
 routeImages.forEach(card=>{const rect=card.getBoundingClientRect();if(rect.top<height+150&&rect.bottom> -150){const offset=clamp((rect.top+rect.height/2-height/2)/(height+rect.height),-.5,.5);card.style.setProperty('--image-y',`${offset*(innerWidth<600?24:66)}px`)}});
 galleryItems.forEach((card,index)=>{const rect=card.getBoundingClientRect();if(rect.top<height+200&&rect.bottom> -200){const offset=clamp((rect.top-height/2)/(height+rect.height),-.5,.5);card.style.setProperty('--gallery-y',`${offset*(index===1?-1:1)*(innerWidth<600?20:65)}px`)}});
 const rect=scene.getBoundingClientRect();
 if(rect.top<height&&rect.bottom>0){const progress=clamp(-rect.top/Math.max(1,rect.height-height));const expansion=clamp(progress/.45);const inset=(innerWidth<600?24:80)*(1-expansion);scene.style.setProperty('--scene-inset',`${inset}px`);scene.style.setProperty('--scene-radius',`${22*(1-expansion)}px`);scene.style.setProperty('--scene-scale',String(1.09-progress*.07));scene.style.setProperty('--scene-y',`${(progress-.5)*30}px`);scene.style.setProperty('--line-one',String(1-clamp((progress-.34)/.22)));scene.style.setProperty('--line-two',String(clamp((progress-.49)/.22)));scene.style.setProperty('--line-one-y',`${-clamp((progress-.34)/.22)*24}px`);scene.style.setProperty('--line-two-y',`${(1-clamp((progress-.49)/.22))*28}px`)}
 const contactRect=contact.getBoundingClientRect();if(contactRect.top<height&&contactRect.bottom>0)contact.style.setProperty('--contact-drift',`${(height-contactRect.top)*.08}px`);
}
function queueScroll(){if(!frame)frame=requestAnimationFrame(renderScroll)}
function setupMotion(){
 document.documentElement.classList.toggle('js-motion',!reduced.matches);
 if(!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));queueScroll()}
}
addEventListener('scroll',queueScroll,{passive:true});addEventListener('resize',queueScroll);reduced.addEventListener('change',setupMotion);setupMotion();

// Review excerpts link to the published screenshot, preserving its complete text.
document.querySelectorAll('[data-review]').forEach(button=>button.addEventListener('click',()=>{const image=document.querySelector('#full-photo');image.src=`assets/${button.dataset.review}.jpg`;image.alt=button.dataset.reviewAlt;photoDialog.showModal()}));

// A hand-held postcard deck: swipe, keyboard, buttons, and a gentle pointer tilt.
(()=>{
 const stage=document.querySelector('.postcard-scene');
 const cards=[...document.querySelectorAll('.postcard')];
 const stack=document.querySelector('.postcard-stack');
 const dots=[...document.querySelectorAll('[data-postcard-dot]')];
 const copy=document.querySelector('.postcard-copy');
 const stories=[
  {title:'У воды —<br>свои оттенки.',text:'От глубокого синего до прозрачной бирюзы. Здесь хочется смотреть вдаль и никуда не торопиться.'},
  {title:'Свобода —<br>совсем рядом.',text:'Шум крыльев, ветер с озера и открытый горизонт. Иногда для счастья достаточно одного такого мгновения.'},
  {title:'Некоторые встречи<br>остаются навсегда.',text:'Скалы, вода и простор Ольхона. Место, которое хочется не только сфотографировать, но и запомнить своим.'}
 ];
 let active=0,gesture=null,suppressClickUntil=0,turnTimer=0;
 const wrap=index=>(index+cards.length)%cards.length;
 function resetCard(card){stack.style.removeProperty('--tilt-x');stack.style.removeProperty('--tilt-y');['--tilt-x','--tilt-y','--drag-x','--drag-angle'].forEach(name=>card.style.removeProperty(name));card.classList.remove('is-dragging','is-turning');card.style.removeProperty('opacity')}
 function show(index){
  const next=wrap(index);if(next===active)return;
  clearTimeout(turnTimer);
  const focusFollows=cards.includes(document.activeElement);
  active=next;
  if(focusFollows)stage.focus({preventScroll:true});
  cards.forEach((card,index)=>{resetCard(card);const depth=wrap(index-active);card.classList.toggle('is-active',depth===0);card.classList.toggle('is-behind',depth===1);card.classList.toggle('is-last',depth===2);card.tabIndex=depth===0?0:-1;if(depth===0)card.removeAttribute('aria-hidden');else card.setAttribute('aria-hidden','true')});
  dots.forEach((dot,index)=>{dot.classList.toggle('is-selected',index===active);dot.setAttribute('aria-pressed',String(index===active))});
  document.querySelector('#postcard-story-title').innerHTML=stories[active].title;
  document.querySelector('#postcard-story-text').textContent=stories[active].text;
  copy.classList.remove('is-changing');void copy.offsetWidth;copy.classList.add('is-changing');
  if(focusFollows)cards[active].focus({preventScroll:true});
 }
 function turn(direction){
  if(reduced.matches){show(active+direction);return}
  const card=cards[active];card.classList.remove('is-dragging');card.classList.add('is-turning');card.style.setProperty('--drag-x',`${direction>0?-60:60}px`);card.style.setProperty('--drag-angle',`${direction>0?-7:7}deg`);card.style.opacity='.3';
  clearTimeout(turnTimer);turnTimer=setTimeout(()=>show(active+direction),180);
 }
 cards.forEach((card,index)=>{card.classList.toggle('is-behind',index===1);card.classList.toggle('is-last',index===2)});
 document.querySelector('#postcard-prev').addEventListener('click',()=>turn(-1));
 document.querySelector('#postcard-next').addEventListener('click',()=>turn(1));
 dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.postcardDot))));
 document.querySelector('#postcard-enlarge').addEventListener('click',()=>cards[active].click());
 stage.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();turn(event.key==='ArrowRight'?1:-1)}else if(event.key==='Home'){event.preventDefault();show(0)}else if(event.key==='End'){event.preventDefault();show(cards.length-1)}});
 stage.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('.postcard-controls, a'))return;
  gesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,dx:0,moved:false,card:cards[active]};
  stage.setPointerCapture(event.pointerId);
 });
 stage.addEventListener('pointermove',event=>{
  const card=cards[active];
  if(gesture&&gesture.id===event.pointerId){
   const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
   gesture.dx=dx;
   if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){gesture.moved=true;card.classList.add('is-dragging')}
   if(gesture.moved&&!reduced.matches){card.style.setProperty('--drag-x',`${clamp(dx,-180,180)}px`);card.style.setProperty('--drag-angle',`${clamp(dx/18,-9,9)}deg`)}
   return;
  }
  if(event.pointerType==='mouse'&&!reduced.matches){const rect=card.getBoundingClientRect();const x=clamp((event.clientX-rect.left)/rect.width,0,1)-.5,y=clamp((event.clientY-rect.top)/rect.height,0,1)-.5;stack.style.setProperty('--tilt-x',`${-y*5}deg`);stack.style.setProperty('--tilt-y',`${x*6}deg`)}
 });
 function finish(event,cancelled=false){
  if(!gesture||gesture.id!==event.pointerId)return;
  const current=gesture;gesture=null;
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  if(current.moved)suppressClickUntil=performance.now()+500;
  if(!cancelled&&current.moved&&Math.abs(current.dx)>45)turn(current.dx<0?1:-1);else resetCard(current.card);
 }
 // One horizontal trackpad gesture turns one card; vertical scrolling stays native.
 let wheelDistance=0,wheelConsumed=false,wheelReset=0;
 stage.addEventListener('wheel',event=>{
  if(event.ctrlKey||gesture)return;
  const unit=event.deltaMode===1?16:event.deltaMode===2?stage.clientWidth:1;
  const dx=(event.shiftKey&&Math.abs(event.deltaX)<1?event.deltaY:event.deltaX)*unit;
  const dy=event.shiftKey?0:event.deltaY*unit;
  if(Math.abs(dx)<1||Math.abs(dx)<=Math.abs(dy))return;
  event.preventDefault();
  clearTimeout(wheelReset);
  wheelReset=setTimeout(()=>{wheelDistance=0;wheelConsumed=false},180);
  if(wheelConsumed)return;
  wheelDistance+=dx;
  if(Math.abs(wheelDistance)>40){wheelConsumed=true;turn(wheelDistance>0?1:-1)}
 },{passive:false});
 stage.addEventListener('pointerup',event=>finish(event));stage.addEventListener('pointercancel',event=>finish(event,true));
 stage.addEventListener('pointerleave',()=>{if(!gesture)resetCard(cards[active])});
 stage.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}},true);
 reduced.addEventListener('change',()=>{cards.forEach(resetCard)});
})();
