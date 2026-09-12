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
      const next = { classId, factor: CORRIDOR_CLASSES[classId].factor }
      physicalOverrides.set(key, next)
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
    physicalStatus.textContent = 'Le pré-tracé thermique doit d’abord produire un modèle valide.'
    return
  }

  if (crossings === null || crossingExtraKm === null || crossings < 0 || crossingExtraKm < 0) {
    physicalStatus.textContent = 'Vérifier les hypothèses de franchissement : valeurs positives ou nulles.'
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

  // Franchissements ajoutés hors des segments : approximation conservatrice au débit source.
  const sourceVolumeFlowM3S = model.sourceMassFlowKgS / 980
  const crossingRoundTripM = crossingsExtraTotalKm * 1000 * 2
  const crossingPressureDropPa = model.pressureGradient * crossingRoundTripM
  const crossingPumpPowerMw = model.pumpEfficiency > 0
    ? ((crossingPressureDropPa * sourceVolumeFlowM3S) / model.pumpEfficiency) / 1e6
    : 0
  const pumpPowerMw = pumpPowerMwSegments + crossingPumpPowerMw
  const pumpEnergyMwh = pumpPowerMw * model.hours

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
}

runPhysicalButton.addEventListener('click', runPhysicalCorridor)
physicalCrossingsInput.addEventListener('change', runPhysicalCorridor)
physicalCrossingExtraInput.addEventListener('change', runPhysicalCorridor)
window.addEventListener('muze:route-updated', runPhysicalCorridor)
runPhysicalCorridor()
