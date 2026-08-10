# Activación de nube · MIRMC Guerra Espiritual

La V7 funciona en modo local aunque Supabase no esté configurado. Esta carpeta contiene lo necesario para activar autenticación y sincronización real cuando exista el proyecto.

## 1. Crear proyecto Supabase

Crea un proyecto nuevo dedicado a MIRMC Guerra Espiritual. No reutilices un backend de otra aplicación sin una decisión explícita de arquitectura.

## 2. Aplicar la migración

Ejecuta `migrations/20260810143000_init_mirmc_cloud.sql` desde Supabase CLI o el SQL Editor.

La migración crea:

- `public.profiles`
- `public.user_learning_state`
- RLS en ambas tablas
- políticas para que cada usuario autenticado solo lea/escriba su propia fila
- trigger de perfil al crear un usuario
- timestamps de actualización

## 3. Configurar Auth

En Authentication / URL Configuration:

- Site URL: `https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/`
- Redirect URL permitida: `https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/account.html`

Para Google, habilita el proveedor Google y completa sus credenciales OAuth en Supabase. El botón de Google de la app ya está preparado.

## 4. Activar el frontend

Edita `cloud-config.js`:

```js
window.MIRMC_CLOUD_CONFIG = {
  enabled: true,
  provider: 'supabase',
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabasePublishableKey: 'TU_CLAVE_PUBLICABLE',
  redirectUrl: new URL('account.html', window.location.href).href,
  schemaVersion: 1
};
```

La URL del proyecto y la publishable key están diseñadas para uso en cliente. **Nunca** coloques una `service_role`, secret key administrativa, contraseña de base de datos ni token de gestión en este repositorio o en JavaScript servido por GitHub Pages.

## 5. Probar

1. Abre `account.html`.
2. Crea una cuenta de prueba.
3. Completa una lección o importa un respaldo.
4. Pulsa `Sincronizar ahora`.
5. En otro navegador/dispositivo, inicia sesión con la misma cuenta.
6. La sincronización inteligente debe combinar el progreso sin perder lecciones completadas ni mejores notas.

## Estrategia de conflictos

- Lecciones completadas: unión; una lección completada en cualquiera de los dispositivos permanece completada.
- Quiz de lección: se conserva la mejor puntuación registrada.
- Exámenes finales: se conserva el mejor porcentaje y el estado aprobado.
- Guardias: las marcas booleanas se combinan.
- Nombre de certificado: se conserva el valor local cuando existe; en caso contrario se usa el remoto.

Los botones `Usar este dispositivo como fuente` y `Restaurar desde la nube` son operaciones manuales deliberadas para casos donde el usuario quiera reemplazar un lado en lugar de fusionar.
