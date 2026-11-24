# Formato de una sesión (`data/sN.js` + `demos/sN.js`)

El sitio es estático. Cada sesión es un archivo de datos `data/sN.js` (N = 0 para el Módulo 0, 1 a 8 para las sesiones) que asigna `window.SESION`, y un archivo opcional `demos/sN.js` con figuras interactivas para las slides. El motor (`assets/app.js`, `assets/deck.js`, `assets/fig.js`) los lee y arma la página de la sesión, las slides y los dos quices.

## Reglas de contenido

- Español, tuteo, tono cercano de posgrado. Muchos estudiantes **nunca han programado**: nada de jerga sin explicar.
- Orden pedagógico en todo: **mecánica de juego → pseudocódigo → Lua**. Analogía antes que definición. Predecir antes de ver la respuesta.
- Stack del curso: **Lua + LÖVE (Love2D 11.x)**. Nada de Unity/Unreal salvo una mención de contexto.
- Código: Lua idiomático, `local` siempre, nombres en español, comentarios cortos en español, máximo ~22 líneas por bloque. Probado mentalmente: que corra.
- HTML permitido dentro de los textos: `<b>`, `<i>`, `<code>`, `<br>`, `<small>`.
- Sin fechas (el sitio se reutiliza entre cohortes).
- No inventes datos de estudiantes ni cifras de industria dudosas. Si citas un juego real, que el dato sea cierto y conocido.

## `window.SESION`

```js
window.SESION = {
  n: 2,
  titulo: 'Game loop, tiempo y estado',          // igual que en data/curso.js
  objetivos: ['...', '...', '...', '...'],         // 3 a 5, verbo observable
  analogia: 'Texto de 2-3 frases que desarrolla la analogía de curso.js.',
  ideas: [['C1', 'El juego es un bucle: entrada, actualizar, dibujar'], ['C2', '...'], ['C3', '...'], ['C4', '...'], ['C5', '...']],
  agenda: [['0:00', 'Bienvenida y quiz preclase'], ['0:10', '...'], /* ... */ ['1:50', 'Quiz postclase y cierre']],  // 2 horas
  conceptos: [{ t: 'Delta time (dt)', d: 'Definición sencilla.', ej: 'Cómo aparece en un juego.' }],  // 6 a 9
  errores: [{ mito: 'Lo que se suele creer', real: 'Lo que pasa en realidad' }],  // 4 a 6
  codigoIntro: 'Una frase que presenta el código de la sesión.',
  codigo: [   // 3 a 5 ejemplos
    { titulo: 'Mover con delta time', desc: 'Qué muestra y qué mirar.',
      tabs: [
        { lang: 'Pseudo', label: 'Pseudocódigo', src: `...` },
        { lang: 'Lua', label: 'Lua (LÖVE)', src: `...` },
        // run: true solo en Lua PURO (sin love.*) que imprime con print(): el sitio lo ejecuta en el navegador
        { lang: 'Lua', label: 'Lua (pruébalo)', src: `print("hola")`, run: true }
      ] }
  ],
  practica: { t: 'Título del taller en clase', intro: 'Qué se hace y en parejas o solo.', pasos: ['...', '...', '...'], entrega: 'Qué evidencia queda (opcional)' },
  tarea: ['...', '...'],
  lecturas: ['Referencia con <i>título</i>.'],
  mapa: {   // grafo de temas de la clase (organizador previo). 6 a 9 nodos.
    lead: 'Una frase.',
    nodos: [['loop', 'Game loop', 'subtítulo corto', 'idea', 'Resumen de 1-2 frases.']],   // tipo: idea | codigo | practica | riesgo | patron
    cables: [['loop', 'dt', 'llamada']]   // datos | evento | llamada
  },
  slides: [ /* ver abajo, 18 a 26 slides */ ],
  pre:  [ /* 6 preguntas: diagnóstico antes de clase, sencillas, una o más por idea C1..C5 */ ],
  post: [ /* 8 preguntas: después de clase, mismas ideas C1..C5, un poco más de aplicación */ ]
};
```

### Preguntas de quiz (pre y post)

```js
{ q: 'Enunciado (puede tener <code>)', opts: ['A', 'B', 'C', 'D'], ok: 1, why: 'Explicación de por qué es la correcta y por qué engaña la más tentadora.', idea: 'C2',
  code: { lang: 'Lua', src: `...` } }   // code es opcional
```
- 4 opciones, una correcta, distractores plausibles (errores reales de principiante). Varía la posición de la correcta.
- Cada idea C1..C5 aparece en pre **y** en post: así se mide la ganancia.

