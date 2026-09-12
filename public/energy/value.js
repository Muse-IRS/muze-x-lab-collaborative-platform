function mountValueFlowUi() {
  if (document.querySelector('#flux-valeur')) return

  if (!document.querySelector('link[href="./value.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = './value.css'
    document.head.appendChild(link)
  }

  const nav = document.querySelector('.energy-local-nav')
  if (nav && !nav.querySelector('a[href="#flux-valeur"]')) {
    const anchor = document.createElement('a')
    anchor.href = '#flux-valeur'
    anchor.textContent = 'Flux de valeur'
    const limitsLink = nav.querySelector('a[href="#limites"]')
    nav.insertBefore(anchor, limitsLink || null)
  }

  const limits = document.querySelector('#limites')
  if (!limits) return

  const section = document.createElement('section')
  section.id = 'flux-valeur'
  section.className = 'panel value-anchor'
  section.setAttribute('aria-labelledby', 'value-title')
  section.innerHTML = `
    <p class="eyebrow">10 · Qui investit, qui possède, qui paie, où reste la valeur ?</p>
    <h2 id="value-title">Fermer le modèle énergétique par un registre des flux institutionnels.</h2>
    <p>Le coût complet ne suffit pas. Deux architectures techniquement identiques peuvent distribuer la valeur de manière très différente selon le financement, la propriété, le mode de gestion et le tarif. Cette couche sépare donc <strong>coût économique</strong>, <strong>flux de trésorerie</strong>, <strong>propriété de l’actif</strong> et <strong>bénéfice macroéconomique</strong>.</p>

    <div class="value-facts">
      <article><strong>EDF · État 100 %</strong><span>EDF indique que l’État détient l’intégralité du capital et des droits de vote. Un flux vers EDF reste toutefois un flux d’entreprise publique, pas automatiquement une recette du budget de l’État.</span></article>
      <article><strong>Régie possible</strong><span>Une collectivité peut gérer directement un service public local avec ses propres moyens.</span></article>
      <article><strong>DSP / concession possible</strong><span>La gestion peut être confiée à un tiers ; le risque d’exploitation et les modalités de financement dépendent alors du contrat.</span></article>
      <article><strong>Compétence chaleur</strong><span>La distribution publique de chaleur relève des collectivités territoriales, avec plusieurs modes de gestion possibles.</span></article>
    </div>

    <div class="territory-source-note">
      <p><strong>Le modèle économique précédent fournit :</strong> CAPEX, annuité de capital, OPEX, pompage, coût d’opportunité électrique, énergie utile servie et comparaison gaz.</p>
      <p><strong>Cette couche ajoute :</strong> qui finance le capital, qui exploite, qui détient l’actif dans le scénario, combien paient les usagers et quels flux reviennent à des entités publiques ou privées.</p>
      <p><strong>Ne pas confondre :</strong> valeur conservée dans l’économie française, revenu d’EDF, recette d’une collectivité et recette budgétaire de l’État sont quatre grandeurs différentes.</p>
    </div>

    <div class="value-presets" aria-label="Scénarios institutionnels illustratifs">
      <button type="button" class="button secondary" data-value-preset="regie">Tester une régie publique</button>
      <button type="button" class="button secondary" data-value-preset="concession">Tester une concession</button>
      <button type="button" class="button secondary" data-value-preset="mixed">Tester un financement mixte</button>
    </div>

    <div class="value-controls">
      <div class="energy-field"><label for="value-tariff">Tarif chaleur payé par l’usager (€/MWh utile)</label><input id="value-tariff" type="number" min="0" step="1" value="113"></div>
      <div class="energy-field"><label for="value-state-share">Part CAPEX État / EDF (%)</label><input id="value-state-share" type="number" min="0" max="100" step="1" value="0"></div>
      <div class="energy-field"><label for="value-local-share">Part CAPEX public local (%)</label><input id="value-local-share" type="number" min="0" max="100" step="1" value="100"></div>
      <div class="energy-field"><label for="value-private-share">Part CAPEX opérateur / privé (%)</label><input id="value-private-share" type="number" min="0" max="100" step="1" value="0"></div>
      <div class="energy-field"><label for="value-management">Gestion d’exploitation</label><select id="value-management"><option value="public">Régie / opérateur public</option><option value="delegated">Opérateur délégué</option></select></div>
      <div class="energy-field"><label for="value-owner">Propriété de l’actif dans le scénario</label><select id="value-owner"><option value="local-public">Collectivité / groupement public</option><option value="concession">Actif de concession selon convention</option><option value="mixed">Société / structure mixte</option><option value="other">Autre montage</option></select></div>
      <div class="energy-field"><label for="value-public-fee">Redevance publique sur recettes (%)</label><input id="value-public-fee" type="number" min="0" max="100" step="0.1" value="0"></div>
      <div class="energy-field"><label for="value-external-gas-share">Part du coût gaz considérée externe/importée (%)</label><input id="value-external-gas-share" type="number" min="0" max="100" step="1" value="0"></div>
    </div>

    <div class="value-formula" aria-label="Équation des flux de valeur">
      <span>facture usagers</span><span>→</span><span>coût du service</span><span>→</span><span>financeurs + exploitant + source</span><span>+</span><strong>combustible fossile déplacé</strong>
    </div>

    <div class="energy-actions"><button id="run-value" type="button">Calculer les flux de valeur</button></div>
    <p id="value-status" class="economics-status" role="status" aria-live="polite">Le calcul attend le dernier coût complet valide.</p>

    <div class="value-results">
      <div class="metric"><span>CAPEX État / EDF</span><strong id="value-state-capex">—</strong><small>Part initiale du financement saisie.</small></div>
      <div class="metric"><span>CAPEX public local</span><strong id="value-local-capex">—</strong><small>Part initiale du financement saisie.</small></div>
      <div class="metric"><span>CAPEX opérateur / privé</span><strong id="value-private-capex">—</strong><small>Part initiale du financement saisie.</small></div>
      <div class="metric"><span>Facture chaleur annuelle</span><strong id="value-user-bill">—</strong><small>Tarif × chaleur utile servie.</small></div>
      <div class="metric"><span>Coût annuel du système</span><strong id="value-system-cost">—</strong><small>Annuité + OPEX + pompage + opportunité électrique.</small></div>
      <div class="metric"><span>Solde avant soutien</span><strong id="value-balance">—</strong><small>Recettes tarifaires − coût − redevance.</small></div>
      <div class="metric"><span>Soutien annuel requis</span><strong id="value-support">—</strong><small>Écart à financer si le tarif ne couvre pas le modèle.</small></div>
      <div class="metric"><span>Écart usager vs gaz</span><strong id="value-user-delta">—</strong><small>Coût gaz de référence − facture chaleur.</small></div>
      <div class="metric"><span>Flux annuels vers périmètre public</span><strong id="value-public-flow">—</strong><small>Somme comptable de flux modélisés, pas un bénéfice public net.</small></div>
      <div class="metric"><span>Flux annuels vers opérateur privé</span><strong id="value-private-flow">—</strong><small>Capital + exploitation selon le scénario.</small></div>
      <div class="metric"><span>Coût fossile externe déplacé</span><strong id="value-external-avoided">—</strong><small>Nul par défaut tant que la part importée n’est pas documentée.</small></div>
      <div class="metric"><span>Propriété retenue</span><strong id="value-owner-result">—</strong><small>Étiquette institutionnelle, sans effet automatique sur les coûts.</small></div>
    </div>

    <h3>Lecture des flux — ne pas les additionner comme s’ils étaient tous du profit</h3>
    <div class="value-flow" aria-label="Chaîne institutionnelle du scénario">
      <article><strong>Financeurs</strong><span id="value-flow-finance">—</span></article>
      <article><strong>Actif réseau</strong><span id="value-flow-owner">—</span></article>
      <article><strong>Exploitant</strong><span id="value-flow-operator">—</span></article>
      <article><strong>Abonnés</strong><span id="value-flow-users">—</span></article>
      <article><strong>Économie nationale</strong><span id="value-flow-national">—</span></article>
    </div>

    <div class="value-ledger">
      <article><strong id="value-ledger-source">—</strong><span>valeur annuelle attribuée à la source EDF selon le coût d’opportunité déjà modélisé</span></article>
      <article><strong id="value-ledger-local">—</strong><span>flux annuels vers capital public local + exploitation publique + redevance</span></article>
      <article><strong id="value-ledger-private">—</strong><span>flux annuels vers capital privé + exploitation déléguée</span></article>
      <article><strong id="value-ledger-unallocated">—</strong><span>excédent tarifaire non affecté par le modèle contractuel</span></article>
    </div>

    <div class="callout">
      <p><strong>Conclusion institutionnelle :</strong> le même réseau physique peut produire des répartitions très différentes. Une économie d’importation n’est pas automatiquement une recette de l’État ; un revenu d’EDF n’est pas automatiquement une recette budgétaire ; une concession n’efface pas nécessairement la propriété ou le contrôle public ; et une régie n’annule pas le coût du capital. Le modèle oblige à nommer chaque flux avant de conclure « qui gagne ».</p>
    </div>

    <details class="territory-sources value-source-list">
      <summary>Sources institutionnelles</summary>
      <ul>
        <li><a href="https://www.edf.fr/groupe-edf/espaces-dedies/investisseurs/statuts-d-edf" target="_blank" rel="noopener noreferrer">EDF — statuts et contrôle du capital</a> : l’État détient l’intégralité du capital et des droits de vote d’EDF.</li>
        <li><a href="https://www.collectivites-locales.gouv.fr/animer-les-territoires/commande-publique/les-concessions-et-delegations-de-service-public/les-autres-modes-de-gestion-des-services-publics-locaux" target="_blank" rel="noopener noreferrer">Collectivités Locales — modes de gestion des services publics locaux</a> : gestion directe ou gestion déléguée, avec répartition contractuelle du risque et du financement.</li>
        <li><a href="https://www.collectivites-locales.gouv.fr/animer-les-territoires/commande-publique/les-concessions-et-delegations-de-service-public/les-contrats-de-concessions-et-les-delegations-de-service-public" target="_blank" rel="noopener noreferrer">Collectivités Locales — concessions et DSP</a> : cadre juridique des concessions de services publics.</li>
        <li><a href="https://reseaux-chaleur.cerema.fr/sites/reseaux-chaleur-v2/files/fichiers/2022/02/IGD_Indicateurs_Reseau_chaleur.pdf" target="_blank" rel="noopener noreferrer">Cerema — indicateurs des réseaux de chaleur et de froid</a> : distribution publique de chaleur, régie, délégation et sous-stations.</li>
      </ul>
    </details>
  `

  limits.parentNode.insertBefore(section, limits)

  const limitsEyebrow = limits.querySelector('.eyebrow')
  if (limitsEyebrow) limitsEyebrow.textContent = '11 · Ce que le modèle ne prouve pas'

  const nextTitle = document.querySelector('#next-title')
  if (nextTitle) {
    nextTitle.textContent = 'Chaîne fermée : remplacer maintenant les hypothèses par des preuves.'
    const paragraph = nextTitle.nextElementSibling
    if (paragraph) paragraph.innerHTML = 'Le modèle public relie désormais <strong>usage → territoire → corridor → hydraulique → coût complet → flux institutionnels</strong>. La suite n’est plus d’ajouter une nouvelle équation mais de remplacer, une à une, les hypothèses par des données opposables : profils thermiques mesurés, devis, emprises, contrats, mode de gestion, financement, tarification et règles réelles de soutirage.'
  }
}

mountValueFlowUi()

const valueNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const valueInputs = [...document.querySelectorAll('#flux-valeur input, #flux-valeur select')]
const valueStatus = document.querySelector('#value-status')
const BEZNAU_RATIO_VALUE_LAYER = 10 / 80

function valueNumeric(selector) {
  const value = Number(document.querySelector(selector)?.value)
  return Number.isFinite(value) ? value : null
}

function valueMEur(value) {
  return `${valueNumber.format(value)} M€`
}

function valueSignedMEur(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${valueNumber.format(value)} M€`
}

function ownerLabel(value) {
  return {
    'local-public': 'Collectivité / groupement public',
    concession: 'Actif de concession selon convention',
    mixed: 'Structure mixte',
    other: 'Autre montage'
  }[value] || value
}

function applyValuePreset(name) {
  const state = document.querySelector('#value-state-share')
  const local = document.querySelector('#value-local-share')
  const privateShare = document.querySelector('#value-private-share')
  const management = document.querySelector('#value-management')
  const owner = document.querySelector('#value-owner')

  if (name === 'regie') {
    state.value = 0
    local.value = 100
    privateShare.value = 0
    management.value = 'public'
    owner.value = 'local-public'
  } else if (name === 'concession') {
    state.value = 0
    local.value = 0
    privateShare.value = 100
    management.value = 'delegated'
    owner.value = 'concession'
  } else if (name === 'mixed') {
    state.value = 30
    local.value = 35
    privateShare.value = 35
    management.value = 'delegated'
    owner.value = 'mixed'
  }
  runValueFlow()
}

function deriveEconomicsModel() {
  const physical = window.MuzeEnergyPhysical?.currentModel?.()
  const route = window.MuzeEnergyRoute?.currentModel?.()
  const selected = window.MuzeEnergyTerritory?.selectedTerritories?.() || []
  if (!physical || !route || !physical.segmentModels?.length || !document.querySelector('#cout-complet')) return null

  const read = id => {
    const value = Number(document.querySelector(id)?.value)
    return Number.isFinite(value) ? value : null
  }
  const fields = [
    '#cost-site-access', '#cost-valley-axis', '#cost-urban', '#cost-industrial', '#cost-crossing-km',
    '#cost-crossing-fixed', '#cost-source-interface', '#cost-delivery-node', '#cost-industrial-node',
    '#cost-contingency', '#cost-life', '#cost-discount', '#cost-opex', '#cost-electricity', '#cost-gas',
    '#industry-inspira-mw', '#industry-inspira-hours', '#industry-roussillon-mw', '#industry-roussillon-hours'
  ]
  const values = Object.fromEntries(fields.map(id => [id, read(id)]))
  if (Object.values(values).some(value => value === null || value < 0) || values['#cost-life'] <= 0) return null

  const costByClass = {
    'site-access': values['#cost-site-access'],
    'valley-axis': values['#cost-valley-axis'],
    urban: values['#cost-urban'],
    industrial: values['#cost-industrial'],
    crossing: values['#cost-crossing-km']
  }
  const industrialLoads = [
    { mw: values['#industry-inspira-mw'], hours: values['#industry-inspira-hours'] },
    { mw: values['#industry-roussillon-mw'], hours: values['#industry-roussillon-hours'] }
  ]
  const activeIndustrial = industrialLoads.filter(load => load.mw > 0 && load.hours > 0)
  const industrialMwh = activeIndustrial.reduce((sum, load) => sum + load.mw * load.hours, 0)
  const householdHeatDemand = Number(document.querySelector('#territory-heat-demand')?.value) || 0
  const householdMwh = selected.reduce((sum, place) => sum + place.households, 0) * householdHeatDemand
  const usefulDemandMwh = householdMwh + industrialMwh

  const segmentCapex = physical.segmentModels.reduce((sum, edge) => sum + edge.physicalKm * (costByClass[edge.classId] ?? 0), 0)
  const crossingCapex = physical.crossings * values['#cost-crossing-fixed']
  const deliveryCapex = selected.length * values['#cost-delivery-node']
  const industrialNodesCapex = activeIndustrial.length * values['#cost-industrial-node']
  const directCapex = segmentCapex + crossingCapex + values['#cost-source-interface'] + deliveryCapex + industrialNodesCapex
  const totalCapex = directCapex * (1 + values['#cost-contingency'] / 100)

  const rate = values['#cost-discount'] / 100
  const life = values['#cost-life']
  const crf = rate === 0 ? 1 / life : (rate * (1 + rate) ** life) / ((1 + rate) ** life - 1)
  const annualizedCapexMEur = totalCapex * crf
  const opexMEur = totalCapex * values['#cost-opex'] / 100
  const pumpingMEur = physical.pumpEnergyMwh * values['#cost-electricity'] / 1e6

  const sourceCapacityMwh = route.sourceMw * route.hours
  const sourceRequiredMwh = usefulDemandMwh + physical.heatLossMwh
  const sourceUsedMwh = Math.min(sourceCapacityMwh, sourceRequiredMwh)
  const servedUsefulMwh = Math.max(0, Math.min(usefulDemandMwh, sourceUsedMwh - physical.heatLossMwh))
  const electricOpportunityMwh = sourceUsedMwh * BEZNAU_RATIO_VALUE_LAYER
  const opportunityMEur = electricOpportunityMwh * values['#cost-electricity'] / 1e6
  const annualFullCostMEur = annualizedCapexMEur + opexMEur + pumpingMEur + opportunityMEur

  const boilerEfficiency = Math.max(0.01, (Number(document.querySelector('#territory-boiler-efficiency')?.value) || 92) / 100)
  const gasEquivalentMwh = servedUsefulMwh / boilerEfficiency
  const gasCostMEur = gasEquivalentMwh * values['#cost-gas'] / 1e6

  return {
    totalCapex,
    annualizedCapexMEur,
    opexMEur,
    pumpingMEur,
    opportunityMEur,
    annualFullCostMEur,
    servedUsefulMwh,
    gasCostMEur
  }
}

function runValueFlow() {
  const economics = window.MuzeEnergyEconomics?.currentModel?.() || deriveEconomicsModel()
  if (!economics) {
    valueStatus.textContent = 'Le coût complet doit d’abord produire un modèle valide.'
    return
  }

  const tariff = valueNumeric('#value-tariff')
  const stateShare = valueNumeric('#value-state-share')
  const localShare = valueNumeric('#value-local-share')
  const privateShare = valueNumeric('#value-private-share')
  const publicFeePct = valueNumeric('#value-public-fee')
  const externalGasShare = valueNumeric('#value-external-gas-share')
  const management = document.querySelector('#value-management').value
  const owner = document.querySelector('#value-owner').value

  const numericValues = [tariff, stateShare, localShare, privateShare, publicFeePct, externalGasShare]
  if (numericValues.some(value => value === null || value < 0)) {
    valueStatus.textContent = 'Vérifier les hypothèses : valeurs numériques positives ou nulles.'
    return
  }

  const shareTotal = stateShare + localShare + privateShare
  if (Math.abs(shareTotal - 100) > 0.01) {
    valueStatus.textContent = `Les parts de financement doivent totaliser 100 %. Total actuel : ${valueNumber.format(shareTotal)} %.`
    return
  }
  if (publicFeePct > 100 || externalGasShare > 100) {
    valueStatus.textContent = 'Les pourcentages de redevance et de coût externe doivent rester entre 0 et 100 %.'
    return
  }

  const tariffRevenueMEur = economics.servedUsefulMwh * tariff / 1e6
  const publicFeeMEur = tariffRevenueMEur * publicFeePct / 100
  const annualRequirementMEur = economics.annualFullCostMEur + publicFeeMEur
  const balanceMEur = tariffRevenueMEur - annualRequirementMEur
  const supportMEur = Math.max(0, -balanceMEur)
  const unallocatedMEur = Math.max(0, balanceMEur)

  const stateCapexMEur = economics.totalCapex * stateShare / 100
  const localCapexMEur = economics.totalCapex * localShare / 100
  const privateCapexMEur = economics.totalCapex * privateShare / 100

  const stateCapitalFlow = economics.annualizedCapexMEur * stateShare / 100
  const localCapitalFlow = economics.annualizedCapexMEur * localShare / 100
  const privateCapitalFlow = economics.annualizedCapexMEur * privateShare / 100
  const publicOpsFlow = management === 'public' ? economics.opexMEur : 0
  const privateOpsFlow = management === 'delegated' ? economics.opexMEur : 0
  const stateSourceFlow = economics.opportunityMEur
  const publicAnnualFlow = stateCapitalFlow + localCapitalFlow + stateSourceFlow + publicOpsFlow + publicFeeMEur
  const privateAnnualFlow = privateCapitalFlow + privateOpsFlow

  const userDeltaMEur = economics.gasCostMEur - tariffRevenueMEur
  const externalAvoidedMEur = economics.gasCostMEur * externalGasShare / 100

  document.querySelector('#value-state-capex').textContent = valueMEur(stateCapexMEur)
  document.querySelector('#value-local-capex').textContent = valueMEur(localCapexMEur)
  document.querySelector('#value-private-capex').textContent = valueMEur(privateCapexMEur)
  document.querySelector('#value-user-bill').textContent = `${valueMEur(tariffRevenueMEur)}/an`
  document.querySelector('#value-system-cost').textContent = `${valueMEur(economics.annualFullCostMEur)}/an`

  const balanceNode = document.querySelector('#value-balance')
  balanceNode.textContent = `${valueSignedMEur(balanceMEur)}/an`
  balanceNode.className = balanceMEur >= 0 ? 'value-balance-positive' : 'value-balance-negative'

  document.querySelector('#value-support').textContent = `${valueMEur(supportMEur)}/an`
  document.querySelector('#value-user-delta').textContent = `${valueSignedMEur(userDeltaMEur)}/an`
  document.querySelector('#value-public-flow').textContent = `${valueMEur(publicAnnualFlow)}/an`
  document.querySelector('#value-private-flow').textContent = `${valueMEur(privateAnnualFlow)}/an`
  document.querySelector('#value-external-avoided').textContent = `${valueMEur(externalAvoidedMEur)}/an`
  document.querySelector('#value-owner-result').textContent = ownerLabel(owner)

  document.querySelector('#value-flow-finance').textContent = `État/EDF ${valueNumber.format(stateShare)} % · local ${valueNumber.format(localShare)} % · opérateur ${valueNumber.format(privateShare)} %`
  document.querySelector('#value-flow-owner').textContent = ownerLabel(owner)
  document.querySelector('#value-flow-operator').textContent = management === 'public' ? 'gestion publique / régie testée' : 'gestion déléguée testée'
  document.querySelector('#value-flow-users').textContent = `${valueNumber.format(tariff)} €/MWh utile · ${valueMEur(tariffRevenueMEur)}/an`
  document.querySelector('#value-flow-national').textContent = externalGasShare > 0
    ? `${valueMEur(externalAvoidedMEur)}/an de coût fossile classé externe selon l’hypothèse saisie`
    : 'part externe/importée non documentée : aucun gain macroéconomique chiffré par défaut'

  document.querySelector('#value-ledger-source').textContent = `${valueMEur(stateSourceFlow)}/an`
  document.querySelector('#value-ledger-local').textContent = `${valueMEur(localCapitalFlow + publicOpsFlow + publicFeeMEur)}/an`
  document.querySelector('#value-ledger-private').textContent = `${valueMEur(privateAnnualFlow)}/an`
  document.querySelector('#value-ledger-unallocated').textContent = `${valueMEur(unallocatedMEur)}/an`

  const coverageText = balanceMEur >= 0
    ? `Le tarif testé couvre le coût annuel modélisé et la redevance ; ${valueMEur(unallocatedMEur)} reste non affecté contractuellement.`
    : `Le tarif testé laisse un besoin de financement de ${valueMEur(supportMEur)}/an.`
  const externalText = externalGasShare > 0
    ? `La part externe saisie déplace ${valueMEur(externalAvoidedMEur)}/an de dépense fossile équivalente.`
    : 'Aucune part importée du gaz n’est supposée : le modèle refuse donc de transformer automatiquement le gaz évité en « gain pour l’État ».'

  valueStatus.textContent = `${coverageText} ${externalText}`
}

document.querySelector('#run-value').addEventListener('click', runValueFlow)
valueInputs.forEach(input => input.addEventListener('change', runValueFlow))
document.querySelectorAll('[data-value-preset]').forEach(button => button.addEventListener('click', () => applyValuePreset(button.dataset.valuePreset)))
document.querySelectorAll('#cout-complet input').forEach(input => input.addEventListener('change', runValueFlow))
window.addEventListener('muze:economics-updated', runValueFlow)
window.addEventListener('muze:physical-updated', runValueFlow)
window.addEventListener('muze:territory-updated', runValueFlow)
runValueFlow()

if (!document.querySelector('script[data-evidence-layer]')) {
  const evidenceScript = document.createElement('script')
  evidenceScript.src = './evidence.js'
  evidenceScript.dataset.evidenceLayer = 'true'
  document.body.appendChild(evidenceScript)
}
