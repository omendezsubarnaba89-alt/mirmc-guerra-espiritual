# V12 · Release operativo

## Estado

V12 introduce una segunda capa académica independiente del progreso local.

### Sigue existiendo

- progreso local/offline;
- sincronización `user_learning_state`;
- respaldo JSON;
- certificado local imprimible;
- gates de interfaz para una experiencia fluida.

### Nuevo · autoridad MIRMC

- `lesson_validations` para las 15 mini evaluaciones;
- `exam_validations` para los tres cierres de nivel;
- `exam_attempt_log` para control de intentos;
- banco privado de respuestas finales;
- certificado verificable emitido solo desde evidencia oficial;
- verificador público exact-code;
- revocación/reactivación administrativa;
- expediente oficial visible para alumno y Administración.

## Exámenes finales

Los exámenes finales están en versión 2.

- Las preguntas/opciones están en GitHub.
- Las respuestas correctas NO están en GitHub.
- Las respuestas correctas NO están en el navegador.
- Las respuestas correctas NO están en la Edge Function versionada.
- El banco privado vive únicamente en Supabase.
- Cada nivel permite como máximo 3 intentos oficiales dentro de 24 horas.
- Una versión de examen cacheada que no coincide con la versión privada es rechazada sin consumir intento.

## Certificados

### Local

Formato:

`MIRMC-LOCAL-XXXXXX`

Sirve para el documento local/offline y no constituye un registro verificable.

### Verificable

Formato:

`MIRMC-GE-XXXXXXXXXXXXXXXX`

Solo se puede emitir cuando el servidor confirma:

- 15/15 lecciones oficiales;
- 3/3 exámenes oficiales.

El certificado activo puede reconstruirse desde el servidor aunque el navegador haya perdido `localStorage`.

## URLs nuevas

Verificador público:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/verify-certificate.html`

Administración de certificados:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/admin-certificates.html`

Registro académico:

`https://omendezsubarnaba89-alt.github.io/mirmc-guerra-espiritual/academic.html`

## Flujo correcto de prueba

No se debe insertar progreso ficticio para probar la interfaz.

1. Entrar con una cuenta real.
2. Abrir Lección 01.
3. Responder su mini evaluación.
4. Confirmar que aparece `VALIDACIÓN OFICIAL MIRMC`.
5. Continuar secuencialmente.
6. Tras las cinco lecciones oficiales del nivel, abrir el examen final.
7. Verificar que el examen indica `V2` y `calificación en servidor`.
8. Al aprobar los tres niveles, abrir `certificate.html`.
9. Emitir el registro verificable.
10. Abrir `verify-certificate.html?code=...`.
11. Desde Administración, probar revocación/reactivación únicamente con un certificado real de prueba autorizado.

## Privacidad

- Las notas del Cuaderno no forman parte del expediente administrativo.
- El banco de respuestas no es legible por usuarios autenticados.
- El verificador no lista certificados.
- El `academic_snapshot` del certificado no forma parte de la respuesta pública.

## Seguridad pendiente fuera del código

Supabase Auth sigue recomendando activar **Leaked Password Protection** desde Dashboard.
