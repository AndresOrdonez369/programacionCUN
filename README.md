# Programación de Videojuegos · sitio del curso (CUN)

Especialización en Diseño y Desarrollo de Videojuegos · Semestre I · Docente: Andrés Ordóñez-Bolaños

Todo el curso en una sola página web: **Módulo 0** (pensar como programador) y **8 sesiones**, cada una con quiz preclase, slides interactivas, código en pseudocódigo y Lua (LÖVE) y quiz postclase. El sitio no tiene fechas, así que se reutiliza en cada cohorte.

## Verlo en tu computador

```
node tools/serve.js
```

y abre http://localhost:4175. También funciona publicado tal cual en GitHub Pages o Vercel (es HTML, CSS y JavaScript estáticos, sin compilar).

## Páginas

| Página | Qué es |
|---|---|
| `index.html` | Inicio: la tira de 9 frames (Módulo 0 + 8 sesiones), los cuatro pasos de la sesión elegida, evaluación y proyectos |
| `sesion.html?s=N` | Guía de la sesión N (0 a 8): mapa de temas, objetivos, conceptos, código, taller, errores comunes, tarea, agenda y tu avance |
| `slides.html?s=N` | Slides interactivas (flechas para avanzar, `F` pantalla completa, `N` notas del docente) |
| `quiz.html?s=N&t=pre` / `&t=post` | Quiz preclase (6 preguntas) y postclase (8). Muestran la ganancia por idea clave |

## Dónde se edita

| Quiero cambiar… | Archivo |
|---|---|
| Títulos, preguntas, analogías, cortes, proyectos | `data/curso.js` |
| El contenido de una sesión (slides, código, quices…) | `data/sN.js` |
| Las figuras interactivas de una sesión | `demos/sN.js` |
| El formato de los datos (referencia completa) | `tools/FORMATO_SESION.md` |
| Colores y tipografía | `assets/style.css` (páginas) y `assets/deck.css` (slides) |

Después de editar, corre `node tools/validar.js`: revisa que cada pregunta tenga respuesta válida, que las ideas clave aparezcan en el pre y en el post, y que existan las figuras usadas en las slides.

## Detalles

- Los bloques de Lua marcados **ejecutar** corren en el navegador con [Fengari](https://fengari.io) (se carga solo cuando alguien pulsa ejecutar). Solo para Lua puro con `print`, no para `love.*`.
- El progreso de los quices se guarda en el navegador de cada estudiante (`localStorage`). No hay cuentas ni servidor.
- Material fuente del docente: `../CURSO_MAESTRO/` (presentaciones, ACA, proyectos). No publiques nada marcado `CLAVE_DOCENTE` ni `FUENTE_NO_PUBLICAR`.
