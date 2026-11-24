/* Figuras de la sesión 1. Contrato: window.DEMOS.nombre = function (el) { ...; return detener; } */
window.DEMOS = window.DEMOS || {};

/* 1 · Un pájaro que aletea visto como sistema: entradas, estado, reglas y salidas */
window.DEMOS.sistema = function (el) {
  const C = FIG.C, f = FIG.lienzo(el, 1160, 430);
  /* zona de juego */
  const GX = 20, GY = 20, GW = 300, GH = 390, TECHO = GY + 10, SUELO = GY + GH - 40;
  f.nodo('rect', { x: GX, y: GY, width: GW, height: GH, fill: '#14132A', stroke: C.edge, 'stroke-width': 2 });
  f.nodo('rect', { x: GX, y: SUELO + 18, width: GW, height: GH - (SUELO - GY) - 18, fill: '#2E2C4E' });
  const lTecho = f.nodo('line', { x1: GX, y1: TECHO, x2: GX + GW, y2: TECHO, stroke: C.coral, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
  const pajaro = f.nodo('g', {});
  f.nodo('rect', { x: -18, y: -14, width: 36, height: 28, fill: C.amber, stroke: C.ink, 'stroke-width': 3 }, pajaro);
  f.nodo('rect', { x: 6, y: -8, width: 7, height: 7, fill: C.ink }, pajaro);
  f.nodo('rect', { x: 18, y: -2, width: 10, height: 7, fill: C.coral }, pajaro);
  const ala = f.nodo('rect', { x: -14, y: 0, width: 16, height: 9, fill: '#FFE08A', stroke: C.ink, 'stroke-width': 2 }, pajaro);
  /* las cuatro piezas */
  const col = (x, w, t, tono) => { f.nodo('rect', { x, y: 20, width: w, height: 40, fill: tono }); const h = f.texto(x + w / 2, 40, t, { tam: 20, color: C.ink, peso: 700 }); return h; };
  col(336, 150, 'Entradas', C.blue); col(500, 200, 'Estado', C.white); col(714, 300, 'Reglas', C.amber); col(1028, 122, 'Salidas', C.teal);
  const caja = (x, y, w, h) => f.nodo('rect', { x, y, width: w, height: h, fill: '#262542', stroke: C.edge, 'stroke-width': 2 });
  caja(336, 60, 150, 350); caja(500, 60, 200, 350); caja(714, 60, 300, 350); caja(1028, 60, 122, 350);
  const ent = [f.caja(348, 80, 126, 60, 'aletear', { tam: 20 }), f.caja(348, 156, 126, 60, 'tiempo', { tam: 20, sub: '1/30 s' })];
  const vars = ['y', 'vy', 'vivo'].map((n, i) => { f.texto(514, 100 + i * 70, n, { tam: 20, ancla: 'start', color: C.soft }); const v = f.texto(686, 100 + i * 70, '', { tam: 24, ancla: 'end', color: C.text, peso: 700 }); v.t.setAttribute('font-family', 'JetBrains Mono, monospace'); return v; });
  const REG = ['si aletea: vy ← −8', 'siempre: vy ← vy + g', 'siempre: y ← y + vy', 'si y < techo: y ← techo', 'si y ≥ suelo: vivo ← falso'];
  const regs = REG.map((t, i) => f.caja(726, 74 + i * 66, 276, 54, t, { tam: 19 }));
  const sal = [f.caja(1038, 80, 102, 60, 'dibujar', { tam: 18 }), f.caja(1038, 156, 102, 60, '«flap»', { tam: 18 }), f.caja(1038, 232, 102, 60, '«crash»', { tam: 18 })];
  const di = FIG.dice(el);
  const G = 0.9, DT = 1000 / 30;
  let y, vy, vivo, aleteo, techo = true, pausa = false, raf = null, acc = 0, prev = 0, flash = 0;
  function reset() { y = GY + GH / 2 - 40; vy = 0; vivo = true; aleteo = false; acc = 0; pinta([], false); di('Pulsa <b>Aletear</b> para mantener al pájaro en el aire. Mira qué reglas se encienden.'); }
  function paso() {
    if (!vivo) return [];
    const activas = [];
    if (aleteo) { vy = -8; activas.push(0); }
    vy += G; activas.push(1);
    y += vy; activas.push(2);
    if (techo && y < TECHO + 14) { y = TECHO + 14; vy = 0; activas.push(3); }
    if (y >= SUELO) { y = SUELO; vivo = false; activas.push(4); }
    const a = aleteo; aleteo = false;
    pinta(activas, a);
    return activas;
  }
  function pinta(activas, aleteoEste) {
    pajaro.setAttribute('transform', `translate(${GX + 110} ${y}) rotate(${Math.max(-25, Math.min(60, vy * 4))})`);
    ala.setAttribute('y', aleteoEste ? -10 : 0);
    vars[0].pon(Math.round(y - GY)); vars[1].pon(vy.toFixed(1)); vars[2].pon(vivo ? 'sí' : 'no').color(vivo ? C.teal : C.coral);
    ent[0].tono(aleteoEste ? 'on' : 'base'); ent[1].tono(vivo ? 'ok' : 'off');
    regs.forEach((r, i) => r.tono(i === 3 && !techo ? 'off' : activas.includes(i) ? (i === 4 ? 'bad' : 'on') : 'base'));
    if (aleteoEste) flash = 4;
    sal[0].tono(vivo ? 'ok' : 'base'); sal[1].tono(flash-- > 0 ? 'on' : 'base'); sal[2].tono(!vivo ? 'bad' : 'base');
    lTecho.style.display = techo ? '' : 'none';
    if (!vivo) di('La regla del suelo cambió <code>vivo</code> a falso y la salida «crash» lo muestra. Pulsa <b>Reiniciar</b>.', 'bad');
    else if (!techo && y < GY - 10) di('Sin la regla del techo, el pájaro sale de la pantalla: <b>falta una regla</b>. Eso es un bug.', 'bad');
  }
  function tick(t) {
    if (!prev) prev = t;
    acc += Math.min(200, t - prev); prev = t;
    if (!pausa) while (acc >= DT) { paso(); acc -= DT; } else acc = 0;
    raf = requestAnimationFrame(tick);
  }
  const c = FIG.controles(el);
  c.boton('Aletear', () => { if (!vivo) return; aleteo = true; if (pausa || FIG.quieto()) paso(); });
  if (FIG.quieto()) pausa = true;
  const bp = c.boton(pausa ? 'Seguir' : 'Pausa', () => { pausa = !pausa; bp.textContent = pausa ? 'Seguir' : 'Pausa'; }, true);
  c.boton('Un frame', () => { pausa = true; bp.textContent = 'Seguir'; paso(); }, true);
  c.boton('Reiniciar', reset, true);
  c.casilla('regla del techo', v => { techo = v; pinta([], false); if (v) di('Con la regla del techo, el pájaro no puede salir por arriba.'); }, true);
  reset();
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
};

/* 2 · Casos borde de la regla de la moneda */
window.DEMOS.casos = function (el) {
  const C = FIG.C, f = FIG.lienzo(el, 1100, 360);
  const CASOS = [
    { t: 'Normal', d: 'Toca una moneda en el frame 2 y sigue.', frames: [[], ['A'], [], []] },
    { t: 'Quieto encima', d: 'Se queda sobre la moneda A durante 4 frames.', frames: [['A'], ['A'], ['A'], ['A']] },
    { t: 'Dos a la vez', d: 'Toca A y B en el mismo frame.', frames: [[], ['A', 'B'], [], []] },
    { t: 'La última', d: 'Recoge A, luego B: ¿se completa el nivel?', frames: [['A'], [], ['B'], []] }
  ];
  let caso = 0, conRegla = true;
  const hdr = ['frame', 'toca', 'puntos', 'restantes', 'qué pasó'], xs = [40, 170, 330, 480, 640];
  f.nodo('rect', { x: 20, y: 20, width: 1060, height: 44, fill: C.amber });
  hdr.forEach((h, i) => f.texto(xs[i], 42, h, { tam: 20, ancla: 'start', color: C.ink, peso: 700 }));
  const filas = Array.from({ length: 4 }, (_, r) => {
    f.nodo('rect', { x: 20, y: 64 + r * 62, width: 1060, height: 62, fill: r % 2 ? '#201F3A' : '#262542' });
    return xs.map((x, i) => { const t = f.texto(x, 95 + r * 62, '', { tam: i === 4 ? 19 : 22, ancla: 'start', color: C.text, peso: i === 4 ? 500 : 700 }); if (i > 0 && i < 4) t.t.setAttribute('font-family', 'JetBrains Mono, monospace'); return t; });
  });
  const di = FIG.dice(el);
  function corre() {
    const K = CASOS[caso], recogida = { A: false, B: false };
    let puntos = 0, rest = 2, completo = false;
    K.frames.forEach((toca, r) => {
      const ev = [];
      toca.forEach(m => {
        if (!conRegla || !recogida[m]) { recogida[m] = true; puntos += 10; rest -= 1; ev.push(`suma ${m}`); }
        else ev.push(`${m} ya recogida`);
      });
      if (rest === 0 && !completo) { completo = true; ev.push('nivel completo'); }
      const fila = filas[r];
      fila[0].pon(String(r + 1)); fila[1].pon(toca.join(' + ') || '—'); fila[2].pon(String(puntos));
      fila[3].pon(String(rest)).color(rest < 0 ? C.coral : C.text); fila[4].pon(ev.join(' · ') || 'nada');
    });
    const roto = rest < 0 || puntos > 20;
    di(`<b>${K.t}:</b> ${K.d} ${roto ? `Resultado: <b>${puntos} puntos y ${rest} restantes</b>. La regla sin <code>NO recogida</code> se rompe en este caso borde.` : `Resultado: ${puntos} puntos, ${rest} restantes. La regla aguanta.`}`, roto ? 'bad' : 'ok');
  }
  const c = FIG.controles(el);
  c.opciones(CASOS.map(k => k.t), i => { caso = i; corre(); });
  c.casilla('con la condición «NO recogida»', v => { conRegla = v; corre(); }, true);
  corre();
};
