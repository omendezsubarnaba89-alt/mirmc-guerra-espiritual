# Changelog

Todos los cambios relevantes de MIRMC Guerra Espiritual se documentan aquí.

## V4 — 10 de agosto de 2026

### Biblioteca MIRMC real
- La Biblioteca deja de ser una cuadrícula conceptual y pasa a ser una experiencia navegable independiente.
- Nueva página `library.html` con búsqueda instantánea, filtro por categoría y filtro por nivel.
- 12 recursos escritos iniciales distribuidos entre Formación, Guías prácticas, Casos y escenarios, Liderazgo, Preguntas y respuestas y Devocional.
- Recursos destacados cuando no hay filtros activos.
- Nueva página dinámica `resource.html?id=...` para leer cada recurso completo sin duplicar plantillas.
- Cada recurso incluye categoría, nivel, formato, duración, base bíblica, desarrollo por secciones e idea para retener.
- Las seis tarjetas de Biblioteca del home ahora abren automáticamente el filtro correspondiente.
- Botón `Abrir biblioteca completa` añadido al home.
- No se muestran descargas, PDFs ni audios ficticios: la biblioteca solamente ofrece formatos que existen realmente.

### Arquitectura
- `resource-data.js` centraliza categorías y recursos.
- `library.js` gestiona búsqueda, filtros, URL de estado y renderizado.
- `resource.js` renderiza el lector individual.
- `library.css` sirve tanto la Biblioteca como el lector de recursos.
- `scripts/validate-library.mjs` comprueba IDs, categorías, niveles, contenido, base bíblica y referencias locales.
- GitHub Actions valida sintaxis y arquitectura de la Biblioteca en cada push.

## V3.1 — 10 de agosto de 2026

### Corrección de estado de lección
- Prueba real en Chrome/Android confirmó que la lección 01 funcionaba y permitía aprobar 3/3, pero el panel `Esta lección todavía está bloqueada` se mostraba simultáneamente.
- Causa: la regla `.lesson-locked { display:grid; }` sobrescribía visualmente el atributo HTML `hidden`.
- Añadida una regla explícita para que `hidden` gane siempre en loading, pantalla bloqueada y experiencia de lección.
- `lesson.js` ahora establece de forma inequívoca el estado inicial antes de resolver el acceso.
- La primera lección ya no muestra una tarjeta `Anterior` deshabilitada; ahora ofrece `Volver al inicio de la ruta`.
- Navegación inferior refinada para móvil.

## V3 — 10 de agosto de 2026

### Curso navegable
- La Ruta MIRMC deja de ser una lista informativa y pasa a ser un curso interactivo real.
- Añadidas 15 lecciones estructuradas en 3 niveles de 5 lecciones.
- Cada lección incluye objetivo, base bíblica, idea central, desarrollo, puntos clave, ejercicio, reflexión y evaluación.
- Nueva página dinámica `lesson.html?lesson=XX` para servir cualquier lección sin duplicar plantillas.
- Navegación anterior/siguiente y navegador lateral por nivel.
- Desbloqueo secuencial: la siguiente lección se habilita al completar la anterior.
- Evaluación de 3 preguntas por lección; se requieren al menos 2 respuestas correctas para completar.
- Progreso total y por nivel guardado localmente mediante `localStorage`.
- La portada muestra porcentaje, número de lecciones completadas, próxima lección y estados Abrir/Bloqueada/Completada.
- Botón Continuar ruta lleva automáticamente a la próxima lección disponible.

### Arquitectura
- `course-data.js` centraliza niveles, orden, contenido y evaluaciones.
- `course-progress.js` gestiona progreso, desbloqueos, navegación y estadísticas.
- `course-enhancements.js` conecta la Ruta MIRMC de la portada con el motor del curso.
- `course-index.css` contiene los componentes de progreso del home.
- `lesson.css` y `lesson.js` implementan la experiencia de estudio.
- Workflow `Integrate course experience` inyecta automáticamente los assets del curso en `index.html`.
- Añadido `scripts/validate-course.mjs` para revisar numeración, niveles, contenido, quizzes, referencias y archivos.
- El workflow de validación ahora comprueba sintaxis de todos los scripts del curso además de la landing.

