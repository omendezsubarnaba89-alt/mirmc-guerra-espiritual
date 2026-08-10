# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V5

La plataforma ya combina centro de entrenamiento, curso navegable, biblioteca real, evaluaciones finales, registro académico local y certificado interno de finalización.

### Experiencia principal

- Portada cinematográfica responsive y navegación sticky.
- Identidad MIRMC propia con escudo SVG.
- Fundamento doctrinal, Sala de discernimiento y Armadura de Dios interactiva.
- **Guardia de hoy** con siete entrenamientos rotativos y progreso local.
- Ruta MIRMC con **3 niveles y 15 lecciones navegables**.
- Progreso total y por nivel guardado en el navegador.
- Mini evaluación de 3 preguntas por lección; se requieren al menos dos respuestas correctas para completarla.
- Estados `ABRIR`, `BLOQUEADA`, `EXAMEN PENDIENTE` y `COMPLETADA`.
- Botón inteligente `Comenzar/Continuar ruta` que también detecta cierres académicos pendientes.

### Evaluaciones finales

- Tres evaluaciones finales, una por nivel.
- 10 preguntas por evaluación.
- Umbral de aprobación: 80%.
- Se conserva mejor nota, intentos y fecha de aprobación.
- Nivel 2 exige examen aprobado del Nivel 1.
- Nivel 3 exige examen aprobado del Nivel 2.
- Las lecciones 05, 10 y 15 llevan directamente al cierre del nivel.

### Registro académico

- Página `academic.html` con progreso general, 15 lecciones, 3 exámenes y promedio.
- Estado independiente para cada nivel.
- Acceso desde la Ruta MIRMC del home.
- Todo permanece local al navegador en esta etapa.

### Certificado

- Página `certificate.html`.
- Solo se habilita con 15/15 lecciones y los tres exámenes aprobados.
- Nombre editable localmente.
- Promedio, fecha y código de registro local.
- Diseño preparado para imprimir o guardar como PDF desde el navegador.
- Es un certificado interno MIRMC de finalización; no representa acreditación académica oficial.

### Biblioteca MIRMC

- Página independiente `library.html`.
- 12 recursos escritos iniciales.
- Búsqueda instantánea y filtros por categoría/nivel.
- Lector dinámico `resource.html?id=...`.
- Categorías: Formación, Guías prácticas, Casos y escenarios, Liderazgo, Preguntas y respuestas y Devocional.

## Estructura

### Sitio principal
- `index.html` — experiencia principal.
- `styles.css` — sistema visual responsive.
- `script.js` — portada, menú, armadura, discernimiento, Guardia y efectos.
- `mobile-fixes.css` — hardening móvil basado en pruebas reales Android.
- `assets/mirmc-shield.svg` — identidad visual.

### Motor del curso
- `course-data.js` — 3 niveles y 15 lecciones.
- `course-progress.js` — progreso, desbloqueos, gates académicos y estadísticas.
- `course-enhancements.js` — integración del curso, evaluaciones y Biblioteca en el home.
- `course-index.css` — componentes de progreso y cierres del home.
- `lesson.html` / `lesson.css` / `lesson.js` — experiencia de lección.

### Evaluación y expediente
- `assessment-data.js` — 30 preguntas finales.
- `assessment-progress.js` — intentos, mejores notas y aprobaciones.
- `assessment.html` / `assessment.css` / `assessment.js` — experiencia de examen.
- `academic.html` / `academic.css` / `academic.js` — expediente académico local.
- `certificate.html` / `certificate.css` / `certificate.js` — certificado imprimible.

### Biblioteca
- `resource-data.js` — categorías y recursos estructurados.
- `library.html` / `library.css` / `library.js` — búsqueda, filtros y catálogo.
- `resource.html` / `resource.js` — lector dinámico.

### Calidad y publicación
- `scripts/validate.mjs` — referencias estáticas y estructura principal.
- `scripts/validate-course.mjs` — curso y quizzes de lección.
- `scripts/validate-library.mjs` — recursos y Biblioteca.
- `scripts/validate-academic.mjs` — 3 exámenes, 30 preguntas, gates, expediente y certificado.
- `.github/workflows/validate.yml` — validación automática.
- `.github/workflows/integrate-course.yml` — integra assets del curso en `index.html`.
- `.github/workflows/apply-mobile-fixes.yml` — aplica hardening móvil.
- `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `.nojekyll` — publicación e indexación.

## Arquitectura actual

La aplicación sigue siendo **100% estática** y no depende de Supabase, bases de datos, servidores propios ni créditos de IA. Guardia, curso, evaluaciones, expediente y nombre del certificado usan `localStorage`, por lo que pertenecen al navegador del dispositivo actual.

El contenido, el progreso, las evaluaciones y la presentación están separados. Esto deja el proyecto preparado para sustituir almacenamiento local por persistencia remota cuando incorporemos autenticación y backend, sin reconstruir las lecciones ni la Biblioteca.

## Próximas etapas previstas

1. Perfil de alumno y sincronización de progreso con backend.
2. Copia de seguridad/exportación del progreso antes del backend.
3. Panel administrativo para publicar y editar lecciones/recursos.
4. Recursos multimedia reales: PDFs, audios y videos cuando sean cargados.
5. PWA/offline mejorado.
6. Validación/verificación remota de certificados cuando exista backend.

## Publicación

GitHub Pages está configurado desde `main` y `/ (root)`. Cada cambio aprobado que llega a `main` se publica automáticamente.
