# V12 · Verificaciones de seguridad ejecutadas

Fecha: 10 de agosto de 2026
Proyecto Supabase: `eqffbegdezlzzffvmsqk`

## 1. Banco privado de respuestas

Tabla: `public.academic_answer_keys`

Comprobaciones realizadas:

- `anon` no tiene privilegio `SELECT`.
- `authenticated` no tiene privilegio `SELECT`.
- RLS está habilitado.
- Existe política explícita `academic_answer_keys_deny_browser`.
- Producción contiene tres registros: uno por cada evaluación final.
- Los valores de `answer_key` no se almacenan en GitHub, ni en `assessment-data.js`, ni dentro del código versionado de `academic-validation`.

El esquema público se encuentra en:

`supabase/migrations/20260810220631_add_private_academic_answer_bank.sql`

Ese archivo debe permanecer sin datos secretos.

## 2. Rotación de evaluaciones finales

Los tres exámenes finales fueron sustituidos por versión 2.

`assessment-data.js` incluye:

- preguntas;
- opciones;
- número de versión;
- requisito de aprobación.

No incluye respuestas correctas.

El cliente envía `level`, `version` y las diez selecciones. El servidor compara `version` con el banco privado antes de calificar. Una versión cacheada/antigua se rechaza sin registrar intento.

## 3. Rate limit académico

Tabla: `exam_attempt_log`.

- Máximo 3 intentos oficiales por nivel dentro de una ventana móvil de 24 horas.
- El intento solo se registra después de validar sesión, versión y prerrequisitos.
- Si el nivel ya figura oficialmente aprobado, el servidor devuelve el resultado existente y no consume otro intento.

## 4. Escritura académica

Tablas:

- `lesson_validations`
- `exam_validations`
- `exam_attempt_log`

El navegador autenticado puede consultar sus registros permitidos por RLS, pero no tiene `INSERT`/`UPDATE` directos sobre las validaciones oficiales. Las escrituras pasan por la Edge Function `academic-validation` con JWT obligatorio.

## 5. Certificado verificable

Se ejecutó una prueba temporal con un código ficticio.

1. Se creó una fila temporal en `certificates`.
2. Bajo rol `anon`, una consulta directa de la tabla devolvió 0 filas visibles.
3. Bajo rol `anon`, `verify_certificate(codigo_exacto)` devolvió únicamente la ficha asociada a ese código.
4. Se eliminó la fila temporal.
5. El recuento final de certificados de prueba quedó en 0.

El verificador no ofrece listados ni búsquedas por nombre.

## 6. Diferencia entre certificado local y oficial

Código local:

`MIRMC-LOCAL-XXXXXX`

Código verificable:

`MIRMC-GE-XXXXXXXXXXXXXXXX`

Solo el segundo formato es emitido por servidor y aceptado por `verify_certificate()`.

## 7. Certificados de prueba

Después de las pruebas de implementación:

- no quedaron certificados temporales;
- no quedaron intentos académicos de prueba;
- no se escribió progreso oficial ficticio en la cuenta del propietario.

## 8. CI

Dos validadores protegen V12:

- `scripts/validate-official-academic.mjs`
- `scripts/validate-v12-hardening.mjs`

Entre otras cosas fallan si detectan:

- `answer:` en el banco público de preguntas finales;
- `EXAM_KEYS` dentro de la Edge Function versionada;
- arrays de claves privadas dentro de la migración pública;
- `service_role` o `sb_secret_` en JavaScript del navegador;
- eliminación de la validación por versión;
- eliminación del rate limit;
- conversión del verificador exact-code en un listado público.

## 9. Advisor

Tras las migraciones V12 se volvió a ejecutar Supabase Security Advisor.

El ajuste operativo pendiente sigue siendo **Leaked Password Protection** en Supabase Auth, que se activa desde Dashboard y no forma parte de la lógica SQL/RLS de estas tablas.