## V2.2 — 10 de agosto de 2026

### Corrección estructural de desbordamiento móvil
- Confirmado mediante segunda prueba real en Chrome/Android que el overflow afectaba al documento completo y no solo a la portada.
- Reescrito el blindaje móvil para trabajar con ancho real de viewport y padding interno, evitando dependencias de `calc(100% - ...)` en teléfonos.
- `html` y `body` quedan limitados explícitamente a `100vw`/`100%` y sin desplazamiento horizontal.
- Todos los hijos de grids y flex principales reciben `min-width: 0` y límites de ancho.
- En móvil, Hero, Fundamento, Discernimiento, Armadura, Guardia, Ruta, Biblioteca y Footer usan columnas `minmax(0, 1fr)` para impedir anchos intrínsecos fuera del viewport.
- Pseudoelementos, radares, órbitas, resplandores y otros elementos absolutos quedan limitados al ancho de su contenedor.
- `section-shell` y `header-inner` pasan a ancho completo con padding interno en móvil.
- Consola de portada, selector de armadura, progreso semanal, tarjetas y listas reciben límites de ancho explícitos.
- El workflow `Apply mobile hardening` fusionó automáticamente la corrección en `styles.css` mediante el commit `fix: apply Android mobile hardening [skip ci]`.

## V2.1 — 10 de agosto de 2026

### Prueba real en Android
- Validación visual realizada en Chrome sobre dispositivo Samsung.
- Corregido el desplazamiento horizontal accidental detectado en la portada.
- Blindaje de `html` y `body` contra desbordamiento lateral generado por elementos absolutos.
- Radar, resplandor, escudo y consola de portada encerrados dentro del ancho real del dispositivo.
- Consola inferior convertida a distribución flexible para impedir que ensanche el documento.
- Reducción de altura del bloque visual de la portada en móvil.
- Títulos móviles refinados para conservar impacto sin ocupar pantallas completas innecesariamente.
- Espaciado vertical reducido entre Fundamento, Discernimiento, Armadura, Guardia y Ruta MIRMC.
- Tarjetas de Fundamento, Discernimiento, Armadura y Ruta compactadas en teléfonos.
- Progreso semanal y controles interactivos reforzados para anchos pequeños.
- Añadido `mobile-fixes.css` como fuente mantenible de ajustes de dispositivo real.
- Añadido workflow `Apply mobile hardening` para incorporar automáticamente estos ajustes al final de `styles.css` sin reescribir manualmente la hoja base.

## V2 — 10 de agosto de 2026

### Experiencia
- Reconstrucción completa de la portada.
- Nuevo encabezado sticky con estado al hacer scroll.
- Menú móvil de pantalla completa.
- Jerarquía tipográfica móvil corregida para evitar titulares desproporcionados.
- Nueva identidad gráfica MIRMC con escudo SVG propio.

### Formación
- Sección de fundamento reestructurada.
- Nueva Sala de discernimiento interactiva.
- Armadura de Dios ampliada con aplicación práctica.
- Nueva Guardia de hoy con siete ejercicios rotativos.
- Progreso local de siete días mediante `localStorage`.
- Ruta de tres niveles y quince lecciones con selector interactivo.
- Código de campo con cinco principios de responsabilidad bíblica.
- Biblioteca ampliada y FAQ.

### Técnica
- SEO básico, Open Graph y JSON-LD.
- `manifest.webmanifest`.
- `robots.txt` y `sitemap.xml`.
- `.nojekyll`.
- Página 404 con identidad MIRMC.
- Reducción de partículas en móvil.
- Soporte `prefers-reduced-motion`.
- Navegación accesible y foco visible.
- Validador estático propio sin dependencias.
- GitHub Actions para revisar JavaScript y referencias internas en cada cambio.

## V1 — 10 de agosto de 2026

- Primera landing funcional.
- Portada “La batalla es real. Cristo ya venció.”
- Sección de fundamentos.
- Armadura de Dios interactiva.
- Tres tarjetas iniciales de entrenamiento.
- Biblioteca conceptual.
- Publicación inicial mediante GitHub Pages.
