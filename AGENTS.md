# AGENTS.md — ObraKadabra

> Fuente única de reglas para cualquier agente de IA (Claude, Codex, Cursor, Copilot, Gemini).
> Si una regla cambia, se cambia SOLO aquí.

## 1. Qué es el proyecto

**ObraKadabra**: web app que convierte un plano arquitectónico 2D (foto) en un modelo 3D de la vivienda, vinculado a un cronograma de obra (4D) y un presupuesto (5D). El usuario mueve un slider de tiempo y ve la casa construirse semana a semana, con costo, materiales y avance real por fotos.

- Público: familias que autoconstruyen, maestros de obra y pequeños contratistas (Perú).
- Idioma de la UI: español (Perú). Moneda: `S/`. Unidades: metros.
- Hackathon IceHacks: **solo vale código escrito desde el 8 de noviembre de 2026**. No copiar código de proyectos anteriores.

### Dos orígenes de un proyecto
1. **Demos precargados (2)**: modelos 3D ya listos en `public/models/demos/` (glTF/GLB, **no FBX**) + su JSON de plano en `src/data/demos/`.
2. **Proyecto nuevo**: el usuario sube una foto del plano → la IA devuelve un `FloorPlan` JSON → el usuario corrige en el editor 2D → el 3D se genera de forma procedural.

Ambos orígenes terminan en el **mismo** tipo `FloorPlan` y usan el **mismo** visor. Nunca crear un visor o pipeline aparte para los demos.

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) + TypeScript estricto |
| 3D | React Three Fiber + drei + three |
| Editor 2D | SVG/Konva |
| Estilos | Tailwind CSS + componentes en `src/components/ui` |
| Estado | Zustand (un store por feature) |
| Validación | Zod (esquemas = fuente de verdad de los tipos) |
| IA | Gemini / GPT-4o vision con salida JSON estructurada |
| Datos | Supabase (proyectos, fotos, avances) |
| Deploy | Vercel |

## 3. Comandos

```bash
pnpm dev         # servidor local
pnpm build       # build de producción
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest (unitarias)
pnpm test:e2e    # Playwright (end-to-end)
pnpm check       # lint + typecheck + test + test:e2e
```

Antes de dar una tarea por terminada: `pnpm check` debe pasar.

### Pruebas

- **Unitarias (Vitest)**: toda función pura de `lib/` y los `utils.ts` de cada feature. Archivo `*.test.ts` junto al código.
- **End-to-end (Playwright)**: cada fase agrega sus specs en `e2e/<fase>-<feature>.spec.ts`. Las specs de fases anteriores deben seguir pasando.
- Selectores: solo `getByRole`, `getByLabel` o `data-testid` (kebab-case). Nunca clases CSS ni textos frágiles.
- Visor 3D: WebGL no se inspecciona por píxeles. El contenedor del visor expone su estado en atributos (`data-week`, `data-visible-count`, `data-selected-id`, `data-view`) y las pruebas leen esos atributos.
- IA: en e2e **siempre** se mockea con `page.route()` y fixtures de `e2e/fixtures/`. Las pruebas que llaman a la IA real llevan el tag `@ai` y no corren en CI.
- Viewports: `desktop` (1440×900) y `mobile` (390×844) como proyectos de Playwright.
- El agente **tiene autorización** para instalar navegadores de Playwright, ejecutar las pruebas, leer trazas o capturas y corregir el código hasta que pasen. No se desactiva ni se salta una prueba para que pase.

### Ramas

- `main` siempre desplegable. Nunca se commitea directo a `main`.
- Una rama por fase, creada desde `main` actualizado: `fase/<n>-<nombre>` (ej. `fase/2-visor-3d`).
- Arreglos dentro de una fase: `fix/<n>-<tema>`, que se crea desde la rama de la fase y vuelve a ella.
- Al cerrar la fase: `pnpm check` en verde → push → Pull Request a `main` con la descripción de la fase y los resultados de las pruebas → merge **sin squash** (los commits son evidencia para el hackathon).

## 4. Estructura

