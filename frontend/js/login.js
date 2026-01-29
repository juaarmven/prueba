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
        alert('Credenciales incorrectas');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  });
});
