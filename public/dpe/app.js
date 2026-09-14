const form = document.querySelector('#dpe-form')
const input = document.querySelector('#dpe-number')
const status = document.querySelector('#dpe-status')
const result = document.querySelector('#dpe-result')
const summary = document.querySelector('#dpe-summary')
const xlsxLink = document.querySelector('#xlsx-link')
const addressDetails = document.querySelector('#address-details')
const fullAddress = document.querySelector('#full-address')
const historicalPanel = document.querySelector('#dpe-historical-panel')
const historicalSummary = document.querySelector('#dpe-historical-summary')
const calculationPanel = document.querySelector('#dpe-calculation-panel')
const calculationSummary = document.querySelector('#dpe-calculation-summary')
const fieldsPanel = document.querySelector('#dpe-fields-panel')
const fieldsStatus = document.querySelector('#dpe-fields-status')
const fieldsContainer = document.querySelector('#dpe-fields-container')

const API_ROOT = 'https://data.ademe.fr/data-fair/api/v1/datasets'
const DPE_PATTERN = /^[0-9A-Z]{13}$/
const DATASETS = [
  { id: 'dpe03existant', label: 'Logement existant — depuis juillet 2021', generation: 'current' },
  { id: 'dpe02neuf', label: 'Logement neuf — depuis juillet 2021', generation: 'current' },
  { id: 'dpe01tertiaire', label: 'Tertiaire — depuis juillet 2021', generation: 'current' },
  { id: 'dpe-france', label: 'Logement historique — avant juillet 2021', generation: 'historical' }
]
const metadataCache = new Map()

const CALCULATION_FIELDS = {
  cep: ['conso_5_usages_par_m2_ep', 'conso_5_usages_m2_ep', 'ep_conso_5_usages_m2'],
  ges: ['emission_ges_5_usages_par_m2', 'emission_ges_5_usages_m2'],
  surface: ['surface_reference', 'surface_habitable_logement']
}

