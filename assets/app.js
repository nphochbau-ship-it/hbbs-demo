(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var WA='4915907948177',MAIL='info@hbbs-kraft-gmbh.de',MOB=matchMedia('(max-width:1023.98px)');
// header
var hd=$('.hd'),hero=$('.hero'),top=$('.top');
function onS(){var y=scrollY;if(hd)hd.classList.toggle('solid',!hero||y>hero.offsetHeight-80);if(top)top.classList.toggle('on',y>900)}
addEventListener('scroll',onS,{passive:true});onS();
if(top)top.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
var bg=$('.burger'),mn=$('#mnav');if(bg)bg.onclick=function(){var o=mn.hidden;mn.hidden=!o;bg.setAttribute('aria-expanded',o);hd.classList.add('solid');if(!o)onS()};
$$('#mnav a').forEach(function(a){a.addEventListener('click',function(){mn.hidden=true;onS()})});
// hero carousel (slides 2..n load after the page has loaded)
var sl=$$('.hero .sl'),di=$$('.dots i'),i=0;
function lazySlides(){$$('.hero img[data-src]').forEach(function(im){im.srcset=im.dataset.srcset;im.src=im.dataset.src;im.removeAttribute('data-src')})}
if(document.readyState==='complete')setTimeout(lazySlides,300);else addEventListener('load',function(){setTimeout(lazySlides,300)});
if(sl.length>1)setInterval(function(){sl[i].classList.remove('on');di[i]&&di[i].classList.remove('on');i=(i+1)%sl.length;sl[i].classList.add('on');di[i]&&di[i].classList.add('on')},5200);
// reveal
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
function reveal(r){$$('.fu',r).forEach(function(e){if(e.classList.contains('in'))return;io?io.observe(e):e.classList.add('in')})}
reveal();
// WhatsApp float (mobile): hide over hero + footer CTA and while a form field is focused
var wa=$('.wa');
if(wa&&'IntersectionObserver' in window){var over={},foc=false;
  function waUpd(){var hide=MOB.matches&&(foc||Object.keys(over).some(function(k){return over[k]}));wa.classList.toggle('off',hide);wa.setAttribute('tabindex',hide?'-1':'0')}
  var wio=new IntersectionObserver(function(es){es.forEach(function(e){over[e.target===hero?'h':'f']=e.isIntersecting});waUpd()},{threshold:0});
  if(hero)wio.observe(hero);var ft=$('.ft');if(ft)wio.observe(ft);
  document.addEventListener('focusin',function(e){if(e.target.matches('input,textarea,select')){foc=true;waUpd()}});
  document.addEventListener('focusout',function(){foc=false;setTimeout(waUpd,50)});
  if(MOB.addEventListener)MOB.addEventListener('change',waUpd);}
// lightbox (supports multiple photos per project)
var lb=$('.lb'),lbList=[],lbI=0;
function lbShow(list,k){if(!lb)return;lbList=list;lbI=k||0;$('img',lb).src=lbList[lbI];lb.hidden=false}
document.addEventListener('click',function(e){
  var f=e.target.closest('.gal figure');if(f){var im=$('img',f);lbShow([im.dataset.full||im.currentSrc||im.src]);return}
  var a=e.target.closest('.bc[data-imgs]');if(a){var l=JSON.parse(a.getAttribute('data-imgs'));if(l.length)lbShow(l,0);return}
  if(lb&&!lb.hidden&&e.target.closest('.lb')){if(lbList.length>1&&e.target.tagName==='IMG'){lbI=(lbI+1)%lbList.length;$('img',lb).src=lbList[lbI]}else lb.hidden=true}
});
// contact form -> mail
var f=$('#anfrage');if(f)f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f),l=[];d.forEach(function(v,k){if(String(v).trim())l.push(k+': '+v)});location.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Anfrage '+(d.get('Leistung')||''))+'&body='+encodeURIComponent(l.join('\n'))});

