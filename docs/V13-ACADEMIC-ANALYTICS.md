# V13 · Analítica académica

## Objetivo

Dar a Administración una vista de proceso sin convertir la plataforma en un sistema de vigilancia personal.

Página:

`admin-analytics.html`

Edge Function:

`academic-analytics`

`verify_jwt = true`

Roles permitidos:

- `admin`
- `super_admin`

## Indicadores

### Usuarios

- cuentas totales;
- correos confirmados;
- cuentas activas;
- personal administrativo;
- usuarios con alguna actividad académica oficial;
- usuarios que completaron la ruta oficial.

### Embudo de 15 lecciones

Por cada lección muestra cuántos usuarios tienen una fila `lesson_validations.passed = true`.

Esto permite localizar puntos de caída sin leer información privada del alumno.

### Exámenes

Por nivel:

- usuarios aprobados;
- intentos de los últimos 14 días;
- intentos aprobados;
- promedio de mejor nota entre aprobados.

### Certificados

- total emitido;
- activos;
- revocados;
- promedio de certificados activos.

### Actividad

Ventana visual de 14 días con conteos agregados de:

- lecciones aprobadas;
- intentos finales;
- certificados emitidos.

Además:

- usuarios sincronizados en 7 días;
- usuarios sincronizados en 30 días.

## Privacidad

La respuesta declara:

`privacy: aggregated_only`

La función NO consulta ni devuelve:

- notas del Cuaderno;
- favoritos;
- historial personal de lectura;
- contenido escrito por el alumno;
- nombres visibles;
- correos en la respuesta de analítica.

La función necesita consultar Auth internamente para contar cuentas y confirmaciones, pero solo devuelve totales agregados.

## CI

`validate-analytics.yml`

`validate-analytics.mjs` impide introducir dependencias con notas/favoritos y revisa que no se expongan secretos administrativos en el JavaScript del navegador.

## URL

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/admin-analytics.html`
