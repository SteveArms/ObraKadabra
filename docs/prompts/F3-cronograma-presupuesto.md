# Prompt F3 — Cronograma 4D y presupuesto 5D

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 3 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/3-cronograma-presupuesto`

OBJETIVO
Que el slider de tiempo sea el corazón del demo: al moverlo, la casa se
construye en 3D y se actualizan los KPIs, la curva S, los materiales y el
Gantt. Referencia: `design/stitch/espacio_de_trabajo_4d_5d_obrakadabra/`.

TAREAS — MOTOR (puro y con tests)
1. `features/schedule/` (o `lib/schedule` si F6 también lo usa):
   - buildSchedule(floorPlan, takeoff, yields, crew): asigna cada elemento
     a una etapa y nivel y calcula la duración de cada etapa como metrado ÷
     rendimiento, respetando las dependencias foundation → columns →
     beams_slab → walls → roof → finishes, nivel por nivel. Devuelve las
     semanas de inicio y fin por elemento y por etapa.
   - statusAt(schedule, week, progress?): el estado de cada elemento en
     una semana dada. Sin `progress` es el plan; con `progress` compara
     plan contra real y marca "delayed".
   - costCurve(schedule, takeoff): la curva S planificada (y la real si
     hay progress) por semana.
   - materialsForWeek(schedule, takeoff, week): lista de compras de esa
     semana con cantidades, unidades y S/.
2. Usa SOLO lib/takeoff para cantidades y costos (no recalcules en otro lugar).

TAREAS — UI
3. Timeline inferior como en Stitch: segmentos por etapa con su rango de
   semanas, marcas S1..Sn, aguja naranja "Hoy", thumb arrastrable con
   tooltip (semana, etapa, S/ acumulado), botones de semana anterior y
   siguiente, Play/Pausa "Simular 4D" con velocidad 1x/2x/5x, y barras
   Planificado vs Real. Accesible con teclado (flechas) y role="slider"
   con aria-valuenow.
4. Store `useTimeline` (semana actual) que comparten el visor, los paneles
   y el timeline. El visor oculta lo que no ha empezado, muestra en azul
   translúcido lo que está en curso y en verde lo terminado, con los
   colores de lib/constants.
5. Panel derecho:
   - Resumen: fase activa, semana X de N, avance físico, costo invertido
     contra el total y una alerta de desfase si hay retraso.
   - Costo: curva S (SVG o Recharts) y barras por partida.
   - Materiales: compras de la semana con checkboxes, subtotal y botones
     "WhatsApp Ferretero" (abre wa.me con el texto prellenado) y
     "Descargar PDF" (puede quedar para F8 si no da el tiempo).
   - Gantt: mini Gantt sincronizado con la línea de la semana actual.
6. El popover de F2 muestra ahora la etapa, la semana y el estado.
7. Actualiza la duración de las tarjetas demo de Inicio con buildSchedule
   (reemplaza el valor provisional de F1).

PRUEBAS
- Vitest: buildSchedule respeta las dependencias (ninguna columna
  empieza antes de terminar su cimentación); duraciones = metrado ÷
  rendimiento; costCurve es monótona y termina en el total; los
  materiales de la semana suman lo esperado en un caso pequeño.
- Playwright e2e/f3-4d5d.spec.ts:
  · En la semana 1, data-visible-count solo cuenta elementos de
    cimentación.
  · Al pasar a la semana 8 (con el teclado sobre el slider) aumenta
    data-visible-count, data-week="8", el KPI de costo cambia y la lista
    de materiales se actualiza.
  · Play avanza la semana sola y Pausa la detiene.
  · El tab Costo muestra la curva y el total coincide con el de la
    tarjeta en Inicio.
  · El link de WhatsApp contiene los materiales de la semana.
  · Mobile: el timeline se puede usar con touch (tap en un segmento).

PERMISOS
Tienes autorización para ejecutar las pruebas e iterar hasta que
`pnpm check` pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR con un GIF del slider de la semana 1 a la N.
```
