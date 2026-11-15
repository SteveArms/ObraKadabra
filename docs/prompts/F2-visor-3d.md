# Prompt F2 — Visor 3D y espacio de trabajo (parte visual)

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 2 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/2-visor-3d`

OBJETIVO
Un único visor 3D que muestra un proyecto venga de un GLB demo o de un
FloorPlan generado, con la parte visual del espacio de trabajo de
`design/stitch/espacio_de_trabajo_4d_5d_obrakadabra/`. El timeline y los
paneles con datos llegan en F3; aquí solo se deja su espacio.

TAREAS
1. `features/viewer-3d/`:
   - `ModelFromGlb`: carga el GLB con drei useGLTF, recorre los meshes y
     los registra por id usando la convención `<tipo>_<id>`.
   - `ModelFromPlan`: genera la geometría de forma procedural desde el
     FloorPlan (muros extruidos con huecos para los vanos, columnas, losas,
     zapatas y techo). Cada mesh se nombra con la misma convención.
   - Ambos producen el mismo registro de elementos {id, type, level, mesh}.
     El resto del visor no sabe de qué origen viene el modelo.
   - Si el demo no tiene GLB, se usa ModelFromPlan automáticamente.
2. Controles del visor (barra flotante "glass" de Stitch): Órbita, Pan,
   Zoom, vistas Planta/Isométrica/Frontal y cortes por nivel
   (Cimentación, Piso 1, Piso 2, según los niveles) y pantalla amplia.
3. Leyenda de estados con los colores únicos de lib/constants (en esta
   fase todo queda como "No iniciado"; el cálculo llega en F3).
4. Clic en un elemento → resaltado y popover como en Stitch (nombre, tipo,
   nivel, metrado y costo desde lib/takeoff). Cierra con X o Escape.
5. Contenedor del visor con data-testid="viewer" y los atributos
   data-view, data-level-cut, data-selected-id y data-visible-count
   (AGENTS.md §3, Pruebas).
6. Layout de `/proyecto/[id]`: barra del proyecto (nombre, m², badge de
   estado), visor oscuro (#16181D) a la izquierda, panel derecho con tabs
   Resumen/Costo/Materiales/Gantt (por ahora con skeletons) y un
   contenedor del timeline abajo (por ahora vacío).
7. Vista de coordenadas abajo a la izquierda (eje X/Y y vista) como en Stitch.
8. Rendimiento: un solo Canvas, materiales compartidos por estado e
   instancing si hay muchas columnas.

PRUEBAS
- Vitest: el generador procedural crea 1 mesh por elemento del FloorPlan
  con el nombre correcto; el registro de un GLB de prueba mapea los ids.
- Playwright e2e/f2-visor.spec.ts (con los 2 demos):
  · /proyecto/casa-1-piso-90 carga y viewer tiene data-visible-count > 0.
  · El botón "Planta" pone data-view="top".
  · El corte "Piso 1" cambia data-level-cut y reduce data-visible-count en
    el demo de 2 pisos.
  · Seleccionar un elemento: añade una lista de elementos accesible y
    oculta (o un botón por elemento en el panel) para elegirlo sin
    depender del raycast; al elegir C-1, data-selected-id="C-1" y el
    popover muestra "Columna".
  · Escape cierra el popover.
  · Mobile: el visor ocupa la parte superior y los tabs pasan abajo
    (DESIGN.md, Layout).
  · Captura de referencia del visor con toHaveScreenshot y un umbral
    tolerante.

PERMISOS
Tienes autorización para ejecutar Playwright, revisar trazas y capturas y
corregir hasta que `pnpm check` pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR con un GIF o capturas de ambos demos.
```
