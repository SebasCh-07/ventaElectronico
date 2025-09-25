# H&B Importaciones - E-commerce de Tecnología

## 📋 Descripción del Proyecto

**H&B Importaciones** es una aplicación web de e-commerce especializada en tecnología e importaciones. Es un sistema completo con múltiples roles de usuario, carrito de compras, gestión de productos y paneles administrativos.

## 🏗️ Arquitectura del Sistema

### Roles de Usuario

- **👨‍💼 Administrador** - Control total del sistema
- **🏪 Distribuidora** - Gestiona sus productos
- **🛒 Cliente** - Compra productos

### Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript vanilla (ES6+)
- **Almacenamiento**: LocalStorage (datos persistentes)
- **Diseño**: CSS Grid, Flexbox, diseño responsivo
- **Fuentes**: Google Fonts (Inter)
- **Iconos**: Sistema SVG personalizado
- **Arquitectura**: Modular con IIFE (Immediately Invoked Function Expression)
- **Compatibilidad**: ES5+ para máxima compatibilidad

## 🚀 Funcionalidades Principales

### 🏠 Página Principal

- **Slider hero** con 4 slides promocionales (Desktop, CPU, RTX, Periféricos)
- **Showcase de productos** destacados con ofertas especiales
- **Grid de productos** con categorías (Laptops, Trabajo/Estudio, Línea corporativa, Gaming)
- **Diseño moderno** con efectos visuales y animaciones
- **Navegación completa** a todas las secciones
- **Búsqueda global** en tiempo real
- **Carrito flotante** con modal interactivo

### 🛒 Sistema de Carrito de Compras

- **Agregar/eliminar productos** con validación de stock
- **Modificar cantidades** con controles intuitivos
- **Cálculo automático de totales** en tiempo real
- **Precios diferenciados** por rol (público/distribuidor)
- **Integración con WhatsApp** para confirmar pedidos
- **Persistencia en LocalStorage** entre sesiones
- **Modal responsivo** con diseño moderno

### 💬 Integración WhatsApp

- **Mensajes automáticos** con detalles completos del pedido
- **Formato estructurado** con emojis y separadores
- **Información del cliente** incluida automáticamente
- **Productos detallados** con precios y cantidades
- **Total calculado** y fecha del pedido
- **Número de WhatsApp** configurable por distribuidor
- **Envío directo** desde la aplicación

### 👤 Sistema de Autenticación

- **Login** con validación de credenciales
- **Registro** de nuevos usuarios con validación
- **Sesiones persistentes** con LocalStorage
- **Redirección automática** según rol de usuario
- **Protección de rutas** por rol
- **Cierre de sesión** seguro

### 📊 Panel de Administración

- **Dashboard** con estadísticas en tiempo real
- **Gestión completa de usuarios** (ver, editar, activar/desactivar)
- **Monitoreo de productos** con alertas de stock bajo
- **Gestión de pedidos** con estados y filtros
- **Métricas del sistema** (usuarios, productos, pedidos)
- **Interfaz moderna** con cards y gráficos

### 🏪 Panel de Distribuidora

- **Gestión de productos** propios con CRUD completo
- **Agregar nuevos productos** con formulario validado
- **Editar información** de productos existentes
- **Control de inventario** con alertas de stock
- **Gestión de pedidos** recibidos
- **Precios diferenciados** (público vs distribuidor)

### 🛍️ Sistema de Pedidos

- **Proceso de checkout** completo con formularios
- **Gestión de direcciones** de envío
- **Métodos de pago** múltiples (tarjeta, transferencia)
- **Estados de pedidos** (pendiente, en proceso, enviado, completado, cancelado)
- **Seguimiento de pedidos** para clientes
- **Notificaciones** de cambios de estado

### 🔍 Sistema de Búsqueda

- **Búsqueda en tiempo real** con debounce
- **Filtros por categoría** dinámicos
- **Resultados paginados** para mejor rendimiento
- **Navegación contextual** según rol
- **Búsqueda global** desde cualquier página
- **Autocompletado** de términos

## 📁 Estructura de Archivos

