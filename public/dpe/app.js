const form = document.querySelector('#dpe-form')
const input = document.querySelector('#dpe-number')
const status = document.querySelector('#dpe-status')
const result = document.querySelector('#dpe-result')
const summary = document.querySelector('#dpe-summary')
const xlsxLink = document.querySelector('#xlsx-link')
const addressDetails = document.querySelector('#address-details')
const fullAddress = document.querySelector('#full-address')

const API_ROOT = 'https://data.ademe.fr/data-fair/api/v1/datasets'
const DPE_PATTERN = /^\d{4}[A-Z]\d{7}[A-Z]$/
const DATASETS = [
  { id: 'dpe03existant', label: 'Logement existant' },
  { id: 'dpe02neuf', label: 'Logement neuf' },
  { id: 'dpe01tertiaire', label: 'Tertiaire' }
]

function normalize(value) {
  return String(value || '').trim().toUpperCase()
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function buildUrl(datasetId, number, format = '') {
  const params = new URLSearchParams({ size: '1', numero_dpe_in: number })
  if (format) params.set('format', format)
  return `${API_ROOT}/${datasetId}/lines?${params.toString()}`
}

async function queryDataset(dataset, number) {
  let response = await fetch(buildUrl(dataset.id, number), {
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    const fallback = new URLSearchParams({ size: '1', q: number, q_fields: 'numero_dpe' })
    response = await fetch(`${API_ROOT}/${dataset.id}/lines?${fallback.toString()}`, {
      headers: { Accept: 'application/json' }
    })
  }

  if (!response.ok) throw new Error(`ADEME HTTP ${response.status}`)

  const payload = await response.json()
  const rows = Array.isArray(payload.results) ? payload.results : []
  const row = rows.find(item => normalize(item.numero_dpe) === number)
  return row ? { row, dataset } : null
}

function formatSurface(value) {
  if (!hasValue(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString('fr-FR')} m²` : String(value)
}

function coarseLocation(row) {
  const postal = row.code_postal_ban || row.code_postal || ''
  const city = row.nom_commune_ban || row.nom_commune || row.commune || ''
  if (postal || city) return `${postal} ${city}`.trim()

  const address = String(row.adresse_ban || row.adresse || '').trim()
  const match = address.match(/\b(\d{5})\s+(.+)$/)
  return match ? `${match[1]} ${match[2]}` : address ? 'Localisation disponible' : null
}

function addSummary(label, value) {
  if (!hasValue(value)) return
  const wrapper = document.createElement('div')
  const term = document.createElement('dt')
  const description = document.createElement('dd')
  term.textContent = label
  description.textContent = String(value)
  wrapper.append(term, description)
  summary.append(wrapper)
}

function render(found, number) {
  const { row, dataset } = found
  summary.innerHTML = ''

  addSummary('Source', dataset.label)
  addSummary('Numéro DPE', row.numero_dpe)
  addSummary('Classe énergie', row.etiquette_dpe)
  addSummary('Classe climat', row.etiquette_ges)
  addSummary('Date d’établissement', row.date_etablissement_dpe)
  addSummary('Fin de validité', row.date_fin_validite_dpe)
  addSummary('Surface habitable', formatSurface(row.surface_habitable_logement || row.surface_reference))
  addSummary('Année de construction', row.annee_construction)
  addSummary('Type de bâtiment', row.type_batiment)
  addSummary('Localisation', coarseLocation(row))

  const address = String(row.adresse_ban || row.adresse || '').trim()
  if (address) {
    fullAddress.textContent = address
    addressDetails.hidden = false
    addressDetails.open = false
  } else {
    fullAddress.textContent = ''
    addressDetails.hidden = true
  }

  xlsxLink.href = buildUrl(dataset.id, number, 'xlsx')
  xlsxLink.hidden = false
  result.hidden = false
}

async function lookup(number) {
  for (const dataset of DATASETS) {
    const found = await queryDataset(dataset, number)
    if (found) return found
  }
  return null
}

form.addEventListener('submit', async event => {
  event.preventDefault()
  const number = normalize(input.value)
  input.value = number
  result.hidden = true
  xlsxLink.hidden = true
  addressDetails.hidden = true

  if (!DPE_PATTERN.test(number)) {
    status.textContent = 'Numéro non reconnu. Vérifier les 13 caractères du DPE.'
    return
  }

  status.textContent = 'Recherche dans les jeux publics ADEME…'

  try {
    const found = await lookup(number)
    if (!found) {
      status.textContent = 'Aucun enregistrement exact retrouvé dans les jeux ADEME interrogés.'
      return
    }
    render(found, number)
    status.textContent = 'DPE retrouvé dans la source publique ADEME.'
  } catch (error) {
    console.error(error)
    status.textContent = 'La source ADEME ne répond pas actuellement. Réessayer plus tard ou utiliser l’Observatoire ADEME.'
  }
})
