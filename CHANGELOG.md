# Changelog

Todos los cambios relevantes de MIRMC Guerra Espiritual se documentan aquí.

## V10 — 10 de agosto de 2026

### Roles y administración segura
- Confirmada cuenta real del propietario y primera sincronización en nube.
- Añadida tabla `user_roles` con roles `student`, `admin` y `super_admin`.
- Nuevos usuarios reciben rol `student` automáticamente mediante trigger protegido.
- Cuenta propietaria configurada como `super_admin`.
- El Security Advisor detectó RPC administrativas `SECURITY DEFINER` expuestas durante la primera implementación; fueron retiradas.
- Administración movida a Edge Function `admin-management` con JWT obligatorio.
- La Edge Function valida sesión, rol activo y reserva cambios de rol al `super_admin`.
- La `service_role` se utiliza únicamente dentro del entorno servidor de Supabase Edge Functions; nunca llega al navegador ni a GitHub como secreto.
- Nuevo `admin.html` con listado de usuarios, estado de correo, progreso, últimos accesos y control de roles.
- `Mi cuenta` muestra acceso administrativo únicamente cuando el rol autenticado es `admin` o `super_admin`.
- Corregida la presentación móvil del correo autenticado para evitar títulos desbordados.
- Service worker actualizado a V10 e incorpora el shell administrativo.
- Nuevo CI `validate-admin.yml` para comprobar archivos, fronteras de seguridad y ausencia de `service_role` en el JavaScript del navegador.
- Security Advisor posterior: sin advertencias de funciones administrativas; queda únicamente la recomendación de Auth para activar Leaked Password Protection desde Dashboard.

## V9 — 10 de agosto de 2026

### Nube real y sincronización
- Creado proyecto Supabase dedicado `MIRMC Guerra Espiritual` en `us-east-1` (`eqffbegdezlzzffvmsqk`).
- Aplicada migración con `profiles` y `user_learning_state`.
- RLS habilitado en ambas tablas y acceso anónimo revocado.
- Políticas por usuario limitadas a `auth.uid() = user_id`.
- Security Advisor detectó exposición de funciones `SECURITY DEFINER`; se añadió migración de hardening y el Advisor quedó en cero avisos.
- `cloud-config.js` activado con Project URL + publishable key.
- Ninguna `service_role`, `sb_secret_...` ni secreto administrativo se publica en GitHub.
- `account.html` pasa de modo preparado a cuenta real por correo/contraseña.
- Google OAuth queda oculto hasta configurar el proveedor.
- Nuevo `cloud-autosync.js` para reconciliación automática de progreso local/remoto.
- Autosync se activa desde curso, evaluaciones y Cuaderno; escucha cambios, reconexión y retorno a la pestaña.
- Service worker actualizado para cachear el runtime de nube y refrescar scripts con estrategia network-first.
- CI cloud ampliado para validar autosync y la migración de hardening.

### Ajustes móviles de V8.1
- Corregido footer pegado en Cuaderno/Cuenta y pantallas reutilizadas.
- Cuaderno ordena lecciones 01→15, prioriza coincidencias y pagina los resultados en lotes de 8.
- Cuenta compactada para móviles.

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
