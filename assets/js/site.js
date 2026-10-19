/* Hero network graph: drawn once, redrawn near the mouse only while it moves. Plus the camera clock. */
(function(){var h=document.querySelector(".hero");if(!h)return;var cv=document.createElement("canvas");cv.className="net";cv.setAttribute("aria-hidden","true");h.prepend(cv);
var x=cv.getContext("2d"),W,H,P=[],E=[],mx=-1e4,my=-1e4,raf=0,calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
function rnd(s){return function(){s=s*16807%2147483647;return s/2147483647}}
function build(){var d=Math.min(devicePixelRatio||1,2),r=h.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;x.setTransform(d,0,0,d,0,0);
var R=rnd(7),n=Math.round(W*H/9000),lim=Math.min(150,W/4),i,j;P=[];E=[];for(i=0;i<n;i++)P.push([R()*W,R()*H]);
for(i=0;i<n;i++)for(j=i+1;j<n;j++){var dx=P[i][0]-P[j][0],dy=P[i][1]-P[j][1];if(dx*dx+dy*dy<lim*lim&&R()<.45)E.push([i,j])}draw()}
function near(px,py){var dx=px-mx,dy=py-my;return dx*dx+dy*dy<32400}
function draw(){raf=0;var cs=getComputedStyle(document.documentElement),ink=cs.getPropertyValue("--ink").trim(),ac=cs.getPropertyValue("--accent").trim();x.clearRect(0,0,W,H);x.lineWidth=1;
E.forEach(function(e){var a=P[e[0]],b=P[e[1]],n=near((a[0]+b[0])/2,(a[1]+b[1])/2);x.strokeStyle=n?ac:ink;x.globalAlpha=n?.5:.08;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()});
P.forEach(function(p){var n=near(p[0],p[1]);x.fillStyle=n?ac:ink;x.globalAlpha=n?.9:.3;x.fillRect(p[0]-1,p[1]-1,n?3:2,n?3:2)});x.globalAlpha=1}
function req(){if(!raf)raf=requestAnimationFrame(draw)}
build();addEventListener("resize",build);
if(!calm){h.addEventListener("pointermove",function(e){var r=h.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;req()});h.addEventListener("pointerleave",function(){mx=my=-1e4;req()})}
var c=document.querySelector(".clk");function t(){var d=new Date();c.textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(function(n){return("0"+n).slice(-2)}).join(":")}
if(c){t();setInterval(function(){if(!document.hidden)t()},1000)}
})();
/* Tracking box: follows the mouse, locks onto links and marked items. Idle when settled. */
(function(){if(matchMedia("(prefers-reduced-motion: reduce)").matches||!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
var b=document.createElement("div");b.className="poi";b.setAttribute("aria-hidden","true");b.innerHTML='<i class="cr"></i><span>Irrelevant</span>';document.querySelector(".site").appendChild(b);
var lab=b.querySelector("span"),c={x:0,y:0,w:56,h:56},t={x:0,y:0,w:56,h:56},raf=0,el=null,shown=false;
function kind(n){return n.getAttribute("data-k")||(n.closest(".card,.feat")?"b":n.tagName==="A"?"g":"w")}
function name(n,k){var l=n.getAttribute("data-poi");if(l)return l;if(k==="b"){var h=n.querySelector("h3");return"Asset · "+(h||n).textContent.trim().replace(/\s+/g," ").slice(0,28)}return k==="g"?"Friendly":"Irrelevant"}
function box(n){var r=n.getBoundingClientRect();t={x:r.left-8,y:r.top-8,w:r.width+16,h:r.height+16}}
function tick(){var d=0;for(var k in c){c[k]+=(t[k]-c[k])*.22;d+=Math.abs(t[k]-c[k])}b.style.transform="translate("+c.x+"px,"+c.y+"px)";b.style.width=c.w+"px";b.style.height=c.h+"px";raf=d>.5?requestAnimationFrame(tick):0}
function go(){if(!raf)raf=requestAnimationFrame(tick)}
addEventListener("pointermove",function(e){if(e.pointerType!=="mouse")return;
if(!shown){shown=true;b.classList.add("on");c.x=e.clientX-28;c.y=e.clientY-28}
var n=e.target.closest&&e.target.closest("[data-poi],a");
if(n){box(n);if(n!==el){el=n;var k=kind(n);b.setAttribute("data-k",k);lab.textContent=name(n,k)}}
else{t={x:e.clientX-28,y:e.clientY-28,w:56,h:56};if(el){el=null;lab.textContent="Irrelevant";b.removeAttribute("data-k")}}
go()},{passive:true});
addEventListener("scroll",function(){if(el){box(el);go()}},{passive:true});
document.documentElement.addEventListener("mouseleave",function(){shown=false;b.classList.remove("on")});
})();
/* Play project videos only while on screen. Fall back to controls when motion is reduced or autoplay is blocked. */
(function(){var vs=document.querySelectorAll("video[data-auto]");if(!vs.length)return;
function manual(v){v.controls=true}
if(matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window)){vs.forEach(manual);return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p)p.catch(function(){manual(v)})}else v.pause()})},{threshold:.25});
vs.forEach(function(v){io.observe(v)})})();
