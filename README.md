# MIRMC Guerra Espiritual

Centro web de formación bíblica, enseñanza y entrenamiento para comprender la guerra espiritual con **Cristo como centro**, Biblia abierta, discernimiento sobrio y responsabilidad pastoral.

## Sitio público

https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/

## Estado actual — V2

La segunda versión convierte la landing inicial en una experiencia de entrenamiento más completa:

- Portada cinematográfica responsive y navegación sticky.
- Identidad MIRMC propia con escudo SVG, sin depender de imágenes externas.
- Fundamento doctrinal: identidad, discernimiento y autoridad bajo Cristo.
- Sala de discernimiento interactiva para distinguir tentación, heridas o agotamiento, conflictos humanos y oposición espiritual sin diagnosticar “espíritus”.
- Armadura de Dios interactiva basada en Efesios 6:10–18, con explicación y aplicación práctica.
- **Guardia de hoy**: entrenamiento diario rotativo de siete días.
- Progreso local guardado en el navegador mediante `localStorage`; no requiere cuenta ni backend.
- Ruta MIRMC de tres niveles y quince lecciones.
- Código de campo con principios de responsabilidad bíblica.
- Biblioteca de recursos preparada para crecer.
- Preguntas frecuentes sobre guerra espiritual, ayuda profesional, objetos y discernimiento.
- SEO básico, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml` y manifiesto web.
- Soporte para `prefers-reduced-motion`, foco visible, navegación por teclado y enlace “Saltar al contenido”.
- Partículas optimizadas para reducir consumo en dispositivos móviles.

## Estructura

- `index.html` — contenido, semántica y experiencia principal.
- `styles.css` — sistema visual completo y responsive.
- `script.js` — menú, armadura, discernimiento, niveles, guardia diaria, progreso y partículas.
- `assets/mirmc-shield.svg` — identidad visual principal.
- `manifest.webmanifest` — metadatos de instalación web.
- `robots.txt` / `sitemap.xml` — indexación básica.
- `.nojekyll` — publicación estática directa en GitHub Pages.

## Arquitectura actual

La aplicación sigue siendo **100% estática** y no depende de Supabase, bases de datos, servidores propios ni créditos de IA. Esto permite mantenerla rápida, económica y fácil de publicar desde GitHub Pages.

El progreso de Guardia de hoy se almacena exclusivamente en el navegador del visitante. Borrar los datos del navegador también elimina ese progreso.

## Próximas etapas previstas

La base ya está preparada para evolucionar hacia:

1. Páginas completas para cada una de las 15 lecciones.
2. Biblioteca real de PDFs, audios, videos y enseñanzas.
3. Evaluaciones y ejercicios por nivel.
4. Perfil de alumno y sincronización de progreso cuando se incorpore backend.
5. Panel administrativo para publicar contenido.
6. Buscador de recursos y filtros por tema/nivel.
7. Certificados y seguimiento del curso, si se decide incorporarlos.

## Publicación

GitHub Pages está configurado desde:

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/ (root)`

Cada cambio aprobado que llegue a `main` se publica automáticamente en el sitio.
