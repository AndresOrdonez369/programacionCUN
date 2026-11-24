(function () {
  /* ---------- Código completo (página de la sesión) ---------- */
  const loopPseudo = `iniciar el juego
mientras el juego esté abierto:
    dt ← tiempo desde el frame anterior
    leer la entrada        -- teclado, ratón, mando
    actualizar(dt)         -- mover, chocar, decidir
    dibujar()              -- pintar el estado actual
cerrar y liberar recursos`;
  const loopLove = `-- main.lua · LÖVE corre el bucle y llama a estas funciones por ti
local jugador = { x = 100, y = 300, velocidad = 300 }

function love.load()
    love.window.setTitle("Mi primer bucle")
end

function love.update(dt)
    -- entrada + actualizar: unas 60 veces por segundo
    if love.keyboard.isDown("right") then
        jugador.x = jugador.x + jugador.velocidad * dt
    end
end

function love.draw()
    -- dibujar: solo pinta lo que update dejó listo
    love.graphics.rectangle("fill", jugador.x, jugador.y, 40, 40)
    love.graphics.print("FPS: " .. love.timer.getFPS(), 10, 10)
end`;
  const loopRun = `-- Simulamos 5 frames de un bucle, sin ventana
local x = 0
local velocidad = 100      -- píxeles por segundo
local dt = 0.1             -- cada frame dura 0,1 segundos

for frame = 1, 5 do
    -- 1. entrada: imaginemos que la flecha derecha está presionada
    local derecha = true
    -- 2. actualizar
    if derecha then
        x = x + velocidad * dt
    end
    -- 3. dibujar (aquí, imprimir)
    print("frame " .. frame .. ": x = " .. string.format("%.0f", x))
end`;

  const dtPseudo = `-- Así NO: depende de cuántos frames haya
x ← x + 5                    -- 5 píxeles por frame

-- Así SÍ: depende del tiempo
velocidad ← 300              -- píxeles por SEGUNDO
x ← x + velocidad × dt       -- dt: segundos desde el frame anterior

-- Todo lo que cambia con el tiempo lleva dt
tiempoRestante ← tiempoRestante − dt`;
  const dtLove = `local bola = { x = 0, velocidad = 300 }   -- 300 px por segundo
local escudo = 5                            -- segundos de escudo

function love.update(dt)
    -- dt vale cerca de 1/60 a 60 fps y cerca de 1/30 a 30 fps
    bola.x = bola.x + bola.velocidad * dt

    -- también los temporizadores se cuentan en segundos
    if escudo > 0 then
        escudo = escudo - dt
    end
end

function love.draw()
    love.graphics.circle("fill", bola.x, 300, 15)
    love.graphics.print(string.format("escudo: %.1f s", escudo), 10, 10)
end`;
  const dtRun = `-- Un segundo de juego en tres computadores distintos
local function simular(fps)
    local dt = 1 / fps
    local sinDt, conDt = 0, 0
    for frame = 1, fps do            -- fps frames = 1 segundo
        sinDt = sinDt + 5            -- 5 px por frame
        conDt = conDt + 300 * dt     -- 300 px por segundo
    end
    print(fps .. " fps -> sin dt: " .. sinDt .. " px | con dt: "
        .. string.format("%.0f", conDt) .. " px")
end

simular(30)
simular(60)
simular(144)`;

  const vecPseudo = `velocidad ← (vx, vy)              -- un vector: hacia dónde y qué tanto
posición ← posición + velocidad × dt

-- Moverse en diagonal sin ir más rápido
dirección ← (1, 1)
largo ← √(1² + 1²)                -- ≈ 1,41: ¡más que 1!
dirección ← dirección ÷ largo     -- normalizar: ahora mide 1
velocidad ← dirección × rapidez`;
  const vecLove = `local jugador = { x = 400, y = 300, rapidez = 250 }

function love.update(dt)
    local dx, dy = 0, 0
    if love.keyboard.isDown("right") then dx = dx + 1 end
    if love.keyboard.isDown("left")  then dx = dx - 1 end
    if love.keyboard.isDown("down")  then dy = dy + 1 end   -- y crece hacia abajo
    if love.keyboard.isDown("up")    then dy = dy - 1 end

    local largo = math.sqrt(dx * dx + dy * dy)
    if largo > 0 then                 -- normalizar: que la dirección mida 1
        dx, dy = dx / largo, dy / largo
    end
    jugador.x = jugador.x + dx * jugador.rapidez * dt
    jugador.y = jugador.y + dy * jugador.rapidez * dt
end`;
  const vecRun = `-- ¿Por qué en diagonal se va más rápido?
local function largo(x, y)
    return math.sqrt(x * x + y * y)
end

print(string.format("derecha  (1, 0) mide %.2f", largo(1, 0)))
print(string.format("diagonal (1, 1) mide %.2f", largo(1, 1)))

-- Normalizar: dividir cada parte entre el largo
local dx, dy = 1, 1
local l = largo(dx, dy)
dx, dy = dx / l, dy / l
print(string.format("normalizado (%.2f, %.2f) mide %.2f", dx, dy, largo(dx, dy)))`;

  const trigPseudo = `-- De un ángulo a una dirección
ángulo ← 30 grados  → en radianes: 30 × π ÷ 180
dx ← cos(ángulo)
dy ← sin(ángulo)
bala.velocidad ← (dx, dy) × 400

-- De una dirección a un ángulo (apuntar al ratón)
ángulo ← atan2(ratón.y − nave.y, ratón.x − nave.x)`;
  const trigLove = `local nave = { x = 400, y = 300, angulo = 0 }
local balas = {}

function love.update(dt)
    local mx, my = love.mouse.getPosition()
    nave.angulo = math.atan2(my - nave.y, mx - nave.x)   -- apunta al ratón

    for _, b in ipairs(balas) do
        b.x = b.x + b.vx * dt
        b.y = b.y + b.vy * dt
    end
end

function love.mousepressed(x, y, boton)
    local dx, dy = math.cos(nave.angulo), math.sin(nave.angulo)
    table.insert(balas, { x = nave.x, y = nave.y, vx = dx * 400, vy = dy * 400 })
end
-- love.draw dibuja la nave y las balas (lo vemos en la sesión 4)`;
  const trigRun = `-- Cuatro ángulos, cuatro direcciones (en pantalla, y crece hacia abajo)
local function direccion(grados)
    local rad = math.rad(grados)          -- Lua trabaja en radianes
    return math.cos(rad), math.sin(rad)
end

for _, g in ipairs({ 0, 45, 90, 180 }) do
    local dx, dy = direccion(g)
    print(string.format("%3d grados -> (%.2f, %.2f)", g, dx, dy))
end`;

  const fsmPseudo = `estado ← "quieto"

cuando llega un evento:
    si estado = quieto y evento = derecha   → estado ← corre
    si estado = corre  y evento = soltar    → estado ← quieto
    si estado es quieto o corre y evento = espacio → estado ← salta
    si estado = salta  y evento = aterriza  → estado ← quieto
    en cualquier otro caso: no pasa nada`;
  const fsmRun = `-- La FSM como tabla: transiciones[estado][evento] = nuevo estado
local transiciones = {
    quieto = { derecha = "corre", espacio = "salta", clic = "ataca" },
    corre  = { soltar = "quieto", espacio = "salta" },
    salta  = { aterriza = "quieto" },      -- sin "espacio": no hay doble salto
    ataca  = { fin = "quieto" },
}

local estado = "quieto"
local eventos = { "derecha", "espacio", "espacio", "aterriza", "clic", "fin" }

for _, evento in ipairs(eventos) do
    local siguiente = transiciones[estado][evento]
    if siguiente then
        print(estado .. " + " .. evento .. " -> " .. siguiente)
        estado = siguiente
    else
        print(estado .. " + " .. evento .. " -> (se ignora)")
    end
end`;
  const fsmLove = `-- Pong: la bola tiene tres estados
local bola = { x = 400, y = 300, vx = 0, vy = 0, estado = "servir" }

function love.keypressed(tecla)
    if bola.estado == "servir" and tecla == "space" then
        bola.vx, bola.vy = 300, 120
        bola.estado = "enJuego"
    end
end

function love.update(dt)
    if bola.estado == "enJuego" then
        bola.x = bola.x + bola.vx * dt
        bola.y = bola.y + bola.vy * dt
        if bola.x < 0 or bola.x > 800 then   -- salió por un lado
            bola.estado = "punto"
        end
    elseif bola.estado == "punto" then
        bola.x, bola.y = 400, 300            -- vuelve al centro
        bola.estado = "servir"
    end
end`;

  /* ---------- Versiones cortas para las slides ---------- */
  const loopCorto = `function love.load()
    -- una vez, al abrir
end

function love.update(dt)
    -- cada frame: leer entrada y actualizar
    if love.keyboard.isDown("right") then
        jugador.x = jugador.x + 300 * dt
    end
end

function love.draw()
    -- cada frame: pintar el estado
    love.graphics.rectangle("fill", jugador.x, 300, 40, 40)
end`;
  const sinDtCorto = `function love.update(dt)
    -- 5 píxeles por FRAME
    x = x + 5
end

-- a  30 fps: 150 px por segundo
-- a  60 fps: 300 px por segundo
-- a 144 fps: 720 px por segundo`;
  const conDtCorto = `function love.update(dt)
    -- 300 píxeles por SEGUNDO
    x = x + 300 * dt
end

-- a  30 fps: 300 × (1/30)  × 30  = 300
-- a  60 fps: 300 × (1/60)  × 60  = 300
-- a 144 fps: 300 × (1/144) × 144 = 300`;
  const trigCorto = `local angulo = math.rad(30)      -- grados a radianes

local dx = math.cos(angulo)       -- cuánto hacia la derecha
local dy = math.sin(angulo)       -- cuánto hacia abajo

bala.vx = dx * 400                -- 400 px por segundo
bala.vy = dy * 400

-- cada frame, en love.update(dt):
bala.x = bala.x + bala.vx * dt
bala.y = bala.y + bala.vy * dt`;
  const boolsMal = `local corriendo = false
local saltando  = false
local atacando  = false

function love.keypressed(tecla)
    if tecla == "space" then
        saltando = true        -- ¿y si ya estaba saltando?
    end
    if tecla == "x" then
        atacando = true        -- ¿se puede atacar en el aire?
    end
end
-- corriendo, saltando y atacando
-- pueden quedar en true a la vez`;
  const fsmBien = `local estado = "quieto"     -- una sola verdad

function love.keypressed(tecla)
    if tecla == "space" and
       (estado == "quieto" or estado == "corre") then
        estado = "salta"
    elseif tecla == "x" and estado == "quieto" then
        estado = "ataca"
    end
end
-- en "salta", espacio no hace nada:
-- el doble salto es imposible`;
  const fsmTablaCorto = `local transiciones = {
    quieto = { derecha = "corre", espacio = "salta" },
    corre  = { soltar = "quieto", espacio = "salta" },
    salta  = { aterriza = "quieto" },
}

local estado = "quieto"

local function recibir(evento)
    local siguiente = transiciones[estado][evento]
    if siguiente then
        estado = siguiente
    end   -- si no hay flecha, se ignora
end`;

  /* ---------- Ilustraciones (paleta del curso, esquinas rectas) ---------- */
  const svgVector = `<svg viewBox="0 0 700 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vector (3, 2) en coordenadas de pantalla: x hacia la derecha, y hacia abajo">
<defs><marker id="s2v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#FF5D3A"/></marker></defs>
<rect width="700" height="430" fill="#1B1A2E"/>
<g stroke="#6E6B85" stroke-width="1" opacity=".5">
<line x1="80" y1="140" x2="620" y2="140"/><line x1="80" y1="220" x2="620" y2="220"/><line x1="80" y1="300" x2="620" y2="300"/>
<line x1="160" y1="60" x2="160" y2="380"/><line x1="240" y1="60" x2="240" y2="380"/><line x1="320" y1="60" x2="320" y2="380"/><line x1="400" y1="60" x2="400" y2="380"/>
</g>
<line x1="80" y1="60" x2="640" y2="60" stroke="#F4F1E8" stroke-width="3"/>
<line x1="80" y1="60" x2="80" y2="400" stroke="#F4F1E8" stroke-width="3"/>
<text x="640" y="44" font-size="24" fill="#F4F1E8" text-anchor="end" font-weight="700">x →</text>
<text x="96" y="404" font-size="24" fill="#F4F1E8" font-weight="700">y ↓</text>
<text x="90" y="40" font-size="20" fill="#6E6B85">(0, 0) arriba a la izquierda</text>
<line x1="80" y1="60" x2="320" y2="60" stroke="#FFC83D" stroke-width="3" stroke-dasharray="10 7"/>
<line x1="320" y1="60" x2="320" y2="220" stroke="#3BC4A3" stroke-width="3" stroke-dasharray="10 7"/>
<line x1="80" y1="60" x2="314" y2="216" stroke="#FF5D3A" stroke-width="3" marker-end="url(#s2v)"/>
<text x="200" y="88" font-size="22" fill="#FFC83D" text-anchor="middle" font-weight="700">3 a la derecha</text>
<text x="334" y="146" font-size="22" fill="#3BC4A3" font-weight="700">2 hacia abajo</text>
<text x="150" y="190" font-size="26" fill="#FF5D3A" font-weight="800">v = (3, 2)</text>
<text x="460" y="270" font-size="22" fill="#F4F1E8">largo = √(3² + 2²)</text>
<text x="460" y="304" font-size="22" fill="#F4F1E8">≈ 3,6</text>
</svg>`;
  const svgPuerta = `<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ejemplo de notación: máquina de estados de una puerta">
<defs><marker id="s2p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#F4F1E8"/></marker></defs>
<rect width="700" height="300" fill="#1B1A2E"/>
<rect x="40" y="100" width="190" height="90" rx="2" fill="#1B1A2E" stroke="#3BC4A3" stroke-width="3"/>
<text x="135" y="153" font-size="28" fill="#F4F1E8" text-anchor="middle" font-weight="800">Cerrada</text>
<rect x="470" y="100" width="190" height="90" rx="2" fill="#1B1A2E" stroke="#FFC83D" stroke-width="3"/>
<text x="565" y="153" font-size="28" fill="#F4F1E8" text-anchor="middle" font-weight="800">Abierta</text>
<line x1="234" y1="122" x2="464" y2="122" stroke="#F4F1E8" stroke-width="3" marker-end="url(#s2p)"/>
<line x1="466" y1="170" x2="236" y2="170" stroke="#F4F1E8" stroke-width="3" marker-end="url(#s2p)"/>
<text x="350" y="108" font-size="22" fill="#FF5D3A" text-anchor="middle" font-weight="700">jugador con llave</text>
<text x="350" y="204" font-size="22" fill="#FF5D3A" text-anchor="middle" font-weight="700">pasan 3 segundos</text>
<line x1="20" y1="145" x2="36" y2="145" stroke="#F4F1E8" stroke-width="3" marker-end="url(#s2p)"/>
<text x="350" y="266" font-size="20" fill="#6E6B85" text-anchor="middle">caja = estado · flecha = transición · rótulo = evento</text>
</svg>`;

  window.SESION = {
    n: 2,
    titulo: 'Game loop, tiempo y estado',
    objetivos: [
      'Escribir en pseudocódigo el bucle de un juego y señalar dónde se lee la entrada, dónde se actualiza y dónde se dibuja.',
      'Explicar con un ejemplo numérico por qué un movimiento sin <code>dt</code> cambia de velocidad entre computadores, y corregirlo.',
      'Calcular la nueva posición de un objeto a partir de su vector velocidad y de <code>dt</code>, y normalizar una dirección diagonal.',
      'Convertir un ángulo en una dirección con <code>cos</code> y <code>sin</code> para disparar o apuntar.',
      'Diseñar una máquina de estados finita (estados, eventos y transiciones) para un personaje o para la bola de Pong.'
    ],
    analogia: 'Un flipbook: esas libretas con un dibujo en cada página que, al pasarlas rápido con el pulgar, parecen moverse. Cada página es un frame y el juego dibuja una nueva decenas de veces por segundo. Si un pulgar pasa las páginas más rápido que otro, el dibujo no debería correr más: por eso el juego mide cuánto tiempo pasó entre página y página, y ese tiempo se llama <b>dt</b>.',
    ideas: [
      ['C1', 'El juego es un bucle: leer la entrada, actualizar el estado y dibujar, muchas veces por segundo'],
      ['C2', 'El tiempo manda, no el frame: todo lo que cambia con el tiempo se multiplica por dt'],
      ['C3', 'Un vector dice hacia dónde y qué tanto: posición = posición + velocidad × dt'],
      ['C4', 'Con cos y sin un ángulo se vuelve dirección: así se apunta y se dispara'],
      ['C5', 'Una máquina de estados: en el estado X, ante el evento Y, pasa a Z (y lo demás se ignora)']
    ],
    agenda: [
      ['0:00', 'Bienvenida y quiz preclase'],
      ['0:07', 'El flipbook y el bucle de juego: entrada, actualizar, dibujar'],
      ['0:22', 'Delta time: el mismo juego en un computador lento y en uno rápido'],
      ['0:40', 'Vectores: hacia dónde y qué tanto'],
      ['0:52', 'Un poco de trigonometría: apuntar y disparar con cos y sin'],
      ['1:02', 'Máquinas de estado finitas: el personaje y la puerta'],
      ['1:12', 'Taller: Pong en papel (en parejas)'],
      ['1:30', 'Cierre y quiz postclase'],
      ['1:35', 'Quiz o parcial del Corte I (30 %, sesiones 1 y 2)'],
      ['2:00', 'Fin de la sesión']
    ],
    conceptos: [
      { t: 'Game loop (bucle de juego)', d: 'La repetición que mantiene vivo al juego: en cada vuelta lee la entrada, actualiza el estado y lo dibuja. No espera a que el jugador haga algo: corre siempre.', ej: 'En LÖVE no escribes el bucle: LÖVE llama a <code>love.update(dt)</code> y a <code>love.draw()</code> en cada vuelta.' },
      { t: 'Frame', d: 'Una vuelta del bucle, y la imagen que deja en pantalla. Es una página del flipbook.', ej: 'Un juego a 60 frames por segundo tiene unos 16,6 milisegundos para hacer todo el trabajo de cada frame.' },
      { t: 'FPS (frames por segundo)', d: 'Cuántas vueltas da el bucle en un segundo. Depende del computador y de cuánto trabajo haya en cada frame.', ej: 'El mismo juego puede ir a 30 fps en un portátil viejo y a 144 fps en un PC gamer.' },
      { t: 'Delta time (dt)', d: 'Los segundos que pasaron desde el frame anterior. Es un número pequeño: a 60 fps vale cerca de 0,0167.', ej: '<code>x = x + 300 * dt</code> mueve 300 píxeles por segundo, vaya el juego a 30 o a 144 fps.' },
      { t: 'Vector 2D', d: 'Un par de números (x, y) que dice hacia dónde y qué tanto. Sirve para posiciones, velocidades y direcciones.', ej: 'La velocidad de la bola de Pong es un vector: <code>(300, 120)</code> píxeles por segundo.' },
      { t: 'Magnitud y normalizar', d: 'La magnitud es el largo del vector: √(x² + y²). Normalizar es dividir el vector entre su largo para que mida 1 y quede solo la dirección.', ej: 'Sin normalizar, moverse en diagonal con dos teclas es cerca de 1,41 veces más rápido.' },
      { t: 'Seno y coseno', d: 'Dado un ángulo, <code>cos</code> dice cuánto avanzar en x y <code>sin</code> cuánto en y, para un paso de largo 1. Lua mide los ángulos en radianes.', ej: '<code>math.cos(math.rad(90))</code> da 0 y <code>math.sin(math.rad(90))</code> da 1: en LÖVE eso es hacia abajo.' },
      { t: 'Máquina de estados finita (FSM)', d: 'Un modelo en el que algo está siempre en uno, y solo uno, de unos pocos estados, y cambia de estado cuando ocurre un evento previsto.', ej: 'Un personaje está en Quieto, Corre, Salta o Ataca; nunca en dos a la vez.' },
      { t: 'Transición', d: 'Una regla de la forma «en el estado X, ante el evento Y, pasa a Z». Si no hay regla para un evento, el evento se ignora.', ej: 'En Salta no hay transición para Espacio: por eso no hay doble salto.' }
    ],
    errores: [
      { mito: 'Si en mi computador se ve bien, el movimiento está bien.', real: 'Si sumas un número fijo por frame, en un computador más rápido todo va más rápido. Pruébalo con el deslizador de fps: solo con <code>dt</code> se ve igual en todos.' },
      { mito: '<code>dt</code> es solo para moverse.', real: 'Todo lo que cambia con el tiempo lo necesita: temporizadores, recarga del arma, animaciones, la caída por gravedad. Un escudo de 5 segundos se descuenta con <code>escudo = escudo - dt</code>.' },
      { mito: 'Moverse en diagonal va a la misma velocidad que en recto.', real: 'Con dos teclas el vector (1, 1) mide cerca de 1,41. Hay que normalizarlo, o el jugador corre 41 % más rápido en diagonal.' },
      { mito: '<code>math.cos(90)</code> da 0.', real: 'Lua usa radianes: 90 radianes es otro ángulo. Hay que escribir <code>math.cos(math.rad(90))</code>.' },
      { mito: 'En pantalla, y hacia arriba es positivo, como en el colegio.', real: 'En LÖVE (y en casi todos los motores 2D) el origen está arriba a la izquierda y y crece hacia abajo. Un salto resta a y.' },
      { mito: 'Un booleano por situación es más fácil que una máquina de estados.', real: 'Con <code>saltando</code>, <code>atacando</code> y <code>corriendo</code> pueden quedar varios en true a la vez. Una sola variable de estado hace imposibles esas mezclas.' }
    ],
    codigoIntro: 'Cinco piezas del mismo motor: el bucle, el tiempo, los vectores, los ángulos y los estados. Cada ejemplo va primero en pseudocódigo, como en la sesión 1, y después en Lua con LÖVE. La sintaxis de Lua la vemos con calma en la sesión 4: hoy léelo como un adelanto. Las pestañas «pruébalo» corren en el navegador.',
    codigo: [
      { titulo: 'El bucle de juego', desc: 'Primero el bucle en pseudocódigo. Luego cómo se ve en LÖVE, donde el bucle ya existe y tú solo llenas <code>update</code> y <code>draw</code>. La tercera pestaña simula cinco vueltas del bucle sin ventana.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: loopPseudo }, { lang: 'Lua', label: 'Lua (LÖVE)', src: loopLove }, { lang: 'Lua', label: 'Lua (pruébalo)', src: loopRun, run: true }] },
      { titulo: 'Mover con delta time', desc: 'La regla de oro: el tiempo, no el frame, manda. En la pestaña «pruébalo» compara cuánto avanza la bola en un segundo a 30, 60 y 144 fps, con y sin <code>dt</code>.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: dtPseudo }, { lang: 'Lua', label: 'Lua (LÖVE)', src: dtLove }, { lang: 'Lua', label: 'Lua (pruébalo)', src: dtRun, run: true }] },
      { titulo: 'Vectores: moverse en ocho direcciones', desc: 'Las teclas arman un vector dirección. Si no lo normalizas, la diagonal va más rápido. Mira la raíz cuadrada en la línea del largo.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: vecPseudo }, { lang: 'Lua', label: 'Lua (LÖVE)', src: vecLove }, { lang: 'Lua', label: 'Lua (pruébalo)', src: vecRun, run: true }] },
      { titulo: 'Apuntar y disparar con cos y sin', desc: 'Un ángulo se vuelve dirección con <code>cos</code> y <code>sin</code>; una dirección se vuelve ángulo con <code>atan2</code>. En LÖVE (que usa LuaJIT) existe <code>math.atan2</code>.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: trigPseudo }, { lang: 'Lua', label: 'Lua (LÖVE)', src: trigLove }, { lang: 'Lua', label: 'Lua (pruébalo)', src: trigRun, run: true }] },
      { titulo: 'Máquinas de estado: el personaje y la bola de Pong', desc: 'La FSM del personaje escrita como una tabla de transiciones, y la bola de Pong con tres estados. Fíjate en que los eventos sin transición simplemente se ignoran.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: fsmPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: fsmRun, run: true }, { lang: 'Lua', label: 'Lua (LÖVE · Pong)', src: fsmLove }] }
    ],
    practica: {
      t: 'Pong en papel',
      intro: 'En parejas, diseñen un Pong contra la máquina sin escribir código de verdad: solo pseudocódigo, flechas y tablas. Es la última práctica del Corte I y la base de lo que programaremos más adelante.',
      pasos: [
        '<b>El bucle.</b> Escriban en pseudocódigo el bucle principal y marquen con tres colores dónde va la entrada, dónde la actualización y dónde el dibujo.',
        '<b>Las variables.</b> Listen lo mínimo que hay que guardar: posiciones, velocidades, tamaño de las paletas, marcador. Encierren en un círculo las que son vectores.',
        '<b>El tiempo.</b> Escriban cómo se mueve la bola usando <code>dt</code>, y calculen a mano dónde queda después de tres frames con <code>dt = 0,5</code> partiendo de (400, 300) con velocidad (200, 100).',
        '<b>Los estados.</b> Dibujen la máquina de estados de la bola con al menos tres estados (por ejemplo Servir, EnJuego y Punto) y rotulen cada flecha con su evento.',
        '<b>La prueba del árbitro.</b> Intercambien hojas con otra pareja: ¿hay algún evento que ocurra en un estado sin flecha? ¿Qué pasa si la bola toca la paleta justo cuando sale?'
      ],
      entrega: 'Foto o escaneo de la hoja (bucle, variables, cálculo y FSM) más cinco líneas de reflexión, en la plataforma.'
    },
    tarea: [
      'Pasa en limpio tu Pong en papel y súbelo con las cinco líneas de reflexión.',
      'Elige un juego que te guste y dibuja la máquina de estados de un personaje o de un enemigo con al menos cuatro estados. Escribe qué evento dispara cada flecha.',
      'Repasa los quices de las sesiones 1 y 2: son la base del quiz o parcial del Corte I.',
      'Para la sesión 3: trae tu FSM. La convertiremos en objetos.'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulos «Game Loop» y «State» (gratis en gameprogrammingpatterns.com).',
      'Fiedler, G. (2004). <i>Fix Your Timestep!</i> Gaffer On Games (sobre dt fijo y variable; lectura opcional, un poco avanzada).',
      'Wiki de LÖVE: <i>love.update</i>, <i>love.draw</i> y <i>love.run</i> (love2d.org/wiki): el bucle que LÖVE corre por ti.',
      'Bettini, A. (2007). <i>Programación de video juegos</i>. USERSHOP (bibliografía del programa).'
    ],
    mapa: {
      lead: 'Todo gira alrededor del bucle: el tiempo, los vectores y los estados son lo que el bucle actualiza en cada vuelta.',
      nodos: [
        ['flip', 'El flipbook', 'cada página, un frame', 'idea', 'Un juego no se mueve: dibuja muchas imágenes quietas, muy rápido, y el ojo ve movimiento.'],
        ['loop', 'Game loop', 'entrada · actualizar · dibujar', 'idea', 'La repetición que mantiene vivo al juego. En LÖVE son love.update(dt) y love.draw().'],
        ['dt', 'Delta time', 'el tiempo manda', 'idea', 'Los segundos entre un frame y el siguiente. Todo lo que cambia con el tiempo se multiplica por dt.'],
        ['fps', 'Mover por frame', 'x = x + 5', 'riesgo', 'Sin dt, un computador rápido mueve todo más rápido. El juego se siente distinto en cada máquina.'],
        ['vec', 'Vectores', 'hacia dónde y qué tanto', 'idea', 'Posición y velocidad como pares (x, y). posición = posición + velocidad × dt. Normalizar la diagonal.'],
        ['trig', 'cos y sin', 'del ángulo a la dirección', 'codigo', 'Para apuntar y disparar: dx = cos(ángulo), dy = sin(ángulo), en radianes.'],
        ['fsm', 'Máquina de estados', 'estado · evento · transición', 'patron', 'Siempre en un estado y solo uno. Los eventos sin flecha se ignoran.'],
        ['pong', 'Pong en papel', 'taller en parejas', 'practica', 'Bucle, variables, cálculo con dt y la FSM de la bola, sin escribir código todavía.']
      ],
      cables: [['flip', 'loop', 'llamada'], ['loop', 'dt', 'datos'], ['dt', 'fps', 'llamada'], ['dt', 'vec', 'datos'], ['vec', 'trig', 'llamada'], ['loop', 'fsm', 'evento'], ['vec', 'pong', 'datos'], ['fsm', 'pong', 'evento']]
    },

    slides: [
      { kind: 'portada', title: 'Game loop, tiempo y estado',
        lead: 'Sesión 2 · Programación de Videojuegos',
        full: [
          { ul: ['El bucle que mantiene vivo a todo juego.', 'Por qué el tiempo, y no el frame, manda.', 'Vectores, ángulos y estados: lo que el bucle actualiza.'] },
          { pie: 'Hoy cierra el Corte I: los últimos 25 minutos son el quiz o parcial (30 %).' }
        ],
        nota: 'Saluda y recuerda la sesión 1: una mecánica es un sistema con entradas, estado, reglas y salidas. Hoy ese sistema se pone a girar. Avisa desde el inicio que a la 1:35 empieza el quiz o parcial del Corte I. Lanza el quiz preclase (5 minutos). 7 minutos en total.' },

      { kind: 'analogia', title: 'Un flipbook: cada página es un frame',
        izq: 58,
        left: [{ fig: 'flipbook' }],
        right: [
          { mapa: [['Una página', 'Un frame<small>una imagen quieta</small>'], ['Pasar las páginas', 'El game loop'], ['Páginas por segundo', 'FPS'], ['El tiempo entre páginas', 'dt']], de: 'El flipbook', a: 'El juego', pasos: true }
        ],
        nota: 'Pasa páginas una por una con el botón y pregunta: ¿se está moviendo la bola? Respuesta esperada: no, cada página está quieta; el movimiento lo pone el ojo. Luego «Hojear» y sube el deslizador. Pregunta: ¿qué cambia cuando paso más páginas por segundo? Respuesta: se ve más suave, y dt (el tiempo entre páginas) se hace más pequeño. Revela el mapa. 5 minutos.' },

      { kind: 'idea', title: 'El juego es un bucle',
        izq: 46,
        left: [
          { big: 'Un juego no espera: en cada vuelta lee, actualiza y dibuja.' },
          { ol: ['<b>Entrada:</b> ¿qué teclas, ratón o mando?', '<b>Actualizar:</b> mover, chocar, decidir.', '<b>Dibujar:</b> pintar cómo quedó todo.'], pasos: true }
        ],
        right: [
          { code: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: loopPseudo }], marca: [
            { l: [2], t: 'Se repite <b>mientras el juego esté abierto</b>, unas 60 veces por segundo.' },
            { l: [3], t: 'Lo primero: medir <b>cuánto tiempo pasó</b>.' },
            { l: [4, 5, 6], t: 'Las tres partes, siempre en este orden.' }
          ] },
          { clave: 'Una hoja de cálculo espera a que hagas clic. Un juego corre aunque no toques nada.', paso: true }
        ],
        nota: 'Conecta con la sesión 1: entradas, estado, reglas y salidas son exactamente entrada, actualizar (reglas sobre el estado) y dibujar (salida). Pregunta: ¿qué pasa en un juego si no tocas ninguna tecla? Respuesta esperada: los enemigos siguen moviéndose, el reloj corre; el bucle no espera. 5 minutos.' },

      { kind: 'demo', title: 'Una vuelta del bucle, paso a paso',
        izq: 40, top: true,
        left: [
          { check: { q: 'Quitas la parte de <b>Dibujar</b>. Presionas la flecha. ¿Qué ves?', opts: ['El cuadro se mueve igual', 'Nada se mueve en pantalla, aunque x sí cambie', 'El juego se cierra', 'El cuadro se mueve el doble'], ok: 1, why: 'El estado (x) sigue cambiando en Actualizar, pero nadie lo pinta. Pruébalo en la figura con «Sin dibujar».' } },
          { clave: 'Dibujar solo muestra lo que Actualizar dejó listo.', paso: true }
        ],
        right: [{ fig: 'bucle' }],
        nota: 'Primero en «Bucle completo»: tres o cuatro clics en Paso con la tecla presionada. Señala que x cambia en Actualizar y la pantalla cambia en Dibujar. Luego que voten la pregunta y prueba «Sin dibujar» y «Sin actualizar». Pregunta: ¿cuál es peor? No hay respuesta única: sin actualizar el juego está congelado; sin dibujar está vivo pero ciego. 6 minutos.' },

      { kind: 'reto', title: 'Predice: dos computadores, el mismo juego',
        izq: 44,
        left: [{ code: [{ lang: 'Lua', label: 'love.update', src: sinDtCorto.split('\n').slice(0, 4).join('\n') }] }],
        right: [{ check: { q: 'Tu juego mueve la bola 5 píxeles por frame. Tu compañera lo corre a 144 fps y tú a 30 fps. ¿Qué pasa?', opts: ['Las dos bolas van igual de rápido', 'La de ella va casi 5 veces más rápido', 'La de ella va más lento', 'A 144 fps el juego no corre'], ok: 1, why: '5 × 30 = 150 píxeles por segundo contra 5 × 144 = 720. La misma línea da juegos distintos según el computador. Y en tu PC, ¿a cuántos fps se diseñó?' } }],
        nota: 'Que voten antes de explicar. Error esperado: «igual de rápido», porque el código es el mismo. Haz la cuenta en voz alta: 150 contra 720 píxeles por segundo. Recuerda que muchos juegos viejos de consola ataban la velocidad a los frames del televisor. 3 minutos.' },

      { kind: 'demo', title: 'Mueve el deslizador de fps',
        izq: 62,
        left: [{ fig: 'deltaTime' }],
        right: [
          { big: 'Sin dt la velocidad depende del computador.' },
          { clave: 'Con dt: píxeles por <b>segundo</b>, no por frame.', paso: true },
          { pie: 'A 60 fps las dos bolas empatan: por eso el error se esconde en el computador de quien lo programó.', paso: true }
        ],
        nota: 'Empieza en 60 fps: las dos bolas empatan. Pregunta: ¿entonces da igual? Luego baja a 20 y sube a 144. Pregunta: ¿cuál de las dos bolas llega siempre en 2 segundos? Respuesta: la de dt. Observa también que a pocos fps la bola de dt salta más lejos en cada frame, pero llega a tiempo. 6 minutos.' },

      { kind: 'codigo', title: 'La regla de oro en código',
        izq: 36,
        left: [
          { big: '<code>x = x + velocidad * dt</code>' },
          { p: 'La velocidad va en píxeles <b>por segundo</b>. <code>dt</code> va en segundos. Al multiplicar quedan píxeles: lo que hay que avanzar en este frame.' },
          { clave: 'Todo lo que cambia con el tiempo lleva dt: también los temporizadores.', paso: true }
        ],
        right: [{ code: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: dtPseudo }, { lang: 'Lua', label: 'Lua (LÖVE)', src: dtLove }], marca: [
          { l: [2], t: 'Así no: un número fijo <b>por frame</b>.' },
          { l: [5, 6], t: 'Así sí: velocidad por segundo × segundos que pasaron.' },
          { l: [9], t: 'Un temporizador también se descuenta con dt.' }
        ] }],
        nota: 'Haz las unidades en el tablero: píxeles/segundo × segundos = píxeles. Es la misma cuenta de la física del colegio: distancia = velocidad × tiempo. Abre la pestaña Lua y señala que LÖVE entrega dt como parámetro de love.update. Pregunta: ¿cuánto vale dt a 60 fps? Respuesta: cerca de 0,0167. 5 minutos.' },

      { kind: 'antipatron', title: 'Por frame contra por segundo',
        lead: 'La misma bola, dos maneras de moverla. Solo una funciona en todos los computadores.',
        top: true,
        full: [{ compare: { a: { label: 'Así no: depende de los fps', lang: 'Lua', src: sinDtCorto }, b: { label: 'Así sí: depende del tiempo', lang: 'Lua', src: conDtCorto } } }],
        nota: 'Señala las cuentas de los comentarios: a la izquierda tres resultados distintos, a la derecha siempre 300. Pregunta: si sube a 240 fps, ¿qué cambia en cada lado? Respuesta: la izquierda va a 1200 px/s; la derecha sigue en 300. 2 minutos.' },

      { kind: 'idea', title: 'Vectores: hacia dónde y qué tanto',
        izq: 54,
        left: [{ svg: svgVector }],
        right: [
          { ul: ['Un vector es un par <b>(x, y)</b>.', 'Sirve para la <b>posición</b> y para la <b>velocidad</b>.', 'Su <b>largo</b> es √(x² + y²).'], pasos: true },
          { clave: 'En LÖVE, y crece hacia abajo. Saltar es restar a y.', paso: true }
        ],
        nota: 'Recorre el dibujo: 3 a la derecha y 2 hacia abajo. Advierte de frente lo de y hacia abajo: es el error número uno al empezar. Pregunta: ¿qué vector lleva hacia arriba a la izquierda? Respuesta: algo como (-1, -1). Conecta con dt: posición = posición + velocidad × dt se hace por separado en x y en y. 5 minutos.' },

      { kind: 'reto', title: 'Predice: la diagonal tramposa',
        izq: 44,
        left: [
          { p: 'Derecha suma 1 a <code>dx</code>. Abajo suma 1 a <code>dy</code>. El jugador presiona las dos.' },
          { code: [{ lang: 'Lua', src: `dx, dy = 1, 1
jugador.x = jugador.x + dx * 250 * dt
jugador.y = jugador.y + dy * 250 * dt` }] }
        ],
        right: [{ check: { q: '¿A qué rapidez se mueve el jugador en diagonal?', opts: ['250 px/s, igual que en recto', 'Cerca de 354 px/s', '500 px/s, el doble', '125 px/s, la mitad'], ok: 1, why: 'El vector (1, 1) mide √2 ≈ 1,41, así que va a 250 × 1,41 ≈ 354 px/s. Hay que normalizar: dividir entre el largo para que la dirección mida 1.' } }],
        nota: 'Error esperado: «el doble», porque suman dos teclas. Dibuja el triángulo: los catetos miden 1 y la hipotenusa √2. Muchos juegos antiguos tenían este error y los speedrunners lo aprovechaban. La corrección está en la página de la sesión. 3 minutos.' },

      { kind: 'demo', title: 'Del ángulo a la dirección',
        izq: 60,
        left: [{ fig: 'vectorAngulo' }],
        right: [
          { ul: ['<code>dx = cos(ángulo)</code>: cuánto hacia la derecha.', '<code>dy = sin(ángulo)</code>: cuánto hacia abajo.', 'Por la rapidez: la velocidad de la bala.'], pasos: true },
          { clave: 'cos y sin siempre dan una dirección de largo 1.', paso: true }
        ],
        nota: 'Mueve el ángulo despacio y lee los dos números. Pregunta: ¿qué ángulo da (0, 1)? Respuesta: 90 grados, que en pantalla es hacia abajo. Dispara a 0, 90 y 225 grados. Luego sube la rapidez: la dirección no cambia, solo el largo. No hace falta saber trigonometría formal: basta saber que cos va con x y sin con y. 6 minutos.' },

      { kind: 'codigo', title: 'Disparar en ángulo',
        izq: 34,
        left: [
          { big: 'Grados para la persona, radianes para Lua.' },
          { p: 'Para apuntar al ratón se hace al revés: de la dirección al ángulo con <code>math.atan2(dy, dx)</code>.' },
          { clave: '<code>math.cos(90)</code> no da 0: usa <code>math.rad(90)</code>.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', src: trigCorto }, { lang: 'Pseudo', label: 'Pseudocódigo', src: trigPseudo }], marca: [
          { l: [1], t: 'Primero, de grados a radianes.' },
          { l: [3, 4], t: 'El ángulo se vuelve una <b>dirección de largo 1</b>.' },
          { l: [6, 7], t: 'Por la rapidez: ya es la velocidad de la bala.' },
          { l: [10, 11], t: 'Y cada frame, la regla de oro con dt.' }
        ] }],
        nota: 'Recorre las marcas. Señala que las dos últimas líneas son exactamente lo de vectores y dt: todo se conecta. Pregunta: ¿cómo dispararías tres balas en abanico? Respuesta esperada: tres ángulos, por ejemplo -15, 0 y 15 grados alrededor del ángulo de la nave. 4 minutos.' },

      { kind: 'idea', title: 'Máquina de estados: tres palabras',
        full: [
          { big: 'Siempre en un estado, y solo uno. Un evento puede cambiarlo.' },
          { tabla: { head: ['Palabra', 'Qué es', 'Ejemplo'], rows: [['<b>Estado</b>', 'una situación bien definida', 'Quieto, Corre, Salta, Ataca'], ['<b>Evento</b>', 'algo que ocurre', 'tecla, choque, temporizador'], ['<b>Transición</b>', 'en X, ante Y, pasa a Z', 'Quieto + flecha → Corre']] }, pasos: true },
          { clave: 'Si no hay flecha para un evento, el evento se ignora. Eso también es una regla.', paso: true }
        ],
        nota: 'Conecta con la sesión 1: el árbitro consulta el reglamento; la FSM es un reglamento con forma de diagrama. Muestra que el semáforo es una FSM: verde, amarillo, rojo, y el evento es el temporizador. Pregunta: ¿qué estados tiene una puerta de un juego? Respuesta esperada: cerrada, abriéndose, abierta, cerrándose (o bloqueada). 4 minutos.' },

      { kind: 'demo', title: 'La FSM de un personaje: tócala',
        izq: 64,
        left: [{ fig: 'fsmPersonaje' }],
        right: [
          { p: 'Envía eventos y mira qué flecha se enciende.' },
          { clave: 'Reglas claras, bugs raros.', paso: true },
          { pie: 'Cambia a «Con booleanos» y presiona Espacio dos veces en el aire.', paso: true }
        ],
        nota: 'Envía: derecha, espacio, espacio. La segunda vez no pasa nada: no hay flecha. Pregunta: ¿qué diseño de juego acabamos de tomar? Respuesta: sin doble salto. Luego modo «Con booleanos»: espacio, espacio y clic. Quedan saltando y atacando a la vez, y saltó dos veces. Pregunta: ¿cuántas combinaciones posibles hay con 3 booleanos? Respuesta: 8, y la mayoría son absurdas. 6 minutos.' },

      { kind: 'reto', title: 'Predice: el bug del ataque en el aire',
        izq: 44,
        left: [{ code: [{ lang: 'Lua', label: 'Transiciones', src: fsmTablaCorto.split('\n').slice(0, 5).join('\n') }] }],
        right: [{ check: { q: 'Diseño pide: «se puede atacar en el aire». ¿Qué cambias en la máquina?', opts: ['Agregar <code>clic = "ataca"</code> dentro de <code>salta</code>', 'Agregar un booleano <code>atacandoEnElAire</code>', 'Borrar el estado <code>salta</code>', 'Nada: ya se puede'], ok: 0, why: 'Un pedido de diseño es una flecha nueva en el diagrama y una entrada nueva en la tabla. No hacen falta variables nuevas. Ojo: ¿y a qué estado vuelve después de atacar en el aire?' } }],
        nota: 'Error esperado: el booleano, por costumbre. La pregunta final abre una discusión buena: quizá haga falta un estado «AtacaEnElAire» que al terminar vuelva a Salta, no a Quieto. Así se diseña: en papel, antes de programar. 3 minutos.' },

      { kind: 'antipatron', title: 'La sopa de booleanos',
        lead: 'Tres variables que deberían ser una.',
        top: true,
        full: [{ compare: { a: { label: 'Así no: un booleano por situación', lang: 'Lua', src: boolsMal }, b: { label: 'Así sí: una sola variable de estado', lang: 'Lua', src: fsmBien } } }],
        nota: 'Pregunta: en la izquierda, ¿qué línea apaga «saltando» cuando aterriza? Respuesta: ninguna, y ese olvido es el bug típico. En la derecha, la pregunta «¿puedo saltar?» se responde mirando un solo valor. 2 minutos.' },

      { kind: 'codigo', title: 'La FSM como tabla',
        izq: 34,
        left: [
          { big: 'El diagrama se copia tal cual en una tabla.' },
          { p: 'Cada fila es un estado; dentro, cada evento lleva al estado siguiente.' },
          { clave: 'Un pedido nuevo de diseño es una línea nueva, no un <code>if</code> más.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', src: fsmTablaCorto }, { lang: 'Lua', label: 'Pong (LÖVE)', src: fsmLove }], marca: [
          { l: [1, 2, 3, 4, 5], t: 'El diagrama de la figura, escrito como datos.' },
          { l: [7], t: 'Una sola verdad: el estado actual.' },
          { l: [10, 11, 12, 13], t: 'Si hay flecha, se cambia. Si no, <b>se ignora</b>.' }
        ] }],
        nota: 'Recorre las marcas. Que lean la pestaña Pong: es la FSM de la bola que van a diseñar en el taller, así que no la expliques entera, solo señala los tres estados. La versión que se ejecuta en el navegador está en la página de la sesión. 4 minutos.' },

      { kind: 'industria', title: 'En juegos reales: bucles y estados',
        full: [
          { tabla: { head: ['Juego o motor', 'Qué hace'], rows: [
            ['<b>LÖVE</b>', 'Corre el bucle por ti en <code>love.run</code> y te llama con <code>love.update(dt)</code> y <code>love.draw()</code>.'],
            ['<b>Pac-Man</b> (1980)', 'Los fantasmas alternan modos de persecución, dispersión y huida (asustados): una máquina de estados clásica.'],
            ['<b>Unity y Godot</b>', 'El mismo bucle con otros nombres: <code>Update()</code> con <code>Time.deltaTime</code>, <code>_process(delta)</code>.']
          ] }, pasos: true },
          { clave: 'Los motores cambian el nombre; el bucle, dt y los estados son los mismos.', paso: true }
        ],
        nota: 'Una mención de contexto, sin entrar en Unity. Pregunta: ¿qué evento hace que un fantasma de Pac-Man pase a huir? Respuesta: que Pac-Man coma una píldora de poder. 2 minutos.' },

      { kind: 'actividad', title: 'Pong en papel · 18 min',
        lead: 'En parejas. Sin computador: hoja, lápiz y tres colores.',
        izq: 50,
        left: [
          { ol: ['<b>Bucle</b> en pseudocódigo: marca entrada, actualizar y dibujar.', '<b>Variables:</b> ¿cuáles son vectores?', '<b>Cálculo:</b> 3 frames con dt = 0,5 desde (400, 300) a (200, 100).', '<b>FSM</b> de la bola: Servir, EnJuego, Punto y sus eventos.'], pasos: true },
          { pie: 'Al final, intercambien hoja con otra pareja: busquen un evento sin flecha.' }
        ],
        right: [{ svg: svgPuerta }, { p: 'Así se dibuja una FSM. Es la de una puerta, no la de la bola.' }],
        nota: 'Salas de 2 o 3: 14 minutos de trabajo y 4 para revisión cruzada. Respuesta del cálculo: cada frame avanza (100, 50), así que queda en (700, 450) si nada rebota; pregunta qué pasa si la pantalla mide 600 de alto. Error esperado: olvidar el evento de rebote en paredes y paletas (¿es un estado o solo un cambio de velocidad? Respuesta: un cambio de velocidad dentro de EnJuego). Corta puntual: el parcial empieza a la 1:35.' },

      { kind: 'reto', title: 'Antes del parcial: quiz postclase',
        full: [
          { big: 'Ocho preguntas, cinco minutos.' },
          { ul: ['Bucle, dt, vectores, ángulos y estados.', 'Cada respuesta trae su explicación.', 'Es repaso: no cuenta para la nota.'] },
          { clave: 'Si fallas una, vuelve a la figura de esa idea esta semana.', paso: true }
        ],
        nota: 'Abre el quiz postclase y da 5 minutos. Muestra en grupo las dos preguntas con más errores y explica la trampa de cada una. Luego explica las reglas del quiz o parcial: individual, 25 minutos, un intento, sale de las sesiones 1 y 2.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>El juego es un bucle:</b> entrada, actualizar, dibujar.', '<b>El tiempo manda:</b> velocidad × dt, vectores y ángulos.', '<b>Siempre en un estado:</b> transiciones claras, menos bugs.'], pasos: true },
          { p: 'Ahora: quiz o parcial del Corte I. La próxima sesión: <b>POO y arquitectura</b>. Tu FSM de hoy se vuelve objetos. Trae tu Pong en papel.', paso: true }
        ],
        nota: '2 minutos. Pregunta de puente: si cada estado del personaje tuviera su propio código de actualizar y dibujar, ¿cómo lo organizarías? Deja la pregunta abierta: es el patrón State de la sesión 3, que además abre el ACA 1.' }
    ],

    pre: [
      { q: '¿Qué hace un juego en cada vuelta de su bucle principal?', opts: ['Solo dibuja cuando el jugador presiona una tecla', 'Lee la entrada, actualiza el estado y dibuja', 'Espera a que el jugador termine el nivel', 'Vuelve a cargar todas las imágenes'], ok: 1, why: 'El bucle no espera al jugador: en cada vuelta lee la entrada (aunque no haya ninguna), actualiza y dibuja. La primera opción describe un programa de oficina, no un juego.', idea: 'C1' },
      { q: 'Un juego va a 60 frames por segundo. ¿Cuántas veces por segundo se dibuja la pantalla, más o menos?', opts: ['1', '6', '600', '60'], ok: 3, why: 'Un frame es una vuelta del bucle y una imagen. 60 fps son 60 imágenes por segundo, como 60 páginas de un flipbook.', idea: 'C1' },
      { q: 'La bola se mueve con <code>x = x + 5</code> en cada frame. Un computador va a 30 fps y otro a 120 fps. ¿Qué pasa?', opts: ['Las dos van igual de rápido', 'La de 30 fps va más rápido', 'Ninguna se mueve', 'La de 120 fps va cuatro veces más rápido'], ok: 3, why: '5 × 30 = 150 px/s contra 5 × 120 = 600 px/s. Sumar un número fijo por frame ata la velocidad al computador. Es tentador pensar que el mismo código da lo mismo, pero no.', idea: 'C2',
        code: { lang: 'Lua', src: `function love.update(dt)
    x = x + 5
end` } },
      { q: 'En LÖVE, donde y crece hacia abajo, una bola tiene velocidad <code>(0, -200)</code>. ¿Hacia dónde va?', opts: ['Hacia la derecha', 'Hacia abajo', 'Hacia arriba', 'Está quieta'], ok: 2, why: 'x = 0: no se mueve a los lados. y negativo: como y crece hacia abajo, restar a y es subir. Quien piensa en el plano del colegio suele responder «abajo».', idea: 'C3' },
      { q: 'Una nave apunta en un ángulo y quieres que la bala salga en esa dirección. ¿Qué se usa?', opts: ['El coseno y el seno del ángulo', 'Un número al azar', 'La raíz cuadrada del ángulo', 'Sumar el ángulo a la posición x'], ok: 0, why: 'cos(ángulo) da cuánto avanzar en x y sin(ángulo) cuánto en y. Sumar el ángulo a x mezcla grados con píxeles, que no tienen nada que ver.', idea: 'C4' },
      { q: 'Un personaje está saltando y el jugador vuelve a presionar Espacio. En su máquina de estados no hay transición «Salta + Espacio». ¿Qué pasa?', opts: ['Salta otra vez', 'El juego se cierra con un error', 'No pasa nada: ese evento se ignora en ese estado', 'Vuelve al estado Quieto'], ok: 2, why: 'En una FSM, un evento sin flecha en el estado actual se ignora. Así, sin escribir nada extra, el juego no tiene doble salto.', idea: 'C5' }
    ],
    post: [
      { q: 'En LÖVE escribiste <code>love.update</code> para mover al jugador, pero olvidaste escribir <code>love.draw</code>. ¿Qué ves al correr el juego?', opts: ['El jugador se mueve normal', 'Un error al iniciar', 'La ventana vacía: el estado cambia pero nada se pinta', 'El jugador se mueve el doble de rápido'], ok: 2, why: 'Actualizar cambia los números; dibujar los muestra. Sin draw, x sí cambia, pero la pantalla queda vacía. No es un error de Lua: LÖVE simplemente no tiene qué pintar.', idea: 'C1' },
      { q: 'Un juego corre a 50 fps. ¿Cuánto vale <code>dt</code>, más o menos?', opts: ['50', '0,5', '5', '0,02'], ok: 3, why: 'dt son los segundos entre frames: 1 ÷ 50 = 0,02. La trampa es confundir dt con los fps: son inversos.', idea: 'C2' },
      { q: 'Un power-up debe durar 5 segundos. ¿Qué línea va en <code>love.update(dt)</code>?', opts: ['<code>tiempo = tiempo - 1</code>', '<code>tiempo = tiempo - dt</code>', '<code>tiempo = tiempo - 1/60</code>', '<code>tiempo = 5 * dt</code>'], ok: 1, why: 'Restar dt descuenta segundos reales en cualquier computador. Restar 1/60 solo funciona si el juego va exactamente a 60 fps; restar 1 acabaría el power-up en 5 frames.', idea: 'C2',
        code: { lang: 'Lua', src: `local tiempo = 5   -- segundos de power-up` } },
      { q: 'Una bola está en (100, 200) con velocidad (50, -100) px/s. Pasa un frame con <code>dt = 0,5</code>. ¿Dónde queda?', opts: ['(150, 100)', '(125, 250)', '(50, 300)', '(125, 150)'], ok: 3, why: 'x: 100 + 50 × 0,5 = 125. y: 200 + (-100) × 0,5 = 150. La primera opción olvida multiplicar por dt; la segunda suma al revés en y.', idea: 'C3' },
      { q: 'En LÖVE, con <code>dx = math.cos(a)</code> y <code>dy = math.sin(a)</code>, ¿hacia dónde sale una bala con <code>a = math.rad(90)</code>?', opts: ['Hacia la derecha', 'Hacia arriba', 'Hacia abajo', 'Hacia la izquierda'], ok: 2, why: 'cos(90°) = 0 y sin(90°) = 1: la dirección es (0, 1). Como en LÖVE y crece hacia abajo, la bala baja. En el plano del colegio sería arriba: ese es el distractor.', idea: 'C4' },
      { q: 'Escribes <code>math.cos(90)</code> esperando 0 y sale otro número. ¿Por qué?', opts: ['Lua tiene un error en math.cos', 'math.cos espera radianes: hay que escribir math.cos(math.rad(90))', 'Hay que usar grados negativos', 'El coseno de 90 nunca es 0'], ok: 1, why: 'Las funciones de Lua trabajan en radianes. 90 radianes es un ángulo muy distinto de 90 grados. <code>math.rad</code> hace la conversión.', idea: 'C4' },
      { q: 'En Pong la bola tiene los estados Servir, EnJuego y Punto. ¿Qué evento debería llevarla de EnJuego a Punto?', opts: ['Presionar Espacio', 'La bola sale por un lado de la pantalla', 'Que pase un frame', 'La bola toca una paleta'], ok: 1, why: 'Punto significa que alguien anotó, y eso ocurre cuando la bola sale por un lado. Tocar la paleta es un rebote: cambia la velocidad, pero la bola sigue EnJuego.', idea: 'C5' },
      { q: 'Un personaje usa tres booleanos: <code>corriendo</code>, <code>saltando</code> y <code>atacando</code>. ¿Cuál es el riesgo principal?', opts: ['Que ocupen demasiada memoria', 'Que Lua no acepte tres booleanos', 'Ninguno: es la forma recomendada', 'Que queden varios en true a la vez y el personaje entre en una situación imposible'], ok: 3, why: 'Tres booleanos dan 8 combinaciones, y la mayoría no tienen sentido (correr, saltar y atacar a la vez). Una sola variable de estado solo permite las situaciones que diseñaste.', idea: 'C5' }
    ]
  };
})();
