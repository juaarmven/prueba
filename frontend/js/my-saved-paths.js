// my-saved-paths.js
// Muestra las rutas guardadas (likeadas) por el usuario

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user.id;
  if (!userId) {
    document.getElementById('saved-paths-list').innerHTML = '<p>No has iniciado sesión.</p>';
    return;
  }
  try {
    // Obtener IDs de rutas guardadas
    const resIds = await fetch(`/api/userlikespath/${userId}`);
    const savedIds = await resIds.json();
    if (!savedIds.length) {
      document.getElementById('saved-paths-list').innerHTML = '<p>No tienes rutas guardadas.</p>';
      return;
    }
    // Obtener todas las rutas públicas y filtrar solo las guardadas
    const resPaths = await fetch('/api/path/public');
    const allPaths = await resPaths.json();
    const savedPaths = allPaths.filter(p => savedIds.includes(p.id));
    if (!savedPaths.length) {
      document.getElementById('saved-paths-list').innerHTML = '<p>No tienes rutas guardadas.</p>';
      return;
    }
    // Contenedor tipo galería
    const gallery = document.createElement('div');
    gallery.className = 'paths-gallery';
    const carousel = document.createElement('div');
    carousel.className = 'paths-carousel';
    savedPaths.forEach(path => {
      const card = document.createElement('div');
      card.className = 'path-card';
      card.innerHTML = `
        <div style="position: relative;">
          <div class="path-image">
            <img src="${path.path_photo ? '/' + path.path_photo : '../assets/ejemplo.jpg'}" alt="Imagen de la ruta" />
          </div>
          <div class="path-card-text">
            <div class="path-name">${(path.origin && path.end) ? `${path.origin} - ${path.end}` : (path.name || 'Ruta sin nombre')}</div>
            <div class="path-author">${path.creator_username ? 'Published by ' + path.creator_username : ''}</div>
            <a href="/path-details?id=${path.id}" class="edit-path-btn" style="display:block;margin:18px auto 0 auto;max-width:180px;text-align:center;background:#54c242;color:#fff;padding:10px 18px;border-radius:8px;font-weight:700;text-decoration:none;">Ver detalles</a>
          </div>
        </div>
      `;
      carousel.appendChild(card);
    });
    gallery.appendChild(carousel);
    document.getElementById('saved-paths-list').appendChild(gallery);
  } catch (err) {
    document.getElementById('saved-paths-list').innerHTML = '<p>Error al cargar tus rutas guardadas.</p>';
  }
});
