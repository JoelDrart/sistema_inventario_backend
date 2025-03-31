import {
  pgTable,
  varchar,
  text,
  timestamp,
  index,
  foreignKey,
  unique,
  date,
  boolean,
  numeric,
  integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sucursal = pgTable('sucursal', {
  idSucursal: varchar('id_sucursal', { length: 50 }).primaryKey().notNull(),
  nombre: varchar({ length: 100 }).notNull(),
  direccion: text(),
  telefono: varchar({ length: 20 }),
  estado: varchar({ length: 50 }).default('activo'),
  createdAt: timestamp('created_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const empleado = pgTable(
  'empleado',
  {
    idEmpleado: varchar('id_empleado', { length: 50 }).primaryKey().notNull(),
    nombre: varchar({ length: 100 }).notNull(),
    apellido: varchar({ length: 100 }).notNull(),
    documentoIdentidad: varchar('documento_identidad', {
      length: 30,
    }).notNull(),
    email: varchar({ length: 100 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    rol: varchar({ length: 50 }),
    idSucursal: varchar('id_sucursal', { length: 50 }),
    fechaContratacion: date('fecha_contratacion').default(sql`CURRENT_DATE`),
    estado: varchar({ length: 50 }).default('activo'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_empleado_documento').using(
      'btree',
      table.documentoIdentidad.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.idSucursal],
      foreignColumns: [sucursal.idSucursal],
      name: 'empleado_id_sucursal_fkey',
    }),
    unique('empleado_documento_identidad_key').on(table.documentoIdentidad),
    unique('empleado_email_key').on(table.email),
  ],
);

export const bodega = pgTable(
  'bodega',
  {
    idBodega: varchar('id_bodega', { length: 50 }).primaryKey().notNull(),
    nombre: varchar({ length: 100 }).notNull(),
    descripcion: text(),
    idSucursal: varchar('id_sucursal', { length: 50 }),
    esPrincipal: boolean('es_principal').default(false),
    estado: varchar({ length: 50 }).default('activo'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idSucursal],
      foreignColumns: [sucursal.idSucursal],
      name: 'bodega_id_sucursal_fkey',
    }),
  ],
);

export const producto = pgTable(
  'producto',
  {
    idProducto: varchar('id_producto', { length: 50 }).primaryKey().notNull(),
    codigo: varchar({ length: 50 }),
    nombre: varchar({ length: 100 }).notNull(),
    descripcion: text(),
    categoria: varchar({ length: 50 }),
    subcategoria: varchar({ length: 50 }),
    precio: numeric({ precision: 10, scale: 2 }).notNull(),
    costoPromedio: numeric('costo_promedio', { precision: 10, scale: 2 }),
    impuesto: numeric({ precision: 5, scale: 2 }).default('0'),
    unidadMedida: varchar('unidad_medida', { length: 20 }).default('Unidad'),
    imagenUrl: varchar('imagen_url', { length: 255 }),
    publicImageId: varchar('id_public_image', { length: 255 }),
    estado: varchar({ length: 50 }).default('activo'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_producto_codigo').using(
      'btree',
      table.codigo.asc().nullsLast().op('text_ops'),
    ),
    index('idx_producto_nombre').using(
      'btree',
      table.nombre.asc().nullsLast().op('text_ops'),
    ),
    unique('producto_codigo_key').on(table.codigo),
  ],
);

export const stock = pgTable(
  'stock',
  {
    idStock: varchar('id_stock', { length: 50 }).primaryKey().notNull(),
    idProducto: varchar('id_producto', { length: 50 }),
    idBodega: varchar('id_bodega', { length: 50 }),
    cantidad: integer().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_stock_producto').using(
      'btree',
      table.idProducto.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'stock_id_producto_fkey',
    }),
    foreignKey({
      columns: [table.idBodega],
      foreignColumns: [bodega.idBodega],
      name: 'stock_id_bodega_fkey',
    }),
    unique('stock_id_producto_id_bodega_key').on(
      table.idProducto,
      table.idBodega,
    ),
  ],
);

