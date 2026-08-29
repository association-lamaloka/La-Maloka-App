# Auditoría técnica de La Maloka

**Fecha:** 29 de agosto de 2026  
**Alcance:** repositorio `La-Maloka-App` (rama `work`), frontend React/Vite, servidor Express, Firestore, sincronización Google Sheets/HelloAsso y configuración de despliegue disponible en el repositorio.  
**Limitación:** el entorno de auditoría no pudo acceder a `https://lamaloka.fr` (el proxy devolvió HTTP 403), por lo que TLS, DNS, cabeceras efectivas, cookies, rutas desplegadas y la correspondencia exacta entre GitHub, Vercel y OVH deben comprobarse desde una red autorizada.

## 1. Resumen ejecutivo

El proyecto compila y pasa el chequeo TypeScript, pero **no es seguro para almacenar inscripciones, formularios de salud ni credenciales administrativas en producción** en su estado actual. La causa principal no es Firebase en sí, sino el modelo de confianza: el navegador recibe el acceso directo a Firestore, las reglas permiten leer, crear, modificar y borrar todos los documentos sin autenticación, y el “login” administrativo se decide enteramente en JavaScript del cliente mediante contraseñas públicas o guardadas sin hash.

### Evaluación global

| Área | Nivel | Diagnóstico |
|---|---:|---|
| Confidencialidad / RGPD | **Crítico** | Inscripciones y datos de salud son públicamente legibles; además se duplican en el navegador y Google Sheets. |
| Autenticación y autorización | **Crítico** | No hay identidad de servidor ni roles verificables; existen contraseñas de respaldo incluidas en el bundle. |
| Integridad de datos | **Crítico** | Cualquier visitante puede editar/borrar clases, ajustes, inscripciones y formularios. |
| API del servidor | **Alto** | El scraper acepta URLs arbitrarias (SSRF), no tiene autenticación, límites ni control de volumen. |
| Estabilidad de datos | **Alto** | Escrituras no atómicas, IDs predecibles y varias fuentes de verdad generan carreras y divergencias. |
| Rendimiento | **Medio-alto** | Bundle JS de 1,66 MB minificado y suscripciones completas sin paginación. |
| Operación/despliegue | **Alto** | No hay configuración Vercel/OVH, CI, pruebas, observabilidad, backups o procedimientos documentados. |
| Calidad de compilación | **Aceptable** | `tsc --noEmit` y el build terminan correctamente, aunque Vite advierte del chunk principal. |

**Decisión recomendada:** tratar esto como un prototipo público y ejecutar primero la fase de contención. No añadir más datos reales hasta cerrar SEC-01 a SEC-05, rotar secretos/códigos expuestos y evaluar si ya hubo accesos no autorizados en los logs de Firebase y Google.

## 2. Arquitectura observada y flujos de datos

```text
Navegador React
  ├─ conexión directa a Firestore
  │   ├─ site_settings (incluye adminPassword)
  │   ├─ classes
  │   ├─ inscriptions (nombre, email, teléfono)
  │   └─ health_forms (salud, emergencia y firma)
  ├─ localStorage (copias de ajustes, inscripciones, recibos, miembros y secretos)
  ├─ POST directo a Google Apps Script, en modo no-cors
  └─ POST a Express /api/helloasso/*
          └─ fetch servidor hacia URL suministrada por el cliente
```

Firebase se inicializa directamente en el frontend con la configuración del proyecto. Que una API key web de Firebase sea visible es normal; **su seguridad depende de reglas estrictas, autenticación, App Check y restricciones de la clave**, actualmente ausentes o no demostrables en el repositorio.

El servidor Express sirve Vite en desarrollo, archivos estáticos en producción y dos endpoints de scraping. No actúa como capa de autorización de Firestore. No se encontró `vercel.json`, Dockerfile, workflow CI/CD, manifiesto OVH ni documentación de arquitectura/deploy. Por tanto, no puede asegurarse que `server.ts` se ejecute correctamente como función serverless en Vercel: mantiene un listener persistente en el puerto fijo 3000.

## 3. Hallazgos priorizados

### Críticos — actuar inmediatamente

#### SEC-01 — Firestore permite acceso público total a datos personales y de salud

**Evidencia:** las cuatro colecciones usan `allow write: if true` o `allow read, write: if true`. Los comentarios prometen acceso administrativo, pero ninguna regla comprueba `request.auth` ni roles.

