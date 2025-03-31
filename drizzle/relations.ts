import { relations } from "drizzle-orm/relations";
import { sucursal, empleado, bodega, producto, stock, proveedor, compra, compraDetalle, movimientoBodega, cliente, factura, facturaDetalle, devolucion, devolucionDetalle, devolucionProveedor, devolucionProveedorDetalle, promocion, promocionProducto, caja, transaccionCaja, permiso, rolPermiso, auditoria } from "./schema";

export const empleadoRelations = relations(empleado, ({one, many}) => ({
	sucursal: one(sucursal, {
		fields: [empleado.idSucursal],
		references: [sucursal.idSucursal]
	}),
	compras: many(compra),
	movimientoBodegas: many(movimientoBodega),
	facturas: many(factura),
	devolucions: many(devolucion),
	devolucionProveedors: many(devolucionProveedor),
	cajas_idEmpleadoApertura: many(caja, {
		relationName: "caja_idEmpleadoApertura_empleado_idEmpleado"
	}),
	cajas_idEmpleadoCierre: many(caja, {
		relationName: "caja_idEmpleadoCierre_empleado_idEmpleado"
	}),
	transaccionCajas: many(transaccionCaja),
	auditorias: many(auditoria),
}));

export const sucursalRelations = relations(sucursal, ({many}) => ({
	empleados: many(empleado),
	bodegas: many(bodega),
	facturas: many(factura),
	cajas: many(caja),
}));

export const bodegaRelations = relations(bodega, ({one, many}) => ({
	sucursal: one(sucursal, {
		fields: [bodega.idSucursal],
		references: [sucursal.idSucursal]
	}),
	stocks: many(stock),
	compraDetalles: many(compraDetalle),
	movimientoBodegas_idBodegaOrigen: many(movimientoBodega, {
		relationName: "movimientoBodega_idBodegaOrigen_bodega_idBodega"
	}),
	movimientoBodegas_idBodegaDestino: many(movimientoBodega, {
		relationName: "movimientoBodega_idBodegaDestino_bodega_idBodega"
	}),
	devolucionDetalles: many(devolucionDetalle),
}));

export const stockRelations = relations(stock, ({one}) => ({
	producto: one(producto, {
		fields: [stock.idProducto],
		references: [producto.idProducto]
	}),
	bodega: one(bodega, {
		fields: [stock.idBodega],
		references: [bodega.idBodega]
	}),
}));

export const productoRelations = relations(producto, ({many}) => ({
	stocks: many(stock),
	compraDetalles: many(compraDetalle),
	movimientoBodegas: many(movimientoBodega),
	facturaDetalles: many(facturaDetalle),
	devolucionDetalles: many(devolucionDetalle),
	devolucionProveedorDetalles: many(devolucionProveedorDetalle),
	promocionProductos: many(promocionProducto),
}));

export const compraRelations = relations(compra, ({one, many}) => ({
	proveedor: one(proveedor, {
		fields: [compra.idProveedor],
		references: [proveedor.idProveedor]
	}),
	empleado: one(empleado, {
		fields: [compra.idEmpleado],
		references: [empleado.idEmpleado]
	}),
	compraDetalles: many(compraDetalle),
	devolucionProveedors: many(devolucionProveedor),
}));

export const proveedorRelations = relations(proveedor, ({many}) => ({
	compras: many(compra),
}));

export const compraDetalleRelations = relations(compraDetalle, ({one, many}) => ({
	compra: one(compra, {
		fields: [compraDetalle.idCompra],
		references: [compra.idCompra]
	}),
	producto: one(producto, {
		fields: [compraDetalle.idProducto],
		references: [producto.idProducto]
	}),
	bodega: one(bodega, {
		fields: [compraDetalle.idBodega],
		references: [bodega.idBodega]
	}),
	movimientoBodegas: many(movimientoBodega),
	facturaDetalles: many(facturaDetalle),
	devolucionDetalles: many(devolucionDetalle),
	devolucionProveedorDetalles: many(devolucionProveedorDetalle),
}));

export const movimientoBodegaRelations = relations(movimientoBodega, ({one}) => ({
	producto: one(producto, {
		fields: [movimientoBodega.idProducto],
		references: [producto.idProducto]
	}),
	compraDetalle: one(compraDetalle, {
		fields: [movimientoBodega.idLote],
		references: [compraDetalle.idLote]
	}),
	bodega_idBodegaOrigen: one(bodega, {
		fields: [movimientoBodega.idBodegaOrigen],
		references: [bodega.idBodega],
		relationName: "movimientoBodega_idBodegaOrigen_bodega_idBodega"
	}),
	bodega_idBodegaDestino: one(bodega, {
		fields: [movimientoBodega.idBodegaDestino],
		references: [bodega.idBodega],
		relationName: "movimientoBodega_idBodegaDestino_bodega_idBodega"
	}),
	empleado: one(empleado, {
		fields: [movimientoBodega.idEmpleado],
		references: [empleado.idEmpleado]
	}),
}));

export const facturaRelations = relations(factura, ({one, many}) => ({
	cliente: one(cliente, {
		fields: [factura.idCliente],
		references: [cliente.idCliente]
	}),
	empleado: one(empleado, {
		fields: [factura.idEmpleado],
		references: [empleado.idEmpleado]
	}),
	sucursal: one(sucursal, {
		fields: [factura.idSucursal],
		references: [sucursal.idSucursal]
	}),
	facturaDetalles: many(facturaDetalle),
	devolucions: many(devolucion),
	transaccionCajas: many(transaccionCaja),
}));

