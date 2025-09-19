(function(){
  const form = document.getElementById('register-form');
  const roleSel = document.getElementById('role');
  const whatsappField = document.getElementById('whatsapp-field');
  const whatsappInput = document.getElementById('whatsapp');
  if(!form) return;

  roleSel.addEventListener('change', ()=>{
    const isDistributor = roleSel.value==='distributor';
    whatsappField.style.display = isDistributor ? '' : 'none';
    whatsappInput.required = isDistributor;
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const role = roleSel.value;
    const whatsapp = whatsappInput.value.trim();

    const users = StorageAPI.getUsers();
    if(users.some(u=>u.email.toLowerCase()===email)){
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('Este correo ya está registrado', 'warning');
      }
      return;
    }
    const id = 'u' + Math.random().toString(36).slice(2,9);
    const newUser = { id, role, name, email, password, active:true };
    if(role==='distributor') newUser.whatsapp = whatsapp || '';
    users.push(newUser);
    StorageAPI.setUsers(users);
    StorageAPI.setSession({ id, role, name });
    if (window.Helpers && window.Helpers.showToast) {
      window.Helpers.showToast('Cuenta creada con éxito', 'success', 2000);
    }
    // Redirigir según el rol y parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    
    let redirectUrl = '../../index.html';
    
    // Usar redirección por rol por defecto
    switch(role) {
      case 'admin':
        redirectUrl = '../admin/index.html';
        break;
      case 'distributor':
        redirectUrl = '../distri/index.html';
        break;
      case 'client':
        // Los clientes siempre van a store.html
        redirectUrl = '../user/store.html';
        break;
    }
    
    window.location.href = redirectUrl;
  });
})();


