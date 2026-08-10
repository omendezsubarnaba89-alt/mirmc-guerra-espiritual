# Changelog

Todos los cambios relevantes de MIRMC Guerra Espiritual se documentan aquí.

## V8 — 10 de agosto de 2026

### Cuaderno MIRMC
- Nueva página `study.html` con búsqueda global.
- Indexa las 15 lecciones y los 12 recursos escritos.
- Filtros por tipo de contenido y nivel.
- Favoritos personales y contador.
- Notas personales por lección/recurso, hasta 12.000 caracteres.
- Historial de hasta 30 contenidos recientes.
- Nueva tarjeta `Cuaderno personal` insertada dentro de lecciones y recursos.
- Acceso directo al Cuaderno desde la Ruta MIRMC.
- Favoritos, notas e historial se incluyen en respaldo JSON.
- `cloud-sync.js` incorpora el estado de estudio en la futura sincronización.
- Service worker actualizado a V8 para cachear Cuaderno y herramientas de estudio.
- Añadido `scripts/validate-study.mjs` y validación de sintaxis en GitHub Actions.

## V7 — 10 de agosto de 2026

### Cuenta y sincronización preparada
- Nueva página `account.html` con modo local y modo nube.
- Acceso por correo/contraseña y Google OAuth preparados con Supabase Auth.
- Perfil de alumno y sincronización inteligente local/remota.
- Controles manuales de subir/restaurar estado.
- `cloud-config.js` queda deshabilitado hasta disponer de un proyecto Supabase real.
- Migración Supabase con tablas `profiles` y `user_learning_state`.
- RLS por `auth.uid() = user_id`, acceso anónimo revocado y ninguna service-role en frontend.
- Nuevo validador cloud/RLS.

## V6 — 10 de agosto de 2026
- Respaldo JSON de progreso y restauración.
- Restablecimiento local explícito.
- Service worker y primera capa PWA/offline.

## V5 — 10 de agosto de 2026
- Tres evaluaciones finales de 10 preguntas; aprobación 80%.
- Gates académicos entre niveles.
- Registro académico y certificado interno imprimible.

## V4 — 10 de agosto de 2026
- Biblioteca real con búsqueda, filtros, 12 recursos y lector dinámico.

## V3.1 — 10 de agosto de 2026
- Corrección del falso panel de lección bloqueada y navegación móvil.

## V3 — 10 de agosto de 2026
- Ruta de 3 niveles y 15 lecciones con progreso secuencial y mini evaluaciones.

## V2.2 — 10 de agosto de 2026
- Corrección estructural del overflow horizontal en Android.

## V2.1 — 10 de agosto de 2026
- Primera auditoría real en Samsung/Chrome y hardening móvil.

## V2 — 10 de agosto de 2026
- Reconstrucción visual, discernimiento, armadura, Guardia, SEO, accesibilidad y CI.

## V1 — 10 de agosto de 2026
- Primera landing publicada mediante GitHub Pages.
