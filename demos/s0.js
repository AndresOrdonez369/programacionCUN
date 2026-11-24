/* Figuras del Módulo 0. Contrato: window.DEMOS.nombre = function (el) { ...; return detener; } */
window.DEMOS = window.DEMOS || {};

/* 1 · El robot literal: armar una receta con avanzar / girar / repetir y ejecutarla paso a paso */
window.DEMOS.robot = function (el) {
  const C = FIG.C, COLS = 7, FILAS = 5, T = 76, X0 = 30, Y0 = 26;
  const NIVELES = [
    { ini: [0, 4, 0], meta: [3, 4], muros: [], txt: 'Nivel 1: la moneda está en línea recta.' },
    { ini: [0, 4, 0], meta: [3, 1], muros: [[1, 3], [2, 3], [3, 3]], txt: 'Nivel 2: hay que girar. Arriba es girar a la izquierda.' },
    { ini: [0, 4, 0], meta: [6, 0], muros: [[1, 3], [3, 1], [5, 3], [2, 1], [4, 3]], txt: 'Nivel 3: escalera. Busca el patrón y usa «repetir».' }
  ];
  const DIR = [[1, 0], [0, -1], [-1, 0], [0, 1]]; // derecha, arriba, izquierda, abajo
  const f = FIG.lienzo(el, X0 * 2 + COLS * T + 300, Y0 * 2 + FILAS * T);
  const capaGrid = f.nodo('g', {}), capaObj = f.nodo('g', {});
  const robot = f.nodo('g', {});
  f.nodo('rect', { x: -26, y: -26, width: 52, height: 52, fill: C.teal, stroke: C.ink, 'stroke-width': 3 }, robot);
  f.nodo('rect', { x: -14, y: -12, width: 8, height: 8, fill: C.ink }, robot);
  f.nodo('rect', { x: 6, y: -12, width: 8, height: 8, fill: C.ink }, robot);
  const ojo = f.nodo('rect', { x: 26, y: -6, width: 12, height: 12, fill: C.amber }, robot);
  /* panel con la receta escrita como pseudocódigo */
  const PX = X0 + COLS * T + 30;
  f.nodo('rect', { x: PX, y: Y0, width: 260, height: FILAS * T, fill: '#14132A', stroke: C.edge, 'stroke-width': 2 });
  const tit = f.texto(PX + 16, Y0 + 24, 'tu receta', { tam: 18, ancla: 'start', color: C.amber });
  tit.t.setAttribute('font-family', 'Silkscreen, monospace');
  const lineas = Array.from({ length: 11 }, (_, i) => { const t = f.texto(PX + 16, Y0 + 58 + i * 30, '', { tam: 19, ancla: 'start', color: C.text, peso: 600 }); t.t.setAttribute('font-family', 'JetBrains Mono, monospace'); return t; });
  let nivel = 0, prog = [], pos, timer = null;
  const di = FIG.dice(el);
  function dibujaNivel() {
    capaGrid.innerHTML = ''; capaObj.innerHTML = '';
    const N = NIVELES[nivel];
    for (let c = 0; c < COLS; c++) for (let r = 0; r < FILAS; r++) {
      const muro = N.muros.some(m => m[0] === c && m[1] === r);
      f.nodo('rect', { x: X0 + c * T + 2, y: Y0 + r * T + 2, width: T - 4, height: T - 4, fill: muro ? '#4A4878' : '#201F3A', stroke: muro ? '#6E6B85' : '#2E2C4E', 'stroke-width': 2 }, capaGrid);
      if (muro) f.nodo('path', { d: `M${X0 + c * T + 12} ${Y0 + r * T + 26}h${T - 24}M${X0 + c * T + 12} ${Y0 + r * T + 50}h${T - 24}`, stroke: '#6E6B85', 'stroke-width': 3 }, capaGrid);
    }
    const [mc, mr] = N.meta, cx = X0 + mc * T + T / 2, cy = Y0 + mr * T + T / 2;
    f.nodo('rect', { x: cx - 16, y: cy - 20, width: 32, height: 40, fill: C.amber, stroke: C.ink, 'stroke-width': 3 }, capaObj);
    f.nodo('rect', { x: cx - 4, y: cy - 10, width: 8, height: 20, fill: C.ink, opacity: .35 }, capaObj);
    reiniciar();
  }
  function ponRobot(p) {
    const [c, r, d] = p;
    robot.setAttribute('transform', `translate(${X0 + c * T + T / 2} ${Y0 + r * T + T / 2}) rotate(${-d * 90})`);
  }
  function reiniciar() { if (timer) { clearTimeout(timer); timer = null; } pos = NIVELES[nivel].ini.slice(); ponRobot(pos); pinta(-1); }
  /* el patrón empaquetado (par) se expande en sus dos operaciones */
  function expandir() { const out = []; prog.forEach(p => { for (let k = 0; k < p.n; k++) { if (p.par) p.par.forEach(op => out.push({ op, de: p })); else out.push({ op: p.op, de: p }); } }); return out; }
  function pinta(activa) {
    lineas.forEach((l, i) => {
      const p = prog[i];
      if (i === 10 && prog.length > 10) { l.pon('…'); return; }
      l.pon(p ? (p.n > 1 ? `repetir ${p.n}: ${p.op}` : p.op) : '');
      l.color(p && p === activa ? C.amber : C.text);
    });
    if (!prog.length) lineas[0].pon('(vacía: usa los botones)').color(C.grey);
  }
  function agrega(op) { if (timer) return; if (prog.length >= 14) { di('La receta ya es muy larga. ¿Hay algo que se repita?', 'bad'); return; } prog.push({ op, n: 1 }); reiniciar(); di(`${prog.length} instrucción${prog.length > 1 ? 'es' : ''}. Pulsa Ejecutar cuando creas que llega.`); }
  function ejecutar() {
    reiniciar();
    const pasos = expandir(); let i = 0;
    if (!pasos.length) { di('La receta está vacía: el robot no hace nada. Las máquinas no adivinan.', 'bad'); return; }
    const N = NIVELES[nivel];
    const paso = () => {
      if (i >= pasos.length) {
        const ok = pos[0] === N.meta[0] && pos[1] === N.meta[1];
        di(ok ? `¡Llegó! Usaste <b>${prog.length}</b> líneas para <b>${pasos.length}</b> pasos.${nivel === 2 && prog.length > 6 ? ' ¿Puedes escribirla más corta con «repetir»?' : ''}` : 'Terminó la receta, pero no está en la moneda. El robot hizo exactamente lo que le dijiste.', ok ? 'ok' : 'bad');
        timer = null; pinta(-1); return;
      }
      const s = pasos[i++]; pinta(s.de);
      if (s.op === 'girar izquierda') pos[2] = (pos[2] + 1) % 4;
      else if (s.op === 'girar derecha') pos[2] = (pos[2] + 3) % 4;
      else {
        const nc = pos[0] + DIR[pos[2]][0], nr = pos[1] + DIR[pos[2]][1];
        const fuera = nc < 0 || nr < 0 || nc >= COLS || nr >= FILAS, muro = N.muros.some(m => m[0] === nc && m[1] === nr);
        if (fuera || muro) { di(`Paso ${i}: <b>¡choque!</b> ${fuera ? 'Se sale del mapa' : 'Hay un muro'}. La receta pedía avanzar y el robot obedeció.`, 'bad'); timer = null; return; }
        pos[0] = nc; pos[1] = nr;
      }
      ponRobot(pos);
      timer = setTimeout(paso, FIG.quieto() ? 120 : 420);
    };
    paso();
  }
  const c = FIG.controles(el);
  c.opciones(['Nivel 1', 'Nivel 2', 'Nivel 3'], i => { nivel = i; prog = []; dibujaNivel(); di(NIVELES[i].txt); });
  c.boton('Avanzar', () => agrega('avanzar'), true);
  c.boton('Girar izq.', () => agrega('girar izquierda'), true);
  c.boton('Girar der.', () => agrega('girar derecha'), true);
  c.boton('Repetir ×2 lo último', () => {
    if (timer) return;
    if (prog.length < 2) { di('Necesitas al menos dos líneas: repetir toma las dos últimas como un patrón.', 'bad'); return; }
    const b = prog.pop(), a = prog.pop();
    if (a.n === 1 && b.n === 1) { prog.push({ op: `${a.op}, ${b.op}`.replace('avanzar, girar izquierda', 'avanzar + girar izq.').replace('girar izquierda, avanzar', 'girar izq. + avanzar'), n: 2, par: [a.op, b.op] }); }
    else { prog.push(a, b); di('Repetir funciona sobre dos líneas simples.', 'bad'); return; }
    reiniciar(); di('Patrón empaquetado: dos líneas que se repiten dos veces. Eso es un <b>ciclo</b>.');
  }, true);
  c.boton('Ejecutar', ejecutar);
  c.boton('Borrar', () => { prog = []; reiniciar(); di(NIVELES[nivel].txt); }, true);
  dibujaNivel(); di(NIVELES[0].txt);
  return () => { if (timer) clearTimeout(timer); };
};

