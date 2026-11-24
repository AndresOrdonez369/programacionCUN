(function () {
  /* Sesión 5 · POO en Lua, módulos y estados. Cierra el ACA 1 (diseño OO del Breakout).
     Se apoya en la sesión 3 (clase, instancia, pilares, State, UML en pseudocódigo) y en la 4 (Lua y LÖVE).
     Las pestañas "pruébalo" son Lua puro con print(). Los mensajes de error citados son los de LÖVE (LuaJIT). */

  /* ---------- 1 · Punto, dos puntos y self ---------- */
  const luaPuntos = `local perro = { nombre = "Firulais" }

function perro.presentar(self)      -- con punto: self va a mano
  return "Soy " .. self.nombre
end

function perro:ladrar(veces)        -- con dos puntos: self llega solo
  return self.nombre .. " ladra " .. veces .. " veces"
end

print(perro.presentar(perro))       -- pasas perro a mano
print(perro:presentar())            -- lo mismo, más corto
print(perro:ladrar(3))
print(perro.ladrar(perro, 3))       -- idéntico a la línea anterior

-- El error típico: punto donde iban dos puntos
local ok, err = pcall(perro.ladrar, 3)
print(ok, err)`;

  const psePuntos = `OBJETO perro
  nombre <- "Firulais"
  METODO ladrar(veces):
    MOSTRAR self.nombre + " ladra " + veces + " veces"

perro.ladrar(3)     -- en pseudocódigo, "self" era implícito:
                    -- el objeto que está antes del punto`;

  /* ---------- 2 · Metatablas, __index y .new() ---------- */
  const luaIndex = `local Animal = { patas = 4, sonido = "..." }
local perro = { sonido = "guau" }

print(perro.patas)                  -- nil: perro no lo tiene

-- La metatabla es una nota pegada a perro:
-- "si te preguntan algo que no sabes, pregúntale a Animal"
setmetatable(perro, { __index = Animal })

print(perro.patas)                  -- 4: se lo preguntó a Animal
print(perro.sonido)                 -- guau: lo propio gana
print(rawget(perro, "patas"))       -- nil: sigue sin ser suyo

Animal.patas = 3                    -- cambia el hermano mayor...
print(perro.patas)                  -- 3: perro no guardaba copia`;

  const pseClase = `CLASE Pelota
  ATRIBUTOS: x, y, vx, vy
  CONSTRUCTOR nueva(x, y):
    self.x <- x;      self.y <- y
    self.vx <- 120;   self.vy <- -90
  METODO mover(dt):
    self.x <- self.x + self.vx * dt
    self.y <- self.y + self.vy * dt
FIN CLASE

a <- nueva Pelota(100, 300)
b <- nueva Pelota(400, 300)
a.mover(1)`;

  const luaNew = `local Pelota = {}
Pelota.__index = Pelota                -- 1) las instancias buscan aquí

function Pelota.new(x, y)              -- 2) el constructor
  local self = setmetatable({}, Pelota)
  self.x, self.y = x, y
  self.vx, self.vy = 120, -90
  return self
end

function Pelota:mover(dt)              -- 3) un método, con dos puntos
  self.x = self.x + self.vx * dt
  self.y = self.y + self.vy * dt
end

local a = Pelota.new(100, 300)         -- 4) instancias: cada una con sus datos
local b = Pelota.new(400, 300)
a:mover(1)                             -- un segundo
print(a.x, a.y)                        -- 220   210
print(b.x, b.y)                        -- 400   300: b no se movió
print(a.mover == b.mover)              -- true: comparten el método
print(rawget(a, "mover"))              -- nil: el método vive en Pelota`;

  /* ---------- 3 · Herencia, polimorfismo y encapsulación ---------- */
  const pseHerencia = `CLASE Entidad
  METODO actualizar(): "no hago nada"
  METODO describir():  "soy " + nombre

CLASE Pelota HEREDA DE Entidad
  METODO actualizar(): "rebotó"       (sobrescribe)

CLASE Ladrillo HEREDA DE Entidad      (usa el de Entidad)

PARA CADA e EN [una Pelota, un Ladrillo]:
  MOSTRAR e.actualizar(), e.describir()`;

  const luaHerencia = `local Entidad = {}
Entidad.__index = Entidad
function Entidad.new(nombre)
  return setmetatable({ nombre = nombre, activo = true }, Entidad)
end
function Entidad:actualizar() return self.nombre .. ": no hago nada" end
function Entidad:describir() return "soy " .. self.nombre end

local Pelota = setmetatable({}, { __index = Entidad })   -- hija -> padre
Pelota.__index = Pelota
function Pelota.new()
  local self = Entidad.new("pelota")                     -- primero el padre
  return setmetatable(self, Pelota)                      -- luego la etiqueta de hija
end
function Pelota:actualizar() return "pelota: rebotó" end -- sobrescribe

local Ladrillo = setmetatable({}, { __index = Entidad })
Ladrillo.__index = Ladrillo
function Ladrillo.new() return setmetatable(Entidad.new("ladrillo"), Ladrillo) end

for _, e in ipairs({ Pelota.new(), Ladrillo.new() }) do   -- un bucle, dos clases
  print(e:actualizar(), "|", e:describir())
end`;

  const luaEncap = `-- Opción 1: convención. El guion bajo dice "no me toques desde afuera".
local Moneda = {}
Moneda.__index = Moneda
function Moneda.new(x, y) return setmetatable({ x = x, y = y, _tomada = false }, Moneda) end
function Moneda:recoger() self._tomada = true end
function Moneda:estaTomada() return self._tomada end

local m = Moneda.new(120, 80)
m:recoger()
print(m:estaTomada())        -- true: se usó la interfaz
m._tomada = false            -- Lua lo permite... pero rompiste el acuerdo

-- Opción 2: privado de verdad con una local (un closure)
local function crearContador()
  local cuenta = 0                     -- nadie de afuera la ve
  return function() cuenta = cuenta + 1; return cuenta end
end
local siguiente = crearContador()
print(siguiente(), siguiente(), siguiente())   -- 1   2   3
print(cuenta)                          -- nil: afuera no existe`;

  /* ---------- 4 · Módulos con require: Coin Hunt en archivos ---------- */
  const luaRequire = `-- Simulamos dos archivos. En LÖVE cada uno sería un .lua aparte.
package.preload["pelota"] = function()
  print("  (corriendo pelota.lua de arriba abajo)")
  local Pelota = {}
  Pelota.__index = Pelota
  function Pelota.new(x, y) return setmetatable({ x = x, y = y }, Pelota) end
  return Pelota                            -- lo que el módulo entrega
end
package.preload["paleta"] = function()
  local Paleta = {}
  -- ...y se nos olvidó el return Paleta
end

local Pelota = require("pelota")
local Otra = require("pelota")             -- segunda vez: no vuelve a correr
print(Pelota == Otra)                      -- true: la misma tabla
print(Pelota.new(10, 20).x)                -- 10

local Paleta = require("paleta")
print(Paleta)                              -- true: no hubo return`;

  const playerLua = `-- player.lua: una clase por archivo
local Player = {}
Player.__index = Player

function Player.new(x, y)
  local self = setmetatable({}, Player)
  self.x, self.y, self.radio, self.vel = x, y, 16, 250
  return self
end

function Player:update(dt)
  local v, tecla = self.vel * dt, love.keyboard.isDown
  if tecla("right", "d") then self.x = self.x + v end
  if tecla("left", "a")  then self.x = self.x - v end
  if tecla("down", "s")  then self.y = self.y + v end
  if tecla("up", "w")    then self.y = self.y - v end
end

function Player:draw()
  love.graphics.setColor(0.23, 0.77, 0.64)
  love.graphics.circle("fill", self.x, self.y, self.radio)
end

return Player                        -- sin esta línea, require devuelve true`;

  const coinLua = `-- coin.lua
local Coin = {}
Coin.__index = Coin

function Coin.new(x, y)
  return setmetatable({ x = x, y = y, radio = 8, _tomada = false }, Coin)
end

function Coin:recoger() self._tomada = true end     -- la única puerta para cambiar _tomada
function Coin:estaTomada() return self._tomada end

function Coin:draw()
  if self._tomada then return end
  love.graphics.setColor(1, 0.78, 0.24)
  love.graphics.circle("fill", self.x, self.y, self.radio)
end

return Coin`;

  const mainCoin = `-- main.lua: pide sus piezas con require
local Player = require("player")      -- player.lua, sin escribir .lua
local Coin   = require("coin")
local jugador, monedas

function love.load()
  jugador = Player.new(400, 300)      -- centro de la ventana de 800 x 600
  monedas = {}
  for i = 1, 6 do
    table.insert(monedas, Coin.new(love.math.random(40, 760), love.math.random(40, 560)))
  end
end

function love.update(dt) jugador:update(dt) end   -- la colisión: tu práctica

function love.draw()
  jugador:draw()
  for _, m in ipairs(monedas) do m:draw() end
end`;

  /* ---------- 5 · Estados como objetos y el esqueleto del Breakout (ACA 1) ---------- */
  const luaEstados = `-- Cada estado es una tabla con los mismos métodos
local Titulo, Jugar, Pausa = { nombre = "Title" }, { nombre = "Play" }, { nombre = "Pause" }
local actual

local function cambiar(nuevo)
  actual = nuevo
  print("  -> ahora manda: " .. nuevo.nombre)
end

function Titulo:keypressed(t) if t == "return" then cambiar(Jugar) end end
function Jugar:keypressed(t)  if t == "p" then cambiar(Pausa) end end
function Pausa:keypressed(t)  if t == "p" then cambiar(Jugar) end end

-- main.lua no pregunta en qué estado está: le pasa la tecla al actual
cambiar(Titulo)
for _, tecla in ipairs({ "x", "return", "p", "x", "p" }) do
  print("tecla " .. tecla .. " en " .. actual.nombre)
  actual:keypressed(tecla)
end`;

  const pseACA = `AL ARRANCAR:   cambiar al estado Title

CADA FRAME:
  actualizar:  estadoActual.update(dt)
  dibujar:     estadoActual.draw()
AL PULSAR:     estadoActual.keypressed(tecla)

Play.update(dt):
  paleta.update(dt);  pelota.update(dt)
  SI la pelota cae por debajo de la ventana:
    vidas <- vidas - 1;  pelota nueva en el centro
    SI vidas = 0: cambiar a GameOver`;

  const mainACA = `-- main.lua · Breakout, esqueleto del ACA 1
local estados = {
  titulo = require("estados.titulo"),    -- estados/titulo.lua
  jugar  = require("estados.jugar"),
  pausa  = require("estados.pausa"),
  fin    = require("estados.fin"),
}
local actual

local function cambiar(nombre, nuevo)
  actual = estados[nombre]
  actual:entrar(cambiar, nuevo)          -- el estado recibe cómo pedir el siguiente
end

function love.load() cambiar("titulo") end
function love.update(dt) actual:update(dt) end
function love.draw() actual:draw() end
function love.keypressed(tecla)
  if tecla == "escape" then love.event.quit() end
  actual:keypressed(tecla)
end`;

  const confACA = `-- conf.lua
function love.conf(t)
  t.window.title  = "Breakout"
  t.window.width  = 800
  t.window.height = 600
end`;

  const tituloACA = `-- estados/titulo.lua · Title
local Titulo = {}

function Titulo:entrar(cambiar) self.cambiar = cambiar end
function Titulo:update(dt) end                       -- nada que mover
function Titulo:draw()
  love.graphics.setColor(1, 1, 1)
  love.graphics.printf("BREAKOUT\\n\\nEnter para jugar", 0, 250, 800, "center")
end
function Titulo:keypressed(tecla)
  if tecla == "return" then self.cambiar("jugar", true) end   -- true: partida nueva
end

return Titulo`;

  const jugarACA = `-- estados/jugar.lua · Play
local Paleta   = require("entidades.paleta")
local Pelota   = require("entidades.pelota")
local Ladrillo = require("entidades.ladrillo")
local Jugar = {}

function Jugar:entrar(cambiar, nuevo)
  self.cambiar = cambiar
  if not nuevo then return end               -- volver de la pausa no reinicia
  self.paleta, self.pelota, self.vidas = Paleta.new(350, 560), Pelota.new(400, 300), 3
  self.ladrillos = {}
  for i = 1, 10 do table.insert(self.ladrillos, Ladrillo.new(i * 76 - 56, 60)) end
end
function Jugar:update(dt)
  self.paleta:update(dt); self.pelota:update(dt)
  if self.pelota.y > 600 then                -- se cayó (los choques llegan en la sesión 6)
    self.vidas, self.pelota = self.vidas - 1, Pelota.new(400, 300)
    if self.vidas == 0 then self.cambiar("fin") end
  end
end
function Jugar:draw()
  for _, l in ipairs(self.ladrillos) do l:draw() end
  self.paleta:draw(); self.pelota:draw()     -- la pelota deja el color en blanco
  love.graphics.print("Vidas: " .. self.vidas, 10, 10)
end
function Jugar:keypressed(t) if t == "p" then self.cambiar("pausa") end end
return Jugar`;

  const pausaACA = `-- estados/pausa.lua · Pause
local Pausa = {}

function Pausa:entrar(cambiar) self.cambiar = cambiar end
function Pausa:update(dt) end                        -- el mundo queda congelado
function Pausa:draw()
  love.graphics.setColor(1, 1, 1)
  love.graphics.printf("PAUSA\\n\\nP para seguir", 0, 250, 800, "center")
end
function Pausa:keypressed(tecla)
  if tecla == "p" then self.cambiar("jugar") end     -- sin true: no reinicia
end

return Pausa`;

  const finACA = `-- estados/fin.lua · GameOver
local Fin = {}

function Fin:entrar(cambiar) self.cambiar = cambiar end
function Fin:update(dt) end
function Fin:draw()
  love.graphics.setColor(1, 1, 1)
  love.graphics.printf("GAME OVER\\n\\nEnter para volver al título", 0, 250, 800, "center")
end
function Fin:keypressed(tecla)
  if tecla == "return" then self.cambiar("titulo") end
end

return Fin`;

  const paletaACA = `-- entidades/paleta.lua
local Paleta = {}
Paleta.__index = Paleta

function Paleta.new(x, y)
  return setmetatable({ x = x, y = y, ancho = 100, alto = 16, vel = 420 }, Paleta)
end

function Paleta:update(dt)
  if love.keyboard.isDown("left") then self.x = self.x - self.vel * dt end
  if love.keyboard.isDown("right") then self.x = self.x + self.vel * dt end
  self.x = math.max(0, math.min(800 - self.ancho, self.x))   -- no se sale
end

function Paleta:draw()
  love.graphics.setColor(1, 1, 1)
  love.graphics.rectangle("fill", self.x, self.y, self.ancho, self.alto)
end

return Paleta`;

  const pelotaACA = `-- entidades/pelota.lua
local Pelota = {}
Pelota.__index = Pelota

function Pelota.new(x, y)
  local self = setmetatable({}, Pelota)
  self.x, self.y, self.radio = x, y, 8
  self.vx, self.vy = 180, 220                  -- píxeles por segundo
  return self
end

function Pelota:update(dt)
  self.x = self.x + self.vx * dt
  self.y = self.y + self.vy * dt
  if self.x < self.radio then self.vx = math.abs(self.vx) end          -- pared izquierda
  if self.x > 800 - self.radio then self.vx = -math.abs(self.vx) end   -- pared derecha
  if self.y < self.radio then self.vy = math.abs(self.vy) end          -- techo
end

function Pelota:draw()
  love.graphics.setColor(1, 1, 1)
  love.graphics.circle("fill", self.x, self.y, self.radio)
end

return Pelota`;

  const ladrilloACA = `-- entidades/ladrillo.lua
local Ladrillo = {}
Ladrillo.__index = Ladrillo

function Ladrillo.new(x, y)
  return setmetatable({ x = x, y = y, ancho = 70, alto = 24, vivo = true }, Ladrillo)
end

function Ladrillo:draw()
  if not self.vivo then return end
  love.graphics.setColor(1, 0.36, 0.23)
  love.graphics.rectangle("fill", self.x, self.y, self.ancho, self.alto)
end

return Ladrillo`;

  /* ---------- Para las slides ---------- */
  const sinIndex = `local Pelota = {}
-- se olvidó: Pelota.__index = Pelota

function Pelota.new(x, y)
  return setmetatable({ x = x, y = y }, Pelota)
end
function Pelota:mover(dt) self.x = self.x + 100 * dt end

local p = Pelota.new(0, 0)
p:mover(1)
-- attempt to call method 'mover' (a nil value)
-- p tiene metatabla, pero la nota no dice dónde buscar`;

  const conIndex = `local Pelota = {}
Pelota.__index = Pelota       -- la nota: "busca en Pelota"

function Pelota.new(x, y)
  return setmetatable({ x = x, y = y }, Pelota)
end
function Pelota:mover(dt) self.x = self.x + 100 * dt end

local p = Pelota.new(0, 0)
p:mover(1)
print(p.x)                    -- 100
-- p no tiene mover; Pelota sí, y una sola vez`;

  const modMal = `-- paleta.lua
local Paleta = {}
function Paleta.new(x, y) ... end
-- (sin return)

-- main.lua
local Paleta = require("paleta.lua")  -- con .lua
Bola = require("pelota")              -- sin local
local p = Paleta.new(350, 560)
-- attempt to index local 'Paleta'
-- (a boolean value)`;

  const modBien = `-- paleta.lua
local Paleta = {}
function Paleta.new(x, y) ... end
return Paleta                         -- lo que entrega

-- main.lua
local Paleta = require("paleta")      -- sin .lua
local Pelota = require("pelota")      -- con local
local Estado = require("estados.jugar") -- carpeta con punto
local p = Paleta.new(350, 560)`;

  const svgUML = `<svg viewBox="0 0 1000 540" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, Consolas, monospace" role="img" aria-label="Diagrama de clases del Breakout: main.lua usa un Estado; Title, Play, Pause y GameOver cumplen el contrato Estado; Play tiene una Paleta, una Pelota y varios Ladrillos">
<rect width="1000" height="540" fill="#1B1A2E"/>
<g fill="none" stroke="#F4F1E8" stroke-width="2">
<rect x="20" y="20" width="250" height="130"/><line x1="20" y1="56" x2="270" y2="56"/><line x1="20" y1="114" x2="270" y2="114"/>
<rect x="380" y="20" width="300" height="170"/><line x1="380" y1="56" x2="680" y2="56"/>
<rect x="300" y="250" width="150" height="50"/><rect x="470" y="250" width="150" height="50"/><rect x="640" y="250" width="150" height="50"/><rect x="810" y="250" width="170" height="50"/>
<rect x="190" y="370" width="260" height="150"/><line x1="190" y1="406" x2="450" y2="406"/><line x1="190" y1="464" x2="450" y2="464"/>
<rect x="460" y="370" width="260" height="150"/><line x1="460" y1="406" x2="720" y2="406"/><line x1="460" y1="464" x2="720" y2="464"/>
<rect x="730" y="370" width="260" height="150"/><line x1="730" y1="406" x2="990" y2="406"/><line x1="730" y1="464" x2="990" y2="464"/>
<line x1="270" y1="85" x2="378" y2="85"/><polyline points="366,77 378,85 366,93"/>
<g stroke-dasharray="6 5"><line x1="530" y1="210" x2="530" y2="230"/><line x1="375" y1="230" x2="895" y2="230"/><line x1="375" y1="230" x2="375" y2="250"/><line x1="545" y1="230" x2="545" y2="250"/><line x1="715" y1="230" x2="715" y2="250"/><line x1="895" y1="230" x2="895" y2="250"/></g>
<polygon points="530,190 518,210 542,210" fill="#1B1A2E"/>
<line x1="545" y1="324" x2="545" y2="350"/><line x1="320" y1="350" x2="860" y2="350"/><line x1="320" y1="350" x2="320" y2="370"/><line x1="590" y1="350" x2="590" y2="370"/><line x1="860" y1="350" x2="860" y2="370"/>
</g>
<polygon points="545,300 553,312 545,324 537,312" fill="#F4F1E8"/>
<g font-size="17" fill="#F4F1E8">
<text x="145" y="44" text-anchor="middle" fill="#FFC83D" font-weight="700">main.lua</text>
<text x="32" y="80">estados: tabla</text><text x="32" y="102">actual: Estado</text><text x="32" y="138">cambiar(nombre, nuevo)</text>
<text x="530" y="44" text-anchor="middle" fill="#FFC83D" font-weight="700">«contrato» Estado</text>
<text x="394" y="84">entrar(cambiar, nuevo)</text><text x="394" y="110">update(dt)</text><text x="394" y="136">draw()</text><text x="394" y="162">keypressed(tecla)</text>
<text x="324" y="78" text-anchor="middle" font-size="15" fill="#6E6B85">actual</text>
<text x="375" y="281" text-anchor="middle" fill="#3BC4A3">Title</text><text x="545" y="281" text-anchor="middle" fill="#3BC4A3" font-weight="700">Play</text><text x="715" y="281" text-anchor="middle" fill="#3BC4A3">Pause</text><text x="895" y="281" text-anchor="middle" fill="#3BC4A3">GameOver</text>
<text x="320" y="394" text-anchor="middle" fill="#3BC4A3" font-weight="700">Paleta</text><text x="202" y="430">x, y, ancho, alto</text><text x="202" y="452">vel</text><text x="202" y="488">new(x, y)</text><text x="202" y="510">update(dt) · draw()</text>
<text x="590" y="394" text-anchor="middle" fill="#3BC4A3" font-weight="700">Pelota</text><text x="472" y="430">x, y, radio</text><text x="472" y="452">vx, vy</text><text x="472" y="488">new(x, y)</text><text x="472" y="510">update(dt) · draw()</text>
<text x="860" y="394" text-anchor="middle" fill="#3BC4A3" font-weight="700">Ladrillo</text><text x="742" y="430">x, y, ancho, alto</text><text x="742" y="452">vivo</text><text x="742" y="488">new(x, y)</text><text x="742" y="510">draw()</text>
<text x="330" y="365" font-size="15" fill="#6E6B85">1</text><text x="600" y="365" font-size="15" fill="#6E6B85">1</text><text x="870" y="365" font-size="15" fill="#6E6B85">1..*</text>
</g>
<g font-size="15" fill="#6E6B85">
<polygon points="30,255 38,267 30,279 22,267" fill="#F4F1E8"/><text x="48" y="272">tiene (composición)</text>
<line x1="22" y1="310" x2="60" y2="310" stroke="#F4F1E8" stroke-width="2" stroke-dasharray="6 5"/><polygon points="72,310 60,302 60,318" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="2"/><text x="82" y="315">cumple el contrato</text>
</g>
</svg>`;

  window.SESION = {
    n: 5,
    titulo: 'POO en Lua, módulos y estados',
    objetivos: [
      'Explicar qué hace <code>a:metodo(x)</code> como atajo de <code>a.metodo(a, x)</code> y corregir un error causado por usar punto en lugar de dos puntos.',
      'Construir una clase en Lua con el patrón <code>Clase.__index = Clase</code> y <code>Clase.new()</code>, y rastrear en qué tabla encuentra Lua cada campo.',
      'Escribir una clase hija que herede de otra y recorrer una lista de objetos de clases distintas con un solo bucle polimórfico.',
      'Organizar un juego en módulos (un archivo por clase, <code>return</code> al final y <code>require</code> sin .lua) y explicar qué guarda <code>require</code> en su caché.',
      'Entregar el ACA 1: UML de clases, diagrama de estados Title, Play, Pause y GameOver, tabla de responsabilidades, pseudocódigo del game loop y un esqueleto en Lua que abre sin errores.'
    ],
    analogia: 'Cuando no sabes la receta, le preguntas a tu hermano mayor; si él tampoco, le pregunta a quien se la enseñó. En Lua cada objeto es una tabla con sus propios datos (su x, su y), pero los métodos no viven en él: viven en la clase. La metatabla es la nota pegada en la nevera que dice «si no sabes algo, pregúntale a Pelota», y Pelota tiene otra nota: «si yo no sé, pregúntale a Entidad». Eso es todo lo que Lua necesita para tener clases, herencia y polimorfismo.',
    ideas: [
      ['C1', 'Los dos puntos son un atajo: a:metodo(x) es a.metodo(a, x), y así llega self'],
      ['C2', 'Una clase en Lua es una tabla de métodos más una metatabla con __index: si el objeto no sabe, pregunta a la clase'],
      ['C3', 'Herencia es encadenar __index de hija a padre; polimorfismo es que un solo bucle llame e:update(dt) y cada uno haga lo suyo'],
      ['C4', 'Un módulo es un archivo que termina con return; require lo corre una vez y guarda lo que devolvió'],
      ['C5', 'Cada estado del juego es un objeto con los mismos métodos; main.lua solo le pasa el turno al estado actual']
    ],
    agenda: [
      ['0:00', 'Bienvenida y quiz preclase'],
      ['0:08', 'El molde de galletas de la sesión 3: ¿y si el lenguaje no tiene clases?'],
      ['0:14', 'Punto y dos puntos: de dónde sale self'],
      ['0:26', 'Metatablas e __index: preguntarle al hermano mayor'],
      ['0:38', 'El patrón .new(): la clase completa'],
      ['0:48', 'Herencia y polimorfismo: un bucle, muchas entidades. Encapsulación'],
      ['1:00', 'Módulos con require: Coin Hunt en archivos'],
      ['1:10', 'Estados de juego como objetos'],
      ['1:18', 'ACA 1: qué se entrega, UML, tabla de responsabilidades y el esqueleto del Breakout'],
      ['1:28', 'Taller: el esqueleto que abre sin errores'],
      ['1:50', 'Quiz postclase, cierre y entrega del ACA 1']
    ],
    conceptos: [
      { t: 'self y los dos puntos', d: '<code>self</code> es el objeto sobre el que se llamó el método. Al definir <code>function Pelota:mover(dt)</code> Lua agrega <code>self</code> como primer parámetro; al llamar <code>p:mover(dt)</code> pone <code>p</code> en ese lugar.', ej: '<code>p:mover(dt)</code> es exactamente <code>p.mover(p, dt)</code>. Con <code>p.mover(dt)</code>, self recibe el número dt y el juego se cae.' },
      { t: 'Metatabla', d: 'Una tabla que cambia cómo se comporta otra tabla. Se pega con <code>setmetatable(t, mt)</code>. No copia nada: es una nota con instrucciones.', ej: '<code>setmetatable(pelota, Pelota)</code> le dice a la pelota quién es su clase.' },
      { t: '__index', d: 'El campo de la metatabla que dice dónde buscar cuando una clave no está en la tabla. Si es una tabla, Lua busca ahí; si tampoco está, sigue su cadena.', ej: '<code>Pelota.__index = Pelota</code>: cuando una pelota no tiene <code>mover</code>, Lua lo busca en <code>Pelota</code>.' },
      { t: 'Constructor .new()', d: 'Una función de la clase que crea una tabla nueva, le pega la clase como metatabla, llena sus datos y la devuelve. Se llama con punto porque todavía no hay objeto.', ej: '<code>local p = Pelota.new(400, 300)</code> crea una pelota con su propia x e y.' },
      { t: 'Herencia en Lua', d: 'La clase hija tiene como metatabla <code>{ __index = Padre }</code>. Lo que la hija no define, lo busca en el padre. El constructor de la hija llama primero al del padre.', ej: '<code>local Pelota = setmetatable({}, { __index = Entidad })</code>: toda pelota sabe <code>describir</code> sin escribirlo.' },
      { t: 'Polimorfismo', d: 'Objetos de clases distintas responden al mismo mensaje cada uno a su manera. El código que los usa no pregunta de qué tipo son.', ej: '<code>for _, e in ipairs(entidades) do e:update(dt) end</code> mueve pelota, paleta y power-ups con la misma línea.' },
      { t: 'Encapsulación en Lua', d: 'Lua no tiene <code>private</code>. Se usa una convención (el guion bajo: <code>_tomada</code> significa «no lo toques desde afuera») o una variable <code>local</code> del archivo o de un closure, que de verdad nadie más ve.', ej: 'Coin Hunt cambia <code>_tomada</code> solo con <code>moneda:recoger()</code>.' },
      { t: 'Módulo y require', d: 'Un archivo .lua que arma una tabla local y la devuelve con <code>return</code>. <code>require("nombre")</code> lo busca sin la extensión, lo corre la primera vez y guarda el resultado en <code>package.loaded</code>; las siguientes veces entrega lo mismo.', ej: '<code>local Pelota = require("entidades.pelota")</code> carga <code>entidades/pelota.lua</code>. El punto es la barra de carpeta.' },
      { t: 'Estado como objeto', d: 'El patrón State de la sesión 3 en Lua: cada estado (Title, Play, Pause, GameOver) es una tabla con los mismos métodos. main.lua guarda cuál es el actual y le delega update, draw y keypressed.', ej: '<code>function love.update(dt) actual:update(dt) end</code> es todo el update de main en el Breakout.' }
    ],
    errores: [
      { mito: 'Lua no sirve para POO porque no tiene la palabra <code>class</code>.', real: 'Con tablas y metatablas se arman clases, herencia y polimorfismo. Muchas librerías de clases para LÖVE son solo unas decenas de líneas con <code>setmetatable</code> y <code>__index</code>.' },
      { mito: '<code>p.mover(5)</code> y <code>p:mover(5)</code> son lo mismo.', real: 'Con punto no se pasa el objeto: <code>self</code> recibe el 5. El error es <i>attempt to index local \'self\' (a number value)</i>. Regla: si lo definiste con dos puntos, llámalo con dos puntos.' },
      { mito: '<code>setmetatable</code> copia los métodos dentro de cada objeto.', real: 'No copia nada. El método vive una sola vez en la clase; el objeto solo tiene una nota que dice dónde buscarlo. <code>rawget(p, "mover")</code> da nil.' },
      { mito: '<code>require</code> corre el archivo cada vez que lo pides.', real: 'Lo corre la primera vez y guarda lo que devolvió. Las demás veces entrega la misma tabla. Si el archivo no tiene <code>return</code>, guarda <code>true</code>.' },
      { mito: 'Un campo con guion bajo, como <code>_vida</code>, es privado y Lua lo protege.', real: 'Es solo un acuerdo entre programadores. Lua deja tocarlo. Si necesitas privado de verdad, usa una <code>local</code> del módulo o un closure.' },
      { mito: 'Con varios estados, main.lua necesita un <code>if</code> por estado en cada callback.', real: 'Si cada estado es un objeto con los mismos métodos, main tiene una línea por callback: <code>actual:update(dt)</code>. Agregar un estado no abre main.' }
    ],
    codigoIntro: 'Cinco bloques, de la pieza más chica al esqueleto del ACA 1. Los cuatro primeros tienen pestañas <b>pruébalo</b> en Lua puro: corre cada una, cambia algo y vuelve a correr. El último trae los once archivos del Breakout listos para copiar en carpetas: <code>main.lua</code> y <code>conf.lua</code> en la raíz, <code>estados/</code> y <code>entidades/</code>.',
    codigo: [
      { titulo: 'Punto, dos puntos y self', desc: 'En el pseudocódigo de la sesión 3, <code>self</code> era «el objeto antes del punto». En Lua hay que pasarlo: los dos puntos lo hacen solos. La última línea muestra el error de usar punto donde iban dos puntos (el mensaje del navegador dice lo mismo que LÖVE con otras palabras).',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: psePuntos }, { lang: 'Lua', label: 'Lua (pruébalo)', src: luaPuntos, run: true }] },
      { titulo: 'Metatablas, __index y el patrón .new()', desc: 'Primero la idea suelta: una tabla que le pregunta a otra lo que no sabe. Luego la clase completa en cuatro pasos: la tabla de métodos con <code>__index</code>, el constructor <code>.new</code>, los métodos con dos puntos y las instancias. Fíjate en la última línea: el método no está copiado en la pelota.',
        tabs: [{ lang: 'Lua', label: '__index (pruébalo)', src: luaIndex, run: true }, { lang: 'Pseudo', label: 'La clase en pseudocódigo', src: pseClase }, { lang: 'Lua', label: 'Clase con .new() (pruébalo)', src: luaNew, run: true }] },
      { titulo: 'Herencia, polimorfismo y encapsulación', desc: 'Pelota y Ladrillo heredan de Entidad. Pelota sobrescribe <code>actualizar</code>; Ladrillo usa el de su padre. El bucle final no pregunta tipos. La segunda pestaña muestra las dos formas de proteger datos en Lua: la convención del guion bajo y una local de verdad.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: pseHerencia }, { lang: 'Lua', label: 'Herencia (pruébalo)', src: luaHerencia, run: true }, { lang: 'Lua', label: 'Encapsulación (pruébalo)', src: luaEncap, run: true }] },
      { titulo: 'Módulos con require: Coin Hunt en archivos', desc: 'La simulación usa <code>package.preload</code> para fingir archivos dentro del navegador: mira cuántas veces se imprime «corriendo pelota.lua». Luego, Coin Hunt de la sesión 4 partido en clases: <code>player.lua</code>, <code>coin.lua</code> y un <code>main.lua</code> que solo conecta. La colisión y el puntaje quedan como práctica.',
        tabs: [{ lang: 'Lua', label: 'Simular require (pruébalo)', src: luaRequire, run: true }, { lang: 'Lua', label: 'player.lua', src: playerLua }, { lang: 'Lua', label: 'coin.lua', src: coinLua }, { lang: 'Lua', label: 'main.lua', src: mainCoin }] },
      { titulo: 'Estados como objetos: el esqueleto del Breakout (ACA 1)', desc: 'Once archivos. Cada estado (Title, Play, Pause, GameOver) tiene los mismos cuatro métodos; <code>main.lua</code> no tiene ni un <code>if</code> por estado. La pelota todavía no choca con la paleta ni con los ladrillos (eso es la sesión 6): se cae, se pierden 3 vidas y llega GameOver. Si al correrlo recorres los cuatro estados sin errores, el esqueleto cumple.',
        tabs: [{ lang: 'Lua', label: 'Estados (pruébalo)', src: luaEstados, run: true }, { lang: 'Pseudo', label: 'Game loop (pseudocódigo)', src: pseACA }, { lang: 'Lua', label: 'main.lua', src: mainACA }, { lang: 'Lua', label: 'conf.lua', src: confACA }, { lang: 'Lua', label: 'estados/titulo.lua', src: tituloACA }, { lang: 'Lua', label: 'estados/jugar.lua', src: jugarACA }, { lang: 'Lua', label: 'estados/pausa.lua', src: pausaACA }, { lang: 'Lua', label: 'estados/fin.lua', src: finACA }, { lang: 'Lua', label: 'entidades/paleta.lua', src: paletaACA }, { lang: 'Lua', label: 'entidades/pelota.lua', src: pelotaACA }, { lang: 'Lua', label: 'entidades/ladrillo.lua', src: ladrilloACA }] }
    ],
    practica: {
      t: 'El esqueleto del Breakout que abre sin errores',
      intro: 'En el equipo del ACA 1. Una persona comparte pantalla y escribe; las demás dictan desde su UML y revisan que cada archivo corresponda a una caja del diagrama.',
      pasos: [
        'Crea la carpeta del proyecto con <code>main.lua</code>, <code>conf.lua</code> y las carpetas <code>estados/</code> y <code>entidades/</code>.',
        'Escribe primero los cuatro estados con <code>update</code> y <code>draw</code> vacíos y un texto. Corre y recorre Title, Play, Pause y GameOver con el teclado.',
        'Agrega <code>Paleta</code>, <code>Pelota</code> y <code>Ladrillo</code>, uno por archivo, cada uno con <code>return</code> al final. Corre después de cada archivo.',
        'Compara con tu UML: ¿cada clase del diagrama tiene su archivo, con los mismos atributos y métodos? Corrige el que no coincida, el diagrama o el código.',
        'Si sobra tiempo: haz que Pause dibuje el juego congelado detrás del texto. Pista: Pause puede recibir a Play y llamar <code>jugar:draw()</code>.'
      ],
      entrega: 'Forma parte del ACA 1: la carpeta comprimida del esqueleto, que debe abrir y recorrer los cuatro estados sin errores.'
    },
    tarea: [
      'Entrega el ACA 1 completo: diagrama UML de clases, diagrama de estados (Title, Play, Pause, GameOver con sus eventos), tabla de responsabilidades, pseudocódigo del game loop y el esqueleto en Lua que abre sin errores.',
      'Termina Coin Hunt en archivos: agrega a <code>coin.lua</code> un método <code>Coin:toca(jugador)</code> con la distancia entre círculos y úsalo en <code>love.update</code> para sumar el puntaje.',
      'Para la sesión 6: lee en la wiki de LÖVE <code>love.graphics.rectangle</code> y <code>love.graphics.circle</code>, y piensa cómo sabrías si la pelota toca la paleta.',
      'Opcional: lee <code>class.lua</code> del proyecto ShapeArena y explica con tus palabras qué hace <code>__call</code>.'
    ],
    lecturas: [
      'Ierusalimschy, R. <i>Programming in Lua</i> (1.ª ed., gratis en lua.org/pil): capítulo 13, «Metatables and Metamethods», y capítulo 16, «Object-Oriented Programming».',
      'Manual de referencia de Lua 5.1 (lua.org/manual/5.1), sección 2.8, «Metatables», y la función <code>require</code>.',
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulo «State» (gratis en gameprogrammingpatterns.com).',
      'Sheepolution. <i>How to LÖVE</i> (sheepolution.com/learn/book): capítulos de clases y de módulos.',
      'Proyecto ShapeArena del curso: <code>class.lua</code> empaqueta el mismo patrón de hoy en una función <code>Class(padre)</code> con <code>__call</code>.'
    ],
    mapa: {
      lead: 'De la tabla con métodos al juego partido en archivos y estados.',
      nodos: [
        ['self', 'Punto y dos puntos', 'de dónde sale self', 'codigo', 'a:metodo(x) es a.metodo(a, x). Definir y llamar con dos puntos.'],
        ['meta', 'Metatablas', '__index', 'idea', 'Una nota pegada a la tabla: si no sabes algo, pregúntale a otra tabla.'],
        ['new', 'Patrón .new()', 'una clase en Lua', 'patron', 'Tabla de métodos con __index, constructor que hace setmetatable y métodos con dos puntos.'],
        ['herencia', 'Herencia', 'hija → padre', 'patron', 'La clase hija encadena su __index al padre y reutiliza su constructor.'],
        ['poli', 'Polimorfismo', 'un bucle, muchos tipos', 'idea', 'e:update(dt) en un bucle que no pregunta tipos. Tipo nuevo, bucle intacto.'],
        ['mod', 'Módulos', 'require y return', 'codigo', 'Un archivo por clase. require lo corre una vez y entrega lo que devolvió.'],
        ['estados', 'Estados como objetos', 'Title, Play, Pause, GameOver', 'patron', 'Cada estado con los mismos métodos; main delega en el actual.'],
        ['aca', 'ACA 1', 'Breakout en diseño', 'practica', 'UML, diagrama de estados, responsabilidades, pseudocódigo y el esqueleto que abre.'],
        ['errores', 'Errores comunes', 'punto por dos puntos, sin return', 'riesgo', 'self que recibe un número, __index olvidado, require que devuelve true.']
      ],
      cables: [
        ['self', 'new', 'llamada'], ['meta', 'new', 'datos'], ['new', 'herencia', 'llamada'], ['herencia', 'poli', 'llamada'],
        ['new', 'mod', 'datos'], ['poli', 'estados', 'llamada'], ['mod', 'estados', 'datos'], ['estados', 'aca', 'evento'],
        ['mod', 'aca', 'datos'], ['self', 'errores', 'llamada'], ['mod', 'errores', 'llamada']
      ]
    },

    slides: [
      { kind: 'portada', title: 'POO en Lua, módulos y estados',
        lead: 'Sesión 5 · Programación de Videojuegos',
        full: [
          { ul: ['Clases en un lenguaje que no tiene clases.', 'Un archivo por clase y require para unirlos.', 'Los estados del Breakout como objetos, y el cierre del ACA 1.'] },
          { pie: 'Hoy se entrega el ACA 1. Ten abierto tu UML y tu diagrama de estados: el taller los convierte en código.' }
        ],
        nota: '2 minutos. Lee la pregunta. Pide en el chat: ¿qué recuerdan del molde de galletas de la sesión 3? Respuesta esperada: un molde (clase), muchas galletas (instancias), cada una con su relleno (sus datos). Recuerda que el quiz preclase debe estar hecho.' },

      { kind: 'analogia', title: 'Si no sabes, pregúntale al hermano mayor',
        izq: 44,
        left: [
          { big: 'Tú guardas tus cosas. Lo que no sabes, lo preguntas en la familia.' },
          { clave: 'Lua busca primero en el objeto, luego en su clase, luego en el padre de la clase.', paso: true }
        ],
        right: [
          { mapa: [['Tus datos: tu nombre, tu edad', 'La instancia: <code>x</code>, <code>y</code>'], ['La receta de la familia', 'La clase: los métodos, una sola vez'], ['La nota en la nevera: «pregúntale a...»', 'La metatabla con <code>__index</code>'], ['El hermano mayor le pregunta al abuelo', 'La herencia: clase → padre']], de: 'En la familia', a: 'En Lua', pasos: true }
        ],
        nota: '4 minutos. Revela fila por fila. Pregunta: «si 100 pelotas necesitan saber moverse, ¿cuántas copias de la receta hacen falta?». Respuesta esperada: una, en la clase. Eso ahorra memoria y, sobre todo, permite cambiar la receta en un solo lugar.' },

      { kind: 'reto', title: 'Predice: ¿cómo hace POO un lenguaje sin clases?',
        izq: 48,
        left: [{ check: { q: 'Lua no tiene la palabra <code>class</code>. ¿Con qué se construye una clase?', opts: ['No se puede: Lua no es orientado a objetos', 'Con una tabla de métodos y una metatabla que dice dónde buscar', 'Instalando una librería obligatoria de LÖVE', 'Con una función por cada objeto'], ok: 1, why: 'Una tabla guarda los métodos y una metatabla con <code>__index</code> le dice a cada objeto dónde buscarlos. Hay librerías que lo empaquetan, pero por dentro hacen eso mismo.' } }],
        right: [
          { tabla: { head: ['Sesión 3 (pseudocódigo)', 'Sesión 5 (Lua)'], rows: [['CLASE Pelota', '<code>local Pelota = {}</code>'], ['nueva Pelota(x, y)', '<code>Pelota.new(x, y)</code>'], ['self', '<code>self</code>, que llega con los dos puntos'], ['HEREDA DE Entidad', '<code>setmetatable(Pelota, { __index = Entidad })</code>']] }, pasos: true }
        ],
        nota: '4 minutos. Votan antes de revelar la tabla. Error típico: «no se puede». Insiste: lo que diseñaron en la sesión 3 se traduce casi línea por línea. Esta tabla es el mapa de toda la clase.' },

      { kind: 'demo', title: 'Punto o dos puntos: a dónde llega cada cosa',
        izq: 30,
        left: [
          { big: '<code>p:mover(5)</code> es <code>p.mover(p, 5)</code>.' },
          { ul: ['Los dos puntos <b>al definir</b> agregan self.', 'Los dos puntos <b>al llamar</b> pasan el objeto.', 'Mezclarlos es el error número uno.'], pasos: true }
        ],
        right: [{ fig: 'puntos' }],
        nota: '6 minutos. Con la definición con dos puntos, recorre las cuatro llamadas. Antes de cada una pregunta: «¿qué recibe self?». La tercera (p.mover(5)) es la que más se ve en el ACA 2. Luego cambia a la definición con punto y llama p:mover(5): self es una global que no existe. Regla para el tablero: dos puntos al definir, dos puntos al llamar.' },

      { kind: 'codigo', title: 'self, en vivo',
        izq: 36,
        left: [
          { check: { q: '¿Qué imprime la línea 18?', opts: ['<code>true</code> y «Firulais ladra 3 veces»', '<code>false</code> y un error: self recibió el 3', '<code>nil</code>', 'Nada: pcall oculta todo'], ok: 1, why: '<code>pcall(perro.ladrar, 3)</code> llama a ladrar con un solo argumento: el 3 cae en self y <code>self.nombre</code> no tiene sentido. pcall atrapa el error y devuelve false con el mensaje.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: luaPuntos }], marca: [
          { l: [3, 4, 5], t: 'Con punto, <b>self es un parámetro normal</b>: hay que escribirlo y pasarlo.' },
          { l: [7, 8, 9], t: 'Con dos puntos, Lua agrega self <b>sin que lo escribas</b>.' },
          { l: [13, 14], t: 'Mismo resultado: los dos puntos al llamar ponen perro de primero.' },
          { l: [17, 18], t: 'Punto donde iban dos puntos: self recibe el 3. <code>pcall</code> atrapa el error para que lo veas sin detener el programa.' }
        ] }],
        nota: '6 minutos. Votan y recorren. Corre la pestaña en la página de la sesión. En LÖVE el mensaje es «attempt to index local \'self\' (a number value)»: que lo reconozcan. Pregunta: «¿cómo arreglo la línea 17?». Respuesta: pcall(perro.ladrar, perro, 3), o mejor, perro:ladrar(3).' },

      { kind: 'analogia', title: 'La metatabla: una nota que dice a quién preguntar',
        izq: 40,
        left: [
          { check: { q: 'Después de la línea 14, <code>Animal.patas</code> vale 3. ¿Qué imprime <code>perro.patas</code>?', opts: ['4: perro se guardó una copia', 'nil', '3: perro no tiene patas, se lo pregunta a Animal cada vez', 'Error'], ok: 2, why: '__index no copia: cada vez que pides <code>perro.patas</code>, Lua no lo encuentra en perro y va a Animal. Si Animal cambia, perro lo ve.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: '__index (pruébalo)', src: luaIndex }], marca: [
          { l: [4], t: 'Sin nota: perro no sabe de patas. <b>nil</b>.' },
          { l: [8], t: '<code>setmetatable</code> pega la nota: «lo que no sepas, pregúntaselo a Animal».' },
          { l: [10, 11], t: 'Busca primero en perro. Lo propio <b>gana</b>: el sonido es guau.' },
          { l: [12], t: '<code>rawget</code> mira solo dentro de perro, sin nota: patas no es suyo.' }
        ] }],
        nota: '6 minutos. Votan y recorren. Esta es la única idea nueva de verdad de la clase; lo demás es usarla. Pregunta: «¿qué pasa si perro y Animal tienen sonido?». Respuesta: gana el de perro, porque Lua solo pregunta cuando no encuentra. Así funciona sobrescribir un método.' },

      { kind: 'demo', title: 'La cadena de búsqueda, paso a paso',
        lead: 'Pide algo a la pelota y mira dónde lo encuentra Lua. Luego borra un eslabón.',
        top: true,
        full: [{ fig: 'cadena' }, { clave: 'Instancia → clase → padre. El primero que lo tiene, gana. Si nadie lo tiene: nil.', paso: true }],
        nota: '6 minutos. Orden sugerido: pelota.x (en la instancia), mover (en la clase), activo (en el padre), volar (nadie: nil). Luego desmarca «Pelota.__index = Pelota» y pide mover: ese es el error del ACA 2 que más tiempo roba. Marca «sobrescribe describir» y pregunta cuál gana. Toca las cajas para ver qué guarda cada tabla.' },

      { kind: 'codigo', title: 'La clase completa: el patrón .new()',
        izq: 34,
        left: [
          { check: { q: '¿Qué imprime la línea 21, <code>a.mover == b.mover</code>?', opts: ['<code>false</code>: cada pelota tiene su mover', '<code>true</code>: las dos encuentran el mismo mover en Pelota', '<code>nil</code>', 'Un error'], ok: 1, why: 'Ninguna pelota tiene mover propio. Las dos lo buscan en Pelota y encuentran la misma función. Por eso la línea 22 da nil.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Clase con .new() (pruébalo)', src: luaNew }, { lang: 'Pseudo', label: 'La clase en pseudocódigo', src: pseClase }], marca: [
          { l: [1, 2], t: '<b>1 · La tabla de la clase</b> y la nota: las instancias buscan aquí.' },
          { l: [4, 5, 6, 7, 8, 9], t: '<b>2 · El constructor:</b> tabla nueva, se le pega la clase, se llenan sus datos y se devuelve.' },
          { l: [11, 12, 13, 14], t: '<b>3 · Un método</b> con dos puntos: trabaja sobre self.' },
          { l: [16, 17, 18, 19, 20], t: '<b>4 · Instancias:</b> cada una con sus datos. Mover a no mueve b.' }
        ] }],
        nota: '7 minutos. Votan y recorren los cuatro pasos; que los copien en el cuaderno, son la plantilla de todo el ACA 2. Muestra la pestaña de pseudocódigo al lado. Pregunta: «¿por qué new va con punto y mover con dos puntos?». Respuesta: cuando llamas new todavía no existe el objeto; mover trabaja sobre uno que ya existe.' },

      { kind: 'antipatron', title: 'La línea que siempre se olvida',
        lead: 'Las dos versiones arrancan. Solo una funciona cuando llamas un método.',
        top: true,
        full: [{ compare: { a: { label: 'Sin __index', lang: 'Lua', src: sinIndex }, b: { label: 'Con __index', lang: 'Lua', src: conIndex } } }],
        nota: '3 minutos. Señala la única diferencia: la línea 2. Pregunta: «la pelota sí tiene metatabla en las dos, ¿por qué falla la izquierda?». Respuesta: porque la metatabla es Pelota y Pelota no tiene __index; la nota existe pero está en blanco.' },

      { kind: 'codigo', title: 'Herencia: la hija le pregunta al padre',
        izq: 34,
        left: [
          { check: { q: 'Ladrillo no define <code>actualizar</code>. ¿Qué imprime para el ladrillo?', opts: ['Un error: Ladrillo no tiene actualizar', '«pelota: rebotó»', '«ladrillo: no hago nada», el de Entidad', 'nil'], ok: 2, why: 'Ladrillo no lo tiene, así que Lua sigue la cadena hasta Entidad. self es el ladrillo, por eso dice «ladrillo».' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Herencia (pruébalo)', src: luaHerencia }, { lang: 'Pseudo', label: 'Pseudocódigo', src: pseHerencia }], marca: [
          { l: [1, 2, 3, 4, 5, 6, 7], t: 'El <b>padre</b>: una clase normal con new y dos métodos.' },
          { l: [9, 10], t: 'La <b>hija</b>: su clase le pregunta a Entidad. Y sus instancias le preguntan a Pelota.' },
          { l: [11, 12, 13, 14], t: 'El constructor de la hija: <b>primero el padre</b> arma la tabla, luego se le cambia la etiqueta.' },
          { l: [15], t: '<b>Sobrescribir:</b> Pelota define su propio actualizar y gana.' },
          { l: [21, 22, 23], t: 'Un bucle, dos clases. Ninguna pregunta de tipo.' }
        ] }],
        nota: '7 minutos. Votan y recorren. Corre la pestaña. Pregunta: «¿qué pasa si en la línea 13 olvido setmetatable(self, Pelota)?». Respuesta: la pelota queda con la etiqueta de Entidad y su actualizar dice «pelota: no hago nada». Advierte: en el Breakout la herencia es opcional; la composición de la sesión 3 sigue siendo la primera opción.' },

      { kind: 'demo', title: 'Polimorfismo: un bucle que no pregunta',
        izq: 30,
        left: [
          { big: 'Cada objeto sabe su update. El bucle solo dice «actualízate».' },
          { clave: 'Tipo nuevo: un archivo nuevo. El bucle no se abre.', paso: true }
        ],
        right: [{ fig: 'polimorfismo' }],
        nota: '5 minutos. Recorre la lista paso a paso en modo polimorfismo y luego agrega un tipo nuevo: cero líneas cambiadas en el bucle. Cambia a «Un if por tipo» y agrega otro: el contador sube. Pregunta: «¿en qué parte del Breakout van a usar este bucle?». Respuesta: en Play, para actualizar y dibujar paleta, pelota y ladrillos (y los power-ups si los hacen).' },

      { kind: 'idea', title: 'Encapsulación en Lua: acuerdo o candado',
        izq: 40,
        left: [
          { tabla: { head: ['', 'Cómo', 'Lua lo impide'], rows: [['Acuerdo', '<code>self._tomada</code>: el guion bajo dice «no me toques»', 'No'], ['Candado', 'Una <code>local</code> del archivo o de un closure', 'Sí']] }, pasos: true },
          { clave: 'Lo que importa es la interfaz: <code>recoger()</code>, no <code>_tomada = true</code>.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Encapsulación (pruébalo)', src: luaEncap }], marca: [
          { l: [4, 5, 6], t: 'El dato con guion bajo y los métodos que lo cuidan: la <b>interfaz</b> de la moneda.' },
          { l: [11], t: 'Lua deja tocarlo. Es un acuerdo, no una ley.' },
          { l: [14, 15, 16, 17], t: 'Una <code>local</code> dentro de la función: nadie de afuera la ve. Un closure la recuerda.' }
        ] }],
        nota: '5 minutos. No te detengas mucho en los closures: basta que sepan que existen. Pregunta: «¿qué ganan obligándose a usar recoger() en Coin Hunt?». Respuesta: si mañana recoger también suma puntaje o suena, se cambia en un solo lugar. Es el pilar de encapsulación de la sesión 3.' },

      { kind: 'analogia', title: 'Módulos: cajas con una etiqueta de salida',
        izq: 58,
        left: [{ fig: 'modulos' }],
        right: [
          { mapa: [['Una caja con piezas adentro', 'Un archivo .lua con sus locales'], ['La etiqueta de la caja', 'El <code>return</code> del final'], ['Pedir la caja al almacén', '<code>require("pelota")</code>'], ['El almacén guarda la caja abierta', '<code>package.loaded</code>: no se abre dos veces']], de: 'Almacén', a: 'Lua', pasos: true }
        ],
        nota: '5 minutos. En la figura: require pelota dos veces y cuenta las corridas. Luego marca «sin return», pide paleta y usa Paleta.new: el error de booleano. Pregunta: «¿qué devuelve require si olvidas el return?». Respuesta: true. Por eso el error habla de un boolean.' },

      { kind: 'codigo', title: 'Coin Hunt en archivos',
        izq: 34,
        left: [
          { check: { q: '<code>main.lua</code> y <code>coin.lua</code> hacen los dos <code>require("player")</code>. ¿Cuántas veces corre <code>player.lua</code>?', opts: ['Dos, una por cada require', 'Una: la segunda vez require entrega lo guardado', 'Ninguna hasta que llames Player.new', 'Depende del orden'], ok: 1, why: 'require corre el archivo la primera vez y guarda lo que devolvió en package.loaded. Mira la simulación: «corriendo pelota.lua» sale una sola vez.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'player.lua', src: playerLua }, { lang: 'Lua', label: 'Simular require (pruébalo)', src: luaRequire }, { lang: 'Lua', label: 'main.lua', src: mainCoin }], marca: [
          { l: [2, 3], t: 'La clase es una <b>local del archivo</b>: nadie la ve sin pedirla.' },
          { l: [5, 6, 7, 8, 9], t: 'El mismo patrón .new() de hace un rato.' },
          { l: [11, 12, 13, 14, 15, 16, 17], t: 'El update de Coin Hunt de la sesión 4, ahora con <b>self</b>.' },
          { l: [24], t: 'La <b>etiqueta de la caja</b>. Sin ella, require entrega true.' }
        ] }],
        nota: '6 minutos. Votan y recorren player.lua. Pasa a la simulación y córrela en el sitio. Termina en main.lua: el require no lleva .lua, y para carpetas se usa punto, require("estados.jugar"). Pregunta: «¿qué ganamos con esto frente al main.lua de 60 líneas de la sesión 4?». Respuesta: cada archivo hace una sola cosa y se puede leer solo.' },

      { kind: 'antipatron', title: 'Tres errores de módulos en cuatro líneas',
        top: true,
        full: [{ compare: { a: { label: 'Así no', lang: 'Lua', src: modMal }, b: { label: 'Así sí', lang: 'Lua', src: modBien } } }],
        nota: '3 minutos. Que encuentren los tres antes de leer: falta el return, require con .lua y una global (Bola sin local). Aclara que require("paleta.lua") busca un archivo paleta/lua.lua, porque el punto significa carpeta. El ... en Paleta.new es para abreviar en la slide; el código completo está en la página.' },

      { kind: 'demo', title: 'Los estados del Breakout son objetos',
        izq: 30,
        left: [
          { big: 'main.lua no sabe en qué estado está. Solo le pasa el turno al actual.' },
          { pie: 'Es el patrón State de la sesión 3, ya en Lua.', paso: true }
        ],
        right: [{ fig: 'estados' }],
        nota: '6 minutos. Recorre: Enter, se cae la pelota dos veces, P, P (las vidas se conservan), se cae una vez más: GameOver, Enter. Pulsa P en Title: no pasa nada y está bien. Marca «Con banderas en main» para ver la alternativa. Pregunta: «¿qué hay que tocar para agregar un estado Victoria?». Respuesta: un archivo nuevo y una línea en la tabla estados de main.' },

      { kind: 'codigo', title: 'main.lua: cuatro líneas que delegan',
        izq: 34,
        left: [
          { check: { q: 'En Pause pulsas P. Pause llama <code>self.cambiar("jugar")</code>, sin el <code>true</code>. ¿Qué pasa con las vidas?', opts: ['Se reinician a 3', 'Se conservan: Play solo reinicia si llega nuevo = true', 'Se pierden todas', 'Error: falta un argumento'], ok: 1, why: 'Jugar:entrar revisa <code>if not nuevo then return end</code>: volver de la pausa no crea paleta ni pelota nuevas. Solo Title pide partida nueva.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'main.lua', src: mainACA }, { lang: 'Lua', label: 'Estados (pruébalo)', src: luaEstados }, { lang: 'Lua', label: 'estados/titulo.lua', src: tituloACA }], marca: [
          { l: [2, 3, 4, 5, 6, 7], t: 'Una tabla con los cuatro estados, uno por archivo, dentro de la carpeta <code>estados</code>.' },
          { l: [10, 11, 12, 13], t: '<code>cambiar</code>: guarda el nuevo estado y le avisa con <code>entrar</code>. Le pasa la propia función para que el estado pida el siguiente.' },
          { l: [15, 16, 17], t: 'Todo el game loop: <b>delegar</b>. Ni un if por estado.' },
          { l: [18, 19, 20, 21], t: 'Escape sale siempre; el resto de teclas las decide el estado.' }
        ] }],
        nota: '7 minutos. Votan y recorren. Corre en el sitio la pestaña «Estados (pruébalo)»: la x en Title no hace nada, el return pasa a Play. Pregunta: «¿por qué los estados reciben cambiar en vez de llamar a main?». Respuesta: para que no dependan de main; solo saben pedir el siguiente. Menos acoplamiento, como en la sesión 3.' },

      { kind: 'idea', title: 'ACA 1: qué se entrega hoy',
        full: [
          { tabla: { head: ['Pieza', 'Qué debe mostrar'], rows: [
            ['1 · Diagrama UML de clases', 'Paleta, Pelota, Ladrillo, los estados y main, con atributos, métodos y relaciones'],
            ['2 · Diagrama de estados', 'Title, Play, Pause y GameOver, con el evento de cada flecha'],
            ['3 · Tabla de responsabilidades', 'Por clase: qué sabe, qué hace y con quién colabora'],
            ['4 · Pseudocódigo del game loop', 'Qué hacen load, update y draw y a quién delegan'],
            ['5 · Esqueleto en Lua', 'main.lua, conf.lua y un archivo por clase; abre y recorre los estados sin errores']
          ] }, pasos: true },
          { clave: 'Cada caja del UML debe tener su archivo, y cada archivo, su caja.', paso: true }
        ],
        nota: '4 minutos. Revela fila por fila. Recalca la última frase: es lo primero que se revisa. Pregunta: «¿cuál de las cinco les falta?». Lo más común: la tabla de responsabilidades y los eventos de las flechas del diagrama de estados. Recuerda el canal y la hora de entrega que estén publicados en el aula.' },

      { kind: 'idea', title: 'El UML del Breakout, listo para comparar',
        izq: 64,
        left: [{ svg: svgUML }],
        right: [
          { ul: ['Los cuatro estados <b>cumplen el mismo contrato</b>.', 'Play <b>tiene</b> una paleta, una pelota y varios ladrillos.', 'main solo conoce «un Estado».'], pasos: true },
          { pie: 'Tu diagrama puede tener más clases: power-ups, niveles, marcador. Debe justificar cada una.', paso: true }
        ],
        nota: '4 minutos. No es la única respuesta correcta: es una referencia mínima. Pregunta: «¿por qué Play tiene a la paleta y no main?». Respuesta: porque la paleta solo existe mientras se juega; en Title no hay paleta. Las flechas punteadas con triángulo hueco son «cumple el contrato»; los rombos llenos son composición, como en la sesión 3.' },

      { kind: 'idea', title: 'La tabla de responsabilidades',
        lead: 'Una fila por clase. Si una fila no cabe en una línea, esa clase hace demasiado.',
        full: [
          { tabla: { head: ['Clase', 'Sabe', 'Hace', 'Colabora con'], rows: [
            ['<b>Paleta</b>', 'x, y, ancho, velocidad', 'Se mueve con las flechas sin salirse; se dibuja', 'Play'],
            ['<b>Pelota</b>', 'x, y, radio, vx, vy', 'Avanza con dt, rebota en paredes y techo; se dibuja', 'Play'],
            ['<b>Ladrillo</b>', 'x, y, tamaño, si sigue vivo', 'Se dibuja si está vivo', 'Play'],
            ['<b>Play</b>', 'Las entidades y las vidas', 'Actualiza y dibuja todo; pide GameOver', 'Paleta, Pelota, Ladrillo, main'],
            ['<b>main</b>', 'Los estados y cuál es el actual', 'Cambia de estado y delega', 'Todos los estados']
          ] }, pasos: true }
        ],
        nota: '4 minutos. Revela fila por fila. Pregunta: «¿quién debe saber cuántas vidas quedan: la Pelota o Play?». Respuesta esperada: Play; la pelota solo sabe moverse. Error común: la Pelota que resta vidas y cambia de estado, y así termina sabiendo de todo el juego.' },

      { kind: 'reto', title: 'Antes de mirar el esqueleto', left: [{ p: 'Corres el esqueleto del ACA 1 y la pelota cae a través de la paleta.' }], right: [{ check: { q: 'Al correr el esqueleto, la pelota atraviesa la paleta. ¿Es un error del ACA 1?', opts: ['Sí: el esqueleto debe tener colisiones', 'No: las colisiones son de la sesión 6; el esqueleto debe abrir y recorrer los estados', 'Sí: hay que borrar la paleta', 'No importa nada mientras compile'], ok: 1, why: 'El ACA 1 es el diseño y un esqueleto que abre sin errores. Que la pelota caiga sirve para probar el paso de Play a GameOver. Los choques llegan con el ACA 2.' } }], izq: 40,
        nota: 'Que voten antes de ver el código. El ACA 1 pide diseño y un esqueleto que abre y recorre estados; las colisiones son de la sesión 6.' },

      { kind: 'codigo', title: 'El esqueleto por dentro: Play y una entidad',
        top: true,
        full: [{ code: [{ lang: 'Lua', label: 'estados/jugar.lua', src: jugarACA }, { lang: 'Lua', label: 'entidades/pelota.lua', src: pelotaACA }, { lang: 'Lua', label: 'estados/pausa.lua', src: pausaACA }], marca: [
          { l: [2, 3, 4], t: 'Play pide sus piezas. La carpeta va con punto.' },
          { l: [7, 8, 9, 10, 11, 12, 13], t: '<code>entrar</code>: si es partida nueva, crea paleta, pelota, 10 ladrillos y 3 vidas.' },
          { l: [14, 15, 16, 17, 18, 19, 20], t: '<code>update</code>: delega en las entidades y decide cuándo pedir GameOver.' },
          { l: [21, 22, 23, 24, 25], t: '<code>draw</code>: cada entidad se dibuja sola.' }
        ] }],
        nota: '6 minutos. Votan y recorren jugar.lua; pasa a pelota.lua y señala el math.abs: evita que la pelota quede temblando en la pared. Pregunta: «¿dónde van a poner la colisión pelota-paleta en el ACA 2?». Respuesta razonable: en Play:update, porque es quien conoce a las dos.' },

      { kind: 'actividad', title: 'Taller: el esqueleto que abre · 20 minutos',
        lead: 'Con tu equipo del ACA 1. Una persona escribe; las demás dictan desde el UML.',
        izq: 56,
        left: [{ ol: ['Carpetas: <code>estados/</code> y <code>entidades/</code>, más <code>main.lua</code> y <code>conf.lua</code>.', 'Los cuatro estados con un texto. Corre y recórrelos.', 'Paleta, Pelota y Ladrillo, uno por archivo. Corre después de cada uno.', 'Compara archivo por archivo con tu UML.'], pasos: true }],
        right: [{ panel: ['Si truena, lee la primera línea: archivo y línea. Los tres sospechosos de hoy: punto por dos puntos, __index olvidado y un módulo sin return.'], h: 'Antes de pedir ayuda' }, { pie: 'Lo que salga de aquí va en la entrega del ACA 1.', paso: true }],
        nota: '20 minutos en salas por equipo. Pasa por todas. Errores que vas a ver: module \'estados.jugar\' not found (carpeta mal nombrada o archivo con mayúscula), attempt to index local \'self\' (punto por dos puntos), attempt to call method \'update\' (a nil value) (falta __index o el método tiene otro nombre). Al volver, un equipo muestra su esqueleto corriendo 1 minuto.' },

      { kind: 'antipatron', title: 'Lo que dice el error y lo que significa',
        full: [
          { tabla: { head: ['Mensaje de LÖVE', 'Causa más probable'], rows: [
            ['<i>attempt to index local \'self\' (a number value)</i>', 'Llamaste con punto un método de dos puntos'],
            ['<i>attempt to call method \'mover\' (a nil value)</i>', 'Falta <code>Clase.__index = Clase</code> o el nombre está mal escrito'],
            ['<i>attempt to index local \'Paleta\' (a boolean value)</i>', 'El módulo no termina con <code>return</code>'],
            ['<i>module \'estados.jugar\' not found</i>', 'Carpeta o archivo mal nombrado, o escribiste .lua en el require'],
            ['La hija se comporta como el padre', 'Olvidaste <code>setmetatable(self, Hija)</code> en su constructor']
          ] }, pasos: true }
        ],
        nota: '4 minutos. Chuleta para el ACA 2; pide que la guarden. Pregunta: «¿cuál les salió en el taller?». Recuerda que en Windows el sistema de archivos no distingue mayúsculas, pero un .love o un compañero en Mac sí: nombra los archivos en minúscula.' },

      { kind: 'reto', title: 'Antes de irte: quiz postclase',
        izq: 50,
        left: [
          { p: 'Ocho preguntas sobre las cinco ideas de hoy. Es la misma medición del quiz preclase.' },
          { check: { q: 'Calentamiento: ¿qué línea falta si <code>p:mover(dt)</code> dice «attempt to call method \'mover\' (a nil value)» y mover sí está definido?', opts: ['<code>return Pelota</code>', '<code>Pelota.__index = Pelota</code>', '<code>local p = {}</code>', '<code>love.load()</code>'], ok: 1, why: 'Sin __index la pelota tiene metatabla pero no sabe dónde buscar sus métodos.' } }
        ],
        right: [{ panel: ['C1 · Punto y dos puntos', 'C2 · Metatablas y .new()', 'C3 · Herencia y polimorfismo', 'C4 · Módulos con require', 'C5 · Estados como objetos'], h: 'Lo que mide el quiz' }],
        nota: '2 minutos para la pregunta y 8 para el quiz en el sitio. Luego cierre y entrega del ACA 1.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Los dos puntos</b> pasan el objeto: <code>a:m(x)</code> es <code>a.m(a, x)</code>.', '<b>Una clase</b> es una tabla de métodos con <code>__index</code>; la herencia encadena esa nota hasta el padre, y un solo bucle mueve a todos.', '<b>Un archivo por clase</b> con <code>return</code>, unidos por <code>require</code>; los estados son objetos y main solo delega.'], pasos: true },
          { p: 'Hoy: entrega del ACA 1. <b>Siguiente sesión:</b> figuras y colisiones; abre el ACA 2 y la pelota por fin choca con algo.', paso: true }
        ],
        nota: '3 minutos. Pregunta de salida: «¿cómo construyo clases en un lenguaje que no tiene clases?». Respuesta esperada: con una tabla de métodos y una metatabla cuyo __index apunta a ella; la herencia es encadenar otra. Recuerda dónde y hasta cuándo se entrega el ACA 1 según el aula.' }
    ],

    pre: [
      { q: 'En Lua, <code>perro:ladrar()</code> es exactamente lo mismo que...', opts: ['<code>perro.ladrar()</code>', '<code>perro.ladrar(perro)</code>', '<code>ladrar(perro.self)</code>', '<code>perro.self.ladrar()</code>'], ok: 1, why: 'Los dos puntos pasan el objeto como primer argumento, que dentro de la función se llama self. Con punto y sin argumento, self quedaría vacío.', idea: 'C1' },
      { q: 'Lua no tiene la palabra <code>class</code>. ¿Con qué se construyen las clases?', opts: ['No se puede hacer POO en Lua', 'Con tablas y metatablas', 'Con la palabra <code>struct</code>', 'Solo con una librería que trae LÖVE'], ok: 1, why: 'Una tabla guarda los métodos y una metatabla con __index le dice a cada objeto dónde buscarlos. Las librerías de clases hacen eso por dentro.', idea: 'C2' },
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: `local Animal = { patas = 4 }\nlocal perro = setmetatable({}, { __index = Animal })\nprint(perro.patas)` }, opts: ['<code>nil</code>', 'Un error', '<code>4</code>', '<code>0</code>'], ok: 2, why: 'perro no tiene patas, pero su metatabla dice «pregúntale a Animal» con __index. Quien responde nil olvida que la búsqueda sigue la nota.', idea: 'C2' },
      { q: 'Tienes una lista con una pelota, una paleta y un ladrillo, cada uno con su propio <code>update</code>. El bucle hace <code>e:update(dt)</code> con cada uno. ¿Qué pasa?', opts: ['Todos corren el update de la pelota, que es el primero', 'Da error porque son de clases distintas', 'Hay que poner un if por tipo dentro del bucle', 'Cada uno corre su propio update'], ok: 3, why: 'Eso es polimorfismo: el mismo mensaje, y cada objeto responde a su manera. El bucle no necesita saber de qué tipo es cada uno.', idea: 'C3' },
      { q: '¿Qué debe tener un archivo <code>pelota.lua</code> en su última línea para que <code>require("pelota")</code> entregue la clase?', opts: ['<code>return Pelota</code>', '<code>print(Pelota)</code>', '<code>export Pelota</code>', 'Nada: require toma todo el archivo'], ok: 0, why: 'require entrega lo que el archivo devuelve con return. Sin return, entrega true y el juego se cae al usar la clase.', idea: 'C4' },
      { q: 'En el Breakout, ¿qué significa tener «estados de juego como objetos»?', opts: ['Variables enMenu, enPausa y enJuego con if en cada callback', 'Cada estado es una tabla con su propio update, draw y keypressed, y main llama al estado actual', 'Un archivo distinto para cada nivel', 'Guardar la partida en un archivo'], ok: 1, why: 'Es el patrón State de la sesión 3: cada estado sabe comportarse y decide a cuál pasar. main no necesita un if por estado.', idea: 'C5' }
    ],
    post: [
      { q: 'Con <code>function Pelota:mover(dx) self.x = self.x + dx end</code>, alguien escribe <code>p.mover(5)</code>. ¿Qué pasa?', opts: ['Funciona igual que p:mover(5)', 'self recibe el 5 y se cae: no se puede indexar un número', 'dx vale 5 y self vale p', 'Lua ignora la llamada'], ok: 1, why: 'Con punto no se pasa el objeto: el 5 cae en self, y self.x no tiene sentido. El arreglo es p:mover(5) o p.mover(p, 5).', idea: 'C1' },
      { q: 'Definiste la clase sin la línea <code>Pelota.__index = Pelota</code>. Al llamar <code>p:mover(dt)</code>...', opts: ['Funciona: setmetatable basta', 'Se mueve, pero más lento', 'Error: mover es nil, porque la pelota no sabe dónde buscar sus métodos', 'Mueve todas las pelotas a la vez'], ok: 2, why: 'La pelota tiene metatabla (Pelota), pero Pelota no tiene __index. Sin esa nota, Lua no busca en ninguna parte y mover vale nil.', idea: 'C2' },
      { q: 'Creas 100 pelotas con <code>Pelota.new()</code>. ¿Cuántas copias de la función <code>mover</code> existen?', opts: ['100, una dentro de cada pelota', 'Una sola, en la tabla Pelota', 'Ninguna hasta que se llama', 'Dos: una en Pelota y otra en la metatabla'], ok: 1, why: 'Las pelotas solo guardan sus datos. Cada vez que piden mover, Lua lo encuentra en Pelota. Por eso <code>rawget(p, "mover")</code> da nil.', idea: 'C2' },
      { q: 'Ladrillo hereda de Entidad. Entidad define <code>describir</code> y Ladrillo no. ¿Qué pasa con <code>ladrillo:describir()</code>?', opts: ['Error: Ladrillo no tiene describir', 'Devuelve nil', 'Corre el describir de Entidad, con self igual al ladrillo', 'Corre el describir de la primera clase creada'], ok: 2, why: 'Lua busca en el ladrillo, luego en Ladrillo y luego en Entidad. self sigue siendo el ladrillo, así que el texto habla del ladrillo.', idea: 'C3' },
      { q: 'En el Breakout agregas un PowerUp nuevo con su propio <code>update</code>. ¿Qué cambias en <code>for _, e in ipairs(entidades) do e:update(dt) end</code>?', opts: ['Nada: el bucle no pregunta tipos', 'Un elseif para PowerUp', 'Un bucle aparte solo para power-ups', 'Reescribir el bucle con pairs'], ok: 0, why: 'El polimorfismo deja el bucle cerrado: cualquier objeto que responda a update entra en la lista. Lo nuevo va en su propio archivo.', idea: 'C3' },
      { q: '<code>main.lua</code> y <code>estados/jugar.lua</code> hacen los dos <code>require("entidades.pelota")</code>. ¿Qué pasa?', opts: ['pelota.lua corre dos veces y hay dos clases Pelota distintas', 'Error: un módulo solo se puede pedir una vez', 'pelota.lua corre una vez; los dos reciben la misma tabla', 'El segundo require devuelve nil'], ok: 2, why: 'require guarda en package.loaded lo que devolvió el archivo la primera vez y lo entrega igual después. El archivo no vuelve a correr.', idea: 'C4' },
      { q: 'En <code>coin.lua</code> el campo se llama <code>_tomada</code>. ¿Qué significa el guion bajo?', opts: ['Lua impide tocarlo desde afuera', 'Es un acuerdo: no lo toques directo, usa <code>recoger()</code>; Lua no lo impide', 'Que el campo es global', 'Que es una constante'], ok: 1, why: 'Lua no tiene private. El guion bajo es una convención de encapsulación. Para privado de verdad se usa una local del módulo o un closure.', idea: 'C4' },
      { q: 'En el esqueleto del ACA 1, ¿cuál es todo el <code>love.update</code> de main.lua?', opts: ['<code>if enTitulo then ... elseif enJuego then ... end</code>', '<code>pelota:update(dt); paleta:update(dt)</code>', '<code>actual:update(dt)</code>', 'Está vacío: cada estado se actualiza solo'], ok: 2, why: 'main delega en el estado actual. Si estás en Play, corre Play:update; si estás en Pause, Pause:update, que no hace nada. Las entidades las actualiza Play.', idea: 'C5' }
    ]
  };
})();
