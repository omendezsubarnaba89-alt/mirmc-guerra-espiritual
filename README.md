# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V8

La plataforma combina formación, curso, biblioteca, evaluaciones, expediente, certificado, respaldo/PWA, arquitectura de cuentas en nube y ahora un **Cuaderno MIRMC** para búsqueda, favoritos, notas y actividad reciente.

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

### V8 · Cuaderno MIRMC
- Nueva página `study.html`.
- Búsqueda global sobre las 15 lecciones y los 12 recursos.
- Filtros por tipo y nivel.
- Favoritos personales.
- Notas de hasta 12.000 caracteres por lección o recurso.
- Historial de hasta 30 contenidos recientes.
- Lecciones y recursos incorporan una tarjeta `Cuaderno personal`.
- Acceso `Cuaderno` desde la Ruta MIRMC del home.
- Notas/favoritos forman parte del respaldo JSON.
- `cloud-sync.js` ya incluye Cuaderno en la futura sincronización.
- El service worker cachea también la experiencia del Cuaderno.

### Cuenta y nube · V7
- `account.html` preparado para correo/contraseña y Google OAuth.
- `cloud-config.js` permanece deshabilitado hasta disponer de un proyecto Supabase real.
- `cloud-client.js` carga Supabase solo cuando se activa la nube.
- `cloud-sync.js` fusiona progreso local/remoto conservando avances y mejores notas.
- Migración Supabase con `profiles`, `user_learning_state` y RLS por usuario en `supabase/migrations/20260810143000_init_mirmc_cloud.sql`.
- Ninguna `service_role` pertenece al frontend.

### Datos y PWA
- `settings.html` exporta/importa respaldo local.
- `sw.js` ofrece caché del shell esencial.
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

### Cuenta y datos
`account.html`, `account.css`, `account.js`, `cloud-config.js`, `cloud-client.js`, `cloud-sync.js`, `settings.html`, `settings.js`, `sw.js`

### Backend preparado
`supabase/migrations/20260810143000_init_mirmc_cloud.sql`, `supabase/README.md`

### Calidad
GitHub Actions valida sitio, curso, biblioteca, evaluaciones, respaldo/offline, nube/RLS y Cuaderno en cada push.

## Arquitectura actual

Mientras `cloud-config.js` tenga `enabled:false`, toda la aplicación sigue funcionando con almacenamiento local y respaldo JSON. La ausencia de Supabase no bloquea ninguna función local.

Cuando se cree el proyecto Supabase, se aplicará la migración y se configurarán únicamente Project URL + publishable key. El contenido y el progreso ya están desacoplados para evitar reconstrucciones.

## Próximas etapas
1. Activar Supabase y probar sincronización real en dos dispositivos.
2. Panel administrativo seguro una vez existan roles/backend.
3. Multimedia real: PDFs, audios y videos.
4. Verificación remota de certificados.
5. Refinamiento PWA con iconos PNG dedicados y pruebas offline reales.

## Publicación

GitHub Pages publica desde `main` y `/ (root)`.
