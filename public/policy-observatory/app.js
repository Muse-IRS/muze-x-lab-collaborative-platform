(() => {
  const statusEl = document.getElementById('pipeline-status');
  const badgeEl = document.getElementById('pipeline-badge');
  const bodyEl = document.getElementById('source-table-body');
  const fgBodyEl = document.getElementById('fg-observation-body');
  const fgBoundaryEl = document.getElementById('fg-boundary');
  const comparisonBodyEl = document.getElementById('fg-comparison-body');
  const comparisonNoteEl = document.getElementById('fg-comparison-note');

  const badgeClass = (status) => {
    if (status === 'SAT' || status === 'OBS') return 'sat';
    if (status === 'REFUTED') return 'unsat';
    return 'unknown';
  };

  const formatInteger = (value) => Number(value).toLocaleString('fr-FR');
  const formatShare = (value, digits = 1) => Number.isFinite(value) ? `${(value * 100).toFixed(digits)} %` : '—';
  const formatDelta = (value) => {
    if (!Number.isFinite(value)) return '—';
    const points = value * 100;
    return `${points > 0 ? '+' : ''}${points.toFixed(1)} pt`;
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

  const renderComparison = (payload) => {
    if (!comparisonBodyEl) return;
    const observations = Array.isArray(payload.observations) ? payload.observations : [];
    const grouped = new Map();

    observations.forEach((row) => {
      const key = `${row.territory_level}:${row.territory_code}`;
      if (!grouped.has(key)) grouped.set(key, {});
      grouped.get(key)[row.marker] = row;
    });

    const rows = [];
    grouped.forEach((pair) => {
      const baseline = pair.baseline;
      const latest = pair.latest;
      if (!baseline || !latest) return;
      rows.push({ baseline, latest });
    });

    if (!rows.length) {
      comparisonBodyEl.innerHTML = '<tr><td colspan="8" class="muted">Comparaison indisponible.</td></tr>';
      return;
    }

    comparisonBodyEl.innerHTML = rows.map(({ baseline, latest }) => {
      const delta = latest.G_share - baseline.G_share;
      return `<tr>` +
        `<td><strong>${latest.territory_name}</strong></td>` +
        `<td>${baseline.period}</td>` +
        `<td>${formatShare(baseline.G_share)}</td>` +
        `<td>${latest.period}</td>` +
        `<td>${formatInteger(latest.F)}</td>` +
        `<td>${formatInteger(latest.G)}</td>` +
        `<td>${formatShare(latest.G_share)}</td>` +
        `<td>${formatDelta(delta)}</td>` +
      `</tr>`;
    }).join('');

    if (comparisonNoteEl) {
      const sourceLink = payload.source_url
        ? ` <a class="inline" href="${payload.source_url}" target="_blank" rel="noopener noreferrer">Source DARES / France Travail</a>.`
        : '';
      comparisonNoteEl.innerHTML = `${payload.method_note || 'Écart descriptif uniquement.'}${sourceLink}`;
    }
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
      return `<tr><td>${row.period}</td><td>${territory}</td><td>${formatInteger(row.F)}</td><td>${formatInteger(row.G)}</td><td>${formatInteger(row.FG)}</td><td>${formatShare(row.G_share)}</td><td>${source}</td></tr>`;
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
    }),
    fetch('./data/france_travail_fg_public_min.json', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
  ])
    .then(([statusPayload, fgPayload, comparisonPayload]) => {
      renderSources(statusPayload);
      renderFG(fgPayload);
      renderComparison(comparisonPayload);
    })
    .catch(() => {
      statusEl.textContent = 'État des sources indisponible. Aucun résultat n’est déduit de cette absence.';
      badgeEl.textContent = 'UNKNOWN';
      badgeEl.className = 'status-badge unknown';
      bodyEl.innerHTML = '<tr><td colspan="4" class="muted">Impossible de charger le registre public.</td></tr>';
      if (fgBodyEl) fgBodyEl.innerHTML = '<tr><td colspan="7" class="muted">Observations indisponibles.</td></tr>';
      if (comparisonBodyEl) comparisonBodyEl.innerHTML = '<tr><td colspan="8" class="muted">Comparaison indisponible.</td></tr>';
    });
})();
