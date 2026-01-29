document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = localStorage.getItem('userLoggedIn');
  let allUsers = [];
  const grid = document.querySelector('.friends-grid');
  const searchInput = document.querySelector('.friends-search-input');
  const searchBtn = document.querySelector('.friends-search-btn');
  // Crear o seleccionar el contenedor de mensajes
  let messageDiv = document.getElementById('follow-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'follow-message';
    messageDiv.style.cssText = 'text-align:center;margin:10px auto 10px auto;padding:12px 24px;background:#2ecc40;color:#fff;font-weight:bold;display:none;border-radius:8px;box-shadow:0 2px 8px #0002;font-size:1.1em;max-width:340px;min-width:180px;width:fit-content;';
    // Insertar después de la barra de búsqueda
    const searchBar = searchInput.closest('.friends-search-bar') || searchInput.parentElement;
    if (searchBar && searchBar.parentNode) {
      searchBar.parentNode.insertBefore(messageDiv, searchBar.nextSibling);
    } else {
      // fallback: antes del grid
      grid.parentNode.insertBefore(messageDiv, grid);
    }
  }

  let followingIds = [];
  async function fetchUsers() {
    try {
      const res = await fetch('/api/all' + (currentUser ? ('?excludeId=' + encodeURIComponent(currentUser)) : ''));
      allUsers = await res.json();
      // Obtener a quién sigue el usuario loggeado
      if (currentUser) {
        const resFollow = await fetch(`/api/${currentUser}/following`);
        followingIds = await resFollow.json();
      } else {
        followingIds = [];
      }
      renderUsers(allUsers);
    } catch (err) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:red;">Error loading users.</div>';
    }
  }

  function renderUsers(users) {
    grid.innerHTML = '';
    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'friend-card';
      const isFollowing = followingIds.includes ? followingIds.includes(user.id) : followingIds.some(f => f.friend_id == user.id);
      card.innerHTML = `
        <div class="friend-img-placeholder">
          <img class="friend-profile-img" src="${user.profile_image || '../assets/avatar-placeholder.png'}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; background: #ededed; cursor:pointer;" data-friend-id="${user.id}">
        </div>
        <div class="friend-username">${user.username} <button class="friend-add-btn" data-friend-id="${user.id}" style="background:none;border:none;cursor:pointer;padding:0;margin-left:4px;vertical-align:middle;">
          <img src="../assets/${isFollowing ? 'follow-check.png' : 'follow-user.png'}" alt="Seguir" style="width:32px;height:28px;vertical-align:middle;">
        </button></div>
      `;
      // Evento para seguir usuario al hacer clic en el botón +
      const btn = card.querySelector('.friend-add-btn');
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const friendId = e.currentTarget.getAttribute('data-friend-id');
        if (!friendId || !currentUser) return;
        if (isFollowing) {
          // Show error visual
          messageDiv.textContent = 'You are already following this user';
          messageDiv.style.background = '#e74c3c';
          messageDiv.style.display = 'block';
          setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.style.background = '#2ecc40';
          }, 2200);
          return;
        }
        try {
          const res = await fetch('/api/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser, friend_id: friendId })
          });
          const data = await res.json();
          if (data.success) {
            btn.querySelector('img').src = '../assets/follow-check.png';
            // Show message between search bar and grid
            messageDiv.textContent = 'You are now following this user';
            messageDiv.style.background = '#2ecc40';
            messageDiv.style.display = 'block';
            setTimeout(() => { messageDiv.style.display = 'none'; }, 2500);
          } else {
            messageDiv.textContent = data.error || 'Could not follow the user';
            messageDiv.style.background = '#e74c3c';
            messageDiv.style.display = 'block';
            setTimeout(() => {
              messageDiv.style.display = 'none';
              messageDiv.style.background = '#2ecc40';
            }, 2200);
          }
        } catch (err) {
          messageDiv.textContent = 'Error following user';
          messageDiv.style.background = '#e74c3c';
          messageDiv.style.display = 'block';
          setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.style.background = '#2ecc40';
          }, 2200);
        }
      });

      // Evento para ir al perfil público al hacer clic en la imagen de perfil
      const profileImg = card.querySelector('.friend-profile-img');
      profileImg.addEventListener('click', (e) => {
        const friendId = e.currentTarget.getAttribute('data-friend-id');
        if (friendId) {
          window.location.href = `/paths?user=${encodeURIComponent(friendId)}`;
        }
      });
      grid.appendChild(card);
    });
  }



  searchInput.addEventListener('input', (e) => {
    const value = searchInput.value.trim().toLowerCase();
    if (!value) {
      renderUsers(allUsers);
    } else {
      const filtered = allUsers.filter(u => u.username.toLowerCase().includes(value));
      renderUsers(filtered);
    }
  });

  searchBtn.addEventListener('click', () => {
    const value = searchInput.value.trim().toLowerCase();
    if (!value) {
      renderUsers(allUsers);
      return;
    }
    const filtered = allUsers.filter(u => u.username.toLowerCase().includes(value));
    renderUsers(filtered);
  });

  fetchUsers();
});
