// profile-paths.js - Actualiza el número de rutas del usuario logueado en el perfil

document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) return;

  fetch(window.location.origin + `/api/user/${user.id}/paths/count`)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo obtener el número de rutas');
      return res.json();
    })
    .then(data => {
      const el = document.querySelector('.profile-paths-done');
      if (el && typeof data.count !== 'undefined') {
        el.textContent = `Paths Done: ${data.count}`;
      }
    })
    .catch(err => {
      const el = document.querySelector('.profile-paths-done');
      if (el) el.textContent = 'Paths Done: -';
      console.error('Error obteniendo paths:', err);
    });
});