export const proveedor = pgTable(
  'proveedor',
  {
    idProveedor: varchar('id_proveedor', { length: 50 }).primaryKey().notNull(),
    nombre: varchar({ length: 100 }).notNull(),
    documentoIdentidad: varchar('documento_identidad', { length: 30 }),
    contacto: varchar({ length: 100 }),
    telefono: varchar({ length: 20 }),
    email: varchar({ length: 100 }),
    direccion: text(),
    estado: varchar({ length: 50 }).default('activo'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique('proveedor_documento_identidad_key').on(table.documentoIdentidad),
  ],
);

export const compra = pgTable(
  'compra',
  {
    idCompra: varchar('id_compra', { length: 50 }).primaryKey().notNull(),
    idProveedor: varchar('id_proveedor', { length: 50 }),
    idEmpleado: varchar('id_empleado', { length: 50 }),
    fecha: date().notNull(),
    numeroFactura: varchar('numero_factura', { length: 50 }),
    total: numeric({ precision: 10, scale: 2 }).notNull(),
    estado: varchar({ length: 20 }),
    observaciones: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_compra_fecha').using(
      'btree',
      table.fecha.asc().nullsLast().op('date_ops'),
    ),
    foreignKey({
      columns: [table.idProveedor],
      foreignColumns: [proveedor.idProveedor],
      name: 'compra_id_proveedor_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleado],
      foreignColumns: [empleado.idEmpleado],
      name: 'compra_id_empleado_fkey',
    }),
  ],
);

export const compraDetalle = pgTable(
  'compra_detalle',
  {
    idLote: varchar('id_lote', { length: 50 }).primaryKey().notNull(),
    idCompra: varchar('id_compra', { length: 50 }),
    idProducto: varchar('id_producto', { length: 50 }),
    idBodega: varchar('id_bodega', { length: 50 }),
    cantidad: integer().notNull(),
    cantidadDisponible: integer('cantidad_disponible'),
    costoUnitario: numeric('costo_unitario', {
      precision: 10,
      scale: 2,
    }).notNull(),
    fechaCaducidad: date('fecha_caducidad'),
    fechaRecepcion: date('fecha_recepcion'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_compra_detalle_producto').using(
      'btree',
      table.idProducto.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.idCompra],
      foreignColumns: [compra.idCompra],
      name: 'compra_detalle_id_compra_fkey',
    }),
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'compra_detalle_id_producto_fkey',
    }),
    foreignKey({
      columns: [table.idBodega],
      foreignColumns: [bodega.idBodega],
      name: 'compra_detalle_id_bodega_fkey',
    }),
  ],
);

export const movimientoBodega = pgTable(
  'movimiento_bodega',
  {
    idMovimiento: varchar('id_movimiento', { length: 50 })
      .primaryKey()
      .notNull(),
    idProducto: varchar('id_producto', { length: 50 }),
    idLote: varchar('id_lote', { length: 50 }),
    idBodegaOrigen: varchar('id_bodega_origen', { length: 50 }),
    idBodegaDestino: varchar('id_bodega_destino', { length: 50 }),
    cantidad: integer().notNull(),
    fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    idEmpleado: varchar('id_empleado', { length: 50 }),
    motivo: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'movimiento_bodega_id_producto_fkey',
    }),
    foreignKey({
      columns: [table.idLote],
      foreignColumns: [compraDetalle.idLote],
      name: 'movimiento_bodega_id_lote_fkey',
    }),
    foreignKey({
      columns: [table.idBodegaOrigen],
      foreignColumns: [bodega.idBodega],
      name: 'movimiento_bodega_id_bodega_origen_fkey',
    }),
    foreignKey({
      columns: [table.idBodegaDestino],
      foreignColumns: [bodega.idBodega],
      name: 'movimiento_bodega_id_bodega_destino_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleado],
      foreignColumns: [empleado.idEmpleado],
      name: 'movimiento_bodega_id_empleado_fkey',
    }),
  ],
);

