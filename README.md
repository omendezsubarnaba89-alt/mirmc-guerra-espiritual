# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V4

La V4 ya combina tres experiencias funcionales: centro de entrenamiento, curso navegable y biblioteca real.

### Experiencia principal

- Portada cinematográfica responsive y navegación sticky.
- Identidad MIRMC propia con escudo SVG.
- Fundamento doctrinal, Sala de discernimiento y Armadura de Dios interactiva.
- **Guardia de hoy** con siete entrenamientos rotativos y progreso local.
- Ruta MIRMC con **3 niveles y 15 lecciones navegables**.
- Progreso total y por nivel guardado en el navegador.
- Desbloqueo secuencial de lecciones.
- Evaluación de tres preguntas por lección; se requieren al menos dos respuestas correctas para completarla.
- Navegación anterior/siguiente y navegador por nivel.
- Estado visual `ABRIR`, `BLOQUEADA` o `COMPLETADA` desde la portada.
- Botón inteligente `Comenzar/Continuar ruta` que abre la próxima lección disponible.

### Biblioteca MIRMC

- Página independiente `library.html`.
- 12 recursos escritos iniciales.
- Búsqueda instantánea.
- Filtros por categoría y nivel.
- Recursos destacados.
- Categorías: Formación, Guías prácticas, Casos y escenarios, Liderazgo, Preguntas y respuestas y Devocional.
- Lector dinámico `resource.html?id=...`.
- Cada recurso incluye nivel, formato, duración, base bíblica, desarrollo e idea para retener.
- Las seis tarjetas de Biblioteca del home llevan al filtro correspondiente.
- La plataforma no muestra descargas, PDFs ni audios que todavía no existan.

## Estructura

### Sitio principal

- `index.html` — experiencia principal.
- `styles.css` — sistema visual responsive.
- `script.js` — portada, menú, armadura, discernimiento, Guardia y efectos.
- `mobile-fixes.css` — hardening móvil basado en pruebas reales Android.
- `assets/mirmc-shield.svg` — identidad visual.

### Motor del curso

- `course-data.js` — contenido estructurado de los 3 niveles y 15 lecciones.
- `course-progress.js` — progreso, desbloqueos, navegación y estadísticas.
- `course-enhancements.js` — integra curso y accesos a Biblioteca en el home.
- `course-index.css` — componentes de progreso del home.
- `lesson.html` — plantilla dinámica de lección.
- `lesson.css` — experiencia visual de estudio.
- `lesson.js` — render, quiz, finalización y navegación.

### Biblioteca

- `resource-data.js` — categorías y recursos estructurados.
- `library.html` / `library.css` / `library.js` — búsqueda, filtros y catálogo.
- `resource.html` / `resource.js` — lector dinámico de recursos.

### Calidad y publicación

- `scripts/validate.mjs` — referencias estáticas y estructura principal.
- `scripts/validate-course.mjs` — coherencia de niveles, 15 lecciones, evaluaciones y archivos del curso.
- `scripts/validate-library.mjs` — coherencia de recursos, categorías, niveles y páginas de Biblioteca.
- `.github/workflows/validate.yml` — validación automática.
- `.github/workflows/integrate-course.yml` — integra assets del curso en `index.html`.
- `.github/workflows/apply-mobile-fixes.yml` — aplica hardening móvil a la hoja principal.
- `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `.nojekyll` — publicación e indexación.

## Arquitectura actual

La aplicación sigue siendo **100% estática** y no depende de Supabase, bases de datos, servidores propios ni créditos de IA. El progreso de Guardia y Curso usa `localStorage`, por lo que permanece en el navegador del dispositivo actual.

Esto permite validar primero la experiencia completa antes de añadir autenticación y backend. El contenido, el progreso y la presentación están separados para que podamos incorporar persistencia remota después sin reconstruir la plataforma.

## Próximas etapas previstas

1. Evaluaciones finales por nivel y calificación acumulada.
2. Perfil de alumno y sincronización de progreso con backend.
3. Panel administrativo para publicar y editar lecciones/recursos.
4. Recursos multimedia reales: PDFs, audios y videos cuando sean cargados.
5. Certificados y seguimiento del curso.
6. Modo instalable/PWA mejorado y funcionamiento offline selectivo.

## Publicación

GitHub Pages está configurado desde `main` y `/ (root)`. Cada cambio aprobado que llega a `main` se publica automáticamente.
