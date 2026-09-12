const territoryList = document.querySelector('#territory-list')
const territoryHeatDemand = document.querySelector('#territory-heat-demand')
const territoryEfficiency = document.querySelector('#territory-efficiency')
const territorySourceMw = document.querySelector('#territory-source-mw')
const territoryHours = document.querySelector('#territory-hours')
const territoryBoilerEfficiency = document.querySelector('#territory-boiler-efficiency')
const runTerritoryButton = document.querySelector('#run-territory')
const territoryStatus = document.querySelector('#territory-status')
const territoryResults = document.querySelector('#territory-results')
const territoryHouseholdsResult = document.querySelector('#territory-households-result')
const territoryUsefulResult = document.querySelector('#territory-useful-result')
const territorySourceResult = document.querySelector('#territory-source-result')
const territoryLossResult = document.querySelector('#territory-loss-result')
const territoryCoverageResult = document.querySelector('#territory-coverage-result')
const territoryGasResult = document.querySelector('#territory-gas-result')
const territoryElectricResult = document.querySelector('#territory-electric-result')
const territorySourcePresets = [...document.querySelectorAll('[data-territory-source-mw]')]

const territoryNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const territoryInteger = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

const TERRITORIES = Object.freeze([
  { id: 'saint-clair-rhone', name: 'Saint-Clair-du-Rhône', households: 1649, selected: true },
  { id: 'saint-maurice-exil', name: 'Saint-Maurice-l’Exil', households: 2690, selected: true },
  { id: 'peage-roussillon', name: 'Le Péage-de-Roussillon', households: 2675, selected: true },
  { id: 'roussillon', name: 'Roussillon', households: 3726, selected: true },
  { id: 'salaise-sanne', name: 'Salaise-sur-Sanne', households: 1946, selected: true },
  { id: 'saint-rambert', name: 'Saint-Rambert-d’Albon', households: 2673, selected: true }
])

const BEZNAU_ELECTRIC_OPPORTUNITY_RATIO = 10 / 80

function territoryNumeric(input) {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : null
}

function territoryFormatEnergy(mwh) {
  if (mwh >= 1000) return `${territoryNumber.format(mwh / 1000)} GWh/an`
  return `${territoryNumber.format(mwh)} MWh/an`
}

function createTerritoryCards() {
  territoryList.innerHTML = ''
  TERRITORIES.forEach(place => {
    const label = document.createElement('label')
    label.className = 'territory-place'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = place.selected
    checkbox.dataset.territoryId = place.id

    const text = document.createElement('span')
    const title = document.createElement('strong')
    title.textContent = place.name
    const meta = document.createElement('span')
    meta.textContent = 'INSEE · ménages 2023'
    text.append(title, meta)

    const households = document.createElement('span')
    households.className = 'households'
    households.textContent = `${territoryInteger.format(place.households)} ménages`

    label.append(checkbox, text, households)
    territoryList.appendChild(label)
  })
}

function selectedTerritories() {
  const selectedIds = new Set(
    [...document.querySelectorAll('[data-territory-id]:checked')]
      .map(input => input.dataset.territoryId)
  )
  return TERRITORIES.filter(place => selectedIds.has(place.id))
}

function runTerritory() {
  const selected = selectedTerritories()
  const heatDemand = territoryNumeric(territoryHeatDemand)
  const efficiency = territoryNumeric(territoryEfficiency)
  const sourceMw = territoryNumeric(territorySourceMw)
  const hours = territoryNumeric(territoryHours)
  const boilerEfficiency = territoryNumeric(territoryBoilerEfficiency)

  const invalid = !selected.length
    || [heatDemand, efficiency, sourceMw, hours, boilerEfficiency].some(value => value === null)
    || heatDemand <= 0
    || efficiency <= 0
    || efficiency > 100
    || sourceMw <= 0
    || hours <= 0
    || hours > 8760
    || boilerEfficiency <= 0
    || boilerEfficiency > 110

  if (invalid) {
    territoryStatus.textContent = 'Sélectionner au moins une commune et vérifier les hypothèses : valeurs positives, rendements cohérents et heures inférieures ou égales à 8 760.'
    territoryResults.hidden = true
    return
  }

  const households = selected.reduce((sum, place) => sum + place.households, 0)
  const usefulMwh = households * heatDemand
  const sourceRequiredMwh = usefulMwh / (efficiency / 100)
  const networkLossMwh = sourceRequiredMwh - usefulMwh
  const sourceCapacityMwh = sourceMw * hours
  const coverage = sourceRequiredMwh > 0 ? (sourceCapacityMwh / sourceRequiredMwh) * 100 : 0
  const gasEquivalentMwh = usefulMwh / (boilerEfficiency / 100)

  // Benchmark only: the IAEA Beznau case reports ~10 MWe less electrical output
  // for ~80 MWth of district-heat load per unit. This ratio is not a Saint-Alban measurement.
  const electricOpportunityMw = sourceMw * BEZNAU_ELECTRIC_OPPORTUNITY_RATIO
  const electricOpportunityMwh = electricOpportunityMw * hours

  territoryHouseholdsResult.textContent = territoryInteger.format(households)
  territoryUsefulResult.textContent = territoryFormatEnergy(usefulMwh)
  territorySourceResult.textContent = territoryFormatEnergy(sourceRequiredMwh)
  territoryLossResult.textContent = territoryFormatEnergy(networkLossMwh)
  territoryCoverageResult.textContent = `${territoryNumber.format(coverage)} %`
  territoryGasResult.textContent = territoryFormatEnergy(gasEquivalentMwh)
  territoryElectricResult.textContent = `${territoryNumber.format(electricOpportunityMw)} MWₑ · ${territoryFormatEnergy(electricOpportunityMwh)}`
  territoryResults.hidden = false

  const capacityNote = coverage >= 100
    ? 'La capacité thermique testée couvre l’énergie annuelle du scénario sur le nombre d’heures saisi ; cela ne démontre pas que la pointe hivernale, le tracé ou les températures sont compatibles.'
    : 'La capacité thermique testée ne couvre pas l’énergie annuelle du scénario sur le nombre d’heures saisi.'

  territoryStatus.textContent = `${selected.length} commune(s), ${territoryInteger.format(households)} ménages : ${capacityNote}`
}

territoryList.addEventListener('change', runTerritory)
runTerritoryButton.addEventListener('click', runTerritory)

territorySourcePresets.forEach(button => {
  button.addEventListener('click', () => {
    territorySourceMw.value = button.dataset.territorySourceMw
    runTerritory()
  })
})

createTerritoryCards()
runTerritory()
