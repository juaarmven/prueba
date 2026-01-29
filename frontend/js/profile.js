// profile.js - Rellena el formulario de perfil con los datos del usuario logueado
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  // Rellenar campos (mapeo backend → frontend)
  if (user.name) document.getElementById('name').value = user.name;
  if (user.last_name) document.getElementById('lastname').value = user.last_name;
  if (user.age) document.getElementById('age').value = user.age;
  if (user.email) document.getElementById('email').value = user.email;
  if (user.phone) document.getElementById('phone').value = user.phone;
  if (user.location) document.getElementById('city').value = user.location;

  // Username box
  if (user.username && document.querySelector('.profile-username')) {
    document.querySelector('.profile-username').textContent = user.username;
  }

  // Imagen de perfil: si no hay, usar avatar.png
  const img = document.querySelector('.profile-image-circle img');
  if (img) {
    if (user.profile_image && user.profile_image.trim() !== '') {
      img.src = user.profile_image;
    } else {
      img.src = '../assets/avatar.png';
    }
  }
});
