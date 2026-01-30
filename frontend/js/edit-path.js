// edit-path.js
// Obtiene el id de la ruta de la URL y carga los datos para editar

document.addEventListener('DOMContentLoaded', async () => {
  // Lógica para el input de route (igual que register-path.js)
  // Crear UI para añadir calles a la ruta
  const routeTextarea = document.getElementById('route');
  if (routeTextarea) {
    // Crear input y botones si no existen
    let streetInput = document.getElementById('street-name');
    let addStreetBtn = document.querySelector('.btn-add-street');
    let btnRemoveStreet = document.getElementById('btn-remove-street');
    if (!streetInput) {
      streetInput = document.createElement('input');
      streetInput.type = 'text';
      streetInput.id = 'street-name';
      streetInput.placeholder = 'Add street/segment...';
      streetInput.style.marginRight = '8px';
      streetInput.style.marginTop = '8px';
      routeTextarea.parentNode.insertBefore(streetInput, routeTextarea);
    }
    if (!addStreetBtn) {
      addStreetBtn = document.createElement('button');
      addStreetBtn.type = 'button';
      addStreetBtn.className = 'btn-add-street';
      addStreetBtn.textContent = 'Add Street';
      addStreetBtn.style.marginRight = '8px';
      streetInput.parentNode.insertBefore(addStreetBtn, streetInput.nextSibling);
    }
    if (!btnRemoveStreet) {
      btnRemoveStreet = document.createElement('button');
      btnRemoveStreet.type = 'button';
      btnRemoveStreet.id = 'btn-remove-street';
      btnRemoveStreet.textContent = 'Remove Last';
      addStreetBtn.parentNode.insertBefore(btnRemoveStreet, addStreetBtn.nextSibling);
    }
    // Lógica para añadir calle
    addStreetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const streetValue = streetInput.value.trim();
      if (!streetValue) return;
      let current = routeTextarea.value.trim();
      if (current) {
        routeTextarea.value = current + ', ' + streetValue;
      } else {
        routeTextarea.value = streetValue;
      }
      streetInput.value = '';
    });
    // Lógica para eliminar última calle
    btnRemoveStreet.addEventListener('click', function() {
      let current = routeTextarea.value.trim();
      if (!current) return;
      let arr = current.split(',').map(s => s.trim());
      arr.pop();
      routeTextarea.value = arr.join(', ');
    });
  }

  const params = new URLSearchParams(window.location.search);
  const pathId = params.get('id');
  if (!pathId) {
    document.getElementById('msg').textContent = 'Ruta no encontrada.';
    return;
  }
  // Cargar datos actuales
  try {
    const res = await fetch(`/api/path/${pathId}`);
    const path = await res.json();
    if (path.error) {
      document.getElementById('msg').textContent = 'No se pudo cargar la ruta.';
      return;
    }
    document.getElementById('name').value = path.name || '';
    document.getElementById('origin').value = path.origin || '';
    document.getElementById('end').value = path.end || '';
    document.getElementById('difficulty').value = path.difficulty || '';
    document.getElementById('status').value = path.status || '';
    document.getElementById('duration').value = path.duration || '';
    document.getElementById('distance').value = path.distance || '';
    document.getElementById('elevation_gain').value = path.elevation_gain || '';
    document.getElementById('average_velocity').value = path.average_velocity || '';
    document.getElementById('route').value = path.route || '';
    document.getElementById('is_public').value = path.is_public ? '1' : '0';
    // Mostrar imagen actual
    const pathImage = document.getElementById('path-image');
    if (pathImage && path.path_photo) {
      pathImage.src = '/' + path.path_photo;
    }
  } catch (err) {
    document.getElementById('msg').textContent = 'Error al cargar la ruta.';
  }

  // Soporte para cambiar la foto del path
  const editPhotoBtn = document.getElementById('edit-path-photo-btn');
  const photoInput = document.getElementById('path_photo_quick');
  const pathImage = document.getElementById('path-image');
  let selectedFile = null;
  if (editPhotoBtn && photoInput && pathImage) {
    editPhotoBtn.addEventListener('click', () => {
      photoInput.click();
    });
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function(ev) {
          pathImage.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Guardar cambios
  document.getElementById('edit-path-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Validación de formato
    const duration = document.getElementById('duration').value.trim();
    const durationRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!durationRegex.test(duration)) {
      document.getElementById('msg').textContent = 'El formato de duración debe ser hh:mm:ss';
      document.getElementById('duration').focus();
      return;
    }
    const difficulty = document.getElementById('difficulty').value;
    if (!["Easy","Intermediate","Difficult"].includes(difficulty)) {
      document.getElementById('msg').textContent = 'Dificultad inválida.';
      document.getElementById('difficulty').focus();
      return;
    }
    const status = document.getElementById('status').value;
    if (!["Optimal","Sufficient","Requires Maintenance"].includes(status)) {
      document.getElementById('msg').textContent = 'Estado inválido.';
      document.getElementById('status').focus();
      return;
    }
    // Enviar primero los datos (sin imagen)
    const data = {
      name: document.getElementById('name').value,
      origin: document.getElementById('origin').value,
      end: document.getElementById('end').value,
      difficulty,
      status,
      duration,
      distance: parseFloat(document.getElementById('distance').value) || 0,
      elevation_gain: parseFloat(document.getElementById('elevation_gain').value) || 0,
      average_velocity: parseFloat(document.getElementById('average_velocity').value) || 0,
      route: document.getElementById('route').value,
      is_public: Number(document.getElementById('is_public').value)
    };
    try {
      const res = await fetch(`/api/path/${pathId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success && result.updated) {
        // Si hay imagen seleccionada, subirla aparte
        if (selectedFile) {
          const formData = new FormData();
          formData.append('path_photo', selectedFile);
          const imgRes = await fetch(`/api/path/${pathId}/photo`, {
            method: 'POST',
            body: formData
          });
          const imgResult = await imgRes.json();
          if (imgResult && imgResult.success && typeof imgResult.path_photo === 'string') {
            pathImage.src = '/' + imgResult.path_photo + '?t=' + Date.now();
            selectedFile = null;
            photoInput.value = '';
          }
        }
        // Scroll al top antes de mostrar el mensaje
        window.scrollTo({ top: 0, behavior: 'smooth' });
        let container = document.getElementById('edit-path-message-container');
        if (container) {
          container.innerHTML = '';
          let msg = document.createElement('div');
          msg.textContent = 'Ruta actualizada correctamente';
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
          setTimeout(() => { msg.style.opacity = '0'; }, 1200);
          setTimeout(() => { msg.remove(); }, 1600);
        }
        setTimeout(() => {
          window.location.href = '/my-paths';
        }, 1800);
      } else if (result.success === false && result.updated === false) {
        document.getElementById('msg').textContent = result.message || 'No se actualizó ningún dato. ¿Los valores son iguales?';
      } else {
        document.getElementById('msg').textContent = 'Error al actualizar la ruta.';
      }
    } catch (err) {
      document.getElementById('msg').textContent = 'Error al actualizar la ruta.';
    }
  });
});
