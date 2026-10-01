(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const audio = $('#bgMusic');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== À PERSONNALISER : la lettre (** = mot en gras rose) ===== */
  const LETTER = [
    ['salute', 'Mon Bubu ❤️'],
    ['', "Aujourd'hui est un jour un peu plus spécial que les autres, parce que c'est le jour où une personne merveilleuse est née."],
    ['', "Je voulais simplement te rappeler à quel point tu comptes pour moi. Ta présence apporte quelque chose de doux et de précieux à mes journées, et chaque petit moment partagé avec toi a une place particulière dans mon cœur."],
    ['', "Je ne sais pas toujours trouver les mots parfaits pour te dire tout ce que je ressens, mais je veux que tu saches une chose : **je t'aime profondément.**"],
    ['', "J'aime ton sourire, ta façon d'être, tes petites habitudes, tes petites manies et même ces petits détails que tu ne remarques probablement pas toi-même."],
    ['', 'Tu es une personne qui mérite énormément de bonheur, de douceur et de belles choses.'],
    ['', 'Alors pour ton anniversaire, je veux simplement te souhaiter une année remplie de sourires, de beaux souvenirs, de rêves qui se réalisent et de moments qui te rendent vraiment heureux(se).'],
    ['', "Et surtout, j'espère pouvoir continuer à partager encore beaucoup de ces moments avec toi."],
    ['closing', 'Joyeux anniversaire mon Bubu. ❤️'],
    ['closing', "Je t'aime. Aujourd'hui, demain et encore longtemps. 💕"],
  ];

  /* ===== Utilitaires ===== */
  let timers = [], run = 0, typing = null;
  const wait = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; clearInterval(typing); typing = null; };
  const rnd = (a, b) => a + Math.random() * (b - a);

  document.querySelectorAll('.split').forEach((el) => {
    const d = el.dataset.d ? `${el.dataset.d}s` : '0s';
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = el.textContent.split(' ').map((w, i) =>
      `<span class="w" aria-hidden="true" style="--i:${i};--d:${d}">${w}</span>`).join(' ');
  });
  function show(name) {
    body.dataset.s = name;
    document.querySelectorAll('.scene').forEach((s) => s.classList.toggle('on', s.id === `sc-${name}`));
  }

  /* ===== Musique : fondu doux ===== */
  let fade = null;
  const fadeTo = (v, ms, done) => {
    clearInterval(fade);
    const from = audio.volume, steps = Math.max(1, ms / 50);
    let n = 0;
    fade = setInterval(() => {
      audio.volume = Math.min(1, Math.max(0, from + (v - from) * (++n / steps)));
      if (n >= steps) { clearInterval(fade); done && done(); }
    }, 50);
  };
  const setPlaying = (on) => {
    body.classList.toggle('playing', on);
    $('#music').setAttribute('aria-pressed', String(on));
    $('#music').setAttribute('aria-label', on ? 'Mettre la musique en pause' : 'Relancer la musique');
  };
  function startMusic() {
    audio.volume = 0;
    const p = audio.play();
    const ok = () => { setPlaying(true); fadeTo(.55, 4000); };
    if (p && p.then) p.then(ok).catch(() => setPlaying(false)); else ok();
  }
  $('#music').addEventListener('click', () => {
    if (audio.paused) startMusic();
    else { setPlaying(false); fadeTo(0, 600, () => audio.pause()); }
  });

  /* ===== Canvas : poussière rose, éclats, pétales, cœur de lumière ===== */
  const cv = $('#fx'), cx = cv.getContext('2d');
  let W, H, dpr, parts = [], dust = [], raf = 0;
  const COLORS = ['#fff0f4', '#ff8fb1', '#ffc9db', '#b39ddb', '#f3c4b5'];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
  const spawn = (n) => { dust = []; for (let i = 0; i < n; i++) dust.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2) * dpr, vy: -rnd(.08, .3) * dpr, ph: rnd(0, 6.28), a: rnd(.15, .6) }); };

  function burst(n, px = .5, py = .45) {
    if (reduce) n = Math.round(n / 4);
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), v = rnd(2, 11) * dpr;
      parts.push({ x: W * px, y: H * py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * dpr, g: .14 * dpr, drag: .985, r: rnd(1.5, 4) * dpr, life: 0, max: rnd(90, 170), c: COLORS[i % 5], petal: Math.random() < .35, rot: rnd(0, 6.28), vr: rnd(-.08, .08) });
    }
  }
  function petals(n) {
    for (let i = 0; i < n; i++)
      parts.push({ x: rnd(0, W), y: -20 * dpr, vx: rnd(-.6, .6) * dpr, vy: rnd(1, 2.4) * dpr, g: 0, drag: 1, r: rnd(4, 8) * dpr, life: 0, max: 600, c: Math.random() < .7 ? '#ff8fb1' : '#ffc9db', petal: true, rot: rnd(0, 6.28), vr: rnd(-.04, .04), sway: rnd(0, 6.28) });
  }
  // Les étoiles se rassemblent pour dessiner un cœur, puis jaillissent
  const HY = .4;
  function heart() {
    const n = reduce ? 70 : 230, s = Math.min(W * .85, H * .55) / 34;
    for (let i = 0; i < n; i++) {
      const t = i / n * 6.283, sn = Math.sin(t);
      parts.push({ x: rnd(0, W), y: rnd(0, H), tx: W / 2 + 16 * sn ** 3 * s, ty: H * HY - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s, hold: 1, vx: 0, vy: 0, g: 0, drag: 1, r: rnd(1.6, 3.2) * dpr, life: 0, max: 9999, c: COLORS[i % 5], rot: 0, vr: 0 });
    }
  }
  function release() {
    parts.forEach((p) => {
      if (!p.hold) return;
      p.hold = 0; p.vx = (p.x - W / 2) * .02 + rnd(-1, 1); p.vy = (p.y - H * HY) * .02 - 1; p.g = .05 * dpr; p.drag = .985; p.life = 0; p.max = 170;
    });
  }

  function frame(t) {
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = '#ff8fb1';
    for (const d of dust) {
      d.y += d.vy; d.x += Math.sin(t / 2000 + d.ph) * .25 * dpr;
      if (d.y < -10) { d.y = H + 10; d.x = rnd(0, W); }
      cx.globalAlpha = d.a * (.6 + .4 * Math.sin(t / 900 + d.ph));
      cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.28); cx.fill();
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.hold) { p.x += (p.tx - p.x) * .045; p.y += (p.ty - p.y) * .045; cx.globalAlpha = .6 + .4 * Math.sin(t / 300 + i); }
      else {
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
        p.x += p.vx + (p.sway !== undefined ? Math.sin(p.life / 30 + p.sway) * .8 * dpr : 0); p.y += p.vy; p.rot += p.vr;
        if (++p.life > p.max || p.y > H + 30) { parts.splice(i, 1); continue; }
        cx.globalAlpha = Math.max(0, 1 - p.life / p.max) * .95;
      }
      cx.fillStyle = p.c;
      cx.beginPath();
      if (p.petal) cx.ellipse(p.x, p.y, p.r * 1.7, p.r * .8, p.rot, 0, 6.28); else cx.arc(p.x, p.y, p.r, 0, 6.28);
      cx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(frame); });
  addEventListener('resize', () => { size(); spawn(innerWidth < 700 ? 35 : 70); });
  addEventListener('pointermove', (e) => {
    body.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(2));
    body.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(2));
  }, { passive: true });

  /* ===== Lettre : les mots se révèlent un à un ===== */
  const lb = $('#letterBody'), lh = $('#letterHint');
  function buildLetter() {
    lb.innerHTML = LETTER.map(([cls, txt]) => {
      const html = txt.split(/(\*\*[^*]+\*\*)/).map((seg) => {
        const bold = seg.startsWith('**');
        const words = (bold ? seg.slice(2, -2) : seg).split(' ').filter(Boolean).map((w) => `<span class="lw">${w} </span>`).join('');
        return bold ? `<strong>${words}</strong>` : words;
      }).join('');
      return `<p class="${cls}">${html}</p>`;
    }).join('');
  }
  const showAll = () => { lb.querySelectorAll('.lw').forEach((w) => w.classList.add('on')); lh.textContent = 'Une lettre rien que pour toi ✨'; };
  function typeLetter(id) {
    buildLetter();
    lh.textContent = 'Touche la lettre pour tout lire';
    const words = [...lb.querySelectorAll('.lw')];
    let i = 0;
    typing = setInterval(() => {
      const w = words[i++];
      w.classList.add('on');
      lb.scrollTop = w.offsetTop - lb.clientHeight + 70;
      if (i >= words.length) { clearInterval(typing); typing = null; showAll(); wait(() => id === run && finale(), 3200); }
    }, reduce ? 5 : 95);
  }
  $('#letterCard').addEventListener('click', () => {
    if (typing) { clearInterval(typing); typing = null; showAll(); const id = run; wait(() => id === run && finale(), 3200); }
  });

  /* ===== Le parcours ===== */
  function finale() {
    if (body.dataset.s === 'finale') return;
    show('finale');
    heart();
    wait(() => { release(); $('#flash').classList.add('go'); burst(140, .5, HY); burst(90, .25, .3); burst(90, .75, .3); }, 3300);
    for (let k = 0; k < 9; k++) wait(() => petals(14), 3400 + k * 900);
  }
  function reset() {
    run++; clear(); parts = [];
    body.classList.remove('opened'); setPlaying(false);
    fadeTo(0, 800, () => { audio.pause(); audio.currentTime = 0; });
    $('#flash').classList.remove('go'); lb.innerHTML = '';
    show('gate');
  }

  $('#enter').addEventListener('click', () => {
    const id = ++run;
    startMusic(); show('reveal');
    wait(() => id === run && show('envelope'), 5000);
  });
  $('#envelope').addEventListener('click', () => {
    if (body.classList.contains('opened')) return;
    const id = ++run;
    body.classList.add('opened'); burst(70);
    wait(() => { if (id === run) { show('message'); burst(60); } }, 1500);
    wait(() => id === run && show('letter'), 8500);
    wait(() => id === run && typeLetter(id), 9900);
  });
  $('#replay').addEventListener('click', reset);

  size(); spawn(innerWidth < 700 ? 35 : 70);
  show('gate');
  raf = requestAnimationFrame(frame);
})();
