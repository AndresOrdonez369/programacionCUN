/* Figuras de la sesión 3 · POO y arquitectura.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   molde, responsabilidades, encapsulacion, polimorfismo y estadosObjeto usan solo FIG (assets/fig.js). */
window.DEMOS = window.DEMOS || {};
(function () {
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const mono = t => { t.t.setAttribute('font-family', 'JetBrains Mono, monospace'); return t; };

  /* 1 · El molde de galletas: una clase, muchas instancias con su propio estado */
  window.DEMOS.molde = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const molde = f.caja(24, 24, 270, 64, 'Ladrillo · el molde', { tam: 24, tono: 'on' });
    f.nodo('rect', { x: 24, y: 96, width: 270, height: 250, rx: 2, fill: 'none', stroke: FIG.C.amber, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
    f.texto(40, 124, 'estado (de cada uno)', { tam: 18, tono: 'amber', ancla: 'start', peso: 700 });
    mono(f.texto(40, 156, 'x, y, golpes', { tam: 20, tono: 'white', ancla: 'start' }));
    f.texto(40, 206, 'comportamiento (compartido)', { tam: 18, tono: 'teal', ancla: 'start', peso: 700 });
    mono(f.texto(40, 238, 'recibirGolpe()', { tam: 20, tono: 'white', ancla: 'start' }));
    const nuevo = mono(f.texto(40, 272, 'soltarPremio()', { tam: 20, tono: 'teal', ancla: 'start' })).ver(false);
    const cuenta = f.texto(159, 380, '', { tam: 20 });
    const SLOT = Array.from({ length: 8 }, (_, i) => [340 + (i % 4) * 136, 40 + Math.floor(i / 4) * 170]);
    const GOLPES = [1, 3, 2, 2, 1, 3, 2, 1];
    const caja = SLOT.map((p, i) => f.caja(p[0], p[1], 124, 110, 'ladrillo ' + (i + 1), { tam: 19, sub: 'golpes: 0', clic: () => golpear(i) }).ver(false));
    const premio = SLOT.map(p => f.texto(p[0] + 62, p[1] + 132, 'soltarPremio()', { tam: 15, tono: 'teal' }).ver(false));
    f.flecha(molde, [330, 56], { rotulo: 'crea', tam: 18 });
    const di = FIG.dice(el);
    let n = 0, golpes = [], ensenado = false;
    const tono = g => (g >= 3 ? 'ok' : g === 2 ? 'on' : g === 1 ? 'bad' : 'off');

    function pinta() {
      caja.forEach((c, i) => {
        c.ver(i < n);
        if (i < n) c.sub(golpes[i] > 0 ? 'golpes: ' + golpes[i] : 'roto').tono(tono(golpes[i]));
      });
      premio.forEach((p, i) => p.ver(ensenado && i < n));
      nuevo.ver(ensenado);
      cuenta.pon('1 molde · ' + n + (n === 1 ? ' instancia' : ' instancias'));
    }
    function golpear(i) {
      if (i >= n) return;
      if (golpes[i] <= 0) { di('El ladrillo ' + (i + 1) + ' ya está roto. Los demás siguen igual.'); return; }
      golpes[i]--;
      pinta();
      di(`Golpeaste el <b>ladrillo ${i + 1}</b>: le quedan ${golpes[i]}. ${n > 1 ? 'Los otros ' + (n - 1) + ' no cambiaron: <b>cada instancia lleva su propio estado</b>.' : 'Hornea otro y compara.'}`, golpes[i] === 0 ? 'bad' : 'ok');
    }
    const c = FIG.controles(el);
    c.boton('Hornear un ladrillo', () => {
      if (n >= SLOT.length) { di('Ya no caben más en la figura, pero el molde podría sacar mil.'); return; }
      golpes[n] = GOLPES[n]; n++; pinta();
      di(n === 1 ? 'Primera galleta. <b>Tócala</b> para golpearla, o hornea más.' : `Mismo molde, ${n} ladrillos, cada uno con sus golpes. <b>Toca uno</b> para golpearlo.`);
    });
    c.boton('Enseñarle al molde: soltarPremio()', () => {
      ensenado = true; pinta();
      di(n ? `Cambiaste el molde una vez y <b>los ${n} ladrillos</b> ya saben soltar un premio. El comportamiento viene del molde.` : 'El molde ya sabe soltar premios. Hornea ladrillos: todos nacerán sabiéndolo.', 'ok');
    });
    c.boton('Reiniciar', () => { n = 0; golpes = []; ensenado = false; pinta(); di('Un molde y ninguna galleta todavía. <b>Hornea</b> unos ladrillos.'); }, true);
    pinta();
    di('Un molde y ninguna galleta todavía. <b>Hornea</b> unos ladrillos.');
  };

  /* 2 · ¿Quién debería hacer esto? Repartir responsabilidades del Breakout */
  window.DEMOS.responsabilidades = function (el) {
    const f = FIG.lienzo(el, 900, 400);
    const CL = ['Bola', 'Paleta', 'Ladrillo', 'Nivel', 'Partida'];
    const CASOS = [
      ['Moverse según su velocidad', 'y rebotar en las paredes.', 0, 'La bola tiene su posición y su velocidad: <b>tiene los datos</b> para hacerlo.'],
      ['Seguir al teclado sin', 'salirse de la pantalla.', 1, 'La paleta sabe su x, su ancho y su rapidez. Ella se limita a sí misma.'],
      ['Saber cuántos golpes', 'le quedan.', 2, 'Es el estado de cada ladrillo. Cada instancia lleva el suyo.'],
      ['Decir si ya no quedan', 'ladrillos (nivel ganado).', 3, 'Un ladrillo no conoce a los demás. <b>El nivel tiene la lista</b>, así que él puede contarlos.'],
      ['Llevar el puntaje', 'y las vidas.', 4, 'No es de la bola ni del ladrillo: es de la partida. Los demás le <b>piden</b> sumar o restar.'],
      ['Cambiar de color', 'cuando lo golpean.', 2, 'Depende de sus golpes, así que es del ladrillo. Nadie más necesita saberlo.'],
      ['Cargar dónde va cada', 'ladrillo del nivel 2.', 3, 'El nivel crea y guarda sus ladrillos. La partida solo le pide «carga el nivel 2».']
    ];
    f.nodo('rect', { x: 24, y: 20, width: 852, height: 150, rx: 2, fill: FIG.C.paper });
    const l1 = f.texto(450, 70, '', { tam: 30, color: FIG.C.ink, peso: 700 }), l2 = f.texto(450, 118, '', { tam: 30, color: FIG.C.ink, peso: 700 });
    const caja = CL.map((n, i) => f.caja(24 + i * 172, 210, 160, 84, n, { tam: 26, clic: () => elegir(i) }));
    const prog = f.texto(450, 350, '', { tam: 22 });
    const di = FIG.dice(el);
    let k = 0, aciertos = 0, resp = false;
    const marcador = () => prog.pon(`Tarea ${k + 1} de ${CASOS.length} · aciertos: ${aciertos}`);
    function pinta() {
      l1.pon(CASOS[k][0]); l2.pon(CASOS[k][1]);
      caja.forEach(c => c.tono('base'));
      marcador();
      di('¿Qué clase debería encargarse? <b>Toca una.</b>');
    }
    function elegir(i) {
      if (resp) return;
      resp = true;
      const ok = CASOS[k][2];
      if (i === ok) aciertos++;
      caja.forEach((c, j) => c.tono(j === ok ? 'ok' : j === i ? 'bad' : 'off'));
      marcador();
      di((i === ok ? '<b>Bien.</b> ' : `<b>Mejor: ${CL[ok]}.</b> `) + CASOS[k][3], i === ok ? 'ok' : 'bad');
    }
    const c = FIG.controles(el);
    c.boton('Siguiente tarea', () => { k = (k + 1) % CASOS.length; if (k === 0) aciertos = 0; resp = false; pinta(); });
    c.boton('Empezar de nuevo', () => { k = 0; aciertos = 0; resp = false; pinta(); }, true);
    pinta();
  };

  /* 3 · Encapsulación: pide, no metas la mano */
  window.DEMOS.encapsulacion = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const QUIEN = [['Bola', 'resta 1', 1], ['Enemigo', 'resta 1', 1], ['Trampa', 'resta 5', 5]];
    const llamador = QUIEN.map((q, i) => f.caja(24, 40 + i * 140, 200, 80, q[0], { tam: 26, sub: q[1] }));
    f.nodo('rect', { x: 320, y: 90, width: 310, height: 290, rx: 2, fill: 'rgba(255,255,255,.03)', stroke: FIG.C.white, 'stroke-width': 3 });
    f.texto(475, 66, 'Jugador (el objeto)', { tam: 22, tono: 'white', peso: 800 });
    f.texto(475, 118, 'la cocina: privado', { tam: 17, tono: 'soft' });
    const campo = f.caja(375, 136, 200, 74, 'vidas = 3', { tam: 26 });
    const puerta = f.caja(355, 270, 240, 74, 'perderVida()', { tam: 24, tono: 'on', sub: 'la puerta: pública' });
    const directo = llamador.map(l => f.flecha(l, campo, { tono: 'bad' }));
    const pide = llamador.map(l => f.flecha(l, puerta));
    f.texto(770, 66, 'Lo que ve el jugador', { tam: 20, tono: 'white', peso: 800 });
    const hud = f.caja(676, 100, 200, 80, 'vidas: 3', { tam: 26 });
    const fin = f.caja(676, 220, 200, 80, 'Jugando', { tam: 20 });
    const regla = f.texto(775, 340, '', { tam: 17 });
    const di = FIG.dice(el);
    let modo = 0, vidas = 3, terminado = false;

    function pinta(i) {
      directo.forEach((d, j) => d.ver(modo === 0).tono(j === i ? 'bad' : 'off'));
      pide.forEach((p, j) => p.ver(modo === 1).tono(j === i ? 'ok' : 'base'));
      campo.rotulo('vidas = ' + vidas).tono(vidas < 0 ? 'bad' : 'base');
      hud.rotulo('vidas: ' + vidas).tono(vidas < 0 ? 'bad' : 'base');
      fin.rotulo(terminado ? 'Fin de la partida' : 'Jugando').tono(terminado ? 'paper' : vidas <= 0 ? 'bad' : 'base');
      regla.pon(modo === 0 ? 'regla «no bajar de 0»: en ningún lado' : 'regla «no bajar de 0»: dentro de perderVida');
    }
    function golpe(i) {
      const n = QUIEN[i][2], nom = QUIEN[i][0];
      if (modo === 0) {
        vidas -= n;
        pinta(i);
        if (vidas < 0) di(`La ${nom.toLowerCase()} escribió <code>jugador.vidas = jugador.vidas - ${n}</code>. Quedan <b>${vidas} vidas y el juego sigue</b>: nadie revisó la regla.`, 'bad');
        else if (vidas === 0) di('Vidas en 0, pero <b>nadie avisa el fin de la partida</b>: cada uno restó por su cuenta y ninguno se encargó.', 'bad');
        else di(`La ${nom.toLowerCase()} metió la mano y restó ${n}. Por ahora parece bien... prueba la trampa.`);
        return;
      }
      if (terminado) { pinta(i); di('La partida ya terminó. <b>perderVida()</b> lo sabe y no hace nada más.', 'ok'); return; }
      let k = 0;
      while (k < n && vidas > 0) { vidas--; k++; }
      if (vidas === 0) terminado = true;
      pinta(i);
      di(terminado ? `La ${nom.toLowerCase()} pidió <code>perderVida()</code>. El jugador revisó sus reglas: <b>no baja de 0 y avisó el fin una sola vez</b>.` : `La ${nom.toLowerCase()} pidió <code>perderVida()</code>; el jugador decidió restar. Quedan ${vidas}.`, 'ok');
    }
    function reiniciar() { vidas = 3; terminado = false; pinta(-1); di(modo === 0 ? 'Cada uno <b>mete la mano</b> en las vidas del jugador. Golpea varias veces.' : 'Ahora todos <b>piden</b> por la puerta. Repite los mismos golpes.'); }
    const c = FIG.controles(el);
    c.opciones(['Meter la mano', 'Pedir'], i => { modo = i; reiniciar(); });
    QUIEN.forEach((q, i) => c.boton(q[0] + ' (−' + q[2] + ')', () => golpe(i)));
    c.boton('Reiniciar', reiniciar, true);
    reiniciar();
  };

  /* 4 · Polimorfismo: un bucle, muchos objetos (y la alternativa del if por tipo) */
  window.DEMOS.polimorfismo = function (el) {
    const f = FIG.lienzo(el, 900, 470);
    const FX = 24, FY = 16, FW = 852, FH = 190;
    f.nodo('rect', { x: FX, y: FY, width: FW, height: FH, rx: 2, fill: '#08080a', stroke: FIG.C.grey, 'stroke-width': 2 });
    const dibujo = {
      bola: f.circulo(0, 0, 12, { tono: 'white' }),
      paleta: f.nodo('rect', { width: 110, height: 16, rx: 2, fill: FIG.C.teal }),
      ladrillo: f.nodo('rect', { x: 120, y: 40, width: 120, height: 34, rx: 2, fill: FIG.C.coral }),
      powerup: f.circulo(0, 0, 11, { tono: 'amber' }),
      bomba: f.circulo(0, 0, 14, { tono: 'violet' })
    };
    dibujo.bomba.ver(false);
    const TIPOS = {
      bola: ['Bola', 'se mueve y rebota'],
      paleta: ['Paleta', 'sigue a la bola'],
      ladrillo: ['Ladrillo', 'no hace nada'],
      powerup: ['PowerUp', 'cae despacio'],
      bomba: ['Bomba', 'cae y explota']
    };
    let objs;
    function nuevos() {
      return [
        { tipo: 'bola', x: 420, y: 120, vx: 260, vy: -200 },
        { tipo: 'paleta', x: 380 },
        { tipo: 'ladrillo' },
        { tipo: 'powerup', x: 700, y: 30 }
      ];
    }
    const ACT = {
      bola(o, dt) { o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < FX + 12 || o.x > FX + FW - 12) { o.vx = -o.vx; o.x = Math.max(FX + 12, Math.min(FX + FW - 12, o.x)); } if (o.y < FY + 12 || o.y > FY + FH - 40) { o.vy = -o.vy; o.y = Math.max(FY + 12, Math.min(FY + FH - 40, o.y)); } },
      paleta(o, dt) { const b = objs[0]; o.x += Math.max(-300 * dt, Math.min(300 * dt, b.x - 55 - o.x)); o.x = Math.max(FX, Math.min(FX + FW - 110, o.x)); },
      ladrillo() {},
      powerup(o, dt) { o.y += 50 * dt; if (o.y > FY + FH - 12) o.y = FY + 14; },
      bomba(o, dt) { o.y += 90 * dt; o.t = (o.t || 0) + dt; if (o.y > FY + FH - 14) { o.y = FY + 16; o.t = 0; } }
    };
    function dibujar() {
      objs.forEach(o => {
        const d = dibujo[o.tipo];
        if (o.tipo === 'bola' || o.tipo === 'powerup') d.mover(o.x, o.y);
        if (o.tipo === 'paleta') { d.setAttribute('x', o.x); d.setAttribute('y', FY + FH - 26); }
        if (o.tipo === 'bomba') { d.ver(true).mover(o.x, o.y); d.c.setAttribute('r', 14 + (o.t % 1 > .8 ? 10 : 0)); }
      });
    }
    const cartas = Array.from({ length: 5 }, (_, i) => f.caja(24 + i * 172, 224, 160, 76, '', { tam: 22, sub: ' ' }).ver(false));
    const lineas = Array.from({ length: 8 }, (_, i) => mono(f.texto(40, 322 + i * 18, '', { tam: 16, ancla: 'start', tono: 'white' })));
    const ramas = f.texto(860, 322, '', { tam: 18, ancla: 'end', tono: 'amber', peso: 700 });
    const di = FIG.dice(el);
    let modo = 0, visita = -1, raf = 0, last = 0, corriendo = false, acc = 0, nueva = false;

    function codigo() {
      const L = modo === 0
        ? ['for _, o in ipairs(objetos) do', '    o:actualizar(dt)   -- cada uno a su manera', 'end']
        : ['for _, o in ipairs(objetos) do'].concat(objs.map((o, i) => `    ${i ? 'elseif' : 'if'} o.tipo == "${o.tipo}" then  -- ${TIPOS[o.tipo][1]}`), ['    end', 'end']);
      lineas.forEach((t, i) => { t.pon(L[i] || ''); t.color(nueva && modo === 1 && i === objs.length ? 'coral' : nueva && modo === 0 && i === 1 ? 'teal' : 'white'); });
      ramas.pon(modo === 1 ? objs.length + ' ramas · y otras tantas en dibujar y chocar' : 'el bucle no conoce ningún tipo');
    }
    function cartasPinta() {
      cartas.forEach((c, i) => {
        const o = objs[i];
        c.ver(!!o);
        if (o) c.rotulo(TIPOS[o.tipo][0]).sub(TIPOS[o.tipo][1]).tono(i === visita ? 'on' : o.tipo === 'bomba' ? 'ok' : 'base');
      });
    }
    function reset() { objs = nuevos(); nueva = false; visita = -1; dibujo.bomba.ver(false); dibujar(); cartasPinta(); codigo(); }
    function vuelta(dt) { objs.forEach(o => ACT[o.tipo](o, dt)); dibujar(); }
    function paso() {
      visita = (visita + 1) % objs.length;
      const o = objs[visita];
      for (let k = 0; k < 6; k++) ACT[o.tipo](o, 1 / 30);
      dibujar(); cartasPinta();
      di(modo === 0 ? `<code>o:actualizar(dt)</code> con o = <b>${TIPOS[o.tipo][0]}</b>: ${TIPOS[o.tipo][1]}. La misma llamada, otra respuesta.` : `El bucle pregunta <code>o.tipo == "${o.tipo}"</code> y ejecuta esa rama: ${TIPOS[o.tipo][1]}.`);
    }
    function tick(t) {
      if (!last) last = t;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      vuelta(dt);
      acc += dt; if (acc > 0.35) { acc = 0; visita = (visita + 1) % objs.length; cartasPinta(); }
      raf = requestAnimationFrame(tick);
    }
    const c = FIG.controles(el);
    c.opciones(['Polimorfismo', 'Un if por tipo'], i => { modo = i; codigo(); di(i === 0 ? 'Un bucle que solo pide «actualízate». <b>Agrega la Bomba</b> y mira si cambia.' : 'Ahora el bucle conoce cada tipo por su nombre. <b>Agrega la Bomba</b> y mira el código.'); });
    c.boton('Siguiente objeto', () => { if (corriendo) correr(); paso(); });
    const bc = c.boton('Correr', () => correr());
    function correr() {
      corriendo = !corriendo; bc.textContent = corriendo ? 'Detener' : 'Correr';
      cancelAnimationFrame(raf); last = 0;
      if (corriendo) raf = requestAnimationFrame(tick);
    }
    c.boton('Agregar Bomba', () => {
      if (nueva) { di('La bomba ya está en la lista.'); return; }
      objs.push({ tipo: 'bomba', x: 560, y: 30 }); nueva = true;
      dibujar(); cartasPinta(); codigo();
      di(modo === 0 ? '<b>El bucle no cambió.</b> La bomba trae su propio <code>actualizar</code> y entra a la lista. Eso es polimorfismo.' : '<b>Hubo que abrir el bucle</b> y agregar otra rama, en rojo. Y lo mismo en el bucle de dibujar y en el de chocar.', modo === 0 ? 'ok' : 'bad');
    });
    c.boton('Reiniciar', () => { if (corriendo) correr(); reset(); di('Cuatro objetos distintos en una lista. Recórrelos con <b>Siguiente objeto</b> o <b>Correr</b>.'); }, true);
    reset();
    di('Cuatro objetos distintos en una lista. Recórrelos con <b>Siguiente objeto</b>' + (quieto() ? '.' : ' o <b>Correr</b>.'));
    return () => cancelAnimationFrame(raf);
  };

  /* 5 · El patrón State: la máquina guarda el estado actual y le delega */
  window.DEMOS.estadosObjeto = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    const maq = f.caja(24, 120, 220, 96, 'Máquina', { tam: 26, sub: 'actual = Title', tono: 'paper' });
    const E = {
      Title: f.caja(330, 24, 240, 96, 'Title', { tam: 26, sub: 'atiende: Enter' }),
      Play: f.caja(636, 24, 240, 96, 'Play', { tam: 26, sub: 'atiende: P y sin vidas' }),
      Pause: f.caja(636, 210, 240, 96, 'Pause', { tam: 26, sub: 'atiende: P' }),
      GameOver: f.caja(330, 210, 240, 96, 'GameOver', { tam: 26, sub: 'atiende: R' })
    };
    const REG = { Title: { enter: 'Play' }, Play: { p: 'Pause', sinVidas: 'GameOver' }, Pause: { p: 'Play' }, GameOver: { r: 'Title' } };
    const tr = {
      'Title.enter': f.flecha(E.Title, E.Play),
      'Play.p': f.flecha(E.Play, E.Pause, { desvio: 14 }),
      'Pause.p': f.flecha(E.Pause, E.Play, { desvio: 14 }),
      'Play.sinVidas': f.flecha(E.Play, E.GameOver),
      'GameOver.r': f.flecha(E.GameOver, E.Title)
    };
    const apunta = {};
    Object.keys(E).forEach(k => { apunta[k] = f.flecha(maq, E[k], { tono: 'on', puntos: true }); });
    const frame = mono(f.texto(24, 340, '', { tam: 17, ancla: 'start', tono: 'soft' }));
    const log = [0, 1, 2].map(i => mono(f.texto(24, 376 + i * 28, '', { tam: 18, ancla: 'start', tono: 'white' })));
    const di = FIG.dice(el);
    const NOM = { enter: 'Enter', p: 'P', sinVidas: 'sin vidas', r: 'R' };
    let actual = 'Title';

    function pinta(trOn) {
      Object.keys(E).forEach(k => E[k].tono(k === actual ? 'on' : 'base'));
      Object.keys(apunta).forEach(k => apunta[k].ver(k === actual));
      Object.keys(tr).forEach(k => tr[k].tono(k === trOn ? 'ok' : 'off'));
      maq.sub('actual = ' + actual);
      frame.pon('cada frame:  maquina:actualizar(dt)  →  ' + actual + '.actualizar(dt)');
    }
    function escribe(a, b, cc) { log[0].pon(a); log[1].pon(b || ''); log[2].pon(cc || ''); }
    function tecla(t) {
      const sig = REG[actual][t];
      if (!sig) {
        escribe(`maquina:tecla("${t}")`, `  → ${actual}.tecla("${t}") no pide nada`, '');
        pinta();
        di(`<b>${actual}</b> no tiene regla para «${NOM[t]}»: no pide cambio y la máquina sigue igual. Nadie tuvo que escribir un if en main.lua.`);
        return;
      }
      const de = actual;
      escribe(`maquina:tecla("${t}")`, `  → ${de}.tecla("${t}") pide ${sig}`, `  → ${de}.salir()   ·   ${sig}.entrar()`);
      actual = sig;
      pinta(de + '.' + t);
      di(`La máquina le preguntó a <b>${de}</b>; ${de} decidió y <b>pidió ${sig}</b>. La máquina hizo el cambio y llamó salir y entrar.`, 'ok');
    }
    const c = FIG.controles(el);
    c.boton('Enter', () => tecla('enter'));
    c.boton('P', () => tecla('p'));
    c.boton('Perder la última vida', () => tecla('sinVidas'));
    c.boton('R', () => tecla('r'));
    c.boton('Reiniciar', () => { actual = 'Title'; escribe('maquina:cambiar("Title")', '  → Title.entrar()', ''); pinta(); di('La máquina arranca en <b>Title</b>. Envía teclas y mira quién responde.'); }, true);
    escribe('maquina:cambiar("Title")', '  → Title.entrar()', '');
    pinta();
    di('La máquina arranca en <b>Title</b>. Prueba primero <b>P</b>: ¿qué hace Title con ella?');
  };
})();
