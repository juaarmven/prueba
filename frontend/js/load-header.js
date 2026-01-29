// Cargar el header en cualquier página que lo necesite
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('../public/header.html');
    const headerHTML = await response.text();
    
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = headerHTML;
    document.body.insertBefore(headerContainer.firstElementChild, document.body.firstChild);
    
    // Inicializar el menú hamburguesa
    initializeHamburgerMenu();
    // Renderizar el área de usuario después de insertar el header
    if (typeof renderUserArea === 'function') {
      renderUserArea();
    }
  } catch (error) {
    console.error('Error loading header:', error);
  }
});

// Función para inicializar el menú hamburguesa
function initializeHamburgerMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }
}
