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
- `admin` puede guardar borradores.
- Solo `super_admin` puede publicar, retirar, archivar o restaurar contenido.
- `content_audit_log` no es accesible directamente desde el navegador.

## Flujo editorial

1. Abrir `admin-content.html`.
2. Seleccionar una de las 15 lecciones o un recurso de Biblioteca.
3. Editar título, nivel, duración, base bíblica, secciones y campos propios del tipo.
4. Guardar borrador.
5. Abrir `admin-preview.html` para revisar el borrador con sesión administrativa.
6. Publicar (Super Admin).
7. El frontend consume la versión publicada desde Supabase sin redeploy.
8. Retirar publicación devuelve inmediatamente el contenido al fallback de GitHub.

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

El historial puede consultarse desde `admin-content-audit.html` por Super Admin.

## Prueba de seguridad ejecutada

El 10 de agosto de 2026 se creó temporalmente un override de prueba solo como borrador.

- Base: borrador presente, publicación ausente.
- Consulta bajo rol `anon`: 0 filas visibles.
- El registro temporal fue eliminado después de la prueba.
- No se modificó ningún contenido público.

## Archivos principales

- `admin-content.html`
- `admin-content.css`
- `admin-content.js`
- `admin-preview.html`
- `admin-preview.js`
- `admin-content-audit.html`
- `admin-content-audit.js`
- `content-runtime.js`
- `supabase/functions/content-management/index.ts`
- `supabase/migrations/20260810211602_add_content_management_core.sql`
- `scripts/validate-content.mjs`
- `.github/workflows/validate-content.yml`