```
ventaElectronico/
├── css/
│   └── style.css              # Estilos principales (5,800+ líneas)
├── image/                     # Recursos gráficos
│   ├── carrito.png           # Icono carrito
│   ├── corazon.png           # Icono favoritos
│   ├── cpu.png               # Imagen CPU
│   ├── pc.png                # Imagen PC
│   ├── perifericos.png       # Imagen periféricos
│   ├── rtx.png               # Imagen RTX
│   └── img/                  # Imágenes de productos
├── js/
│   ├── auth.js               # Autenticación principal
│   ├── auth-simple.js        # Autenticación simplificada
│   ├── cart.js               # Carrito de compras
│   ├── catalog.js            # Catálogo de productos
│   ├── register.js           # Registro de usuarios
│   ├── search.js             # Búsqueda global
│   ├── admin/
│   │   ├── dashboard.js      # Panel admin dashboard
│   │   ├── orders.js         # Gestión de pedidos
│   │   ├── products.js       # Gestión productos admin
│   │   └── users.js          # Gestión usuarios
│   ├── distri/
│   │   ├── add-product.js    # Agregar productos
│   │   ├── catalog.js        # Catálogo distribuidor
│   │   ├── orders.js         # Pedidos distribuidor
│   │   ├── products.js       # Gestión productos
│   │   └── search.js         # Búsqueda distribuidor
│   └── utils/
│       ├── storage.js        # API de almacenamiento (LocalStorage)
│       ├── data.js           # Datos demo y configuración
│       ├── icons.js          # Sistema de iconos SVG
│       ├── ui.js             # Utilidades UI
│       ├── helpers.js        # Funciones auxiliares
│       ├── animations.js     # Animaciones y efectos
│       └── sticky-header.js  # Header fijo
├── src/
│   ├── admin/                # Páginas administración
│   │   ├── index.html        # Dashboard admin
│   │   ├── orders.html       # Gestión pedidos
│   │   ├── products.html     # Gestión productos
│   │   ├── search.html       # Búsqueda admin
│   │   ├── store.html        # Vista tienda admin
│   │   └── users.html        # Gestión usuarios
│   ├── auth/                 # Autenticación
│   │   ├── header.html       # Header auth
│   │   ├── login.html        # Login
│   │   └── register.html     # Registro
│   ├── distri/               # Panel distribuidor
│   │   ├── index.html        # Dashboard distribuidor
│   │   ├── add-product.html  # Agregar producto
│   │   ├── orders.html       # Pedidos distribuidor
│   │   ├── product-detail.html # Detalle producto
│   │   ├── search.html       # Búsqueda distribuidor
│   │   ├── store.html        # Tienda distribuidor
│   │   └── js/               # Scripts específicos
│   └── user/                 # Páginas cliente
│       ├── index.html        # Dashboard cliente
│       ├── cart.html         # Carrito y checkout
│       ├── location.html     # Ubicación
│       ├── product-detail.html # Detalle producto
│       ├── search.html       # Búsqueda cliente
│       ├── store.html        # Tienda cliente
│       └── track-order.html  # Seguimiento pedidos
├── index.html                # Página principal
├── test-login.html           # Página de prueba login
├── test-register.html        # Página de prueba registro
├── img.md                    # Documentación imágenes
└── README.md                 # Este archivo
```

## 🎨 Características de Diseño

### Estilo Visual

- **Paleta de colores** profesional (azules, grises)
- **Tipografía** moderna (Inter)
- **Cards** con sombras sutiles
- **Botones** con gradientes
- **Iconos** integrados

### Diseño Responsivo

- **Mobile-first** approach
- **Grid adaptativo** para productos
- **Navegación colapsable** en móviles
- **Slider responsivo** con controles táctiles

## 🔧 Funcionalidades Técnicas

### 💾 Gestión de Datos

- **API de almacenamiento** centralizada (StorageAPI)
- **LocalStorage** para persistencia de datos
- **Datos de prueba** pre-cargados (20+ productos, 3 usuarios demo)
- **Validación** de formularios en tiempo real
- **Manejo de errores** robusto con try-catch
- **Sincronización** de datos entre componentes

### 🔄 Estado de la Aplicación

- **Sesiones persistentes** con validación automática
- **Carrito sincronizado** entre todas las páginas
- **Actualizaciones en tiempo real** de contadores y totales
- **Navegación contextual** según rol de usuario
- **Cache inteligente** para mejorar rendimiento
- **Estado global** compartido entre módulos

### 🎨 Sistema de UI

- **Sistema de iconos** SVG integrado (icons.js)
- **Animaciones** suaves y transiciones (animations.js)
- **Componentes reutilizables** (cards, modals, forms)
- **Responsive design** con CSS Grid y Flexbox
- **Tema consistente** con variables CSS
- **Loading states** y feedback visual

### 🔒 Seguridad y Validación

- **Autenticación** basada en roles
- **Validación de sesiones** en cada página
- **Protección de rutas** por rol
- **Sanitización** de datos de entrada
- **Validación** de formularios del lado cliente
- **Manejo seguro** de datos sensibles

### 📱 Optimizaciones

