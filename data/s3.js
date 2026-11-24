(function () {
  /* ---------- Código completo (página de la sesión) ---------- */
  const globalesPseudo = `-- Antes: una variable suelta por cada dato de cada cosa
bola_x ← 400        bola_y ← 300
ladrillo1_x ← 40    ladrillo1_golpes ← 1
ladrillo2_x ← 120   ladrillo2_golpes ← 2
... y así, cincuenta veces

-- Después: un objeto junta lo que va junto
clase Ladrillo
    estado:          x, y, golpes
    comportamiento:  recibirGolpe(), estaVivo(), dibujar()`;
  const objetoLua = `-- Un ladrillo: sus datos (estado) y lo que sabe hacer (comportamiento)
local ladrillo = { x = 40, y = 60, golpes = 2 }

function ladrillo.recibirGolpe(self)
    self.golpes = self.golpes - 1
end

function ladrillo.estaVivo(self)
    return self.golpes > 0
end

-- Los dos puntos le pasan el ladrillo a la función como "self"
ladrillo:recibirGolpe()
print("¿vivo?", ladrillo:estaVivo(), "golpes:", ladrillo.golpes)
ladrillo:recibirGolpe()
print("¿vivo?", ladrillo:estaVivo(), "golpes:", ladrillo.golpes)`;

  const moldePseudo = `clase Ladrillo                        -- el molde: se escribe una vez
    crear(x, y, golpes):
        self.x ← x
        self.y ← y
        self.golpes ← golpes
    recibirGolpe():
        self.golpes ← self.golpes − 1

a ← Ladrillo.crear(40, 60, 1)          -- instancias: tantas como quieras
b ← Ladrillo.crear(120, 60, 3)
a.recibirGolpe()                       -- solo cambia a; b sigue con 3`;
  const moldeLua = `-- El molde: una función que fabrica ladrillos
local function nuevoLadrillo(x, y, golpes)
    local l = { x = x, y = y, golpes = golpes }
    function l.recibirGolpe(self)
        self.golpes = self.golpes - 1
    end
    return l
end

-- Tres galletas del mismo molde
local a = nuevoLadrillo(40, 60, 1)
local b = nuevoLadrillo(120, 60, 3)
local c = nuevoLadrillo(200, 60, 2)

b:recibirGolpe()                 -- solo b pierde un golpe
for i, l in ipairs({ a, b, c }) do
    print("ladrillo " .. i .. " en x = " .. l.x .. ", golpes = " .. l.golpes)
end`;

  const encPseudo = `-- Meter la mano: cualquiera cambia el dato y nadie revisa
jugador.vidas ← jugador.vidas − 5      -- ¿y si queda en −2?

-- Pedir: el objeto decide y protege sus propias reglas
jugador.perderVida()

clase Jugador
    perderVida():
        si self.vidas > 0:
            self.vidas ← self.vidas − 1
            si self.vidas = 0: avisar «fin de la partida»
    vidas(): devolver self.vidas`;
  const encLua = `local function nuevoJugador()
    local j = { _vidas = 3 }      -- el guion bajo dice: no lo toques desde afuera

    function j.perderVida(self)
        if self._vidas > 0 then
            self._vidas = self._vidas - 1
            if self._vidas == 0 then
                print("  -> fin de la partida")
            end
        end
    end

    function j.vidas(self)
        return self._vidas
    end
    return j
end

local jugador = nuevoJugador()
for golpe = 1, 5 do
    jugador:perderVida()
    print("golpe " .. golpe .. ": vidas = " .. jugador:vidas())
end`;

  const polyPseudo = `clase Entidad                          -- lo que todas comparten
    x, y
    actualizar(dt): no hace nada
    dibujar()

clase Bola es una Entidad              -- herencia: «es un»
    actualizar(dt): moverse y rebotar
clase PowerUp es una Entidad
    actualizar(dt): caer despacio

-- Polimorfismo: un bucle, muchos objetos
para cada objeto en objetos:
    objeto.actualizar(dt)              -- cada uno a su manera`;
  const polyLua = `-- Tres objetos distintos con la misma función: actualizar
local bola     = { nombre = "bola",     y = 300 }
local powerUp  = { nombre = "power-up", y = 100 }
local ladrillo = { nombre = "ladrillo", y = 60 }

function bola.actualizar(self, dt)     self.y = self.y - 400 * dt end  -- sube rápido
function powerUp.actualizar(self, dt)  self.y = self.y + 60 * dt end   -- cae despacio
function ladrillo.actualizar(self, dt) end                             -- se queda quieto

local objetos = { bola, powerUp, ladrillo }

-- El bucle no sabe ni le importa qué es cada uno
for _, o in ipairs(objetos) do
    local antes = o.y
    o:actualizar(0.5)
    print(o.nombre .. ": y pasó de " .. antes .. " a " .. o.y)
end`;
  const compLua = `-- Composición: la entidad TIENE piezas, en vez de SER una subclase
local function Cae(velocidad)
    return { actualizar = function(self, e, dt) e.y = e.y + velocidad * dt end }
end
local function Parpadea()
    return { actualizar = function(self, e, dt) e.visible = not e.visible end }
end

-- Un power-up armado con dos piezas. Ninguna clase nueva.
local powerUp = { y = 0, visible = true, piezas = { Cae(60), Parpadea() } }

for _, pieza in ipairs(powerUp.piezas) do
    pieza:actualizar(powerUp, 0.5)
end
print("y = " .. powerUp.y .. ", visible = " .. tostring(powerUp.visible))`;

  const statePseudo = `-- Cada estado del juego es un objeto con las mismas funciones
Title:     tecla Enter → pedir Play
Play:      actualizar(dt): mover bola y paleta, revisar ladrillos
           tecla P → pedir Pause · sin vidas → pedir GameOver
Pause:     tecla P → pedir Play
GameOver:  tecla R → pedir Title

clase MaquinaDeEstados
    actual ← Title
    cambiar(nuevo):   actual.salir() · actual ← nuevo · actual.entrar()
    actualizar(dt):   actual.actualizar(dt)      -- delega
    dibujar():        actual.dibujar()
    teclaPulsada(t):  si actual.tecla(t) pide otro estado → cambiar`;
  const stateLua = `-- Cada estado: una tabla que decide qué hacer con una tecla
local Title    = { nombre = "Title" }
local Play     = { nombre = "Play" }
local Pause    = { nombre = "Pause" }
local GameOver = { nombre = "GameOver" }

function Title.tecla(t)    if t == "enter" then return Play end end
function Play.tecla(t)     if t == "p" then return Pause end
                           if t == "sinVidas" then return GameOver end end
function Pause.tecla(t)    if t == "p" then return Play end end
function GameOver.tecla(t) if t == "r" then return Title end end

-- La máquina solo guarda el estado actual y le delega
local actual = Title
for _, t in ipairs({ "p", "enter", "p", "p", "sinVidas", "r" }) do
    local siguiente = actual.tecla(t)
    if siguiente then
        print(actual.nombre .. " + " .. t .. " -> " .. siguiente.nombre)
        actual = siguiente
    else
        print(actual.nombre .. " + " .. t .. " -> (se ignora)")
    end
end`;
  const esqueletoLua = `-- Estructura del proyecto Breakout (ACA 1)
--   conf.lua          la ventana
--   main.lua          arranca y le delega todo a la máquina de estados
--   Paleta.lua  Bola.lua  Ladrillo.lua  Nivel.lua  MaquinaDeEstados.lua
--   estados/Title.lua  Play.lua  Pause.lua  GameOver.lua

-- conf.lua
function love.conf(t)
    t.window.title = "Breakout"
    t.window.width, t.window.height = 800, 600
end

-- main.lua (require lo vemos en la sesión 5)
local Maquina = require("MaquinaDeEstados")
local maquina

function love.load()         maquina = Maquina.nueva("Title") end
function love.update(dt)     maquina:actualizar(dt) end
function love.draw()         maquina:dibujar() end
function love.keypressed(k)  maquina:teclaPulsada(k) end`;

  /* ---------- Versiones cortas para las slides ---------- */
  const globalesCorto = `-- una variable suelta por cada dato...
bola_x, bola_y = 400, 300
paleta_x, paleta_ancho = 350, 100
ladrillo1_x, ladrillo1_golpes = 40, 1
ladrillo2_x, ladrillo2_golpes = 120, 2
ladrillo3_x, ladrillo3_golpes = 200, 1
-- ...y así para cada ladrillo

-- golpear al ladrillo 2:
ladrillo2_golpes = ladrillo2_golpes - 1`;
  const objetoCorto = `local ladrillo = { x = 40, y = 60, golpes = 2 }

function ladrillo.recibirGolpe(self)
    self.golpes = self.golpes - 1
end

function ladrillo.estaVivo(self)
    return self.golpes > 0
end

ladrillo:recibirGolpe()   -- igual que ladrillo.recibirGolpe(ladrillo)`;
  const meterMano = `-- La bola, el enemigo y la trampa
-- restan vidas por su cuenta:
jugador.vidas = jugador.vidas - 1
jugador.vidas = jugador.vidas - 5

-- vidas = -3 y el juego sigue.
-- ¿Quién debía revisar el fin
-- de la partida? Nadie sabe.`;
  const pedir = `-- Todos piden; el jugador decide
jugador:perderVida()

function jugador.perderVida(self)
    if self._vidas > 0 then
        self._vidas = self._vidas - 1
        if self._vidas == 0 then
            avisarFinDePartida()
        end
    end
end`;
  const polyCorto = `-- El bucle de Play: tonto a propósito
for _, o in ipairs(objetos) do
    o:actualizar(dt)      -- ¿bola? ¿power-up?
end                       -- no le importa

for _, o in ipairs(objetos) do
    o:dibujar()
end

-- cada uno trae su propia versión:
--   Bola.actualizar(self, dt):    se mueve y rebota
--   PowerUp.actualizar(self, dt): cae despacio`;
  const arbolCorto = `Entidad
└── PowerUp
    ├── PowerUpQueCae
    │   └── PowerUpQueCaeYParpadea
    └── PowerUpQueParpadea
        └── PowerUpQueParpadeaYDaVida

-- ¿y el que cae, parpadea y da vida?
-- ¿de quién hereda?`;
  const piezasCorto = `-- El power-up TIENE piezas
local vida = {
    piezas = { Cae(60), Parpadea(), DaVida(1) }
}

-- cada pieza: una tarea
for _, p in ipairs(vida.piezas) do
    p:actualizar(vida, dt)
end

-- otro power-up = otra mezcla,
-- ninguna clase nueva`;
  const stateCorto = `local Pause = { nombre = "Pause" }

function Pause.entrar()   -- al llegar: bajar la música
end

function Pause.tecla(t)
    if t == "p" then return Play end   -- pide volver
end

function Pause.dibujar()
    love.graphics.print("PAUSA", 360, 280)
end

-- main.lua solo delega:
function love.keypressed(k) maquina:teclaPulsada(k) end`;

  /* ---------- Ilustraciones (paleta del curso, esquinas rectas) ---------- */
  const svgObjeto = `<svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Caja de la clase Ladrillo: nombre, estado y comportamiento">
<rect width="520" height="420" fill="#1B1A2E"/>
<rect x="60" y="30" width="400" height="360" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="3"/>
<rect x="60" y="30" width="400" height="70" rx="2" fill="#FF5D3A"/>
<text x="260" y="76" font-size="34" font-weight="800" fill="#1B1A2E" text-anchor="middle">Ladrillo</text>
<line x1="60" y1="230" x2="460" y2="230" stroke="#F4F1E8" stroke-width="3"/>
<text x="80" y="132" font-size="18" font-weight="700" fill="#FFC83D">ESTADO · lo que sabe</text>
<text x="80" y="168" font-size="24" fill="#F4F1E8" font-family="monospace">x, y, ancho, alto</text>
<text x="80" y="204" font-size="24" fill="#F4F1E8" font-family="monospace">golpes</text>
<text x="80" y="262" font-size="18" font-weight="700" fill="#3BC4A3">COMPORTAMIENTO · lo que hace</text>
<text x="80" y="298" font-size="24" fill="#F4F1E8" font-family="monospace">recibirGolpe()</text>
<text x="80" y="334" font-size="24" fill="#F4F1E8" font-family="monospace">estaVivo()</text>
<text x="80" y="370" font-size="24" fill="#F4F1E8" font-family="monospace">dibujar()</text>
</svg>`;
  const svgHerencia = `<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Herencia: Bola, Paleta y Ladrillo son una Entidad; LadrilloDuro es un Ladrillo">
<defs><marker id="s3h" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="14" markerHeight="14" orient="auto"><path d="M1 1L11 6L1 11z" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="1.5"/></marker></defs>
<rect width="700" height="400" fill="#1B1A2E"/>
<rect x="250" y="20" width="200" height="80" rx="2" fill="#1B1A2E" stroke="#FFC83D" stroke-width="3"/>
<text x="350" y="56" font-size="28" font-weight="800" fill="#F4F1E8" text-anchor="middle">Entidad</text>
<text x="350" y="84" font-size="18" fill="#6E6B85" text-anchor="middle">x, y · actualizar · dibujar</text>
<g font-size="26" font-weight="800" fill="#F4F1E8" text-anchor="middle">
<rect x="30" y="180" width="180" height="64" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="3"/><text x="120" y="221">Bola</text>
<rect x="260" y="180" width="180" height="64" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="3"/><text x="350" y="221">Paleta</text>
<rect x="490" y="180" width="180" height="64" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="3"/><text x="580" y="221">Ladrillo</text>
<rect x="490" y="310" width="180" height="64" rx="2" fill="#1B1A2E" stroke="#3BC4A3" stroke-width="3"/><text x="580" y="351" font-size="22">LadrilloDuro</text>
</g>
<g stroke="#F4F1E8" stroke-width="2.5" fill="none">
<path d="M120 180 V140 H350 V112" marker-end="url(#s3h)"/>
<path d="M350 180 V112"/>
<path d="M580 180 V140 H350"/>
<path d="M580 310 V258" marker-end="url(#s3h)"/>
</g>
<text x="40" y="330" font-size="22" fill="#FF5D3A" font-weight="700">triángulo hueco = «es un»</text>
<text x="40" y="364" font-size="20" fill="#6E6B85">el hijo hereda lo del padre y cambia solo lo distinto</text>
</svg>`;
  const svgUML = `<svg viewBox="0 0 900 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Borrador de diagrama de clases del Breakout">
<defs>
<marker id="s3t" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="14" markerHeight="14" orient="auto"><path d="M1 1L11 6L1 11z" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="1.5"/></marker>
<marker id="s3a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#F4F1E8" stroke-width="2"/></marker>
</defs>
<rect width="900" height="470" fill="#1B1A2E"/>
<g font-family="monospace" fill="#F4F1E8">
<rect x="30" y="24" width="260" height="120" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="2.5"/>
<rect x="30" y="24" width="260" height="38" rx="2" fill="#5B6CFF"/>
<text x="160" y="50" font-size="20" font-weight="800" text-anchor="middle" font-family="sans-serif">MaquinaDeEstados</text>
<text x="44" y="88" font-size="17">actual</text><line x1="30" y1="100" x2="290" y2="100" stroke="#F4F1E8" stroke-width="1.5"/>
<text x="44" y="126" font-size="17">cambiar(nombre)</text>
<rect x="360" y="24" width="250" height="130" rx="2" fill="#1B1A2E" stroke="#FFC83D" stroke-width="2.5" stroke-dasharray="8 5"/>
<text x="485" y="50" font-size="16" text-anchor="middle" fill="#FFC83D" font-family="sans-serif">«contrato»</text>
<text x="485" y="74" font-size="20" font-weight="800" text-anchor="middle" font-family="sans-serif">Estado</text>
<text x="374" y="104" font-size="16">entrar() · salir()</text>
<text x="374" y="128" font-size="16">actualizar(dt)</text>
<text x="374" y="148" font-size="16">dibujar() · tecla(t)</text>
</g>
<line x1="290" y1="84" x2="356" y2="84" stroke="#F4F1E8" stroke-width="2.5" marker-end="url(#s3a)"/>
<text x="323" y="74" font-size="15" fill="#F4F1E8" text-anchor="middle">actual</text>
<g font-size="20" font-weight="800" fill="#F4F1E8" text-anchor="middle">
<rect x="30" y="214" width="180" height="54" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="2.5"/><text x="120" y="248">Title</text>
<rect x="250" y="214" width="180" height="54" rx="2" fill="#1B1A2E" stroke="#FF5D3A" stroke-width="3"/><text x="340" y="248">Play</text>
<rect x="470" y="214" width="180" height="54" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="2.5"/><text x="560" y="248">Pause</text>
<rect x="690" y="214" width="180" height="54" rx="2" fill="#1B1A2E" stroke="#F4F1E8" stroke-width="2.5"/><text x="780" y="248">GameOver</text>
</g>
<g stroke="#F4F1E8" stroke-width="2" fill="none" stroke-dasharray="7 5">
<path d="M120 214 V188 H780 V214"/><path d="M340 214 V188"/><path d="M560 214 V188"/>
<path d="M485 188 V168" stroke-dasharray="" marker-end="url(#s3t)"/>
</g>
<g font-size="19" font-weight="800" fill="#F4F1E8" text-anchor="middle">
<rect x="40" y="350" width="170" height="54" rx="2" fill="#1B1A2E" stroke="#3BC4A3" stroke-width="2.5"/><text x="125" y="384">Paleta</text>
<rect x="255" y="350" width="170" height="54" rx="2" fill="#1B1A2E" stroke="#3BC4A3" stroke-width="2.5"/><text x="340" y="384">Bola</text>
<rect x="470" y="350" width="170" height="54" rx="2" fill="#1B1A2E" stroke="#3BC4A3" stroke-width="2.5"/><text x="555" y="384">Nivel</text>
<rect x="700" y="350" width="170" height="54" rx="2" fill="#1B1A2E" stroke="#3BC4A3" stroke-width="2.5"/><text x="785" y="384">Ladrillo</text>
</g>
<polygon points="340,268 348,280 340,292 332,280" fill="#F4F1E8"/>
<g stroke="#F4F1E8" stroke-width="2.5" fill="none">
<path d="M340 292 V320 H125 V350"/><path d="M340 320 V350"/><path d="M340 320 H555 V350"/>
<line x1="640" y1="377" x2="700" y2="377"/>
</g>
<polygon points="640,377 652,369 664,377 652,385" fill="#F4F1E8"/>
<text x="680" y="368" font-size="16" fill="#F4F1E8" text-anchor="middle">1..*</text>
<text x="450" y="446" font-size="18" fill="#6E6B85" text-anchor="middle">triángulo = «es un» · rombo = «tiene» · flecha = «conoce a» · punteado = cumple un contrato</text>
</svg>`;

  window.SESION = {
    n: 3,
    titulo: 'POO y arquitectura',
    objetivos: [
      'Repartir las responsabilidades de un Breakout en clases que saben y hacen una sola cosa, y justificarlo con una tabla de responsabilidades.',
      'Distinguir clase de instancia y explicar por qué golpear un ladrillo no cambia a los demás.',
      'Reconocer cuándo un código «mete la mano» en otro objeto y reescribirlo para que le pida las cosas a través de sus funciones.',
      'Explicar con un ejemplo cómo un solo bucle actualiza objetos distintos gracias al polimorfismo, y cuándo conviene componer en lugar de heredar.',
      'Dibujar el diagrama UML de clases y la máquina de estados (Title, Play, Pause, GameOver) del Breakout del ACA 1.'
    ],
    analogia: 'El molde de galletas. Haces el molde una sola vez y con él sacas todas las galletas que quieras; todas tienen la misma forma, pero cada una lleva su propio relleno y si muerdes una, las demás siguen enteras. En el código el molde es la <b>clase</b> (por ejemplo Ladrillo) y cada galleta es una <b>instancia</b>: cincuenta ladrillos con la misma forma, cada uno con sus propios golpes restantes.',
    ideas: [
      ['C1', 'Un objeto junta estado y comportamiento, y tiene una sola responsabilidad'],
      ['C2', 'La clase es el molde y la instancia es la galleta: cada instancia lleva su propio estado'],
      ['C3', 'Encapsular y abstraer: pide, no metas la mano; muestra solo lo esencial'],
      ['C4', 'Herencia y polimorfismo: «es un», una llamada y muchos comportamientos; componer cuando varía mucho'],
      ['C5', 'El patrón State: cada estado del juego es un objeto, y el diseño se dibuja en UML (ACA 1)']
    ],
    agenda: [
      ['0:00', 'Bienvenida y quiz preclase'],
      ['0:07', 'Del muro de variables sueltas al objeto'],
      ['0:18', 'Clase e instancia: el molde de galletas'],
      ['0:28', 'Responsabilidades: una pieza, una tarea'],
      ['0:38', 'Encapsulación y abstracción: pide, no metas la mano'],
      ['0:55', 'Herencia, polimorfismo y composición'],
      ['1:12', 'El patrón State: la FSM de la sesión 2 hecha objetos'],
      ['1:22', 'UML de clases y abre el ACA 1: taller del Breakout'],
      ['1:50', 'Quiz postclase y cierre']
    ],
    conceptos: [
      { t: 'Objeto', d: 'Una cosa del juego que junta sus datos (estado) con lo que sabe hacer (comportamiento). Se puede pasar de un lado a otro como una sola pieza.', ej: 'Un ladrillo sabe dónde está y cuántos golpes le quedan, y sabe recibir un golpe y dibujarse.' },
      { t: 'Clase e instancia', d: 'La clase es el molde: describe qué datos y qué funciones tendrá cada objeto. Una instancia es un objeto concreto hecho con ese molde, con sus propios valores.', ej: 'Una clase Ladrillo y cincuenta instancias en pantalla, cada una con su x, su y y sus golpes.' },
      { t: 'Responsabilidad', d: 'Lo que una clase sabe y lo que hace. Una buena clase tiene una sola responsabilidad: se describe en una frase sin «y».', ej: '«La bola se mueve y rebota en las paredes» es una responsabilidad. «La bola se mueve y guarda el puntaje» son dos.' },
      { t: 'Encapsulación', d: 'Esconder los datos de un objeto y dejar que los demás solo le pidan cosas a través de sus funciones. El objeto revisa sus propias reglas.', ej: 'Nadie escribe <code>jugador.vidas = -3</code>: todos llaman <code>jugador:perderVida()</code> y el jugador decide si se acabó la partida.' },
      { t: 'Abstracción', d: 'Quedarse con lo esencial de una cosa para el juego e ignorar el resto, a propósito. También es ponerle un buen nombre a varias líneas de reglas.', ej: 'Una bala no necesita pulmones: posición, velocidad y daño. <code>recibirGolpe()</code> esconde las reglas detrás de dos palabras.' },
      { t: 'Herencia', d: 'Una clase hija toma todo lo de una clase padre y cambia o agrega solo lo distinto. Es la relación «es un».', ej: 'Un LadrilloDuro es un Ladrillo que aguanta tres golpes y cambia de color al recibir uno.' },
      { t: 'Polimorfismo', d: 'Muchos objetos distintos responden a la misma llamada, cada uno a su manera. Quien llama no necesita saber qué tipo de objeto es.', ej: 'El bucle de Play llama <code>o:actualizar(dt)</code> sobre la bola, la paleta y los power-ups, y cada uno hace lo suyo.' },
      { t: 'Composición', d: 'Armar un objeto juntando piezas que <b>tiene</b>, en lugar de heredar de una cadena de clases que <b>es</b>. Las piezas se combinan libremente.', ej: 'Un power-up que cae, parpadea y da vida es una entidad con tres piezas, no la clase PowerUpQueCaeParpadeaYDaVida.' },
      { t: 'Patrón State', d: 'Cada estado de una máquina de estados es un objeto con las mismas funciones (entrar, actualizar, dibujar, salir). Una máquina guarda el estado actual y le delega todo.', ej: 'Title, Play, Pause y GameOver del Breakout; main.lua solo le dice a la máquina «actualiza» y «dibuja».' }
    ],
    errores: [
      { mito: 'Una clase y un objeto son lo mismo.', real: 'La clase es el molde y existe una vez. Los objetos (instancias) son las galletas: puede haber cincuenta, cada uno con sus propios valores.' },
      { mito: 'Si los datos están en un objeto, cualquier parte del código puede cambiarlos.', real: 'Poder no es deber. Si la bola, el enemigo y la trampa restan vidas por su cuenta, nadie revisa el fin de la partida. Pide; no metas la mano.' },
      { mito: 'Programar orientado a objetos es heredar mucho.', real: 'Los árboles profundos se vuelven rígidos: cada combinación nueva pide otra clase. En juegos se hereda poco y se compone mucho.' },
      { mito: 'Cada variante necesita su clase: LadrilloRojo, LadrilloAzul.', real: 'Si solo cambia un número o un color, es un dato del mismo ladrillo. Una clase nueva se justifica cuando cambia el comportamiento.' },
      { mito: 'Una clase Juego que lo hace todo es más sencilla.', real: 'Es el objeto dios: cualquier cambio pasa por ahí y rompe otra cosa. Si no la puedes describir en una frase sin «y», son varias clases.' },
      { mito: 'El diagrama UML se dibuja al final, para entregar.', real: 'Es el plano antes de construir. En el ACA 1 primero se diseña y en las sesiones 6 y 7 se programa: cambiar una caja en papel cuesta un minuto; en código, una tarde.' }
    ],
    codigoIntro: 'Hoy el código va primero en pseudocódigo: la sintaxis de Lua llega en la sesión 4 y las clases de verdad, con metatablas, en la sesión 5. Las pestañas de Lua son un adelanto muy legible para que veas que las ideas caben en pocas líneas. Las que dicen «pruébalo» corren en el navegador.',
    codigo: [
      { titulo: 'Del muro de variables al objeto', desc: 'Con variables sueltas, cada ladrillo son dos o tres nombres repetidos a mano. Con un objeto, el ladrillo es una sola cosa que sabe lo suyo. Mira cómo los dos puntos le pasan el ladrillo a su propia función.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: globalesPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: objetoLua, run: true }] },
      { titulo: 'Un molde, muchas galletas', desc: 'La función que fabrica ladrillos es el molde. Cada llamada saca una instancia con su propio estado: golpear a <code>b</code> no toca a <code>a</code> ni a <code>c</code>. En la sesión 5 haremos lo mismo con metatablas, para que las funciones no se copien en cada ladrillo.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: moldePseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: moldeLua, run: true }] },
      { titulo: 'Encapsular: pide, no metas la mano', desc: 'El jugador guarda sus vidas y es el único que las cambia. Los demás le piden <code>perderVida()</code>. Corre el ejemplo: cinco golpes y las vidas nunca bajan de cero, y el fin de la partida se avisa una sola vez.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: encPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: encLua, run: true }] },
      { titulo: 'Polimorfismo y composición', desc: 'Un solo bucle llama la misma función sobre objetos distintos y cada uno responde a su manera. En la tercera pestaña, un power-up armado con piezas en lugar de heredar.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: polyPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: polyLua, run: true }, { lang: 'Lua', label: 'Lua (composición)', src: compLua, run: true }] },
      { titulo: 'El patrón State y el esqueleto del ACA 1', desc: 'La máquina de estados de la sesión 2, ahora con cada estado como un objeto que decide qué hacer con cada tecla. La última pestaña es el esqueleto de archivos del Breakout que pide el ACA 1.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: statePseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: stateLua, run: true }, { lang: 'Lua', label: 'Lua (esqueleto ACA 1)', src: esqueletoLua }] }
    ],
    practica: {
      t: 'Arranca el ACA 1: el plano del Breakout',
      intro: 'En parejas, empiecen el diseño orientado a objetos del Breakout que programarán más adelante. Hoy sale el primer borrador; la entrega del ACA 1 es en la sesión 5.',
      pasos: [
        '<b>Los sustantivos.</b> Describan el Breakout en cinco frases y subrayen los sustantivos: paleta, bola, ladrillo, nivel, puntaje... Son candidatos a clases.',
        '<b>La tabla de responsabilidades.</b> Para cada clase, tres columnas: qué <b>sabe</b> (estado), qué <b>hace</b> (comportamiento) y a quién <b>conoce</b>. Una frase sin «y» por clase.',
        '<b>La máquina de estados.</b> Dibujen Title, Play, Pause y GameOver con una flecha por evento (Enter, P, sin vidas, R). ¿Falta un estado Ganaste?',
        '<b>El UML de clases.</b> Una caja por clase con sus tres partes, y las líneas: «es un» (triángulo), «tiene» (rombo), «conoce a» (flecha).',
        '<b>El game loop.</b> En pseudocódigo, escriban qué hace Play en actualizar(dt) y en dibujar(), llamando a las funciones de sus clases.'
      ],
      entrega: 'Foto del borrador (tabla, FSM y UML) en la plataforma. Es la base del ACA 1; la versión final lleva además el esqueleto Lua.'
    },
    tarea: [
      'Avanza el ACA 1: pasa en limpio el UML de clases, la máquina de estados (Title, Play, Pause, GameOver) y la tabla de responsabilidades del Breakout.',
      'Escribe el pseudocódigo del game loop del Breakout: qué pasa en <code>actualizar(dt)</code> y <code>dibujar()</code> de Play, y quién le pide qué a quién.',
      'Prepara el esqueleto de archivos: <code>conf.lua</code>, <code>main.lua</code> y un archivo vacío por clase, con un comentario de una línea que diga su responsabilidad. En las sesiones 4 y 5 los llenamos.',
      'Revisa la FSM de tu Pong en papel: ¿qué haría cada estado si fuera un objeto?'
    ],
    lecturas: [
      'Nystrom, R. (2014). <i>Game Programming Patterns</i>, capítulos «State», «Update Method» y «Component» (gratis en gameprogrammingpatterns.com).',
      'Ierusalimschy, R. <i>Programming in Lua</i>, capítulo «Object-Oriented Programming» (la 1.ª edición está gratis en lua.org/pil). Lectura para la sesión 5.',
      'Fowler, M. (2003). <i>UML Distilled</i> (3.ª ed.), capítulos de diagramas de clases y de estados. Breve y práctico para el ACA 1.',
      'Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). <i>Design Patterns</i>, patrón State (de consulta).',
      'Fernández, D. y Angelina, P. (2019). <i>Arquitectura del motor de videojuegos</i> (bibliografía del programa).'
    ],
    mapa: {
      lead: 'De un muro de variables sueltas a un juego repartido en piezas que saben y hacen una sola cosa.',
      nodos: [
        ['muro', 'El muro de variables', 'bola_x, ladrillo7_golpes...', 'riesgo', 'Una variable suelta por cada dato de cada cosa. Nadie es dueño de nada.'],
        ['obj', 'Objeto', 'estado + comportamiento', 'idea', 'Junta lo que va junto. Cada objeto, una responsabilidad.'],
        ['clase', 'Clase e instancia', 'el molde y la galleta', 'idea', 'Un molde, muchas instancias, cada una con su propio estado.'],
        ['enc', 'Encapsular y abstraer', 'pide, no metas la mano', 'idea', 'El objeto protege sus reglas y muestra solo lo esencial.'],
        ['poly', 'Herencia y polimorfismo', 'un bucle, muchos objetos', 'codigo', 'Una llamada, muchos comportamientos. Heredar poco, solo para «es un».'],
        ['comp', 'Composición', 'tener piezas', 'patron', 'Cuando las variantes se mezclan, se arma con piezas en lugar de heredar.'],
        ['state', 'Patrón State', 'Title · Play · Pause · GameOver', 'patron', 'La FSM de la sesión 2 hecha objetos. La máquina delega en el estado actual.'],
        ['aca', 'ACA 1', 'UML + FSM + tabla + esqueleto', 'practica', 'El plano orientado a objetos del Breakout, antes de programarlo.']
      ],
      cables: [['muro', 'obj', 'llamada'], ['obj', 'clase', 'llamada'], ['obj', 'enc', 'datos'], ['clase', 'poly', 'llamada'], ['poly', 'comp', 'llamada'], ['poly', 'state', 'evento'], ['enc', 'aca', 'datos'], ['comp', 'aca', 'datos'], ['state', 'aca', 'evento']]
    },

    slides: [
      { kind: 'portada', title: 'POO y arquitectura',
        lead: 'Sesión 3 · Programación de Videojuegos',
        full: [
          { ul: ['Del muro de variables a objetos con dueño.', 'Encapsular, heredar, componer y el patrón State.', 'Hoy abre el ACA 1: el plano del Breakout.'] },
          { pie: 'Trae tu Pong en papel: su FSM se vuelve objetos.' }
        ],
        nota: 'Saluda y recuerda en una frase la sesión 2: el juego es un bucle que actualiza estado con dt, y los personajes viven en máquinas de estado. Hoy le damos una casa a ese estado. Avisa que hoy abre el ACA 1 (Corte II, 30 %). Lanza el quiz preclase: 5 minutos. 7 minutos en total.' },

      { kind: 'reto', title: 'Predice: un Breakout con variables sueltas',
        izq: 48,
        left: [{ code: [{ lang: 'Lua', label: 'main.lua, a la antigua', src: globalesCorto }] }],
        right: [{ check: { q: 'El nivel tiene 50 ladrillos y cada uno guarda x, y y golpes. ¿Cuántas variables sueltas necesitas solo para los ladrillos?', opts: ['3', '50', '150', 'Una sola'], ok: 2, why: '50 ladrillos × 3 datos = 150 nombres escritos a mano, y cada regla (golpear, dibujar, chocar) repetida para cada uno. Y cualquier línea del programa puede cambiar cualquiera de ellas.' } }],
        nota: 'Que voten. Error esperado: 50. Haz la cuenta. Pregunta: ¿quién es el dueño de ladrillo2_golpes? Respuesta esperada: nadie, cualquiera lo cambia. Esos son los tres problemas: repetición, sin dueño, imposible de razonar. 4 minutos.' },

      { kind: 'analogia', title: 'El molde de galletas',
        izq: 58,
        left: [{ fig: 'molde' }],
        right: [
          { mapa: [['El molde', 'La clase<small>se escribe una vez</small>'], ['Cada galleta', 'Una instancia'], ['El relleno de cada una', 'Su propio estado'], ['Morder una', 'Las demás siguen enteras']], de: 'En la cocina', a: 'En el juego', pasos: true }
        ],
        nota: 'Hornea cuatro o cinco ladrillos y golpea uno: solo ese cambia. Pregunta: ¿por qué no cambian los otros? Respuesta: cada instancia lleva su propio estado. Luego «Enseñarle al molde»: todos ganan la función nueva a la vez. Pregunta: ¿qué se comparte y qué no? Respuesta: el comportamiento viene del molde; el estado es de cada galleta. 6 minutos.' },

      { kind: 'idea', title: 'Un objeto = estado + comportamiento',
        izq: 46,
        left: [{ svg: svgObjeto }],
        right: [
          { big: 'Lo que el ladrillo <b>sabe</b> y lo que <b>hace</b>, juntos.' },
          { ul: ['<b>Estado:</b> dónde está, cuántos golpes le quedan.', '<b>Comportamiento:</b> recibir un golpe, decir si sigue vivo, dibujarse.'], pasos: true },
          { clave: 'Esa caja de tres partes ya es UML: la usarás en el ACA 1.', paso: true }
        ],
        nota: 'Señala las tres partes: nombre, estado y comportamiento. Conecta con la sesión 1: el estado de una mecánica ahora tiene dueño. Pregunta: ¿qué sabe y qué hace una paleta? Respuesta esperada: sabe x, ancho y rapidez; hace moverse con el teclado sin salirse y dibujarse. 4 minutos.' },

      { kind: 'codigo', title: 'El mismo ladrillo, como objeto',
        izq: 34,
        left: [
          { p: 'Un adelanto en Lua: no tienes que escribirlo todavía, solo leerlo.' },
          { clave: 'Los dos puntos le pasan el objeto a su propia función: eso es <code>self</code>.', paso: true },
          { pie: 'La sintaxis la vemos en la sesión 4; las clases con metatablas, en la 5.' }
        ],
        right: [{ code: [{ lang: 'Lua', src: objetoCorto }, { lang: 'Pseudo', label: 'Pseudocódigo', src: globalesPseudo }], marca: [
          { l: [1], t: 'El <b>estado</b>: los datos del ladrillo, juntos en una tabla.' },
          { l: [3, 4, 5], t: 'Un <b>comportamiento</b>: el ladrillo sabe recibir un golpe.' },
          { l: [7, 8, 9], t: 'Otro: sabe decir si sigue vivo.' },
          { l: [11], t: 'Se lo <b>pides</b> al ladrillo; él cambia sus propios datos.' }
        ] }],
        nota: 'Recorre las marcas despacio: muchos nunca han leído código. Lee self como «yo mismo, el ladrillo». Pregunta: ¿cómo golpearías dos veces el ladrillo? Respuesta: llamar ladrillo:recibirGolpe() dos veces. La versión que corre en el navegador está en la página de la sesión. 4 minutos.' },

      { kind: 'idea', title: 'Responsabilidades: una pieza, una tarea',
        full: [
          { big: 'Si no la puedes describir en una frase sin «y», son dos clases.' },
          { tabla: { head: ['Clase', 'Sabe', 'Hace'], rows: [['<b>Bola</b>', 'posición, velocidad', 'moverse y rebotar en las paredes'], ['<b>Ladrillo</b>', 'posición, golpes', 'recibir golpes y decir si sigue vivo'], ['<b>Nivel</b>', 'la lista de ladrillos', 'decir si ya no quedan ladrillos']] }, pasos: true },
          { clave: 'Esta tabla es una de las entregas del ACA 1.', paso: true }
        ],
        nota: 'Aclara la trampa del «y»: «moverse y rebotar» es una sola tarea de movimiento; «moverse y guardar el puntaje» son dos. Pregunta: ¿quién debe saber cuántas vidas quedan? Respuesta esperada: la partida o el jugador, no la bola. 4 minutos.' },

      { kind: 'demo', title: '¿Quién debería hacer esto?',
        izq: 62,
        left: [{ fig: 'responsabilidades' }],
        right: [
          { p: 'Siete tareas del Breakout. Toca la clase que debería encargarse.' },
          { clave: 'La tarea va con quien tiene los datos para hacerla.', paso: true }
        ],
        nota: 'Votación a mano alzada antes de tocar cada tarea. Error esperado: darle a la bola la tarea de contar puntos o de borrar ladrillos. Pregunta en la tarea del nivel ganado: ¿por qué no el Ladrillo? Respuesta: un ladrillo no conoce a los demás; el Nivel sí tiene la lista. 6 minutos.' },

      { kind: 'analogia', title: 'Encapsular: el mesero y la cocina',
        izq: 50,
        left: [
          { big: 'En un restaurante no entras a la cocina: le pides al mesero.' },
          { p: 'La cocina decide si hay ingredientes, cuánto tarda y cómo se sirve. Tú solo conoces el menú.' }
        ],
        right: [
          { mapa: [['La cocina', 'Los datos del objeto<small>privados</small>'], ['El menú', 'Sus funciones públicas'], ['Pedirle al mesero', 'Llamar a una función'], ['«Hoy no hay sopa»', 'El objeto valida sus reglas']], de: 'En el restaurante', a: 'En el juego', pasos: true }
        ],
        nota: 'Pregunta: ¿qué pasaría si cada cliente entrara a la cocina a servirse? Respuesta esperada: se acaba la comida sin control, nadie sabe qué queda. Eso es meter la mano en los datos de un objeto. 3 minutos.' },

      { kind: 'demo', title: 'Pide, no metas la mano',
        izq: 62,
        left: [{ fig: 'encapsulacion' }],
        right: [
          { check: { q: 'Una trampa resta 5 vidas directamente a un jugador que tiene 3. ¿Qué pasa?', opts: ['Queda en 0 y se acaba la partida', 'Queda en -2 y el juego sigue como si nada', 'Lua muestra un error', 'La trampa no puede restar'], ok: 1, why: 'Nadie revisó la regla: las vidas no bajan de cero y en cero se acaba la partida. Cuando todos le piden a jugador:perderVida(), esa revisión vive en un solo lugar.' } }
        ],
        nota: 'Primero en «Meter la mano»: golpea con la trampa y señala el -2 en el marcador. Que voten la pregunta. Luego «Pedir» y repite. Pregunta: si mañana diseño pide un escudo que bloquea el primer golpe, ¿cuántos lugares cambias en cada versión? Respuesta: uno contra todos los que restaban vidas. 6 minutos.' },

      { kind: 'antipatron', title: 'Meter la mano contra pedir',
        lead: 'La misma regla, en muchos lugares o en uno solo.',
        top: true,
        full: [{ compare: { a: { label: 'Así no: cada uno resta por su cuenta', lang: 'Lua', src: meterMano }, b: { label: 'Así sí: todos piden, el jugador decide', lang: 'Lua', src: pedir } } }],
        nota: 'Señala el guion bajo de _vidas: en Lua es una convención que dice «no lo toques desde afuera»; otros lenguajes lo hacen obligatorio con la palabra private. Pregunta: ¿dónde va el sonido de perder una vida? Respuesta: dentro de perderVida, una sola vez. 3 minutos.' },

      { kind: 'idea', title: 'Abstracción: una bala no necesita pulmones',
        izq: 50,
        left: [
          { big: 'Modela solo lo que el juego necesita simular.' },
          { ul: ['Una puerta: abierta o cerrada, no sus moléculas.', '<code>recibirGolpe()</code> esconde diez reglas detrás de dos palabras.', 'Quien llama <code>bola:actualizar(dt)</code> no necesita saber cómo lo hace.'], pasos: true }
        ],
        right: [{ check: { q: 'Para el Breakout, ¿qué datos necesita un ladrillo?', opts: ['Su peso, su material y su temperatura', 'Posición, tamaño y golpes que le quedan', 'El nombre del jugador que lo rompió', 'Todo lo que tiene un ladrillo real'], ok: 1, why: 'Abstraer es decidir qué ignorar a propósito. El peso no cambia ninguna regla del juego; los golpes sí. Si mañana un ladrillo explota, se agregará lo que esa regla necesite.' } }],
        nota: 'Conecta con el Módulo 0: allí viste la abstracción como quedarte con lo esencial. Aquí es lo mismo, aplicado a una clase. Pregunta: ¿cuándo agregarías el color al ladrillo? Respuesta: cuando el color dependa de los golpes o el jugador lo necesite para leer el juego. 4 minutos.' },

      { kind: 'idea', title: 'Herencia: la relación «es un»',
        izq: 54,
        left: [{ svg: svgHerencia }],
        right: [
          { p: 'La hija toma todo lo del padre y cambia <b>solo lo distinto</b>.' },
          { p: 'Un LadrilloDuro <b>es un</b> Ladrillo que aguanta tres golpes.' },
          { clave: 'Hereda poco: árboles cortos y estables.', paso: true }
        ],
        nota: 'Explica el triángulo hueco: así se dibuja «es un» en UML. Pregunta: ¿una Bola es una Paleta? Respuesta: no, son hermanas, ambas son Entidad. Avisa que la herencia es útil pero se abusa de ella: lo vemos en tres slides. 3 minutos.' },

      { kind: 'reto', title: 'Predice: llega un tipo nuevo',
        izq: 46,
        left: [{ code: [{ lang: 'Lua', label: 'El bucle de Play', src: polyCorto.split('\n').slice(0, 4).join('\n') }] }],
        right: [{ check: { q: 'Diseño agrega una <b>Bomba</b> que cae y explota. Trae su propia función <code>actualizar</code>. ¿Qué cambias en este bucle?', opts: ['Agregar un if para la bomba', 'Nada: la bomba entra en la lista y el bucle la actualiza', 'Hacer un bucle aparte para bombas', 'Reescribir el bucle'], ok: 1, why: 'El bucle solo pide «actualízate». Cualquier objeto que sepa responder sirve. Eso es polimorfismo: una llamada, muchos comportamientos.' } }],
        nota: 'Que voten. Error esperado: el if, por costumbre. Respuesta: nada. Pregunta de seguimiento: ¿y si la bomba olvida escribir su función actualizar? Respuesta: el juego falla al llamarla; por eso todas las entidades deben cumplir el mismo contrato. 3 minutos.' },

      { kind: 'demo', title: 'Un bucle, muchos objetos',
        izq: 62,
        left: [{ fig: 'polimorfismo' }],
        right: [
          { big: 'El bucle no pregunta qué eres. Te pide que te actualices.' },
          { clave: 'Agregar un tipo es escribir una clase nueva, no abrir el bucle.', paso: true }
        ],
        nota: 'Corre varias vueltas y señala que cada objeto hace algo distinto con la misma llamada. Agrega la Bomba en los dos modos y lee el contador de ramas. Pregunta: ¿cuántos bucles tiene un juego? Respuesta esperada: varios (actualizar, dibujar, chocar), y en el modo if cada tipo nuevo los abre todos: un cambio pequeño se riega por todo el archivo. Pregunta final: ¿en cuál de los dos modos puede romperse la bola al agregar la bomba? Respuesta: en el del if, porque se edita código que ya funcionaba. 7 minutos.' },

      { kind: 'codigo', title: 'Polimorfismo en código',
        izq: 34,
        left: [
          { big: 'Misma llamada, distinta respuesta.' },
          { p: 'Cada clase escribe su propia versión de <code>actualizar</code> y <code>dibujar</code>.' },
          { clave: 'El que llama depende del rol, no del tipo.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', src: polyCorto }, { lang: 'Pseudo', label: 'Pseudocódigo', src: polyPseudo }], marca: [
          { l: [2, 3, 4], t: 'Un solo bucle para todos: <b>no pregunta el tipo</b>.' },
          { l: [6, 7, 8], t: 'Igual para dibujar.' },
          { l: [11, 12], t: 'Cada clase trae <b>su propia versión</b> de la misma función.' }
        ] }],
        nota: 'Recorre las marcas. Compara con la tabla de transiciones de la sesión 2: allí el estado decidía; aquí el objeto decide. Pregunta: ¿qué función le falta a una entidad nueva para entrar en estos bucles? Respuesta: actualizar y dibujar. 4 minutos.' },

      { kind: 'antipatron', title: 'El árbol que explota',
        lead: 'Power-ups que caen, parpadean o dan vida, en cualquier mezcla.',
        top: true,
        full: [{ compare: { a: { label: 'Herencia: una clase por mezcla', lang: 'Pseudo', src: arbolCorto }, b: { label: 'Composición: tener piezas', lang: 'Lua', src: piezasCorto } } }],
        nota: 'Pregunta: con tres habilidades que pueden estar o no, ¿cuántas clases hacen falta con herencia? Respuesta: hasta 8 combinaciones; con una cuarta, 16. Con piezas siguen siendo 3, luego 4. 3 minutos.' },

      { kind: 'idea', title: 'Componer: «tiene un» en lugar de «es un»',
        izq: 50,
        left: [
          { big: 'Como armar con fichas de construcción: cada ficha, una tarea.' },
          { ul: ['<b>Heredar</b> cuando la relación es estable y de un solo eje.', '<b>Componer</b> cuando las variantes se mezclan o cambian en pleno juego.', '<b>Un dato</b> cuando solo cambia un número.'], pasos: true }
        ],
        right: [{ check: { q: 'Un LadrilloDuro solo aguanta 3 golpes en vez de 1. ¿Qué es lo más sencillo?', opts: ['Una clase hija nueva', 'Una pieza nueva', 'Un dato: el mismo Ladrillo con golpes = 3', 'Una interfaz nueva'], ok: 2, why: 'Si solo cambia un número, no hay comportamiento nuevo: es un dato. Si además cambiara de color al golpearlo o soltara un premio, ya habría razones para heredar o para una pieza.' } }],
        nota: 'Este matiz importa: la slide de herencia usó LadrilloDuro como ejemplo, y aquí vemos que con solo un número ni siquiera hace falta. Pregunta: ¿qué pedido de diseño justificaría la clase hija? Respuesta esperada: que se agriete, cambie de color o suelte algo al romperse. 4 minutos.' },

      { kind: 'analogia', title: 'El patrón State: tu FSM se vuelve objetos',
        izq: 50,
        left: [
          { big: 'Cada estado sabe cómo actualizarse, dibujarse y a dónde ir.' },
          { tabla: { head: ['Estado', 'Al presionar', 'Pide'], rows: [['<b>Title</b>', 'Enter', 'Play'], ['<b>Play</b>', 'P / sin vidas', 'Pause / GameOver'], ['<b>Pause</b>', 'P', 'Play'], ['<b>GameOver</b>', 'R', 'Title']] }, pasos: true }
        ],
        right: [
          { mapa: [['El canal de televisión', 'El estado actual'], ['El control remoto', 'La máquina de estados'], ['Cambiar de canal', 'cambiar(nuevo)'], ['Cada canal tiene su programación', 'Cada estado, su actualizar y dibujar']], de: 'En la sala', a: 'En el juego', pasos: true }
        ],
        nota: 'Conecta con la sesión 2: es la misma FSM, pero ahora cada caja del diagrama es un objeto con su propio código. Pregunta: ¿qué hace el control remoto con la programación? Respuesta: nada, solo sabe cuál canal está puesto y se lo muestra. La máquina igual: delega. 4 minutos.' },

      { kind: 'demo', title: 'La máquina delega en el estado actual',
        izq: 64,
        left: [{ fig: 'estadosObjeto' }],
        right: [
          { p: 'Envía teclas y mira quién responde.' },
          { clave: 'main.lua no tiene ifs de estados: solo le habla a la máquina.', paso: true }
        ],
        nota: 'Presiona P en Title: no pasa nada, Title no tiene regla para P. Luego Enter, P, P y «Perder la última vida». Lee el registro de llamadas en voz alta: la máquina pregunta, el estado decide, la máquina cambia y llama salir y entrar. Pregunta: ¿dónde pondrías la música del menú? Respuesta: en Title.entrar, y se apaga en Title.salir. 6 minutos.' },

      { kind: 'codigo', title: 'Un estado, en código',
        izq: 34,
        left: [
          { big: 'Mismas funciones en todos los estados.' },
          { p: '<code>entrar</code>, <code>actualizar</code>, <code>dibujar</code>, <code>tecla</code> y <code>salir</code>: el contrato de un estado.' },
          { clave: 'Un estado nuevo, como Ganaste, es un archivo nuevo.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', src: stateCorto }, { lang: 'Pseudo', label: 'Pseudocódigo', src: statePseudo }], marca: [
          { l: [3], t: 'Al <b>entrar</b> al estado: preparar lo suyo.' },
          { l: [6, 7, 8], t: 'El estado decide qué hacer con la tecla y <b>pide</b> el cambio.' },
          { l: [10, 11, 12], t: 'Cada estado se dibuja a sí mismo.' },
          { l: [15], t: 'main.lua solo <b>delega</b> en la máquina.' }
        ] }],
        nota: 'Recorre las marcas. Insiste en que el estado no se cambia solo: pide, y la máquina hace el cambio (así nadie olvida llamar salir y entrar). La versión completa, que corre en el navegador, está en la página de la sesión. 4 minutos.' },

      { kind: 'idea', title: 'UML: el plano antes de construir',
        izq: 66,
        left: [{ svg: svgUML }],
        right: [
          { ul: ['<b>Triángulo:</b> «es un».', '<b>Rombo:</b> «tiene».', '<b>Flecha:</b> «conoce a».'], pasos: true },
          { clave: 'Cambiar una caja en papel cuesta un minuto. En código, una tarde.', paso: true }
        ],
        nota: 'Es un borrador, no la solución del ACA 1: cada pareja puede llegar a otro diseño defendible. Lee el diagrama en voz alta como frases: Play tiene una paleta, una bola y un nivel; el nivel tiene uno o más ladrillos; Title, Play, Pause y GameOver cumplen el contrato Estado. Pregunta: ¿dónde va el puntaje? Respuesta abierta: en Play o en una clase Partida; lo importante es justificarlo. 5 minutos.' },

      { kind: 'actividad', title: 'Arranca el ACA 1 · 22 min',
        lead: 'En parejas: el primer borrador del plano del Breakout.',
        izq: 52,
        left: [
          { ol: ['<b>Sustantivos:</b> cinco frases del juego, subraya las cosas.', '<b>Tabla:</b> qué sabe, qué hace y a quién conoce cada clase.', '<b>FSM:</b> Title, Play, Pause, GameOver y sus eventos.', '<b>UML:</b> cajas de tres partes y sus líneas.'], pasos: true },
          { pie: 'Al final, dos parejas muestran su tabla. Las demás buscan una clase con «y».' }
        ],
        right: [
          { tabla: { head: ['Clase', 'Sabe', 'Hace', 'Conoce a'], rows: [['Paleta', 'x, ancho, rapidez', 'moverse con el teclado sin salirse', 'nadie'], ['...', '...', '...', '...']] } },
          { p: 'Si una clase se llama «Juego» o «Manager» y hace de todo, revisa: ¿es un objeto dios?' }
        ],
        nota: 'Salas de 2 o 3: 18 minutos de trabajo y 4 para mostrar. Pasa por las salas con dos preguntas: ¿quién detecta que la bola tocó un ladrillo? y ¿quién sabe que ya no quedan ladrillos? Error esperado: una clase Juego que mueve, choca, cuenta y dibuja. Si les sobra tiempo: pseudocódigo de Play.actualizar(dt).' },

      { kind: 'idea', title: 'El ACA 1: qué entregas',
        izq: 46,
        left: [
          { tabla: { head: ['Pieza', 'Qué muestra'], rows: [['UML de clases', 'las clases y sus relaciones'], ['Máquina de estados', 'Title, Play, Pause, GameOver'], ['Tabla de responsabilidades', 'qué sabe y hace cada clase'], ['Pseudocódigo del game loop', 'quién le pide qué a quién'], ['Esqueleto Lua', 'main.lua, conf.lua y un archivo por clase']] }, pasos: true },
          { pie: 'Se entrega en la sesión 5 (30 %). En la sesión 4 hay asesoría.' }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Esqueleto (adelanto)', src: esqueletoLua }], marca: [
          { l: [1, 2, 3, 4, 5], t: 'Un archivo por clase y uno por estado.' },
          { l: [7, 8, 9, 10, 11], t: '<code>conf.lua</code>: la ventana.' },
          { l: [17, 18, 19, 20], t: '<code>main.lua</code> solo le habla a la máquina de estados.' }
        ] }],
        nota: 'Lee la guía oficial del ACA 1 con ellos y aclara dudas de formato y de rúbrica allí, no de memoria. El esqueleto puede tener archivos casi vacíos: lo que se evalúa es que la estructura refleje el diseño. 4 minutos.' },

      { kind: 'industria', title: 'Lo mismo, en otros lenguajes y motores',
        full: [
          { tabla: { head: ['Idea', 'Lua y LÖVE', 'En otros motores'], rows: [
            ['Clase', 'tabla + metatabla (sesión 5)', 'la palabra <code>class</code> en C# (Unity) y C++ (Unreal)'],
            ['Encapsular', 'convención: <code>_vidas</code>', '<code>private</code>, que el compilador hace cumplir'],
            ['Contrato', 'si tiene la función, sirve', '<code>interface</code> en C#; clases abstractas en C++'],
            ['Componer', 'una tabla con piezas', 'componentes de Unity y Unreal; ECS para miles de entidades']
          ] }, pasos: true },
          { clave: 'Un modelo mental, varios dialectos. Aprende el modelo.', paso: true }
        ],
        nota: 'Solo mención de contexto: no entres en sintaxis de C# o C++. ECS (entidades, componentes y sistemas) lleva la composición al extremo para mover miles de cosas a la vez; no lo usamos en el curso. Pregunta: ¿qué ventaja tiene que el compilador haga cumplir el private? Respuesta: el error aparece antes de jugar. 2 minutos.' },

      { kind: 'reto', title: 'Antes de irte: quiz postclase',
        full: [
          { big: 'Ocho preguntas, cinco minutos.' },
          { ul: ['Objetos, moldes, encapsular y abstraer.', 'Herencia, polimorfismo, composición y State.', 'Cada respuesta trae su explicación.'] },
          { clave: 'Compara con tu preclase: ¿en qué idea subiste más?', paso: true }
        ],
        nota: 'Da 5 minutos. Revisa en grupo las dos preguntas con más errores. Si la más fallada es la de composición, vuelve a la slide del árbol que explota.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Un objeto, una responsabilidad:</b> estado y comportamiento juntos.', '<b>Pide, no metas la mano:</b> cada objeto cuida sus reglas.', '<b>Un bucle, muchos objetos:</b> polimorfismo, piezas y estados como objetos.'], pasos: true },
          { p: 'Próxima sesión: <b>Lua y LÖVE</b>. Por fin escribimos y ejecutamos código. Trae tu borrador del ACA 1: en la sesión 4 hay asesoría.', paso: true }
        ],
        nota: '3 minutos. Pregunta de puente: de todas las clases de tu UML, ¿cuál programarías primero para ver algo en pantalla? Respuesta esperada: la Paleta o la Bola. Es justo lo que haremos en la sesión 4 con love.update y love.draw.' }
    ],

    pre: [
      { q: 'En programación orientada a objetos, un objeto junta...', opts: ['Solo datos', 'Solo funciones', 'Su estado (datos) y su comportamiento (lo que sabe hacer)', 'Las imágenes y los sonidos del juego'], ok: 2, why: 'Un objeto es estado más comportamiento: un ladrillo sabe cuántos golpes le quedan y sabe recibir un golpe. Solo datos sería una tabla de valores sin dueño.', idea: 'C1' },
      { q: 'Tu Breakout tiene una clase Ladrillo y 50 ladrillos en pantalla. ¿Cuántas clases y cuántas instancias hay?', opts: ['50 clases y 1 instancia', '1 clase y 50 instancias', '50 clases y 50 instancias', '1 clase y 1 instancia'], ok: 1, why: 'El molde se escribe una vez; las galletas son 50. Cada instancia lleva su propia posición y sus propios golpes.', idea: 'C2' },
      { q: '¿Qué significa encapsular un objeto?', opts: ['Meter todo el código en un solo archivo', 'Hacer una copia del objeto', 'Borrar las variables que no se usan', 'Proteger sus datos y dejar que los demás solo le pidan cosas a través de sus funciones'], ok: 3, why: 'Encapsular es como el mesero y la cocina: no entras a servirte, pides. El objeto revisa sus propias reglas.', idea: 'C3' },
      { q: 'Para un Breakout, ¿qué datos necesita guardar un ladrillo?', opts: ['Su peso, su material y su temperatura', 'El nombre del jugador', 'Posición, tamaño y golpes que le quedan', 'Todo lo que tiene un ladrillo de verdad'], ok: 2, why: 'Abstraer es quedarse con lo que el juego necesita simular. El peso no cambia ninguna regla; los golpes sí.', idea: 'C3' },
      { q: 'La bola, la paleta y un power-up tienen cada uno su propia función <code>actualizar(dt)</code>, y un solo bucle la llama sobre todos. ¿Cómo se llama esa idea?', opts: ['Polimorfismo', 'Encapsulación', 'Recursión', 'Delta time'], ok: 0, why: 'Polimorfismo: una misma llamada y muchos comportamientos. Delta time es el tiempo entre frames, que también aparece en la llamada, pero no es la idea de fondo.', idea: 'C4' },
      { q: 'En la sesión 2 dibujaste una máquina de estados. Si cada estado (Title, Play, Pause) fuera un objeto con su propio actualizar y dibujar, ¿qué haría el programa principal?', opts: ['Un if gigante con todos los estados', 'Pedirle al estado actual que se actualice y se dibuje', 'Crear un estado nuevo en cada frame', 'Nada: los estados se dibujan solos sin que nadie los llame'], ok: 1, why: 'Ese es el patrón State: una máquina guarda el estado actual y le delega. El if gigante es justo lo que el patrón evita.', idea: 'C5' }
    ],
    post: [
      { q: 'En tu Breakout, ¿qué clase debería encargarse de rebotar la bola en las paredes?', opts: ['Ladrillo', 'Bola', 'El marcador (HUD)', 'Paleta'], ok: 1, why: 'La bola tiene los datos para hacerlo: su posición y su velocidad. La tarea va con quien tiene los datos. Darle esa tarea a otra clase la obliga a meter la mano en la bola.', idea: 'C1' },
      { q: 'Una clase <code>Juego</code> de 900 líneas mueve la bola, lee el teclado, guarda el puntaje y dibuja el menú. ¿Qué problema tiene?', opts: ['Ninguno: todo en un lugar es más fácil', 'Que es muy corta', 'Tiene demasiadas responsabilidades: hay que repartirlas en clases con una sola tarea', 'Que no usa herencia'], ok: 2, why: 'Es el objeto dios: cualquier cambio pasa por ahí y puede romper otra cosa. La prueba: no se puede describir en una frase sin «y».', idea: 'C1' },
      { q: 'Creaste dos ladrillos con el mismo molde y golpeas solo a <code>a</code>. ¿Qué pasa con <code>b</code>?', opts: ['También pierde un golpe', 'Nada: cada instancia tiene su propio estado', 'Desaparece', 'Queda con los mismos golpes que a'], ok: 1, why: 'El molde comparte la forma y el comportamiento, no el relleno. b sigue con sus 3 golpes.', idea: 'C2',
        code: { lang: 'Lua', src: `local a = nuevoLadrillo(40, 60, 1)
local b = nuevoLadrillo(120, 60, 3)
a:recibirGolpe()` } },
      { q: 'La bola, un enemigo y una trampa escriben <code>jugador.vidas = jugador.vidas - n</code> cada uno por su cuenta. A veces quedan -2 vidas y el juego sigue. ¿Qué diseño lo evita?', opts: ['Que el jugador tenga una función <code>perderVida()</code> que valide y decida el fin de la partida, y que todos la llamen', 'Copiar el if de fin de partida en los tres lugares', 'Restar de a una vida para que nunca pase', 'Poner las vidas en una variable global'], ok: 0, why: 'Encapsular deja la regla en un solo lugar. Copiar el if funciona hasta que alguien olvida uno; una global empeora todo.', idea: 'C3' },
      { q: 'Diseño agrega una Bomba con su propio <code>actualizar</code> y su propio <code>dibujar</code>. Con polimorfismo, ¿qué cambias en los bucles de Play?', opts: ['Un if nuevo en cada bucle', 'Un bucle nuevo solo para bombas', 'Reescribir los bucles', 'Nada: basta con meter la bomba en la lista de objetos'], ok: 3, why: 'Los bucles solo piden «actualízate» y «dibújate». Cualquier objeto que cumpla ese contrato entra sin tocarlos.', idea: 'C4' },
      { q: 'Diseño pide power-ups que pueden caer, parpadear y dar vida, en cualquier combinación. ¿Qué escala mejor?', opts: ['Una clase hija por cada combinación', 'Una entidad a la que se le agregan piezas, una por habilidad', 'Copiar y pegar el código entre power-ups', 'Un solo power-up con un if por cada combinación'], ok: 1, why: 'Con herencia serían hasta 8 clases, y 16 con una habilidad más. Con composición son 3 piezas que se combinan al armar cada power-up.', idea: 'C4' },
      { q: 'Estás en Pause y el jugador presiona Enter, que solo sirve en Title. Con el patrón State, ¿quién hace que no pase nada?', opts: ['main.lua, con un if que revisa el estado', 'La bola', 'El estado Pause, que no tiene regla para Enter y no pide ningún cambio', 'Nadie: el juego salta a Play'], ok: 2, why: 'Cada estado decide qué hacer con cada tecla. Si Pause no tiene regla para Enter, no pide cambio y la máquina sigue igual. main.lua no necesita saber nada.', idea: 'C5' },
      { q: 'En el UML de clases del Breakout, Title, Play, Pause y GameOver se conectan a la caja «Estado» con un triángulo hueco. ¿Qué significa?', opts: ['Que cada uno es un Estado: cumple las mismas funciones (entrar, actualizar, dibujar...)', 'Que Estado tiene cuatro hijos dentro de sí', 'Que se llaman en ese orden', 'Que son el mismo objeto'], ok: 0, why: 'El triángulo hueco es la relación «es un». Por eso la máquina puede tratarlos igual: todos responden a las mismas llamadas. El rombo sería «tiene».', idea: 'C5' }
    ]
  };
})();
