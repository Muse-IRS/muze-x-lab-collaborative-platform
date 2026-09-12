const applianceList = document.querySelector('#appliance-list')
const powerInput = document.querySelector('#power')
const consumptionInput = document.querySelector('#consumption')
const thermalShift = document.querySelector('#thermal-shift')
const runHouseholdButton = document.querySelector('#run-household')
const loadHouseholdDemoButton = document.querySelector('#load-household-demo')
const householdStatus = document.querySelector('#household-status')
const householdResults = document.querySelector('#household-results')
const staticPowerResult = document.querySelector('#static-power-result')
const dynamicPowerResult = document.querySelector('#dynamic-power-result')
const contractPowerResult = document.querySelector('#contract-power-result')
const thermalPowerResult = document.querySelector('#thermal-power-result')
const powerProfile = document.querySelector('#power-profile')

const dwellingsInput = document.querySelector('#dwellings')
const heatDemandInput = document.querySelector('#heat-demand')
const networkEfficiencyInput = document.querySelector('#network-efficiency')
const boilerEfficiencyInput = document.querySelector('#boiler-efficiency')
const runThermalButton = document.querySelector('#run-thermal')
const thermalStatus = document.querySelector('#thermal-status')
const thermalResults = document.querySelector('#thermal-results')
const usefulHeatResult = document.querySelector('#useful-heat-result')
const sourceHeatResult = document.querySelector('#source-heat-result')
const networkLossResult = document.querySelector('#network-loss-result')
const gasEquivalentResult = document.querySelector('#gas-equivalent-result')
const scalePresetButtons = [...document.querySelectorAll('[data-dwellings]')]

const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

const APPLIANCES = Object.freeze([
  { id: 'fridge', name: 'Réfrigérateur', power: 180, kind: 'cyclé', thermal: false, selected: true },
  { id: 'lighting', name: 'Éclairage', power: 250, kind: 'soir + matin', thermal: false, selected: true },
  { id: 'oven', name: 'Four', power: 2500, kind: 'thermostat', thermal: false, selected: true },
  { id: 'hob', name: 'Plaques de cuisson', power: 3000, kind: 'variable', thermal: false, selected: true },
  { id: 'kettle', name: 'Bouilloire', power: 2000, kind: 'usage bref', thermal: false, selected: true },
  { id: 'washer', name: 'Lave-linge', power: 2000, kind: 'cycle', thermal: false, selected: true },
  { id: 'dishwasher', name: 'Lave-vaisselle', power: 1800, kind: 'cycle', thermal: false, selected: false },
  { id: 'water-heater', name: 'Eau chaude', power: 2400, kind: 'thermique', thermal: true, selected: true },
  { id: 'heating', name: 'Chauffage électrique', power: 4500, kind: 'thermique', thermal: true, selected: true },
  { id: 'ev', name: 'Recharge véhicule', power: 3200, kind: 'nuit', thermal: false, selected: false }
])

let lastHouseholdSeries = null
let lastContractWatts = 6000

function numericValue(input) {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : null
}

function createApplianceCards() {
  applianceList.innerHTML = ''
  APPLIANCES.forEach(appliance => {
    const label = document.createElement('label')
    label.className = `appliance-card${appliance.thermal ? ' is-thermal' : ''}`

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = appliance.selected
    checkbox.dataset.applianceId = appliance.id

    const text = document.createElement('span')
    const title = document.createElement('strong')
    title.textContent = appliance.name
    const meta = document.createElement('span')
    meta.className = 'appliance-meta'
    meta.textContent = `${integer.format(appliance.power)} W · profil temporel prédéfini`
    text.append(title, meta)

    const kind = document.createElement('span')
    kind.className = 'appliance-kind'
    kind.textContent = appliance.kind

    label.append(checkbox, text, kind)
    applianceList.appendChild(label)
  })
}

function selectedAppliances() {
  const selectedIds = new Set(
    [...document.querySelectorAll('[data-appliance-id]:checked')]
      .map(input => input.dataset.applianceId)
  )
  return APPLIANCES.filter(appliance => selectedIds.has(appliance.id))
}

function blankSeries() {
  return Array.from({ length: 96 }, () => 0)
}

function addRange(series, start, end, power, modulation = 1) {
  for (let slot = start; slot < end; slot += 1) {
    const index = ((slot % 96) + 96) % 96
    const factor = typeof modulation === 'function' ? modulation(index) : modulation
    series[index] += power * factor
  }
}

