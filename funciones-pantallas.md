# Funciones de las Pantallas - H&B Importaciones

## 📋 Descripción General

Este documento describe la función específica de cada pantalla que conforma el proyecto **H&B Importaciones**, un sistema de e-commerce especializado en tecnología con múltiples roles de usuario.

---

## 🏠 **PANTALLAS PRINCIPALES**

### 1. **index.html** - Página Principal

**Función:** Landing page y punto de entrada del sistema

- **Hero Slider:** 4 slides promocionales con información de la empresa
- **Showcase de productos:** Productos destacados y ofertas del mes
- **Grid de productos:** Catálogo principal con categorías
- **Navegación:** Acceso a todas las secciones del sistema
- **Carrito modal:** Vista previa del carrito sin autenticación requerida

## 🔐 **MÓDULO DE AUTENTICACIÓN**

### 2. Página de Login

**Función:** Autenticación de usuarios con redirección automática

- **Formulario de login:** Email y contraseña
- **Auto-completado demo:** Chips para llenar credenciales de prueba
- **Formulario de registro rápido:** Enlace directo al registro
- **Beneficios del registro:** Lista de ventajas para nuevos usuarios
- **Redirección inteligente:** Según parámetros URL y rol de usuario

### 3. Página de Registro

**Función:** Registro de nuevos usuarios en el sistema

- **Formulario completo:** Datos personales y credenciales
- **Validación:** Campos obligatorios y formato de email
- **Redirección:** Retorna al punto de origen después del registro

---

## 🛒 **MÓDULO DE CLIENTE**

### 4.Tienda Principal

**Función:** Catálogo completo de productos para clientes

- **Búsqueda en tiempo real:** Filtrado por nombre, ID, SKU, marca
- **Filtros por categoría:** Sidebar con categorías disponibles
- **Grid de productos:** Vista de tarjetas con información completa
- **Carrito modal:** Agregar/quitar productos, modificar cantidades
- **Lista de deseos:** Guardar productos favoritos
- **Precios dinámicos:** Según rol de usuario (cliente/distribuidor)

### 5. Detalle de Producto

**Función:** Vista detallada de un producto específico

- **Galería de imágenes:** Múltiples vistas del producto
- **Información completa:** Especificaciones técnicas, descripción
- **Precios y stock:** Información actualizada de disponibilidad
- **Acciones:** Agregar al carrito, lista de deseos, compartir
- **Productos relacionados:** Sugerencias basadas en categoría

### 6. Página de Búsqueda

**Función:** Resultados de búsqueda con filtros avanzados

- **Barra de búsqueda:** Entrada de términos de búsqueda
- **Resultados dinámicos:** Actualización en tiempo real
- **Filtros:** Por precio, categoría, marca, disponibilidad
- **Ordenamiento:** Por relevancia, precio, nombre
- **Paginación:** Navegación por páginas de resultados

### 7. Checkout y Carrito

**Función:** Proceso completo de finalización de compra

- **Resumen del pedido:** Lista de productos seleccionados
- **Información de contacto:** Email y teléfono del cliente
- **Datos de envío:** Dirección completa con validación
- **Método de pago:** Formulario de tarjeta con validación
- **Confirmación:** Procesamiento del pedido y envío por WhatsApp
- **Seguridad:** Validación de tarjetas y datos sensibles

### 8. Información de Ubicación

**Función:** Datos de contacto y ubicación física

- **Dirección:** Información de la empresa
- **Mapa:** Ubicación geográfica
- **Horarios:** Días y horas de atención
- **Contacto:** Teléfonos y canales de comunicación

### 9. Seguimiento de Pedidos

**Función:** Consulta del estado de pedidos realizados

- **Búsqueda por ID:** Localizar pedido específico
- **Estado del pedido:** Progreso en tiempo real
- **Historial:** Lista de pedidos anteriores
- **Detalles:** Información completa del envío

---

## 👨‍💼 **MÓDULO DE ADMINISTRACIÓN**

### 10. Dashboard Principal

**Función:** Panel de control administrativo con métricas

- **Estadísticas:** Total de usuarios, productos, pedidos pendientes
- **Usuarios recientes:** Lista de últimos registros
- **Stock bajo:** Alertas de productos con inventario crítico
- **Navegación:** Acceso a todas las funciones administrativas

### 11. Gestión de Usuarios

**Función:** Administración completa del sistema de usuarios

- **Pestañas:** Trabajadores, Clientes, Distribuidores
- **CRUD completo:** Crear, leer, actualizar, eliminar usuarios
- **Gestión de roles:** Asignación y modificación de permisos
- **Estado de usuarios:** Activar/desactivar cuentas
- **Filtros:** Búsqueda y ordenamiento de usuarios

