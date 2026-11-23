/* MISJA: ZDROWIE! – logika gry. Czysty JavaScript, bez zależności, działa z pliku (file://). */
(function () {
  'use strict';

  var D = window.MZ_DATA;
  var M = D.MISSIONS;
  var KEY = 'misjaZdrowie.v1';

  // ---------- narzędzia ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fb(kind, title, text, icon) {
    var cls = kind === true ? 'ok' : kind === false ? 'no' : 'info';
    var ic = icon || (kind === true ? '✅' : kind === false ? '💡' : 'ℹ️');
    return '<div class="feedback ' + cls + '"><span class="emoji">' + ic + '</span><div><b>' + title + '</b>' + (text || '') + '</div></div>';
  }
  function scrollTo(node) {
    if (node && node.scrollIntoView) {
      try { node.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { node.scrollIntoView(false); }
    }
  }

  // ---------- stan i zapis ----------
  function load() {
    var base = { team: '', scores: {}, done: {}, sound: true };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          base.team = typeof s.team === 'string' ? s.team : '';
          base.scores = s.scores && typeof s.scores === 'object' ? s.scores : {};
          base.done = s.done && typeof s.done === 'object' ? s.done : {};
          base.sound = s.sound !== false;
        }
      }
    } catch (e) { /* brak localStorage – gra działa bez zapisu */ }
    return base;
  }
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
  function resetGame(team) {
    state.team = team || '';
    state.scores = {};
    state.done = {};
    save();
  }
  function total() { return M.reduce(function (t, m) { return t + (state.scores[m.id] || 0); }, 0); }
  function doneCount() { return M.filter(function (m) { return state.done[m.id]; }).length; }
  function nextUndone(after) {
    var start = after ? M.indexOf(after) + 1 : 0;
    for (var k = 0; k < M.length; k++) {
      var m = M[(start + k) % M.length];
      if (!state.done[m.id]) return m;
    }
    return null;
  }

  // ---------- dźwięk (generowany, bez plików) ----------
  var actx = null;
  function beep(f, t, d, type, vol) {
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.value = f;
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + d + 0.03);
  }
  function sfx(kind) {
    if (!state.sound) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var t = actx.currentTime;
      if (kind === 'ok') { beep(660, t, 0.12); beep(880, t + 0.1, 0.2); }
      else if (kind === 'no') { beep(330, t, 0.16, 'triangle'); beep(262, t + 0.12, 0.2, 'triangle'); }
      else if (kind === 'click') { beep(540, t, 0.06, 'sine', 0.06); }
      else if (kind === 'tick') { beep(880, t, 0.06, 'square', 0.04); }
      else if (kind === 'end') { beep(523, t, 0.15); beep(784, t + 0.15, 0.3); }
      else if (kind === 'win') { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, t + i * 0.12, 0.25); }); }
    } catch (e) { }
  }

  // ---------- konfetti ----------
  var cv = $('#fx'), cx = cv.getContext('2d'), parts = [], raf = 0;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#22c55e', '#1f7bff', '#ff4f6d', '#f5a524', '#7c5cff', '#14b8a6', '#ff8a3d'];
  function confetti(n) {
    if (reduced) return;
    var dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    n = n || 120;
    for (var i = 0; i < n; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.5,
        y: innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 5,
        w: 7 + Math.random() * 7, h: 5 + Math.random() * 5,
        c: COLORS[i % COLORS.length], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4
      });
    }
    if (parts.length > 500) parts = parts.slice(-500);
    if (!raf) raf = requestAnimationFrame(stepFx);
  }
  function stepFx() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.vy += 0.38; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
    }
    parts = parts.filter(function (p) { return p.y < innerHeight + 40; });
    if (parts.length) raf = requestAnimationFrame(stepFx);
    else { raf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  // ---------- toast ----------
  var toastTimer = null;
  function toast(msg, ms) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add('hidden'); }, ms || 2800);
  }

  // ---------- nagłówek i przełączanie ekranów ----------
  var current = '';
  function updateHeader() {
    $('#hdrTeam').textContent = state.team ? '👥 ' + state.team : '';
    var d = doneCount();
    $('#hdrProg').textContent = d + '/' + M.length;
    $('#hdrBar').style.width = (d / M.length * 100) + '%';
    $('#hdrScore').textContent = '⭐ ' + total() + ' pkt';
    $('#btnSound').textContent = state.sound ? '🔊' : '🔇';
  }
  function bumpScore() {
    var s = $('#hdrScore');
    s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump');
  }
  function show(node, name, withBar) {
    closeVote();
    var s = $('#screen');
    s.classList.remove('enter'); void s.offsetWidth;
    s.innerHTML = '';
    s.appendChild(node);
    s.classList.add('enter');
    $('#topbar').classList.toggle('hidden', !withBar);
    current = name;
    window.scrollTo(0, 0);
    updateHeader();
    refreshKeys();
  }

  // Numery 1–9 na aktywnych opcjach (sterowanie klawiaturą)
  var keyRaf = 0;
  function refreshKeys() {
    if (keyRaf) return;
    keyRaf = setTimeout(function () {
      keyRaf = 0;
      $$('#screen [data-k]').forEach(function (b) { b.removeAttribute('data-k'); });
      var list = $$('#screen .opt, #screen .bin').filter(function (b) {
        return !b.disabled && b.offsetParent !== null;
      });
      list.slice(0, 9).forEach(function (b, i) { b.setAttribute('data-k', String(i + 1)); });
    }, 0);
  }
  new MutationObserver(refreshKeys).observe($('#screen'), {
    childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'class']
  });

  // ---------- pełny ekran / dźwięk / głosowanie ----------
  function toggleFull() {
    try {
      if (!document.fullscreenElement) {
        var p = document.documentElement.requestFullscreen();
        if (p && p.catch) p.catch(function () { toast('Naciśnijcie F11, aby włączyć pełny ekran.'); });
        setTimeout(function () {
          if (!document.fullscreenElement) toast('Jeśli ekran się nie powiększył, naciśnijcie F11.', 3500);
        }, 800);
      } else {
        document.exitFullscreen();
      }
    } catch (e) { toast('Naciśnijcie F11, aby włączyć pełny ekran.'); }
  }
  function toggleSound() {
    state.sound = !state.sound; save(); updateHeader();
    toast(state.sound ? '🔊 Dźwięk włączony' : '🔇 Dźwięk wyłączony', 1500);
    sfx('click');
  }

  var voteTimer = null;
  function openVote(sec) {
    closeVote();
    sec = sec || 15;
    var left = sec;
    var ov = $('#overlay');
    ov.innerHTML =
      '<div class="vote-box" role="dialog" aria-label="Głosowanie klasy">' +
      '<h3>🗳️ Głosowanie klasy!</h3>' +
      '<div class="count" id="vc">' + left + '</div>' +
      '<p>Podnieście ręce za wybraną odpowiedzią.<br>Osoba przy komputerze zaznacza zwycięską opcję.</p>' +
      '<div class="row center">' +
      '<button class="btn" data-s="10">10 s</button><button class="btn" data-s="20">20 s</button><button class="btn" data-s="30">30 s</button>' +
      '<button class="btn btn-primary" id="vclose">Gotowe ✔</button></div></div>';
    ov.classList.remove('hidden');
    var vc = $('#vc');
    voteTimer = setInterval(function () {
      left--;
      if (left > 0) {
        vc.textContent = left;
        if (left <= 3) sfx('tick');
      } else {
        clearInterval(voteTimer); voteTimer = null;
        vc.textContent = 'Koniec głosowania!';
        vc.classList.add('end');
        sfx('end');
      }
    }, 1000);
  }
  function closeVote() {
    if (voteTimer) { clearInterval(voteTimer); voteTimer = null; }
    var ov = $('#overlay');
    ov.classList.add('hidden');
    ov.innerHTML = '';
  }
  $('#overlay').addEventListener('click', function (e) {
    var s = e.target.closest('[data-s]');
    if (s) { openVote(parseInt(s.getAttribute('data-s'), 10)); return; }
    if (e.target.id === 'vclose' || e.target.id === 'overlay') closeVote();
  });

  $('#btnHome').addEventListener('click', screenStart);
  $('#btnMap').addEventListener('click', function () { if (state.team) screenMap(); });
  $('#btnVote').addEventListener('click', function () { openVote(15); });
  $('#btnSound').addEventListener('click', toggleSound);
  $('#btnFull').addEventListener('click', toggleFull);

  // Po kliknięciu myszą zdejmujemy fokus z przycisku, żeby Enter nie klikał go ponownie.
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button');
    if (b && e.detail > 0) b.blur();
  });

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'range'))) {
      if (e.key === 'Enter' && t.id === 'teamName') { e.preventDefault(); var bs = $('#btnStart'); if (bs) bs.click(); }
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var k = e.key;
    var ovOpen = !$('#overlay').classList.contains('hidden');
    if (ovOpen) {
      if (k === 'Escape' || k === 'Enter' || k === 'v' || k === 'V') { e.preventDefault(); closeVote(); }
      return;
    }
    if (/^[1-9]$/.test(k)) {
      if (current === 'map') {
        var mm = M[parseInt(k, 10) - 1];
        if (mm) { e.preventDefault(); screenMission(mm); }
        return;
      }
      var b = $('#screen [data-k="' + k + '"]');
      if (b) { e.preventDefault(); b.click(); }
      return;
    }
    if (k === 'Enter' || k === ' ') {
      var a = document.activeElement;
      if (a && a !== document.body && (a.tagName === 'BUTTON' || a.tagName === 'A')) return; // natywne działanie
      if (k === ' ') return;
      var ps = $$('#screen .btn-primary').filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (ps.length) { e.preventDefault(); ps[ps.length - 1].click(); }
      return;
    }
    if (k === 'f' || k === 'F') { e.preventDefault(); toggleFull(); }
    else if ((k === 'v' || k === 'V') && current !== 'start') { e.preventDefault(); openVote(15); }
    else if ((k === 'm' || k === 'M') && state.team && current !== 'start') { e.preventDefault(); screenMap(); }
    else if (k === 's' || k === 'S') { e.preventDefault(); toggleSound(); }
  });

  // ---------- EKRANY ----------
  function screenStart() {
    var d = doneCount();
    var node = el(
      '<section class="start">' +
      '<div class="logo-icons">' + M.map(function (m) { return '<span>' + m.icon + '</span>'; }).join('') + '</div>' +
      '<h1 class="title">MISJA:<br>ZDROWIE!</h1>' +
      '<p class="subtitle">Drużynowa gra edukacyjna. Przywróćcie zdrowe nawyki w mieście Zdrowolandia!</p>' +
      '<div class="start-card">' +
      '<label for="teamName">✏️ Wpiszcie nazwę drużyny</label>' +
      '<input id="teamName" class="team-input" maxlength="30" placeholder="np. Klasa 7B" autocomplete="off" value="' + esc(state.team) + '">' +
      '<button class="btn btn-primary btn-big" id="btnStart">▶ ROZPOCZNIJ</button>' +
      (d > 0 ? '<button class="btn btn-green" id="btnContinue">⏩ Kontynuuj zapisaną grę (' + d + '/8 misji, ' + total() + ' pkt)</button>' : '') +
      '</div>' +
      '<div class="links">' +
      '<button class="btn btn-ghost" id="lnkHelp">❓ Jak grać</button>' +
      '<button class="btn btn-ghost" id="lnkSrc">📚 Źródła wiedzy</button>' +
      '<button class="btn btn-ghost" id="lnkFull">⛶ Pełny ekran</button>' +
      '</div>' +
      '<p class="small">Działa bez Internetu · Bez logowania · Postęp zapisuje się automatycznie</p>' +
      '</section>');
    show(node, 'start', false);
    $('#btnStart').addEventListener('click', function () {
      var name = $('#teamName').value.trim().replace(/\s+/g, ' ').slice(0, 30) || 'Drużyna Zdrowia';
      resetGame(name);
      sfx('ok');
      screenBriefing();
    });
    var c = $('#btnContinue');
    if (c) c.addEventListener('click', function () {
      if (!state.team) state.team = 'Drużyna Zdrowia';
      sfx('click');
      if (doneCount() === M.length) screenFinal(); else screenMap();
    });
    $('#lnkHelp').addEventListener('click', function () { screenHelp(screenStart); });
    $('#lnkSrc').addEventListener('click', function () { screenSources(screenStart); });
    $('#lnkFull').addEventListener('click', toggleFull);
  }

  function screenBriefing() {
    var node = el(
      '<section class="panel briefing">' +
      '<h2>📣 Witajcie, ' + esc(state.team) + '!</h2>' +
      '<p>Miasto <b>Zdrowolandia</b> zapomniało o zdrowych nawykach. Mieszkańcy źle śpią, piją same słodkie napoje i nie ruszają się z kanapy. ' +
      'Wasza drużyna ma <b>8 misji</b> w 8 dzielnicach miasta. Uratujcie je wszystkie!</p>' +
      '<div class="rules">' +
      '<div class="rule"><span class="emoji">🖱️</span>Jedna osoba obsługuje komputer.</div>' +
      '<div class="rule"><span class="emoji">🗳️</span>Klasa głosuje! Przycisk 🗳️ u góry (lub klawisz V) włącza odliczanie.</div>' +
      '<div class="rule"><span class="emoji">⭐</span>Za dobre decyzje zdobywacie punkty. Za błędy nic nie tracicie – uczycie się!</div>' +
      '<div class="rule"><span class="emoji">🏅</span>Za każdą misję – odznaka. Zbierzcie wszystkie 8!</div>' +
      '<div class="rule"><span class="emoji">⌨️</span>Klawisze 1–9 wybierają odpowiedzi, Enter – dalej, F – pełny ekran.</div>' +
      '</div>' +
      '<div class="row center"><button class="btn btn-primary btn-big" id="go">🗺️ Do mapy miasta!</button></div>' +
      '</section>');
    show(node, 'briefing', true);
    $('#go').addEventListener('click', screenMap);
  }

  function screenMap() {
    var d = doneCount();
    var next = nextUndone();
    var decos = [
      ['🌳', 24, 50], ['🏠', 45, 33], ['🌲', 73, 46], ['🌷', 49, 66], ['☁️', 92, 8], ['☁️', 5, 9],
      ['🌲', 74, 93], ['🏡', 22, 95], ['🌳', 95, 52], ['🌻', 4, 45], ['🚲', 64, 64], ['🌳', 37, 48]
    ];
    var locs = M.map(function (m) {
      var cls = 'loc' + (state.done[m.id] ? ' done' : '') + (next === m ? ' next' : '');
      return '<button class="' + cls + '" data-id="' + m.id + '" style="left:' + m.pos.x + '%;top:' + m.pos.y + '%;--c:' + m.color + '">' +
        '<span class="pin">' + m.icon + '<span class="num">' + m.num + '</span></span>' +
        '<span class="label">' + m.place + '<small>' + m.topic + '</small></span>' +
        (state.done[m.id] ? '<span class="pts">⭐ ' + (state.scores[m.id] || 0) + ' pkt</span>' : '') +
        '</button>';
    }).join('');
    var list = M.map(function (m) {
      return '<button class="opt' + (state.done[m.id] ? ' correct' : '') + '" data-id="' + m.id + '"><span class="ico">' + m.icon + '</span>' +
        '<span>' + m.num + '. ' + m.place + '<br><small>' + m.topic + (state.done[m.id] ? ' · ⭐ ' + (state.scores[m.id] || 0) : '') + '</small></span></button>';
    }).join('');
    var actions = d === M.length
      ? '<button class="btn btn-primary btn-big" id="toFinal">🏆 Zobacz wynik drużyny</button>'
      : (d > 0 ? '<button class="btn btn-ghost" id="toFinal">🏁 Zakończ grę i pokaż wynik</button>' : '');
    var node = el(
      '<section>' +
      '<div class="map-head"><div><h2>🗺️ Mapa Zdrowolandii</h2>' +
      '<p>' + (next ? 'Wybierzcie dzielnicę (klik lub klawisz 1–8). Proponowana: <b>' + next.num + '. ' + next.place + '</b>' : 'Wszystkie dzielnice uratowane! 🎉') + '</p></div>' +
      '<div class="row">' + actions + '</div></div>' +
      '<div class="map">' +
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M -5 58 C 20 52, 30 70, 50 56 S 80 40, 105 50" fill="none" stroke="#7fd0ff" stroke-width="26" vector-effect="non-scaling-stroke" stroke-linecap="round" opacity="0.75"/>' +
      '<path id="road" d="M13 30 C 20 18, 28 16, 36 17 S 55 12, 63 15 S 85 20, 87 32 S 92 62, 82 72 S 66 86, 58 84 S 40 82, 32 82 S 10 80, 12 70 S 8 40, 13 30 Z" fill="none" stroke="#fff7e6" stroke-width="30" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      '<path d="M13 30 C 20 18, 28 16, 36 17 S 55 12, 63 15 S 85 20, 87 32 S 92 62, 82 72 S 66 86, 58 84 S 40 82, 32 82 S 10 80, 12 70 S 8 40, 13 30 Z" fill="none" stroke="#f2c46d" stroke-width="3" stroke-dasharray="10 10" vector-effect="non-scaling-stroke"/>' +
      '<path d="M36 17 L 50 50 L 58 84 M 13 30 L 50 50 L 87 32 M 12 70 L 50 50 L 82 72" fill="none" stroke="#fff7e6" stroke-width="16" vector-effect="non-scaling-stroke" opacity="0.85"/>' +
      '</svg>' +
      decos.map(function (x) { return '<span class="deco" style="left:' + x[1] + '%;top:' + x[2] + '%;transform:translate(-50%,-50%)">' + x[0] + '</span>'; }).join('') +
      '<div class="city-name"><span>🏛️</span><b>ZDROWOLANDIA</b></div>' +
      locs +
      '</div>' +
      '<div class="map-list">' + list + '</div>' +
      '</section>');
    show(node, 'map', true);
    $$('#screen [data-id]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = M.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
        if (m) { sfx('click'); screenMission(m); }
      });
    });
    var tf = $('#toFinal');
    if (tf) tf.addEventListener('click', screenFinal);
  }

  function screenMission(m) {
    var node = el(
      '<section style="--c:' + m.color + ';--accent:' + m.color + '">' +
      '<div class="mission-head"><div class="big">' + m.icon + '</div><div>' +
      '<div class="kicker">Misja ' + m.num + '/8 · ' + m.topic + (state.done[m.id] ? ' · powtórka' : '') + '</div>' +
      '<h2>' + m.place + '</h2><p>' + m.story + '</p></div></div>' +
      '<div class="stage panel" id="stage"></div></section>');
    show(node, 'mission', true);
    var stage = $('#stage');
    MECH[m.type](stage, m, function (pts) { finishMission(m, pts); });
  }

  function finishMission(m, pts) {
    pts = clamp(Math.round(pts), 0, D.MAX_PER_MISSION);
    var prev = state.scores[m.id] || 0;
    var wasDone = !!state.done[m.id];
    state.scores[m.id] = Math.max(prev, pts);
    state.done[m.id] = true;
    save();
    var nm = nextUndone(m);
    var node = el(
      '<section class="result" style="--c:' + m.color + '">' +
      '<div class="badge-big">' + m.badge.icon + '</div>' +
      '<h2>Misja ukończona!</h2>' +
      '<p class="subtitle" style="margin:0 auto">Zdobywacie odznakę: <b>' + m.badge.name + '</b></p>' +
      '<div class="gain">+' + pts + ' pkt <small style="font-size:1.2rem;color:#4a5878">/ 100</small></div>' +
      (wasDone && pts < prev ? '<p class="small">Zachowano wcześniejszy, lepszy wynik: ' + prev + ' pkt</p>' : '') +
      '<div class="panel learn"><h3 style="margin:0 0 .6rem;font-size:1.5rem">📚 Czego się dowiedzieliśmy?</h3><ul>' +
      m.learn.map(function (l) {
        var s = D.SOURCES[l.src];
        return '<li>' + l.t + '<span class="src">Źródło: ' + s.org + ' – ' + s.title + '</span></li>';
      }).join('') +
      '</ul></div>' +
      '<div class="row center">' +
      '<button class="btn" id="toMap">🗺️ Mapa</button>' +
      (nm
        ? '<button class="btn btn-primary btn-big" id="toNext">Następna misja: ' + nm.icon + ' ' + nm.place + ' ▶</button>'
        : '<button class="btn btn-primary btn-big" id="toFinal">🏆 Zobacz wynik drużyny</button>') +
      '</div></section>');
    show(node, 'result', true);
    bumpScore();
    sfx('win');
    confetti(pts >= 60 ? 160 : 80);
    $('#toMap').addEventListener('click', screenMap);
    var tn = $('#toNext'); if (tn) tn.addEventListener('click', function () { screenMission(nm); });
    var tf = $('#toFinal'); if (tf) tf.addEventListener('click', screenFinal);
  }

  function screenFinal() {
    var t = total(), d = doneCount();
    var title = D.TITLES.filter(function (x) { return t >= x.min; })[0];
    var node = el(
      '<section class="final">' +
      '<div class="trophy">' + title.icon + '</div>' +
      '<div class="team-name">Drużyna: <b>' + esc(state.team || 'Drużyna Zdrowia') + '</b></div>' +
      '<h2>' + title.name + '</h2>' +
      '<div class="total"><span id="cnt">0</span> <small>/ ' + (M.length * D.MAX_PER_MISSION) + ' pkt</small></div>' +
      '<p class="subtitle" style="margin:0 auto">' + title.text + '</p>' +
      '<p style="font-weight:800;font-size:1.2rem">Ukończone misje: ' + d + '/' + M.length + '</p>' +
      '<div class="badges">' + M.map(function (m, i) {
        var ok = state.done[m.id];
        return '<div class="badge' + (ok ? '' : ' locked') + '" style="animation-delay:' + (0.2 + i * 0.08) + 's">' +
          '<span class="emoji">' + m.badge.icon + '</span><b>' + m.badge.name + '</b>' +
          '<small>' + m.topic + '</small><small>' + (ok ? '⭐ ' + (state.scores[m.id] || 0) + ' pkt' : 'nieukończona') + '</small></div>';
      }).join('') + '</div>' +
      '<div class="row center">' +
      '<button class="btn btn-primary btn-big" id="again">🔄 Zagraj od nowa</button>' +
      '<button class="btn" id="fMap">🗺️ Mapa</button>' +
      '<button class="btn" id="fSrc">📚 Źródła wiedzy</button>' +
      '</div></section>');
    show(node, 'final', true);
    var cnt = $('#cnt'), startT = performance.now(), dur = 1600;
    (function tick(now) {
      var p = clamp((now - startT) / dur, 0, 1);
      cnt.textContent = Math.round(t * (1 - Math.pow(1 - p, 3)));
      if (p < 1 && document.body.contains(cnt)) requestAnimationFrame(tick);
    })(startT);
    sfx('win');
    confetti(200);
    setTimeout(function () { if (current === 'final') confetti(150); }, 900);
    setTimeout(function () { if (current === 'final') confetti(150); }, 1800);
    $('#again').addEventListener('click', function () { resetGame(''); screenStart(); });
    $('#fMap').addEventListener('click', screenMap);
    $('#fSrc').addEventListener('click', function () { screenSources(screenFinal); });
  }

  function screenSources(back) {
    var keys = Object.keys(D.SOURCES);
    var node = el(
      '<section class="panel sources">' +
      '<h2>📚 Źródła wiedzy</h2>' +
      '<p>Wszystkie informacje w grze pochodzą z poniższych, wiarygodnych źródeł. Linki otwierają się w nowej karcie (wymagają Internetu – sama gra działa bez niego).</p>' +
      '<ol>' + keys.map(function (k) {
        var s = D.SOURCES[k];
        return '<li><b>' + s.org + '</b> – ' + s.title + '<br><a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + s.url + '</a></li>';
      }).join('') + '</ol>' +
      '<div class="feedback info mt"><span class="emoji">📞</span><div><b>Potrzebujesz rozmowy?</b>Telefon zaufania dla dzieci i młodzieży <b style="display:inline">116 111</b> – bezpłatny.</div></div>' +
      '<div class="row center mt"><button class="btn btn-primary btn-big" id="back">◀ Wróć</button></div>' +
      '</section>');
    show(node, 'sources', !!state.team && back !== screenStart);
    $('#back').addEventListener('click', back || screenStart);
  }

  function screenHelp(back) {
    var node = el(
      '<section class="panel briefing">' +
      '<h2>❓ Jak grać</h2>' +
      '<div class="rules">' +
      '<div class="rule"><span class="emoji">1️⃣</span>Wpiszcie nazwę drużyny i kliknijcie ROZPOCZNIJ.</div>' +
      '<div class="rule"><span class="emoji">🗺️</span>Na mapie wybierzcie dzielnicę – każda to inna misja i inny temat.</div>' +
      '<div class="rule"><span class="emoji">🗳️</span>Przed każdą decyzją klasa głosuje (przycisk 🗳️ lub klawisz V).</div>' +
      '<div class="rule"><span class="emoji">⭐</span>Każda misja: do 100 punktów. Razem do 800. Błędy nie odbierają punktów.</div>' +
      '<div class="rule"><span class="emoji">🏆</span>Po 8 misjach drużyna dostaje tytuł i zestaw odznak.</div>' +
      '</div>' +
      '<h2>⌨️ Sterowanie</h2>' +
      '<div class="rules">' +
      '<div class="rule"><span class="emoji">🖱️</span>Mysz – klikanie odpowiedzi i przycisków.</div>' +
      '<div class="rule"><span class="emoji">🔢</span>Klawisze 1–9 – wybór odpowiedzi (numer widać na przycisku).</div>' +
      '<div class="rule"><span class="emoji">↩️</span>Enter – „Dalej” / „Sprawdź”.</div>' +
      '<div class="rule"><span class="emoji">⛶</span>F – pełny ekran · V – głosowanie · M – mapa · S – dźwięk.</div>' +
      '</div>' +
      '<div class="row center"><button class="btn btn-primary btn-big" id="back">◀ Wróć</button></div>' +
      '</section>');
    show(node, 'help', !!state.team && back !== screenStart);
    $('#back').addEventListener('click', back || screenStart);
  }

  // ---------- wspólne elementy misji ----------
  function quiz(stage, cfg, maxPts, onDone) {
    var opts = shuffle(cfg.options);
    stage.innerHTML =
      '<h3 class="task-title"><span class="step">' + cfg.step + '</span> ' + cfg.title + '</h3>' +
      '<p class="q-text">' + cfg.q + '</p>' +
      '<div class="grid" id="qo">' + opts.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '">' + o.t + '</button>';
      }).join('') + '</div>' +
      '<div id="fb"></div><div class="row center" id="acts"></div>';
    var answered = false;
    $$('#qo .opt', stage).forEach(function (b) {
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var o = opts[+b.getAttribute('data-i')];
        $$('#qo .opt', stage).forEach(function (x) {
          var xo = opts[+x.getAttribute('data-i')];
          x.disabled = true;
          if (xo.ok) x.classList.add('correct');
          else if (x === b) x.classList.add('wrong');
          else x.classList.add('dim');
        });
        var pts = o.ok ? maxPts : 0;
        $('#fb', stage).innerHTML = o.ok
          ? fb(true, 'Brawo! +' + maxPts + ' pkt', cfg.explain)
          : fb(false, 'Nie tym razem – ale teraz już wiecie!', cfg.explain);
        sfx(o.ok ? 'ok' : 'no');
        if (o.ok) confetti(40);
        $('#acts', stage).innerHTML = '<button class="btn btn-primary btn-big" id="qnext">' + (cfg.nextLabel || 'Dalej ▶') + '</button>';
        $('#qnext', stage).addEventListener('click', function () { onDone(pts); });
        scrollTo($('#acts', stage));
      });
    });
  }
  function finishButton(stage, onClick, label) {
    var acts = $('#acts', stage);
    acts.innerHTML = '<button class="btn btn-primary btn-big" id="mdone">' + (label || 'Zakończ misję ▶') + '</button>';
    $('#mdone', stage).addEventListener('click', onClick);
    scrollTo(acts);
  }

  var MECH = {};

  // 1. Odżywianie – komponowanie talerza
  MECH.plate = function (stage, m, done) {
    var MAX = 5, chosen = [];
    var byId = function (id) { return m.products.filter(function (p) { return p.id === id; })[0]; };
    stage.innerHTML =
      '<h3 class="task-title"><span class="step">Zadanie</span> Skomponujcie zdrowy obiad (maks. ' + MAX + ' produktów)</h3>' +
      '<p class="hint">Kliknijcie produkt, aby położyć go na talerzu. Ponowne kliknięcie zdejmuje go z talerza.</p>' +
      '<div class="plate-wrap"><div><div class="plate" id="plate"></div><div class="plate-count" id="pc"></div></div>' +
      '<div class="grid products" id="prods">' + m.products.map(function (p) {
        return '<button class="opt" data-id="' + p.id + '"><span class="ico">' + p.icon + '</span>' + p.name + '</button>';
      }).join('') + '</div></div>' +
      '<div id="fb"></div>' +
      '<div class="row center" id="acts"><button class="btn btn-primary btn-big" id="check" disabled>🍽️ Sprawdź talerz</button></div>';
    var plate = $('#plate', stage), pc = $('#pc', stage), check = $('#check', stage), locked = false;
    function draw() {
      plate.innerHTML = chosen.length
        ? chosen.map(function (id) { var p = byId(id); return '<span class="food" data-id="' + id + '" title="' + p.name + '">' + p.icon + '</span>'; }).join('')
        : '<div class="empty">Pusty talerz<br>– wybierzcie produkty</div>';
      pc.textContent = 'Na talerzu: ' + chosen.length + ' / ' + MAX + (chosen.length < 3 ? ' (wybierzcie min. 3)' : '');
      $$('#prods .opt', stage).forEach(function (b) { b.classList.toggle('selected', chosen.indexOf(b.getAttribute('data-id')) >= 0); });
      check.disabled = chosen.length < 3;
    }
    function toggle(id) {
      if (locked) return;
      var i = chosen.indexOf(id), p = byId(id);
      if (i >= 0) { chosen.splice(i, 1); sfx('click'); }
      else if (chosen.length < MAX) {
        chosen.push(id); sfx('click');
        if (p.cat === 'limit') toast(p.icon + ' ' + p.name + ': ' + p.why + '. Takie produkty jedzmy rzadko!', 3500);
      } else { toast('Talerz jest pełny! Kliknijcie produkt, aby go zdjąć.'); sfx('no'); }
      draw();
    }
    $$('#prods .opt', stage).forEach(function (b) { b.addEventListener('click', function () { toggle(b.getAttribute('data-id')); }); });
    plate.addEventListener('click', function (e) { var f = e.target.closest('.food'); if (f) toggle(f.getAttribute('data-id')); });
    draw();
    check.addEventListener('click', function () {
      locked = true;
      var cats = chosen.map(function (id) { return byId(id).cat; });
      var count = function (c) { return cats.filter(function (x) { return x === c; }).length; };
      var veg = count('veg'), vf = veg + count('fruit');
      var rows = [];
      var pV = (veg >= 1 && vf >= 2) ? 30 : (vf >= 1 ? 15 : 0);
      rows.push({ ok: pV === 30, ic: '🥦', p: pV, max: 30, t: pV === 30 ? 'Warzywa i owoce – jest ich sporo, w tym warzywa. Tak trzymać!' : 'Warzywa i owoce powinny zajmować połowę talerza – z przewagą warzyw (wybierzcie min. 2, w tym warzywo).' });
      var pG = count('grain') >= 1 ? 25 : 0;
      rows.push({ ok: !!pG, ic: '🌾', p: pG, max: 25, t: pG ? 'Pełne ziarno – jest! Kasza i razowy chleb dają energię na długo.' : 'Zabrakło produktów pełnoziarnistych (kasza, razowy chleb) – to ćwierć talerza.' });
      var pP = count('protein') >= 1 ? 25 : 0;
      rows.push({ ok: !!pP, ic: '🐟', p: pP, max: 25, t: pP ? 'Białko – jest! Ryby i jaja to świetne źródła białka.' : 'Zabrakło białka (ryba, jajko, strączki, nabiał) – to ćwierć talerza.' });
      var pW = count('water') >= 1 ? 20 : 0;
      rows.push({ ok: !!pW, ic: '💧', p: pW, max: 20, t: pW ? 'Woda do picia – najlepszy wybór!' : 'Do posiłku najlepiej pić wodę zamiast słodkich napojów.' });
      var lim = chosen.filter(function (id) { return byId(id).cat === 'limit'; }).map(byId);
      var pts = pV + pG + pP + pW;
      var html = '<div class="check-list">' + rows.map(function (r) {
        return '<div class="check-item ' + (r.ok ? 'ok' : 'no') + '"><span class="emoji">' + (r.ok ? '✅' : '💡') + '</span><span class="emoji">' + r.ic + '</span><span>' + r.t + '</span><span class="p">' + r.p + '/' + r.max + '</span></div>';
      }).join('') +
        (lim.length ? '<div class="check-item no"><span class="emoji">⚠️</span><span>' + lim.map(function (p) { return p.icon + ' ' + p.name; }).join(', ') +
          ' – to produkty, które warto jeść rzadko (dużo cukru, soli lub tłuszczu). Nie odbieramy punktów, ale zajęły miejsce na talerzu!</span></div>' : '') +
        '</div>';
      $('#fb', stage).innerHTML = (pts >= 80
        ? fb(true, 'Zbilansowany talerz! ' + pts + '/100 pkt', 'Wasz obiad jest zgodny z Talerzem Zdrowego Żywienia.')
        : fb(false, 'Dobra próba! ' + pts + '/100 pkt', 'Zobaczcie, co można jeszcze poprawić:')) + '<div class="mt"></div>' + html;
      $$('#prods .opt', stage).forEach(function (b) { b.disabled = true; if (!b.classList.contains('selected')) b.classList.add('dim'); });
      sfx(pts >= 80 ? 'ok' : 'no');
      if (pts >= 80) confetti(80);
      finishButton(stage, function () { done(pts); });
    });
  };

  // 2. Aktywność – licznik 60 minut + pytanie
  MECH.activity = function (stage, m, done) {
    var minutes = 0, sel = {}, trap = false;
    stage.innerHTML =
      '<h3 class="task-title"><span class="step">Krok 1/2</span> Zbierzcie co najmniej 60 minut ruchu w ciągu dnia</h3>' +
      '<p class="hint">Klikajcie aktywności, żeby dodać je do planu dnia. Uwaga – nie wszystko to ruch!</p>' +
      '<div class="meter-box"><div class="meter-top"><span>⏱️ Minuty ruchu</span><span id="mv">0 / 60 min</span></div>' +
      '<div class="meter"><div class="meter-fill" id="mf"></div></div></div>' +
      '<div class="grid g4 tiles" id="tiles">' + shuffle(m.tiles).map(function (t) {
        return '<button class="opt" data-id="' + t.id + '"><span class="ico">' + t.icon + '</span>' + t.name + '<span class="min">' + t.min + ' min</span></button>';
      }).join('') + '</div>' +
      '<div id="fb"></div><div class="row center" id="acts"><button class="btn btn-primary btn-big" id="next" disabled>Dalej ▶</button></div>';
    var mf = $('#mf', stage), mv = $('#mv', stage), next = $('#next', stage), fbx = $('#fb', stage);
    function upd() {
      mf.style.width = clamp(minutes / 60 * 100, 0, 100) + '%';
      mv.textContent = minutes + ' / 60 min';
      var ok = minutes >= 60;
      mf.classList.toggle('full', ok);
      next.disabled = !ok;
      return ok;
    }
    $$('#tiles .opt', stage).forEach(function (b) {
      b.addEventListener('click', function () {
        var t = m.tiles.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
        if (!t.active) {
          trap = true;
          b.disabled = true;
          b.classList.add('wrong', 'shake');
          b.querySelector('.min').textContent = '0 min ruchu';
          fbx.innerHTML = fb(false, t.icon + ' To nie jest ruch!', t.name + ' to czas na siedząco – 0 minut aktywności. WHO zaleca ograniczać czas siedzenia, zwłaszcza przed ekranem.');
          sfx('no');
          return;
        }
        var was = upd();
        if (sel[t.id]) { delete sel[t.id]; minutes -= t.min; b.classList.remove('selected'); }
        else { sel[t.id] = true; minutes += t.min; b.classList.add('selected'); }
        sfx('click');
        var now = upd();
        if (now && !was) { fbx.innerHTML = fb(true, 'Cel osiągnięty! 💪', 'Macie ' + minutes + ' minut ruchu – to co najmniej 60 minut dziennie, które WHO zaleca młodzieży.'); sfx('ok'); confetti(50); }
        else if (now) { fbx.innerHTML = fb(true, 'Cel osiągnięty! 💪', 'Macie ' + minutes + ' minut ruchu – co najmniej 60 minut zalecanych przez WHO.'); }
        else { fbx.innerHTML = fb(null, 'Jeszcze ' + (60 - minutes) + ' min do celu', 'Dodajcie kolejną aktywność.', '🏃'); }
      });
    });
    next.addEventListener('click', function () {
      var ptsA = 50 + (trap ? 0 : 20);
      toast('Plan dnia: +' + ptsA + ' pkt' + (trap ? ' (bonus +20 za ominięcie pułapek przepadł)' : ' (z bonusem za ominięcie pułapek!)'), 3200);
      quiz(stage, {
        step: 'Krok 2/2', title: 'Pytanie od trenera', q: m.question.q, options: m.question.options,
        explain: m.question.explain, nextLabel: 'Zakończ misję ▶'
      }, 30, function (ptsB) { done(ptsA + ptsB); });
    });
  };

  // 3. Sen – plan wieczoru + suwak godziny snu
  MECH.sleep = function (stage, m, done) {
    var filled = 0, trap = false, SLOTS = 5, placedCards = [];
    var cards = shuffle(m.cards);
    stage.innerHTML =
      '<h3 class="task-title"><span class="step">Krok 1/2</span> Ułóżcie plan spokojnego wieczoru (5 kroków)</h3>' +
      '<p class="hint">Klikajcie czynności, które pomagają dobrze się wyspać. Oś wieczoru sama ułoży je od najwcześniejszej do snu.</p>' +
      '<div class="timeline" id="tl">' + Array.apply(null, Array(SLOTS)).map(function (_, i) {
        return '<div class="slot" data-s="' + i + '"><span class="emoji">🌙</span>Krok ' + (i + 1) + '</div>';
      }).join('') + '</div>' +
      '<div class="grid g3" id="cards">' + cards.map(function (c, i) {
        return '<button class="opt" data-i="' + i + '"><span class="ico">' + c.icon + '</span>' + c.name + '</button>';
      }).join('') + '</div>' +
      '<div id="fb"></div><div class="row center" id="acts"><button class="btn btn-primary btn-big" id="next" disabled>Dalej ▶</button></div>';
    var fbx = $('#fb', stage), next = $('#next', stage);
    $$('#cards .opt', stage).forEach(function (b) {
      b.addEventListener('click', function () {
        if (filled >= SLOTS) return;
        var c = cards[+b.getAttribute('data-i')];
        b.disabled = true;
        if (!c.good) {
          trap = true;
          b.classList.add('wrong', 'shake');
          fbx.innerHTML = fb(false, c.icon + ' To utrudnia sen!', c.why);
          sfx('no');
          return;
        }
        b.classList.add('correct');
        placedCards.push(c);
        placedCards.sort(function (a, z) { return a.order - z.order; });
        placedCards.forEach(function (pc, k) {
          var slot = $('.slot[data-s="' + k + '"]', stage);
          var html = '<span class="emoji">' + pc.icon + '</span>' + pc.name;
          if (slot.innerHTML !== html) { slot.classList.remove('filled'); void slot.offsetWidth; slot.classList.add('filled'); slot.innerHTML = html; }
        });
        filled++;
        sfx('click');
        if (filled === SLOTS) {
          $$('#cards .opt', stage).forEach(function (x) { if (!x.disabled) { x.disabled = true; x.classList.add('dim'); } });
          fbx.innerHTML = fb(true, 'Plan wieczoru gotowy! 🌙', 'Spokojny wieczór bez ekranów i kofeiny pomaga szybko zasnąć i dobrze się wyspać.');
          sfx('ok'); confetti(50);
          next.disabled = false;
        } else {
          fbx.innerHTML = fb(true, 'Dobry wybór!', 'To pomaga się wyciszyć. Zostało kroków: ' + (SLOTS - filled) + '.');
        }
      });
    });
    next.addEventListener('click', function () {
      var ptsA = 30 + (trap ? 0 : 10);
      toast('Plan wieczoru: +' + ptsA + ' pkt', 2500);
      sliderStep(ptsA);
    });

    function fmt(mins) {
      var h = Math.floor(mins / 60), mm = mins % 60;
      return h + ' h' + (mm ? ' ' + mm + ' min' : '');
    }
    function clock(i) {
      var t = 20 * 60 + i * 15, h = Math.floor(t / 60) % 24, mm = t % 60;
      return (t >= 24 * 60 ? '0' : h) + ':' + (mm < 10 ? '0' : '') + mm;
    }
    function sleepMins(i) { return (24 * 60 - (20 * 60 + i * 15)) + 7 * 60; }
    function sliderStep(ptsA) {
      stage.innerHTML =
        '<h3 class="task-title"><span class="step">Krok 2/2</span> O której zasnąć?</h3>' +
        '<p class="hint">Pobudka do szkoły jest o 7:00. Ustawcie suwak (myszką lub strzałkami ← →) na godzinę zaśnięcia, tak żeby się wyspać.</p>' +
        '<div class="slider-box"><div class="times">' +
        '<div>🛌 Zaśnięcie<span class="val" id="bt"></span></div>' +
        '<div>⏰ Pobudka<span class="val">7:00</span></div>' +
        '<div>😴 Długość snu<span class="val" id="hrs"></span></div></div>' +
        '<input type="range" id="rng" min="0" max="16" step="1" value="12" aria-label="Godzina zaśnięcia">' +
        '<div class="slider-scale"><span>20:00</span><span>21:00</span><span>22:00</span><span>23:00</span><span>0:00</span></div></div>' +
        '<div id="fb"></div><div class="row center" id="acts"><button class="btn btn-primary btn-big" id="chk">✔ Sprawdź</button></div>';
      var rng = $('#rng', stage);
      function upd() { var i = +rng.value; $('#bt', stage).textContent = clock(i); $('#hrs', stage).textContent = fmt(sleepMins(i)); }
      rng.addEventListener('input', upd);
      upd();
      rng.focus();
      $('#chk', stage).addEventListener('click', function () {
        var i = +rng.value, mins = sleepMins(i), h = mins / 60, ptsB, ok, txt;
        rng.disabled = true;
        if (h >= 9 && h <= 10) { ptsB = 60; ok = true; txt = fmt(mins) + ' snu mieści się w zaleceniach zarówno dla dzieci 6–12 lat (9–12 h), jak i dla młodzieży 13–18 lat (8–10 h).'; }
        else if (h >= 8 && h < 9) { ptsB = 40; ok = false; txt = fmt(mins) + ' wystarczy młodzieży 13–18 lat (8–10 h), ale dzieciom 6–12 lat zaleca się 9–12 h. Bezpieczniej zasnąć ok. 21:00–22:00.'; }
        else if (h > 10) { ptsB = 40; ok = false; txt = fmt(mins) + ' to dużo – w sam raz dla 6–12-latków (9–12 h), ale młodzieży 13–18 lat zaleca się 8–10 h.'; }
        else { ptsB = 15; ok = false; txt = fmt(mins) + ' to za mało! Zalecenia: 6–12 lat – 9–12 h snu, 13–18 lat – 8–10 h. Przy pobudce o 7:00 warto zasnąć ok. 21:00–22:00.'; }
        $('#fb', stage).innerHTML = fb(ok, (ok ? 'Idealnie! ' : (h < 8 ? 'Za mało snu! ' : 'Prawie! ')) + '+' + ptsB + ' pkt', txt, ok ? '😴' : '💡');
        sfx(ok ? 'ok' : 'no');
        if (ok) confetti(60);
        finishButton(stage, function () { done(ptsA + ptsB); });
      });
    }
  };

  // 4. Samopoczucie – rozmowy (czat)
  MECH.chat = function (stage, m, done) {
    var idx = 0, pts = 0, mood = 0;
    var FACES = ['😟', '😐', '🙂', '😄'];
    function render() {
      var sc = m.scenes[idx];
      var opts = shuffle(sc.options);
      var best = Math.max.apply(null, sc.options.map(function (o) { return o.pts; }));
      stage.innerHTML =
        '<div class="row" style="justify-content:space-between">' +
        '<h3 class="task-title"><span class="step">Sytuacja ' + (idx + 1) + '/' + m.scenes.length + '</span> Jak zareagujecie?</h3>' +
        '<div class="mood">Nastrój w parku: <span class="faces">' + FACES[mood] + '</span></div></div>' +
        '<div class="chat" id="chat"><div class="bubble-row"><div class="avatar">' + sc.who + '</div>' +
        '<div class="bubble"><b>' + sc.name + '</b>' + sc.msg + '</div></div></div>' +
        '<div class="grid" id="opts">' + opts.map(function (o, i) {
          return '<button class="opt" data-i="' + i + '"><span class="ico">💬</span>' + o.t + '</button>';
        }).join('') + '</div>' +
        '<div id="fb"></div><div class="row center" id="acts"></div>';
      var answered = false;
      $$('#opts .opt', stage).forEach(function (b) {
        b.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var o = opts[+b.getAttribute('data-i')];
          var isBest = o.pts === best;
          $$('#opts .opt', stage).forEach(function (x) {
            var xo = opts[+x.getAttribute('data-i')];
            x.disabled = true;
            if (xo.pts === best) x.classList.add('correct');
            else if (x === b) x.classList.add('wrong');
            else x.classList.add('dim');
          });
          $('#chat', stage).appendChild(el('<div class="bubble-row me"><div class="bubble"><b style="color:#dbe8ff">Wasza drużyna</b>' + o.t + '</div><div class="avatar">🙋</div></div>'));
          pts += o.pts;
          if (isBest) { mood = Math.min(3, mood + 1); $('.faces', stage).textContent = FACES[mood]; }
          $('#fb', stage).innerHTML = fb(isBest, (isBest ? 'Świetna decyzja! ' : 'Warto inaczej… ') + '+' + o.pts + ' pkt', o.fb, isBest ? '💛' : '💡');
          sfx(isBest ? 'ok' : 'no');
          if (isBest) confetti(40);
          var last = idx === m.scenes.length - 1;
          var acts = $('#acts', stage);
          acts.innerHTML = '<button class="btn btn-primary btn-big" id="nx">' + (last ? 'Zakończ misję ▶' : 'Następna sytuacja ▶') + '</button>';
          $('#nx', stage).addEventListener('click', function () {
            if (last) done(pts); else { idx++; render(); }
          });
          scrollTo(acts);
        });
      });
    }
    render();
  };

  // 5. Nawodnienie – sortowanie napojów do pojemników
  MECH.sort = function (stage, m, done) {
    var items = shuffle(m.items), picked = null, correct = 0, placed = 0;
    stage.innerHTML =
      '<h3 class="task-title"><span class="step">Zadanie</span> Posortujcie napoje</h3>' +
      '<p class="hint">1) Kliknijcie napój &nbsp; 2) Kliknijcie pojemnik, do którego pasuje.</p>' +
      '<div class="sort-items" id="pool">' + items.map(function (it, i) {
        return '<button class="opt" data-i="' + i + '"><span class="ico">' + it.icon + '</span>' + it.name + '</button>';
      }).join('') + '</div>' +
      '<div class="picked" id="picked"></div>' +
      '<div class="bins">' + m.bins.map(function (bn) {
        return '<button class="bin" data-b="' + bn.id + '" disabled><h4><span class="emoji">' + bn.icon + '</span>' + bn.name + '</h4><div class="in"></div></button>';
      }).join('') + '</div>' +
      '<div id="fb"></div><div class="row center" id="acts"></div>';
    var fbx = $('#fb', stage), pk = $('#picked', stage);
    function setPicked(i) {
      picked = i;
      var any = picked !== null;
      $$('#pool .opt', stage).forEach(function (b) { b.disabled = any; b.classList.toggle('selected', any && +b.getAttribute('data-i') === picked); });
      $$('.bin', stage).forEach(function (b) { b.disabled = !any; b.classList.toggle('armed', any); });
      pk.innerHTML = any
        ? 'Wybrano: <span class="chip" id="unpick"><span class="emoji">' + items[picked].icon + '</span> ' + items[picked].name + ' ✖</span> → teraz kliknijcie pojemnik'
        : '';
      var u = $('#unpick', stage);
      if (u) u.addEventListener('click', function () { setPicked(null); });
    }
    $$('#pool .opt', stage).forEach(function (b) {
      b.addEventListener('click', function () { sfx('click'); setPicked(+b.getAttribute('data-i')); });
    });
    $$('.bin', stage).forEach(function (bin) {
      bin.addEventListener('click', function () {
        if (picked === null) return;
        var it = items[picked], ok = bin.getAttribute('data-b') === it.bin;
        var target = $('.bin[data-b="' + it.bin + '"] .in', stage);
        var bName = m.bins.filter(function (x) { return x.id === it.bin; })[0].name;
        target.appendChild(el('<span class="chip' + (ok ? '' : ' fixed') + '"><span class="emoji">' + it.icon + '</span> ' + it.name + '</span>'));
        var btn = $('#pool .opt[data-i="' + picked + '"]', stage);
        if (btn) btn.remove();
        placed++;
        if (ok) correct++;
        fbx.innerHTML = ok
          ? fb(true, 'Dobrze! ' + it.icon + ' ' + it.name + ' → „' + bName + '”', it.fb)
          : fb(false, it.icon + ' ' + it.name + ' pasuje do: „' + bName + '”', it.fb + ' Przenieśliśmy napój do właściwego pojemnika.');
        sfx(ok ? 'ok' : 'no');
        setPicked(null);
        if (placed === items.length) {
          var pts = Math.round(correct / items.length * 100);
          fbx.innerHTML += '<div class="mt"></div>' + fb(pts >= 75, 'Wynik sortowania: ' + correct + '/' + items.length + ' → ' + pts + ' pkt',
            'Najlepszy napój na co dzień to woda. Pomarańczowa ramka oznacza napój, który przenieśliśmy do właściwego pojemnika.', '🌊');
          if (pts >= 75) confetti(70);
          finishButton(stage, function () { done(pts); });
        }
      });
    });
  };

  // 6. Technologia – karty „zdrowy czy niezdrowy?”
  MECH.cards = function (stage, m, done) {
    var cards = shuffle(m.cards), i = 0, correct = 0, res = [];
    function render() {
      var c = cards[i];
      stage.innerHTML =
        '<div class="card-stage">' +
        '<h3 class="task-title"><span class="step">Karta ' + (i + 1) + '/' + cards.length + '</span> Zdrowy czy niezdrowy nawyk?</h3>' +
        '<div class="dots">' + cards.map(function (_, k) {
          return '<span class="dot ' + (k < i ? (res[k] ? 'ok' : 'no') : (k === i ? 'cur' : '')) + '"></span>';
        }).join('') + '</div>' +
        '<div class="habit-card" id="hc"><span class="emoji">' + c.icon + '</span><div class="txt">' + c.t + '</div></div>' +
        '<div class="vote-btns"><button class="opt" data-a="1"><span class="ico">👍</span>Zdrowy nawyk</button>' +
        '<button class="opt" data-a="0"><span class="ico">👎</span>Niezdrowy nawyk</button></div>' +
        '<div id="fb" style="width:100%"></div><div class="row center" id="acts"></div></div>';
      var answered = false;
      $$('.vote-btns .opt', stage).forEach(function (b) {
        b.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var ans = b.getAttribute('data-a') === '1', ok = ans === c.ok;
          res[i] = ok;
          if (ok) correct++;
          $$('.vote-btns .opt', stage).forEach(function (x) {
            x.disabled = true;
            var xa = x.getAttribute('data-a') === '1';
            if (xa === c.ok) x.classList.add('correct'); else x.classList.add(x === b ? 'wrong' : 'dim');
          });
          $('#fb', stage).innerHTML = fb(ok, ok ? 'Dobrze! To ' + (c.ok ? 'zdrowy' : 'niezdrowy') + ' nawyk.' : 'Uwaga! To ' + (c.ok ? 'zdrowy' : 'niezdrowy') + ' nawyk.', c.fb);
          sfx(ok ? 'ok' : 'no');
          var last = i === cards.length - 1;
          var acts = $('#acts', stage);
          acts.innerHTML = '<button class="btn btn-primary btn-big" id="nx">' + (last ? 'Podsumowanie ▶' : 'Następna karta ▶') + '</button>';
          $('#nx', stage).addEventListener('click', function () {
            var hc = $('#hc', stage);
            hc.classList.add(c.ok ? 'fly-right' : 'fly-left');
            $('#nx', stage).disabled = true;
            setTimeout(function () {
              if (last) summary(); else { i++; render(); }
            }, reduced ? 0 : 380);
          });
          scrollTo(acts);
        });
      });
    }
    function summary() {
      var pts = Math.round(correct / cards.length * 100);
      stage.innerHTML =
        '<h3 class="task-title"><span class="step">Wynik</span> Cyfrowe nawyki</h3>' +
        fb(pts >= 75, 'Poprawnie: ' + correct + '/' + cards.length + ' → ' + pts + ' pkt', 'Ekrany mogą być super – jeśli robimy przerwy, chronimy sen i dbamy o bezpieczeństwo w sieci.', '🛡️') +
        '<div class="row center" id="acts"></div>';
      if (pts >= 75) confetti(70);
      sfx(pts >= 75 ? 'ok' : 'click');
      finishButton(stage, function () { done(pts); });
    }
    render();
  };

  // 7. Higiena – kolejność mycia rąk, kiedy myć ręce, zęby
  MECH.hygiene = function (stage, m, done) {
    var ptsA = 0, ptsB = 0;
    function step1() {
      var pool = shuffle(m.steps.map(function (s, k) { return { s: s, k: k }; }));
      var expected = 0, firstTry = 0, missed = false;
      stage.innerHTML =
        '<h3 class="task-title"><span class="step">Krok 1/3</span> Myjemy ręce! Ułóżcie kroki we właściwej kolejności</h3>' +
        '<p class="hint">Klikajcie kroki od pierwszego do ostatniego.</p>' +
        '<div class="seq" id="seq">' + m.steps.map(function (_, k) { return '<div class="slot" data-s="' + k + '"><span class="emoji">💧</span>Krok ' + (k + 1) + '</div>'; }).join('') + '</div>' +
        '<div class="grid steps-pool" id="pool">' + pool.map(function (p, i) {
          return '<button class="opt" data-i="' + i + '"><span class="ico">' + p.s.icon + '</span>' + p.s.t + '</button>';
        }).join('') + '</div>' +
        '<div id="fb"></div><div class="row center" id="acts"><button class="btn btn-primary btn-big" id="next" disabled>Dalej ▶</button></div>';
      var fbx = $('#fb', stage);
      $$('#pool .opt', stage).forEach(function (b) {
        b.addEventListener('click', function () {
          var p = pool[+b.getAttribute('data-i')];
          if (p.k === expected) {
            if (!missed) firstTry++;
            missed = false;
            b.disabled = true; b.classList.add('correct');
            var slot = $('.slot[data-s="' + expected + '"]', stage);
            slot.classList.add('filled');
            slot.innerHTML = '<span class="emoji">' + p.s.icon + '</span>' + p.s.t;
            expected++;
            sfx('click');
            if (expected === m.steps.length) {
              ptsA = firstTry * 10;
              fbx.innerHTML = fb(true, 'Ręce czyste! +' + ptsA + ' pkt', 'Poprawnie za pierwszym razem: ' + firstTry + '/5. Według WHO całe mycie rąk wodą z mydłem powinno trwać ok. 40–60 sekund.', '🧼');
              sfx('ok'); confetti(50);
              $('#next', stage).disabled = false;
            } else {
              fbx.innerHTML = fb(true, 'Dobrze! Krok ' + expected + ' zrobiony.', 'Jaki jest kolejny krok?');
            }
          } else {
            missed = true;
            b.classList.remove('shake'); void b.offsetWidth; b.classList.add('wrong', 'shake');
            setTimeout(function () { b.classList.remove('wrong', 'shake'); }, 700);
            fbx.innerHTML = fb(false, 'To jeszcze nie ten krok', 'Teraz potrzebny jest krok ' + (expected + 1) + '. Pomyślcie, co robimy wcześniej.');
            sfx('no');
          }
        });
      });
      $('#next', stage).addEventListener('click', step2);
    }
    function step2() {
      var opts = shuffle(m.when), sel = {};
      stage.innerHTML =
        '<h3 class="task-title"><span class="step">Krok 2/3</span> Kiedy szczególnie trzeba umyć ręce?</h3>' +
        '<p class="hint">Zaznaczcie WSZYSTKIE poprawne odpowiedzi, a potem kliknijcie „Sprawdź”.</p>' +
        '<div class="grid g2" id="wo">' + opts.map(function (o, i) {
          return '<button class="opt" data-i="' + i + '"><span class="ico">⬜</span>' + o.t + '</button>';
        }).join('') + '</div>' +
        '<div id="fb"></div><div class="row center" id="acts"><button class="btn btn-primary btn-big" id="chk">✔ Sprawdź</button></div>';
      $$('#wo .opt', stage).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i');
          sel[i] = !sel[i];
          b.classList.toggle('selected', !!sel[i]);
          b.querySelector('.ico').textContent = sel[i] ? '☑️' : '⬜';
          sfx('click');
        });
      });
      $('#chk', stage).addEventListener('click', function () {
        var good = 0;
        $$('#wo .opt', stage).forEach(function (b) {
          var i = +b.getAttribute('data-i'), o = opts[i], s = !!sel[i];
          b.disabled = true;
          if (s === o.ok) good++;
          if (o.ok) { b.classList.add(s ? 'correct' : 'wrong'); b.querySelector('.ico').textContent = s ? '✅' : '❗'; }
          else { b.classList.add(s ? 'wrong' : 'dim'); b.querySelector('.ico').textContent = s ? '❌' : '⬜'; }
        });
        ptsB = Math.round(good / opts.length * 25);
        var all = good === opts.length;
        $('#fb', stage).innerHTML = fb(all, (all ? 'Bezbłędnie! ' : 'Dobra robota! ') + '+' + ptsB + ' pkt',
          'Ręce myjemy m.in. po toalecie, przed jedzeniem, po powrocie do domu, po kichaniu lub wydmuchaniu nosa i po zabawie ze zwierzętami. Zarazków zwykle nie widać – czyste na oko ręce też mogą je mieć! (❗ = tę odpowiedź też trzeba było zaznaczyć)');
        sfx(all ? 'ok' : 'no');
        if (all) confetti(50);
        $('#acts', stage).innerHTML = '<button class="btn btn-primary btn-big" id="nx">Dalej ▶</button>';
        $('#nx', stage).addEventListener('click', step3);
        scrollTo($('#acts', stage));
      });
    }
    function step3() {
      quiz(stage, {
        step: 'Krok 3/3', title: 'Zadanie od dentysty 🦷', q: m.teeth.q, options: m.teeth.options,
        explain: m.teeth.explain, nextLabel: 'Zakończ misję ▶'
      }, 25, function (ptsC) { done(ptsA + ptsB + ptsC); });
    }
    step1();
  };

  // 8. Środowisko – decyzje z dwoma wskaźnikami
  MECH.eco = function (stage, m, done) {
    var i = 0, pts = 0, H = 50, E = 50;
    function render() {
      var d = m.decisions[i];
      var opts = shuffle(d.options);
      var best = Math.max.apply(null, d.options.map(function (o) { return o.pts; }));
      stage.innerHTML =
        '<h3 class="task-title"><span class="step">Decyzja ' + (i + 1) + '/' + m.decisions.length + '</span> Co wybieracie?</h3>' +
        '<div class="meters2">' +
        '<div class="meter-box"><div class="meter-top"><span>❤️ Zdrowie</span><span id="hv">' + H + '%</span></div><div class="meter"><div class="meter-fill h" id="hm" style="width:' + H + '%"></div></div></div>' +
        '<div class="meter-box"><div class="meter-top"><span>🌍 Środowisko</span><span id="ev">' + E + '%</span></div><div class="meter"><div class="meter-fill e" id="em" style="width:' + E + '%"></div></div></div>' +
        '</div>' +
        '<div class="decision"><span class="emoji">' + d.icon + '</span><div class="q">' + d.q + '</div></div>' +
        '<div class="grid g3" id="opts">' + opts.map(function (o, k) {
          return '<button class="opt" data-i="' + k + '">' + o.t + '</button>';
        }).join('') + '</div>' +
        '<div id="fb"></div><div class="row center" id="acts"></div>';
      var answered = false;
      $$('#opts .opt', stage).forEach(function (b) {
        b.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var o = opts[+b.getAttribute('data-i')], isBest = o.pts === best;
          $$('#opts .opt', stage).forEach(function (x) {
            var xo = opts[+x.getAttribute('data-i')];
            x.disabled = true;
            if (xo.pts === best) x.classList.add('correct');
            else if (x === b) x.classList.add('wrong');
            else x.classList.add('dim');
          });
          pts += o.pts;
          H = clamp(H + o.h * 8, 0, 100); E = clamp(E + o.e * 8, 0, 100);
          $('#hm', stage).style.width = H + '%'; $('#hv', stage).textContent = H + '%';
          $('#em', stage).style.width = E + '%'; $('#ev', stage).textContent = E + '%';
          $('#fb', stage).innerHTML = fb(isBest, (isBest ? 'Najlepszy wybór! ' : 'Można lepiej… ') + '+' + o.pts + ' pkt', o.fb, isBest ? '🌿' : '💡');
          sfx(isBest ? 'ok' : 'no');
          if (isBest) confetti(40);
          var last = i === m.decisions.length - 1;
          var acts = $('#acts', stage);
          acts.innerHTML = '<button class="btn btn-primary btn-big" id="nx">' + (last ? 'Zakończ misję ▶' : 'Następna decyzja ▶') + '</button>';
          $('#nx', stage).addEventListener('click', function () { if (last) done(pts); else { i++; render(); } });
          scrollTo(acts);
        });
      });
    }
    render();
  };

  // Dostęp do testów (tylko odczyt stanu) – nie wpływa na rozgrywkę.
  window.MZ_DEBUG = { state: function () { return JSON.parse(JSON.stringify(state)); }, total: total };

  screenStart();
})();
