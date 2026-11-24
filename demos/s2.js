/* Figuras de la sesión 2 · Game loop, tiempo y estado.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   flipbook, bucle, deltaTime, vectorAngulo y fsmPersonaje usan solo FIG (assets/fig.js). */
window.DEMOS = window.DEMOS || {};
(function () {
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const coma = (n, d) => n.toFixed(d).replace('.', ',');

  /* 1 · El flipbook: cada página es un frame quieto; pasarlas rápido es el game loop */
  window.DEMOS.flipbook = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const N = 12, PX = 230, PY = 24, PW = 440, PH = 300, SUELO = 290;
    f.nodo('rect', { x: PX, y: PY, width: PW, height: PH, rx: 2, fill: FIG.C.paper });
    f.nodo('line', { x1: PX + 20, y1: SUELO + 18, x2: PX + PW - 20, y2: SUELO + 18, stroke: '#14161b', 'stroke-width': 3 });
    const pos = Array.from({ length: N }, (_, i) => {
      const t = i / N;
      return [PX + 60 + 320 * t, SUELO - 210 * Math.abs(Math.sin(Math.PI * 2 * t))];
    });
    const fantasmas = pos.map(p => { const c = f.circulo(p[0], p[1], 18, { color: FIG.C.coral }); c.c.setAttribute('opacity', '.22'); return c.ver(false); });
    const bola = f.circulo(pos[0][0], pos[0][1], 18, { color: FIG.C.coral });
    const num = f.texto(PX + PW - 18, PY + 26, '1', { tam: 24, color: '#14161b', ancla: 'end', peso: 800 });
    const tira = pos.map((_, i) => f.caja(45 + i * 69, 350, 60, 44, String(i + 1), { tam: 20, rx: 2 }));
    const info = f.texto(450, 428, '', { tam: 22, tono: 'white' });
    const di = FIG.dice(el);
    let pag = 0, pps = 8, hojeando = false, cebolla = false, acc = 0, last = 0, raf = 0;

    function pinta() {
      bola.mover(pos[pag][0], pos[pag][1]);
      num.pon(String(pag + 1));
      tira.forEach((t, i) => t.tono(i === pag ? 'on' : 'base'));
      fantasmas.forEach((g, i) => g.ver(cebolla && i !== pag && (pag - i + N) % N <= 3));
      info.pon(`página ${pag + 1} de ${N} · ${pps} páginas por segundo · dt = 1/${pps} = ${coma(1 / pps, 3)} s`);
      if (hojeando) di(pps < 6 ? 'Se ve a saltos: cada página dura mucho. <b>dt es grande.</b>' : pps < 18 ? 'Ya parece movimiento. Cada página dura <b>' + coma(1 / pps, 3) + ' s</b>.' : 'Muy suave: muchas páginas por segundo y <b>dt muy pequeño</b>.', pps >= 6 ? 'ok' : '');
      else di('Cada página es un dibujo <b>quieto</b>. Pasa páginas una por una, o hojea.');
    }
    function paso() { pag = (pag + 1) % N; pinta(); }
    function tick(t) {
      if (!last) last = t;
      acc += Math.min(0.25, (t - last) / 1000); last = t;
      while (acc >= 1 / pps) { acc -= 1 / pps; paso(); }
      raf = requestAnimationFrame(tick);
    }
    const c = FIG.controles(el);
    c.boton('Pasar página', () => { if (hojeando) alternar(); paso(); });
    const bh = c.boton('Hojear', () => alternar());
    function alternar() {
      hojeando = !hojeando; bh.textContent = hojeando ? 'Detener' : 'Hojear';
      cancelAnimationFrame(raf); last = 0; acc = 0;
      if (hojeando) raf = requestAnimationFrame(tick);
      pinta();
    }
    c.deslizador('páginas por segundo', 2, 30, pps, 1, v => { pps = v; pinta(); });
    c.casilla('ver páginas anteriores', v => { cebolla = v; pinta(); });
    pinta();
    return () => cancelAnimationFrame(raf);
  };

  /* 2 · Una vuelta del bucle, paso a paso: entrada, actualizar, dibujar */
  window.DEMOS.bucle = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const E = f.caja(30, 24, 240, 84, 'Entrada', { sub: 'lee el teclado', tam: 26 });
    const A = f.caja(330, 24, 240, 84, 'Actualizar', { sub: 'x = x + 200 × dt', tam: 26 });
    const D = f.caja(630, 24, 240, 84, 'Dibujar', { sub: 'pinta el cuadro', tam: 26 });
    const etapas = [E, A, D];
    f.flecha(E, A); f.flecha(A, D);
    f.trazo('M750 116 V150 H150 V122', { color: 'rgba(205,205,210,.55)', grosor: 3 });
    f.nodo('path', { d: 'M141 130 L150 114 L159 130 Z', fill: 'rgba(205,205,210,.75)' });
    f.texto(450, 140, 'siguiente frame', { tam: 18 });
    // estado (izquierda) y pantalla (derecha)
    f.texto(40, 196, 'Estado (la memoria)', { tam: 22, tono: 'white', peso: 800, ancla: 'start' });
    const tFrame = f.texto(40, 240, '', { tam: 22, ancla: 'start' });
    const tTecla = f.texto(40, 280, '', { tam: 22, ancla: 'start' });
    const tX = f.texto(40, 320, '', { tam: 26, tono: 'amber', peso: 800, ancla: 'start' });
    const tPinta = f.texto(40, 360, '', { tam: 22, ancla: 'start' });
    f.texto(650, 196, 'Pantalla', { tam: 22, tono: 'white', peso: 800 });
    const SX = 430, SY = 216, SW = 440, SH = 220;
    f.nodo('rect', { x: SX, y: SY, width: SW, height: SH, rx: 2, fill: '#08080a', stroke: FIG.C.grey, 'stroke-width': 3 });
    const cuadro = f.nodo('rect', { x: SX + 20, y: SY + 90, width: 40, height: 40, rx: 2, fill: FIG.C.teal });
    const di = FIG.dice(el);
    const DT = 0.1;
    let etapa = 0, frame = 1, x = 0, xPintado = 0, leida = false, tecla = true, modo = 0, raf = 0, last = 0, corriendo = false, acc = 0;

    function estado() {
      tFrame.pon('frame ' + frame + ' · dt = ' + coma(DT, 1) + ' s');
      tTecla.pon('flecha derecha: ' + (leida ? 'presionada' : 'suelta'));
      tX.pon('x = ' + Math.round(x));
      tPinta.pon('última x pintada = ' + Math.round(xPintado));
      cuadro.setAttribute('x', SX + 20 + (xPintado % (SW - 80)));
    }
    function marca(sel) {
      etapas.forEach((b, i) => {
        const saltada = (modo === 1 && i === 2) || (modo === 2 && i === 1);
        b.tono(saltada ? 'off' : i === sel ? 'on' : 'base');
      });
    }
    function paso() {
      const i = etapa;
      if (i === 0) { leida = tecla; di('<b>Entrada:</b> el juego mira el teclado. La flecha está ' + (leida ? 'presionada.' : 'suelta.')); }
      if (i === 1) {
        if (modo === 2) di('<b>Actualizar</b> no existe en este modo: x no cambia nunca. El juego está <b>congelado</b>.', 'bad');
        else if (leida) { x += 200 * DT; di('<b>Actualizar:</b> x = x + 200 × 0,1 = <b>' + Math.round(x) + '</b>. La memoria cambió, la pantalla todavía no.'); }
        else di('<b>Actualizar:</b> la flecha está suelta, así que x se queda en ' + Math.round(x) + '.');
      }
      if (i === 2) {
        if (modo === 1) di('<b>Dibujar</b> no existe en este modo: x vale ' + Math.round(x) + ' pero la pantalla sigue mostrando ' + Math.round(xPintado) + '. Vivo pero <b>ciego</b>.', 'bad');
        else { xPintado = x; di('<b>Dibujar:</b> se pinta el cuadro donde dice x. Ahora sí lo ves. Vuelta completa.', 'ok'); }
      }
      marca(i);
      etapa = (etapa + 1) % 3;
      if (etapa === 0) frame++;
      estado();
    }
    function tick(t) {
      if (!last) last = t;
      acc += Math.min(0.25, (t - last) / 1000); last = t;
      if (acc >= 0.45) { acc = 0; paso(); }
      raf = requestAnimationFrame(tick);
    }
    const c = FIG.controles(el);
    c.boton('Paso', () => { if (corriendo) correr(); paso(); });
    const bc = c.boton('Correr', () => correr());
    function correr() {
      corriendo = !corriendo; bc.textContent = corriendo ? 'Detener' : 'Correr';
      cancelAnimationFrame(raf); last = 0; acc = 0;
      if (corriendo) raf = requestAnimationFrame(tick);
    }
    c.casilla('flecha derecha presionada', v => { tecla = v; }, true);
    c.opciones(['Bucle completo', 'Sin dibujar', 'Sin actualizar'], i => { modo = i; etapa = 0; frame = 1; x = 0; xPintado = 0; leida = false; marca(-1); estado(); di(i === 0 ? 'Presiona <b>Paso</b>: una etapa a la vez.' : i === 1 ? 'Ahora el bucle no dibuja. Presiona Paso varias veces y mira x.' : 'Ahora el bucle no actualiza. Presiona Paso varias veces y mira x.'); });
    marca(-1); estado();
    di('Presiona <b>Paso</b>: una etapa a la vez. Tres pasos son un frame.');
    return () => cancelAnimationFrame(raf);
  };

  /* 3 · Delta time: la misma carrera a distintos fps, con y sin dt */
  window.DEMOS.deltaTime = function (el) {
    const f = FIG.lienzo(el, 900, 400);
    const X0 = 60, XF = 660, Y1 = 120, Y2 = 270;
    f.texto(X0, 64, 'Sin dt: x = x + 5 (por frame)', { tam: 24, tono: 'white', peso: 800, ancla: 'start' });
    f.texto(X0, 214, 'Con dt: x = x + 300 × dt (por segundo)', { tam: 24, tono: 'white', peso: 800, ancla: 'start' });
    f.linea(X0, Y1, XF, Y1, { grosor: 3 }); f.linea(X0, Y2, XF, Y2, { grosor: 3 });
    f.linea(XF, 84, XF, 300, { tono: 'amber', grosor: 3, puntos: true });
    f.texto(XF, 330, 'meta: 600 px', { tam: 20, tono: 'amber' });
    const b1 = f.circulo(X0, Y1, 18, { tono: 'coral' }), b2 = f.circulo(X0, Y2, 18, { tono: 'teal' });
    const r1 = f.texto(780, Y1, '', { tam: 22, tono: 'white' }), r2 = f.texto(780, Y2, '', { tam: 22, tono: 'white' });
    const reloj = f.texto(450, 372, '', { tam: 22 });
    const di = FIG.dice(el);
    let fps = 60, t = 0, frames = 0, x1 = 0, x2 = 0, t1 = null, t2 = null, acc = 0, last = 0, raf = 0, espera = 0;

    function reset() { t = 0; frames = 0; x1 = 0; x2 = 0; t1 = null; t2 = null; acc = 0; espera = 0; pinta(); }
    function frame() {
      const dt = 1 / fps;
      t += dt; frames++;
      if (t1 === null) { x1 += 5; if (x1 >= 600) { x1 = 600; t1 = t; } }
      if (t2 === null) { x2 += 300 * dt; if (x2 >= 600 - 1e-9) { x2 = 600; t2 = t; } }
    }
    function pinta() {
      b1.mover(X0 + x1, Y1); b2.mover(X0 + x2, Y2);
      r1.pon(t1 === null ? 'corriendo' : 'llega en ' + coma(t1, 2) + ' s');
      r2.pon(t2 === null ? 'corriendo' : 'llega en ' + coma(t2, 2) + ' s');
      reloj.pon('tiempo: ' + coma(t, 2) + ' s · frame ' + frames + ' · dt = ' + coma(1 / fps, 4) + ' s');
      const v = 5 * fps;
      if (fps === 60) di('A 60 fps <b>empatan</b>: 5 × 60 = 300 px/s. Por eso el error no se nota en el computador de quien lo programó.', '');
      else if (fps < 60) di(`A ${fps} fps la bola sin dt va a <b>${v} px/s</b>: más lenta. La de dt sigue en 300 px/s y llega en 2 s.`, 'bad');
      else di(`A ${fps} fps la bola sin dt va a <b>${v} px/s</b>: ${coma(v / 300, 1)} veces más rápida. La de dt sigue llegando en 2 s.`, 'bad');
    }
    function tick(now) {
      if (!last) last = now;
      const real = Math.min(0.25, (now - last) / 1000); last = now;
      if (t1 !== null && t2 !== null) { espera += real; if (espera > 1.6) reset(); }
      else { acc += real; let k = 0; while (acc >= 1 / fps && k < 200) { acc -= 1 / fps; frame(); k++; } if (k) pinta(); }
      raf = requestAnimationFrame(tick);
    }
    const c = FIG.controles(el);
    c.deslizador('fps', 10, 144, fps, 1, v => { fps = v; reset(); });
    c.boton('Reiniciar carrera', reset);
    c.boton('Un frame', () => { if (t1 === null || t2 === null) { frame(); pinta(); } }, true);
    reset();
    if (!quieto()) raf = requestAnimationFrame(tick);
    else di('Movimiento reducido: usa <b>Un frame</b> para avanzar. Cambia los fps y compara cuántos frames necesita cada bola.');
    return () => cancelAnimationFrame(raf);
  };

  /* 4 · Del ángulo a la dirección: cos y sin en coordenadas de pantalla (y hacia abajo) */
  window.DEMOS.vectorAngulo = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const OX = 270, OY = 230, R = 150;
    f.linea(40, OY, 520, OY, { grosor: 2 }); f.linea(OX, 20, OX, 440, { grosor: 2 });
    f.texto(510, OY - 18, 'x →', { tam: 22, tono: 'white', ancla: 'end' });
    f.texto(OX + 14, 430, 'y ↓', { tam: 22, tono: 'white', ancla: 'start' });
    f.nodo('circle', { cx: OX, cy: OY, r: R, fill: 'none', stroke: FIG.C.grey, 'stroke-width': 2, 'stroke-dasharray': '6 8' });
    f.texto(OX - R + 6, OY - R + 10, 'largo 1', { tam: 18, ancla: 'start' });
    const cx = f.nodo('line', { stroke: FIG.C.amber, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    const cy = f.nodo('line', { stroke: FIG.C.teal, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    const arco = f.nodo('path', { fill: 'none', stroke: FIG.C.white, 'stroke-width': 2 });
    const vec = f.nodo('line', { stroke: FIG.C.coral, 'stroke-width': 5, 'stroke-linecap': 'round' });
    const punta = f.nodo('polygon', { fill: FIG.C.coral });
    const dir = f.circulo(OX + R, OY, 8, { tono: 'white' });
    f.circulo(OX, OY, 14, { tono: 'slate' });
    const tA = f.texto(560, 60, '', { tam: 28, tono: 'white', peso: 800, ancla: 'start' });
    const tC = f.texto(560, 120, '', { tam: 24, tono: 'amber', peso: 700, ancla: 'start' });
    const tS = f.texto(560, 165, '', { tam: 24, tono: 'teal', peso: 700, ancla: 'start' });
    const tV = f.texto(560, 230, '', { tam: 22, tono: 'white', ancla: 'start' });
    const tV2 = f.texto(560, 262, '', { tam: 22, tono: 'coral', peso: 700, ancla: 'start' });
    const tLua = f.texto(560, 330, '', { tam: 18, ancla: 'start' });
    const di = FIG.dice(el);
    const balas = [];
    let grados = 30, rapidez = 400, raf = 0, last = 0;

    function pinta() {
      const a = grados * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), L = R * rapidez / 400;
      const tx = OX + dx * L, ty = OY + dy * L;
      vec.setAttribute('x1', OX); vec.setAttribute('y1', OY); vec.setAttribute('x2', tx); vec.setAttribute('y2', ty);
      const px = -dy, py = dx, s = 16;
      punta.setAttribute('points', L > 20 ? `${tx + dx * 4},${ty + dy * 4} ${tx - dx * s + px * s * .6},${ty - dy * s + py * s * .6} ${tx - dx * s - px * s * .6},${ty - dy * s - py * s * .6}` : '');
      cx.setAttribute('x1', OX); cx.setAttribute('y1', OY); cx.setAttribute('x2', tx); cx.setAttribute('y2', OY);
      cy.setAttribute('x1', tx); cy.setAttribute('y1', OY); cy.setAttribute('x2', tx); cy.setAttribute('y2', ty);
      const ra = 46, big = grados > 180 ? 1 : 0;
      arco.setAttribute('d', grados % 360 === 0 ? '' : `M${OX + ra} ${OY} A${ra} ${ra} 0 ${big} 1 ${OX + Math.cos(a) * ra} ${OY + Math.sin(a) * ra}`);
      dir.mover(OX + dx * R, OY + dy * R);
      tA.pon('ángulo = ' + grados + '°');
      tC.pon('dx = cos = ' + coma(dx, 2));
      tS.pon('dy = sin = ' + coma(dy, 2));
      tV.pon('velocidad = (dx, dy) × ' + rapidez);
      tV2.pon('= (' + Math.round(dx * rapidez) + ', ' + Math.round(dy * rapidez) + ') px/s');
      tLua.pon('Lua: math.cos(math.rad(' + grados + '))');
      const hacia = Math.abs(dx) < .05 ? (dy > 0 ? 'abajo' : 'arriba') : Math.abs(dy) < .05 ? (dx > 0 ? 'la derecha' : 'la izquierda') : (dy > 0 ? 'abajo' : 'arriba') + ' a la ' + (dx > 0 ? 'derecha' : 'izquierda');
      di('A ' + grados + '° la bala va hacia <b>' + hacia + '</b>. El punto blanco siempre está sobre el círculo: <b>(cos, sin) mide 1</b>; la rapidez solo estira la flecha.');
    }
    function tick(now) {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      for (let i = balas.length - 1; i >= 0; i--) {
        const b = balas[i];
        b.x += b.vx * dt; b.y += b.vy * dt; b.c.mover(b.x, b.y);
        if (b.x < -20 || b.x > 920 || b.y < -20 || b.y > 480) { b.c.c.remove(); balas.splice(i, 1); }
      }
      raf = balas.length ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    }
    function disparar() {
      const a = grados * Math.PI / 180, vx = Math.cos(a) * rapidez, vy = Math.sin(a) * rapidez;
      if (quieto()) {
        [0.15, 0.3, 0.45].forEach(t => { const c = f.circulo(OX + vx * t, OY + vy * t, 7, { tono: 'amber' }); setTimeout(() => c.c.remove(), 2500); });
        return;
      }
      balas.push({ x: OX, y: OY, vx, vy, c: f.circulo(OX, OY, 8, { tono: 'amber' }) });
      if (!raf) raf = requestAnimationFrame(tick);
    }
    const c = FIG.controles(el);
    const sa = c.deslizador('ángulo', 0, 360, grados, 5, v => { grados = v; pinta(); }, v => v + '°');
    c.deslizador('rapidez', 0, 400, rapidez, 10, v => { rapidez = v; pinta(); });
    c.boton('Disparar', disparar);
    c.opciones(['0°', '90°', '180°', '225°'], i => { sa.value = [0, 90, 180, 225][i]; sa.dispatchEvent(new Event('input')); }, -1);
    pinta();
    return () => cancelAnimationFrame(raf);
  };

  /* 5 · La FSM de un personaje: eventos, transiciones y la sopa de booleanos */
  window.DEMOS.fsmPersonaje = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const B = {
      quieto: f.caja(360, 190, 200, 80, 'Quieto', { tam: 28 }),
      corre: f.caja(670, 190, 200, 80, 'Corre', { tam: 28 }),
      salta: f.caja(360, 24, 200, 80, 'Salta', { tam: 28 }),
      ataca: f.caja(360, 356, 200, 80, 'Ataca', { tam: 28 })
    };
    const T = {
      quieto: { derecha: 'corre', espacio: 'salta', clic: 'ataca' },
      corre: { soltar: 'quieto', espacio: 'salta' },
      salta: { aterriza: 'quieto' },
      ataca: { fin: 'quieto' }
    };
    const ROT = { derecha: '→ flecha', soltar: 'soltar', espacio: 'espacio', aterriza: 'aterriza', clic: 'clic', fin: 'fin animación' };
    const DES = { 'quieto.derecha': [-16, 0, -6], 'corre.soltar': [-16, 0, 30], 'quieto.espacio': [-22, -30, 0], 'salta.aterriza': [-22, -30, 0], 'quieto.clic': [-22, -28, 0], 'ataca.fin': [-22, -28, 0], 'corre.espacio': [0, 40, -6] };
    const fl = {};
    Object.keys(T).forEach(a => Object.keys(T[a]).forEach(ev => {
      const k = a + '.' + ev, d = DES[k] || [0, 0, 0];
      fl[k] = f.flecha(B[a], B[T[a][ev]], { rotulo: ROT[ev], tam: 18, desvio: d[0], rx: d[1], ry: d[2] });
    }));
    const t1 = f.texto(24, 60, '', { tam: 22, tono: 'white', peso: 800, ancla: 'start' });
    const tl = [0, 1, 2, 3].map(i => f.texto(24, 110 + i * 40, '', { tam: 21, ancla: 'start' }));
    const di = FIG.dice(el);
    let modo = 0, estado = 'quieto', bo = { corriendo: false, saltando: false, atacando: false }, saltos = 0, ultimo = '';

    function pinta(flechaOn) {
      Object.keys(fl).forEach(k => fl[k].ver(modo === 0).tono(k === flechaOn ? 'ok' : 'base'));
      if (modo === 0) {
        Object.keys(B).forEach(k => B[k].tono(k === estado ? 'on' : 'base'));
        t1.pon('estado = "' + estado + '"');
        tl[0].pon(ultimo ? 'último evento: ' + ultimo : 'envía un evento');
        tl[1].pon('flechas que salen de aquí:');
        tl[2].pon(Object.keys(T[estado]).map(e => ROT[e]).join(', '));
        tl[3].pon('');
      } else {
        const on = { corre: bo.corriendo, salta: bo.saltando, ataca: bo.atacando };
        on.quieto = !on.corre && !on.salta && !on.ataca;
        Object.keys(B).forEach(k => B[k].tono(on[k] ? (on.corre + on.salta + on.ataca > 1 ? 'bad' : 'on') : 'base'));
        t1.pon('tres booleanos');
        tl[0].pon('corriendo = ' + bo.corriendo);
        tl[1].pon('saltando  = ' + bo.saltando);
        tl[2].pon('atacando  = ' + bo.atacando);
        tl[3].pon('saltos en el aire: ' + saltos);
      }
    }
    function evento(ev) {
      ultimo = ROT[ev];
      if (modo === 0) {
        const sig = T[estado][ev];
        if (sig) {
          const k = estado + '.' + ev, de = estado;
          estado = sig; pinta(k);
          di(`<b>${de} + ${ROT[ev]} → ${sig}.</b> Hay una flecha, así que el estado cambia.`, 'ok');
        } else {
          pinta();
          di(`En <b>${estado}</b> no hay flecha para «${ROT[ev]}»: el evento <b>se ignora</b>.` + (estado === 'salta' && ev === 'espacio' ? ' Así, sin código extra, no hay doble salto.' : ''));
        }
        return;
      }
      if (ev === 'derecha') bo.corriendo = true;
      if (ev === 'soltar') bo.corriendo = false;
      if (ev === 'espacio') { if (bo.saltando) saltos++; bo.saltando = true; }
      if (ev === 'aterriza') { bo.saltando = false; saltos = 0; }
      if (ev === 'clic') bo.atacando = true;
      if (ev === 'fin') bo.atacando = false;
      pinta();
      const n = bo.corriendo + bo.saltando + bo.atacando;
      if (saltos > 0 && ev === 'espacio') di('Saltó <b>otra vez en el aire</b>: nadie preguntó si ya estaba saltando. Doble salto por accidente.', 'bad');
      else if (n > 1) di(`<b>${n} booleanos en true a la vez.</b> ¿Qué animación muestras? Con 3 booleanos hay 8 combinaciones y la mayoría son absurdas.`, 'bad');
      else di('Por ahora todo parece bien. Sigue enviando eventos: espacio dos veces, o clic mientras salta.');
    }
    function reiniciar() { estado = 'quieto'; bo = { corriendo: false, saltando: false, atacando: false }; saltos = 0; ultimo = ''; pinta(); di(modo === 0 ? 'Siempre en un estado, y solo uno. <b>Envía eventos</b> con los botones.' : 'Ahora el personaje usa tres booleanos sueltos. Prueba la misma secuencia.'); }
    const c = FIG.controles(el);
    c.opciones(['Máquina de estados', 'Con booleanos'], i => { modo = i; reiniciar(); });
    [['→ flecha', 'derecha'], ['Soltar', 'soltar'], ['Espacio', 'espacio'], ['Aterriza', 'aterriza'], ['Clic', 'clic'], ['Fin animación', 'fin']].forEach(b => c.boton(b[0], () => evento(b[1])));
    c.boton('Reiniciar', reiniciar, true);
    reiniciar();
  };
})();
