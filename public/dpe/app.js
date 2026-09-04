const form = document.querySelector('#dpe-form')
const input = document.querySelector('#dpe-number')
const status = document.querySelector('#dpe-status')
const result = document.querySelector('#dpe-result')
const summary = document.querySelector('#dpe-summary')
const xlsxLink = document.querySelector('#xlsx-link')
const addressDetails = document.querySelector('#address-details')
const fullAddress = document.querySelector('#full-address')
const detailGroups = document.querySelector('#dpe-detail-groups')

const detailTargets = {
  building: document.querySelector('#dpe-building'),
  envelope: document.querySelector('#dpe-envelope'),
  windows: document.querySelector('#dpe-windows'),
  systems: document.querySelector('#dpe-systems'),
  energy: document.querySelector('#dpe-energy'),
  other: document.querySelector('#dpe-other')
}

const API_ROOT = 'https://data.ademe.fr/data-fair/api/v1/datasets'
const DPE_PATTERN = /^\d{4}[A-Z]\d{7}[A-Z]$/
const DATASETS = [
  { id: 'dpe03existant', label: 'Logement existant' },
  { id: 'dpe02neuf', label: 'Logement neuf' },
  { id: 'dpe01tertiaire', label: 'Tertiaire' }
]

const SUMMARY_KEYS = new Set([
  'numero_dpe', 'etiquette_dpe', 'etiquette_ges', 'date_etablissement_dpe',
  'date_fin_validite_dpe', 'surface_habitable_logement', 'surface_reference',
  'annee_construction', 'type_batiment', 'adresse_ban', 'adresse', 'code_postal_ban',
  'code_postal', 'nom_commune_ban', 'nom_commune', 'commune'
])

const GROUP_PATTERNS = {
  building: /(surface|hauteur|niveau|logement|immeuble|batiment|bâtiment|construction|inertie|mitoyen|volume|orientation)/i,
  envelope: /(mur|plancher|toiture|combles|isolation|enveloppe|deperdition|déperdition|pont_therm|pont therm|u_)/i,
  windows: /(fenetre|fenêtre|menuiser|vitrage|baie|porte_fenetre|porte fenêtre|uw|sw|double|triple)/i,
  systems: /(chauff|chaudi|generateur|générateur|ecs|eau_chaude|eau chaude|ventil|vmc|clim|refroid|pac|pompe|emetteur|émetteur)/i,
  energy: /(conso|consomm|energie|énergie|ges|co2|cout|coût|depense|dépense|emission|émission|primaire|finale|kwh)/i
}

const ADDRESS_KEY_PATTERN = /(adresse|ban|longitude|latitude|coord|geo|code_insee|code_postal|commune)/i
const TECHNICAL_KEY_PATTERN = /^(_|id$|id_|_id$|geometry$|geo_shape$|geo_point_2d$)/i

function normalize(value) {
  return String(value || '').trim().toUpperCase()
}

function hasValue(value) {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
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
  const numeric = Number(value)
  return Number.isFinite(numeric) ? `${numeric.toLocaleString('fr-FR')} m²` : String(value)
}

function formatValue(value) {
  if (!hasValue(value)) return null
  if (typeof value === 'number') return value.toLocaleString('fr-FR')
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function humanizeKey(key) {
  return key
    .replace(/^_/g, '')
    .replace(/_/g, ' ')
    .replace(/\b([a-z])/g, letter => letter.toUpperCase())
    .replace(/Dpe\b/g, 'DPE')
    .replace(/Ges\b/g, 'GES')
    .replace(/Ecs\b/g, 'ECS')
    .replace(/Vmc\b/g, 'VMC')
}

function coarseLocation(row) {
  const postal = row.code_postal_ban || row.code_postal || ''
  const city = row.nom_commune_ban || row.nom_commune || row.commune || ''
  if (postal || city) return `${postal} ${city}`.trim()

  const address = String(row.adresse_ban || row.adresse || '').trim()
  const match = address.match(/\b(\d{5})\s+(.+)$/)
  return match ? `${match[1]} ${match[2]}` : address ? 'Localisation disponible' : null
}

function addEntry(target, label, value) {
  const formatted = formatValue(value)
  if (!formatted) return false
  const wrapper = document.createElement('div')
  const term = document.createElement('dt')
  const description = document.createElement('dd')
  term.textContent = label
  description.textContent = formatted
  wrapper.append(term, description)
  target.append(wrapper)
  return true
}

function addSummary(label, value) {
  return addEntry(summary, label, value)
}

function clearDetails() {
  Object.values(detailTargets).forEach(target => {
    target.innerHTML = ''
  })
  detailGroups.hidden = true
}

function classifyKey(key) {
  for (const [group, pattern] of Object.entries(GROUP_PATTERNS)) {
    if (pattern.test(key)) return group
  }
  return 'other'
}

function renderDetails(row) {
  clearDetails()
  let rendered = 0

  for (const [key, value] of Object.entries(row)) {
    if (!hasValue(value) || SUMMARY_KEYS.has(key)) continue
    if (ADDRESS_KEY_PATTERN.test(key) || TECHNICAL_KEY_PATTERN.test(key)) continue

    const group = classifyKey(key)
    if (addEntry(detailTargets[group], humanizeKey(key), value)) rendered += 1
  }

  detailGroups.hidden = rendered === 0
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

  renderDetails(row)

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
  clearDetails()

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
    status.textContent = 'DPE retrouvé dans la source publique ADEME. Résumé et caractéristiques disponibles affichés.'
  } catch (error) {
    console.error(error)
    status.textContent = 'La source ADEME ne répond pas actuellement. Réessayer plus tard ou utiliser l’Observatoire ADEME.'
  }
})
