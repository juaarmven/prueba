// rate-path.js - Envía la valoración al backend

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('rateForm');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const pathId = urlParams.get('id');
    const userId = localStorage.getItem('userLoggedIn');
    const score = document.getElementById('rating').value;
    const description = document.getElementById('comment').value;
    const msg = document.getElementById('rate-message');
    if (!userId) {
      msg.textContent = 'Debes iniciar sesión para valorar.';
      msg.style.color = 'red';
      return;
    }
    try {
      const res = await fetch(`/api/path/${pathId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, description, user_id: userId })
      });
      if (res.ok) {
        msg.textContent = '¡Valoración enviada correctamente!';
        msg.style.color = '#43b649';
        form.reset();
        setTimeout(() => {
          window.location.href = '/path-details?id=' + encodeURIComponent(pathId);
        }, 1200);
      } else {
        const data = await res.json();
        msg.textContent = data.error || 'Error al enviar la valoración.';
        msg.style.color = 'red';
      }
    } catch (err) {
      msg.textContent = 'Error de red al enviar la valoración.';
      msg.style.color = 'red';
    }
  });
});
