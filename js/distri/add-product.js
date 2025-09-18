(function(){
  function addProduct(){
    const form = document.getElementById('product-form');
    const formData = new FormData(form);
    
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const stock = parseInt(formData.get('stock'));
    const category = formData.get('category');
    const description = formData.get('description');
    
    if(!name || !price || !stock){
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    if(price <= 0 || stock < 0){
      alert('El precio debe ser mayor a 0 y el stock no puede ser negativo');
      return;
    }
    
    const products = StorageAPI.getProducts();
    const id = 'p' + Math.random().toString(36).slice(2,9);
    const newProduct = {
      id,
      name,
      price,
      stock,
      category: category || 'General',
      description: description || '',
      distributor: StorageAPI.getSession().id
    };
    
    products.push(newProduct);
    StorageAPI.setProducts(products);
    
    alert('Producto agregado exitosamente');
    form.reset();
  }

  function updateWelcomeMessage(){
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('distri-welcome');
    if(welcomeEl && session){
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    updateWelcomeMessage();
    
    document.getElementById('product-form').addEventListener('submit', (e)=>{
      e.preventDefault();
      addProduct();
    });
  });
})();