```
design/stitch/                # pantallas de referencia (screen.png + code.html) y DESIGN.md
e2e/                          # specs de Playwright + fixtures/
docs/                         # PLAN.md y prompts/ por fase
public/models/demos/          # GLB de los 2 demos
src/
├── app/                      # rutas y API routes (solo orquestan, sin lógica de negocio)
│   ├── page.tsx              # inicio + demos + mis proyectos
│   ├── subir/                # wizard: subir → escala → datos
│   ├── proyecto/[id]/        # espacio de trabajo 4D/5D
│   ├── proyecto/[id]/editor/ # editor de corrección 2D
│   ├── compartir/[id]/       # vista pública de solo lectura
│   └── api/
│       ├── plano/route.ts    # imagen → FloorPlan (IA)
│       └── avance/route.ts   # foto de obra → progreso (IA)
├── features/                 # un módulo por funcionalidad
│   ├── upload/
│   ├── plan-editor/
│   ├── viewer-3d/
│   ├── schedule/             # cronograma 4D
│   ├── budget/               # metrados y costo 5D
│   └── progress/             # avance real por fotos
├── lib/
│   ├── ai/                   # cliente IA + prompts (único lugar que llama a modelos)
│   ├── geometry/             # snap, fusión de muros, escala, áreas, volúmenes
│   └── supabase/             # cliente y queries
├── components/ui/            # botones, tabs, cards, slider… (sin lógica de dominio)
├── schemas/                  # esquemas Zod: FloorPlan, Stage, Progress…
├── data/                     # rendimientos, precios, demos (datos, no lógica)
└── styles/
```

Cada carpeta de `features/` tiene esta forma y expone **solo** lo que exporta su `index.ts`:

```
features/<nombre>/
├── components/
├── hooks/
├── store.ts
├── utils.ts      # solo si la lógica es exclusiva de esta feature
└── index.ts      # API pública de la feature
```

## 5. Regla principal: funcionalidad única (cero duplicados)

Cada responsabilidad existe en **un solo lugar** del código.

**Antes de crear** una función, hook, componente, tipo o constante:
1. Busca si ya existe (`grep -rn "<palabra clave>" src/`), por nombre y por lo que hace.
2. Si existe algo parecido → **reutilízalo o extiéndelo**. No crees `formatPrice2`, `useViewerNew` ni `utils-copy`.
3. Si no existe → créalo en la capa correcta (tabla abajo).

| Si es… | Va en… |
|---|---|
| Cálculo geométrico (largo, área, volumen, snap) | `src/lib/geometry/` |
| Llamada a un modelo de IA o un prompt | `src/lib/ai/` |
| Acceso a base de datos | `src/lib/supabase/` |
| Tipo de dominio | `src/schemas/` (Zod) → `z.infer` |
| Constante de negocio (precios, rendimientos, colores de etapa) | `src/data/` o `src/lib/constants.ts` |
| Componente visual genérico | `src/components/ui/` |
| Lógica usada por una sola feature | dentro de esa feature |
| Lógica usada por 2+ features | se mueve a `src/lib/` (no se copia) |

**Al revisar código** (propio o ajeno), revisa explícitamente:
- Dos funciones o componentes que hacen lo mismo con distinto nombre → unificar.
- Tipos definidos a mano que ya existen en `schemas/` → reemplazar por el esquema.
- Valores mágicos repetidos (`2.6`, `0.15`, colores hex) → constante única.
- Una feature importando internals de otra (`features/x/components/...`) → usar su `index.ts`.
- Si encuentras un duplicado, unifícalo en la misma tarea y menciónalo en el resumen.

## 6. Código limpio y modular

- **Una responsabilidad por archivo, función y componente.** Si su nombre necesita "y", divídelo.
- Archivos de **≤ 200 líneas** y funciones de **≤ 40 líneas**. Si se pasan, extrae.
- Componentes: la UI en el componente, la lógica en hooks y los cálculos en funciones puras de `lib/`.
- Las funciones de `lib/geometry`, `schedule` y `budget` son **puras** (sin React, sin efectos) y tienen test.
- `app/` solo compone features. Sin cálculos ni fetch directo.
- Sin `any`. Sin `console.log` en commits. Sin código comentado. Sin imports ni variables sin usar.
- Retornos tempranos en vez de `if` anidados.
- Las claves de API solo existen en el servidor (`api/` y `lib/ai`). Nunca usar `NEXT_PUBLIC_` para claves.

### Nombres
- **Código en inglés**, **texto de UI en español**.
- Componentes en `PascalCase`, hooks `useCamelCase`, funciones `camelCase`, constantes `UPPER_SNAKE_CASE`, archivos `kebab-case.ts` (componentes `PascalCase.tsx`).

