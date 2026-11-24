/* Figuras de la sesión 5 · POO en Lua, módulos y estados.
   Contrato: window.DEMOS.nombre = function (el) { ...; return function detener() {...}; }
   cadena: búsqueda de __index instancia -> clase -> padre · puntos: punto frente a dos puntos y self
   polimorfismo: un bucle, muchas entidades · modulos: require y su caché · estados: la FSM del Breakout como objetos.
   Los mensajes de error imitan a LÖVE (LuaJIT); el Lua del navegador los redacta un poco distinto. */
(function () {
  window.DEMOS = window.DEMOS || {};
  const quieto = () => (FIG.quieto ? FIG.quieto() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const MONO = 'ui-monospace, Consolas, monospace';
  const mono = t => { t.t.setAttribute('font-family', MONO); return t; };

  /* 1 · La cadena de __index: si tú no lo sabes, le preguntas al hermano mayor */
  window.DEMOS.cadena = function (el) {
    const f = FIG.lienzo(el, 900, 440);
    const P = [
      { t: 'pelota', s: 'la instancia', x: 30, info: 'La tabla que devolvió <code>Pelota.new(100, 300)</code>. Solo guarda <b>sus datos</b>: x e y. No tiene ni un método.' },
      { t: 'Pelota', s: 'la clase', x: 325, info: 'La tabla <code>Pelota</code>: guarda los métodos que comparten <b>todas</b> las pelotas, una sola vez. <code>Pelota.__index = Pelota</code> es la nota que dice «búscalo aquí».' },
      { t: 'Entidad', s: 'el padre', x: 620, info: 'La tabla <code>Entidad</code>: lo común a todo lo que hay en el juego. Pelota la hereda con <code>setmetatable(Pelota, { __index = Entidad })</code>.' }
    ];
    const cajas = P.map((p, i) => f.caja(p.x, 64, 250, 250, '', { clic: () => di(P[i].info) }));
    P.forEach(p => { f.texto(p.x + 125, 96, p.t, { tam: 28, tono: 'white', peso: 800 }); f.texto(p.x + 125, 128, p.s, { tam: 18 }); });
    const a1 = f.flecha(cajas[0], cajas[1], { rotulo: '__index', ry: -60 }), a2 = f.flecha(cajas[1], cajas[2], { rotulo: '__index', ry: -60 });
    const filas = [[], [], []];
    function fila(i, j, txt) { const t = mono(f.texto(P[i].x + 125, 168 + j * 34, txt, { tam: 20, tono: 'soft' })); filas[i].push(t); return t; }
    const K = [
      [['x', 'x = 100'], ['y', 'y = 300']],
      [['new', 'new'], ['mover', 'mover'], ['describir', 'describir'], ['__index', '__index']],
      [['new', 'new'], ['describir', 'describir'], ['activo', 'activo = true'], ['update', 'update']]
    ];
    const T = K.map((ks, i) => ks.map((k, j) => fila(i, j, k[1])));
    const res = mono(f.texto(450, 352, '', { tam: 24, tono: 'amber', peso: 700 }));
    const pre = mono(f.texto(450, 396, '', { tam: 20, tono: 'white' }));
    let enlace1 = true, enlace2 = true, sobre = false, timers = [];
    const di = FIG.dice(el, 'Elige qué le pides a la pelota y mira dónde lo encuentra Lua. También puedes tocar cada caja.');
    const tiene = (i, k) => K[i].some(x => x[0] === k) && !(i === 1 && k === 'describir' && !sobre);
    function base() {
      timers.forEach(clearTimeout); timers = [];
      cajas.forEach(c => c.tono('base'));
      K.forEach((ks, i) => ks.forEach((k, j) => { const ver = !(i === 1 && k[0] === 'describir' && !sobre); T[i][j].ver(ver).color('soft'); }));
      a1.tono(enlace1 ? 'base' : 'off').rotulo(enlace1 ? '__index' : 'sin __index');
      a2.tono(enlace2 ? 'base' : 'off').rotulo(enlace2 ? '__index' : 'sin herencia');
      res.pon(''); pre.pon('');
    }
    function buscar(k, llamada) {
      base(); pre.pon(llamada);
      const pasos = [];
      let i = 0;
      while (true) {
        pasos.push({ i, hay: tiene(i, k) });
        if (tiene(i, k)) break;
        const sigue = i === 0 ? enlace1 : i === 1 ? enlace2 : false;
        if (!sigue) break;
        i++;
      }
      const espera = quieto() ? 0 : 550;
      pasos.forEach((p, n) => timers.push(setTimeout(() => {
        if (n > 0) (p.i === 1 ? a1 : a2).tono('on');
        if (p.hay) {
          cajas[p.i].tono('ok'); const j = K[p.i].findIndex(x => x[0] === k); T[p.i][j].color('amber');
          res.pon(k === 'x' ? '--> 100' : k === 'activo' ? '--> true' : '--> la función ' + k + ' de ' + P[p.i].t);
          if (p.i === 0) di(`<code>x</code> está en la propia pelota. Lua no le pregunta a nadie más.`, 'ok');
          else if (p.i === 1) di(`La pelota no tiene <code>${k}</code>. Lua mira su metatabla, ve <code>__index = Pelota</code> y lo encuentra en la clase. <b>Un solo</b> ${k} para todas las pelotas.${k === 'describir' ? ' Como Pelota lo sobrescribe, gana el de Pelota: el de Entidad ni se consulta.' : ''}`, 'ok');
          else di(`Ni la pelota ni Pelota tienen <code>${k}</code>. Pelota le pregunta a su hermano mayor, <b>Entidad</b>, y ahí está. Eso es la herencia en Lua.`, 'ok');
        } else {
          cajas[p.i].tono('off');
          if (n === pasos.length - 1) {
            cajas[p.i].tono('bad'); res.pon('--> nil');
            const corte = p.i === 0 && !enlace1 ? 'La pelota no tiene metatabla con <code>__index</code>, así que no hay a quién preguntar. ' : p.i === 1 && !enlace2 ? 'Pelota no tiene padre: la cadena se corta aquí. ' : 'Nadie en la cadena lo tiene. ';
            di(corte + (llamada.includes(':') ? `Llamar a algo que es nil detiene el juego: <i>attempt to call method '${k}' (a nil value)</i>.` : 'El resultado es <b>nil</b>.'), 'bad');
          }
        }
      }, n * espera)));
    }
    const c = FIG.controles(el);
    c.boton('pelota.x', () => buscar('x', 'print(pelota.x)'));
    c.boton('pelota:mover(dt)', () => buscar('mover', 'pelota:mover(dt)'), true);
    c.boton('pelota:describir()', () => buscar('describir', 'pelota:describir()'), true);
    c.boton('pelota.activo', () => buscar('activo', 'print(pelota.activo)'), true);
    c.boton('pelota:volar()', () => buscar('volar', 'pelota:volar()'), true);
    c.casilla('Pelota.__index = Pelota', v => { enlace1 = v; base(); di(v ? 'La nota volvió: las pelotas preguntan a Pelota.' : 'Borraste <code>Pelota.__index = Pelota</code>. Prueba <code>pelota:mover(dt)</code>.', v ? 'ok' : 'bad'); }, true);
    c.casilla('Pelota hereda de Entidad', v => { enlace2 = v; base(); di(v ? 'Pelota vuelve a tener padre.' : 'Pelota ya no hereda. Prueba <code>pelota.activo</code>.', v ? 'ok' : 'bad'); }, true);
    c.casilla('Pelota sobrescribe describir', v => { sobre = v; base(); di(v ? 'Ahora Pelota tiene su propio <code>describir</code>. Pídeselo a la pelota: ¿cuál gana?' : 'Pelota vuelve a usar el describir de Entidad.'); });
    base();
    return () => timers.forEach(clearTimeout);
  };

  /* 2 · Punto frente a dos puntos: a dónde llega cada argumento */
  window.DEMOS.puntos = function (el) {
    const f = FIG.lienzo(el, 900, 440);
    const def = mono(f.texto(450, 34, '', { tam: 24, tono: 'white', peso: 700 }));
    mono(f.texto(450, 70, 'self.x = self.x + dx', { tam: 21 }));
    f.texto(450, 112, 'los parámetros de la función', { tam: 18 });
    const par = [f.caja(190, 128, 230, 76, 'self', { tam: 26 }), f.caja(480, 128, 230, 76, 'dx', { tam: 26 })];
    const val = [mono(f.texto(305, 228, '', { tam: 21, tono: 'amber', peso: 700 })), mono(f.texto(595, 228, '', { tam: 21, tono: 'amber', peso: 700 }))];
    const llamada = mono(f.texto(450, 280, '', { tam: 26, tono: 'amber', peso: 800 }));
    f.texto(450, 314, 'lo que llega en la llamada, en orden', { tam: 18 });
    const arg = [f.caja(190, 330, 230, 64, '', { tam: 24 }), f.caja(480, 330, 230, 64, '', { tam: 24 })];
    const fl = [f.flecha(arg[0], par[0]), f.flecha(arg[1], par[1]), f.flecha(arg[1], par[0], { puntos: true })];
    const DEFS = [{ txt: 'function Pelota:mover(dx)', params: ['self', 'dx'] }, { txt: 'function Pelota.mover(dx)', params: ['dx'] }];
    const CALLS = [
      { txt: 'p:mover(5)', args: ['p', '5'], nota: 'los dos puntos ponen p primero' },
      { txt: 'p.mover(p, 5)', args: ['p', '5'], nota: 'p a mano' },
      { txt: 'p.mover(5)', args: ['5'], nota: '' },
      { txt: 'p:mover()', args: ['p'], nota: '' }
    ];
    let d = 0, k = 0;
    const di = FIG.dice(el);
    const nom = v => v === 'p' ? 'p (la pelota)' : v;
    function pinta() {
      const D = DEFS[d], C = CALLS[k];
      def.pon(D.txt); llamada.pon(C.txt);
      par[0].rotulo(D.params[0]); par[1].ver(D.params.length > 1);
      const env = {};
      D.params.forEach((p, i) => { env[p] = C.args[i] !== undefined ? C.args[i] : 'nil'; });
      D.params.forEach((p, i) => val[i].pon('recibe: ' + nom(env[p])).color(env[p] === 'nil' ? 'coral' : 'amber'));
      val[1].ver(D.params.length > 1);
      arg.forEach((a, i) => { const v = C.args[i]; a.ver(v !== undefined).rotulo(v === undefined ? '' : nom(v)); a.tono(v !== undefined && i >= D.params.length ? 'off' : 'base'); });
      fl[0].ver(C.args.length > 0); fl[1].ver(C.args.length > 1 && D.params.length > 1); fl[2].ver(false);
      const self = D.params.includes('self') ? env.self : 'nil (global)';
      let msg, tono, perdido = C.args.length > D.params.length ? ` El <b>${C.args[C.args.length - 1]}</b> no tiene parámetro donde caer: se pierde.` : '';
      if (self === '5') { msg = `self recibió <b>5</b>, un número. <code>self.x</code> no tiene sentido: <i>attempt to index local 'self' (a number value)</i>. Usaste punto donde iban dos puntos.`; tono = 'bad'; }
      else if (self !== 'p') { msg = `La función se definió con punto y sin self, así que <code>self</code> es una global que no existe: <i>attempt to index global 'self' (a nil value)</i>. Defínela con dos puntos.` + perdido; tono = 'bad'; }
      else if (env.dx !== '5') { msg = `self es la pelota, pero <code>dx</code> llegó vacío: <i>attempt to perform arithmetic on local 'dx' (a nil value)</i>. Faltó el argumento.`; tono = 'bad'; }
      else { msg = `self es la pelota y dx vale 5: <code>p.x</code> pasa de 100 a 105. ${k === 0 ? 'Los dos puntos pusieron <b>p</b> de primero sin que lo escribieras.' : 'Es lo mismo que <code>p:mover(5)</code>, escrito a mano.'}`; tono = 'ok'; }
      par.forEach((pp, i) => { const p = D.params[i]; if (!p) return; pp.tono(tono === 'ok' ? 'ok' : (p === 'self' && self !== 'p') || (p === 'dx' && env.dx !== '5') ? 'bad' : 'base'); });
      di(msg, tono);
    }
    const c = FIG.controles(el);
    c.opciones(DEFS.map(x => x.txt.replace('function ', '')), i => { d = i; pinta(); });
    c.opciones(CALLS.map(x => x.txt), i => { k = i; pinta(); });
    pinta();
  };

  /* 3 · Polimorfismo: un bucle ciego, muchas entidades */
  window.DEMOS.polimorfismo = function (el) {
    const f = FIG.lienzo(el, 900, 440);
    const TIPOS = { Pelota: 'rebota', Paleta: 'sigue flechas', Ladrillo: 'espera', PowerUp: 'cae despacio', Particula: 'se apaga' };
    const NUEVOS = ['PowerUp', 'Particula'];
    const l1 = mono(f.texto(40, 34, '', { tam: 21, tono: 'white', ancla: 'start', peso: 700 }));
    const l2 = mono(f.texto(40, 66, '', { tam: 21, tono: 'amber', ancla: 'start', peso: 700 }));
    const l3 = mono(f.texto(40, 98, '', { tam: 21, tono: 'white', ancla: 'start', peso: 700 }));
    const cajas = [0, 1, 2, 3, 4, 5].map(i => f.caja(14 + i * 147, 160, 136, 110, '', { tam: 22, sub: ' ' }));
    const met = mono(f.texto(450, 318, '', { tam: 22, tono: 'amber', peso: 700 }));
    const cnt = f.texto(450, 380, '', { tam: 21, tono: 'white', peso: 700 });
    let lista, modo = 0, i = -1, timer = 0, nNuevos = 0;
    const di = FIG.dice(el);
    const tipos = () => Array.from(new Set(lista));
    function pinta(on) {
      cajas.forEach((c, j) => { const t = lista[j]; c.ver(!!t); if (t) c.rotulo(t).sub('update: ' + TIPOS[t]).tono(j === on ? 'on' : 'base'); });
      if (modo === 0) { l1.pon('for _, e in ipairs(entidades) do'); l2.pon('  e:update(dt)      -- cada una sabe qué hacer'); l3.pon('end'); }
      else { l1.pon('for _, e in ipairs(entidades) do'); l2.pon('  if e.tipo == "Pelota" then ... elseif e.tipo == ...'); l3.pon('end   -- ' + tipos().length + ' ramas que mantener, y otras tantas en draw'); }
      cnt.pon(modo === 0 ? `tipos: ${tipos().length}  ·  líneas del bucle que cambiaste: 0` : `tipos: ${tipos().length}  ·  ramas if en el bucle: ${tipos().length}  ·  líneas que cambiaste: ${nNuevos * 2}`);
      cnt.color(modo === 1 && nNuevos ? 'coral' : 'white');
    }
    function para() { clearInterval(timer); timer = 0; }
    function paso() {
      i = (i + 1) % lista.length; const t = lista[i];
      pinta(i);
      if (modo === 0) { met.pon(`e:update(dt)  -->  ${t}:update(dt)`); di(`Para el bucle, <code>e</code> es «algo que tiene update». Esta vez es un <b>${t}</b> y corre <b>su</b> update: ${TIPOS[t]}. El bucle no preguntó qué era.`, 'ok'); }
      else { const n = tipos().indexOf(t) + 1; met.pon(`${n} ${n === 1 ? 'pregunta' : 'preguntas'} hasta llegar a "${t}"`); di(`El bucle pregunta tipo por tipo: ${tipos().slice(0, n).map(x => '¿es ' + x + '?').join(' ')} Recién ahí sabe qué hacer.`, ''); }
    }
    function reset() { para(); lista = ['Pelota', 'Paleta', 'Ladrillo', 'Ladrillo']; i = -1; nNuevos = 0; met.pon(''); pinta(-1); di('Cuatro entidades de tres clases distintas en una sola lista. Dale <b>Paso del bucle</b>.'); }
    const c = FIG.controles(el);
    c.opciones(['Polimorfismo', 'Un if por tipo'], m => { modo = m; para(); met.pon(''); pinta(-1); di(m ? 'Mismo juego, sin polimorfismo: el bucle tiene que saber de todos los tipos.' : 'El bucle solo sabe que todos responden a <code>update</code>.'); });
    c.boton('Paso del bucle', () => { para(); paso(); });
    c.boton('Recorrer todo', () => { para(); i = -1; paso(); timer = setInterval(() => { if (i >= lista.length - 1) { para(); return; } paso(); }, quieto() ? 1100 : 750); }, true);
    c.boton('Agregar un tipo nuevo', () => {
      para();
      if (nNuevos >= NUEVOS.length) return di('Ya no caben más en el dibujo. En el juego cabrían todos los que quieras.');
      const t = NUEVOS[nNuevos++]; lista.push(t); i = -1; met.pon(''); pinta(lista.length - 1);
      di(modo === 0 ? `Llegó <b>${t}</b> con su propio <code>update</code>. El bucle <b>no se tocó</b>: sigue siendo <code>e:update(dt)</code>.` : `Llegó <b>${t}</b>: hay que abrir el bucle y agregar otra rama <code>elseif</code>. Y lo mismo en el bucle de draw.`, modo === 0 ? 'ok' : 'bad');
    }, true);
    c.boton('Reiniciar', reset, true);
    reset();
    return () => clearInterval(timer);
  };

  /* 4 · Módulos: require corre el archivo una vez y guarda lo que devuelve */
  window.DEMOS.modulos = function (el) {
    const f = FIG.lienzo(el, 900, 440);
    const M = f.caja(24, 150, 200, 110, 'main.lua', { tam: 26, sub: 'pide módulos' });
    const cache = f.caja(320, 150, 250, 110, 'package.loaded', { tam: 22, sub: '(vacío)' });
    const Pe = f.caja(660, 40, 220, 110, 'pelota.lua', { tam: 26, sub: 'return Pelota' });
    const Pa = f.caja(660, 260, 220, 110, 'paleta.lua', { tam: 26, sub: 'return Paleta' });
    const mC = f.flecha(M, cache, { rotulo: 'require' }), cPe = f.flecha(cache, Pe, { rotulo: 'corre', ry: -8 }), cPa = f.flecha(cache, Pa, { rotulo: 'corre', ry: 30 });
    const linea = mono(f.texto(450, 32, '', { tam: 22, tono: 'white', peso: 700 }));
    const cnt = f.texto(450, 410, '', { tam: 20, tono: 'soft' });
    let guardado, corridas, sinReturn = false;
    const di = FIG.dice(el);
    function pinta() {
      const e = Object.keys(guardado).map(k => k + ' = ' + guardado[k]);
      cache.sub(e.length ? e.join(' · ') : '(vacío)');
      Pa.sub(sinReturn ? '(sin return)' : 'return Paleta').tono(sinReturn ? 'bad' : 'base');
      cnt.pon(`pelota.lua corrió ${corridas.pelota} ${corridas.pelota === 1 ? 'vez' : 'veces'}  ·  paleta.lua corrió ${corridas.paleta} ${corridas.paleta === 1 ? 'vez' : 'veces'}`);
    }
    function apaga() { [mC, cPe, cPa].forEach(a => a.tono('base')); M.tono('base'); cache.tono('base'); Pe.tono('base'); if (!sinReturn) Pa.tono('base'); }
    function req(nombre) {
      apaga(); const N = nombre === 'pelota' ? 'Pelota' : 'Paleta', caja = nombre === 'pelota' ? Pe : Pa, fl = nombre === 'pelota' ? cPe : cPa;
      linea.pon(`local ${N} = require("${nombre}")`); mC.tono('on'); M.tono('on');
      if (guardado[nombre] !== undefined) {
        cache.tono('ok'); pinta();
        return di(`<code>${nombre}</code> ya estaba en la caché. require te entrega <b>la misma tabla</b> y el archivo <b>no vuelve a correr</b>. Por eso diez archivos pueden pedir ${N} sin costo.`, 'ok');
      }
      fl.tono('on'); caja.tono(nombre === 'paleta' && sinReturn ? 'bad' : 'ok'); corridas[nombre]++;
      guardado[nombre] = nombre === 'paleta' && sinReturn ? 'true' : 'tabla';
      pinta();
      if (guardado[nombre] === 'true') di('Primera vez: Lua corrió <code>paleta.lua</code>, pero el archivo no devolvió nada. require guarda <b>true</b> en su lugar. Ahora prueba usar Paleta.', 'bad');
      else di(`Primera vez: Lua busca <code>${nombre}.lua</code>, lo corre de arriba abajo y guarda en la caché lo que devolvió con <code>return</code>: la tabla ${N}.`, 'ok');
    }
    const c = FIG.controles(el);
    c.boton('require("pelota")', () => req('pelota'));
    c.boton('require("paleta")', () => req('paleta'), true);
    c.boton('Paleta.new(350, 560)', () => {
      apaga(); linea.pon('local p = Paleta.new(350, 560)');
      if (guardado.paleta === undefined) return di('Primero hay que pedir el módulo: sin <code>require("paleta")</code>, la variable Paleta no existe y vale nil.', 'bad');
      if (guardado.paleta === 'true') { Pa.tono('bad'); return di('Se cae: <i>attempt to index local \'Paleta\' (a boolean value)</i>. require devolvió <b>true</b> porque paleta.lua no termina con <code>return Paleta</code>.', 'bad'); }
      Pa.tono('ok'); di('Funciona: Paleta es la tabla que devolvió el módulo, con su <code>new</code> adentro.', 'ok');
    }, true);
    c.casilla('paleta.lua sin return', v => {
      sinReturn = v; pinta();
      di(guardado.paleta !== undefined ? 'Ojo: paleta ya está en la caché y require no lo vuelve a leer. Reinicia (en LÖVE: cierra y vuelve a correr el juego).' : v ? 'Ahora paleta.lua olvidó su última línea. Pídelo con require.' : 'paleta.lua vuelve a terminar con <code>return Paleta</code>.', v ? 'bad' : '');
    });
    c.boton('Reiniciar el juego', () => { guardado = {}; corridas = { pelota: 0, paleta: 0 }; apaga(); linea.pon(''); pinta(); di('Juego recién abierto: la caché está vacía. Pide un módulo.'); }, true);
    guardado = {}; corridas = { pelota: 0, paleta: 0 }; apaga(); pinta();
    di('Juego recién abierto: la caché está vacía. Pide <code>require("pelota")</code> dos veces y cuenta cuántas corre el archivo.');
  };

  /* 5 · Estados del Breakout como objetos: main solo le habla al actual */
  window.DEMOS.estados = function (el) {
    const f = FIG.lienzo(el, 900, 440);
    const E = {
      titulo: f.caja(24, 170, 200, 90, 'Title', { tam: 26, sub: 'titulo.lua' }),
      jugar: f.caja(330, 170, 210, 90, 'Play', { tam: 26, sub: 'jugar.lua' }),
      pausa: f.caja(660, 30, 210, 90, 'Pause', { tam: 26, sub: 'pausa.lua' }),
      fin: f.caja(660, 300, 210, 90, 'GameOver', { tam: 26, sub: 'fin.lua' })
    };
    const NOM = { titulo: 'Title', jugar: 'Play', pausa: 'Pause', fin: 'GameOver' };
    const TR = [
      ['titulo', 'jugar', 'Enter', 0], ['jugar', 'pausa', 'P', 16], ['pausa', 'jugar', 'P', 16], ['jugar', 'fin', 'vidas = 0', 0], ['fin', 'titulo', 'Enter', -36]
    ].map(t => ({ de: t[0], a: t[1], fl: f.flecha(E[t[0]], E[t[1]], { rotulo: t[2], desvio: t[3] }) }));
    const l1 = mono(f.texto(450, 412, '', { tam: 20, tono: 'white', peso: 700 }));
    let actual, vidas, banderas = false;
    const di = FIG.dice(el);
    function pinta(paso) {
      Object.keys(E).forEach(k => E[k].tono(k === actual ? 'on' : 'base'));
      E.jugar.sub('jugar.lua · vidas ' + vidas);
      TR.forEach(t => t.fl.tono(paso && t.de === paso[0] && t.a === paso[1] ? 'on' : 'base'));
      l1.pon(banderas ? 'if enTitulo then ... elseif enJuego then ... elseif enPausa ... (×3 callbacks)' : `love.update(dt)  -->  actual:update(dt)  -->  ${NOM[actual]}:update(dt)`).color(banderas ? 'coral' : 'white');
    }
    function cambiar(a, nuevo) { const de = actual; actual = a; if (nuevo) vidas = 3; pinta([de, a]); }
    function evento(ev) {
      if (ev === 'enter') {
        if (actual === 'titulo') { cambiar('jugar', true); return di('<b>Title:keypressed</b> vio Enter y pidió <code>cambiar("jugar", true)</code>: partida nueva, 3 vidas.', 'ok'); }
        if (actual === 'fin') { cambiar('titulo'); return di('<b>GameOver:keypressed</b> vio Enter y volvió al título.', 'ok'); }
        return di(`${NOM[actual]} ignora Enter: ese estado no tiene nada que hacer con esa tecla. No hizo falta un if en main.`);
      }
      if (ev === 'p') {
        if (actual === 'jugar') { cambiar('pausa'); return di('<b>Play</b> pidió la pausa. Pause:update no hace nada: el mundo queda congelado.', 'ok'); }
        if (actual === 'pausa') { cambiar('jugar'); return di(`<b>Pause</b> devolvió el control a Play <b>sin reiniciar</b>: siguen ${vidas} vidas.`, 'ok'); }
        return di(`${NOM[actual]} no sabe de pausas. La P no hace nada aquí, y está bien.`);
      }
      if (ev === 'vida') {
        if (actual !== 'jugar') return di(`En ${NOM[actual]} la pelota no se mueve, así que no puede caerse. Solo Play pierde vidas.`);
        vidas--;
        if (vidas === 0) { cambiar('fin'); return di('<b>Play:update</b> vio vidas = 0 y pidió <code>cambiar("fin")</code>. Main no se enteró de por qué: solo cambió de estado.', 'ok'); }
        pinta(); di(`La pelota se cayó: quedan ${vidas}. Play sigue al mando.`);
      }
    }
    const c = FIG.controles(el);
    c.boton('Enter', () => evento('enter'));
    c.boton('P', () => evento('p'), true);
    c.boton('Se cae la pelota', () => evento('vida'), true);
    c.casilla('Con banderas en main (así no)', v => { banderas = v; pinta(); di(v ? 'Sin estados como objetos, main.lua necesita un if por estado en update, en draw y en keypressed. Cada estado nuevo abre los tres.' : 'Con estados como objetos, main tiene una línea por callback: le pasa el turno al estado actual.', v ? 'bad' : 'ok'); });
    c.boton('Reiniciar', () => { actual = 'titulo'; vidas = 3; pinta(); di('El juego arranca en Title. Pulsa Enter.'); }, true);
    actual = 'titulo'; vidas = 3; pinta();
    di('El juego arranca en <b>Title</b>. Cada caja es un archivo con los mismos métodos: entrar, update, draw y keypressed. Pulsa Enter.');
  };
})();
