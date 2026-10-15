(function(){'use strict';var $=function(s,r){return(r||document).querySelector(s)};var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
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
        else status.textContent = (res && res.message) || 'Senden fehlgeschlagen. Bitte schreiben Sie uns an info@hbbs-kraft.de oder rufen Sie an: +49 1590 7948177.';
      }).catch(function () {
        status.textContent = 'Senden fehlgeschlagen. Bitte schreiben Sie uns an info@hbbs-kraft.de oder rufen Sie an: +49 1590 7948177.';
      }).then(function () { btn.disabled = false; btn.textContent = BTN_TXT; });
    });
    $('[data-reset]', okBox).addEventListener('click', function () {
      form.reset(); okBox.hidden = true; form.hidden = false; t0 = Date.now(); fields.name.focus();
    });
    // anfrage.php redirects here with ?preisliste=danke when the browser posted without JS-fetch
    if (/[?&]preisliste=danke\b/.test(location.search)) success(false, '', '');
  }
})();
