const form = document.querySelector('#energy-form')
const option = document.querySelector('#option')
const baseField = document.querySelector('#base-field')
const hpField = document.querySelector('#hp-field')
const hcField = document.querySelector('#hc-field')
const hcShareField = document.querySelector('#hc-share-field')
const status = document.querySelector('#energy-status')
const result = document.querySelector('#energy-result')
const powerResult = document.querySelector('#power-result')
const consumptionResult = document.querySelector('#consumption-result')
const costResult = document.querySelector('#cost-result')
const costNote = document.querySelector('#cost-note')
const resetButton = document.querySelector('#reset-button')

const compareButton = document.querySelector('#compare-power')
const demoButton = document.querySelector('#select-demo')
const compareStatus = document.querySelector('#compare-status')
const comparisonResult = document.querySelector('#power-comparison-result')
const staticPowerResult = document.querySelector('#static-power-result')
const dynamicPowerResult = document.querySelector('#dynamic-power-result')
const subscribedPowerResult = document.querySelector('#subscribed-power-result')
const powerGapResult = document.querySelector('#power-gap-result')
const bars = document.querySelector('#power-bars')
const subscribedLine = document.querySelector('#subscribed-line')
const subscribedLineLabel = document.querySelector('#subscribed-line-label')
const comparisonExplanation = document.querySelector('#comparison-explanation')
const appliances = [...document.querySelectorAll('[data-appliance]')]

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

