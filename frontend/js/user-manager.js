// user-manager.js
// Gestión de usuario: login, logout, registro, datos y estado de sesión

const UserManager = {
  // Simula un backend con localStorage (reemplaza por peticiones reales en producción)

  // Iniciar sesión
  login({ email, password }) {
    // Aquí deberías hacer una petición real al backend
    // Simulación: si email y password no están vacíos, inicia sesión
    if (email && password) {
      const user = {
        email,
        name: 'Jhon23401',
        profileImage: '../assets/avatar-placeholder.png',
        age: 20,
        city: 'Milano',
        phone: '+06 36 7962629',
        pathsDone: 5
      };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userLoggedIn', '1');
      return true;
    }
    return false;
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userLoggedIn');
  },

  // Registrar usuario
  register({ email, password, name, age, city, phone }) {
    // Aquí deberías hacer una petición real al backend
    // Simulación: guarda usuario en localStorage
    const user = {
      email,
      name,
      profileImage: '../assets/avatar-placeholder.png',
      age,
      city,
      phone,
      pathsDone: 0
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userLoggedIn', '1');
    return true;
  },

  // ¿Está logueado?
  isLoggedIn() {
    return !!localStorage.getItem('userLoggedIn');
  },

  // Obtener datos del usuario
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Actualizar datos del usuario
  updateUser(data) {
    const user = this.getUser();
    if (!user) return false;
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    return true;
  },

  // Cambiar imagen de perfil
  setProfileImage(url) {
    return this.updateUser({ profileImage: url });
  },

  // Añadir ruta realizada
  incrementPathsDone() {
    const user = this.getUser();
    if (!user) return false;
    user.pathsDone = (user.pathsDone || 0) + 1;
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  }
};

// Para usarlo: UserManager.login({email, password}), UserManager.logout(), etc.
// Puedes exportar este objeto si usas módulos.
