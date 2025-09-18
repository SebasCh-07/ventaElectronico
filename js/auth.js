/**
 * Sistema de autenticación para H&B Importaciones
 * Maneja login, registro y redirección según roles
 */
(function(){
  'use strict';

  const form = document.getElementById('login-form');
  if(!form) return;

  /**
   * Valida las credenciales del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Object|null} Usuario encontrado o null
   */
  function validateCredentials(email, password) {
    const users = StorageAPI.getUsers();
    return users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password && 
      u.active !== false
    );
  }

  /**
   * Redirige al usuario según su rol
   * @param {Object} user - Usuario autenticado
   */
  function redirectByRole(user) {
    const currentPath = window.location.pathname;
    let redirectUrl = '../../index.html'; // Default

    switch(user.role) {
      case 'admin':
        redirectUrl = '../admin/index.html';
        break;
      case 'distributor':
        redirectUrl = '../distri/index.html';
        break;
      case 'client':
        redirectUrl = '../user/index.html';
        break;
    }

    // Ajustar ruta según ubicación actual
    if (currentPath.includes('/auth/')) {
      // Ya estamos en auth, usar ruta relativa
    } else if (currentPath.includes('/admin/') || 
               currentPath.includes('/distri/') || 
               currentPath.includes('/user/')) {
      // Estamos en una subcarpeta, ajustar ruta
      redirectUrl = redirectUrl.replace('../', '../../');
    }

    // Mostrar mensaje de bienvenida
    if (window.UI && window.UI.showToast) {
      window.UI.showToast(`¡Bienvenido, ${user.name}!`, 'success', 2000);
    }

    // Redirigir después de un breve delay
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  }

  /**
   * Maneja el proceso de login
   * @param {Event} e - Evento del formulario
   */
  function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    // Validaciones básicas
    if (!email || !password) {
      if (window.UI && window.UI.showToast) {
        window.UI.showToast('Por favor completa todos los campos', 'warning');
      } else {
        alert('Por favor completa todos los campos');
      }
      return;
    }

    if (!window.Helpers || !window.Helpers.isValidEmail(email)) {
      if (window.UI && window.UI.showToast) {
        window.UI.showToast('Por favor ingresa un email válido', 'warning');
      } else {
        alert('Por favor ingresa un email válido');
      }
      return;
    }

    // Mostrar spinner de carga
    if (window.UI && window.UI.toggleSpinner) {
      window.UI.toggleSpinner(true, 'Iniciando sesión...');
    }

    // Simular delay de autenticación
    setTimeout(() => {
      const user = validateCredentials(email, password);
      
      if (window.UI && window.UI.toggleSpinner) {
        window.UI.toggleSpinner(false);
      }

      if (!user) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Credenciales inválidas o usuario inactivo', 'error');
        } else {
          alert('Credenciales inválidas o usuario inactivo');
        }
        return;
      }

      // Actualizar último login
      StorageAPI.updateLastLogin(user.id);

      // Crear sesión
      const session = { 
        id: user.id, 
        role: user.role, 
        name: user.name,
        email: user.email,
        loginTime: new Date().toISOString()
      };
      StorageAPI.setSession(session);

      // Redirigir según rol
      redirectByRole(user);
    }, 800);
  }

  /**
   * Configura el formulario de login
   */
  function setupLoginForm() {
    form.addEventListener('submit', handleLogin);

    // Validación en tiempo real
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && window.Helpers && !window.Helpers.isValidEmail(email)) {
          emailInput.style.borderColor = '#ef4444';
          if (window.UI && window.UI.showToast) {
            window.UI.showToast('Formato de email inválido', 'warning', 2000);
          }
        } else {
          emailInput.style.borderColor = '';
        }
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('blur', () => {
        const password = passwordInput.value;
        if (password && window.Helpers && !window.Helpers.isValidPassword(password)) {
          passwordInput.style.borderColor = '#ef4444';
          if (window.UI && window.UI.showToast) {
            window.UI.showToast('La contraseña debe tener al menos 6 caracteres', 'warning', 2000);
          }
        } else {
          passwordInput.style.borderColor = '';
        }
      });
    }
  }

  /**
   * Configura los botones de autocompletado
   */
  function setupDemoButtons() {
    const demoUsers = {
      admin: { email: 'admin@hb.local', password: 'admin123', name: 'Administrador' },
      distributor: { email: 'distri@hb.local', password: 'distri123', name: 'Distribuidora' },
      client: { email: 'cliente@hb.local', password: 'cliente123', name: 'Cliente' }
    };

    document.querySelectorAll('[data-fill-user]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
      const key = btn.getAttribute('data-fill-user');
        const user = demoUsers[key];
        
        if (!user) return;

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) emailInput.value = user.email;
        if (passwordInput) passwordInput.value = user.password;

        // Mostrar información del usuario demo
        if (window.UI && window.UI.showToast) {
          window.UI.showToast(`Datos de ${user.name} cargados`, 'info', 1500);
        }

        // Enfocar en el botón de login
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.focus();
      });
    });
  }

  /**
   * Verifica si hay una sesión activa y redirige
   */
  function checkExistingSession() {
    const session = StorageAPI.getSession();
    if (session) {
      // Hay una sesión activa, redirigir según rol
      redirectByRole(session);
    }
  }

  /**
   * Configura el formulario de registro si existe
   */
  function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(registerForm);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        role: 'client' // Por defecto es cliente
      };

      // Validaciones
      if (!userData.name || !userData.email || !userData.password) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Por favor completa todos los campos obligatorios', 'warning');
        } else {
          alert('Por favor completa todos los campos obligatorios');
        }
        return;
      }

      if (window.Helpers && !window.Helpers.isValidEmail(userData.email)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Por favor ingresa un email válido', 'warning');
        } else {
          alert('Por favor ingresa un email válido');
        }
        return;
      }

      if (window.Helpers && !window.Helpers.isValidPassword(userData.password)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        } else {
          alert('La contraseña debe tener al menos 6 caracteres');
        }
        return;
      }

      // Verificar si el email ya existe
      const existingUser = StorageAPI.getUsers().find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Este email ya está registrado', 'warning');
        } else {
          alert('Este email ya está registrado');
        }
        return;
      }

      // Crear usuario
      const newUser = StorageAPI.addUser(userData);
      
      if (window.UI && window.UI.showToast) {
        window.UI.showToast('¡Registro exitoso! Iniciando sesión...', 'success');
      }

      // Iniciar sesión automáticamente
      setTimeout(() => {
        const session = { 
          id: newUser.id, 
          role: newUser.role, 
          name: newUser.name,
          email: newUser.email,
          loginTime: new Date().toISOString()
        };
        StorageAPI.setSession(session);
        redirectByRole(newUser);
      }, 1000);
    });
  }

  /**
   * Inicializa el sistema de autenticación
   */
  function initAuth() {
    checkExistingSession();
    setupLoginForm();
    setupRegisterForm();
    setupDemoButtons();
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();


