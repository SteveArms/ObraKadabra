# Prompt F4 — Subir plano, calibrar escala y extracción con IA

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 4 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/4-subir-plano-ia`

OBJETIVO
Flujo completo desde subir la foto del plano hasta tener un FloorPlan
válido, listo para el editor. Referencias:
`design/stitch/subir_plano_wizard_3_pasos_obrakadabra/` y
`design/stitch/procesando_plano_con_ia_obrakadabra/`.

TAREAS — IA (src/lib/ai/, el único lugar que llama al modelo)
1. Cliente configurable por AI_API_KEY y AI_MODEL (modelo multimodal de
   visión con salida JSON estructurada; por defecto Gemini).
2. Prompt de extracción de planos: devuelve un FloorPlan en píxeles de la
   imagen con un `confidence` (0–1) por elemento, el nombre de los
   ambientes si están rotulados y las cotas legibles. Usa el JSON schema
   generado desde el esquema Zod (zod-to-json-schema), sin duplicar el
   esquema a mano.
3. Pipeline en `/api/plano` (POST multipart): valida tipo y tamaño (JPG,
   PNG o PDF de hasta 25 MB) → llama a la IA → valida con Zod (un
   reintento con el error como feedback) → convierte a metros con la
   escala → aplica lib/geometry (snapAngle, closeGaps, mergeCollinear) →
   responde FloorPlan + la lista de elementos con confidence < 0.75
   (pendientes). Errores con mensajes en español.
4. Modo demo: si AI_MODEL=fixture, responde con e2e/fixtures/plano-*.json.

TAREAS — UI
5. `/subir` es un wizard con stepper (Subir plano → Calibrar escala →
   Datos de obra):
   - Paso 1: dropzone y "Tomar foto" (input capture en móvil), vista
     previa con rotar, contraste y recortar, tips de foto como en
     Stitch, y "Añadir Piso 2" para subir varios niveles.
   - Paso 2: el usuario hace clic en 2 puntos de la imagen y escribe la
     distancia en metros; se muestra "1 px = X m". No se puede avanzar
     sin calibrar.
   - Paso 3: nombre del proyecto, niveles (1, 2, 3 + azotea), altura de
     entrepiso (mínimo 2.40 con una validación clara) y tipo de techado.
   - Botón naranja fijo abajo "Continuar…" y "Cancelar y volver a proyectos".
6. `/subir/procesando`: los pasos se van marcando a medida que avanza
   la respuesta (leyendo → muros → vanos → ambientes → volumetría y
   presupuesto), con conteos reales cuando llegan, un "¿Sabías que?" y
   un estado de error con "Reintentar" y "Subir otra foto".
7. Al terminar: guarda el proyecto con ProjectRepository (estado
   "Borrador", pendientes > 0) y redirige a /proyecto/<id>/editor.
8. Quita las afirmaciones falsas de Stitch ("98.4% precisión", "Validado
   por CAPECO", "NTP 399.613"). Los conteos que se muestran son los reales.

PRUEBAS
- Vitest: la conversión de px a m, el pipeline con una respuesta de IA
  mockeada (válida, inválida → reintento, inválida dos veces → error) y
  el cálculo de pendientes.
- Fixtures: `e2e/fixtures/plano-simple.png` (genera un plano sencillo
  con SVG → PNG) y `plano-simple.json`.
- Playwright e2e/f4-subir.spec.ts (con page.route mockeando /api/plano):
  · Subir el PNG muestra la vista previa y habilita "Continuar".
  · Sin calibrar no se puede pasar del paso 2; al marcar 2 puntos y
    escribir 8.00 aparece la escala.
  · Una altura de 2.20 muestra error y una de 2.60 permite seguir.
  · Procesando muestra los pasos y redirige a /proyecto/<id>/editor.
  · Si la API responde 500, aparece el estado de error y "Reintentar"
    vuelve a llamar.
  · Mobile: el wizard es usable y el botón de continuar es visible.
  · Una spec etiquetada @ai que usa la IA real con plano-simple.png (no
    corre en CI).

PERMISOS
Tienes autorización para ejecutar las pruebas (excepto @ai si no hay
API key) e iterar hasta que `pnpm check` pase. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR con capturas de los 3 pasos y de procesando.
```