export const clienteRelations = relations(cliente, ({many}) => ({
	facturas: many(factura),
}));

export const facturaDetalleRelations = relations(facturaDetalle, ({one, many}) => ({
	factura: one(factura, {
		fields: [facturaDetalle.idFactura],
		references: [factura.idFactura]
	}),
	producto: one(producto, {
		fields: [facturaDetalle.idProducto],
		references: [producto.idProducto]
	}),
	compraDetalle: one(compraDetalle, {
		fields: [facturaDetalle.idLote],
		references: [compraDetalle.idLote]
	}),
	devolucionDetalles: many(devolucionDetalle),
}));

export const devolucionRelations = relations(devolucion, ({one, many}) => ({
	factura: one(factura, {
		fields: [devolucion.idFactura],
		references: [factura.idFactura]
	}),
	empleado: one(empleado, {
		fields: [devolucion.idEmpleado],
		references: [empleado.idEmpleado]
	}),
	devolucionDetalles: many(devolucionDetalle),
}));

export const devolucionDetalleRelations = relations(devolucionDetalle, ({one}) => ({
	devolucion: one(devolucion, {
		fields: [devolucionDetalle.idDevolucion],
		references: [devolucion.idDevolucion]
	}),
	facturaDetalle: one(facturaDetalle, {
		fields: [devolucionDetalle.idFacturaDetalle],
		references: [facturaDetalle.idDetalle]
	}),
	producto: one(producto, {
		fields: [devolucionDetalle.idProducto],
		references: [producto.idProducto]
	}),
	compraDetalle: one(compraDetalle, {
		fields: [devolucionDetalle.idLote],
		references: [compraDetalle.idLote]
	}),
	bodega: one(bodega, {
		fields: [devolucionDetalle.idBodegaDestino],
		references: [bodega.idBodega]
	}),
}));

export const devolucionProveedorRelations = relations(devolucionProveedor, ({one, many}) => ({
	compra: one(compra, {
		fields: [devolucionProveedor.idCompra],
		references: [compra.idCompra]
	}),
	empleado: one(empleado, {
		fields: [devolucionProveedor.idEmpleado],
		references: [empleado.idEmpleado]
	}),
	devolucionProveedorDetalles: many(devolucionProveedorDetalle),
}));

export const devolucionProveedorDetalleRelations = relations(devolucionProveedorDetalle, ({one}) => ({
	devolucionProveedor: one(devolucionProveedor, {
		fields: [devolucionProveedorDetalle.idDevolucionProv],
		references: [devolucionProveedor.idDevolucionProv]
	}),
	compraDetalle: one(compraDetalle, {
		fields: [devolucionProveedorDetalle.idCompraDetalle],
		references: [compraDetalle.idLote]
	}),
	producto: one(producto, {
		fields: [devolucionProveedorDetalle.idProducto],
		references: [producto.idProducto]
	}),
}));

export const promocionProductoRelations = relations(promocionProducto, ({one}) => ({
	promocion: one(promocion, {
		fields: [promocionProducto.idPromocion],
		references: [promocion.idPromocion]
	}),
	producto: one(producto, {
		fields: [promocionProducto.idProducto],
		references: [producto.idProducto]
	}),
}));

export const promocionRelations = relations(promocion, ({many}) => ({
	promocionProductos: many(promocionProducto),
}));

export const cajaRelations = relations(caja, ({one, many}) => ({
	sucursal: one(sucursal, {
		fields: [caja.idSucursal],
		references: [sucursal.idSucursal]
	}),
	empleado_idEmpleadoApertura: one(empleado, {
		fields: [caja.idEmpleadoApertura],
		references: [empleado.idEmpleado],
		relationName: "caja_idEmpleadoApertura_empleado_idEmpleado"
	}),
	empleado_idEmpleadoCierre: one(empleado, {
		fields: [caja.idEmpleadoCierre],
		references: [empleado.idEmpleado],
		relationName: "caja_idEmpleadoCierre_empleado_idEmpleado"
	}),
	transaccionCajas: many(transaccionCaja),
}));

export const transaccionCajaRelations = relations(transaccionCaja, ({one}) => ({
	caja: one(caja, {
		fields: [transaccionCaja.idCaja],
		references: [caja.idCaja]
	}),
	empleado: one(empleado, {
		fields: [transaccionCaja.idEmpleado],
		references: [empleado.idEmpleado]
	}),
	factura: one(factura, {
		fields: [transaccionCaja.idFactura],
		references: [factura.idFactura]
	}),
}));

export const rolPermisoRelations = relations(rolPermiso, ({one}) => ({
	permiso: one(permiso, {
		fields: [rolPermiso.idPermiso],
		references: [permiso.idPermiso]
	}),
}));

export const permisoRelations = relations(permiso, ({many}) => ({
	rolPermisos: many(rolPermiso),
}));

export const auditoriaRelations = relations(auditoria, ({one}) => ({
	empleado: one(empleado, {
		fields: [auditoria.idUsuario],
		references: [empleado.idEmpleado]
	}),
}));