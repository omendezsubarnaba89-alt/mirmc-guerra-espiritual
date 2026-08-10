# Changelog

Todos los cambios relevantes de MIRMC Guerra Espiritual se documentan aquí.

## V7 — 10 de agosto de 2026

### Cuenta y sincronización preparada
- Nueva página `account.html` con modo local y modo nube.
- Acceso por correo/contraseña preparado con Supabase Auth.
- Botón de Google OAuth preparado con redirect a `account.html`.
- Perfil de alumno con nombre visible.
- Nuevo motor `cloud-sync.js` para fusionar progreso local y remoto.
- La fusión conserva lecciones completadas, mejores resultados de quiz y mejores notas de exámenes.
- Controles manuales para `Sincronizar ahora`, subir el estado de este dispositivo o restaurar desde nube.
- La Ruta MIRMC incorpora acceso visible a `Mi cuenta`.
- `cloud-config.js` queda deshabilitado hasta disponer de un proyecto real; el modo local continúa funcionando sin cambios.

### Backend preparado
- Añadida migración Supabase `20260810143000_init_mirmc_cloud.sql`.
- Tablas `profiles` y `user_learning_state`.
- RLS obligatoria y políticas `authenticated` por `auth.uid() = user_id`.
- Acceso anónimo revocado a datos de perfiles y progreso.
- Trigger para crear perfil al registrarse y timestamps automáticos.
- Runbook de activación en `supabase/README.md`.
- Ninguna clave `service_role` forma parte del frontend.

### PWA y calidad
- Service worker actualizado a caché V7 con cuenta y adaptadores cloud.
- Añadido `scripts/validate-cloud.mjs`.
- GitHub Actions comprueba sintaxis, RLS, referencias y ausencia de service-role en configuración pública.
- El validador permite la transición futura `enabled:false` → `enabled:true` solo con URL y publishable key válidas.

## V6 — 10 de agosto de 2026

### Respaldo y offline
- Página `settings.html` para exportar/importar Guardia, curso, exámenes y nombre del certificado.
- Restablecimiento explícito de datos locales.
- Service worker y caché del shell esencial.
- Base PWA standalone mediante `manifest.webmanifest`.
- Validación automática de referencias offline.

## V5 — 10 de agosto de 2026

### Evaluaciones finales y expediente
- Tres evaluaciones finales de 10 preguntas; aprobación mínima 80%.
- Gates académicos entre niveles.
- Registro académico local con promedio e intentos.
- Certificado interno imprimible habilitado con 15/15 + tres exámenes aprobados.
- Validación académica automática.

## V4 — 10 de agosto de 2026

### Biblioteca MIRMC real
- `library.html` con búsqueda y filtros.
- 12 recursos escritos iniciales.
- Lector dinámico `resource.html?id=...`.
- Las tarjetas del home abren categorías reales de Biblioteca.

## V3.1 — 10 de agosto de 2026

- Corregido el panel falso de lección bloqueada causado por CSS sobrescribiendo `hidden`.
- Navegación inferior de lección refinada para móvil.

## V3 — 10 de agosto de 2026

### Curso navegable
- 3 niveles y 15 lecciones.
- Objetivo, Biblia, desarrollo, ejercicio, reflexión y mini evaluación por lección.
- Progreso secuencial guardado en `localStorage`.
- Estados Abrir/Bloqueada/Completada y botón inteligente Continuar ruta.

## V2.2 — 10 de agosto de 2026

- Corrección estructural del desbordamiento horizontal en Android.
- Viewport, grids, flex, pseudoelementos y elementos absolutos limitados correctamente.

## V2.1 — 10 de agosto de 2026

- Primera prueba real en Samsung/Chrome.
- Hardening móvil, compactación vertical y centrado de elementos visuales.

## V2 — 10 de agosto de 2026

- Reconstrucción visual completa.
- Sala de discernimiento, Armadura interactiva, Guardia de Hoy y Ruta MIRMC.
- SEO, PWA inicial, accesibilidad y GitHub Actions.

## V1 — 10 de agosto de 2026

- Primera landing funcional publicada mediante GitHub Pages.
