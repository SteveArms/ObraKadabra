# Prompt F7 — Persistencia, vista compartida y deploy

```
Lee AGENTS.md y CLAUDE.md. Esta es la FASE 7 de docs/PLAN.md.

RAMA
`git checkout main && git pull && git checkout -b fase/7-persistencia-compartir-deploy`

OBJETIVO
App desplegada, con datos persistentes y un link público para la familia
(Best Deployed App). Referencia:
`design/stitch/vista_compartida_para_clientes_y_familia_obrakadabra/`.

TAREAS — PERSISTENCIA
1. Migraciones de Supabase en `supabase/migrations/`: tablas projects
   (FloorPlan como jsonb, estado, share_token), progress_entries y photos,
   y un bucket de Storage para planos y fotos. RLS: el dueño escribe y la
   lectura pública solo vía share_token, a través de una función o vista.
2. `SupabaseProjectRepository` que implementa la MISMA interfaz
   ProjectRepository. Se elige la implementación por env (si no hay
   Supabase, se usa localStorage). Ningún componente cambia.
3. Autenticación mínima: sesión anónima de Supabase para no frenar el
   demo, con la opción de vincular un email después.
4. Mueve las fotos de F6 y la imagen del plano a Storage con la misma
   interfaz de fotos.

TAREAS — VISTA COMPARTIDA (mobile-first)
5. "Compartir" en el header abre un modal que genera o recupera el
   share_token, con los botones "Copiar enlace" y "Compartir por
   WhatsApp".
6. `/compartir/[token]`, solo lectura y sin tecnicismos: título "Nuestra
   futura casa", avance global (%), mensaje amigable según el estado,
   barra de inicio → hoy → casa lista, tarjetas (etapa actual, tiempo
   para mudarse, inversión realizada, próxima gran fiesta = el siguiente
   hito como el techado), el visor 3D reutilizado en modo solo lectura
   con el slider y la última foto aprobada.
   Sin herramientas de edición ni botones de registrar. Metadatos Open
   Graph para que el link se vea bien en WhatsApp.
7. Token inválido → página 404 amigable.

TAREAS — DEPLOY
8. Proyecto en Vercel conectado al repo: Preview por PR y Production en
   `main`. Variables de entorno documentadas en README y .env.example.
9. CI: después del deploy de preview, corre Playwright contra la URL de
   preview (PLAYWRIGHT_BASE_URL) con el subconjunto @smoke.
10. Los 2 demos deben funcionar en producción sin iniciar sesión.

PRUEBAS
- Vitest: SupabaseProjectRepository contra un cliente mockeado, que cumpla
  los mismos tests de contrato que la versión localStorage (comparte la
  suite, no la copies).
- Playwright e2e/f7-compartir.spec.ts:
  · Generar el link desde el proyecto → abrirlo en un contexto nuevo sin
    sesión → se ve "Nuestra futura casa" y el % de avance.
  · En la vista compartida no existen botones de edición ni "Registrar
    avance".
  · El slider funciona en modo solo lectura.
  · Un token inválido muestra el 404 amigable.
  · Mobile como proyecto principal de esta spec.
  · Marca @smoke: abrir la home, abrir el demo y mover el slider.

PERMISOS
Tienes autorización para ejecutar las pruebas e iterar hasta que
`pnpm check` pase. Para Supabase y Vercel, si faltan credenciales,
prepara todo y deja instrucciones exactas en el PR en lugar de inventar
valores. No desactives pruebas.

CIERRE
`pnpm check` en verde → push → PR con la URL de preview y una captura
móvil de la vista compartida.
```
