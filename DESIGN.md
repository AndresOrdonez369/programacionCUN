---
name: Programación de Videojuegos · CUN
description: El curso como una sola hoja de sprites; Módulo 0 y sesiones 1 a 8 son los frames 00 a 08 de una animación.
colors:
  tinta: "#1B1A2E"
  tinta-2: "#262542"
  tinta-3: "#34325A"
  tinta-suave: "#8E8BA8"
  papel: "#F4F1E8"
  papel-2: "#EBE7DA"
  papel-3: "#DFDACB"
  texto-2: "#4A4862"
  texto-3: "#6A6782"
  coral: "#FF5D3A"
  coral-tx: "#B8361A"
  menta: "#3BC4A3"
  menta-tx: "#0E6E59"
  ambar: "#FFC83D"
  ambar-tx: "#7A5600"
  azul: "#5B6CFF"
  azul-tx: "#3343D6"
  fondo-proyector: "#100F20"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5.2rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, sans-serif"
    fontSize: "clamp(1.7rem, 3.2vw, 2.35rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, sans-serif"
    fontSize: "1.28rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Silkscreen, JetBrains Mono, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  label-micro:
    fontFamily: "Silkscreen, JetBrains Mono, monospace"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.6
  slide-title:
    fontFamily: "Bricolage Grotesque, Atkinson Hyperlegible Next, sans-serif"
    fontSize: "58px"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  slide-body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.42
rounded:
  none: "0px"
spacing:
  px: "8px"
  cell: "16px"
  gutter: "clamp(16px, 4vw, 48px)"
  wrap: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "13px 18px"
  button-go:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "13px 18px"
  button-alt:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "13px 18px"
  button-disabled:
    backgroundColor: "{colors.papel-3}"
    textColor: "{colors.texto-3}"
    rounded: "{rounded.none}"
  move-card:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "14px 14px 16px"
  frame-cell:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    rounded: "{rounded.none}"
    padding: "12px 12px 16px"
    height: "104px"
  frame-cell-current:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.tinta}"
  tag:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
  quiz-option:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
  codebox:
    backgroundColor: "{colors.tinta}"
    textColor: "#E9E6F2"
    rounded: "{rounded.none}"
    padding: "16px 18px"
  slide-panel:
    backgroundColor: "{colors.tinta-2}"
    textColor: "{colors.papel}"
    rounded: "{rounded.none}"
    padding: "0 28px 24px"
---

# Design System: Programación de Videojuegos · CUN

## Overview

**Creative North Star: "La hoja de sprites"**

Todo el curso es una sola hoja de sprites. El Módulo 0 y las sesiones 1 a 8 son los frames 00 a 08 de una misma animación, y cada superficie (hub, página de sesión, slides, quiz) se lee como una celda de esa hoja: cuadrícula de 8px, celdas cuadradas, filetes de 2px y una paleta cerrada de seis tintas numeradas, que se muestran con su índice como en un editor de pixel art.

La cabecera vive en tinta oscura sobre la rejilla de 8px; la lectura ocurre en papel. La fuente pixel (Silkscreen) es la voz de la máquina: números de frame, índices, rótulos cortos. Todo lo que se lee de verdad va en Atkinson Hyperlegible Next, porque muchos estudiantes nunca han programado y el texto no puede intimidar. El movimiento es de sprite: saltos por pasos (`steps()`) y cortes duros, nunca fundidos. El estado es una marca, no un cambio de tono: un píxel menta para lo cerrado, una celda coral para lo abierto.

El sistema rechaza el LMS de barra lateral con tarjetas redondeadas y el disfraz arcade de neón. La densidad es media: secciones amplias en papel, celdas compactas dentro de la tira y de las tablas.

**Key Characteristics:**
- Paleta indexada de seis tintas (0 a 5) más pasos derivados de la misma tinta; nada fuera de ella.
- Esquinas siempre rectas; filetes de 2px en tinta (o en papel sobre tinta).
- Sombras duras desplazadas, sin desenfoque, en una tinta de la paleta.
- Tira de frames 00 a 08 como navegación y como mapa de progreso.
- Movimiento por pasos y cortes duros; `prefers-reduced-motion` lo apaga todo.
- Lienzo de slides fijo de 1600x900 escalado; en pantallas de menos de 760px pasa a lectura en columna.

## Colors

Seis tintas planas y saturadas sobre un papel cálido y una tinta violeta casi negra; cada tinta tiene un paso `-tx` oscurecido para que el texto pase AA sobre papel.

### Primary
- **Coral índice 2** (coral): el frame abierto (celda actual de la tira), el botón "ir", la barra de progreso de las slides, el subrayado de la navegación activa y los antipatrones. Su versión **Coral de texto** (coral-tx) colorea texto y viñetas sobre papel.

