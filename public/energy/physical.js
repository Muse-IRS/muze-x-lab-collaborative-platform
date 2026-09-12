function mountPhysicalCorridorUi() {
  if (document.querySelector('#corridor-physique')) return

  if (!document.querySelector('link[href="./physical.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = './physical.css'
    document.head.appendChild(link)
  }

  const nav = document.querySelector('.energy-local-nav')
  if (nav && !nav.querySelector('a[href="#corridor-physique"]')) {
    const anchor = document.createElement('a')
    anchor.href = '#corridor-physique'
    anchor.textContent = 'Corridor physique'
    const limitsLink = nav.querySelector('a[href="#limites"]')
    nav.insertBefore(anchor, limitsLink || null)
  }

  const limits = document.querySelector('#limites')
  if (!limits) return

  const section = document.createElement('section')
  section.id = 'corridor-physique'
  section.className = 'panel physical-anchor'
  section.setAttribute('aria-labelledby', 'physical-title')
  section.innerHTML = `
    <p class="eyebrow">08 · Du tracé mathématique au corridor territorial</p>
    <h2 id="physical-title">Remplacer un facteur unique par des contraintes segmentaires vérifiables.</h2>
    <p>Le pré-tracé précédent appliquait un coefficient uniforme à tout le bassin. Cette couche le remplace par une <strong>classe physique par segment</strong> : sortie de site, axe de vallée, tissu urbain, zone industrielle ou franchissement. Les coefficients restent des hypothèses de pré-étude ; les infrastructures publiques documentées servent à dire où chercher, pas à prétendre connaître une emprise de chantier.</p>

    <div class="physical-facts">
      <article><strong>RD37B</strong><span>La centrale est desservie par cette route départementale : premier corridor réel à examiner en sortie de site.</span></article>
      <article><strong>A7 + N7 · ≈ 4 km</strong><span>Ces axes longent le Rhône à proximité du site selon l’inventaire régional du patrimoine industriel.</span></article>
      <article><strong>D1086 · ≈ 1,45 km</strong><span>Axe de l’autre rive mentionné à proximité des bâtiments : utile comme alternative, mais il implique la question du franchissement du Rhône.</span></article>
      <article><strong>INSPIRA · ≈ 340 ha</strong><span>Zone industrialo-portuaire de Salaise–Sablons, desserte fleuve + rail + autoroute et logique affichée de synergies inter-entreprises.</span></article>
      <article><strong>Rhône · contrainte thermique</strong><span>EDF a encore adapté la production en 2026 lorsque la température du Rhône imposait de limiter l’échauffement lié aux rejets.</span></article>
    </div>

    <div class="territory-source-note">
      <p><strong>Faits publics :</strong> desserte RD37B, proximité A7/N7 et D1086, présence d’INSPIRA et de la plateforme chimique, contraintes thermiques du Rhône.</p>
      <p><strong>Hypothèses modifiables :</strong> classe de chaque segment, coefficient de détour et sur-longueur équivalente des franchissements majeurs.</p>
      <p><strong>Non établi :</strong> droit de passage, emprise disponible, sous-sol, réseaux existants, franchissements effectivement nécessaires, servitudes, tracé réglementaire et coût de génie civil.</p>
    </div>

    <div class="physical-controls">
      <div class="energy-field"><label for="physical-major-crossings">Franchissements majeurs ajoutés</label><input id="physical-major-crossings" type="number" min="0" step="1" value="0"></div>
      <div class="energy-field"><label for="physical-crossing-extra">Sur-longueur équivalente par franchissement (km)</label><input id="physical-crossing-extra" type="number" min="0" step="0.05" value="0.25"></div>
    </div>

    <div class="physical-chain" aria-label="Chaîne de passage au corridor physique">
      <span>distance géodésique</span><span>×</span><span>classe segmentaire</span><span>+</span><span>franchissements</span><span>=</span><strong>corridor physique de pré-étude</strong>
    </div>

    <div class="energy-actions"><button id="run-physical" type="button">Recalculer le corridor physique</button></div>
    <p id="physical-status" class="physical-status" role="status" aria-live="polite">Le modèle reprend automatiquement le dernier pré-tracé valide.</p>

    <div class="physical-results">
      <div class="metric"><span>Borne géodésique</span><strong id="physical-geo-result">—</strong><small>Arbre minimal précédent.</small></div>
      <div class="metric"><span>Corridor physique scénario</span><strong id="physical-corridor-result">—</strong><small>Somme des facteurs segmentaires + franchissements.</small></div>
      <div class="metric"><span>Écart à la borne</span><strong id="physical-delta-result">—</strong><small>Sur-longueur par rapport à la géodésie.</small></div>
      <div class="metric"><span>Tubes aller + retour</span><strong id="physical-pipe-result">—</strong><small>Deux conduites sur le corridor recalculé.</small></div>
      <div class="metric"><span>Pertes thermiques</span><strong id="physical-heat-loss-result">—</strong><small>Même hypothèse W/m, nouvelle longueur.</small></div>
      <div class="metric"><span>Pompage</span><strong id="physical-pump-power-result">—</strong><small>Gradient hydraulique appliqué aux nouvelles longueurs.</small></div>
      <div class="metric"><span>Électricité de pompage</span><strong id="physical-pump-energy-result">—</strong><small>Puissance × heures du scénario.</small></div>
      <div class="metric"><span>Franchissements ajoutés</span><strong id="physical-crossing-result">—</strong><small>Nombre · sur-longueur équivalente totale.</small></div>
    </div>

    <div class="physical-table-wrap" aria-label="Contraintes physiques par segment">
      <table class="physical-table">
        <thead><tr><th>De</th><th>Vers</th><th>Géodésique</th><th>Classe de corridor</th><th>Facteur</th><th>Corridor</th><th>Puissance</th><th>DN</th></tr></thead>
        <tbody id="physical-segments-body"></tbody>
      </table>
    </div>

    <div class="physical-evidence">
      <article><strong>Infrastructure existante ≠ emprise disponible</strong><span>Une route, une voie ferrée ou une zone industrielle indique un corridor à investiguer. Elle ne prouve ni la disponibilité du sous-sol ni l’autorisation d’y poser une conduite.</span></article>
      <article><strong>Le Rhône est à la fois ressource et contrainte</strong><span>Le site utilise le fleuve comme source froide et les rejets thermiques sont réglementés. Une valorisation de chaleur doit donc être étudiée avec le cycle réel et les règles de rejet, pas seulement avec un bilan énergétique.</span></article>
      <article><strong>INSPIRA change la question de la saisonnalité</strong><span>Le site accueille plus de vingt entreprises et se présente comme un espace de synergies de flux. Cela identifie un bassin industriel à mesurer ; aucune demande thermique n’est supposée ici.</span></article>
      <article><strong>Plateforme chimique : demande potentielle, pas donnée</strong><span>Géorisques confirme plusieurs établissements industriels en exploitation sur la plateforme de Roussillon. Leurs besoins de chaleur ne sont pas déduits de leur statut réglementaire.</span></article>
    </div>

    <div class="callout">
      <p><strong>Lecture :</strong> le modèle ne dit plus « 1,20 partout ». Il montre quel segment devient coûteux dès qu’on change sa classe physique ou qu’un franchissement apparaît. La prochaine étape peut donc porter sur le <strong>coût complet segment par segment</strong> et sur des <strong>consommateurs industriels mesurés</strong>, au lieu d’ajouter un CAPEX global arbitraire.</p>
    </div>

    <details class="territory-sources">
      <summary>Sources physiques du corridor</summary>
      <ul>
        <li><a href="https://www.edf.fr/sites/default/files/contrib/groupe-edf/producteur-industriel/visitez-nos-centrales/JIE%202018/Nuc_Saint%20Alban/plan_acces_saintalban.pdf" target="_blank" rel="noopener noreferrer">EDF — plan d’accès de Saint-Alban / Saint-Maurice</a> : RD37B, Rhône, A7, D1086 et GPS public du site.</li>
        <li><a href="https://patrimoine.auvergnerhonealpes.fr/dossier/pdf/1856a0ba-fcd3-46a7-afac-df8a9f6170b5/centrale-nucleaire-de-saint-alban-saint-maurice.pdf" target="_blank" rel="noopener noreferrer">Région Auvergne-Rhône-Alpes — inventaire industriel de la centrale</a> : desserte RD37B, A7/N7 à environ 4 km et D1086 à environ 1,45 km.</li>
        <li><a href="https://challengemobilite.auvergnerhonealpes.fr/etablissement/syndicat-mixte-de-la-zip-salaise-sablons.5587.html" target="_blank" rel="noopener noreferrer">Région Auvergne-Rhône-Alpes — INSPIRA</a> : environ 340 ha, plus de 20 entreprises, 900 emplois et desserte multimodale.</li>
        <li><a href="https://www.georisques.gouv.fr/risques/installations/donnees/details/0006105221" target="_blank" rel="noopener noreferrer">Géorisques — OSIRIS / plateforme chimique de Roussillon</a> : établissement industriel en exploitation ; point d’entrée vers les données réglementaires de la plateforme.</li>
        <li><a href="https://www.edf.fr/la-centrale-nucleaire-de-saint-alban-saint-maurice/les-actualites-de-la-centrale-nucleaire-de-saint-alban/adaptation-de-la-production-de-la-centrale-de-saint-alban-saint-maurice-en-raison-des-conditions-climatiques" target="_blank" rel="noopener noreferrer">EDF — conditions climatiques 2026</a> : adaptation de puissance pour respecter les limites d’échauffement du Rhône.</li>
      </ul>
    </details>
  `

  limits.parentNode.insertBefore(section, limits)

  const limitsEyebrow = limits.querySelector('.eyebrow')
  if (limitsEyebrow) limitsEyebrow.textContent = '09 · Ce que le modèle ne prouve pas'

  const nextTitle = document.querySelector('#next-title')
  if (nextTitle) {
    nextTitle.textContent = 'Du corridor physique au coût complet et aux usages industriels.'
    const paragraph = nextTitle.nextElementSibling
    if (paragraph) paragraph.innerHTML = 'Le prochain niveau consiste à chiffrer <strong>tranchée, tubes, sous-stations, pompage, franchissements, maintenance et durée de vie</strong>, puis à remplacer la demande industrielle hypothétique par des données vérifiables. Le modèle pourra alors comparer CAPEX/OPEX, chaleur utile, électricité sacrifiée, combustibles fossiles évités et valeur d’une charge thermique plus régulière sur l’année.'
  }
}

mountPhysicalCorridorUi()

const physicalSegmentsBody = document.querySelector('#physical-segments-body')
const physicalStatus = document.querySelector('#physical-status')
const physicalCrossingsInput = document.querySelector('#physical-major-crossings')
const physicalCrossingExtraInput = document.querySelector('#physical-crossing-extra')
const runPhysicalButton = document.querySelector('#run-physical')

const physicalGeoResult = document.querySelector('#physical-geo-result')
const physicalCorridorResult = document.querySelector('#physical-corridor-result')
const physicalDeltaResult = document.querySelector('#physical-delta-result')
const physicalPipeResult = document.querySelector('#physical-pipe-result')
const physicalHeatLossResult = document.querySelector('#physical-heat-loss-result')
const physicalPumpPowerResult = document.querySelector('#physical-pump-power-result')
const physicalPumpEnergyResult = document.querySelector('#physical-pump-energy-result')
const physicalCrossingResult = document.querySelector('#physical-crossing-result')

const physicalNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const physicalInteger = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

const CORRIDOR_CLASSES = Object.freeze({
  'site-access': Object.freeze({ label: 'Sortie de site / desserte locale', factor: 1.10 }),
  'valley-axis': Object.freeze({ label: 'Axe de vallée / corridor linéaire', factor: 1.15 }),
  'urban': Object.freeze({ label: 'Tissu urbain', factor: 1.30 }),
  'industrial': Object.freeze({ label: 'Zone industrielle', factor: 1.20 }),
  'crossing': Object.freeze({ label: 'Franchissement / contrainte forte', factor: 1.60 })
})

const physicalOverrides = new Map()
let currentPhysicalModel = null

function physicalNumeric(input) {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : null
}

function segmentKey(edge) {
  return `${edge.parent.id}>${edge.child.id}`
}

function suggestedCorridorClass(edge) {
  const ids = new Set([edge.parent.id, edge.child.id])
  if (ids.has('source')) return 'site-access'
  if (ids.has('salaise-sanne') || ids.has('roussillon')) return 'industrial'
  if (ids.has('peage-roussillon')) return 'urban'
  return 'valley-axis'
}

function corridorConfig(edge) {
  const key = segmentKey(edge)
  const saved = physicalOverrides.get(key)
  if (saved) return saved
  const classId = suggestedCorridorClass(edge)
  return { classId, factor: CORRIDOR_CLASSES[classId].factor }
}

function formatPhysicalEnergy(mwh) {
  if (mwh >= 1000) return `${physicalNumber.format(mwh / 1000)} GWh/an`
  return `${physicalNumber.format(mwh)} MWh/an`
}

function renderPhysicalRows(model) {
  physicalSegmentsBody.innerHTML = ''

  model.edgeModels.forEach(edge => {
    const key = segmentKey(edge)
    const config = corridorConfig(edge)
    const row = document.createElement('tr')

    const from = document.createElement('td')
    from.textContent = edge.parent.name
    const to = document.createElement('td')
    to.textContent = edge.child.name
    const geo = document.createElement('td')
    geo.textContent = `${physicalNumber.format(edge.distanceKm)} km`

    const classCell = document.createElement('td')
    const select = document.createElement('select')
    select.className = 'physical-select'
    Object.entries(CORRIDOR_CLASSES).forEach(([id, item]) => {
      const option = document.createElement('option')
      option.value = id
      option.textContent = item.label
      option.selected = id === config.classId
      select.appendChild(option)
    })
    select.addEventListener('change', () => {
      const classId = select.value
      physicalOverrides.set(key, { classId, factor: CORRIDOR_CLASSES[classId].factor })
      runPhysicalCorridor()
    })
    classCell.appendChild(select)

    const factorCell = document.createElement('td')
    const factor = document.createElement('input')
    factor.className = 'physical-factor'
    factor.type = 'number'
    factor.min = '1'
    factor.step = '0.01'
    factor.value = config.factor.toFixed(2)
    factor.setAttribute('aria-label', `Facteur de corridor ${edge.parent.name} vers ${edge.child.name}`)
    factor.addEventListener('change', () => {
      const value = Number(factor.value)
      if (!Number.isFinite(value) || value < 1) return
      physicalOverrides.set(key, { classId: select.value, factor: value })
      runPhysicalCorridor()
    })
    factorCell.appendChild(factor)

    const corridor = document.createElement('td')
    corridor.textContent = `${physicalNumber.format(edge.distanceKm * config.factor)} km`
    const power = document.createElement('td')
    power.textContent = `${physicalNumber.format(edge.designPowerMw)} MWₜₕ`
    const dn = document.createElement('td')
    dn.textContent = `DN ${physicalInteger.format(edge.dn)}`

    ;[from, to, geo, classCell, factorCell, corridor, power, dn].forEach(cell => row.appendChild(cell))
    physicalSegmentsBody.appendChild(row)
  })
}

function runPhysicalCorridor() {
  const routeApi = window.MuzeEnergyRoute
  const model = routeApi?.currentModel ? routeApi.currentModel() : null
  const crossings = physicalNumeric(physicalCrossingsInput)
  const crossingExtraKm = physicalNumeric(physicalCrossingExtraInput)

  if (!model || !model.edgeModels?.length) {
    currentPhysicalModel = null
    physicalStatus.textContent = 'Le pré-tracé thermique doit d’abord produire un modèle valide.'
    window.dispatchEvent(new CustomEvent('muze:physical-updated'))
    return
  }

  if (crossings === null || crossingExtraKm === null || crossings < 0 || crossingExtraKm < 0) {
    currentPhysicalModel = null
    physicalStatus.textContent = 'Vérifier les hypothèses de franchissement : valeurs positives ou nulles.'
    window.dispatchEvent(new CustomEvent('muze:physical-updated'))
    return
  }

  const segmentModels = model.edgeModels.map(edge => {
    const config = corridorConfig(edge)
    const physicalKm = edge.distanceKm * config.factor
    const roundTripM = physicalKm * 1000 * 2
    const pressureDropPa = model.pressureGradient * roundTripM
    const pumpPowerW = model.pumpEfficiency > 0
      ? (pressureDropPa * edge.volumeFlowM3S) / model.pumpEfficiency
      : 0
    return { ...edge, ...config, physicalKm, pumpPowerW }
  })

  const segmentKm = segmentModels.reduce((sum, edge) => sum + edge.physicalKm, 0)
  const crossingsExtraTotalKm = crossings * crossingExtraKm
  const corridorKm = segmentKm + crossingsExtraTotalKm
  const pairedPipeKm = corridorKm * 2
  const deltaPct = model.geoKm > 0 ? ((corridorKm / model.geoKm) - 1) * 100 : 0
  const heatLossMwh = (model.linearLoss * corridorKm * 1000 * model.hours) / 1e6
  const pumpPowerMwSegments = segmentModels.reduce((sum, edge) => sum + edge.pumpPowerW, 0) / 1e6

  const sourceVolumeFlowM3S = model.sourceMassFlowKgS / 980
  const crossingRoundTripM = crossingsExtraTotalKm * 1000 * 2
  const crossingPressureDropPa = model.pressureGradient * crossingRoundTripM
  const crossingPumpPowerMw = model.pumpEfficiency > 0
    ? ((crossingPressureDropPa * sourceVolumeFlowM3S) / model.pumpEfficiency) / 1e6
    : 0
  const pumpPowerMw = pumpPowerMwSegments + crossingPumpPowerMw
  const pumpEnergyMwh = pumpPowerMw * model.hours

  currentPhysicalModel = {
    routeModel: model,
    segmentModels,
    crossings,
    crossingExtraKm,
    crossingsExtraTotalKm,
    corridorKm,
    pairedPipeKm,
    deltaPct,
    heatLossMwh,
    pumpPowerMw,
    pumpEnergyMwh
  }

  physicalGeoResult.textContent = `${physicalNumber.format(model.geoKm)} km`
  physicalCorridorResult.textContent = `${physicalNumber.format(corridorKm)} km`
  physicalDeltaResult.textContent = `+${physicalNumber.format(deltaPct)} %`
  physicalPipeResult.textContent = `${physicalNumber.format(pairedPipeKm)} km`
  physicalHeatLossResult.textContent = formatPhysicalEnergy(heatLossMwh)
  physicalPumpPowerResult.textContent = `${physicalNumber.format(pumpPowerMw)} MWₑ`
  physicalPumpEnergyResult.textContent = formatPhysicalEnergy(pumpEnergyMwh)
  physicalCrossingResult.textContent = `${physicalInteger.format(crossings)} · +${physicalNumber.format(crossingsExtraTotalKm)} km`

  renderPhysicalRows(model)

  physicalStatus.textContent = `${segmentModels.length} segment(s) reclassés : ${physicalNumber.format(model.geoKm)} km géodésiques deviennent ${physicalNumber.format(corridorKm)} km dans ce scénario physique. Les classes et coefficients restent des hypothèses de pré-étude, pas des emprises validées.`
  window.dispatchEvent(new CustomEvent('muze:physical-updated'))
}

runPhysicalButton.addEventListener('click', runPhysicalCorridor)
physicalCrossingsInput.addEventListener('change', runPhysicalCorridor)
physicalCrossingExtraInput.addEventListener('change', runPhysicalCorridor)
window.addEventListener('muze:route-updated', runPhysicalCorridor)

window.MuzeEnergyPhysical = Object.freeze({
  currentModel: () => currentPhysicalModel,
  corridorClasses: CORRIDOR_CLASSES
})

runPhysicalCorridor()

if (!document.querySelector('script[data-economics-layer]')) {
  const economicsScript = document.createElement('script')
  economicsScript.src = './economics.js'
  economicsScript.dataset.economicsLayer = 'true'
  document.body.appendChild(economicsScript)
}
