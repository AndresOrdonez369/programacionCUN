/* Figuras de la sesión 6 · Figuras y colisiones: circulos, aabb, clamp y broadNarrow.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Arrastrar: pointer events sobre el SVG; las coordenadas se pasan al lienzo con getScreenCTM().inverse(). */
window.DEMOS = window.DEMOS || {};
(function () {
  const C = FIG.C;
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const r0 = v => Math.round(v);

  /* pasa un evento del puntero a coordenadas del lienzo, aunque la slide esté escalada */
  function puntoSVG(svg, e) {
    const m = svg.getScreenCTM(); if (!m) return [0, 0];
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(m.inverse()); return [q.x, q.y];
  }
  /* hace arrastrable un elemento: fn('ini'|'mov', x, y) */
  function arrastrar(svg, elem, fn) {
    elem.style.cursor = 'grab'; elem.style.touchAction = 'none';
    elem.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      try { elem.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      const p = puntoSVG(svg, e); fn('ini', p[0], p[1]); elem.style.cursor = 'grabbing';
      const mv = ev => { const q = puntoSVG(svg, ev); fn('mov', q[0], q[1]); };
      const up = () => { elem.style.cursor = 'grab'; elem.removeEventListener('pointermove', mv); elem.removeEventListener('pointerup', up); elem.removeEventListener('pointercancel', up); };
      elem.addEventListener('pointermove', mv); elem.addEventListener('pointerup', up); elem.addEventListener('pointercancel', up);
    });
  }
  const pon = (e, at) => { for (const k in at) e.setAttribute(k, at[k]); return e; };
  /* los textos y marcas no deben robar el arrastre a las figuras de abajo */
  function sinPuntero(f, extra) { f.svg.style.userSelect = 'none'; f.svg.querySelectorAll('text').forEach(t => { t.style.pointerEvents = 'none'; }); (extra || []).forEach(e => { e.style.pointerEvents = 'none'; }); }

  /* 1 · circulos: distancia entre centros contra suma de radios, sin raíz cuadrada */
  window.DEMOS.circulos = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Dos círculos que puedes arrastrar. Se muestra la distancia al cuadrado entre centros y la suma de radios al cuadrado.');
    const A = { x: 290, y: 250, r: 90 }, B = { x: 640, y: 210, r: 60 };
    const catX = f.linea(0, 0, 0, 0, { tono: 'grey', grosor: 2, puntos: true });
    const catY = f.linea(0, 0, 0, 0, { tono: 'grey', grosor: 2, puntos: true });
    const hip = f.linea(0, 0, 0, 0, { tono: 'white', grosor: 3 });
    const cA = f.nodo('circle', { 'fill-opacity': .22, 'stroke-width': 3 });
    const cB = f.nodo('circle', { 'fill-opacity': .22, 'stroke-width': 3 });
    const pA = f.nodo('circle', { r: 6, fill: C.white }), pB = f.nodo('circle', { r: 6, fill: C.white });
    const tA = f.texto(0, 0, 'A', { tam: 26, tono: 'white', peso: 800 }), tB = f.texto(0, 0, 'B', { tam: 26, tono: 'white', peso: 800 });
    const tdx = f.texto(0, 0, '', { tam: 20 }), tdy = f.texto(0, 0, '', { tam: 20 });
    const t1 = f.texto(24, 30, '', { ancla: 'start', tam: 22, tono: 'white', peso: 700 });
    const t2 = f.texto(24, 62, '', { ancla: 'start', tam: 22, tono: 'white', peso: 700 });
    const t3 = f.texto(24, 94, '', { ancla: 'start', tam: 22, tono: 'amber', peso: 700 });
    f.texto(876, 440, 'arrastra los círculos', { ancla: 'end', tam: 20 });
    const di = FIG.dice(el);
    let raiz = false;
    function pinta() {
      const dx = B.x - A.x, dy = B.y - A.y, d2 = r0(dx * dx + dy * dy), s = A.r + B.r, s2 = s * s, choca = d2 <= s2;
      const ca = choca ? C.amber : C.coral, cb = choca ? C.amber : C.teal;
      pon(cA, { cx: A.x, cy: A.y, r: A.r, fill: ca, stroke: ca }); pon(cB, { cx: B.x, cy: B.y, r: B.r, fill: cb, stroke: cb });
      pon(pA, { cx: A.x, cy: A.y }); pon(pB, { cx: B.x, cy: B.y });
      pon(catX, { x1: A.x, y1: A.y, x2: B.x, y2: A.y }); pon(catY, { x1: B.x, y1: A.y, x2: B.x, y2: B.y });
      pon(hip, { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: choca ? C.amber : C.white });
      pon(tA.t, { x: A.x, y: A.y - 26 }); pon(tB.t, { x: B.x, y: B.y - 26 });
      tdx.pon('dx = ' + r0(dx)); pon(tdx.t, { x: (A.x + B.x) / 2, y: A.y + (dy > 0 ? -16 : 18) });
      tdy.pon('dy = ' + r0(dy)); pon(tdy.t, { x: B.x + (dx > 0 ? 50 : -50), y: (A.y + B.y) / 2 });
      t1.pon('distancia² = dx² + dy² = ' + d2);
      t2.pon('(rA + rB)² = ' + s + '² = ' + s2);
      t3.pon(raiz ? 'con raíz: distancia = ' + Math.sqrt(d2).toFixed(1) + '  vs  suma = ' + s : '');
      const falta = Math.sqrt(d2) - s;
      if (choca) di('<b>Chocan:</b> ' + d2 + ' ≤ ' + s2 + '. Comparamos los dos números al cuadrado y nunca hizo falta la raíz.', 'ok');
      else di('<b>No chocan:</b> ' + d2 + ' > ' + s2 + '. Les faltan unos ' + r0(falta) + ' px para tocarse. Acércalos o sube un radio.', '');
    }
    [[cA, A], [cB, B]].forEach(([elem, o]) => {
      let off = [0, 0];
      arrastrar(f.svg, elem, (fase, x, y) => {
        if (fase === 'ini') off = [o.x - x, o.y - y];
        o.x = lim(x + off[0], 20, 880); o.y = lim(y + off[1], 20, 440); pinta();
      });
    });
    const c = FIG.controles(el);
    c.deslizador('Radio A', 20, 150, A.r, 1, v => { A.r = v; pinta(); });
    c.deslizador('Radio B', 20, 150, B.r, 1, v => { B.r = v; pinta(); });
    c.casilla('Mostrar la raíz', v => { raiz = v; pinta(); });
    sinPuntero(f, [pA, pB, hip, catX, catY]);
    c.boton('Se rozan', () => { A.x = 300; A.y = 250; B.x = 300 + (A.r + B.r) * .8; B.y = 250 + (A.r + B.r) * .6; pinta(); }, true);
    pinta();
    return () => {};
  };

  /* 2 · aabb: proyecciones en X y en Y; chocan solo si se solapan en los dos ejes */
  window.DEMOS.aabb = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Dos rectángulos que puedes arrastrar, con su sombra sobre el eje X abajo y sobre el eje Y a la izquierda.');
    const A = { x: 220, y: 90, w: 230, h: 120 }, B = { x: 400, y: 170, w: 200, h: 150 };
    const EJX = 412, EJY = 64;     // franjas de los ejes
    f.linea(110, EJX + 9, 890, EJX + 9, { tono: 'grey', grosor: 2 });
    f.linea(EJY + 9, 10, EJY + 9, 390, { tono: 'grey', grosor: 2 });
    f.texto(888, 446, 'eje X', { ancla: 'end', tam: 18 });
    f.texto(26, 22, 'eje Y', { ancla: 'start', tam: 18 });
    const guias = [0, 1, 2, 3, 4, 5, 6, 7].map(() => f.linea(0, 0, 0, 0, { color: 'rgba(255,255,255,.14)', grosor: 2, puntos: true }));
    const rA = f.nodo('rect', { fill: C.coral, 'fill-opacity': .25, stroke: C.coral, 'stroke-width': 3 });
    const rB = f.nodo('rect', { fill: C.teal, 'fill-opacity': .25, stroke: C.teal, 'stroke-width': 3 });
    const rI = f.nodo('rect', { fill: C.amber, 'fill-opacity': .55, stroke: 'none' });
    const tA = f.texto(0, 0, 'A', { tam: 24, tono: 'white', peso: 800 }), tB = f.texto(0, 0, 'B', { tam: 24, tono: 'white', peso: 800 });
    const sxA = f.linea(0, 0, 0, 0, { tono: 'coral', grosor: 8 }), sxB = f.linea(0, 0, 0, 0, { tono: 'teal', grosor: 8 });
    const syA = f.linea(0, 0, 0, 0, { tono: 'coral', grosor: 8 }), syB = f.linea(0, 0, 0, 0, { tono: 'teal', grosor: 8 });
    const sxI = f.nodo('rect', { fill: C.amber }), syI = f.nodo('rect', { fill: C.amber });
    const txX = f.texto(120, 446, '', { ancla: 'start', tam: 20, tono: 'white', peso: 700 });
    const txY = f.texto(100, 398, '', { ancla: 'start', tam: 20, tono: 'white', peso: 700 });
    const esq = [0, 1, 2, 3, 4, 5, 6, 7].map(() => f.nodo('rect', { width: 14, height: 14 }));
    const txE = f.texto(876, 26, '', { ancla: 'end', tam: 20, tono: 'amber', peso: 700 });
    const di = FIG.dice(el);
    let verEsq = false;
    const dentro = (px, py, R) => px > R.x && px < R.x + R.w && py > R.y && py < R.y + R.h;
    function pinta() {
      pon(rA, { x: A.x, y: A.y, width: A.w, height: A.h }); pon(rB, { x: B.x, y: B.y, width: B.w, height: B.h });
      pon(tA.t, { x: A.x + 18, y: A.y + 20 }); pon(tB.t, { x: B.x + B.w - 18, y: B.y + B.h - 20 });
      const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
      const enX = ox > 0, enY = oy > 0, choca = enX && enY;
      pon(sxA, { x1: A.x, y1: EJX, x2: A.x + A.w, y2: EJX }); pon(sxB, { x1: B.x, y1: EJX + 18, x2: B.x + B.w, y2: EJX + 18 });
      pon(syA, { x1: EJY, y1: A.y, x2: EJY, y2: A.y + A.h }); pon(syB, { x1: EJY + 18, y1: B.y, x2: EJY + 18, y2: B.y + B.h });
      pon(sxI, { x: Math.max(A.x, B.x), y: EJX - 6, width: Math.max(0, ox), height: 30, 'fill-opacity': enX ? .55 : 0 });
      pon(syI, { x: EJY - 6, y: Math.max(A.y, B.y), width: 30, height: Math.max(0, oy), 'fill-opacity': enY ? .55 : 0 });
      pon(rI, { x: Math.max(A.x, B.x), y: Math.max(A.y, B.y), width: Math.max(0, ox), height: Math.max(0, oy), 'fill-opacity': choca ? .55 : 0 });
      const gx = [A.x, A.x + A.w, B.x, B.x + B.w], gy = [A.y, A.y + A.h, B.y, B.y + B.h];
      gx.forEach((x, i) => pon(guias[i], { x1: x, y1: i < 2 ? A.y + A.h : B.y + B.h, x2: x, y2: EJX + (i < 2 ? 0 : 18) }));
      gy.forEach((y, i) => pon(guias[4 + i], { x1: i < 2 ? A.x : B.x, y1: y, x2: EJY + (i < 2 ? 0 : 18), y2: y }));
      txX.pon('X: ' + (enX ? 'se solapan ' + r0(ox) + ' px' : 'no se solapan')).color(enX ? 'amber' : 'soft');
      txY.pon('Y: ' + (enY ? 'se solapan ' + r0(oy) + ' px' : 'no se solapan')).color(enY ? 'amber' : 'soft');
      /* prueba de las esquinas: la idea intuitiva que falla con la cruz */
      const ptsA = [[A.x, A.y], [A.x + A.w, A.y], [A.x, A.y + A.h], [A.x + A.w, A.y + A.h]], ptsB = [[B.x, B.y], [B.x + B.w, B.y], [B.x, B.y + B.h], [B.x + B.w, B.y + B.h]];
      let k = 0;
      ptsA.concat(ptsB).forEach((p, i) => { const adentro = i < 4 ? dentro(p[0], p[1], B) : dentro(p[0], p[1], A); if (adentro) k++; pon(esq[i], { x: p[0] - 7, y: p[1] - 7, fill: adentro ? C.amber : C.grey, display: verEsq ? '' : 'none' }); });
      txE.pon(verEsq ? 'esquinas adentro de la otra: ' + k : '');
      if (verEsq && choca && k === 0) di('<b>La prueba de las esquinas falla:</b> ninguna esquina está adentro, pero los rectángulos sí se cruzan. La prueba por ejes no se equivoca.', 'bad');
      else if (choca) di('<b>Chocan:</b> se solapan en X <b>y</b> en Y a la vez. La zona ámbar es el solape.', 'ok');
      else if (enX || enY) di('Se solapan en ' + (enX ? 'X' : 'Y') + ', pero no en ' + (enX ? 'Y' : 'X') + '. Con un solo eje no basta: <b>no chocan</b>.', '');
      else di('No se solapan en ningún eje: <b>no chocan</b>. Arrastra uno sobre el otro.', '');
    }
    [[rA, A], [rB, B]].forEach(([elem, o]) => {
      let off = [0, 0];
      arrastrar(f.svg, elem, (fase, x, y) => {
        if (fase === 'ini') off = [o.x - x, o.y - y];
        o.x = lim(x + off[0], 110, 890 - o.w); o.y = lim(y + off[1], 10, 390 - o.h); pinta();
      });
    });
    const PRE = [
      [{ x: 150, y: 60, w: 200, h: 110 }, { x: 560, y: 220, w: 220, h: 130 }],
      [{ x: 200, y: 40, w: 260, h: 110 }, { x: 380, y: 240, w: 240, h: 120 }],
      [{ x: 220, y: 90, w: 230, h: 120 }, { x: 400, y: 170, w: 200, h: 150 }],
      [{ x: 200, y: 170, w: 460, h: 70 }, { x: 390, y: 40, w: 80, h: 320 }]
    ];
    const c = FIG.controles(el);
    sinPuntero(f, [rI].concat(esq));
    c.opciones(['Separados', 'Solo en X', 'Chocan', 'La cruz'], i => { Object.assign(A, PRE[i][0]); Object.assign(B, PRE[i][1]); pinta(); }, 2);
    c.casilla('Probar con las esquinas', v => { verEsq = v; pinta(); });
    pinta();
    return () => {};
  };

  /* 3 · clamp: el punto del rectángulo más cercano al centro del círculo */
  window.DEMOS.clamp = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Un círculo que puedes arrastrar alrededor de un rectángulo. Se marca el punto del rectángulo más cercano a su centro.');
    const R = { x: 340, y: 150, w: 260, h: 160 }, Ci = { x: 210, y: 110, r: 60 };
    f.nodo('rect', { x: R.x, y: R.y, width: R.w, height: R.h, fill: C.teal, 'fill-opacity': .2, stroke: C.teal, 'stroke-width': 3 });
    f.texto(R.x + R.w / 2, R.y + R.h / 2, 'muro', { tam: 24, tono: 'white', peso: 800 });
    const gx = f.linea(0, 0, 0, 0, { tono: 'grey', grosor: 2, puntos: true }), gy = f.linea(0, 0, 0, 0, { tono: 'grey', grosor: 2, puntos: true });
    const seg = f.linea(0, 0, 0, 0, { tono: 'white', grosor: 3 });
    const caja = f.nodo('rect', { fill: 'none', stroke: C.violet, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
    const circ = f.nodo('circle', { 'fill-opacity': .22, 'stroke-width': 3 });
    const cen = f.nodo('circle', { r: 6, fill: C.white });
    const P = f.nodo('rect', { width: 16, height: 16, fill: C.amber });
    const tP = f.texto(0, 0, 'P', { tam: 22, tono: 'amber', peso: 800 });
    const t1 = f.texto(24, 392, '', { ancla: 'start', tam: 20, tono: 'white', peso: 700 });
    const t2 = f.texto(24, 420, '', { ancla: 'start', tam: 20, tono: 'white', peso: 700 });
    const t3 = f.texto(24, 448, '', { ancla: 'start', tam: 20, tono: 'amber', peso: 700 });
    f.texto(876, 30, 'arrastra el círculo', { ancla: 'end', tam: 20 });
    const di = FIG.dice(el);
    let verCaja = false;
    function pinta() {
      const px = lim(Ci.x, R.x, R.x + R.w), py = lim(Ci.y, R.y, R.y + R.h);
      const dx = Ci.x - px, dy = Ci.y - py, d2 = r0(dx * dx + dy * dy), r2 = Ci.r * Ci.r, choca = d2 <= r2;
      const cajaChoca = Ci.x - Ci.r < R.x + R.w && Ci.x + Ci.r > R.x && Ci.y - Ci.r < R.y + R.h && Ci.y + Ci.r > R.y;
      const col = choca ? C.amber : C.coral;
      pon(circ, { cx: Ci.x, cy: Ci.y, r: Ci.r, fill: col, stroke: col }); pon(cen, { cx: Ci.x, cy: Ci.y });
      pon(P, { x: px - 8, y: py - 8 }); pon(tP.t, { x: px + (Ci.x < px ? 20 : -20), y: py + (Ci.y < py ? 22 : -22) });
      pon(seg, { x1: Ci.x, y1: Ci.y, x2: px, y2: py, stroke: choca ? C.amber : C.white });
      pon(gx, { x1: Ci.x, y1: Ci.y, x2: Ci.x, y2: py }); pon(gy, { x1: Ci.x, y1: Ci.y, x2: px, y2: Ci.y });
      pon(caja, { x: Ci.x - Ci.r, y: Ci.y - Ci.r, width: Ci.r * 2, height: Ci.r * 2, display: verCaja ? '' : 'none' });
      t1.pon('px = limitar(' + r0(Ci.x) + ', ' + R.x + ', ' + (R.x + R.w) + ') = ' + r0(px) + '     py = limitar(' + r0(Ci.y) + ', ' + R.y + ', ' + (R.y + R.h) + ') = ' + r0(py));
      t2.pon('distancia² del centro a P = ' + d2 + (choca ? '  ≤  ' : '  >  ') + 'r² = ' + r2);
      t3.pon(verCaja ? 'caja del círculo contra el muro (AABB): ' + (cajaChoca ? 'chocan' : 'no chocan') : '');
      const adentro = px === Ci.x && py === Ci.y;
      if (verCaja && cajaChoca && !choca) di('<b>Falso positivo:</b> la caja del círculo toca el muro, pero el círculo no. Pasa siempre cerca de las esquinas. Por eso se usa el punto más cercano.', 'bad');
      else if (adentro) di('El centro está dentro del muro: limitar no cambia nada y P es el propio centro. Distancia cero: <b>chocan</b>.', 'ok');
      else if (choca) di('<b>Chocan:</b> P, el punto del muro más cercano al centro, cae dentro del círculo.', 'ok');
      else di('<b>No chocan:</b> hasta el punto más cercano del muro queda fuera del círculo. Mira cómo P se desliza por el borde.', '');
    }
    let off = [0, 0];
    arrastrar(f.svg, circ, (fase, x, y) => {
      if (fase === 'ini') off = [Ci.x - x, Ci.y - y];
      Ci.x = lim(x + off[0], 10, 890); Ci.y = lim(y + off[1], 10, 370); pinta();
    });
    const c = FIG.controles(el);
    sinPuntero(f, [cen, P, seg, gx, gy, caja]);
    c.deslizador('Radio', 20, 120, Ci.r, 1, v => { Ci.r = v; pinta(); });
    c.casilla('Comparar con la caja del círculo', v => { verCaja = v; pinta(); });
    c.boton('Esquina tramposa', () => { const k = Ci.r * .78; Ci.x = R.x - k; Ci.y = R.y - k; pinta(); }, true);
    pinta();
    return () => {};
  };

  /* 4 · broadNarrow: cuántas pruebas hace el juego con muchos objetos */
  window.DEMOS.broadNarrow = function (el) {
    const W = 900, H = 470, TOP = 56, CEL = 100;
    const f = FIG.lienzo(el, W, H);
    f.svg.setAttribute('aria-label', 'Muchos rectángulos que se mueven. Se cuentan las pruebas de colisión por frame según la estrategia.');
    f.nodo('rect', { x: 0, y: TOP, width: W, height: H - TOP, fill: 'rgba(255,255,255,.03)', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2 });
    const rej = f.nodo('g', {});
    for (let x = CEL; x < W; x += CEL) f.nodo('line', { x1: x, y1: TOP, x2: x, y2: H, stroke: C.violet, 'stroke-opacity': .45, 'stroke-width': 2 }, rej);
    for (let y = TOP + CEL; y < H; y += CEL) f.nodo('line', { x1: 0, y1: y, x2: W, y2: y, stroke: C.violet, 'stroke-opacity': .45, 'stroke-width': 2 }, rej);
    const capa = f.nodo('g', {});
    const tV = f.texto(16, 26, '', { ancla: 'start', tam: 21, tono: 'soft', peso: 700 });
    const tE = f.texto(330, 26, '', { ancla: 'start', tam: 21, tono: 'amber', peso: 700 });
    const tC = f.texto(884, 26, '', { ancla: 'end', tam: 21, tono: 'coral', peso: 700 });
    const di = FIG.dice(el);
    let objs = [], modo = 0, verRej = false, n = 40, corriendo = !quieto(), raf = 0, ult = 0;
    function crear(k) {
      const w = 14 + Math.random() * 30, h = 10 + Math.random() * 24, a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
      return { x: Math.random() * (W - w), y: TOP + Math.random() * (H - TOP - h), w, h, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        e: f.nodo('rect', { width: w, height: h, 'stroke-width': 2 }, capa), id: k };
    }
    function ajustar() {
      while (objs.length < n) objs.push(crear(objs.length));
      while (objs.length > n) { const o = objs.pop(); o.e.remove(); }
    }
    const aabb = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const envolvente = (a, b) => { const dx = (a.x + a.w / 2) - (b.x + b.w / 2), dy = (a.y + a.h / 2) - (b.y + b.h / 2), ra = Math.hypot(a.w, a.h) / 2, rb = Math.hypot(b.w, b.h) / 2; return dx * dx + dy * dy <= (ra + rb) * (ra + rb); };
    function paso(dt) {
      objs.forEach(o => {
        o.x += o.vx * dt; o.y += o.vy * dt;
        if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx); } if (o.x + o.w > W) { o.x = W - o.w; o.vx = -Math.abs(o.vx); }
        if (o.y < TOP) { o.y = TOP; o.vy = Math.abs(o.vy); } if (o.y + o.h > H) { o.y = H - o.h; o.vy = -Math.abs(o.vy); }
      });
      const cand = new Set(), choque = new Set();
      let vistazos = 0, exactas = 0, choques = 0;
      const exacta = (a, b) => { exactas++; cand.add(a.id); cand.add(b.id); if (aabb(a, b)) { choques++; choque.add(a.id); choque.add(b.id); } };
      if (modo === 0) { for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) exacta(objs[i], objs[j]); }
      else if (modo === 1) { for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) { vistazos++; if (envolvente(objs[i], objs[j])) exacta(objs[i], objs[j]); } }
      else {
        /* rejilla: cada objeto se anota en las celdas que toca; solo se comparan vecinos de celda */
        const celdas = new Map();
        objs.forEach((o, i) => { for (let cx = Math.floor(o.x / CEL); cx <= Math.floor((o.x + o.w) / CEL); cx++) for (let cy = Math.floor((o.y - TOP) / CEL); cy <= Math.floor((o.y + o.h - TOP) / CEL); cy++) { const k = cx + ',' + cy; if (!celdas.has(k)) celdas.set(k, []); celdas.get(k).push(i); } });
        const vistos = new Set();
        celdas.forEach(l => { vistazos += l.length; for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) { const i = Math.min(l[a], l[b]), j = Math.max(l[a], l[b]), k = i * 1000 + j; if (!vistos.has(k)) { vistos.add(k); exacta(objs[i], objs[j]); } } });
      }
      objs.forEach(o => {
        const ch = choque.has(o.id), ca = cand.has(o.id) && modo > 0;
        pon(o.e, { x: o.x, y: o.y, fill: ch ? C.coral : C.slate, 'fill-opacity': ch ? .9 : .35, stroke: ch ? C.coral : ca ? C.amber : C.slate });
      });
      const todos = n * (n - 1) / 2;
      tV.pon(modo === 0 ? 'vistazos: 0' : modo === 1 ? 'vistazos (círculo): ' + vistazos : 'anotaciones en celdas: ' + vistazos);
      tE.pon('pruebas exactas: ' + exactas);
      tC.pon('choques: ' + choques);
      if (modo === 0) di('Todos contra todos: con ' + n + ' objetos son n × (n − 1) / 2 = <b>' + todos + ' pruebas exactas</b> en cada frame, y casi todas dicen «no».', n > 60 ? 'bad' : '');
      else if (modo === 1) di('El vistazo con círculos envolventes descarta casi todo: solo ' + exactas + ' de ' + todos + ' parejas pasan a la prueba exacta. Pero el vistazo se hace ' + todos + ' veces.', '');
      else di('Con la rejilla solo se miran objetos de la misma celda: <b>' + exactas + ' pruebas exactas</b> en vez de ' + todos + '. Los que tienen borde ámbar son los sospechosos del frame.', 'ok');
    }
    function tick(t) {
      const dt = ult ? Math.min(.05, (t - ult) / 1000) : 1 / 60; ult = t;
      paso(dt);
      raf = corriendo ? requestAnimationFrame(tick) : 0;
    }
    function arrancar() { if (!raf) { ult = 0; raf = requestAnimationFrame(tick); } }
    const c = FIG.controles(el);
    c.opciones(['Todos exactos', 'Vistazo + exacta', 'Rejilla + exacta'], i => { modo = i; if (!corriendo) paso(0); });
    c.deslizador('Objetos', 10, 200, n, 5, v => { n = v; ajustar(); if (!corriendo) paso(0); });
    c.casilla('Ver rejilla', v => { verRej = v; rej.style.display = v ? '' : 'none'; });
    const bp = c.boton(corriendo ? 'Pausa' : 'Animar', () => { corriendo = !corriendo; bp.textContent = corriendo ? 'Pausa' : 'Animar'; if (corriendo) arrancar(); }, true);
    c.boton('Paso', () => { corriendo = false; bp.textContent = 'Animar'; paso(1 / 30); }, true);
    rej.style.display = 'none';
    ajustar(); paso(0);
    if (corriendo) arrancar();
    return () => { corriendo = false; cancelAnimationFrame(raf); };
  };
})();