**Impacto:** cualquier persona que conozca la configuración pública de Firebase puede extraer en masa nombres, emails, teléfonos, contactos de emergencia, respuestas médicas y firmas; también modificar o borrar todo. Esto puede constituir una violación de datos personales y, para datos de salud, de categoría especial bajo RGPD.

**Acción inmediata:**

1. Aplicar reglas “deny by default”; detener temporalmente formularios si no existe aún un backend seguro.
2. Prohibir lectura pública de `inscriptions` y `health_forms`.
3. Permitir creación pública únicamente a través de un endpoint servidor autenticado con App Check, validación de esquema, rate limit y CAPTCHA; nunca permitir `update/delete/read` anónimos.
4. Implementar Firebase Authentication y claims de rol (`admin`) emitidos solo desde Admin SDK.
5. Revisar Audit Logs y exportaciones; preservar evidencias y activar el procedimiento de brecha si corresponde.

#### SEC-02 — El back-office no tiene autenticación real

**Evidencia:** el cliente compara texto plano y acepta los fallbacks `MALOKA-ADMIN-78` y `admin`; el password por defecto está en datos, interfaz y bundle. El estado de login solo vive en React, mientras Firestore permanece abierto incluso sin pasar por esa pantalla.

**Impacto:** acceso trivial a la interfaz administrativa y a operaciones destructivas. Cambiar la contraseña desde la UI no revoca los códigos de respaldo ni protege Firestore.

**Acción inmediata:** retirar todos los passwords cliente y fallbacks; rotarlos donde hayan sido reutilizados; autenticar con Firebase Auth/OIDC, MFA obligatorio para administradores, sesión segura y autorización de servidor por custom claims. La UI debe ocultar acciones, pero las reglas/API deben ser la autoridad.

#### SEC-03 — `site_settings` publica la contraseña administrativa

**Evidencia:** el esquema declara `adminPassword` en `site_settings`; esa colección tiene lectura pública, se suscribe desde todos los navegadores y se copia a `localStorage`.

**Impacto:** exfiltración directa de la credencial actual. Aunque se protegiera la pantalla, cada visitante podría leer el secreto desde Firestore, DevTools o el almacenamiento local.

**Acción inmediata:** eliminar el campo de Firestore y de los tipos/configuración, migrar y borrar todas sus versiones/backups, rotar la contraseña y no almacenar credenciales recuperables. Usar el proveedor de identidad.

#### SEC-04 — Datos personales y secretos persistentes en `localStorage`

**Evidencia:** la aplicación replica todas las inscripciones y recibos; también almacena miembros, password administrativo, URL de webhook y token de Google Sheets. `localStorage` no cifra, no expira y cualquier JavaScript ejecutado en el origen puede leerlo.

**Impacto:** exposición en equipos compartidos, XSS, extensiones, copias del perfil y sesiones administrativas abandonadas. También provoca que un visitante reciba y conserve el conjunto completo de inscritos gracias a la suscripción pública.

**Acción inmediata:** no cachear PII ni secretos; usar cookies `HttpOnly`, `Secure`, `SameSite` para una sesión corta, y cargar datos administrativos bajo demanda, paginados y tras autorización. Borrar las claves históricas con una migración controlada.

#### SEC-05 — Webhook/token de Google Sheets público y resultado falso positivo

**Evidencia:** existe un token por defecto hardcoded, se guarda en `localStorage` y se envía desde el navegador. El modo `no-cors` produce una respuesta opaca, por lo que el código afirma éxito sin conocer el HTTP real. La UI incluso imprime el token y genera el script con él.

**Impacto:** cualquiera puede falsificar eventos o extraer el token del bundle/navegador; pérdidas silenciosas, duplicados y divergencia entre Firestore y Sheets. Se multiplica la superficie RGPD.

**Acción inmediata:** rotar el token; mover el webhook y secreto a variables de entorno del backend; firmar cuerpo + timestamp con HMAC, impedir replay, usar IDs idempotentes, comprobar respuestas y registrar/reintentar fallos. Definir Firestore (o una base transaccional) como única fuente de verdad y Sheets solo como exportación.

### Altos — resolver antes de una nueva campaña

#### API-01 — SSRF en endpoints HelloAsso

El servidor acepta cualquier cadena que empiece por `http` y hace `fetch` siguiendo redirecciones. Un atacante puede intentar acceder a `localhost`, metadatos cloud, servicios internos o destinos arbitrarios mediante `/api/helloasso/scrape` y por lote.

