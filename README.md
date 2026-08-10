# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V6

La plataforma combina centro de entrenamiento, curso navegable, biblioteca real, evaluaciones finales, registro académico, certificado interno, respaldo de progreso y una primera capa offline/PWA.

### Experiencia principal

- Portada cinematográfica responsive y navegación sticky.
- Identidad MIRMC propia con escudo SVG.
- Fundamento doctrinal, Sala de discernimiento y Armadura de Dios interactiva.
- **Guardia de hoy** con siete entrenamientos rotativos y progreso local.
- Ruta MIRMC con **3 niveles y 15 lecciones navegables**.
- Mini evaluación de 3 preguntas por lección.
- Estados `ABRIR`, `BLOQUEADA`, `EXAMEN PENDIENTE` y `COMPLETADA`.
- Botón inteligente que detecta la próxima lección o evaluación pendiente.

### Evaluaciones finales

- Tres evaluaciones finales, una por nivel.
- 10 preguntas por evaluación.
- Umbral de aprobación: 80%.
- Mejor nota, intentos y fecha de aprobación persistidos localmente.
- Nivel 2 exige examen aprobado del Nivel 1.
- Nivel 3 exige examen aprobado del Nivel 2.
- Las lecciones 05, 10 y 15 conducen a sus cierres académicos.

### Registro académico y certificado

- `academic.html` reúne progreso, 15 lecciones, 3 exámenes y promedio.
- `certificate.html` se habilita con 15/15 lecciones y tres exámenes aprobados.
- El certificado permite nombre local, promedio, fecha, código de registro e impresión/guardado como PDF.
- Es un certificado interno MIRMC de finalización; no representa acreditación académica oficial.

### Biblioteca MIRMC

- `library.html` con 12 recursos escritos iniciales.
- Búsqueda instantánea y filtros por categoría/nivel.
- Lector dinámico `resource.html?id=...`.
- Categorías: Formación, Guías prácticas, Casos y escenarios, Liderazgo, Preguntas y respuestas y Devocional.

### V6 · Mis datos y modo offline

- Nueva página `settings.html` accesible desde la Ruta MIRMC.
- Exportación de Guardia, curso, evaluaciones y nombre del certificado a un respaldo JSON.
- Importación/restauración con validación básica del esquema.
- Restablecimiento explícito de datos locales con confirmación.
- `sw.js` crea una caché del shell esencial: home, lecciones, Biblioteca, evaluaciones, expediente, certificado y configuración.
- El home registra automáticamente el service worker.
- `manifest.webmanifest` mantiene la aplicación preparada para experiencia standalone; cuando el navegador ofrezca instalación, la pantalla Mis datos puede activar el prompt.

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
- `course-enhancements.js` — curso, exámenes, Biblioteca, expediente, respaldo y registro del service worker desde el home.
- `course-index.css` — progreso, cierres y utilidades del home.
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

### Datos locales y PWA
- `settings.html` / `settings.css` / `settings.js` — respaldo, restauración, limpieza e instalación.
- `sw.js` — caché y estrategia offline.
- `manifest.webmanifest` — metadatos de aplicación standalone.

### Calidad y publicación
- `scripts/validate.mjs` — referencias estáticas y estructura principal.
- `scripts/validate-course.mjs` — curso y quizzes de lección.
- `scripts/validate-library.mjs` — recursos y Biblioteca.
- `scripts/validate-academic.mjs` — 3 exámenes, 30 preguntas, gates, expediente y certificado.
- `scripts/validate-local-data.mjs` — respaldo, manifest y referencias del service worker.
- `.github/workflows/validate.yml` — validación automática.
- `.github/workflows/integrate-course.yml` — integra assets del curso en `index.html`.
- `.github/workflows/apply-mobile-fixes.yml` — aplica hardening móvil.
- `robots.txt`, `sitemap.xml`, `.nojekyll` — publicación e indexación.

## Arquitectura actual

La aplicación sigue siendo **100% estática** y no depende de Supabase, bases de datos, servidores propios ni créditos de IA. Guardia, curso, evaluaciones, expediente y nombre del certificado usan `localStorage`.

V6 reduce el riesgo de pérdida permitiendo exportar esos datos a un archivo y restaurarlos posteriormente. Aun así, no existe sincronización automática entre dispositivos; esa será responsabilidad del futuro backend.

## Próximas etapas previstas

1. Perfil de alumno y autenticación.
2. Sincronización de progreso con backend.
3. Verificación remota de certificados.
4. Panel administrativo para publicar y editar lecciones/recursos.
5. Recursos multimedia reales: PDFs, audios y videos.
6. Refinar instalación PWA con iconos dedicados y más pruebas offline en dispositivos.

## Publicación

GitHub Pages está configurado desde `main` y `/ (root)`. Cada cambio aprobado que llega a `main` se publica automáticamente.
