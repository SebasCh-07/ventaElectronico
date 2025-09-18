/**
 * API de almacenamiento en LocalStorage para H&B Importaciones
 * Maneja usuarios, productos, carrito, sesiones y configuraciones
 */
(function(){
  const STORAGE_KEYS = {
    users: 'hb_users',
    session: 'hb_session',
    products: 'hb_products',
    cart: 'hb_cart',
    categories: 'hb_categories',
    orders: 'hb_orders',
    quotes: 'hb_quotes',
    settings: 'hb_settings'
  };

  /**
   * Lee datos JSON del localStorage
   * @param {string} key - Clave del localStorage
   * @param {*} fallback - Valor por defecto si no existe
   * @returns {*} Datos parseados o valor por defecto
   */
  function readJson(key, fallback = null){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(err){
      console.warn('Error leyendo del storage:', key, err);
      return fallback;
    }
  }

  /**
   * Escribe datos JSON al localStorage
   * @param {string} key - Clave del localStorage
   * @param {*} value - Valor a guardar
   */
  function writeJson(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
    }catch(err){
      console.warn('Error escribiendo al storage:', key, err);
    }
  }

  /**
   * Inicializa datos de prueba si no existen
   */
  function ensureSeed(){
    // Cargar datos desde HBDATA si está disponible
    if(window.HBDATA){
      if(!readJson(STORAGE_KEYS.users)){
        writeJson(STORAGE_KEYS.users, HBDATA.users);
      }
      if(!readJson(STORAGE_KEYS.products)){
        writeJson(STORAGE_KEYS.products, HBDATA.products);
      }
      if(!readJson(STORAGE_KEYS.categories)){
        writeJson(STORAGE_KEYS.categories, HBDATA.categories);
      }
    } else {
      // Fallback con datos básicos
    if(!readJson(STORAGE_KEYS.users)){
        writeJson(STORAGE_KEYS.users, [
        { id:'u1', role:'admin', name:'Admin', email:'admin@hb.local', password:'admin123', active:true },
          { id:'d1', role:'distributor', name:'Distribuidora Alfa', email:'distri@hb.local', password:'distri123', active:true, whatsapp:'+573001112233' },
        { id:'c1', role:'client', name:'Cliente Demo', email:'cliente@hb.local', password:'cliente123', active:true }
      ]);
    }
    if(!readJson(STORAGE_KEYS.products)){
        writeJson(STORAGE_KEYS.products, [
          { id:'p1', owner:'d1', name:'Auriculares BT', pricePublico:99000, priceDistribuidor:75000, stock:12, category:'Audio', image:'' },
          { id:'p2', owner:'d1', name:'Power Bank 10k', pricePublico:75000, priceDistribuidor:55000, stock:5, category:'Accesorios', image:'' },
          { id:'p3', owner:'d1', name:'Cable USB-C', pricePublico:25000, priceDistribuidor:18000, stock:0, category:'Accesorios', image:'' }
        ]);
      }
    }
    
    // Inicializar otros datos
    if(!readJson(STORAGE_KEYS.cart)){
      writeJson(STORAGE_KEYS.cart, []);
    }
    if(!readJson(STORAGE_KEYS.orders)){
      writeJson(STORAGE_KEYS.orders, []);
    }
    if(!readJson(STORAGE_KEYS.quotes)){
      writeJson(STORAGE_KEYS.quotes, []);
    }
    if(!readJson(STORAGE_KEYS.settings)){
      writeJson(STORAGE_KEYS.settings, {
        currency: 'COP',
        currencySymbol: '$',
        lowStockThreshold: 5,
        featuredProductsCount: 6
      });
    }
  }

  // === SESIÓN ===
  function getSession(){
    return readJson(STORAGE_KEYS.session, null);
  }
  
  function setSession(session){
    writeJson(STORAGE_KEYS.session, session);
  }
  
  function clearSession(){
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  function updateLastLogin(userId){
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if(user){
      user.lastLogin = new Date().toISOString();
      setUsers(users);
    }
  }

  // === USUARIOS ===
  function getUsers(){ 
    return readJson(STORAGE_KEYS.users, []); 
  }
  
  function setUsers(list){ 
    writeJson(STORAGE_KEYS.users, list); 
  }

  function getUserById(id){
    return getUsers().find(u => u.id === id);
  }

  function updateUser(id, updates){
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if(index !== -1){
      users[index] = { ...users[index], ...updates };
      setUsers(users);
      return users[index];
    }
    return null;
  }

  function addUser(user){
    const users = getUsers();
    const newUser = {
      id: 'u' + Date.now(),
      createdAt: new Date().toISOString(),
      active: true,
      ...user
    };
    users.push(newUser);
    setUsers(users);
    return newUser;
  }

  // === PRODUCTOS ===
  function getProducts(){ 
    return readJson(STORAGE_KEYS.products, []); 
  }
  
  function setProducts(list){ 
    writeJson(STORAGE_KEYS.products, list); 
  }

  function getProductById(id){
    return getProducts().find(p => p.id === id);
  }

  function getProductsByOwner(ownerId){
    return getProducts().filter(p => p.owner === ownerId);
  }

  function getFeaturedProducts(){
    return getProducts().filter(p => p.featured === true);
  }

  function getLowStockProducts(threshold = 5){
    return getProducts().filter(p => p.stock <= threshold && p.stock > 0);
  }

  function getOutOfStockProducts(){
    return getProducts().filter(p => p.stock <= 0);
  }

  function getProductsByCategory(category){
    return getProducts().filter(p => p.category === category);
  }

  function searchProducts(query){
    const products = getProducts();
    const searchTerm = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm))
    );
  }

  function addProduct(product){
    const products = getProducts();
    const newProduct = {
      id: 'p' + Date.now(),
      createdAt: new Date().toISOString(),
      sales: 0,
      featured: false,
      ...product
    };
    products.push(newProduct);
    setProducts(products);
    return newProduct;
  }

  function updateProduct(id, updates){
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if(index !== -1){
      products[index] = { ...products[index], ...updates };
      setProducts(products);
      return products[index];
    }
    return null;
  }

  function deleteProduct(id){
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    return filtered.length < products.length;
  }

  function updateProductStock(id, newStock){
    return updateProduct(id, { stock: newStock });
  }

  function incrementProductSales(id, quantity = 1){
    const product = getProductById(id);
    if(product){
      const newSales = (product.sales || 0) + quantity;
      return updateProduct(id, { sales: newSales });
    }
    return null;
  }

  // === CATEGORÍAS ===
  function getCategories(){ 
    return readJson(STORAGE_KEYS.categories, []); 
  }
  
  function setCategories(list){ 
    writeJson(STORAGE_KEYS.categories, list); 
  }

  function getCategoryById(id){
    return getCategories().find(c => c.id === id);
  }

  // === CARRITO ===
  function getCart(){ 
    return readJson(STORAGE_KEYS.cart, []); 
  }
  
  function setCart(list){ 
    writeJson(STORAGE_KEYS.cart, list); 
  }

  function addToCart(productId, quantity = 1){
    const cart = getCart();
    const existing = cart.find(item => item.productId === productId);
    
    if(existing){
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    setCart(cart);
    return cart;
  }

  function removeFromCart(productId){
    const cart = getCart();
    const filtered = cart.filter(item => item.productId !== productId);
    setCart(filtered);
    return filtered;
  }

  function updateCartQuantity(productId, quantity){
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if(item){
      if(quantity <= 0){
        return removeFromCart(productId);
      } else {
        item.quantity = quantity;
        setCart(cart);
        return cart;
      }
    }
    
    return cart;
  }

  function clearCart(){
    setCart([]);
  }

  function getCartTotal(){
    const cart = getCart();
    const products = getProducts();
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if(product){
        const session = getSession();
        const price = session && session.role === 'distributor' ? 
          product.priceDistribuidor : product.pricePublico;
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
  }

  function getCartItemCount(){
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  // === PEDIDOS ===
  function getOrders(){ 
    return readJson(STORAGE_KEYS.orders, []); 
  }
  
  function setOrders(list){ 
    writeJson(STORAGE_KEYS.orders, list); 
  }

  function addOrder(order){
    const orders = getOrders();
    const newOrder = {
      id: 'ord' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...order
    };
    orders.push(newOrder);
    setOrders(orders);
    return newOrder;
  }

  function updateOrderStatus(orderId, status){
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if(index !== -1){
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      setOrders(orders);
      return orders[index];
    }
    return null;
  }

  // === COTIZACIONES ===
  function getQuotes(){ 
    return readJson(STORAGE_KEYS.quotes, []); 
  }
  
  function setQuotes(list){ 
    writeJson(STORAGE_KEYS.quotes, list); 
  }

  function addQuote(quote){
    const quotes = getQuotes();
    const newQuote = {
      id: 'quo' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...quote
    };
    quotes.push(newQuote);
    setQuotes(quotes);
    return newQuote;
  }

  // === CONFIGURACIONES ===
  function getSettings(){ 
    return readJson(STORAGE_KEYS.settings, {}); 
  }
  
  function setSettings(settings){ 
    writeJson(STORAGE_KEYS.settings, settings); 
  }

  function updateSetting(key, value){
    const settings = getSettings();
    settings[key] = value;
    setSettings(settings);
  }

  // === ESTADÍSTICAS ===
  function getStats(){
    const users = getUsers();
    const products = getProducts();
    const orders = getOrders();
    const cart = getCart();
    
    return {
      totalUsers: users.filter(u => u.active !== false).length,
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      lowStockProducts: getLowStockProducts().length,
      outOfStockProducts: getOutOfStockProducts().length,
      cartItems: getCartItemCount(),
      cartTotal: getCartTotal()
    };
  }

  // === UTILIDADES ===
  function clearAllData(){
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    ensureSeed();
  }

  function exportData(){
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = readJson(storageKey, []);
    });
    return data;
  }

  function importData(data){
    Object.entries(data).forEach(([key, value]) => {
      if(STORAGE_KEYS[key]){
        writeJson(STORAGE_KEYS[key], value);
      }
    });
  }

  // Inicializar datos
  ensureSeed();

  // API pública
  window.StorageAPI = {
    // Claves de almacenamiento
    STORAGE_KEYS,
    
    // Utilidades básicas
    readJson, writeJson,
    
    // Sesión
    getSession, setSession, clearSession, updateLastLogin,
    
    // Usuarios
    getUsers, setUsers, getUserById, updateUser, addUser,
    
    // Productos
    getProducts, setProducts, getProductById, getProductsByOwner,
    getFeaturedProducts, getLowStockProducts, getOutOfStockProducts,
    getProductsByCategory, searchProducts, addProduct, updateProduct,
    deleteProduct, updateProductStock, incrementProductSales,
    
    // Categorías
    getCategories, setCategories, getCategoryById,
    
    // Carrito
    getCart, setCart, addToCart, removeFromCart, updateCartQuantity,
    clearCart, getCartTotal, getCartItemCount,
    
    // Pedidos
    getOrders, setOrders, addOrder, updateOrderStatus,
    
    // Cotizaciones
    getQuotes, setQuotes, addQuote,
    
    // Configuraciones
    getSettings, setSettings, updateSetting,
    
    // Estadísticas
    getStats,
    
    // Utilidades
    clearAllData, exportData, importData
  };
})();


