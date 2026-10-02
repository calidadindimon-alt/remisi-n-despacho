/* Datos de prueba (mock) del inventario de almacén.
 * Unidades alineadas con la hoja "CODIFICACION DE CLIENTES" de la plantilla:
 * mts, kg, und, gal, lt, caja, par, m3, global, día
 * Para conectar un inventario real, reemplace este arreglo (mismos campos). */
window.INVENTARIO_MOCK = [
  // Perfiles estructurales
  { ref: 'PE-HEA140-6', descripcion: 'Perfil HEA 140 x 6 m - ASTM A572 Gr50', categoria: 'Perfiles', unidad: 'und', stock: 24, ubicacion: 'Patio A-1' },
  { ref: 'PE-HEA140-12', descripcion: 'Perfil HEA 140 x 12 m - ASTM A572 Gr50', categoria: 'Perfiles', unidad: 'und', stock: 10, ubicacion: 'Patio A-1' },
  { ref: 'PE-HEA220-6', descripcion: 'Perfil HEA 220 x 6 m - ASTM A572 Gr50', categoria: 'Perfiles', unidad: 'und', stock: 16, ubicacion: 'Patio A-2' },
  { ref: 'PE-HEA220-12', descripcion: 'Perfil HEA 220 x 12 m - ASTM A572 Gr50', categoria: 'Perfiles', unidad: 'und', stock: 8, ubicacion: 'Patio A-2' },
  { ref: 'PE-HEB200-12', descripcion: 'Perfil HEB 200 x 12 m - ASTM A572 Gr50', categoria: 'Perfiles', unidad: 'und', stock: 6, ubicacion: 'Patio A-3' },
  { ref: 'PE-IPE200-6', descripcion: 'Perfil IPE 200 x 6 m - ASTM A36', categoria: 'Perfiles', unidad: 'und', stock: 20, ubicacion: 'Patio A-3' },
  { ref: 'PE-UPN160-6', descripcion: 'Canal UPN 160 x 6 m - ASTM A36', categoria: 'Perfiles', unidad: 'und', stock: 18, ubicacion: 'Patio A-4' },
  { ref: 'PE-ANG2x1/4', descripcion: 'Ángulo 2" x 1/4" x 6 m - ASTM A36', categoria: 'Perfiles', unidad: 'und', stock: 60, ubicacion: 'Patio B-1' },
  { ref: 'PE-ANG3x1/4', descripcion: 'Ángulo 3" x 1/4" x 6 m - ASTM A36', categoria: 'Perfiles', unidad: 'und', stock: 35, ubicacion: 'Patio B-1' },
  { ref: 'PE-PHR100x50', descripcion: 'Perfil tubular PHR C 100 x 50 x 2.5 mm x 6 m', categoria: 'Perfiles', unidad: 'und', stock: 40, ubicacion: 'Patio B-2' },

  // Láminas
  { ref: 'LA-HR-1/4', descripcion: 'Lámina HR 1/4" (4 x 8 pies) - ASTM A36', categoria: 'Láminas', unidad: 'und', stock: 12, ubicacion: 'Bodega 1-R1' },
  { ref: 'LA-HR-3/8', descripcion: 'Lámina HR 3/8" (4 x 8 pies) - ASTM A36', categoria: 'Láminas', unidad: 'und', stock: 7, ubicacion: 'Bodega 1-R1' },
  { ref: 'LA-ALF-1/8', descripcion: 'Lámina alfajor 1/8" (4 x 8 pies)', categoria: 'Láminas', unidad: 'und', stock: 9, ubicacion: 'Bodega 1-R2' },
  { ref: 'LA-INOX304-2', descripcion: 'Lámina inoxidable AISI 304 cal. 14 (2 mm) 4 x 8 pies', categoria: 'Láminas', unidad: 'und', stock: 5, ubicacion: 'Bodega 1-R2' },

  // Tubería
  { ref: 'TU-ACS40-2', descripcion: 'Tubería acero al carbono 2" SCH 40 sin costura A106 Gr B x 6 m', categoria: 'Tubería', unidad: 'und', stock: 30, ubicacion: 'Rack T-1' },
  { ref: 'TU-ACS40-3', descripcion: 'Tubería acero al carbono 3" SCH 40 sin costura A106 Gr B x 6 m', categoria: 'Tubería', unidad: 'und', stock: 22, ubicacion: 'Rack T-1' },
  { ref: 'TU-ACS40-4', descripcion: 'Tubería acero al carbono 4" SCH 40 sin costura A106 Gr B x 6 m', categoria: 'Tubería', unidad: 'und', stock: 14, ubicacion: 'Rack T-2' },
  { ref: 'TU-ACS80-1', descripcion: 'Tubería acero al carbono 1" SCH 80 sin costura A106 Gr B x 6 m', categoria: 'Tubería', unidad: 'und', stock: 25, ubicacion: 'Rack T-2' },
  { ref: 'TU-ACS40-6', descripcion: 'Tubería acero al carbono 6" SCH 40 sin costura A106 Gr B', categoria: 'Tubería', unidad: 'mts', stock: 48, ubicacion: 'Rack T-3' },
  { ref: 'TU-GALV-1/2', descripcion: 'Tubería galvanizada 1/2" x 6 m', categoria: 'Tubería', unidad: 'und', stock: 50, ubicacion: 'Rack T-4' },
  { ref: 'TU-INOX304-2', descripcion: 'Tubería inoxidable 304 sanitaria 2" x 6 m', categoria: 'Tubería', unidad: 'und', stock: 12, ubicacion: 'Rack T-4' },

  // Accesorios de tubería
  { ref: 'AC-COD90-2', descripcion: 'Codo 90° radio largo 2" SCH 40 A234 WPB soldable', categoria: 'Accesorios', unidad: 'und', stock: 80, ubicacion: 'Estante C-1' },
  { ref: 'AC-COD90-4', descripcion: 'Codo 90° radio largo 4" SCH 40 A234 WPB soldable', categoria: 'Accesorios', unidad: 'und', stock: 36, ubicacion: 'Estante C-1' },
  { ref: 'AC-TEE-3', descripcion: 'Tee recta 3" SCH 40 A234 WPB soldable', categoria: 'Accesorios', unidad: 'und', stock: 20, ubicacion: 'Estante C-2' },
  { ref: 'AC-RED-4x2', descripcion: 'Reducción concéntrica 4" x 2" SCH 40 A234 WPB', categoria: 'Accesorios', unidad: 'und', stock: 15, ubicacion: 'Estante C-2' },
  { ref: 'AC-BRI150-2', descripcion: 'Brida slip-on 2" ANSI 150 A105', categoria: 'Accesorios', unidad: 'und', stock: 40, ubicacion: 'Estante C-3' },
  { ref: 'AC-BRI150-4', descripcion: 'Brida weld neck 4" ANSI 150 A105', categoria: 'Accesorios', unidad: 'und', stock: 24, ubicacion: 'Estante C-3' },
  { ref: 'AC-EMP-4', descripcion: 'Empaque espirometálico 4" ANSI 150 grafito', categoria: 'Accesorios', unidad: 'und', stock: 30, ubicacion: 'Estante C-4' },

  // Válvulas
  { ref: 'VA-BOLA-1', descripcion: 'Válvula de bola 1" acero inoxidable roscada 1000 WOG', categoria: 'Válvulas', unidad: 'und', stock: 18, ubicacion: 'Estante V-1' },
  { ref: 'VA-BOLA-2', descripcion: 'Válvula de bola 2" bridada ANSI 150 acero al carbono', categoria: 'Válvulas', unidad: 'und', stock: 9, ubicacion: 'Estante V-1' },
  { ref: 'VA-COMP-3', descripcion: 'Válvula de compuerta 3" bridada ANSI 150 A216 WCB', categoria: 'Válvulas', unidad: 'und', stock: 6, ubicacion: 'Estante V-2' },
  { ref: 'VA-GLOB-2', descripcion: 'Válvula de globo 2" bridada ANSI 150 A216 WCB', categoria: 'Válvulas', unidad: 'und', stock: 5, ubicacion: 'Estante V-2' },
  { ref: 'VA-CHK-4', descripcion: 'Válvula cheque tipo wafer 4" ANSI 150', categoria: 'Válvulas', unidad: 'und', stock: 4, ubicacion: 'Estante V-3' },
  { ref: 'VA-MARI-6', descripcion: 'Válvula mariposa 6" tipo wafer con palanca', categoria: 'Válvulas', unidad: 'und', stock: 3, ubicacion: 'Estante V-3' },
  { ref: 'VA-SEG-1', descripcion: 'Válvula de seguridad 1" x 1 1/2" vapor 150 psi', categoria: 'Válvulas', unidad: 'und', stock: 4, ubicacion: 'Estante V-4' },

  // Tornillería
  { ref: 'TO-ESP-5/8', descripcion: 'Espárrago A193 B7 5/8" x 4" con 2 tuercas 2H', categoria: 'Tornillería', unidad: 'und', stock: 400, ubicacion: 'Estante T-1' },
  { ref: 'TO-PERN-3/4', descripcion: 'Perno hexagonal G5 3/4" x 3" con tuerca y arandela', categoria: 'Tornillería', unidad: 'und', stock: 250, ubicacion: 'Estante T-1' },
  { ref: 'TO-ANC-1/2', descripcion: 'Anclaje expansivo 1/2" x 4 1/4" galvanizado', categoria: 'Tornillería', unidad: 'caja', stock: 12, ubicacion: 'Estante T-2' },

  // Consumibles
  { ref: 'CO-E6013-1/8', descripcion: 'Soldadura electrodo E6013 1/8"', categoria: 'Consumibles', unidad: 'kg', stock: 120, ubicacion: 'Bodega 2-S1' },
  { ref: 'CO-E7018-1/8', descripcion: 'Soldadura electrodo E7018 1/8"', categoria: 'Consumibles', unidad: 'kg', stock: 150, ubicacion: 'Bodega 2-S1' },
  { ref: 'CO-ER70S6', descripcion: 'Alambre MIG ER70S-6 0.9 mm (rollo 15 kg)', categoria: 'Consumibles', unidad: 'kg', stock: 90, ubicacion: 'Bodega 2-S2' },
  { ref: 'CO-DISC-CORT', descripcion: 'Disco de corte 4 1/2" para metal', categoria: 'Consumibles', unidad: 'caja', stock: 25, ubicacion: 'Bodega 2-S3' },
  { ref: 'CO-DISC-DESB', descripcion: 'Disco de desbaste 7" para metal', categoria: 'Consumibles', unidad: 'und', stock: 60, ubicacion: 'Bodega 2-S3' },
  { ref: 'CO-ANTI-GAL', descripcion: 'Pintura anticorrosiva gris', categoria: 'Consumibles', unidad: 'gal', stock: 30, ubicacion: 'Bodega 2-P1' },
  { ref: 'CO-THIN', descripcion: 'Thinner corriente', categoria: 'Consumibles', unidad: 'gal', stock: 40, ubicacion: 'Bodega 2-P1' },
  { ref: 'CO-OXI', descripcion: 'Oxígeno industrial (cilindro 6.5 m3)', categoria: 'Consumibles', unidad: 'm3', stock: 26, ubicacion: 'Jaula gases' },

  // Construcción
  { ref: 'CN-VAR-1/2', descripcion: 'Varilla corrugada 1/2" x 6 m - NTC 2289', categoria: 'Construcción', unidad: 'und', stock: 300, ubicacion: 'Patio C-1' },
  { ref: 'CN-MALLA-D84', descripcion: 'Malla electrosoldada D-84 (2.35 x 6 m)', categoria: 'Construcción', unidad: 'und', stock: 40, ubicacion: 'Patio C-2' },
  { ref: 'CN-CEM-50', descripcion: 'Cemento gris uso general 50 kg', categoria: 'Construcción', unidad: 'und', stock: 120, ubicacion: 'Bodega 3' },
  { ref: 'CN-GROUT', descripcion: 'Grouting sin retracción 25 kg', categoria: 'Construcción', unidad: 'und', stock: 30, ubicacion: 'Bodega 3' },

  // EPP
  { ref: 'EP-GUA-CAR', descripcion: 'Guantes de carnaza para soldador', categoria: 'EPP', unidad: 'par', stock: 70, ubicacion: 'Bodega EPP' },
  { ref: 'EP-CAS-DIE', descripcion: 'Casco dieléctrico con barbuquejo', categoria: 'EPP', unidad: 'und', stock: 25, ubicacion: 'Bodega EPP' },
  { ref: 'EP-ARN-4A', descripcion: 'Arnés cuerpo completo 4 argollas con eslinga doble', categoria: 'EPP', unidad: 'und', stock: 10, ubicacion: 'Bodega EPP' }
];
