# UrbanInspect

Aplicación móvil para el registro y seguimiento de incidencias en infraestructura urbana, desarrollada con Ionic y Angular.

## Tecnologías y Justificación
- **Ionic + Angular Standalone:** Arquitectura moderna basada en componentes para un desarrollo ágil y multiplataforma.
- **Capacitor:** Utilizado para el acceso al hardware nativo:
  - `@capacitor/camera`: Captura de evidencia fotográfica.
  - `@capacitor/geolocation`: Obtención de coordenadas GPS.
  - `@capacitor/preferences`: Almacenamiento local seguro para borradores y seguimiento.
- **MockAPI:** Backend REST simulado para consultar, crear y actualizar incidencias (R2, R3, R5, R9).
- **Open-Meteo:** API climática real sin necesidad de clave. Se usa para alertar si la lluvia supera los 5mm (R4).
- **Cloudinary:** Almacenamiento externo. Se sube la foto y se guarda la URL pública en MockAPI para no perder la imagen (R6).

## Decisiones Técnicas
- **Optimistic UI:** El listado y el detalle muestran datos locales de inmediato para evitar que la app se congele si MockAPI tarda en responder.
- **Borradores (R8):** El formulario de registro guarda automáticamente los datos en el teléfono. Si la app se cierra, al abrir ofrece recuperar el progreso.
- **Paginación Real (R3):** Uso de `ion-infinite-scroll` pidiendo páginas de 5 en 5 al servidor. Se detiene automáticamente al llegar al final.

## Instrucciones de Ejecución
1. `npm install`
2. `ionic serve` (para pruebas en navegador).
3. Para Android: `ionic build`, `npx cap sync`, `npx cap open android`.

## Datos del Estudiante
- **Nombre:** [Mario Endara]
- **Materia:** Desarrollo de Aplicaciones Móviles
- **Institución:** EPN
