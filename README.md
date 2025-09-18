# H&B Importaciones - E-commerce de Tecnología

## 📋 Descripción del Proyecto

**H&B Importaciones** es una aplicación web de e-commerce especializada en tecnología e importaciones. Es un sistema completo con múltiples roles de usuario, carrito de compras, gestión de productos y paneles administrativos.

## 🏗️ Arquitectura del Sistema

### Roles de Usuario

- **👨‍💼 Administrador** - Control total del sistema
- **🏪 Distribuidora** - Gestiona sus productos
- **🛒 Cliente** - Compra productos

### Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Almacenamiento**: LocalStorage (datos persistentes)
- **Diseño**: CSS Grid, Flexbox, diseño responsivo
- **Fuentes**: Google Fonts (Inter)

## 🚀 Funcionalidades Principales

### 🏠 Página Principal

- **Slider hero** con 4 slides promocionales
- **Showcase de productos** destacados
- **Grid de productos** con categorías
- **Diseño moderno** con efectos visuales
- **Navegación completa** a todas las secciones

### 🛒 Sistema de Carrito de Compras

- Agregar/eliminar productos
- Modificar cantidades
- Cálculo automático de totales
- **Integración con WhatsApp** para confirmar pedidos
- Persistencia en LocalStorage

### 👤 Sistema de Autenticación

- **Login** con validación de credenciales
- **Registro** de nuevos usuarios
- **Sesiones persistentes**
- **Redirección automática** según rol de usuario

### 📊 Panel de Administración

- **Dashboard** con estadísticas en tiempo real
- **Gestión de usuarios** (ver, editar, activar/desactivar)
- **Monitoreo de productos** con stock bajo
- **Métricas del sistema**

### 🏪 Panel de Distribuidora

- **Gestión de productos** propios
- **Agregar nuevos productos**
- **Editar información** de productos existentes
- **Control de inventario**

### 🔍 Sistema de Búsqueda

- **Búsqueda en tiempo real** con debounce
- **Filtros por categoría**
- **Resultados dinámicos**
- **Navegación contextual**

## 📁 Estructura de Archivos

```
H-B-Importaciones/
├── css/
│   └── style.css          # Estilos principales
├── js/
│   ├── auth.js           # Autenticación
│   ├── cart.js           # Carrito de compras
│   ├── catalog.js        # Catálogo de productos
│   ├── admin/
│   │   ├── dashboard.js  # Panel admin
│   │   └── users.js      # Gestión usuarios
│   ├── distri/
│   │   ├── add-product.js # Agregar productos
│   │   └── products.js   # Gestión productos
│   └── utils/
│       ├── storage.js    # API de almacenamiento
│       ├── icons.js      # Sistema de iconos
│       ├── ui.js         # Utilidades UI
│       └── sticky-header.js # Header fijo
└── src/
    ├── admin/            # Páginas admin
    ├── auth/             # Login/registro
    ├── distri/           # Panel distribuidora
    └── user/             # Páginas cliente
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

### Gestión de Datos

- **API de almacenamiento** centralizada
- **Datos de prueba** pre-cargados
- **Validación** de formularios
- **Manejo de errores** robusto

### Estado de la Aplicación

- **Sesiones persistentes**
- **Carrito sincronizado** entre páginas
- **Actualizaciones en tiempo real**
- **Navegación contextual**

## 👥 Usuarios Demo Pre-configurados

| Rol                     | Email            | Password   |
| ----------------------- | ---------------- | ---------- |
| **Administrador** | admin@hb.local   | admin123   |
| **Distribuidora** | alfa@hb.local    | alfa123    |
| **Cliente**       | cliente@hb.local | cliente123 |

## 🎯 Casos de Uso Principales

1. **Cliente** navega, busca productos, agrega al carrito y confirma pedido vía WhatsApp
2. **Distribuidora** gestiona su catálogo de productos y controla inventario
3. **Administrador** supervisa todo el sistema, usuarios y métricas

## 💡 Características Destacadas

- ✅ **Integración WhatsApp** para pedidos
- ✅ **Sistema de roles** completo
- ✅ **Interfaz moderna** y profesional
- ✅ **Código modular** y mantenible
- ✅ **Almacenamiento local** sin base de datos
- ✅ **Diseño responsive** completo

## 🚀 Instalación y Uso

1. **Clonar o descargar** el proyecto
2. **Abrir** `index.html` en un navegador web
3. **Usar las credenciales demo** para probar diferentes roles
4. **Explorar** todas las funcionalidades disponibles

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile
- **Resoluciones**: 320px - 1920px+

## 🔮 Próximas Mejoras

- [ ] Base de datos real (MySQL/PostgreSQL)
- [ ] Sistema de pagos integrado
- [ ] Notificaciones push
- [ ] Panel de reportes avanzado
- [ ] API REST para móviles
- [ ] Sistema de reviews y ratings

---

**Desarrollado con ❤️ para H&B Importaciones**