### 12. Gestión de Productos

**Función:** Administración del catálogo de productos

- **Lista completa:** Todos los productos del sistema
- **Edición:** Modificar información de productos existentes
- **Control de stock:** Actualizar inventario
- **Precios:** Modificar precios públicos y de distribuidor
- **Categorías:** Gestión de categorías de productos

### 13. Gestión de Pedidos

**Función:** Administración de pedidos y ventas

- **Lista de pedidos:** Todos los pedidos realizados
- **Estados:** Cambiar estado de pedidos (pendiente, procesando, enviado, entregado)
- **Detalles:** Información completa de cada pedido
- **Filtros:** Por fecha, estado, cliente
- **Reportes:** Estadísticas de ventas

### 14. Vista de Tienda para Admin

**Función:** Acceso administrativo al catálogo público

- **Vista de cliente:** Experiencia de usuario normal
- **Herramientas admin:** Accesos directos a funciones administrativas
- **Monitoreo:** Supervisión del funcionamiento de la tienda

### 15. Búsqueda Administrativa

**Función:** Búsqueda avanzada con herramientas administrativas

- **Búsqueda global:** Productos, usuarios, pedidos
- **Filtros administrativos:** Acceso a información completa
- **Acciones rápidas:** Editar directamente desde resultados

---

## 🏪 **MÓDULO DE DISTRIBUIDORA**

### 16. Panel de Distribuidora

**Función:** Dashboard específico para distribuidores

- **Catálogo personalizado:** Productos con precios de distribuidor
- **Navegación:** Acceso a funciones de distribuidor
- **Carrito:** Sistema de compras con precios especiales
- **Lista de deseos:** Productos favoritos del distribuidor

### 17. Agregar Producto

**Función:** Formulario para que distribuidores agreguen productos

- **Formulario completo:** Todos los campos necesarios del producto
- **Validación:** Campos obligatorios y formatos correctos
- **Categorización:** Asignación de categorías
- **Precios:** Definición de precios público y distribuidor
- **Stock:** Gestión inicial de inventario

### 18. Tienda de Distribuidor

**Función:** Vista de catálogo con precios especiales

- **Precios de distribuidor:** Tarifas preferenciales
- **Funcionalidades completas:** Carrito, lista de deseos, búsqueda
- **Acceso restringido:** Solo para usuarios con rol distribuidor

### 19. Búsqueda de Distribuidor

**Función:** Búsqueda con precios y funcionalidades de distribuidor

- **Precios especiales:** Mostrar tarifas de distribuidor
- **Filtros avanzados:** Acceso a información completa
- **Acciones rápidas:** Agregar a carrito con precios preferenciales

### 20. Pedidos de Distribuidor

**Función:** Gestión de pedidos realizados por el distribuidor

- **Historial de pedidos:** Lista de compras realizadas
- **Estado de pedidos:** Seguimiento de entregas
- **Detalles:** Información completa de cada pedido
- **Recomprar:** Funcionalidad para repetir pedidos

---

## 🔧 **CARACTERÍSTICAS TÉCNICAS COMUNES**

### Funcionalidades Transversales:

- **Sistema de autenticación:** Login/logout con redirección por rol
- **Carrito persistente:** Almacenamiento en localStorage
- **Lista de deseos:** Favoritos por usuario
- **Búsqueda en tiempo real:** Con debounce y filtros
- **Diseño responsivo:** Adaptable a móviles y tablets
- **Integración WhatsApp:** Envío automático de pedidos
- **Validación de formularios:** Frontend y backend
- **Notificaciones:** Toast messages para feedback
- **Navegación contextual:** Según rol de usuario

### Roles de Usuario:

- **👨‍💼 Administrador:** Control total del sistema
- **🏪 Distribuidora:** Gestión de productos y precios especiales
- **🛒 Cliente:** Compra de productos con precios públicos

---

## 📱 **NAVEGACIÓN Y FLUJO**

### Flujo Principal:

1. **index.html** → Punto de entrada
2. **login.html** → Autenticación
3. **Redirección automática** según rol:
   - Cliente → `src/user/store.html`
   - Distribuidor → `src/distri/index.html`
   - Admin → `src/admin/index.html`

### Flujo de Compra:

1. **store.html** → Explorar productos
2. **product-detail.html** → Ver detalles
3. **cart.html** → Finalizar compra
4. **WhatsApp** → Confirmación del pedido

---

**Desarrollado para H&B Importaciones - Sistema de E-commerce Tecnológico**