### Secondary
- **Ámbar índice 4** (ambar): el botón por defecto, la idea clave de las slides, la sombra de notas e intro, el hover de celdas y documentos, la selección de texto y la marca "aquí te quedaste". **Ámbar de texto** (ambar-tx) sólo para texto sobre papel.
- **Menta índice 3** (menta): lo cerrado y lo correcto (píxel de "visto", respuesta correcta, ganancia postclase, pestaña de código activa, código "bueno"). **Menta de texto** (menta-tx) para rótulos de estado sobre papel.

### Tertiary
- **Azul índice 5** (azul): foco (`outline` de 3px), slides de idea e industria, la pregunta dentro del lienzo, la sombra del intro del quiz. **Azul de texto** (azul-tx) es el color de los enlaces sobre papel.

### Neutral
- **Tinta índice 0** (tinta): cabecera, pie, lienzo de slides, cajas de código, todos los filetes y sombras sobre papel, y el texto principal.
- **Tinta 2 y Tinta 3** (tinta-2, tinta-3): paneles, pestañas y bordes dentro de superficies oscuras; hover de la tira.
- **Tinta suave** (tinta-suave): texto secundario y rótulos pixel sobre tinta.
- **Papel índice 1** (papel): fondo de lectura, tarjetas y opciones; filetes y sombras sobre tinta.
- **Papel 2 y Papel 3** (papel-2, papel-3): código en línea, filetes finos de 1px, pista de barras, estado deshabilitado.
- **Texto 2 y Texto 3** (texto-2, texto-3): texto secundario y rótulos sobre papel.
- **Fondo de proyector** (fondo-proyector): el marco alrededor del lienzo de slides.

### Named Rules
**The Six Inks Rule.** Ningún color nuevo: todo valor es una de las seis tintas o un paso derivado de la misma tinta (más clara, más oscura o con transparencia). Si un tono no se puede nombrar por su índice, no entra.

**The Mark Not Hue Rule.** El estado se marca con una forma, no con un matiz: celda coral para el frame abierto, cuadrado menta de 10px para lo ya cerrado, cuadrado ámbar de 10px para "aquí te quedaste". Siempre con leyenda visible.

**The Darkened Ink Rule.** Sobre papel, el texto en color usa el paso `-tx` (coral-tx, menta-tx, azul-tx, ambar-tx); la tinta plena queda para rellenos, marcas y sombras.

## Typography

**Display Font:** Bricolage Grotesque (con Atkinson Hyperlegible Next, sans-serif)
**Body Font:** Atkinson Hyperlegible Next (con system-ui, sans-serif)
**Label/Mono Font:** Silkscreen para rótulos pixel; JetBrains Mono para código y cifras

**Character:** Una grotesca de peso 800 con tracking negativo da la voz de cartel; la Atkinson garantiza lectura para principiantes y en pantalla compartida; Silkscreen es el sello de la hoja de sprites y nunca carga texto corrido.

### Hierarchy
- **Display** (800, clamp(2.6rem, 6.4vw, 5.2rem), 0.95): título del hub. En páginas internas el h1 baja a clamp(2.1rem, 5vw, 3.9rem) con máximo de 20ch.
- **Headline** (800, clamp(1.7rem, 3.2vw, 2.35rem), 1.08): títulos de sección.
- **Title** (700, 1.28rem): subtítulos, nombres de tarjetas, conceptos y proyectos (1.05 a 1.22rem).
- **Body** (400, 1.0625rem, 1.62): lectura; la prosa de sesión se limita a 72ch y los párrafos del hub a 68ch. Baja a 1rem por debajo de 560px.
- **Label** (Silkscreen 400, 1rem, tracking 0.04 a 0.06em): marca, navegación, cabeceras de tabla, pestañas de código, número de frame en la ficha.
- **Label micro** (Silkscreen 400, 0.5rem = 8px): corte bajo cada frame, estado en tarjetas, tipo de sesión, pie de documentos.
- **Mono** (JetBrains Mono 400, 0.9rem, 1.6): código; los porcentajes y horas usan mono 700 con cifras tabulares.
- **Slides** (lienzo de 1600x900): título 58px/800, cuerpo 30px, `.big` 40px/700, rótulo pixel 22px en la tinta del tipo de slide, portada 104px.