function applianceSeries(appliance) {
  const series = blankSeries()
  const p = appliance.power

  switch (appliance.id) {
    case 'fridge':
      for (let slot = 0; slot < 96; slot += 4) addRange(series, slot, slot + 1, p, 0.92)
      break
    case 'lighting':
      addRange(series, 24, 32, p, 0.65)
      addRange(series, 68, 92, p, slot => 0.55 + ((slot % 4) * 0.1))
      break
    case 'oven':
      addRange(series, 73, 78, p, slot => (slot % 2 === 0 ? 0.95 : 0.58))
      break
    case 'hob':
      addRange(series, 72, 76, p, slot => 0.52 + ((slot % 3) * 0.14))
      break
    case 'kettle':
      addRange(series, 28, 29, p, 0.35)
      addRange(series, 71, 72, p, 0.35)
      break
    case 'washer':
      addRange(series, 39, 47, p, slot => ([39, 40, 43].includes(slot) ? 0.9 : 0.18))
      break
    case 'dishwasher':
      addRange(series, 84, 92, p, slot => ([84, 85, 90].includes(slot) ? 0.88 : 0.16))
      break
    case 'water-heater':
      addRange(series, 5, 14, p, slot => (slot % 3 === 0 ? 1 : 0.72))
      break
    case 'heating':
      addRange(series, 0, 20, p, slot => 0.22 + ((slot % 4) * 0.03))
      addRange(series, 22, 33, p, slot => 0.56 + ((slot % 3) * 0.1))
      addRange(series, 64, 90, p, slot => 0.54 + ((slot % 5) * 0.08))
      addRange(series, 90, 96, p, 0.28)
      break
    case 'ev':
      addRange(series, 88, 96, p, 0.95)
      addRange(series, 0, 8, p, 0.95)
      break
    default:
      break
  }

  return series
}

function sumSeries(appliances, removeThermal = false) {
  const total = blankSeries()
  appliances.forEach(appliance => {
    if (removeThermal && appliance.thermal) return
    const series = applianceSeries(appliance)
    series.forEach((value, index) => { total[index] += value })
  })
  return total
}

function maxSeries(series) {
  return Math.max(...series, 0)
}

function formatPower(watts) {
  return `${number.format(watts / 1000)} kW`
}

function drawProfile(series, contractWatts) {
  const rect = powerProfile.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  powerProfile.width = Math.round(rect.width * ratio)
  powerProfile.height = Math.round(rect.height * ratio)

  const ctx = powerProfile.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, rect.width, rect.height)

  const pad = { left: 48, right: 18, top: 20, bottom: 34 }
  const chartWidth = rect.width - pad.left - pad.right
  const chartHeight = rect.height - pad.top - pad.bottom
  const peak = Math.max(maxSeries(series), contractWatts || 0, 1000)
  const maxScale = Math.ceil(peak / 1000) * 1000

  ctx.font = '12px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 1

  for (let step = 0; step <= 4; step += 1) {
    const y = pad.top + chartHeight - (chartHeight * step / 4)
    const value = maxScale * step / 4
    ctx.strokeStyle = 'rgba(255,255,255,.08)'
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(pad.left + chartWidth, y)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,.52)'
    ctx.fillText(`${number.format(value / 1000)} kW`, 6, y)
  }

  const points = series.map((value, index) => {
    const x = pad.left + (index / 95) * chartWidth
    const y = pad.top + chartHeight - (value / maxScale) * chartHeight
    return { x, y }
  })

  ctx.strokeStyle = 'rgba(84,230,188,.92)'
  ctx.lineWidth = 2
  ctx.beginPath()
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y)
    else ctx.lineTo(point.x, point.y)
  })
  ctx.stroke()

  ctx.fillStyle = 'rgba(84,230,188,.10)'
  ctx.beginPath()
  ctx.moveTo(points[0].x, pad.top + chartHeight)
  points.forEach(point => ctx.lineTo(point.x, point.y))
  ctx.lineTo(points[points.length - 1].x, pad.top + chartHeight)
  ctx.closePath()
  ctx.fill()

  if (contractWatts && contractWatts > 0) {
    const y = pad.top + chartHeight - (contractWatts / maxScale) * chartHeight
    ctx.strokeStyle = 'rgba(112,214,255,.85)'
    ctx.setLineDash([7, 6])
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(pad.left + chartWidth, y)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const hourLabels = [0, 6, 12, 18, 24]
  ctx.fillStyle = 'rgba(255,255,255,.55)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  hourLabels.forEach(hour => {
    const x = pad.left + (hour / 24) * chartWidth
    ctx.fillText(`${hour} h`, x, rect.height - 10)
  })
}

