# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V11

La plataforma ya combina formación, curso secuencial, biblioteca, evaluaciones, expediente, certificado, PWA, Cuaderno MIRMC, cuentas reales, sincronización entre dispositivos, roles administrativos y **gestión editorial desde Supabase con borradores, publicación, preview, auditoría, versiones y rollback**.

### Formación
- 3 niveles y 15 lecciones navegables.
- Mini evaluación por lección.
- 3 exámenes finales de 10 preguntas; aprobación mínima 80%.
- Gates académicos entre niveles.
- Registro académico y certificado interno imprimible.
- Sala de discernimiento, Armadura de Dios y Guardia de hoy.
- La Ruta MIRMC del home se hidrata con títulos/subtítulos publicados desde el CMS.

### Biblioteca
- 12 recursos escritos estáticos iniciales.
- Búsqueda y filtros por categoría/nivel.
- Lector dinámico para cada recurso.
- El CMS puede editar recursos existentes y crear recursos nuevos sin redeploy.

### Cuaderno MIRMC
- `study.html` con búsqueda global en lecciones y recursos.
- Filtros por tipo y nivel.
- Favoritos personales.
- Notas de hasta 12.000 caracteres por lección o recurso.
- Historial de hasta 30 contenidos recientes.
- Notas/favoritos forman parte del respaldo JSON y de la sincronización en nube.
- El índice usa también las versiones publicadas desde Supabase.

### Cuenta y nube
- Proyecto Supabase dedicado: `eqffbegdezlzzffvmsqk` (`us-east-1`).
- `cloud-config.js` usa Project URL + **publishable key**; no contiene claves administrativas.
- Registro y acceso por correo/contraseña verificados de punta a punta.
- Confirmación de correo, sesión, perfil automático y primera sincronización real comprobados.
- Google OAuth permanece oculto hasta configurar el proveedor.
- `cloud-sync.js` fusiona progreso local/remoto.
- `cloud-autosync.js` sincroniza al iniciar sesión, detectar cambios, recuperar conectividad y volver a la pestaña.

### Roles y Administración · V10+
- Roles: `student`, `admin`, `super_admin`.
- Nuevos usuarios reciben `student` por defecto.
- Panel `admin.html` protegido por sesión y autorización de servidor.
- `admin-management` es una Edge Function con JWT obligatorio.
- `service_role` se utiliza únicamente dentro de Edge Functions.
- Expediente académico por alumno sin exponer notas privadas del Cuaderno.
- Bitácora de cambios de roles/estado.

### Gestión de contenido · V11
- `content_items` separa `draft_payload` de `published_payload`.
- El navegador público puede leer únicamente columnas publicables; `draft_payload` no tiene SELECT para `anon` ni `authenticated`.
- RLS limita la lectura pública a elementos publicados y no archivados.
- `content-management` maneja escrituras editoriales con JWT + roles.
- `admin` puede crear/editar borradores.
- Solo `super_admin` puede publicar, retirar, archivar, restaurar y ejecutar rollback.
- Vista previa privada de borradores antes de publicar.
- Historial editorial de borradores/publicaciones/retiros/archivos/rollback.
- Cada publicación crea snapshot inmutable en `content_versions`.
- Rollback publica el snapshot seleccionado como una **versión nueva**; no reescribe el historial.
- GitHub sigue siendo fallback: si Supabase falla o no hay override publicado, se usa el contenido estático.
- Lecciones, Biblioteca, lector, Cuaderno y filas de la Ruta MIRMC consumen overrides publicados.

### Seguridad comprobada
- RLS activo en tablas sensibles.
- Acceso directo del navegador revocado para borradores, auditorías y versiones.
- Prueba real: un borrador temporal fue invisible bajo rol `anon` y luego eliminado.
- `content_versions` devuelve privilegio SELECT = false para `anon` y `authenticated`.
- Security Advisor posterior a V11 solo mantiene el aviso de **Leaked Password Protection Disabled**, que debe activarse en Dashboard de Auth.

### PWA y resiliencia
- `sw.js` usa caché versionada y network-first para HTML/CSS/JS.
- El shell incluye cuenta, administración, CMS, preview, historial editorial y versiones.
- `manifest.webmanifest` mantiene la aplicación preparada para modo standalone.

## Archivos principales

### Curso
`course-data.js`, `course-progress.js`, `course-enhancements.js`, `course-index.css`, `lesson.html`, `lesson.css`, `lesson.js`

### Biblioteca y Cuaderno
`resource-data.js`, `library.html`, `library.js`, `resource.html`, `resource.js`, `study.html`, `study.js`, `study-data.js`, `study-tools.js`

### Cuenta y nube
`account.html`, `account.js`, `cloud-config.js`, `cloud-client.js`, `cloud-sync.js`, `cloud-autosync.js`

### Administración
`admin.html`, `admin.js`, `admin-user.html`, `admin-audit.html`, `admin-enhancements.js`

### CMS V11
`admin-content.html`, `admin-content.js`, `admin-content-restore.js`, `admin-preview.html`, `admin-content-audit.html`, `admin-versions.html`, `content-runtime.js`

### Backend Supabase
`supabase/functions/admin-management/index.ts`
`supabase/functions/content-management/index.ts`
`supabase/migrations/`
`supabase/README.md`

### Calidad
GitHub Actions valida sitio, curso, biblioteca, evaluaciones, respaldo/offline, nube/RLS/autosync, Cuaderno, administración y arquitectura V11 en cada push. `validate-content.mjs` también impide que secretos administrativos entren en archivos del navegador.

## Auth configurado

Site URL:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/`

Redirect permitido:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/**`

Pendientes opcionales/de producción:
- Activar Leaked Password Protection en Supabase Auth.
- Google OAuth cuando existan Client ID/Client Secret.
- Custom SMTP antes de un lanzamiento de mayor volumen.

## Publicación

GitHub Pages publica desde `main` y `/ (root)`. El CMS no necesita redeploy para cambios editoriales publicados porque `content-runtime.js` consulta Supabase y conserva GitHub como fallback.