export const cliente = pgTable(
  'cliente',
  {
    idCliente: varchar('id_cliente', { length: 50 }).primaryKey().notNull(),
    nombre: varchar({ length: 100 }).notNull(),
    apellido: varchar({ length: 100 }).notNull(),
    documentoIdentidad: varchar('documento_identidad', {
      length: 30,
    }).notNull(),
    email: varchar({ length: 100 }),
    telefono: varchar({ length: 20 }),
    direccion: text(),
    fechaRegistro: date('fecha_registro').default(sql`CURRENT_DATE`),
    estado: varchar({ length: 50 }).default('activo'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_cliente_documento').using(
      'btree',
      table.documentoIdentidad.asc().nullsLast().op('text_ops'),
    ),
    index('idx_cliente_email').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
    ),
    unique('cliente_documento_identidad_key').on(table.documentoIdentidad),
    unique('cliente_email_key').on(table.email),
  ],
);

export const factura = pgTable(
  'factura',
  {
    idFactura: varchar('id_factura', { length: 50 }).primaryKey().notNull(),
    numeroFactura: varchar('numero_factura', { length: 20 }).notNull(),
    idCliente: varchar('id_cliente', { length: 50 }),
    idEmpleado: varchar('id_empleado', { length: 50 }),
    idSucursal: varchar('id_sucursal', { length: 50 }),
    fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    subtotal: numeric({ precision: 10, scale: 2 }).notNull(),
    impuestoTotal: numeric('impuesto_total', {
      precision: 10,
      scale: 2,
    }).default('0'),
    descuentoTotal: numeric('descuento_total', {
      precision: 10,
      scale: 2,
    }).default('0'),
    total: numeric({ precision: 10, scale: 2 }).notNull(),
    estado: varchar({ length: 20 }),
    metodoPago: varchar('metodo_pago', { length: 50 }),
    observaciones: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_factura_cliente').using(
      'btree',
      table.idCliente.asc().nullsLast().op('text_ops'),
    ),
    index('idx_factura_fecha').using(
      'btree',
      table.fecha.asc().nullsLast().op('timestamp_ops'),
    ),
    index('idx_factura_sucursal').using(
      'btree',
      table.idSucursal.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.idCliente],
      foreignColumns: [cliente.idCliente],
      name: 'factura_id_cliente_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleado],
      foreignColumns: [empleado.idEmpleado],
      name: 'factura_id_empleado_fkey',
    }),
    foreignKey({
      columns: [table.idSucursal],
      foreignColumns: [sucursal.idSucursal],
      name: 'factura_id_sucursal_fkey',
    }),
    unique('factura_numero_factura_key').on(table.numeroFactura),
  ],
);

export const facturaDetalle = pgTable(
  'factura_detalle',
  {
    idDetalle: varchar('id_detalle', { length: 50 }).primaryKey().notNull(),
    idFactura: varchar('id_factura', { length: 50 }),
    idProducto: varchar('id_producto', { length: 50 }),
    idLote: varchar('id_lote', { length: 50 }),
    cantidad: integer().notNull(),
    precioUnitario: numeric('precio_unitario', {
      precision: 10,
      scale: 2,
    }).notNull(),
    descuento: numeric({ precision: 10, scale: 2 }).default('0'),
    impuesto: numeric({ precision: 10, scale: 2 }).default('0'),
    subtotal: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_factura_detalle_producto').using(
      'btree',
      table.idProducto.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.idFactura],
      foreignColumns: [factura.idFactura],
      name: 'factura_detalle_id_factura_fkey',
    }),
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'factura_detalle_id_producto_fkey',
    }),
    foreignKey({
      columns: [table.idLote],
      foreignColumns: [compraDetalle.idLote],
      name: 'factura_detalle_id_lote_fkey',
    }),
  ],
);

export const devolucion = pgTable(
  'devolucion',
  {
    idDevolucion: varchar('id_devolucion', { length: 50 })
      .primaryKey()
      .notNull(),
    idFactura: varchar('id_factura', { length: 50 }),
    idEmpleado: varchar('id_empleado', { length: 50 }),
    fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    total: numeric({ precision: 10, scale: 2 }).notNull(),
    motivo: text(),
    estado: varchar({ length: 20 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idFactura],
      foreignColumns: [factura.idFactura],
      name: 'devolucion_id_factura_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleado],
      foreignColumns: [empleado.idEmpleado],
      name: 'devolucion_id_empleado_fkey',
    }),
  ],
);

