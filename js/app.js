/* Remisiones de Despacho — lógica de la aplicación (JavaScript Vanilla). */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
   * Mapa de celdas del formato base (assets/plantilla_remision.xlsx, hoja INVENTARIO).
   * Copia fiel del Excel "FLORA_FOOD.xlsx": solo se escriben valores, el resto
   * (logo, estilos, bordes, combinadas, desplegables, área de impresión) queda intacto.
   * ------------------------------------------------------------------------- */
  const FORMATO = {
    hoja: 'xl/worksheets/sheet1.xml', // hoja "INVENTARIO"
    hojaListas: 'xl/worksheets/sheet2.xml', // hoja "CODIFICACION DE CLIENTES"
    obra: 'A7', // OBRA O PROYECTO (A7:C7)
    fecha: 'D7', // FECHA (D7:E7, formato fecha)
    responsable: 'F7', // ACTUALIZACIÓN DEL CONTENIDO (F7:G7)
    primeraFila: 10, // ITEM 1
    ultimaFila: 115, // ITEM 106
    columnas: { descripcion: 'B', cantidad: 'D', unidad: 'E', referencia: 'F', novedades: 'G' }, // A = ITEM ya numerado
    observaciones: 'A116', // OBSERVACIONES: (A116:G117)
    quienEntrega: 'A122', // bajo QUIEN ENTREGA (A121:B121)
    quienRecibe: 'E122' // bajo QUIEN RECIBE (E121)
  };
  const CAPACIDAD = FORMATO.ultimaFila - FORMATO.primeraFila + 1;

  const LS = { stock: 'remisiones.stock.v2', draft: 'remisiones.draft.v2', inventario: 'remisiones.inventario.v2', agregados: 'remisiones.agregados.v1' };
  const CAT_MANUAL = 'Agregados manualmente';
  const PAGINA = 1000; // tarjetas por página: alto para que siempre se vea el inventario completo

  /* ----------------------------- Utilidades -------------------------------- */
  const $ = (id) => document.getElementById(id);
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Number(n).toLocaleString('es-CO', { maximumFractionDigits: 2 });

  function lsGet(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* almacenamiento no disponible */ }
  }

  let toastTimer;
  function toast(msg, tipo = 'ok') {
    const el = $('toast');
    el.textContent = msg;
    el.className = el.className.replace(/\bbg-\S+|\btext-white\b|\btext-slate-900\b/g, '').trim() +
      (tipo === 'error' ? ' bg-red-600 text-white' : tipo === 'warn' ? ' bg-amber-400 text-slate-900' : ' bg-emerald-600 text-white');
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = '0'), 3200);
  }

  function hoyISO() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  /* ------------------------------- Estado ---------------------------------- */
  /** Inventario activo: el último Excel cargado desde la app o, si no hay, el de js/inventario.js. */
  let inventario = [];
  let porRef = new Map(); // id -> ítem
  let origenInventario = '';

  function inventarioFuente() {
    const importado = lsGet(LS.inventario);
    if (importado && Array.isArray(importado.items) && importado.items.length) {
      return { items: importado.items, origen: `${importado.archivo} · cargado ${importado.fecha}` };
    }
    return { items: window.INVENTARIO_BASE || [], origen: 'Inventario_2.xlsx (incluido)' };
  }

  function cargarInventario() {
    const fuente = inventarioFuente();
    const items = fuente.items.concat(lsGet(LS.agregados) || []); // + ítems agregados con el botón "Agregar"
    const origen = fuente.origen;
    const stockGuardado = lsGet(LS.stock) || {};
    origenInventario = origen;
    inventario = items.map((it) => ({
      ...it,
      stock: Object.prototype.hasOwnProperty.call(stockGuardado, it.id) ? stockGuardado[it.id] : it.stock,
      _q: norm([it.ref, it.descripcion, it.detalle, it.categoria, it.ubicacion, it.observaciones, it.estado].join(' '))
    }));
    porRef = new Map(inventario.map((it) => [it.id, it]));
  }
  cargarInventario();

  /** Lista de despacho: ref -> { cantidad, novedades } (conserva el orden de selección). */
  const seleccion = new Map();
  let categoria = 'Todas';
  let limite = PAGINA;

  const draft = lsGet(LS.draft);
  if (draft && Array.isArray(draft.items)) {
    draft.items.forEach(([ref, v]) => porRef.has(ref) && seleccion.set(ref, v));
  }

  function guardarBorrador() {
    const campos = {};
    ['fObra', 'fFecha', 'fResp', 'fObs', 'fEntrega', 'fRecibe'].forEach((id) => (campos[id] = $(id).value));
    lsSet(LS.draft, { items: [...seleccion.entries()], campos });
  }

  /* ----------------------------- Buscador ---------------------------------- */
  function filtrar() {
    const terminos = norm($('search').value).split(/\s+/).filter(Boolean);
    return inventario.filter((it) =>
      (categoria === 'Todas' || it.categoria === categoria) && terminos.every((t) => it._q.includes(t))
    );
  }

  function renderChips() {
    const conteo = { Todas: inventario.length };
    inventario.forEach((i) => (conteo[i.categoria] = (conteo[i.categoria] || 0) + 1));
    $('chips').innerHTML = Object.keys(conteo).map((c) => {
      const on = c === categoria;
      return `<button type="button" data-cat="${esc(c)}" class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
        on ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}">${esc(c)} <span class="${on ? 'text-amber-300' : 'text-slate-400'}">${conteo[c]}</span></button>`;
    }).join('');
  }

  function cardClasses(sel) {
    return 'rounded-xl bg-white p-3 shadow-sm ring-1 transition ' + (sel ? 'ring-2 ring-amber-500 bg-amber-50/40' : 'ring-slate-200');
  }

  function renderResultados() {
    const lista = filtrar();
    $('resultCount').textContent = `${lista.length} de ${inventario.length} ítems · ${origenInventario}`;
    $('empty').classList.toggle('hidden', lista.length > 0);
    const textoBusqueda = $('search').value.trim();
    $('emptyTexto').textContent = textoBusqueda ? `"${textoBusqueda}"` : '';
    const resto = lista.length - limite;
    $('btnMas').classList.toggle('hidden', resto <= 0);
    $('btnMas').textContent = `Ver ${Math.min(resto, PAGINA)} más (quedan ${resto})`;
    $('results').innerHTML = lista.slice(0, limite).map((it) => {
      const sel = seleccion.get(it.id);
      const agotado = it.stock <= 0;
      const inactivo = it.estado === 'INACTIVO';
      return `
      <li class="${cardClasses(!!sel)}" data-ref="${esc(it.id)}">
        <div class="flex gap-3">
          <input type="checkbox" class="js-check mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            aria-label="Agregar ${esc(it.descripcion)}" ${sel ? 'checked' : ''} />
          <div class="min-w-0 flex-1">
            <p class="js-toggle cursor-pointer text-sm font-medium leading-snug">${esc(it.descripcion)}</p>
            ${it.detalle ? `<p class="mt-0.5 text-xs text-slate-500">${esc(it.detalle)}</p>` : ''}
            <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              ${it.ref ? `<span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-white">${esc(it.ref)}</span>` : ''}
              <span class="rounded bg-slate-100 px-1.5 py-0.5">${esc(it.categoria)}</span>
              ${it.ubicacion ? `<span>📍 ${esc(it.ubicacion)}</span>` : ''}
              ${inactivo ? '<span class="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">INACTIVO</span>' : ''}
              ${it.manual ? '<span class="rounded bg-sky-100 px-1.5 py-0.5 font-semibold text-sky-700">AGREGADO</span><button type="button" class="js-del text-red-600 underline hover:text-red-700">Eliminar</button>' : ''}
            </p>
            ${it.observaciones && it.observaciones.toUpperCase() !== 'INACTIVO' ? `<p class="mt-1 text-xs italic text-amber-700">${esc(it.observaciones)}</p>` : ''}
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between gap-3">
          <span class="text-xs ${agotado ? 'font-semibold text-red-600' : 'text-slate-500'}">
            Stock: <b class="js-stock">${fmt(it.stock)}</b> ${esc(it.unidad)}
          </span>
          <div class="flex items-center overflow-hidden rounded-lg ring-1 ring-slate-300">
            <button type="button" class="js-dec h-9 w-9 text-lg text-slate-600 hover:bg-slate-100" aria-label="Restar">−</button>
            <input type="number" inputmode="decimal" min="0" step="any" value="${sel ? sel.cantidad : ''}" placeholder="0"
              class="js-qty h-9 w-16 border-0 text-center text-sm font-semibold focus:ring-2 focus:ring-inset focus:ring-amber-500" aria-label="Cantidad" />
            <button type="button" class="js-inc h-9 w-9 text-lg text-slate-600 hover:bg-slate-100" aria-label="Sumar">+</button>
          </div>
        </div>
      </li>`;
    }).join('');
  }

  /** Actualiza solo la tarjeta afectada (evita perder el foco al escribir). */
  function syncCard(ref) {
    const li = $('results').querySelector(`li[data-ref="${CSS.escape(ref)}"]`);
    if (!li) return;
    const sel = seleccion.get(ref);
    li.className = cardClasses(!!sel);
    li.querySelector('.js-check').checked = !!sel;
    const q = li.querySelector('.js-qty');
    if (document.activeElement !== q) q.value = sel ? sel.cantidad : '';
    li.querySelector('.js-stock').textContent = fmt(porRef.get(ref).stock);
  }

  /* -------------------------- Lista de despacho ---------------------------- */
  function setCantidad(ref, cantidad, { desdeLista = false } = {}) {
    const n = Number(cantidad);
    if (!Number.isFinite(n) || n <= 0) {
      seleccion.delete(ref);
    } else {
      if (!seleccion.has(ref) && seleccion.size >= CAPACIDAD) {
        toast(`El formato admite máximo ${CAPACIDAD} ítems por remisión.`, 'error');
        syncCard(ref);
        return;
      }
      const prev = seleccion.get(ref);
      seleccion.set(ref, { cantidad: n, novedades: prev ? prev.novedades : '' });
      const it = porRef.get(ref);
      if (!prev && it.estado === 'INACTIVO') toast(`Atención: ${it.descripcion} figura como INACTIVO.`, 'warn');
      else if (n > it.stock) toast(`Atención: ${it.ref || it.descripcion} solo tiene ${fmt(it.stock)} ${it.unidad} en stock.`, 'warn');
    }
    syncCard(ref);
    renderDespacho(desdeLista ? ref : null);
    guardarBorrador();
  }

  function renderDespacho(refEnFoco) {
    const n = seleccion.size;
    $('panelCount').textContent = n;
    $('fabCount').textContent = n;
    $('dispatchEmpty').classList.toggle('hidden', n > 0);
    $('btnGenerar').disabled = n === 0;
    $('capacity').textContent = `${n} / ${CAPACIDAD} filas del formato`;

    // Si el usuario está escribiendo dentro de la lista, no se redibuja esa fila.
    if (refEnFoco && $('dispatchList').querySelector(`li[data-ref="${CSS.escape(refEnFoco)}"]`)) return;

    let i = 0;
    $('dispatchList').innerHTML = [...seleccion.entries()].map(([ref, s]) => {
      const it = porRef.get(ref);
      const excede = s.cantidad > it.stock;
      i++;
      return `
      <li class="px-4 py-3" data-ref="${esc(ref)}">
        <div class="flex items-start gap-3">
          <span class="mt-0.5 w-6 shrink-0 text-right text-xs font-semibold text-slate-400">${i}</span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium leading-snug">${esc(it.descripcion)}</p>
            <p class="font-mono text-[11px] text-slate-500">${esc([it.ref, it.detalle].filter(Boolean).join(' · '))}</p>
          </div>
          <button type="button" class="js-remove -mr-1 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Quitar">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
          </button>
        </div>
        <div class="mt-2 flex items-center gap-2 pl-9">
          <input type="number" inputmode="decimal" min="0" step="any" value="${s.cantidad}"
            class="js-dqty w-20 rounded-md px-2 py-1.5 text-sm font-semibold ring-1 ${excede ? 'ring-red-400 text-red-700' : 'ring-slate-300'} focus:ring-2 focus:ring-amber-500" aria-label="Cantidad" />
          <span class="w-10 text-xs text-slate-500">${esc(it.unidad)}</span>
          <input type="text" value="${esc(s.novedades)}" placeholder="Novedades (ej: OK)"
            class="js-nov min-w-0 flex-1 rounded-md px-2 py-1.5 text-sm ring-1 ring-slate-300 focus:ring-2 focus:ring-amber-500" aria-label="Novedades" />
        </div>
      </li>`;
    }).join('');
  }

  /* ------------------------- Panel móvil (drawer) -------------------------- */
  function abrirPanel(abrir) {
    $('panel').classList.toggle('translate-y-full', !abrir);
    $('overlay').classList.toggle('hidden', !abrir);
    document.body.classList.toggle('overflow-hidden', abrir);
  }

  /* ------------------------ Generación del Excel --------------------------- */
  const xmlEsc = (s) => String(s)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /**
   * Escribe un valor en una celda existente del XML de la hoja, conservando su estilo (atributo s).
   * Número -> <v>, Date -> número de serie de Excel, texto -> cadena en línea (inlineStr).
   */
  function setCell(xml, ref, valor) {
    const re = new RegExp(`<c r="${ref}"((?:\\s[^>]*?)?)(?:/>|>[\\s\\S]*?</c>)`);
    const m = re.exec(xml);
    if (!m) throw new Error(`La celda ${ref} no existe en la plantilla.`);
    const attrs = m[1].replace(/\s+t="[^"]*"/g, '');
    let celda;
    if (valor === null || valor === undefined || valor === '') {
      celda = `<c r="${ref}"${attrs}/>`;
    } else if (valor instanceof Date) {
      const serial = (Date.UTC(valor.getFullYear(), valor.getMonth(), valor.getDate()) - Date.UTC(1899, 11, 30)) / 86400000;
      celda = `<c r="${ref}"${attrs}><v>${serial}</v></c>`;
    } else if (typeof valor === 'number') {
      celda = `<c r="${ref}"${attrs}><v>${valor}</v></c>`;
    } else {
      celda = `<c r="${ref}"${attrs} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(valor)}</t></is></c>`;
    }
    return xml.slice(0, m.index) + celda + xml.slice(m.index + m[0].length);
  }

  function cargarPlantilla() {
    if (!window.JSZip) throw new Error('No se pudo cargar JSZip (revise la conexión a internet).');
    return JSZip.loadAsync(window.PLANTILLA_REMISION_B64, { base64: true });
  }

  function descargar(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function generarRemision() {
    if (seleccion.size === 0) return toast('Agregue al menos un ítem a la lista de despacho.', 'error');
    const obra = $('fObra').value.trim();
    if (!obra) {
      abrirPanel(true);
      $('fObra').focus();
      return toast('Indique la obra o proyecto.', 'error');
    }
    const fechaISO = $('fFecha').value || hoyISO();
    const [y, mo, d] = fechaISO.split('-').map(Number);
    const fecha = new Date(y, mo - 1, d);

    const btn = $('btnGenerar');
    btn.disabled = true;
    try {
      const zip = await cargarPlantilla();
      let xml = await zip.file(FORMATO.hoja).async('string');

      xml = setCell(xml, FORMATO.obra, obra.toUpperCase());
      xml = setCell(xml, FORMATO.fecha, fecha);
      xml = setCell(xml, FORMATO.responsable, $('fResp').value.trim().toUpperCase());

      let fila = FORMATO.primeraFila;
      const C = FORMATO.columnas;
      for (const [ref, s] of seleccion) {
        const it = porRef.get(ref);
        xml = setCell(xml, C.descripcion + fila, it.descripcion);
        xml = setCell(xml, C.cantidad + fila, s.cantidad);
        xml = setCell(xml, C.unidad + fila, it.unidad);
        xml = setCell(xml, C.referencia + fila, it.ref);
        xml = setCell(xml, C.novedades + fila, s.novedades.trim());
        fila++;
      }

      const obs = $('fObs').value.trim().replace(/\s*\n\s*/g, ' · ');
      xml = setCell(xml, FORMATO.observaciones, 'OBSERVACIONES:  ' + obs);
      xml = setCell(xml, FORMATO.quienEntrega, $('fEntrega').value.trim());
      xml = setCell(xml, FORMATO.quienRecibe, $('fRecibe').value.trim());

      zip.file(FORMATO.hoja, xml);
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const slug = norm(obra).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').toUpperCase() || 'OBRA';
      descargar(blob, `Remision_${slug}_${fechaISO}.xlsx`);

      if ($('fDescontar').checked) {
        const nuevoStock = lsGet(LS.stock) || {};
        for (const [ref, s] of seleccion) {
          const it = porRef.get(ref);
          it.stock = Math.max(0, +(it.stock - s.cantidad).toFixed(4));
          nuevoStock[ref] = it.stock;
        }
        lsSet(LS.stock, nuevoStock);
        seleccion.clear();
        $('fObs').value = '';
        renderResultados();
        renderDespacho();
        guardarBorrador();
        toast('Remisión generada y stock actualizado.');
      } else {
        toast('Remisión generada.');
      }
    } catch (err) {
      console.error(err);
      toast('Error al generar la remisión: ' + err.message, 'error');
    } finally {
      btn.disabled = seleccion.size === 0;
    }
  }

  /* ------------------------ Agregar ítems manuales ------------------------ */
  function abrirNuevo(texto) {
    $('formNuevo').reset();
    $('nDesc').value = texto.toUpperCase();
    $('nCant').disabled = false;
    $('dlCategorias').innerHTML = [...new Set([CAT_MANUAL, ...inventario.map((i) => i.categoria)])]
      .map((c) => `<option value="${esc(c)}"></option>`).join('');
    $('dlgNuevo').showModal();
    setTimeout(() => (texto ? $('nRef') : $('nDesc')).focus(), 50);
  }

  function guardarNuevo() {
    const descripcion = $('nDesc').value.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!descripcion) {
      $('nDesc').focus();
      return toast('Escriba la descripción del ítem.', 'error');
    }
    const ref = $('nRef').value.trim().toUpperCase();
    if (ref) {
      const existe = inventario.find((i) => i.ref && i.ref.toUpperCase() === ref);
      if (existe && !confirm(`La placa ${ref} ya existe: "${existe.descripcion}". ¿Agregar de todas formas?`)) return;
    }
    const stock = Number($('nStock').value);
    const item = {
      id: 'MAN-' + Date.now().toString(36),
      ref,
      descripcion,
      detalle: $('nDetalle').value.trim(),
      categoria: $('nCat').value.trim() || CAT_MANUAL,
      unidad: $('nUnidad').value.trim() || 'und',
      stock: Number.isFinite(stock) && stock >= 0 ? stock : 1,
      ubicacion: $('nUbic').value.trim(),
      estado: '',
      observaciones: '',
      manual: true
    };
    const agregados = lsGet(LS.agregados) || [];
    agregados.push(item);
    lsSet(LS.agregados, agregados);
    $('dlgNuevo').close();

    cargarInventario();
    categoria = 'Todas';
    renderChips();
    $('search').value = descripcion;
    limite = PAGINA;
    renderResultados();
    const cant = Number($('nCant').value);
    if ($('nDespachar').checked && cant > 0) setCantidad(item.id, cant);
    toast(`"${descripcion}" agregado al inventario${$('nDespachar').checked && cant > 0 ? ' y a la lista de despacho' : ''}.`);
  }

  function eliminarAgregado(id) {
    const it = porRef.get(id);
    if (!it || !it.manual || !confirm(`¿Eliminar "${it.descripcion}" del inventario?`)) return;
    lsSet(LS.agregados, (lsGet(LS.agregados) || []).filter((a) => a.id !== id));
    seleccion.delete(id);
    cargarInventario();
    renderChips();
    renderResultados();
    renderDespacho();
    guardarBorrador();
  }

  /** Carga un Excel de inventario (mismo formato que Inventario_2.xlsx) y lo deja como inventario activo. */
  async function importarInventario(file) {
    try {
      if (!window.XLSX) throw new Error('No se pudo cargar la librería de Excel (revise la conexión a internet).');
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', sheetRows: 5000 });
      const items = InventarioParser.parseLibro(XLSX, wb);
      if (!items.length) throw new Error('No se encontraron hojas con columnas ITEM, EQUIPO/DESCRIPCION y CANT.');
      if (seleccion.size && !confirm('Cargar un inventario nuevo vacía la lista de despacho actual. ¿Continuar?')) return;
      lsSet(LS.inventario, { archivo: file.name, fecha: new Date().toLocaleDateString('es-CO'), items });
      lsSet(LS.stock, {});
      seleccion.clear();
      categoria = 'Todas';
      limite = PAGINA;
      cargarInventario();
      renderChips();
      renderResultados();
      renderDespacho();
      guardarBorrador();
      toast(`Inventario cargado: ${items.length} ítems de ${file.name}.`);
    } catch (err) {
      console.error(err);
      toast('No se pudo leer el inventario: ' + err.message, 'error');
    }
  }

  /** Lee clientes, solicitantes de la hoja "CODIFICACION DE CLIENTES" para autocompletar. */
  async function cargarListasPlantilla() {
    try {
      const zip = await cargarPlantilla();
      const parser = new DOMParser();
      const ssXml = parser.parseFromString(await zip.file('xl/sharedStrings.xml').async('string'), 'application/xml');
      const strings = [...ssXml.getElementsByTagName('si')].map((si) =>
        [...si.getElementsByTagName('t')].map((t) => t.textContent).join(''));
      const hoja = parser.parseFromString(await zip.file(FORMATO.hojaListas).async('string'), 'application/xml');
      const celdas = {};
      for (const c of hoja.getElementsByTagName('c')) {
        const v = c.getElementsByTagName('v')[0];
        if (!v) continue;
        celdas[c.getAttribute('r')] = c.getAttribute('t') === 's' ? strings[+v.textContent] : v.textContent;
      }
      const columna = (col, desde, hasta) => {
        const out = [];
        for (let r = desde; r <= hasta; r++) {
          const v = (celdas[col + r] || '').trim();
          if (v && !/^(FORMULA|POR FAVOR)/i.test(v)) out.push(v);
        }
        return out;
      };
      const clientes = columna('B', 4, 200);
      const personas = columna('F', 2, 15);
      $('dlClientes').innerHTML = clientes.map((c) => `<option value="${esc(c)}"></option>`).join('');
      $('dlPersonas').innerHTML = personas.map((p) => `<option value="${esc(p)}"></option>`).join('');
      const unidades = columna('J', 2, 20);
      $('dlUnidades').innerHTML = unidades.map((u) => `<option value="${esc(u)}"></option>`).join('');
    } catch (e) {
      console.warn('No se pudieron leer las listas de la plantilla', e);
    }
  }

  /* ------------------------------- Eventos --------------------------------- */
  function initEventos() {
    let t;
    $('search').addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        limite = PAGINA;
        renderResultados();
      }, 80);
    });

    $('chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      categoria = b.dataset.cat;
      limite = PAGINA;
      renderChips();
      renderResultados();
    });

    const results = $('results');
    results.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-ref]');
      if (!li) return;
      const ref = li.dataset.ref;
      const actual = seleccion.get(ref);
      if (e.target.closest('.js-inc')) setCantidad(ref, (actual ? actual.cantidad : 0) + 1);
      else if (e.target.closest('.js-dec')) setCantidad(ref, Math.max(0, (actual ? actual.cantidad : 0) - 1));
      else if (e.target.closest('.js-toggle')) setCantidad(ref, actual ? 0 : 1);
      else if (e.target.closest('.js-del')) eliminarAgregado(ref);
    });
    results.addEventListener('change', (e) => {
      if (!e.target.classList.contains('js-check')) return;
      const ref = e.target.closest('li').dataset.ref;
      const q = Number(e.target.closest('li').querySelector('.js-qty').value);
      setCantidad(ref, e.target.checked ? (q > 0 ? q : 1) : 0);
    });
    results.addEventListener('input', (e) => {
      if (!e.target.classList.contains('js-qty')) return;
      setCantidad(e.target.closest('li').dataset.ref, e.target.value);
    });

    const lista = $('dispatchList');
    lista.addEventListener('input', (e) => {
      const li = e.target.closest('li[data-ref]');
      if (!li) return;
      const ref = li.dataset.ref;
      if (e.target.classList.contains('js-nov')) {
        seleccion.get(ref).novedades = e.target.value;
        guardarBorrador();
      } else if (e.target.classList.contains('js-dqty')) {
        const n = Number(e.target.value);
        if (n > 0) {
          setCantidad(ref, n, { desdeLista: true });
          e.target.classList.toggle('ring-red-400', n > porRef.get(ref).stock);
          e.target.classList.toggle('text-red-700', n > porRef.get(ref).stock);
        }
      }
    });
    lista.addEventListener('change', (e) => {
      // Al salir del campo con 0 o vacío, se quita el ítem.
      if (e.target.classList.contains('js-dqty') && !(Number(e.target.value) > 0)) {
        setCantidad(e.target.closest('li').dataset.ref, 0);
      }
    });
    lista.addEventListener('click', (e) => {
      if (e.target.closest('.js-remove')) setCantidad(e.target.closest('li').dataset.ref, 0);
    });

    $('btnClear').addEventListener('click', () => {
      if (seleccion.size === 0 || !confirm('¿Vaciar la lista de despacho?')) return;
      const refs = [...seleccion.keys()];
      seleccion.clear();
      refs.forEach(syncCard);
      renderDespacho();
      guardarBorrador();
    });

    $('btnResetInv').addEventListener('click', () => {
      if (!confirm('¿Restablecer el stock a las cantidades del Excel de inventario?')) return;
      lsSet(LS.stock, {});
      cargarInventario();
      renderResultados();
      renderDespacho();
      toast('Stock restablecido.');
    });

    $('btnImport').addEventListener('click', () => $('fileInv').click());
    $('fileInv').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (file) await importarInventario(file);
    });

    $('btnNuevo').addEventListener('click', () => abrirNuevo(''));
    $('btnNuevoVacio').addEventListener('click', () => abrirNuevo($('search').value.trim()));
    $('btnNuevoCerrar').addEventListener('click', () => $('dlgNuevo').close());
    $('btnNuevoCancelar').addEventListener('click', () => $('dlgNuevo').close());
    $('nDespachar').addEventListener('change', (e) => ($('nCant').disabled = !e.target.checked));
    $('formNuevo').addEventListener('submit', (e) => {
      e.preventDefault();
      guardarNuevo();
    });

    $('btnMas').addEventListener('click', () => {
      limite += PAGINA;
      renderResultados();
    });

    $('form').addEventListener('input', guardarBorrador);
    $('btnGenerar').addEventListener('click', generarRemision);
    $('btnOpenPanel').addEventListener('click', () => abrirPanel(true));
    $('btnClosePanel').addEventListener('click', () => abrirPanel(false));
    $('overlay').addEventListener('click', () => abrirPanel(false));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && abrirPanel(false));
  }

  /* -------------------------------- Inicio --------------------------------- */
  function init() {
    if (draft && draft.campos) {
      Object.entries(draft.campos).forEach(([id, v]) => $(id) && ($(id).value = v || ''));
    }
    if (!$('fFecha').value) $('fFecha').value = hoyISO();
    renderChips();
    renderResultados();
    renderDespacho();
    initEventos();
    cargarListasPlantilla();
  }

  init();
})();
