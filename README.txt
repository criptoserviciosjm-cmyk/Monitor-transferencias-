# INV J.B (PWA para Netlify)

## Qué incluye
- Interfaz estilo "monitor de tasas" (solo lectura para clientes).
- Botón **Actualizar** para recargar `rates.json`.
- Botón **Editar** (requiere clave) que genera/descarga un `rates.json` nuevo con:
  - tasas
  - fecha y hora de última actualización (automático)

## Cómo publicar en Netlify
1. Sube **todo el contenido del ZIP** como sitio (drag & drop) o desde un repo.
2. Listo: es una PWA instalable (Android/iOS/desktop).

## Cómo cambiar las tasas
1. Abre el sitio y toca **Editar**.
2. Ingresa la clave (por defecto): `INVJB2026`
3. Cambia los valores y presiona **Descargar rates.json**.
4. Reemplaza el archivo `rates.json` del sitio por el nuevo y vuelve a desplegar en Netlify.

> Nota: en hosting estático, el navegador no puede "guardar" cambios en el servidor sin backend.
> Por eso se descarga el JSON para que lo vuelvas a subir.

## Cambiar la clave de admin
Edita `app.js` y cambia:
`const ADMIN_PASS = "INVJB2026";`
