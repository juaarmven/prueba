document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.register-form');
  if (!form) return;

  // Mensaje de feedback
  let msgContainer = document.getElementById('register-message-container');
  if (!msgContainer) {
    msgContainer = document.createElement('div');
    msgContainer.id = 'register-message-container';
    msgContainer.style.margin = '18px 0';
    form.parentNode.insertBefore(msgContainer, form);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    // Recoge los valores del formulario
    const inputs = form.querySelectorAll('.form-input');
    const [firstName, lastName, email, phone, age, city, username, password, repeatPassword] = Array.from(inputs).map(i => i.value.trim());
    const terms = form.querySelector('#terms').checked;

    // Validación básica
    // Resalta campos vacíos
    let empty = false;
    const requiredIndexes = [0,1,2,3,6,7,8]; // firstName, lastName, email, phone, username, password, repeatPassword
    requiredIndexes.forEach(idx => {
      if (!inputs[idx].value.trim()) {
        inputs[idx].style.borderColor = '#c0392b';
        inputs[idx].style.background = '#ffeaea';
        empty = true;
      } else {
        inputs[idx].style.borderColor = '';
        inputs[idx].style.background = '';
      }
    });
    if (empty) {
      showMessage('Por favor, completa todos los campos obligatorios.', false);
      return;
    }
    const repeatPasswordInput = inputs[8];
    if (password !== repeatPassword) {
      showMessage('Las contraseñas no coinciden.', false);
      if (repeatPasswordInput) {
        repeatPasswordInput.style.borderColor = '#c0392b';
        repeatPasswordInput.style.background = '#ffeaea';
      }
      return;
    } else {
      if (repeatPasswordInput) {
        repeatPasswordInput.style.borderColor = '';
        repeatPasswordInput.style.background = '';
      }
    }
    if (!terms) {
      showMessage('Debes aceptar los términos y condiciones.', false);
      return;
    }

    // Recoge la imagen de perfil
    const imageInput = document.getElementById('register-image-upload');
    const imageFile = imageInput && imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;

    // Envía los datos al backend como FormData
    try {
      const formData = new FormData();
      formData.append('name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('age', age || '');
      formData.append('location', city || '');
      formData.append('username', username);
      formData.append('password', password);
      if (imageFile) {
        formData.append('profile_image', imageFile);
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showMessage('Registration successful, redirecting...', true);
        setTimeout(() => window.location.href = '/login', 1500);
      } else {
        showMessage(data.error || 'Registration error.', false);
      }
    } catch (err) {
      showMessage('Network error. Please try again.', false);
    }
  });

  function showMessage(msg, success) {
    if (!msgContainer) return;
    msgContainer.textContent = msg;
    msgContainer.style.background = success ? '#43b649' : '#c0392b';
    msgContainer.style.color = '#fff';
    msgContainer.style.padding = '16px 28px';
    msgContainer.style.borderRadius = '12px';
    msgContainer.style.margin = '18px 0';
    msgContainer.style.textAlign = 'center';
    msgContainer.style.fontWeight = '700';
    msgContainer.style.fontSize = '1.1rem';
    msgContainer.style.boxShadow = success ? '0 2px 8px #43b64933' : '0 2px 8px #c0392b33';
  }

  // Mostrar mensaje personalizado junto con el nativo de required
  const requiredInputs = form.querySelectorAll('.form-input[required]');
  requiredInputs.forEach(input => {
    input.addEventListener('invalid', function (e) {
      e.preventDefault();
      input.style.borderColor = '#c0392b';
      input.style.background = '#ffeaea';
      showMessage('Please complete all required fields.', false);
    });
    input.addEventListener('input', function () {
      if (input.value.trim()) {
        input.style.borderColor = '';
        input.style.background = '';
        msgContainer.textContent = '';
      }
    });
  });
});
