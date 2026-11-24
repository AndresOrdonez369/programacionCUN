/* Figuras de la sesión 8 · Demos, síntesis y cierre: bossRush, demoReloj y criterios.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; } */
window.DEMOS = window.DEMOS || {};
(function () {
  const C = FIG.C;
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const pon = (e, at) => { for (const k in at) e.setAttribute(k, at[k]); return e; };
  function sinPuntero(f) { f.svg.style.userSelect = 'none'; f.svg.querySelectorAll('text').forEach(t => { t.style.pointerEvents = 'none'; }); }

  /* 1 · bossRush: el repaso por equipos en miniatura. Contenido como datos, igual que questions.lua */
  const JEFES = [
    { nombre: 'GLOBALIX', tema: 'Fundamentos de Lua', color: C.teal, blindado: false, preguntas: [
      { q: '¿Cuál es la única estructura de datos nativa de Lua?', o: ['El array', 'La tabla', 'La lista enlazada', 'El struct'], ok: 1, por: 'En Lua todo se arma con tablas: listas, diccionarios, objetos y clases.' },
      { q: 'En una secuencia de Lua, el primer índice es…', o: ['0', '1', '−1', 'Depende'], ok: 1, por: 'Lua cuenta desde 1. Es el error número uno al venir de otros lenguajes.' },
      { q: '¿Qué pasa si escribes x = 5 sin local?', o: ['Da error', 'x queda global', 'x vale nil', 'x queda local'], ok: 1, por: 'Sin local, la variable es global. En juegos, las globales sueltas son bugs esperando.' }] },
    { nombre: 'LOOPRA', tema: 'Game loop y LÖVE', color: C.slate, blindado: false, preguntas: [
      { q: '¿Qué callback corre cada frame para la lógica?', o: ['love.draw()', 'love.load()', 'love.update(dt)', 'love.keypressed()'], ok: 2, por: 'update(dt) cambia el estado; draw() solo dibuja. Nunca los mezcles.' },
      { q: '¿Para qué sirve multiplicar por dt?', o: ['Para contar puntos', 'Para moverse igual con cualquier fps', 'Para dibujar más rápido', 'Para leer el teclado'], ok: 1, por: 'velocidad × dt = movimiento por segundo, no por frame.' },
      { q: '¿Cómo lees una tecla mantenida para mover la paleta?', o: ['love.keypressed', 'love.keyboard.isDown', 'love.textinput', 'love.load'], ok: 1, por: 'isDown se consulta en update; keypressed avisa una sola vez por pulsación.' }] },
    { nombre: 'METATRON', tema: 'POO en Lua', color: C.violet, blindado: false, preguntas: [
      { q: '¿Qué campo hace que una tabla busque métodos en otra?', o: ['__call', '__index', '__add', '__tostring'], ok: 1, por: 'setmetatable(obj, Clase) con Clase.__index = Clase reenvía lo que el objeto no tiene.' },
      { q: 'onHit() distinto según el tipo de ladrillo es…', o: ['Recursión', 'Encapsulación', 'Polimorfismo', 'Un bug'], ok: 2, por: 'Mismo mensaje, distinta respuesta según el tipo: polimorfismo.' },
      { q: 'El guion bajo en self._vida significa…', o: ['Que es global', 'Que es privada por convención', 'Que es constante', 'Nada'], ok: 1, por: 'Lua no tiene private real: el guion bajo pide «no me toques desde afuera».' }] },
    { nombre: 'AABBADDON', tema: 'Colisiones', color: C.amber, blindado: false, preguntas: [
      { q: 'Dos AABB chocan cuando se solapan en…', o: ['Solo X', 'Solo Y', 'X y Y a la vez', 'Cualquiera de los dos'], ok: 2, por: 'Con un solo eje no basta: dos ladrillos de una misma columna comparten X y no se tocan.' },
      { q: 'Invertir vx y vy juntos en cada choque causa…', o: ['Rebotes más reales', 'Rebotes erráticos', 'Más velocidad', 'Nada'], ok: 1, por: 'Se invierte solo el eje de menor penetración.' },
      { q: 'El rebote según el punto de impacto en la paleta sirve para…', o: ['Ahorrar cálculos', 'Que el jugador apunte', 'Evitar el túnel', 'Que la bola frene'], ok: 1, por: 'Donde pega decide hacia dónde sale: el jugador controla la jugada.' }] },
    { nombre: 'FINITUS', tema: 'Estados y game feel', color: C.coral, blindado: true, preguntas: [
      { q: '¿Qué organiza Title, Serve, Play, Pause, GameOver y Victory?', o: ['Un if gigante', 'Una máquina de estados', 'Una metatabla', 'El game feel'], ok: 1, por: 'Un estado actual y transiciones por evento: imposible estar en dos a la vez.' },
      { q: 'Screen shake, partículas y sonido al golpear se llaman…', o: ['Game feel', 'Hitbox', 'Delta time', 'Herencia'], ok: 0, por: 'Game feel: cambian la sensación, no las reglas.' },
      { q: '¿Qué evento lleva de Play a GameOver?', o: ['Presionar P', 'Romper el último ladrillo', 'Perder la última vida', 'Presionar Enter'], ok: 2, por: 'Sin vidas, GameOver. Romper el último ladrillo del último nivel lleva a Victory.' }] }
  ];
  window.DEMOS.bossRush = function (el) {
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Boss Rush: cinco jefes, uno por tema del curso. Elige la respuesta correcta para quitarle vida al jefe.');
    const tN = f.texto(24, 34, '', { ancla: 'start', tam: 30, tono: 'white', peso: 800 });
    const tT = f.texto(24, 68, '', { ancla: 'start', tam: 21, tono: 'soft', peso: 700 });
    f.nodo('rect', { x: 24, y: 92, width: 620, height: 22, fill: 'none', stroke: C.grey, 'stroke-width': 2 });
    const barra = f.nodo('rect', { x: 26, y: 94, height: 18 });
    const tHP = f.texto(644, 136, '', { ancla: 'end', tam: 18, tono: 'soft' });
    const jefe = f.nodo('g', {});
    const cuerpo = f.nodo('rect', { x: 700, y: 24, width: 170, height: 150, 'stroke-width': 3 }, jefe);
    f.nodo('rect', { x: 735, y: 70, width: 28, height: 28, fill: C.ink }, jefe); f.nodo('rect', { x: 807, y: 70, width: 28, height: 28, fill: C.ink }, jefe);
    const boca = f.nodo('rect', { x: 750, y: 130, width: 70, height: 14, fill: C.ink }, jefe);
    const escudo = f.nodo('rect', { x: 692, y: 16, width: 186, height: 166, fill: 'none', stroke: C.white, 'stroke-width': 3, 'stroke-dasharray': '10 6' }, jefe);
    const vidas = [0, 1, 2, 3, 4].map(i => f.nodo('rect', { x: 702 + i * 34, y: 196, width: 26, height: 26, 'stroke-width': 2 }));
    f.texto(785, 240, 'vidas del equipo', { tam: 17, tono: 'soft' });
    const tQ = f.texto(24, 196, '', { ancla: 'start', tam: 24, tono: 'white', peso: 700 });
    const ops = [0, 1, 2, 3].map(i => f.caja(24 + (i % 2) * 330, 262 + Math.floor(i / 2) * 92, 314, 74, '', { tam: 21, clic: () => responder(i) }));
    const di = FIG.dice(el);
    let j = 0, p = 0, hp = 100, nv = 5, resp = false, fin = '', timers = [];
    const actual = () => JEFES[j].preguntas[p % JEFES[j].preguntas.length];
    function sacudir() {
      if (quieto()) return;
      [8, -8, 5, -5, 2, 0].forEach((d, k) => timers.push(setTimeout(() => jefe.setAttribute('transform', `translate(${d} 0)`), k * 40)));
    }
    function pinta() {
      const J = JEFES[j];
      tN.pon(fin === 'gana' ? '¡El equipo ganó!' : fin === 'pierde' ? 'Los jefes ganaron esta vez' : 'Jefe ' + (j + 1) + ' de 5 · ' + J.nombre);
      tT.pon(fin ? 'Reinicia para jugar otra vez' : J.tema + (J.blindado ? ' · blindado: un error cuesta 2 vidas' : ''));
      pon(barra, { width: Math.max(0, 616 * hp / 100), fill: J.color });
      tHP.pon(fin ? '' : 'vida del jefe: ' + hp);
      pon(cuerpo, { fill: J.color, stroke: C.white, 'fill-opacity': fin === 'gana' ? .25 : 1 });
      pon(boca, { height: fin === 'gana' ? 4 : 14 });
      escudo.style.display = J.blindado && !fin ? '' : 'none';
      vidas.forEach((v, i) => pon(v, { fill: i < nv ? C.teal : 'none', stroke: i < nv ? C.teal : C.grey }));
      const Q = actual();
      tQ.pon(fin ? '' : Q.q);
      ops.forEach((o, i) => { o.ver(!fin); o.rotulo((i + 1) + '.  ' + Q.o[i]); o.tono(resp ? (i === Q.ok ? 'ok' : 'off') : 'base'); });
    }
    function responder(i) {
      if (resp || fin) return;
      const Q = actual(), J = JEFES[j];
      resp = true;
      if (i === Q.ok) { hp = Math.max(0, hp - 50); sacudir(); di('<b>¡Golpe!</b> ' + Q.por + (hp === 0 ? ' ' + J.nombre + ' cae. Presiona «Siguiente».' : ''), 'ok'); }
      else { nv = Math.max(0, nv - (J.blindado ? 2 : 1)); di('<b>Fallo.</b> ' + Q.por + (J.blindado ? ' Era blindado: perdieron 2 vidas.' : ''), 'bad'); }
      pinta();
      if (nv === 0) { fin = 'pierde'; pinta(); di('Se acabaron las vidas. Repasen el tema de ' + J.nombre + ': ' + J.tema.toLowerCase() + '.', 'bad'); }
    }
    function siguiente() {
      if (fin) return;
      if (!resp) { di('Primero respondan: discutan en equipo y elijan una opción.'); return; }
      resp = false; p++;
      if (hp === 0) { j++; p = 0; hp = 100; if (j >= JEFES.length) { j = JEFES.length - 1; fin = 'gana'; pinta(); di('Los cinco jefes cayeron. Todo lo que repasaron es lo que ya saben hacer en su Breakout.', 'ok'); return; } }
      pinta(); di('Discutan en equipo y elijan. Un acierto quita la mitad de la vida del jefe.');
    }
    function reiniciar() { j = 0; p = 0; hp = 100; nv = 5; resp = false; fin = ''; pinta(); di('Cinco jefes, un tema cada uno. Discutan en equipo y elijan: un acierto quita la mitad de la vida del jefe.'); }
    sinPuntero(f);
    const c = FIG.controles(el);
    c.boton('Siguiente', siguiente);
    c.boton('Reiniciar', reiniciar, true);
    reiniciar();
    return () => timers.forEach(clearTimeout);
  };

  /* 2 · demoReloj: cinco minutos, cinco paradas */
  window.DEMOS.demoReloj = function (el) {
    const PAR = [['Qué es tu juego', 30, 'Una frase: género, objetivo y lo que lo hace tuyo.'], ['Juega en vivo', 90, 'Muestra un nivel, un ladrillo especial y cómo se pierde. Narra lo que pasa.'],
      ['Una decisión técnica', 90, '«Elegí X en vez de Y porque Z; se nota en W». Muestra el código.'], ['Un bug y cómo lo resolviste', 60, 'Qué veías, qué causaba el bug y qué línea lo arregló.'],
      ['Qué cambiarías', 30, 'Una sola cosa, con su porqué. Honestidad, no excusas.']];
    const TOT = PAR.reduce((s, x) => s + x[1], 0), X0 = 24, AW = 852;
    const f = FIG.lienzo(el, 900, 300);
    f.svg.setAttribute('aria-label', 'Cronómetro de cinco minutos dividido en cinco paradas para la demo de cada equipo.');
    const tR = f.texto(450, 54, '5:00', { tam: 56, tono: 'white', peso: 800 });
    let x = X0;
    const CORTO = ['Qué es', 'Juega', 'Decisión', 'Un bug', 'Cambiaría'];
    const seg = PAR.map((pp, i) => { const w = AW * pp[1] / TOT, k = f.caja(x, 104, w - 6, 84, CORTO[i], { tam: w < 120 ? 17 : 22, sub: pp[1] + ' s', rx: 0 }); x += w; return k; });
    const marca = f.nodo('rect', { y: 96, width: 4, height: 100, fill: C.coral });
    const tP = f.texto(450, 236, '', { tam: 22, tono: 'amber', peso: 700 });
    f.texto(450, 276, 'mientras tanto, el público anota dos estrellas y un deseo', { tam: 18 });
    const di = FIG.dice(el);
    let t = 0, corre = false, ult = 0, iv = 0;
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    function parada() { let a = 0; for (let i = 0; i < PAR.length; i++) { a += PAR[i][1]; if (t < a) return i; } return PAR.length - 1; }
    function pinta() {
      const k = parada(), queda = Math.max(0, TOT - t);
      tR.pon(fmt(queda)).color(queda <= 30 ? 'coral' : 'white');
      seg.forEach((s, i) => s.tono(i < k ? 'off' : i === k ? 'on' : 'base'));
      pon(marca, { x: X0 + AW * Math.min(t, TOT) / TOT - 2 });
      tP.pon(t >= TOT ? 'Tiempo. Cierra con una frase.' : PAR[k][0] + ': quedan ' + Math.ceil(PAR.slice(0, k + 1).reduce((s, x) => s + x[1], 0) - t) + ' s de esta parada');
      di(t >= TOT ? '<b>Cinco minutos.</b> Ahora dos preguntas del público, máximo un minuto.' : '<b>' + PAR[k][0] + '.</b> ' + PAR[k][2], t >= TOT ? 'ok' : '');
    }
    function tick() { const now = Date.now(); if (corre) { t += (now - ult) / 1000; if (t >= TOT) { t = TOT; corre = false; bI.textContent = 'Iniciar'; } } ult = now; pinta(); }
    const c = FIG.controles(el);
    const bI = c.boton('Iniciar', () => { corre = !corre; ult = Date.now(); bI.textContent = corre ? 'Pausa' : 'Iniciar'; if (corre && t >= TOT) t = 0; });
    c.boton('Siguiente parada', () => { const k = parada(); t = Math.min(TOT, PAR.slice(0, k + 1).reduce((s, x) => s + x[1], 0)); pinta(); }, true);
    c.boton('Reiniciar', () => { t = 0; corre = false; bI.textContent = 'Iniciar'; pinta(); }, true);
    sinPuntero(f);
    iv = setInterval(tick, 250); pinta();
    return () => clearInterval(iv);
  };

  /* 3 · criterios: rueda de autoevaluación y coevaluación, cada nota con su evidencia */
  window.DEMOS.criterios = function (el) {
    const SETS = [
      { n: 'Autoevaluación', c: [['Mi juego funciona', 'no abre o no se puede terminar', 'se gana y se pierde sin errores'], ['POO en mi código', 'todo en main.lua', 'clases con .new(), herencia y onHit()'], ['Colisiones', 'la bola se pega o atraviesa', 'menor penetración, paleta y sin túnel'], ['Estados y game feel', 'banderas sueltas', 'FSM completa y dos efectos'], ['Lo sé explicar', 'copié sin entender', 'explico cada archivo con mis palabras']] },
      { n: 'Coevaluación', c: [['Aporte técnico', 'poco código, o solo al final', 'piezas propias que sabe explicar'], ['Cumplimiento', 'tarde y sin avisar', 'a tiempo, o avisa y renegocia'], ['Comunicación', 'desaparece días', 'avisa bloqueos y pide ayuda'], ['Trato', 'descalifica o impone', 'critica el código, no a la persona'], ['Explica su parte', 'no sabe qué hizo', 'la defiende delante del equipo']] }
    ];
    const f = FIG.lienzo(el, 900, 460);
    f.svg.setAttribute('aria-label', 'Rueda de cinco criterios. Toca un punto de cada eje para poner la nota y toca un criterio de la lista para marcar si tienes evidencia.');
    const CX = 225, CY = 236, R = 150;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / 5, pt = (i, v) => [CX + R * v / 5 * Math.cos(ang(i)), CY + R * v / 5 * Math.sin(ang(i))];
    for (let v = 1; v <= 5; v++) f.nodo('polygon', { points: [0, 1, 2, 3, 4].map(i => pt(i, v).join(',')).join(' '), fill: 'none', stroke: 'rgba(255,255,255,.14)', 'stroke-width': 2 });
    [0, 1, 2, 3, 4].forEach(i => { const p = pt(i, 5); f.linea(CX, CY, p[0], p[1], { color: 'rgba(255,255,255,.2)', grosor: 2 }); });
    const poli = f.nodo('polygon', { fill: C.amber, 'fill-opacity': .28, stroke: C.amber, 'stroke-width': 3 });
    const etq = [0, 1, 2, 3, 4].map(i => { const p = pt(i, 5.75); return f.texto(p[0], p[1] + (i === 0 ? -6 : 0), '', { tam: 18, tono: 'white', peso: 700, ancla: Math.abs(Math.cos(ang(i))) < .2 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end' }); });
    const puntos = [];
    [0, 1, 2, 3, 4].forEach(i => { for (let v = 1; v <= 5; v++) { const p = pt(i, v), d = f.nodo('circle', { cx: p[0], cy: p[1], r: 9, 'stroke-width': 2, tabindex: 0, role: 'button', style: 'cursor:pointer' }); d.setAttribute('aria-label', 'nota ' + v); const fn = () => { val[i] = v; sel = i; pinta(); }; d.addEventListener('click', fn); d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); puntos.push({ i, v, d }); } });
    const filas = [0, 1, 2, 3, 4].map(i => f.caja(575, 40 + i * 66, 305, 56, '', { tam: 18, rx: 0, clic: () => { ev[i] = !ev[i]; sel = i; pinta(); } }));
    const tNota = f.texto(727, 400, '', { tam: 24, tono: 'amber', peso: 800 });
    f.texto(727, 432, 'toca un criterio para marcar si tienes evidencia', { tam: 16 });
    const di = FIG.dice(el);
    let modo = 0, val = [3, 3, 3, 3, 3], ev = [false, false, false, false, false], sel = -1;
    function pinta() {
      const S = SETS[modo];
      pon(poli, { points: val.map((v, i) => pt(i, v).join(',')).join(' ') });
      etq.forEach((t, i) => t.pon(S.c[i][0]));
      puntos.forEach(p => pon(p.d, { fill: p.v <= val[p.i] ? C.amber : C.ink, stroke: p.v === val[p.i] ? C.white : C.grey }));
      filas.forEach((r, i) => { r.rotulo(S.c[i][0] + ' · ' + val[i]).tono(ev[i] ? 'ok' : val[i] >= 4 ? 'bad' : 'base'); });
      const prom = val.reduce((a, b) => a + b, 0) / 5, sinEv = val.filter((v, i) => v >= 4 && !ev[i]).length;
      tNota.pon(S.n + ': ' + prom.toFixed(1) + ' de 5');
      const det = sel >= 0 ? '<b>' + S.c[sel][0] + ':</b> 1 = ' + S.c[sel][1] + '; 5 = ' + S.c[sel][2] + '. ' : '';
      if (sinEv) di(det + 'Hay ' + sinEv + (sinEv === 1 ? ' nota alta' : ' notas altas') + ' sin evidencia (en coral). Una nota sin un ejemplo concreto no se sostiene: un archivo, un commit, un mensaje.', 'bad');
      else if (val.every(v => v === 5)) di(det + 'Todo en 5. Es posible, pero raro: ¿qué cambiarías si tuvieras una semana más? Esa respuesta también es evidencia.', '');
      else if (ev.some(Boolean)) di(det + 'Cada nota alta tiene su ejemplo. Así se defiende una evaluación honesta.', 'ok');
      else di(det + 'Toca un punto de cada eje para poner la nota y toca el criterio en la lista cuando tengas un ejemplo concreto.', '');
    }
    sinPuntero(f);
    const c = FIG.controles(el);
    c.opciones(SETS.map(s => s.n), i => { modo = i; val = [3, 3, 3, 3, 3]; ev = [false, false, false, false, false]; sel = -1; pinta(); });
    pinta();
    return () => {};
  };
})();
