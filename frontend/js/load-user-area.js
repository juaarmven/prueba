// load-user-area.js
// This script dynamically updates the user-area in the header based on login status.
// Usage: Include this script after the header loads.

// Simulated login check (replace with real logic as needed)
function isUserLoggedIn() {
  // Example: check localStorage for a token or user object
  return !!localStorage.getItem('userLoggedIn');
}

function getUserProfileImage() {
  // Example: get user image from localStorage or API
  return localStorage.getItem('userProfileImage') || '../assets/avatar-placeholder.png';
}

function getUserName() {
  // Example: get user name from localStorage or API
  return localStorage.getItem('userName') || 'User';
}

function renderUserArea() {
  const userArea = document.querySelector('.user-area');
  if (!userArea) return;
  userArea.innerHTML = '';

  // Comprobar expiración de sesión
  const expiresAt = localStorage.getItem('sessionExpiresAt');
  if (expiresAt && Date.now() > Number(expiresAt)) {
    localStorage.removeItem('user');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('sessionExpiresAt');
    // Mostrar botón login
    const loginBtn = document.createElement('a');
    loginBtn.href = '/login';
    loginBtn.className = 'login-btn';
    loginBtn.textContent = 'LOG IN';
    userArea.appendChild(loginBtn);
    return;
  }

  if (isUserLoggedIn()) {
    // Mostrar imagen de perfil y nombre de usuario con menú desplegable
    const user = JSON.parse(localStorage.getItem('user'));
    const dropdownWrapper = document.createElement('div');
    dropdownWrapper.style.position = 'relative';
    dropdownWrapper.style.display = 'flex';
    dropdownWrapper.style.flexDirection = 'column';
    dropdownWrapper.style.alignItems = 'center';

    // Detectar si es móvil (ancho <= 790px)
    const isMobile = window.matchMedia('(max-width: 790px)').matches;

    dropdownWrapper.innerHTML = `
      <div id="user-area-trigger" style="width:70px;height:70px;border-radius:50%;border:3px solid #43b649;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <img src="${user.profile_image || '../assets/avatar-placeholder.png'}" alt="Profile" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div style="margin-top:8px;font-weight:800;font-size:1.1rem;color:#43b649;text-align:center;cursor:pointer;" id="user-area-username">${user.username || user.name || 'Usuario'}</div>
      <div id="user-area-dropdown" style="display:none;position:absolute;top:80px;right:0;background:#fff;border:1px solid #e0e0e0;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);min-width:120px;z-index:100;">
        ${!isMobile ? '<a href="/profile" style="display:block;padding:10px 16px;color:#00a217;text-decoration:none;font-weight:600;">PROFILE</a>' : ''}
        <a href="#" id="logout-link" style="display:block;padding:10px 16px;color:#00a217;text-decoration:none;font-weight:600;">LOG OUT</a>
      </div>
    `;
    userArea.appendChild(dropdownWrapper);

    // Si es móvil, añade el enlace PROFILE al menú hamburguesa
    if (isMobile) {
      const nav = document.querySelector('.main-nav');
      if (nav && !nav.querySelector('.nav-link.profile-link')) {
        const profileLink = document.createElement('a');
        profileLink.href = '/profile';
        profileLink.className = 'nav-link profile-link';
        profileLink.textContent = 'PROFILE';
        nav.appendChild(profileLink);
      }
    } else {
      // Si no es móvil, elimina el enlace PROFILE del menú hamburguesa si existe
      const nav = document.querySelector('.main-nav');
      const profileLink = nav ? nav.querySelector('.nav-link.profile-link') : null;
      if (profileLink) nav.removeChild(profileLink);
    }

    // Mostrar/ocultar el menú desplegable al hacer click en avatar o nombre
    const trigger = dropdownWrapper.querySelector('#user-area-trigger');
    const username = dropdownWrapper.querySelector('#user-area-username');
    const dropdown = dropdownWrapper.querySelector('#user-area-dropdown');
    function toggleDropdown(e) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
    trigger.addEventListener('click', toggleDropdown);
    username.addEventListener('click', toggleDropdown);
    // Cerrar el menú si se hace click fuera
    document.addEventListener('click', function(e) {
      if (!dropdownWrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
    // Logout
    const logoutLink = dropdownWrapper.querySelector('#logout-link');
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('user');
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('sessionExpiresAt');
      window.location.href = '/login';
    });
  } else {
    // Mostrar botón login
    const loginBtn = document.createElement('a');
    loginBtn.href = '/login';
    loginBtn.className = 'login-btn';
    loginBtn.textContent = 'Log in';
    userArea.appendChild(loginBtn);
  }
}

document.addEventListener('DOMContentLoaded', renderUserArea);
// If header is loaded dynamically, call renderUserArea() after header injection as well.
