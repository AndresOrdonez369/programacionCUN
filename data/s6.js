(function () {
  /* ---------- código de la sesión (versiones completas para la página) ---------- */
  const puntoPseudo = `-- ¿El clic cayó dentro de la figura?

CÍRCULO (centro cx, cy y radio r):
    dx ← px − cx
    dy ← py − cy
    está dentro si dx² + dy² ≤ r²

RECTÁNGULO (esquina x, y; ancho y alto):
    está dentro si  x ≤ px ≤ x + ancho
              y si  y ≤ py ≤ y + alto

AL HACER CLIC en (px, py):
    para cada figura, de la de encima a la de abajo
        si el punto está dentro: elegirla y parar`;
  const puntoLove = `local colision = require("colision")

local boton  = { x = 300, y = 200, ancho = 200, alto = 60 }
local moneda = { x = 150, y = 120, r = 24 }

-- LÖVE llama a esta función cada vez que haces clic
function love.mousepressed(px, py, b)
    if b ~= 1 then return end                -- solo el clic izquierdo
    if colision.puntoEnRect(px, py, boton) then
        print("clic en el botón")
    elseif colision.puntoEnCirculo(px, py, moneda) then
        print("tomaste la moneda")
    end
end

function love.draw()
    -- el rectángulo se dibuja desde su esquina; el círculo, desde su centro
    love.graphics.rectangle("line", boton.x, boton.y, boton.ancho, boton.alto)
    love.graphics.circle("line", moneda.x, moneda.y, moneda.r)
end`;
  const puntoRun = `local function puntoEnCirculo(px, py, c)
    local dx, dy = px - c.x, py - c.y
    return dx * dx + dy * dy <= c.r * c.r
end

local function puntoEnRect(px, py, r)
    return px >= r.x and px <= r.x + r.ancho
       and py >= r.y and py <= r.y + r.alto
end

local moneda = { x = 150, y = 120, r = 24 }
local boton  = { x = 300, y = 200, ancho = 200, alto = 60 }

print(puntoEnCirculo(160, 130, moneda))  --> true
print(puntoEnCirculo(180, 140, moneda))  --> false
print(puntoEnRect(310, 255, boton))      --> true
print(puntoEnRect(310, 265, boton))      --> false`;

  const ccPseudo = `-- Dos círculos A y B

dx ← B.x − A.x
dy ← B.y − A.y
distancia² ← dx² + dy²          -- Pitágoras, sin la raíz
suma ← A.r + B.r

si distancia² ≤ suma² entonces
    chocan
si no
    no chocan

-- ¿Por qué al cuadrado? Si dos números positivos cumplen
-- a ≤ b, también cumplen a² ≤ b². Comparar cuadrados da
-- la misma respuesta y ahorra una raíz por pareja.`;
  const ccLove = `local colision = require("colision")

local jugador = { x = 100, y = 100, r = 20 }
local monedas = {
    { x = 300, y = 120, r = 12 },
    { x = 500, y = 260, r = 12 },
}
local puntos = 0

function love.update(dt)
    -- recorrer al revés para poder borrar sin saltarse ninguna
    for i = #monedas, 1, -1 do
        if colision.circuloCirculo(jugador, monedas[i]) then
            table.remove(monedas, i)
            puntos = puntos + 1
        end
    end
end`;
  const ccRun = `local function circuloCirculo(a, b)
    local dx, dy = b.x - a.x, b.y - a.y
    local suma = a.r + b.r
    return dx * dx + dy * dy <= suma * suma
end

local jugador = { x = 100, y = 100, r = 20 }
local moneda  = { x = 130, y = 140, r = 12 }
local enemigo = { x = 300, y = 100, r = 40 }

-- dx = 30, dy = 40: la distancia es 50 y la suma de radios, 32
print(circuloCirculo(jugador, moneda))   --> false
moneda.r = 30                            -- ahora la suma es 50
print(circuloCirculo(jugador, moneda))   --> true (se rozan)
print(circuloCirculo(jugador, enemigo))  --> false`;

  const aabbPseudo = `-- Dos rectángulos sin rotar (AABB), con esquina (x, y)

se solapan en X si
    A empieza antes de que B termine   (A.x < B.x + B.ancho)
    y B empieza antes de que A termine (B.x < A.x + A.ancho)

se solapan en Y si
    A.y < B.y + B.alto  y  B.y < A.y + A.alto

chocan si se solapan en X  Y  en Y, al mismo tiempo

-- Con un solo eje no basta: dos rectángulos uno encima
-- del otro se solapan en X y no se tocan.`;
  const aabbRun = `-- Rectángulos con esquina superior izquierda (x, y), como en LÖVE
local function aabb(a, b)
    return a.x < b.x + b.ancho and b.x < a.x + a.ancho   -- solape en X
       and a.y < b.y + b.alto  and b.y < a.y + a.alto    -- solape en Y
end

local paleta   = { x = 350, y = 550, ancho = 100, alto = 16 }
local bola     = { x = 390, y = 540, ancho = 12,  alto = 12 }
local ladrillo = { x = 100, y = 60,  ancho = 64,  alto = 24 }

print(aabb(bola, paleta))      --> true
print(aabb(bola, ladrillo))    --> false

-- La cruz: ninguna esquina queda adentro de la otra, pero chocan
local acostado = { x = 0,  y = 40, ancho = 200, alto = 20 }
local parado   = { x = 90, y = 0,  ancho = 20,  alto = 100 }
print(aabb(acostado, parado))  --> true`;
  const aabbLove = `local colision = require("colision")

local paleta = { x = 350, y = 550, ancho = 100, alto = 16 }
local bola = { x = 400, y = 300, ancho = 12, alto = 12, vx = 120, vy = 240 }

function love.update(dt)
    bola.x = bola.x + bola.vx * dt
    bola.y = bola.y + bola.vy * dt

    -- detectar: ¿la bola se metió en la paleta?
    if colision.aabb(bola, paleta) and bola.vy > 0 then
        bola.y = paleta.y - bola.alto   -- sacarla (la sesión 7 lo mejora)
        bola.vy = -bola.vy
    end
end

function love.draw()
    love.graphics.rectangle("fill", paleta.x, paleta.y, paleta.ancho, paleta.alto)
    love.graphics.rectangle("fill", bola.x, bola.y, bola.ancho, bola.alto)
end`;

  const crPseudo = `-- Círculo (centro cx, cy y radio r) contra rectángulo

-- 1. Buscar el punto P del rectángulo más cercano al centro:
--    "limitar" cada coordenada al borde del rectángulo
P.x ← limitar(cx, rect.x, rect.x + ancho)
P.y ← limitar(cy, rect.y, rect.y + alto)

-- 2. Ese punto, ¿cae dentro del círculo?
dx ← cx − P.x
dy ← cy − P.y
chocan si dx² + dy² ≤ r²

-- limitar(v, mín, máx): si v se pasa, se queda en el borde
--   limitar(50, 0, 30) = 30     limitar(-4, 0, 30) = 0
--   limitar(12, 0, 30) = 12`;
  const crRun = `local function limitar(v, minimo, maximo)
    return math.max(minimo, math.min(v, maximo))
end

local function circuloRect(c, r)
    -- P: el punto del rectángulo más cercano al centro del círculo
    local px = limitar(c.x, r.x, r.x + r.ancho)
    local py = limitar(c.y, r.y, r.y + r.alto)
    local dx, dy = c.x - px, c.y - py
    return dx * dx + dy * dy <= c.r * c.r, px, py
end

local muro = { x = 200, y = 100, ancho = 120, alto = 80 }

print(circuloRect({ x = 260, y = 90,  r = 15 }, muro))  --> true 260 100
print(circuloRect({ x = 188, y = 88,  r = 15 }, muro))  --> false 200 100
print(circuloRect({ x = 250, y = 140, r = 5 },  muro))  --> true 250 140
-- El segundo es la esquina tramposa: su caja sí toca el muro,
-- pero el círculo no. La caja habría dado un falso positivo.`;

  const fasesPseudo = `-- Todos contra todos, pero barato primero

para i desde 1 hasta n
    para j desde i + 1 hasta n          -- cada pareja una sola vez
        A ← figura[i]
        B ← figura[j]
        -- BROAD PHASE: vistazo barato y aproximado
        si los círculos envolventes de A y B se tocan
            -- NARROW PHASE: prueba exacta, solo a sospechosos
            si la prueba exacta dice que chocan
                resolver el choque

-- Con 100 figuras hay 100 × 99 / 2 = 4950 parejas.
-- El vistazo descarta casi todas; la prueba cara
-- se hace con unas pocas.`;
  const fasesLove = `local colision = require("colision")
local figuras = {}   -- cada una: centro x, y; radio envolvente r; y :caja()
local pruebasExactas = 0

function love.update(dt)
    for _, f in ipairs(figuras) do f:update(dt) end

    pruebasExactas = 0
    for i = 1, #figuras do
        for j = i + 1, #figuras do                  -- cada pareja una vez
            local a, b = figuras[i], figuras[j]
            -- broad phase: los círculos envolventes, ¿se tocan?
            if colision.circuloCirculo(a, b) then
                pruebasExactas = pruebasExactas + 1
                -- narrow phase: la prueba exacta, solo a los sospechosos
                if colision.aabb(a:caja(), b:caja()) then
                    a:rebotarCon(b)
                end
            end
        end
    end
end`;
  const moduloLua = `-- colision.lua: solo funciones, sin estado. Un módulo (sesión 5).
local colision = {}

function colision.puntoEnCirculo(px, py, c)
    local dx, dy = px - c.x, py - c.y
    return dx * dx + dy * dy <= c.r * c.r
end

function colision.circuloCirculo(a, b)
    local dx, dy, s = b.x - a.x, b.y - a.y, a.r + b.r
    return dx * dx + dy * dy <= s * s
end

function colision.aabb(a, b)
    return a.x < b.x + b.ancho and b.x < a.x + a.ancho
       and a.y < b.y + b.alto  and b.y < a.y + a.alto
end

-- te falta: puntoEnRect y circuloRect (taller)

return colision`;

  /* ---------- versiones cortas para las slides ---------- */
  const ccCorto = `local function circuloCirculo(a, b)
    local dx, dy = b.x - a.x, b.y - a.y
    local suma = a.r + b.r
    return dx * dx + dy * dy <= suma * suma
end

local jugador = { x = 100, y = 100, r = 20 }
local moneda  = { x = 130, y = 140, r = 12 }

print(circuloCirculo(jugador, moneda))  --> false
moneda.r = 30
print(circuloCirculo(jugador, moneda))  --> true`;
  const aabbCorto = `local function aabb(a, b)
    return a.x < b.x + b.ancho and b.x < a.x + a.ancho
       and a.y < b.y + b.alto  and b.y < a.y + a.alto
end

local paleta = { x = 350, y = 550, ancho = 100, alto = 16 }
local bola   = { x = 390, y = 540, ancho = 12,  alto = 12 }

print(aabb(bola, paleta))   --> true`;
  const crCorto = `local function limitar(v, minimo, maximo)
    return math.max(minimo, math.min(v, maximo))
end

local function circuloRect(c, r)
    local px = limitar(c.x, r.x, r.x + r.ancho)
    local py = limitar(c.y, r.y, r.y + r.alto)
    local dx, dy = c.x - px, c.y - py
    return dx * dx + dy * dy <= c.r * c.r
end`;
  const puntoCorto = `local function puntoEnCirculo(px, py, c)
    local dx, dy = px - c.x, py - c.y
    return dx * dx + dy * dy <= c.r * c.r
end

local function puntoEnRect(px, py, r)
    return px >= r.x and px <= r.x + r.ancho
       and py >= r.y and py <= r.y + r.alto
end

function love.mousepressed(px, py)
    if puntoEnRect(px, py, boton) then
        print("clic en el botón")
    end
end`;
  const esquinasMal = `-- "Chocan si alguna esquina de A
--  está dentro de B, o al revés"
local function chocan(a, b)
  for _, e in ipairs(esquinas(a)) do
    if puntoEnRect(e.x, e.y, b) then
      return true
    end
  end
  for _, e in ipairs(esquinas(b)) do
    if puntoEnRect(e.x, e.y, a) then
      return true
    end
  end
  return false   -- la cruz se cuela aquí
end`;
  const ejesBien = `-- "Chocan si se solapan en X
--  y también en Y"
local function aabb(a, b)
  return a.x < b.x + b.ancho
     and b.x < a.x + a.ancho
     and a.y < b.y + b.alto
     and b.y < a.y + a.alto
end

-- cuatro comparaciones, cero ciclos
-- y no hay forma de cruzarse sin
-- solaparse en los dos ejes`;

  /* ---------- ilustraciones ---------- */
  const svgCoords = `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ejes de LÖVE: x crece a la derecha, y crece hacia abajo. El rectángulo se ubica por su esquina y el círculo por su centro.">
<rect width="640" height="400" fill="#1B1A2E"/>
<line x1="40" y1="40" x2="604" y2="40" stroke="#F4F1E8" stroke-width="3"/><polygon points="604,32 620,40 604,48" fill="#F4F1E8"/>
<line x1="40" y1="40" x2="40" y2="364" stroke="#F4F1E8" stroke-width="3"/><polygon points="32,364 40,380 48,364" fill="#F4F1E8"/>
<text x="600" y="72" fill="#F4F1E8" font-size="22" font-weight="700">x +</text>
<text x="54" y="384" fill="#F4F1E8" font-size="22" font-weight="700">y +</text>
<rect x="30" y="30" width="20" height="20" fill="#FFC83D"/><text x="60" y="26" fill="#FFC83D" font-size="18">(0, 0)</text>
<rect x="140" y="130" width="200" height="110" fill="none" stroke="#FF5D3A" stroke-width="3"/>
<rect x="133" y="123" width="14" height="14" fill="#FFC83D"/>
<text x="150" y="116" fill="#FFC83D" font-size="18" font-weight="700">(x, y)</text>
<text x="140" y="272" fill="#FF5D3A" font-size="18" font-weight="700">rectangle: desde la esquina</text>
<circle cx="480" cy="230" r="72" fill="none" stroke="#3BC4A3" stroke-width="3"/>
<rect x="473" y="223" width="14" height="14" fill="#FFC83D"/>
<line x1="480" y1="230" x2="552" y2="230" stroke="#3BC4A3" stroke-width="2" stroke-dasharray="6 6"/>
<text x="510" y="220" fill="#3BC4A3" font-size="18" font-weight="700">r</text>
<text x="398" y="334" fill="#3BC4A3" font-size="18" font-weight="700">circle: desde el centro</text>
</svg>`;
  const svgPitagoras = `<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dos círculos; entre sus centros, un triángulo rectángulo con catetos dx y dy y la distancia como hipotenusa.">
<rect width="640" height="360" fill="#1B1A2E"/>
<circle cx="170" cy="250" r="80" fill="none" stroke="#FF5D3A" stroke-width="3"/>
<circle cx="470" cy="110" r="60" fill="none" stroke="#3BC4A3" stroke-width="3"/>
<line x1="170" y1="250" x2="470" y2="250" stroke="#6E6B85" stroke-width="3" stroke-dasharray="8 6"/>
<line x1="470" y1="250" x2="470" y2="110" stroke="#6E6B85" stroke-width="3" stroke-dasharray="8 6"/>
<line x1="170" y1="250" x2="470" y2="110" stroke="#FFC83D" stroke-width="3"/>
<rect x="452" y="232" width="18" height="18" fill="none" stroke="#6E6B85" stroke-width="2"/>
<rect x="164" y="244" width="12" height="12" fill="#F4F1E8"/><rect x="464" y="104" width="12" height="12" fill="#F4F1E8"/>
<text x="300" y="282" fill="#F4F1E8" font-size="22" font-weight="700">dx</text>
<text x="486" y="190" fill="#F4F1E8" font-size="22" font-weight="700">dy</text>
<text x="250" y="160" fill="#FFC83D" font-size="22" font-weight="700">distancia</text>
<text x="24" y="330" fill="#F4F1E8" font-size="20">distancia² = dx² + dy²   ·   chocan si distancia² ≤ (r1 + r2)²</text>
</svg>`;

  window.SESION = {
    n: 6,
    titulo: 'Figuras y colisiones',
    objetivos: [
      'Ubicar figuras en el sistema de coordenadas de LÖVE, sabiendo que y crece hacia abajo y que el rectángulo se dibuja desde su esquina.',
      'Decidir si un punto está dentro de un círculo o de un rectángulo, y usarlo para detectar clics.',
      'Programar en Lua las pruebas círculo contra círculo, AABB y círculo contra rectángulo, y comprobarlas con print.',
      'Explicar por qué un juego separa la detección en broad phase y narrow phase, y contar cuántas pruebas se ahorra.',
      'Leer la consigna del ACA 2 e identificar qué colisiones necesita su Breakout.'
    ],
    analogia: 'En el control de seguridad del aeropuerto nadie abre todas las maletas: primero pasan todos por el arco y la máquina de rayos X, un vistazo rápido, y solo a los sospechosos les revisan la maleta a mano. Un juego hace lo mismo con sus objetos: un descarte barato para todos y la prueba exacta, que es más cara, solo para los pares que quizá se tocan. Hoy aprendemos las dos revisiones.',
    ideas: [
      ['C1', 'LÖVE mide la pantalla en píxeles desde la esquina superior izquierda: x crece a la derecha y y hacia abajo. Un punto está dentro de una figura si cumple sus desigualdades.'],
      ['C2', 'Dos círculos chocan si la distancia entre sus centros es menor o igual que la suma de sus radios. Se comparan los cuadrados y no hace falta la raíz.'],
      ['C3', 'Dos rectángulos sin rotar (AABB) chocan si se solapan en X y también en Y. Con un solo eje no basta.'],
      ['C4', 'Para un círculo contra un rectángulo se busca el punto del rectángulo más cercano al centro, limitando (clamp) cada coordenada, y se mide su distancia al centro.'],
      ['C5', 'Broad phase y narrow phase: primero un descarte barato y aproximado para todas las parejas, y la prueba exacta solo para las sospechosas.']
    ],
    agenda: [
      ['0:00', 'Bienvenida y quiz preclase'],
      ['0:08', 'El aeropuerto y cuántas parejas hay que revisar'],
      ['0:15', 'Coordenadas de LÖVE y punto en figura'],
      ['0:28', 'Círculo contra círculo: Pitágoras sin raíz'],
      ['0:42', 'AABB: solape en X y en Y, y la trampa de las esquinas'],
      ['0:57', 'Círculo contra rectángulo con clamp'],
      ['1:08', 'Broad phase y narrow phase con ShapeArena'],
      ['1:22', 'Abre el ACA 2: lectura de la consigna'],
      ['1:32', 'Taller: tu propio colision.lua'],
      ['1:50', 'Quiz postclase y cierre']
    ],
    conceptos: [
      { t: 'Sistema de coordenadas de LÖVE', d: 'La pantalla es una cuadrícula de píxeles. El punto (0, 0) está en la esquina superior izquierda; x crece hacia la derecha y y crece hacia abajo, al revés que en el plano cartesiano del colegio.', ej: 'En una ventana de 800 × 600, el centro es (400, 300) y el borde de abajo está en y = 600. Una bola que cae tiene vy positiva.' },
      { t: 'Punto en figura (picking)', d: 'Pregunta de sí o no: ¿este punto queda dentro de esta figura? Es la colisión más simple y la que usa el juego para saber qué tocó el mouse.', ej: 'En ShapeArena, el clic izquierdo borra la figura que está bajo el cursor: cada figura responde <code>contains(px, py)</code> a su manera.' },
      { t: 'Distancia y Pitágoras', d: 'La distancia entre dos puntos es la hipotenusa del triángulo que forman dx (diferencia en x) y dy (diferencia en y): distancia² = dx² + dy². Es el mismo cálculo de vectores de la sesión 2.', ej: 'Entre (100, 100) y (130, 140) hay dx = 30 y dy = 40, así que la distancia es 50.' },
      { t: 'Comparar al cuadrado', d: 'Si dos números son positivos, a ≤ b da lo mismo que a² ≤ b². Así se evita <code>math.sqrt</code>, que es más lenta, en una prueba que se repite miles de veces por segundo.', ej: '<code>dx*dx + dy*dy &lt;= suma*suma</code> en vez de <code>math.sqrt(dx*dx + dy*dy) &lt;= suma</code>.' },
      { t: 'AABB', d: 'Axis-Aligned Bounding Box: caja alineada con los ejes, es decir, un rectángulo que no rota. Como sus lados son horizontales y verticales, chocar es comparar intervalos en X y en Y.', ej: 'En Breakout la paleta, los ladrillos y hasta la bola se tratan como AABB. Es el centro técnico del ACA 2.' },
      { t: 'Limitar (clamp)', d: 'Obligar a un número a quedarse entre un mínimo y un máximo: si se pasa por arriba vale el máximo, si se pasa por abajo vale el mínimo. En Lua: <code>math.max(minimo, math.min(v, maximo))</code>.', ej: 'limitar(50, 0, 30) da 30. También sirve para que la paleta no se salga de la pantalla.' },
      { t: 'Punto más cercano', d: 'El punto de una figura que queda más cerca de otro punto. Para un rectángulo se obtiene limitando cada coordenada del punto a los bordes del rectángulo.', ej: 'Si el centro de la bola está arriba y a la izquierda del muro, el punto más cercano es la esquina superior izquierda del muro.' },
      { t: 'Volumen envolvente', d: 'Figura simple (círculo o caja) que encierra a una figura complicada. Si los envolventes no se tocan, las figuras de adentro tampoco: se descarta sin hacer la cuenta difícil.', ej: 'En ShapeArena cada figura tiene <code>boundingRadius()</code>: el radio del círculo que la envuelve. La tecla G lo muestra.' },
      { t: 'Broad phase y narrow phase', d: 'Las dos etapas de la detección. Broad phase: descarte rápido y aproximado de las parejas que no pueden chocar. Narrow phase: prueba exacta solo para las parejas sospechosas.', ej: 'Con 100 objetos hay 4950 parejas. El vistazo (o una rejilla) deja unas decenas, y solo esas pasan a la prueba exacta.' }
    ],
    errores: [
      { mito: 'En la pantalla, y crece hacia arriba, como en la clase de matemáticas.', real: 'En LÖVE y en casi todos los motores 2D, y crece hacia abajo. Una bola que cae tiene vy positiva y «arriba» es y más pequeña. Si tu bola se va al techo cuando debería caer, revisa el signo.' },
      { mito: '<code>love.graphics.rectangle("fill", x, y, ancho, alto)</code> dibuja el rectángulo centrado en (x, y).', real: 'Lo dibuja desde su esquina superior izquierda. El círculo, en cambio, sí se ubica por su centro. Mezclar las dos convenciones produce choques corridos media figura. ShapeArena guarda el centro y resta la mitad al dibujar: escoge una convención y úsala en todo el proyecto.' },
      { mito: 'Para saber si dos círculos chocan hay que sacar la raíz cuadrada de la distancia.', real: 'Basta con comparar los cuadrados: <code>dx*dx + dy*dy &lt;= suma*suma</code>. La respuesta es la misma y te ahorras una operación costosa en cada pareja, en cada frame.' },
      { mito: 'Dos rectángulos chocan si alguna esquina de uno está dentro del otro.', real: 'Falla con la cruz: un rectángulo acostado y otro parado se cruzan sin que ninguna esquina quede adentro. La prueba correcta compara intervalos: solape en X y solape en Y.' },
      { mito: 'Para chocar un círculo con un rectángulo, basta con tratar el círculo como su caja.', real: 'Cerca de las esquinas la caja toca y el círculo no: es un falso positivo, la bola rebota en el aire. Con el punto más cercano (clamp) la prueba es exacta y casi igual de barata.' },
      { mito: 'La broad phase es la que decide si hubo choque.', real: 'La broad phase solo descarta: dice «seguro que no» o «quizá». Si con un «quizá» rebotas sin la prueba exacta, tendrás choques fantasma entre figuras que no se tocan.' }
    ],
    codigoIntro: 'Cuatro pruebas de colisión, de la más simple a la más completa, y el bucle que las organiza. Cada una tiene una pestaña «pruébalo» que corre aquí mismo con print, sin abrir LÖVE.',
    codigo: [
      { titulo: 'Punto en figura: ¿qué tocó el mouse?', desc: 'La colisión más simple: un punto contra una figura. Mira que el círculo se mide desde el centro y el rectángulo desde su esquina.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: puntoPseudo },
          { lang: 'Lua', label: 'Lua (LÖVE)', src: puntoLove },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: puntoRun, run: true }
        ] },
      { titulo: 'Círculo contra círculo', desc: 'Pitágoras sin raíz. Es la misma prueba que ya usabas en Coin Hunt para tomar monedas, ahora en una función reutilizable.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: ccPseudo },
          { lang: 'Lua', label: 'Lua (LÖVE)', src: ccLove },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: ccRun, run: true }
        ] },
      { titulo: 'AABB: rectángulo contra rectángulo', desc: 'Cuatro comparaciones. Mira el caso de la cruz al final: ninguna esquina adentro y aun así chocan.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: aabbPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: aabbRun, run: true },
          { lang: 'Lua', label: 'Lua (LÖVE: bola y paleta)', src: aabbLove }
        ] },
      { titulo: 'Círculo contra rectángulo con clamp', desc: 'Primero el punto más cercano, después la distancia. La función devuelve además ese punto, para que lo puedas imprimir o dibujar.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: crPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: crRun, run: true }
        ] },
      { titulo: 'Broad phase, narrow phase y el módulo colision.lua', desc: 'El bucle que revisa cada pareja una sola vez, con el vistazo barato antes de la prueba exacta. Las funciones viven en un módulo, como en la sesión 5.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: fasesPseudo },
          { lang: 'Lua', label: 'Lua (LÖVE: el bucle)', src: fasesLove },
          { lang: 'Lua', label: 'Lua (colision.lua)', src: moduloLua }
        ] }
    ],
    practica: {
      t: 'Tu propio colision.lua',
      intro: 'En parejas. Uno escribe y el otro predice qué va a imprimir antes de correr; cambian de rol en cada función. Trabajan en Lua puro primero y en LÖVE después.',
      pasos: [
        'Crea <code>colision.lua</code> con <code>local colision = {}</code> y <code>return colision</code>. Copia <code>circuloCirculo</code> y <code>aabb</code> de la página de la clase.',
        'Escribe tú <code>puntoEnRect</code> y <code>circuloRect</code> (con <code>limitar</code>). Pruébalas con tres casos cada una: choca, no choca y se roza justo en el borde.',
        'Agrega el caso de la cruz para <code>aabb</code> y la esquina tramposa para <code>circuloRect</code>. Si alguna da mal, dibuja el caso en papel antes de tocar el código.',
        'En LÖVE: un rectángulo fijo en el centro y un círculo que sigue al mouse (<code>love.mouse.getPosition()</code>). Píntalo de rojo cuando choque.',
        'Reto: muestra en pantalla el punto más cercano P como un cuadradito amarillo, igual que en la figura de la clase.'
      ],
      entrega: 'Captura de la consola con los casos de prueba y del círculo rojo en LÖVE, en el foro de la sesión. Este colision.lua es la base del ACA 2.'
    },
    tarea: [
      'ACA 2, semana 1: traduce el esqueleto de clases del ACA 1 a archivos Lua con el patrón <code>.new()</code> y <code>__index</code>. Paleta que se mueve con <code>love.keyboard.isDown</code> y <code>dt</code>, bola que rebota en los bordes y en la paleta, y el primer nivel dibujado desde una tabla.',
      'Trae ese núcleo a la sesión 7: la usaremos para depurar las colisiones en vivo. Si la bola se pega o atraviesa algo, anota en qué caso pasa: es justo lo que resolvemos.',
      'Lee la consigna completa del ACA 2 en C Digital y escribe en el foro una duda concreta sobre la rúbrica.',
      'Repaso opcional: corre ShapeArena (<code>love .</code> en su carpeta), enciende la tecla G y explica en una frase qué muestran los círculos envolventes.'
    ],
    lecturas: [
      'Thompson, J. <i>Collision Detection</i>. Libro gratuito en línea, con ejemplos interactivos de punto, círculo y rectángulo.',
      'MDN Web Docs. <i>2D collision detection</i>. Resumen corto de AABB y círculos, con la misma lógica que usamos en Lua.',
      'Nystrom, R. <i>Game Programming Patterns</i>, capítulo «Spatial Partition». Gratis en línea: la idea de la rejilla de la broad phase.',
      'Ericson, C. <i>Real-Time Collision Detection</i>. Morgan Kaufmann. De consulta, para quien quiera ir mucho más allá.',
      'Documentación de LÖVE (love2d.org/wiki): <code>love.graphics.rectangle</code>, <code>love.graphics.circle</code> y <code>love.mousepressed</code>.'
    ],
    mapa: {
      lead: 'De un punto a cien figuras: cada prueba se apoya en la anterior y todas terminan en tu Breakout.',
      nodos: [
        ['coords', 'Coordenadas', 'y crece hacia abajo', 'idea', 'El origen está arriba a la izquierda. Rectángulos desde la esquina, círculos desde el centro.'],
        ['punto', 'Punto en figura', 'clics y picking', 'idea', 'Un punto está dentro si cumple las desigualdades de la figura.'],
        ['cc', 'Círculo vs círculo', 'distancia al cuadrado', 'codigo', 'Chocan si dx² + dy² ≤ (r1 + r2)².'],
        ['aabb', 'AABB', 'solape en X y en Y', 'codigo', 'Dos rectángulos sin rotar chocan si se solapan en los dos ejes a la vez.'],
        ['cr', 'Círculo vs rectángulo', 'clamp al borde', 'codigo', 'Se limita el centro al rectángulo para hallar el punto más cercano y se mide la distancia.'],
        ['fases', 'Broad y narrow phase', 'vistazo y revisión', 'patron', 'Descarte barato para todas las parejas, prueba exacta solo para las sospechosas.'],
        ['fantasma', 'Choques fantasma', 'falsos positivos', 'riesgo', 'Usar la caja del círculo o solo el vistazo hace rebotar cosas que no se tocan.'],
        ['aca', 'ACA 2', 'Breakout en LÖVE', 'practica', 'Abre hoy: paleta, bola y ladrillos chocan con AABB.']
      ],
      cables: [
        ['coords', 'punto', 'llamada'],
        ['punto', 'cc', 'llamada'],
        ['punto', 'aabb', 'llamada'],
        ['cc', 'cr', 'llamada'],
        ['aabb', 'cr', 'llamada'],
        ['cc', 'fases', 'datos'],
        ['cr', 'fantasma', 'evento'],
        ['fases', 'fantasma', 'evento'],
        ['aabb', 'aca', 'datos'],
        ['fases', 'aca', 'datos']
      ]
    },
    slides: [
      { kind: 'portada', title: 'Figuras y colisiones',
        lead: 'Sesión 6 · Programación de Videojuegos',
        full: [
          { ul: ['Del punto a cien figuras chocando a la vez.', 'Un aeropuerto, un poco de Pitágoras y un módulo de Lua.', 'Hoy abre el <b>ACA 2</b>: tu Breakout jugable.'] },
          { pie: 'Flecha derecha: avanza paso a paso · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas del docente' }
        ],
        nota: '3 minutos. Saluda y recuerda que el quiz preclase está abierto: 5 minutos, sin nota, solo para ver de dónde partimos. Pregunta de calentamiento: ¿en qué juego han sentido que algo los golpeó «sin tocarlos»? Respuesta esperada: alguno dirá un shooter o un juego de plataformas con cajas de colisión generosas. Anuncia que hoy entendemos por qué pasa eso.' },

      { kind: 'analogia', title: 'El control de seguridad del aeropuerto',
        lead: 'Nadie abre todas las maletas.',
        izq: 52,
        left: [
          { mapa: [['Arco y rayos X para todos', 'Broad phase<small>vistazo barato y aproximado</small>'], ['Revisión a mano de la maleta', 'Narrow phase<small>prueba exacta y cara</small>'], ['Pasajero que sigue de largo', 'Pareja descartada'], ['Pitido del arco', '«Quizá chocan»: hay que mirar']], de: 'En el aeropuerto', a: 'En el juego', pasos: true }
        ],
        right: [
          { clave: 'Detectar una colisión es responder sí o no. El arte está en no preguntarle a todo el mundo con la pregunta cara.' },
          { pie: 'Si el arco pita, no te arrestan: te revisan. La broad phase tampoco decide; solo señala.', paso: true }
        ],
        nota: '4 minutos. Pregunta: ¿por qué el aeropuerto no revisa a mano a todos? Respuesta esperada: porque no alcanza el tiempo y casi nadie lleva nada. Igual en el juego: casi ninguna pareja de objetos se está tocando. Recalca la última frase: el pitido no es una condena. Volvemos a esta analogía al final de la clase, cuando veamos la rejilla.' },

      { kind: 'reto', title: 'Predice: ¿cuántas preguntas por frame?',
        lead: 'Un juego con 100 objetos quiere saber qué choca con qué. Revisa cada pareja una sola vez.',
        izq: 50,
        left: [
          { check: { q: '¿Cuántas parejas distintas hay que revisar en cada frame?', opts: ['100', '200', '4950', '10 000'], ok: 2, why: 'Cada objeto se compara con los otros 99, pero la pareja A-B es la misma que B-A: 100 × 99 / 2 = 4950. A 60 fps son casi 300 000 preguntas por segundo. Por eso importan las pruebas baratas y el descarte.' } }
        ],
        right: [
          { tabla: { head: ['Objetos', 'Parejas'], rows: [['10', '45'], ['100', '4950'], ['1000', '499 500']] }, pasos: true },
          { pie: 'n × (n − 1) / 2: crece mucho más rápido que n.', paso: true }
        ],
        nota: '4 minutos. Que respondan en el chat antes de revelar. Muchos dirán 100 o 10 000. Explica con 4 personas que se dan la mano: 6 saludos, no 16. Pregunta: si duplico los objetos, ¿se duplican las parejas? Respuesta esperada: no, casi se cuadruplican. Esto motiva la broad phase del final.' },

      { kind: 'idea', title: 'La pantalla de LÖVE, al derecho',
        lead: 'El origen está arriba a la izquierda y y crece hacia abajo.',
        izq: 52,
        left: [{ svg: svgCoords }],
        right: [
          { ul: ['<b>x</b> crece a la derecha; <b>y</b>, hacia abajo.', '<code>rectangle</code> se ubica por su <b>esquina</b>.', '<code>circle</code> se ubica por su <b>centro</b>.'], pasos: true },
          { check: { q: 'Una bola en y = 500 se mueve con vy = −200. ¿Hacia dónde va?', opts: ['Hacia abajo', 'Hacia arriba', 'Hacia la derecha', 'No se mueve'], ok: 1, why: 'vy negativa hace que y disminuya, y una y más pequeña está más arriba en la pantalla. Es el error de signo más común de la primera semana del Breakout.' }, paso: true }
        ],
        nota: '5 minutos. Dibuja en vivo con love.graphics un rectángulo y un círculo con los mismos números (100, 100): el círculo queda medio afuera de la esquina y el rectángulo no. Pregunta el check. Respuesta esperada: hacia arriba. Error común: pensar como en el plano cartesiano. Di que en el proyecto deben escoger una sola convención para sus rectángulos: esquina, como LÖVE, o centro, como ShapeArena.' },

      { kind: 'codigo', title: 'Punto en figura: el clic',
        lead: 'La colisión más simple: un punto contra una figura.',
        izq: 34,
        left: [
          { big: 'Un punto está dentro si cumple las desigualdades de la figura.' },
          { pie: 'ShapeArena lo usa para borrar la figura que tocas con el mouse.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE)', src: puntoCorto }], marca: [
          { l: [1, 2, 3, 4], t: '<b>Círculo:</b> dentro si la distancia al centro, al cuadrado, no pasa de r².' },
          { l: [6, 7, 8, 9], t: '<b>Rectángulo:</b> dentro si x está entre el borde izquierdo y el derecho, <b>y</b> y está entre el de arriba y el de abajo.' },
          { l: [11, 12, 13, 14, 15], t: 'LÖVE llama a <code>love.mousepressed</code> con la posición del clic. Nosotros solo preguntamos.' }
        ] }],
        nota: '5 minutos. Pregunta: ¿qué cambia en puntoEnRect si el rectángulo se guarda por su centro? Respuesta esperada: los bordes pasan a ser x − ancho/2 y x + ancho/2. En la página de la clase hay una versión «pruébalo» que corre en el navegador: ábranla y cambien un número. Conecta con el Módulo 0: es un «y» lógico de cuatro condiciones.' },

      { kind: 'idea', title: 'Círculo contra círculo: Pitágoras',
        lead: 'Se tocan si la distancia entre centros no pasa de la suma de los radios.',
        izq: 54,
        left: [{ svg: svgPitagoras }],
        right: [
          { ul: ['dx y dy son los catetos; la distancia, la hipotenusa.', 'Se tocan si distancia ≤ r1 + r2.', 'Se compara <b>al cuadrado</b>: no hace falta la raíz.'], pasos: true },
          { clave: 'Si dos números positivos cumplen a ≤ b, también cumplen a² ≤ b².', paso: true }
        ],
        nota: '5 minutos. Conecta con los vectores de la sesión 2: dx, dy es el vector de A hacia B. Pregunta: ¿por qué evitar math.sqrt? Respuesta esperada: es más lenta y se repite miles de veces por frame. Aclara que hoy un computador saca raíces muy rápido; la costumbre viene de cuando no, y sigue siendo buena porque no cambia la respuesta. Ojo: solo funciona porque las dos cantidades son positivas.' },

      { kind: 'demo', title: 'Arrastra los círculos',
        lead: 'Mira cómo cambian los dos números de arriba. Ninguno lleva raíz.',
        top: true,
        full: [{ fig: 'circulos' }],
        nota: '5 minutos. Arrastra B hacia A despacio y pide que digan «ya» cuando crean que se tocan. Luego sube el radio A y repite. Activa «Mostrar la raíz» solo al final, para que vean que la conclusión es la misma. Pregunta: con radios 90 y 60, ¿qué número debe tener la distancia al cuadrado para que apenas se rocen? Respuesta esperada: 150² = 22 500.' },

      { kind: 'codigo', title: 'circuloCirculo en Lua',
        izq: 34,
        left: [
          { big: 'Tres líneas que reemplazan al math.sqrt de Coin Hunt.' },
          { pie: 'Esta versión corre en la página de la clase, sin LÖVE.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: ccCorto }], marca: [
          { l: [2], t: 'El vector de A hacia B.' },
          { l: [3, 4], t: 'Suma de radios y comparación <b>al cuadrado</b>.' },
          { l: [7, 8, 10], t: 'dx = 30, dy = 40: distancia 50. Suma de radios 32: <b>false</b>.' },
          { l: [11, 12], t: 'Con radio 30 la suma es 50: se rozan justo y da <b>true</b>.' }
        ] }],
        nota: '4 minutos. Pregunta antes de la marca 3: ¿qué imprime la primera línea? Respuesta esperada: false. Pide que cambien moneda.r a 29 y predigan. Respuesta: false, porque 49² < 50². Si alguien pregunta por <= contra <: con <= el roce cuenta como choque; decídanlo y sean consistentes.' },

      { kind: 'reto', title: 'Predice: ¿estos rectángulos chocan?',
        lead: 'A va de x = 100 a x = 300. B va de x = 250 a x = 400. A está en y = 0 a 50 y B en y = 80 a 120.',
        izq: 50,
        left: [
          { check: { q: '¿Chocan A y B?', opts: ['Sí: se solapan 50 px en X', 'No: en Y no se solapan', 'Sí: comparten una esquina', 'No se puede saber sin dibujarlos'], ok: 1, why: 'En X sí se solapan (de 250 a 300), pero en Y A termina en 50 y B empieza en 80. Para chocar hacen falta los dos ejes a la vez. La primera opción es la trampa: mira un solo eje.' } }
        ],
        right: [
          { panel: ['Escribe los intervalos de cada uno en X y en Y antes de responder.'], h: 'Pista' }
        ],
        nota: '3 minutos. Que respondan antes de pasar. Respuesta esperada: B. Pide a alguien que dibuje los dos rectángulos en el tablero compartido. La siguiente figura muestra exactamente esto: la sombra de cada rectángulo en cada eje.' },

      { kind: 'demo', title: 'AABB: la sombra en cada eje',
        lead: 'Arrastra los rectángulos. Chocan solo si las sombras se cruzan abajo y a la izquierda.',
        top: true,
        full: [{ fig: 'aabb' }],
        nota: '6 minutos. Recorre los botones: Separados, Solo en X (se solapan en X y no chocan), Chocan. Pregunta: ¿qué pasa si las sombras se tocan en un solo punto? Respuesta esperada: con < no cuenta como choque. Luego elige «La cruz» y activa «Probar con las esquinas»: cero esquinas adentro y sí chocan. Pregunta quién habría programado la prueba de esquinas: suele ser la mitad. Esa es la slide que sigue.' },

      { kind: 'antipatron', title: 'Las cuatro esquinas no bastan',
        lead: 'Las dos ideas se oyen razonables. Solo una aguanta la cruz.',
        top: true,
        full: [{ compare: { a: { label: 'Mirar si hay esquinas adentro', lang: 'Lua', src: esquinasMal }, b: { label: 'Solape en X y en Y', lang: 'Lua', src: ejesBien } } }],
        nota: '3 minutos. Pregunta: ¿cuántas comparaciones hace cada versión en el peor caso? Respuesta esperada: la izquierda, 8 esquinas por 4 condiciones, 32; la derecha, 4. Y la izquierda además se equivoca. Mensaje: la intuición visual no siempre es el mejor algoritmo; piensa por ejes.' },

      { kind: 'codigo', title: 'aabb en Lua',
        izq: 34,
        left: [
          { big: 'Cuatro comparaciones, un solo return.' },
          { pie: 'Convención de LÖVE: (x, y) es la esquina superior izquierda.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: aabbCorto }], marca: [
          { l: [2], t: '<b>Solape en X:</b> A empieza antes de que B termine y B empieza antes de que A termine.' },
          { l: [3], t: '<b>Solape en Y:</b> la misma idea en vertical.' },
          { l: [9], t: 'La bola está metida en la paleta: <b>true</b>. Detectar es esto; resolver (sacarla y rebotar) es la sesión 7.' }
        ] }],
        nota: '4 minutos. Pregunta: ¿por qué and y no or entre las dos líneas? Respuesta esperada: porque hacen falta los dos ejes. Muestra en la página de la clase la pestaña de LÖVE con bola y paleta: ahí aparece «and bola.vy > 0», que evita rebotar dos veces. Lo profundizamos la próxima sesión.' },

      { kind: 'idea', title: 'Círculo contra rectángulo',
        lead: 'La bola redonda contra un ladrillo cuadrado.',
        izq: 50,
        left: [
          { ol: ['Limita el centro del círculo a los bordes del rectángulo: ese es <b>P</b>, el punto más cercano.', 'Mide la distancia del centro a P, al cuadrado.', 'Chocan si no pasa de r².'], pasos: true }
        ],
        right: [
          { panel: ['Tratar el círculo como su caja falla cerca de las esquinas: la caja toca y el círculo no.'], h: 'La tentación', tono: 'malo', paso: true },
          { clave: 'limitar(v, mín, máx) = math.max(mín, math.min(v, máx))', paso: true }
        ],
        nota: '4 minutos. Explica limitar con la paleta que no se sale de la pantalla: x = limitar(x, 0, ancho − paleta). Pregunta: si el centro del círculo está dentro del rectángulo, ¿qué es P? Respuesta esperada: el propio centro, distancia cero. En el ACA 2 la bola puede ser un cuadrado y usar AABB; esta prueba es para quien quiera bola redonda.' },

      { kind: 'demo', title: 'Busca el punto más cercano',
        lead: 'Arrastra el círculo alrededor del muro y mira cómo P se desliza por el borde.',
        top: true,
        full: [{ fig: 'clamp' }],
        nota: '5 minutos. Pasea el círculo por los cuatro lados y luego por una esquina: P se queda en la esquina. Activa «Comparar con la caja del círculo» y presiona «Esquina tramposa»: la caja dice choca, el círculo no. Pregunta: ¿cómo se vería ese error en un Breakout? Respuesta esperada: la bola rebota en el aire, antes de tocar la esquina del ladrillo.' },

      { kind: 'codigo', title: 'circuloRect en Lua',
        izq: 34,
        left: [
          { big: 'Dos limitar y una distancia.' },
          { pie: 'La versión de la página devuelve también P, para imprimirlo o dibujarlo.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua', src: crCorto }], marca: [
          { l: [1, 2, 3], t: '<b>limitar:</b> si v se pasa por arriba vale el máximo; si se pasa por abajo, el mínimo.' },
          { l: [6, 7], t: 'P: el centro, recortado a los bordes del rectángulo en cada eje.' },
          { l: [8, 9], t: 'La misma comparación al cuadrado de círculo contra círculo, ahora con P.' }
        ] }],
        nota: '3 minutos. Pregunta: ¿qué devuelve limitar(-4, 0, 30)? Respuesta esperada: 0. Y limitar(12, 0, 30): 12. Señala que circuloRect reutiliza la idea de circuloCirculo: un círculo de radio cero en P. Reutilizar ideas también es diseño.' },

      { kind: 'idea', title: 'Broad phase y narrow phase',
        lead: 'De vuelta al aeropuerto: dos revisiones, de distinto costo.',
        top: true,
        full: [
          { tabla: { head: ['', 'Broad phase', 'Narrow phase'], rows: [['Pregunta', '¿Pueden chocar?', '¿Chocan de verdad?'], ['Respuesta', '«Seguro que no» o «quizá»', '«Sí» o «no»'], ['Cómo', 'Círculos envolventes o una rejilla', 'AABB, clamp o polígonos'], ['A quién', 'A todas las parejas', 'Solo a las sospechosas']] }, pasos: true },
          { clave: 'El vistazo nunca decide un rebote: solo decide a quién revisar.', paso: true }
        ],
        nota: '4 minutos. En ShapeArena la tecla G muestra los círculos envolventes: es la broad phase. La rejilla es otra broad phase: solo se comparan objetos de la misma celda. Pregunta: ¿qué pasa si rebotas con solo el vistazo? Respuesta esperada: choques fantasma. Sé honesto: con rectángulos la prueba exacta es casi tan barata como el vistazo; la diferencia grande aparece con polígonos. Lo que siempre paga es la rejilla, porque ni siquiera mira las parejas lejanas.' },

      { kind: 'demo', title: 'Cuenta las pruebas',
        lead: 'Sube los objetos y cambia de estrategia. Mira el número ámbar.',
        top: true,
        full: [{ fig: 'broadNarrow' }],
        nota: '6 minutos. Empieza en «Todos exactos» con 40 objetos: 780 pruebas. Sube a 200: 19 900. Cambia a «Vistazo + exacta»: las exactas bajan a decenas, pero los vistazos siguen siendo 19 900. Cambia a «Rejilla + exacta» y enciende «Ver rejilla». Pregunta: ¿qué pasa si la celda es mucho más pequeña que los objetos? Respuesta esperada: cada objeto se anota en muchas celdas y se pierde la ventaja. Si la animación molesta, usa Pausa y Paso.' },

      { kind: 'codigo', title: 'El bucle de las dos fases',
        izq: 30,
        left: [
          { big: 'Cada pareja una vez: j empieza en i + 1.' },
          { pie: 'Es el mismo bucle de ShapeArena. Allá rebota con el vistazo; el reto 2 de su README es agregar la prueba exacta.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE)', src: fasesLove }], marca: [
          { l: [6], t: 'Primero se mueve todo; después se pregunta quién choca.' },
          { l: [9, 10], t: '<b>j = i + 1:</b> así A-B no se revisa otra vez como B-A, ni A contra sí misma.' },
          { l: [13], t: '<b>Broad phase:</b> círculos envolventes, barato.' },
          { l: [16, 17], t: '<b>Narrow phase:</b> solo para los sospechosos.' }
        ] }],
        nota: '4 minutos. Pregunta: ¿qué pasaría si j empezara en 1? Respuesta esperada: cada pareja se revisaría dos veces y cada figura chocaría consigo misma. Conecta con la sesión 5: a:caja() y a:rebotarCon(b) son métodos; el bucle no sabe qué figura es cada una. Eso es polimorfismo.' },

      { kind: 'idea', title: 'ShapeArena por dentro',
        lead: 'El proyecto de la sesión, archivo por archivo.',
        izq: 50,
        left: [
          { tabla: { head: ['Archivo', 'Qué enseña'], rows: [['<code>shape.lua</code>', 'Clase base: el contrato de toda figura'], ['<code>circle.lua</code>, <code>rectangle.lua</code>', 'Herencia: cada figura responde a su manera'], ['<code>collide.lua</code>', 'Módulo solo de funciones: la matemática'], ['<code>main.lua</code>', 'Un bucle que no sabe qué figura es cada una']] }, pasos: true }
        ],
        right: [
          { ul: ['<b>1 2 3</b>: crear figuras.', '<b>G</b>: ver la broad phase.', '<b>Clic</b>: borrar con punto en figura.'], pasos: true },
          { pie: 'ShapeArena usa un ayudante <code>class.lua</code>; en el ACA 2 usas el patrón <code>.new()</code> y <code>__index</code> de la sesión 5. Es la misma idea con otra sintaxis.', paso: true }
        ],
        nota: '4 minutos. Corre ShapeArena en vivo. Pregunta: si mañana agregas un pentágono, ¿qué archivos tocas? Respuesta esperada: uno nuevo, pentagon.lua, y la fábrica que decide qué crear; main.lua no. Muestra collide.lua: son las mismas funciones de hoy, con figuras centradas en vez de por esquina.' },

      { kind: 'idea', title: 'Abre el ACA 2: tu Breakout',
        lead: 'Corte III · 32 % · dos semanas de trabajo.',
        izq: 52,
        left: [
          { tabla: { head: ['Semana', 'Meta'], rows: [['Esta', 'Núcleo jugable: paleta, bola, bordes, paleta y el primer nivel desde una tabla'], ['Próxima', 'Ladrillos, estados, ladrillo especial, game feel y documento técnico']] }, pasos: true }
        ],
        right: [
          { ul: ['<b>Colisiones AABB</b> en bordes, paleta y ladrillos.', '<b>POO</b> con <code>.new()</code>, herencia y <code>onHit()</code>.', '<b>Estados:</b> Title, Serve, Play, Pause, GameOver, Victory.'], pasos: true },
          { pie: 'La consigna completa y la rúbrica están en C Digital: mandan sobre este resumen.', paso: true }
        ],
        nota: '8 minutos. Abre la consigna en C Digital y léanla juntos, sobre todo «Pistas técnicas y errores comunes». Pregunta: ¿qué del ACA 1 reutilizan? Respuesta esperada: el diagrama de clases; ahora se vuelve código. Insiste en traer el núcleo a la sesión 7. Responde dudas de la rúbrica aquí y no durante el taller.' },

      { kind: 'actividad', title: 'Taller: tu propio colision.lua',
        lead: 'En parejas, 18 minutos. Uno escribe, el otro predice.',
        izq: 50,
        left: [
          { ol: ['Módulo con <code>circuloCirculo</code> y <code>aabb</code>.', 'Escribe tú <code>puntoEnRect</code> y <code>circuloRect</code>.', 'Prueba la cruz y la esquina tramposa.'], pasos: true }
        ],
        right: [
          { ul: ['En LÖVE: un círculo que sigue al mouse.', 'Rojo cuando choca con el rectángulo.', 'Reto: dibuja el punto P.'], pasos: true },
          { clave: 'Antes de correr, quien no escribe dice qué va a imprimir.', paso: true }
        ],
        nota: '18 minutos. Salas de dos. Pasa por las salas preguntando: ¿qué caso de prueba tienen para el borde exacto? Error común: olvidar el return colision al final del módulo; el require devuelve true y explota con «attempt to index a boolean value». Otro: mezclar esquina y centro. A los 15 minutos pide que una pareja comparta pantalla con el círculo rojo.' },

      { kind: 'reto', title: 'Antes de irnos: quiz postclase',
        lead: 'Ocho preguntas, las mismas cinco ideas de hoy. Compáralo con tu preclase.',
        full: [
          { ul: ['Coordenadas y punto en figura.', 'Círculos, AABB y clamp.', 'Broad phase y narrow phase.'] },
          { pie: 'Abre el quiz postclase desde la página de la sesión.', paso: true }
        ],
        nota: '8 minutos. Que lo hagan en silencio. Mientras responden, revisa en el foro las capturas del taller. Al final pregunta qué pregunta les costó más: suele ser la de la esquina tramposa o la de contar parejas.' },

      { kind: 'cierre', title: 'Lo que te llevas',
        full: [
          { ol: ['<b>y crece hacia abajo</b> y el rectángulo nace en su esquina.', '<b>Círculos:</b> distancia al cuadrado contra suma de radios al cuadrado. <b>Rectángulos:</b> solape en X y en Y.', '<b>Primero el vistazo barato, después la prueba exacta</b>, y solo a los sospechosos.'], pasos: true },
          { p: 'La próxima sesión: ya sabemos <b>detectar</b>; aprendemos a <b>resolver</b>. La bola sale del ladrillo por el lado correcto, la paleta decide el ángulo y el juego se siente bien. Trae tu núcleo jugable.', paso: true }
        ],
        nota: '2 minutos. Ronda rápida en el chat: una colisión de un juego que les guste y qué prueba creen que usa. Recuerda la tarea: núcleo del Breakout para la sesión 7.' }
    ],
    pre: [
      { q: 'En LÖVE, ¿dónde está el punto (0, 0) de la ventana?', opts: ['En el centro de la ventana', 'En la esquina inferior izquierda', 'En la esquina superior izquierda', 'Donde esté el jugador'], ok: 2, why: 'LÖVE, como casi todos los motores 2D, pone el origen arriba a la izquierda y y crece hacia abajo. La esquina inferior izquierda es la del plano cartesiano del colegio: por eso engaña.', idea: 'C1' },
      { q: '¿Qué hace esta función con el punto (12, 30)?', code: { lang: 'Lua', src: 'local r = { x = 10, y = 20, ancho = 40, alto = 10 }\nlocal function dentro(px, py)\n    return px >= r.x and px <= r.x + r.ancho\n       and py >= r.y and py <= r.y + r.alto\nend\nprint(dentro(12, 30))' },
        opts: ['Imprime false, porque 12 está muy cerca del borde', 'Imprime true: 12 está entre 10 y 50 y 30 está entre 20 y 30', 'Da error, porque falta la raíz cuadrada', 'Imprime false, porque 30 es mayor que 20'], ok: 1, why: 'x = 12 cumple 10 ≤ 12 ≤ 50 y y = 30 cumple 20 ≤ 30 ≤ 30: justo en el borde de abajo, y con <= el borde cuenta. La última opción olvida que el rango de y llega hasta y + alto.', idea: 'C1' },
      { q: 'Dos círculos de radio 10 y 20 tienen sus centros a 25 píxeles. ¿Chocan?', opts: ['No, porque 25 es mayor que 20', 'No, porque 25 es mayor que 10', 'Solo si están a la misma altura', 'Sí, porque 25 es menor que 10 + 20 = 30'], ok: 3, why: 'Se tocan si la distancia entre centros no pasa de la suma de radios: 25 ≤ 30. Comparar con un solo radio es el error más común.', idea: 'C2' },
      { q: 'Dos rectángulos sin rotar se solapan en el eje X, pero no en el eje Y. ¿Chocan?', opts: ['No: para chocar deben solaparse en X y en Y a la vez', 'Sí, con un eje basta', 'Depende de cuál es más grande', 'Sí, si uno es más ancho que el otro'], ok: 0, why: 'Piensa en dos ladrillos de la misma columna, uno encima del otro: comparten X y no se tocan. AABB exige los dos ejes.', idea: 'C3' },
      { q: 'Quieres saber si una bola redonda toca un ladrillo rectangular. ¿Qué punto del ladrillo te sirve comparar con el centro de la bola?', opts: ['El centro del ladrillo', 'La esquina superior izquierda del ladrillo', 'El punto del ladrillo más cercano al centro de la bola', 'Cualquier esquina'], ok: 2, why: 'Si el punto más cercano del ladrillo está dentro del círculo, se tocan; si ni ese entra, ningún otro. El centro del ladrillo falla con ladrillos anchos.', idea: 'C4' },
      { q: 'En el control del aeropuerto, todos pasan por el arco y solo a algunos les abren la maleta. En un juego con muchos objetos, ¿qué equivale a pasar por el arco?', opts: ['Dibujar todos los objetos', 'Una prueba barata y aproximada que descarta las parejas que seguro no chocan', 'Borrar los objetos que no chocan', 'Hacer la prueba exacta a todas las parejas'], ok: 1, why: 'Es la broad phase: rápida, aproximada, para todos. La prueba exacta (abrir la maleta) se reserva para los sospechosos. La última opción es justo lo que se quiere evitar.', idea: 'C5' }
    ],
    post: [
      { q: 'La bola está en y = 300 y en el frame siguiente está en y = 310. ¿Hacia dónde se movió en la pantalla de LÖVE?', opts: ['Hacia arriba', 'Hacia abajo', 'Hacia la derecha', 'No se puede saber sin x'], ok: 1, why: 'En LÖVE y crece hacia abajo: pasar de 300 a 310 es bajar. Hacia arriba sería en el plano cartesiano.', idea: 'C1' },
      { q: 'Dibujas <code>love.graphics.rectangle("fill", 100, 100, 50, 50)</code> y <code>love.graphics.circle("fill", 100, 100, 25)</code>. ¿Qué ves?', opts: ['Dos figuras con el mismo centro', 'El círculo queda dentro del cuadrado', 'Las dos figuras empiezan en su esquina', 'El cuadrado empieza en (100, 100) hacia la derecha y abajo; el círculo tiene su centro en (100, 100)'], ok: 3, why: 'rectangle se ubica por la esquina superior izquierda y circle por el centro. El círculo queda montado sobre la esquina del cuadrado, tres cuartos afuera. Es la confusión que corre las colisiones media figura.', idea: 'C1' },
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: 'local a = { x = 0,  y = 0, r = 5 }\nlocal b = { x = 6,  y = 8, r = 5 }\nlocal dx, dy = b.x - a.x, b.y - a.y\nlocal s = a.r + b.r\nprint(dx * dx + dy * dy <= s * s)' },
        opts: ['true, porque 100 ≤ 100: se rozan', 'false, porque 100 es mayor que 10', 'false, porque falta math.sqrt', 'Un error, porque r no existe'], ok: 0, why: 'dx² + dy² = 36 + 64 = 100 y s² = 10² = 100. Con <= el roce cuenta. La segunda opción compara 100 con s sin elevar al cuadrado: mezcla unidades.', idea: 'C2' },
      { q: '¿Por qué en la prueba de círculos se compara <code>dx*dx + dy*dy</code> con <code>suma*suma</code>, en vez de sacar la raíz?', opts: ['Porque Lua no tiene raíz cuadrada', 'Porque con la raíz da un resultado distinto', 'Porque da la misma respuesta y evita una operación costosa que se repite miles de veces', 'Porque así los círculos se ven más grandes'], ok: 2, why: 'Con números positivos, a ≤ b equivale a a² ≤ b². Lua sí tiene <code>math.sqrt</code>; simplemente no hace falta.', idea: 'C2' },
      { q: 'A = { x = 0, y = 40, ancho = 200, alto = 20 } y B = { x = 90, y = 0, ancho = 20, alto = 100 }. Ninguna esquina de uno está dentro del otro. ¿Chocan?', opts: ['No, porque no hay esquinas adentro', 'Sí: se solapan en X (de 90 a 110) y en Y (de 40 a 60)', 'No, porque B es más alto que A', 'Solo si giran'], ok: 1, why: 'Es la cruz. La prueba de esquinas dice que no, pero los intervalos se solapan en los dos ejes y AABB dice que sí. Por eso se programa por ejes.', idea: 'C3' },
      { q: 'En esta función AABB, ¿qué pasa si cambias el <code>and</code> del medio por <code>or</code>?', code: { lang: 'Lua', src: 'return a.x < b.x + b.ancho and b.x < a.x + a.ancho\n   and a.y < b.y + b.alto  and b.y < a.y + a.alto' },
        opts: ['Nada, da lo mismo', 'Ya no detectaría ningún choque', 'Detectaría los choques más rápido', 'Bastaría solaparse en un eje: dos ladrillos de la misma columna «chocarían» sin tocarse'], ok: 3, why: 'Con or basta un solo eje, así que cualquier pareja alineada en X o en Y daría true. Aparecen choques fantasma por toda la pantalla.', idea: 'C3' },
      { q: 'Un círculo con centro (188, 88) y radio 15 está junto a la esquina de un muro que empieza en (200, 100). ¿Qué dice la prueba con clamp?', code: { lang: 'Lua', src: 'local px = limitar(188, 200, 320)  -- 200\nlocal py = limitar(88, 100, 180)   -- 100\n-- dx = -12, dy = -12' },
        opts: ['Chocan, porque la caja del círculo toca el muro', 'Chocan, porque 12 es menor que 15', 'No chocan: 144 + 144 = 288 es mayor que 15² = 225', 'No se puede saber sin el centro del muro'], ok: 2, why: 'El punto más cercano es la esquina (200, 100) y su distancia al cuadrado es 288 > 225. La caja del círculo sí tocaría el muro: sería un falso positivo. La segunda opción mira un solo eje.', idea: 'C4' },
      { q: 'Tu juego tiene 200 objetos y revisa cada pareja una vez con la prueba exacta. Agregas una rejilla y solo comparas objetos de la misma celda. ¿Qué ganas?', opts: ['Nada: las pruebas siguen siendo 19 900', 'Que la mayoría de parejas lejanas ni se miren: las pruebas exactas bajan de 19 900 a unas pocas decenas', 'Que los choques sean más exactos', 'Que ya no haga falta la prueba exacta'], ok: 1, why: '200 × 199 / 2 = 19 900 parejas. La rejilla es una broad phase: descarta sin mirar las parejas de celdas distintas. Pero sigue haciendo falta la prueba exacta para las de la misma celda: compartir celda no es chocar.', idea: 'C5' }
    ]
  };
})();
