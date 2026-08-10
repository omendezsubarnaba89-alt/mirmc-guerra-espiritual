# Supabase · MIRMC Guerra Espiritual

La nube está **activa** desde V9.

## Proyecto

- Nombre: `MIRMC Guerra Espiritual`
- Project Ref: `eqffbegdezlzzffvmsqk`
- Región: `us-east-1`
- Project URL: `https://eqffbegdezlzzffvmsqk.supabase.co`
- Frontend: GitHub Pages

El frontend usa exclusivamente una **publishable key**. Ninguna `service_role`, `sb_secret_...`, contraseña de base de datos o token de gestión debe vivir en GitHub Pages.

## Migraciones aplicadas

Backend real:

1. `init_mirmc_cloud`
2. `harden_profile_trigger_function`

Archivos del repositorio:

- `migrations/20260810143000_init_mirmc_cloud.sql`
- `migrations/20260810200500_harden_trigger_functions.sql`

## Esquema

### `public.profiles`
- `user_id` → `auth.users.id`
- `display_name`
- timestamps

### `public.user_learning_state`
- `user_id` → `auth.users.id`
- `schema_version`
- `payload jsonb`
- `client_updated_at`
- timestamps

## Seguridad

- RLS habilitado en ambas tablas.
- `anon` no tiene privilegios directos sobre estas tablas.
- `authenticated` recibe únicamente `SELECT/INSERT/UPDATE` sujetos a RLS.
- Todas las políticas comparan `auth.uid()` con `user_id`.
- Las funciones de trigger no son ejecutables mediante RPC por `anon` ni `authenticated`.
- Security Advisor fue ejecutado después del hardening y devolvió cero avisos.

## Auth · ajuste obligatorio de Dashboard

Supabase hosted exige confirmación de email por defecto. Antes de probar altas públicas, configura en **Authentication → URL Configuration**:

- Site URL:
  `https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/`
- Additional Redirect URL:
  `https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/**`

El conector actual permite administrar proyecto, SQL, migraciones, advisors y claves publicables, pero no expone la modificación de URL Configuration.

## Google OAuth

`cloud-config.js` mantiene `googleEnabled:false`. Para activarlo hacen falta las credenciales OAuth del proyecto de Google y configurar el proveedor en Supabase. Hasta entonces el botón permanece oculto.

## Sincronización

`cloud-sync.js` fusiona:

- lecciones completadas;
- quizzes de lección;
- exámenes finales;
- Guardia de hoy;
- favoritos;
- notas personales;
- historial reciente;
- nombre del certificado.

`cloud-autosync.js` ejecuta reconciliación al iniciar sesión, detectar cambios, recuperar conexión, volver a enfocar la aplicación y durante comprobaciones periódicas.

Los controles manuales de `account.html` siguen disponibles para subir/restaurar de manera deliberada.
