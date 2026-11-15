# Prompt F0 — Setup del proyecto

```
Lee AGENTS.md y CLAUDE.md antes de empezar. Esta es la FASE 0 de docs/PLAN.md.

RAMA
Crea y trabaja en la rama `fase/0-setup` desde `main` (si el repo está vacío,
crea `main` con un commit inicial que contenga AGENTS.md, CLAUDE.md y docs/).

OBJETIVO
Dejar la base del proyecto lista para que todas las fases siguientes solo
agreguen features.

TAREAS
1. Next.js (App Router) + TypeScript estricto + pnpm + ESLint + Tailwind.
2. Copia el contenido del zip de Stitch a `design/stitch/` (sin modificarlo).
3. Tokens: traduce el frontmatter de `design/stitch/obrakadabra/DESIGN.md`
   (colors, typography, rounded, spacing) a la configuración de Tailwind UNA
   sola vez. Añade los tokens extra del texto: estados (#1E9E5A, #E8A317,
   #D64545, #9AA0A6), indigo IA (#6366F1, #4F46E5), viewport (#16181D) y
   canvas (#F6F5F2). Fuentes Space Grotesk, Inter y JetBrains Mono con next/font.
4. Componente único `<Icon name>` con Material Symbols Outlined.
5. Shell de la app tomado de cualquier pantalla de Stitch: header con logo
   "ObraKadabra", navegación (Inicio, Subir Plano, Editor 2D, Espacio 4D/5D,
   Registrar Avance), indicador "En línea / Guardado", botones "Registrar
   avance" y "Compartir", y footer con "© 2026". Sin afirmaciones falsas
   (ver AGENTS.md §8.1).
6. Rutas vacías con un título que solo sirve de placeholder: `/`, `/subir`,
   `/proyecto/[id]`, `/proyecto/[id]/editor`, `/proyecto/[id]/avance`,
   `/compartir/[id]`.
7. Componentes base en `src/components/ui`: Button (primary, milestone,
   ai, ghost), Badge (estados), Card, Tabs, Stepper, KpiCard. Úsalos solo si
   la pantalla los necesita; no crees variantes que nadie usa.
8. Vitest configurado y un test de ejemplo para una función de `lib/`.
9. Playwright: proyectos `desktop` (1440×900) y `mobile` (390×844), webServer
   con `pnpm dev`, Chromium con `--use-gl=swiftshader`, traza y captura al
   fallar.
10. Scripts de AGENTS.md §3, incluido `pnpm check`.
11. GitHub Actions: en cada PR corre lint, typecheck, Vitest y Playwright
    (con `playwright install --with-deps chromium`) y sube el reporte como
    artifact.
12. `.env.example` con AI_API_KEY, AI_MODEL, NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY (sin valores).

PRUEBAS PLAYWRIGHT (e2e/f0-shell.spec.ts)
- La home carga y muestra el header con "ObraKadabra".
- Cada link de navegación lleva a su ruta y queda marcado como activo
  (aria-current="page").
- En mobile la navegación sigue siendo accesible (menú o barra inferior).
- El footer dice 2026 y no contiene "Compliant" ni "Validado por CAPECO".

PERMISOS
Tienes autorización para instalar dependencias, instalar navegadores de
Playwright, ejecutar las pruebas y corregir el código hasta que `pnpm check`
pase. No desactives ni saltes pruebas.

CIERRE
- `pnpm check` en verde.
- Commits pequeños con Conventional Commits.
- Push de `fase/0-setup` y PR a `main` con: resumen, captura del shell en
  desktop y mobile, y resultado de las pruebas.
```
