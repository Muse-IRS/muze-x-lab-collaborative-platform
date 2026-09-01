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
  status.textContent = 'Valeurs effacées. Aucun calcul effectué.'
})

updateFields()
