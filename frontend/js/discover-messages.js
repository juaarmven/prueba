// discover-messages.js
// Muestra mensajes en el contenedor de discover si existen en sessionStorage

document.addEventListener('DOMContentLoaded', function() {
  const msg = sessionStorage.getItem('dashboardMessage');
  if (msg) {
    const container = document.getElementById('discover-message-container');
    if (container) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.textContent = msg;
      div.style.background = '#ff0000';
      div.style.color = '#fff';
      div.style.padding = '16px 32px';
      div.style.borderRadius = '16px';
      div.style.fontWeight = '700';
      div.style.fontSize = '1.1rem';
      div.style.margin = '18px auto 0 auto';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      div.style.transition = 'opacity 0.4s';
      div.style.maxWidth = '400px';
      div.style.textAlign = 'center';
      container.appendChild(div);
      setTimeout(() => { div.style.opacity = '0'; }, 1800);
      setTimeout(() => { div.remove(); }, 2200);
    }
    sessionStorage.removeItem('dashboardMessage');
  }
});
