// ratings-view.js - Carga y muestra las valoraciones de la ruta en path-details.html

async function loadRatings(pathId) {
  const ratingsList = document.getElementById('ratings-list');
  ratingsList.innerHTML = '<span>Cargando valoraciones...</span>';
  // Average score container
  let avgScoreElem = document.getElementById('average-score');
  if (!avgScoreElem) {
    const ratingsSection = document.getElementById('ratings-section');
    avgScoreElem = document.createElement('div');
    avgScoreElem.id = 'average-score';
    avgScoreElem.style.cssText = 'text-align:center;font-size:1.15rem;font-weight:600;color:#43b649;margin-bottom:10px;';
    if (ratingsSection) {
      const h2 = ratingsSection.querySelector('h2');
      if (h2 && h2.nextSibling) {
        ratingsSection.insertBefore(avgScoreElem, h2.nextSibling);
      } else {
        ratingsSection.appendChild(avgScoreElem);
      }
    }
  }
  try {
    const res = await fetch(`/api/path/${pathId}/ratings`);
    if (!res.ok) throw new Error('Error al cargar valoraciones');
    const ratings = await res.json();
    if (!ratings.length) {
      ratingsList.innerHTML = '<span>No hay valoraciones aún.</span>';
      if (avgScoreElem) avgScoreElem.textContent = '';
      return;
    }
    // Calcular media
    const validScores = ratings.map(r => Number(r.score)).filter(s => !isNaN(s));
    const avg = validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    if (avgScoreElem) avgScoreElem.textContent = `Average score: ${avg.toFixed(2)} / 5`;
    // Agrupar en filas de 3 columnas
    let html = '';
    for (let i = 0; i < ratings.length; i += 3) {
      html += '<div class="ratings-row">';
      for (let j = i; j < i + 3 && j < ratings.length; j++) {
        const r = ratings[j];
        let score = (r.score !== null && r.score !== undefined && r.score !== '' && !isNaN(Number(r.score))) ? Number(r.score) : '-';
        html += `
          <div class="rating-item">
            <div class="rating-header">
              <span class="rating-user">${r.username ? r.username : 'Usuario'}</span>
              <span class="rating-score">${score} / 5</span>
            </div>
            <div class="rating-desc">${r.description ? r.description : ''}</div>
          </div>
        `;
      }
      html += '</div>';
    }
    ratingsList.innerHTML = html;
  } catch (err) {
    ratingsList.innerHTML = '<span style="color:red">Error al cargar valoraciones.</span>';
  }
}

// Hook para path-details.html
if (window.location.pathname.endsWith('path-details.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const getPathIdFromUrl = window.getPathIdFromUrl || (function() {
      const params = new URLSearchParams(window.location.search);
      return params.get('id');
    });
    const pathId = getPathIdFromUrl();
    if (pathId) loadRatings(pathId);
  });
}
