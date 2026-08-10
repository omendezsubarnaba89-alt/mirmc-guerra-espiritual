# V12 · Expediente oficial y certificados verificables

## Por qué existe una capa oficial

`user_learning_state` sigue siendo útil para sincronización, recuperación entre dispositivos y trabajo offline, pero su origen es el navegador del alumno. Por esa razón **no se utiliza como autoridad para emitir un certificado verificable**.

V12 separa dos conceptos:

- **Progreso local/sincronizado:** experiencia del alumno, resiliencia y offline.
- **Expediente oficial MIRMC:** evaluaciones calificadas y registradas por servidor.

## Validaciones de lección

Tabla: `public.lesson_validations`

- Una fila por usuario y lección.
- Guarda intentos, mejor nota, aprobación y fechas.
- El alumno solo puede leer sus propias filas.
- El navegador no puede insertar ni modificar estos registros directamente.
- `academic-validation` califica la mini evaluación en servidor y aplica la secuencia de la Ruta MIRMC.
- Lección 06 exige examen oficial de Nivel 1; lección 11 exige examen oficial de Nivel 2.
- Si V11 publica un mini-quiz nuevo, el servidor usa la clave del `published_payload` vigente; si no existe override publicado, usa la clave base.

## Exámenes finales oficiales

Los exámenes finales cambiaron a **versión 2**.

- `assessment-data.js` contiene preguntas y opciones, pero **no respuestas correctas**.
- La Edge Function pública versionada tampoco contiene las claves finales.
- Las claves viven en `public.academic_answer_keys` con RLS y todos los privilegios de navegador revocados.
- Los datos secretos del banco de respuestas se cargan directamente en Supabase y **no se versionan en este repositorio público**.
- Cada evaluación pública declara `version: 2`; el servidor rechaza una versión antigua para evitar calificar preguntas cacheadas con una clave distinta.
- Máximo 3 intentos oficiales por nivel dentro de una ventana móvil de 24 horas.
- Los intentos se guardan en `exam_attempt_log`.
- Una vez aprobado un nivel, nuevas solicitudes devuelven el resultado oficial existente sin consumir otro intento.

## Certificados verificables

Tabla: `public.certificates`

Un certificado solo puede emitirse si el servidor confirma:

- 15/15 `lesson_validations` aprobadas.
- 3/3 `exam_validations` aprobadas.

La emisión se realiza en `certificate-management` y genera un código aleatorio:

`MIRMC-GE-XXXXXXXXXXXXXXXX`

El certificado almacena también un `academic_snapshot` privado de las validaciones que sustentaron la emisión.

El certificado local/imprimible utiliza una marca diferente:

`MIRMC-LOCAL-XXXXXX`

Por tanto un registro local nunca debe confundirse con un código verificable.

## Verificación pública sin enumeración

`verify-certificate.html` no requiere iniciar sesión.

La función PostgreSQL `verify_certificate(p_code)` es `SECURITY INVOKER`. Solo después de validar un código con el formato correcto coloca ese código en una configuración transaccional y RLS permite consultar la fila exacta.

Prueba ejecutada en producción:

1. Se insertó un certificado temporal.
2. Bajo rol `anon`, `SELECT count(*) FROM certificates` devolvió 0 filas visibles.
3. Bajo rol `anon`, `verify_certificate(código_exacto)` devolvió exclusivamente la ficha temporal.
4. El certificado temporal fue eliminado.

No existe endpoint público para enumerar nombres o códigos.

## Revocación

`admin-certificates.html` permite:

- `admin`: consultar certificados.
- `super_admin`: revocar o reactivar.

Revocar no elimina el registro. El mismo código continúa verificándose, pero muestra estado `REVOCADO` y el motivo correspondiente.

Los eventos `issue`, `revoke` y `reinstate` se guardan en `certificate_audit_log`, tabla no accesible directamente desde el navegador.

## Recuperación del certificado

`certificate-official.js` consulta primero el registro del servidor. Un certificado oficial activo puede reconstruir la vista imprimible incluso si se perdieron los datos locales del navegador.

## Registro académico

`academic.html` muestra dos capas:

1. Registro local/sincronizado.
2. **Expediente oficial MIRMC**, alimentado por `lesson_validations` y `exam_validations`.

Administración también distingue ambas fuentes dentro del expediente individual de cada alumno.

## Banco privado de respuestas

Esquema versionado:

`supabase/migrations/20260810220631_add_private_academic_answer_bank.sql`

El archivo contiene únicamente la estructura y la política de seguridad. **Nunca debe añadirse un `INSERT` con las claves al repositorio.**

La validación CI `scripts/validate-official-academic.mjs` falla si detecta:

- `answer:` dentro de `assessment-data.js`.
- lectura de `.answer` desde `assessment.js`.
- una constante `EXAM_KEYS` dentro de la Edge Function pública.
- arrays de claves numéricas dentro de la migración del banco privado.
- `service_role` o `sb_secret_` dentro de archivos del navegador.

## Migraciones V12 de producción

- `20260810214446_add_authoritative_academic_records.sql`
- `20260810214845_add_verifiable_certificates.sql`
- `20260810214905_add_certificate_audit_log.sql`
- `20260810215913_add_official_exam_attempt_log.sql`
- `20260810220631_add_private_academic_answer_bank.sql`

## Edge Functions

- `academic-validation` · JWT obligatorio.
- `certificate-management` · JWT obligatorio.

La `service_role` solo existe dentro del entorno de Edge Functions de Supabase.
