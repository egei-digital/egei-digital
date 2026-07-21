# EGEI Digital — Sitio web

Landing page institucional preparada para publicarse gratuitamente en GitHub Pages.

## Estructura

- `index.html`: página principal.
- `assets/css/style.css`: diseño y versión adaptable.
- `assets/js/main.js`: menú móvil, cursos, WhatsApp y botón para volver arriba.
- `assets/images/`: logo, banner e imágenes optimizadas en WebP.

## Antes de publicar

1. Abre `assets/js/main.js`.
2. Cambia:

```js
const WHATSAPP_NUMBER = "59100000000";
```

por el número oficial, incluyendo `591` y sin espacios ni símbolos.

3. Revisa en `index.html`:
   - Dirección.
   - Nombre institucional.
   - Duraciones de los cursos.
   - Enlaces sociales cuando estén disponibles.

## Publicar en GitHub Pages

1. Ingresa a GitHub con el usuario `egei-digital`.
2. Crea un repositorio público llamado `egei-digital`.
3. Sube todo el contenido de esta carpeta, conservando la estructura.
4. Abre **Settings → Pages**.
5. En **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
6. Guarda los cambios.

La dirección será:

`https://egei-digital.github.io/egei-digital/`

## Probar en tu computadora

Puedes abrir `index.html` directamente. Para una prueba más fiel, usa Visual Studio Code con la extensión **Live Server**.

## Imágenes

Las imágenes suministradas fueron convertidas a WebP para reducir el tiempo de carga. Conserva los archivos originales fuera del repositorio como respaldo.
