(function(){'use strict';var $=function(s,r){return(r||document).querySelector(s)};var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  /* =============================== Preisliste form =============================== */
  // No backend on static hosting: the form opens a prefilled e-mail or WhatsApp message to HBBS Kraft,
  // which the visitor sends themselves. Nothing is sent to this server.
  var MAIL = 'info@hbbs-kraft.de', WA = '4915907948177';
  var form = $('#preisliste-form');
  if (form) {
    var okBox = $('#pl-success'), status = $('.form-status', form), t0 = Date.now(), via = 'mail';
    Array.prototype.forEach.call(form.querySelectorAll('button[type="submit"]'), function (b) { b.addEventListener('click', function () { via = b.value || 'mail'; }); });
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

    function success(ch, name, mail) {
      $('.pl-name', okBox).textContent = name ? ', ' + name : '';
      $('.pl-mail', okBox).innerHTML = mail ? ' an <b>' + esc(mail) + '</b>' : '';
      var c = $('.pl-chan', okBox); if (c) c.textContent = ch === 'wa' ? 'WhatsApp' : 'E-Mail-Programm';
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
      var name = fields.name.value.trim(), mail = fields.email.value.trim(), el = form.elements;
      var subj = 'Preisliste anfordern – ' + name;
      var lines = ['Hallo HBBS Kraft,', '', 'bitte senden Sie mir Ihre aktuelle Preisliste.', '', 'Name: ' + name];
      if (el.firma.value.trim()) lines.push('Firma: ' + el.firma.value.trim());
      lines.push('E-Mail: ' + mail);
      if (el.telefon.value.trim()) lines.push('Telefon: ' + el.telefon.value.trim());
      if (el.nachricht.value.trim()) lines.push('', 'Nachricht: ' + el.nachricht.value.trim());
      lines.push('', 'Viele Grüße', name);
      var body = lines.join('\n');
      if (via === 'wa') window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(subj + '\n\n' + body), '_blank', 'noopener');
      else location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      success(via, name, mail);
    });
    $('[data-reset]', okBox).addEventListener('click', function () {
      form.reset(); okBox.hidden = true; form.hidden = false; t0 = Date.now(); fields.name.focus();
    });
  }
})();