function runHousehold() {
  const selected = selectedAppliances()
  if (!selected.length) {
    householdStatus.textContent = 'Sélectionner au moins un appareil.'
    householdResults.hidden = true
    return
  }

  const contractKva = numericValue(powerInput)
  if (contractKva === null || contractKva <= 0) {
    householdStatus.textContent = 'Renseigner une puissance souscrite positive.'
    householdResults.hidden = true
    return
  }

  const fullSeries = sumSeries(selected, false)
  const shiftedSeries = sumSeries(selected, true)
  const activeSeries = thermalShift.checked ? shiftedSeries : fullSeries
  const staticWatts = selected
    .filter(appliance => !(thermalShift.checked && appliance.thermal))
    .reduce((sum, appliance) => sum + appliance.power, 0)
  const fullPeak = maxSeries(fullSeries)
  const shiftedPeak = maxSeries(shiftedSeries)
  const dynamicPeak = maxSeries(activeSeries)
  const delta = Math.max(0, fullPeak - shiftedPeak)
  const contractWatts = contractKva * 1000

  staticPowerResult.textContent = formatPower(staticWatts)
  dynamicPowerResult.textContent = formatPower(dynamicPeak)
  contractPowerResult.textContent = `${number.format(contractKva)} kVA`
  thermalPowerResult.textContent = selected.some(appliance => appliance.thermal)
    ? `−${number.format(delta / 1000)} kW`
    : '0 kW'

  householdResults.hidden = false
  lastHouseholdSeries = activeSeries
  lastContractWatts = contractWatts
  drawProfile(activeSeries, contractWatts)

  const exceedSlots = activeSeries.filter(value => value > contractWatts).length
  const annualConsumption = numericValue(consumptionInput)
  const annualNote = annualConsumption !== null && annualConsumption >= 0
    ? ` Consommation annuelle saisie : ${integer.format(annualConsumption)} kWh ; elle n’est pas utilisée pour reconstruire artificiellement la pointe.`
    : ''

  if (exceedSlots > 0) {
    householdStatus.textContent = `${exceedSlots} pas de 15 minutes dépassent le repère contractuel dans ce scénario pédagogique.${annualNote}`
  } else {
    householdStatus.textContent = `Aucun pas de 15 minutes ne dépasse le repère contractuel dans ce scénario pédagogique.${annualNote}`
  }
}

function resetHouseholdDemo() {
  document.querySelectorAll('[data-appliance-id]').forEach(input => {
    const appliance = APPLIANCES.find(item => item.id === input.dataset.applianceId)
    input.checked = appliance ? appliance.selected : false
  })
  powerInput.value = '6'
  consumptionInput.value = ''
  thermalShift.checked = false
  runHousehold()
}

function formatEnergy(mwh) {
  if (mwh >= 1000) return `${number.format(mwh / 1000)} GWh/an`
  return `${number.format(mwh)} MWh/an`
}

function runThermal() {
  const dwellings = numericValue(dwellingsInput)
  const heatDemand = numericValue(heatDemandInput)
  const networkEfficiency = numericValue(networkEfficiencyInput)
  const boilerEfficiency = numericValue(boilerEfficiencyInput)

  const invalid = [dwellings, heatDemand, networkEfficiency, boilerEfficiency].some(value => value === null)
    || dwellings <= 0
    || heatDemand <= 0
    || networkEfficiency <= 0
    || networkEfficiency > 100
    || boilerEfficiency <= 0
    || boilerEfficiency > 110

  if (invalid) {
    thermalStatus.textContent = 'Vérifier les hypothèses : valeurs positives, rendements cohérents et rendement réseau inférieur ou égal à 100 %.'
    thermalResults.hidden = true
    return
  }

  const usefulMwh = dwellings * heatDemand
  const sourceMwh = usefulMwh / (networkEfficiency / 100)
  const lossesMwh = sourceMwh - usefulMwh
  const gasEquivalentMwh = usefulMwh / (boilerEfficiency / 100)
  const lossShare = sourceMwh > 0 ? (lossesMwh / sourceMwh) * 100 : 0

  usefulHeatResult.textContent = formatEnergy(usefulMwh)
  sourceHeatResult.textContent = formatEnergy(sourceMwh)
  networkLossResult.textContent = `${formatEnergy(lossesMwh)} · ${number.format(lossShare)} %`
  gasEquivalentResult.textContent = formatEnergy(gasEquivalentMwh)
  thermalResults.hidden = false

  thermalStatus.textContent = `${integer.format(dwellings)} logements × ${number.format(heatDemand)} MWhₜₕ utiles/an, avec ${number.format(networkEfficiency)} % de rendement de distribution.`
}

scalePresetButtons.forEach(button => {
  button.addEventListener('click', () => {
    dwellingsInput.value = button.dataset.dwellings
    runThermal()
  })
})

runHouseholdButton.addEventListener('click', runHousehold)
loadHouseholdDemoButton.addEventListener('click', resetHouseholdDemo)
thermalShift.addEventListener('change', runHousehold)
runThermalButton.addEventListener('click', runThermal)

window.addEventListener('resize', () => {
  if (lastHouseholdSeries) drawProfile(lastHouseholdSeries, lastContractWatts)
})

createApplianceCards()
runHousehold()
runThermal()
