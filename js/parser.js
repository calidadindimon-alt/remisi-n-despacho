/* Lector del Excel de inventario (formato "Inventario_2.xlsx").
 * Se usa en el navegador (botón "Cargar inventario") y en Node (scripts/build-inventario.js),
 * así ambos convierten el Excel exactamente igual.
 *
 * Reglas:
 * - Se leen las hojas visibles que tienen una fila de encabezado con ITEM, EQUIPO o DESCRIPCION y CANT.
 * - Las columnas se ubican por el nombre del encabezado (no por posición), porque varían entre hojas.
 * - Cada fila con nombre de equipo es un ítem. Si CANT está vacío se toma 1.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.InventarioParser = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VACIOS = new Set(['', 'N/A', 'NA', 'N.A', '??', '?', '#VALUE!', '#N/A', '#REF!', 'NONE', 'NULL', '-']);

  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

  function limpio(v) {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/\s+/g, ' ').trim();
    return VACIOS.has(s.toUpperCase()) ? '' : s;
  }

  const CAMPOS = {
    item: (h) => h === 'item',
    nombre: (h) => h === 'equipo' || h === 'descripcion',
    marca: (h) => h === 'marca',
    modelo: (h) => h === 'modelo',
    serial: (h) => h === 'serial',
    placa: (h) => h.startsWith('placa'),
    clase: (h) => h === 'clase',
    cant: (h) => h === 'cant' || h === 'cantidad',
    observaciones: (h) => h === 'observaciones',
    ubicacion: (h) => h === 'ubicacion',
    estado: (h) => h === 'estado'
  };

  const CATEGORIAS = {
    'herramienta electrica': 'Herramienta eléctrica',
    'herramienta mecanica': 'Herramienta mecánica',
    'herramienta manual': 'Herramienta manual',
    'generadores, vehiculos y mtcgas': 'Generadores, vehículos y montacargas',
    'equipos de computos impresoras': 'Equipos de cómputo e impresoras'
  };

  function nombreCategoria(hoja) {
    const n = norm(hoja);
    if (CATEGORIAS[n]) return CATEGORIAS[n];
    const t = String(hoja).trim().toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  const capital = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

  /** Convierte las filas (matriz) de una hoja en ítems. Devuelve [] si la hoja no es de inventario. */
  function parseHoja(nombreHoja, filas) {
    const fi = filas.slice(0, 15).findIndex((f) => f && norm(f[0]) === 'item');
    if (fi < 0) return [];
    const enc = filas[fi].map(norm);
    const col = {};
    for (const [campo, test] of Object.entries(CAMPOS)) {
      const i = enc.findIndex((h) => test(h));
      if (i >= 0) col[campo] = i;
    }
    if (col.nombre === undefined || col.cant === undefined) return [];

    const categoria = nombreCategoria(nombreHoja);
    const prefijo = norm(nombreHoja).split(/[^a-z]+/).filter(Boolean).map((w) => w.slice(0, 3)).join('').toUpperCase();
    const items = [];
    for (let r = fi + 1; r < filas.length; r++) {
      const f = filas[r] || [];
      const get = (c) => (col[c] === undefined ? '' : limpio(f[col[c]]));
      const nombre = get('nombre');
      if (!nombre || /^columna\d+$/i.test(nombre) || /^columna\d+$/i.test(limpio(f[0]))) continue;

      const marca = get('marca');
      const modelo = get('modelo');
      const clase = get('clase');
      const serial = get('serial');
      const placa = get('placa');
      const cantTxt = get('cant').replace(',', '.');
      const cant = cantTxt !== '' && Number.isFinite(Number(cantTxt)) ? Number(cantTxt) : 1;
      const estado = get('estado').toUpperCase();
      const obs = get('observaciones');

      // La clase y la marca se agregan solo si no están ya en el nombre (evita "SOLDADURA MIG MIG").
      const extra = [clase, marca].filter((x) => x && !norm(nombre).split(' ').includes(norm(x)) && !norm(nombre).includes(norm(x) + ' '));
      const descripcion = [nombre, ...extra].join(' ').toUpperCase();
      items.push({
        id: `${prefijo}-${r + 1}`, // hoja + fila del Excel: identificador estable
        ref: placa, // PLACA DE INVENTARIO -> columna REFERENCIA de la remisión
        descripcion,
        // En equipos con placa son modelo y serial; en herramienta manual esas columnas suelen traer medidas.
        detalle: (placa ? [modelo && `Modelo ${modelo}`, serial && `S/N ${serial}`] : [modelo, serial]).filter(Boolean).join(' · '),
        categoria,
        unidad: 'und',
        stock: cant,
        ubicacion: capital(get('ubicacion')),
        estado: /INACTIVO/.test(estado + ' ' + obs.toUpperCase()) ? 'INACTIVO' : estado,
        observaciones: obs
      });
    }
    return items;
  }

  /** Recibe un libro leído con SheetJS (XLSX.read / XLSX.readFile) y devuelve todos los ítems. */
  function parseLibro(XLSX, wb) {
    const meta = (wb.Workbook && wb.Workbook.Sheets) || [];
    const items = [];
    wb.SheetNames.forEach((nombre, i) => {
      if (meta[i] && meta[i].Hidden) return; // hojas ocultas (p. ej. "Tabla1", copia de otra hoja)
      const filas = XLSX.utils.sheet_to_json(wb.Sheets[nombre], { header: 1, raw: false, defval: '', blankrows: true });
      items.push(...parseHoja(nombre, filas));
    });
    return items;
  }

  return { parseHoja, parseLibro };
});
