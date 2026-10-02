# Remisiones de Despacho

Aplicación web ligera (HTML + Tailwind CSS vía CDN + JavaScript Vanilla) para buscar materiales de construcción e industria en el inventario, armar una lista de despacho y generar la **remisión en Excel** con el formato oficial de la empresa.

## Cómo usarla

- **Sin instalación:** abra `index.html` en el navegador (funciona también con doble clic, `file://`).
- **Servidor local:** `python3 -m http.server 8080` y abra <http://localhost:8080>.
- **GitHub Pages:** en *Settings → Pages* elija la rama y la carpeta `/ (root)`.

Necesita conexión a internet para cargar Tailwind y JSZip desde sus CDN.

### Flujo

1. Escriba en el buscador (filtra en tiempo real, sin importar tildes ni mayúsculas; admite varias palabras: `tuberia 4 sch 40`). También puede filtrar por categoría.
2. Marque el ítem o escriba una cantidad (con `−`/`+` o el teclado). Se agrega a la **Lista de despacho**.
3. En la lista ajuste cantidades y escriba las *Novedades* de cada ítem.
4. Llene los datos de la remisión (obra/proyecto, fecha, responsable, observaciones, quién entrega/recibe). Obra y personas se autocompletan con la hoja *CODIFICACION DE CLIENTES* de la plantilla.
5. Presione **Generar Remisión (.xlsx)**.

En celular la lista de despacho se abre desde la barra inferior; en PC queda fija a la derecha. La lista y los datos se guardan como borrador en el navegador. Si "Descontar cantidades del stock" está activo, el stock se rebaja al generar (botón *Restablecer* para volver a los datos de prueba).

## Formato de la remisión

`assets/plantilla_remision.xlsx` es el formato base (`FLORA_FOOD.xlsx`) sin los datos de la obra de ejemplo. La app abre esa plantilla con JSZip y escribe **solo los valores** en las celdas, así que el archivo final conserva el logo, los estilos, bordes, celdas combinadas, la lista desplegable de unidades, el área de impresión y la segunda hoja.

| Campo | Celda(s) |
|---|---|
| Obra o proyecto | `A7` (A7:C7) |
| Fecha | `D7` (D7:E7) |
| Actualización del contenido | `F7` (F7:G7) |
| Ítems (máx. 106) | filas `10`–`115`: `B` descripción · `D` cantidad · `E` unidad · `F` referencia · `G` novedades (la columna `A` ya trae la numeración) |
| Observaciones | `A116` (A116:G117) |
| Quién entrega / Quién recibe | `A122` / `E122` |

El mapa está en la constante `FORMATO` de `js/app.js`.

Si modifica la plantilla, regenere la versión embebida (lo que permite abrir la app sin servidor):

```bash
node scripts/embed-template.js
```

## Estructura

```
index.html                 Interfaz (Tailwind CDN)
js/app.js                  Buscador, checklist, lista de despacho y generación del .xlsx
js/inventario.js           Datos de prueba (perfiles HEA/IPE/UPN, tubería, válvulas, accesorios…)
js/plantilla.js            Plantilla .xlsx embebida en Base64 (generada)
assets/plantilla_remision.xlsx  Formato base de la remisión
scripts/embed-template.js  Regenera js/plantilla.js
```

Para usar un inventario real, reemplace el arreglo de `js/inventario.js` con los mismos campos: `ref`, `descripcion`, `categoria`, `unidad`, `stock`, `ubicacion`.