## Slides (`slides: [...]`) — lienzo 1600×900

```js
{ kind: 'portada'|'analogia'|'idea'|'codigo'|'demo'|'reto'|'antipatron'|'actividad'|'cierre'|'industria',
  title: 'Título corto',
  lead: 'Bajada opcional, una frase',
  full: [bloques]                      // una columna
  // o bien
  left: [bloques], right: [bloques], izq: 44,   // dos columnas; izq = % de ancho de la izquierda
  top: true,                           // alinear arriba en vez de centrar
  nota: 'Nota para el docente: qué preguntar, qué responder, cuántos minutos.' }
```

Bloques:
- `'texto html'` · `{ p }` · `{ big }` frase grande · `{ h }` subtítulo · `{ pie }` nota pequeña · `{ clave }` idea para recordar
- `{ ul: [...], pasos: true }` · `{ ol: [...], pasos: true }` (pasos: aparece ítem por ítem con la flecha)
- `{ mapa: [['concepto', 'en el juego'], ...], de: 'En la vida', a: 'En el juego', pasos: true }` (analogías lado a lado)
- `{ tabla: { head: [...], rows: [[...]] }, pasos: true }`
- `{ panel: [bloques], h: 'Título', tono: 'malo'|'bueno' }`
- `{ code: [{ lang, label, src }], marca: [{ l: [3, 4], t: 'qué pasa en esas líneas' }] }` (marca: resalta líneas paso a paso)
- `{ compare: { a: { label: 'Así no', lang, src }, b: { label: 'Así sí', lang, src } } }`
- `{ check: { q, opts, ok, why } }` pregunta de predicción en vivo
- `{ fig: 'nombreDemo' }` figura interactiva de `demos/sN.js`
- `{ svg: '<svg viewBox=...>...</svg>' }` ilustración (usa los colores de la paleta, abajo)
- `{ ruta: N }` mapa del curso con la sesión N encendida · `{ temario: true }` grafo `mapa` de la sesión
- Cualquier bloque acepta `paso: true` para aparecer con la flecha.

La portada recibe sola la pregunta de la sesión; después de la portada el motor inserta el mapa del curso y el grafo de temas. **No los repitas.** Termina con una slide `cierre` (qué te llevas + qué sigue) y antes una que invite al quiz postclase.

Ritmo sugerido: portada → analogía → 2-3 ideas → reto (predice) → código → demo → antipatrón → actividad → código → cierre. Máximo 3 ítems por lista; frases cortas; una idea por slide.

## Figuras interactivas (`demos/sN.js`)

```js
window.DEMOS = window.DEMOS || {};
window.DEMOS.miFigura = function (el) {
  const f = FIG.lienzo(el, 900, 460);                    // SVG con rejilla de píxeles
  const a = f.caja(60, 80, 220, 90, 'Entrada', { sub: 'teclado' });   // a.tono('on'|'base'|'bad'|'ok'|'off'|'paper')
  const b = f.caja(420, 80, 220, 90, 'Actualizar');
  const fl = f.flecha(a, b, { rotulo: 'pide' });         // fl.tono('on'), fl.ver(false)
  f.texto(450, 300, 'hola', { tam: 22, tono: 'soft' }); // devuelve {pon(txt), color(c), ver(bool)}
  f.circulo(x, y, r, { tono: 'coral' });                 // {mover(x,y), color(c), ver(bool)}
  f.linea(x1, y1, x2, y2, { tono: 'grey', grosor: 2, puntos: true });
  f.trazo('M0 0 L10 10', { tono: 'teal', grosor: 4 });
  f.nodo('rect', { x, y, width, height, fill: FIG.C.amber });   // cualquier elemento SVG
  const c = FIG.controles(el);                           // barra bajo el dibujo
  c.boton('Paso', fn); c.opciones(['A', 'B'], i => {}); c.deslizador('fps', 10, 144, 60, 1, v => {}); c.casilla('texto', on => {});
  const di = FIG.dice(el); di('Veredicto en una frase', 'ok'|'bad'|'');
  // animación: usa requestAnimationFrame y devuelve una función que la detiene
  let raf; const tick = t => { /* ... */ raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
};
```

Colores (`FIG.C`): `ink` fondo, `white`, `soft`, `grey`, `coral` (acento principal), `teal` (correcto), `amber` (resalte), `violet`, `slate`, `paper`. Respeta `prefers-reduced-motion`: si `FIG.quieto()` es verdadero, no animes solo: deja un botón “Paso”.

Las figuras deben enseñar algo que una imagen fija no puede: mover un deslizador y ver el efecto, ejecutar paso a paso, comparar dos versiones.
