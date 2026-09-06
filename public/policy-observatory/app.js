(() => {
  const statusEl = document.getElementById('pipeline-status');
  const badgeEl = document.getElementById('pipeline-badge');
  const bodyEl = document.getElementById('source-table-body');
  const referenceMetricsEl = document.getElementById('reference-metrics');
  const relationAuditBodyEl = document.getElementById('relation-audit-body');
  const relationAuditNoteEl = document.getElementById('relation-audit-note');
  const allCategoryGridEl = document.getElementById('all-category-grid');
  const allCategoryMetaEl = document.getElementById('all-category-meta');
  const auditSummaryEl = document.getElementById('audit-summary');
  const auditBodyEl = document.getElementById('calculation-audit-body');
  const auditNoteEl = document.getElementById('calculation-audit-note');
  const fgBodyEl = document.getElementById('fg-observation-body');
  const fgBoundaryEl = document.getElementById('fg-boundary');
  const comparisonBodyEl = document.getElementById('fg-comparison-body');
  const comparisonNoteEl = document.getElementById('fg-comparison-note');

  const badgeClass = (status) => {
    if (status === 'SAT' || status === 'OBS' || status === 'CONVERGENCE') return 'sat';
    if (status === 'REFUTED' || status === 'DIVERGENCE') return 'unsat';
    return 'unknown';
  };

  const formatInteger = (value) => Number(value).toLocaleString('fr-FR');
  const formatApproxInteger = (value) => Number.isFinite(Number(value)) ? `≈ ${formatInteger(Number(value))}` : '—';
  const formatSignedInteger = (value) => {
    if (!Number.isFinite(value)) return '—';
    if (value === 0) return '0';
    return `${value > 0 ? '+' : '−'}${formatInteger(Math.abs(value))}`;
  };
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

  const renderInterinstitutional = (referencePayload, categoryPayload) => {
    if (!referenceMetricsEl || !relationAuditBodyEl) return;

    const populationFrance = Number(referencePayload.population?.france?.value);
    const populationHorsMayotte = Number(referencePayload.population?.france_hors_mayotte?.value);
    const cafAllocataires = Number(referencePayload.caf?.allocataires_approx);
    const cafCovered = Number(referencePayload.caf?.persons_covered_approx);
    const periods = Array.isArray(categoryPayload.periods) ? categoryPayload.periods : [];
    const latest = periods[periods.length - 1];
    const ftABCDE = Number(latest?.institutional?.ABCDE);
    const ftF = Number(latest?.categories?.F);
    const ftG = Number(latest?.categories?.G);
    const ftFG = Number.isFinite(ftF) && Number.isFinite(ftG) ? ftF + ftG : NaN;

    referenceMetricsEl.innerHTML =
      `<article class="metric"><span>Population France · INSEE</span><strong>${Number.isFinite(populationFrance) ? formatInteger(populationFrance) : '—'}</strong><p class="muted">1er janvier 2026 · donnée provisoire.</p></article>` +
      `<article class="metric"><span>CAF · allocataires</span><strong>${formatApproxInteger(cafAllocataires)}</strong><p class="muted">Foyers / dossiers · publication de référence 31/03/2025.</p></article>` +
      `<article class="metric"><span>CAF · personnes couvertes</span><strong>${formatApproxInteger(cafCovered)}</strong><p class="muted">Personnes · valeur institutionnelle approximative.</p></article>` +
      `<article class="metric"><span>France Travail · A à E</span><strong>${Number.isFinite(ftABCDE) ? formatInteger(ftABCDE) : '—'}</strong><p class="muted">${latest?.period || 'période non renseignée'} · France hors Mayotte.</p></article>` +
      `<article class="metric"><span>France Travail · F + G</span><strong>${Number.isFinite(ftFG) ? formatInteger(ftFG) : '—'}</strong><p class="muted">${latest?.period || 'période non renseignée'} · lentille distincte.</p></article>`;

    const rows = [
      {
        relation: 'CAF personnes couvertes / population France',
        numerator: Number.isFinite(cafCovered) ? formatApproxInteger(cafCovered) : '—',
        denominator: Number.isFinite(populationFrance) ? formatInteger(populationFrance) : '—',
        result: Number.isFinite(cafCovered) && Number.isFinite(populationFrance) ? `≈ ${formatShare(cafCovered / populationFrance)}` : '—',
        qualification: 'DESCRIPTIF',
        reading: 'Même unité (personnes), mais valeur CAF approximative et temporalité différente.'
      },
      {
        relation: 'CAF allocataires / population France',
        numerator: Number.isFinite(cafAllocataires) ? formatApproxInteger(cafAllocataires) : '—',
        denominator: Number.isFinite(populationFrance) ? formatInteger(populationFrance) : '—',
        result: '—',
        qualification: 'NON COMPARABLE',
        reading: 'Allocataire = foyer / dossier ; population INSEE = personnes.'
      },
      {
        relation: 'France Travail A-E / population France hors Mayotte',
        numerator: Number.isFinite(ftABCDE) ? formatInteger(ftABCDE) : '—',
        denominator: Number.isFinite(populationHorsMayotte) ? formatInteger(populationHorsMayotte) : '—',
        result: Number.isFinite(ftABCDE) && Number.isFinite(populationHorsMayotte) ? formatShare(ftABCDE / populationHorsMayotte) : '—',
        qualification: 'DESCRIPTIF',
        reading: 'Part de population de référence uniquement ; ce n’est pas un taux de chômage.'
      },
      {
        relation: 'France Travail F+G / population France hors Mayotte',
        numerator: Number.isFinite(ftFG) ? formatInteger(ftFG) : '—',
        denominator: Number.isFinite(populationHorsMayotte) ? formatInteger(populationHorsMayotte) : '—',
        result: Number.isFinite(ftFG) && Number.isFinite(populationHorsMayotte) ? formatShare(ftFG / populationHorsMayotte) : '—',
        qualification: 'DESCRIPTIF',
        reading: 'Ordre de grandeur descriptif ; aucune équivalence automatique avec RSA ou orientation globale.'
      },
      {
        relation: 'CAF personnes couvertes ↔ France Travail A-E',
        numerator: Number.isFinite(cafCovered) ? formatApproxInteger(cafCovered) : '—',
        denominator: Number.isFinite(ftABCDE) ? formatInteger(ftABCDE) : '—',
        result: '—',
        qualification: 'NON COMPARABLE',
        reading: 'Univers statistiques différents et potentiellement recouvrants ; pas de taux de passage déduit.'
      }
    ];

    relationAuditBodyEl.innerHTML = rows.map((row) =>
      `<tr>` +
        `<td><strong>${row.relation}</strong></td>` +
        `<td>${row.numerator}</td>` +
        `<td>${row.denominator}</td>` +
        `<td>${row.result}</td>` +
        `<td><span class="status-badge ${badgeClass(row.qualification)}">${row.qualification}</span></td>` +
        `<td>${row.reading}</td>` +
      `</tr>`
    ).join('');

    if (relationAuditNoteEl) {
      const inseeUrl = referencePayload.population?.france?.source_url;
      const cafUrl = referencePayload.caf?.source_url;
      const ftUrl = categoryPayload.source_url;
      relationAuditNoteEl.innerHTML =
        `CALCULABLE ≠ COMPARABLE. ` +
        `${inseeUrl ? `<a class="inline" href="${inseeUrl}" target="_blank" rel="noopener noreferrer">INSEE</a>` : 'INSEE'} · ` +
        `${cafUrl ? `<a class="inline" href="${cafUrl}" target="_blank" rel="noopener noreferrer">CAF / Cafdata</a>` : 'CAF / Cafdata'} · ` +
        `${ftUrl ? `<a class="inline" href="${ftUrl}" target="_blank" rel="noopener noreferrer">DARES / France Travail</a>` : 'DARES / France Travail'}. ` +
        `Les ratios DESCRIPTIF servent à situer un ordre de grandeur ; ils ne remplacent pas les indicateurs institutionnels.`;
    }
  };

  const renderAllCategories = (payload) => {
    if (!allCategoryGridEl) return;
    const periods = Array.isArray(payload.periods) ? payload.periods : [];
    const definitions = Array.isArray(payload.category_definitions) ? payload.category_definitions : [];
    const latest = periods[periods.length - 1];

    if (!latest || !latest.categories || !definitions.length) {
      allCategoryGridEl.innerHTML = '<article class="metric"><span>Catégories</span><strong>—</strong><p class="muted">Données indisponibles.</p></article>';
      return;
    }

    allCategoryGridEl.innerHTML = definitions.map((definition) => {
      const value = latest.categories[definition.id];
      return `<article class="metric">` +
        `<span>Catégorie ${definition.id}</span>` +
        `<strong>${Number.isFinite(value) ? formatInteger(value) : '—'}</strong>` +
        `<p class="muted">${definition.label}</p>` +
      `</article>`;
    }).join('');

    if (allCategoryMetaEl) {
      const sourceLink = payload.source_url
        ? `<a class="inline" href="${payload.source_url}" target="_blank" rel="noopener noreferrer">DARES / France Travail</a>`
        : 'DARES / France Travail';
      allCategoryMetaEl.innerHTML = `${payload.territory?.name || 'Territoire'} · ${latest.period} · source : ${sourceLink}. F et G restent identifiées comme données brutes non CVS-CJO.`;
    }
  };

  const renderCalculationAudit = (payload) => {
    if (!auditBodyEl) return;
    const periods = Array.isArray(payload.periods) ? payload.periods : [];
    const calculations = Array.isArray(payload.calculations) ? payload.calculations : [];
    const rows = [];

    [...periods].reverse().forEach((period) => {
      calculations.forEach((calculation) => {
        const components = calculation.components || [];
        const values = components.map((id) => Number(period.categories?.[id]));
        const comparable = values.every(Number.isFinite) && Number.isFinite(Number(period.institutional?.[calculation.institutional_key]));

        if (!comparable) {
          rows.push({ period, calculation, recalculated: NaN, institutional: NaN, delta: NaN, qualification: 'INDETERMINATION', values });
          return;
        }

        const recalculated = values.reduce((sum, value) => sum + value, 0);
        const institutional = Number(period.institutional[calculation.institutional_key]);
        const delta = recalculated - institutional;
        const qualification = delta === 0 ? 'CONVERGENCE' : 'DIVERGENCE';
        rows.push({ period, calculation, recalculated, institutional, delta, qualification, values });
      });
    });

    if (!rows.length) {
      auditBodyEl.innerHTML = '<tr><td colspan="6" class="muted">Aucun contrôle recalculable.</td></tr>';
      return;
    }

    auditBodyEl.innerHTML = rows.map((row) => {
      const componentValues = row.values.every(Number.isFinite)
        ? row.values.map(formatInteger).join(' + ')
        : 'base non comparable';
      return `<tr>` +
        `<td><strong>${row.period.period}</strong></td>` +
        `<td><strong>${row.calculation.label}</strong><br><span class="muted">${componentValues}</span></td>` +
        `<td>${Number.isFinite(row.institutional) ? formatInteger(row.institutional) : '—'}</td>` +
        `<td>${Number.isFinite(row.recalculated) ? formatInteger(row.recalculated) : '—'}</td>` +
        `<td>${formatSignedInteger(row.delta)}</td>` +
        `<td><span class="status-badge ${badgeClass(row.qualification)}">${row.qualification}</span></td>` +
      `</tr>`;
    }).join('');

    if (auditSummaryEl) {
      const convergence = rows.filter((row) => row.qualification === 'CONVERGENCE').length;
      const divergence = rows.filter((row) => row.qualification === 'DIVERGENCE').length;
      const indetermination = rows.filter((row) => row.qualification === 'INDETERMINATION').length;
      auditSummaryEl.innerHTML =
        `<article class="metric"><span>Contrôles</span><strong>${rows.length}</strong><p class="muted">Agrégats institutionnels recomposés.</p></article>` +
        `<article class="metric"><span>Convergences exactes</span><strong>${convergence}</strong><p class="muted">Δ = 0 sur les valeurs affichées.</p></article>` +
        `<article class="metric"><span>Divergences</span><strong>${divergence}</strong><p class="muted">Δ numérique non nul ; cause ouverte.</p></article>` +
        (indetermination ? `<article class="metric"><span>Indéterminations</span><strong>${indetermination}</strong><p class="muted">Comparabilité non établie.</p></article>` : '');
    }

    if (auditNoteEl) {
      const sourceLink = payload.source_url
        ? ` <a class="inline" href="${payload.source_url}" target="_blank" rel="noopener noreferrer">Source DARES / France Travail</a>.`
        : '';
      auditNoteEl.innerHTML = `${payload.interpretation_boundary || 'La qualification reste descriptive.'}${sourceLink}`;
    }
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
    }),
    fetch('./data/france_travail_categories_public.json', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }),
    fetch('./data/interinstitutional_reference_public.json', { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
  ])
    .then(([statusPayload, fgPayload, comparisonPayload, categoryPayload, referencePayload]) => {
      renderSources(statusPayload);
      renderInterinstitutional(referencePayload, categoryPayload);
      renderAllCategories(categoryPayload);
      renderCalculationAudit(categoryPayload);
      renderFG(fgPayload);
      renderComparison(comparisonPayload);
    })
    .catch(() => {
      statusEl.textContent = 'État des sources indisponible. Aucun résultat n’est déduit de cette absence.';
      badgeEl.textContent = 'UNKNOWN';
      badgeEl.className = 'status-badge unknown';
      bodyEl.innerHTML = '<tr><td colspan="4" class="muted">Impossible de charger le registre public.</td></tr>';
      if (referenceMetricsEl) referenceMetricsEl.innerHTML = '<article class="metric"><span>Référentiels</span><strong>—</strong><p class="muted">Données indisponibles.</p></article>';
      if (relationAuditBodyEl) relationAuditBodyEl.innerHTML = '<tr><td colspan="6" class="muted">Relations indisponibles.</td></tr>';
      if (allCategoryGridEl) allCategoryGridEl.innerHTML = '<article class="metric"><span>Catégories</span><strong>—</strong><p class="muted">Données indisponibles.</p></article>';
      if (auditBodyEl) auditBodyEl.innerHTML = '<tr><td colspan="6" class="muted">Contrôle indisponible.</td></tr>';
      if (fgBodyEl) fgBodyEl.innerHTML = '<tr><td colspan="7" class="muted">Observations indisponibles.</td></tr>';
      if (comparisonBodyEl) comparisonBodyEl.innerHTML = '<tr><td colspan="8" class="muted">Comparaison indisponible.</td></tr>';
    });
})();
