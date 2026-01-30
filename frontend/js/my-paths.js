// my-paths.js
// Suponiendo que tienes el id del usuario en localStorage (userId)
document.addEventListener('DOMContentLoaded', async () => {
  // Tabs para alternar entre registradas y guardadas
  const myPathsTitle = document.getElementById('my-paths-title');
  const savedPathsTitle = document.getElementById('saved-paths-title');
  const pathsList = document.getElementById('paths-list');
  const savedPathsList = document.getElementById('saved-paths-list');
  if (myPathsTitle && savedPathsTitle && pathsList && savedPathsList) {
    myPathsTitle.addEventListener('click', () => {
      myPathsTitle.style.textDecoration = 'underline';
      savedPathsTitle.style.textDecoration = 'none';
      pathsList.style.display = '';
      savedPathsList.style.display = 'none';
    });
    savedPathsTitle.addEventListener('click', () => {
      myPathsTitle.style.textDecoration = 'none';
      savedPathsTitle.style.textDecoration = 'underline';
      pathsList.style.display = 'none';
      savedPathsList.style.display = '';
    });
  }
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user && user.id;
  if (!userId) {
    if (pathsList) pathsList.innerHTML = '<p>No has iniciado sesión.</p>';
    return;
  }
  try {
    const res = await fetch(`/api/path/user/${userId}`);
    const paths = await res.json();
    if (!paths.length) {
      if (pathsList) pathsList.innerHTML = '<p>No tienes rutas registradas.</p>';
      return;
    }
    // Contenedor tipo galería
    const gallery = document.createElement('div');
    gallery.className = 'paths-gallery';
    const carousel = document.createElement('div');
    carousel.className = 'paths-carousel';
    paths.forEach(path => {
      const card = document.createElement('div');
      card.className = 'path-card';
      card.innerHTML = `
        <div style="position: relative;">
          <div class="path-image">
            <img src="${path.path_photo ? '/' + path.path_photo : '../assets/ejemplo.jpg'}" alt="Imagen de la ruta" />
          </div>
          <div class="path-card-text">
            <div class="path-name">${(path.origin && path.end) ? `${path.origin} - ${path.end}` : (path.name || 'Ruta sin nombre')}</div>
            <div class="path-author">${user.username ? 'Published by ' + user.username : ''}</div>
            <a href="/edit-path?id=${path.id}" class="edit-path-btn" style="display:block;margin:18px auto 0 auto;max-width:180px;text-align:center;background:#54c242;color:#fff;padding:10px 18px;border-radius:8px;font-weight:700;text-decoration:none;">Editar ruta</a>
          </div>
        </div>
      `;
      carousel.appendChild(card);
    });
    gallery.appendChild(carousel);
    if (pathsList) pathsList.appendChild(gallery);
  } catch (err) {
    if (pathsList) pathsList.innerHTML = '<p>Error al cargar tus rutas.</p>';
  }
});
