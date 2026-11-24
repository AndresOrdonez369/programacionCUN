# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and JavaScript, no build step (same approach as the teacher's Arquitectura de Videojuegos site). Deployable on GitHub Pages or Vercel. Spanish.

## Users

- Postgraduate students (virtual, Semester I) of the Especialización en Diseño y Desarrollo de Videojuegos at CUN. Many arrive without a programming background: designers, artists, communicators. They open the site before, during and after each live session from a laptop and review from the phone.
- The teacher, Andrés Ordóñez-Bolaños, who projects the slides live over a video call, launches the pre-class and post-class quizzes and points students to the code.

## Product Purpose

One place for the whole course "Programación de Videojuegos": an autonomous Module 0 (learning to think like a programmer), eight sessions with interactive slides, Lua / LÖVE code examples, a pre-class quiz and a post-class quiz per session, plus the evaluation map (Quiz Corte I, ACA 1, ACA 2, auto and co-evaluation). A student should know in seconds what to do this session and be able to study alone. It replaces material scattered across many weekly folders.

## Positioning

The course starts from computational thinking (decomposition, patterns, abstraction, algorithms, Boolean logic, state, debugging) before any syntax, and every later idea (game loop, objects, collisions) is shown as a game mechanic first, then as pseudocode, then as Lua.

## Operating Context

- 8 sessions grouped into three cortes: Corte I sessions 1–2 (Quiz/Parcial 30 %), Corte II sessions 3–5 (ACA 1 30 %), Corte III sessions 6–8 (ACA 2 32 %, autoevaluación 4 %, coevaluación 4 %).
- Reusable across cohorts: no dates in the site. Dates, if ever needed, live in one data file.
- Stack taught: Lua + LÖVE (Love2D). Not Unity, not Unreal.
- Existing course projects: Demo inicial Love2D, LuaQuiz + Coin Hunt, quiz2lua, ShapeArena, Breakout (ACA 2), Boss Rush (final review). Public repos: github.com/AndresOrdonez369/LuaQuiz, quiz2lua, ShapeArena, finalclassprogrammingcun.

## Capabilities and Constraints

- No accounts or backend: quiz progress lives in the browser (localStorage) and must degrade gracefully.
- Slides must work projected (16:9) and on a phone, keyboard navigable.
- Pre-quiz and post-quiz of each session share the same key ideas so the gain is visible.
- Do not publish teacher keys or files marked CLAVE_DOCENTE / FUENTE_NO_PUBLICAR.

## Brand Commitments

- CUN institution; tone: tuteo, close, direct, postgraduate (transformation, decision making, added value).
- Identity of its own, distinct from the teacher's Deep Learning and Arquitectura sites.
- Teach with analogies; no unexplained jargon.

## Evidence on Hand

- Syllabus and microcurrículo in CURSO_MAESTRO/00_ADMIN_Y_FUENTES.
- Session decks (pptx) in CURSO_MAESTRO/02_SESIONES, projects in CURSO_MAESTRO/04_PROYECTOS_Y_REPOS, ACA 1 / ACA 2 consignas in CURSO_MAESTRO/03_EVALUACIONES.
- No real student data or results exist; never fabricate them.

## Product Principles

1. Think before typing: every concept appears as a mechanic, then pseudocode, then Lua.
2. Predict before seeing the answer.
3. One idea per slide, shown working (demo or worked example) rather than defined.
4. Measure learning, not grades: pre and post quizzes give a starting point and a gain.
5. Never intimidating for someone who has never programmed.

## Accessibility & Inclusion

WCAG AA contrast, keyboard navigation in slides and quizzes, readable when screen-shared, respect prefers-reduced-motion.
