/* HBBS Kraft – Demo. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var motion = doc.classList.contains('motion');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- contact form: opens the visitor's mail app (works without motion) ---------- */
  var form = $('#anfrage');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), lines = [];
    f.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ': ' + v); });
    var subj = 'Anfrage ' + (f.get('Leistung') || '') + (f.get('Ort') ? ' – ' + f.get('Ort') : '');
    location.href = 'mailto:info@hbbs-kraft.de?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
  });

  var hero = $('#hero');
  // Header state (shrink/solid) and mobile menu live in site.js.
  if (!motion || !hero) return;

  /* ---------- helpers ---------- */
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeIn = function (t) { return t * t * t; };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  var stage = $('.stage', hero), slabwrap = $('.slabwrap'), kerf = $('.kerf'), core = $('.core'),
      coreShade = $('.core-shade'), crown = $('.crown'), cshadow = $('.crown-shadow'), hint = $('.hint'),
      content = $('.hero-content');
  var boreFill = $('.bore-fill'), boreHead = $('.bore-head'), boreEl = $('.bore'), depthEl = $('#depth');

  /* ---------- canvas fx ---------- */
  var cv = $('#fx'), ctx = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var W = 0, H = 0, r0 = 100, cx = 0, cy = 0, smax = 6, heroStart = 0, heroLen = 1, docLen = 1;
  var parts = [], MAXP = 260;

  function layout() {
    W = innerWidth; H = stage.clientHeight || innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(innerHeight * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    r0 = Math.round(Math.min(W * 0.27, H * 0.2));
    cx = W / 2; cy = Math.round(H * 0.46);
    stage.style.setProperty('--r0', r0 + 'px');
    stage.style.setProperty('--cy', cy + 'px');
    core.style.backgroundPosition = (-(cx - r0)) + 'px ' + (-(cy - r0)) + 'px';
    smax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) / r0 * 1.15 + 0.3;
    heroStart = hero.offsetTop; heroLen = Math.max(1, hero.offsetHeight - H);
    docLen = Math.max(1, document.documentElement.scrollHeight - innerHeight - (heroStart + heroLen));
    seams.forEach(function (s) { s.cut = parseFloat(getComputedStyle(s.el).getPropertyValue('--cut')) || 96; });
  }

  function emitDust(x, y, vx, vy, n, life, col) {
    for (var i = 0; i < n && parts.length < MAXP; i++) {
      parts.push({ t: 0, x: x, y: y, px: x, py: y,
        vx: vx + (Math.random() - .5) * 80, vy: vy + (Math.random() - .5) * 80,
        life: life * (.6 + Math.random() * .8), s: .8 + Math.random() * 2.2, k: 0, c: col || 0, g: 0, drag: 2.2 });
    }
  }
  function emitSpark(x, y, dir) {
    if (parts.length >= MAXP) return;
    var a = -Math.PI / 2 + (Math.random() - .5) * 1.6 + dir * -.6, sp = 260 + Math.random() * 520;
    parts.push({ t: 0, x: x, y: y, px: x, py: y, vx: Math.cos(a) * sp - dir * 120, vy: Math.sin(a) * sp,
      life: .25 + Math.random() * .45, s: 1 + Math.random() * 1.2, k: 1, c: Math.random() < .3 ? 2 : 1, g: 1400, drag: .6 });
  }
  var COLS = ['rgba(214,210,203,', 'rgba(255,122,40,', 'rgba(255,214,160,'];
  function stepParticles(dt) {
    ctx.clearRect(0, 0, W, innerHeight);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.t += dt;
      if (p.t >= p.life) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
      p.px = p.x; p.py = p.y;
      var d = Math.exp(-p.drag * dt); p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      var a = 1 - p.t / p.life;
      if (p.k) {
        ctx.strokeStyle = COLS[p.c] + a + ')'; ctx.lineWidth = p.s; ctx.beginPath();
        ctx.moveTo(p.px - p.vx * .012, p.py - p.vy * .012); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else {
        ctx.fillStyle = COLS[p.c] + (a * .75) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 + p.t / p.life), 0, 6.283); ctx.fill();
      }
    }
  }

  /* ---------- hero (scroll-driven bore) ---------- */
  var angle = 0, lastP = -1, lastY = scrollY, vel = 0, burstDone = false, prevD = 0;
  function hero_(dt, y) {
    var p = clamp((y - heroStart) / heroLen, 0, 1);
    var visible = y < heroStart + heroLen + H;
    if (!visible) return false;
    var d = easeOut(seg(p, 0.02, 0.40));       // drilling depth
    var lift = seg(p, 0.40, 0.52);              // crown pulls out
    var drop = seg(p, 0.48, 0.64);              // core falls
    var dive = seg(p, 0.62, 0.97);              // fly through the hole

    // spin: idle + scroll speed
    var spinning = lift < 1;
    if (spinning) {
      var rps = 0.35 + 1.9 * clamp(Math.abs(vel) / 900, 0, 1) * (d < 1 ? 1 : 0.4);
      angle = (angle + rps * 360 * dt) % 360;
    }
    var cs = 1.14 - 0.15 * d + lift * 0.55;
    crown.style.transform = 'rotate(' + angle.toFixed(2) + 'deg) scale(' + cs.toFixed(4) + ')';
    crown.style.opacity = (1 - lift).toFixed(3);
    var off = (1 - d) * r0 * 0.14 + lift * r0 * 0.4;
    cshadow.style.transform = 'translate(' + off.toFixed(1) + 'px,' + (off * 1.3).toFixed(1) + 'px) scale(' + (1.08 - 0.1 * d + lift * .4).toFixed(3) + ')';
    cshadow.style.opacity = ((0.55 + 0.45 * (1 - d)) * (1 - lift)).toFixed(3);
    kerf.style.opacity = d.toFixed(3);

    var cS = 1 - 0.42 * easeIn(drop);
    core.style.transform = 'translateY(' + (drop * r0 * 0.12).toFixed(1) + 'px) scale(' + cS.toFixed(4) + ')';
    coreShade.style.opacity = (drop * 0.9).toFixed(3);
    core.style.opacity = (1 - seg(drop, 0.65, 1)).toFixed(3);

    var e = easeIn(dive);
    slabwrap.style.transform = 'scale(' + (1 + e * (smax - 1)).toFixed(4) + ')';
    slabwrap.style.opacity = (1 - seg(dive, 0.8, 1)).toFixed(3);
    content.style.transform = 'scale(' + (0.9 + 0.1 * easeOut(seg(p, 0.5, 0.97))).toFixed(4) + ')';
    content.style.opacity = (0.35 + 0.65 * seg(p, 0.5, 0.8)).toFixed(3);
    hint.style.opacity = (1 - seg(p, 0, 0.06)).toFixed(3);

    // dust from the cutting edge while drilling
    var dd = Math.max(0, d - prevD); prevD = d;
    if (d > 0.01 && lift < 0.3) {
      var rate = (dd * 2600 + (Math.abs(vel) > 30 ? 10 : 0)) * (1 - lift);
      var n = Math.min(14, rate * dt * 60 | 0) + (Math.random() < rate * dt ? 1 : 0);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, rr = r0 * (1.0 + Math.random() * 0.25);
        var tx = -Math.sin(a), ty = Math.cos(a), sp = 120 + Math.random() * 220;
        emitDust(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, Math.cos(a) * sp * .8 + tx * sp * .7, Math.sin(a) * sp * .8 + ty * sp * .7, 1, 1.1, 0);
      }
    }
    if (drop > 0.05 && !burstDone) {
      burstDone = true;
      for (var j = 0; j < 40; j++) {
        var b = Math.random() * 6.283, s2 = 60 + Math.random() * 260;
        emitDust(cx + Math.cos(b) * r0, cy + Math.sin(b) * r0, Math.cos(b) * s2, Math.sin(b) * s2, 1, 1.4, 0);
      }
    }
    if (drop < 0.01) burstDone = false;
    lastP = p;
    return p < 0.55 || dd > 0; // keep animating while crown is visible
  }

  /* ---------- section seams ---------- */
  var seams = $$('.sec').filter(function (sec) { return $('.seam', sec); }).map(function (sec) {
    var el = $('.seam', sec);
    el.style.setProperty('--prev', sec.getAttribute('data-prev'));
    return { sec: sec, el: el, top: $('.h-top', el), bot: $('.h-bot', el), cut: 96, line: $('.cut', el), blade: $('.blade', el), state: 0, t0: 0, lastBx: -60 };
  });
  var CUT_MS = 620, OPEN_MS = 760;
  function seams_(now) {
    var active = false;
    for (var i = 0; i < seams.length; i++) {
      var s = seams[i];
      if (s.state === 2) continue;
      var r = s.sec.getBoundingClientRect();
      if (s.state === 0) {
        if (r.bottom < 0) { finish(s); continue; }           // already scrolled past
        if (r.top < innerHeight * 0.78) { s.state = 1; s.t0 = now; s.sec.classList.add('pre'); }
        else continue;
      }
      active = true;
      var t = now - s.t0, lineY = r.top + s.cut;
      if (t <= CUT_MS) {
        var k = easeInOut(t / CUT_MS), bx = -60 + k * (W + 120);
        s.blade.style.transform = 'translateX(' + bx.toFixed(1) + 'px)';
        s.line.style.transform = 'scaleX(' + clamp(bx / W, 0, 1).toFixed(4) + ')';
        if (bx > 0 && bx < W && lineY > -20 && lineY < innerHeight + 20) {
          var n = 3 + (Math.random() * 3 | 0);
          for (var j = 0; j < n; j++) emitSpark(bx, lineY, 1);
          if (Math.random() < .6) emitDust(bx, lineY, -60, -30, 1, .8, 0);
        }
      } else {
        var o = clamp((t - CUT_MS) / OPEN_MS, 0, 1), e = easeInOut(o);
        if (s.sec.classList.contains('pre')) s.sec.classList.remove('pre');
        s.blade.style.opacity = 0;
        s.line.style.opacity = (1 - o).toFixed(3);
        s.top.style.transform = 'translateY(' + (-e * s.cut).toFixed(1) + 'px)';
        s.bot.style.transform = 'translateY(' + (e * innerHeight * 0.7).toFixed(1) + 'px)';
        s.top.style.opacity = s.bot.style.opacity = (1 - e).toFixed(3);
        if (o >= 1) finish(s);
      }
    }
    return active;
  }
  function finish(s) { s.state = 2; s.el.classList.add('done'); s.sec.classList.remove('pre'); }

  /* ---------- bore channel ---------- */
  var lastDepth = -1, boreShown = false;
  function bore_(y) {
    var start = heroStart + heroLen * 0.97;
    var show = y > start;
    if (show !== boreShown) { boreShown = show; doc.classList.toggle('show-bore', show); }
    var p = clamp((y - start) / Math.max(1, docLen + heroLen * 0.03), 0, 1);
    boreFill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    boreHead.style.transform = 'translateY(' + (p * boreEl.clientHeight).toFixed(1) + 'px)';
    var cm = Math.round(p * 100);
    if (cm !== lastDepth) { lastDepth = cm; depthEl.textContent = cm; }
  }

  /* ---------- loop ---------- */
  var running = false, lastT = 0, lastScrollT = 0;
  function frame(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now;
    var y = scrollY;
    var v = (y - lastY) / Math.max(dt, 0.001); lastY = y;
    vel += (v - vel) * Math.min(1, dt * 10);
    var a = hero_(dt, y);
    var b = seams_(now);
    bore_(y);
    stepParticles(dt);
    if (a || b || parts.length || now - lastScrollT < 200 || Math.abs(vel) > 5) requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, W, innerHeight); }
  }
  var depthT; function depthShow() { if (!doc.classList.contains('show-depth')) doc.classList.add('show-depth'); clearTimeout(depthT); depthT = setTimeout(function () { doc.classList.remove('show-depth'); }, 1400); }
  function kick() { lastScrollT = performance.now(); depthShow(); if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(frame); } }
  addEventListener('scroll', kick, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); kick(); }, 120); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
  layout(); kick(); doc.classList.remove('show-depth');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); kick(); });
  addEventListener('load', function () { layout(); kick(); });
})();
