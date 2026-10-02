#!/usr/bin/env node
// Genera js/inventario.js (inventario por defecto de la app) desde el Excel de inventario.
// Uso:  npm install xlsx  &&  node scripts/build-inventario.js ruta/Inventario.xlsx
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { parseLibro } = require('../js/parser.js');

const archivo = process.argv[2];
if (!archivo) {
  console.error('Uso: node scripts/build-inventario.js ruta/Inventario.xlsx');
  process.exit(1);
}
const wb = XLSX.readFile(archivo, { cellDates: false, sheetRows: 2000 });
const items = parseLibro(XLSX, wb);
const resumen = {};
items.forEach((i) => (resumen[i.categoria] = (resumen[i.categoria] || 0) + 1));

const out =
  '/* Inventario por defecto, generado desde "' + path.basename(archivo) + '" con scripts/build-inventario.js.\n' +
  ' * Desde la app también puede cargarse un Excel actualizado (botón "Cargar inventario"). */\n' +
  'window.INVENTARIO_BASE = ' + JSON.stringify(items, null, 0).replace(/\},\{/g, '},\n{') + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'js', 'inventario.js'), out);
console.log(items.length + ' ítems', resumen);