export const devolucionDetalle = pgTable(
  'devolucion_detalle',
  {
    idDetalleDev: varchar('id_detalle_dev', { length: 50 })
      .primaryKey()
      .notNull(),
    idDevolucion: varchar('id_devolucion', { length: 50 }),
    idFacturaDetalle: varchar('id_factura_detalle', { length: 50 }),
    idProducto: varchar('id_producto', { length: 50 }),
    idLote: varchar('id_lote', { length: 50 }),
    cantidad: integer().notNull(),
    precioUnitario: numeric('precio_unitario', {
      precision: 10,
      scale: 2,
    }).notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).notNull(),
    idBodegaDestino: varchar('id_bodega_destino', { length: 50 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idDevolucion],
      foreignColumns: [devolucion.idDevolucion],
      name: 'devolucion_detalle_id_devolucion_fkey',
    }),
    foreignKey({
      columns: [table.idFacturaDetalle],
      foreignColumns: [facturaDetalle.idDetalle],
      name: 'devolucion_detalle_id_factura_detalle_fkey',
    }),
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'devolucion_detalle_id_producto_fkey',
    }),
    foreignKey({
      columns: [table.idLote],
      foreignColumns: [compraDetalle.idLote],
      name: 'devolucion_detalle_id_lote_fkey',
    }),
    foreignKey({
      columns: [table.idBodegaDestino],
      foreignColumns: [bodega.idBodega],
      name: 'devolucion_detalle_id_bodega_destino_fkey',
    }),
  ],
);

export const devolucionProveedor = pgTable(
  'devolucion_proveedor',
  {
    idDevolucionProv: varchar('id_devolucion_prov', { length: 50 })
      .primaryKey()
      .notNull(),
    idCompra: varchar('id_compra', { length: 50 }),
    idEmpleado: varchar('id_empleado', { length: 50 }),
    fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    total: numeric({ precision: 10, scale: 2 }).notNull(),
    motivo: text(),
    estado: varchar({ length: 20 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idCompra],
      foreignColumns: [compra.idCompra],
      name: 'devolucion_proveedor_id_compra_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleado],
      foreignColumns: [empleado.idEmpleado],
      name: 'devolucion_proveedor_id_empleado_fkey',
    }),
  ],
);

export const devolucionProveedorDetalle = pgTable(
  'devolucion_proveedor_detalle',
  {
    idDetalleDevProv: varchar('id_detalle_dev_prov', { length: 50 })
      .primaryKey()
      .notNull(),
    idDevolucionProv: varchar('id_devolucion_prov', { length: 50 }),
    idCompraDetalle: varchar('id_compra_detalle', { length: 50 }),
    idProducto: varchar('id_producto', { length: 50 }),
    cantidad: integer().notNull(),
    costoUnitario: numeric('costo_unitario', {
      precision: 10,
      scale: 2,
    }).notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idDevolucionProv],
      foreignColumns: [devolucionProveedor.idDevolucionProv],
      name: 'devolucion_proveedor_detalle_id_devolucion_prov_fkey',
    }),
    foreignKey({
      columns: [table.idCompraDetalle],
      foreignColumns: [compraDetalle.idLote],
      name: 'devolucion_proveedor_detalle_id_compra_detalle_fkey',
    }),
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'devolucion_proveedor_detalle_id_producto_fkey',
    }),
  ],
);

