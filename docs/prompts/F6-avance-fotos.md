# Prompt F6 — Registrar avance con foto e IA

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 6 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/6-avance-fotos`

OBJETIVO
El momento "wow" para Best AI Hack: una foto real de la obra actualiza el
gemelo digital. Referencia:
`design/stitch/registrar_avance_con_foto_e_ia_obrakadabra/`.

TAREAS — IA
1. En `src/lib/ai/` añade un prompt de avance: recibe la foto, el nivel y
   sector elegidos y la lista de elementos esperados para la semana
   actual (id, tipo, etapa), y devuelve por elemento un estado
   (done, in_progress, not_started), un % estimado, una evidencia en una
   frase y un confidence. Validado con un esquema Zod nuevo en
   src/schemas/progress.ts (reutiliza ElementStatus de F1).
2. `/api/avance` (POST multipart): mismo patrón de validación y reintento
   que /api/plano. Extrae la lógica común a un helper de lib/ai en lugar
   de copiarla. Modo fixture como en F4.

TAREAS — UI
3. `/proyecto/[id]/avance`:
   - Cabecera con la semana, el avance acumulado y el desvío del
     presupuesto (de lib/schedule y lib/takeoff).
   - Paso 1, Ubicación: nivel (Primer piso, Segundo piso, Azotea) y
     sector o ambiente (de los rooms del FloorPlan).
   - Paso 2, Captura: botón grande "Subir o tomar foto de obra" (capture
     en móvil), vista previa con hora y tamaño, y "Retomar".
   - Análisis IA: tarjetas por hallazgo (verde terminado, azul en curso,
     ámbar pendiente o en ruta crítica) con el id del elemento, una barra
     de impacto en el cronograma (+X%) y la valorización en S/.
   - Texto "La IA propone, el maestro aprueba".
     "Confirmar y actualizar modelo 3D" y "Corregir detalles manualmente"
     (permite cambiar el estado de cada elemento antes de confirmar).
   - "Antes vs después": la foto junto al visor de F2 en miniatura,
     filtrado a los elementos del hallazgo.
   - Historial: tarjetas por fecha y semana con estado "Aprobado" o "Por
     confirmar".
4. Al confirmar se guarda un ProgressEntry con ProjectRepository; en el
   espacio 4D, statusAt usa ese progreso y el visor pinta en verde, azul
   o rojo según plan vs real. El banner de desfase y la curva S real se
   actualizan.
5. El botón "Registrar avance" del header lleva a esta ruta en el
   proyecto actual.
6. Fotos: por ahora en localStorage/IndexedDB (comprimidas a ≤ 1600 px);
   en F7 pasan a Supabase Storage con la misma interfaz.

PRUEBAS
- Vitest: aplicar un ProgressEntry cambia statusAt; un elemento
  planificado como hecho y reportado no iniciado queda "delayed".
- Fixtures: e2e/fixtures/obra-columnas.jpg y avance-columnas.json (C-1 y
  C-2 terminadas y el muro M-3 al 50%).
- Playwright e2e/f6-avance.spec.ts (mock de /api/avance):
  · Elegir Primer piso → subir la foto → aparecen 2 hallazgos "terminado"
    y 1 "en curso".
  · "Corregir" permite cambiar M-3 a "no iniciado".
  · Confirmar → navegar a /proyecto/<id> → al seleccionar C-1 el popover
    dice "Terminado" y el visor marca data-status-C-1="done" (expón el
    estado en un atributo del ítem de la lista de elementos).
  · El historial muestra la nueva entrada.
  · Mobile (390×844): todo el flujo funciona y el botón de cámara está
    visible sin hacer scroll.

PERMISOS
Tienes autorización para ejecutar las pruebas e iterar hasta que
`pnpm check` pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR con un GIF de la foto a la columna en verde.
```
