(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var D=window.HBBS_DEMO||{},WA='4915907948177';
// header
var hd=$('.hd'),hero=$('.hero'),top=$('.top');
function onS(){var y=scrollY;if(hd)hd.classList.toggle('solid',!hero||y>hero.offsetHeight-80);if(top)top.classList.toggle('on',y>900)}
addEventListener('scroll',onS,{passive:true});onS();
if(top)top.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
var bg=$('.burger'),mn=$('#mnav');if(bg)bg.onclick=function(){var o=mn.hidden;mn.hidden=!o;bg.setAttribute('aria-expanded',o);hd.classList.add('solid');if(!o)onS()};
$$('#mnav a').forEach(function(a){a.addEventListener('click',function(){mn.hidden=true;onS()})});
// hero carousel
var sl=$$('.hero .sl'),di=$$('.dots i'),i=0;
if(sl.length>1)setInterval(function(){sl[i].classList.remove('on');di[i]&&di[i].classList.remove('on');i=(i+1)%sl.length;sl[i].classList.add('on');di[i]&&di[i].classList.add('on')},5200);
// reveal
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
function reveal(r){$$('.fu',r).forEach(function(e){if(e.classList.contains('in'))return;io?io.observe(e):e.classList.add('in')})}
reveal();
// lightbox (supports multiple photos per project)
var lb=$('.lb'),lbList=[],lbI=0;
function lbShow(list,k){if(!lb)return;lbList=list;lbI=k||0;$('img',lb).src=lbList[lbI];lb.hidden=false}
document.addEventListener('click',function(e){
  var f=e.target.closest('.gal figure');if(f){lbShow([$('img',f).src]);return}
  var a=e.target.closest('.bc[data-imgs]');if(a){var l=JSON.parse(a.getAttribute('data-imgs'));if(l.length)lbShow(l,0);return}
  if(lb&&!lb.hidden&&e.target.closest('.lb')){if(lbList.length>1&&e.target.tagName==='IMG'){lbI=(lbI+1)%lbList.length;$('img',lb).src=lbList[lbI]}else lb.hidden=true}
});
// contact form -> mail
var f=$('#anfrage');if(f)f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f),l=[];d.forEach(function(v,k){if(String(v).trim())l.push(k+': '+v)});location.href='mailto:info@hbbs-kraft.de?subject='+encodeURIComponent('Anfrage '+(d.get('Leistung')||''))+'&body='+encodeURIComponent(l.join('\n'))});

/* ---- content from content/*.json (edited via admin.html), fallback demo.js ---- */
function get(n){return fetch('content/'+n+'.json?t='+Math.floor(Date.now()/60000),{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null})}
function fmtDate(s){if(!s)return'';var p=String(s).split('-');return p.length>=2?(p[2]?p[2]+'.':'')+p[1]+'.'+p[0]:s}
Promise.all([get('offer'),get('gallery'),get('projects')]).then(function(r){
  var off=r[0]||{active:true,pct:D.deal.pct,title:D.deal.title,text:D.deal.text};
  var gal=r[1]?r[1].items.map(function(x){return typeof x==='string'?{src:x}:x}):(D.galerie||[]).map(function(s){return{src:s}});
  var pro=r[2]?r[2].items:(D.projekte||[]).map(function(p){return{title:p.t,location:p.o,category:p.k,description:p.d,images:p.img,example:true}});
  // offer
  var today=new Date().toISOString().slice(0,10),on=off.active!==false&&!(off.validUntil&&off.validUntil<today);
  var sec=$('#angebot');if(sec)sec.hidden=!on;
  $$('a[href$="#angebot"]').forEach(function(a){a.style.display=on?'':'none'});
  var pct=+off.pct||10;
  $$('[data-deal-pct]').forEach(function(e){e.textContent=pct+' %'});
  $$('[data-deal-title]').forEach(function(e){e.textContent=off.title||'Angebot der Woche'});
  $$('[data-deal-text]').forEach(function(e){e.textContent=(off.text||'')+(off.validUntil?' Gültig bis '+fmtDate(off.validUntil)+'.':'')});
  $$('[data-deal-wa]').forEach(function(e){e.href='https://wa.me/'+WA+'?text='+encodeURIComponent('Hallo HBBS Kraft, ich möchte das Angebot der Woche ('+pct+' % Rabatt) nutzen. Mein Vorhaben: ')});
  $$('[data-deal-mail]').forEach(function(e){e.href='mailto:info@hbbs-kraft.de?subject='+encodeURIComponent('Angebot der Woche '+pct+' % – Anfrage')+'&body='+encodeURIComponent('Hallo HBBS Kraft,\n\nich möchte das Angebot der Woche ('+pct+' % Rabatt) nutzen.\n\nVorhaben:\nOrt:\nTelefon:\n')});
  // gallery
  var g=$('[data-gal]');if(g){var n=+g.dataset.gal||99;g.innerHTML=gal.slice(0,n).map(function(x){return '<figure class="fu"><img src="'+esc(x.src)+'" alt="'+esc(x.alt||'Baustellenfoto')+'" loading="lazy"></figure>'}).join('');reveal(g)}
  // projects
  var pc=$('[data-pro]');if(pc){var m=+pc.dataset.pro||99;pc.innerHTML=pro.slice(0,m).map(function(p,j){var im=p.images||[];
    return '<article class="bc fu '+(j%4==0||j%4==3?'w4':'w2')+'" data-imgs="'+esc(JSON.stringify(im))+'"'+(im.length?' style="cursor:zoom-in"':'')+'>'+(im[0]?'<img src="'+esc(im[0])+'" alt="" loading="lazy">':'')+'<span class="tag">'+(p.example?'Beispielprojekt':(im.length>1?im.length+' Fotos':'Projekt'))+'</span><p class="eb">'+esc(p.category||'Projekt')+(p.location?' · '+esc(p.location):'')+(p.date?' · '+esc(fmtDate(p.date).replace(/^\d\d\./,'')):'')+'</p><h3>'+esc(p.title)+(p.example?' – Beispiel':'')+'</h3><p>'+esc(p.description)+'</p></article>'}).join('');reveal(pc)}
});
})();
