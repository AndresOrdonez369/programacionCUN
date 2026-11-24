(function () {
  /* ---------- código de la sesión ---------- */
  const resPseudo = `-- La bola ya se metió en el ladrillo. ¿Por dónde la saco?

solapeX ← cuánto se meten en X   (fin más a la izquierda − inicio más a la derecha)
solapeY ← cuánto se meten en Y
si solapeX ≤ 0 o solapeY ≤ 0: no hay choque

si solapeX < solapeY:          -- entró por un lado
    sacar la bola solapeX píxeles hacia su lado
    vx ← apuntando hacia afuera del ladrillo
si no:                         -- entró por arriba o por abajo
    sacar la bola solapeY píxeles hacia su lado
    vy ← apuntando hacia afuera del ladrillo

-- Se invierte UN solo eje: el de menor penetración.
-- "Hacia afuera" con math.abs: aunque el choque se detecte
-- dos veces, la velocidad no vuelve a voltearse.`;
  const resRun = `local function resolver(bola, l)
    local solapeX = math.min(bola.x + bola.ancho, l.x + l.ancho) - math.max(bola.x, l.x)
    local solapeY = math.min(bola.y + bola.alto, l.y + l.alto) - math.max(bola.y, l.y)
    if solapeX <= 0 or solapeY <= 0 then return "nada" end
    if solapeX < solapeY then                       -- entró por un lado
        if bola.x < l.x then bola.x = bola.x - solapeX; bola.vx = -math.abs(bola.vx)
        else bola.x = bola.x + solapeX; bola.vx = math.abs(bola.vx) end
        return "eje X"
    else                                            -- entró por arriba o abajo
        if bola.y < l.y then bola.y = bola.y - solapeY; bola.vy = -math.abs(bola.vy)
        else bola.y = bola.y + solapeY; bola.vy = math.abs(bola.vy) end
        return "eje Y"
    end
end

local ladrillo = { x = 100, y = 100, ancho = 60, alto = 20 }
local bola = { x = 120, y = 116, ancho = 10, alto = 10, vx = 150, vy = -200 }
print(resolver(bola, ladrillo), bola.y, bola.vy)   --> eje Y  120  200
local otra = { x = 94, y = 104, ancho = 10, alto = 10, vx = 150, vy = -200 }
print(resolver(otra, ladrillo), otra.x, otra.vx)   --> eje X  90  -150`;
  const resLove = `local colision = require("colision")    -- el módulo de la sesión 6

function Bola:chocarConLadrillos(ladrillos)
    for _, l in ipairs(ladrillos) do
        if l:estaVivo() and colision.aabb(self, l) then
            colision.resolver(self, l)       -- sacarla y rebotar en un eje
            local seRompio = l:onHit()       -- el ladrillo decide qué le pasa
            if seRompio then
                self.juego:sumar(l.puntos)
                self.juego.efectos:romper(l)
            end
            return true                      -- un ladrillo por paso basta
        end
    end
    return false
end`;

  const palPseudo = `-- ¿Dónde pegó la bola en la paleta?
t ← (centro de la bola − centro de la paleta) / (mitad del ancho)
--  t = −1 borde izquierdo · t = 0 centro · t = +1 borde derecho
t ← limitar(t, −1, 1)

-- El punto de impacto decide el ángulo, medido desde la vertical
ángulo ← t × ÁNGULO_MÁXIMO        (por ejemplo, 60°)

-- La rapidez se conserva; cambia solo la dirección
vx ←  rapidez × sin(ángulo)
vy ← −rapidez × cos(ángulo)       -- negativa: siempre hacia arriba

-- Y sacar la bola de la paleta para que no choque dos veces
bola.y ← paleta.y − bola.alto`;
  const palRun = `local ANGULO_MAX = math.rad(60)

local function rebotePaleta(bola, p)
    local centroBola = bola.x + bola.ancho / 2
    local centroPaleta = p.x + p.ancho / 2
    -- t: -1 en el borde izquierdo, 0 en el centro, +1 en el derecho
    local t = (centroBola - centroPaleta) / (p.ancho / 2)
    t = math.max(-1, math.min(1, t))
    local rapidez = math.sqrt(bola.vx ^ 2 + bola.vy ^ 2)
    local angulo = t * ANGULO_MAX              -- medido desde la vertical
    bola.vx = rapidez * math.sin(angulo)
    bola.vy = -rapidez * math.cos(angulo)      -- siempre hacia arriba
    bola.y = p.y - bola.alto                   -- sacarla de la paleta
    return math.floor(math.deg(angulo) + 0.5)
end

local paleta = { x = 300, y = 550, ancho = 100, alto = 16 }
for _, x in ipairs({ 295, 320, 345, 370, 395 }) do
    local bola = { x = x, y = 545, ancho = 10, alto = 10, vx = 0, vy = 300 }
    print("impacto en x = " .. x, "sale a " .. rebotePaleta(bola, paleta) .. " grados")
end`;

  const subPseudo = `-- Una bola rápida puede saltarse un ladrillo entre dos frames.
-- Solución: partir el movimiento del frame en pasos pequeños.

avance ← rapidez × dt                     -- cuánto se mueve en este frame
pasos ← redondear hacia arriba(avance / (media bola)), mínimo 1
h ← dt / pasos

repetir pasos veces:
    mover la bola con h en vez de dt
    revisar bordes, paleta y ladrillos

-- Dos seguros más:
--   tope de rapidez: la bola nunca pasa de VEL_MAX
--   tope de dt: si el juego se congela un segundo, no saltar
--   un segundo entero de golpe`;
  const subLove = `local VEL_MAX = 900                    -- px/s: tope de rapidez

function Bola:mover(dt)
    -- pasos de máximo media bola: así no puede saltarse nada
    local rapidez = math.sqrt(self.vx ^ 2 + self.vy ^ 2)
    local pasos = math.max(1, math.ceil(rapidez * dt / (self.ancho / 2)))
    local h = dt / pasos
    for _ = 1, pasos do
        self.x = self.x + self.vx * h
        self.y = self.y + self.vy * h
        self:chocarConBordes()
        self:chocarConPaleta(self.juego.paleta)
        self:chocarConLadrillos(self.juego.ladrillos)
    end
end

function Bola:acelerar(factor)
    local rapidez = math.sqrt(self.vx ^ 2 + self.vy ^ 2)
    local nueva = math.min(rapidez * factor, VEL_MAX)
    self.vx, self.vy = self.vx * nueva / rapidez, self.vy * nueva / rapidez
end`;
  const pegadaLove = `-- La bola pegada a la paleta: el bug más común del ACA 2.
-- Pasa cuando el choque se detecta en dos frames seguidos.

-- Así NO: si en el frame siguiente sigue tocando,
-- vy vuelve a ser positiva y la bola se hunde.
if colision.aabb(bola, paleta) then
    bola.vy = -bola.vy
end

-- Así SÍ: tres seguros
if bola.vy > 0 and colision.aabb(bola, paleta) then   -- 1. solo si baja
    rebotePaleta(bola, paleta)                        -- 2. vy siempre < 0
    bola.y = paleta.y - bola.alto                     -- 3. sacarla
end`;

  const ladPseudo = `CLASE Ladrillo
    x, y, ancho, alto
    _vida                     -- privado por convención: guion bajo
    onHit():  _vida ← _vida − 1 ;  devuelve si se rompió
    cuentaParaGanar(): sí

CLASE Irrompible  HEREDA DE  Ladrillo
    onHit():  no le pasa nada ; devuelve no      -- sobrescribe
    cuentaParaGanar(): no

EL BUCLE DE COLISIONES no pregunta el tipo:
    si la bola toca el ladrillo l:
        resolver el rebote
        si l.onHit() dice que se rompió: sumar puntos

EL NIVEL es una tabla de datos: cada letra es un tipo
    "1" normal · "2" duro · "X" irrompible · "." vacío`;
  const ladLua = `-- Ladrillo.lua
local Ladrillo = {}
Ladrillo.__index = Ladrillo

function Ladrillo.new(x, y, vida)
    local self = setmetatable({}, Ladrillo)
    self.x, self.y, self.ancho, self.alto = x, y, 64, 24
    self._vida = vida or 1               -- privado por convención
    self.puntos = 10 * self._vida
    return self
end

-- Polimorfismo: cada tipo de ladrillo responde a onHit() a su manera
function Ladrillo:onHit()
    self._vida = self._vida - 1
    return self._vida <= 0               -- true: se rompió
end

function Ladrillo:estaVivo() return self._vida > 0 end
function Ladrillo:cuentaParaGanar() return true end

return Ladrillo`;
  const irrLua = `-- Irrompible.lua
local Ladrillo = require("Ladrillo")

local Irrompible = setmetatable({}, { __index = Ladrillo })   -- hereda
Irrompible.__index = Irrompible

function Irrompible.new(x, y)
    local self = Ladrillo.new(x, y, 1)   -- reusa el constructor del padre
    return setmetatable(self, Irrompible)
end

function Irrompible:onHit()              -- sobrescribe: nunca se rompe
    return false
end

function Irrompible:cuentaParaGanar()    -- no hace falta romperlo
    return false
end

return Irrompible`;
  const nivRun = `-- Un nivel es una tabla de texto. Diseñar un nivel = editar datos.
local niveles = {
    { nombre = "Primer muro", filas = { "1111111111", "1222222221", "1111111111" } },
    { nombre = "Fortaleza",   filas = { "X22222222X", "X21111112X", "X........X" } },
}

local ANCHO, ALTO, MARGEN = 64, 24, 80
local function construir(nivel)
    local ladrillos = {}
    for f, fila in ipairs(nivel.filas) do
        for c = 1, #fila do
            local letra = fila:sub(c, c)
            if letra ~= "." then
                table.insert(ladrillos, { tipo = letra,
                    x = MARGEN + (c - 1) * ANCHO, y = 60 + (f - 1) * ALTO })
            end
        end
    end
    return ladrillos
end

for i, nivel in ipairs(niveles) do print(i, nivel.nombre, #construir(nivel) .. " ladrillos") end`;

  const fsmPseudo = `ESTADOS: Title, Serve, Play, Pause, Victory, GameOver
Cada estado es un objeto con las mismas funciones:
    entrar()          -- al llegar (opcional)
    update(dt)        -- qué se mueve en este estado
    draw()            -- qué se ve
    tecla(k)          -- qué teclas escucha

TRANSICIONES (por evento):
    Title   --Enter-->          Serve
    Serve   --Enter-->          Play
    Play    --P-->              Pause      Pause --P--> Play
    Play    --bola cae-->       Serve, o GameOver si no quedan vidas
    Play    --nivel limpio-->   Serve con el nivel siguiente, o Victory

love.update, love.draw y love.keypressed solo le pasan
el trabajo al estado actual.`;
  const fsmLua = `local juego = { estado = nil, vidas = 3, nivel = 1 }
local estados = {}

function juego.cambiar(nombre)
    juego.estado = estados[nombre]
    if juego.estado.entrar then juego.estado.entrar() end
end

estados.title = {
    tecla = function(k) if k == "return" then juego.cambiar("serve") end end,
    update = function(dt) end,
    draw = function() love.graphics.printf("BREAKOUT · Enter", 0, 280, 800, "center") end,
}
estados.pause = {
    tecla = function(k) if k == "p" then juego.cambiar("play") end end,
    update = function(dt) end,                    -- nada se mueve
    draw = function() dibujarMundo(); love.graphics.print("PAUSA", 370, 280) end,
}
-- serve, play, victory y gameover siguen el mismo molde

function love.update(dt) juego.estado.update(dt) end
function love.draw() juego.estado.draw() end
function love.keypressed(k) juego.estado.tecla(k) end`;
  const feelLua = `local efectos = { temblor = 0, congelado = 0, particulas = {} }
local golpe = love.audio.newSource("assets/golpe.wav", "static")

function efectos:romper(l)
    self.temblor = 6                          -- screen shake: 6 px
    self.congelado = 0.05                     -- hit-stop: 50 ms quieto
    golpe:stop(); golpe:play()                -- suena aunque ya estuviera sonando
    for _ = 1, 12 do                          -- partículas
        table.insert(self.particulas, { x = l.x, y = l.y, vida = 0.5,
            vx = love.math.random(-150, 150), vy = love.math.random(-220, 0) })
    end
end

function love.update(dt)
    efectos.temblor = math.max(0, efectos.temblor - 30 * dt)
    if efectos.congelado > 0 then
        efectos.congelado = efectos.congelado - dt
        return                                -- el mundo se detiene un instante
    end
    juego.estado.update(dt)
end`;
  const feelDraw = `function love.draw()
    local t = efectos.temblor
    love.graphics.push()                       -- guardar la cámara
    love.graphics.translate((love.math.random() * 2 - 1) * t,
                            (love.math.random() * 2 - 1) * t)
    juego.estado.draw()                        -- el mundo tiembla
    for _, p in ipairs(efectos.particulas) do
        love.graphics.setColor(1, 0.8, 0.3, p.vida * 2)
        love.graphics.rectangle("fill", p.x, p.y, 4, 4)
    end
    love.graphics.setColor(1, 1, 1, 1)
    love.graphics.pop()                        -- recuperar la cámara
    dibujarHUD()                               -- vidas y puntos: no tiemblan
end`;

  /* ---------- versiones cortas para slides ---------- */
  const resCorto = `local function resolver(bola, l)
  local sx = math.min(bola.x + bola.ancho, l.x + l.ancho)
           - math.max(bola.x, l.x)
  local sy = math.min(bola.y + bola.alto, l.y + l.alto)
           - math.max(bola.y, l.y)
  if sx <= 0 or sy <= 0 then return end
  if sx < sy then                    -- entró por un lado
    if bola.x < l.x then
      bola.x = bola.x - sx; bola.vx = -math.abs(bola.vx)
    else
      bola.x = bola.x + sx; bola.vx = math.abs(bola.vx)
    end
  else                               -- por arriba o abajo
    if bola.y < l.y then
      bola.y = bola.y - sy; bola.vy = -math.abs(bola.vy)
    else
      bola.y = bola.y + sy; bola.vy = math.abs(bola.vy)
    end
  end
end`;
  const palCorto = `local ANGULO_MAX = math.rad(60)

local function rebotePaleta(bola, p)
    local cb = bola.x + bola.ancho / 2
    local cp = p.x + p.ancho / 2
    local t = (cb - cp) / (p.ancho / 2)       -- de -1 a +1
    t = math.max(-1, math.min(1, t))
    local rapidez = math.sqrt(bola.vx ^ 2 + bola.vy ^ 2)
    local angulo = t * ANGULO_MAX
    bola.vx = rapidez * math.sin(angulo)
    bola.vy = -rapidez * math.cos(angulo)     -- siempre sube
    bola.y = p.y - bola.alto                  -- sacarla
end`;
  const subCorto = `function Bola:mover(dt)
    local rapidez = math.sqrt(self.vx ^ 2 + self.vy ^ 2)
    local pasos = math.max(1,
        math.ceil(rapidez * dt / (self.ancho / 2)))
    local h = dt / pasos
    for _ = 1, pasos do
        self.x = self.x + self.vx * h
        self.y = self.y + self.vy * h
        self:chocarConBordes()
        self:chocarConPaleta(self.juego.paleta)
        self:chocarConLadrillos(self.juego.ladrillos)
    end
end`;
  const ladCorto = `local Ladrillo = {}
Ladrillo.__index = Ladrillo

function Ladrillo.new(x, y, vida)
    local self = setmetatable({}, Ladrillo)
    self.x, self.y, self.ancho, self.alto = x, y, 64, 24
    self._vida = vida or 1
    return self
end
function Ladrillo:onHit()
    self._vida = self._vida - 1
    return self._vida <= 0           -- ¿se rompió?
end

local Irrompible = setmetatable({}, { __index = Ladrillo })
Irrompible.__index = Irrompible
function Irrompible.new(x, y)
    return setmetatable(Ladrillo.new(x, y), Irrompible)
end
function Irrompible:onHit() return false end`;
  const nivCorto = `-- data/niveles.lua
return {
  { nombre = "Primer muro",
    filas = { "1111111111",
              "1222222221",
              "1111111111" } },
  { nombre = "Fortaleza",
    filas = { "X22222222X",
              "X21111112X",
              "X........X" } },
}`;
  const fabricaCorto = `local FABRICA = {
  ["1"] = function(x, y) return Ladrillo.new(x, y, 1) end,
  ["2"] = function(x, y) return Ladrillo.new(x, y, 2) end,
  ["X"] = function(x, y) return Irrompible.new(x, y) end,
}

for f, fila in ipairs(nivel.filas) do
  for c = 1, #fila do
    local crear = FABRICA[fila:sub(c, c)]
    if crear then
      table.insert(ladrillos, crear(80 + (c - 1) * 64,
                                    60 + (f - 1) * 24))
    end
  end
end`;
  const tipoMal = `-- en el bucle de colisiones
if l.tipo == "normal" then
  l.vivo = false
  puntos = puntos + 10
elseif l.tipo == "duro" then
  l.vida = l.vida - 1
  if l.vida == 0 then
    l.vivo = false
    puntos = puntos + 20
  end
elseif l.tipo == "irrompible" then
  -- nada
end
-- ¿explosivo? otro elseif aquí
-- ...y en el dibujo, y en el sonido`;
  const tipoBien = `-- en el bucle de colisiones
if l:onHit() then
  puntos = puntos + l.puntos
end

-- ¿explosivo? un archivo nuevo:
-- Explosivo.lua hereda de Ladrillo
-- y sobrescribe onHit().
-- Este bucle no se toca.`;
  const fsmCorto = `local estados, actual = {}, nil

local function cambiar(nombre)
    actual = estados[nombre]
    if actual.entrar then actual.entrar() end
end

estados.pause = {
    tecla  = function(k) if k == "p" then cambiar("play") end end,
    update = function(dt) end,           -- nada se mueve
    draw   = function() dibujarMundo(); dibujarAviso("PAUSA") end,
}

function love.update(dt)    actual.update(dt) end
function love.draw()        actual.draw()     end
function love.keypressed(k) actual.tecla(k)   end`;
  const banderasMal = `local jugando, pausado = false, false
local ganaste, perdiste = false, false

function love.update(dt)
  if jugando and not pausado
     and not ganaste and not perdiste then
    moverBola(dt)
  end
end
-- ¿se puede estar pausado y perdido
-- a la vez? Con 4 bools hay 16
-- combinaciones; válidas, solo 6.`;
  const estadosBien = `function love.update(dt)
  actual.update(dt)
end

-- Pause.update no mueve nada.
-- Play.update mueve la bola.
-- Hay UN estado actual: es
-- imposible estar en Pause y en
-- GameOver al mismo tiempo.`;

  const svgPaleta = `<svg viewBox="0 0 640 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Una paleta dividida en zonas. Desde cada zona sale una flecha con distinto ángulo: vertical en el centro, más inclinada hacia los bordes.">
<rect width="640" height="340" fill="#1B1A2E"/>
<rect x="120" y="270" width="80" height="24" fill="#FF5D3A"/><rect x="200" y="270" width="80" height="24" fill="#FFC83D"/>
<rect x="280" y="270" width="80" height="24" fill="#3BC4A3"/><rect x="360" y="270" width="80" height="24" fill="#FFC83D"/>
<rect x="440" y="270" width="80" height="24" fill="#FF5D3A"/>
<line x1="160" y1="262" x2="74" y2="112" stroke="#FF5D3A" stroke-width="3"/><polygon points="66,98 84,108 68,118" fill="#FF5D3A"/>
<line x1="240" y1="262" x2="200" y2="102" stroke="#FFC83D" stroke-width="3"/><polygon points="196,86 210,104 192,106" fill="#FFC83D"/>
<line x1="320" y1="262" x2="320" y2="96" stroke="#3BC4A3" stroke-width="3"/><polygon points="320,80 330,98 310,98" fill="#3BC4A3"/>
<line x1="400" y1="262" x2="440" y2="102" stroke="#FFC83D" stroke-width="3"/><polygon points="444,86 448,106 430,104" fill="#FFC83D"/>
<line x1="480" y1="262" x2="566" y2="112" stroke="#FF5D3A" stroke-width="3"/><polygon points="574,98 572,118 556,108" fill="#FF5D3A"/>
<text x="160" y="320" fill="#F4F1E8" font-size="18" text-anchor="middle">−60°</text><text x="240" y="320" fill="#F4F1E8" font-size="18" text-anchor="middle">−30°</text>
<text x="320" y="320" fill="#F4F1E8" font-size="18" text-anchor="middle">0°</text><text x="400" y="320" fill="#F4F1E8" font-size="18" text-anchor="middle">+30°</text>
<text x="480" y="320" fill="#F4F1E8" font-size="18" text-anchor="middle">+60°</text>
<text x="320" y="40" fill="#F4F1E8" font-size="20" text-anchor="middle" font-weight="700">donde pega decide hacia dónde sale</text>
</svg>`;

  window.SESION = {
    n: 7,
    titulo: 'Breakout e integración',
    objetivos: [
      'Resolver una colisión AABB sacando la bola por el eje de menor penetración e invirtiendo solo ese eje.',
      'Programar el rebote en la paleta según el punto de impacto, con un ángulo máximo.',
      'Evitar el túnel y la bola pegada con sub-pasos, topes de rapidez y velocidades que siempre apuntan hacia afuera.',
      'Construir niveles a partir de tablas de datos y ladrillos especiales con polimorfismo en <code>onHit()</code>.',
      'Organizar el juego con una máquina de estados (Title, Serve, Play, Pause, Victory, GameOver) y agregar game feel sin tocar las reglas.'
    ],
    analogia: 'Armar una banda: el baterista, la bajista y el guitarrista saben tocar solos, pero eso no es una canción. Hace falta una partitura que todos lean, alguien que diga cuándo entra cada uno y que todos lleven el mismo tiempo. En tu Breakout ya tienes músicos (la bola, la paleta, los ladrillos); hoy escribimos la partitura (los datos del nivel), ponemos al director (la máquina de estados) y afinamos el sonido (el game feel).',
    ideas: [
      ['C1', 'Detectar no es resolver: después de saber que la bola se metió, hay que sacarla por el eje de menor penetración e invertir solo la velocidad de ese eje.'],
      ['C2', 'El punto de impacto en la paleta decide el ángulo de salida: el jugador apunta. La rapidez se conserva y un ángulo máximo evita salidas casi horizontales.'],
      ['C3', 'Una colisión robusta no se salta ni se pega: sub-pasos para que la bola no atraviese (túnel), y velocidades que siempre apuntan hacia afuera para que no vibre dentro de nada.'],
      ['C4', 'El contenido es datos y la variedad es polimorfismo: los niveles son tablas de texto y cada tipo de ladrillo responde a <code>onHit()</code> a su manera.'],
      ['C5', 'Una máquina de estados ordena el juego entero (Title, Serve, Play, Pause, Victory, GameOver) y el game feel (shake, partículas, sonido, hit-stop) cambia la sensación sin cambiar las reglas.']
    ],
    agenda: [
      ['0:00', 'Bienvenida, quiz preclase y estado de los núcleos'],
      ['0:10', 'Detectar contra resolver: menor penetración'],
      ['0:27', 'La paleta decide el ángulo'],
      ['0:40', 'Túnel y bola pegada: colisiones robustas'],
      ['0:55', 'Niveles como datos y ladrillos con onHit()'],
      ['1:10', 'La máquina de estados del Breakout'],
      ['1:20', 'Game feel: juega y compara'],
      ['1:30', 'Clínica de colisiones con tu propio núcleo'],
      ['1:45', 'Entrega del ACA 2: rúbrica y documento'],
      ['1:52', 'Quiz postclase y cierre']
    ],
    conceptos: [
      { t: 'Resolver una colisión', d: 'Lo que se hace después de detectarla: corregir la posición para que los objetos dejen de estar encimados y cambiar la velocidad para que se separen.', ej: 'La bola se metió 4 px en el ladrillo: se mueve 4 px hacia afuera y su vy cambia de signo.' },
      { t: 'Penetración (solape)', d: 'Cuánto se mete un objeto en otro en cada eje. Es el ancho y el alto de la zona donde los dos rectángulos se cruzan.', ej: 'solapeX = min(fin de A, fin de B) − max(inicio de A, inicio de B). Si sale negativo, no hay choque en ese eje.' },
      { t: 'Eje de menor penetración', d: 'El eje en el que el solape es más pequeño. Casi siempre es por donde entró la bola, porque en un solo frame avanzó poco en esa dirección.', ej: 'Se metió 3 px en X y 12 px en Y: entró por un lado. Se saca en X y se invierte vx.' },
      { t: 'Ángulo por punto de impacto', d: 'La dirección de salida depende de dónde pegó la bola en la paleta: en el centro sale vertical; hacia los bordes, más inclinada. La rapidez se conserva.', ej: 'Con t = (centroBola − centroPaleta) / (ancho / 2) y un ángulo máximo de 60°, pegar en t = 0,5 da 30° hacia la derecha.' },
      { t: 'Túnel (tunneling)', d: 'Cuando un objeto rápido atraviesa otro delgado sin que la colisión se detecte, porque en un frame está antes y en el siguiente ya pasó.', ej: 'A 1800 px/s y 60 fps la bola avanza 30 px por frame: puede saltarse un ladrillo de 20 px.' },
      { t: 'Sub-pasos', d: 'Partir el movimiento de un frame en varios pasos pequeños y revisar colisiones en cada uno. Con pasos de máximo media bola, no hay túnel.', ej: 'Si la bola avanza 30 px y mide 12, se hacen 5 pasos de 6 px.' },
      { t: 'Nivel dirigido por datos', d: 'El nivel no está escrito en el código: es una tabla (por ejemplo, filas de texto) que el código lee para construir los ladrillos.', ej: '<code>"X22222222X"</code>: dos irrompibles en los extremos y ocho duros. Un nivel nuevo es una tabla nueva, no código nuevo.' },
      { t: 'Polimorfismo con onHit()', d: 'Todos los ladrillos tienen el método <code>onHit()</code>, pero cada tipo lo implementa distinto. El bucle de colisiones lo llama sin preguntar el tipo.', ej: 'Ladrillo resta vida; Irrompible no hace nada; un Explosivo podría romper a sus vecinos. El bucle no cambia.' },
      { t: 'Game feel', d: 'La sensación de control y de impacto que da un juego. Se logra con respuestas pequeñas a cada acción: temblor de pantalla, partículas, sonido y pausas de golpe (hit-stop).', ej: 'Romper un ladrillo: 6 px de screen shake, 12 partículas, un sonido corto y 50 ms de juego congelado.' }
    ],
    errores: [
      { mito: 'Si detecto que la bola tocó el ladrillo, basta con invertir vy.', real: 'Si no sacas la bola, en el frame siguiente sigue adentro, se detecta otra vez y vy vuelve a voltearse: la bola vibra o atraviesa el ladrillo. Detectar, sacar y después rebotar.' },
      { mito: 'Invertir vx y vy a la vez es más seguro: rebota sí o sí.', real: 'La bola vuelve exactamente por donde vino, como contra un espejo inclinado. En un Breakout se ve errático. Se invierte solo el eje de menor penetración.' },
      { mito: '<code>bola.vy = -bola.vy</code> siempre funciona.', real: 'Si el choque se detecta dos frames seguidos, se voltea dos veces y queda igual. Escribe la dirección que quieres: <code>bola.vy = -math.abs(bola.vy)</code> para que suba, pase lo que pase.' },
      { mito: 'Si la colisión está bien programada, una bola rápida siempre choca.', real: 'AABB solo mira dónde está la bola en cada frame. Si salta más que el grosor del ladrillo entre dos frames, nunca se solapan. Sub-pasos o tope de rapidez.' },
      { mito: 'Para un ladrillo duro basta con un <code>if l.tipo == "duro"</code> en el bucle de colisiones.', real: 'Funciona con dos tipos y se vuelve un nudo con cinco: cada tipo nuevo obliga a editar el bucle, el dibujo y el sonido. Con <code>onHit()</code> polimórfico, un tipo nuevo es un archivo nuevo. La rúbrica del ACA 2 lo pide así.' },
      { mito: 'Gano cuando no quedan ladrillos vivos.', real: 'Si hay irrompibles, nunca se cumple. Gana cuando no quedan ladrillos que <b>cuenten para ganar</b>: por eso <code>cuentaParaGanar()</code> también es polimórfico.' }
    ],
    codigoIntro: 'Cinco piezas que convierten tu núcleo en un juego completo. Las de «pruébalo» corren aquí mismo con print; las de LÖVE van en tu proyecto, cada clase en su archivo.',
    codigo: [
      { titulo: 'Resolver por menor penetración', desc: 'Mide cuánto se metió la bola en cada eje, sácala por el menor e invierte solo esa velocidad, apuntando hacia afuera con math.abs.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: resPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: resRun, run: true },
          { lang: 'Lua', label: 'Lua (LÖVE: en la Bola)', src: resLove }
        ] },
      { titulo: 'Rebote según el punto de impacto', desc: 'La trigonometría de la sesión 2 en acción: el ángulo sale de dónde pegó la bola y la rapidez no cambia.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: palPseudo },
          { lang: 'Lua', label: 'Lua (pruébalo)', src: palRun, run: true }
        ] },
      { titulo: 'Sin túnel y sin bola pegada', desc: 'Sub-pasos para que la bola no se salte nada y tres seguros para que no se quede pegada a la paleta.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: subPseudo },
          { lang: 'Lua', label: 'Lua (LÖVE: sub-pasos)', src: subLove },
          { lang: 'Lua', label: 'Lua (LÖVE: bola pegada)', src: pegadaLove }
        ] },
      { titulo: 'Ladrillos polimórficos y niveles como datos', desc: 'El patrón .new() y __index de la sesión 5, con herencia. Y el nivel como una tabla de texto que se recorre letra por letra.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: ladPseudo },
          { lang: 'Lua', label: 'Lua (Ladrillo.lua)', src: ladLua },
          { lang: 'Lua', label: 'Lua (Irrompible.lua)', src: irrLua },
          { lang: 'Lua', label: 'Lua (pruébalo: niveles)', src: nivRun, run: true }
        ] },
      { titulo: 'Máquina de estados y game feel', desc: 'Cada estado es una tabla con las mismas funciones; LÖVE le pasa el trabajo al estado actual. El game feel vive aparte y no toca las reglas.',
        tabs: [
          { lang: 'Pseudo', label: 'Pseudocódigo', src: fsmPseudo },
          { lang: 'Lua', label: 'Lua (estados)', src: fsmLua },
          { lang: 'Lua', label: 'Lua (game feel: update)', src: feelLua },
          { lang: 'Lua', label: 'Lua (game feel: draw)', src: feelDraw }
        ] }
    ],
    practica: {
      t: 'Clínica de colisiones con tu propio núcleo',
      intro: 'En parejas, con el núcleo del ACA 2 que trajeron. Uno comparte pantalla y juega; el otro lee la lista y anota. A los 7 minutos cambian.',
      pasos: [
        '<b>Bordes:</b> lanza la bola contra las tres paredes y las esquinas. ¿Se sale alguna vez? Revisa que la saques y uses <code>math.abs</code>.',
        '<b>Paleta:</b> pega con el borde izquierdo, el centro y el borde derecho. ¿Sale con ángulos distintos? ¿Se queda pegada si la paleta se mueve hacia la bola?',
        '<b>Ladrillos:</b> rompe uno por abajo y otro por el lado. ¿Rebota en el eje correcto? Imprime solapeX y solapeY con <code>print</code> en el momento del choque.',
        '<b>Túnel:</b> multiplica la rapidez de la bola por 4. ¿Atraviesa algo? Agrega sub-pasos y repite.',
        '<b>Datos:</b> cambia una letra de la tabla del nivel. ¿Cambió el juego sin tocar otro código?'
      ],
      entrega: 'Una lista de los bugs que encontraron y cuáles resolvieron, en el foro de la sesión. Esa lista es material para la reflexión del documento técnico.'
    },
    tarea: [
      'Termina y entrega el ACA 2 en C Digital: el proyecto LÖVE (repositorio o ZIP, una clase por archivo) y el PDF técnico de máximo 6 páginas con el diagrama final y su diferencia con el ACA 1.',
      'Antes de entregar: abre el proyecto en una carpeta limpia y juega de principio a fin. Debe poder ganarse y perderse sin errores.',
      'Prepara una demo de 5 minutos para la sesión 8: qué hace tu juego, una decisión técnica que defiendas y una que cambiarías.',
      'Opcional: graba un video de 30 a 60 segundos del juego; suma en documentación y te sirve para el portafolio.'
    ],
    lecturas: [
      'Swink, S. <i>Game Feel: A Game Designer\'s Guide to Virtual Sensation</i>. Morgan Kaufmann. El libro de referencia sobre la sensación de control.',
      'Jonasson, M. y Purho, P. <i>Juice it or lose it</i>. Charla, GDC Europe 2012. Un Breakout que pasa de soso a jugoso, paso a paso.',
      'Nijman, J. W. <i>The art of screenshake</i>. Charla de Vlambeer, 2013. Muchos trucos de game feel en pocos minutos.',
      'Nystrom, R. <i>Game Programming Patterns</i>, capítulo «State». Gratis en línea: la máquina de estados con objetos.',
      'Fiedler, G. <i>Fix Your Timestep!</i> Gaffer on Games. Por qué dt variable trae problemas y cómo partir el paso.'
    ],
    mapa: {
      lead: 'De detectar a un juego que se siente bien: cada pieza se apoya en la anterior y todas terminan en el ACA 2.',
      nodos: [
        ['aabb', 'AABB detecta', 'sesión 6', 'idea', 'Ya sabemos si la bola se metió en algo. Falta qué hacer después.'],
        ['resolver', 'Resolver', 'menor penetración', 'codigo', 'Sacar la bola por el eje de menor solape e invertir solo esa velocidad.'],
        ['paleta', 'Ángulo de paleta', 'el jugador apunta', 'codigo', 'El punto de impacto decide la dirección de salida.'],
        ['tunel', 'Túnel y bola pegada', 'colisiones robustas', 'riesgo', 'Sub-pasos, topes de rapidez y velocidades que apuntan hacia afuera.'],
        ['datos', 'Niveles como datos', 'tablas de texto', 'patron', 'El nivel es una tabla que el código recorre para crear ladrillos.'],
        ['poli', 'onHit() polimórfico', 'ladrillos especiales', 'patron', 'Cada tipo responde a su manera; el bucle no pregunta el tipo.'],
        ['fsm', 'Estados del juego', 'Title a GameOver', 'patron', 'Un estado actual y transiciones por evento.'],
        ['feel', 'Game feel', 'shake, partículas, hit-stop', 'idea', 'Cambia la sensación, no las reglas.'],
        ['aca', 'Entrega ACA 2', 'Breakout jugable', 'practica', 'Proyecto LÖVE más documento técnico.']
      ],
      cables: [
        ['aabb', 'resolver', 'llamada'],
        ['resolver', 'paleta', 'llamada'],
        ['resolver', 'tunel', 'evento'],
        ['datos', 'poli', 'datos'],
        ['poli', 'fsm', 'llamada'],
        ['tunel', 'fsm', 'llamada'],
        ['paleta', 'feel', 'evento'],
        ['fsm', 'feel', 'evento'],
        ['feel', 'aca', 'datos'],
        ['fsm', 'aca', 'datos']
      ]
    },
    slides: [
      { kind: 'portada', title: 'Breakout e integración',
        lead: 'Sesión 7 · Programación de Videojuegos',
        full: [
          { ul: ['De piezas sueltas a un juego que se siente bien.', 'Una banda, un espejo y una pelota demasiado rápida.', 'Hoy se entrega el <b>ACA 2</b>: al final, la rúbrica.'] },
          { pie: 'Flecha derecha: avanza paso a paso · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas del docente' }
        ],
        nota: '4 minutos. Quiz preclase abierto. Pregunta rápida en el chat: del 1 al 5, ¿qué tan jugable está su núcleo? Y ¿cuál es el bug que más los tiene aburridos? Anota los bugs que se repiten (suelen ser bola pegada y rebote en el eje equivocado): la clase los va a resolver en orden.' },

      { kind: 'analogia', title: 'Armar una banda',
        lead: 'Cada músico sabe tocar solo. Lo difícil es que suenen juntos y a tiempo.',
        izq: 54,
        left: [
          { mapa: [['Cada músico', 'Cada clase<small>Bola, Paleta, Ladrillo</small>'], ['La partitura', 'Los datos del nivel<small>tablas de texto</small>'], ['Quien dice cuándo entra cada uno', 'La máquina de estados'], ['El sonido en vivo', 'El game feel<small>shake, partículas, sonido</small>']], de: 'En la banda', a: 'En tu Breakout', pasos: true }
        ],
        right: [
          { clave: 'Un juego no es la suma de sus clases: es cómo se coordinan, en qué orden y a qué ritmo.' },
          { pie: 'Y el metrónomo que todos siguen ya lo conoces: dt.', paso: true }
        ],
        nota: '3 minutos. Pregunta: ¿qué pasa si el baterista va más rápido que los demás? Respuesta esperada: se desarma la canción. En el juego, si la bola se mueve sin dt y la paleta con dt, pasa lo mismo. Hoy recorremos la banda pieza por pieza: primero que la bola rebote bien, después el orden.' },

      { kind: 'reto', title: 'Predice: la bola entra por el costado',
        lead: 'La bola sube en diagonal y golpea el lado izquierdo de un ladrillo. Tu código invierte vy.',
        izq: 50,
        left: [
          { check: { q: '¿Qué ve el jugador?', opts: ['Un rebote normal hacia la izquierda', 'La bola rebota hacia abajo como si hubiera pegado en la base, y a veces queda dentro del ladrillo', 'La bola se detiene', 'El ladrillo se mueve'], ok: 1, why: 'Pegó en un lado: debía invertirse vx. Al invertir vy la bola baja sin cambiar de dirección horizontal, sigue metida en el ladrillo y en el frame siguiente puede volver a chocar. Hace falta saber por qué eje entró.' } }
        ],
        right: [
          { panel: ['Detectar te dice <b>que</b> chocaron. No te dice <b>por dónde</b>.'], h: 'La pregunta de hoy' }
        ],
        nota: '3 minutos. Que respondan antes de revelar. Respuesta esperada: B. Pregunta quién ha visto la bola «atravesar» una fila de ladrillos de una vez: casi siempre es este bug. La siguiente slide les da la regla.' },

      { kind: 'idea', title: 'Detectar no es resolver',
        lead: 'Tres pasos, siempre en este orden.',
        izq: 50,
        left: [
          { ol: ['<b>Detectar:</b> AABB dice que se solapan.', '<b>Sacar:</b> mover la bola fuera, por el eje de menor solape.', '<b>Rebotar:</b> invertir solo la velocidad de ese eje.'], pasos: true }
        ],
        right: [
          { clave: 'El eje de menor penetración casi siempre es por donde entró la bola.', paso: true },
          { pie: 'En un frame la bola avanza poco. Si se metió 3 px en X y 12 px en Y, los 3 px son lo que recorrió de lado: entró por el costado.', paso: true }
        ],
        nota: '4 minutos. Dibuja en el tablero una bola que entra por la base de un ladrillo: el solape en Y es pequeño y el de X es todo el ancho de la bola. Pregunta: ¿y si entra justo por la esquina? Respuesta esperada: los dos solapes son parecidos y cualquiera sirve; lo importante es elegir uno. La consigna del ACA 2 menciona otra técnica válida: usar la posición anterior de la bola.' },

      { kind: 'demo', title: 'Mete la bola en el ladrillo',
        lead: 'Arrastra la bola. Mira los dos solapes y por dónde sale.',
        top: true,
        full: [{ fig: 'penetracion' }],
        nota: '6 minutos. Recorre los tres botones: por abajo (sale en Y), por el lado (sale en X) y la esquina (casi empate). Luego cambia a «Invertir ambos»: la bola vuelve por donde vino. Pregunta: ¿por qué el fantasma punteado importa tanto como la flecha? Respuesta esperada: si no la sacas, en el frame siguiente sigue adentro y el choque se repite.' },

      { kind: 'codigo', title: 'resolver en Lua',
        izq: 30,
        left: [
          { big: 'Medir, comparar, sacar e invertir un solo eje.' },
          { pie: 'La versión de la página imprime el eje elegido para dos casos. Úsala para probar los tuyos.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua', src: resCorto }], marca: [
          { l: [2, 3, 4, 5], t: '<b>Solape en cada eje:</b> el fin más a la izquierda menos el inicio más a la derecha.' },
          { l: [6], t: 'Si alguno no es positivo, no hay choque.' },
          { l: [7, 8, 9, 10, 11, 12], t: '<b>Entró por un lado:</b> se saca en X y vx apunta hacia afuera.' },
          { l: [13, 14, 15, 16, 17, 18, 19], t: '<b>Entró por arriba o abajo:</b> se saca en Y y vy apunta hacia afuera.' }
        ] }],
        nota: '5 minutos. Pregunta en la marca 3: ¿por qué -math.abs(bola.vx) y no -bola.vx? Respuesta esperada: así la bola sale hacia la izquierda aunque el choque se detecte dos veces. Error común: comparar bola.x con l.x cuando la bola es más grande que el ladrillo; para bolas pequeñas funciona, y si quieren más robustez comparen centros.' },

      { kind: 'antipatron', title: 'Dos atajos que pegan la bola',
        lead: 'Los dos «funcionan» la mayoría del tiempo. Por eso cuesta encontrarlos.',
        top: true,
        full: [{ compare: { a: { label: 'Voltear sin sacar', lang: 'Lua', src: `if colision.aabb(bola, paleta) then
  bola.vy = -bola.vy
end
-- frame 1: toca, vy pasa a negativa
-- frame 2: sigue tocando,
--          vy vuelve a positiva
-- resultado: la bola se hunde
-- o tiembla dentro de la paleta` }, b: { label: 'Sacar y apuntar hacia afuera', lang: 'Lua', src: `if bola.vy > 0 and
   colision.aabb(bola, paleta) then
  rebotePaleta(bola, paleta)
  bola.y = paleta.y - bola.alto
end
-- solo rebota si viene bajando,
-- sale hacia arriba siempre
-- y queda fuera de la paleta` } } }],
        nota: '3 minutos. Pregunta: ¿cuál de los tres seguros de la derecha es el más importante? No hay una respuesta única; cualquiera de los tres solo ya evita casi todos los casos. Juntos son a prueba de balas. Pide que levanten la mano quienes tienen la versión de la izquierda: suele ser la mitad.' },

      { kind: 'idea', title: 'La paleta decide el ángulo',
        lead: 'Si la bola siempre sale igual, el jugador no puede apuntar.',
        izq: 54,
        left: [{ svg: svgPaleta }],
        right: [
          { ul: ['<b>t</b> va de −1 (borde izquierdo) a +1 (borde derecho).', 'ángulo = t × ángulo máximo.', 'La rapidez no cambia: solo la dirección.'], pasos: true },
          { pie: 'En el Breakout de Atari de 1976 la bola ya cambiaba de ángulo según la zona de la paleta donde pegaba.', paso: true }
        ],
        nota: '4 minutos. Conecta con la sesión 2: seno y coseno descomponen la rapidez en vx y vy. El ángulo se mide desde la vertical, por eso vx usa seno. Pregunta: ¿por qué no dejar que el ángulo llegue a 90°? Respuesta esperada: la bola saldría horizontal y rebotaría de pared a pared sin subir nunca.' },

      { kind: 'demo', title: 'Pega en distintas partes de la paleta',
        lead: 'Mueve la bola por la paleta o usa el deslizador. Compara con el rebote plano.',
        top: true,
        full: [{ fig: 'paleta' }],
        nota: '5 minutos. Pide a alguien que dicte un punto de impacto para pegarle a la esquina superior derecha. Luego baja el ángulo máximo a 20° y súbelo a 80°: con 20 es aburrido, con 80 la bola tarda siglos en volver. Cambia a «Rebote plano» y pregunta qué juego se siente así. Recomendación para el ACA 2: entre 50° y 65°.' },

      { kind: 'codigo', title: 'rebotePaleta en Lua',
        izq: 30,
        left: [
          { big: 'Una proporción, un ángulo y dos funciones trigonométricas.' },
          { pie: 'La versión de la página prueba cinco puntos de impacto e imprime los grados.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE)', src: palCorto }], marca: [
          { l: [6, 7], t: '<b>t:</b> dónde pegó, de −1 a +1, limitado para que nunca se pase.' },
          { l: [8], t: 'La rapidez actual: el largo del vector velocidad.' },
          { l: [9, 10, 11], t: 'Mismo tamaño, nueva dirección. vy negativa: siempre hacia arriba.' },
          { l: [12], t: 'Y fuera de la paleta, para no chocar otra vez.' }
        ] }],
        nota: '4 minutos. Pregunta: si la paleta mide 100 px y la bola pega a 25 px a la derecha del centro, ¿cuánto vale t? Respuesta esperada: 0,5, y con 60° de máximo sale a 30°. Recuerda que math.sin y math.cos de Lua trabajan en radianes: por eso math.rad(60).' },

      { kind: 'reto', title: 'Predice: la bola que no choca',
        lead: 'La bola va a 1200 px/s. El juego corre a 30 fps. El ladrillo mide 20 px de grosor.',
        izq: 50,
        left: [
          { check: { q: '¿Qué pasa cuando la bola llega al ladrillo?', opts: ['Choca, como siempre', 'Puede atravesarlo: avanza 40 px por frame y el ladrillo mide 20', 'Se detiene antes', 'Rebota dos veces'], ok: 1, why: '1200 × 1/30 = 40 px por frame. Si en un frame la bola queda justo antes del ladrillo, en el siguiente ya está 40 px más allá: nunca se solaparon y AABB nunca dijo «choca».' } }
        ],
        right: [
          { panel: ['avance por frame = rapidez × dt'], h: 'Haz la cuenta' }
        ],
        nota: '3 minutos. Que hagan la cuenta en el chat antes de revelar. Pregunta: ¿por qué en un computador lento pasa más? Respuesta esperada: menos fps, dt más grande, saltos más largos. Es el mismo dt de la sesión 2, ahora en su lado oscuro.' },

      { kind: 'demo', title: 'Atraviesa el ladrillo',
        lead: 'Sube la rapidez hasta que la bola se salte el ladrillo. Luego activa los sub-pasos.',
        top: true,
        full: [{ fig: 'tunel' }],
        nota: '5 minutos. Empieza en 600 px/s: choca. Sube a 1500 y luego a 3000: túnel, con el salto marcado en coral. Usa «Lanzar (cámara lenta)» para que vean los saltos. Activa sub-pasos: choca siempre. Pregunta: ¿qué otra solución hay? Respuesta esperada: limitar la rapidez o hacer los ladrillos más gruesos. Cambia a 60 fps para mostrar que más fps ayuda, pero no lo garantiza.' },

      { kind: 'codigo', title: 'Sub-pasos en la Bola',
        izq: 30,
        left: [
          { big: 'Nunca avanzar más de media bola de una vez.' },
          { pie: 'En la página de la clase está también el tope de rapidez y el arreglo de la bola pegada.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE)', src: subCorto }], marca: [
          { l: [2, 3, 4], t: '<b>Cuántos pasos:</b> lo que avanza en el frame dividido por media bola, hacia arriba.' },
          { l: [5], t: 'Cada paso usa un pedazo de dt.' },
          { l: [6, 7, 8, 9, 10, 11, 12], t: 'Moverse un poquito y revisar todo, varias veces por frame.' }
        ] }],
        nota: '4 minutos. Pregunta: a velocidad normal, ¿cuántos pasos hace? Respuesta esperada: casi siempre uno o dos; el costo solo sube cuando hace falta. Error común: mover con dt dentro del ciclo en vez de h; la bola iría pasos veces más rápido.' },

      { kind: 'idea', title: 'El nivel es una partitura',
        lead: 'Diseñar un nivel nuevo es editar una tabla, no programar.',
        izq: 46,
        left: [{ code: [{ lang: 'Lua', label: 'data/niveles.lua', src: nivCorto }, { lang: 'Lua', label: 'La fábrica', src: fabricaCorto }] }],
        right: [
          { tabla: { head: ['Letra', 'Ladrillo'], rows: [['<code>1</code>', 'Normal: un golpe'], ['<code>2</code>', 'Duro: dos golpes'], ['<code>X</code>', 'Irrompible'], ['<code>.</code>', 'Vacío']] }, pasos: true },
          { clave: 'El código lee la partitura. La partitura no sabe de código.', paso: true }
        ],
        nota: '4 minutos. Pregunta: ¿quién podría diseñar niveles si están en esta tabla? Respuesta esperada: cualquiera del equipo, sin saber Lua. Es la misma idea del Boss Rush de la próxima sesión: las preguntas son una tabla. Abre la pestaña «La fábrica»: una tabla que traduce cada letra a un constructor. En la página de la clase hay un «pruébalo» que construye los dos niveles y cuenta los ladrillos.' },

      { kind: 'codigo', title: 'Ladrillos que responden a su manera',
        izq: 32,
        left: [
          { big: 'Mismo mensaje, distinta respuesta: polimorfismo.' },
          { pie: 'Es el patrón <code>.new()</code> y <code>__index</code> de la sesión 5. En el proyecto, cada clase va en su archivo.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua', src: ladCorto }], marca: [
          { l: [4, 5, 6, 7, 8, 9], t: 'Constructor de la clase base. <code>_vida</code> es privada por convención.' },
          { l: [10, 11, 12, 13], t: '<b>onHit()</b> del ladrillo normal: resta vida y avisa si se rompió.' },
          { l: [15, 16], t: '<b>Herencia:</b> lo que Irrompible no tenga, lo busca en Ladrillo.' },
          { l: [20], t: '<b>Sobrescribe</b> onHit(): nunca se rompe.' }
        ] }],
        nota: '5 minutos. Recuerda la fábrica de la slide anterior: cada letra apunta a uno de estos constructores. Pregunta: ¿qué hay que tocar para agregar un ladrillo explosivo? Respuesta esperada: un archivo Explosivo.lua y una línea en la fábrica; el bucle de colisiones no. Recuerda cuentaParaGanar(): está en la página de la clase y evita el bug de la victoria imposible.' },

      { kind: 'antipatron', title: 'El if que pregunta el tipo',
        lead: 'La rúbrica del ACA 2 lo dice explícito: el bucle no pregunta, el ladrillo responde.',
        top: true,
        full: [{ compare: { a: { label: 'El bucle pregunta el tipo', lang: 'Lua', src: tipoMal }, b: { label: 'El ladrillo responde', lang: 'Lua', src: tipoBien } } }],
        nota: '3 minutos. Pregunta: con la versión izquierda, ¿cuántos lugares del código hay que editar para un ladrillo nuevo? Respuesta esperada: el bucle, el dibujo, el sonido y los puntos; con la derecha, uno nuevo. Es el criterio 1 de la rúbrica: polimorfismo real.' },

      { kind: 'demo', title: 'El director de la banda',
        lead: 'Envía eventos y mira qué estado los escucha.',
        top: true,
        full: [{ fig: 'fsm' }],
        nota: '5 minutos. Recorre una partida: Enter, Enter, Bola cae tres veces hasta GameOver. Luego otra partida rompiendo el último ladrillo dos veces hasta Victory. Prueba P en Title: no pasa nada, y eso es bueno. Pregunta: ¿dónde vivía la regla «no mover la bola en pausa»? Respuesta esperada: en ningún if; Pause.update simplemente no la mueve. Conecta con la sesión 2 y la 5: es la misma FSM, ahora completa.' },

      { kind: 'codigo', title: 'Estados como tablas',
        izq: 30,
        left: [
          { big: 'LÖVE le pasa el trabajo al estado actual. Nada más.' },
          { pie: 'En la página está la versión con Title y Pause, y las funciones de game feel.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE)', src: fsmCorto }], marca: [
          { l: [3, 4, 5, 6], t: '<b>Cambiar de estado:</b> apuntar a otra tabla y llamar a su entrar() si tiene.' },
          { l: [8, 9, 10, 11, 12], t: 'Cada estado tiene las mismas funciones. Pause no mueve nada.' },
          { l: [14, 15, 16], t: 'Los tres callbacks de LÖVE delegan en el estado actual.' }
        ] }],
        nota: '4 minutos. Pregunta: ¿qué pasa si Play tiene entrar() y la pausa vuelve a Play con cambiar("play")? Respuesta esperada: entrar() corre otra vez y podría reiniciar la bola; por eso Play no debe reiniciar nada en entrar(), o la pausa usa otra transición. Es un caso borde que la rúbrica premia.' },

      { kind: 'antipatron', title: 'Cuatro banderas, dieciséis combinaciones',
        top: true,
        full: [{ compare: { a: { label: 'Banderas sueltas', lang: 'Lua', src: banderasMal }, b: { label: 'Un estado actual', lang: 'Lua', src: estadosBien } } }],
        nota: '2 minutos. Pregunta: con cuatro booleanos, ¿cuántas combinaciones hay? Respuesta esperada: 2 × 2 × 2 × 2 = 16, y solo 6 tienen sentido. Las otras 10 son bugs esperando a pasar. La rúbrica pone en 2.0 los «cambios de estado mediante banderas booleanas sueltas».' },

      { kind: 'idea', title: 'Game feel: el sonido de la banda',
        lead: 'Cambia la sensación, no las reglas. Y es barato.',
        top: true,
        full: [
          { tabla: { head: ['Técnica', 'Qué hace', 'En código'], rows: [['Screen shake', 'La pantalla tiembla unos píxeles', '<code>love.graphics.translate</code> al azar, que se apaga solo'], ['Partículas', 'Pedacitos que salen volando', 'Una tabla de puntos con vida y velocidad'], ['Sonido', 'Cada golpe se oye', '<code>love.audio.newSource</code> y <code>:play()</code>'], ['Hit-stop', 'El juego se congela un instante', 'Saltarse el update unos 50 ms']] }, pasos: true },
          { clave: 'El game feel no arregla un juego roto: primero colisiones sanas, después el jugo.', paso: true }
        ],
        nota: '3 minutos. La rúbrica pide al menos 2 de {sonido, partículas, shake, tween} para aspirar al 5.0. Cuidado con exagerar: un shake fuerte en cada rebote marea. Si alguien tiene sensibilidad al movimiento, que el shake se pueda apagar. En la página de la clase están las dos funciones de game feel, update y draw.' },

      { kind: 'demo', title: 'Juega y compara',
        lead: 'Una partida con todo apagado, otra con todo encendido. Las reglas son las mismas.',
        top: true,
        full: [{ fig: 'breakout' }],
        nota: '6 minutos. Juega tú primero con todo apagado, unos 30 segundos. Luego enciende shake, partículas, hit-stop y sonido. Pregunta: ¿cambió algo en las reglas? Respuesta esperada: no, y aun así se siente otro juego. Muestra que la bola sale con ángulos distintos según dónde pega y que los grises no se rompen ni cuentan para ganar. Este mini juego tiene todo lo de hoy en unas 100 líneas.' },

      { kind: 'actividad', title: 'Clínica de colisiones',
        lead: 'En parejas, 15 minutos, con su propio núcleo. Uno juega, el otro anota.',
        izq: 50,
        left: [
          { ol: ['Bordes y esquinas: ¿se sale la bola?', 'Paleta: ¿ángulos distintos? ¿se pega?', 'Ladrillos: ¿rebota en el eje correcto?'], pasos: true }
        ],
        right: [
          { ul: ['Rapidez × 4: ¿hay túnel?', 'Cambia una letra del nivel: ¿cambió el juego?', '<code>print(solapeX, solapeY)</code> al chocar.'], pasos: true },
          { clave: 'Anoten cada bug: es material para la reflexión del documento técnico.', paso: true }
        ],
        nota: '15 minutos. Salas de dos. Pasa por las salas con esta pregunta: muéstrenme la línea donde sacan la bola del ladrillo. Si no existe, ese es el bug. Error común: revisar los ladrillos con un for y no salir después del primer choque; la bola rebota dos veces en el mismo frame y sigue derecho. Al final, una pareja comparte el bug más raro que encontró.' },

      { kind: 'idea', title: 'Entrega del ACA 2',
        lead: 'Proyecto LÖVE jugable más documento técnico. La consigna en C Digital manda.',
        izq: 54,
        left: [
          { tabla: { head: ['Criterio', 'Peso'], rows: [['POO: metatablas, herencia, polimorfismo', '25 %'], ['Sistema de colisiones', '25 %'], ['Máquina de estados y bucle', '20 %'], ['Contenido, datos y game feel', '15 %'], ['Documentación y reflexión', '15 %']] }, pasos: true }
        ],
        right: [
          { ul: ['Abre sin errores y se puede ganar y perder.', 'Una clase por archivo; todo con <code>local</code>.', 'PDF: UML final con el cambio respecto al ACA 1.'], pasos: true },
          { pie: 'Para el 5.0 en contenido: un power-up y al menos dos elementos de pulido.', paso: true }
        ],
        nota: '6 minutos. Abre la rúbrica en C Digital y lee los descriptores del 5.0 de colisiones y de estados: son justo lo de hoy. Recuerda que la reflexión vale: qué cambió del ACA 1 y por qué. Pregunta: ¿qué se puede revisar en 5 minutos antes de subir? Respuesta esperada: abrir el ZIP en una carpeta limpia y jugar. Anuncia la demo de 5 minutos de la sesión 8.' },

      { kind: 'reto', title: 'Antes de irnos: quiz postclase',
        lead: 'Ocho preguntas, las mismas cinco ideas. Compáralo con tu preclase.',
        full: [
          { ul: ['Resolver y rebotar en la paleta.', 'Túnel y bola pegada.', 'Datos, polimorfismo, estados y game feel.'] },
          { pie: 'Abre el quiz postclase desde la página de la sesión.', paso: true }
        ],
        nota: '7 minutos. En silencio. Mientras responden, revisa en el foro las listas de bugs de la clínica. Al final pregunta cuál costó más: suele ser la del túnel o la de la victoria con irrompibles.' },

      { kind: 'cierre', title: 'Lo que te llevas',
        full: [
          { ol: ['<b>Detectar, sacar y rebotar</b> por el eje de menor penetración.', '<b>La paleta decide el ángulo</b>, y los sub-pasos evitan el túnel.', '<b>Datos, onHit() y estados</b> ordenan el juego; el game feel lo hace sentir.'], pasos: true },
          { p: 'La próxima sesión es la última: Boss Rush por equipos, demos de sus Breakout y auto y coevaluación. Trae tu juego corriendo y una decisión técnica para defender.', paso: true }
        ],
        nota: '2 minutos. Ronda en el chat: un bug que resolvieron hoy en una frase. Recuerda el plazo de entrega del ACA 2 en C Digital y la demo de 5 minutos para la próxima sesión.' }
    ],
    pre: [
      { q: 'Tu código detecta que la bola está dentro de un ladrillo e invierte vy, pero no mueve la bola. ¿Qué puede pasar en el frame siguiente?', opts: ['Nada: ya rebotó', 'Que el ladrillo se mueva', 'Que siga adentro, se detecte otra vez, vy se voltee de nuevo y la bola vibre o lo atraviese', 'Que el juego se cierre'], ok: 2, why: 'Detectar no saca la bola. Si sigue solapada, la colisión se repite y la velocidad vuelve a voltearse. Por eso se resuelve: sacar y después rebotar.', idea: 'C1' },
      { q: 'La bola se metió 3 px en X y 12 px en Y dentro de un ladrillo. ¿Por dónde entró más probablemente?', opts: ['Por un lado, izquierdo o derecho', 'Por arriba o por abajo', 'Por los dos a la vez', 'No se puede saber'], ok: 0, why: 'En un frame la bola avanza poco. El solape más pequeño es el que acaba de recorrer: 3 px de lado. Es el eje de menor penetración. Por arriba o abajo sería si el solape pequeño fuera el de Y.', idea: 'C1' },
      { q: '¿Para qué sirve que la bola salga con distinto ángulo según dónde pega en la paleta?', opts: ['Para que se vea más bonita', 'Para que el jugador pueda apuntar', 'Para que la bola vaya más rápido', 'Para ahorrar cálculos'], ok: 1, why: 'Si sale siempre igual, la partida es un patrón que se repite y el jugador solo puede atajar. Con el ángulo variable, decide hacia dónde va la bola. La rapidez no cambia.', idea: 'C2' },
      { q: 'Una bola muy rápida a veces atraviesa un ladrillo delgado sin romperlo. ¿Por qué?', opts: ['Porque el ladrillo está mal dibujado', 'Porque Lua es lento', 'Porque entre un frame y otro salta más que el grosor del ladrillo y nunca llegan a solaparse', 'Porque dt es negativo'], ok: 2, why: 'AABB mira dónde está la bola en cada frame, no por dónde pasó. Si salta por encima del ladrillo, nunca se solapan. Se llama túnel y se resuelve con sub-pasos.', idea: 'C3' },
      { q: 'Tienes ladrillos normales, duros e irrompibles. ¿Qué diseño hace más fácil agregar un cuarto tipo?', opts: ['Un if por tipo dentro del bucle de colisiones', 'Copiar el bucle de colisiones para cada tipo', 'Una variable global por tipo', 'Que cada tipo tenga su propio onHit() y el bucle solo lo llame'], ok: 3, why: 'Es polimorfismo: el bucle manda el mismo mensaje y cada ladrillo responde a su manera. Un tipo nuevo es un archivo nuevo. El if por tipo obliga a editar el bucle cada vez.', idea: 'C4' },
      { q: 'Tu Breakout tiene las pantallas Title, Serve, Play, Pause, Victory y GameOver. ¿Qué es lo más ordenado?', opts: ['Una variable booleana por pantalla', 'Una máquina de estados: un estado actual y transiciones por evento', 'Un if gigante en love.draw', 'Un archivo por pantalla, sin conexión entre ellos'], ok: 1, why: 'Con un estado actual es imposible estar en dos pantallas a la vez. Seis booleanos dan 64 combinaciones y solo 6 tienen sentido.', idea: 'C5' }
    ],
    post: [
      { q: 'Con esta medición, ¿qué velocidad debe invertir <code>resolver</code>?', code: { lang: 'Lua', src: 'local solapeX = 4\nlocal solapeY = 10\n-- la bola está metida en el ladrillo' },
        opts: ['vy', 'vx', 'Las dos', 'Ninguna'], ok: 1, why: 'El solape menor es el de X: la bola entró por un lado. Se saca 4 px en X y se invierte vx. Invertir las dos produce el rebote de espejo.', idea: 'C1' },
      { q: '¿Por qué escribir <code>bola.vx = -math.abs(bola.vx)</code> en vez de <code>bola.vx = -bola.vx</code>?', opts: ['Porque es más rápido', 'Porque math.abs redondea la velocidad', 'Da lo mismo', 'Porque garantiza que salga hacia la izquierda aunque el choque se detecte dos frames seguidos'], ok: 3, why: 'Con -bola.vx, dos detecciones seguidas voltean dos veces y la bola sigue hacia el ladrillo. Con -math.abs siempre queda negativa: hacia la izquierda.', idea: 'C1' },
      { q: 'La paleta mide 100 px y empieza en x = 300. El centro de la bola pega en x = 375. Con <code>ANGULO_MAX = math.rad(60)</code>, ¿hacia dónde sale?', opts: ['0°, vertical', '30° hacia la derecha', '60° hacia la derecha', '30° hacia la izquierda'], ok: 1, why: 'El centro de la paleta es 350: t = (375 − 350) / 50 = 0,5, y 0,5 × 60° = 30°, positivo, hacia la derecha. 60° sería pegar en el borde.', idea: 'C2' },
      { q: '¿Por qué se limita t entre −1 y 1 y se usa un ángulo máximo menor de 90°?', opts: ['Para que la bola nunca salga casi horizontal y tarde muchísimo en volver', 'Para que el código sea más corto', 'Porque math.sin no acepta números grandes', 'Para que la bola vaya más lento'], ok: 0, why: 'Con 90° la bola saldría horizontal y rebotaría de pared a pared. El límite de t evita ángulos raros cuando la bola pega con la punta de la paleta. math.sin acepta cualquier número.', idea: 'C2' },
      { q: 'A 60 fps la bola va a 1800 px/s y los ladrillos miden 20 px de alto. ¿Cuánto avanza por frame y qué riesgo hay?', opts: ['3 px, ningún riesgo', '1800 px, se sale de la pantalla', '30 px: puede saltarse un ladrillo de 20 px', '20 px justo, siempre choca'], ok: 2, why: '1800 × 1/60 = 30 px por frame, más que el ladrillo. Con sub-pasos de media bola, por ejemplo 5 o 6 por frame, ya no puede saltárselo.', idea: 'C3' },
      { q: 'En la pantalla de pausa, el jugador presiona la flecha y la paleta se mueve. ¿Dónde está el error más probable?', opts: ['En love.draw', 'En la colisión AABB', 'En el sonido', 'El código que mueve la paleta está en love.update general y no dentro del estado Play'], ok: 3, why: 'Si la entrada se lee fuera de los estados, corre en todos. Con la FSM, mover la paleta va en Play.update (y en Serve), y Pause.update no hace nada.', idea: 'C5' },
      { q: 'Tu nivel tiene ladrillos irrompibles y el juego nunca declara la victoria. ¿Cuál es la causa más probable?', opts: ['La condición de victoria cuenta todos los ladrillos vivos, incluidos los irrompibles', 'Falta love.load', 'dt es demasiado pequeño', 'La paleta es demasiado ancha'], ok: 0, why: 'Los irrompibles nunca mueren, así que «no quedan ladrillos vivos» nunca se cumple. La victoria debe contar solo los que cuentan para ganar: <code>cuentaParaGanar()</code>.', idea: 'C4' },
      { q: 'Al romper un ladrillo congelas el juego 50 ms, sacudes la pantalla 6 px y suena un golpe. ¿Qué cambió en las reglas del juego?', opts: ['La bola es más rápida', 'Nada: es game feel; cambia la sensación y no las reglas', 'El juego tiene menos fps', 'Los ladrillos tienen más vida'], ok: 1, why: 'Hit-stop, screen shake y sonido son respuestas al golpe, no reglas nuevas. Por eso viven aparte y se pueden apagar sin romper nada.', idea: 'C5' }
    ]
  };
})();
