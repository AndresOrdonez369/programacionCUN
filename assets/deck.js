/* Mazo · lienzo fijo 1600×900, bloques, revelado por pasos y figuras interactivas (adaptado del curso de Arquitectura).
   Esquema de una slide:
   { kind, title, lead?, full?: [bloques] | left?: [bloques], right?: [bloques], izq?: 44 (ancho % de la columna izquierda), top?: true, nota }
   Bloques: 'texto html' | {p} {big} {h} {ul:[..], pasos?} {ol:[..], pasos?} {clave} {pie} {mapa:[[a,b]..], de, a, pasos?}
            {tabla:{head:[..], rows:[[..]]}} {panel:[bloques], tono?:'malo'|'bueno', h?} {fig:'nombre'} {svg:'<svg..>'}
            {code:[{lang,label?,src}], marca?:[{l:[3,4], t:'explicación'}], cap?} {compare:{a:{label,lang,src}, b:{...}}} {check:{q,opts,ok,why}}
            {ruta: n} mapa del curso con la semana n resaltada · {temario: true} grafo de temas de la clase (data/temarios.js) · {juegos:[{j:'Celeste', t:'qué hace', src:'fuente'}]} casos de juegos reales
   Cualquier bloque acepta paso:true para aparecer con la flecha. */
