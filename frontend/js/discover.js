// Range Sliders
document.addEventListener('DOMContentLoaded', () => {
    // Autocompletado para Origin y Destination
    const searchBar = document.querySelector('.search-bar');
    const originInput = searchBar ? searchBar.querySelectorAll('.search-input')[0] : null;
    const destinationInput = searchBar ? searchBar.querySelectorAll('.search-input')[1] : null;

    function createAutocompleteList(input) {
      let list = input.parentNode.querySelector('.autocomplete-list');
      if (!list) {
        list = document.createElement('div');
        list.className = 'autocomplete-list';
        // El CSS ya posiciona correctamente la lista
        input.parentNode.appendChild(list);
      }
      return list;
    }

    function setupAutocomplete(input, endpoint) {
      let lastValue = '';
      input.addEventListener('input', async () => {
        const value = input.value.trim();
        if (!value) {
          const list = input.parentNode.querySelector('.autocomplete-list');
          if (list) list.innerHTML = '';
          return;
        }
        lastValue = value;
        try {
          const res = await fetch(`/api/path/public/${endpoint}?q=${encodeURIComponent(value)}`);
          const suggestions = await res.json();
          const list = createAutocompleteList(input);
          list.innerHTML = '';
          suggestions.forEach(s => {
            const item = document.createElement('div');
            item.textContent = s;
            item.style.padding = '6px 12px';
            item.style.cursor = 'pointer';
            item.addEventListener('mousedown', (e) => {
              e.preventDefault();
              input.value = s;
              list.innerHTML = '';
            });
            list.appendChild(item);
          });
        } catch {}
      });
      // Ocultar lista al perder foco
      input.addEventListener('blur', () => {
        setTimeout(() => {
          const list = input.parentNode.querySelector('.autocomplete-list');
          if (list) list.innerHTML = '';
        }, 120);
      });
    }

    if (originInput) setupAutocomplete(originInput, 'origins');
    if (destinationInput) setupAutocomplete(destinationInput, 'destinations');
  // Paginación de rutas públicas
  const PAGE_SIZE = 4;
  let currentPage = 1;
  let allPaths = [];

  async function loadPublicPaths() {
    try {
      const res = await fetch('/api/path/public');
      allPaths = await res.json();
      // Obtener rutas guardadas por el usuario
      let savedPathIds = [];
      const userId = localStorage.getItem('userLoggedIn');
      if (userId) {
        try {
          const resSaved = await fetch(`/api/userlikespath/${userId}`);
          if (resSaved.ok) {
            savedPathIds = await resSaved.json();
          }
        } catch {}
      }
      window._savedPathIds = savedPathIds;
      // Calcular la duración máxima y establecerla en el filtro
      const durationMaxInput = document.getElementById('durationMax');
      if (durationMaxInput && allPaths.length > 0) {
        let maxSeconds = 0;
        let maxDurationStr = '00:00:00';
        allPaths.forEach(p => {
          if (p.duration) {
            const parts = p.duration.split(':').map(Number);
            let durSec = 0;
            if (parts.length === 3) durSec = parts[0]*3600 + parts[1]*60 + parts[2];
            else if (parts.length === 2) durSec = parts[0]*60 + parts[1];
            else if (parts.length === 1) durSec = parts[0];
            if (durSec > maxSeconds) {
              maxSeconds = durSec;
              // Formatear a hh:mm:ss
              const h = String(Math.floor(durSec/3600)).padStart(2,'0');
              const m = String(Math.floor((durSec%3600)/60)).padStart(2,'0');
              const s = String(durSec%60).padStart(2,'0');
              maxDurationStr = `${h}:${m}:${s}`;
            }
          }
        });
        durationMaxInput.value = maxDurationStr;
      }
      renderFilteredPaths();
      renderPagination();
    } catch (err) {
      const carousel = document.querySelector('.paths-carousel');
      if (carousel) carousel.innerHTML = '<div style="padding:2rem;text-align:center;color:red;">Error loading public paths.</div>';
    }
  }

  function renderFilteredPaths() {
    let filtered = allPaths;
    const originVal = originInput ? originInput.value.trim().toLowerCase() : '';
    const destVal = destinationInput ? destinationInput.value.trim().toLowerCase() : '';
    if (originVal) {
      filtered = filtered.filter(p => (p.origin || '').toLowerCase().includes(originVal));
    }
    if (destVal) {
      filtered = filtered.filter(p => (p.end || '').toLowerCase().includes(destVal));
    }
    // Filtro distancia
    const dMin = distanceMin ? parseFloat(distanceMin.value) : 0;
    const dMax = distanceMax ? parseFloat(distanceMax.value) : 150;
    filtered = filtered.filter(p => {
      const dist = parseFloat(p.distance) || 0;
      return dist >= dMin && dist <= dMax;
    });
    // Filtro elevación
    const eMin = elevationMin ? parseFloat(elevationMin.value) : 0;
    const eMax = elevationMax ? parseFloat(elevationMax.value) : 100;
    filtered = filtered.filter(p => {
      const elev = parseFloat(p.elevation_gain) || 0;
      return elev >= eMin && elev <= eMax;
    });
    // Filtro average_velocity
    const vMin = document.getElementById('velocityMin') ? parseFloat(document.getElementById('velocityMin').value) : 0;
    const vMax = document.getElementById('velocityMax') ? parseFloat(document.getElementById('velocityMax').value) : 60;
    filtered = filtered.filter(p => {
      const vel = parseFloat(p.average_velocity) || 0;
      return vel >= vMin && vel <= vMax;
    });
    // Filtro difficulty
    const difficultySel = document.getElementById('difficultyFilter');
    const difficultyVal = difficultySel ? difficultySel.value : '';
    if (difficultyVal) {
      filtered = filtered.filter(p => (p.difficulty || '') === difficultyVal);
    }
    // Filtro status
    const statusSel = document.getElementById('statusFilter');
    const statusVal = statusSel ? statusSel.value : '';
    if (statusVal) {
      filtered = filtered.filter(p => (p.status || '') === statusVal);
    }
    // Filtro duración máxima (hh:mm:ss)
    const durationMaxInput = document.getElementById('durationMax');
    let maxSeconds = 24*3600; // por defecto 24h
    if (durationMaxInput && durationMaxInput.value) {
      const [h, m, s] = durationMaxInput.value.split(':').map(Number);
      maxSeconds = (h||0)*3600 + (m||0)*60 + (s||0);
    }
    filtered = filtered.filter(p => {
      // Asume que p.duration es string tipo 'hh:mm:ss' o 'mm:ss' o 'h:mm:ss'
      if (!p.duration) return true;
      const parts = p.duration.split(':').map(Number);
      let durSec = 0;
      if (parts.length === 3) durSec = parts[0]*3600 + parts[1]*60 + parts[2];
      else if (parts.length === 2) durSec = parts[0]*60 + parts[1];
      else if (parts.length === 1) durSec = parts[0];
      return durSec <= maxSeconds;
    });
    filteredPaths = filtered;
    // Siempre volver a la primera página tras aplicar filtros
    currentPage = 1;
    renderPage(currentPage);
    renderPagination();
  }
  // Average Velocity Range
  const velocityMin = document.getElementById('velocityMin');
  const velocityMax = document.getElementById('velocityMax');
  const velocityMinValue = document.getElementById('velocityMinValue');
  const velocityMaxValue = document.getElementById('velocityMaxValue');

  if (velocityMin && velocityMax) {
    velocityMin.addEventListener('input', () => {
      if (parseInt(velocityMin.value) > parseInt(velocityMax.value)) {
        velocityMin.value = velocityMax.value;
      }
      velocityMinValue.textContent = velocityMin.value + 'km/h';
    });

    velocityMax.addEventListener('input', () => {
      if (parseInt(velocityMax.value) < parseInt(velocityMin.value)) {
        velocityMax.value = velocityMin.value;
      }
      velocityMaxValue.textContent = velocityMax.value + 'km/h';
    });
  }

  let filteredPaths = [];

  function renderPage(page) {
    const carousel = document.querySelector('.paths-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';
    if (!Array.isArray(filteredPaths) || filteredPaths.length === 0) {
      carousel.innerHTML = '<div style="padding:2rem;text-align:center;">No public paths found.</div>';
      return;
    }
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pagePaths = filteredPaths.slice(start, end);
    const savedPathIds = window._savedPathIds || [];
    pagePaths.forEach(path => {
      const card = document.createElement('div');
      card.className = 'path-card';
      card.innerHTML = `
        <div style="position: relative;">
          <button class="save-path-btn" style="position: absolute; top: 10px; right: 10px; background-color: #2ecc40; color: white; border: none; border-radius: 6px; padding: 7px 18px; font-size: 1rem; font-weight: 500; cursor: pointer; box-shadow: 0 2px 8px #0002; transition: background 0.15s, box-shadow 0.15s; z-index: 2;">Save</button>
          <div class="path-image">
            <img src="${path.path_photo ? path.path_photo : '../assets/ejemplo.jpg'}" alt="Imagen de la ruta" />
          </div>
          <div class="path-card-text">
            <div class="path-name">${(path.origin && path.end) ? `${path.origin} - ${path.end}` : (path.name || 'Ruta sin nombre')}</div>
            <div class="path-author">${path.creator_username ? 'Published by ' + path.creator_username : ''}</div>
          </div>
        </div>
      `;
      // Redirigir al hacer click en la tarjeta (excepto botón Save)
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-path-btn')) return;
        window.location.href = `/path-details?id=${encodeURIComponent(path.id)}`;
      });
      const saveBtn = card.querySelector('.save-path-btn');
      // Si ya está guardado, mostrar Saved! y deshabilitar
      if (savedPathIds.includes && savedPathIds.includes(path.id)) {
        saveBtn.textContent = 'Saved!';
        saveBtn.disabled = true;
        saveBtn.style.background = '#43b649';
      } else {
        saveBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const userId = localStorage.getItem('userLoggedIn');
          if (!userId) {
            // Mostrar mensaje visual en discover-message-container
            const container = document.getElementById('discover-message-container');
            if (container) {
              container.innerHTML = '';
              const div = document.createElement('div');
              div.textContent = 'You must be logged in to save routes.';
              div.style.background = '#d21e1e';
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
            return;
          }
          try {
            const res = await fetch('/api/userlikespath', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, path_id: path.id })
            });
            const data = await res.json();
            if (data.success) {
              saveBtn.textContent = 'Saved!';
              saveBtn.disabled = true;
              saveBtn.style.background = '#43b649';
            } else {
              alert(data.error || 'No se pudo guardar la ruta');
            }
          } catch (err) {
            alert('Error al guardar la ruta');
          }
        });
      }
      carousel.appendChild(card);
    });
  }

  function renderPagination() {
    let controls = document.querySelector('.pagination-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'pagination-controls';
      const gallery = document.querySelector('.paths-gallery');
      if (gallery) gallery.appendChild(controls);
    }
    controls.innerHTML = '';
    const totalPages = Math.ceil(filteredPaths.length / PAGE_SIZE);
    if (totalPages <= 1) return;

    // Asegurarse de que los botones prev/next existan y estén en el contenedor de paginación
    // Crear botón prev
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn nav-btn-prev responsive-move';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        renderPagination();
      }
    });
    controls.appendChild(prevBtn);

    // Números de página inteligentes con saltos
    function addPageBtn(i) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'pagination-btn';
      btn.style.margin = '0 0.3rem';
      if (i === currentPage) {
        btn.style.color = 'green';
        btn.style.fontWeight = 'bold';
        btn.disabled = true;
      }
      btn.addEventListener('click', () => {
        currentPage = i;
        renderPage(currentPage);
        renderPagination();
      });
      controls.appendChild(btn);
    }

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) addPageBtn(i);
    } else {
      addPageBtn(1);
      if (currentPage > 3) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.style.margin = '0 0.3rem';
        controls.appendChild(dots);
      }
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage === 1) { start = 2; end = 3; }
      if (currentPage === totalPages) { start = totalPages - 2; end = totalPages - 1; }
      for (let i = start; i <= end; i++) addPageBtn(i);
      if (currentPage < totalPages - 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.style.margin = '0 0.3rem';
        controls.appendChild(dots);
      }
      addPageBtn(totalPages);
    }

    // Crear botón next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn nav-btn-next responsive-move';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        renderPagination();
      }
    });
    controls.appendChild(nextBtn);
  }

  loadPublicPaths();

  // Buscar al hacer click en el botón de búsqueda
  const searchBtn = document.querySelector('.btn-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderFilteredPaths();
    });
  }
  // Filtros: aplicar al hacer click en Apply
  const applyBtn = document.querySelector('.btn-apply');
  if (applyBtn) {
    applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderFilteredPaths();
    });
  }
  // Filters Toggle
  const filtersToggle = document.getElementById('filtersToggle');
  const filtersSidebar = document.getElementById('filtersSidebar');

  if (filtersToggle && filtersSidebar) {
    filtersToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      filtersToggle.classList.toggle('open');
      filtersSidebar.classList.toggle('closed');
    });
  }

  // Distance Range
  const distanceMin = document.getElementById('distanceMin');
  const distanceMax = document.getElementById('distanceMax');
  const distanceMinValue = document.getElementById('distanceMinValue');
  const distanceMaxValue = document.getElementById('distanceMaxValue');

  if (distanceMin && distanceMax) {
    distanceMin.addEventListener('input', () => {
      if (parseInt(distanceMin.value) > parseInt(distanceMax.value)) {
        distanceMin.value = distanceMax.value;
      }
      distanceMinValue.textContent = distanceMin.value + 'km';
    });

    distanceMax.addEventListener('input', () => {
      if (parseInt(distanceMax.value) < parseInt(distanceMin.value)) {
        distanceMax.value = distanceMin.value;
      }
      distanceMaxValue.textContent = distanceMax.value + 'km';
    });
  }

  // Elevation Range
  const elevationMin = document.getElementById('elevationMin');
  const elevationMax = document.getElementById('elevationMax');
  const elevationMinValue = document.getElementById('elevationMinValue');
  const elevationMaxValue = document.getElementById('elevationMaxValue');

  if (elevationMin && elevationMax) {
    elevationMin.addEventListener('input', () => {
      if (parseInt(elevationMin.value) > parseInt(elevationMax.value)) {
        elevationMin.value = elevationMax.value;
      }
      elevationMinValue.textContent = elevationMin.value + 'm';
    });

    elevationMax.addEventListener('input', () => {
      if (parseInt(elevationMax.value) < parseInt(elevationMin.value)) {
        elevationMax.value = elevationMin.value;
      }
      elevationMaxValue.textContent = elevationMax.value + 'm';
    });
  }

  // Carousel Navigation
  const carousel = document.querySelector('.paths-carousel');
  const prevBtn = document.querySelector('.nav-btn-prev');
  const nextBtn = document.querySelector('.nav-btn-next');

  if (prevBtn && nextBtn && carousel) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        renderPagination();
      }
    });

    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(allPaths.length / PAGE_SIZE);
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        renderPagination();
      }
    });
  }
});
