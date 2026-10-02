#!/usr/bin/env node
// Regenera js/plantilla.js a partir de assets/plantilla_remision.xlsx.
// Uso: node scripts/embed-template.js  (ejecutar tras modificar la plantilla)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const b64 = fs.readFileSync(path.join(root, 'assets', 'plantilla_remision.xlsx')).toString('base64');
const out =
  '/* Plantilla de remisión (formato base INDIMON) embebida en Base64.\n' +
  ' * Generado desde assets/plantilla_remision.xlsx con: node scripts/embed-template.js\n' +
  ' * Permite que la app funcione abriendo index.html directamente (file://) sin servidor. */\n' +
  'window.PLANTILLA_REMISION_B64 = "' + b64 + '";\n';
fs.writeFileSync(path.join(root, 'js', 'plantilla.js'), out);
console.log('js/plantilla.js actualizado (' + b64.length + ' caracteres)');
