# Prompt F8 — Pulido, accesibilidad y material de entrega

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 8 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/8-pulido-demo`

OBJETIVO
Dejar la app lista para el jurado y para grabar el video de 3 minutos.

TAREAS — REVISIÓN DE CÓDIGO (primero)
1. Haz la revisión completa de CLAUDE.md (duplicados, capa incorrecta,
   tamaño, comentarios y tipos) sobre todo `src/`. Unifica los
   duplicados y reporta lo que encontraste en el PR.

TAREAS — UX
2. Onboarding de 3 pasos en el espacio 4D la primera vez ("Paso 1 de 3:
   mueve el slider…", como en Stitch), con "Saltar" y recordado en
   localStorage.
3. Revisa los estados vacíos, de carga (skeletons) y de error de todas
   las pantallas: plano borroso, sin conexión, IA caída (con un botón
   para usar el modo demo) y proyecto no encontrado.
4. Microinteracciones de "magia" con el indigo IA solo en los momentos de
   IA, respetando prefers-reduced-motion.
5. "Descargar PDF" del resumen y de los materiales (si quedó pendiente en F3).
6. Revisión visual pantalla por pantalla contra design/stitch/*/screen.png;
   anota y corrige las diferencias importantes.

TAREAS — CALIDAD
7. Accesibilidad: @axe-core/playwright en todas las rutas sin
   violaciones serias o críticas, contraste AA, foco visible y objetivos
   táctiles ≥ 44 px en móvil.
8. Rendimiento: Lighthouse ≥ 85 en Inicio (móvil), GLB comprimidos
   (Draco o Meshopt) y carga diferida del visor.

TAREAS — ENTREGA DEL HACKATHON
9. README.md para el jurado, en español: qué hace, cómo funciona (con un
   diagrama del flujo), cómo lo hicimos, retos, aprendizajes, qué sigue,
   tecnologías, herramientas de IA usadas (incluye Claude Code, Stitch y
   el modelo de visión), cómo correrlo y el link del demo en vivo.
10. `e2e/demo-video.spec.ts` (tag @video, fuera de CI): recorre el camino
    feliz con pausas legibles y video activado (Inicio → demo → slider →
    subir plano mockeado → editor → levantar en 3D → avance con foto →
    compartir). Sirve como B-roll para el video de YouTube.

PRUEBAS
- Playwright e2e/f8-a11y.spec.ts con axe en todas las rutas
  (desktop y mobile).
- La suite completa F0–F8 debe pasar.

PERMISOS
Tienes autorización para ejecutar las pruebas, Lighthouse y axe, e iterar
hasta que `pnpm check` pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR final con el resumen de la revisión de
duplicados, el puntaje de Lighthouse y el link al video generado.
```
