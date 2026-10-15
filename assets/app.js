(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var D=window.HBBS_DEMO||{},L={};try{L=JSON.parse(localStorage.getItem('hbbs-admin')||'{}')}catch(e){}
var deal=Object.assign({},D.deal,L.deal||{});
var gal=(L.galerie||[]).concat(D.galerie||[]);
var pro=(L.projekte||[]).map(function(p){p.own=1;return p}).concat(D.projekte||[]);
var WA='4915907948177';
function waLink(){return 'https://wa.me/'+WA+'?text='+encodeURIComponent('Hallo HBBS Kraft, ich möchte das Angebot der Woche ('+deal.pct+' % Rabatt) nutzen. Mein Vorhaben: ')}
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
// deal
$$('[data-deal-pct]').forEach(function(e){e.textContent=deal.pct+' %'});
$$('[data-deal-title]').forEach(function(e){e.textContent=deal.title});
$$('[data-deal-text]').forEach(function(e){e.textContent=deal.text});
$$('[data-deal-wa]').forEach(function(e){e.href=waLink()});
$$('[data-deal-mail]').forEach(function(e){e.href='mailto:info@hbbs-kraft.de?subject='+encodeURIComponent('Angebot der Woche '+deal.pct+' % – Anfrage')+'&body='+encodeURIComponent('Hallo HBBS Kraft,\n\nich möchte das Angebot der Woche ('+deal.pct+' % Rabatt) nutzen.\n\nVorhaben:\nOrt:\nTelefon:\n')});
// gallery
var g=$('[data-gal]');if(g){var n=+g.dataset.gal||99;g.innerHTML=gal.slice(0,n).map(function(s){return '<figure class="fu"><img src="'+esc(s)+'" alt="Baustellenfoto (Beispiel)" loading="lazy"></figure>'}).join('')}
var lb=$('.lb');document.addEventListener('click',function(e){var f=e.target.closest('.gal figure');if(f&&lb){$('img',lb).src=$('img',f).src;lb.hidden=false}else if(e.target.closest('.lb'))lb.hidden=true});
// projects
var pc=$('[data-pro]');if(pc){var m=+pc.dataset.pro||99,cls=['w4','w2','w2','w2','w2','w2'];pc.innerHTML=pro.slice(0,m).map(function(p,j){return '<article class="bc fu '+(j%4==0||j%4==3?'w4':'w2')+'">'+(p.img&&p.img[0]?'<img src="'+esc(p.img[0])+'" alt="" loading="lazy">':'')+'<span class="tag">'+(p.own?'Neu':'Beispielprojekt')+'</span><p class="eb">'+esc(p.k||'Projekt')+' · '+esc(p.o)+'</p><h3>'+esc(p.t)+(p.own?'':' – Beispiel')+'</h3><p>'+esc(p.d)+'</p></article>'}).join('')}
// reveal
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
$$('.fu').forEach(function(e){io?io.observe(e):e.classList.add('in')});
// contact form -> mail
var f=$('#anfrage');if(f)f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f),l=[];d.forEach(function(v,k){if(String(v).trim())l.push(k+': '+v)});location.href='mailto:info@hbbs-kraft.de?subject='+encodeURIComponent('Anfrage '+(d.get('Leistung')||''))+'&body='+encodeURIComponent(l.join('\n'))});
})();