/* 2 · Prueba de escritorio: avanzar línea por línea y ver cómo cambian las variables */
window.DEMOS.traza = function (el) {
  const C = FIG.C;
  const COD = ['puntos ← 0', 'monedas ← 3', 'mientras monedas > 0 hacer', '    puntos ← puntos + 10', '    monedas ← monedas - 1', 'fin', 'mostrar puntos'];
  /* cada paso: [línea activa (0-based), puntos, monedas, comentario] */
  const P = [[0, 0, '–', 'puntos empieza en 0.'], [1, 0, 3, 'Hay 3 monedas por recoger.']];
  let pu = 0, mo = 3;
  while (true) {
    P.push([2, pu, mo, `¿monedas > 0? ${mo} > 0 es <b>${mo > 0 ? 'verdadero' : 'falso'}</b>${mo > 0 ? ': entra al ciclo.' : ': sale del ciclo.'}`]);
    if (!(mo > 0)) break;
    pu += 10; P.push([3, pu, mo, `puntos pasa a valer ${pu - 10} + 10 = <b>${pu}</b>.`]);
    mo -= 1; P.push([4, pu, mo, `monedas pasa a valer ${mo + 1} − 1 = <b>${mo}</b>.`]);
    P.push([5, pu, mo, 'Fin del bloque: vuelve a revisar la condición.']);
  }
  P.push([6, pu, mo, `Muestra <b>${pu}</b>. ¿Acertaste tu predicción?`]);
  const f = FIG.lienzo(el, 1100, 380);
  f.nodo('rect', { x: 20, y: 20, width: 640, height: 340, fill: '#14132A', stroke: C.edge, 'stroke-width': 2 });
  const resalte = f.nodo('rect', { x: 22, y: 0, width: 636, height: 40, fill: C.amber, opacity: 0 });
  const tl = COD.map((l, i) => { const t = f.texto(50, 58 + i * 44, '', { tam: 23, ancla: 'start', color: C.text, peso: 500 }); t.t.setAttribute('font-family', 'JetBrains Mono, monospace'); t.t.style.whiteSpace = 'pre'; t.t.textContent = String(i + 1).padStart(2, ' ') + '  ' + l; return t; });
  const caja = (x, nombre) => {
    f.nodo('rect', { x, y: 70, width: 180, height: 40, fill: C.amber });
    f.texto(x + 90, 90, nombre, { tam: 22, color: C.ink, peso: 700 });
    f.nodo('rect', { x, y: 110, width: 180, height: 120, fill: '#262542', stroke: C.text, 'stroke-width': 3 });
    return f.texto(x + 90, 172, '', { tam: 52, color: C.text, peso: 700 });
  };
  const vPu = caja(700, 'puntos'), vMo = caja(900, 'monedas');
  const cuenta = f.texto(890, 290, '', { tam: 20, color: C.soft });
  cuenta.t.setAttribute('font-family', 'Silkscreen, monospace');
  let k = -1;
  const di = FIG.dice(el, 'Predice primero: ¿qué valor muestra la línea 7? Luego pulsa <b>Paso</b>.');
  function pinta() {
    if (k < 0) { resalte.setAttribute('opacity', 0); vPu.pon('?'); vMo.pon('?'); cuenta.pon('paso 0 de ' + P.length); tl.forEach(t => t.color(C.text)); return; }
    const [li, a, b, txt] = P[k];
    resalte.setAttribute('y', 58 + li * 44 - 21); resalte.setAttribute('opacity', 1);
    tl.forEach((t, i) => t.color(i === li ? C.ink : C.soft));
    vPu.pon(String(a)); vMo.pon(String(b));
    cuenta.pon(`paso ${k + 1} de ${P.length}`);
    di(txt, k === P.length - 1 ? 'ok' : '');
  }
  const c = FIG.controles(el);
  const bp = c.boton('Paso', () => { if (k < P.length - 1) { k++; pinta(); } });
  c.boton('Reiniciar', () => { k = -1; pinta(); di('Predice primero: ¿qué valor muestra la línea 7? Luego pulsa <b>Paso</b>.'); }, true);
  void bp; pinta();
};

