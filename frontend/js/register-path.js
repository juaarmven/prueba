document.addEventListener('DOMContentLoaded', function() {
  // Declarar solo una vez las variables de los inputs
  const streetInput = document.getElementById('street-name');
  const addStreetBtn = document.querySelector('.btn-add-street');
  const streetRouteInput = document.getElementById('street-route');
  const originInput = document.getElementById('origin');
  const destinationInput = document.getElementById('destination');

  // Botón para eliminar el último elemento del street-route
  const btnRemoveStreet = document.getElementById('btn-remove-street');
  if (btnRemoveStreet && streetRouteInput) {
    btnRemoveStreet.addEventListener('click', function() {
      let current = streetRouteInput.value.trim();
      if (!current) return;
      let arr = current.split(',').map(s => s.trim());
      arr.pop();
      streetRouteInput.value = arr.join(', ');
    });
  }

  // Añadir calle seleccionada al campo 'route' al pulsar Add Street
  if (addStreetBtn && streetInput && streetRouteInput) {
    addStreetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const streetValue = streetInput.value.trim();
      if (!streetValue) return;
      let current = streetRouteInput.value.trim();
      if (current) {
        streetRouteInput.value = current + ', ' + streetValue;
      } else {
        streetRouteInput.value = streetValue;
      }
      streetInput.value = '';
    });
  }

  // Eliminar autocompletado y API Nominatim

  function showSuggestions(results, inputElem) {
    let list = document.getElementById('street-suggestions');
    if (!list) {
      list = document.createElement('ul');
      list.id = 'street-suggestions';
      list.style.position = 'absolute';
      list.style.background = '#fff';
      list.style.border = '1px solid #43b649';
      list.style.zIndex = '1000';
      list.style.width = inputElem.offsetWidth + 'px';
      list.style.maxHeight = '180px';
      list.style.overflowY = 'auto';
      // Posicionar debajo del input
      const rect = inputElem.getBoundingClientRect();
      list.style.left = rect.left + window.scrollX + 'px';
      list.style.top = rect.bottom + window.scrollY + 'px';
      document.body.appendChild(list);
    } else {
      // Reposicionar si el input se mueve
      const rect = inputElem.getBoundingClientRect();
      list.style.left = rect.left + window.scrollX + 'px';
      list.style.top = rect.bottom + window.scrollY + 'px';
      list.style.width = inputElem.offsetWidth + 'px';
    }
    list.innerHTML = '';
    if (results.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No results';
      li.style.padding = '8px';
      list.appendChild(li);
      return;
    }
    results.slice(0, 5).forEach(item => {
      const li = document.createElement('li');
      // Mostrar nombre de la calle y ciudad
      let street = '';
      let city = '';
      if (item.address) {
        street = item.address.road || item.address.pedestrian || item.address.cycleway || item.display_name.split(',')[0];
        city = item.address.city || item.address.town || item.address.village || item.address.hamlet || item.address.municipality || '';
      } else {
        street = item.display_name.split(',')[0];
      }
      li.textContent = city ? `${street} (${city})` : street;
      li.style.padding = '8px';
      li.style.cursor = 'pointer';
      li.addEventListener('mousedown', function() {
        inputElem.value = city ? `${street} (${city})` : street;
        list.innerHTML = '';
      });
      list.appendChild(li);
    });
  }

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener('click', function(e) {
    const list = document.getElementById('street-suggestions');
    if (list && !streetInput.contains(e.target)) {
      list.innerHTML = '';
      list.remove();
    }
  });

  // Envío del formulario con imagen
  const form = document.querySelector('.register-path-form');
  const imageInput = document.getElementById('image-upload');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    // Validación de campos obligatorios y numéricos
    const requiredFields = [
      'name', 'origin', 'destination', 'distance', 'difficulty', 'status', 'duration', 'elevation', 'velocity', 'route'
    ];
    let valid = true;
    let firstInvalid = null;
    for (const field of requiredFields) {
      const input = document.querySelector(`[name="${field}"]`);
      if (input) {
        if (input.type === 'number') {
          if (input.value.trim() === '' || isNaN(Number(input.value)) || Number(input.value) <= 0) {
            valid = false;
            if (!firstInvalid) firstInvalid = input;
            input.style.borderColor = '#c0392b';
          } else {
            input.style.borderColor = '';
          }
        } else {
          if (input.value.trim() === '') {
            valid = false;
            if (!firstInvalid) firstInvalid = input;
            input.style.borderColor = '#c0392b';
          } else {
            input.style.borderColor = '';
          }
        }
      }
    }
    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      const msgContainer = document.getElementById('register-path-message-container');
      console.log('Validation failed. msgContainer:', msgContainer);
      if (msgContainer) {
        msgContainer.innerHTML = '';
        const msg = document.createElement('div');
        msg.textContent = 'Por favor, completa todos los campos obligatorios y asegúrate de que los valores numéricos sean mayores que 0.';
        msg.style.background = '#c0392b';
        msg.style.color = '#fff';
        msg.style.padding = '8px 18px';
        msg.style.borderRadius = '10px';
        msg.style.fontWeight = '600';
        msg.style.fontSize = '0.95rem';
        msg.style.margin = '12px auto 0 auto';
        msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        msg.style.transition = 'opacity 0.4s';
        msg.style.maxWidth = '260px';
        msg.style.textAlign = 'center';
        msg.style.opacity = '1';
        msgContainer.appendChild(msg);
        setTimeout(() => {
          if (msg && msg.parentNode) {
            msg.style.opacity = '0';
          }
        }, 2000);
        setTimeout(() => {
          if (msg && msg.parentNode) {
            msg.remove();
          }
        }, 2400);
      } else {
        console.error('No se encontró el contenedor de mensajes (#register-path-message-container)');
      }
      return;
    }
    const formData = new FormData(form);
    // Puedes obtener el usuario de localStorage si necesitas asociar la ruta
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      formData.append('created_by', user.id);
    }
    try {
      const res = await fetch('/api/path', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        // Guardar mensaje en sessionStorage y redirigir
        sessionStorage.setItem('dashboardMessage', 'Path created successfully');
        window.location.href = '/';
      } else {
        alert('Error al crear la ruta: ' + (data.error || ''));
      }
    } catch (err) {
      alert('Error de red al crear la ruta');
    }
  });
});
