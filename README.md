# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V3

La V3 convierte la Ruta MIRMC en un curso navegable real sin abandonar la arquitectura estática y económica de GitHub Pages.

### Experiencia principal

- Portada cinematográfica responsive y navegación sticky.
- Identidad MIRMC propia con escudo SVG.
- Fundamento doctrinal, Sala de discernimiento y Armadura de Dios interactiva.
- **Guardia de hoy** con siete entrenamientos rotativos y progreso local.
- Ruta MIRMC con **3 niveles y 15 lecciones navegables**.
- Progreso total y por nivel guardado en el navegador.
- Desbloqueo secuencial de lecciones.
- Evaluación de tres preguntas por lección; se requieren al menos dos respuestas correctas para completarla.
- Navegación anterior/siguiente y navegador lateral por nivel.
- Estado visual `ABRIR`, `BLOQUEADA` o `COMPLETADA` desde la portada.
- Botón inteligente `Comenzar/Continuar ruta` que abre la próxima lección disponible.
- Código de campo, biblioteca conceptual y preguntas frecuentes.

### Curso

Cada una de las 15 lecciones contiene:

- objetivo;
- base bíblica;
- idea central;
- tres bloques de desarrollo;
- tres puntos clave;
- ejercicio práctico;
- pregunta de reflexión;
- mini evaluación;
- finalización y desbloqueo de la siguiente lección.

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
- `course-enhancements.js` — integración de progreso en la Ruta MIRMC del home.
- `course-index.css` — componentes de progreso del home.
- `lesson.html` — plantilla dinámica de lección.
- `lesson.css` — experiencia visual de estudio.
- `lesson.js` — render, quiz, finalización y navegación.

### Calidad y publicación

- `scripts/validate.mjs` — referencias estáticas y estructura principal.
- `scripts/validate-course.mjs` — coherencia de niveles, 15 lecciones, evaluaciones y archivos del curso.
- `.github/workflows/validate.yml` — validación automática.
- `.github/workflows/integrate-course.yml` — integra assets del curso en `index.html`.
- `.github/workflows/apply-mobile-fixes.yml` — aplica hardening móvil a la hoja principal.
- `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `.nojekyll` — publicación e indexación.

## Arquitectura actual

La aplicación sigue siendo **100% estática** y no depende de Supabase, bases de datos, servidores propios ni créditos de IA. El progreso de Guardia y Curso usa `localStorage`, por lo que permanece en el navegador del dispositivo actual.

Esto permite validar primero la experiencia completa antes de añadir autenticación y backend. Cuando incorporemos cuentas, el motor de progreso ya está separado del contenido, por lo que podremos sustituir el almacenamiento local por persistencia remota sin reconstruir las lecciones.

## Próximas etapas previstas

1. Biblioteca real de PDFs, audios, videos y enseñanzas.
2. Evaluaciones finales por nivel y calificación acumulada.
3. Perfil de alumno y sincronización de progreso con backend.
4. Panel administrativo para publicar y editar contenido.
5. Buscador y filtros por tema/nivel.
6. Certificados y seguimiento del curso.
7. Modo instalable/PWA mejorado y funcionamiento offline selectivo.

## Publicación

GitHub Pages está configurado desde `main` y `/ (root)`. Cada cambio aprobado que llega a `main` se publica automáticamente.
