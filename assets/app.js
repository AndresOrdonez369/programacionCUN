/* Programación de Videojuegos · motor del sitio: hub, sesión, quiz pre/post y arranque de las slides */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const param = k => new URLSearchParams(location.search).get(k);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('progvj.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('progvj.' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: el sitio sigue funcionando */ } }
  };
  const ICON = {
    right: '<path d="M4 12h15M13 6l6 6-6 6"/>', left: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    play: '<path d="M7 4v16l13-8z"/>', code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
    quiz: '<path d="M4 4h16v16H4zM9 9.5a3 3 0 1 1 4 2.8c-.6.3-1 .8-1 1.5V15M12 18h.01"/>',
    pre: '<path d="M4 4h16v16H4zM8 12h8M12 8v8"/>', post: '<path d="M4 4h16v16H4zM7 12l3 3 7-7"/>',
    run: '<path d="M7 4v16l13-8z"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', ok: '<path d="M4 12l5 5L20 6"/>'
  };
  const icon = n => `<svg class="svg" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const loadScript = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  const pad = n => String(n).padStart(2, '0');

  /* ---------- resaltado de código: Lua y pseudocódigo ---------- */
  const KW = {
    Lua: 'and break do else elseif end false for function goto if in local nil not or repeat return then true until while self',
    Pseudo: 'si entonces sino fin mientras hacer para cada en desde hasta repetir funcion función retornar devolver y o no verdadero falso inicio leer escribir mostrar con clase metodo método nuevo'
  };
  function highlight(src, lang) {
    const kw = new Set((KW[lang] || KW.Lua).split(' '));
    const re = /(--\[\[[\s\S]*?\]\]|--[^\n]*|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-zÁÉÍÓÚáéíóúñÑ_][\wÁÉÍÓÚáéíóúñÑ]*)(\s*\()?/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const t = esc(m[0]);
      if (m[1]) out += `<span class="tk-c">${t}</span>`;
      else if (m[2]) out += `<span class="tk-s">${t}</span>`;
      else if (m[3]) out += `<span class="tk-n">${t}</span>`;
      else if (kw.has(m[4].toLowerCase()) && (lang !== 'Lua' || kw.has(m[4]))) out += `<span class="tk-k">${esc(m[4])}</span>${m[5] ? esc(m[5]) : ''}`;
      else if (m[5]) out += `<span class="tk-f">${esc(m[4])}</span>${esc(m[5])}`;
      else out += t;
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  /* ---------- Lua en el navegador (fengari), solo para fragmentos sin love.* ---------- */
  let fengariListo = null;
  function cargarFengari() { if (!fengariListo) fengariListo = loadScript('https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js'); return fengariListo; }
  async function ejecutarLua(src) {
    const okCarga = await cargarFengari();
    if (!okCarga || !window.fengari) return { err: true, txt: 'No se pudo cargar el intérprete de Lua (¿sin internet?). Copia el código y pruébalo en tu computador con lua o LÖVE.' };
    const { lua, lauxlib, lualib, to_luastring, to_jsstring } = window.fengari;
    const L = lauxlib.luaL_newstate(); lualib.luaL_openlibs(L);
    const out = [];
    lua.lua_pushjsfunction(L, function (L2) {
      const n = lua.lua_gettop(L2), partes = [];
      for (let i = 1; i <= n; i++) { partes.push(to_jsstring(lauxlib.luaL_tolstring(L2, i))); lua.lua_pop(L2, 1); }
      out.push(partes.join('\t')); return 0;
    });
    lua.lua_setglobal(L, to_luastring('print'));
    /* un ciclo infinito no debe congelar la página */
    let pasos = 0;
    lua.lua_sethook(L, function (L2) { if (++pasos > 400) lauxlib.luaL_error(L2, to_luastring('demasiados pasos: ¿hay un ciclo que nunca termina?')); }, lua.LUA_MASKCOUNT, 10000);
    let st = lauxlib.luaL_loadstring(L, to_luastring(src));
    if (st === lua.LUA_OK) st = lua.lua_pcall(L, 0, 0, 0);
    if (st !== lua.LUA_OK) {
      const msg = lua.lua_tojsstring(L, -1).replace(/^\[string "[\s\S]*?"\]:/, 'línea ');
      return { err: true, txt: (out.length ? out.join('\n') + '\n' : '') + 'Error: ' + msg };
    }
    return { err: false, txt: out.length ? out.join('\n') : '(el programa no imprimió nada)' };
  }

  let uid = 0;
  /* tabs: [{lang, label?, src, run?}] ; opts: {cap, tone:'bad'|'good'} */
  function codeBox(tabs, opts) {
    opts = opts || {};
    const id = 'cb' + (++uid), t0 = tabs[0];
    const head = opts.cap ? `<div class="cap">${esc(opts.cap)}</div>` : '';
    const bar = !opts.cap ? `<div class="tabs" role="tablist">${tabs.map((t, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(t.label || t.lang)}</button>`).join('')}<button class="run" data-run ${t0.run ? '' : 'hidden'}>${icon('run')} ejecutar</button><button class="copy" data-copy title="Copiar código">copiar</button></div>` : '';
    return `<div class="codebox ${opts.tone || ''}" id="${id}" data-tabs="${esc(JSON.stringify(tabs))}">${head}${bar}<pre tabindex="0" ${t0.run ? 'contenteditable="plaintext-only" spellcheck="false"' : ''}><code>${highlight(t0.src, t0.lang)}</code></pre>${t0.run ? '<div class="hint">puedes editar el código y volver a ejecutarlo</div>' : ''}</div>`;
  }
  function tabActual(box) { const s = box.querySelector('[role=tab][aria-selected="true"]'); return s ? +s.dataset.i : 0; }
  document.addEventListener('click', async e => {
    const b = e.target.closest('.codebox .tabs button');
    if (!b) return;
    const box = b.closest('.codebox'), tabs = JSON.parse(box.dataset.tabs), i = tabActual(box), pre = box.querySelector('pre');
    if (b.hasAttribute('data-copy')) {
      const txt = tabs[i].run ? pre.textContent : tabs[i].src;
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => { b.textContent = 'copiado'; setTimeout(() => { b.textContent = 'copiar'; }, 1400); }).catch(() => {});
      return;
    }
    if (b.hasAttribute('data-run')) {
      let sal = box.querySelector('.salida'); if (!sal) { sal = document.createElement('pre'); sal.className = 'salida'; sal.setAttribute('role', 'status'); box.appendChild(sal); }
      sal.classList.remove('err'); sal.textContent = 'ejecutando…'; b.disabled = true;
      let r; try { r = await ejecutarLua(pre.textContent); } catch (err) { r = { err: true, txt: 'Error al ejecutar: ' + err.message }; }
      sal.textContent = r.txt; sal.classList.toggle('err', r.err); b.disabled = false;
      return;
    }
    box.querySelectorAll('[role=tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    const t = tabs[+b.dataset.i];
    pre.innerHTML = `<code>${highlight(t.src, t.lang)}</code>`;
    if (t.run) pre.setAttribute('contenteditable', 'plaintext-only'); else pre.removeAttribute('contenteditable');
    const run = box.querySelector('[data-run]'); if (run) run.hidden = !t.run;
    const hint = box.querySelector('.hint'); if (t.run && !hint) pre.insertAdjacentHTML('afterend', '<div class="hint">puedes editar el código y volver a ejecutarlo</div>'); if (!t.run && hint) hint.remove();
    const sal = box.querySelector('.salida'); if (sal) sal.remove();
  });
  /* al salir de la edición, se vuelve a colorear */
  document.addEventListener('focusout', e => {
    const pre = e.target.closest && e.target.closest('.codebox pre[contenteditable]');
    if (!pre) return;
    const box = pre.closest('.codebox'), tabs = JSON.parse(box.dataset.tabs), t = tabs[tabActual(box)];
    pre.innerHTML = `<code>${highlight(pre.textContent, t.lang)}</code>`;
  });

  /* ---------- pregunta de opción múltiple ---------- */
  const L = 'ABCD';
  function checkHTML(c, two) {
    return `<div class="check"><p class="q">${c.q || ''}</p><div class="opts ${two ? 'two' : ''}">${c.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="l">${L[i]}</span><span>${o}</span></button>`).join('')}</div><div class="why" role="status">${c.why || ''}</div></div>`;
  }
  function wireCheck(el, c, done) {
    el.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      el.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; if (j === c.ok) x.classList.add('ok'); else if (j === i) x.classList.add('no'); });
      $('.why', el).classList.add('on');
      if (done) done(i === c.ok, i);
    }));
  }

  /* ---------- progreso guardado en el navegador ---------- */
  const resultado = (n, t) => store.get(`quiz.${n}.${t}`, null);
  function visto(n) { return !!(resultado(n, 'post') || store.get('vista.' + n, false)); }
  function sesionSugerida() {
    const S = window.CURSO.sesiones, last = store.get('last', null);
    if (last && S[last.s] && !resultado(last.s, 'post')) return last.s;
    const sig = S.find(s => !resultado(s.n, 'post'));
    return sig ? sig.n : 8;
  }

  /* ---------- piezas compartidas ---------- */
  function topbar(here) {
    const l = (h, t, k) => `<a href="${h}" ${here === k ? 'aria-current="page"' : ''}>${t}</a>`;
    return `<div class="wrap topbar"><a class="mark" href="index.html"><i></i>PROG·VJ / CUN</a><nav aria-label="Principal">${l('index.html', 'Curso', 'hub')}${l('sesion.html?s=0', 'Módulo 0', 'm0')}${l('index.html#frames', 'Sesiones', 'frames')}${l('index.html#evaluacion', 'Evaluación', 'eval')}${l('index.html#proyectos', 'Proyectos', 'proy')}</nav></div>`;
  }
  function tira(activa, href) {
    const last = store.get('last', null);
    return `<ol class="tira wrap" aria-label="Módulo 0 y sesiones 1 a 8">${window.CURSO.sesiones.map(s => {
      const cls = [visto(s.n) ? 'visto' : '', last && last.s === s.n && s.n !== activa ? 'aqui' : ''].join(' ').trim();
      return `<li><a class="${cls}" href="${href(s.n)}" data-s="${s.n}" ${s.n === activa ? 'aria-current="true"' : ''}><span class="n">${pad(s.n)}</span><span class="t">${esc(s.titulo)}</span><span class="k">${esc(s.n ? s.corte : 'autónomo')}</span></a></li>`;
    }).join('')}</ol><div class="wrap tira-ley"><span><i style="background:var(--c2)"></i>frame abierto</span><span><i style="background:var(--c3)"></i>ya cerraste el quiz postclase</span><span><i style="background:var(--c4)"></i>aquí te quedaste</span></div>`;
  }
  const paleta = () => `<ul class="paleta" aria-hidden="true">${['--c0', '--c1', '--c2', '--c3', '--c4', '--c5'].map((v, i) => `<li style="background:var(${v})"><span>${i}</span></li>`).join('')}</ul>`;
  const foot = () => `<footer class="foot"><div class="wrap"><span><span class="pix">PROG·VJ</span> · Programación de Videojuegos · Especialización en Diseño y Desarrollo de Videojuegos · CUN</span><span>${window.CURSO.datos} · Tu progreso se guarda solo en este navegador.</span></div></footer>`;
  const nombreSesion = s => s.n === 0 ? 'Módulo 0' : 'Sesión ' + s.n;

  /* ---------- HUB ---------- */
  function hub() {
    const C = window.CURSO;
    let sel = +(location.hash.match(/^#s(\d)$/) || [])[1];
    if (!(sel >= 0 && sel <= 8)) sel = sesionSugerida();
    $('#mast').innerHTML = topbar('hub') + `<div class="wrap hero"><h1>${C.nombre}</h1><p class="lede">${C.lema}</p>${paleta()}</div><div id="tira"></div>`;
    const draw = () => {
      const s = C.sesiones[sel];
      $('#tira').innerHTML = tira(sel, n => '#s' + n);
      const pre = resultado(s.n, 'pre'), post = resultado(s.n, 'post');
      const est = r => r ? `<span class="st">hecho · ${r.ok}/${r.total}</span>` : '';
      $('#semana').innerHTML = `<div class="sel"><div><h2>${nombreSesion(s)} · ${s.titulo}</h2><p class="q">${s.pregunta}</p>
        <ol class="jugadas">
          <li><a href="quiz.html?s=${s.n}&t=pre"><b>Quiz preclase</b><span>Antes de la sesión · 6 preguntas para saber de dónde partes. No es nota.</span>${est(pre)}</a></li>
          <li><a href="slides.html?s=${s.n}"><b>Slides interactivas</b><span>${s.n ? 'En clase' : 'A tu ritmo'} · analogías, demos que mueves tú y preguntas para predecir.</span></a></li>
          <li><a href="sesion.html?s=${s.n}#codigo"><b>Código y guía</b><span>Para practicar · ${s.n === 0 ? 'pseudocódigo y Lua que puedes ejecutar aquí mismo.' : 'pseudocódigo y Lua (LÖVE), conceptos y taller.'}</span></a></li>
          <li><a href="quiz.html?s=${s.n}&t=post"><b>Quiz postclase</b><span>Al cerrar · 8 preguntas sobre las mismas ideas: mide cuánto avanzaste.</span>${est(post)}</a></li>
        </ol></div>
        <aside class="ficha"><span class="pix">Frame ${pad(s.n)} de 08 · ${esc(s.tipo)}</span>${s.entrega ? `<p><span class="tag ${s.entregaTipo || ''}">${s.entrega}</span></p>` : ''}<p><b>Analogía:</b> ${s.analogia.charAt(0).toUpperCase() + s.analogia.slice(1)}</p><p>${s.temas}</p><a class="btn alt" href="sesion.html?s=${s.n}">Abrir ${nombreSesion(s).toLowerCase()} ${icon('right')}</a></aside></div>`;
    };
    draw();
    $('#tira').addEventListener('click', e => { const a = e.target.closest('a[data-s]'); if (!a) return; e.preventDefault(); sel = +a.dataset.s; history.replaceState(null, '', '#s' + sel); draw(); });
    $('#frames-list').innerHTML = C.sesiones.map(s => `<li class="${s.n === 0 ? 'm0' : ''}"><span class="n">${pad(s.n)}</span><div><h3><a href="sesion.html?s=${s.n}">${s.titulo}</a></h3><span class="tp">${esc(s.tipo)}${s.corte ? ' · ' + s.corte : ''}</span></div><div><p>${s.temas}</p><p class="ana"><b>Analogía:</b> ${s.analogia}</p></div><div>${s.entrega ? `<span class="tag ${s.entregaTipo || ''}">${s.entrega}</span>` : ''}</div></li>`).join('');
    $('#eval-body').innerHTML = C.cortes.map(c => `<tr><td>${c[0]}</td><td>${c[1]}</td><td>${c[2]}</td><td class="pct">${c[3]}</td></tr>`).join('');
    $('#proy-list').innerHTML = C.proyectos.map(p => `<li>${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">` : '<div>'}<b>${p.t}</b><span>${p.d}</span><small>Sesión ${p.s}${p.repo ? ' · repositorio' : ''}</small>${p.repo ? '</a>' : '</div>'}</li>`).join('');
    $('#foot').outerHTML = foot();
  }

  /* ---------- barra de ganancia por idea ---------- */
  function ganancias(K, n) {
    const pre = resultado(n, 'pre'), post = resultado(n, 'post');
    if (!K.ideas || (!pre && !post)) return '';
    const fila = ([id, t]) => {
      const a = pre && pre.ideas && pre.ideas[id], b = post && post.ideas && post.ideas[id];
      const pa = a ? a[0] / a[1] : 0, pb = b ? b[0] / b[1] : 0;
      return `<span class="pix" style="font-size:.66rem">${id}</span><span title="${esc(t)}">${t}<span class="gbar" aria-hidden="true"><i class="pre" style="width:${pa * 50}%"></i><i class="post" style="width:${pb * 50}%"></i></span></span><span style="font-family:var(--mono);font-size:.78rem">${a ? Math.round(pa * 100) + '%' : '–'} → ${b ? Math.round(pb * 100) + '%' : '–'}</span>`;
    };
    return `<div class="ganancia">${K.ideas.map(fila).join('')}</div>`;
  }

  /* ---------- SESIÓN ---------- */
  async function sesion() {
    const n = Math.min(8, Math.max(0, +(param('s') || 0))), s = window.CURSO.sesiones[n];
    await loadScript(`data/s${n}.js`);
    await loadScript(`demos/s${n}.js`);
    const K = window.SESION;
    document.title = `${nombreSesion(s)}: ${s.titulo} · Programación de Videojuegos`;
    $('#mast').innerHTML = topbar(n === 0 ? 'm0' : '') + `<div class="wrap pagehead"><h1><span class="fi">${pad(n)}</span>${s.titulo}</h1><p class="q">${s.pregunta}</p><p class="meta">${esc(s.tipo)}${s.corte ? ' · ' + s.corte : ''}</p>
      <div class="acts"><a class="btn" href="quiz.html?s=${n}&t=pre">${icon('pre')} Quiz preclase</a><a class="btn go" href="slides.html?s=${n}">${icon('play')} Slides</a><a class="btn alt" href="#codigo">${icon('code')} Código</a><a class="btn alt" href="quiz.html?s=${n}&t=post">${icon('post')} Quiz postclase</a></div></div><div id="tira"></div>`;
    $('#tira').innerHTML = tira(n, x => 'sesion.html?s=' + x);
    if (!K) { $('#main').innerHTML = '<p class="note warn">El material de esta sesión todavía no está publicado.</p>'; $('#foot').outerHTML = foot(); return; }
    store.set('vista.' + n, true); store.set('last', { s: n, k: 0 });
    const li = a => (a || []).map(x => `<li>${x}</li>`).join('');
    const pre = resultado(n, 'pre'), post = resultado(n, 'post');
    $('#main').innerHTML = `${K.mapa ? `<section class="mapaclase"><h2 id="mapa">Mapa de la ${n ? 'sesión' : 'unidad'}</h2><p>${K.mapa.lead || ''} Toca un nodo para ver su resumen.</p><div class="grafo-wrap"><div class="figura" id="grafo"></div></div></section>` : ''}
      <div class="cols"><div class="prose">
      <h2>Al terminar podrás</h2><ul>${li(K.objetivos)}</ul>
      <div class="note"><p><b>La analogía.</b> ${K.analogia}</p></div>
      ${K.retos ? `<h2 id="retos">Los retos del módulo</h2><p>${K.retosIntro || ''}</p><ol class="retos">${K.retos.map((r, i) => `<li><small>reto ${pad(i + 1)}</small><b>${r.t}</b><span>${r.d}</span></li>`).join('')}</ol>` : ''}
      ${K.conceptos ? `<h2 id="conceptos">Conceptos clave</h2><dl class="conceptos">${K.conceptos.map(c => `<div><dt>${c.t}</dt><dd>${c.d}</dd>${c.ej ? `<dd class="ej"><b>En un juego:</b> ${c.ej}</dd>` : ''}</div>`).join('')}</dl>` : ''}
      <h2 id="codigo">Código</h2><p>${K.codigoIntro || 'Primero la idea en pseudocódigo, después en Lua.'}</p>
      ${(K.codigo || []).map(c => `<h3>${c.titulo}</h3><p>${c.desc}</p>${codeBox(c.tabs)}`).join('')}
      ${K.practica ? `<h2 id="practica">Taller</h2><div class="practica"><h3>${K.practica.t}</h3><p>${K.practica.intro || ''}</p><ol>${li(K.practica.pasos)}</ol>${K.practica.entrega ? `<p><b>Queda como evidencia:</b> ${K.practica.entrega}</p>` : ''}</div>` : ''}
      ${K.errores ? `<h2 id="errores">Errores comunes</h2><div class="tblwrap"><table class="tbl mitos"><thead><tr><th>Lo que se suele creer</th><th>Lo que pasa en realidad</th></tr></thead><tbody>${K.errores.map(e => `<tr><td>${e.mito}</td><td>${e.real}</td></tr>`).join('')}</tbody></table></div>` : ''}
      <h2>Para la próxima</h2><ul>${li(K.tarea)}</ul>
      ${K.lecturas ? `<h2>Para profundizar</h2><ul>${li(K.lecturas)}</ul>` : ''}
      <div class="pager">${n > 0 ? `<a class="btn alt" href="sesion.html?s=${n - 1}">${icon('left')} ${nombreSesion(window.CURSO.sesiones[n - 1])}</a>` : '<span></span>'}${n < 8 ? `<a class="btn" href="sesion.html?s=${n + 1}">${nombreSesion(window.CURSO.sesiones[n + 1])} ${icon('right')}</a>` : ''}</div>
      </div><aside class="side">${K.agenda ? `<h3>${n ? 'Las 2 horas, minuto a minuto' : 'Cómo recorrerlo'}</h3><ol class="agenda">${K.agenda.map(a => `<li><b>${a[0]}</b><span>${a[1]}</span></li>`).join('')}</ol>` : ''}
      <div class="progreso"><h3>Tu avance</h3>${pre || post ? `<p>Preclase: <b>${pre ? pre.ok + '/' + pre.total : 'pendiente'}</b> · Postclase: <b>${post ? post.ok + '/' + post.total : 'pendiente'}</b></p>${ganancias(K, n)}` : `<p>Haz el quiz preclase antes de empezar y el postclase al terminar: aquí verás cuánto avanzaste en cada idea clave.</p>`}</div>
      ${s.entrega ? `<p style="margin:1rem 0 0"><span class="tag ${s.entregaTipo || ''}">${s.entrega}</span></p>` : ''}</aside></div>`;
    if (K.mapa && window.FIG && $('#grafo')) window.FIG.grafo($('#grafo'), { nodos: K.mapa.nodos.map(x => ({ id: x[0], t: x[1], s: x[2], tipo: x[3], d: x[4] })), cables: K.mapa.cables });
    document.querySelectorAll('[data-fig-pagina]').forEach(el => { const f = (window.DEMOS || {})[el.dataset.figPagina]; if (f) f(el); });
    $('#foot').outerHTML = foot();
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  /* ---------- QUIZ pre / post ---------- */
  async function quiz() {
    const n = Math.min(8, Math.max(0, +(param('s') || 0))), t = param('t') === 'post' ? 'post' : 'pre', s = window.CURSO.sesiones[n];
    await loadScript(`data/s${n}.js`);
    const K = window.SESION, el = $('#main');
    const titulo = `Quiz ${t === 'pre' ? 'preclase' : 'postclase'}`;
    document.title = `${titulo} · ${nombreSesion(s)} · Programación de Videojuegos`;
    $('#mast').innerHTML = topbar('') + `<div class="wrap pagehead"><h1><span class="fi">${pad(n)}</span>${titulo}</h1><p class="meta" style="margin:0 0 .6rem">${nombreSesion(s)} · ${esc(s.titulo)}</p><p class="q">${t === 'pre' ? 'Antes de la clase. No es nota: es tu punto de partida, y equivocarte aquí te prepara para aprender mejor.' : 'Después de la clase. Las mismas ideas clave, un poco más de aplicación. Al final ves cuánto avanzaste.'}</p></div>`;
    $('#foot').outerHTML = foot();
    const Q = K && K[t];
    if (!Q || !Q.length) { el.innerHTML = '<div class="quiz"><p class="note warn">Este quiz todavía no está publicado.</p></div>'; return; }
    const res = [];
    let i = 0;
    const bar = () => `<div class="bar" aria-hidden="true">${Q.map((_, j) => `<i class="${j < res.length ? (res[j].ok ? 'ok' : 'no') : j === i ? 'cur' : ''}"></i>`).join('')}</div>`;
    function intro() {
      const prev = resultado(n, t);
      el.innerHTML = `<div class="quiz"><div class="intro-quiz"><h2 style="margin-top:0">${Q.length} preguntas · unos ${Math.ceil(Q.length * .8)} minutos</h2><ul><li>Cada respuesta trae su explicación de inmediato.</li><li>Las preguntas miden ${K.ideas ? K.ideas.length : 5} ideas clave de ${n ? 'la sesión' : 'el módulo'}.</li><li>Tu resultado se guarda solo en este navegador.</li></ul>${prev ? `<p>Tu intento anterior: <b>${prev.ok}/${prev.total}</b>.</p>` : ''}<button class="btn go" id="go">Empezar ${icon('right')}</button></div></div>`;
      $('#go').onclick = ask; $('#go').focus();
    }
    function ask() {
      const q = Q[i];
      el.innerHTML = `<div class="quiz">${bar()}<h2>${q.q}</h2><p class="count">Pregunta ${i + 1} de ${Q.length}${q.idea && K.ideas ? ' · ' + q.idea : ''}</p>${q.code ? codeBox([q.code], { cap: q.code.lang === 'Pseudo' ? 'Pseudocódigo' : q.code.lang }) : ''}${checkHTML({ q: '', opts: q.opts, ok: q.ok, why: q.why })}<div class="next"><button class="btn" id="nx" disabled>${i === Q.length - 1 ? 'Ver resultado' : 'Siguiente'} ${icon('right')}</button></div></div>`;
      $('.check .q', el).remove();
      wireCheck($('.check', el), q, (ok, pick) => { res.push({ ok, pick, idea: q.idea }); $('.bar', el).outerHTML = bar(); const b = $('#nx'); b.disabled = false; b.focus(); });
      $('#nx').onclick = () => { i++; i < Q.length ? ask() : end(); };
    }
    function end() {
      const ok = res.filter(r => r.ok).length, prev = resultado(n, t), ideas = {};
      res.forEach(r => { if (!r.idea) return; ideas[r.idea] = ideas[r.idea] || [0, 0]; ideas[r.idea][1]++; if (r.ok) ideas[r.idea][0]++; });
      store.set(`quiz.${n}.${t}`, { ok, total: Q.length, ideas });
      const pct = ok / Q.length;
      const msg = t === 'pre'
        ? (pct >= .8 ? 'Llegas con buena base. En clase ve por los detalles y los retos.' : 'Perfecto: ya sabes en qué fijarte durante la clase. Las explicaciones están abajo.')
        : (pct === 1 ? 'Jugada perfecta.' : pct >= .7 ? 'Vas bien. Repasa las que fallaste antes de seguir.' : 'Vuelve a las slides de las ideas que fallaste y reintenta.');
      const fallos = Q.map((q, j) => ({ q, j })).filter(x => !res[x.j].ok);
      const otro = t === 'pre' ? `<a class="btn go" href="slides.html?s=${n}">Ir a las slides ${icon('right')}</a>` : `<a class="btn go" href="${n < 8 ? 'sesion.html?s=' + (n + 1) : 'index.html'}">${n < 8 ? 'Siguiente: ' + nombreSesion(window.CURSO.sesiones[n + 1]) : 'Volver al curso'} ${icon('right')}</a>`;
      el.innerHTML = `<div class="quiz"><div class="score"><div class="big">${ok}/${Q.length}</div><p class="msg">${msg}${prev ? ` Tu intento anterior: ${prev.ok}/${prev.total}.` : ''}</p><div class="doctools"><button class="btn alt" id="again">Reintentar</button><a class="btn alt" href="sesion.html?s=${n}">Volver a ${nombreSesion(s).toLowerCase()}</a>${otro}</div>
        ${K.ideas ? `<div class="ideas"><h3>Ideas clave · preclase → postclase</h3>${ganancias(K, n)}</div>` : ''}</div>
        ${fallos.length ? `<div class="review"><h2>Para repasar</h2><ol>${fallos.map(x => `<li value="${x.j + 1}"><b>${x.q.q}</b><br>Correcta: ${L[x.q.ok]}. ${x.q.opts[x.q.ok]}<br><span style="color:var(--ink-2)">${x.q.why}</span></li>`).join('')}</ol></div>` : ''}</div>`;
      $('#again').onclick = () => { res.length = 0; i = 0; ask(); };
    }
    intro();
  }

  window.PVJ = { codeBox, highlight, icon, store, esc, $, param, loadScript, checkHTML, wireCheck, pad };
  window.DEMOS = window.DEMOS || {};
  document.addEventListener('DOMContentLoaded', () => {
    const p = document.body.dataset.page;
    if (p === 'deck') return window.DECK(window.PVJ);
    ({ hub, sesion, quiz }[p] || (() => {}))();
  });
})();