export const promocion = pgTable('promocion', {
  idPromocion: varchar('id_promocion', { length: 50 }).primaryKey().notNull(),
  nombre: varchar({ length: 100 }).notNull(),
  descripcion: text(),
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin'),
  tipo: varchar({ length: 50 }),
  valor: numeric({ precision: 10, scale: 2 }),
  estado: varchar({ length: 50 }).default('activo'),
  createdAt: timestamp('created_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const promocionProducto = pgTable(
  'promocion_producto',
  {
    idPromocionProducto: varchar('id_promocion_producto', { length: 50 })
      .primaryKey()
      .notNull(),
    idPromocion: varchar('id_promocion', { length: 50 }),
    idProducto: varchar('id_producto', { length: 50 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idPromocion],
      foreignColumns: [promocion.idPromocion],
      name: 'promocion_producto_id_promocion_fkey',
    }),
    foreignKey({
      columns: [table.idProducto],
      foreignColumns: [producto.idProducto],
      name: 'promocion_producto_id_producto_fkey',
    }),
    unique('promocion_producto_id_promocion_id_producto_key').on(
      table.idPromocion,
      table.idProducto,
    ),
  ],
);

export const caja = pgTable(
  'caja',
  {
    idCaja: varchar('id_caja', { length: 50 }).primaryKey().notNull(),
    nombre: varchar({ length: 50 }).notNull(),
    idSucursal: varchar('id_sucursal', { length: 50 }),
    fechaApertura: timestamp('fecha_apertura', { mode: 'string' }),
    fechaCierre: timestamp('fecha_cierre', { mode: 'string' }),
    idEmpleadoApertura: varchar('id_empleado_apertura', { length: 50 }),
    idEmpleadoCierre: varchar('id_empleado_cierre', { length: 50 }),
    saldoInicial: numeric('saldo_inicial', {
      precision: 10,
      scale: 2,
    }).notNull(),
    saldoFinal: numeric('saldo_final', { precision: 10, scale: 2 }),
    estado: varchar({ length: 20 }),
    observaciones: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idSucursal],
      foreignColumns: [sucursal.idSucursal],
      name: 'caja_id_sucursal_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleadoApertura],
      foreignColumns: [empleado.idEmpleado],
      name: 'caja_id_empleado_apertura_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleadoCierre],
      foreignColumns: [empleado.idEmpleado],
      name: 'caja_id_empleado_cierre_fkey',
    }),
  ],
);

export const transaccionCaja = pgTable(
  'transaccion_caja',
  {
    idTransaccion: varchar('id_transaccion', { length: 50 })
      .primaryKey()
      .notNull(),
    idCaja: varchar('id_caja', { length: 50 }),
    idEmpleado: varchar('id_empleado', { length: 50 }),
    tipo: varchar({ length: 50 }),
    categoria: varchar({ length: 50 }),
    monto: numeric({ precision: 10, scale: 2 }).notNull(),
    fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    idFactura: varchar('id_factura', { length: 50 }),
    descripcion: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idCaja],
      foreignColumns: [caja.idCaja],
      name: 'transaccion_caja_id_caja_fkey',
    }),
    foreignKey({
      columns: [table.idEmpleado],
      foreignColumns: [empleado.idEmpleado],
      name: 'transaccion_caja_id_empleado_fkey',
    }),
    foreignKey({
      columns: [table.idFactura],
      foreignColumns: [factura.idFactura],
      name: 'transaccion_caja_id_factura_fkey',
    }),
  ],
);

export const permiso = pgTable('permiso', {
  idPermiso: varchar('id_permiso', { length: 50 }).primaryKey().notNull(),
  nombre: varchar({ length: 100 }).notNull(),
  descripcion: text(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const rolPermiso = pgTable(
  'rol_permiso',
  {
    idRolPermiso: varchar('id_rol_permiso', { length: 50 })
      .primaryKey()
      .notNull(),
    rol: varchar({ length: 50 }),
    idPermiso: varchar('id_permiso', { length: 50 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.idPermiso],
      foreignColumns: [permiso.idPermiso],
      name: 'rol_permiso_id_permiso_fkey',
    }),
    unique('rol_permiso_rol_id_permiso_key').on(table.rol, table.idPermiso),
  ],
);

export const auditoria = pgTable(
  'auditoria',
  {
    idAuditoria: varchar('id_auditoria', { length: 50 }).primaryKey().notNull(),
    idUsuario: varchar('id_usuario', { length: 50 }),
    accion: text().notNull(),
    tablaAfectada: varchar('tabla_afectada', { length: 100 }),
    idRegistro: varchar('id_registro', { length: 100 }),
    valorAnterior: text('valor_anterior'),
    valorNuevo: text('valor_nuevo'),
    fecha: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    ipAddress: varchar('ip_address', { length: 50 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_auditoria_fecha').using(
      'btree',
      table.fecha.asc().nullsLast().op('timestamp_ops'),
    ),
    foreignKey({
      columns: [table.idUsuario],
      foreignColumns: [empleado.idEmpleado],
      name: 'auditoria_id_usuario_fkey',
    }),
  ],
);
