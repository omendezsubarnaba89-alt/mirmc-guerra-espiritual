# Changelog

Todos los cambios relevantes de MIRMC Guerra Espiritual se documentan aquí.

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
