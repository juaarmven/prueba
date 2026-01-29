// Recargar el header dinámicamente si existe la función renderUserArea
        if (typeof renderUserArea === 'function') {
          renderUserArea();
        }
// profile-save.js - Solo flujo EDIT PHOTO, previsualización y subida al guardar
document.addEventListener('DOMContentLoaded', function() {
  const editBtn = document.getElementById('edit-photo-btn');
  const fileInput = document.getElementById('profile_image_quick');
  const img = document.querySelector('.profile-image-circle img');
  let selectedFile = null;
  if (editBtn && fileInput && img) {
    editBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
      if (fileInput.files && fileInput.files[0]) {
        selectedFile = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
          img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
      }
    });
  }

  const form = document.querySelector('.profile-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return;

    // Recoger los datos del formulario
    const name = document.getElementById('name').value.trim();
    const last_name = document.getElementById('lastname').value.trim();
    const age = parseInt(document.getElementById('age').value, 10);
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('city').value.trim();
    let errorMsg = '';
    if (!name || !last_name || !email || !phone || !location) {
      errorMsg = 'All fields are required.';
    } else if (!age || isNaN(age) || age <= 0) {
      errorMsg = 'Age must be a number greater than 0.';
    }
    if (errorMsg) {
      let container = document.getElementById('profile-message-container');
      if (container) {
        container.innerHTML = '';
        let msg = document.createElement('div');
        msg.textContent = errorMsg;
        msg.style.background = '#c0392b';
        msg.style.color = '#fff';
        msg.style.padding = '16px 32px';
        msg.style.borderRadius = '16px';
        msg.style.fontWeight = '700';
        msg.style.fontSize = '1.1rem';
        msg.style.margin = '18px 0 0 0';
        msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        msg.style.transition = 'opacity 0.4s';
        container.appendChild(msg);
        setTimeout(() => { msg.style.opacity = '0'; }, 2200);
        setTimeout(() => { msg.remove(); }, 2600);
      }
      return;
    }
    const data = {
      name,
      last_name,
      age,
      email,
      phone,
      location,
      username: user.username // No editable en el formulario, pero necesario para el backend
    };

    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        // Si hay imagen seleccionada, subirla
        if (selectedFile) {
          const formData = new FormData();
          formData.append('profile_image', selectedFile);
          const imgRes = await fetch(`/api/user/${user.id}/profile_image`, {
            method: 'POST',
            body: formData
          });
          const imgResult = await imgRes.json();
          // CORRECCIÓN: solo guardar la ruta, nunca el objeto
          if (imgResult && imgResult.success && typeof imgResult.imagePath === 'string') {
            user.profile_image = imgResult.imagePath;
            localStorage.setItem('user', JSON.stringify({ ...user, ...data, profile_image: imgResult.imagePath }));
            img.src = imgResult.imagePath + '?t=' + Date.now(); // Forzar recarga
            selectedFile = null;
            fileInput.value = '';
            if (typeof renderUserArea === 'function') {
              renderUserArea(); // Recargar header tras cambio de imagen
            }
          }
        } else {
          localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
          if (typeof renderUserArea === 'function') {
            renderUserArea(); // Recargar header tras cambio de datos
          }
        }
        // Mostrar mensaje visual entre header y container
        let container = document.getElementById('profile-message-container');
        if (container) {
          container.innerHTML = '';
          let msg = document.createElement('div');
          msg.textContent = 'Personal data updated correctly';
          msg.style.background = '#43b649';
          msg.style.color = '#fff';
          msg.style.padding = '16px 32px';
          msg.style.borderRadius = '16px';
          msg.style.fontWeight = '700';
          msg.style.fontSize = '1.1rem';
          msg.style.margin = '18px 0 0 0';
          msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          msg.style.transition = 'opacity 0.4s';
          container.appendChild(msg);
          setTimeout(() => { msg.style.opacity = '0'; }, 1800);
          setTimeout(() => { msg.remove(); }, 2200);
        }
      } else {
        alert('Error al actualizar los datos');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  });
});
