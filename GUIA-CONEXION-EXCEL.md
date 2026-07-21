# Conexión con Excel Online — Módulo 3

GitHub Pages no puede escribir directamente en un archivo `.xlsx`. Para almacenar las preinscripciones en Excel Online se recomienda crear un flujo en Power Automate.

## Estructura sugerida de la tabla de Excel

Crea una tabla con estas columnas:

- Fecha
- Nombre
- Celular
- Correo
- Curso
- Modalidad
- Horario
- Estado
- Observaciones
- Sincronización

## Flujo sugerido en Power Automate

1. Crea un flujo con el disparador **Cuando se recibe una solicitud HTTP**.
2. Define un esquema JSON compatible con los campos:
   - `createdAt`
   - `name`
   - `phone`
   - `email`
   - `course`
   - `modality`
   - `schedule`
   - `status`
   - `comments`
3. Agrega la acción **Agregar una fila a una tabla** de Excel Online.
4. Selecciona el archivo de OneDrive o SharePoint y la tabla.
5. Relaciona cada campo JSON con su columna.
6. Guarda el flujo y copia la URL HTTP.
7. En el panel administrativo entra a **Configuración** y pega esa URL.

## Seguridad

No publiques credenciales de Microsoft, claves privadas ni secretos dentro de los archivos de GitHub Pages. Para producción conviene proteger el endpoint o usar Firebase/Cloud Functions como intermediario.