**Mitigación:** aceptar únicamente `https`, validar con `new URL`, allowlist exacta de dominios HelloAsso y volver a validar cada redirección; resolver DNS y bloquear IP privadas/link-local/loopback; limitar tamaño de respuesta y tipo MIME. Preferir la API oficial de HelloAsso con credenciales servidor.

#### API-02 — Sin autenticación, rate limiting ni límites de lote/cuerpo

Los endpoints públicos pueden generar fetches salientes y `Promise.all` sin límite sobre una lista proporcionada por el usuario. `express.json()` tampoco fija explícitamente un límite de negocio. Esto facilita abuso, costes, saturación de sockets y denegación de servicio.

**Mitigación:** autenticar jobs administrativos, rate limit por identidad/IP, límite pequeño de elementos, cola con concurrencia controlada, timeout global, límite de bytes y caché. Responder 429 y emitir métricas.

#### DAT-01 — Reserva de plazas con carrera y datos manipulables

El cliente calcula ocupación sobre un snapshot posiblemente obsoleto y crea el documento por separado. Dos usuarios pueden recibir la última plaza simultáneamente; además el cliente decide clase, estado y precio. `Date.now()` es predecible y una colisión puede sobrescribir una inscripción.

**Mitigación:** endpoint/Cloud Function con transacción Firestore que valide clase activa, capacidad y campos permitidos, use ID aleatorio servidor, `serverTimestamp`, idempotency key y contadores protegidos. El servidor decide estado/precio.

#### DAT-02 — Escrituras parciales y múltiples fuentes de verdad

`saveClassesToCloud` y el seed escriben secuencialmente sin batch/transacción. El estado se duplica entre defaults del bundle, `localStorage`, Firestore y Sheets. Algunos errores solo se imprimen y la UI continúa como si la operación hubiera funcionado.

**Mitigación:** fuente canónica única; batches/transacciones; control de versión (`updatedAt` servidor y versión); estado explícito pending/success/error; reintentos idempotentes y reconciliación periódica. Evitar que cada primer visitante haga seed de datos.

#### PRIV-01 — Minimización, consentimiento y retención no demostrados

Se procesan información de salud, firma, nacimiento, dirección y contacto de emergencia, pero no se observa política técnica de retención, borrado, exportación, registro de consentimiento por versión, separación de accesos ni cifrado de aplicación. Los datos demo con aspecto real también deben etiquetarse inequívocamente.

**Mitigación:** inventario/ROPA, base jurídica y DPIA con asesoramiento competente; minimizar campos; separar salud de operaciones; cifrado con KMS si el riesgo lo requiere; retención automática; acceso “need to know”; trazabilidad inmutable; procesos DSAR/borrado; contratos de encargado con Google, Vercel, OVH/Firebase y ubicación de datos verificadas.

#### OPS-01 — Despliegue no reproducible ni verificable

No hay configuración de Vercel, pipeline, entornos, protección de previews o documentación OVH. `PORT` está fijado a 3000 y el servidor llama `listen`, patrón que no corresponde por defecto a una función Vercel. El dominio no fue accesible desde esta auditoría.

**Mitigación:** decidir una arquitectura: (A) frontend estático Vercel + API/Functions explícitas, o (B) contenedor Node en OVH. Versionar IaC/configuración, usar `process.env.PORT`, health/readiness, entornos separados y promoción de artefactos. Documentar DNS y una sola ruta de tráfico; evitar un “tránsito” ambiguo entre proveedores.

#### OPS-02 — Sin backups, recuperación ni observabilidad demostrables

No hay política o scripts de backup/restore, alertas, SLO, errores centralizados ni runbooks. Un borrado público podría no detectarse hasta después de perder la ventana de recuperación.

**Mitigación:** PITR/backup programado de Firestore en proyecto/ubicación separada; prueba trimestral de restauración; logs estructurados con redacción de PII; alertas sobre errores, latencia, escrituras/borrados anómalos y coste; SLO y runbook de incidentes.

#### SUP-01 — Riesgo de cadena de suministro no evaluable con el flujo npm actual

El repositorio solo incluye `bun.lock`; `npm audit` falla al no existir `package-lock.json`. Hay rangos con `^` y no se observa Dependabot/Renovate ni análisis CI. La librería `xlsx` procesa/exporta datos sensibles y debe revisarse especialmente.

**Mitigación:** estandarizar Bun o npm en local y CI con lockfile congelado; ejecutar el auditor compatible, revisión de licencias, secret scanning, CodeQL/SAST y actualizaciones automáticas controladas. No generar otro lockfile sin decidir antes el gestor oficial.