function numericValue(id) {
  const element = document.querySelector(id)
  const raw = element.value.trim()
  if (raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function updateFields() {
  const mode = option.value
  baseField.hidden = mode !== 'base'
  hpField.hidden = mode !== 'hphc'
  hcField.hidden = mode !== 'hphc'
  hcShareField.hidden = mode !== 'hphc'
}

function estimateCost(consumption, mode) {
  const subscription = numericValue('#subscription')
  const fixed = subscription === null ? 0 : subscription

  if (mode === 'base') {
    const price = numericValue('#base-price')
    if (price === null || price < 0) return null
    return {
      amount: fixed + consumption * price,
      note: subscription === null
        ? 'Estimation calculée hors abonnement annuel, non renseigné.'
        : 'Estimation calculée avec l’abonnement annuel et le prix du kWh saisis.'
    }
  }

  if (mode === 'hphc') {
    const hp = numericValue('#hp-price')
    const hc = numericValue('#hc-price')
    const share = numericValue('#hc-share')
    if (hp === null || hc === null || share === null || share < 0 || share > 100) return null

    const hcEnergy = consumption * (share / 100)
    const hpEnergy = consumption - hcEnergy
    return {
      amount: fixed + hpEnergy * hp + hcEnergy * hc,
      note: subscription === null
        ? 'Estimation HP/HC calculée hors abonnement annuel, non renseigné.'
        : 'Estimation calculée avec la répartition HP/HC et les prix saisis.'
    }
  }

  return null
}

function selectedAppliances() {
  return appliances.filter(input => input.checked).map(input => ({
    name: input.dataset.name,
    power: Number(input.dataset.power),
    duty: Number(input.dataset.duty)
  }))
}

function deterministicSeries(items, slots = 24) {
  const series = Array.from({ length: slots }, () => 0)

  items.forEach((item, index) => {
    const activeSlots = Math.max(1, Math.round(slots * item.duty))
    const step = Math.max(1, Math.floor(slots / activeSlots))
    const offset = (index * 5 + Math.round(item.duty * 10)) % slots

    for (let n = 0; n < activeSlots; n += 1) {
      const slot = (offset + n * step) % slots
      const modulation = 0.78 + (((slot + index * 3) % 5) * 0.055)
      series[slot] += item.power * Math.min(1, modulation)
    }
  })

  return series
}

function renderBars(series, subscribedWatts) {
  bars.innerHTML = ''
  const maxValue = Math.max(...series, subscribedWatts || 0, 1)

  series.forEach(value => {
    const bar = document.createElement('div')
    bar.className = 'power-bar'
    if (subscribedWatts && value > subscribedWatts) bar.classList.add('is-over')
    bar.style.height = `${Math.max(4, (value / maxValue) * 100)}%`
    bar.title = `${Math.round(value)} W`
    bars.appendChild(bar)
  })

  if (subscribedWatts) {
    const position = 100 - ((subscribedWatts / maxValue) * 100)
    subscribedLine.hidden = false
    subscribedLineLabel.hidden = false
    subscribedLine.style.top = `${Math.min(98, Math.max(2, position))}%`
    subscribedLineLabel.style.top = `${Math.min(98, Math.max(2, position))}%`
    subscribedLineLabel.textContent = `${number.format(subscribedWatts / 1000)} kVA saisis`
  } else {
    subscribedLine.hidden = true
    subscribedLineLabel.hidden = true
  }
}

function comparePower() {
  const selected = selectedAppliances()
  if (!selected.length) {
    compareStatus.textContent = 'Sélectionner au moins un appareil.'
    comparisonResult.hidden = true
    return
  }

  const staticWatts = selected.reduce((sum, item) => sum + item.power, 0)
  const series = deterministicSeries(selected)
  const dynamicWatts = Math.max(...series)
  const subscribedKva = numericValue('#power')
  const subscribedWatts = subscribedKva && subscribedKva > 0 ? subscribedKva * 1000 : null
  const gap = staticWatts - dynamicWatts
  const reduction = staticWatts > 0 ? (gap / staticWatts) * 100 : 0

  staticPowerResult.textContent = `${number.format(staticWatts / 1000)} kW`
  dynamicPowerResult.textContent = `${number.format(dynamicWatts / 1000)} kW`
  subscribedPowerResult.textContent = subscribedKva && subscribedKva > 0 ? `${number.format(subscribedKva)} kVA` : 'Non renseignée'
  powerGapResult.textContent = `${number.format(gap / 1000)} kW (${number.format(reduction)} %) `

  renderBars(series, subscribedWatts)

  if (subscribedWatts) {
    const exceedCount = series.filter(value => value > subscribedWatts).length
    comparisonExplanation.innerHTML = exceedCount === 0
      ? `<strong>Lecture :</strong> la somme statique atteint ${number.format(staticWatts / 1000)} kW, alors que le pic du scénario temporel est de ${number.format(dynamicWatts / 1000)} kW. Dans ce scénario pédagogique, aucune des 24 séquences ne dépasse la puissance saisie.`
      : `<strong>Lecture :</strong> la somme statique atteint ${number.format(staticWatts / 1000)} kW et le pic temporel ${number.format(dynamicWatts / 1000)} kW. ${exceedCount} séquence(s) simulée(s) dépassent la puissance saisie : une mesure réelle reste nécessaire avant toute conclusion.`
  } else {
    comparisonExplanation.innerHTML = `<strong>Lecture :</strong> la somme statique atteint ${number.format(staticWatts / 1000)} kW, contre ${number.format(dynamicWatts / 1000)} kW pour le pic temporel simulé. Renseigner la puissance souscrite plus haut permet d’ajouter un repère horizontal.`
  }

  comparisonResult.hidden = false
  compareStatus.textContent = 'Comparaison calculée localement dans le navigateur.'
}

function loadDemo() {
  const demoNames = new Set(['Four', 'Bouilloire', 'Lave-linge', 'Réfrigérateur', 'Éclairage'])
  appliances.forEach(input => { input.checked = demoNames.has(input.dataset.name) })
  if (!document.querySelector('#power').value) document.querySelector('#power').value = '6'
  comparePower()
}

option.addEventListener('change', updateFields)

form.addEventListener('submit', event => {
  event.preventDefault()

  const power = numericValue('#power')
  const consumption = numericValue('#consumption')

  if (power === null || power <= 0 || consumption === null || consumption < 0) {
    status.textContent = 'Renseigner une puissance positive et une consommation annuelle valide.'
    result.hidden = true
    return
  }

  powerResult.textContent = `${number.format(power)} kVA`
  consumptionResult.textContent = `${number.format(consumption)} kWh/an`

  const estimate = estimateCost(consumption, option.value)
  if (estimate) {
    costResult.textContent = `${euro.format(estimate.amount)}/an`
    costNote.textContent = `${estimate.note} Cette estimation ne constitue pas une facture fournisseur.`
  } else {
    costResult.textContent = 'Non calculée'
    costNote.textContent = option.value === 'unknown'
      ? 'Aucun calcul de coût demandé. Les valeurs de puissance et de consommation restent affichées séparément.'
      : 'Les informations tarifaires nécessaires sont incomplètes.'
  }

  result.hidden = false
  status.textContent = 'Résultat calculé localement dans le navigateur.'
})

resetButton.addEventListener('click', () => {
  form.reset()
  updateFields()
  result.hidden = true
  comparisonResult.hidden = true
  status.textContent = 'Valeurs effacées. Aucun calcul effectué.'
  compareStatus.textContent = 'Sélectionner des appareils puis lancer la comparaison.'
})

compareButton.addEventListener('click', comparePower)
demoButton.addEventListener('click', loadDemo)

updateFields()
