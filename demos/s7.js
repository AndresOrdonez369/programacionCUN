/* Figuras de la sesión 7 · Breakout e integración: penetracion, paleta, tunel, fsm y breakout.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   Arrastrar: pointer events sobre el SVG; las coordenadas se pasan al lienzo con getScreenCTM().inverse(). */
window.DEMOS = window.DEMOS || {};
(function () {
  const C = FIG.C;
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const r0 = v => Math.round(v);
  const pon = (e, at) => { for (const k in at) e.setAttribute(k, at[k]); return e; };
  function puntoSVG(svg, e) {
    const m = svg.getScreenCTM(); if (!m) return [0, 0];
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(m.inverse()); return [q.x, q.y];
  }
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
  function sinPuntero(f, extra) { f.svg.style.userSelect = 'none'; f.svg.querySelectorAll('text').forEach(t => { t.style.pointerEvents = 'none'; }); (extra || []).forEach(e => { e.style.pointerEvents = 'none'; }); }
  /* flecha que se puede mover: una línea y una punta */
  function flechaLibre(f, color, grosor) {
    const ln = f.nodo('path', { fill: 'none', stroke: color, 'stroke-width': grosor || 4, 'stroke-linecap': 'round' });
    const pu = f.nodo('path', { fill: color });
    return {
      pon(x1, y1, x2, y2) {
        const a = Math.atan2(y2 - y1, x2 - x1), L = 16;
        pon(ln, { d: `M${x1} ${y1} L${x2} ${y2}` });
        pon(pu, { d: `M${x2} ${y2} L${x2 - L * Math.cos(a - .45)} ${y2 - L * Math.sin(a - .45)} L${x2 - L * Math.cos(a + .45)} ${y2 - L * Math.sin(a + .45)} Z` });
        return this;
      },
      color(c) { ln.setAttribute('stroke', c); pu.setAttribute('fill', c); return this; },
      ver(v) { ln.style.display = pu.style.display = v ? '' : 'none'; return this; },
      els: [ln, pu]
    };
  }

  /* 1 · penetracion: cuánto se metió la bola en cada eje y por cuál sale */
  window.DEMOS.penetracion = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Una bola cuadrada que puedes arrastrar dentro de un ladrillo. Se mide el solape en X y en Y y se elige el eje del rebote.');
    const L = { x: 290, y: 160, w: 340, h: 130 }, B = { x: 248, y: 190, w: 64, h: 64 };
    f.nodo('rect', { x: L.x, y: L.y, width: L.w, height: L.h, fill: C.coral, 'fill-opacity': .25, stroke: C.coral, 'stroke-width': 3 });
    f.texto(L.x + L.w / 2 + 40, L.y + L.h / 2, 'ladrillo', { tam: 26, tono: 'white', peso: 800 });
    const sol = f.nodo('rect', { fill: C.amber, 'fill-opacity': .6 });
    const fant = f.nodo('rect', { fill: 'none', stroke: C.teal, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    const bola = f.nodo('rect', { fill: C.white, 'fill-opacity': .85, stroke: C.white, 'stroke-width': 2 });
    const vin = flechaLibre(f, C.grey, 4), vout = flechaLibre(f, C.teal, 5);
    const tX = f.texto(0, 0, '', { tam: 24, tono: 'amber', peso: 800 }), tY = f.texto(0, 0, '', { tam: 24, tono: 'amber', peso: 800, ancla: 'start' });
    const t1 = f.texto(24, 30, '', { ancla: 'start', tam: 22, tono: 'white', peso: 700 });
    const t2 = f.texto(24, 62, '', { ancla: 'start', tam: 22, tono: 'white', peso: 700 });
    f.texto(24, 440, 'gris: venía · verde: sale · punteado: dónde queda después de sacarla', { ancla: 'start', tam: 18 });
    f.texto(876, 30, 'arrastra la bola', { ancla: 'end', tam: 20 });
    const di = FIG.dice(el);
    let modo = 0;
    function pinta() {
      pon(bola, { x: B.x, y: B.y, width: B.w, height: B.h });
      const ox = Math.min(B.x + B.w, L.x + L.w) - Math.max(B.x, L.x), oy = Math.min(B.y + B.h, L.y + L.h) - Math.max(B.y, L.y);
      const cbx = B.x + B.w / 2, cby = B.y + B.h / 2, clx = L.x + L.w / 2, cly = L.y + L.h / 2;
      /* en Breakout la bola viaja en diagonal: suponemos que venía hacia el ladrillo */
      const sx = cbx <= clx ? 1 : -1, sy = cby <= cly ? 1 : -1, V = 90;
      vin.pon(cbx - sx * V, cby - sy * V, cbx, cby);
      const dentro = ox > 0 && oy > 0;
      [sol, fant].forEach(e => { e.style.display = dentro ? '' : 'none'; }); vout.ver(dentro); tX.ver(dentro); tY.ver(dentro);
      if (!dentro) { t1.pon('solapeX = ' + r0(ox) + '   solapeY = ' + r0(oy)); t2.pon('alguno es ≤ 0: no hay choque'); di('Arrastra la bola hasta que se meta en el ladrillo.'); return; }
      pon(sol, { x: Math.max(B.x, L.x), y: Math.max(B.y, L.y), width: ox, height: oy });
      tX.pon('X: ' + r0(ox)); pon(tX.t, { x: Math.max(B.x, L.x) + ox / 2, y: Math.max(B.y, L.y) - 14 });
      tY.pon('Y: ' + r0(oy)); pon(tY.t, { x: Math.min(B.x + B.w, L.x + L.w) + 10, y: Math.max(B.y, L.y) + oy / 2 });
      const porX = ox < oy;
      let gx = B.x, gy = B.y, vx = sx, vy = sy;
      if (porX) { gx = cbx < clx ? B.x - ox : B.x + ox; } else { gy = cby < cly ? B.y - oy : B.y + oy; }
      if (modo === 0) { if (porX) vx = -sx; else vy = -sy; } else { vx = -sx; vy = -sy; }
      pon(fant, { x: gx, y: gy, width: B.w, height: B.h });
      const gcx = gx + B.w / 2, gcy = gy + B.h / 2;
      vout.pon(gcx, gcy, gcx + vx * V, gcy + vy * V).color(modo === 0 ? C.teal : C.coral);
      t1.pon('solapeX = ' + r0(ox) + '   solapeY = ' + r0(oy));
      t2.pon(modo === 0 ? 'menor: ' + (porX ? 'X → sale por el lado e invierte vx' : 'Y → sale por arriba o abajo e invierte vy') : 'se invierten vx y vy a la vez');
      const empate = Math.abs(ox - oy) < 6;
      if (modo === 1) di('<b>Invertir los dos ejes:</b> la bola vuelve exactamente por donde vino, como si rebotara en un espejo inclinado. En un Breakout se ve errático y a veces la bola queda adentro del ladrillo.', 'bad');
      else if (empate) di('<b>Casi empate:</b> la bola entró por la esquina. Los dos ejes son razonables; lo importante es invertir solo uno y sacarla del ladrillo.', '');
      else di('Se metió ' + r0(Math.min(ox, oy)) + ' px en ' + (porX ? 'X' : 'Y') + ' y ' + r0(Math.max(ox, oy)) + ' px en ' + (porX ? 'Y' : 'X') + '. <b>El eje de menor penetración</b> es por donde entró: se saca por ahí y se invierte solo ' + (porX ? 'vx' : 'vy') + '.', 'ok');
    }
    let off = [0, 0];
    arrastrar(f.svg, bola, (fase, x, y) => {
      if (fase === 'ini') off = [B.x - x, B.y - y];
      B.x = lim(x + off[0], 10, 890 - B.w); B.y = lim(y + off[1], 80, 420 - B.h); pinta();
    });
    sinPuntero(f, [sol, fant].concat(vin.els, vout.els));
    const PRE = [{ x: 420, y: 270 }, { x: 248, y: 190 }, { x: 256, y: 128 }];
    const c = FIG.controles(el);
    c.opciones(['Golpe por abajo', 'Golpe por el lado', 'Esquina'], i => { Object.assign(B, PRE[i]); pinta(); }, 1);
    c.opciones(['Menor penetración', 'Invertir ambos'], i => { modo = i; pinta(); });
    pinta();
    return () => {};
  };

  /* 2 · paleta: el punto de impacto decide el ángulo de salida */
  window.DEMOS.paleta = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Una paleta y una bola que puedes mover a lo largo de ella. Se dibuja la trayectoria de salida según el punto de impacto.');
    const P = { x: 300, y: 400, w: 300, h: 22 }, BW = 20, RAP = 400;
    f.linea(20, 20, 880, 20, { tono: 'grey', grosor: 3 }); f.linea(20, 20, 20, 440, { tono: 'grey', grosor: 3 }); f.linea(880, 20, 880, 440, { tono: 'grey', grosor: 3 });
    const ray = f.nodo('polyline', { fill: 'none', stroke: C.amber, 'stroke-width': 3, 'stroke-dasharray': '10 7' });
    const vert = f.linea(0, 0, 0, 0, { tono: 'grey', grosor: 2, puntos: true });
    const arco = f.nodo('path', { fill: 'none', stroke: C.white, 'stroke-width': 2 });
    f.nodo('rect', { x: P.x, y: P.y, width: P.w, height: P.h, fill: C.teal, stroke: C.teal, 'stroke-width': 2 });
    [-1, -.5, 0, .5, 1].forEach(k => { const x = P.x + P.w / 2 + k * P.w / 2; f.linea(x, P.y + P.h, x, P.y + P.h + 10, { tono: 'white', grosor: 2 }); f.texto(x, P.y + P.h + 26, (k > 0 ? '+' : '') + k, { tam: 18 }); });
    const bola = f.nodo('rect', { width: BW, height: BW, fill: C.white });
    const tA = f.texto(0, 0, '', { tam: 22, tono: 'white', peso: 800 });
    const t1 = f.texto(40, 50, '', { ancla: 'start', tam: 21, tono: 'white', peso: 700 });
    const t2 = f.texto(40, 80, '', { ancla: 'start', tam: 21, tono: 'white', peso: 700 });
    const t3 = f.texto(40, 110, '', { ancla: 'start', tam: 21, tono: 'soft', peso: 700 });
    const di = FIG.dice(el);
    let t = .5, maxG = 60, modo = 0, inp = null;
    function trazar(x, y, dx, dy) {
      const pts = [[x, y]];
      for (let k = 0; k < 4; k++) {
        const tTop = (y - 20) / -dy;
        let tPared = Infinity;
        if (dx > 0) tPared = (880 - x) / dx; else if (dx < 0) tPared = (20 - x) / dx;
        if (tTop <= tPared) { pts.push([x + dx * tTop, 20]); break; }
        x += dx * tPared; y += dy * tPared; pts.push([x, y]); dx = -dx;
      }
      return pts;
    }
    function pinta() {
      const cx = P.x + P.w / 2 + t * P.w / 2, by = P.y - BW;
      pon(bola, { x: cx - BW / 2, y: by });
      const ang = modo === 0 ? lim(t, -1, 1) * maxG : 35, a = ang * Math.PI / 180;
      const dx = Math.sin(a), dy = -Math.cos(a), ox = cx, oy = by + BW / 2;
      pon(ray, { points: trazar(ox, oy, dx, dy).map(p => p.join(',')).join(' ') });
      pon(vert, { x1: ox, y1: oy, x2: ox, y2: oy - 120 });
      const R = 70, a0 = -Math.PI / 2, a1 = a0 + a;
      pon(arco, { d: `M${ox + R * Math.cos(a0)} ${oy + R * Math.sin(a0)} A${R} ${R} 0 0 ${a >= 0 ? 1 : 0} ${ox + R * Math.cos(a1)} ${oy + R * Math.sin(a1)}` });
      tA.pon(r0(ang) + '°'); pon(tA.t, { x: ox + (ang >= 0 ? 1 : -1) * 34 + 0, y: oy - R - 18 });
      const vx = r0(RAP * Math.sin(a)), vy = r0(-RAP * Math.cos(a));
      if (modo === 0) { t1.pon('t = (centroBola − centroPaleta) / (ancho / 2) = ' + (t >= 0 ? '+' : '') + t.toFixed(2)); t2.pon('ángulo = t × ' + maxG + '° = ' + r0(ang) + '°'); }
      else { t1.pon('rebote plano: vy cambia de signo y vx sigue igual'); t2.pon('ángulo de salida: siempre 35°'); }
      t3.pon('vx = ' + RAP + ' × sin(ángulo) = ' + vx + '     vy = −' + RAP + ' × cos(ángulo) = ' + vy);
      if (modo === 1) di('<b>Rebote plano:</b> pegues donde pegues, la bola sale igual. El jugador no puede apuntar y la partida se vuelve un patrón que se repite.', 'bad');
      else if (Math.abs(t) < .12) di('Pegó en el centro: sale casi vertical. Buena para subir directo, mala para alcanzar los lados.', '');
      else di('Pegó ' + (t < 0 ? 'a la izquierda' : 'a la derecha') + ' del centro: sale hacia ' + (t < 0 ? 'la izquierda' : 'la derecha') + ' con ' + Math.abs(r0(ang)) + '°. <b>El jugador apunta con la paleta.</b> El tope de ' + maxG + '° evita que la bola salga casi horizontal.', 'ok');
    }
    arrastrar(f.svg, bola, (fase, x) => { t = lim((x - (P.x + P.w / 2)) / (P.w / 2), -1, 1); if (inp) inp.value = r0(t * 100); pinta(); });
    sinPuntero(f, [ray, vert, arco]);
    const c = FIG.controles(el);
    inp = c.deslizador('Punto de impacto', -100, 100, 50, 1, v => { t = v / 100; pinta(); }, v => (v >= 0 ? '+' : '') + (v / 100).toFixed(2));
    c.deslizador('Ángulo máximo', 20, 80, maxG, 5, v => { maxG = v; pinta(); }, v => v + '°');
    c.opciones(['Según impacto', 'Rebote plano'], i => { modo = i; pinta(); });
    pinta();
    return () => {};
  };

  /* 3 · tunel: a mucha velocidad la bola salta por encima del ladrillo entre dos frames */
  window.DEMOS.tunel = function (el) {
    const f = FIG.lienzo(el, 900, 340);
    f.svg.setAttribute('aria-label', 'Una bola avanza hacia un ladrillo delgado. Se dibuja dónde queda en cada frame; a mucha velocidad lo atraviesa sin tocarlo.');
    const X0 = 40, Y = 170, BW = 20, WX = 560;
    const muro = f.nodo('rect', { y: 105, height: 130, fill: C.coral, 'fill-opacity': .35, stroke: C.coral, 'stroke-width': 3 });
    f.texto(WX + 8, 92, 'ladrillo', { tam: 20, tono: 'coral', peso: 800, ancla: 'start' });
    f.linea(20, Y + BW / 2 + 40, 880, Y + BW / 2 + 40, { tono: 'grey', grosor: 2 });
    const capa = f.nodo('g', {});
    const movil = f.nodo('rect', { width: BW, height: BW, fill: C.white, y: Y });
    const t1 = f.texto(24, 28, '', { ancla: 'start', tam: 21, tono: 'white', peso: 700 });
    const t2 = f.texto(24, 58, '', { ancla: 'start', tam: 21, tono: 'soft', peso: 700 });
    f.texto(24, 318, 'cuadros grises: la bola en cada frame · puntos ámbar: sub-pasos', { ancla: 'start', tam: 18 });
    const di = FIG.dice(el);
    let v = 600, fps = 30, grosor = 16, sub = false, anim = null, frames = [], fin = null;
    const toca = x => x < WX + grosor && x + BW > WX;
    function calcular() {
      const dt = 1 / fps, adv = v * dt, pasos = sub ? Math.max(1, Math.ceil(adv / (BW / 2))) : 1, h = adv / pasos;
      frames = []; fin = null; const dots = [];
      let x = X0; frames.push(x);
      while (x < 880 && !fin) {
        for (let k = 1; k <= pasos; k++) {
          const nx = x + h * k;
          if (sub && k < pasos) dots.push(nx);
          if (toca(nx)) { fin = { x: nx, frame: frames.length }; break; }
        }
        x = fin ? fin.x : x + adv;
        if (!fin) frames.push(x);
      }
      return { adv, pasos, dots };
    }
    function pinta() {
      pon(muro, { x: WX, width: grosor });
      const r = calcular();
      capa.innerHTML = '';
      frames.forEach(x => { if (x <= 880) f.nodo('rect', { x, y: Y, width: BW, height: BW, fill: 'none', stroke: C.soft, 'stroke-width': 2 }, capa); });
      r.dots.forEach(x => { if (x <= 880 && (!fin || x <= fin.x)) f.nodo('circle', { cx: x + BW / 2, cy: Y + BW / 2, r: 4, fill: C.amber }, capa); });
      if (fin) f.nodo('rect', { x: fin.x, y: Y, width: BW, height: BW, fill: C.amber, stroke: C.amber, 'stroke-width': 2 }, capa);
      else {
        const antes = frames.filter(x => x + BW <= WX).pop(), despues = frames.find(x => x >= WX + grosor);
        if (antes !== undefined && despues !== undefined) {
          [antes, despues].forEach(x => f.nodo('rect', { x, y: Y, width: BW, height: BW, fill: 'none', stroke: C.coral, 'stroke-width': 3 }, capa));
          f.nodo('path', { d: `M${antes + BW / 2} ${Y - 8} Q${(antes + despues) / 2 + BW / 2} ${Y - 70} ${despues + BW / 2} ${Y - 8}`, fill: 'none', stroke: C.coral, 'stroke-width': 3, 'stroke-dasharray': '8 6' }, capa);
        }
      }
      movil.style.display = 'none';
      t1.pon('avance por frame = ' + v + ' px/s × 1/' + fps + ' s = ' + r0(r.adv) + ' px     ladrillo + bola = ' + (grosor + BW) + ' px');
      t2.pon(sub ? 'sub-pasos por frame: ' + r.pasos + ' (nunca más de media bola por paso)' : 'un solo paso por frame');
      if (fin) di('<b>Choca</b> ' + (sub ? 'en un sub-paso del frame ' + fin.frame : 'en el frame ' + fin.frame) + '. ' + (sub ? 'Con pasos de máximo media bola es imposible saltarse el ladrillo.' : 'Avanza ' + r0(r.adv) + ' px por frame: todavía cae dentro del ladrillo en algún frame.'), 'ok');
      else di('<b>Túnel:</b> en un frame la bola está antes del ladrillo y en el siguiente ya pasó. Nunca se solaparon, así que AABB nunca dijo «choca». Activa los sub-pasos o baja la rapidez.', 'bad');
    }
    function lanzar() {
      if (anim) { clearInterval(anim); anim = null; }
      const lista = fin ? frames.concat([fin.x]) : frames.filter(x => x <= 880);
      let i = 0; movil.style.display = '';
      const paso = () => { pon(movil, { x: lista[i] }); i++; if (i >= lista.length) { clearInterval(anim); anim = null; } };
      paso(); anim = setInterval(paso, 1000 / fps * 4);
    }
    sinPuntero(f);
    const c = FIG.controles(el);
    c.deslizador('Rapidez', 200, 4000, v, 100, x => { v = x; pinta(); }, x => x + ' px/s');
    c.deslizador('Grosor del ladrillo', 6, 60, grosor, 2, x => { grosor = x; pinta(); }, x => x + ' px');
    c.opciones(['30 fps', '60 fps'], i => { fps = i ? 60 : 30; pinta(); });
    c.casilla('Sub-pasos', x => { sub = x; pinta(); });
    c.boton('Lanzar (cámara lenta)', lanzar, true);
    pinta();
    return () => { if (anim) clearInterval(anim); };
  };

  /* 4 · fsm: los estados del Breakout y los eventos que los cambian */
  window.DEMOS.fsm = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Máquina de estados del Breakout con seis estados. Los botones envían eventos y se ilumina el estado actual.');
    const P = { title: [20, 190], serve: [340, 40], play: [680, 190], victory: [350, 190], gameover: [340, 360], pause: [680, 370] };
    const NOM = { title: 'Title', serve: 'Serve', play: 'Play', pause: 'Pause', victory: 'Victory', gameover: 'GameOver' };
    const SUB = { title: 'pantalla de inicio', serve: 'bola en la paleta', play: 'la bola vuela', pause: 'todo congelado', victory: 'ganaste', gameover: 'perdiste' };
    const HACE = { title: 'update espera Enter; draw muestra el título', serve: 'update pega la bola a la paleta', play: 'update mueve, choca, suma puntos', pause: 'update no hace nada; draw sigue dibujando', victory: 'draw muestra el puntaje final', gameover: 'draw muestra el puntaje final' };
    const caja = {}; Object.keys(P).forEach(k => { caja[k] = f.caja(P[k][0], P[k][1], 200, 72, NOM[k], { sub: SUB[k], tam: 24 }); });
    const T = [['title', 'serve', 'Enter', 0], ['serve', 'play', 'Enter', 0], ['play', 'pause', 'P', 18], ['pause', 'play', 'P', 18], ['play', 'serve', 'bola cae / nivel', 30],
      ['play', 'gameover', 'sin vidas', 0], ['play', 'victory', 'último nivel', 0], ['gameover', 'title', 'Enter', 0], ['victory', 'title', 'Enter', 0]];
    const fl = T.map(t => f.flecha(caja[t[0]], caja[t[1]], { rotulo: t[2], desvio: t[3], tam: 18, rx: t[2].length > 8 && t[3] ? 56 : 0, ry: t[2].length > 8 && t[3] ? 22 : 0 }));
    const tH = f.texto(20, 18, '', { ancla: 'start', tam: 20, tono: 'amber', peso: 700 });
    const tV = f.texto(880, 18, '', { ancla: 'end', tam: 21, tono: 'white', peso: 700 });
    const di = FIG.dice(el);
    let actual = 'title', vidas = 3, nivel = 1, usada = -1;
    function pinta() {
      Object.keys(caja).forEach(k => caja[k].tono(k === actual ? 'on' : 'base'));
      fl.forEach((x, i) => x.tono(i === usada ? 'on' : 'base'));
      tH.pon('En ' + NOM[actual] + ': ' + HACE[actual]);
      tV.pon('vidas: ' + vidas + '   nivel: ' + nivel + ' de 2');
    }
    function ir(a, b, txt) { usada = T.findIndex(t => t[0] === a && t[1] === b); actual = b; pinta(); di(txt, 'ok'); }
    function evento(ev) {
      const nombre = { enter: 'Enter', p: 'P', cae: 'Bola cae', ultimo: 'Rompe el último ladrillo' }[ev];
      if (actual === 'title' && ev === 'enter') { vidas = 3; nivel = 1; return ir('title', 'serve', 'Enter: empieza la partida con 3 vidas en el nivel 1. <b>entrar()</b> de Serve pone la bola sobre la paleta.'); }
      if (actual === 'serve' && ev === 'enter') return ir('serve', 'play', 'Enter: se lanza la bola. Desde ahora update la mueve y revisa colisiones.');
      if (actual === 'play' && ev === 'p') return ir('play', 'pause', 'P: pausa. La bola no se mueve porque update de Pause no hace nada, no porque haya un if en cada línea.');
      if (actual === 'pause' && ev === 'p') return ir('pause', 'play', 'P otra vez: se reanuda justo donde iba.');
      if (actual === 'play' && ev === 'cae') { vidas--; if (vidas > 0) return ir('play', 'serve', 'La bola cayó: queda' + (vidas === 1 ? '' : 'n') + ' ' + vidas + (vidas === 1 ? ' vida' : ' vidas') + '. De vuelta a Serve.'); return ir('play', 'gameover', 'Sin vidas: GameOver. Enter vuelve al título.'); }
      if (actual === 'play' && ev === 'ultimo') { if (nivel < 2) { nivel++; return ir('play', 'serve', 'Nivel limpio: se carga el nivel ' + nivel + ' desde los datos y se vuelve a Serve.'); } return ir('play', 'victory', 'No quedan niveles: Victory.'); }
      if ((actual === 'gameover' || actual === 'victory') && ev === 'enter') return ir(actual, 'title', 'Enter: de vuelta al título.');
      usada = -1; pinta();
      di('En <b>' + NOM[actual] + '</b> el evento «' + nombre + '» no hace nada. Cada estado decide qué eventos escucha: por eso no hacen falta banderas como <code>pausado</code> o <code>jugando</code>.', 'bad');
    }
    sinPuntero(f);
    const c = FIG.controles(el);
    c.boton('Enter', () => evento('enter'));
    c.boton('P', () => evento('p'));
    c.boton('Bola cae', () => evento('cae'), true);
    c.boton('Rompe el último ladrillo', () => evento('ultimo'), true);
    c.boton('Reiniciar', () => { actual = 'title'; vidas = 3; nivel = 1; usada = -1; pinta(); di('De vuelta al título.'); }, true);
    pinta(); di('Envía eventos con los botones. Prueba P en el título: no pasa nada.');
    return () => {};
  };

  /* 5 · breakout: un Breakout jugable con interruptores de game feel */
  window.DEMOS.breakout = function (el) {
    const W = 900, H = 460;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.tabIndex = 0;
    cv.setAttribute('aria-label', 'Mini Breakout jugable. Mueve la paleta con el puntero o con las flechas; clic o espacio para sacar; P pausa.');
    Object.assign(cv.style, { display: 'block', maxWidth: '100%', touchAction: 'none', background: C.ink, imageRendering: 'auto' });   /* el tamaño lo pone la hoja de estilos */
    el.appendChild(cv);
    const g = cv.getContext('2d');
    const NIVEL = ['2222222222', '1111111111', '11X1111X11', '1111111111'];
    const COL = { 2: C.amber, 1: C.coral };
    const opt = { shake: !quieto(), part: true, hit: true, son: false };
    const paleta = { x: W / 2 - 60, y: H - 40, w: 120, h: 14 }, bola = { x: 0, y: 0, w: 12, h: 12, vx: 0, vy: 0 };
    let ladrillos = [], vidas = 3, puntos = 0, estado = 'title', parts = [], temblor = 0, congelado = 0, izq = false, der = false, raf = 0, ult = 0, audio = null;
    function cargar() { ladrillos = []; NIVEL.forEach((fila, r) => [...fila].forEach((ch, c) => { if (ch !== '.') ladrillos.push({ x: 50 + c * 80, y: 50 + r * 30, w: 76, h: 24, vida: ch === '2' ? 2 : 1, irrompible: ch === 'X', vivo: true }); })); }
    function pegar() { bola.x = paleta.x + paleta.w / 2 - bola.w / 2; bola.y = paleta.y - bola.h; bola.vx = 0; bola.vy = 0; }
    function reiniciar() { vidas = 3; puntos = 0; parts = []; cargar(); pegar(); }
    function sacar() { const a = Math.random() * .6 - .3; bola.vx = 430 * Math.sin(a); bola.vy = -430 * Math.cos(a); estado = 'play'; }
    function sonar(fr) {
      if (!opt.son) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        const o = audio.createOscillator(), gn = audio.createGain();
        o.type = 'square'; o.frequency.value = fr; gn.gain.value = .04;
        gn.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .09);
        o.connect(gn); gn.connect(audio.destination); o.start(); o.stop(audio.currentTime + .1);
      } catch (e) { /* sin audio */ }
    }
    const sacudir = s => { if (opt.shake) temblor = Math.max(temblor, s); };
    const aabb = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    function accion() {
      if (estado === 'title') { reiniciar(); estado = 'serve'; }
      else if (estado === 'serve') sacar();
      else if (estado === 'gameover' || estado === 'victory') { reiniciar(); estado = 'serve'; }
    }
    function golpe(l) {
      if (l.irrompible) { sonar(180); sacudir(2); return; }
      l.vida--;
      if (l.vida > 0) { sonar(300); sacudir(3); return; }
      l.vivo = false; puntos += 10; sonar(520 + Math.random() * 200); sacudir(7);
      if (opt.hit) congelado = .06;
      if (opt.part) for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 220; parts.push({ x: l.x + l.w / 2, y: l.y + l.h / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: .6, c: COL[1] }); }
      if (!ladrillos.some(k => k.vivo && !k.irrompible)) { estado = 'victory'; sonar(880); }
    }
    function resolver(l) {
      const ox = Math.min(bola.x + bola.w, l.x + l.w) - Math.max(bola.x, l.x), oy = Math.min(bola.y + bola.h, l.y + l.h) - Math.max(bola.y, l.y);
      if (ox < oy) { if (bola.x + bola.w / 2 < l.x + l.w / 2) { bola.x -= ox; bola.vx = -Math.abs(bola.vx); } else { bola.x += ox; bola.vx = Math.abs(bola.vx); } }
      else { if (bola.y + bola.h / 2 < l.y + l.h / 2) { bola.y -= oy; bola.vy = -Math.abs(bola.vy); } else { bola.y += oy; bola.vy = Math.abs(bola.vy); } }
    }
    function update(dt) {
      if (izq) paleta.x -= 560 * dt; if (der) paleta.x += 560 * dt;
      paleta.x = lim(paleta.x, 0, W - paleta.w);
      temblor = Math.max(0, temblor - 40 * dt);
      if (congelado > 0) { congelado -= dt; return; }           // hit-stop: el mundo se detiene un instante
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.t -= dt; }); parts = parts.filter(p => p.t > 0);
      if (estado === 'serve') pegar();
      if (estado !== 'play') return;
      const rap = Math.hypot(bola.vx, bola.vy), pasos = Math.max(1, Math.ceil(rap * dt / (bola.w / 2))), h = dt / pasos;
      for (let k = 0; k < pasos && estado === 'play'; k++) {
        bola.x += bola.vx * h; bola.y += bola.vy * h;
        if (bola.x < 0) { bola.x = 0; bola.vx = Math.abs(bola.vx); sonar(220); }
        if (bola.x + bola.w > W) { bola.x = W - bola.w; bola.vx = -Math.abs(bola.vx); sonar(220); }
        if (bola.y < 0) { bola.y = 0; bola.vy = Math.abs(bola.vy); sonar(220); }
        if (bola.y > H) { vidas--; sonar(110); sacudir(12); estado = vidas > 0 ? 'serve' : 'gameover'; return; }
        if (bola.vy > 0 && aabb(bola, paleta)) {
          const t = lim((bola.x + bola.w / 2 - (paleta.x + paleta.w / 2)) / (paleta.w / 2), -1, 1), a = t * Math.PI / 3, v = Math.min(760, rap * 1.02);
          bola.vx = v * Math.sin(a); bola.vy = -v * Math.cos(a); bola.y = paleta.y - bola.h; sonar(330);
        }
        const l = ladrillos.find(q => q.vivo && aabb(bola, q));
        if (l) { resolver(l); golpe(l); }
      }
    }
    function draw() {
      g.save();
      g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
      if (temblor > 0) g.translate((Math.random() * 2 - 1) * temblor, (Math.random() * 2 - 1) * temblor);
      ladrillos.forEach(l => { if (!l.vivo) return; g.fillStyle = l.irrompible ? C.grey : COL[l.vida] || C.coral; g.fillRect(l.x, l.y, l.w, l.h); });
      g.fillStyle = C.teal; g.fillRect(paleta.x, paleta.y, paleta.w, paleta.h);
      g.fillStyle = C.white; g.fillRect(bola.x, bola.y, bola.w, bola.h);
      parts.forEach(p => { g.globalAlpha = Math.max(0, p.t / .6); g.fillStyle = p.c; g.fillRect(p.x - 3, p.y - 3, 6, 6); }); g.globalAlpha = 1;
      g.restore();
      g.fillStyle = C.soft; g.font = '700 18px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('vidas ' + vidas + '   puntos ' + puntos, 14, 28);
      g.textAlign = 'right'; g.fillText(estado.toUpperCase(), W - 14, 28);
      const msg = { title: 'Clic o espacio para empezar', serve: 'Clic o espacio para sacar', pause: 'Pausa · P para seguir', victory: '¡Victoria! Clic para jugar otra vez', gameover: 'GameOver · clic para reintentar' }[estado];
      if (msg) { g.textAlign = 'center'; g.fillStyle = C.white; g.font = '700 26px system-ui, sans-serif'; g.fillText(msg, W / 2, H / 2 + 40); }
    }
    function tick(t) { const dt = ult ? Math.min(.033, (t - ult) / 1000) : 0; ult = t; if (estado !== 'pause') update(dt); draw(); raf = requestAnimationFrame(tick); }
    const xCanvas = e => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    cv.addEventListener('pointermove', e => { paleta.x = lim(xCanvas(e) - paleta.w / 2, 0, W - paleta.w); });
    cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.focus(); paleta.x = lim(xCanvas(e) - paleta.w / 2, 0, W - paleta.w); accion(); });
    cv.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'ArrowLeft') izq = true; else if (k === 'ArrowRight') der = true;
      else if (k === ' ' || k === 'Enter') accion();
      else if (k === 'p' || k === 'P') { if (estado === 'play') estado = 'pause'; else if (estado === 'pause') estado = 'play'; }
      else return;
      e.preventDefault(); e.stopPropagation();
    });
    cv.addEventListener('keyup', e => { if (e.key === 'ArrowLeft') izq = false; if (e.key === 'ArrowRight') der = false; });
    const c = FIG.controles(el);
    c.casilla('Screen shake', v => { opt.shake = v; if (!v) temblor = 0; }, opt.shake);
    c.casilla('Partículas', v => { opt.part = v; }, opt.part);
    c.casilla('Hit-stop', v => { opt.hit = v; }, opt.hit);
    c.casilla('Sonido', v => { opt.son = v; if (v) sonar(440); }, opt.son);
    c.boton('Reiniciar', () => { reiniciar(); estado = 'title'; cv.focus(); }, true);
    const di = FIG.dice(el);
    di('Juega una partida con todo apagado y otra con todo encendido. Las reglas son idénticas: solo cambia cómo se siente cada golpe. Los ladrillos ámbar aguantan dos golpes y los grises no se rompen.');
    reiniciar(); raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); if (audio && audio.close) audio.close(); };
  };
})();
