(() => {
  const statusEl = document.getElementById('pipeline-status');
  const badgeEl = document.getElementById('pipeline-badge');
  const bodyEl = document.getElementById('source-table-body');

  const badgeClass = (status) => {
    if (status === 'SAT' || status === 'OBS') return 'sat';
    if (status === 'REFUTED') return 'unsat';
    return 'unknown';
  };

  const render = (payload) => {
    const sources = Array.isArray(payload.sources) ? payload.sources : [];
    const observed = sources.filter((source) => source.status === 'OBS').length;
    statusEl.textContent = `${observed}/${sources.length} familles de sources publiques sont actuellement qualifiées OBS. Dernière observation : ${payload.observed_at || 'non renseignée'}.`;
    badgeEl.textContent = payload.status || 'UNKNOWN';
    badgeEl.className = `status-badge ${badgeClass(payload.status)}`;

    if (!sources.length) {
      bodyEl.innerHTML = '<tr><td colspan="4" class="muted">Aucune source publiée pour le moment.</td></tr>';
      return;
    }

    bodyEl.innerHTML = sources.map((source) => {
      const label = source.url
        ? `<a class="inline" href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label}</a>`
        : source.label;
      return `<tr><td>${label}</td><td>${source.frequency}</td><td>${source.scope}</td><td><span class="status-badge ${badgeClass(source.status)}">${source.status}</span></td></tr>`;
    }).join('');
  };

  fetch('./data/status.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(render)
    .catch(() => {
      statusEl.textContent = 'État des sources indisponible. Aucun résultat n’est déduit de cette absence.';
      badgeEl.textContent = 'UNKNOWN';
      badgeEl.className = 'status-badge unknown';
      bodyEl.innerHTML = '<tr><td colspan="4" class="muted">Impossible de charger le registre public.</td></tr>';
    });
})();
