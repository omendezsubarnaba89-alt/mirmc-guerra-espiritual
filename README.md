# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V7

La plataforma ya incluye centro de entrenamiento, curso navegable, biblioteca, evaluaciones finales, expediente académico, certificado, respaldo local, PWA/offline y una capa completa de **cuenta + sincronización preparada para Supabase**.

### Formación

- Portada responsive y navegación móvil.
- Sala de discernimiento y Armadura de Dios interactiva.
- Guardia de hoy con progreso local.
- Ruta MIRMC de 3 niveles y 15 lecciones.
- Mini evaluación por lección.
- 3 exámenes finales de 10 preguntas; aprobación mínima 80%.
- Gates académicos: Nivel 2 exige examen del Nivel 1; Nivel 3 exige examen del Nivel 2.
- Registro académico local y certificado interno imprimible.

### Biblioteca

- `library.html` con búsqueda y filtros.
- 12 recursos escritos iniciales.
- Lector dinámico `resource.html?id=...`.
- Categorías de formación, estudio, casos, liderazgo, repaso y devocional.

### Datos locales y PWA

- `settings.html` permite exportar/importar respaldo JSON.
- Restablecimiento deliberado de datos locales.
- `sw.js` cachea el shell esencial para experiencia offline selectiva.
- `manifest.webmanifest` mantiene la app en modo standalone cuando el navegador permite instalación.

### V7 · Cuenta y nube

- Nueva página `account.html`.
- Modo local y modo nube diferenciados visualmente.
- Acceso por correo/contraseña preparado.
- OAuth con Google preparado mediante Supabase Auth.
- Perfil de alumno con nombre visible.
- Sincronización inteligente que combina progreso local/remoto.
- Controles manuales para subir el estado del dispositivo o restaurar la copia remota.
- `cloud-config.js` permanece `enabled:false` hasta disponer de un proyecto Supabase real.
- `cloud-client.js` carga el cliente Supabase solo cuando la nube está configurada.
- `cloud-sync.js` conserva lecciones completadas y mejores notas al fusionar dispositivos.

### Backend preparado

`supabase/migrations/20260810143000_init_mirmc_cloud.sql` crea:

- `public.profiles`;
- `public.user_learning_state`;
- RLS en ambas tablas;
- políticas `authenticated` limitadas a `auth.uid() = user_id`;
- trigger para crear perfil al registrarse;
- timestamps automáticos.

El navegador **nunca necesita una service role**. Solo se configurarán Project URL + publishable key cuando exista el backend. Consulta `supabase/README.md` para el runbook de activación.

## Estructura principal

### Curso
- `course-data.js`, `course-progress.js`, `course-enhancements.js`, `course-index.css`
- `lesson.html`, `lesson.css`, `lesson.js`

### Evaluaciones y expediente
- `assessment-data.js`, `assessment-progress.js`
- `assessment.html`, `assessment.css`, `assessment.js`
- `academic.html`, `academic.css`, `academic.js`
- `certificate.html`, `certificate.css`, `certificate.js`

### Biblioteca
- `resource-data.js`
- `library.html`, `library.css`, `library.js`
- `resource.html`, `resource.js`

### Cuenta, datos y nube
- `settings.html`, `settings.css`, `settings.js`
- `account.html`, `account.css`, `account.js`
- `cloud-config.js`, `cloud-client.js`, `cloud-sync.js`
- `supabase/migrations/20260810143000_init_mirmc_cloud.sql`

### Calidad
- `scripts/validate.mjs`
- `scripts/validate-course.mjs`
- `scripts/validate-library.mjs`
- `scripts/validate-academic.mjs`
- `scripts/validate-local-data.mjs`
- `scripts/validate-cloud.mjs`
- `.github/workflows/validate.yml`

## Arquitectura actual

Mientras `cloud-config.js` siga desactivado, todo continúa funcionando con `localStorage` y respaldo JSON. Nada de la experiencia existente depende de que Supabase esté disponible.

Cuando se active la nube, el mismo progreso se puede fusionar con la fila privada del usuario. Esto evita reconstruir curso, evaluaciones o certificado durante la migración a cuentas reales.

## Próximas etapas

1. Activar un proyecto Supabase y ejecutar la migración V7.
2. Probar registro, Google OAuth y sincronización entre dos dispositivos reales.
3. Añadir cuaderno de estudio, favoritos y búsqueda global.
4. Panel administrativo seguro para contenidos cuando existan roles/backend.
5. Multimedia real: PDFs, audios y videos.
6. Verificación remota de certificados.

## Publicación

GitHub Pages publica desde `main` y `/ (root)`. Los cambios que llegan a `main` se reflejan automáticamente en el sitio.