- **Lazy loading** de imágenes
- **Debounce** en búsquedas
- **Paginación** de resultados
- **Compresión** de datos en LocalStorage
- **Cache** de búsquedas frecuentes
- **Optimización** de renders DOM

## 👥 Usuarios Demo Pre-configurados

| Rol                     | Email            | Password   |
| ----------------------- | ---------------- | ---------- |
| **Administrador** | admin@hb.local   | admin123   |
| **Distribuidora** | alfa@hb.local    | alfa123    |
| **Cliente**       | cliente@hb.local | cliente123 |

## 🎯 Casos de Uso Principales

### 👤 Cliente Final
1. **Navegación**: Explora la tienda, ve productos destacados y categorías
2. **Búsqueda**: Utiliza el buscador global para encontrar productos específicos
3. **Compra**: Agrega productos al carrito, modifica cantidades y procede al checkout
4. **Pago**: Completa formulario de envío y selecciona método de pago
5. **Confirmación**: Recibe confirmación y envía pedido automáticamente por WhatsApp
6. **Seguimiento**: Rastrea el estado de sus pedidos desde su panel personal

### 🏪 Distribuidor
1. **Gestión de Productos**: Agrega, edita y gestiona su catálogo de productos
2. **Control de Inventario**: Monitorea stock y recibe alertas de productos con stock bajo
3. **Gestión de Pedidos**: Recibe y gestiona pedidos de clientes
4. **Precios**: Configura precios diferenciados (público vs distribuidor)
5. **Estadísticas**: Ve métricas de sus productos y ventas

### 👨‍💼 Administrador
1. **Supervisión General**: Monitorea todo el sistema desde el dashboard
2. **Gestión de Usuarios**: Crea, edita y gestiona cuentas de usuarios
3. **Gestión de Productos**: Supervisa todos los productos del sistema
4. **Gestión de Pedidos**: Ve todos los pedidos y puede cambiar estados
5. **Estadísticas**: Accede a métricas globales del sistema
6. **Configuración**: Gestiona configuraciones generales del sistema

## 💡 Características Destacadas

- ✅ **Integración WhatsApp** para pedidos automáticos
- ✅ **Sistema de roles** completo (Admin, Distribuidor, Cliente)
- ✅ **Interfaz moderna** y profesional con animaciones
- ✅ **Código modular** y mantenible con arquitectura limpia
- ✅ **Almacenamiento local** sin necesidad de base de datos
- ✅ **Diseño responsive** completo (mobile-first)
- ✅ **Sistema de seguimiento** de pedidos en tiempo real
- ✅ **Precios diferenciados** por rol de usuario
- ✅ **Gestión completa** de inventario con alertas
- ✅ **Búsqueda avanzada** con filtros y debounce
- ✅ **Carrito persistente** entre sesiones
- ✅ **Validación robusta** de formularios

## 🚀 Instalación y Uso

1. **Clonar o descargar** el proyecto
2. **Abrir** `index.html` en un navegador web
3. **Usar las credenciales demo** para probar diferentes roles
4. **Explorar** todas las funcionalidades disponibles

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile
- **Resoluciones**: 320px - 1920px+

## 📦 Sistema de Seguimiento de Pedidos

### Estados de Pedidos
- **🟡 Pendiente**: Pedido recibido, esperando confirmación
- **🔵 En Proceso**: Pedido confirmado, preparándose para envío
- **🟣 Enviado**: Pedido despachado con número de seguimiento
- **🟢 Completado**: Pedido entregado exitosamente
- **🔴 Cancelado**: Pedido cancelado por el cliente o sistema

### Funcionalidades de Seguimiento
- **Actualización automática** del estado del pedido
- **Notificaciones** cuando cambia el estado
- **Historial completo** de movimientos del pedido
- **Integración WhatsApp** para notificaciones
- **Panel de seguimiento** para clientes
- **Gestión centralizada** para administradores

## 🔮 Próximas Mejoras

- [ ] **Base de datos real** (MySQL/PostgreSQL) para producción
- [ ] **Sistema de pagos integrado** (Stripe, PayPal)
- [ ] **Notificaciones push** en tiempo real
- [ ] **Panel de reportes avanzado** con gráficos
- [ ] **API REST** para aplicaciones móviles
- [ ] **Sistema de reviews y ratings** de productos
- [ ] **Chat en vivo** para soporte al cliente
- [ ] **Sistema de cupones** y descuentos
- [ ] **Integración con servicios de envío**
- [ ] **Analytics avanzado** de comportamiento de usuarios

---

**Desarrollado con ❤️ para H&B Importaciones**
