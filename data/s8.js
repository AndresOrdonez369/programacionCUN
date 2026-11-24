(function () {
  /* ---------- código de la sesión ---------- */
  const bossPseudo = `CLASE Jefe
    nombre, _vida, vidaMax
    recibirGolpe(daño):  _vida ← máximo(0, _vida − daño)
    estaDerrotado():     _vida = 0
    castigo():           1      -- vidas que pierde el equipo si falla

CLASE Blindado  HEREDA DE  Jefe
    castigo():           2      -- sobrescribe: un error cuesta el doble

EL JUEGO, al fallar una pregunta:
    vidasEquipo ← vidasEquipo − jefe.castigo()
    -- no pregunta si el jefe es blindado: el jefe responde`;
  const bossRun = `local Jefe = {}
Jefe.__index = Jefe

function Jefe.new(nombre, vidaMax)
    local self = setmetatable({}, Jefe)
    self.nombre, self._vida, self.vidaMax = nombre, vidaMax, vidaMax
    return self
end
function Jefe:recibirGolpe(dano) self._vida = math.max(0, self._vida - dano) end
function Jefe:estaDerrotado() return self._vida == 0 end
function Jefe:castigo() return 1 end           -- vidas que pierde el equipo

local Blindado = setmetatable({}, { __index = Jefe })   -- hereda
Blindado.__index = Blindado
function Blindado.new(nombre, vidaMax)
    return setmetatable(Jefe.new(nombre, vidaMax), Blindado)
end
function Blindado:castigo() return 2 end       -- sobrescribe

for _, jefe in ipairs({ Jefe.new("LOOPRA", 100), Blindado.new("FINITUS", 100) }) do
    jefe:recibirGolpe(50)
    print(jefe.nombre, jefe._vida, "castigo: " .. jefe:castigo())
end`;
  const pregPseudo = `-- El contenido del Boss Rush es una tabla, como los niveles del Breakout
jefes ← lista de
    { nombre, tema, blindado?,
      preguntas ← lista de { texto, opciones (4), correcta } }

-- La lógica no sabe qué preguntas hay:
para cada jefe:
    mientras el jefe tenga vida y el equipo tenga vidas:
        mostrar una pregunta
        si la elección es la correcta: golpear al jefe
        si no: el equipo pierde jefe.castigo() vidas

-- Cambiar el repaso = editar la tabla. La lógica no se toca.`;
  const pregRun = `-- questions.lua del Boss Rush, resumido: el contenido es datos
local jefes = {
    { nombre = "AABBADDON", tema = "Colisiones", preguntas = {
        { texto = "AABB detecta choque cuando hay solape en...",
          opciones = { "Solo X", "Solo Y", "X y Y a la vez", "Cualquiera" }, correcta = 3 },
    } },
    { nombre = "FINITUS", tema = "Estados y game feel", blindado = true, preguntas = {
        { texto = "Screen shake, partículas y sonido se llaman...",
          opciones = { "Game feel", "Hitbox", "Delta time", "Herencia" }, correcta = 1 },
    } },
}

local function responder(pregunta, eleccion)
    return eleccion == pregunta.correcta
end

for _, jefe in ipairs(jefes) do
    local p = jefe.preguntas[1]
    print(jefe.nombre, "¿la opción 3?", responder(p, 3), "correcta: " .. p.opciones[p.correcta])
end`;
  const mainPseudo = `-- main.lua: el director de la banda. Conoce a todos,
-- pero no hace el trabajo de nadie.

al cargar:
    crear el juego con los niveles (datos)          -- sesión 7
    arrancar la máquina de estados en Title          -- sesiones 2 y 7

en cada frame (update con dt):                       -- sesión 2
    limitar dt
    actualizar los efectos (shake, partículas)
    si hay hit-stop: no hacer nada más
    el estado actual actualiza                       -- Play mueve y choca (6 y 7)

al dibujar:
    el estado actual dibuja                          -- sesión 4

al presionar una tecla:
    el estado actual decide qué hacer`;
  const mainLua = `-- main.lua: el director. Conoce a todos, pero no hace el trabajo de nadie.
local Juego   = require("src.Juego")
local niveles = require("data.niveles")
local estados = require("src.estados")

local juego

function love.load()
    juego = Juego.new(niveles)              -- crea paleta, bola, ladrillos y efectos
    estados.iniciar(juego, "title")         -- la FSM arranca en el título
end

function love.update(dt)
    dt = math.min(dt, 1 / 30)               -- tope de dt (sesión 7)
    juego.efectos:update(dt)                -- shake y partículas
    if juego.efectos:congelado() then return end   -- hit-stop
    estados.actual():update(dt)             -- Play mueve la bola y choca
end

function love.draw() estados.actual():draw() end
function love.keypressed(k) estados.actual():tecla(k) end`;
  const pruebasPseudo = `-- Antes de la demo: una lista de casos que DEBEN dar lo esperado

casos ←
    "se solapan"          → aabb(A, B) debe ser verdadero
    "solo en X no basta"  → debe ser falso
    "la cruz"             → debe ser verdadero
    "limitar por arriba"  → limitar(50, 0, 30) debe ser 30

para cada caso:
    imprimir OK o FALLA

-- Si cambias algo la noche antes y una prueba falla,
-- lo sabes antes que tu público.`;
  const pruebasRun = `-- Antes de la demo: pruebas rápidas de tus funciones
local function aabb(a, b)
    return a.x < b.x + b.ancho and b.x < a.x + a.ancho
       and a.y < b.y + b.alto  and b.y < a.y + a.alto
end
local function limitar(v, a, b) return math.max(a, math.min(v, b)) end
local function caja(x, y, ancho, alto) return { x = x, y = y, ancho = ancho, alto = alto } end

local pruebas = {
    { "se solapan",         aabb(caja(0, 0, 10, 10), caja(5, 5, 10, 10)) == true },
    { "solo en X no basta", aabb(caja(0, 0, 10, 10), caja(5, 20, 10, 10)) == false },
    { "la cruz",            aabb(caja(0, 40, 200, 20), caja(90, 0, 20, 100)) == true },
    { "limitar por arriba", limitar(50, 0, 30) == 30 },
    { "limitar por abajo",  limitar(-4, 0, 30) == 0 },
}

local fallas = 0
for _, p in ipairs(pruebas) do
    print((p[2] and "OK    " or "FALLA ") .. p[1])
    if not p[2] then fallas = fallas + 1 end
end
print(fallas == 0 and "Todo en orden" or fallas .. " pruebas fallaron")`;

  /* ---------- versiones cortas para slides ---------- */
  const bossCorto = `local Jefe = {}
Jefe.__index = Jefe

function Jefe.new(nombre, vidaMax)
    local self = setmetatable({}, Jefe)
    self.nombre, self._vida = nombre, vidaMax
    return self
end
function Jefe:castigo() return 1 end

local Blindado = setmetatable({}, { __index = Jefe })
Blindado.__index = Blindado
function Blindado.new(nombre, vidaMax)
    return setmetatable(Jefe.new(nombre, vidaMax), Blindado)
end
function Blindado:castigo() return 2 end

-- en el juego, al fallar:
vidas = vidas - jefe:castigo()`;
  const mainCorto = `local Juego   = require("src.Juego")
local niveles = require("data.niveles")
local estados = require("src.estados")
local juego

function love.load()
    juego = Juego.new(niveles)
    estados.iniciar(juego, "title")
end

function love.update(dt)
    dt = math.min(dt, 1 / 30)
    juego.efectos:update(dt)
    if juego.efectos:congelado() then return end
    estados.actual():update(dt)
end

function love.draw() estados.actual():draw() end
function love.keypressed(k) estados.actual():tecla(k) end`;
  const sintesisCode = `function love.draw()
    bola.x = bola.x + bola.vx       -- (1)
    for _, l in ipairs(ladrillos) do
        if l.tipo == "duro" then    -- (2)
            l.vida = l.vida - 1
        end
    end
    if pausado and not jugando then -- (3)
        dibujarAviso("PAUSA")
    end
end`;

  const svgDefensa = `<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cuatro pasos para defender una decisión: problema, alternativas, decisión y razón, evidencia.">
<rect width="680" height="300" fill="#1B1A2E"/>
<rect x="16" y="70" width="140" height="110" fill="none" stroke="#FF5D3A" stroke-width="3"/>
<rect x="186" y="70" width="140" height="110" fill="none" stroke="#5B6CFF" stroke-width="3"/>
<rect x="356" y="70" width="140" height="110" fill="none" stroke="#FFC83D" stroke-width="3"/>
<rect x="526" y="70" width="140" height="110" fill="none" stroke="#3BC4A3" stroke-width="3"/>
<line x1="158" y1="125" x2="178" y2="125" stroke="#F4F1E8" stroke-width="3"/><polygon points="178,118 186,125 178,132" fill="#F4F1E8"/>
<line x1="328" y1="125" x2="348" y2="125" stroke="#F4F1E8" stroke-width="3"/><polygon points="348,118 356,125 348,132" fill="#F4F1E8"/>
<line x1="498" y1="125" x2="518" y2="125" stroke="#F4F1E8" stroke-width="3"/><polygon points="518,118 526,125 518,132" fill="#F4F1E8"/>
<text x="86" y="118" fill="#FF5D3A" font-size="20" font-weight="700" text-anchor="middle">Problema</text>
<text x="86" y="146" fill="#F4F1E8" font-size="15" text-anchor="middle">qué dolía</text>
<text x="256" y="118" fill="#5B6CFF" font-size="20" font-weight="700" text-anchor="middle">Opciones</text>
<text x="256" y="146" fill="#F4F1E8" font-size="15" text-anchor="middle">al menos dos</text>
<text x="426" y="118" fill="#FFC83D" font-size="20" font-weight="700" text-anchor="middle">Decisión</text>
<text x="426" y="146" fill="#F4F1E8" font-size="15" text-anchor="middle">y su porqué</text>
<text x="596" y="118" fill="#3BC4A3" font-size="20" font-weight="700" text-anchor="middle">Evidencia</text>
<text x="596" y="146" fill="#F4F1E8" font-size="15" text-anchor="middle">se ve en el juego</text>
<text x="340" y="40" fill="#F4F1E8" font-size="20" font-weight="700" text-anchor="middle">«Elegí X en vez de Y porque Z; se nota en W»</text>
<text x="340" y="236" fill="#6E6B85" font-size="16" text-anchor="middle">y al final: qué cambiarías si empezaras hoy</text>
</svg>`;

  window.SESION = {
    n: 8,
    titulo: 'Demos, síntesis y cierre',
    objetivos: [
      'Recuperar sin apuntes los núcleos del curso (Lua, game loop, POO, colisiones, estados y game feel) jugando el Boss Rush por equipos.',
      'Presentar el propio Breakout en 5 minutos defendiendo al menos una decisión técnica con problema, alternativa, razón y evidencia.',
      'Dar retroalimentación concreta a otro equipo con dos estrellas y un deseo.',
      'Autoevaluarse y coevaluar con criterios observables, sosteniendo cada nota con un ejemplo.',
      'Ubicar lo aprendido en el mapa completo del curso y reconocer qué se transfiere a otros motores y al curso de Arquitectura de Videojuegos.'
    ],
    analogia: 'Después del partido, los buenos jugadores ven la repetición: no para lamentarse, sino para entender qué decidieron en cada jugada y qué harían distinto. Hoy es la repetición de tu Breakout: muestras la jugada, explicas por qué la elegiste y reconoces qué cambiarías. Y como en un buen equipo, también comentas las jugadas de los demás con respeto y con datos.',
    ideas: [
      ['C1', 'Un juego en LÖVE es un bucle: update(dt) cambia el estado y draw solo lo dibuja. En Lua todo es <code>local</code> y todo se arma con tablas.'],
      ['C2', 'POO en Lua: <code>.new()</code> con <code>setmetatable</code> y <code>__index</code>. La herencia reutiliza; el polimorfismo deja que cada objeto responda a su manera al mismo mensaje.'],
      ['C3', 'Colisiones: AABB detecta (solape en X y en Y), se resuelve por el eje de menor penetración, la paleta decide el ángulo y los sub-pasos evitan el túnel.'],
      ['C4', 'Estados y datos ordenan el juego: un estado actual con transiciones por evento, contenido en tablas y game feel aparte de las reglas.'],
      ['C5', 'Defender una decisión técnica es contar el problema, las opciones, la razón y la evidencia; evaluar con honestidad es sostener cada nota con un ejemplo concreto.']
    ],
    agenda: [
      ['0:00', 'Bienvenida y quiz preclase'],
      ['0:07', 'La repetición del partido'],
      ['0:10', 'Boss Rush por equipos'],
      ['0:32', 'El Boss Rush por dentro: lo que ya saben hacer'],
      ['0:38', 'Cómo defender una decisión en 5 minutos'],
      ['0:45', 'Demos de los Breakout'],
      ['1:30', 'El mapa completo del curso'],
      ['1:37', 'Autoevaluación y coevaluación'],
      ['1:47', 'Qué sigue después del curso'],
      ['1:52', 'Quiz postclase y cierre']
    ],
    conceptos: [
      { t: 'Práctica de recuperación', d: 'Recordar algo sin mirar los apuntes. Cuesta más que releer, y justamente por eso fija mejor lo aprendido.', ej: 'El Boss Rush obliga a cada equipo a recordar y discutir antes de elegir: eso es recuperación, no repaso pasivo.' },
      { t: 'Decisión técnica', d: 'Una elección sobre cómo construir algo cuando había más de una forma razonable de hacerlo.', ej: '«Los niveles son tablas de texto y no posiciones escritas en el código».' },
      { t: 'Alternativa descartada', d: 'La otra opción que consideraste y por qué no la elegiste. Sin alternativa no hay decisión, solo una costumbre.', ej: '«Pensé en un if por tipo de ladrillo, pero con tres tipos ya eran cuatro lugares que editar».' },
      { t: 'Evidencia', d: 'Algo que el público puede ver o comprobar: el juego corriendo, una línea de código, una prueba que pasa, un antes y un después.', ej: 'Mostrar en vivo que agregar un ladrillo explosivo fue un archivo nuevo y una línea en la fábrica.' },
      { t: 'Demo técnica', d: 'Presentación corta en la que el juego se ve funcionando y se explican las decisiones que lo hacen funcionar. No es un tráiler.', ej: 'Cinco paradas en cinco minutos: qué es, juega, una decisión, un bug, qué cambiarías.' },
      { t: 'Post-mortem', d: 'Revisión al terminar un proyecto: qué salió bien, qué salió mal y qué se aprendió. Es una práctica común en la industria y se hace sin buscar culpables.', ej: 'La reflexión del documento técnico del ACA 2 es un pequeño post-mortem.' },
      { t: 'Autoevaluación', d: 'Calificar tu propio trabajo y tu propio aprendizaje con criterios dados. Vale 4 % y solo sirve si es honesta.', ej: '«Colisiones: 4. La bola ya no se pega, pero a 1500 px/s todavía atraviesa a veces; no alcancé a poner sub-pasos».' },
      { t: 'Coevaluación', d: 'Calificar el aporte de tus compañeros de equipo con criterios observables. Vale 4 % y es confidencial.', ej: '«Aporte técnico: 5. Hizo la FSM completa y nos explicó cómo funcionaba la transición de Pause a Play».' }
    ],
    errores: [
      { mito: 'La demo es mostrar que el juego funciona.', real: 'Que funcione es el punto de partida. La demo vale por las decisiones que explicas: por qué así y no de otra forma, y cómo se nota en el juego.' },
      { mito: 'Defender mi proyecto es decir que todo quedó bien.', real: 'Reconocer qué cambiarías y por qué muestra que entiendes tu código. Un equipo técnico confía más en quien conoce sus límites.' },
      { mito: 'Si me pongo 5 en todo, me va mejor.', real: 'Una nota alta sin ejemplo no se sostiene y se revisa. La autoevaluación vale por la honestidad y por la evidencia, no por el número.' },
      { mito: 'La coevaluación sirve para premiar a los amigos o castigar al que no me cae bien.', real: 'Se evalúan conductas observables: aporte, cumplimiento, comunicación y trato. Se critica el trabajo, no a la persona.' },
      { mito: 'Aprendí Lua y LÖVE; si cambio de motor, empiezo de cero.', real: 'Cambia la sintaxis. El game loop, dt, las clases, AABB, la máquina de estados y el game feel funcionan igual en Godot, Unity o Defold.' }
    ],
    codigoIntro: 'Cuatro piezas para cerrar: el Boss Rush por dentro (hecho con lo que ya saben), el main.lua que dirige todo el Breakout y unas pruebas rápidas para llegar tranquilos a la demo.',
    codigo: [
      { titulo: 'El jefe blindado: herencia y polimorfismo', desc: 'En el Boss Rush original, ArmoredBoss hereda de Boss y sobrescribe penaltyLives(). Aquí, la misma idea con nombres en español.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: bossPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: bossRun, run: true }
        ] },
      { titulo: 'Las preguntas son datos', desc: 'questions.lua guarda el contenido en tablas, igual que los niveles del Breakout. Cambiar el repaso es editar la tabla.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: pregPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: pregRun, run: true }
        ] },
      { titulo: 'main.lua: el director del Breakout', desc: 'Todo el curso en un archivo corto: game loop, dt, FSM, datos y game feel. Cada línea apunta a una sesión.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: mainPseudo },
          { lang: 'Lua', label: 'Lua (LÖVE)', src: mainLua }
        ] },
      { titulo: 'Pruebas antes de la demo', desc: 'Unos casos con resultado conocido. Si cambias algo la noche anterior, te enteras antes que el público.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: pruebasPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: pruebasRun, run: true }
        ] }
    ],
    practica: {
      t: 'Demo de 5 minutos con dos estrellas y un deseo',
      intro: 'Cada equipo, o cada persona si trabajó sola, presenta su Breakout. El resto escucha y deja retroalimentación por escrito en el chat.',
      pasos: [
        '<b>Qué es tu juego (30 s):</b> una frase con lo que lo hace tuyo.',
        '<b>Juega en vivo (90 s):</b> un nivel, un ladrillo especial y cómo se pierde.',
        '<b>Una decisión técnica (90 s):</b> problema, opciones, decisión y evidencia, con el código en pantalla.',
        '<b>Un bug y cómo lo resolviste (60 s)</b> y <b>qué cambiarías (30 s)</b>.',
        '<b>El público:</b> dos estrellas concretas y un deseo dicho como pregunta.'
      ],
      entrega: 'Las estrellas y deseos quedan en el chat; cada equipo copia los suyos para la autoevaluación.'
    },
    tarea: [
      'Diligencia la autoevaluación y la coevaluación (4 % + 4 %) en el enlace que comparte el docente. Cada nota con un ejemplo concreto.',
      'Sube tu Breakout a un repositorio con un README corto: cómo correrlo, una captura, una decisión técnica y qué cambiarías. Es tu primera pieza de portafolio.',
      'Copia las estrellas y deseos que recibiste y elige uno para mejorar tu juego por tu cuenta.',
      'Opcional: haz el tutorial oficial de otro motor (Godot o Defold) y anota qué piezas del curso reconociste.'
    ],
    lecturas: [
      'Nystrom, R. <i>Game Programming Patterns</i>. Gratis en línea. Los capítulos Game Loop, State y Update Method resumen buena parte del curso.',
      'Ierusalimschy, R. <i>Programming in Lua</i>. La primera edición es gratuita en lua.org. Para seguir con Lua más allá de LÖVE.',
      'Documentación de LÖVE (love2d.org/wiki) y su foro: para seguir haciendo juegos pequeños.',
      'Documentación oficial de Godot, tutorial «Your first 2D game», y de Defold, que usa Lua: para comparar con lo que ya sabes.',
      'Post-mortems publicados en Game Developer (antes Gamasutra): cómo cuentan sus decisiones los equipos profesionales.'
    ],
    mapa: {
      lead: 'Todo el curso en un grafo: cada núcleo se apoya en el anterior y todos llegan a tu demo.',
      nodos: [
        ['lua', 'Lua y game loop', 'sesiones 2 y 4', 'idea', 'update(dt) cambia el estado, draw dibuja. Variables locales y tablas.'],
        ['poo', 'POO en Lua', 'sesiones 3 y 5', 'patron', '.new(), setmetatable, __index, herencia y polimorfismo.'],
        ['col', 'Colisiones', 'sesiones 6 y 7', 'codigo', 'AABB, menor penetración, ángulo de paleta y sub-pasos.'],
        ['fsm', 'Estados y datos', 'sesión 7', 'patron', 'Un estado actual, transiciones por evento y contenido en tablas.'],
        ['feel', 'Game feel', 'sesión 7', 'idea', 'Shake, partículas, sonido y hit-stop: sensación, no reglas.'],
        ['demo', 'Defender decisiones', 'hoy', 'practica', 'Problema, opciones, decisión y evidencia en cinco minutos.'],
        ['eval', 'Auto y coevaluación', '4 % + 4 %', 'riesgo', 'Cada nota con un ejemplo. Sin evidencia, no se sostiene.'],
        ['sigue', 'Qué sigue', 'Arquitectura, otros motores', 'idea', 'Los conceptos viajan; la sintaxis cambia.']
      ],
      cables: [
        ['lua', 'poo', 'llamada'],
        ['lua', 'col', 'llamada'],
        ['poo', 'fsm', 'llamada'],
        ['poo', 'col', 'datos'],
        ['col', 'demo', 'datos'],
        ['fsm', 'demo', 'datos'],
        ['feel', 'demo', 'evento'],
        ['demo', 'eval', 'evento'],
        ['eval', 'sigue', 'llamada']
      ]
    },
    slides: [
      { kind: 'portada', title: 'Demos, síntesis y cierre',
        lead: 'Sesión 8 · Programación de Videojuegos',
        full: [
          { ul: ['Un Boss Rush por equipos, sus demos y la repetición del partido.', 'El curso completo en un mapa.', 'Auto y coevaluación: <b>4 % + 4 %</b>.'] },
          { pie: 'Flecha derecha: avanza paso a paso · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas del docente' }
        ],
        nota: '3 minutos. Última sesión: agradece y confirma el orden de las demos (publícalo en el chat antes de empezar). Quiz preclase abierto: es de repaso, no tiene nota. Pide que quien vaya a presentar tenga el juego abierto desde ya, para no perder tiempo en los cambios de pantalla.' },

      { kind: 'analogia', title: 'La repetición del partido',
        lead: 'Los buenos jugadores miran su jugada para entender qué decidieron.',
        izq: 54,
        left: [
          { mapa: [['Ver la jugada otra vez', 'Tu demo<small>el juego corriendo</small>'], ['«Ahí decidí pasar en vez de tirar»', 'Una decisión técnica<small>y la alternativa</small>'], ['«La próxima vez tiro»', 'Qué cambiarías'], ['El comentario del técnico', 'Dos estrellas y un deseo']], de: 'En el partido', a: 'Hoy', pasos: true }
        ],
        right: [
          { clave: 'Nadie gana el partido en la repetición. Pero ahí se gana el siguiente.' },
          { pie: 'Hoy no se califica cuánto brilla el juego: se escucha qué entiendes de él.', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿qué jugada de su Breakout les gustaría volver a ver? Respuesta esperada: el día que la bola dejó de pegarse, o el bug más raro. Usa esa respuesta como ejemplo de «un bug y cómo lo resolviste» para la demo.' },

      { kind: 'reto', title: 'Boss Rush: las reglas',
        lead: 'Cinco jefes, uno por núcleo del curso. La clase juega en equipos.',
        izq: 50,
        left: [
          { ol: ['Cada equipo discute <b>un minuto</b> y elige 1, 2, 3 o 4.', 'Acierto: el jefe pierde vida.', 'Fallo: el equipo pierde una vida. FINITUS es <b>blindado</b>: dos.'], pasos: true }
        ],
        right: [
          { tabla: { head: ['Jefe', 'Núcleo'], rows: [['GLOBALIX', 'Fundamentos de Lua'], ['LOOPRA', 'Game loop y LÖVE'], ['METATRON', 'POO en Lua'], ['AABBADDON', 'Colisiones'], ['FINITUS', 'Estados y game feel']] }, pasos: true }
        ],
        nota: '3 minutos. Arma equipos de 3 o 4 en salas o por el chat. Puedes correr el Boss Rush original en LÖVE (repositorio finalclassprogrammingcun) o usar la versión de la siguiente slide. Regla de oro: se discute antes de responder; si un equipo responde sin hablar, pídele que explique por qué. Eso es práctica de recuperación.' },

      { kind: 'demo', title: 'Boss Rush',
        lead: 'Discutan en equipo y elijan. Un acierto quita la mitad de la vida del jefe.',
        top: true,
        full: [{ fig: 'bossRush' }],
        nota: '18 minutos. Lee la pregunta en voz alta, da un minuto, recoge votos en el chat y haz clic en la más votada. Después de cada respuesta, pide a un equipo que explique la correcta con sus palabras y conecta con su Breakout: por ejemplo, la pregunta de __index con su clase Ladrillo. Si fallan en AABBADDON, dedica un minuto extra: es el criterio que más pesa en el ACA 2.' },

      { kind: 'codigo', title: 'El Boss Rush por dentro',
        lead: 'Lo que acaban de jugar está hecho con lo que ustedes ya saben.',
        izq: 32,
        left: [
          { big: 'Mismo mensaje, distinta respuesta: el jefe blindado castiga el doble.' },
          { pie: 'En el original, <code>ArmoredBoss</code> sobrescribe <code>penaltyLives()</code>. Aquí lo traducimos al español.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua', src: bossCorto }], marca: [
          { l: [1, 2, 4, 5, 6, 7], t: 'El patrón de la sesión 5: tabla de clase, <code>__index</code> y <code>.new()</code>.' },
          { l: [8], t: 'El jefe normal quita una vida al fallar.' },
          { l: [10, 11, 12, 13, 14], t: '<b>Herencia:</b> Blindado reutiliza el constructor de Jefe.' },
          { l: [15], t: '<b>Polimorfismo:</b> sobrescribe castigo().' },
          { l: [17, 18], t: 'El juego no pregunta si es blindado: el jefe responde.' }
        ] }],
        nota: '3 minutos. Pregunta: ¿dónde está el if que pregunta si el jefe es blindado? Respuesta esperada: no existe, igual que con los ladrillos y onHit(). La versión «pruébalo» de la página imprime el castigo de cada jefe.' },

      { kind: 'idea', title: 'Lo que jugaron es lo que saben hacer',
        top: true,
        full: [
          { tabla: { head: ['En el Boss Rush', 'Qué es', 'Dónde lo vieron'], rows: [['<code>questions.lua</code>', 'Contenido como datos (tablas)', 'Niveles del Breakout · sesión 7'], ['<code>boss.lua</code>', 'Clases con .new(), herencia y polimorfismo', 'Sesiones 3 y 5'], ['<code>game.state</code>', 'Máquina de estados', 'Sesiones 2 y 7'], ['<code>update(dt)</code>', 'Game loop con delta time', 'Sesiones 2 y 4'], ['Shake y barra animada', 'Game feel', 'Sesión 7']] }, pasos: true },
          { clave: 'Si puedes leer este juego, puedes escribir uno parecido.', paso: true }
        ],
        nota: '3 minutos. Abre boss.lua o questions.lua del repositorio y muestra 10 segundos de cada uno. Pregunta: ¿qué editarían para hacer un Boss Rush de otra materia? Respuesta esperada: solo questions.lua. Ese es el poder de separar datos y lógica.' },

      { kind: 'idea', title: 'Tu demo: cinco minutos, cinco paradas',
        lead: 'Usa esta slide como cronómetro durante las demos.',
        izq: 62,
        left: [{ fig: 'demoReloj' }],
        right: [
          { h: 'Mientras otro equipo presenta' },
          { ul: ['<b>Estrella 1:</b> algo concreto que hicieron bien.', '<b>Estrella 2:</b> otra, de otro tema.', '<b>Un deseo:</b> una mejora, como pregunta.'], pasos: true },
          { clave: '«Me gustó» no es una estrella. «La bola sale con ángulo según la paleta» sí.', paso: true }
        ],
        nota: '3 minutos para explicar. Luego vuelve a esta slide y úsala de cronómetro con Iniciar y Siguiente parada. Un deseo bien dicho: «¿qué pasaría si el ladrillo duro cambiara de color con cada golpe?». Se critica el código, no a la persona.' },

      { kind: 'idea', title: 'Cómo defender una decisión',
        lead: 'Cuatro piezas, en este orden, en menos de 90 segundos.',
        izq: 58,
        left: [{ svg: svgDefensa }],
        right: [
          { tabla: { head: ['Pieza', 'Ejemplo'], rows: [['Problema', 'Con tres tipos de ladrillo, el bucle de colisiones crecía'], ['Opciones', 'Un if por tipo, u onHit() en cada clase'], ['Decisión', 'onHit(): un tipo nuevo es un archivo nuevo'], ['Evidencia', 'Agregué el irrompible sin tocar el bucle']] }, pasos: true }
        ],
        nota: '4 minutos. Pide a un voluntario que arme su frase con la plantilla en voz alta. Pregunta: ¿cuál es la pieza que más se olvida? Respuesta esperada: las opciones; sin alternativa no hay decisión, hay costumbre. Si alguien no tiene una decisión que defender, que defienda la del Bug: qué opciones probó.' },

      { kind: 'antipatron', title: 'Defensas que no defienden',
        izq: 50,
        left: [
          { panel: [{ ul: ['«Funciona, miren.»', '«Lo hice así porque así salía en un video.»', '«Todo quedó perfecto.»'] }], h: 'No convencen', tono: 'malo' }
        ],
        right: [
          { panel: [{ ul: ['«Invertía vx y vy y rebotaba raro; ahora uso el eje de menor penetración. Miren la esquina.»', '«Lo cambiaría: la paleta todavía empuja la bola si la muevo rápido.»'] }], h: 'Sí convencen', tono: 'bueno', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿qué tienen en común las de la derecha? Respuesta esperada: un problema concreto, una razón y algo que se puede ver. Aclara que «lo vi en un video» no está mal como origen; lo que falta es entender por qué funciona.' },

      { kind: 'actividad', title: 'Demos de los Breakout',
        lead: 'Cinco minutos por equipo. Dos estrellas y un deseo en el chat.',
        izq: 50,
        left: [
          { ol: ['Qué es, juega en vivo, una decisión, un bug, qué cambiarías.', 'Una o dos preguntas del público.', 'Lectura en voz alta de una estrella y un deseo.'], pasos: true }
        ],
        right: [
          { clave: 'Se critica el código, no a la persona.', paso: true },
          { pie: 'Si el juego falla en vivo, explica qué crees que pasó: también es una demo técnica.', paso: true }
        ],
        nota: '45 minutos en total; con más de 7 equipos, baja a 4 minutos y usa la opción de cronómetro. Orden aleatorio publicado al inicio. Tras cada demo, lee una estrella y un deseo del chat. Si un equipo no menciona alternativas, pregúntale: ¿qué otra forma pensaron? Toma nota de las mejores decisiones para el cierre.' },

      { kind: 'idea', title: 'El curso completo',
        lead: 'De pensar como programador a un Breakout que se siente bien.',
        top: true,
        full: [
          { ruta: 8 },
          { pie: 'Toca una sesión para recordar su pregunta y su analogía.', paso: true }
        ],
        nota: '5 minutos. Recorre el mapa preguntando la analogía de cada sesión antes de tocarla: el árbitro, el flipbook, el molde de galletas, el teatro, el hermano mayor, el aeropuerto, la banda y la repetición. Pregunta: ¿qué sesión les cambió la forma de pensar? Respuesta frecuente: la de POO o la de colisiones. Esta es una buena práctica de recuperación de todo el curso.' },

      { kind: 'reto', title: 'Síntesis: tres errores en diez líneas',
        lead: 'Este fragmento rompe tres ideas del curso. Encuéntralas antes de avanzar.',
        izq: 46,
        left: [{ code: [{ lang: 'Lua', label: 'Lua', src: sintesisCode }] }],
        right: [
          { check: { q: '¿Qué tres ideas rompe, en orden (1), (2) y (3)?', opts: ['Usa love.draw, olvida local y no tiene colisiones', 'Mueve en draw y sin dt; pregunta el tipo en vez de onHit(); usa banderas en vez de estados', 'Usa ipairs, usa for y usa if', 'Nada: es un estilo válido'], ok: 1, why: '(1) La lógica va en update y con dt; draw solo dibuja. (2) El bucle no debe preguntar el tipo: el ladrillo responde con onHit(). (3) Dos banderas sueltas en lugar de un estado actual.' } }
        ],
        nota: '4 minutos. Que respondan en el chat con números. Pregunta: ¿cuál de los tres bugs es más difícil de ver jugando? Respuesta esperada: el (1), porque el juego se ve bien a 60 fps y falla en otro computador. Conecta cada número con su sesión: 2, 5 y 7.' },

      { kind: 'codigo', title: 'main.lua: todo el curso en un archivo',
        izq: 30,
        left: [
          { big: 'El director conoce a todos, pero no hace el trabajo de nadie.' },
          { pie: 'En la página de la clase, la versión con comentarios que señalan cada sesión.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE)', src: mainCorto }], marca: [
          { l: [1, 2, 3], t: '<b>Módulos</b> con require: cada clase en su archivo (sesión 5).' },
          { l: [6, 7, 8, 9], t: '<b>Datos</b> para crear el juego y la <b>FSM</b> arranca en el título (sesión 7).' },
          { l: [11, 12], t: '<b>Game loop con dt</b>, con tope (sesiones 2 y 7).' },
          { l: [13, 14], t: '<b>Game feel</b> aparte: shake, partículas y hit-stop (sesión 7).' },
          { l: [15, 18, 19], t: 'El <b>estado actual</b> actualiza, dibuja y escucha teclas: ahí viven las colisiones de Play (sesiones 6 y 7).' }
        ] }],
        nota: '3 minutos. Pregunta: ¿cuántas líneas tiene su main.lua? Si pasa de 200, pregúntales qué parte debería ser su propia clase. Es un buen «qué cambiarías» para la reflexión.' },

      { kind: 'idea', title: 'Auto y coevaluación: 4 % + 4 %',
        lead: 'Dos formularios cortos. Solo sirven si son honestos.',
        izq: 40,
        left: [
          { panel: [{ ul: ['¿Qué puedes hacer hoy que no podías en la sesión 1?', '¿Qué parte de tu Breakout sabes explicar sin mirar?'] }], h: 'Autoevaluación' },
          { clave: 'Cada nota, con un ejemplo concreto.', paso: true }
        ],
        right: [
          { tabla: { head: ['Coevaluación', 'Nivel bajo', 'Nivel alto'], rows: [['Aporte técnico', 'Poco código, o solo al final', 'Piezas propias que sabe explicar'], ['Cumplimiento', 'Tarde y sin avisar', 'A tiempo, o avisa y renegocia'], ['Comunicación', 'Desaparece días', 'Avisa bloqueos y pide ayuda'], ['Trato', 'Descalifica o impone', 'Critica el código, no a la persona']] }, pasos: true }
        ],
        nota: '4 minutos. Comparte los enlaces en el chat. La tabla es una guía orientativa: si la consigna oficial trae otros criterios, mandan esos. La coevaluación es confidencial; una nota muy alta o muy baja sin justificación se revisa. Quien trabajó solo responde la autoevaluación, según lo indique la consigna.' },

      { kind: 'demo', title: 'Ponle nota a cada criterio, con evidencia',
        lead: 'Toca un punto de cada eje. Luego toca el criterio cuando tengas un ejemplo concreto.',
        top: true,
        full: [{ fig: 'criterios' }],
        nota: '4 minutos. Haz la autoevaluación de un estudiante imaginario: ponle 5 en colisiones sin evidencia y deja que aparezca el aviso en coral. Luego marca la evidencia y cambia a coevaluación. Pregunta: ¿qué ejemplo sirve de evidencia para «Comunicación»? Respuesta esperada: un mensaje en el que avisó un bloqueo a tiempo.' },

      { kind: 'idea', title: 'Qué sigue',
        lead: 'Los conceptos viajan; la sintaxis cambia.',
        top: true,
        full: [
          { tabla: { head: ['Si quieres…', 'Sigue con'], rows: [['Ordenar juegos más grandes', '<b>Arquitectura de Videojuegos</b>, semestre II: patrones, módulos, rendimiento y pruebas'], ['Seguir con Lua', 'LÖVE para juegos pequeños; Defold, un motor que usa Lua; Roblox, con Luau'], ['Un editor visual', 'Godot (GDScript) o Unity (C#): mismo game loop, mismas colisiones, otra sintaxis'], ['Practicar diseño', 'Game jams: un juego pequeño en un fin de semana']] }, pasos: true },
          { clave: 'Lo que te llevas no es Lua: es pensar un juego como un bucle de objetos que chocan y cambian de estado.', paso: true }
        ],
        nota: '4 minutos. Pregunta: ¿quién ya tiene motor favorito para su proyecto de la especialización? Si dicen Unity o Godot, muestra que update(dt) se llama Update() con Time.deltaTime o _process(delta). En Arquitectura de Videojuegos retomarán exactamente lo de hoy: por qué main.lua no debe saberlo todo.' },

      { kind: 'reto', title: 'Antes de irnos: quiz postclase',
        lead: 'Ocho preguntas de todo el curso. Compáralo con tu preclase.',
        full: [
          { ul: ['Game loop, Lua y POO.', 'Colisiones, estados y datos.', 'Defender decisiones y evaluar con evidencia.'] },
          { pie: 'Abre el quiz postclase desde la página de la sesión. Después, los formularios de auto y coevaluación.', paso: true }
        ],
        nota: '6 minutos. En silencio. Mientras responden, recuerda en el chat los enlaces de auto y coevaluación y el plazo para diligenciarlos.' },

      { kind: 'cierre', title: 'Lo que te llevas del curso',
        full: [
          { ol: ['<b>Un juego es un bucle</b> de objetos que se actualizan con dt, chocan y cambian de estado.', '<b>Las buenas clases responden</b>: herencia para reutilizar y polimorfismo para variar sin ifs.', '<b>Defender una decisión</b> es problema, opciones, razón y evidencia; y saber qué cambiarías.'], pasos: true },
          { p: 'Gracias por estas ocho sesiones. Sube tu Breakout a un repositorio, diligencia la auto y coevaluación, y nos vemos en Arquitectura de Videojuegos.', paso: true }
        ],
        nota: '3 minutos. Ronda final de una frase por persona en el chat: «en mi próximo juego voy a…». Agradece. Recuerda que auto y coevaluación deben quedar diligenciadas en el plazo indicado.' }
    ],
    pre: [
      { q: 'En LÖVE, ¿dónde va el código que mueve la bola en cada frame?', opts: ['En love.draw()', 'En love.update(dt)', 'En love.load()', 'En conf.lua'], ok: 1, why: 'update(dt) cambia el estado del juego; draw solo dibuja lo que hay. Mover en draw mezcla responsabilidades y deja el movimiento sin dt.', idea: 'C1' },
      { q: 'Con <code>Clase.__index = Clase</code>, ¿qué hace <code>setmetatable(obj, Clase)</code>?', opts: ['Copia todos los métodos dentro de obj', 'Borra obj', 'Hace que obj busque en Clase lo que no tiene', 'Convierte obj en variable global'], ok: 2, why: 'No copia nada: cuando obj no tiene un campo, Lua lo busca en su metatabla a través de __index. Por eso muchos objetos comparten los mismos métodos.', idea: 'C2' },
      { q: 'Dos rectángulos sin rotar se solapan en X, pero no en Y. ¿Chocan?', opts: ['Sí', 'No', 'Solo si son del mismo tamaño', 'Depende de dt'], ok: 1, why: 'AABB exige solape en los dos ejes a la vez. Dos ladrillos de la misma columna comparten X y no se tocan.', idea: 'C3' },
      { q: '¿Por qué los niveles del Breakout y las preguntas del Boss Rush viven en tablas de datos?', opts: ['Porque Lua no permite otra cosa', 'Para que el juego corra más rápido', 'Para esconderlos del jugador', 'Para cambiar el contenido sin tocar la lógica'], ok: 3, why: 'Separar datos y lógica deja que cualquiera del equipo cree contenido nuevo editando una tabla. No cambia la velocidad del juego.', idea: 'C4' },
      { q: 'Tienes 5 minutos para presentar tu Breakout. ¿Qué convence más a un equipo técnico?', opts: ['Mostrar que todo funciona sin explicar nada', 'Leer el código línea por línea', 'Una decisión con su alternativa, su razón y una evidencia en el juego', 'Contar cuántas horas trabajaste'], ok: 2, why: 'Que funcione es el punto de partida. Lo que muestra comprensión es por qué elegiste algo frente a otra opción y cómo se nota en el juego.', idea: 'C5' },
      { q: 'En la coevaluación, ¿cuál es una buena justificación?', opts: ['«Es buena gente»', '«Hizo la clase Ladrillo y el onHit del irrompible, y nos explicó cómo funcionaba»', '«Trabajó mucho»', '«No sé, le pongo 5»'], ok: 1, why: 'Una conducta observable y un ejemplo concreto. «Trabajó mucho» puede ser cierto, pero no dice qué ni cómo.', idea: 'C5' }
    ],
    post: [
      { q: 'Este código mueve la bola en un computador a 144 fps y en otro a 60 fps. ¿Qué pasa?', code: { lang: 'Lua', src: 'function love.update(dt)\n    bola.x = bola.x + 5\nend' },
        opts: ['Va igual de rápido en los dos', 'Va más rápido a 60 fps', 'Va más del doble de rápido a 144 fps; falta multiplicar por dt', 'No se mueve'], ok: 2, why: 'Sin dt suma 5 px por frame: 720 px/s a 144 fps y 300 px/s a 60 fps. Con una velocidad por segundo multiplicada por dt, es igual en ambos.', idea: 'C1' },
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: 'local function iniciar()\n    contador = 1\nend\niniciar()\nprint(contador)' },
        opts: ['nil', '1', 'Un error', '0'], ok: 1, why: 'Sin local, contador es global y sobrevive fuera de la función. Funciona, pero es justo el tipo de fuga que causa bugs difíciles: siempre local.', idea: 'C1' },
      { q: '¿Qué imprime la última línea?', code: { lang: 'Lua', src: 'local Jefe = {}; Jefe.__index = Jefe\nfunction Jefe:castigo() return 1 end\nlocal Blindado = setmetatable({}, { __index = Jefe })\nBlindado.__index = Blindado\nfunction Blindado:castigo() return 2 end\nlocal j = setmetatable({}, Blindado)\nprint(j:castigo())' },
        opts: ['1', 'nil', 'Un error', '2'], ok: 3, why: 'j busca castigo en Blindado y lo encuentra ahí: 2. Solo si Blindado no lo tuviera, seguiría buscando en Jefe y daría 1. Eso es sobrescribir.', idea: 'C2' },
      { q: '¿Por qué una colisión bola–ladrillo se resuelve por el eje de menor penetración?', opts: ['Porque casi siempre es el eje por donde entró la bola', 'Porque es más rápido de calcular', 'Porque X siempre es el menor', 'Porque LÖVE lo exige'], ok: 0, why: 'En un frame la bola avanza poco: el solape pequeño es el que acaba de recorrer. Sacarla por ahí e invertir esa velocidad da el rebote correcto.', idea: 'C3' },
      { q: 'La bola avanza 30 px por frame y los ladrillos miden 20 px. A veces los atraviesa. ¿Qué arreglo es el más robusto?', opts: ['Dibujar los ladrillos más grandes', 'Partir el movimiento del frame en sub-pasos de máximo media bola', 'Quitar dt para que vaya más lento', 'Cambiar AABB por círculos'], ok: 1, why: 'Con sub-pasos la bola nunca salta más de media bola entre revisiones, así que no puede saltarse nada. Dibujar más grande no cambia la colisión.', idea: 'C3' },
      { q: '¿Qué ventaja tiene una máquina de estados sobre cuatro variables booleanas como <code>jugando</code>, <code>pausado</code>, <code>ganaste</code> y <code>perdiste</code>?', opts: ['Ocupa menos memoria', 'Es obligatoria en LÖVE', 'Hay un solo estado actual: es imposible estar en Pause y en GameOver a la vez', 'Hace que el juego corra más rápido'], ok: 2, why: 'Cuatro booleanos dan 16 combinaciones y muchas no tienen sentido. Con un estado actual solo existen los estados válidos y cada uno decide qué escucha.', idea: 'C4' },
      { q: '¿Cuál de estas frases defiende una decisión técnica?', opts: ['«El juego funciona, miren.»', '«Lo hice así porque así salía en un tutorial.»', '«Todo quedó perfecto, no cambiaría nada.»', '«Pensé en un if por tipo de ladrillo, pero elegí onHit() en cada clase: agregué el irrompible sin tocar el bucle.»'], ok: 3, why: 'Tiene problema, alternativa, decisión y evidencia. Las otras muestran el resultado o el origen, pero no la razón.', idea: 'C5' },
      { q: 'En tu autoevaluación te pones 5 en colisiones, pero la bola todavía atraviesa ladrillos a veces. ¿Qué es lo honesto?', opts: ['Dejar el 5: casi nunca pasa', 'Bajar a 4 o 3 y escribir en qué caso pasa y qué intentaste', 'Ponerse 1 en todo', 'No mencionarlo'], ok: 1, why: 'La autoevaluación vale por la evidencia. Nombrar el caso y lo que intentaste muestra que entiendes tu código; esconderlo lo hace ver peor si alguien lo nota.', idea: 'C5' }
    ]
  };
})();