### Medios

#### PERF-01 — Bundle inicial excesivo

El build genera un JS minificado de **1.658,93 kB (449,01 kB gzip)** y Vite advierte que supera 500 kB. El back-office (aprox. 276 kB de fuente), hub Sheets, Firebase y `xlsx` entran en la carga inicial aunque la mayoría de visitantes no los use.

**Mitigación:** `React.lazy`/dynamic import por pestaña, especialmente BackOffice, Google Sheets y Payment; importar `xlsx` solo al exportar; separar vendors; medir Lighthouse/Web Vitals con presupuestos (JS inicial objetivo <200 kB gzip).

#### PERF-02 — Suscripciones sin consulta ni paginación

Las inscripciones y formularios se descargan como colecciones completas mediante `onSnapshot`; hay imports de `query/orderBy` sin aplicar. El coste, memoria y exposición crecen linealmente.

**Mitigación:** consultas administrativas autorizadas, paginadas, con límites/índices; resúmenes agregados para el público; suscribirse solo a lo visible y desuscribirse al salir.

#### QUAL-01 — Componentes monolíticos y ausencia de pruebas

`BackOffice.tsx` supera cinco mil líneas y no hay suites unitarias, integración ni E2E. La lógica de seguridad, persistencia y UI está mezclada, haciendo regresiones probables.

**Mitigación:** separar por dominios y hooks; API tipada con validación runtime (p. ej. Zod); tests de reglas Firestore en emulador, API (SSRF/rate limit), transacciones de cupos y E2E de inscripción/admin. Establecer cobertura de rutas críticas, no solo porcentaje global.

#### WEB-01 — Hardening HTTP no visible

Express no configura Helmet/CSP, HSTS, `frame-ancestors`, `nosniff`, política de referrer/permisos ni CORS explícito. Estas cabeceras podrían existir en Vercel/OVH, pero no pueden demostrarse desde el código ni desde la prueba externa bloqueada.

**Mitigación:** definirlas como código en la capa que realmente responde. CSP estricta con inventario de Firebase/Google/medios, HTTPS + HSTS tras validar subdominios, `frame-ancestors 'none'`, `nosniff`, referrer policy y permisos mínimos. Evitar CSP basada en `unsafe-inline`.

#### QUAL-02 — Manejo de errores y defaults engañosos

Varios `catch` están vacíos o solo hacen log. El parser HelloAsso inventa valores (`300` días y `subscribers * 198`) cuando no puede analizar; el batch puede marcar sincronizado aunque el HTML no contenga datos válidos. Esto puede producir decisiones administrativas incorrectas.

**Mitigación:** representar “desconocido” como `null`, validar `parsedSuccessfully`, conservar el último dato confirmado con estado stale y mostrar errores. Añadir contratos/fixtures del parser y migrar a API oficial.

## 4. Aspectos positivos

- TypeScript compila sin errores y el build de producción finaliza.
- Los listeners Firestore se desuscriben al desmontar `App`.
- Los fetch de HelloAsso tienen timeout y no vuelcan el HTML completo en logs.
- `.env*` está ignorado salvo el ejemplo y no se detectaron claves privadas PEM ni un `GEMINI_API_KEY` real versionado.
- El formulario utiliza componentes React, lo que reduce el riesgo de inyección HTML directa; no se encontró `dangerouslySetInnerHTML`.

Estos puntos no compensan los controles críticos ausentes, pero son una base útil para la remediación.

## 5. Plan de remediación propuesto

### Fase 0 — Contención (0–24 horas)

1. Exportar un backup, habilitar PITR y conservar logs.
2. Cerrar reglas Firestore a todo acceso no imprescindible; si hace falta, poner formularios en mantenimiento.
3. Rotar códigos admin/adherente y token Google Sheets; revisar si fueron reutilizados.
4. Eliminar `adminPassword` de documentos y revocar accesos sospechosos.
5. Revisar Firebase/Google Cloud Audit Logs, Apps Script executions y Vercel/OVH logs; documentar la decisión RGPD.

### Fase 1 — Frontera segura (2–7 días)

1. Firebase Auth/OIDC + MFA + custom claims; cuentas individuales, nunca un password compartido.
2. Nuevas reglas Firestore testeadas con Emulator Suite: público solo catálogo, admin autorizado, PII nunca pública.
3. Backend para inscripción/health/webhook con App Check/CAPTCHA, validación de esquema, rate limit e idempotencia.
4. Corregir SSRF y límites HelloAsso; secreto Sheets solo servidor.
5. Retirar y limpiar PII/secrets de `localStorage`.

