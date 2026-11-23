# Classment — Frontend (Fase 0, nivel terciario)

SPA de gestión académica terciaria para **una sola institución**: carreras, materias anuales,
correlatividades, historial "Día Cero" e inscripción de alumnos a cursadas y mesas de final con
validación de correlatividades **en el backend** (el frontend no contiene lógica de correlativas).

Stack: React 19 · TypeScript · Vite · react-router-dom 7 · CSS Modules con variables CSS
(`src/index.css`). Sin Tailwind ni librerías de UI.

## Requisitos y arranque

1. Levantar el backend [`classment-back`](../classment-back) (`npm run dev`, puerto 3000) con la base sembrada.
2. Configurar el entorno del front:

   ```bash
   cp .env.example .env   # VITE_API_URL=http://localhost:3000/api/v1
   npm install
   npm run dev            # http://localhost:5173
   ```

| Variable       | Descripción                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `VITE_API_URL` | URL base de la API (`/api/v1`). En builds de producción **debe ser HTTPS**. |

Scripts: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run preview`.

## Cuentas demo (seed del backend)

| Rol        | Email                       | Contraseña       |
| ---------- | --------------------------- | ---------------- |
| SuperAdmin | `superadmin@classment.demo` | `SuperAdmin123!` |
| Directivo  | `directivo@classment.demo`  | `Directivo123!`  |
| Docente    | `docente1@classment.demo`   | `Docente123!`    |
| Alumno     | `alumno1@classment.demo`    | `Alumno123!`     |

> Credenciales solo para la demo. Nunca usarlas en producción.

## Pantallas por rol

Después del login (`/`) cada rol es redirigido a su inicio. `AuthGuard` restringe cada grupo de rutas
con `allowedRoles`; un rol sin acceso vuelve a su propio inicio.

| Rol                    | Ruta                                     | Pantalla                                                               |
| ---------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| Directivo / SuperAdmin | `/director`                              | Panel: carreras, materias, alumnos, períodos abiertos + accesos        |
|                        | `/director/carreras`                     | Carreras: listado, alta y edición                                      |
|                        | `/director/carreras/:careerId/materias`  | Materias por año (pestañas), alta/edición y editor de correlatividades |
|                        | `/director/alumnos`                      | Alumnos: listado y alta (DNI, nombre, apellido, email, carrera)        |
|                        | `/director/alumnos/:studentId/historial` | Grilla "Día Cero": estados por materia + origen, guardado masivo       |
|                        | `/director/periodos`                     | Períodos de inscripción (cursada / final + llamado) y ofertas          |
| SuperAdmin             | `/director/institucion`                  | Configuración institucional (`PATCH /institution`)                     |
| Alumno (mobile-first)  | `/alumno`                                | Mi avance: resumen + plan por año                                      |
|                        | `/alumno/inscripciones`                  | Cursadas / Mesas de final (Regular o Libre) con rebote explicado       |
|                        | `/alumno/mis-inscripciones`              | Mis inscripciones con baja de las activas                              |
| Docente                | `/docente`                               | Mis mesas y materias (solo lectura)                                    |

### Guion de demo

1. **Directivo** → Carreras → *Materias y correlatividades* → pestañas por año → *Correlatividades*
   de una materia (agregar una regla que genere ciclo muestra el 409 del backend en un toast).
2. Alumnos → *Historial (Día Cero)* de Lucía Fernández → marcar estados / equivalencias → *Guardar cambios*.
3. **Alumno1** → Mi avance → Inscripciones: *Programación II* → confirmada; *Programación III* →
   *Intentar inscribirme* → modal con los 2 motivos del rechazo. Mesas de final: elegir Regular / Libre.
4. El Directivo marca la materia faltante como Aprobada; el alumno recarga y puede inscribirse.

## Arquitectura

```
src/
  auth/          AuthProvider, contexto, AuthGuard (allowedRoles), almacenamiento y decodificación del JWT
  components/    Componentes de UI genéricos, configurables por props (<Nombre>/<Nombre>.tsx + .module.css)
  config/        Rutas (ROUTES), menú por rol (NAV_ITEMS) y home por rol
  context/       ToastProvider (notificaciones globales)
  hooks/         Lógica de pantallas (useCareersManagement, useStudentHistory, useEnrollmentOffers, ...)
  interfaces/    Contratos espejo del backend (career, subject, correlative, academic-record, ...)
  pages/         Composición pura de componentes (sin HTML crudo ni lógica de negocio)
  services/      Cliente HTTP único (api.client.ts) + un servicio por recurso
  types/         Envelope de la API y RBAC (SuperAdmin / Directivo / Docente / Alumno)
  utils/         Formateo de fechas, etiquetas, traducción de errores de la API
```

- **Cliente API** (`services/api.client.ts`): `get/post/put/patch/delete`, agrega el Bearer token
  (`getHeaders`), desenvuelve `{ success, message, data, errors }` y lanza `ApiError` con `status` y
  `errors` en respuestas no-2xx. Un 401 con sesión activa cierra la sesión. `useApi()` expone el mismo cliente.
- **Errores**: `utils/error.utils.ts` traduce mensajes del backend al español, arma el mensaje de ciclo
  (409) con los nombres de las materias y extrae los motivos de rechazo (422) de las inscripciones.
- **Páginas**: solo componen componentes (`Stack`, `PageSection`, `Table`, `Tabs`, `FormModal`, ...).
  Verificable con `rg "<[a-z]+[ >/]" src/pages` (sin resultados).
- **Estilos**: todos los valores salen de variables de `src/index.css`; no hay colores hardcodeados
  en los módulos CSS.
