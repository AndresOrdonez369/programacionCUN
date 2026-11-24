/* Módulo 0 · Pensar como programador (autónomo, antes de la sesión 1 y de consulta todo el curso) */
(function () {
  const robotPseudo = `// Llevar al robot hasta la moneda
avanzar
avanzar
avanzar
girar a la izquierda
avanzar
avanzar`;
  const robotLua = `-- La misma receta, escrita como datos en Lua
local pasos = { "avanzar", "avanzar", "avanzar",
                "girar izquierda", "avanzar", "avanzar" }

for i, paso in ipairs(pasos) do
    print(i, paso)
end
print("Total de instrucciones: " .. #pasos)`;

  const varsPseudo = `vidas ← 3
puntos ← 0
puntos ← puntos + 50      // recoge una gema
vidas ← vidas - 1         // lo toca un enemigo
mostrar vidas, puntos     // ¿qué se ve?`;
  const varsLua = `local vidas = 3
local puntos = 0
puntos = puntos + 50   -- recoge una gema
vidas = vidas - 1      -- lo toca un enemigo
print("vidas:", vidas, "puntos:", puntos)

-- el estado del juego es la foto de todas sus variables
local nivel, enPausa = 1, false
print("nivel:", nivel, "en pausa:", enPausa)`;

  const boolPseudo = `enSuelo ← verdadero
aturdido ← falso

puedeSaltar ← enSuelo Y NO aturdido
mostrar puedeSaltar          // verdadero`;
  const boolLua = `local enSuelo = true
local aturdido = false

local puedeSaltar = enSuelo and not aturdido
print("¿puede saltar?", puedeSaltar)

-- tabla de verdad de "A y B": las 4 combinaciones
for _, a in ipairs({ true, false }) do
    for _, b in ipairs({ true, false }) do
        print(a, "y", b, "=", a and b)
    end
end`;

  const ifPseudo = `si escudo > 0 entonces
    escudo ← escudo - daño
sino
    vida ← vida - daño
fin

si vida <= 0 entonces
    estado ← "derrota"
fin`;
  const ifLua = `local vida, escudo, dano = 30, 0, 12

if escudo > 0 then
    escudo = escudo - dano
else
    vida = vida - dano
end

if vida <= 0 then
    print("derrota")
elseif vida < 20 then
    print("¡cuidado! vida baja:", vida)
else
    print("todo bien, vida:", vida)
end`;

  const loopPseudo = `// Patrón: lo mismo 5 veces → un ciclo
para i desde 1 hasta 5 hacer
    dibujar moneda en la posición i
fin

// Repetir mientras se cumpla algo
mientras enemigo.vida > 0 hacer
    atacar enemigo
fin`;
  const loopLua = `-- para: sabes cuántas veces
for i = 1, 5 do
    print("moneda en la casilla", i)
end

-- mientras: repites hasta que cambie una condición
local vidaJefe = 25
local golpes = 0
while vidaJefe > 0 do
    vidaJefe = vidaJefe - 7
    golpes = golpes + 1
end
print("Jefe vencido en", golpes, "golpes")`;

  const funcPseudo = `funcion sumarPuntos(cantidad)
    puntos ← puntos + cantidad
    si puntos >= 100 entonces
        mostrar "¡vida extra!"
    fin
fin

sumarPuntos(30)
sumarPuntos(80)`;
  const funcLua = `local puntos = 0

local function sumarPuntos(cantidad)
    puntos = puntos + cantidad
    if puntos >= 100 then
        print("¡vida extra! puntos:", puntos)
    end
end

sumarPuntos(30)
sumarPuntos(80)
print("Total:", puntos)`;

  const bugLua = `-- Debería contar las 5 monedas y dar 50 puntos.
-- Ejecuta, compara con lo esperado y encuentra el error.
local monedas = 5
local puntos = 0
for i = 1, monedas - 1 do
    puntos = puntos + 10
end
print("Puntos:", puntos, "(esperado: 50)")`;

  window.SESION = {
    n: 0,
    titulo: 'Pensar como programador',
    objetivos: [
      'Escribir instrucciones tan precisas que una máquina las siga sin adivinar nada.',
      'Partir un problema de juego en piezas pequeñas y encontrar lo que se repite.',
      'Seguir a mano cómo cambian las variables de un programa (prueba de escritorio).',
      'Combinar condiciones con Y, O y NO y comprobarlas con una tabla de verdad.',
      'Usar condicionales y ciclos, y encontrar un error con método en lugar de a la suerte.'
    ],
    analogia: 'Imagina que le das una receta a un robot de cocina que lo toma <b>todo</b> al pie de la letra. Si escribes «agrega sal», pregunta cuánta. Si olvidas «apaga el fuego», la olla se quema. Programar es escribir recetas para ese robot: el computador no entiende intenciones, solo instrucciones.',
    ideas: [
      ['C1', 'Un algoritmo es una receta precisa, ordenada y finita'],
      ['C2', 'Descomponer y encontrar patrones simplifica el problema'],
      ['C3', 'Las variables guardan el estado y cambian con la asignación'],
      ['C4', 'Las condiciones se combinan con Y, O y NO'],
      ['C5', 'Condicionales, ciclos y depuración con método']
    ],
    agenda: [
      ['15 min', 'Quiz preclase: mira de dónde partes'],
      ['20 min', 'Retos 1 y 2: el robot literal y descomponer'],
      ['20 min', 'Retos 3 y 4: patrones y abstracción'],
      ['25 min', 'Retos 5 y 6: variables y lógica booleana'],
      ['25 min', 'Retos 7 y 8: decidir, repetir y depurar'],
      ['15 min', 'Ejecuta y modifica los ejemplos de Lua'],
      ['10 min', 'Quiz postclase y tu ganancia por idea']
    ],
    retosIntro: 'Ocho retos cortos, de menos a más. Los primeros se hacen en papel o con las figuras de las slides; los últimos ya tocan Lua, que puedes ejecutar en esta misma página sin instalar nada.',
    retos: [
      { t: 'El robot literal', d: 'Lleva un robot a la moneda con avanzar y girar. Si chocas, el error es de la receta, no del robot.' },
      { t: 'Descomponer un juego', d: 'Parte «hacer un Pac-Man» en piezas hasta que cada una se pueda explicar en una frase.' },
      { t: 'Cazar patrones', d: 'Encuentra lo que se repite y escríbelo una sola vez: así nacen los ciclos y las funciones.' },
      { t: 'Abstraer', d: 'Decide qué datos necesita de verdad una bala, un enemigo o una moneda. Lo demás es ruido.' },
      { t: 'Variables y estado', d: 'Sigue a mano un programa línea por línea y anota cómo cambia cada caja.' },
      { t: 'Lógica booleana', d: 'Arma la regla «¿puede saltar?» con Y, O y NO y compruébala con su tabla de verdad.' },
      { t: 'Decidir y repetir', d: 'Usa si/sino para el daño con escudo y mientras para vencer a un jefe.' },
      { t: 'Depurar con método', d: 'Un programa da 40 en vez de 50. Reproduce, aísla, plantea una hipótesis y pruébala.' }
    ],
    conceptos: [
      { t: 'Algoritmo', d: 'Secuencia de pasos precisos, en orden y que termina, para resolver un problema.', ej: 'La patrulla de un guardia: camina 4 casillas, gira, espera 2 segundos, repite.' },
      { t: 'Pensamiento computacional', d: 'Forma de resolver problemas en cuatro movimientos: descomponer, reconocer patrones, abstraer y diseñar el algoritmo.', ej: 'Antes de programar un nivel, lo partes en zonas, ves qué obstáculos se repiten y decides qué datos necesita cada uno.' },
      { t: 'Pseudocódigo', d: 'Los pasos de un algoritmo escritos en lenguaje casi natural, sin preocuparte por la sintaxis de un lenguaje.', ej: '«si toca la moneda entonces puntos ← puntos + 10».' },
      { t: 'Variable', d: 'Una caja con nombre que guarda un valor que puede cambiar.', ej: '<code>vidas</code>, <code>puntos</code>, <code>x</code> del jugador.' },
      { t: 'Asignación', d: 'Guardar un valor en una variable. <code>puntos ← puntos + 10</code> se lee «puntos pasa a valer lo que valía más 10». No es una igualdad matemática.', ej: 'Cada moneda recogida ejecuta una asignación.' },
      { t: 'Estado', d: 'La foto de todas las variables del juego en un instante.', ej: 'Posición, vidas, nivel, si está en pausa: si guardas esa foto, puedes reanudar la partida.' },
      { t: 'Booleano', d: 'Un valor que solo puede ser verdadero o falso. Se combinan con Y (and), O (or) y NO (not).', ej: '<code>enSuelo and not aturdido</code> decide si se puede saltar.' },
      { t: 'Condicional', d: 'Elige qué camino seguir según una condición: si… entonces… sino.', ej: 'Si hay escudo, el daño va al escudo; si no, a la vida.' },
      { t: 'Ciclo', d: 'Repite un bloque mientras se cumpla una condición o un número fijo de veces.', ej: 'Dibujar las 10 monedas del nivel con un solo bloque.' },
      { t: 'Función', d: 'Un bloque de pasos con nombre que se puede usar muchas veces, a veces con datos de entrada (parámetros).', ej: '<code>sumarPuntos(30)</code> en vez de copiar la misma lógica en cada moneda.' },
      { t: 'Depurar', d: 'Encontrar y corregir errores con método: reproducir, aislar, hipótesis, prueba.', ej: 'El personaje atraviesa una pared solo cuando va muy rápido: reproduces a esa velocidad y miras qué hace la colisión.' }
    ],
    errores: [
      { mito: 'El computador entiende lo que quise decir.', real: 'Hace exactamente lo que escribiste, ni más ni menos. Si el resultado es raro, la receta es la que está mal.' },
      { mito: 'Primero se escribe código y después se piensa.', real: 'Al revés: con el problema claro en papel, el código casi se escribe solo. La sintaxis es lo fácil.' },
      { mito: '<code>x = x + 1</code> es una ecuación imposible.', real: 'Es una asignación: «x pasa a valer lo que valía más uno». Se lee de derecha a izquierda.' },
      { mito: '«A o B» es falso cuando las dos son verdaderas.', real: 'En programación, O es verdadero si <b>al menos una</b> es verdadera, incluidas las dos.' },
      { mito: 'Depurar es cambiar cosas hasta que funcione.', real: 'Eso es apostar. Depurar es plantear una hipótesis («el ciclo da una vuelta de menos») y comprobarla.' },
      { mito: 'Programar es para gente buena en matemáticas.', real: 'Es sobre todo lógica, orden y paciencia. Las matemáticas del curso son sumas, restas y un poco de geometría.' }
    ],
    codigoIntro: 'Cada idea aparece dos veces: primero en pseudocódigo (para pensar) y después en Lua (para que la máquina lo haga). Los bloques con <b>ejecutar</b> corren aquí mismo: cambia números y vuelve a ejecutar.',
    codigo: [
      { titulo: 'Reto 1 · Una receta para el robot', desc: 'Un algoritmo es una lista de pasos. En Lua la podemos guardar como una lista de textos y recorrerla.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: robotPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: robotLua, run: true }] },
      { titulo: 'Reto 5 · Variables y estado', desc: 'Antes de ejecutar, predice qué valores se imprimen. Después compruébalo.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: varsPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: varsLua, run: true }] },
      { titulo: 'Reto 6 · Lógica booleana', desc: 'La regla de salto y la tabla de verdad de Y, generada con dos ciclos. Cambia <code>and</code> por <code>or</code> y compara.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: boolPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: boolLua, run: true }] },
      { titulo: 'Reto 7 · Decidir con si / sino', desc: 'Prueba con <code>escudo = 20</code> y con <code>vida = 10</code>: ¿qué rama se ejecuta en cada caso?',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: ifPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: ifLua, run: true }] },
      { titulo: 'Reto 7 · Repetir con para y mientras', desc: '<code>para</code> cuando sabes cuántas veces; <code>mientras</code> cuando repites hasta que algo cambie.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: loopPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: loopLua, run: true }] },
      { titulo: 'Patrón con nombre · Funciones', desc: 'Si un bloque se repite en varios lugares, dale nombre. Así se cambia en un solo sitio.',
        tabs: [{ lang: 'Pseudo', label: 'Pseudocódigo', src: funcPseudo }, { lang: 'Lua', label: 'Lua (pruébalo)', src: funcLua, run: true }] },
      { titulo: 'Reto 8 · Encuentra el error', desc: 'Este programa corre, pero da un resultado equivocado. Ejecútalo, plantea una hipótesis y corrígelo en el mismo cuadro.',
        tabs: [{ lang: 'Lua', label: 'Lua (depura)', src: bugLua, run: true }] }
    ],
    practica: { t: 'Tu primera mecánica en papel', intro: 'Elige un juego que conozcas bien (Mario, Tetris, Flappy Bird, Among Us…) y una sola mecánica (saltar, recoger, rotar, votar).',
      pasos: ['Descompón la mecánica en 3 a 5 piezas.', 'Lista las variables que necesita (nombre y qué guarda).', 'Escribe la regla principal con <b>si / entonces</b> y al menos un <b>Y</b> u <b>O</b>.', 'Escribe el algoritmo en pseudocódigo, máximo 12 líneas.', 'Haz la prueba de escritorio con un caso normal y un caso borde.'],
      entrega: 'Una foto o archivo para traer a la sesión 1. Lo usamos como punto de partida.' },
    tarea: [
      'Termina los 8 retos y el quiz postclase del módulo antes de la sesión 1.',
      'Trae tu mecánica en papel: en la sesión 1 la convertimos en un sistema de entradas, estado, reglas y salidas.',
      'Opcional: juega 15 minutos a <i>Lightbot</i> o a los niveles de <i>Hour of Code</i> (code.org). Son el reto 1 con esteroides.'
    ],
    lecturas: [
      'Wing, J. M. (2006). Computational thinking. <i>Communications of the ACM</i>, 49(3), 33-35. El texto que puso de moda la idea.',
      'Narváez-Díaz, L. y López-Martínez, A. (2021). La creación de videojuegos como estrategia educativa en algoritmia (bibliografía del syllabus).',
      'Ierusalimschy, R. <i>Programming in Lua</i>, primeros capítulos (lua.org/pil): para cuando quieras ir más allá del módulo.'
    ],
    mapa: {
      lead: 'Las ocho ideas del módulo y cómo se apoyan unas en otras.',
      nodos: [
        ['alg', 'Algoritmo', 'receta precisa', 'idea', 'Pasos precisos, en orden y que terminan. Todo lo demás sirve para escribir mejores algoritmos.'],
        ['desc', 'Descomponer', 'partir el problema', 'idea', 'Dividir algo grande en piezas que se puedan resolver por separado.'],
        ['pat', 'Patrones', 'lo que se repite', 'patron', 'Reconocer lo que se repite para escribirlo una sola vez.'],
        ['abs', 'Abstracción', 'lo esencial', 'idea', 'Quedarte solo con los datos y pasos que importan para el juego.'],
        ['var', 'Variables y estado', 'cajas con nombre', 'codigo', 'Guardan los datos que cambian. Su foto en un instante es el estado del juego.'],
        ['bool', 'Lógica booleana', 'Y · O · NO', 'codigo', 'Verdadero o falso, combinados para expresar reglas.'],
        ['ctrl', 'Decidir y repetir', 'si · mientras · para', 'codigo', 'Condicionales para elegir caminos y ciclos para repetir.'],
        ['dep', 'Depurar', 'con método', 'practica', 'Reproducir, aislar, hipótesis y prueba.']
      ],
      cables: [['desc', 'pat', 'llamada'], ['desc', 'abs', 'llamada'], ['pat', 'ctrl', 'llamada'], ['abs', 'var', 'datos'], ['var', 'bool', 'datos'], ['bool', 'ctrl', 'datos'], ['alg', 'ctrl', 'llamada'], ['ctrl', 'dep', 'evento']]
    },

    slides: [
      { kind: 'portada', title: 'Pensar como programador',
        lead: 'Módulo 0 · antes de escribir una línea de código',
        full: [{ ul: ['Ocho retos para entrenar la cabeza, no los dedos.', 'Al final, tus primeras líneas de Lua corriendo en el navegador.'] }, { pie: 'Flecha derecha: avanza paso a paso · <span class="kbd">F</span> pantalla completa · <span class="kbd">N</span> notas' }],
        nota: 'Este módulo es autónomo: el estudiante lo recorre solo antes de la sesión 1. Si lo usas en vivo, toma unos 90 minutos con los retos.' },

      { kind: 'idea', title: 'La informática no trata de computadores',
        left: [{ big: '«…como la astronomía no trata de telescopios.»' }, { pie: 'Frase atribuida a Edsger W. Dijkstra.' }],
        right: [{ p: 'El computador es la herramienta. Lo que aprendes aquí es una <b>forma de pensar</b>:' }, { ul: ['partir problemas grandes en pequeños,', 'decir exactamente qué hacer, sin ambigüedad,', 'comprobar que lo que pensaste es cierto.'], pasos: true }, { clave: 'La sintaxis se aprende en una tarde. La lógica es lo que te hace programador.', paso: true }],
        izq: 46,
        nota: 'Abre con la idea de que nadie necesita "nacer sabiendo". Pregunta: ¿quién ha seguido una receta, unas instrucciones de IKEA o un tutorial? Eso ya es ejecutar algoritmos.' },

      { kind: 'analogia', title: 'El robot que lo toma todo al pie de la letra',
        lead: 'Pídele a un robot de cocina que haga un sándwich.',
        left: [{ mapa: [['«Pon mantequilla»', '¿Dónde? ¿Con qué? ¿Cuánta?'], ['«Abre el pan»', 'Lo rompe: nadie dijo cómo'], ['Olvidas «cierra el sándwich»', 'Se queda abierto para siempre']], de: 'Lo que dices', a: 'Lo que hace el robot', pasos: true }],
        right: [{ clave: 'El computador no entiende intenciones: ejecuta instrucciones.', paso: true }, { p: 'Si el resultado es raro, la culpa casi nunca es de la máquina: es de la receta.', paso: true }],
        izq: 60,
        nota: 'Si lo das en vivo, haz la dinámica real: un voluntario da instrucciones y tú las sigues literalmente con pan imaginario. Es el ejercicio clásico de "exact instructions challenge". 4 minutos.' },

      { kind: 'idea', title: 'Las cuatro herramientas del pensamiento computacional',
        full: [{ tabla: { head: ['Herramienta', 'Qué haces', 'En un juego'], rows: [['<b>Descomponer</b>', 'Partir el problema en piezas', '«Mover al jugador» = leer teclado + mover + animar + chocar'], ['<b>Patrones</b>', 'Ver lo que se repite', 'Todas las monedas se dibujan y recogen igual'], ['<b>Abstraer</b>', 'Quedarte con lo esencial', 'Una bala solo necesita posición y velocidad'], ['<b>Algoritmo</b>', 'Escribir los pasos', 'Si toca enemigo → restar vida → si vida = 0 → derrota']] }, pasos: true }, { pie: 'Wing, J. (2006). Computational thinking.' }],
        nota: 'Recorre fila por fila. Son las mismas cuatro que usa el docente en la sesión 2: aquí las practicamos sin código.' },

      { kind: 'demo', title: 'Reto 1 · Lleva al robot a la moneda',
        lead: 'Arma la receta con los botones y ejecútala. Elige un nivel.',
        left: [{ fig: 'robot' }],
        right: [{ ul: ['El robot hace <b>exactamente</b> lo que dices.', 'Si choca, corrige la receta.', 'En el nivel 3, busca lo que se repite.'] }, { clave: 'Un algoritmo es preciso, ordenado y termina.', paso: true }],
        izq: 64,
        nota: 'Deja que lo intenten solos. En el nivel 3 aparece "repetir": es la puerta a los ciclos. Si alguien choca, pregunta: ¿el robot se equivocó o la receta?' },

      { kind: 'reto', title: '¿Qué le falta a esta receta?',
        left: [{ code: [{ lang: 'Pseudo', label: 'Lavarse los dientes', src: `poner crema en el cepillo
cepillar
enjuagar` }] }],
        right: [{ check: { q: '¿Cuál es el problema más grave para un robot?', opts: ['Está en español', '«Cepillar» no dice cuánto tiempo ni cuándo parar', 'Tiene muy pocas líneas', 'No dice el color del cepillo'], ok: 1, why: 'Una instrucción sin condición de parada puede no terminar nunca. Un algoritmo debe ser finito: «cepillar durante 2 minutos» o «cepillar hasta que…».' } }],
        izq: 42,
        nota: 'La idea de finitud es la que más cuesta. Conecta con los ciclos infinitos que verán más adelante.' },

      { kind: 'idea', title: 'Reto 2 · Descomponer: de «haz un Pac-Man» a piezas pequeñas',
        left: [{ svg: `<svg viewBox="0 0 760 420" role="img" aria-label="Árbol de descomposición de Pac-Man en jugador, fantasmas, laberinto y puntaje"><rect width="760" height="420" fill="#1B1A2E"/><g font-family="Atkinson Hyperlegible Next, sans-serif" font-weight="700" text-anchor="middle"><rect x="280" y="24" width="200" height="56" fill="#FFC83D"/><text x="380" y="59" font-size="24" fill="#1B1A2E">Pac-Man</text><g stroke="#F4F1E8" stroke-width="3"><path d="M380 80v30M100 110h560M100 110v30M280 110v30M480 110v30M660 110v30"/></g><g fill="#262542" stroke="#8E97FF" stroke-width="2"><rect x="20" y="140" width="160" height="50"/><rect x="200" y="140" width="160" height="50"/><rect x="400" y="140" width="160" height="50"/><rect x="580" y="140" width="160" height="50"/></g><g font-size="21" fill="#F4F1E8"><text x="100" y="172">Jugador</text><text x="280" y="172">Fantasmas</text><text x="480" y="172">Laberinto</text><text x="660" y="172">Puntaje</text></g><g stroke="#6E6B85" stroke-width="2"><path d="M100 190v24M40 214h120M40 214v20M160 214v20M280 190v24M220 214h120M220 214v20M340 214v20"/></g><g font-size="17" fill="#B9B6C9" font-weight="400"><text x="40" y="256">leer</text><text x="40" y="276">teclado</text><text x="160" y="256">moverse</text><text x="160" y="276">en la rejilla</text><text x="220" y="256">perseguir</text><text x="340" y="256">huir si hay</text><text x="340" y="276">poder</text></g><text x="380" y="370" font-size="22" fill="#3BC4A3">Para cuando cada hoja se explica en una frase</text></g></svg>` }],
        right: [{ ol: ['Escribe el problema grande arriba.', 'Pregunta «¿de qué está hecho?» y baja un nivel.', 'Para cuando cada pieza se pueda explicar en una frase.'], pasos: true }, { clave: 'Un problema que asusta es casi siempre varios problemas pequeños pegados.', paso: true }],
        izq: 56,
        nota: 'Pide que descompongan otro juego en 2 minutos: Tetris o Flappy Bird. Compara árboles: no hay uno único correcto, pero todos deben terminar en hojas simples.' },

      { kind: 'idea', title: 'Reto 3 · Patrones: lo que se repite se escribe una vez',
        compare: { a: { label: 'Sin ver el patrón', lang: 'Pseudo', src: `dibujar moneda en 1
dibujar moneda en 2
dibujar moneda en 3
dibujar moneda en 4
dibujar moneda en 5` }, b: { label: 'Con el patrón', lang: 'Pseudo', src: `para i desde 1 hasta 5 hacer
    dibujar moneda en i
fin` } },
        nota: 'Pregunta: si mañana son 100 monedas, ¿cuál versión cambias más rápido? El patrón es lo que vuelve el código corto y fácil de cambiar.' },

      { kind: 'idea', title: 'Reto 4 · Abstraer: una bala no necesita pulmones',
        left: [{ tabla: { head: ['Objeto', 'Lo esencial para el juego', 'Ruido'], rows: [['Bala', 'posición, velocidad, daño', 'marca, color del casquillo'], ['Moneda', 'posición, valor, ¿recogida?', 'año de acuñación'], ['Enemigo', 'posición, vida, estado', 'su nombre de pila']] }, pasos: true }],
        right: [{ clave: 'Abstraer es decidir qué ignorar. Cada dato de más es algo que hay que mantener.', paso: true }, { p: 'Esta lista de datos es, literalmente, lo que más adelante serán las <b>variables</b> y los <b>objetos</b> de tu juego.', paso: true }],
        izq: 58,
        nota: 'La frase de la bala viene de las slides del curso. Pide un ejemplo propio: ¿qué necesita una plataforma móvil?' },

      { kind: 'idea', title: 'Reto 5 · Una variable es una caja con nombre',
        left: [{ svg: `<svg viewBox="0 0 640 360" role="img" aria-label="Tres cajas con nombre: vidas vale 3, puntos vale 50, enPausa vale falso"><rect width="640" height="360" fill="#1B1A2E"/><g font-family="Atkinson Hyperlegible Next, sans-serif" text-anchor="middle"><g fill="#262542" stroke="#F4F1E8" stroke-width="3"><rect x="30" y="110" width="170" height="130"/><rect x="235" y="110" width="170" height="130"/><rect x="440" y="110" width="170" height="130"/></g><g fill="#FFC83D"><rect x="30" y="70" width="170" height="40"/><rect x="235" y="70" width="170" height="40"/><rect x="440" y="70" width="170" height="40"/></g><g font-size="22" font-weight="700" fill="#1B1A2E"><text x="115" y="98">vidas</text><text x="320" y="98">puntos</text><text x="525" y="98">enPausa</text></g><g font-size="54" font-weight="700" fill="#F4F1E8"><text x="115" y="196">3</text><text x="320" y="196">50</text><text x="525" y="192" font-size="38">falso</text></g><text x="320" y="300" font-size="22" fill="#B9B6C9">El estado = la foto de todas las cajas en un instante</text></g></svg>` }],
        right: [{ code: [{ lang: 'Pseudo', label: 'Asignar', src: `puntos ← 0
puntos ← puntos + 50` }] }, { p: 'Se lee de derecha a izquierda: «calcula <code>puntos + 50</code> y guárdalo en <code>puntos</code>».', paso: true }, { clave: 'No es una ecuación. Es una orden: «pasa a valer».', paso: true }],
        izq: 54,
        nota: 'El error más común de quien viene de matemáticas es leer x = x + 1 como ecuación. Insiste en "pasa a valer".' },

      { kind: 'reto', title: 'Predice antes de ejecutar',
        left: [{ code: [{ lang: 'Pseudo', label: 'Prueba de escritorio', src: `a ← 5
b ← a
a ← a + 2
b ← b * 2` }] }],
        right: [{ check: { q: 'Al final, ¿cuánto valen a y b?', opts: ['a = 7, b = 14', 'a = 7, b = 10', 'a = 5, b = 10', 'a = 7, b = 7'], ok: 1, why: 'b copió el 5 de a en la línea 2. Cambiar a después no cambia b. Luego b ← 5 × 2 = 10 y a ← 5 + 2 = 7.' } }],
        izq: 40,
        nota: 'La respuesta tentadora es a=7, b=14: creen que b "sigue" a a. Las variables guardan valores, no fórmulas.' },

      { kind: 'demo', title: 'Prueba de escritorio: sigue al programa paso a paso',
        lead: 'Avanza línea por línea y mira cómo cambian las cajas.',
        full: [{ fig: 'traza' }],
        top: true,
        nota: 'Antes de pulsar Paso, pide que predigan el valor final de puntos. Así se depura de verdad: con papel y un programa pequeño.' },

      { kind: 'idea', title: 'Reto 6 · Verdadero o falso, y cómo combinarlos',
        full: [{ tabla: { head: ['A', 'B', 'A Y B', 'A O B', 'NO A'], rows: [['V', 'V', '<b>V</b>', '<b>V</b>', 'F'], ['V', 'F', 'F', '<b>V</b>', 'F'], ['F', 'V', 'F', '<b>V</b>', '<b>V</b>'], ['F', 'F', 'F', 'F', '<b>V</b>']] }, pasos: true }, { clave: 'Y exige todo. O se conforma con uno. NO invierte.', paso: true }],
        nota: 'Ojo con el "o" del español, que a veces es exclusivo ("¿té o café?"). En programación, O incluye el caso de las dos verdaderas.' },

      { kind: 'demo', title: 'Arma la regla del salto',
        lead: 'Cambia el estado del personaje y elige la regla. ¿Cuál se comporta como esperas?',
        full: [{ fig: 'compuertas' }],
        top: true,
        nota: 'Que prueben la regla 2 con el personaje aturdido: puede saltar, y eso es un bug de diseño. La regla 3 lo arregla. Así nacen los bugs de lógica en juegos reales.' },

      { kind: 'reto', title: '¿Puede abrir la puerta?',
        left: [{ code: [{ lang: 'Pseudo', label: 'Regla', src: `puedeAbrir ← tieneLlave O (esJefe Y NO enCombate)` }] }, { p: 'El jugador <b>no</b> tiene llave, <b>es</b> el jefe y <b>está</b> en combate.' }],
        right: [{ check: { q: '¿Qué vale puedeAbrir?', opts: ['Verdadero', 'Falso', 'Depende del orden', 'Da error'], ok: 1, why: 'tieneLlave = F. esJefe Y NO enCombate = V Y NO V = V Y F = F. Entonces F O F = F. Resuelve primero los paréntesis, como en aritmética.' } }],
        izq: 46,
        nota: 'Si se enredan, que hagan la cuenta en voz alta, de adentro hacia afuera.' },

      { kind: 'idea', title: 'Reto 7 · Decidir: si… entonces… sino',
        left: [{ code: [{ lang: 'Pseudo', label: 'Daño con escudo', src: ifPseudo }], marca: [{ l: [1], t: 'La <b>condición</b>: una pregunta de sí o no.' }, { l: [2], t: 'Si es verdadera, el daño va al escudo.' }, { l: [3, 4], t: 'Si es falsa, va a la vida. Solo se ejecuta <b>uno</b> de los dos caminos.' }, { l: [7, 8, 9], t: 'Un segundo si, independiente: se revisa siempre.' }] }],
        right: [{ svg: `<svg viewBox="0 0 520 400" role="img" aria-label="Diagrama de flujo: ¿escudo mayor que cero? sí: restar al escudo; no: restar a la vida"><rect width="520" height="400" fill="#1B1A2E"/><g font-family="Atkinson Hyperlegible Next, sans-serif" font-weight="700" text-anchor="middle"><path d="M260 40l120 60-120 60-120-60z" fill="#5B6CFF"/><text x="260" y="106" font-size="21" fill="#F4F1E8">¿escudo &gt; 0?</text><g stroke="#F4F1E8" stroke-width="3" fill="none"><path d="M140 100H70v110M380 100h70v110M70 270v50h190M450 270v50H260M260 320v30"/></g><rect x="10" y="210" width="120" height="60" fill="#3BC4A3"/><text x="70" y="246" font-size="18" fill="#1B1A2E">escudo − daño</text><rect x="390" y="210" width="120" height="60" fill="#FF5D3A"/><text x="450" y="246" font-size="18" fill="#1B1A2E">vida − daño</text><g font-size="18" fill="#FFC83D"><text x="100" y="88">sí</text><text x="420" y="88">no</text></g><rect x="200" y="350" width="120" height="36" fill="#262542" stroke="#F4F1E8" stroke-width="2"/><text x="260" y="374" font-size="17" fill="#F4F1E8">sigue</text></g></svg>` }],
        izq: 52,
        nota: 'Recorre las marcas del código con la flecha. El diagrama de flujo es la misma idea dibujada; en la sesión 1 lo usaremos para describir mecánicas.' },

      { kind: 'idea', title: 'Reto 7 · Repetir: para y mientras',
        left: [{ panel: [{ code: [{ lang: 'Pseudo', label: 'para', src: `para i desde 1 hasta 3 hacer
    disparar
fin` }] }, { p: 'Sabes cuántas veces: 3 disparos.' }], h: 'Cuántas veces' }],
        right: [{ panel: [{ code: [{ lang: 'Pseudo', label: 'mientras', src: `mientras jefe.vida > 0 hacer
    atacar
fin` }] }, { p: 'No sabes cuántas: hasta que cambie la condición.' }], h: 'Hasta cuándo' }, { clave: 'Si la condición de un mientras nunca cambia, el ciclo no termina jamás.', paso: true }],
        izq: 50,
        nota: 'Conecta con la receta del cepillo de dientes: un mientras sin salida es la receta que nunca para. El juego entero, como veremos en la sesión 2, es un gran mientras.' },

      { kind: 'reto', title: '¿Cuántas veces se ejecuta «atacar»?',
        left: [{ code: [{ lang: 'Pseudo', label: 'Jefe', src: `vida ← 20
mientras vida > 0 hacer
    atacar          // quita 6
    vida ← vida - 6
fin` }] }],
        right: [{ check: { q: 'Cuenta las vueltas del ciclo.', opts: ['3 veces', '4 veces', '20 veces', 'Nunca termina'], ok: 1, why: '20 → 14 → 8 → 2 → −4. Después de la cuarta vuelta vida ya no es mayor que 0 y el ciclo para. Hacer la tabla de valores a mano es la forma segura de contar.' } }],
        izq: 44,
        nota: 'El 3 es la respuesta tentadora: olvidan la vuelta que deja la vida en negativo.' },

      { kind: 'antipatron', title: 'Reto 8 · Depurar no es cambiar cosas al azar',
        left: [{ panel: [{ ul: ['Cambiar números hasta que «funcione».', 'Culpar al computador.', 'Reescribir todo desde cero.'] }], h: 'Apostar', tono: 'malo' }],
        right: [{ panel: [{ ol: ['<b>Reproduce</b>: haz que el error pase siempre.', '<b>Aísla</b>: ¿en qué línea empieza a fallar?', '<b>Hipótesis</b> y <b>prueba</b>: «el ciclo da una vuelta de menos». Compruébalo.'] }], h: 'Método', tono: 'bueno' }, { pie: 'Truco del patito de goma: explícale el código línea por línea a alguien (o a un patito). Muchas veces el error aparece al decirlo.', paso: true }],
        izq: 44,
        nota: 'Muestra el bloque "Encuentra el error" de la página del módulo: suma 40 en vez de 50 porque el ciclo va hasta monedas - 1.' },

      { kind: 'codigo', title: 'Ahora en Lua: la misma lógica, otro idioma',
        left: [{ p: 'Todo lo que pensaste en pseudocódigo se traduce casi palabra por palabra.' }, { tabla: { head: ['Pseudocódigo', 'Lua'], rows: [['<code>x ← 5</code>', '<code>local x = 5</code>'], ['<code>Y · O · NO</code>', '<code>and · or · not</code>'], ['<code>si … entonces … fin</code>', '<code>if … then … end</code>'], ['<code>mientras … hacer</code>', '<code>while … do</code>']] } }],
        right: [{ code: [{ lang: 'Lua', label: 'Lua', src: funcLua }] }, { pie: 'En la página del módulo puedes ejecutar este código y cambiarlo.' }],
        izq: 46,
        nota: 'No es momento de aprender sintaxis: solo de ver que el salto es pequeño. La sesión 4 se dedica a Lua.' },

      { kind: 'actividad', title: 'Tu primera mecánica en papel',
        left: [{ ol: ['Elige un juego y una sola mecánica.', 'Variables + regla con si e Y/O.', 'Algoritmo en 12 líneas y prueba de escritorio.'], pasos: true }],
        right: [{ clave: 'Tráela a la sesión 1: es el punto de partida.', paso: true }, { pie: 'Ejemplos: el salto de Mario, recoger un anillo en Sonic, rotar una pieza en Tetris, votar en Among Us.' }],
        izq: 54,
        nota: 'Es la actividad de cierre del módulo. En la sesión 1 se convierte en un sistema de entradas, estado, reglas y salidas.' },

      { kind: 'cierre', title: 'Lo que ya sabes hacer',
        left: [{ ol: ['Escribir algoritmos que una máquina sigue sin adivinar.', 'Descomponer, ver patrones y abstraer.', 'Seguir variables, combinar condiciones, decidir, repetir y depurar.'] }],
        right: [{ clave: 'Haz el quiz postclase: verás tu ganancia en cada idea.', paso: false }, { p: '<b>Siguiente:</b> sesión 1, la bienvenida. Convertimos tu mecánica en un sistema.' }],
        izq: 56,
        nota: 'Cierra invitando al quiz postclase. Recuerda que nada de esto da nota: es entrenamiento.' }
    ],

    pre: [
      { q: '¿Qué hace que una lista de pasos sea un buen algoritmo para un computador?', opts: ['Que sea corta', 'Que cada paso sea preciso, estén en orden y termine', 'Que esté escrita en inglés', 'Que use muchas matemáticas'], ok: 1, why: 'El computador no interpreta intenciones: necesita pasos sin ambigüedad, en orden y con un final.', idea: 'C1' },
      { q: 'Vas a programar «el jugador recoge una moneda». ¿Qué es descomponer este problema?', opts: ['Escribir todo el código de una vez', 'Partirlo en piezas: detectar el contacto, sumar puntos, quitar la moneda, sonar', 'Borrar las monedas del juego', 'Buscar un juego parecido y copiarlo'], ok: 1, why: 'Descomponer es dividir en piezas que se puedan resolver por separado.', idea: 'C2' },
      { q: 'Después de ejecutar <code>puntos ← 10</code> y luego <code>puntos ← puntos + 5</code>, ¿cuánto vale puntos?', opts: ['10', '5', '15', 'Es un error: puntos no puede ser igual a puntos + 5'], ok: 2, why: 'Es una asignación, no una ecuación: puntos pasa a valer 10 + 5 = 15.', idea: 'C3' },
      { q: 'Regla: «puede saltar si está en el suelo Y no está aturdido». Está en el suelo y está aturdido. ¿Puede saltar?', opts: ['Sí', 'No', 'Solo a veces', 'Depende del teclado'], ok: 1, why: 'Y exige que las dos partes sean verdaderas. «No aturdido» es falso, así que todo es falso.', idea: 'C4' },
      { q: '¿Para qué sirve un ciclo (repetir)?', opts: ['Para que el programa sea más lento', 'Para ejecutar un bloque varias veces sin copiarlo', 'Para borrar variables', 'Para decidir entre dos caminos'], ok: 1, why: 'El ciclo repite. Decidir entre caminos es trabajo del condicional (si/sino).', idea: 'C5' },
      { q: 'Tu programa da un resultado equivocado. ¿Qué es lo primero que conviene hacer?', opts: ['Reescribirlo completo', 'Hacer que el error se repita siempre y ver dónde empieza', 'Cambiar números al azar', 'Reiniciar el computador'], ok: 1, why: 'Depurar con método empieza por reproducir el error de forma confiable y aislar dónde aparece.', idea: 'C5' }
    ],
    post: [
      { q: 'Receta del guardia: «camina hacia adelante». ¿Qué le falta para ser un algoritmo?', opts: ['Un color', 'Cuánto caminar o cuándo detenerse', 'Un nombre más bonito', 'Nada, ya está completa'], ok: 1, why: 'Sin condición de parada la instrucción no termina: un algoritmo debe ser finito.', idea: 'C1' },
      { q: 'En un nivel, 8 enemigos patrullan exactamente igual. ¿Qué herramienta del pensamiento computacional aplicas al notarlo?', opts: ['Descomposición', 'Reconocer un patrón, para escribir la patrulla una sola vez', 'Abstracción del sonido', 'Depuración'], ok: 1, why: 'Lo que se repite se escribe una vez (con un ciclo o una función) y se reutiliza.', idea: 'C2' },
      { q: '¿Qué datos son esenciales para una bala en un juego 2D?', opts: ['Marca y calibre', 'Posición, velocidad y daño', 'El nombre de quien la disparó y su ciudad', 'El año de fabricación'], ok: 1, why: 'Abstraer es quedarse con lo que el juego necesita simular. Lo demás es ruido que habría que mantener.', idea: 'C2' },
      { q: 'Sigue el programa. ¿Cuánto vale <code>b</code> al final?', code: { lang: 'Pseudo', src: `a ← 4
b ← a
a ← 10
b ← b + a` }, opts: ['8', '14', '20', '10'], ok: 1, why: 'b copió el 4. Luego a pasa a 10 y b ← 4 + 10 = 14. Las variables guardan valores, no fórmulas.', idea: 'C3' },
      { q: '¿Qué vale <code>enSuelo O dobleSalto</code> si las dos son verdaderas?', opts: ['Verdadero', 'Falso', 'Error', 'Depende del orden'], ok: 0, why: 'O es verdadero si al menos una parte lo es, incluido el caso en que las dos lo son.', idea: 'C4' },
      { q: 'Regla: <code>tieneLlave O (esJefe Y NO enCombate)</code>. Sin llave, es jefe, no está en combate. ¿Resultado?', opts: ['Falso', 'Verdadero', 'Error', 'Depende de la llave'], ok: 1, why: 'Paréntesis primero: esJefe Y NO enCombate = V Y V = V. Luego F O V = V.', idea: 'C4' },
      { q: '¿Cuántas veces se ejecuta el bloque?', code: { lang: 'Pseudo', src: `vida ← 10
mientras vida > 0 hacer
    vida ← vida - 3
fin` }, opts: ['3', '4', '10', 'Nunca termina'], ok: 1, why: '10 → 7 → 4 → 1 → −2: cuatro vueltas. Una tabla de valores a mano evita contar de menos.', idea: 'C5' },
      { q: 'Un ciclo debería sumar 10 puntos por cada una de 5 monedas, pero da 40. ¿Cuál es la mejor hipótesis?', opts: ['El computador suma mal', 'El ciclo da una vuelta de menos', 'Hay que usar números más grandes', 'Las monedas valen 8'], ok: 1, why: '40 = 4 × 10: faltó una vuelta. Es el clásico error de «uno menos» (por ejemplo, ir hasta monedas − 1). Una buena hipótesis se puede comprobar.', idea: 'C5' }
    ]
  };
})();