window.DECK = async function (A) {
  'use strict';
  const { $, param, loadScript, highlight, store, checkHTML, wireCheck, esc } = A;
  const W = 1600, H = 900;
  const KIND = { portada: 'Inicio', analogia: 'Analogía', idea: 'Idea', codigo: 'Código', demo: 'Explora', reto: 'Predice', antipatron: 'Antipatrón', actividad: 'Actividad', cierre: 'Cierre', industria: 'En juegos reales', mapa: 'Mapa', practica: 'Practica' };
  const n = Math.min(8, Math.max(0, +(param('s') || 0)));
  await loadScript(`data/s${n}.js`);
  await loadScript(`demos/s${n}.js`);
  const K = window.SESION, stage = $('#stage');
  stage.innerHTML = '<div class="canvas" id="canvas"></div>';
  const canvas = $('#canvas');
  if (!K) { canvas.innerHTML = '<section class="slide k-portada"><header><h1>Slides en preparación</h1></header><p><a href="index.html">Volver al curso</a></p></section>'; escala(); return; }
  const tag = n === 0 ? 'M0' : 'S' + n;
  document.title = `Slides ${tag} · ${K.titulo}`;
  const S = K.slides.slice(), codes = [];
  /* después de la portada, cada sesión muestra en qué frame del curso está */
  const SEM = window.CURSO && window.CURSO.sesiones[n];
  if (SEM && !K.sinRuta && !JSON.stringify(S).includes('"ruta"')) S.splice(1, 0, { kind: 'mapa', title: n === 0 ? 'Frame 00: antes de la primera sesión' : n === 8 ? 'Frame 08: llegamos a la meta' : `Frame ${String(n).padStart(2, '0')} de 08: dónde estamos`, full: [{ ruta: n }],
    nota: `Treinta segundos. Recuerda la sesión anterior en una frase y lee la pregunta de hoy en voz alta. ${SEM.entrega ? 'Esta vez: ' + SEM.entrega + '.' : ''} Toca otros frames si alguien pregunta qué viene.` });
  /* la portada abre con la pregunta que la sesión responde */
  if (SEM && S[0] && S[0].kind === 'portada') S[0] = Object.assign({}, S[0], { full: [{ p: `<span class="preg">${SEM.pregunta}</span>` }].concat(S[0].full || []) });
  /* el grafo de temas abre la sesión (organizador previo) y vuelve antes del cierre como repaso */
  const TEM = K.mapa;
  if (TEM) {
    const iMapa = S.findIndex(x => x.kind === 'mapa' || JSON.stringify(x.full || []).includes('"ruta"'));
    S.splice(iMapa >= 0 ? iMapa + 1 : 1, 0, { kind: 'mapa', title: TEM.titulo || 'Hoy armamos este grafo', lead: TEM.lead || '', full: [{ temario: true }],
      nota: 'Dos minutos. Deja que el grafo se arme solo y lee los nodos en voz alta, de izquierda a derecha. Pregunta: ¿cuál de estos temas ya les suena? Toca un nodo para ver su resumen. Al final de la clase volvemos a este mismo grafo.' });
    const iCierre = S.map(x => x.kind).lastIndexOf('cierre');
    S.splice(iCierre >= 0 ? iCierre : S.length, 0, { kind: 'mapa', title: 'El grafo de hoy, completo', lead: 'Elige un cable y explica con tus palabras por qué un tema necesita al otro.', full: [{ temario: true }],
      nota: 'Tres minutos. Señala un cable al azar y pide a alguien que lo explique. Si nadie puede, ese es el tema para repasar en el quiz. Es práctica de recuperación: recordar sin mirar fija lo aprendido.' });
  }
  let k = Math.min(S.length - 1, Math.max(0, (+location.hash.slice(1) || 1) - 1)), stops = [], pasos = [], hechos = 0;

  const P = b => (b.paso ? ' data-paso' : '');
  function blocks(list) { return (list || []).map(blk).join(''); }
  function blk(b) {
    if (typeof b === 'string') return `<p>${b}</p>`;
    if (b.panel) return `<div class="panel ${b.tono || ''}"${P(b)}>${b.h ? `<h2>${b.h}</h2>` : ''}${blocks(b.panel)}</div>`;
    if (b.big) return `<p class="big"${P(b)}>${b.big}</p>`;
    if (b.p) return `<p${P(b)}>${b.p}</p>`;
    if (b.h) return `<h2${P(b)}>${b.h}</h2>`;
    if (b.pie) return `<p class="pie"${P(b)}>${b.pie}</p>`;
    if (b.clave) return `<div class="clave"${P(b)}>${b.clave}</div>`;
    if (b.ul || b.ol) return `<${b.ul ? 'ul class="pts"' : 'ol class="nums"'}${P(b)}>${(b.ul || b.ol).map(x => `<li${b.pasos ? ' data-paso' : ''}><span>${x}</span></li>`).join('')}</${b.ul ? 'ul' : 'ol'}>`;
    if (b.mapa) return `<div class="mapa"${P(b)}><div class="mh"><span>${b.de || ''}</span><span></span><span>${b.a || ''}</span></div>${b.mapa.map(r => `<div class="mr"${b.pasos ? ' data-paso' : ''}><div class="a">${r[0]}</div><div class="fl"></div><div class="b">${r[1]}</div></div>`).join('')}</div>`;
    if (b.tabla) return `<table${P(b)}>${b.tabla.head ? `<thead><tr>${b.tabla.head.map(x => `<th>${x}</th>`).join('')}</tr></thead>` : ''}<tbody>${b.tabla.rows.map(r => `<tr${b.pasos ? ' data-paso' : ''}>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    if (b.panel) return `<div class="panel ${b.tono || ''}"${P(b)}>${b.h ? `<h2>${b.h}</h2>` : ''}${blocks(b.panel)}</div>`;
    if (b.fig) return `<div class="figura demo" data-fig="${b.fig}"${P(b)}></div>`;
    if (b.svg) return `<div class="ilus"${P(b)}>${b.svg}</div>`;
    if (b.code) return code(b.code, b);
    if (b.compare) return `<div class="dcompare" style="grid-template-columns:minmax(0,${ancho(b.compare.a)}fr) minmax(0,${ancho(b.compare.b)}fr)"${P(b)}>${code([b.compare.a], { cap: b.compare.a.label, tone: 'bad' })}${code([b.compare.b], { cap: b.compare.b.label, tone: 'good' })}</div>`;
    if (b.check) return `<div${P(b)}>${checkHTML(b.check)}</div>`;
    if (b.temario) return `<div class="figura demo" data-temario${P(b)}></div>`;
    if (b.ruta !== undefined) return `<div class="figura demo" data-ruta="${b.ruta}"${P(b)}></div>`;
    if (b.juegos) return `<div class="juegos"${P(b)}>${b.juegos.map(x => `<div class="jg"${b.pasos ? ' data-paso' : ''}><h2>${x.j}</h2><p class="que">${x.t}</p>${x.src ? `<p class="src">${x.src}</p>` : ''}</div>`).join('')}</div>`;
    return '';
  }
  /* el lado con líneas más largas recibe más ancho */
  const ancho = t => Math.max(30, ...t.src.split(String.fromCharCode(10)).map(l => l.length));
  const lines = t => t.src.replace(/\s+$/, '').split('\n').map((l, i) => `<span class="ln" data-l="${i + 1}">${highlight(l, t.lang) || ' '}</span>`).join('');
  function code(tabs, o) {
    const id = codes.push(tabs) - 1, max = Math.max(...tabs.map(t => t.src.replace(/\s+$/, '').split('\n').length));
    const cf = max > 21 ? 16 : max > 18 ? 18 : max > 15 ? 20 : 22;
    const head = o.cap ? `<div class="cap">${esc(o.cap)}</div>` : tabs.length > 1 ? `<div class="tabs" role="tablist">${tabs.map((t, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(t.label || t.lang)}</button>`).join('')}</div>` : `<div class="cap">${esc(tabs[0].label || tabs[0].lang)}</div>`;
    const marks = (o.marca || []).map((m, i) => `<i data-paso data-marca="${i}"></i>`).join('');
    return `<div class="dcode ${o.tone || ''}" data-code="${id}" style="--cf:${cf}px"${P(o)}${o.marca ? ` data-marcas='${esc(JSON.stringify(o.marca)).replace(/'/g, '&#39;')}'` : ''}>${head}<pre><code>${lines(tabs[0])}</code></pre>${marks}</div>${o.marca ? '<div class="callout" aria-live="polite"></div>' : ''}`;
  }

  function render() {
    stops.forEach(f => { try { f(); } catch (e) { /* figura ya detenida */ } }); stops = []; codes.length = 0;
    const s = compat(S[k]), lado = s.left || s.right, top = s.top ? ' top' : '';
    canvas.innerHTML = `<section class="slide k-${s.kind || 'idea'}"><header><h1>${s.title}</h1>${s.lead ? `<p class="lead">${s.lead}</p>` : ''}</header>${lado
      ? `<div class="cols" style="--izq:${s.izq || 44}"><div class="col${top}">${blocks(s.left)}</div><div class="col${top}">${blocks(s.right)}</div></div>`
      : s.full ? `<div class="full${top}">${blocks(s.full)}</div>` : ''}</section>`;
    canvas.querySelectorAll('.check').forEach((c, i) => wireCheck(c, findCheck(s, i)));
    canvas.querySelectorAll('.check .q').forEach(q => { if (!q.textContent.trim()) q.remove(); });
    canvas.querySelectorAll('[data-fig]').forEach(el => { const f = (window.DEMOS || {})[el.dataset.fig]; if (f) { const st = f(el); if (typeof st === 'function') stops.push(st); } else el.textContent = 'Figura no disponible: ' + el.dataset.fig; });
    canvas.querySelectorAll('[data-ruta]').forEach(el => stops.push(window.FIG.ruta(el, { actual: +el.dataset.ruta })));
    canvas.querySelectorAll('[data-temario]').forEach(el => stops.push(window.FIG.grafo(el, grafoDe(TEM))));
    canvas.querySelectorAll('.col, .full').forEach(c => [...c.children].forEach((x, i) => x.style.setProperty('--i', i)));
    canvas.querySelectorAll('.opts').forEach(c => [...c.children].forEach((x, i) => x.style.setProperty('--j', i)));
    pasos = [...canvas.querySelectorAll('[data-paso]')]; hechos = 0;
    ajustar(); barra();
    history.replaceState(null, '', '#' + (k + 1));
    store.set('last', { s: n, k });
  }
  /* slides del esquema anterior (html, code, compare, demo, check, after) se convierten a bloques */
  function compat(s) {
    if (s.left || s.right || s.full || !(s.html || s.code || s.compare || s.demo || s.check || s.after)) return s;
    const txt = [s.html, s.after].filter(Boolean), vis = [];
    if (s.compare) vis.push({ compare: s.compare }); if (s.code) vis.push({ code: s.code }); if (s.demo) vis.push({ fig: s.demo });
    const chk = s.check ? [{ check: s.check }] : [];
    if (s.compare || !vis.length || (s.demo && !s.check)) return Object.assign({}, s, { full: [...(s.html ? [s.html] : []), ...vis, ...chk, ...(s.after ? [s.after] : [])], top: !!vis.length });
    return Object.assign({}, s, { left: [...txt, ...chk], right: vis, izq: s.demo ? 36 : 42 });
  }
  function findCheck(s, i) { const out = []; const walk = l => (l || []).forEach(b => { if (b && b.check) out.push(b.check); if (b && b.panel) walk(b.panel); }); walk(s.full); walk(s.left); walk(s.right); return out[i]; }
  /* convierte el temario en nodos y cables */
  function grafoDe(T) {
    const nodos = T.nodos.map(x => ({ id: x[0], t: x[1], s: x[2], tipo: x[3], d: x[4] })), cables = T.cables.slice();
    return { nodos, cables };
  }
  function revelar(el) {
    el.classList.add('on');
    /* en listas y mapas, lo ya visto se atenúa para que lo nuevo mande */
    if (el.matches('li, .mr, tr, .jg')) [...el.parentElement.children].forEach(x => { if (x !== el && x.classList.contains('on')) x.classList.add('visto'); });
    if (el.dataset.marca !== undefined) {
      const box = el.closest('.dcode'), m = JSON.parse(box.dataset.marcas)[+el.dataset.marca];
      box.classList.add('marcando');
      box.querySelectorAll('.ln').forEach(l => l.classList.toggle('hot', m.l.includes(+l.dataset.l)));
      const c = box.nextElementSibling; if (c && c.classList.contains('callout')) { c.innerHTML = m.t; c.classList.remove('nuevo'); void c.offsetWidth; c.classList.add('nuevo'); }
    }
  }
  function barra() {
    const s = S[k];
    $('#kind').textContent = KIND[s.kind || 'idea'];
    const sl = canvas.firstElementChild; if (sl) $('#kind').style.setProperty('--k', getComputedStyle(sl).getPropertyValue('--k'));
    $('#ttl').textContent = `${tag} · ${K.titulo}`;
    $('#cnt').textContent = `${k + 1} / ${S.length}`;
    $('#prev').disabled = k === 0; $('#next').disabled = k === S.length - 1 && hechos >= pasos.length;
    $('#prog').style.width = ((k + 1) / S.length * 100) + '%';
    $('#pasos').innerHTML = pasos.map((_, i) => `<i class="${i < hechos ? 'on' : ''}"></i>`).join('');
    $('#notes').innerHTML = `<b>Nota docente.</b> ${s.nota || 'Sin nota para esta slide.'}`;
  }
  /* si el contenido no cabe en el lienzo, encoge la letra del cuerpo por pasos */
  function ajustar() {
    const sl = canvas.firstElementChild; sl.style.fontSize = '';
    if (document.body.classList.contains('flow')) return;
    /* primero se angosta el dibujo de las figuras (hasta 72 %); solo después baja la letra */
    const figs = [...sl.querySelectorAll('.figura > svg')];
    for (let w = 96; w >= 72 && figs.length && desborda(sl); w -= 4) figs.forEach(s => { s.style.width = w + '%'; s.style.marginInline = 'auto'; });
    for (let f = 28; f >= 20 && (sl.scrollHeight > H + 2 || desborda(sl)); f -= 2) sl.style.fontSize = f + 'px';
    /* el código nunca se recorta: si no cabe, baja su letra hasta 14 px */
    sl.querySelectorAll('.dcode').forEach(d => { const pre = d.querySelector('pre'); let cf = parseFloat(d.style.getPropertyValue('--cf')) || 22; while (cf > 13 && (pre.scrollHeight > pre.clientHeight + 2 || pre.scrollWidth > pre.clientWidth + 2)) d.style.setProperty('--cf', (--cf) + 'px'); });
  }
  /* auditoría para pruebas: qué se sale del lienzo en la slide actual */
  function auditar() {
    const sl = canvas.firstElementChild, b = sl.getBoundingClientRect(), z = b.width / W, out = [];
    sl.querySelectorAll('pre').forEach(p => { if (p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2) out.push('código recortado ' + Math.round(parseFloat(getComputedStyle(p).fontSize)) + 'px'); });
    sl.querySelectorAll('header, .col > *, .full > *').forEach(e => { const r = e.getBoundingClientRect(); if (r.bottom > b.bottom - 20 * z || r.right > b.right - 20 * z) out.push('fuera: ' + (e.className || e.tagName)); });
    if (desborda(sl)) out.push('columna desbordada');
    const fs = parseFloat(sl.style.fontSize); if (fs && fs < 24) out.push('letra ' + fs);
    sl.querySelectorAll('.dcode').forEach(d => { const cf = parseFloat(d.style.getPropertyValue('--cf')); if (cf < 17) out.push('código ' + cf + 'px'); });
    return out;
  }
  function desborda(sl) { const b = sl.getBoundingClientRect(), z = b.height / H; return [...sl.querySelectorAll('.col, .full')].some(c => c.scrollHeight > c.clientHeight + 4 || c.getBoundingClientRect().bottom > b.bottom - 30 * z); }
  function escala() {
    const flow = innerWidth < 760;
    document.body.classList.toggle('flow', flow);
    if (flow) { canvas.style.transform = ''; canvas.style.left = canvas.style.top = ''; return; }
    const r = stage.getBoundingClientRect(), z = Math.min(r.width / W, r.height / H);
    canvas.style.transform = `scale(${z})`;
    canvas.style.left = ((r.width - W * z) / 2) + 'px'; canvas.style.top = ((r.height - H * z) / 2) + 'px';
  }
  function go(d) {
    if (d > 0 && hechos < pasos.length && !document.body.classList.contains('flow')) { revelar(pasos[hechos++]); barra(); return; }
    const j = Math.min(S.length - 1, Math.max(0, k + d)); if (j !== k) { k = j; render(); }
  }

  canvas.addEventListener('click', e => {
    const b = e.target.closest('.dcode .tabs button'); if (!b) return;
    const box = b.closest('.dcode'), tabs = codes[+box.dataset.code];
    box.querySelectorAll('[role=tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    box.classList.remove('marcando'); box.querySelector('code').innerHTML = lines(tabs[+b.dataset.i]);
  });
  $('#prev').onclick = () => go(-1); $('#next').onclick = () => go(1);
  $('#full').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  $('#nbtn').onclick = () => $('#notes').classList.toggle('on');
  $('#back').href = `sesion.html?s=${n}`;
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.target.closest('button'))) { go(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(-1); e.preventDefault(); }
    else if (e.key === 'Home') { k = 0; render(); } else if (e.key === 'End') { k = S.length - 1; render(); }
    else if (e.key === 'f' || e.key === 'F') $('#full').click();
    else if (e.key === 'n' || e.key === 'N') $('#nbtn').click();
  });
  addEventListener('hashchange', () => { const j = Math.min(S.length - 1, Math.max(0, (+location.hash.slice(1) || 1) - 1)); if (j !== k) { k = j; render(); } });
  addEventListener('resize', () => { const f = document.body.classList.contains('flow'); escala(); if (f !== document.body.classList.contains('flow')) render(); });
  let x0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.target.closest('.figura') ? null : e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 70) { if (d < 0) { hechos = pasos.length; go(1); } else go(-1); } x0 = null; });
  escala(); render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
  window.DECK_API = { ir: j => { k = j; render(); }, todo: () => { canvas.classList.add('sin-anim'); while (hechos < pasos.length) revelar(pasos[hechos++]); canvas.querySelectorAll('.visto').forEach(x => x.classList.remove('visto')); barra(); }, total: S.length, auditar,
    auditarTodo() { const r = {}; for (let j = 0; j < S.length; j++) { k = j; render(); const a = auditar(); if (a.length) r[j + 1] = a.join('; '); } return r; } };
};
