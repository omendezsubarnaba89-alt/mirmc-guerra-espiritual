# V11 · Gestión de contenido

## Objetivo

Permitir que MIRMC Guerra Espiritual edite y publique contenido desde Administración sin modificar GitHub para cada cambio editorial, manteniendo los archivos estáticos como respaldo operativo.

## Modelo híbrido

- `course-data.js` y `resource-data.js` siguen siendo la base/fallback.
- `public.content_items` almacena borradores y versiones publicadas en Supabase.
- `content-runtime.js` consulta únicamente contenido publicado y mezcla los overrides antes de renderizar lecciones, Biblioteca, recursos y Cuaderno.
- Si Supabase no responde, el frontend continúa con los archivos de GitHub (`static-fallback`).

## Seguridad

- `draft_payload` nunca tiene permiso SELECT para `anon` ni `authenticated`.
- `published_payload` sí puede leerse, pero RLS permite solamente filas publicadas y no archivadas.
- El navegador no contiene `service_role` ni secretos administrativos.
- Escrituras editoriales pasan por Edge Function `content-management` con `verify_jwt=true`.
- `admin` puede guardar borradores y consultar historial de versiones.
- Solo `super_admin` puede publicar, retirar, archivar, restaurar o ejecutar rollback.
- `content_audit_log` y `content_versions` no son accesibles directamente desde el navegador.

## Flujo editorial

1. Abrir `admin-content.html`.
2. Seleccionar una de las 15 lecciones o un recurso de Biblioteca.
3. Editar título, nivel, duración, base bíblica, secciones y campos propios del tipo.
4. Guardar borrador.
5. Abrir `admin-preview.html` para revisar el borrador con sesión administrativa.
6. Publicar (Super Admin).
7. El frontend consume la versión publicada desde Supabase sin redeploy.
8. Cada publicación crea una versión inmutable en `content_versions`.
9. `admin-versions.html` permite consultar versiones y, para Super Admin, restaurar una anterior.
10. El rollback genera una versión NUEVA a partir de la versión histórica seleccionada; nunca reescribe o elimina el historial existente.
11. Retirar publicación devuelve inmediatamente el contenido al fallback de GitHub.

## Nuevos recursos

El gestor permite crear recursos nuevos con un slug estable (`guia-de-oracion`, por ejemplo). Al publicarlos, `content-runtime.js` los incorpora a `MIRMC_LIBRARY.resources`, por lo que aparecen en Biblioteca, lector y búsqueda del Cuaderno.

La creación de nuevas lecciones fuera de 01–15 no está habilitada todavía porque la Ruta MIRMC y sus gates académicos son secuenciales y deben migrarse conjuntamente para no romper el progreso existente.

## Auditoría

`content_audit_log` registra:

- `save_draft`
- `publish`
- `unpublish`
- `archive`
- `restore`
- `rollback`

El historial puede consultarse desde `admin-content-audit.html` por Super Admin.

## Versiones

`content_versions` almacena snapshots inmutables de cada publicación. `content_items.current_version` señala la versión pública actual. La Edge Function calcula números de versión de forma incremental y el rollback publica el snapshot elegido como una nueva versión.

## Prueba de seguridad ejecutada

El 10 de agosto de 2026 se creó temporalmente un override de prueba solo como borrador.

- Base: borrador presente, publicación ausente.
- Consulta bajo rol `anon`: 0 filas visibles.
- El registro temporal fue eliminado después de la prueba.
- No se modificó ningún contenido público.

## Migraciones de producción

- `20260810211602_add_content_management_core.sql`
- `20260810211630_optimize_content_public_read_policy.sql`
- `20260810212343_index_content_foreign_keys.sql`
- `20260810213039_add_content_version_history.sql`

## Archivos principales

- `admin-content.html`
- `admin-content.css`
- `admin-content.js`
- `admin-preview.html`
- `admin-preview.js`
- `admin-content-audit.html`
- `admin-content-audit.js`
- `admin-versions.html`
- `admin-versions.css`
- `admin-versions.js`
- `content-runtime.js`
- `supabase/functions/content-management/index.ts`
- `scripts/validate-content.mjs`
- `.github/workflows/validate-content.yml`
