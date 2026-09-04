(() => {
  const statusEl = document.getElementById('pipeline-status');
  const badgeEl = document.getElementById('pipeline-badge');
  const bodyEl = document.getElementById('source-table-body');
  const fgBodyEl = document.getElementById('fg-observation-body');
  const fgBoundaryEl = document.getElementById('fg-boundary');

  const badgeClass = (status) => {
    if (status === 'SAT' || status === 'OBS') return 'sat';
    if (status === 'REFUTED') return 'unsat';
    return 'unknown';
  };

  const renderSources = (payload) => {
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

  const renderFG = (payload) => {
    const observations = Array.isArray(payload.observations) ? payload.observations : [];
    const territory = payload.territory?.name || 'Territoire';

    if (!fgBodyEl) return;
    if (!observations.length) {
      fgBodyEl.innerHTML = '<tr><td colspan="7" class="muted">Aucune observation agrégée publiée.</td></tr>';
      return;
    }

    fgBodyEl.innerHTML = observations.map((row) => {
      const source = row.source_url
        ? `<a class="inline" href="${row.source_url}" target="_blank" rel="noopener noreferrer">source officielle</a>`
        : 'source';
      const share = Number.isFinite(row.G_share) ? `${(row.G_share * 100).toFixed(1)} %` : '—';
      return `<tr><td>${row.period}</td><td>${territory}</td><td>${row.F}</td><td>${row.G}</td><td>${row.FG}</td><td>${share}</td><td>${source}</td></tr>`;
    }).join('');

    if (fgBoundaryEl && payload.interpretation_boundary) {
      fgBoundaryEl.textContent = payload.interpretation_boundary;
    }
  };

  Promise.all([
    fetch('./data/status.json', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }),
    fetch('./data/fg-observations.json', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
  ])
    .then(([statusPayload, fgPayload]) => {
      renderSources(statusPayload);
      renderFG(fgPayload);
    })
    .catch(() => {
      statusEl.textContent = 'État des sources indisponible. Aucun résultat n’est déduit de cette absence.';
      badgeEl.textContent = 'UNKNOWN';
      badgeEl.className = 'status-badge unknown';
      bodyEl.innerHTML = '<tr><td colspan="4" class="muted">Impossible de charger le registre public.</td></tr>';
      if (fgBodyEl) fgBodyEl.innerHTML = '<tr><td colspan="7" class="muted">Observations indisponibles.</td></tr>';
    });
})();