Glosario de dominio (úsalo siempre igual):

| Código | UI |
|---|---|
| `wall` | Muro |
| `opening` (`door`, `window`) | Vano (puerta, ventana) |
| `column` | Columna |
| `room` | Ambiente |
| `level` | Piso / nivel |
| `stage` | Etapa |
| `takeoff` | Metrado |
| `budget` | Presupuesto |
| `progress` | Avance |

## 7. Comentarios

- **Solo los importantes**: el *por qué* de algo no obvio, una decisión, un hack o una fórmula de negocio.
- **Siempre de una sola línea** con `//`. Prohibidos los bloques `/* */` y los JSDoc multilínea.
- No comentes lo que el código ya dice.
- Formato de pendientes: `// TODO: <acción concreta>`.

```ts
// ✅ Bien
// Rendimiento CAPECO: 1 cuadrilla asienta ~10 m² de muro de soga por día
const WALL_M2_PER_DAY = 10;

// ✅ Bien
// Snap a 0/90° porque la IA devuelve ángulos con ruido de ±3°
const snapped = snapAngle(wall, 3);

// ❌ Mal: obvio
// Suma el costo
const total = a + b;

// ❌ Mal: multilínea
/**
 * Esta función calcula el volumen
 * de concreto de las columnas
 */
```

## 8. Dominio: datos clave

- `FloorPlan` (en `src/schemas/floor-plan.ts`) es el contrato central: lo produce la IA, lo edita el editor, lo consume el visor, el cronograma y el presupuesto.
- Etapas en orden fijo: `foundation → columns → beams_slab → walls → roof → finishes`.
- Duración de etapa = metrado ÷ rendimiento (`src/data/yields.ts`). No hardcodear semanas.
- Colores de estado (únicos, en `src/lib/constants.ts`): no iniciado gris, en curso azul, terminado verde, atrasado rojo.
- La respuesta de la IA **siempre** se valida con Zod antes de usarse. Si falla la validación, se reintenta una vez y luego se muestra el error en la UI.
- Los meshes de los GLB demo se nombran `<tipo>_<id>` (ej. `column_C-2`, `wall_M-14`, `slab_L1`, `footing_Z-1`, `roof_T1`), y cada `<id>` existe en el `FloorPlan` del demo. Así el cronograma colorea el GLB igual que el modelo procedural.
- Los proyectos se leen y escriben a través de una sola interfaz, `ProjectRepository` (`src/lib/projects/`). Primero se implementa con localStorage y luego con Supabase, sin cambiar a quienes la usan.

## 8.1 Diseño (Stitch)

- `design/stitch/<pantalla>/screen.png` es la referencia visual y `code.html` sirve para tomar estructura y clases. **No se pega el HTML entero**: se reconstruye con componentes de `components/ui` y de las features.
- Los tokens de color, tipografía, radios y espaciado se definen **una vez** en la configuración de Tailwind a partir de `design/stitch/obrakadabra/DESIGN.md`.
- Iconos: Material Symbols Outlined, igual que en Stitch, a través de un único componente `<Icon name="..." />`.
- Los textos de Stitch con afirmaciones que no podemos respaldar se reemplazan por textos honestos: "CAPECO & RNE Compliant", "Validado por CAPECO", "98.4% precisión", "YOLOv11-BIM", "NTP 399.613" y "© 2025" (se cambia a 2026).

## 9. Git

- Commits pequeños y frecuentes (sirven como evidencia para el hackathon).
- Conventional Commits: `feat(viewer-3d): ...`, `fix(plan-editor): ...`, `refactor: ...`.
- No subir `.env*`, modelos pesados fuera de `public/models/demos/` ni archivos generados.

## 10. Checklist antes de terminar una tarea

- [ ] Busqué duplicados y no creé lógica que ya existía.
- [ ] Cada archivo nuevo está en la capa correcta (sección 5).
- [ ] Archivos ≤ 200 líneas y funciones ≤ 40 líneas.
- [ ] Comentarios solo donde aportan y de una línea.
- [ ] Sin `any`, `console.log`, código comentado ni imports sin usar.
- [ ] `pnpm check` pasa (incluye Playwright de esta fase y de las anteriores).
- [ ] Trabajé en la rama de la fase, no en `main`.
- [ ] Textos de UI en español y código en inglés.
- [ ] La UI respeta `design/stitch/` y los tokens de `DESIGN.md`.