function normalize(value) {
  return String(value || '').trim().toUpperCase()
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function isHistoricalDataset(dataset) {
  return dataset?.generation === 'historical' || dataset?.id === 'dpe-france'
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

async function getDatasetMetadata(datasetId) {
  if (metadataCache.has(datasetId)) return metadataCache.get(datasetId)

  const response = await fetch(`${API_ROOT}/${datasetId}`, {
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) throw new Error(`ADEME metadata HTTP ${response.status}`)

  const metadata = await response.json()
  metadataCache.set(datasetId, metadata)
  return metadata
}

function formatSurface(value) {
  if (!hasValue(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString('fr-FR')} m²` : String(value)
}

function formatNumber(value, unit) {
  if (!hasValue(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString('fr-FR')} ${unit}` : String(value)
}

function coarseLocation(row) {
  const postal = row.code_postal_ban || row.code_postal || ''
  const city = row.nom_commune_ban || row.nom_commune || row.commune || ''
  if (postal || city) return `${postal} ${city}`.trim()

  const address = String(row.adresse_ban || row.adresse || row.geo_adresse || '').trim()
  const match = address.match(/\b(\d{5})\s+(.+)$/)
  if (match) return `${match[1]} ${match[2]}`

  const department = row.tv016_departement_code || ''
  const insee = row.code_insee_commune_actualise || ''
  if (department || insee) {
    const parts = []
    if (department) parts.push(`département ${department}`)
    if (insee) parts.push(`code INSEE ${insee}`)
    return parts.join(' · ')
  }

  return address ? 'Localisation disponible' : null
}

function addDefinition(target, label, value, detail = '') {
  if (!target || !hasValue(value)) return
  const wrapper = document.createElement('div')
  const term = document.createElement('dt')
  const description = document.createElement('dd')
  term.textContent = label
  description.textContent = String(value)
  if (detail) {
    const extra = document.createElement('small')
    extra.className = 'muted'
    extra.textContent = ` — ${detail}`
    description.append(extra)
  }
  wrapper.append(term, description)
  target.append(wrapper)
}

function addSummary(label, value, detail = '') {
  addDefinition(summary, label, value, detail)
}

function pickFirst(row, keys) {
  for (const key of keys) {
    if (hasValue(row[key])) return row[key]
  }
  return null
}

function electricityFactorForDate(value) {
  const raw = value ? String(value).slice(0, 10) : new Date().toISOString().slice(0, 10)
  if (raw >= '2027-01-01') return 1.7
  if (raw >= '2026-01-01') return 1.9
  return 2.3
}

function formatIsoDateFr(value) {
  const raw = String(value || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw || null
  const date = new Date(`${raw}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(date)
}

function addTenYears(value) {
  const raw = String(value || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const date = new Date(`${raw}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  date.setUTCFullYear(date.getUTCFullYear() + 10)
  return date.toISOString().slice(0, 10)
}

function historicalValidity(row) {
  const established = String(row.date_etablissement_dpe || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(established)) {
    return { expiry: null, status: 'DPE historique — validité à vérifier à partir de sa date d’établissement' }
  }

  let expiry = null
  let rule = ''

  if (established >= '2013-01-01' && established <= '2017-12-31') {
    expiry = '2022-12-31'
    rule = 'échéance transitoire applicable aux DPE établis de 2013 à 2017'
  } else if (established >= '2018-01-01' && established <= '2021-06-30') {
    expiry = '2024-12-31'
    rule = 'échéance transitoire applicable aux DPE établis du 1er janvier 2018 au 30 juin 2021'
  } else {
    expiry = addTenYears(established)
    rule = 'durée de validité de référence de dix ans ; les DPE les plus anciens sont aujourd’hui expirés'
  }

  const today = new Date().toISOString().slice(0, 10)
  const statusLabel = expiry && today > expiry ? 'Expiré' : 'Validité à vérifier'
  return { expiry, status: statusLabel, rule }
}

function historicalMethodMode(row) {
  const method = `${row.nom_methode_dpe || ''} ${row.version_methode_dpe || ''}`.toLowerCase()
  if (/factur|consommation réelle|consommations réelles/.test(method)) return 'Consommations sur factures / consommations réelles déclarées'
  if (/3cl|th-c-e|thce|convention/.test(method)) return 'Méthode conventionnelle historique déclarée'
  return 'Méthode historique déclarée dans la ligne ADEME'
}

function renderHistorical(row, dataset) {
  if (!historicalPanel || !historicalSummary) return
  if (!isHistoricalDataset(dataset)) {
    historicalPanel.hidden = true
    return
  }

  historicalSummary.innerHTML = ''
  const validity = historicalValidity(row)

  addDefinition(historicalSummary, 'Génération du DPE', 'Avant le 1er juillet 2021')
  addDefinition(historicalSummary, 'Méthode déclarée par l’ADEME', row.nom_methode_dpe)
  addDefinition(historicalSummary, 'Version de méthode', row.version_methode_dpe)
  addDefinition(historicalSummary, 'Mode de lecture', historicalMethodMode(row), 'qualification construite uniquement à partir du libellé de méthode disponible')
  addDefinition(historicalSummary, 'Consommation énergie publiée', formatNumber(row.consommation_energie, 'kWhEP/m²/an'))
  addDefinition(historicalSummary, 'Classe énergie historique', row.classe_consommation_energie)
  addDefinition(historicalSummary, 'Estimation GES publiée', formatNumber(row.estimation_ges, 'kgCO₂e/m²/an'))
  addDefinition(historicalSummary, 'Classe GES historique', row.classe_estimation_ges)
  addDefinition(historicalSummary, 'Statut réglementaire aujourd’hui', validity.status)
  addDefinition(historicalSummary, 'Échéance de validité', formatIsoDateFr(validity.expiry), validity.rule)

  historicalPanel.hidden = false
}

function renderCalculation(row, dataset) {
  if (!calculationPanel || !calculationSummary) return
  if (dataset?.id !== 'dpe03existant') {
    calculationPanel.hidden = true
    return
  }
  calculationSummary.innerHTML = ''

  const cep = pickFirst(row, CALCULATION_FIELDS.cep)
  const ges = pickFirst(row, CALCULATION_FIELDS.ges)
  const surface = pickFirst(row, CALCULATION_FIELDS.surface)
  const establishedFactor = electricityFactorForDate(row.date_etablissement_dpe)
  const currentFactor = electricityFactorForDate()

  addDefinition(calculationSummary, 'Indicateur énergie primaire (5 usages)', formatNumber(cep, 'kWhEP/m²/an'))
  addDefinition(calculationSummary, 'Indicateur émissions (5 usages)', formatNumber(ges, 'kgCO₂e/m²/an'))
  addDefinition(calculationSummary, 'Surface de référence disponible', formatSurface(surface))
  addDefinition(calculationSummary, 'Étiquette DPE publiée', row.etiquette_dpe)
  addDefinition(calculationSummary, 'Étiquette climat publiée', row.etiquette_ges)
  addDefinition(
    calculationSummary,
    'Coefficient EP de l’électricité à la date du DPE',
    establishedFactor,
    'coefficient réglementaire dépendant de la date'
  )
  addDefinition(
    calculationSummary,
    'Coefficient EP de l’électricité au jour de consultation',
    currentFactor,
    currentFactor === establishedFactor ? 'identique à celui affiché ci-dessus' : 'peut différer de celui appliqué lors de l’établissement'
  )

  calculationPanel.hidden = false
}

function schemaLabel(field) {
  return field?.['x-concept']?.title || field?.title || field?.label || field?.key || 'Champ ADEME'
}

function schemaGroup(field) {
  return field?.['x-group'] || 'Autres champs'
}

function schemaDescription(field) {
  const description = String(field?.description || '').trim()
  return description || 'Description non renseignée dans le schéma API ADEME.'
}

function shouldMaskValue(key) {
  return /(^|_)(adresse|nom_rue|numero_voie|complement_adresse|coordonnee|longitude|latitude|geopoint|geo_shape)(_|$)/i.test(key)
}

function displayFieldValue(key, value) {
  if (!hasValue(value)) return '—'
  if (shouldMaskValue(key)) return 'Valeur masquée dans cette vue publique.'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function createFieldDefinition(field, row) {
  const wrapper = document.createElement('div')
  const term = document.createElement('dt')
  const description = document.createElement('dd')
  const key = field.key
  const value = displayFieldValue(key, row[key])

  term.textContent = schemaLabel(field)
  description.append(document.createTextNode(value))

  const metadata = document.createElement('small')
  metadata.className = 'muted'
  metadata.textContent = ` — ${key} · ${field.type || 'type non indiqué'} · ${schemaDescription(field)}`
  description.append(metadata)

  wrapper.append(term, description)
  return wrapper
}

async function renderFieldDictionary(found) {
  if (!fieldsPanel || !fieldsStatus || !fieldsContainer) return

  fieldsPanel.hidden = false
  fieldsStatus.textContent = 'Chargement du dictionnaire de colonnes ADEME…'
  fieldsContainer.innerHTML = ''

  try {
    const metadata = await getDatasetMetadata(found.dataset.id)
    const schema = Array.isArray(metadata.schema) ? metadata.schema : []
    if (!schema.length) throw new Error('Schéma ADEME indisponible')

    const groups = new Map()
    for (const field of schema) {
      if (!field?.key) continue
      const group = schemaGroup(field)
      if (!groups.has(group)) groups.set(group, [])
      groups.get(group).push(field)
    }

    const orderedGroups = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr'))
    for (const [groupName, fields] of orderedGroups) {
      const details = document.createElement('details')
      const title = document.createElement('summary')
      const populated = fields.filter(field => hasValue(found.row[field.key])).length
      title.textContent = `${groupName} — ${fields.length} champs, ${populated} renseignés pour ce DPE`
      details.append(title)

      const list = document.createElement('dl')
      list.className = 'summary-grid'
      for (const field of fields) list.append(createFieldDefinition(field, found.row))
      details.append(list)
      fieldsContainer.append(details)
    }

    fieldsStatus.textContent = `${schema.length} colonnes décrites à partir du schéma API ADEME courant. Les valeurs d’adresse précise et de coordonnées restent masquées.`
  } catch (error) {
    console.error(error)
    fieldsStatus.textContent = 'Le DPE est disponible, mais le dictionnaire de colonnes ADEME ne répond pas actuellement.'
  }
}

function resetExtendedViews() {
  if (historicalPanel) historicalPanel.hidden = true
  if (historicalSummary) historicalSummary.innerHTML = ''
  if (calculationPanel) calculationPanel.hidden = true
  if (calculationSummary) calculationSummary.innerHTML = ''
  if (fieldsPanel) fieldsPanel.hidden = true
  if (fieldsContainer) fieldsContainer.innerHTML = ''
  if (fieldsStatus) fieldsStatus.textContent = ''
}

function render(found, number) {
  const { row, dataset } = found
  summary.innerHTML = ''

  const historical = isHistoricalDataset(dataset)
  const validity = historical ? historicalValidity(row) : null
  const energyLabel = row.etiquette_dpe || row.classe_consommation_energie
  const climateLabel = row.etiquette_ges || row.classe_estimation_ges
  const surface = row.surface_habitable_logement || row.surface_reference || row.surface_thermique_lot
  const buildingType = row.type_batiment || row.tr002_type_batiment_description || row.tr001_modele_dpe_type_libelle

  addSummary('Source', dataset.label)
  addSummary('Jeu ADEME', dataset.id)
  addSummary('Numéro DPE', row.numero_dpe)
  addSummary('Étiquette énergie publiée', energyLabel)
  addSummary('Étiquette climat publiée', climateLabel)
  addSummary('Date d’établissement', row.date_etablissement_dpe)
  addSummary('Fin de validité', historical ? formatIsoDateFr(validity?.expiry) : row.date_fin_validite_dpe, historical ? validity?.rule : '')
  addSummary('Statut réglementaire aujourd’hui', historical ? validity?.status : null)
  addSummary('Méthode déclarée', historical ? row.nom_methode_dpe : null)
  addSummary('Version de méthode', historical ? row.version_methode_dpe : null)
  addSummary('Surface habitable / référence', formatSurface(surface))
  addSummary('Année de construction', row.annee_construction)
  addSummary('Type de bâtiment', buildingType)
  addSummary('Localisation', coarseLocation(row))

  const address = String(row.adresse_ban || row.adresse || row.geo_adresse || '').trim()
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
  renderHistorical(row, dataset)
  renderCalculation(row, dataset)
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
  resetExtendedViews()

  if (!DPE_PATTERN.test(number)) {
    status.textContent = 'Numéro non reconnu. Vérifier les 13 caractères alphanumériques du DPE.'
    return
  }

  status.textContent = 'Recherche dans les jeux publics ADEME, y compris le jeu historique antérieur à juillet 2021…'

  try {
    const found = await lookup(number)
    if (!found) {
      status.textContent = 'Aucun enregistrement exact retrouvé dans les jeux ADEME interrogés.'
      return
    }
    render(found, number)
    status.textContent = isHistoricalDataset(found.dataset)
      ? 'DPE historique retrouvé dans la source publique ADEME. Il est présenté selon son référentiel d’origine et n’est pas assimilé à un DPE 3CL-2021.'
      : 'DPE retrouvé dans la source publique ADEME. Le dictionnaire des colonnes est chargé séparément.'
    await renderFieldDictionary(found)
  } catch (error) {
    console.error(error)
    status.textContent = 'La source ADEME ne répond pas actuellement. Réessayer plus tard ou utiliser l’Observatoire ADEME.'
  }
})
