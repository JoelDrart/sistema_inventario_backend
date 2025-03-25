-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "sucursal" (
	"id_sucursal" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"direccion" text,
	"telefono" varchar(20),
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "empleado" (
	"id_empleado" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"apellido" varchar(100) NOT NULL,
	"documento_identidad" varchar(30) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"rol" varchar(50),
	"id_sucursal" varchar(50),
	"fecha_contratacion" date DEFAULT CURRENT_DATE,
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "empleado_documento_identidad_key" UNIQUE("documento_identidad"),
	CONSTRAINT "empleado_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bodega" (
	"id_bodega" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"id_sucursal" varchar(50),
	"es_principal" boolean DEFAULT false,
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "producto" (
	"id_producto" varchar(50) PRIMARY KEY NOT NULL,
	"codigo" varchar(50),
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"categoria" varchar(50),
	"subcategoria" varchar(50),
	"precio" numeric(10, 2) NOT NULL,
	"costo_promedio" numeric(10, 2),
	"impuesto" numeric(5, 2) DEFAULT '0',
	"unidad_medida" varchar(20) DEFAULT 'Unidad',
	"imagen_url" varchar(255),
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "producto_codigo_key" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "stock" (
	"id_stock" varchar(50) PRIMARY KEY NOT NULL,
	"id_producto" varchar(50),
	"id_bodega" varchar(50),
	"cantidad" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "stock_id_producto_id_bodega_key" UNIQUE("id_producto","id_bodega")
);
--> statement-breakpoint
CREATE TABLE "proveedor" (
	"id_proveedor" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"documento_identidad" varchar(30),
	"contacto" varchar(100),
	"telefono" varchar(20),
	"email" varchar(100),
	"direccion" text,
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "proveedor_documento_identidad_key" UNIQUE("documento_identidad")
);
--> statement-breakpoint
CREATE TABLE "compra" (
	"id_compra" varchar(50) PRIMARY KEY NOT NULL,
	"id_proveedor" varchar(50),
	"id_empleado" varchar(50),
	"fecha" date NOT NULL,
	"numero_factura" varchar(50),
	"total" numeric(10, 2) NOT NULL,
	"estado" varchar(20),
	"observaciones" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "compra_detalle" (
	"id_lote" varchar(50) PRIMARY KEY NOT NULL,
	"id_compra" varchar(50),
	"id_producto" varchar(50),
	"id_bodega" varchar(50),
	"cantidad" integer NOT NULL,
	"cantidad_disponible" integer,
	"costo_unitario" numeric(10, 2) NOT NULL,
	"fecha_caducidad" date,
	"fecha_recepcion" date,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "movimiento_bodega" (
	"id_movimiento" varchar(50) PRIMARY KEY NOT NULL,
	"id_producto" varchar(50),
	"id_lote" varchar(50),
	"id_bodega_origen" varchar(50),
	"id_bodega_destino" varchar(50),
	"cantidad" integer NOT NULL,
	"fecha" timestamp DEFAULT CURRENT_TIMESTAMP,
	"id_empleado" varchar(50),
	"motivo" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "cliente" (
	"id_cliente" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"apellido" varchar(100) NOT NULL,
	"documento_identidad" varchar(30) NOT NULL,
	"email" varchar(100),
	"telefono" varchar(20),
	"direccion" text,
	"fecha_registro" date DEFAULT CURRENT_DATE,
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "cliente_documento_identidad_key" UNIQUE("documento_identidad"),
	CONSTRAINT "cliente_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "factura" (
	"id_factura" varchar(50) PRIMARY KEY NOT NULL,
	"numero_factura" varchar(20) NOT NULL,
	"id_cliente" varchar(50),
	"id_empleado" varchar(50),
	"id_sucursal" varchar(50),
	"fecha" timestamp DEFAULT CURRENT_TIMESTAMP,
	"subtotal" numeric(10, 2) NOT NULL,
	"impuesto_total" numeric(10, 2) DEFAULT '0',
	"descuento_total" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"estado" varchar(20),
	"metodo_pago" varchar(50),
	"observaciones" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "factura_numero_factura_key" UNIQUE("numero_factura")
);
--> statement-breakpoint
CREATE TABLE "factura_detalle" (
	"id_detalle" varchar(50) PRIMARY KEY NOT NULL,
	"id_factura" varchar(50),
	"id_producto" varchar(50),
	"id_lote" varchar(50),
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL,
	"descuento" numeric(10, 2) DEFAULT '0',
	"impuesto" numeric(10, 2) DEFAULT '0',
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "devolucion" (
	"id_devolucion" varchar(50) PRIMARY KEY NOT NULL,
	"id_factura" varchar(50),
	"id_empleado" varchar(50),
	"fecha" timestamp DEFAULT CURRENT_TIMESTAMP,
	"total" numeric(10, 2) NOT NULL,
	"motivo" text,
	"estado" varchar(20),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "devolucion_detalle" (
	"id_detalle_dev" varchar(50) PRIMARY KEY NOT NULL,
	"id_devolucion" varchar(50),
	"id_factura_detalle" varchar(50),
	"id_producto" varchar(50),
	"id_lote" varchar(50),
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"id_bodega_destino" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "devolucion_proveedor" (
	"id_devolucion_prov" varchar(50) PRIMARY KEY NOT NULL,
	"id_compra" varchar(50),
	"id_empleado" varchar(50),
	"fecha" timestamp DEFAULT CURRENT_TIMESTAMP,
	"total" numeric(10, 2) NOT NULL,
	"motivo" text,
	"estado" varchar(20),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "devolucion_proveedor_detalle" (
	"id_detalle_dev_prov" varchar(50) PRIMARY KEY NOT NULL,
	"id_devolucion_prov" varchar(50),
	"id_compra_detalle" varchar(50),
	"id_producto" varchar(50),
	"cantidad" integer NOT NULL,
	"costo_unitario" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "promocion" (
	"id_promocion" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date,
	"tipo" varchar(50),
	"valor" numeric(10, 2),
	"estado" varchar(50) DEFAULT 'activo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "promocion_producto" (
	"id_promocion_producto" varchar(50) PRIMARY KEY NOT NULL,
	"id_promocion" varchar(50),
	"id_producto" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "promocion_producto_id_promocion_id_producto_key" UNIQUE("id_promocion","id_producto")
);
--> statement-breakpoint
CREATE TABLE "caja" (
	"id_caja" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(50) NOT NULL,
	"id_sucursal" varchar(50),
	"fecha_apertura" timestamp,
	"fecha_cierre" timestamp,
	"id_empleado_apertura" varchar(50),
	"id_empleado_cierre" varchar(50),
	"saldo_inicial" numeric(10, 2) NOT NULL,
	"saldo_final" numeric(10, 2),
	"estado" varchar(20),
	"observaciones" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "transaccion_caja" (
	"id_transaccion" varchar(50) PRIMARY KEY NOT NULL,
	"id_caja" varchar(50),
	"id_empleado" varchar(50),
	"tipo" varchar(50),
	"categoria" varchar(50),
	"monto" numeric(10, 2) NOT NULL,
	"fecha" timestamp DEFAULT CURRENT_TIMESTAMP,
	"id_factura" varchar(50),
	"descripcion" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "permiso" (
	"id_permiso" varchar(50) PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "rol_permiso" (
	"id_rol_permiso" varchar(50) PRIMARY KEY NOT NULL,
	"rol" varchar(50),
	"id_permiso" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "rol_permiso_rol_id_permiso_key" UNIQUE("rol","id_permiso")
);
--> statement-breakpoint
CREATE TABLE "auditoria" (
	"id_auditoria" varchar(50) PRIMARY KEY NOT NULL,
	"id_usuario" varchar(50),
	"accion" text NOT NULL,
	"tabla_afectada" varchar(100),
	"id_registro" varchar(100),
	"valor_anterior" text,
	"valor_nuevo" text,
	"fecha" timestamp DEFAULT CURRENT_TIMESTAMP,
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bodega" ADD CONSTRAINT "bodega_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "stock_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock" ADD CONSTRAINT "stock_id_bodega_fkey" FOREIGN KEY ("id_bodega") REFERENCES "public"."bodega"("id_bodega") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra" ADD CONSTRAINT "compra_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedor"("id_proveedor") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra" ADD CONSTRAINT "compra_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_detalle" ADD CONSTRAINT "compra_detalle_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "public"."compra"("id_compra") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_detalle" ADD CONSTRAINT "compra_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_detalle" ADD CONSTRAINT "compra_detalle_id_bodega_fkey" FOREIGN KEY ("id_bodega") REFERENCES "public"."bodega"("id_bodega") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimiento_bodega" ADD CONSTRAINT "movimiento_bodega_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimiento_bodega" ADD CONSTRAINT "movimiento_bodega_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "public"."compra_detalle"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimiento_bodega" ADD CONSTRAINT "movimiento_bodega_id_bodega_origen_fkey" FOREIGN KEY ("id_bodega_origen") REFERENCES "public"."bodega"("id_bodega") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimiento_bodega" ADD CONSTRAINT "movimiento_bodega_id_bodega_destino_fkey" FOREIGN KEY ("id_bodega_destino") REFERENCES "public"."bodega"("id_bodega") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimiento_bodega" ADD CONSTRAINT "movimiento_bodega_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."factura"("id_factura") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "public"."compra_detalle"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."factura"("id_factura") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_id_devolucion_fkey" FOREIGN KEY ("id_devolucion") REFERENCES "public"."devolucion"("id_devolucion") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_id_factura_detalle_fkey" FOREIGN KEY ("id_factura_detalle") REFERENCES "public"."factura_detalle"("id_detalle") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "public"."compra_detalle"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_id_bodega_destino_fkey" FOREIGN KEY ("id_bodega_destino") REFERENCES "public"."bodega"("id_bodega") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_proveedor" ADD CONSTRAINT "devolucion_proveedor_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "public"."compra"("id_compra") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_proveedor" ADD CONSTRAINT "devolucion_proveedor_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_proveedor_detalle" ADD CONSTRAINT "devolucion_proveedor_detalle_id_devolucion_prov_fkey" FOREIGN KEY ("id_devolucion_prov") REFERENCES "public"."devolucion_proveedor"("id_devolucion_prov") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_proveedor_detalle" ADD CONSTRAINT "devolucion_proveedor_detalle_id_compra_detalle_fkey" FOREIGN KEY ("id_compra_detalle") REFERENCES "public"."compra_detalle"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devolucion_proveedor_detalle" ADD CONSTRAINT "devolucion_proveedor_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promocion_producto" ADD CONSTRAINT "promocion_producto_id_promocion_fkey" FOREIGN KEY ("id_promocion") REFERENCES "public"."promocion"("id_promocion") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promocion_producto" ADD CONSTRAINT "promocion_producto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caja" ADD CONSTRAINT "caja_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "public"."sucursal"("id_sucursal") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caja" ADD CONSTRAINT "caja_id_empleado_apertura_fkey" FOREIGN KEY ("id_empleado_apertura") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caja" ADD CONSTRAINT "caja_id_empleado_cierre_fkey" FOREIGN KEY ("id_empleado_cierre") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaccion_caja" ADD CONSTRAINT "transaccion_caja_id_caja_fkey" FOREIGN KEY ("id_caja") REFERENCES "public"."caja"("id_caja") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaccion_caja" ADD CONSTRAINT "transaccion_caja_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaccion_caja" ADD CONSTRAINT "transaccion_caja_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."factura"("id_factura") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "public"."permiso"("id_permiso") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."empleado"("id_empleado") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_empleado_documento" ON "empleado" USING btree ("documento_identidad" text_ops);--> statement-breakpoint
CREATE INDEX "idx_producto_codigo" ON "producto" USING btree ("codigo" text_ops);--> statement-breakpoint
CREATE INDEX "idx_producto_nombre" ON "producto" USING btree ("nombre" text_ops);--> statement-breakpoint
CREATE INDEX "idx_stock_producto" ON "stock" USING btree ("id_producto" text_ops);--> statement-breakpoint
CREATE INDEX "idx_compra_fecha" ON "compra" USING btree ("fecha" date_ops);--> statement-breakpoint
CREATE INDEX "idx_compra_detalle_producto" ON "compra_detalle" USING btree ("id_producto" text_ops);--> statement-breakpoint
CREATE INDEX "idx_cliente_documento" ON "cliente" USING btree ("documento_identidad" text_ops);--> statement-breakpoint
CREATE INDEX "idx_cliente_email" ON "cliente" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_factura_cliente" ON "factura" USING btree ("id_cliente" text_ops);--> statement-breakpoint
CREATE INDEX "idx_factura_fecha" ON "factura" USING btree ("fecha" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_factura_sucursal" ON "factura" USING btree ("id_sucursal" text_ops);--> statement-breakpoint
CREATE INDEX "idx_factura_detalle_producto" ON "factura_detalle" USING btree ("id_producto" text_ops);--> statement-breakpoint
CREATE INDEX "idx_auditoria_fecha" ON "auditoria" USING btree ("fecha" timestamp_ops);
*/