### Named Rules
**The Pixel Grid Type Rule.** Silkscreen se dibuja en múltiplos de 8px (8, 16, 24, 32) para que cada píxel caiga entero. Deuda conocida: la implementación aún usa tamaños fuera de la rejilla (1.35rem en la tira, 0.6 a 0.78rem en pistas, pie y barra de slides; 15, 18, 20 y 22px en el lienzo; 11 a 14px en el modo flujo). Corregirlos hacia 8, 16, 24 o 32 cuando se toquen; no copiarlos.

**The Machine Voice Rule.** Silkscreen sólo para números de frame, índices y rótulos de dos o tres palabras. Nunca para oraciones, preguntas ni párrafos.

## Layout

Contenedor de 1240px con margen lateral clamp(16px, 4vw, 48px). La unidad base es la celda de 8px, visible como rejilla sutil (líneas de 1px al 5.5 a 6% de opacidad) en la cabecera, el lienzo de slides, las figuras y algunos bloques en papel.

- **Tira de frames:** 9 columnas iguales a ancho completo bajo la cabecera; 5 columnas por debajo de 1020px; por debajo de 560px vuelve a 9 columnas con sólo el número (sin título ni corte) y marcas de 6px.
- **Sesión seleccionada del hub:** dos columnas (contenido + ficha de 320px); cuatro tarjetas de jugada en fila, 2 por debajo de 1020px y 1 por debajo de 560px. Las rejillas se reacomodan en celdas enteras, nunca en anchos intermedios.
- **Página de sesión:** prosa + columna lateral pegajosa de 300px; una sola columna por debajo de 1020px.
- **Lista de frames:** filas de cuatro columnas (76px, contenido, contenido, 200px) separadas por filetes de 2px.
- **Slides:** lienzo fijo de 1600x900 escalado al viewport, con 50px 72px 44px de margen interior; debajo de 760px de ancho el lienzo se desarma en columna (modo flujo) con tamaños propios.
- Ritmo vertical: secciones a 3.2rem; huecos de celda de 6, 12, 16 y 24px.

## Elevation & Depth

No hay profundidad atmosférica: no hay desenfoque, ni gradientes de luz, ni capas translúcidas. La profundidad es de cartel impreso: sombras duras desplazadas hacia abajo a la derecha, sin desenfoque, siempre en una tinta de la paleta. Sobre papel la sombra es tinta o una tinta de acento; sobre tinta la sombra es papel. La sombra es estructural y táctil: el botón se levanta 2px al pasar y se hunde por completo al pulsar.

### Shadow Vocabulary
- **Celda baja** (`box-shadow: 4px 4px 0 <tinta>`): botones, notas, cajas de código, opciones al pasar.
- **Celda alta** (`box-shadow: 6px 6px 0 <tinta>`): tarjetas de jugada, puntuación del quiz, intro del quiz, idea clave y pregunta en slides, notas del docente.
- **Hover** (6px 6px en botones, 8px 8px en tarjetas, con `translate(-2px, -2px)`).
- **Pulsado** (`translate(4px, 4px)` y sombra 0): el botón cae sobre su sombra.
- **Tecla** (`box-shadow: 0 3px 0 papel`): sólo el rótulo de tecla en slides.

### Named Rules
**The Ink Shadow Rule.** Una sombra es una celda desplazada de una tinta de la paleta, con desenfoque 0. La tinta de la sombra lleva significado: ámbar = nota o idea clave, coral = advertencia o código malo, menta = código bueno, azul = pregunta.

## Shapes

Esquinas rectas en todo (radio 0): botones, tarjetas, opciones, etiquetas, barras, marcas, barras de desplazamiento. Los bordes son filetes de 2px en tinta sobre papel y en papel o tinta-3 sobre tinta; los separadores menores son de 1px en papel-3. Los subrayados de navegación y pestañas son barras de 3 a 4px. Las viñetas, marcadores de título de slide y leyendas son cuadrados planos (10 a 18px). Los íconos son SVG de trazo 2.2 con terminaciones cuadradas e ingletes, nunca redondeados. El canvas de las demos usa `image-rendering: pixelated`.

## Components

### Buttons
Celdas de la hoja: planas, rotundas, que se hunden al pulsar.
- **Shape:** esquinas rectas (0px), filete de 2px en tinta (en papel dentro de la cabecera).
- **Primary:** fondo ámbar, texto tinta, Atkinson 700 1rem, 13px 18px, sombra de celda baja en tinta.
- **Go:** fondo coral (acción principal de avance). **Alt:** fondo papel; dentro de la cabecera, fondo tinta y texto papel.
- **Hover / Focus:** sube 2px y la sombra crece a 6px, con `steps(1)` en 0.08s (salto, no deslizamiento). Foco: contorno azul de 3px con 2px de separación.
- **Pressed / Disabled:** pulsado cae 4px sobre la sombra; deshabilitado en papel-3 con texto-3 y sin sombra.