/* ---- content from content/*.json (maintained via the Verwaltung) ---- */
function get(n){return fetch('content/'+n+'.json?t='+Math.floor(Date.now()/60000),{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null})}
function fmtDate(s){if(!s)return'';var p=String(s).split('-');return p.length>=2?(p[2]?p[2]+'.':'')+p[1]+'.'+p[0]:s}
function berlinToday(){try{return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){return new Date().toISOString().slice(0,10)}}
// responsive variants: explicit srcset, or admin uploads named *-1600.webp (+ -480 / -960)
function srcsetOf(x){if(x.srcset)return x.srcset;var m=/^(.*)-1600\.(webp|jpg)$/.exec(x.src||'');return m?[480,960,1600].map(function(w){return m[1]+'-'+w+'.'+m[2]+' '+w+'w'}).join(', '):''}
function imgTag(x,sizes,extra){var s=srcsetOf(x);return '<img src="'+esc(x.src)+'"'+(s?' srcset="'+esc(s)+'" sizes="'+sizes+'"':'')+(x.w&&x.h?' width="'+(+x.w)+'" height="'+(+x.h)+'"':'')+' alt="'+esc(x.alt||'')+'" loading="lazy" decoding="async"'+(extra||'')+'>'}
Promise.all([get('offer'),get('gallery'),get('projects')]).then(function(r){
  var off=r[0]||{active:false};
  var gal=r[1]?r[1].items.map(function(x){return typeof x==='string'?{src:x}:x}):[];
  var pro=(r[2]?r[2].items:[]).filter(function(p){return p&&!p.example});
  // offer: only shown inside an explicit period (validFrom..validUntil, Europe/Berlin), auto-hidden afterwards
  var today=berlinToday(),on=off.active!==false&&!!off.validUntil&&today<=off.validUntil&&(!off.validFrom||today>=off.validFrom);
  var sec=$('#angebot');if(sec)sec.hidden=!on;
  $$('a[href$="#angebot"]').forEach(function(a){a.style.display=on?'':'none'});
  if(on){
    var pct=+off.pct||10,from=off.validFrom?fmtDate(off.validFrom):'',until=fmtDate(off.validUntil),period=(from?from+' – ':'bis ')+until;
    $$('[data-deal-pct]').forEach(function(e){e.textContent=pct+' %'});
    $$('[data-deal-title]').forEach(function(e){e.textContent=off.title||'Angebot der Woche'});
    $$('[data-deal-text]').forEach(function(e){e.textContent=off.text||''});
    $$('[data-deal-period]').forEach(function(e){e.textContent='Aktionszeitraum: '+period});
    $$('[data-deal-terms]').forEach(function(e){e.textContent='Aktionszeitraum '+period+' (23:59 Uhr). '+pct+' % Rabatt auf den Netto-Auftragswert laut Angebot. Gilt für Neuaufträge, die im Aktionszeitraum über diese Website (WhatsApp, E-Mail oder Formular) angefragt werden. Es gelten die Preise und der Mindestauftragswert der aktuellen Preisliste. Nicht mit anderen Rabatten kombinierbar, keine Barauszahlung.'+(off.terms?' '+off.terms:'')});
    $$('[data-deal-wa]').forEach(function(e){e.href='https://wa.me/'+WA+'?text='+encodeURIComponent('Hallo HBBS Kraft, ich möchte das Angebot der Woche ('+pct+' % Rabatt, Aktionszeitraum '+period+') nutzen. Mein Vorhaben: ')});
    $$('[data-deal-mail]').forEach(function(e){e.href='mailto:'+MAIL+'?subject='+encodeURIComponent('Angebot der Woche '+pct+' % – Anfrage')+'&body='+encodeURIComponent('Hallo HBBS Kraft,\n\nich möchte das Angebot der Woche ('+pct+' % Rabatt, Aktionszeitraum '+period+') nutzen.\n\nVorhaben:\nOrt:\nTelefon:\n')});
  }
  // gallery
  var g=$('[data-gal]');if(g){var n=+g.dataset.gal||99;g.innerHTML=gal.slice(0,n).map(function(x){return '<figure class="fu">'+imgTag({src:x.src,srcset:x.srcset,w:x.w,h:x.h,alt:x.alt||'Baustellenfoto der HBBS Kraft GmbH'},'(max-width:600px) calc(50vw - 27px), (max-width:1023px) 50vw, 380px',' data-full="'+esc(x.src)+'"')+'</figure>'}).join('');reveal(g)}
  // projects (real references only; section stays hidden while there are none)
  var ps=$('#projekte');if(ps)ps.hidden=!pro.length;
  var pe=$('[data-pro-empty]');if(pe)pe.hidden=!!pro.length;
  var pc=$('[data-pro]');if(pc){pc.hidden=!pro.length;var m=+pc.dataset.pro||99;pc.innerHTML=pro.slice(0,m).map(function(p,j){var im=p.images||[],w4=(j%4==0||j%4==3);
    return '<article class="bc fu '+(w4?'w4':'w2')+'" data-imgs="'+esc(JSON.stringify(im))+'"'+(im.length?' style="cursor:zoom-in"':'')+'>'+(im[0]?imgTag({src:im[0]},w4?'(max-width:860px) calc(100vw - 44px), 760px':'(max-width:860px) calc(100vw - 44px), 380px'):'')+'<span class="tag">'+(im.length>1?im.length+' Fotos':'Projekt')+'</span><p class="eb">'+esc(p.category||'Projekt')+(p.location?' · '+esc(p.location):'')+(p.date?' · '+esc(fmtDate(p.date).replace(/^\d\d\./,'')):'')+'</p><h3>'+esc(p.title)+'</h3><p>'+esc(p.description)+'</p></article>'}).join('');reveal(pc)}
});
})();
