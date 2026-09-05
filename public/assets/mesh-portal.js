(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHub = location.pathname.includes('/muze-x-lab-collaborative-platform/');

  const targets = isHub
    ? [
        { href: 'https://muse-irs.github.io/muze-x-open-learning-commons/', label: 'Open Learning ↗' },
        { href: 'https://muse-irs.github.io/rgpd-data-journey-audit/', label: 'RGPD ↗' }
      ]
    : [
        { href: 'https://muse-irs.github.io/muze-x-lab-collaborative-platform/', label: 'Muze-X Lab ↗' }
      ];

  const primaryAnchor = isHub
    ? { href:'https://muse-irs.github.io/muze-x-open-learning-commons/', kicker:'Apprendre', title:'Open Learning', subtitle:'Commons · apprentissage ↗' }
    : { href:'https://muse-irs.github.io/muze-x-lab-collaborative-platform/', kicker:'Explorer', title:'Muze-X Lab', subtitle:'plateforme multi-domaine ↗' };

  if (document.querySelector('.muze-mesh-field')) return;

  const canvas=document.createElement('canvas');canvas.className='muze-mesh-field';canvas.setAttribute('aria-hidden','true');
  const vignette=document.createElement('div');vignette.className='muze-mesh-vignette';vignette.setAttribute('aria-hidden','true');
  const nav=document.createElement('nav');nav.className='muze-mesh-nav';nav.setAttribute('aria-label','Maillage public Muze-X');
  for(const target of targets){const link=document.createElement('a');link.href=target.href;link.textContent=target.label;nav.appendChild(link)}

  const anchorSection=document.createElement('section');anchorSection.className='muze-mesh-anchor-section';anchorSection.setAttribute('aria-label','Ancre de navigation du maillage Muze-X');
  const anchorLink=document.createElement('a');anchorLink.className='muze-mesh-anchor-orb';anchorLink.href=primaryAnchor.href;anchorLink.dataset.swarmAnchor='true';anchorLink.setAttribute('aria-label',`${primaryAnchor.kicker} — ${primaryAnchor.title}`);
  const anchorKicker=document.createElement('span');anchorKicker.className='muze-mesh-anchor-kicker';anchorKicker.textContent=primaryAnchor.kicker;
  const anchorTitle=document.createElement('strong');anchorTitle.className='muze-mesh-anchor-title';anchorTitle.textContent=primaryAnchor.title;
  const anchorSubtitle=document.createElement('small');anchorSubtitle.className='muze-mesh-anchor-subtitle';anchorSubtitle.textContent=primaryAnchor.subtitle;
  anchorLink.append(anchorKicker,anchorTitle,anchorSubtitle);

  const interfaceInfo=document.createElement('div');interfaceInfo.className='muze-interface-technique';interfaceInfo.setAttribute('aria-label','Technique et rendu de la logique d’interface conceptuelle Muze-X');
  const interfaceHeading=document.createElement('strong');interfaceHeading.className='muze-interface-technique-heading';interfaceHeading.textContent='Logique d’interface conceptuelle Muze-X';
  const interfaceLines=document.createElement('div');interfaceLines.className='muze-interface-technique-lines';
  const descriptions=[['Technique actuelle','Canvas 2D · essaims globaux cyan/violet · essaims locaux rose/jaune · attracteurs de contour'],['Rendu','profondeur perceptive émergente · navigation locale entre cercle et rectangle lorsque la géométrie est visible'],['Statut','R&D exploratoire — métaphore visuelle ≠ modèle scientifique']];
  for(const [label,text] of descriptions){const line=document.createElement('span');const labelNode=document.createElement('b');labelNode.textContent=label;line.append(labelNode,document.createTextNode(` · ${text}`));interfaceLines.appendChild(line)}
  interfaceInfo.append(interfaceHeading,interfaceLines);anchorSection.append(anchorLink,interfaceInfo);
  document.body.prepend(vignette);document.body.prepend(canvas);document.body.appendChild(nav);
  const footer=document.querySelector('footer');if(footer?.parentNode)footer.parentNode.insertBefore(anchorSection,footer);else document.body.appendChild(anchorSection);

  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});if(!ctx)return;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));const rand=(min,max)=>min+Math.random()*(max-min);
  const state={width:1,height:1,dpr:1,particles:[],localParticles:[],pointer:{x:0,y:0,active:false,pressure:0},anchor:{element:anchorLink,active:false,x:0,y:0,radius:0,strength:0},boundaries:[],localZone:null,last:performance.now()};

  function particleCount(){const cores=navigator.hardwareConcurrency||4;if(reducedMotion)return clamp(Math.round((state.width*state.height)/8500),88,176);const density=cores>=8?1800:cores>=4?2250:2950;return clamp(Math.round((state.width*state.height)/density),300,cores>=8?880:640)}
  function localParticleCount(){const cores=navigator.hardwareConcurrency||4;if(reducedMotion)return 72;return cores>=8?288:cores>=4?216:162}
  function makeParticle(index){return{team:index%2,x:rand(0,state.width),y:rand(0,state.height),z:rand(.16,1),vx:rand(-.38,.38),vy:rand(-.38,.38),vz:rand(-.0018,.0018),mass:rand(.72,1.5),phase:rand(0,Math.PI*2),drift:rand(.52,1.36)}}
  function rebuild(){state.particles=Array.from({length:particleCount()},(_,i)=>makeParticle(i));state.localParticles=[]}
  function resize(){state.width=Math.max(1,innerWidth);state.height=Math.max(1,innerHeight);state.dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(state.width*state.dpr);canvas.height=Math.round(state.height*state.dpr);canvas.style.width=`${state.width}px`;canvas.style.height=`${state.height}px`;ctx.setTransform(state.dpr,0,0,state.dpr,0,0);rebuild();ctx.fillStyle='#040a16';ctx.fillRect(0,0,state.width,state.height)}
  function setPointer(e,active=state.pointer.active){state.pointer.x=e.clientX;state.pointer.y=e.clientY;state.pointer.active=active;state.pointer.pressure=typeof e.pressure==='number'?e.pressure:0}
  addEventListener('pointerdown',e=>setPointer(e,true),{passive:true});addEventListener('pointermove',e=>setPointer(e),{passive:true});addEventListener('pointerup',e=>setPointer(e,false),{passive:true});addEventListener('pointercancel',e=>setPointer(e,false),{passive:true});addEventListener('blur',()=>{state.pointer.active=false});addEventListener('resize',resize,{passive:true});

  function visibilityOf(rect){const w=Math.max(0,Math.min(rect.right,state.width)-Math.max(rect.left,0));const h=Math.max(0,Math.min(rect.bottom,state.height)-Math.max(rect.top,0));return clamp((w*h)/Math.max(1,rect.width*rect.height),0,1)}
  function updateFields(){
    const a=state.anchor,rect=a.element.getBoundingClientRect(),visibility=visibilityOf(rect),raw=clamp((visibility-.04)/.56,0,1);a.x=rect.left+rect.width*.5;a.y=rect.top+rect.height*.5;a.radius=Math.max(72,Math.min(rect.width,rect.height)*.47);a.strength=raw*(reducedMotion?.35:1);a.active=a.strength>.01;a.element.classList.toggle('is-field-active',a.strength>.18);
    state.boundaries=[...document.querySelectorAll('[data-swarm-boundary="rectangle"]')].map(element=>{const r=element.getBoundingClientRect(),v=visibilityOf(r),strength=clamp((v-.03)/.5,0,1)*(reducedMotion?.28:.78);element.classList.toggle('is-field-active',strength>.15);return{element,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,strength,active:strength>.01}}).filter(b=>b.active);
    const b=state.boundaries[0];state.localZone=a.active&&b&&b.active?{left:b.left,top:b.top,right:b.right,bottom:b.bottom,width:b.width,height:b.height,cx:a.x,cy:a.y,radius:a.radius*1.07,strength:Math.min(1,(a.strength+b.strength)*.62)}:null;
    if(state.localZone&&state.localParticles.length!==localParticleCount())seedLocalParticles();
    if(!state.localZone)state.localParticles=[];
  }
  function updateAnchor(){updateFields()}
  function nearestRectBoundary(p,b){const inside=p.x>=b.left&&p.x<=b.right&&p.y>=b.top&&p.y<=b.bottom;let x=clamp(p.x,b.left,b.right),y=clamp(p.y,b.top,b.bottom);if(inside){const dL=p.x-b.left,dR=b.right-p.x,dT=p.y-b.top,dB=b.bottom-p.y,m=Math.min(dL,dR,dT,dB);if(m===dL)x=b.left;else if(m===dR)x=b.right;else if(m===dT)y=b.top;else y=b.bottom}return{x,y,inside}}
  function applyRectBoundary(p,b,force){const target=nearestRectBoundary(p,b),dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)+.01,reach=Math.max(120,Math.min(b.width,b.height)*.55);if(d>reach)return;const fall=1-d/reach,nx=dx/d,ny=dy/d,spin=p.team===0?1:-1;force.x+=nx*.052*fall*b.strength*(.55+p.z*.65);force.y+=ny*.052*fall*b.strength*(.55+p.z*.65);if(d<34){force.x+=-ny*.0048*spin*b.strength;force.y+=nx*.0048*spin*b.strength}}
  function applyCircleBoundary(p,a,force){const dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy)+.01,nx=dx/d,ny=dy/d,target=a.radius*1.02,delta=d-target,reach=Math.max(96,a.radius*1.15);if(Math.abs(delta)>reach)return;const fall=1-Math.abs(delta)/reach,dir=delta>0?-1:1,spin=p.team===0?1:-1,strength=a.strength*(.72+p.z*.46);force.x+=nx*dir*.078*fall*strength;force.y+=ny*dir*.078*fall*strength;const tangential=.0068*fall*a.strength*spin;force.x+=-ny*tangential;force.y+=nx*tangential}
  function updateParticle(p,dt,now){const teamPhase=p.team===0?0:Math.PI,baseX=state.width*(.5+Math.sin(now*.000075+teamPhase)*.29),baseY=state.height*(.5+Math.cos(now*.000061+teamPhase*.73)*.25);let centerX=baseX,centerY=baseY,spring=.000025;if(state.anchor.active){const blend=state.anchor.strength,offset=(p.team===0?-.12:.12)*state.anchor.radius;centerX=baseX*(1-blend)+(state.anchor.x+offset)*blend;centerY=baseY*(1-blend)+(state.anchor.y+state.anchor.radius*.15)*blend;spring+=.00022*blend}let force={x:(centerX-p.x)*spring,y:(centerY-p.y)*spring};force.x+=Math.cos(now*.00021*p.drift+p.phase)*.0055*p.drift;force.y+=Math.sin(now*.00018*p.drift+p.phase)*.0055*p.drift;const fdx=p.x-state.width*.5,fdy=p.y-state.height*.5,fd=Math.hypot(fdx,fdy)+.001,spin=p.team===0?1:-1;force.x+=(-fdy/fd)*.0015*spin;force.y+=(fdx/fd)*.0015*spin;
    for(const b of state.boundaries)applyRectBoundary(p,b,force);
    if(state.anchor.active){const dx=state.anchor.x-p.x,dy=state.anchor.y-p.y,d=Math.hypot(dx,dy)+.01,nx=dx/d,ny=dy/d,boundary=state.anchor.radius*.78,outside=clamp((d-boundary)/Math.max(state.anchor.radius*1.8,1),0,1),gather=(.009+outside*.032)*state.anchor.strength*(.62+p.z*.58);force.x+=nx*gather;force.y+=ny*gather;applyCircleBoundary(p,state.anchor,force)}
    if(state.pointer.active){const dx=state.pointer.x-p.x,dy=state.pointer.y-p.y,d=Math.hypot(dx,dy)+.01,reach=Math.max(260,Math.min(state.width,state.height)*.66),fall=clamp(1-d/reach,0,1),f=fall*(.48+p.z*.78)*(1+state.pointer.pressure*.25);force.x+=(dx/d)*.052*f;force.y+=(dy/d)*.052*f;p.vz+=(p.team===0?.0007:-.00058)*fall}
    p.vx+=(force.x/p.mass)*dt;p.vy+=(force.y/p.mass)*dt;const travel=dt*(reducedMotion?.45:1);p.x+=p.vx*travel;p.y+=p.vy*travel;p.z+=p.vz*travel;const damping=Math.pow((state.anchor.active||state.boundaries.length)?.966:.974,dt);p.vx*=damping;p.vy*=damping;p.vz*=Math.pow(.94,dt);const margin=30;if(p.x< -margin)p.x=state.width+margin;if(p.x>state.width+margin)p.x=-margin;if(p.y< -margin)p.y=state.height+margin;if(p.y>state.height+margin)p.y=-margin;if(p.z<.12){p.z=.12;p.vz=Math.abs(p.vz)*.45}if(p.z>1.05){p.z=1.05;p.vz=-Math.abs(p.vz)*.45}}
  function drawParticle(p){const speed=Math.hypot(p.vx,p.vy),radius=clamp(1.1+p.z*3.2+speed*.06,1.3,6.8),alpha=clamp(.2+p.z*.68,.2,.92),cyan=p.team===0;ctx.beginPath();ctx.fillStyle=cyan?`rgba(89,222,255,${alpha})`:`rgba(190,125,255,${alpha})`;ctx.shadowColor=cyan?'rgba(70,210,255,.62)':'rgba(174,92,255,.58)';ctx.shadowBlur=reducedMotion?0:5+p.z*9;ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill()}

  function validLocalPoint(x,y,z){if(!z)return false;const pad=10;if(x<z.left+pad||x>z.right-pad||y<z.top+pad||y>z.bottom-pad)return false;return Math.hypot(x-z.cx,y-z.cy)>z.radius+12}
  function seedLocalParticles(){const z=state.localZone;if(!z)return;state.localParticles=Array.from({length:localParticleCount()},(_,i)=>{let x=z.cx,y=z.cy;for(let tries=0;tries<80;tries++){x=rand(z.left+12,z.right-12);y=rand(z.top+12,z.bottom-12);if(validLocalPoint(x,y,z))break}return{team:i%2,x,y,vx:rand(-.34,.34),vy:rand(-.34,.34),mass:rand(.75,1.35),phase:rand(0,Math.PI*2),drift:rand(.72,1.5),size:rand(1.4,3.7)}})}
  function constrainLocalParticle(p,z){const pad=8;if(p.x<z.left+pad){p.x=z.left+pad;p.vx=Math.abs(p.vx)*.72}if(p.x>z.right-pad){p.x=z.right-pad;p.vx=-Math.abs(p.vx)*.72}if(p.y<z.top+pad){p.y=z.top+pad;p.vy=Math.abs(p.vy)*.72}if(p.y>z.bottom-pad){p.y=z.bottom-pad;p.vy=-Math.abs(p.vy)*.72}let dx=p.x-z.cx,dy=p.y-z.cy,d=Math.hypot(dx,dy)+.01;if(d<z.radius+8){const nx=dx/d,ny=dy/d;p.x=z.cx+nx*(z.radius+8);p.y=z.cy+ny*(z.radius+8);const radial=p.vx*nx+p.vy*ny;if(radial<0){p.vx-=1.6*radial*nx;p.vy-=1.6*radial*ny}}}
  function updateLocalParticle(p,dt,now){const z=state.localZone;if(!z)return;let fx=Math.cos(now*.00031*p.drift+p.phase)*.0066,fy=Math.sin(now*.00027*p.drift+p.phase)*.0066;const dx=p.x-z.cx,dy=p.y-z.cy,d=Math.hypot(dx,dy)+.01,nx=dx/d,ny=dy/d,spin=p.team===0?1:-1;const circleGap=d-z.radius,circleReach=Math.max(72,z.radius*.72);if(circleGap<circleReach){const fall=1-clamp(circleGap/circleReach,0,1);fx+=-ny*.0085*spin*fall*z.strength;fy+=nx*.0085*spin*fall*z.strength;fx+=nx*.018*fall*z.strength;fy+=ny*.018*fall*z.strength}const dL=p.x-z.left,dR=z.right-p.x,dT=p.y-z.top,dB=z.bottom-p.y,edge=Math.min(dL,dR,dT,dB),edgeReach=Math.max(54,Math.min(z.width,z.height)*.22);if(edge<edgeReach){const fall=1-clamp(edge/edgeReach,0,1);if(edge===dL)fx+=.021*fall*z.strength;else if(edge===dR)fx-=.021*fall*z.strength;else if(edge===dT)fy+=.021*fall*z.strength;else fy-=.021*fall*z.strength;fx+=-ny*.0044*spin*fall;fy+=nx*.0044*spin*fall}const midX=(z.left+z.right)*.5,midY=(z.top+z.bottom)*.5;fx+=(midX-p.x)*.000012;fy+=(midY-p.y)*.000012;p.vx+=(fx/p.mass)*dt;p.vy+=(fy/p.mass)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.982,dt);p.vy*=Math.pow(.982,dt);constrainLocalParticle(p,z)}
  function drawLocalParticle(p){const pink=p.team===0,alpha=.82,radius=p.size;ctx.beginPath();ctx.fillStyle=pink?`rgba(255,45,190,${alpha})`:`rgba(255,245,54,${alpha})`;ctx.shadowColor=pink?'rgba(255,20,180,.9)':'rgba(255,242,40,.9)';ctx.shadowBlur=reducedMotion?0:10;ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill()}

  function frame(now){const elapsed=Math.min(34,now-state.last);state.last=now;const dt=reducedMotion?.35:clamp(elapsed/16.667,.4,2.05);updateAnchor();ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';ctx.fillStyle=reducedMotion?'rgba(4,10,22,.55)':'rgba(4,10,22,.18)';ctx.fillRect(0,0,state.width,state.height);ctx.globalCompositeOperation='lighter';for(const p of state.particles){updateParticle(p,dt,now);drawParticle(p)}if(state.localZone){for(const p of state.localParticles){updateLocalParticle(p,dt,now);drawLocalParticle(p)}}ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;requestAnimationFrame(frame)}
  resize();requestAnimationFrame(frame);
})();