### Chips (tag)
- **Style:** Atkinson 700 0.8rem, 6px 8px, filete de 2px en tinta, fondo papel.
- **State:** coral para entregas de corte, ámbar para quiz.

### Cards / Containers
- **Tarjeta de jugada (las cuatro jugadas de la sesión):** papel, filete de 2px, 14px 14px 16px, sombra de celda alta en su tinta por orden: ámbar (quiz pre), coral (slides), menta (código), azul (quiz post). Estado "hecho" en Silkscreen menta-tx al pie.
- **Nota:** papel, filete de 2px, 16px 20px, sombra ámbar (coral si es advertencia).
- **Documentos:** rejilla de celdas unidas por filetes compartidos (sin huecos); hover pinta la celda en ámbar.
- **Ficha lateral:** sin caja, sólo filete izquierdo de 2px en tinta.

### Inputs / Fields (opciones de quiz)
- **Style:** botón de ancho completo en papel, filete de 2px, letra índice en un cuadrado de tinta de 32px con Silkscreen.
- **Focus / Hover:** sube 2px con sombra azul de 4px.
- **Correcta / Incorrecta:** fondo menta muy claro con borde menta-tx; fondo coral muy claro con borde coral-tx; la letra índice toma la tinta plena. En el lienzo de slides los rellenos son la tinta plena.

### Navigation
- **Barra superior:** marca pixel con un cuadrado de cuatro tintas, enlaces en Silkscreen 1rem sobre tinta, subrayado de 3px (ámbar al pasar, coral en la página actual). En móvil pasa a fila desplazable.
- **Barra de slides:** franja de tinta de 3.4rem con botones cuadrados en Silkscreen; siguiente en coral; puntos de paso como cuadrados de 9px; barra de progreso coral de 6px que avanza por pasos.

### Tira de frames (componente firma)
Nueve celdas 00 a 08 en ancho completo sobre tinta, separadas por filetes de papel de 2px. Cada celda: número en Silkscreen, título de la sesión y corte en micro. Frame abierto = celda coral con texto tinta; ya cerrado = cuadrado menta de 10px arriba a la derecha; "aquí te quedaste" = cuadrado ámbar de 10px a su izquierda, guardado en el navegador. Hover: tinta-2 con corte inmediato (transición 0s). Siempre acompañada de su leyenda.

### Caja de código
Tinta con sombra menta (coral si es código malo), pestañas en Silkscreen con subrayado menta de 3px para la activa, botón ejecutar en menta, salida en mono menta sobre un fondo más oscuro. En slides, las líneas se recorren atenuando el resto al 34% y marcando la línea activa con un cuadrado ámbar.

### Slide
Lienzo de tinta con rejilla; cada tipo de slide toma una tinta (`--k`): ámbar para portada, analogía, actividad y práctica; menta para código, demo, cierre y mapa; azul para idea, industria y reto; coral para antipatrón. El título lleva un cuadrado marcador de 18px en esa tinta que entra con un salto de sprite (0.24s, `steps(3)`). Los pasos revelados conservan su espacio y lo ya visto se atenúa al 48%. La portada lleva la tira de las seis tintas al pie.

## Do's and Don'ts

### Do:
- **Do** usar sólo las seis tintas y sus pasos derivados; texto en color sobre papel siempre con el paso `-tx`.
- **Do** mantener esquinas rectas (0px) y filetes de 2px en todo componente nuevo.
- **Do** dar profundidad con sombras duras desplazadas (4px o 6px, desenfoque 0) en una tinta de la paleta, y hundir el botón al pulsar.
- **Do** animar con `steps()` o cortes duros (0.08s a 0.5s) y apagar todo con `prefers-reduced-motion`.
- **Do** marcar estado con cuadrados planos y celdas de color con leyenda, no con cambios sutiles de tono.
- **Do** reservar Silkscreen para números, índices y rótulos cortos, en múltiplos de 8px.
- **Do** dibujar íconos y figuras como SVG de trazo cuadrado o con el kit de figuras (fig.js), sobre tinta con rejilla.

### Don't:
- **Don't** introducir radios, sombras con desenfoque, gradientes de luz ni brillos de neón.
- **Don't** usar fundidos ni transiciones con curvas suaves; el movimiento salta por pasos.
- **Don't** escribir párrafos, preguntas ni respuestas en Silkscreen; en botones sólo rótulos de una o dos palabras.
- **Don't** añadir colores fuera de la paleta indexada, ni siquiera para estados o resaltado de sintaxis.
- **Don't** construir la navegación como barra lateral de LMS con tarjetas redondeadas.
