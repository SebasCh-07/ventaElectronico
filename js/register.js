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

  // Validación en tiempo real
  function validateField(fieldId, validator, errorMessage) {
    const field = document.getElementById(fieldId);
    const fieldContainer = field.closest('.field');
    
    field.addEventListener('blur', () => {
      const isValid = validator(field.value);
      if (isValid) {
        fieldContainer.classList.remove('error');
        fieldContainer.classList.add('success');
      } else {
        fieldContainer.classList.remove('success');
        fieldContainer.classList.add('error');
      }
    });
  }

  // Validadores
  function validateName(value) {
    return value.trim().length >= 2;
  }

  function validateEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function validatePhone(value) {
    const phoneRegex = /^\+593\s?\d{2}\s?\d{3}\s?\d{4}$/;
    return phoneRegex.test(value);
  }

  function validatePassword(value) {
    return value.length >= 8;
  }

  function validateWhatsApp(value) {
    const whatsappRegex = /^\+593\s?\d{2}\s?\d{3}\s?\d{4}$/;
    return whatsappRegex.test(value);
  }

  // Aplicar validaciones
  validateField('firstName', validateName, 'El nombre debe tener al menos 2 caracteres');
  validateField('lastName', validateName, 'El apellido debe tener al menos 2 caracteres');
  validateField('email', validateEmail, 'Ingresa un correo electrónico válido');
  validateField('phone', validatePhone, 'Ingresa un teléfono válido (+593 99 999 9999)');
  validateField('password', validatePassword, 'La contraseña debe tener al menos 8 caracteres');
  validateField('whatsapp', validateWhatsApp, 'Ingresa un WhatsApp válido (+593 99 999 9999)');

  // Validación de confirmación de contraseña
  const confirmPasswordField = document.getElementById('confirmPassword');
  const passwordField = document.getElementById('password');
  
  function validatePasswordMatch() {
    const confirmContainer = confirmPasswordField.closest('.field');
    const passwordsMatch = passwordField.value === confirmPasswordField.value && confirmPasswordField.value.length > 0;
    
    if (passwordsMatch) {
      confirmContainer.classList.remove('error');
      confirmContainer.classList.add('success');
    } else {
      confirmContainer.classList.remove('success');
      confirmContainer.classList.add('error');
    }
  }

  confirmPasswordField.addEventListener('input', validatePasswordMatch);
  passwordField.addEventListener('input', validatePasswordMatch);

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    
    // Obtener todos los campos del formulario
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = roleSel.value;
    const whatsapp = whatsappInput.value.trim();
    const terms = document.getElementById('terms').checked;
    const newsletter = document.getElementById('newsletter').checked;

    // Validaciones
    if (!firstName || !lastName) {
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('Por favor completa todos los campos obligatorios', 'warning');
      }
      return;
    }

    if (password.length < 8) {
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('Las contraseñas no coinciden', 'warning');
      }
      return;
    }

    if (!terms) {
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('Debes aceptar los términos y condiciones', 'warning');
      }
      return;
    }

    if (role === 'distributor' && !whatsapp) {
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('El WhatsApp es obligatorio para distribuidoras', 'warning');
      }
      return;
    }

    const users = StorageAPI.getUsers();
    if(users.some(u=>u.email.toLowerCase()===email)){
      if (window.Helpers && window.Helpers.showToast) {
        window.Helpers.showToast('Este correo ya está registrado', 'warning');
      }
      return;
    }

    const id = 'u' + Math.random().toString(36).slice(2,9);
    const fullName = `${firstName} ${lastName}`;
    const newUser = { 
      id, 
      role, 
      name: fullName,
      firstName,
      lastName,
      email, 
      phone,
      password, 
      active: true,
      newsletter,
      createdAt: new Date().toISOString()
    };
    
    if(role==='distributor') {
      newUser.whatsapp = whatsapp || '';
    }
    
    users.push(newUser);
    StorageAPI.setUsers(users);
    StorageAPI.setSession({ id, role, name: fullName });
    
    if (window.Helpers && window.Helpers.showToast) {
      window.Helpers.showToast('¡Cuenta creada con éxito! Bienvenido a H&B Importaciones', 'success', 3000);
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
    
    // Si hay un parámetro de redirección, usarlo
    if (redirectParam) {
      switch(redirectParam) {
        case 'store':
          redirectUrl = '../user/store.html';
          break;
        case 'admin':
          redirectUrl = '../admin/index.html';
          break;
        case 'distri':
          redirectUrl = '../distri/index.html';
          break;
      }
    }
    
    // Redirigir después de un breve delay para mostrar el toast
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);
  });
})();


