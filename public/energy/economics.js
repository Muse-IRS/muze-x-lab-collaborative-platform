function mountEconomicsUi() {
  if (document.querySelector('#cout-complet')) return

  if (!document.querySelector('link[href="./economics.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = './economics.css'
    document.head.appendChild(link)
  }

  const nav = document.querySelector('.energy-local-nav')
  if (nav && !nav.querySelector('a[href="#cout-complet"]')) {
    const anchor = document.createElement('a')
    anchor.href = '#cout-complet'
    anchor.textContent = 'Coût complet'
    const limitsLink = nav.querySelector('a[href="#limites"]')
    nav.insertBefore(anchor, limitsLink || null)
  }

  const limits = document.querySelector('#limites')
  if (!limits) return

  const section = document.createElement('section')
  section.id = 'cout-complet'
  section.className = 'panel economics-anchor'
  section.setAttribute('aria-labelledby', 'economics-title')
  section.innerHTML = `
    <p class="eyebrow">09 · Du corridor physique au coût complet</p>
    <h2 id="economics-title">Faire apparaître le prix de chaque hypothèse au lieu de cacher un CAPEX global.</h2>
    <p>Cette couche reprend le corridor physique segment par segment et lui associe des <strong>coûts unitaires explicitement modifiables</strong>. Les valeurs proposées ci-dessous sont un scénario pédagogique d’ordre de grandeur : elles ne constituent ni un devis, ni un coût ADEME, ni une estimation de travaux à Saint-Alban.</p>

    <div class="economics-facts">
      <article><strong>1 041 réseaux</strong><span>réseaux de chaleur recensés en France en 2024.</span></article>
      <article><strong>28 TWh livrés</strong><span>chaleur livrée nette des pertes par les réseaux en 2024.</span></article>
      <article><strong>113 €/MWh HTVA</strong><span>prix moyen 2024 de la chaleur achetée par les secteurs hors énergie ; 120 €/MWh TTC.</span></article>
      <article><strong>&gt; 20 MW</strong><span>certaines installations nouvelles ou notablement modifiées doivent analyser coûts et avantages de la valorisation de chaleur fatale.</span></article>
    </div>

    <div class="territory-source-note">
      <p><strong>Données héritées du modèle :</strong> segments, longueurs, classes de corridor, puissance, heures, pertes thermiques et pompage.</p>
      <p><strong>Hypothèses économiques :</strong> €/km par classe, interface source, sous-stations, aléas, durée de vie, taux d’actualisation, OPEX, valeur de l’électricité et prix du gaz.</p>
      <p><strong>Demande industrielle :</strong> INSPIRA et la plateforme de Roussillon sont des bassins à mesurer. Les champs démarrent à zéro pour ne fabriquer aucune consommation.</p>
    </div>

    <h3>Coût direct par classe de corridor</h3>
    <div class="economics-cost-grid">
      <div class="energy-field"><label for="cost-site-access">Sortie de site (M€/km)</label><input id="cost-site-access" type="number" min="0" step="0.05" value="1.00"></div>
      <div class="energy-field"><label for="cost-valley-axis">Axe de vallée (M€/km)</label><input id="cost-valley-axis" type="number" min="0" step="0.05" value="0.80"></div>
      <div class="energy-field"><label for="cost-urban">Tissu urbain (M€/km)</label><input id="cost-urban" type="number" min="0" step="0.05" value="1.80"></div>
      <div class="energy-field"><label for="cost-industrial">Zone industrielle (M€/km)</label><input id="cost-industrial" type="number" min="0" step="0.05" value="1.20"></div>
      <div class="energy-field"><label for="cost-crossing-km">Contrainte forte (M€/km)</label><input id="cost-crossing-km" type="number" min="0" step="0.05" value="3.00"></div>
      <div class="energy-field"><label for="cost-crossing-fixed">Ouvrage majeur (M€/franchissement)</label><input id="cost-crossing-fixed" type="number" min="0" step="0.1" value="2.00"></div>
    </div>

    <h3>Équipements, financement et exploitation</h3>
    <div class="economics-cost-grid">
      <div class="energy-field"><label for="cost-source-interface">Interface thermique source (M€)</label><input id="cost-source-interface" type="number" min="0" step="0.5" value="25"></div>
      <div class="energy-field"><label for="cost-delivery-node">Sous-station par commune (M€)</label><input id="cost-delivery-node" type="number" min="0" step="0.05" value="0.40"></div>
      <div class="energy-field"><label for="cost-industrial-node">Sous-station industrielle active (M€)</label><input id="cost-industrial-node" type="number" min="0" step="0.1" value="1.00"></div>
      <div class="energy-field"><label for="cost-contingency">Études + aléas (%)</label><input id="cost-contingency" type="number" min="0" step="1" value="20"></div>
      <div class="energy-field"><label for="cost-life">Durée économique (ans)</label><input id="cost-life" type="number" min="1" step="1" value="40"></div>
      <div class="energy-field"><label for="cost-discount">Taux d’actualisation (%)</label><input id="cost-discount" type="number" min="0" step="0.1" value="4"></div>
      <div class="energy-field"><label for="cost-opex">OPEX annuel (% CAPEX)</label><input id="cost-opex" type="number" min="0" step="0.1" value="1.5"></div>
      <div class="energy-field"><label for="cost-electricity">Valeur électricité (€/MWhₑ)</label><input id="cost-electricity" type="number" min="0" step="1" value="70"></div>
      <div class="energy-field"><label for="cost-gas">Prix gaz de test (€/MWh PCI)</label><input id="cost-gas" type="number" min="0" step="1" value="60"></div>
    </div>

    <h3>Charges industrielles à tester — zéro tant qu’elles ne sont pas mesurées</h3>
    <div class="industrial-load-grid">
      <article>
        <strong>INSPIRA · Salaise–Sablons</strong>
        <span>Bassin industriel réel ; aucune demande thermique publique retenue par défaut.</span>
        <div class="industrial-inputs">
          <div class="energy-field"><label for="industry-inspira-mw">Puissance utile test (MWₜₕ)</label><input id="industry-inspira-mw" type="number" min="0" step="0.5" value="0"></div>
          <div class="energy-field"><label for="industry-inspira-hours">Heures équivalentes/an</label><input id="industry-inspira-hours" type="number" min="0" max="8760" step="100" value="0"></div>
        </div>
      </article>
      <article>
        <strong>Plateforme chimique de Roussillon</strong>
        <span>Établissements industriels confirmés ; besoins thermiques à documenter avant toute attribution.</span>
        <div class="industrial-inputs">
          <div class="energy-field"><label for="industry-roussillon-mw">Puissance utile test (MWₜₕ)</label><input id="industry-roussillon-mw" type="number" min="0" step="0.5" value="0"></div>
          <div class="energy-field"><label for="industry-roussillon-hours">Heures équivalentes/an</label><input id="industry-roussillon-hours" type="number" min="0" max="8760" step="100" value="0"></div>
        </div>
      </article>
    </div>

    <div class="economics-formula" aria-label="Équation du coût complet">
      <span>CAPEX annualisé</span><span>+</span><span>OPEX</span><span>+</span><span>pompage</span><span>+</span><span>électricité d’opportunité</span><span>÷</span><strong>MWh utiles servis</strong>
    </div>

    <div class="energy-actions"><button id="run-economics" type="button">Calculer le coût complet</button></div>
    <p id="economics-status" class="economics-status" role="status" aria-live="polite">Le calcul attend le corridor physique courant.</p>

    <div class="economics-results">
      <div class="metric"><span>CAPEX scénario</span><strong id="economic-capex-result">—</strong><small>Corridor + équipements + aléas.</small></div>
      <div class="metric"><span>CAPEX annualisé</span><strong id="economic-annualized-result">—</strong><small>Annuité équivalente selon durée et taux.</small></div>
      <div class="metric"><span>OPEX annuel</span><strong id="economic-opex-result">—</strong><small>Pourcentage du CAPEX saisi.</small></div>
      <div class="metric"><span>Énergie utile servie</span><strong id="economic-served-result">—</strong><small>Bornée par capacité thermique et pertes.</small></div>
      <div class="metric"><span>Coût complet chaleur</span><strong id="economic-lcoh-result">—</strong><small>€/MWh utile, avant fiscalité et aides.</small></div>
      <div class="metric"><span>Référence réseaux 2024</span><strong id="economic-network-ref-result">113 €/MWh</strong><small>Moyenne HTVA nationale, pas un tarif local.</small></div>
      <div class="metric"><span>Gaz équivalent scénario</span><strong id="economic-gas-cost-result">—</strong><small>Même service utile au rendement chaudière saisi.</small></div>
      <div class="metric"><span>Gaz au point d’équilibre</span><strong id="economic-break-even-result">—</strong><small>Prix combustible rendant les coûts annuels égaux.</small></div>
    </div>

    <div class="economics-breakdown">
      <div>
        <h3>CAPEX segment par segment</h3>
        <div class="economics-table-wrap">
          <table class="economics-table">
            <thead><tr><th>Segment</th><th>Classe</th><th>km</th><th>M€/km</th><th>CAPEX M€</th></tr></thead>
            <tbody id="economics-segments-body"></tbody>
          </table>
        </div>
      </div>
      <div>
        <h3>Profil annuel utile</h3>
        <div id="seasonality-chart" class="seasonality-chart" aria-label="Profil pédagogique mensuel de demande thermique"></div>
        <p id="seasonality-note" class="economics-note">Le profil résidentiel est pédagogique, non météorologique. La charge industrielle saisie est répartie uniformément sur l’année pour montrer son effet sur la saisonnalité.</p>
      </div>
    </div>

    <div class="economics-ledger">
      <article><strong id="ledger-pumping">—</strong><span>coût annuel du pompage</span></article>
      <article><strong id="ledger-opportunity">—</strong><span>valeur de l’électricité d’opportunité, benchmark Beznau</span></article>
      <article><strong id="ledger-industrial">—</strong><span>chaleur industrielle testée</span></article>
      <article><strong id="ledger-coverage">—</strong><span>couverture annuelle de la demande source</span></article>
    </div>

    <div class="callout">
      <p><strong>Falsification économique :</strong> si le coût complet dépasse durablement les solutions de référence après prise en compte des risques, le scénario doit être rejeté ou redimensionné. Inversement, un résultat favorable ici ne suffit pas : les coûts unitaires doivent être remplacés par des devis, les usages industriels par des mesures, et les règles de soutirage par une étude du cycle réel de la centrale.</p>
    </div>

    <details class="territory-sources">
      <summary>Sources économiques et cadre de comparaison</summary>
      <ul>
        <li><a href="https://portail.documentation.developpement-durable.gouv.fr/pub/MPDOUV00268844-bilan-energetique-france-pour-2024.html" target="_blank" rel="noopener noreferrer">SDES — Bilan énergétique de la France 2024</a> : 1 041 réseaux, environ 27 GW thermiques, 28 TWh livrés ; prix moyen de chaleur 113 €/MWh HTVA et 120 €/MWh TTC pour les secteurs hors énergie.</li>
        <li><a href="https://www.ecologie.gouv.fr/politiques-publiques/chaleur-recuperation-processus-industriels" target="_blank" rel="noopener noreferrer">Ministère de la Transition écologique — chaleur de récupération industrielle</a> : usages possibles de la chaleur fatale, potentiel historique ADEME et cadre d’analyse coûts-avantages pour certaines installations de plus de 20 MW.</li>
        <li><a href="https://www-pub.iaea.org/MTCD/publications/PDF/P1862_web.pdf" target="_blank" rel="noopener noreferrer">AIEA — Nuclear Energy Cogeneration</a> : benchmark Beznau utilisé uniquement pour le coût d’opportunité électrique, ≈10 MWₑ pour ≈80 MWₜₕ.</li>
      </ul>
    </details>
  `

  limits.parentNode.insertBefore(section, limits)

  const limitsEyebrow = limits.querySelector('.eyebrow')
  if (limitsEyebrow) limitsEyebrow.textContent = '10 · Ce que le modèle ne prouve pas'

  const nextTitle = document.querySelector('#next-title')
  if (nextTitle) {
    nextTitle.textContent = 'Du coût complet aux flux réels de valeur.'
    const paragraph = nextTitle.nextElementSibling
    if (paragraph) paragraph.innerHTML = 'La frontière suivante consiste à remplacer les coûts pédagogiques par des <strong>devis et barèmes vérifiables</strong>, la charge industrielle test par des <strong>profils mesurés</strong>, puis à suivre les flux : qui investit, qui possède le réseau, qui achète la chaleur, qui supporte le risque et où reste la valeur créée par les importations fossiles évitées.'
  }
}

mountEconomicsUi()

const economicsNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const economicsInteger = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const NETWORK_HEAT_REFERENCE_EUR_MWH = 113
const BEZNAU_ELECTRIC_OPPORTUNITY_RATIO = 10 / 80
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const HOUSEHOLD_MONTHLY_PROFILE = [0.15, 0.14, 0.11, 0.08, 0.04, 0.01, 0, 0, 0.02, 0.07, 0.17, 0.21]

const costInputs = {
  'site-access': document.querySelector('#cost-site-access'),
  'valley-axis': document.querySelector('#cost-valley-axis'),
  urban: document.querySelector('#cost-urban'),
  industrial: document.querySelector('#cost-industrial'),
  crossing: document.querySelector('#cost-crossing-km')
}

const economicsInputs = [
  ...Object.values(costInputs),
  document.querySelector('#cost-crossing-fixed'),
  document.querySelector('#cost-source-interface'),
  document.querySelector('#cost-delivery-node'),
  document.querySelector('#cost-industrial-node'),
  document.querySelector('#cost-contingency'),
  document.querySelector('#cost-life'),
  document.querySelector('#cost-discount'),
  document.querySelector('#cost-opex'),
  document.querySelector('#cost-electricity'),
  document.querySelector('#cost-gas'),
  document.querySelector('#industry-inspira-mw'),
  document.querySelector('#industry-inspira-hours'),
  document.querySelector('#industry-roussillon-mw'),
  document.querySelector('#industry-roussillon-hours')
]

const economicsStatus = document.querySelector('#economics-status')
const economicsSegmentsBody = document.querySelector('#economics-segments-body')
const seasonalityChart = document.querySelector('#seasonality-chart')

function econNumber(input) {
  const value = Number(input?.value)
  return Number.isFinite(value) ? value : null
}

function formatMEur(value) {
  return `${economicsNumber.format(value)} M€`
}

function formatGwh(mwh) {
  return mwh >= 1000
    ? `${economicsNumber.format(mwh / 1000)} GWh/an`
    : `${economicsNumber.format(mwh)} MWh/an`
}

function capitalRecoveryFactor(rate, years) {
  if (years <= 0) return 0
  if (rate === 0) return 1 / years
  const growth = (1 + rate) ** years
  return (rate * growth) / (growth - 1)
}

function renderSeasonality(householdMwh, industrialMwh) {
  seasonalityChart.innerHTML = ''
  const monthly = HOUSEHOLD_MONTHLY_PROFILE.map(share => householdMwh * share + industrialMwh / 12)
  const maxValue = Math.max(...monthly, 1)

  monthly.forEach((value, index) => {
    const item = document.createElement('div')
    item.className = 'seasonality-month'
    const bar = document.createElement('div')
    bar.className = 'seasonality-bar'
    bar.style.height = `${Math.max(3, (value / maxValue) * 100)}%`
    bar.title = `${MONTHS[index]} · ${economicsNumber.format(value / 1000)} GWh utiles`
    const label = document.createElement('span')
    label.textContent = MONTHS[index]
    item.append(bar, label)
    seasonalityChart.appendChild(item)
  })

  const average = monthly.reduce((sum, value) => sum + value, 0) / 12
  const peak = Math.max(...monthly)
  return average > 0 ? peak / average : 0
}

function renderSegmentCosts(segmentCosts) {
  economicsSegmentsBody.innerHTML = ''
  segmentCosts.forEach(item => {
    const row = document.createElement('tr')
    const cells = [
      `${item.edge.parent.name} → ${item.edge.child.name}`,
      item.classLabel,
      economicsNumber.format(item.edge.physicalKm),
      economicsNumber.format(item.unitCost),
      economicsNumber.format(item.capex)
    ]
    cells.forEach(text => {
      const cell = document.createElement('td')
      cell.textContent = text
      row.appendChild(cell)
    })
    economicsSegmentsBody.appendChild(row)
  })
}

function runEconomics() {
  const physical = window.MuzeEnergyPhysical?.currentModel?.()
  const route = window.MuzeEnergyRoute?.currentModel?.()
  const selected = window.MuzeEnergyTerritory?.selectedTerritories?.() || []

  if (!physical || !route || !physical.segmentModels?.length) {
    economicsStatus.textContent = 'Le corridor physique doit d’abord produire un modèle valide.'
    return
  }

  const values = economicsInputs.map(econNumber)
  if (values.some(value => value === null || value < 0)) {
    economicsStatus.textContent = 'Vérifier les hypothèses économiques : toutes les valeurs doivent être numériques et positives ou nulles.'
    return
  }

  const costByClass = Object.fromEntries(Object.entries(costInputs).map(([key, input]) => [key, econNumber(input)]))
  const crossingFixed = econNumber(document.querySelector('#cost-crossing-fixed'))
  const sourceInterface = econNumber(document.querySelector('#cost-source-interface'))
  const deliveryNodeCost = econNumber(document.querySelector('#cost-delivery-node'))
  const industrialNodeCost = econNumber(document.querySelector('#cost-industrial-node'))
  const contingencyPct = econNumber(document.querySelector('#cost-contingency'))
  const life = econNumber(document.querySelector('#cost-life'))
  const discountPct = econNumber(document.querySelector('#cost-discount'))
  const opexPct = econNumber(document.querySelector('#cost-opex'))
  const electricityValue = econNumber(document.querySelector('#cost-electricity'))
  const gasPrice = econNumber(document.querySelector('#cost-gas'))

  if (life <= 0) {
    economicsStatus.textContent = 'La durée économique doit être strictement positive.'
    return
  }

  const industrialLoads = [
    {
      name: 'INSPIRA',
      mw: econNumber(document.querySelector('#industry-inspira-mw')),
      hours: econNumber(document.querySelector('#industry-inspira-hours'))
    },
    {
      name: 'Roussillon',
      mw: econNumber(document.querySelector('#industry-roussillon-mw')),
      hours: econNumber(document.querySelector('#industry-roussillon-hours'))
    }
  ]
  const activeIndustrial = industrialLoads.filter(load => load.mw > 0 && load.hours > 0)
  const industrialMwh = activeIndustrial.reduce((sum, load) => sum + load.mw * load.hours, 0)

  const householdHeatDemand = Number(document.querySelector('#territory-heat-demand')?.value) || 0
  const householdMwh = selected.reduce((sum, place) => sum + place.households, 0) * householdHeatDemand
  const usefulDemandMwh = householdMwh + industrialMwh

  const segmentCosts = physical.segmentModels.map(edge => {
    const unitCost = costByClass[edge.classId] ?? 0
    const capex = edge.physicalKm * unitCost
    const classLabel = window.MuzeEnergyPhysical?.corridorClasses?.[edge.classId]?.label || edge.classId
    return { edge, unitCost, capex, classLabel }
  })
  const segmentCapex = segmentCosts.reduce((sum, item) => sum + item.capex, 0)
  const crossingCapex = physical.crossings * crossingFixed
  const deliveryCapex = selected.length * deliveryNodeCost
  const industrialNodesCapex = activeIndustrial.length * industrialNodeCost
  const directCapex = segmentCapex + crossingCapex + sourceInterface + deliveryCapex + industrialNodesCapex
  const totalCapex = directCapex * (1 + contingencyPct / 100)

  const crf = capitalRecoveryFactor(discountPct / 100, life)
  const annualizedCapexMEur = totalCapex * crf
  const opexMEur = totalCapex * (opexPct / 100)
  const pumpingMEur = (physical.pumpEnergyMwh * electricityValue) / 1e6

  const sourceCapacityMwh = route.sourceMw * route.hours
  const sourceRequiredMwh = usefulDemandMwh + physical.heatLossMwh
  const sourceUsedMwh = Math.min(sourceCapacityMwh, sourceRequiredMwh)
  const servedUsefulMwh = Math.max(0, Math.min(usefulDemandMwh, sourceUsedMwh - physical.heatLossMwh))
  const coverage = sourceRequiredMwh > 0 ? sourceCapacityMwh / sourceRequiredMwh : 0

  const electricOpportunityMwh = sourceUsedMwh * BEZNAU_ELECTRIC_OPPORTUNITY_RATIO
  const opportunityMEur = (electricOpportunityMwh * electricityValue) / 1e6
  const annualFullCostMEur = annualizedCapexMEur + opexMEur + pumpingMEur + opportunityMEur
  const lcoh = servedUsefulMwh > 0 ? (annualFullCostMEur * 1e6) / servedUsefulMwh : 0

  const boilerEfficiency = Math.max(0.01, (Number(document.querySelector('#territory-boiler-efficiency')?.value) || 92) / 100)
  const gasEquivalentMwh = servedUsefulMwh / boilerEfficiency
  const gasCostMEur = (gasEquivalentMwh * gasPrice) / 1e6
  const gasUsefulCost = gasPrice / boilerEfficiency
  const breakEvenGas = servedUsefulMwh > 0 ? (annualFullCostMEur * 1e6 * boilerEfficiency) / servedUsefulMwh : 0

  document.querySelector('#economic-capex-result').textContent = formatMEur(totalCapex)
  document.querySelector('#economic-annualized-result').textContent = `${formatMEur(annualizedCapexMEur)}/an`
  document.querySelector('#economic-opex-result').textContent = `${formatMEur(opexMEur)}/an`
  document.querySelector('#economic-served-result').textContent = formatGwh(servedUsefulMwh)
  document.querySelector('#economic-lcoh-result').textContent = `${economicsNumber.format(lcoh)} €/MWh`
  document.querySelector('#economic-gas-cost-result').textContent = `${economicsNumber.format(gasUsefulCost)} €/MWh utile · ${formatMEur(gasCostMEur)}/an`
  document.querySelector('#economic-break-even-result').textContent = `${economicsNumber.format(breakEvenGas)} €/MWh PCI`

  document.querySelector('#ledger-pumping').textContent = `${formatMEur(pumpingMEur)}/an`
  document.querySelector('#ledger-opportunity').textContent = `${formatMEur(opportunityMEur)}/an`
  document.querySelector('#ledger-industrial').textContent = formatGwh(industrialMwh)
  document.querySelector('#ledger-coverage').textContent = `${economicsNumber.format(coverage * 100)} %`

  renderSegmentCosts(segmentCosts)
  const peakToAverage = renderSeasonality(householdMwh, industrialMwh)
  const industrialShare = usefulDemandMwh > 0 ? industrialMwh / usefulDemandMwh : 0

  const referenceDelta = lcoh - NETWORK_HEAT_REFERENCE_EUR_MWH
  const comparison = referenceDelta <= 0 ? 'sous' : 'au-dessus de'
  economicsStatus.textContent = `Scénario : ${formatMEur(totalCapex)} de CAPEX, ${economicsNumber.format(lcoh)} €/MWh utile, soit ${economicsNumber.format(Math.abs(referenceDelta))} €/MWh ${comparison} la moyenne nationale HTVA 2024 des réseaux. Charge industrielle testée : ${economicsNumber.format(industrialShare * 100)} % de la demande ; ratio mois de pointe / mois moyen : ${economicsNumber.format(peakToAverage)}. Ces écarts dépendent directement des hypothèses saisies.`
}

document.querySelector('#run-economics').addEventListener('click', runEconomics)
economicsInputs.forEach(input => input.addEventListener('change', runEconomics))
window.addEventListener('muze:physical-updated', runEconomics)
window.addEventListener('muze:territory-updated', runEconomics)
runEconomics()
