// dashboard.js
// Controla el acceso a las acciones del dashboard según el login

document.addEventListener('DOMContentLoaded', function() {
  // Asegúrate de que UserManager esté disponible en window
  if (typeof UserManager === 'undefined') {
    console.error('UserManager no está disponible');
    return;
  }
  if (!UserManager.isLoggedIn()) {
    // Deshabilitar solo registrar rutas y descubrir amigos
    const registerCard = document.querySelector('.action-card.register');
    const discoverFriendsCard = document.querySelector('.action-card.discover-friends');
    if (registerCard) {
      registerCard.classList.add('disabled');
      registerCard.href = '#';
      registerCard.title = 'Debes iniciar sesión para registrar rutas';
    }
    if (discoverFriendsCard) {
      discoverFriendsCard.classList.add('disabled');
      discoverFriendsCard.href = '#';
      discoverFriendsCard.title = 'Debes iniciar sesión para descubrir amigos';
    }
  }
});
