// login.js
console.log('login.js cargado');

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    console.log('Login frontend:', email, password); // <-- Depuración

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userLoggedIn', data.user.id.toString());
        // Guardar el tiempo de expiración de la sesión (ejemplo: 30 minutos)
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 día en ms
        localStorage.setItem('sessionExpiresAt', expiresAt.toString());
        window.location.href = '/';
      } else {
        // Mostrar mensaje visual en login-message-container
        const container = document.getElementById('login-message-container');
        if (container) {
          container.innerHTML = '';
          const div = document.createElement('div');
          div.textContent = 'El correo o la contraseña son incorrectos';
          div.style.background = '#e74c3c';
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
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  });
});
