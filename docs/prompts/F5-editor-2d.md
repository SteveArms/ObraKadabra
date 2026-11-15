# Prompt F5 — Editor 2D de corrección

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 5 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/5-editor-2d`

OBJETIVO
Que el usuario corrija en segundos lo que la IA detectó mal. Es la
pantalla estrella para Best Design & UX. Referencia:
`design/stitch/editor_2d_de_correcci_n_con_ia_obrakadabra/`.

TAREAS
1. `features/plan-editor/` con un store propio (Zustand + historial de
   deshacer/rehacer) que edita UNA copia del FloorPlan. Al guardar, se
   escribe con ProjectRepository.
2. Lienzo SVG: la imagen original de fondo y encima los muros (gruesos),
   las columnas, los vanos (arcos para puertas, líneas dobles para
   ventanas) y los ambientes con su etiqueta y m² (calculados con
   lib/geometry). Zoom con la rueda o con los botones, pan, grilla de
   0.05 m y modo pantalla amplia.
3. Toggle Original / IA / Ambos y slider de opacidad.
4. Herramientas en la barra izquierda: Seleccionar, Mover vértice,
   Dibujar muro, Columna, Puerta, Ventana, Ambiente, Medir y Borrar, con
   atajos (V, M, W, C, D, N, R, Del, Ctrl+Z, Ctrl+Shift+Z) que se ven en
   los tooltips y en el modal "Atajos".
5. Snap mientras editas: a 0/90°, a los vértices cercanos y a la grilla
   (todo desde lib/geometry, sin reimplementarlo).
6. Elementos con confidence < 0.75 en ámbar con el badge "Revisar".
   Barra superior "N elementos requieren confirmación · Revisar
   siguiente →" que centra y selecciona el siguiente pendiente.
7. Popover de decisión rápida (como en Stitch: "¿Muro portante o
   tabique?", con 2 botones) para los pendientes de tipo.
8. Panel de propiedades: tipo estructural, longitud, espesor, altura
   libre, confinamiento, y el cómputo métrico del elemento (ladrillos,
   cemento, arena, S/) desde lib/takeoff. Lista "Pendientes de
   corrección" y botón "Validar <id>".
9. Vista previa "3D EN VIVO" en la esquina: reutiliza el visor de F2
   (ModelFromPlan) en tamaño pequeño, actualizado con debounce. No crees
   otro visor.
10. Escala visible "1 px = X m | N m calibrados" con opción de recalibrar.
11. "¡Todo bien! Levantar en 3D" (naranja): si quedan pendientes, pide
    confirmación; guarda el proyecto, cambia su estado a "Listo" y navega
    a /proyecto/<id>. "Descartar" pide confirmación y vuelve a Inicio.

PRUEBAS
- Vitest: las acciones del store (mover vértice, cambiar tipo, borrar,
  deshacer y rehacer) y que el snap se aplique.
- Playwright e2e/f5-editor.spec.ts (sembrando el proyecto con
  e2e/fixtures/plano-simple.json, que tiene 3 pendientes):
  · Se ve "3 elementos requieren confirmación".
  · "Revisar siguiente" selecciona el primer pendiente y el panel muestra
    sus propiedades.
  · Elegir "Tabique (15cm)" cambia el espesor a 0.15 y baja el contador a 2.
  · Arrastrar un vértice (mouse.down/move/up sobre data-testid="vertex-…")
    cambia la longitud que muestra el panel.
  · Ctrl+Z revierte el arrastre.
  · Validar los pendientes restantes → contador en 0.
  · "Levantar en 3D" navega a /proyecto/<id> y el visor tiene
    data-visible-count > 0.
  · El toggle Original/IA/Ambos cambia la visibilidad de las capas.

PERMISOS
Tienes autorización para ejecutar las pruebas e iterar hasta que
`pnpm check` pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR con un GIF corrigiendo un muro.
```
