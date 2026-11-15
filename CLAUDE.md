# CLAUDE.md — ObraKadabra

@AGENTS.md

> Todas las reglas del proyecto viven en `AGENTS.md` (importado arriba). Aquí van solo instrucciones específicas para Claude. No dupliques reglas de `AGENTS.md` en este archivo.

## Cómo trabajar en este repo

- **Antes de escribir código**, busca con Grep/Glob si ya existe algo que haga lo mismo (AGENTS.md §5). Menciona en tu respuesta lo que reutilizaste.
- **Planifica primero** las tareas que toquen 3 o más archivos: lista los archivos que vas a crear o modificar y en qué capa van, y luego ejecuta.
- Prefiere **editar** archivos existentes antes que crear nuevos.
- Si una tarea pide algo que contradice `AGENTS.md`, avísalo antes de hacerlo.

## Revisión de código

Cuando se te pida revisar código (o al terminar una feature), reporta en este orden:
1. **Duplicados**: funciones, componentes, tipos o constantes repetidas, con su ruta y su propuesta de unificación.
2. **Capa incorrecta**: lógica en `app/`, cálculos dentro de componentes, imports cruzados entre features.
3. **Tamaño**: archivos de más de 200 líneas o funciones de más de 40.
4. **Comentarios**: obvios, multilínea o código comentado.
5. **Tipos**: `any` o tipos que no salen de `schemas/`.

Corrige lo que sea claro y deja indicado lo que requiera una decisión.

## Al terminar

- Ejecuta `pnpm check` (AGENTS.md §3) y arregla lo que falle. Si falla Playwright, abre la traza (`pnpm exec playwright show-trace`) o la captura antes de cambiar código.
- Confirma que estás en la rama de la fase (`git branch --show-current`) antes del primer commit.
- Resume en 2 o 3 líneas qué cambió y si unificaste algún duplicado.
- Propón un mensaje de commit con Conventional Commits.