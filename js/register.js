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
      alert('Este correo ya está registrado');
      return;
    }
    const id = 'u' + Math.random().toString(36).slice(2,9);
    const newUser = { id, role, name, email, password, active:true };
    if(role==='distributor') newUser.whatsapp = whatsapp || '';
    users.push(newUser);
    StorageAPI.setUsers(users);
    StorageAPI.setSession({ id, role, name });
    alert('Cuenta creada con éxito');
    // Redirigir según el rol
    switch(role) {
      case 'admin':
        window.location.href = '../admin/index.html';
        break;
      case 'distributor':
        window.location.href = '../distri/index.html';
        break;
      case 'client':
        window.location.href = '../user/index.html';
        break;
      default:
        window.location.href = '../../index.html';
    }
  });
})();


