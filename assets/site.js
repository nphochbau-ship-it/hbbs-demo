/* HBBS Kraft – shared site script (all pages). Vanilla JS, no dependencies.
   - header: shrink on scroll, mobile menu, active nav link
   - content: projects / gallery / references rendered from assets/data/*.json (see README-INHALT.md)
   - lightbox
   - "Preisliste anfordern" form (demo or live via anfrage.php) */
(function () {
  'use strict';
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var relayout = function () { try { window.dispatchEvent(new Event('resize')); } catch (e) {} };

  /* =============================== header =============================== */
  var header = $('#site-header');
  if (header) {
    var scrolled = false;
    var onScroll = function () {
      var s = (window.scrollY || 0) > 40;
      if (s !== scrolled) { scrolled = s; header.classList.toggle('scrolled', s); }
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // mobile menu
    var burger = $('.burger', header), menu = $('#mnav');
    var setMenu = function (open) {
      if (!burger || !menu) return;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      doc.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('open'); });
        var first = $('a', menu); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
      } else {
        menu.classList.remove('open');
        setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, 320);
      }
    };
    if (burger && menu) {
      burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
      menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
      });
      addEventListener('resize', function () { if (innerWidth >= 1180 && doc.classList.contains('menu-open')) setMenu(false); });
    }

    // active link for in-page sections (home page only)
    var links = $$('.nav a[href^="#"]', header);
    if (links.length && 'IntersectionObserver' in window) {
      var map = {};
      links.forEach(function (a) { var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) map[t.id] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var a = map[en.target.id]; if (!a) return;
          if (en.isIntersecting) { links.forEach(function (l) { l.removeAttribute('aria-current'); }); a.setAttribute('aria-current', 'true'); }
          else if (a.getAttribute('aria-current')) a.removeAttribute('aria-current');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
    }
  }

  /* =============================== icons / placeholders =============================== */
  var ICON_DRILL = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="40" fill="none" stroke="currentColor" stroke-width="7" stroke-dasharray="17 4"/><circle r="29" fill="none" stroke="#FF6A13" stroke-width="2.5" stroke-dasharray="120 62"/><circle r="9" fill="currentColor"/></svg>';
  var ICON_SAW = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="42" fill="none" stroke="currentColor" stroke-width="7" stroke-dasharray="11 6"/><circle r="27" fill="none" stroke="currentColor" stroke-width="2"/><circle r="8" fill="#FF6A13"/><path d="M0-25v9M0 25v-9M-25 0h9M25 0h-9" stroke="currentColor" stroke-width="3"/></svg>';
  var phTile = function (i, label) { return '<div class="ph-tile">' + (i % 2 ? ICON_SAW : ICON_DRILL) + '<span>' + esc(label || 'Projektfoto folgt') + '</span></div>'; };

  /* =============================== data =============================== */
  var cache = {};
  function load(name) {
    if (!cache[name]) cache[name] = fetch('assets/data/' + name + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return {}; });
    return cache[name];
  }
  var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  function fmtDate(d) {
    var m = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/.exec(String(d || ''));
    if (!m) return '';
    return m[2] ? MONTHS[+m[2] - 1] + ' ' + m[1] : m[1];
  }
  var slug = function (s) { return String(s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  function normImg(b) { // "assets/img/x.jpg" or {datei, alt, datum}
    if (!b) return null;
    if (typeof b === 'string') b = { datei: b };
    return b.datei ? { src: b.datei, alt: b.alt || '', datum: b.datum || '' } : null;
  }
  function projects(data) {
    var list = (data && Array.isArray(data.projekte) ? data.projekte : []).filter(function (p) { return p && p.titel && p.sichtbar !== false; });
    list.forEach(function (p, i) {
      p._id = p.id ? slug(p.id) : slug(p.titel) || 'projekt-' + (i + 1);
      p._imgs = (p.bilder || []).map(normImg).filter(Boolean);
    });
    return list.sort(function (a, b) { return String(b.datum || '').localeCompare(String(a.datum || '')); });
  }
  function metaLine(p) { return [p.ort, fmtDate(p.datum)].filter(Boolean).map(esc).join(' · '); }

  // --- home: latest projects
  $$('[data-render="projekte-start"]').forEach(function (box) {
    var limit = +box.getAttribute('data-limit') || 3;
    load('projekte').then(function (d) {
      var list = projects(d).slice(0, limit), html = '';
      if (!list.length) {
        for (var i = 0; i < limit; i++) html += '<a class="pcard is-ph" href="projekte.html"><div class="media">' + phTile(i) + '</div><div class="body">' +
          '<span class="meta">Ort · Datum folgen</span><h3>Projekt folgt</h3><p>Hier erscheint bald ein Projekt mit Fotos, Ort und Leistungsbeschreibung.</p><span class="more">Zu den Projekten</span></div></a>';
      } else list.forEach(function (p, i) {
        var img = p._imgs[0];
        html += '<a class="pcard" href="projekte.html#' + esc(p._id) + '"><div class="media">' +
          (img ? '<img src="' + esc(img.src) + '" alt="' + esc(img.alt || p.titel) + '" loading="lazy" decoding="async">' : phTile(i)) +
          '</div><div class="body"><span class="meta">' + metaLine(p) + '</span><h3>' + esc(p.titel) + '</h3>' +
          (p.leistung ? '<span class="tag">' + esc(p.leistung) + '</span>' : '') +
          (p.kurz ? '<p>' + esc(p.kurz) + '</p>' : '') + '<span class="more">Details ansehen</span></div></a>';
      });
      box.innerHTML = html; relayout();
    });
  });

  // --- home: gallery (galerie.json + all project photos, newest first)
  $$('[data-render="galerie"]').forEach(function (box) {
    var limit = +box.getAttribute('data-limit') || 8;
    Promise.all([load('galerie'), load('projekte')]).then(function (r) {
      var items = ((r[0] && r[0].bilder) || []).map(function (b) { var x = normImg(b); if (x) x.caption = (typeof b === 'object' && b.titel) || x.alt; return x; }).filter(Boolean);
      projects(r[1]).forEach(function (p) {
        if (p.inGalerie === false) return;
        p._imgs.forEach(function (im) { items.push({ src: im.src, alt: im.alt || p.titel, datum: im.datum || p.datum || '', caption: p.titel + (p.ort ? ' – ' + p.ort : '') }); });
      });
      items.sort(function (a, b) { return String(b.datum || '').localeCompare(String(a.datum || '')); });
      items = items.slice(0, limit);
      if (!items.length) for (var i = 0; i < limit; i++) items.push({ ph: true, i: i, caption: 'Projektfoto folgt' });
      renderGallery(box, items);
      box.classList.toggle('g8', items.length === 8);
      relayout();
    });
  });

  function renderGallery(box, items) {
    box.innerHTML = items.map(function (it, i) {
      return '<button type="button" data-i="' + i + '" aria-label="Bild ' + (i + 1) + ' von ' + items.length + (it.caption ? ': ' + esc(it.caption) : '') + ' vergrößern">' +
        (it.ph ? phTile(it.i == null ? i : it.i) : '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" loading="lazy" decoding="async">') + '</button>';
    }).join('');
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (b) LB.open(items, +b.getAttribute('data-i'));
    });
  }

  // --- references
  $$('[data-render="referenzen"]').forEach(function (ul) {
    var sec = ul.closest('section');
    load('referenzen').then(function (d) {
      if (!d || d.anzeigen !== true) return;      // stays hidden
      var refs = (Array.isArray(d.referenzen) ? d.referenzen : []).filter(function (x) { return x && x.name; }), html = '';
      if (!refs.length) for (var i = 0; i < 6; i++) html += '<li><span class="ref-ph">' + (i % 2 ? ICON_SAW : ICON_DRILL) + 'Referenz folgt</span></li>';
      else refs.forEach(function (x) {
        var inner = x.logo ? '<img src="' + esc(x.logo) + '" alt="' + esc(x.name) + '" loading="lazy" decoding="async">' : '<span class="ref-name">' + esc(x.name) + '</span>';
        html += '<li>' + (x.url ? '<a href="' + esc(x.url) + '" rel="noopener" target="_blank">' + inner + '</a>' : inner) + '</li>';
      });
      ul.innerHTML = html; if (sec) sec.hidden = false; relayout();
    });
  });

  // --- projects page: full list with expandable detail + gallery
  $$('[data-render="projekt-liste"]').forEach(function (box) {
    load('projekte').then(function (d) {
      var list = projects(d), html = '', galleries = [];
      var ph = !list.length;
      if (ph) for (var k = 0; k < 6; k++) list.push({ _ph: true, _id: 'platzhalter-' + (k + 1), _imgs: [] });
      list.forEach(function (p, i) {
        var imgs = p._ph ? [] : p._imgs;
        var gal = imgs.length ? imgs.map(function (im) { return { src: im.src, alt: im.alt || p.titel, caption: p.titel + (p.ort ? ' – ' + p.ort : '') }; })
                              : [0, 1, 2, 3].map(function (n) { return { ph: true, i: i + n, caption: 'Projektfoto folgt' }; });
        galleries.push(gal);
        var did = 'pd-' + i;
        html += '<article class="pitem' + (p._ph ? ' is-ph' : '') + '" id="' + esc(p._id) + '"><div class="pitem-main">' +
          '<button type="button" class="media" data-g="' + i + '" data-i="0" aria-label="Bilder ansehen">' +
          (imgs[0] ? '<img src="' + esc(imgs[0].src) + '" alt="' + esc(imgs[0].alt || p.titel) + '" loading="lazy" decoding="async">' : phTile(i)) + '</button>' +
          '<div class="body"><span class="meta">' + (p._ph ? 'Ort · Datum folgen' : metaLine(p)) + '</span>' +
          '<h2>' + (p._ph ? 'Projekt folgt' : esc(p.titel)) + '</h2>' +
          (p.leistung ? '<span class="tag">' + esc(p.leistung) + '</span>' : '') +
          '<p>' + (p._ph ? 'Hier erscheint bald ein Projekt mit Fotos, Ort und Leistungsbeschreibung.' : esc(p.kurz || '')) + '</p>' +
          '<button type="button" class="ptoggle" aria-expanded="false" aria-controls="' + did + '">Details &amp; Bilder<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>' +
          '</div></div><div class="pdetail" id="' + did + '" hidden>' +
          (p._ph ? '' : (p.beschreibung ? '<p class="desc">' + esc(p.beschreibung) + '</p>' : '')) +
          '<dl class="pdl"><dt>Ort</dt><dd>' + (p._ph ? 'folgt' : esc(p.ort || '–')) + '</dd><dt>Leistung</dt><dd>' + (p._ph ? 'folgt' : esc(p.leistung || '–')) +
          '</dd><dt>Datum</dt><dd>' + (p._ph ? 'folgt' : esc(fmtDate(p.datum) || '–')) + '</dd></dl>' +
          '<div class="gal" data-g="' + i + '">' + gal.map(function (it, n) {
            return '<button type="button" data-g="' + i + '" data-i="' + n + '" aria-label="Bild ' + (n + 1) + ' von ' + gal.length + ' vergrößern">' +
              (it.ph ? phTile(it.i) : '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" loading="lazy" decoding="async">') + '</button>';
          }).join('') + '</div></div></article>';
      });
      if (ph) html += '<p class="empty-note">Platzhalter – echte Projekte werden in <code>assets/data/projekte.json</code> eingetragen.</p>';
      box.innerHTML = html;
      box.addEventListener('click', function (e) {
        var t = e.target.closest('.ptoggle');
        if (t) {
          var open = t.getAttribute('aria-expanded') !== 'true', panel = document.getElementById(t.getAttribute('aria-controls'));
          t.setAttribute('aria-expanded', open ? 'true' : 'false'); panel.hidden = !open; t.closest('.pitem').classList.toggle('open', open);
          if (open && history.replaceState) history.replaceState(null, '', '#' + t.closest('.pitem').id);
          return;
        }
        var b = e.target.closest('button[data-g]');
        if (b) LB.open(galleries[+b.getAttribute('data-g')], +b.getAttribute('data-i') || 0);
      });
      // deep link: projekte.html#<id> opens that project
      var h = decodeURIComponent(location.hash.slice(1));
      var target = h && document.getElementById(h);
      if (target && target.classList.contains('pitem')) {
        var tg = $('.ptoggle', target); if (tg) tg.click();
        setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 30);
      }
    });
  });

  /* =============================== lightbox =============================== */
  var LB = (function () {
    var el, stage, cap, prev, next, close, items = [], idx = 0, lastFocus = null, x0 = null;
    var svg = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    function build() {
      el = document.createElement('div');
      el.className = 'lb'; el.hidden = true;
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Bildansicht');
      el.innerHTML = '<figure><div class="lb-stage"></div><figcaption></figcaption></figure>' +
        '<button type="button" class="lb-btn lb-prev" aria-label="Vorheriges Bild">' + svg('m15 5-7 7 7 7') + '</button>' +
        '<button type="button" class="lb-btn lb-next" aria-label="Nächstes Bild">' + svg('m9 5 7 7-7 7') + '</button>' +
        '<button type="button" class="lb-btn lb-close" aria-label="Schließen">' + svg('M6 6l12 12M18 6 6 18') + '</button>';
      document.body.appendChild(el);
      stage = $('.lb-stage', el); cap = $('figcaption', el); prev = $('.lb-prev', el); next = $('.lb-next', el); close = $('.lb-close', el);
      prev.addEventListener('click', function () { show(idx - 1); });
      next.addEventListener('click', function () { show(idx + 1); });
      close.addEventListener('click', hide);
      el.addEventListener('click', function (e) { if (e.target === el || e.target.tagName === 'FIGURE' || e.target === stage) hide(); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hide();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
        else if (e.key === 'Tab') { // simple focus trap
          var f = [prev, next, close].filter(function (b) { return !b.hidden; }), i = f.indexOf(document.activeElement);
          e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      });
      el.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
      el.addEventListener('pointerup', function (e) { if (x0 != null && Math.abs(e.clientX - x0) > 50 && items.length > 1) show(idx + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    }
    function show(n) {
      idx = (n + items.length) % items.length;
      var it = items[idx];
      stage.innerHTML = it.ph ? phTile(it.i == null ? idx : it.i, it.caption).replace('class="ph-tile"', 'class="ph-tile lb-img"')
                              : '<img class="lb-img" src="' + esc(it.src) + '" alt="' + esc(it.alt) + '">';
      cap.innerHTML = (items.length > 1 ? '<b>' + (idx + 1) + ' / ' + items.length + '</b>' : '') + esc(it.ph ? '' : (it.caption || it.alt || ''));
    }
    function open(list, n) {
      if (!list || !list.length) return;
      if (!el) build();
      items = list; lastFocus = document.activeElement;
      prev.hidden = next.hidden = items.length < 2;
      show(n || 0);
      el.hidden = false; doc.classList.add('lb-open');
      requestAnimationFrame(function () { el.classList.add('open'); close.focus({ preventScroll: true }); });
    }
    function hide() {
      if (!el || el.hidden) return;
      el.classList.remove('open'); doc.classList.remove('lb-open');
      setTimeout(function () { el.hidden = true; stage.innerHTML = ''; }, 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    return { open: open, close: hide };
  })();

  /* =============================== Preisliste form =============================== */
  // FORM_MODE: 'demo' = never send anything (GitHub Pages preview)
  //            'live' = always POST to ENDPOINT (PHP hosting with anfrage.php)
  //            'auto' = probe ENDPOINT with GET; anfrage.php answers {"status":"ready"} -> live, otherwise (404 on Pages) -> demo
  var FORM_MODE = 'auto';
  var ENDPOINT = 'anfrage.php';
  var form = $('#preisliste-form');
  if (form) {
    var okBox = $('#pl-success'), btn = $('button[type="submit"]', form), status = $('.form-status', form), t0 = Date.now(), mode = null;
    var BTN_TXT = btn.textContent;
    var fields = { name: form.elements.name, email: form.elements.email, einwilligung: form.elements.einwilligung };
    var errEl = { name: $('#e-name'), email: $('#e-email'), einwilligung: $('#e-consent') };
    var EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

    function setErr(k, msg) {
      errEl[k].textContent = msg || '';
      if (msg) fields[k].setAttribute('aria-invalid', 'true'); else fields[k].removeAttribute('aria-invalid');
    }
    function validate() {
      var bad = [];
      var n = fields.name.value.trim(), m = fields.email.value.trim();
      setErr('name', n ? '' : 'Bitte geben Sie Ihren Namen an.'); if (!n) bad.push('name');
      setErr('email', !m ? 'Bitte geben Sie Ihre E-Mail-Adresse an.' : EMAIL_RE.test(m) ? '' : 'Bitte prüfen Sie die E-Mail-Adresse.'); if (!m || !EMAIL_RE.test(m)) bad.push('email');
      setErr('einwilligung', fields.einwilligung.checked ? '' : 'Bitte stimmen Sie der Speicherung Ihrer Angaben zu.'); if (!fields.einwilligung.checked) bad.push('einwilligung');
      return bad;
    }
    ['name', 'email'].forEach(function (k) { fields[k].addEventListener('blur', function () { if (fields[k].getAttribute('aria-invalid')) validate(); }); });
    fields.einwilligung.addEventListener('change', function () { if (fields.einwilligung.checked) setErr('einwilligung', ''); });

    function detectMode() {
      if (FORM_MODE !== 'auto') return Promise.resolve(FORM_MODE);
      if (mode) return Promise.resolve(mode);
      return fetch(ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { return (mode = j && j.status === 'ready' ? 'live' : 'demo'); })
        .catch(function () { return (mode = 'demo'); });
    }
    function success(isDemo, name, mail) {
      $('.pl-name', okBox).textContent = name ? ', ' + name : '';
      $('.pl-mail', okBox).innerHTML = mail ? ' an <b>' + esc(mail) + '</b>' : '';
      $('.demo', okBox).hidden = !isDemo;
      form.hidden = true; okBox.hidden = false;
      okBox.focus({ preventScroll: true });
      var r = okBox.getBoundingClientRect(); if (r.top < 70 || r.top > innerHeight * .6) okBox.closest('.plbox').scrollIntoView({ block: 'center' });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      var bad = validate();
      if (bad.length) { fields[bad[0]].focus(); return; }
      if (form.elements.website.value) return;           // honeypot filled -> silently ignore
      form.elements.ts.value = String(Date.now() - t0);  // ms on page (server-side time trap)
      btn.disabled = true; btn.textContent = 'Wird gesendet …';
      var name = fields.name.value.trim(), mail = fields.email.value.trim();
      detectMode().then(function (m) {
        if (m !== 'live') {
          // DEMO: no backend on GitHub Pages – nothing is sent or stored, we only show the success state.
          return new Promise(function (res) { setTimeout(function () { res({ ok: true, demo: true }); }, 650); });
        }
        return fetch(ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
      }).then(function (res) {
        if (res && res.ok) success(!!res.demo, name, mail);
        else status.textContent = (res && res.message) || 'Senden fehlgeschlagen. Bitte schreiben Sie uns an info@hbbs-kraft.de oder rufen Sie an: +49 163 1443778.';
      }).catch(function () {
        status.textContent = 'Senden fehlgeschlagen. Bitte schreiben Sie uns an info@hbbs-kraft.de oder rufen Sie an: +49 163 1443778.';
      }).then(function () { btn.disabled = false; btn.textContent = BTN_TXT; });
    });
    $('[data-reset]', okBox).addEventListener('click', function () {
      form.reset(); okBox.hidden = true; form.hidden = false; t0 = Date.now(); fields.name.focus();
    });
    // anfrage.php redirects here with ?preisliste=danke when the browser posted without JS-fetch
    if (/[?&]preisliste=danke\b/.test(location.search)) success(false, '', '');
  }
})();
