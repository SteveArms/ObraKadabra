# Prompt F1 — Dominio, demos y dashboard de inicio

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 1 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/1-dominio-inicio`

OBJETIVO
Crear el núcleo de datos del que dependen todas las pantallas y construir
la pantalla de Inicio con los 2 demos precargados.

TAREAS — DOMINIO
1. `src/schemas/floor-plan.ts` (Zod): FloorPlan con meta (nombre, escala
   m/px, niveles, altura de piso, tipo de techo), walls (id, x1, y1, x2, y2,
   thickness, kind: load_bearing|partition, level, confidence), openings
   (id, wallId, kind: door|window, offset, width, height, sill), columns
   (id, x, y, w, d, level), footings, slabs, rooms (id, name, polygon,
   level). Exporta los tipos con z.infer.
2. `src/schemas/schedule.ts`: Stage (foundation, columns, beams_slab, walls,
   roof, finishes), ElementStatus (not_started, in_progress, done, delayed)
   y ProgressEntry.
3. `src/lib/geometry/`: length, area, polygonArea, wallArea (menos vanos),
   volume, snapAngle, snapToGrid, mergeCollinear, closeGaps. Todas puras y
   con tests.
4. `src/data/yields.ts` (rendimientos por partida), `src/data/prices.ts`
   (precios unitarios de referencia en S/, editables) y `src/data/waste.ts`
   (desperdicio: ladrillo 5%, mortero 10%).
5. `src/lib/takeoff/`: a partir del FloorPlan calcula metrados por elemento
   y partida (m³ de concreto, m² de muro, ladrillos, bolsas de cemento,
   arena, fierro) y su costo. Funciones puras con tests.
6. `src/lib/projects/`: interfaz ProjectRepository (list, get, save, remove)
   con una implementación en localStorage. Los demos se leen de
   `src/data/demos/` y son de solo lectura.

TAREAS — DEMOS
7. Crea `src/data/demos/casa-1-piso-90.json` y
   `src/data/demos/vivienda-2-pisos-120.json` como FloorPlan válidos y
   realistas (90 m² de 1 piso y 120 m² de 2 pisos).
8. Reserva `public/models/demos/casa-1-piso-90.glb` y
   `vivienda-2-pisos-120.glb` (los GLB los pongo yo). Escribe un test que,
   si el GLB existe, lea los nombres de los meshes y verifique que cada
   `<tipo>_<id>` exista en su JSON. Si el GLB no está, el test se omite con
   un aviso, no falla.

TAREAS — PANTALLA INICIO
9. Implementa `/` según `design/stitch/inicio_dashboard_obrakadabra/`
   (mira screen.png):
   - Hero con el claim, CTA naranja "Subir mi plano" → /subir y "Ver cómo
     funciona" (abre un modal; el video va después).
   - "Prueba con un ejemplo precargado": 2 tarjetas cuyos valores de m²,
     pisos, presupuesto y duración se CALCULAN con lib/takeoff (la
     duración puede ser provisional hasta F3). Botón "Abrir demo 3D" →
     /proyecto/<demoId>.
   - "Mis proyectos activos" desde ProjectRepository, con un estado vacío
     amigable si no hay proyectos.
   - Banner "¿Tienes un plano nuevo…?" → /subir.
   - Fila de KPIs agregados (solo números reales; quita "Precisión IA 98.4%").
   - Las imágenes de las tarjetas pueden ser placeholders o renders que
     pondré después en /public/demos/.

PRUEBAS
- Vitest: geometry, takeoff y projects (el CRUD de localStorage).
- Playwright e2e/f1-inicio.spec.ts:
  · Se ven 2 tarjetas demo (data-testid="demo-card") con m², pisos y S/.
  · El valor de S/ de cada tarjeta coincide con el que calcula takeoff
    (expónlo en data-total en la tarjeta).
  · "Abrir demo 3D" navega a /proyecto/casa-1-piso-90.
  · "Subir mi plano" navega a /subir.
  · Sin proyectos se ve el estado vacío; con un proyecto sembrado en
    localStorage se ve su tarjeta.
  · Mobile: las tarjetas se apilan y los CTA son visibles.

PERMISOS
Tienes autorización para ejecutar pruebas e iterar hasta que `pnpm check`
pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR a `main` con capturas de la home en
desktop y mobile.
```
