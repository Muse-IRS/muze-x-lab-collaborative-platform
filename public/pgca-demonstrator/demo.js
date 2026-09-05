(() => {
  'use strict';

  const root = document.querySelector('[data-pgca-demo]');
  if (!root) return;

  const nodes = [...root.querySelectorAll('[data-node]')];
  const historyList = root.querySelector('[data-history]');
  const live = root.querySelector('[data-live]');
  const firstDivergence = root.querySelector('[data-first-divergence]');
  const expected = root.querySelector('[data-expected]');
  const observed = root.querySelector('[data-observed]');
  const globalState = root.querySelector('[data-global-state]');
  const newVersionButton = root.querySelector('[data-action="new-version"]');
  const propagateButton = root.querySelector('[data-action="propagate"]');
  const alternateButton = root.querySelector('[data-action="alternate"]');
  const resetButton = root.querySelector('[data-action="reset"]');

  const labels = ['Référentiel source', 'Système territorial', 'Interface utilisateur'];
  let state;

  function resetState() {
    state = {
      values: ['X', 'X', 'X'],
      versions: [1, 1, 1],
      alternate: false,
      history: ['t0 · X · v1 · chaîne convergente']
    };
    render('État initial restauré.');
  }

  function divergenceIndex() {
    const targetValue = state.values[0];
    const targetVersion = state.versions[0];
    for (let i = 1; i < state.values.length; i += 1) {
      if (state.values[i] !== targetValue || state.versions[i] !== targetVersion) return i;
    }
    return -1;
  }

  function render(message) {
    const targetValue = state.values[0];
    const targetVersion = state.versions[0];
    const divergent = divergenceIndex();

    nodes.forEach((node, index) => {
      node.querySelector('[data-value]').textContent = `Référent ${state.values[index]}`;
      node.querySelector('[data-version]').textContent = `Version v${state.versions[index]}`;
      const isConvergent = state.values[index] === targetValue && state.versions[index] === targetVersion;
      node.classList.toggle('is-convergent', isConvergent);
      node.classList.toggle('is-divergent', !isConvergent);
      node.querySelector('[data-status]').textContent = isConvergent ? 'CONVERGENT' : 'À VÉRIFIER';
    });

    if (divergent === -1) {
      globalState.textContent = 'CONVERGENT';
      firstDivergence.textContent = 'Aucune';
      expected.textContent = `Référent ${targetValue} · v${targetVersion}`;
      observed.textContent = `Référent ${targetValue} · v${targetVersion}`;
    } else {
      globalState.textContent = 'À VÉRIFIER';
      firstDivergence.textContent = `${labels[divergent - 1]} → ${labels[divergent]}`;
      expected.textContent = `Référent ${targetValue} · v${targetVersion}`;
      observed.textContent = `Référent ${state.values[divergent]} · v${state.versions[divergent]}`;
    }

    historyList.innerHTML = '';
    state.history.slice(-6).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      historyList.appendChild(li);
    });

    live.textContent = message;
    propagateButton.disabled = divergent === -1;
  }

  function createNewVersion() {
    if (state.values[0] === 'Y' && state.versions[0] >= 2) {
      render('La source est déjà en version v2. Utiliser Propager ou Réinitialiser.');
      return;
    }
    state.values[0] = 'Y';
    state.versions[0] = 2;
    state.history.push('t1 · source · Y · v2 créée');
    render('Nouvelle version créée à la source. La première divergence est maintenant visible.');
  }

  function propagate() {
    const divergent = divergenceIndex();
    if (divergent === -1) {
      render('La chaîne est déjà convergente.');
      return;
    }
    state.values[divergent] = state.values[0];
    state.versions[divergent] = state.versions[0];
    state.history.push(`t${state.history.length} · ${labels[divergent]} · ${state.values[0]} · v${state.versions[0]}`);
    render(divergenceIndex() === -1 ? 'Propagation terminée : la chaîne est convergente.' : 'Propagation effectuée : la frontière suivante devient observable.');
  }

  function alternateBreak() {
    state.values = ['Y', 'X', 'Y'];
    state.versions = [2, 1, 2];
    state.alternate = true;
    state.history.push(`t${state.history.length} · scénario alternatif · interface à jour, strate intermédiaire obsolète`);
    render('Scénario alternatif chargé : l’interface finale paraît correcte, mais la strate intermédiaire reste obsolète.');
  }

  newVersionButton.addEventListener('click', createNewVersion);
  propagateButton.addEventListener('click', propagate);
  alternateButton.addEventListener('click', alternateBreak);
  resetButton.addEventListener('click', resetState);

  resetState();
})();
