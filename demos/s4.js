/* Figuras de la sesión 4 · Lua y LÖVE.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   teatro: LÖVE llama load una vez y luego update/draw en bucle · cajones: una lista de Lua empieza en 1
   referencia: las tablas se comparten, los números se copian · teclas: isDown frente a keypressed
   pantalla: coordenadas de LÖVE, con la y hacia abajo. */
(function () {
  window.DEMOS = window.DEMOS || {};
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const MONO = 'ui-monospace, Consolas, monospace';
  const mono = t => { t.t.setAttribute('font-family', MONO); return t; };

  /* 1 · El teatro: el director (LÖVE) llama a escena; tú solo escribes qué pasa cuando te toca */
  window.DEMOS.teatro = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const dir = f.caja(300, 14, 300, 64, 'LÖVE, el director', { tam: 24, tono: 'paper' });
    const L = f.caja(30, 128, 250, 96, 'love.load()', { tam: 24, sub: 'una sola vez' });
    const U = f.caja(325, 128, 250, 96, 'love.update(dt)', { tam: 24, sub: 'cada frame' });
    const D = f.caja(620, 128, 250, 96, 'love.draw()', { tam: 24, sub: 'cada frame' });
    const K = f.caja(620, 244, 250, 50, 'love.keypressed(k)', { tam: 20 });
    const fl = [L, U, D].map(c => f.flecha(dir, c));
    const mem = mono(f.texto(30, 268, '', { tam: 22, tono: 'white', ancla: 'start', peso: 700 }));
    f.texto(30, 304, 'la pantalla', { tam: 18, ancla: 'start' });
    f.nodo('rect', { x: 30, y: 318, width: 840, height: 64, fill: '#111', stroke: FIG.C.grey, 'stroke-width': 2 });
    const sq = f.nodo('rect', { x: 34, y: 330, width: 40, height: 40, fill: FIG.C.coral });
    const cnt = mono(f.texto(450, 424, '', { tam: 21, tono: 'soft' }));
    let cargado, fase, frame, nL, nU, nD, x, xDib, tecla, timer = 0, ritmo = 4;
    const di = FIG.dice(el);
    function luz(b) {
      [L, U, D, K].forEach(c => c.tono(c === b ? 'on' : 'base'));
      fl.forEach((a, i) => a.tono([L, U, D][i] === b ? 'on' : 'base'));
    }
    function pinta() {
      mem.pon('en memoria: x = ' + (cargado ? x : '?'));
      sq.setAttribute('x', 34 + xDib * 0.99);
      sq.style.display = nD ? '' : 'none';
      cnt.pon(`frame ${frame}  ·  load: ${nL}  ·  update: ${nU}  ·  draw: ${nD}`);
    }
    function paso() {
      if (!cargado) {
        cargado = true; nL++; x = 0; luz(L); pinta();
        return di('<b>love.load()</b>: LÖVE la llama <b>una sola vez</b>, al arrancar. Aquí preparas el mundo: <code>x = 0</code>. Sigue dando Paso: no vuelve a salir.', 'ok');
      }
      if (fase === 'update') {
        if (tecla) {
          tecla = false; x = 0; luz(K); pinta();
          return di('Pulsaste espacio. Antes del siguiente update, LÖVE llama <b>love.keypressed("space")</b> una sola vez. Tu código decidió qué hacer: <code>x = 0</code>.', 'ok');
        }
        frame++; nU++; x += 20; if (x > 800) x = 0; fase = 'draw'; luz(U); pinta();
        return di(`Frame ${frame}: <b>update</b> cambió x a ${x} en memoria (<code>x = x + 200 * dt</code>, con dt = 0.1). Mira la pantalla: todavía no se movió.`);
      }
      nD++; xDib = x; fase = 'update'; luz(D); pinta();
      di(`<b>draw</b> pinta el cuadro donde dice x = ${x}. Recién ahora se ve. Y otra vez: update, draw, update, draw...`);
    }
    const c = FIG.controles(el);
    c.boton('Paso', () => { stop(); paso(); });
    const bt = c.boton('Reproducir', play, true);
    c.boton('Pulsar espacio', () => {
      if (!cargado) return di('El juego no ha arrancado: primero LÖVE llama a load.');
      tecla = true; di('Tecla en espera. En el próximo turno LÖVE llamará a <b>keypressed</b> antes del update.');
    }, true);
    c.deslizador('Llamadas por segundo', 1, 12, 4, 1, v => { ritmo = v; if (timer) { clearInterval(timer); timer = setInterval(paso, 1000 / ritmo); } });
    c.boton('Reiniciar', reset, true);
    function stop() { clearInterval(timer); timer = 0; bt.textContent = 'Reproducir'; }
    function play() { if (timer) return stop(); bt.textContent = 'Pausa'; timer = setInterval(paso, 1000 / ritmo); }
    function reset() {
      stop(); cargado = false; fase = 'update'; frame = nL = nU = nD = 0; x = 0; xDib = 0; tecla = false; luz(null); pinta();
      di(quieto() ? 'El telón está abajo. Dale <b>Paso</b> varias veces y mira a quién llama LÖVE primero.' : 'El telón está abajo. Dale <b>Paso</b> o <b>Reproducir</b> y mira a quién llama LÖVE primero.');
    }
    reset();
    return () => clearInterval(timer);
  };

  /* 2 · Tablas como cajones numerados desde 1 */
  window.DEMOS.cajones = function (el) {
    const f = FIG.lienzo(el, 900, 420), N = 8, W = 88, X = i => 20 + i * 97;
    const linea = mono(f.texto(450, 40, '', { tam: 24, tono: 'white', peso: 700 }));
    const caj = [];
    for (let i = 0; i <= N; i++) {
      mono(f.texto(X(i) + W / 2, 108, '[' + i + ']', { tam: 20, tono: i ? 'soft' : 'grey' }));
      caj.push(f.caja(X(i), 128, W, 110, '', { tam: 21 }));
    }
    const len = mono(f.texto(450, 284, '', { tam: 26, tono: 'white', peso: 700 }));
    const res = mono(f.texto(450, 332, '', { tam: 24, tono: 'amber', peso: 700 }));
    f.texto(450, 388, 'en una lista de Lua el primer cajón es el [1]; el [0] no existe', { tam: 20 });
    const NOMBRES = ['cobre', 'jade', 'rubí', 'perla', 'ónix'];
    let t, k, timer = 0;
    const di = FIG.dice(el);
    function pinta(resalta, tono) {
      caj.forEach((c, i) => {
        const v = i === 0 ? undefined : t[i - 1];
        c.rotulo(i === 0 ? '—' : v === undefined ? '' : v);
        c.tono(i === resalta ? tono : (i === 0 || v === undefined) ? 'off' : 'base');
      });
      len.pon('#monedas = ' + t.length);
    }
    function para() { clearInterval(timer); timer = 0; }
    function reset() {
      para(); t = ['oro', 'plata', 'bronce']; k = 0; linea.pon('local monedas = { "oro", "plata", "bronce" }'); res.pon(''); pinta(-1);
      di('Tres monedas en tres cajones. Antes de tocar nada, predice: ¿qué devuelve <code>monedas[0]</code>?');
    }
    function leer(i, txt) {
      para(); linea.pon('print(monedas[' + txt + '])');
      const v = i >= 1 ? t[i - 1] : undefined;
      pinta(i >= 0 && i <= N ? i : -1, v === undefined ? 'bad' : 'on');
      res.pon('--> ' + (v === undefined ? 'nil' : v));
      if (txt === '0') di('El cajón 0 no existe en una lista de Lua: devuelve <b>nil</b>, sin avisar. Si después haces <code>monedas[0].x</code>, ahí sí se cae: <i>attempt to index a nil value</i>.', 'bad');
      else if (v === undefined) di(`<code>monedas[${txt}]</code> es el cajón ${i}, y está vacío: <b>nil</b>. Pedir uno más allá del final no da error, da nil.`, 'bad');
      else if (txt === '1') di('El primero es el <b>1</b>. Si vienes de otro lenguaje que cuenta desde 0, aquí es distinto.', 'ok');
      else di(`<code>#monedas</code> vale ${t.length}, así que <code>monedas[#monedas]</code> es el último: <b>${v}</b>.`, 'ok');
    }
    const c = FIG.controles(el);
    c.boton('table.insert', () => {
      para();
      if (t.length >= N) return di('En el dibujo ya no caben más cajones. En Lua sí: la lista crece sola.');
      const v = NOMBRES[k++ % NOMBRES.length]; t.push(v);
      linea.pon(`table.insert(monedas, "${v}")`); pinta(t.length, 'ok'); res.pon('--> va al cajón [' + t.length + ']');
      di(`<code>table.insert</code> agrega al final, en el cajón <b>${t.length}</b>. <code>#monedas</code> ahora vale ${t.length}.`, 'ok');
    });
    c.boton('table.remove(monedas, 1)', () => {
      para(); linea.pon('table.remove(monedas, 1)');
      if (!t.length) { pinta(-1); res.pon('--> nil'); return di('La lista está vacía: no hay nada que quitar.', 'bad'); }
      const v = t.shift(); pinta(-1); res.pon('--> devuelve ' + v);
      di(`Se quitó <b>${v}</b> y todos los demás <b>bajaron un cajón</b>: el que estaba en el 2 ahora está en el 1. No queda un hueco.`, 'ok');
    }, true);
    c.boton('leer [0]', () => leer(0, '0'), true);
    c.boton('leer [1]', () => leer(1, '1'), true);
    c.boton('leer [#monedas]', () => leer(t.length, '#monedas'), true);
    c.boton('leer [#monedas + 1]', () => leer(t.length + 1, '#monedas + 1'), true);
    c.boton('Recorrer con ipairs', () => {
      para(); let i = 0;
      linea.pon('for i, m in ipairs(monedas) do print(i, m) end');
      const sig = () => {
        i++;
        if (i > t.length) {
          para(); pinta(i <= N ? i : -1, 'bad'); res.pon('cajón ' + i + ' = nil: ipairs se detiene');
          return di('ipairs recorre <b>1, 2, 3...</b> en orden y se detiene en el primer cajón vacío. Para listas, eso es justo lo que quieres.', 'ok');
        }
        pinta(i, 'on'); res.pon('i = ' + i + '   m = ' + t[i - 1]);
      };
      sig(); timer = setInterval(sig, quieto() ? 900 : 650);
    });
    c.boton('Reiniciar', reset, true);
    reset();
    return () => clearInterval(timer);
  };

  /* 3 · Las tablas se comparten; los números se copian */
  window.DEMOS.referencia = function (el) {
    const f = FIG.lienzo(el, 900, 420);
    const A = f.caja(40, 50, 190, 90, 'a', { tam: 30 });
    const B = f.caja(40, 240, 190, 90, 'b', { tam: 30 });
    const T1 = f.caja(450, 50, 380, 100, '', { tam: 26, sub: 'tabla 1' });
    const T2 = f.caja(450, 240, 380, 100, '', { tam: 26, sub: 'tabla 2' });
    const aT1 = f.flecha(A, T1, { rotulo: 'apunta a' }), bT1 = f.flecha(B, T1, { rotulo: 'apunta a', ry: 34 }), bT2 = f.flecha(B, T2, { rotulo: 'apunta a' });
    const cod = mono(f.texto(450, 388, '', { tam: 22, tono: 'white', peso: 700 }));
    let modo = 0, t1, t2, bRef, na, nb, tocada;
    const di = FIG.dice(el);
    function pinta() {
      const tab = modo === 0;
      A.rotulo(tab ? 'a' : 'a = ' + na); B.rotulo(tab ? 'b' : 'b = ' + nb);
      T1.ver(tab).rotulo('{ vida = ' + t1.vida + ' }').tono(tab && tocada === 1 ? 'bad' : 'base');
      T2.ver(tab && bRef === 2); if (t2) T2.rotulo('{ vida = ' + t2.vida + ' }').tono(tocada === 2 ? 'ok' : 'base');
      aT1.ver(tab); bT1.ver(tab && bRef === 1); bT2.ver(tab && bRef === 2);
      B.tono(!tab && nb !== na ? 'ok' : 'base');
    }
    function reset() {
      t1 = { vida: 100 }; t2 = null; bRef = 1; na = 100; nb = 100; tocada = 0; pinta();
      if (modo === 0) { cod.pon('local a = { vida = 100 };  local b = a'); di('Hay <b>una sola tabla</b> y dos etiquetas que apuntan a ella. Predice: si cambias la vida por <code>b</code>, ¿qué ve <code>a</code>?'); }
      else { cod.pon('local a = 100;  local b = a'); di('Con números es distinto: <code>b = a</code> copia el valor. Cada uno tiene el suyo.'); }
    }
    const c = FIG.controles(el);
    c.opciones(['Con una tabla', 'Con un número'], i => { modo = i; reset(); });
    c.boton('Cambiar por b', () => {
      if (modo === 1) { nb = 0; tocada = 0; pinta(); cod.pon('b = 0'); return di('Cambiaste <code>b</code>. Ahora mira <code>a</code>.'); }
      if (bRef === 1) { t1.vida = 0; tocada = 1; cod.pon('b.vida = 0'); di('Cambiaste la vida «por b». Pero b no tiene tabla propia: apunta a la misma. Ahora pide <code>print(a.vida)</code>.'); }
      else { t2.vida = 0; tocada = 2; cod.pon('b.vida = 0'); di('Cambiaste la copia. La tabla de a no se enteró.', 'ok'); }
      pinta();
    });
    c.boton('print(a)', () => {
      if (modo === 1) { cod.pon('print(a)   --> ' + na); return di(`<code>a</code> sigue en <b>${na}</b>. Números, textos y booleanos se copian.`, 'ok'); }
      cod.pon('print(a.vida)   --> ' + t1.vida);
      if (t1.vida === 0) di('<code>a.vida</code> también es <b>0</b>. Nadie tocó a <code>a</code>... salvo que <code>a</code> y <code>b</code> son <b>la misma tabla</b>. Por eso una función que recibe una tabla puede cambiar tus datos.', 'bad');
      else di(`<code>a.vida</code> sigue en <b>${t1.vida}</b>.`, 'ok');
    }, true);
    c.boton('Hacer una copia de verdad', () => {
      if (modo === 1) return di('Con números no hace falta: ya es una copia.');
      t2 = { vida: t1.vida }; bRef = 2; tocada = 0; pinta();
      cod.pon('local b = { vida = a.vida }   -- tabla nueva');
      di('Ahora <code>b</code> apunta a una <b>tabla nueva</b> con los mismos valores. Lua no copia tablas solo: la copia se hace a mano.', 'ok');
    }, true);
    c.boton('Reiniciar', reset, true);
    reset();
  };

  /* 4 · isDown (continuo, se pregunta cada frame) frente a keypressed (una vez por pulsación) */
  window.DEMOS.teclas = function (el) {
    const f = FIG.lienzo(el, 900, 430), SUELO = 282;
    f.texto(30, 26, 'caminar con isDown: update pregunta en cada frame', { tam: 21, ancla: 'start', tono: 'white', peso: 700 });
    f.linea(30, 120, 870, 120, { grosor: 2, color: 'rgba(255,255,255,.35)' });
    const cam = f.circulo(60, 98, 22, { tono: 'teal' });
    const tit2 = f.texto(30, 150, '', { tam: 21, ancla: 'start', tono: 'white', peso: 700 });
    f.linea(30, SUELO + 22, 870, SUELO + 22, { grosor: 2, color: 'rgba(255,255,255,.35)' });
    const sal = f.circulo(450, SUELO, 22, { tono: 'amber' });
    f.texto(30, 330, 'el último segundo, frame a frame', { tam: 17, ancla: 'start' });
    const barras = [];
    for (let i = 0; i < 60; i++) barras.push(f.nodo('rect', { x: 30 + i * 14, y: 344, width: 11, height: 24, fill: '#252528' }));
    const cnt = mono(f.texto(450, 400, '', { tam: 19, tono: 'soft' }));
    let modo = 0, abajo = false, pendiente = false, x = 60, y = SUELO, vy = 0, nAbajo = 0, nPress = 0, hist = [], raf = 0, last = performance.now(), vivo = true;
    const di = FIG.dice(el, 'Mantén presionado el botón <b>Tecla</b> (o enfócalo y deja oprimida la barra espaciadora). Suéltalo y vuelve a pulsar.');
    function titulo() { tit2.pon(modo ? 'saltar con isDown (el error clásico)' : 'saltar con keypressed: LÖVE avisa una vez por pulsación'); }
    const c = FIG.controles(el);
    const bt = c.boton('Tecla (mantén presionado)', () => {});
    const baja = e => { if (e) e.preventDefault(); if (!abajo) pendiente = true; abajo = true; };
    const sube = () => { abajo = false; };
    bt.addEventListener('pointerdown', baja);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => bt.addEventListener(ev, sube));
    bt.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); if (!e.repeat) baja(); } });
    bt.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') sube(); });
    c.opciones(['Saltar con keypressed', 'Saltar con isDown'], i => {
      modo = i; titulo();
      di(modo ? 'Ahora el salto también se pregunta con isDown. Mantén la tecla y mira la bola ámbar.' : 'El salto vuelve a keypressed: una pulsación, un salto.', modo ? 'bad' : 'ok');
    });
    c.boton('Reiniciar', () => { x = 60; y = SUELO; vy = 0; nAbajo = 0; nPress = 0; hist = []; }, true);
    titulo();
    function frame(now) {
      if (!vivo) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const pulso = pendiente; pendiente = false;
      if (abajo) { nAbajo++; x += 240 * dt; if (x > 850) x = 50; }
      if (pulso) nPress++;
      if (modo === 0 ? (pulso && y >= SUELO) : abajo) vy = -520;
      vy += 1500 * dt; y += vy * dt;
      if (y >= SUELO) { y = SUELO; vy = 0; }
      if (y < 168) { y = 168; vy = 0; }
      cam.mover(x, 98); sal.mover(450, y);
      hist.push(pulso ? 2 : abajo ? 1 : 0); if (hist.length > 60) hist.shift();
      barras.forEach((r, i) => { const h = hist[i]; r.setAttribute('fill', h === 2 ? FIG.C.coral : h === 1 ? FIG.C.amber : '#252528'); });
      cnt.pon(`frames con isDown verdadero: ${nAbajo}   ·   llamadas a keypressed: ${nPress}`);
      if (modo === 1 && abajo && y <= 170) di('Salta en <b>cada frame</b> mientras mantienes la tecla: unos 60 saltos por segundo, pegado al techo. Para una acción puntual, usa <b>keypressed</b>.', 'bad');
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { vivo = false; cancelAnimationFrame(raf); };
  };

  /* 5 · Coordenadas de pantalla: el origen arriba a la izquierda y la y hacia abajo */
  window.DEMOS.pantalla = function (el) {
    const f = FIG.lienzo(el, 900, 440), S = 0.6, OX = 40, OY = 40, AW = 800 * S, AH = 600 * S;
    const pant = f.nodo('rect', { x: OX, y: OY, width: AW, height: AH, fill: '#111', stroke: FIG.C.soft, 'stroke-width': 2, style: 'cursor:crosshair' });
    for (let g = 100; g < 800; g += 100) f.linea(OX + g * S, OY, OX + g * S, OY + AH, { color: 'rgba(255,255,255,.08)' });
    for (let g = 100; g < 600; g += 100) f.linea(OX, OY + g * S, OX + AW, OY + g * S, { color: 'rgba(255,255,255,.08)' });
    const eX = [f.flecha([OX + 8, OY + 22], [OX + 120, OY + 22], { tono: 'on' }), f.flecha([OX + 8, OY + AH - 22], [OX + 120, OY + AH - 22], { tono: 'on' })];
    const eY = [f.flecha([OX + 22, OY + 8], [OX + 22, OY + 120], { tono: 'on' }), f.flecha([OX + 22, OY + AH - 8], [OX + 22, OY + AH - 120], { tono: 'on' })];
    const o1 = mono(f.texto(OX, OY - 16, '(0, 0)', { tam: 18, ancla: 'start', tono: 'amber' }));
    const o2 = mono(f.texto(OX + AW, OY + AH + 18, '(800, 600)', { tam: 18, ancla: 'end' }));
    const gx = f.linea(0, 0, 0, 0, { puntos: true, color: 'rgba(255,200,61,.5)' }), gy = f.linea(0, 0, 0, 0, { puntos: true, color: 'rgba(255,200,61,.5)' });
    const bola = f.circulo(0, 0, 20 * S, { tono: 'coral' });
    const c1 = mono(f.texto(560, 90, 'love.graphics.circle(', { tam: 21, ancla: 'start', tono: 'white' }));
    const c2 = mono(f.texto(560, 122, '', { tam: 21, ancla: 'start', tono: 'amber', peso: 700 }));
    const nota = f.texto(560, 190, '', { tam: 19, ancla: 'start' });
    const nota2 = f.texto(560, 220, '', { tam: 19, ancla: 'start' });
    f.texto(560, 300, 'toca la pantalla para poner la bola', { tam: 17, ancla: 'start' });
    let modo = 0, x = 400, y = 300;
    const di = FIG.dice(el, 'La ventana mide 800 × 600. Mueve los deslizadores o toca la pantalla. Antes de pulsar <b>y = y + 100</b>, predice: ¿sube o baja?');
    const sy = v => modo === 0 ? OY + v * S : OY + AH - v * S;
    function pinta() {
      const cx = OX + x * S, cy = sy(y);
      bola.mover(cx, cy);
      gx.setAttribute('x1', cx); gx.setAttribute('x2', cx); gx.setAttribute('y1', modo === 0 ? OY : OY + AH); gx.setAttribute('y2', cy);
      gy.setAttribute('y1', cy); gy.setAttribute('y2', cy); gy.setAttribute('x1', OX); gy.setAttribute('x2', cx);
      eX[0].ver(modo === 0); eY[0].ver(modo === 0); eX[1].ver(modo === 1); eY[1].ver(modo === 1);
      o1.pon('(0, 0)').t.setAttribute('y', modo === 0 ? OY - 16 : OY + AH + 18);
      o2.pon(modo === 0 ? '(800, 600)' : '(800, 600)').t.setAttribute('y', modo === 0 ? OY + AH + 18 : OY - 16);
      c2.pon(`  "fill", ${x}, ${y}, 20)`);
      nota.pon(modo === 0 ? 'x crece hacia la derecha' : 'x crece hacia la derecha');
      nota2.pon(modo === 0 ? 'y crece hacia ABAJO' : 'y crece hacia arriba (no es LÖVE)');
    }
    const c = FIG.controles(el);
    c.opciones(['Pantalla de LÖVE', 'Plano del colegio'], i => {
      modo = i; pinta();
      di(modo ? 'Así es el plano cartesiano del colegio: el origen abajo y la y hacia arriba. <b>LÖVE no funciona así.</b>' : 'En LÖVE (y en casi todas las pantallas) el origen está <b>arriba a la izquierda</b> y la y crece hacia abajo.', modo ? 'bad' : 'ok');
    });
    const ix = c.deslizador('x', 0, 800, 400, 10, v => { x = v; pinta(); });
    const iy = c.deslizador('y', 0, 600, 300, 10, v => { y = v; pinta(); });
    const pon = (nx, ny) => { ix.value = nx; ix.dispatchEvent(new Event('input')); iy.value = ny; iy.dispatchEvent(new Event('input')); };
    c.boton('y = y + 100', () => {
      pon(x, Math.min(600, y + 100));
      di(modo === 0 ? 'La y aumentó y la bola <b>bajó</b>. Por eso en Coin Hunt la flecha abajo suma a la y.' : 'En el plano del colegio la bola subió. En LÖVE habría bajado: no mezcles los dos.', modo === 0 ? 'ok' : 'bad');
    }, true);
    c.boton('Centro (400, 300)', () => { pon(400, 300); di('El centro de una ventana de 800 × 600 es <b>(400, 300)</b>: la mitad de cada lado. Ahí nace el jugador de Coin Hunt.', 'ok'); }, true);
    pant.addEventListener('click', e => {
      const pt = f.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(f.svg.getScreenCTM().inverse());
      const nx = Math.round((p.x - OX) / S / 10) * 10, vy = (p.y - OY) / S;
      const ny = Math.round((modo === 0 ? vy : 600 - vy) / 10) * 10;
      pon(Math.max(0, Math.min(800, nx)), Math.max(0, Math.min(600, ny)));
      di(`Pusiste la bola en <b>(${x}, ${y})</b>. ${modo === 0 && y > 300 ? 'Está en la mitad de abajo: y mayor que 300.' : modo === 0 ? 'Está en la mitad de arriba: y menor que 300.' : ''}`);
    });
    pinta();
  };
})();
