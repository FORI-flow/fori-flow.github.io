/* One physical ribbon; local material erosion follows the pointer. */
(() => {
 const canvas=document.querySelector('#ribbon-canvas');if(!canvas)return;
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',premultipliedAlpha:false});if(!gl)return;
 const hero=document.querySelector('.hero'),button=document.querySelector('#scatter-toggle'),hint=document.querySelector('#ribbon-hint');
 const ids=['f9c6d139d84cddf8','ea6ce82980fa43d8','d9a150b3fb0d79e7'];canvas.dataset.photoIds=ids.join(',');canvas.dataset.effect='local-dust';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let paused=reduced.matches||window.portfolioMotionEnabled===false,visible=true,ready=false,raf=0,last=0,time=0,held=false,pointer=null,lastMvp=null;
 let px=0,py=0,tx=0,ty=0;
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
 function surface(t,v){const c=[Math.sin(t)*2.95,Math.sin(2*t)*.98,Math.cos(t)*.96],tan=norm([Math.cos(t)*2.95,Math.cos(2*t)*1.96,-Math.sin(t)*.96]),n=norm(cross(tan,[0,0,1])),b=norm(cross(tan,n)),twist=t*.5+.36;return c.map((x,i)=>x+(n[i]*Math.cos(twist)+b[i]*Math.sin(twist))*v*.51)}
 function normal(t,v){const p=surface(t,v),a=surface(t+.001,v),b=surface(t,v+.001);return norm(cross(a.map((x,i)=>x-p[i]),b.map((x,i)=>x-p[i])))}
 const mesh={p:[],n:[],uv:[]},particles={p:[],n:[],uv:[],seed:[]},pickPoints=[];
 const seg=360,wide=8;
 for(let i=0;i<seg;i++)for(let j=0;j<wide;j++)for(const [u,v] of [[i/seg,j/wide],[(i+1)/seg,j/wide],[i/seg,(j+1)/wide],[(i+1)/seg,j/wide],[(i+1)/seg,(j+1)/wide],[i/seg,(j+1)/wide]]){mesh.p.push(...surface(u*Math.PI*2,v*2-1));mesh.n.push(...normal(u*Math.PI*2,v*2-1));mesh.uv.push(u,v)}
 const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
 for(let i=0;i<720;i++)for(let j=0;j<32;j++){const u=(i+.3)/720,v=(j+.5)/32;particles.p.push(...surface(u*Math.PI*2,v*2-1));particles.n.push(...normal(u*Math.PI*2,v*2-1));particles.uv.push(u,v);particles.seed.push(random(i*32+j))}
 for(let i=0;i<180;i++)for(let j=0;j<5;j++){const u=i/180,v=(j+.5)/5;pickPoints.push({p:surface(u*Math.PI*2,v*2-1),u,v})}
 const shared=`precision mediump float;uniform sampler2D uTexture;uniform sampler2D uMask;uniform float uTime;varying vec2 vUv;varying vec3 vNormal;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}vec3 ink(){vec3 n=normalize(vNormal);float light=.48+.34*abs(dot(n,normalize(vec3(-.3,.8,1.))));vec3 c=texture2D(uTexture,vec2(fract(vUv.x-uTime*.005),vUv.y)).rgb;return c*light;}`;
 const bandVertex=`precision mediump float;attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUv;uniform mat4 uMvp;uniform mat4 uModel;varying vec2 vUv;varying vec3 vNormal;void main(){vUv=aUv;vNormal=mat3(uModel)*aNormal;gl_Position=uMvp*vec4(aPosition,1.);}`;
 const bandFragment=shared+`void main(){float erosion=texture2D(uMask,vUv).r;float grain=hash(floor(vUv*vec2(2200.,150.)));if(erosion>.015&&grain<erosion*1.03)discard;vec3 c=ink();float edge=smoothstep(0.,.014,vUv.y)*smoothstep(0.,.014,1.-vUv.y);gl_FragColor=vec4(mix(vec3(.11),c,edge),1.);}`;
 const dustVertex=`precision mediump float;attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUv;attribute float aSeed;uniform mat4 uMvp;uniform mat4 uModel;uniform sampler2D uMask;uniform float uTime;uniform float uDpr;varying vec2 vUv;varying vec3 vNormal;varying float vAmount;varying float vSeed;void main(){float e=texture2D(uMask,aUv).r;vec3 direction=normalize(vec3(sin(aSeed*61.),.5+cos(aSeed*42.)*.7,.7+sin(aSeed*23.)*.4));vec3 drift=(direction+aNormal*.35)*e*(.08+aSeed*.68);drift.y+=sin(uTime*.9+aSeed*31.)*e*.055;vec3 p=aPosition+drift;vUv=aUv;vNormal=mat3(uModel)*aNormal;vAmount=e;vSeed=aSeed;gl_Position=uMvp*vec4(p,1.);gl_PointSize=(1.4+aSeed*1.8)*uDpr;}`;
 const dustFragment=shared+`varying float vAmount;varying float vSeed;void main(){if(vAmount<.04)discard;float circle=1.-smoothstep(.13,.5,length(gl_PointCoord-.5));float alpha=circle*smoothstep(.04,.35,vAmount)*(.65+vSeed*.35);vec3 c=mix(ink(),vec3(.95,.8,.58),.6+vSeed*.35);gl_FragColor=vec4(c,alpha);}`;
 function program(vs,fs){function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p}
 let band,dust;try{band=program(bandVertex,bandFragment);dust=program(dustVertex,dustFragment)}catch(e){console.error('Ribbon shader:',e.message);return}
 function buffers(data){const out={};for(const key of Object.keys(data)){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data[key]),gl.STATIC_DRAW);out[key]=b}return out}
 const meshBuffers=buffers(mesh),dustBuffers=buffers(particles);
 function bind(p,b){for(const [key,name,size] of [['p','aPosition',3],['n','aNormal',3],['uv','aUv',2],['seed','aSeed',1]]){const loc=gl.getAttribLocation(p,name);if(loc<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,b[key]);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0)}}
 const texture=gl.createTexture(),maskTexture=gl.createTexture(),mw=256,mh=64,heat=new Float32Array(mw*mh),mask=new Uint8Array(mw*mh);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([25,20,20,255]));
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,maskTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,mw,mh,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,mask);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 Promise.all(ids.map(id=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=window.portfolioImage(id)}))).then(images=>{
  const atlas=document.createElement('canvas');atlas.width=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE));atlas.height=256;const c=atlas.getContext('2d'),cw=atlas.width/6;
  c.fillStyle='#141112';c.fillRect(0,0,atlas.width,atlas.height);
  const names=['Встреча','На ходу','Здесь и сейчас'],words=['люди.','свет.','город.'];
  for(let i=0;i<3;i++){
   const x=i*2*cw;c.fillStyle='#191416';c.fillRect(x+4,4,cw-8,248);c.strokeStyle='#51413b';c.strokeRect(x+12,12,cw-24,232);
   const im=images[i];if(im){const tw=cw-26,th=230,scale=Math.max(tw/im.width,th/im.height),sw=tw/scale,sh=th/scale,sy=Math.min(im.height-sh,Math.max(0,im.height*.16-sh*.12));c.drawImage(im,(im.width-sw)/2,sy,sw,sh,x+13,13,tw,th)}
   c.fillStyle='#151011b8';c.fillRect(x+13,205,cw-26,38);c.fillStyle='#c0aa93';c.font='16px Arial';c.fillText(names[i],x+30,231,cw-60);
   const tx=x+cw;c.fillStyle='#100e0f';c.fillRect(tx+4,4,cw-8,248);c.fillStyle='#887164';c.font='italic 98px Georgia';c.textAlign='center';c.fillText(words[i],tx+cw/2,155,cw*.8);c.textAlign='start';c.fillStyle='#4d3a31';c.font='14px Arial';c.fillText('semkasemka',tx+cw*.13,218);
  }
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  const ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  ready=true;hero.classList.add('ribbon-ready');draw(0);schedule();
 });
 function multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
 function rotation(x,y,z){const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);return multiply(multiply(new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]),new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1])),new Float32Array([cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]))}
 function project(p,m,w,h){const clip=[0,0,0,0];for(let r=0;r<4;r++)clip[r]=m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r];if(clip[3]<=0)return null;return {x:(clip[0]/clip[3]+1)*w/2,y:(1-clip[1]/clip[3])*h/2}}
 function pick(w,h){if((!pointer&&!held)||!lastMvp)return null;const target=held?{x:w*.72,y:h*.49}:pointer;let best=Infinity,chosen=null;for(const p of pickPoints){if(held&&p.v<.8)continue;const q=project(p.p,lastMvp,w,h);if(!q)continue;const d=Math.hypot(target.x-q.x,target.y-q.y);if(d<best){best=d;chosen=p}}return held||best<Math.max(20,w*.025)?chosen:null}
 function paint(u,v,dt){const ru=.035,rv=.42;for(let iy=Math.max(0,Math.floor((v-rv)*mh));iy<=Math.min(mh-1,Math.ceil((v+rv)*mh));iy++)for(let ix=Math.floor((u-ru)*mw);ix<=Math.ceil((u+ru)*mw);ix++){const dx=(ix/mw-u)/ru,dy=(iy/mh-v)/rv,d=Math.hypot(dx,dy);if(d>=1)continue;const x=(ix%mw+mw)%mw,index=iy*mw+x;heat[index]=Math.min(1,heat[index]+Math.pow(1-d,1.2)*dt*5.5)}}
 function setUniforms(p,m,mvp,dpr){gl.useProgram(p);gl.uniformMatrix4fv(gl.getUniformLocation(p,'uModel'),false,m);gl.uniformMatrix4fv(gl.getUniformLocation(p,'uMvp'),false,mvp);gl.uniform1f(gl.getUniformLocation(p,'uTime'),time);gl.uniform1i(gl.getUniformLocation(p,'uTexture'),0);gl.uniform1i(gl.getUniformLocation(p,'uMask'),1);const d=gl.getUniformLocation(p,'uDpr');if(d)gl.uniform1f(d,dpr)}
 function draw(now){
  raf=0;if(!ready||gl.isContextLost())return;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;if(!paused&&!window.portfolioIntroActive)time+=dt;
  px+=(tx-px)*.045;py+=(ty-py)*.045;
  const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.6);if(!w||!h)return;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}gl.viewport(0,0,canvas.width,canvas.height);
  const aspect=w/h,f=1/Math.tan(33*Math.PI/360),near=.1,far=100,projection=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
  const m=rotation(-.22+Math.sin(time*.18)*.24+py,.48+Math.sin(time*.24)*.72+px+(window.portfolioScroll||0)*.3,-.24+Math.sin(time*.13)*.14);m[12]=aspect>1.2?.25:0;
  const distance=Math.max(9.8,3.4/(Math.tan(33*Math.PI/360)*aspect*.9)+1),view=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-distance,1]);lastMvp=multiply(projection,multiply(view,m));
  let active=0,peak=0;if(!paused&&!window.portfolioIntroActive){const decay=Math.pow(.985,dt*60);for(let i=0;i<heat.length;i++)heat[i]*=decay;const hit=pick(w,h);if(hit)paint(hit.u,hit.v,dt);for(let i=0;i<heat.length;i++){mask[i]=Math.round(clamp(heat[i])*255);if(heat[i]>.08)active++;peak=Math.max(peak,heat[i])}}
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,maskTexture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,mw,mh,gl.LUMINANCE,gl.UNSIGNED_BYTE,mask);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  canvas.dataset.dissolve=peak.toFixed(3);canvas.dataset.maskCells=String(active);canvas.dataset.maskTotal=String(mw*mh);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
  setUniforms(band,m,lastMvp,dpr);bind(band,meshBuffers);gl.drawArrays(gl.TRIANGLES,0,mesh.p.length/3);
  if(active>0){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);setUniforms(dust,m,lastMvp,dpr);bind(dust,dustBuffers);gl.drawArrays(gl.POINTS,0,particles.p.length/3);gl.depthMask(true);gl.disable(gl.BLEND)}
  schedule();
 }
 function schedule(){if(ready&&!raf&&visible&&!paused&&!document.hidden&&!window.portfolioIntroActive)raf=requestAnimationFrame(draw)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
 function reflect(){button.disabled=paused;button.setAttribute('aria-pressed',String(held));button.textContent=paused?'Движение выключено':held?'Восстановить ленту':matchMedia('(pointer:fine)').matches&&!matchMedia('(max-width:600px)').matches?'Попробовать эффект':'Прикоснуться к ленте';hint.textContent=held?'Нажмите ещё раз — край восстановится':'Проведите по краю — и он растворится'}
 hero.addEventListener('pointermove',e=>{if(paused||e.pointerType==='touch')return;const b=canvas.getBoundingClientRect();pointer={x:e.clientX-b.left,y:e.clientY-b.top};tx=(pointer.x/b.width-.5)*.15;ty=(pointer.y/b.height-.5)*.1});hero.addEventListener('pointerleave',()=>{pointer=null;tx=ty=0});
 button.onclick=()=>{if(paused)return;held=!held;pointer=null;reflect();schedule()};
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){draw(0);schedule()}else stop()},{threshold:0}).observe(canvas);
 document.addEventListener('portfolio-motion',e=>{paused=!e.detail.enabled;stop();draw(0);reflect();schedule()});document.addEventListener('portfolio-intro',()=>{stop();if(!window.portfolioIntroActive){draw(0);schedule()}});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule()});addEventListener('resize',()=>{if(paused)draw(0)},{passive:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();hero.classList.remove('ribbon-ready')});canvas.addEventListener('webglcontextrestored',()=>location.reload());reflect();
})();
