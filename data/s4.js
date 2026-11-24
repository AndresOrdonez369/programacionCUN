(function () {
  /* Sesión 4 · Lua y LÖVE. Primera vez que escriben Lua de verdad: cada bloque traduce un
     pseudocódigo que ya conocen (Módulo 0 y sesión 2). Las pestañas "Lua (pruébalo)" son Lua puro
     con print(): el sitio las ejecuta en el navegador. LÖVE 11.x corre sobre LuaJIT (Lua 5.1). */

  /* ---------- 1 · Variables, tipos y nil ---------- */
  const pseVars = `VARIABLE nombre <- "Ada"
VARIABLE vidas <- 3
VARIABLE vivo <- VERDADERO
VARIABLE escudo                 (todavía sin valor)

vidas <- vidas - 1
MOSTRAR "Vidas: " + vidas

SI NO HAY escudo ENTONCES
  MOSTRAR "no hay escudo"
FIN SI`;

  const luaVars = `-- Cajas con nombre: siempre con local
local nombre = "Ada"
local vidas = 3
local vivo = true
local escudo              -- sin valor: vale nil

print(type(nombre), type(vidas), type(vivo), type(escudo))

vidas = vidas - 1         -- reasignar: ya sin local
print("Vidas: " .. vidas) -- .. une texto; + es solo para números

-- Solo nil y false son falsos. El 0 es verdadero.
local puntaje = 0
if puntaje then print("0 cuenta como verdadero") end
if not escudo then print("no hay escudo: es nil") end

-- or da un valor por defecto cuando la izquierda es nil
local velocidad = escudo or 200
print("velocidad:", velocidad)`;

  const luaOperadores = `-- Comparar y combinar: palabras, no símbolos raros
local vida, enSuelo, aturdido = 40, true, false

print(vida ~= 0)                 -- true: ~= significa "distinto"
print(vida >= 30 and vida <= 50) -- true: and, or, not
print(enSuelo and not aturdido)  -- true: puede saltar

-- El "si corto" de Lua: a and b or c
local texto = vida > 0 and "vivo" or "fuera"
print(texto)

-- Números y textos
print(7 / 2, 7 % 2)              -- 3.5   1
print(#"Coin Hunt")              -- 9: # mide la longitud
print(tonumber("42") + 1)        -- 43: texto a número
print("Nivel " .. tostring(3))   -- número a texto`;

  /* ---------- 2 · Decidir, repetir y funciones ---------- */
  const pseFlujo = `FUNCION estadoDeVida(vida)
  SI vida <= 0 ENTONCES DEVOLVER "fuera de combate"
  SINO SI vida < 30 ENTONCES DEVOLVER "en peligro"
  SINO DEVOLVER "bien"
FIN FUNCION

PARA vida DESDE 100 HASTA -20 CON PASO -40
  MOSTRAR vida, estadoDeVida(vida)
FIN PARA

intentos <- 0
MIENTRAS intentos < 3
  intentos <- intentos + 1
  MOSTRAR "intento " + intentos
FIN MIENTRAS`;

  const luaFlujo = `-- SI / SINO SI / SINO  ->  if / elseif / else ... end
local function estadoDeVida(vida)
  if vida <= 0 then
    return "fuera de combate"
  elseif vida < 30 then
    return "en peligro"
  else
    return "bien"
  end
end

-- PARA vida DESDE 100 HASTA -20, de -40 en -40
for vida = 100, -20, -40 do
  print(vida, estadoDeVida(vida))
end

-- MIENTRAS intentos < 3
local intentos = 0
while intentos < 3 do
  intentos = intentos + 1
  print("intento " .. intentos)
end`;

  const luaFunciones = `-- Una función: una receta con nombre, entradas y salida
local function danar(vida, cantidad)
  return vida - cantidad
end
print(danar(100, 30))            -- 70

-- Las funciones son valores: se guardan en variables
local golpe = danar              -- otra etiqueta, la misma función
print(golpe(50, 5))              -- 45

-- Pueden devolver dos valores a la vez
local function limites(lista)
  return lista[1], lista[#lista]
end
local primero, ultimo = limites({ 3, 9, 1 })
print(primero, ultimo)           -- 3   1

-- Y se pueden pasar a otra función (así funcionan los callbacks)
local function aplicarDosVeces(f, v) return f(f(v, 10), 10) end
print(aplicarDosVeces(danar, 100))  -- 80`;

  /* ---------- 3 · Tablas ---------- */
  const pseTablas = `LISTA monedas <- ["oro", "plata", "bronce"]
MOSTRAR monedas[primera]
AGREGAR "cobre" AL FINAL DE monedas
PARA CADA moneda EN monedas: MOSTRAR posición, moneda

REGISTRO jugador <- { nombre: "Ada", vida: 100 }
MOSTRAR jugador.vida`;

  const luaTablas = `local monedas = { "oro", "plata", "bronce" }
print(monedas[1])          -- oro: se cuenta desde 1
print(monedas[0])          -- nil: el cajón 0 no existe
print(#monedas)            -- 3: # es la longitud

table.insert(monedas, "cobre")   -- al final
for i, m in ipairs(monedas) do   -- en orden: 1, 2, 3, 4
  print(i, m)
end

local jugador = { nombre = "Ada", vida = 100 }
print(jugador.vida, jugador["vida"])  -- lo mismo, dos formas
print(jugador.escudo)                 -- nil: no existe esa clave
for clave, valor in pairs(jugador) do print(clave, valor) end

-- Las tablas se comparten, no se copian
local otro = jugador
otro.vida = 0
print(jugador.vida)        -- 0: era la misma tabla`;

  const luaCopia = `-- Para tener una copia hay que crear una tabla nueva
local original = { vida = 100, nombre = "Ada" }

local copia = {}
for clave, valor in pairs(original) do
  copia[clave] = valor
end

copia.vida = 0
print(original.vida, copia.vida)   -- 100   0

-- Por qué importa: una función que recibe una tabla la puede cambiar
local function curar(personaje) personaje.vida = personaje.vida + 25 end
curar(original)
print(original.vida)               -- 125`;

  /* ---------- 4 · El esqueleto de LÖVE ---------- */
  const pseLoop = `AL ARRANCAR (una vez):
  cuadro <- { x: 0, y: 280, lado: 40, velocidad: 200 }

REPETIR mientras la ventana esté abierta:
  dt <- segundos desde el frame anterior
  ACTUALIZAR: cuadro.x <- cuadro.x + velocidad * dt
              SI cuadro.x > 800 ENTONCES vuelve a la izquierda
  DIBUJAR:    un cuadrado en (cuadro.x, cuadro.y)`;

  const loveLoop = `-- main.lua: un cuadro que cruza la pantalla
local cuadro

function love.load()                 -- una vez, al arrancar
  cuadro = { x = 0, y = 280, lado = 40, vel = 200 }
end

function love.update(dt)             -- cada frame: cambia el estado
  cuadro.x = cuadro.x + cuadro.vel * dt
  if cuadro.x > 800 then cuadro.x = -cuadro.lado end
end

function love.draw()                 -- cada frame: solo dibuja
  love.graphics.setColor(1, 0.36, 0.23)   -- colores de 0 a 1
  love.graphics.rectangle("fill", cuadro.x, cuadro.y, cuadro.lado, cuadro.lado)
  love.graphics.setColor(1, 1, 1)
  love.graphics.print("x = " .. math.floor(cuadro.x), 10, 10)
end`;

  const simLoop = `-- Así trabaja el director. Tú solo rellenas las tres funciones.
local juego = {}
local x

function juego.load() x = 0; print("load: preparo todo, una sola vez") end
function juego.update(dt) x = x + 200 * dt end
function juego.draw() print(string.format("draw: el cuadro está en x = %.1f", x)) end

-- Esto lo hace LÖVE por ti, unas 60 veces por segundo:
juego.load()
for frame = 1, 5 do
  local dt = 1 / 60              -- segundos desde el frame anterior
  juego.update(dt)
  juego.draw()
end
print("En 1 segundo (60 frames) avanzaría 200 píxeles")`;

  const confLua = `-- conf.lua: LÖVE lo lee ANTES de love.load
function love.conf(t)
  t.window.title  = "Coin Hunt"
  t.window.width  = 800
  t.window.height = 600
end`;

  /* ---------- 5 · Coin Hunt (versión con tablas; en la sesión 5 se vuelve clases) ---------- */
  const pseCoin = `AL ARRANCAR:
  jugador <- círculo en el centro (400, 300), velocidad 250
  monedas <- 6 monedas en lugares al azar
  puntaje <- 0

CADA FRAME, ACTUALIZAR:
  SI flecha derecha sostenida: jugador.x <- jugador.x + 250 * dt   (y así las otras)
  PARA CADA moneda no tomada:
    SI toca al jugador: marcarla tomada, puntaje <- puntaje + 1

CADA FRAME, DIBUJAR:
  jugador, monedas no tomadas, "Monedas: puntaje / 6"

AL PULSAR UNA TECLA (una vez):
  Esc: salir      R: volver a arrancar`;

  const coin1 = `-- main.lua · Coin Hunt, versión con tablas (1 de 3)
local jugador, monedas, puntaje

function love.load()
  -- el jugador nace en el centro de la ventana de 800 x 600
  jugador = { x = 400, y = 300, radio = 16, vel = 250 }
  monedas = {}
  for i = 1, 6 do
    local moneda = {
      x = love.math.random(40, 760),
      y = love.math.random(40, 560),
      radio = 8,
      tomada = false,
    }
    table.insert(monedas, moneda)
  end
  puntaje = 0
end`;

  const coin2 = `-- main.lua (2 de 3): la lógica de cada frame
local function seTocan(a, b)               -- dos círculos se tocan si...
  local dx, dy = a.x - b.x, a.y - b.y
  return math.sqrt(dx * dx + dy * dy) < a.radio + b.radio
end

function love.update(dt)
  local v = jugador.vel * dt               -- píxeles que avanza en este frame
  local tecla = love.keyboard.isDown
  if tecla("right", "d") then jugador.x = jugador.x + v end
  if tecla("left", "a")  then jugador.x = jugador.x - v end
  if tecla("down", "s")  then jugador.y = jugador.y + v end  -- y crece hacia abajo
  if tecla("up", "w")    then jugador.y = jugador.y - v end

  for _, m in ipairs(monedas) do
    if not m.tomada and seTocan(jugador, m) then
      m.tomada = true
      puntaje = puntaje + 1
    end
  end
end`;

  const coin3 = `-- main.lua (3 de 3): dibujar y teclas sueltas
function love.draw()
  love.graphics.setColor(0.23, 0.77, 0.64)             -- jugador verde azulado
  love.graphics.circle("fill", jugador.x, jugador.y, jugador.radio)
  love.graphics.setColor(1, 0.78, 0.24)                -- monedas ámbar
  for _, m in ipairs(monedas) do
    if not m.tomada then love.graphics.circle("fill", m.x, m.y, m.radio) end
  end
  love.graphics.setColor(1, 1, 1)                      -- blanco para el texto
  love.graphics.print("Monedas: " .. puntaje .. " / " .. #monedas, 10, 10)
  if puntaje == #monedas then
    love.graphics.print("¡Ganaste! Pulsa R para jugar otra vez", 280, 290)
  end
end

function love.keypressed(tecla)                        -- una vez por pulsación
  if tecla == "escape" then love.event.quit() end
  if tecla == "r" then love.load() end                 -- reiniciar = volver a preparar
end`;

  /* ---------- Para las slides ---------- */
  const hola = `-- main.lua: todo juego de LÖVE empieza aquí
function love.draw()
  love.graphics.print("¡Hola, LÖVE!", 20, 20)   -- en la ventana
end

print("Hola desde Lua")   -- en la consola, no en la ventana`;

  const correr = `# 1) En la terminal, parado dentro de la carpeta del juego:
love .

# 2) En VSCode, con la extensión Love2D Support:
Alt + L        (Cmd + L en Mac)

# 3) O arrastra la carpeta sobre el ejecutable de LÖVE.
# En Windows, si "love" no se reconoce, agrega la carpeta
# de LÖVE al PATH del sistema.`;

  const verdad = `local valores = { 0, "", "hola", false }

for i = 1, 4 do
  if valores[i] then
    print(i, "verdadero")
  else
    print(i, "falso")
  end
end

local nada = nil
if nada then print("nunca llega aquí") end
print("solo nil y false son falsos")`;

  const malLoop = `local x, y = 400, 300
local function saltar() y = y - 80 end

function love.update(dt)
  x = x + 5                  -- 5 píxeles por FRAME
  if love.keyboard.isDown("space") then
    saltar()                 -- salta en CADA frame
  end
end

function love.draw()
  y = y + 1                  -- lógica dentro de draw
  love.graphics.circle("fill", x, y, 16)
end`;

  const bienLoop = `local x, y = 400, 300
local function saltar() y = y - 80 end

function love.update(dt)
  x = x + 300 * dt           -- 300 píxeles por SEGUNDO
  y = y + 60 * dt            -- la lógica va en update
end

function love.keypressed(tecla)
  if tecla == "space" then
    saltar()                 -- una vez por pulsación
  end
end

function love.draw()
  love.graphics.circle("fill", x, y, 16)   -- draw solo dibuja
end`;

  const svgCoin = `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" font-family="ui-monospace, Consolas, monospace" role="img" aria-label="Carpeta coin-hunt con main.lua y conf.lua, y la ventana del juego con el jugador en el centro y seis monedas">
<rect width="800" height="400" fill="#1B1A2E"/>
<rect x="20" y="40" width="300" height="250" fill="none" stroke="#6E6B85" stroke-width="2"/>
<text x="38" y="80" fill="#FFC83D" font-size="24">coin-hunt/</text>
<rect x="56" y="104" width="12" height="16" fill="#3BC4A3"/><text x="80" y="118" fill="#F4F1E8" font-size="22">main.lua</text>
<rect x="56" y="144" width="12" height="16" fill="#5B6CFF"/><text x="80" y="158" fill="#F4F1E8" font-size="22">conf.lua</text>
<text x="38" y="220" fill="#6E6B85" font-size="17">LÖVE busca main.lua</text>
<text x="38" y="244" fill="#6E6B85" font-size="17">en la raíz de la carpeta</text>
<line x1="320" y1="165" x2="362" y2="165" stroke="#F4F1E8" stroke-width="3"/>
<polygon points="362,157 374,165 362,173" fill="#F4F1E8"/>
<text x="380" y="30" fill="#FFC83D" font-size="15">(0, 0)</text>
<rect x="380" y="40" width="400" height="300" fill="#111018" stroke="#F4F1E8" stroke-width="3"/>
<text x="392" y="64" fill="#F4F1E8" font-size="15">Monedas: 0 / 6</text>
<circle cx="580" cy="190" r="10" fill="#3BC4A3"/>
<text x="580" y="222" fill="#3BC4A3" font-size="14" text-anchor="middle">(400, 300)</text>
<circle cx="430" cy="110" r="5" fill="#FFC83D"/><circle cx="700" cy="90" r="5" fill="#FFC83D"/><circle cx="520" cy="290" r="5" fill="#FFC83D"/>
<circle cx="740" cy="250" r="5" fill="#FFC83D"/><circle cx="650" cy="160" r="5" fill="#FFC83D"/><circle cx="450" cy="230" r="5" fill="#FFC83D"/>
<text x="780" y="362" fill="#6E6B85" font-size="15" text-anchor="end">(800, 600)</text>
</svg>`;

  window.SESION = {
    n: 4,
    titulo: 'Lua y LÖVE',
    objetivos: [
      'Escribir en Lua variables con <code>local</code>, condicionales, ciclos y funciones a partir de un pseudocódigo que ya conoces.',
      'Predecir el resultado de una expresión en Lua sabiendo que solo <code>nil</code> y <code>false</code> son falsos y que el texto se une con <code>..</code>.',
      'Usar tablas como listas (desde el índice 1, con <code>ipairs</code>) y como registros (con <code>pairs</code>), y explicar por qué <code>b = a</code> no copia una tabla.',
      'Explicar qué hace LÖVE con <code>love.load</code>, <code>love.update(dt)</code> y <code>love.draw</code>, y en cuál va cada parte de un juego.',
      'Correr Coin Hunt: mover un círculo con el teclado usando <code>dt</code>, recoger 6 monedas y reiniciar con una tecla.'
    ],
    analogia: 'LÖVE es el director de teatro y tú escribes el papel de tu personaje. No decides cuándo se abre el telón ni cuándo te toca salir: el director te llama una vez para que te prepares (<code>love.load</code>) y después, unas 60 veces por segundo, te pide que actúes (<code>love.update</code>) y que poses para la foto (<code>love.draw</code>). Si alguien grita desde el público, el director te avisa (<code>love.keypressed</code>). Tú solo escribes qué hace tu personaje cuando le toca.',
    ideas: [
      ['C1', 'Lua es pequeño: variables con local, el tipo lo lleva el valor y solo nil y false son falsos'],
      ['C2', 'El pseudocódigo se traduce casi palabra por palabra: if ... then ... end, for, while y funciones'],
      ['C3', 'La tabla es la única estructura: listas desde el 1, registros con claves, y se comparten, no se copian'],
      ['C4', 'LÖVE te llama a ti: load una vez; update(dt) y draw en cada frame'],
      ['C5', 'Mover con el teclado: isDown para lo sostenido, keypressed para lo puntual, la y hacia abajo y todo por dt']
    ],
    agenda: [
      ['0:00', 'Bienvenida y quiz preclase'],
      ['0:08', 'El teatro: qué es Lua, qué es LÖVE, instalar y correr el primer main.lua'],
      ['0:18', 'Del pseudocódigo a Lua: variables, tipos, nil, la verdad y el operador ..'],
      ['0:35', 'Decidir, repetir y funciones (con las pestañas «pruébalo»)'],
      ['0:50', 'Tablas: cajones desde el 1, ipairs y pairs, se comparten'],
      ['1:05', 'LÖVE: load, update y draw. Dibujar y las coordenadas con la y hacia abajo'],
      ['1:18', 'Entrada: isDown frente a keypressed, y por qué todo va por dt'],
      ['1:28', 'Taller en parejas: Coin Hunt corriendo en tu computador'],
      ['1:43', 'Asesoría ACA 1: dudas del UML y del diagrama de estados del Breakout'],
      ['1:52', 'Quiz postclase y cierre']
    ],
    conceptos: [
      { t: 'Variable local', d: 'Una caja con nombre que guarda un valor. Con <code>local</code> existe solo dentro del bloque o archivo donde nace; sin <code>local</code> es global y la ve todo el programa.', ej: '<code>local puntaje = 0</code> en main.lua. Si olvidas el <code>local</code> en una función, creas una global que otra parte del juego puede pisar sin querer.' },
      { t: 'Tipo dinámico', d: 'En Lua el tipo lo lleva el valor, no la variable. Los tipos que más usarás: <code>nil</code>, <code>boolean</code>, <code>number</code>, <code>string</code>, <code>table</code> y <code>function</code>. <code>type(x)</code> te dice cuál es.', ej: '<code>print(type(jugador.vida))</code> cuando algo raro pasa: si dice <code>nil</code>, el campo no existe o está mal escrito.' },
      { t: 'nil', d: 'El valor que significa «nada». Lo tiene una variable sin asignar y cualquier clave que no existe en una tabla. Tocar un campo de algo que es nil detiene el juego.', ej: '<i>attempt to index a nil value</i>: el error más común en LÖVE. Casi siempre es un nombre mal escrito o algo que no se creó en <code>love.load</code>.' },
      { t: 'Verdad en Lua', d: 'Solo <code>nil</code> y <code>false</code> son falsos. Todo lo demás es verdadero, incluidos el <code>0</code> y el texto vacío <code>""</code>.', ej: '<code>if puntaje then</code> es verdadero aunque el puntaje sea 0. Para preguntar por cero escribe <code>if puntaje == 0 then</code>.' },
      { t: 'Concatenar con ..', d: 'Los dos puntos seguidos unen textos. El <code>+</code> es solo para sumar números.', ej: '<code>"Monedas: " .. puntaje</code> en el marcador de Coin Hunt.' },
      { t: 'Tabla', d: 'La única estructura de datos de Lua. Sirve como lista (claves 1, 2, 3...) y como registro (claves con nombre). Asignarla a otra variable no la copia: las dos apuntan a la misma.', ej: '<code>monedas = { m1, m2, m3 }</code> es una lista; cada moneda <code>{ x = 120, y = 80, radio = 8 }</code> es un registro.' },
      { t: 'ipairs y pairs', d: '<code>ipairs</code> recorre una lista en orden 1, 2, 3... y se detiene en el primer hueco. <code>pairs</code> recorre todas las claves de un registro, sin orden garantizado.', ej: '<code>for _, m in ipairs(monedas) do m:draw() end</code> para dibujar todas las monedas.' },
      { t: 'Callback de LÖVE', d: 'Una función con nombre fijo que tú escribes y LÖVE llama en el momento justo: <code>love.load</code> al arrancar, <code>love.update(dt)</code> y <code>love.draw</code> en cada frame, <code>love.keypressed</code> al pulsar.', ej: 'Nunca escribes el bucle del juego: LÖVE ya lo trae. Tú rellenas las funciones.' },
      { t: 'dt y la entrada', d: '<code>dt</code> son los segundos desde el frame anterior: multiplicar la velocidad por dt da el mismo movimiento en cualquier computador. <code>isDown</code> se pregunta cada frame (caminar); <code>keypressed</code> llega una vez por pulsación (saltar, pausar).', ej: '<code>jugador.x = jugador.x + 250 * dt</code> mueve 250 píxeles por segundo con 30 o con 144 FPS.' }
    ],
    errores: [
      { mito: 'Las listas empiezan en 0, como en otros lenguajes.', real: 'En Lua empiezan en 1. <code>monedas[0]</code> no da error: da <code>nil</code>, y el error aparece después, lejos de la causa.' },
      { mito: 'Si no escribo <code>local</code> no pasa nada.', real: 'La variable se vuelve global y la ve todo el juego. Dos archivos que usan <code>x</code> sin local se pisan entre ellos. Escribe <code>local</code> siempre, salvo en los callbacks de LÖVE.' },
      { mito: 'El 0 es falso, como en C o JavaScript.', real: 'En Lua el 0 y el texto vacío son verdaderos. Lo falso es exactamente <code>nil</code> y <code>false</code>.' },
      { mito: '<code>local b = a</code> hace una copia de la tabla.', real: 'Las dos variables apuntan a la misma tabla. Lo que cambies por <code>b</code> lo ve <code>a</code>. Para copiar se crea una tabla nueva y se llena.' },
      { mito: 'Puedo mover las cosas dentro de <code>love.draw</code>.', real: 'Funciona en tu computador y falla en otro: draw no recibe dt y mezcla lógica con dibujo. Mover, decidir y chocar va en update; draw solo pinta.' },
      { mito: 'isDown y keypressed son lo mismo.', real: 'isDown es verdadero en cada frame mientras mantienes la tecla (unos 60 por segundo). keypressed llega una vez por pulsación. Saltar con isDown da 60 saltos por segundo.' }
    ],
    codigoIntro: 'Cinco bloques, en el orden de la clase. Cada uno empieza por el pseudocódigo que ya escribiste en el Módulo 0 o en la sesión 2 y lo traduce a Lua. Las pestañas <b>Lua (pruébalo)</b> se ejecutan aquí mismo: cambia un número, córrelo y mira qué imprime. Las pestañas <b>Lua (LÖVE)</b> se corren con LÖVE en tu computador.',
    codigo: [
      { titulo: 'Variables, tipos y la verdad en Lua', desc: 'Lo mismo que hacías con «VARIABLE x ← valor», ahora con <code>local</code>. Fíjate en tres sorpresas: <code>escudo</code> vale <code>nil</code> sin que nadie lo diga, el <code>0</code> es verdadero y el texto se une con <code>..</code>.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: pseVars }, { lang: 'Lua', label: 'Lua (pruébalo)', src: luaVars, run: true }, { lang: 'Lua', label: 'Operadores (pruébalo)', src: luaOperadores, run: true }] },
      { titulo: 'Decidir, repetir y funciones', desc: '<code>SI ... ENTONCES</code> se vuelve <code>if ... then ... end</code>; <code>PARA</code> se vuelve <code>for</code>. Todo bloque de Lua cierra con <code>end</code>. El <code>for</code> incluye los dos extremos. Las funciones son valores: se guardan y se pasan, y eso es justo lo que hace LÖVE con tus callbacks.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: pseFlujo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: luaFlujo, run: true }, { lang: 'Lua', label: 'Funciones (pruébalo)', src: luaFunciones, run: true }] },
      { titulo: 'Tablas: listas, registros y referencias', desc: 'Una sola estructura para todo. Como lista empieza en <b>1</b> y se recorre con <code>ipairs</code>; como registro se lee con punto y se recorre con <code>pairs</code> (el orden de pairs puede variar). La última parte muestra la trampa: una tabla no se copia al asignarla.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: pseTablas }, { lang: 'Lua', label: 'Lua (pruébalo)', src: luaTablas, run: true }, { lang: 'Lua', label: 'Copiar de verdad (pruébalo)', src: luaCopia, run: true }] },
      { titulo: 'El esqueleto de LÖVE: load, update y draw', desc: 'El game loop de la sesión 2, pero sin escribir el bucle: LÖVE lo trae. Tú rellenas tres funciones. La pestaña de simulación imita al director con Lua puro para que veas el orden de las llamadas sin instalar nada.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo (sesión 2)', src: pseLoop }, { lang: 'Lua', label: 'Lua (LÖVE) main.lua', src: loveLoop }, { lang: 'Lua', label: 'Simular al director (pruébalo)', src: simLoop, run: true }, { lang: 'Lua', label: 'conf.lua', src: confLua }] },
      { titulo: 'Proyecto Coin Hunt', desc: 'Un círculo que se mueve con flechas o WASD y recoge 6 monedas. Todo en un solo <code>main.lua</code> con tablas simples, más <code>conf.lua</code> para la ventana de 800 × 600. En la sesión 5 lo partimos en clases y archivos. Para correrlo: carpeta <code>coin-hunt</code> con los dos archivos, y <code>love .</code> o Alt+L.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: pseCoin }, { lang: 'Lua', label: 'main.lua (1/3) load', src: coin1 }, { lang: 'Lua', label: 'main.lua (2/3) update', src: coin2 }, { lang: 'Lua', label: 'main.lua (3/3) draw', src: coin3 }, { lang: 'Lua', label: 'conf.lua', src: confLua }] }
    ],
    practica: {
      t: 'Coin Hunt corriendo en tu computador',
      intro: 'En parejas: una persona escribe y la otra lee el código en voz alta y revisa. A la mitad cambian. El objetivo no es copiar rápido: es correr cada paso antes de seguir.',
      pasos: [
        'Crea la carpeta <code>coin-hunt</code> con <code>conf.lua</code> y un <code>main.lua</code> que solo tenga <code>love.load</code> y <code>love.draw</code> con el jugador. Córrelo: el círculo debe aparecer en el centro.',
        'Agrega <code>love.update(dt)</code> con las cuatro flechas y <code>isDown</code>. Córrelo y verifica que la flecha abajo hace <b>bajar</b> al jugador.',
        'Agrega la lista de 6 monedas en <code>love.load</code> y dibújalas con <code>ipairs</code>. Córrelo.',
        'Agrega <code>seTocan</code> y el puntaje. Recoge las 6 y prueba la tecla R para reiniciar.',
        'Reto: que el jugador no se salga de la ventana. Pista: <code>math.max</code> y <code>math.min</code> con 0, 800 y 600.'
      ],
      entrega: 'Una captura de pantalla con «Monedas: 6 / 6» y tu <code>main.lua</code> en el foro de la sesión.'
    },
    tarea: [
      'Amplía Coin Hunt: agrega un enemigo (otra tabla con x, y y velocidad) que se mueva solo y rebote en los bordes. Si toca al jugador, el puntaje vuelve a 0.',
      'Bonus: un temporizador en pantalla que cuente hacia atrás desde 30 segundos usando <code>dt</code>. Al llegar a 0, muestra «Se acabó el tiempo».',
      'ACA 1: con lo que salió en la asesoría, revisa tu diagrama de clases y tu diagrama de estados del Breakout. La próxima sesión se entrega.',
      'Repasa las pestañas «pruébalo» de esta página: cambia valores y predice la salida antes de correr.'
    ],
    lecturas: [
      'Ierusalimschy, R. <i>Programming in Lua</i>. La 1.ª edición está gratis en lua.org/pil; capítulos 1 a 5 (tipos, expresiones, sentencias y funciones).',
      'Sheepolution. <i>How to LÖVE</i> (sheepolution.com/learn/book): capítulos de variables, funciones, tablas y los callbacks de LÖVE.',
      'Wiki oficial de LÖVE 11.x (love2d.org/wiki): <code>love.load</code>, <code>love.update</code>, <code>love.draw</code>, <code>love.keyboard.isDown</code> y <code>love.keypressed</code>.',
      '<i>Learn Lua in Y Minutes</i>, versión en español (learnxinyminutes.com).',
      'Manual de referencia de Lua 5.1 (lua.org/manual/5.1). LÖVE usa LuaJIT, que es compatible con Lua 5.1.'
    ],
    mapa: {
      lead: 'Del idioma (Lua) al escenario (LÖVE) y al primer juego.',
      nodos: [
        ['lua', 'Lua', 'el idioma', 'idea', 'Un lenguaje pequeño de scripting. Aquí escribes la lógica: variables, tablas y funciones.'],
        ['var', 'Variables y tipos', 'local, nil, la verdad', 'codigo', 'Siempre local. El tipo lo lleva el valor. Solo nil y false son falsos.'],
        ['flujo', 'Decidir y repetir', 'if, for, while, funciones', 'codigo', 'La traducción directa del pseudocódigo. Todo bloque cierra con end.'],
        ['tablas', 'Tablas', 'cajones desde el 1', 'idea', 'Listas y registros con una sola estructura. Se comparten, no se copian.'],
        ['love', 'LÖVE', 'load, update, draw', 'patron', 'El director: trae el bucle del juego y llama a tus funciones en el momento justo.'],
        ['dibujo', 'Dibujar', 'love.graphics, y hacia abajo', 'codigo', 'Colores de 0 a 1, origen arriba a la izquierda, la y crece hacia abajo.'],
        ['entrada', 'Entrada y dt', 'isDown y keypressed', 'codigo', 'Lo sostenido se pregunta en update; lo puntual llega por keypressed. Todo movimiento por dt.'],
        ['coin', 'Coin Hunt', 'el primer juego', 'practica', 'Un círculo, 6 monedas, un puntaje y una tecla para reiniciar.'],
        ['bugs', 'Errores típicos', 'nil, global, índice 0', 'riesgo', 'Indexar un nil, olvidar local, contar desde 0, sumar texto con +, olvidar dt.']
      ],
      cables: [
        ['lua', 'var', 'llamada'], ['var', 'flujo', 'llamada'], ['var', 'tablas', 'datos'], ['var', 'bugs', 'llamada'],
        ['flujo', 'love', 'llamada'], ['tablas', 'love', 'datos'], ['love', 'dibujo', 'llamada'], ['love', 'entrada', 'evento'],
        ['dibujo', 'coin', 'llamada'], ['entrada', 'coin', 'evento'], ['tablas', 'coin', 'datos']
      ]
    },

    slides: [
      { kind: 'portada', title: 'Lua y LÖVE',
        lead: 'Sesión 4 · Programación de Videojuegos',
        full: [
          { ul: ['Hoy escribes Lua de verdad, traduciendo el pseudocódigo que ya conoces.', 'Conoces al director: LÖVE y sus tres llamadas.', 'Sales con Coin Hunt corriendo en tu computador.'] },
          { pie: 'Ten LÖVE 11.x y VSCode instalados. Si no alcanzaste, las pestañas «pruébalo» del sitio corren Lua en el navegador.' }
        ],
        nota: '3 minutos. Lee la pregunta en voz alta y pide en el chat una palabra: ¿qué es lo mínimo para ver algo moverse? Respuestas típicas: «un motor», «un bucle», «una imagen». Todas tienen algo de razón; hoy veremos que son tres funciones. Recuerda que el quiz preclase ya debe estar hecho.' },

      { kind: 'analogia', title: 'LÖVE es el director; tú escribes tu papel',
        izq: 44,
        left: [
          { big: 'No decides cuándo sales a escena. Decides qué haces cuando te llaman.' },
          { clave: 'Eso es un <b>callback</b>: una función tuya que otro llama en el momento justo.', paso: true }
        ],
        right: [
          { mapa: [['El director', 'LÖVE: trae el bucle del juego'], ['«Prepárate» (una vez)', '<code>love.load()</code>'], ['«¡Acción!» (cada frame)', '<code>love.update(dt)</code>'], ['«Foto» (cada frame)', '<code>love.draw()</code>'], ['Alguien grita desde el público', '<code>love.keypressed(tecla)</code>']], de: 'En el teatro', a: 'En LÖVE', pasos: true }
        ],
        nota: '4 minutos. Revela fila por fila. Conecta con la sesión 2: el game loop entrada, actualizar, dibujar ya lo conocen; la diferencia es que en LÖVE el bucle ya está escrito. Pregunta: «¿quién llama a love.draw?». Respuesta esperada: LÖVE, nunca tú. Error típico: pensar que hay que escribir un while infinito.' },

      { kind: 'idea', title: 'Dos cosas, un flujo: Lua y LÖVE',
        izq: 50,
        left: [
          { tabla: { head: ['', 'Qué es', 'Qué te da'], rows: [['<b>Lua</b>', 'El idioma', 'Variables, tablas, funciones'], ['<b>LÖVE</b>', 'El escenario', 'Ventana, dibujo, teclado, sonido y el bucle'], ['<b>VSCode</b>', 'El cuaderno', 'Donde escribes los .lua']] }, pasos: true },
          { pie: 'Extensiones de VSCode: «Lua» (sumneko) y «Love2D Support» (Pixelbyte).', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'main.lua', src: hola }, { lang: 'Pseudo', label: 'Cómo correrlo', src: correr }], marca: [
          { l: [2, 3, 4], t: '<b>love.draw</b> escribe en la <b>ventana</b> del juego.' },
          { l: [6], t: '<b>print</b> escribe en la <b>consola</b>. Te sirve para depurar, el jugador no lo ve.' }
        ] }],
        nota: '6 minutos. Haz la demo en vivo: carpeta nueva, main.lua con estas 6 líneas, Alt+L. Que vean la ventana. Pasa a la pestaña «Cómo correrlo». Pregunta: «¿qué pasa si el archivo se llama Main.lua o main.lua.txt?». Respuesta: LÖVE no lo encuentra y muestra su pantalla de «no game». Error típico en Windows: las extensiones de archivo ocultas.' },

      { kind: 'idea', title: 'Ya sabes programar: solo cambia el idioma',
        lead: 'El pseudocódigo del Módulo 0, palabra por palabra.',
        full: [
          { tabla: { head: ['Pseudocódigo', 'Lua', 'Ojo con'], rows: [
            ['VARIABLE x ← 3', '<code>local x = 3</code>', 'El <code>local</code>'],
            ['SI ... ENTONCES ... SINO ... FIN', '<code>if ... then ... else ... end</code>', 'El <code>then</code> y el <code>end</code>'],
            ['PARA i DESDE 1 HASTA 6', '<code>for i = 1, 6 do ... end</code>', 'Incluye el 6'],
            ['MIENTRAS cond', '<code>while cond do ... end</code>', 'Que la cond cambie'],
            ['Y · O · NO · ≠', '<code>and</code> · <code>or</code> · <code>not</code> · <code>~=</code>', '<code>!=</code> no existe'],
            ['unir "Vidas: " y 3', '<code>"Vidas: " .. 3</code>', 'El <code>+</code> no une texto']
          ] }, pasos: true }
        ],
        nota: '5 minutos. Revela fila por fila y pide que digan la traducción antes de que aparezca. Insiste en que esto no es nuevo: es lo mismo que hicieron en papel. Pregunta: «¿cuál de estas filas creen que más va a fallar?». Respuesta honesta: el end que falta y el + con texto. Lo vemos ahora en código.' },

      { kind: 'codigo', title: 'Variables y tipos, en vivo',
        izq: 36,
        left: [
          { check: { q: 'En la línea 5, <code>escudo</code> no recibió valor. ¿Qué imprime <code>type(escudo)</code>?', opts: ['Un error: la variable no existe', '"nil"', '"boolean"', 'Nada: la línea se salta'], ok: 1, why: 'Una variable sin valor vale <code>nil</code>, el valor «nada». <code>type</code> devuelve su nombre como texto.' } },
          { pie: 'Corre la pestaña «pruébalo» en la página de la sesión.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: luaVars }], marca: [
          { l: [2, 3, 4, 5], t: '<b>local</b> siempre. El tipo lo lleva el valor: texto, número, booleano y nil.' },
          { l: [7], t: '<code>type(x)</code> te dice qué hay en la caja. Tu mejor amigo al depurar.' },
          { l: [9, 10], t: 'Reasignar no lleva <code>local</code>. El texto se une con <b>..</b>' },
          { l: [13, 14], t: 'El <b>0 es verdadero</b>. Esto sí se imprime.' },
          { l: [18], t: '<code>or</code> como valor por defecto: si escudo es nil, usa 200.' }
        ] }],
        nota: '8 minutos. Que voten y luego recorre las marcas. Proyecta la página de la sesión y corre la pestaña «pruébalo»: que vean la salida real. Pide a alguien que cambie la línea 10 por un + y la corra: verán el error de aritmética con un texto. Pregunta: «¿por qué Lua no adivina que querías unir?». Respuesta: porque + es solo para números; Lua no adivina, como el robot del Módulo 0.' },

      { kind: 'reto', title: 'Predice: ¿cuáles son verdaderos?',
        izq: 44,
        left: [{ check: { q: '¿Cuántas de las cuatro posiciones imprimen «verdadero»?', opts: ['Una: solo "hola"', 'Dos: "hola" y 0', 'Tres: 0, "" y "hola"', 'Las cuatro'], ok: 2, why: 'En Lua solo <code>nil</code> y <code>false</code> son falsos. El 0 y el texto vacío son verdaderos. Si vienes de JavaScript o Python, este es el cambio más raro.' } }],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: verdad }], marca: [
          { l: [1], t: 'Cuatro valores: un cero, un texto vacío, un texto y un false.' },
          { l: [4], t: '<code>if valor then</code> pregunta «¿es verdadero en Lua?», no «¿es distinto de cero?».' },
          { l: [11, 12], t: 'nil también es falso. Los falsos son <b>exactamente dos</b>.' }
        ] }],
        nota: '4 minutos. Votación en el chat antes de revelar. Error esperado: «una» o «dos», por costumbre de otros lenguajes. Consecuencia en juegos: <code>if vidas then</code> no detecta que se acabaron las vidas; hay que escribir <code>if vidas == 0 then</code>.' },

      { kind: 'codigo', title: 'Decidir y repetir',
        izq: 34,
        left: [
          { check: { q: '¿Cuántas veces corre el <code>for</code> de la línea 13?', opts: ['Tres', 'Cuatro', 'Cinco', 'Ninguna: el paso negativo no se permite'], ok: 1, why: '100, 60, 20 y -20: el for <b>incluye</b> el extremo si cae justo en él. El paso negativo cuenta hacia atrás.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: luaFlujo }, { lang: 'Pseudo', label: 'Pseudocódigo', src: pseFlujo }], marca: [
          { l: [3, 5, 7, 9], t: '<code>if</code> ... <code>then</code>, <code>elseif</code> en una palabra, <code>else</code>, y un solo <code>end</code> al final.' },
          { l: [13, 14, 15], t: '<code>for vida = 100, -20, -40</code>: desde, hasta y paso. Incluye los extremos.' },
          { l: [19, 20], t: '<code>while</code> revisa antes de entrar. Si la condición nunca cambia, el juego se congela.' }
        ] }],
        nota: '7 minutos. Votan y recorren. Muestra la pestaña de pseudocódigo al lado: misma estructura. Pregunta: «¿qué pasa si borro la línea 20?». Respuesta: bucle infinito; en LÖVE la ventana se congela y no responde. Es el mismo error de los ciclos del Módulo 0.' },

      { kind: 'idea', title: 'Funciones: recetas con nombre que se pasan de mano en mano',
        izq: 40,
        left: [
          { ul: ['Entran parámetros, sale un <code>return</code>.', 'Son valores: se guardan en una variable.', 'Se pasan a otra función: eso es un callback.'], pasos: true },
          { clave: 'Cuando escribes <code>function love.update(dt)</code> le entregas una receta a LÖVE.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Funciones (pruébalo)', src: luaFunciones }], marca: [
          { l: [2, 3, 4, 5], t: 'Definir y llamar. <code>local function</code> para que no sea global.' },
          { l: [8, 9], t: '<code>golpe</code> y <code>danar</code> son <b>la misma</b> función con dos nombres.' },
          { l: [19, 20], t: 'Pasar una función a otra: LÖVE hace esto con tus callbacks.' }
        ] }],
        nota: '5 minutos. No te detengas en los dos retornos; basta que sepan que existen. Lo importante es la última marca: una función es un valor. Pregunta: «¿qué número sale en la línea 20?». Respuesta: 80 (100 menos 10 dos veces).' },

      { kind: 'analogia', title: 'Una tabla es un mueble de cajones numerados desde el 1',
        izq: 60,
        left: [{ fig: 'cajones' }],
        right: [
          { mapa: [['Cajón 1, 2, 3...', 'Lista: <code>monedas[1]</code>'], ['Cajón con etiqueta', 'Registro: <code>jugador.vida</code>'], ['Cajón que no existe', '<code>nil</code>, sin error']], de: 'El mueble', a: 'La tabla', pasos: true },
          { clave: 'El primer cajón es el <b>1</b>.', paso: true }
        ],
        nota: '6 minutos. En la figura, antes de tocar, pregunta: «¿qué devuelve monedas[0]?». Luego leer [0], insertar dos y quitar el primero: que vean cómo bajan todos. Termina con «Recorrer con ipairs». Error típico de quien viene de otro lenguaje: el for de 0 a #monedas - 1.' },

      { kind: 'codigo', title: 'Tablas: listas, registros y la trampa',
        izq: 36,
        left: [
          { check: { q: 'Después de <code>otro.vida = 0</code>, ¿qué imprime <code>jugador.vida</code>?', opts: ['100: nadie tocó a jugador', '0: otro y jugador son la misma tabla', 'nil', 'Error: no se puede cambiar una tabla ajena'], ok: 1, why: '<code>local otro = jugador</code> no copia: crea otra etiqueta para la misma tabla. Por eso una función que recibe tu tabla puede cambiarla.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (pruébalo)', src: luaTablas }, { lang: 'Lua', label: 'Copiar de verdad (pruébalo)', src: luaCopia }], marca: [
          { l: [1, 2, 3, 4], t: 'Lista: desde el 1. El 0 es nil. <code>#</code> da la longitud.' },
          { l: [6, 7, 8, 9], t: '<code>ipairs</code>: en orden, para listas.' },
          { l: [11, 12, 13, 14], t: 'Registro: claves con nombre. <code>pairs</code> las recorre todas, en cualquier orden.' },
          { l: [17, 18, 19], t: '<b>La trampa:</b> dos nombres, una tabla.' }
        ] }],
        nota: '8 minutos. Votan y recorren. Corre la pestaña «pruébalo» en la página: señala que el orden de pairs puede salir distinto en cada computador. Pasa a «Copiar de verdad». Pregunta: «en Coin Hunt, ¿por qué esto es bueno y no solo una trampa?». Respuesta: porque en el for de las monedas, m es la moneda misma; al poner m.tomada = true cambias la moneda de la lista.' },

      { kind: 'demo', title: 'Dos etiquetas, una sola tabla',
        izq: 34,
        left: [
          { big: 'Asignar una tabla no la copia. Le pone otra etiqueta.' },
          { pie: 'Números, textos y booleanos sí se copian.', paso: true }
        ],
        right: [{ fig: 'referencia' }],
        nota: '3 minutos. Modo tabla: cambiar por b y luego print(a). Luego «Hacer una copia de verdad» y repetir. Cambia a número para el contraste. Pregunta: «¿qué tipo de datos se comparte?». Respuesta: las tablas (y las funciones); los números y textos se copian.' },

      { kind: 'demo', title: 'El director llama a escena',
        lead: 'Dale Paso y cuenta: ¿cuántas veces sale load? ¿Cuándo se mueve el cuadro en la pantalla?',
        top: true,
        full: [{ fig: 'teatro' }, { clave: 'update cambia el estado en memoria; draw lo muestra. Nunca al revés.', paso: true }],
        nota: '6 minutos. Da Paso uno por uno las primeras cuatro veces: load, update, draw, update. Señala que tras update la x de memoria cambió y la pantalla no. Luego Reproducir y «Pulsar espacio». Pregunta: «¿qué pasaría si crearan las monedas en update?». Respuesta: 6 monedas nuevas en cada frame. Pregunta 2: «¿cuántas veces corrió load?». Respuesta: una.' },

      { kind: 'codigo', title: 'El game loop de la sesión 2, ya escrito',
        izq: 34,
        left: [
          { check: { q: 'Con 60 FPS, dt vale unos 0,016 s. ¿Cuántos píxeles avanza el cuadro en un segundo?', opts: ['5', '60', '200, sin importar los FPS', 'Depende del computador'], ok: 2, why: '<code>vel * dt</code> suma 200 × 0,016 en cada frame, y en un segundo hay 60 frames: 200 píxeles. Con 30 FPS dt es el doble y el resultado es el mismo.' } },
          { pie: 'La pestaña «Simular al director» corre aquí mismo.', paso: true }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'Lua (LÖVE) main.lua', src: loveLoop }, { lang: 'Lua', label: 'Simular al director (pruébalo)', src: simLoop }, { lang: 'Pseudo', label: 'Pseudocódigo (sesión 2)', src: pseLoop }], marca: [
          { l: [2], t: 'La variable vive fuera de las funciones para que las tres la vean. Con <code>local</code>.' },
          { l: [4, 5, 6], t: '<b>load</b>: preparar una vez.' },
          { l: [8, 9, 10], t: '<b>update(dt)</b>: mover y decidir. Velocidad × dt.' },
          { l: [13, 14, 15, 16, 17], t: '<b>draw</b>: solo pintar. Los colores van de 0 a 1 y <code>setColor</code> tiñe todo lo que sigue.' }
        ] }],
        nota: '7 minutos. Votan y recorren. Corre en vivo el main.lua. Luego la pestaña de simulación en el sitio: el orden de los print es el orden de las llamadas. Error típico: setColor sin volver a blanco, y el texto sale naranja. Pregunta: «¿por qué math.floor en la línea 17?». Respuesta: x tiene decimales por dt; para mostrarla se redondea hacia abajo.' },

      { kind: 'demo', title: 'La pantalla tiene la y hacia abajo',
        izq: 30,
        left: [
          { big: 'El (0, 0) está arriba a la izquierda.' },
          { ul: ['x crece hacia la derecha.', 'y crece hacia <b>abajo</b>.', 'El centro de 800 × 600 es (400, 300).'], pasos: true }
        ],
        right: [{ fig: 'pantalla' }],
        nota: '4 minutos. Antes de pulsar «y = y + 100», que voten: ¿sube o baja? Luego cambia a «Plano del colegio» para el contraste. Pregunta: «en Coin Hunt, ¿la flecha arriba suma o resta a la y?». Respuesta: resta. Error clásico: copiar fórmulas de física con la y hacia arriba y ver todo de cabeza.' },

      { kind: 'reto', title: 'Predice: caminar y saltar',
        izq: 40,
        left: [{ check: { q: 'Quieres que el personaje salte <b>una vez</b> por cada pulsación de espacio. ¿Dónde lo pones?', opts: ['En love.update con <code>love.keyboard.isDown("space")</code>', 'En love.draw', 'En <code>love.keypressed(tecla)</code> con <code>if tecla == "space"</code>', 'En love.load'], ok: 2, why: 'keypressed llega una vez por pulsación. isDown es verdadero en <b>cada frame</b> mientras mantienes la tecla: unos 60 saltos por segundo.' } }],
        right: [{ fig: 'teclas' }],
        nota: '5 minutos. Votan. Luego en la figura mantienen presionado: la bola verde camina en cada frame y la ámbar salta una vez. Cambia a «Saltar con isDown» y mantén: se pega al techo. Mira la tira de frames: ámbar es isDown, coral es keypressed. Regla para el tablero: sostenido = isDown en update; puntual = keypressed.' },

      { kind: 'antipatron', title: 'Tres errores en un archivo pequeño',
        lead: 'Corre en tu computador. En el de otra persona, no.',
        top: true,
        full: [{ compare: { a: { label: 'Así no', lang: 'Lua', src: malLoop }, b: { label: 'Así sí', lang: 'Lua', src: bienLoop } } }],
        nota: '5 minutos. Pide que encuentren los tres errores antes de leer los comentarios: (1) mover sin dt, (2) saltar con isDown, (3) lógica dentro de draw. Pregunta: «¿qué pasa en un monitor de 144 Hz con el de la izquierda?». Respuesta: todo va más del doble de rápido. Es el flipbook de la sesión 2: dt dice cuánto tiempo pasó entre páginas.' },

      { kind: 'idea', title: 'Coin Hunt: el primer juego completo',
        izq: 48,
        left: [{ svg: svgCoin }],
        right: [
          { ul: ['Un círculo que se mueve con flechas o WASD.', '6 monedas en lugares al azar.', 'Un marcador, y R para reiniciar.'], pasos: true },
          { clave: 'Todo lo que hemos visto hoy cabe en un solo main.lua.', paso: true },
          { pie: 'Hoy con tablas simples. En la sesión 5 lo partimos en clases y archivos.', paso: true }
        ],
        nota: '3 minutos. Muestra el juego corriendo antes del código: que sepan a dónde van. Pregunta: «¿en cuál de las tres funciones va cada cosa: crear monedas, mover, revisar si toca, pintar el marcador?». Respuesta: load, update, update, draw.' },

      { kind: 'codigo', title: 'Coin Hunt por dentro: preparar y mover',
        izq: 34,
        left: [
          { check: { q: 'El jugador nace en <code>x = 400, y = 300</code>. ¿Dónde aparece en la ventana de 800 × 600?', opts: ['En la esquina de abajo a la derecha', 'En el centro', 'Arriba a la izquierda', 'Fuera de la ventana'], ok: 1, why: '400 es la mitad de 800 y 300 la mitad de 600. El (0, 0) está arriba a la izquierda.' } }
        ],
        right: [{ code: [{ lang: 'Lua', label: 'main.lua (1/3) load', src: coin1 }, { lang: 'Lua', label: 'main.lua (2/3) update', src: coin2 }, { lang: 'Lua', label: 'conf.lua', src: confLua }], marca: [
          { l: [2], t: 'Tres variables que comparten las funciones. <code>local</code>, arriba de todo.' },
          { l: [6], t: 'El jugador es un <b>registro</b>: una tabla con claves.' },
          { l: [7, 8, 15, 16], t: 'Las monedas son una <b>lista</b> de registros, creada <b>una vez</b> en load.' },
          { l: [9, 10, 11, 12, 13, 14], t: 'Cada moneda: posición al azar dentro de la ventana, radio y si ya la tomaron.' }
        ] }],
        nota: '6 minutos. Recorre las marcas del load y pasa a la pestaña 2/3. Ahí señala: v = vel * dt, la flecha abajo suma a la y, y seTocan compara la distancia con la suma de los radios (la colisión de círculos se profundiza en la sesión 6). Pregunta: «¿por qué random entre 40 y 760 y no entre 0 y 800?». Respuesta: para que ninguna moneda nazca cortada en el borde.' },

      { kind: 'actividad', title: 'Taller: Coin Hunt en tu computador · 15 minutos',
        lead: 'En parejas: una persona escribe y la otra lee y revisa. A los 7 minutos cambian.',
        izq: 56,
        left: [{ ol: ['<code>conf.lua</code> y el jugador dibujado en el centro. Córrelo.', 'Movimiento con <code>isDown</code> y <code>dt</code>. Córrelo.', 'Las 6 monedas, <code>seTocan</code> y el puntaje. Córrelo.', 'Reto: que no se salga de la ventana.'], pasos: true }],
        right: [{ panel: ['Escribe poco, córrelo, repite. Si truena, lee la <b>primera línea</b> del error: dice el archivo y la línea.'], h: 'La regla del taller' }, { pie: 'Entrega: captura con «Monedas: 6 / 6» en el foro.', paso: true }],
        nota: '15 minutos en salas. Pasa por las salas. Errores que vas a ver: «attempt to index a nil value» por llamar jugador antes de crearlo o por un nombre mal escrito; un end que falta (el error señala la última línea del archivo); el archivo guardado como main.lua.txt. Pregunta al volver: «¿qué error les salió y cómo lo leyeron?». Comparte una solución del reto con math.max y math.min.' },

      { kind: 'antipatron', title: 'Los cinco errores que vas a ver esta semana',
        full: [
          { tabla: { head: ['Lo que ves', 'Lo que pasó', 'Arreglo'], rows: [
            ['<i>attempt to index a nil value</i>', 'Tocaste un campo de algo que no existe', 'Revisa el nombre y que se cree en load'],
            ['Una variable cambia sola', 'Olvidaste <code>local</code>: es global', '<code>local</code> siempre'],
            ['El primer enemigo no aparece', 'Contaste desde 0', 'Las listas empiezan en 1'],
            ['<i>attempt to perform arithmetic on a string</i>', 'Uniste texto con <code>+</code>', 'Usa <code>..</code>'],
            ['Va rapidísimo en otro PC', 'Moviste sin <code>dt</code>', 'velocidad × dt']
          ] }, pasos: true },
          { clave: 'Lee el error de arriba: dice archivo y línea. Ahí empieza la búsqueda, no ahí termina.', paso: true }
        ],
        nota: '4 minutos. Esta tabla es la chuleta de la semana; pide que la guarden. Pregunta: «¿cuál les salió en el taller?». Extra que conviene decir: = asigna y == compara; un = dentro de un if da error de sintaxis en Lua, lo cual es una suerte.' },

      { kind: 'reto', title: 'Antes de irte: quiz postclase',
        izq: 50,
        left: [
          { p: 'Ocho preguntas sobre las cinco ideas de hoy. Es la misma medición del quiz preclase: así ves cuánto avanzaste.' },
          { check: { q: 'Calentamiento: ¿en cuál función creas las monedas de Coin Hunt?', opts: ['love.draw', 'love.update', 'love.load', 'love.keypressed'], ok: 2, why: 'Se crean una vez, al arrancar. En update o draw nacerían 6 monedas nuevas en cada frame.' } }
        ],
        right: [{ panel: ['C1 · Lua es pequeño', 'C2 · Pseudocódigo → Lua', 'C3 · Tablas', 'C4 · load, update, draw', 'C5 · Entrada y dt'], h: 'Lo que mide el quiz' }],
        nota: '2 minutos para la pregunta de calentamiento y luego dales 8 minutos para el quiz en el sitio. Después de la asesoría del ACA 1 vuelves al cierre.' },

      { kind: 'cierre', title: 'Lo que te llevas hoy',
        full: [
          { ol: ['<b>Lua</b> es el pseudocódigo con otras palabras: <code>local</code>, <code>then</code>, <code>end</code>, <code>..</code> Solo nil y false son falsos.', '<b>Tablas</b> para todo: listas desde el 1 y registros. Se comparten, no se copian.', '<b>LÖVE</b> te llama: load una vez; update(dt) y draw en cada frame. isDown para lo sostenido, keypressed para lo puntual.'], pasos: true },
          { p: 'Tarea: enemigo en Coin Hunt y revisar el diseño del ACA 1. <b>Siguiente sesión:</b> clases en un lenguaje sin clases, módulos y estados; se entrega el ACA 1.', paso: true }
        ],
        nota: '3 minutos. Pregunta de salida: «¿qué es lo mínimo para ver algo moverse en pantalla?». Respuesta esperada: un main.lua con una variable, love.update que la cambie con dt y love.draw que la pinte. Anuncia que la sesión 5 convierte Coin Hunt en clases: que traigan su versión funcionando.' }
    ],

    pre: [
      { q: 'En Lua, ¿cuál de estos valores hace que <code>if v then ... end</code> <b>no</b> se ejecute?', opts: ['<code>0</code>', '<code>""</code> (texto vacío)', '<code>nil</code>', '<code>"false"</code> (un texto)'], ok: 2, why: 'En Lua solo <code>nil</code> y <code>false</code> son falsos. El 0, el texto vacío y el texto "false" son verdaderos. Engaña el 0 porque en otros lenguajes sí es falso.', idea: 'C1' },
      { q: 'El pseudocódigo dice: PARA i DESDE 1 HASTA 3, MOSTRAR i. ¿Cuál es la versión en Lua?', opts: ['<code>for (i = 1; i &lt;= 3; i++) print(i)</code>', '<code>for i = 1, 3 do print(i) end</code>', '<code>for i = 1, 3 print(i)</code>', '<code>for i in 3 do print(i) end</code>'], ok: 1, why: 'En Lua es <code>for variable = desde, hasta do ... end</code>. La primera es de C o JavaScript; la tercera olvida <code>do</code> y <code>end</code>.', idea: 'C2' },
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: `local monedas = { "oro", "plata", "bronce" }\nprint(monedas[1])` }, opts: ['<code>plata</code>', '<code>nil</code>', 'Un error', '<code>oro</code>'], ok: 3, why: 'Las listas de Lua empiezan en 1: el primer elemento es <code>monedas[1]</code>. Quien piensa que se cuenta desde 0 responde «plata».', idea: 'C3' },
      { q: 'Quieres mostrar el texto <code>Vidas: 3</code>. ¿Qué expresión une el texto con el número en Lua?', opts: ['<code>"Vidas: " .. 3</code>', '<code>"Vidas: " + 3</code>', '<code>"Vidas: " &amp; 3</code>', '<code>"Vidas: ", 3</code>'], ok: 0, why: 'Lua une textos con dos puntos seguidos. El <code>+</code> solo suma números: con un texto da error.', idea: 'C1' },
      { q: 'En LÖVE, ¿cuántas veces se llama a <code>love.load()</code>?', opts: ['En cada frame, antes de dibujar', 'Una vez, al arrancar el juego', 'Cada vez que pulsas una tecla', 'Nunca: tienes que llamarla tú en un bucle'], ok: 1, why: 'LÖVE llama a load una sola vez al inicio, para preparar el juego. Las que se repiten en cada frame son update y draw.', idea: 'C4' },
      { q: 'En la ventana de LÖVE, si a la <code>y</code> de un objeto le sumas 100, el objeto...', opts: ['sube', 'se mueve a la derecha', 'no cambia hasta el próximo nivel', 'baja'], ok: 3, why: 'En la pantalla el (0, 0) está arriba a la izquierda y la y crece hacia abajo. Es al revés que en el plano del colegio.', idea: 'C5' }
    ],
    post: [
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: `local vidas = 0\nif vidas then\n  print("sigue jugando")\nelse\n  print("game over")\nend` }, opts: ['<code>game over</code>', 'Nada', 'Un error', '<code>sigue jugando</code>'], ok: 3, why: 'El 0 es verdadero en Lua. Para preguntar si se acabaron las vidas hay que escribir <code>if vidas == 0 then</code>. Engaña «game over» porque en otros lenguajes el 0 es falso.', idea: 'C1' },
      { q: 'Dentro de una función escribiste <code>contador = 0</code> sin <code>local</code>. ¿Qué pasó?', opts: ['Lua da un error porque falta local', 'Creaste una variable global que cualquier parte del juego puede ver y pisar', 'La variable desaparece al terminar la función', 'Es exactamente lo mismo que con local'], ok: 1, why: 'Sin <code>local</code> la variable es global. No da error, por eso es peligroso: otro archivo con un <code>contador</code> la pisa sin avisar.', idea: 'C1' },
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: `local function estado(vida)\n  if vida <= 0 then return "fuera"\n  elseif vida < 30 then return "peligro"\n  else return "bien" end\nend\nprint(estado(25))` }, opts: ['<code>peligro</code>', '<code>bien</code>', '<code>fuera</code>', 'Un error: falta un end'], ok: 0, why: '25 no es menor o igual que 0, pero sí es menor que 30: entra en el <code>elseif</code>. Un solo <code>end</code> cierra todo el if, y otro cierra la función.', idea: 'C2' },
      { q: '¿Qué imprime este código?', code: { lang: 'Lua', src: `local a = { vida = 100 }\nlocal b = a\nb.vida = 0\nprint(a.vida)` }, opts: ['<code>100</code>', '<code>nil</code>', '<code>0</code>', 'Un error'], ok: 2, why: '<code>b = a</code> no copia la tabla: las dos variables apuntan a la misma. Lo que cambias por b lo ve a. Con números sí habría salido 100.', idea: 'C3' },
      { q: 'Tienes la lista <code>enemigos</code> y quieres recorrerla en orden, del primero al último. ¿Qué usas?', opts: ['<code>for i, e in ipairs(enemigos) do ... end</code>', '<code>for i = 0, #enemigos do ... end</code>', '<code>for clave, e in pairs(enemigos) do ... end</code>, porque garantiza el orden', '<code>while enemigos do ... end</code>'], ok: 0, why: '<code>ipairs</code> recorre 1, 2, 3... en orden. El for desde 0 lee un nil al principio. <code>pairs</code> recorre todo pero no garantiza el orden.', idea: 'C3' },
      { q: 'Un compañero puso el ciclo que crea las 6 monedas dentro de <code>love.update(dt)</code>. ¿Qué pasa al correr?', opts: ['Nada raro: aparecen 6 monedas', 'Se crean 6 monedas nuevas en cada frame: cientos por segundo', 'LÖVE da un error porque update no acepta ciclos', 'Las monedas aparecen solo en el primer frame'], ok: 1, why: 'update corre en cada frame. Lo que se hace una sola vez al arrancar va en <code>love.load</code>.', idea: 'C4' },
      { q: 'Quieres que el personaje <b>salte una vez</b> por pulsación y <b>camine</b> mientras mantienes la flecha. ¿Qué combinación es correcta?', opts: ['Las dos con <code>isDown</code> en update', 'Las dos con <code>keypressed</code>', 'Caminar con <code>keypressed</code> y saltar con <code>isDown</code>', 'Caminar con <code>isDown</code> en update y saltar con <code>keypressed</code>'], ok: 3, why: 'Caminar es sostenido: se pregunta en cada frame con isDown. Saltar es puntual: keypressed llega una vez por pulsación. Saltar con isDown da unos 60 saltos por segundo.', idea: 'C5' },
      { q: 'Dos versiones del movimiento: <code>x = x + 5</code> y <code>x = x + 300 * dt</code>. ¿Cuál se mueve igual en un computador a 30 FPS y en otro a 144 FPS?', opts: ['<code>x = x + 5</code>, porque 5 es fijo', 'Ninguna de las dos', '<code>x = x + 300 * dt</code>: 300 píxeles por segundo en ambos', 'Las dos son iguales'], ok: 2, why: 'Con <code>+ 5</code> avanzas 5 píxeles por frame: a 144 FPS va casi cinco veces más rápido que a 30. Multiplicar por dt convierte «por frame» en «por segundo».', idea: 'C5' }
    ]
  };
})();
