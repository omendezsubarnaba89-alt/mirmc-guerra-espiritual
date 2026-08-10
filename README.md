# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V9

La plataforma combina formación, curso, biblioteca, evaluaciones, expediente, certificado, respaldo/PWA, Cuaderno MIRMC y **sincronización real en Supabase**.

### Formación
- 3 niveles y 15 lecciones navegables.
- Mini evaluación por lección.
- 3 exámenes finales de 10 preguntas; aprobación mínima 80%.
- Gates académicos entre niveles.
- Registro académico y certificado interno imprimible.
- Sala de discernimiento, Armadura de Dios y Guardia de hoy.

### Biblioteca
- 12 recursos escritos iniciales.
- Búsqueda y filtros por categoría/nivel.
- Lector dinámico para cada recurso.

### Cuaderno MIRMC
- `study.html` con búsqueda global en las 15 lecciones y 12 recursos.
- Filtros por tipo y nivel.
- Favoritos personales.
- Notas de hasta 12.000 caracteres por lección o recurso.
- Historial de hasta 30 contenidos recientes.
- Lecciones y recursos incorporan `Cuaderno personal`.
- Notas/favoritos forman parte del respaldo JSON y de la sincronización en nube.

### Cuenta y nube · V9
- Proyecto Supabase dedicado: `eqffbegdezlzzffvmsqk` (`us-east-1`).
- `cloud-config.js` está activado con Project URL + **publishable key**; no contiene claves administrativas.
- `account.html` ofrece acceso por correo/contraseña, perfil y controles de sincronización.
- Google OAuth permanece oculto hasta configurar el proveedor de Google.
- `cloud-sync.js` fusiona progreso local/remoto conservando lecciones completadas, mejores notas, Cuaderno y nombre del certificado.
- `cloud-autosync.js` sincroniza al iniciar sesión, al detectar cambios, recuperar conectividad, volver a la pestaña y en revisiones periódicas.
- `course-progress.js`, `assessment-progress.js` y `study-data.js` cargan autosync cuando corresponde.

### Backend Supabase
- `profiles` — perfil básico del alumno.
- `user_learning_state` — snapshot versionado de progreso/cuaderno.
- RLS activado en ambas tablas.
- Acceso anónimo revocado.
- Políticas `SELECT/INSERT/UPDATE` limitadas a `auth.uid() = user_id`.
- Funciones de trigger endurecidas: no son ejecutables como RPC por `anon` ni `authenticated`.
- Security Advisor verificado sin avisos después del hardening.

### Datos y PWA
- `settings.html` exporta/importa respaldo local.
- `sw.js` mantiene caché del shell esencial y utiliza network-first para HTML/CSS/JS.
- `manifest.webmanifest` mantiene la app preparada para modo standalone.

## Archivos principales

### Curso
`course-data.js`, `course-progress.js`, `course-enhancements.js`, `course-index.css`, `lesson.html`, `lesson.css`, `lesson.js`

### Evaluación
`assessment-data.js`, `assessment-progress.js`, `assessment.html`, `assessment.css`, `assessment.js`, `academic.html`, `certificate.html`

### Biblioteca
`resource-data.js`, `library.html`, `library.css`, `library.js`, `resource.html`, `resource.js`

### Cuaderno
`study.html`, `study.css`, `study.js`, `study-data.js`, `study-tools.js`, `study-tools.css`

### Cuenta y nube
`account.html`, `account.css`, `account.js`, `cloud-config.js`, `cloud-client.js`, `cloud-sync.js`, `cloud-autosync.js`

### Backend
`supabase/migrations/20260810143000_init_mirmc_cloud.sql`
`supabase/migrations/20260810200500_harden_trigger_functions.sql`
`supabase/README.md`

### Calidad
GitHub Actions valida sitio, curso, biblioteca, evaluaciones, respaldo/offline, nube/RLS/autosync y Cuaderno en cada push.

## Seguridad

La clave que vive en el frontend es una **Supabase publishable key**, diseñada para aplicaciones públicas. La autorización de datos depende de RLS. No se almacena `service_role`, `sb_secret_...`, contraseña de base de datos ni secreto administrativo en GitHub.

## Configuración Auth pendiente en Dashboard

Para confirmaciones por correo y futuros OAuth, el Dashboard de Supabase debe usar como Site URL:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/`

Y debe permitir como Redirect URL:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/**`

El conector actual de Supabase no expone la acción de modificar URL Configuration; es el único ajuste de Auth que requiere Dashboard.

## Próximas etapas
1. Configurar Site URL/Redirect URL y probar alta real por correo en el teléfono.
2. Configurar Google OAuth cuando existan Client ID/Client Secret.
3. Crear roles de alumno/administrador y panel administrativo.
4. Añadir multimedia real: PDFs, audios y videos.
5. Verificación remota de certificados.
6. Custom SMTP antes de un lanzamiento público de usuarios.

## Publicación

GitHub Pages publica desde `main` y `/ (root)`.