### Fase 2 — Integridad y operación (1–3 semanas)

1. Transacciones para aforo y workflow de espera; timestamps e IDs de servidor.
2. Modelo de datos versionado, índices, retención y roles separados para salud.
3. CI con lockfile congelado, lint/build/tests de reglas/API/E2E, SAST, dependencias y secretos.
4. Backups restaurables, logs sin PII, alertas/SLO y runbooks.
5. Arquitectura/deploy reproducible y entornos dev/staging/prod aislados.

### Fase 3 — Fluidez y mantenibilidad (3–6 semanas)

1. Code splitting y carga diferida del back-office/exportaciones.
2. Paginación y agregados en vez de colecciones completas.
3. Dividir componentes monolíticos, contratos runtime y manejo uniforme de errores.
4. Pruebas de carga, Lighthouse/Web Vitals y presupuesto de bundle.
5. Ejercicio de restauración e incidente; revisión externa de seguridad antes del go-live definitivo.

## 6. Arquitectura objetivo mínima

```text
Visitante ──HTTPS──> CDN/frontend estático
    │                    └─ contenido público (sin PII)
    └─ App Check/CAPTCHA + request validado
                         ↓
                 API/Cloud Functions
                 ├─ Auth + RBAC/MFA
                 ├─ rate limit + schemas
                 ├─ transacciones/idempotencia
                 ├─ secretos en Secret Manager
                 └─ logs redactados
                         ↓
                   Firestore privado
                 ├─ catálogo público separado
                 ├─ inscripciones
                 └─ salud (acceso más restringido/retención)
                         │
                         └─ job asíncrono → HelloAsso/Sheets
```

## 7. Pruebas realizadas

| Comando | Resultado |
|---|---|
| `npm run lint` | Correcto: TypeScript sin errores. |
| `npm run build` | Correcto con advertencia: chunk JS principal de 1.658,93 kB. |
| `npm audit --omit=dev --json` | No ejecutable: npm exige `package-lock.json`; el repo utiliza `bun.lock`. No equivale a “cero vulnerabilidades”. |
| `rg` de secretos, auth, storage y sinks | Identificó credenciales/códigos por defecto y almacenamiento cliente; no encontró clave Gemini real, PEM ni `dangerouslySetInnerHTML`. |
| `curl -sSIL https://lamaloka.fr` | No concluyente: proxy del entorno devolvió 403 antes de llegar al sitio. |
| `curl -sSIL https://www.lamaloka.fr` | No concluyente: misma limitación de red. |

## 8. Criterios de salida antes de tratar datos reales

- [ ] Ninguna lectura pública de inscripciones o salud; tests de reglas prueban denegación.
- [ ] Ningún secreto/password/código de autorización en bundle, Firestore público o `localStorage`.
- [ ] Administradores individuales con MFA y autorización servidor.
- [ ] Inscripción transaccional, validada e idempotente; prueba de concurrencia sobre última plaza.
- [ ] SSRF, abuso y payloads masivos bloqueados por tests.
- [ ] Inventario RGPD, retención/borrado y contratos/subencargados revisados.
- [ ] Backup restaurado con éxito y alertas verificadas.
- [ ] CI obligatorio y deploy reproducible en un entorno staging aislado.
- [ ] Escaneo externo del dominio confirma TLS/cabeceras/cookies/rutas y ausencia de endpoints alternativos.
- [ ] Revisión manual de logs concluye si existió exposición previa y qué notificación corresponde.

## 9. Comprobaciones externas pendientes

Desde una red con acceso al dominio se debe registrar: cadena DNS (`A/AAAA/CNAME`), terminación TLS y versiones, redirecciones canónicas, cabeceras, cookies, CSP, caché, endpoints `/api`, origen real (Vercel u OVH), protección de previews, `security.txt`, robots/sitemap, puertos expuestos y comportamiento ante rate limiting. En Firebase Console: reglas efectivamente desplegadas (pueden diferir del repo), Authentication, App Check, restricciones de API key, IAM/service accounts, Audit Logs, PITR/backups, región y presupuestos/alertas.

> Esta es una auditoría técnica de caja blanca del código disponible, no una certificación, un pentest intrusivo ni asesoramiento jurídico. Los hallazgos críticos son explotables por diseño y deben verificarse/contenerse sin intentar explotar datos reales.
