/* Sesión 1 · Bienvenida, lógica y mecánicas */
(function () {
  const saltoPseudo = `// Mecánica: salto de un plataformero
// ENTRADAS: tecla de salto
// ESTADO:   y, velocidadY, enSuelo
// REGLAS:
si se presiona salto Y enSuelo entonces
    velocidadY ← -12        // hacia arriba
    enSuelo ← falso
fin
velocidadY ← velocidadY + gravedad
y ← y + velocidadY
si y >= suelo entonces
    y ← suelo
    velocidadY ← 0
    enSuelo ← verdadero
fin
// SALIDAS: dibujar al personaje en y, sonido "boing"`;

  const saltoLua = `-- Adelanto: el mismo salto simulado 8 frames, sin LÖVE
local y, vy, enSuelo = 100, 0, true
local SUELO, GRAVEDAD = 100, 3

for frame = 1, 8 do
    local salto = (frame == 1)          -- la entrada: salta en el frame 1
    if salto and enSuelo then
        vy, enSuelo = -12, false
    end
    vy = vy + GRAVEDAD
    y = y + vy
    if y >= SUELO then
        y, vy, enSuelo = SUELO, 0, true
    end
    print("frame " .. frame, "y=" .. y, "en suelo: " .. tostring(enSuelo))
end`;

  const monedaPseudo = `// Mecánica: recoger una moneda
// ENTRADAS: posición del jugador (ya calculada por el movimiento)
// ESTADO:   moneda.recogida, puntos, monedasRestantes
para cada moneda en monedas hacer
    si NO moneda.recogida Y jugador toca moneda entonces
        moneda.recogida ← verdadero
        puntos ← puntos + moneda.valor
        monedasRestantes ← monedasRestantes - 1
        reproducir sonido "ding"           // SALIDA
    fin
fin
si monedasRestantes = 0 entonces
    estado ← "nivel completo"
fin`;

  const monedaLua = `-- Adelanto en Lua puro: la regla de la moneda con datos de prueba
local puntos, restantes = 0, 2
local monedas = {
    { valor = 10, recogida = false, tocada = true },
    { valor = 50, recogida = true,  tocada = true },   -- ya recogida
    { valor = 10, recogida = false, tocada = false },
}
for i, m in ipairs(monedas) do
    if not m.recogida and m.tocada then
        m.recogida = true
        puntos = puntos + m.valor
        restantes = restantes - 1
        print("moneda " .. i .. ": ¡ding!")
    end
end
print("puntos:", puntos, "restantes:", restantes)`;

  const vidasPseudo = `// Mecánica: recibir daño con invulnerabilidad
// ESTADO: vidas, invulnerable, tiempoInvulnerable
si toca enemigo Y NO invulnerable entonces
    vidas ← vidas - 1
    invulnerable ← verdadero
    tiempoInvulnerable ← 2      // segundos
fin
si invulnerable entonces
    tiempoInvulnerable ← tiempoInvulnerable - tiempoDelFrame
    si tiempoInvulnerable <= 0 entonces
        invulnerable ← falso
    fin
fin
si vidas = 0 entonces estado ← "game over" fin`;

  window.SESION = {
    n: 1,
    titulo: 'Bienvenida, lógica y mecánicas',
    objetivos: [
      'Explicar cómo está organizado el curso, cómo se estudia cada sesión y cómo se evalúa.',
      'Describir una mecánica de juego como un sistema de entradas, estado, reglas y salidas.',
      'Escribir las reglas de una mecánica en pseudocódigo con condiciones y lógica booleana.',
      'Dibujar el diagrama de flujo de una regla y probarla con casos normales y casos borde.'
    ],
    analogia: 'Piensa en el árbitro de un partido. Mira lo que pasa en la cancha (entradas), sabe cómo va el partido (estado), consulta el reglamento (reglas) y pita, saca tarjetas o cambia el marcador (salidas). No opina ni improvisa: aplica reglas. El código de un juego es ese árbitro, decidiendo sesenta veces por segundo.',
    ideas: [
      ['C1', 'Una mecánica es un sistema: entradas, estado, reglas y salidas'],
      ['C2', 'Las reglas se escriben como condiciones con Y, O y NO'],
      ['C3', 'El estado solo cambia por reglas; las salidas lo muestran'],
      ['C4', 'Pseudocódigo y diagrama de flujo antes de programar'],
      ['C5', 'Los casos borde ponen a prueba una mecánica']
    ],
    agenda: [
      ['0:00', 'Bienvenida y presentación'],
      ['0:10', 'Quiz preclase (diagnóstico): de dónde partimos'],
      ['0:25', 'El curso en 9 frames, cómo se estudia y cómo se evalúa'],
      ['0:40', '¿Qué es una mecánica? El árbitro y los cuatro componentes'],
      ['0:55', 'Demo: un pájaro que aletea, en estado y reglas'],
      ['1:10', 'Reglas en pseudocódigo, diagramas de flujo y casos borde'],
      ['1:25', 'Taller: tu mecánica del Módulo 0 convertida en sistema'],
      ['1:50', 'Quiz postclase y lo que viene']
    ],
    conceptos: [
      { t: 'Mecánica', d: 'Una acción o regla con la que el jugador interactúa con el juego: saltar, disparar, recoger, construir.', ej: 'El salto de Mario, el parry de Hollow Knight, la rotación de piezas en Tetris.' },
      { t: 'Entrada (input)', d: 'Lo que llega al sistema desde afuera: teclas, clics, el paso del tiempo, una colisión.', ej: 'Presionar la barra espaciadora; que pase un segundo.' },
      { t: 'Estado', d: 'Los datos que el juego recuerda en este instante. Como viste en el Módulo 0, es la foto de todas las variables.', ej: '<code>y</code>, <code>velocidadY</code>, <code>enSuelo</code> de un personaje.' },
      { t: 'Regla', d: 'Una condición que, si se cumple, cambia el estado. Se escribe con si / entonces y operadores lógicos.', ej: 'Si se presiona salto Y está en el suelo, entonces la velocidad vertical pasa a −12.' },
      { t: 'Salida (output)', d: 'Lo que el jugador percibe del estado: imagen, sonido, vibración, texto.', ej: 'Dibujar al personaje en su nueva altura y sonar «boing».' },
      { t: 'Evento', d: 'Algo que ocurre en un momento puntual y puede disparar reglas.', ej: 'La bola toca un ladrillo; el temporizador llega a cero.' },
      { t: 'Diagrama de flujo', d: 'Dibujo de un algoritmo con rombos para las decisiones y rectángulos para las acciones.', ej: '¿Toca enemigo? → sí → ¿invulnerable? → no → restar vida.' },
      { t: 'Caso borde', d: 'Situación extrema o poco común donde una regla suele fallar.', ej: 'Recoger dos monedas en el mismo frame; recibir daño justo cuando se acaba la invulnerabilidad.' }
    ],
    errores: [
      { mito: 'Una mecánica es solo lo que se ve en pantalla.', real: 'Lo que se ve es la salida. Detrás hay estado y reglas que deciden qué mostrar.' },
      { mito: 'Si la regla funciona en el caso normal, ya está.', real: 'Los bugs viven en los casos borde: dos cosas a la vez, valores en cero, el primer o el último frame.' },
      { mito: 'Cualquier parte del código puede cambiar el estado como quiera.', real: 'Si cualquier pieza cambia cualquier dato, nadie sabe por qué el personaje voló. Cada dato debería cambiar por reglas claras.' },
      { mito: 'El diagrama de flujo es una pérdida de tiempo.', real: 'Diez minutos de diagrama ahorran horas de buscar por qué el personaje salta en el aire.' },
      { mito: 'Hay que saber programar para diseñar una mecánica.', real: 'Una mecánica bien descrita en pseudocódigo ya es diseño técnico. La traducción a Lua llega en la sesión 4.' }
    ],
    codigoIntro: 'Tres mecánicas descritas como sistemas. Lee primero el pseudocódigo y marca dónde están las entradas, el estado, las reglas y las salidas. Las pestañas de Lua son un adelanto que puedes ejecutar: no hace falta entenderlo todo todavía.',
    codigo: [
      { titulo: 'El salto de un plataformero', desc: 'La regla del salto necesita dos condiciones a la vez. ¿Qué pasaría sin <code>enSuelo</code>?',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: saltoPseudo }, { lang: 'Lua', label: 'Lua (adelanto, pruébalo)', src: saltoLua, run: true }] },
      { titulo: 'Recoger monedas', desc: 'El <code>NO moneda.recogida</code> evita contar dos veces la misma moneda: un caso borde típico.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: monedaPseudo }, { lang: 'Lua', label: 'Lua (adelanto, pruébalo)', src: monedaLua, run: true }] },
      { titulo: 'Daño con invulnerabilidad', desc: 'Una regla que depende del tiempo. Sin la invulnerabilidad, un enemigo te quitaría todas las vidas en un segundo (60 frames tocándolo).',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: vidasPseudo }] }
    ],
    practica: { t: 'Tu mecánica, convertida en sistema', intro: 'En parejas. Usen la mecánica que trajeron del Módulo 0 (o el salto de Mario si no la trajeron).',
      pasos: ['Llenen la tabla de cuatro columnas: entradas, estado, reglas, salidas.', 'Escriban cada regla en pseudocódigo con si / entonces y al menos un Y, O o NO.', 'Dibujen el diagrama de flujo de la regla principal.', 'Inventen dos casos borde y hagan la prueba de escritorio de cada uno.', 'Compartan en 1 minuto: ¿qué caso borde rompió su primera versión?'],
      entrega: 'La tabla y el diagrama, en foto o documento. Es la base del Pong en papel de la sesión 2.' },
    tarea: [
      'Haz el quiz postclase de esta sesión.',
      'Si no lo terminaste, completa el Módulo 0: lógica booleana, ciclos y depuración son la base de la sesión 2.',
      'Juega 10 minutos a <i>Pong</i> (hay versiones gratis en el navegador) y anota: ¿qué entradas, estado y reglas tiene?'
    ],
    lecturas: [
      'Sicart, M. (2008). Defining game mechanics. <i>Game Studies</i>, 8(2). Qué es (y qué no es) una mecánica.',
      'Bettini, A. (2007). <i>Programación de video juegos</i>. USERSHOP (bibliografía del syllabus).',
      'Nystrom, R. <i>Game Programming Patterns</i>, introducción (gratis en gameprogrammingpatterns.com).'
    ],
    mapa: {
      lead: 'Cómo se arma una mecánica y cómo se comprueba antes de programarla.',
      nodos: [
        ['ent', 'Entradas', 'teclas, tiempo, choques', 'idea', 'Lo que llega desde afuera del sistema.'],
        ['est', 'Estado', 'la foto de las variables', 'idea', 'Lo que el juego recuerda en este instante.'],
        ['reg', 'Reglas', 'si … entonces', 'codigo', 'Condiciones que, si se cumplen, cambian el estado.'],
        ['sal', 'Salidas', 'imagen y sonido', 'idea', 'Lo que el jugador percibe del estado.'],
        ['pse', 'Pseudocódigo', 'reglas por escrito', 'codigo', 'La mecánica escrita paso a paso, sin sintaxis.'],
        ['flu', 'Diagrama de flujo', 'reglas dibujadas', 'patron', 'Rombos para decidir, rectángulos para actuar.'],
        ['bor', 'Casos borde', 'donde viven los bugs', 'riesgo', 'Situaciones extremas que ponen a prueba las reglas.']
      ],
      cables: [['ent', 'reg', 'evento'], ['est', 'reg', 'datos'], ['reg', 'sal', 'datos'], ['reg', 'pse', 'llamada'], ['reg', 'flu', 'llamada'], ['pse', 'bor', 'llamada'], ['flu', 'bor', 'llamada']]
    },

    slides: [
      { kind: 'portada', title: 'Programación de Videojuegos',
        lead: 'Sesión 1 · Bienvenida, lógica y mecánicas',
        full: [{ ul: ['Vas a programar juegos en Lua y LÖVE.', 'Antes, vamos a aprender a describirlos con precisión.'] }, { pie: 'Flecha derecha: avanza · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas del docente' }],
        nota: 'Preséntate en un minuto (Lead Programmer en Teravision Games, proyectos con Epic, docencia en varias universidades). Pide a tres personas: tu nombre y el último juego que te atrapó. 6 minutos.' },

      { kind: 'reto', title: 'Antes de empezar: quiz preclase',
        left: [{ big: 'Seis preguntas. No es nota.' }, { p: 'Sirve para saber de dónde partimos. Al final de la sesión harás el postclase y verás tu ganancia en cada idea.' }],
        right: [{ panel: [{ ol: ['Abre el sitio del curso.', 'Sesión 1 → Quiz preclase.', 'Responde sin buscar: equivocarte aquí te ayuda a aprender.'] }], h: 'Cómo' }],
        izq: 50,
        nota: 'Dales 10 minutos. Mientras, observa qué preguntas fallan más (pregunta en voz alta por la 3 y la 5). Es el diagnóstico inicial que pide el syllabus.' },

      { kind: 'idea', title: 'Cómo se estudia cada sesión: siempre igual',
        full: [{ tabla: { head: ['Paso', 'Cuándo', 'Para qué'], rows: [['<b>1 · Quiz preclase</b>', 'Antes', 'Saber de dónde partes'], ['<b>2 · Slides interactivas</b>', 'En clase', 'Analogías, demos y predicciones'], ['<b>3 · Código y guía</b>', 'Taller y casa', 'Pseudocódigo, luego Lua'], ['<b>4 · Quiz postclase</b>', 'Al cerrar', 'Medir lo que ganaste']] }, pasos: true }, { clave: 'Primero piensas, después programas: mecánica → pseudocódigo → Lua.', paso: true }],
        nota: 'Muestra el sitio en vivo: la tira de frames, los cuatro pasos de cada sesión y el Módulo 0. 3 minutos.' },

      { kind: 'idea', title: 'Cómo se evalúa',
        left: [{ tabla: { head: ['Corte', 'Qué', 'Peso'], rows: [['I', 'Quiz o parcial (sesión 2)', '30 %'], ['II', 'ACA 1: diseño del Breakout', '30 %'], ['III', 'ACA 2: Breakout jugable', '32 %'], ['III', 'Auto y coevaluación', '8 %']] }, pasos: true }],
        right: [{ panel: [{ p: 'Los dos ACA son <b>un solo proyecto</b>: primero el plano, después la obra.' }, { p: 'El quiz del Corte I sale de las ideas del Módulo 0 y de las sesiones 1 y 2.' }], h: 'Lo importante' }],
        izq: 54,
        nota: 'Las fechas exactas están en C Digital y en el calendario académico de la cohorte. Aclara la política de entregas tardías. 3 minutos.' },

      { kind: 'idea', title: '¿Por qué Lua y LÖVE?',
        full: [{ tabla: { head: ['', 'Por qué importa'], rows: [['<b>Pequeño</b>', 'Lua se aprende en una tarde: más tiempo para las ideas, menos para pelear con la sintaxis.'], ['<b>Real</b>', 'Lua vive dentro de Roblox (Luau), World of Warcraft, Defold y muchos motores.'], ['<b>Honesto</b>', 'LÖVE no esconde nada: ves el game loop, la memoria y las colisiones escritas por ti.']] }, pasos: true }, { pie: 'Lo que aprendes aquí se traduce a Unity, Unreal o Godot: los conceptos son los mismos.', paso: true }],
        nota: 'Anticipa la pregunta "¿por qué no Unity?": porque un editor visual esconde justo lo que queremos entender. En Arquitectura (semestre II) ya se usa C# y Unity.' },

      { kind: 'analogia', title: 'El código de un juego es un árbitro',
        lead: 'No opina ni improvisa: mira, consulta el reglamento y decide.',
        left: [{ mapa: [['Lo que pasa en la cancha', 'Entradas<small>teclas, tiempo, choques</small>'], ['Cómo va el partido', 'Estado<small>las variables</small>'], ['El reglamento', 'Reglas<small>si … entonces</small>'], ['Pito, tarjeta, marcador', 'Salidas<small>imagen y sonido</small>']], de: 'Árbitro', a: 'Juego', pasos: true }],
        right: [{ clave: 'Y lo hace 60 veces por segundo, sin cansarse ni equivocarse.', paso: true }],
        izq: 62,
        nota: 'Pregunta: ¿qué pasa si el reglamento tiene un hueco? El árbitro no sabe qué pitar. En un juego, eso es un bug. 4 minutos.' },

      { kind: 'idea', title: 'Una mecánica tiene cuatro piezas',
        left: [{ svg: `<svg viewBox="0 0 760 420" role="img" aria-label="Entradas y estado entran a las reglas; las reglas cambian el estado y producen salidas"><rect width="760" height="420" fill="#1B1A2E"/><g font-family="Atkinson Hyperlegible Next, sans-serif" font-weight="700" text-anchor="middle"><rect x="30" y="60" width="180" height="90" fill="#5B6CFF"/><text x="120" y="112" font-size="26" fill="#F4F1E8">Entradas</text><rect x="290" y="150" width="180" height="110" fill="#FFC83D"/><text x="380" y="212" font-size="28" fill="#1B1A2E">Reglas</text><rect x="30" y="270" width="180" height="90" fill="#262542" stroke="#F4F1E8" stroke-width="3"/><text x="120" y="322" font-size="26" fill="#F4F1E8">Estado</text><rect x="550" y="160" width="180" height="90" fill="#3BC4A3"/><text x="640" y="212" font-size="26" fill="#1B1A2E">Salidas</text><g stroke="#F4F1E8" stroke-width="4" fill="none"><path d="M210 105h80v45M210 315h60v-55M470 205h76"/><path d="M380 260v100H216" stroke="#FF5D3A" stroke-dasharray="10 8"/></g><g fill="#F4F1E8"><path d="M282 140l8 12 8-12z"/><path d="M262 268l8-12 8 12z"/><path d="M540 197l12 8-12 8z"/></g><path d="M224 352l-12 8 12 8z" fill="#FF5D3A"/><text x="300" y="388" font-size="20" fill="#FF5D3A">las reglas cambian el estado</text></g></svg>` }],
        right: [{ ul: ['Las <b>entradas</b> y el <b>estado</b> alimentan las <b>reglas</b>.', 'Las reglas <b>cambian el estado</b>.', 'Las <b>salidas</b> solo muestran el estado.'], pasos: true }, { clave: 'Entradas → reglas → estado → salidas. Y vuelta a empezar.', paso: true }],
        izq: 56,
        nota: 'Este ciclo es, literalmente, el game loop que veremos en la sesión 2. Hoy lo usamos para describir; la próxima, para ejecutar.' },

      { kind: 'demo', title: 'Un pájaro que aletea, visto por dentro',
        lead: 'Aletea y mira qué entrada llega, qué regla se dispara y cómo cambia el estado.',
        full: [{ fig: 'sistema' }],
        top: true,
        nota: 'Que alguien aletee varias veces y otro lea en voz alta qué regla se disparó. Luego quita la regla del techo y pregunta qué bug aparece. 6 minutos.' },

      { kind: 'reto', title: '¿Qué componente es?',
        left: [{ p: 'En Tetris: «la pieza baja una fila cada medio segundo».' }],
        right: [{ check: { q: '«Cada medio segundo» es…', opts: ['Una salida', 'Una entrada: el paso del tiempo', 'Parte del estado', 'Un caso borde'], ok: 1, why: 'El tiempo es una entrada como cualquier tecla: llega desde afuera y dispara una regla (bajar una fila). La fila actual de la pieza es estado; dibujarla es salida.' } }],
        izq: 40,
        nota: 'Muchos responden "estado". Aclara: el estado es la fila donde está la pieza; el medio segundo es lo que dispara el cambio.' },

      { kind: 'codigo', title: 'Una regla en pseudocódigo',
        left: [{ code: [{ lang: 'Pseudo', label: 'Salto', src: `si se presiona salto Y enSuelo entonces
    velocidadY ← -12
    enSuelo ← falso
fin` }], marca: [{ l: [1], t: 'La <b>condición</b> mezcla una entrada (la tecla) con el estado (<code>enSuelo</code>) usando <b>Y</b>.' }, { l: [2], t: 'La regla cambia el estado: velocidad hacia arriba (en pantalla, y crece hacia abajo).' }, { l: [3], t: 'Deja de estar en el suelo. Sin esta línea, podrías saltar infinitamente en el aire.' }] }],
        right: [{ check: { q: 'Si borras <code>Y enSuelo</code>, ¿qué pasa?', opts: ['Nada cambia', 'El personaje puede saltar en el aire sin límite', 'Ya no puede saltar', 'El juego se cierra'], ok: 1, why: 'Sin esa condición, cada pulsación vuelve a impulsar hacia arriba, esté donde esté. Algunos juegos lo hacen a propósito (Flappy Bird); en un plataformero es un bug.' } }],
        izq: 52,
        nota: 'Recorre las marcas con la flecha antes de lanzar la pregunta.' },

      { kind: 'idea', title: 'La misma regla, dibujada',
        left: [{ svg: `<svg viewBox="0 0 560 460" role="img" aria-label="Diagrama de flujo del salto"><rect width="560" height="460" fill="#1B1A2E"/><g font-family="Atkinson Hyperlegible Next, sans-serif" font-weight="700" text-anchor="middle"><rect x="200" y="20" width="160" height="44" fill="#262542" stroke="#F4F1E8" stroke-width="2"/><text x="280" y="49" font-size="19" fill="#F4F1E8">cada frame</text><path d="M280 90l120 54-120 54-120-54z" fill="#5B6CFF"/><text x="280" y="150" font-size="19" fill="#F4F1E8">¿salto presionado?</text><path d="M280 240l120 54-120 54-120-54z" fill="#5B6CFF"/><text x="280" y="300" font-size="19" fill="#F4F1E8">¿en el suelo?</text><rect x="190" y="380" width="180" height="56" fill="#3BC4A3"/><text x="280" y="406" font-size="17" fill="#1B1A2E">velocidadY ← −12</text><text x="280" y="426" font-size="17" fill="#1B1A2E">enSuelo ← falso</text><rect x="440" y="170" width="100" height="44" fill="#262542" stroke="#6E6B85" stroke-width="2"/><text x="490" y="198" font-size="17" fill="#B9B6C9">no salta</text><g stroke="#F4F1E8" stroke-width="3" fill="none"><path d="M280 64v26M280 198v42M280 348v32M400 144h40v26M400 294h90v-80"/></g><g font-size="17" fill="#FFC83D"><text x="296" y="224">sí</text><text x="296" y="372">sí</text><text x="420" y="136">no</text><text x="420" y="286">no</text></g></g></svg>` }],
        right: [{ ul: ['<b>Rombo</b>: una pregunta de sí o no.', '<b>Rectángulo</b>: una acción que cambia el estado.', 'El <b>Y</b> se dibuja como dos rombos en fila.'], pasos: true }, { clave: 'Si no lo puedes dibujar, todavía no lo entiendes del todo.', paso: true }],
        izq: 46,
        nota: 'Muestra que "A Y B" son dos preguntas encadenadas y "A O B" serían dos caminos que llegan a la misma acción.' },

      { kind: 'demo', title: 'Casos borde: donde viven los bugs',
        lead: 'Elige un caso y mira si la regla de la moneda aguanta.',
        full: [{ fig: 'casos' }],
        top: true,
        nota: 'El caso "moneda ya recogida" sin la condición NO recogida suma puntos infinitos. Pide que inventen un caso borde que no esté en la lista.' },

      { kind: 'reto', title: '¿Cuál es un caso borde de verdad?',
        left: [{ p: 'Mecánica: <b>daño con 2 segundos de invulnerabilidad</b>.' }],
        right: [{ check: { q: 'Elige el caso que más probablemente esconda un bug.', opts: ['El jugador camina sin tocar enemigos', 'Dos enemigos lo tocan en el mismo frame', 'El jugador pausa el menú principal', 'El enemigo es de color rojo'], ok: 1, why: 'Dos eventos simultáneos son el caso borde clásico: ¿resta una vida o dos? La regla debe decidirlo de forma explícita (con la invulnerabilidad, solo el primero cuenta).' } }],
        izq: 42,
        nota: 'Pregunta qué otros casos borde ven: invulnerabilidad que termina justo al tocar, vidas en 0 y un enemigo más, etc.' },

      { kind: 'antipatron', title: 'Antipatrón: cualquiera cambia cualquier cosa',
        compare: { a: { label: 'Reglas regadas', lang: 'Pseudo', src: `// en el enemigo
jugador.vidas ← jugador.vidas - 1
// en la moneda
jugador.vidas ← jugador.vidas + 1
// en el HUD
si vidas < 0 entonces vidas ← 3` }, b: { label: 'Reglas con dueño', lang: 'Pseudo', src: `// solo el jugador cambia sus vidas
funcion jugador.recibirDanio()
    si NO invulnerable entonces
        vidas ← vidas - 1
    fin
fin
// los demás le piden: jugador.recibirDanio()` } },
        nota: 'Pregunta: en la versión de la izquierda, si el jugador tiene −1 vidas, ¿dónde buscas el bug? En tres archivos. Es la semilla de la POO de la sesión 3.' },

      { kind: 'actividad', title: 'Taller: tu mecánica como sistema',
        left: [{ ol: ['Tabla: entradas, estado, reglas, salidas.', 'Reglas en pseudocódigo + un diagrama.', 'Dos casos borde con prueba de escritorio.'], pasos: true }],
        right: [{ tabla: { head: ['Entradas', 'Estado', 'Reglas', 'Salidas'], rows: [['tecla salto', 'y, vy, enSuelo', 'si salto Y enSuelo…', 'dibujo, «boing»']] } }, { pie: 'En parejas, 25 minutos. Usen la mecánica del Módulo 0.' }],
        izq: 46,
        nota: 'Circula entre las parejas. La pregunta clave para cada una: ¿qué dato cambia esta regla y quién más lo cambia?' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        left: [{ ol: ['Una mecánica es un sistema: entradas, estado, reglas, salidas.', 'Las reglas se escriben con si / entonces y Y, O, NO.', 'Diagrama y casos borde antes de programar.'] }],
        right: [{ clave: 'Ahora, el quiz postclase: 8 preguntas.' }, { p: '<b>Sesión 2:</b> el game loop. Cómo se ejecuta este sistema 60 veces por segundo y por qué el tiempo importa.' }],
        izq: 56,
        nota: 'Recuerda que la sesión 2 incluye el quiz o parcial del Corte I (30 %): cubre Módulo 0, sesión 1 y sesión 2.' }
    ],

    pre: [
      { q: '¿Qué es una mecánica de juego?', opts: ['El motor gráfico del juego', 'Una acción o regla con la que el jugador interactúa: saltar, disparar, recoger', 'La historia del juego', 'El precio del juego'], ok: 1, why: 'Una mecánica es una regla de interacción. El motor y la historia son otras capas.', idea: 'C1' },
      { q: 'En Pac-Man, «el jugador presiona la flecha izquierda». ¿Qué es eso para el sistema?', opts: ['Una entrada', 'Una salida', 'El estado', 'Una regla'], ok: 0, why: 'Llega desde afuera del sistema: es una entrada.', idea: 'C1' },
      { q: 'Regla: «si toca un fantasma Y NO tiene poder, pierde una vida». Toca un fantasma con poder. ¿Pierde vida?', opts: ['Sí', 'No', 'Pierde dos', 'Depende del nivel'], ok: 1, why: 'Con poder, «NO tiene poder» es falso, así que toda la condición con Y es falsa.', idea: 'C2' },
      { q: '¿Cuál de estos datos es parte del estado de un personaje?', opts: ['El sonido de su salto', 'Su posición y sus vidas', 'La tecla que presionaste', 'El color del menú'], ok: 1, why: 'El estado es lo que el juego recuerda. El sonido es salida y la tecla es entrada.', idea: 'C3' },
      { q: '¿Para qué sirve escribir una mecánica en pseudocódigo antes de programarla?', opts: ['Para que el juego corra más rápido', 'Para pensar la lógica sin pelear con la sintaxis', 'Porque el computador lo entiende mejor', 'No sirve para nada'], ok: 1, why: 'El pseudocódigo separa pensar de escribir: la lógica primero, el lenguaje después.', idea: 'C4' },
      { q: '¿Qué es un caso borde?', opts: ['El borde de la pantalla', 'Una situación extrema o poco común donde una regla puede fallar', 'Un error de ortografía', 'El último nivel del juego'], ok: 1, why: 'Los casos borde (dos cosas a la vez, valores en cero) son donde suelen aparecer los bugs.', idea: 'C5' }
    ],
    post: [
      { q: 'En Tetris, «la pieza baja una fila cada medio segundo». El medio segundo es…', opts: ['Una salida', 'Una entrada: el paso del tiempo', 'Un caso borde', 'Un diagrama'], ok: 1, why: 'El tiempo llega desde afuera y dispara una regla; es una entrada como cualquier tecla.', idea: 'C1' },
      { q: 'Ordena el ciclo de una mecánica.', opts: ['Salidas → reglas → entradas', 'Entradas → reglas → cambio de estado → salidas', 'Estado → salidas → entradas → fin', 'Reglas → entradas → salidas'], ok: 1, why: 'Las entradas y el estado alimentan las reglas, las reglas cambian el estado y las salidas lo muestran. Luego se repite.', idea: 'C1' },
      { q: 'Quieres que el personaje pueda saltar si está en el suelo o si le queda un doble salto, pero nunca si está aturdido. ¿Qué regla lo dice?', opts: ['enSuelo Y dobleSalto Y aturdido', '(enSuelo O dobleSalto) Y NO aturdido', 'enSuelo O dobleSalto O NO aturdido', 'NO (enSuelo Y dobleSalto)'], ok: 1, why: 'El O cubre las dos formas de saltar y el Y NO aturdido bloquea el caso prohibido.', idea: 'C2' },
      { q: 'En la regla del salto, si borras la condición <code>Y enSuelo</code>, ¿qué pasa?', opts: ['Ya no puede saltar', 'Puede saltar en el aire sin límite', 'Nada', 'Salta más bajo'], ok: 1, why: 'Cada pulsación vuelve a impulsar hacia arriba esté donde esté. En un plataformero es un bug; en Flappy Bird es la mecánica.', idea: 'C2' },
      { q: 'Tres scripts distintos cambian <code>jugador.vidas</code> directamente y aparecen vidas negativas. ¿Cuál es el problema de fondo?', opts: ['Faltan más vidas', 'El estado no tiene un dueño: cualquiera lo cambia sin reglas claras', 'El color del HUD', 'El juego necesita más enemigos'], ok: 1, why: 'Cuando cualquier pieza cambia cualquier dato, no hay un lugar donde se cumplan las reglas. Que cada dato tenga dueño es la semilla de la POO.', idea: 'C3' },
      { q: 'El sonido «ding» al recoger una moneda es…', opts: ['Entrada', 'Estado', 'Salida', 'Regla'], ok: 2, why: 'Es lo que el jugador percibe como resultado: una salida.', idea: 'C3' },
      { q: 'En un diagrama de flujo, ¿qué representa un rombo?', opts: ['Una acción', 'Una decisión de sí o no', 'El inicio del programa', 'Una variable'], ok: 1, why: 'Rombo = pregunta; rectángulo = acción. «A Y B» se dibuja como dos rombos en fila.', idea: 'C4' },
      { q: 'Regla de la moneda sin <code>NO moneda.recogida</code>. ¿Qué caso borde la rompe?', opts: ['Que haya muchas monedas', 'Quedarse quieto encima de una moneda: suma puntos en cada frame', 'Que la moneda sea dorada', 'Que el jugador no la toque'], ok: 1, why: 'Sin esa condición, la misma moneda se cuenta 60 veces por segundo mientras la tocas.', idea: 'C5' }
    ]
  };
})();
