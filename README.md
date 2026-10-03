# Remisiones de Despacho

Aplicación web ligera (HTML + Tailwind CSS vía CDN + JavaScript Vanilla) para buscar herramientas y equipos en el inventario (`Inventario_2.xlsx`), armar una lista de despacho y generar la **remisión en Excel** con el formato oficial de la empresa.

## Cómo usarla

- **Sin instalación:** abra `index.html` en el navegador (funciona también con doble clic, `file://`).
- **Servidor local:** `python3 -m http.server 8080` y abra <http://localhost:8080>.
- **GitHub Pages:** en *Settings → Pages* elija la rama y la carpeta `/ (root)`.

Necesita conexión a internet para cargar Tailwind, JSZip y SheetJS desde sus CDN.

### Flujo

1. Escriba en el buscador (filtra en tiempo real, sin importar tildes ni mayúsculas; admite varias palabras: `taladro bosch`, una placa `ESIDM011`, un serial o una ubicación `Malambo`). También puede filtrar por hoja del inventario.
2. Marque el ítem o escriba una cantidad (con `−`/`+` o el teclado). Se agrega a la **Lista de despacho**.
3. En la lista ajuste cantidades y escriba las *Novedades* de cada ítem.
4. Llene los datos de la remisión (obra/proyecto, fecha, responsable, observaciones, quién entrega/recibe). Obra y personas se autocompletan con la hoja *CODIFICACION DE CLIENTES* de la plantilla.
5. Presione **Generar Salida de Herramienta (.xlsx)**.

En celular la lista de despacho se abre desde la barra inferior; en PC queda fija a la derecha.

### Guardado automático y "me faltó algo"

- Cada cambio (marcar un ítem, cambiar una cantidad, escribir novedades o datos del formulario) se guarda en el `localStorage` del navegador (`saveToLocalStorage` en `js/app.js`).
- Al abrir la página se recupera la salida en curso (`loadFromLocalStorage`): la lista de despacho se reconstruye y el buscador muestra los ítems marcados con sus cantidades.
- **Generar la salida no borra nada.** Si faltó algo, se agrega y se vuelve a generar; el pie del panel indica cuántas veces se ha descargado.
- **Nueva remisión** (arriba de la lista) es lo único que borra la lista guardada. Si la casilla está marcada, en ese momento se descuenta del stock lo despachado (*Restablecer stock* vuelve a las cantidades del Excel).
- El guardado es por navegador y dispositivo: lo armado en el celular no aparece en el PC.

## Inventario

El inventario por defecto (`js/inventario.js`) se generó de **Inventario_2.xlsx**: 616 ítems de las hojas *Herramienta eléctrica*, *Generadores, vehículos y montacargas*, *Herramienta mecánica*, *Herramienta manual* y *Equipos de cómputo e impresoras*. Se omiten las hojas ocultas (*Tabla1*, copia de herramienta mecánica; *Convenciones*) y *Locaciones IDM*, que no es inventario despachable.

| Columna del inventario | Uso en la app / remisión |
|---|---|
| EQUIPO o DESCRIPCION + CLASE + MARCA | DESCRIPCIÓN |
| PLACA DE INVENTARIO | REFERENCIA |
| CANT (vacío = 1) | stock disponible |
| MODELO, SERIAL, UBICACIÓN, OBSERVACIONES | se muestran y se pueden buscar |
| ESTADO / OBSERVACIONES = INACTIVO | se marca en rojo y avisa al agregarlo |

**Ítems que no están en el inventario:** botón **+ Agregar** (junto al buscador, o desde el aviso "Agregar … como ítem nuevo" cuando una búsqueda no encuentra nada). Se piden descripción, placa, modelo/serial, cantidad, unidad, categoría y ubicación, y se puede mandar directo a la lista de despacho. Quedan guardados en ese navegador, marcados como *AGREGADO*, y se pueden eliminar desde su tarjeta. Para que todos los usuarios los vean, agréguelos al Excel de inventario.

**Actualizar el inventario:**

- Desde la app: botón **Cargar inventario** y elija el Excel actualizado (mismo formato). Queda guardado en ese navegador.
- Para todos los usuarios: regenere el archivo por defecto y súbalo al repositorio:

  ```bash
  npm install xlsx
  node scripts/build-inventario.js ruta/Inventario_2.xlsx
  ```

Las columnas se ubican por el nombre del encabezado, así que agregar hojas o mover columnas no rompe la lectura.

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
js/parser.js               Lector del Excel de inventario (navegador y Node)
js/inventario.js           Inventario por defecto (generado de Inventario_2.xlsx)
js/plantilla.js            Plantilla .xlsx embebida en Base64 (generada)
assets/plantilla_remision.xlsx  Formato base de la remisión
scripts/embed-template.js  Regenera js/plantilla.js
scripts/build-inventario.js  Regenera js/inventario.js desde el Excel
```