/* 3 · Compuertas: la regla de salto con Y, O y NO */
window.DEMOS.compuertas = function (el) {
  const C = FIG.C;
  const REGLAS = [
    { t: 'enSuelo Y NO aturdido', f: v => v.s && !v.a },
    { t: 'enSuelo O dobleSalto', f: v => v.s || v.d },
    { t: '(enSuelo O dobleSalto) Y NO aturdido', f: v => (v.s || v.d) && !v.a }
  ];
  const v = { s: true, a: false, d: false };
  let regla = 0;
  const f = FIG.lienzo(el, 1100, 400);
  const iS = f.caja(40, 40, 220, 80, 'enSuelo', { tam: 24 }), iD = f.caja(40, 160, 220, 80, 'dobleSalto', { tam: 24 }), iA = f.caja(40, 280, 220, 80, 'aturdido', { tam: 24 });
  const gO = f.caja(380, 100, 130, 80, 'O', { tam: 30 }), gN = f.caja(380, 280, 130, 80, 'NO', { tam: 30 }), gY = f.caja(620, 190, 130, 80, 'Y', { tam: 30 });
  const out = f.caja(860, 180, 210, 100, 'salta', { tam: 30 });
  const W = {
    sO: f.flecha(iS, gO), dO: f.flecha(iD, gO), aN: f.flecha(iA, gN), OY: f.flecha(gO, gY), NY: f.flecha(gN, gY), YOut: f.flecha(gY, out),
    sY: f.flecha(iS, gY, { desvio: -40 }), OOut: f.flecha(gO, out, { desvio: -30 })
  };
  const di = FIG.dice(el);
  function pinta() {
    const R = REGLAS[regla], res = R.f(v);
    const ton = b => b ? 'on' : 'base', lin = b => b ? 'on' : 'base';
    iS.rotulo(`enSuelo: ${v.s ? 'V' : 'F'}`).tono(ton(v.s));
    iD.rotulo(`dobleSalto: ${v.d ? 'V' : 'F'}`).tono(ton(v.d));
    iA.rotulo(`aturdido: ${v.a ? 'V' : 'F'}`).tono(ton(v.a));
    Object.values(W).forEach(w => w.ver(false));
    [gO, gN, gY].forEach(g => g.ver(false));
    const o = v.s || v.d, n = !v.a;
    if (regla === 0) { gN.ver(true).tono(ton(n)); gY.ver(true).tono(ton(v.s && n)); W.aN.ver(true).tono(lin(v.a)); W.sY.ver(true).tono(lin(v.s)); W.NY.ver(true).tono(lin(n)); W.YOut.ver(true).tono(lin(res)); iD.tono('off'); }
    if (regla === 1) { gO.ver(true).tono(ton(o)); W.sO.ver(true).tono(lin(v.s)); W.dO.ver(true).tono(lin(v.d)); W.OOut.ver(true).tono(lin(res)); iA.tono('off'); }
    if (regla === 2) { gO.ver(true).tono(ton(o)); gN.ver(true).tono(ton(n)); gY.ver(true).tono(ton(res)); W.sO.ver(true).tono(lin(v.s)); W.dO.ver(true).tono(lin(v.d)); W.aN.ver(true).tono(lin(v.a)); W.OY.ver(true).tono(lin(o)); W.NY.ver(true).tono(lin(n)); W.YOut.ver(true).tono(lin(res)); }
    out.rotulo(res ? 'SALTA' : 'no salta').tono(res ? 'ok' : 'bad');
    let msg = `<code>${R.t}</code> = <b>${res ? 'verdadero' : 'falso'}</b>.`;
    if (regla === 1 && v.a && res) msg += ' Está aturdido y aun así salta: <b>bug de diseño</b>. Prueba la regla 3.';
    else if (regla === 0 && v.d && !v.s) msg += ' Tiene doble salto en el aire, pero esta regla no lo considera.';
    else if (regla === 2) msg += ' Esta regla cubre los dos casos: doble salto y aturdido.';
    di(msg, regla === 1 && v.a && res ? 'bad' : res ? 'ok' : '');
  }
  const c = FIG.controles(el);
  c.opciones(['Regla 1', 'Regla 2', 'Regla 3'], i => { regla = i; pinta(); });
  c.casilla('en el suelo', b => { v.s = b; pinta(); }, true);
  c.casilla('doble salto', b => { v.d = b; pinta(); }, false);
  c.casilla('aturdido', b => { v.a = b; pinta(); }, false);
  pinta();
};
