const SEARCH_API_BASE = 'https://recherche-entreprises.api.gouv.fr/search'
const LOOKUP_KEY = 'muze-x-platform:rgpd:last-entity-lookup'

const form = document.querySelector('#rgpd-lookup-form')
const targetUrlInput = document.querySelector('#target-url')
const queryInput = document.querySelector('#public-entity-query')
const importInput = document.querySelector('#public-entity-import')
const statusNode = document.querySelector('#rgpd-status')
const linksHost = document.querySelector('#public-links')
const resultPanel = document.querySelector('#rgpd-result')
const entityOutput = document.querySelector('#entity-output')
const diagnosticOutput = document.querySelector('#diagnostic-output')
const gaugeHost = document.querySelector('#rgpd-gauge')
const buildLinksButton = document.querySelector('#build-public-links')
const importButton = document.querySelector('#import-public-text')
const clearButton = document.querySelector('#clear-rgpd-output')

function safeText(value, maxLength = 220) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function setStatus(message) {
  if (statusNode) statusNode.textContent = message
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D+/g, '')
}

function maybeUrl(value) {
  const text = String(value || '').trim()
  if (!/^https?:\/\//i.test(text)) return null
  try {
    return new URL(text)
  } catch {
    return null
  }
}

function domainHint(url) {
  if (!url || !url.hostname) return ''
  return url.hostname
    .replace(/^www\./i, '')
    .split('.')
    .slice(0, -1)
    .join(' ')
    .replace(/[-_]+/g, ' ')
    .trim()
}

function extractIdentifiers(text) {
  const source = String(text || '')
  const siretDirect = /\bSIRET\D{0,35}((?:\d[\s.\-]?){14})\b/i.exec(source)
  const sirenDirect = /\bSIREN\D{0,35}((?:\d[\s.\-]?){9})\b/i.exec(source)
  const siretGeneric = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{5}\b/.exec(source)
  const sirenGeneric = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}\b/.exec(source)
  const siret = normalizeDigits(siretDirect ? siretDirect[1] : (siretGeneric ? siretGeneric[0] : ''))
  const siren = normalizeDigits(sirenDirect ? sirenDirect[1] : (siret ? siret.slice(0, 9) : (sirenGeneric ? sirenGeneric[0] : '')))
  return {
    siren: siren.length === 9 ? siren : '',
    siret: siret.length === 14 ? siret : ''
  }
}

function queryFromAnnuaireUrl(url) {
  const match = /\/(?:etablissement|entreprise)\/(\d{9,14})/i.exec(url.pathname)
  if (!match) return null
  const digits = normalizeDigits(match[1])
  return { query: digits, queryType: digits.length === 14 ? 'SIRET' : 'SIREN', source: 'annuaire-url' }
}

function queryFromPappersUrl(url) {
  const search = url.searchParams.get('q') || url.searchParams.get('recherche')
  if (search) return { query: safeText(search, 180), queryType: 'entity_name', source: 'pappers-search-url' }
  const last = url.pathname.split('/').filter(Boolean).pop() || ''
  const digits = normalizeDigits(last)
  if (digits.length === 9 || digits.length === 14) return { query: digits, queryType: digits.length === 14 ? 'SIRET' : 'SIREN', source: 'pappers-url' }
  const cleaned = last.replace(/-\d{9,14}$/g, '').replace(/[-_]+/g, ' ').trim()
  return cleaned ? { query: safeText(cleaned, 180), queryType: 'entity_name', source: 'pappers-url' } : null
}

function buildSeed() {
  const explicit = safeText(queryInput ? queryInput.value : '', 220)
  const target = safeText(targetUrlInput ? targetUrlInput.value : '', 220)
  const raw = explicit || target
  if (!raw) throw new Error('Renseigner une URL, un nom, un SIREN, un SIRET ou un lien public.')

  const url = maybeUrl(raw)
  if (url && url.hostname.includes('annuaire-entreprises.data.gouv.fr')) {
    const annuaire = queryFromAnnuaireUrl(url)
    if (annuaire) return { ...annuaire, raw, pageUrl: url.href }
  }
  if (url && url.hostname.includes('pappers.fr')) {
    const pappers = queryFromPappersUrl(url)
    if (pappers) return { ...pappers, raw, pageUrl: url.href }
  }

  const identifiers = extractIdentifiers(raw)
  if (identifiers.siret) return { query: identifiers.siret, queryType: 'SIRET', source: 'typed-siret', raw }
  if (identifiers.siren) return { query: identifiers.siren, queryType: 'SIREN', source: 'typed-siren', raw }
  if (url) return { query: domainHint(url), queryType: 'domain_hint', source: 'target-url-domain', raw, pageUrl: url.href }

  return { query: raw.replace(/^pappers\//i, '').trim(), queryType: 'entity_name', source: 'typed-public-query', raw }
}

function publicLinks(seed) {
  const query = safeText(seed.query || '', 180)
  const apiUrl = new URL(SEARCH_API_BASE)
  apiUrl.searchParams.set('q', query)
  apiUrl.searchParams.set('per_page', '5')

  const annuaireUrl = new URL('https://annuaire-entreprises.data.gouv.fr/rechercher')
  annuaireUrl.searchParams.set('terme', query)

  const pappersUrl = new URL('https://www.pappers.fr/recherche')
  pappersUrl.searchParams.set('q', query)

  const googleUrl = new URL('https://www.google.com/search')
  googleUrl.searchParams.set('q', `site:pappers.fr ${query}`)

  const links = [
    { label: 'API Recherche d’Entreprises', url: apiUrl.href, type: 'api-open' },
    { label: 'Annuaire Entreprises', url: annuaireUrl.href, type: 'public-web' },
    { label: 'Pappers public', url: pappersUrl.href, type: 'public-web' },
    { label: 'Google → Pappers', url: googleUrl.href, type: 'public-locator' }
  ]

  const digits = normalizeDigits(query)
  if (digits.length === 14) {
    links.unshift({ label: 'Annuaire établissement direct', url: `https://annuaire-entreprises.data.gouv.fr/etablissement/${digits}`, type: 'public-web' })
  }

  return links
}

function renderLinks(links) {
  if (!linksHost) return
  linksHost.innerHTML = ''
  links.forEach(link => {
    const anchor = document.createElement('a')
    anchor.className = 'button secondary'
    anchor.href = link.url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.textContent = link.label
    linksHost.append(anchor)
  })
}

function firstValue(object, keys) {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null && object[key] !== '') return object[key]
  }
  return ''
}

function mapRegistryEntity(result) {
  if (!result) return {}
  const siege = result.siege || result.etablissement_siege || {}
  return {
    name: safeText(firstValue(result, ['nom_complet', 'nom_raison_sociale', 'denomination', 'nom']), 180),
    siren: normalizeDigits(firstValue(result, ['siren'])),
    siret: normalizeDigits(firstValue(result, ['siret']) || firstValue(siege, ['siret'])),
    legalForm: safeText(firstValue(result, ['nature_juridique', 'forme_juridique', 'categorie_entreprise']), 120),
    naf: safeText(firstValue(result, ['activite_principale', 'code_naf']) || firstValue(siege, ['activite_principale', 'code_naf']), 80),
    address: safeText(firstValue(result, ['adresse']) || firstValue(siege, ['adresse']), 220),
    administrativeState: safeText(firstValue(result, ['etat_administratif', 'etat_administratif_unite_legale']) || firstValue(siege, ['etat_administratif']), 80)
  }
}

function extractEntityName(text) {
  const source = String(text || '')
  const patterns = [
    /société\s+([A-ZÀ-Ÿ0-9][A-ZÀ-Ÿ0-9 '&.,\-]{2,80})\s+est\s+une/i,
    /(?:dénomination|denomination|raison sociale)\s*[:\-–]\s*([^\n.;]{3,120})/i,
    /\b([A-ZÀ-Ÿ][A-ZÀ-Ÿ0-9 '&.,\-]{2,60})\s+\([0-9]{9}\)/
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(source)
    if (match) return safeText(match[1], 120)
  }
  return ''
}

function extractLegalForm(text) {
  const match = /\b(SASU?|SARL|EURL|SA|SCI|SCOP|SELARL|EI|EIRL|Association loi 1901|Association)\b/i.exec(String(text || ''))
  return match ? match[1].toUpperCase() : ''
}

function extractActivity(text) {
  const source = String(text || '')
  const naf = /\b(?:NAF|APE)\D{0,20}([0-9]{2}\.?[0-9]{2}[A-Z])\b/i.exec(source)
  const activity = /(?:activité principale déclarée|activite principale declaree|spécialisée dans|specialisee dans|activité déclarée)\s*[:\-–]?\s*([^\n.;]{8,180})/i.exec(source)
  return {
    naf: naf ? naf[1].toUpperCase().replace('.', '') : '',
    activity: activity ? safeText(activity[1], 180) : ''
  }
}

function extractionFromText(text) {
  const ids = extractIdentifiers(text)
  const activity = extractActivity(text)
  return {
    name: extractEntityName(text),
    legalForm: extractLegalForm(text),
    siren: ids.siren,
    siret: ids.siret,
    naf: activity.naf,
    activity: activity.activity,
    source: 'Texte public collé',
    location: 'Import utilisateur local'
  }
}

function ssfStatus({ present, invalid = false, confirmed = false }) {
  if (invalid) return 'UNSAT'
  if (present && confirmed) return 'SAT'
  return 'UNKNOWN'
}

function buildRows(entity, registryFound) {
  const sirenInvalid = Boolean(entity.siren && normalizeDigits(entity.siren).length !== 9)
  const siretInvalid = Boolean(entity.siret && normalizeDigits(entity.siret).length !== 14)
  return [
    ['Dénomination', entity.name, ssfStatus({ present: Boolean(entity.name), confirmed: registryFound })],
    ['Forme juridique', entity.legalForm, ssfStatus({ present: Boolean(entity.legalForm), confirmed: registryFound })],
    ['SIREN', entity.siren, ssfStatus({ present: Boolean(entity.siren), invalid: sirenInvalid, confirmed: registryFound })],
    ['SIRET', entity.siret, ssfStatus({ present: Boolean(entity.siret), invalid: siretInvalid, confirmed: registryFound })],
    ['Adresse', entity.address, ssfStatus({ present: Boolean(entity.address), confirmed: registryFound })],
    ['Activité / NAF', entity.naf || entity.activity, ssfStatus({ present: Boolean(entity.naf || entity.activity), confirmed: registryFound })],
    ['État administratif', entity.administrativeState, ssfStatus({ present: Boolean(entity.administrativeState), confirmed: registryFound })]
  ]
}

function renderResult({ seed, links, entity, registryFound, diagnostic }) {
  if (resultPanel) resultPanel.hidden = false
  const rows = buildRows(entity, registryFound)
  const unknown = rows.filter(row => row[2] === 'UNKNOWN').length
  const unsat = rows.filter(row => row[2] === 'UNSAT').length
  const sat = rows.filter(row => row[2] === 'SAT').length
  const score = Math.min(100, Math.max(0, 20 + (unknown * 6) + (unsat * 18) - (sat * 4)))

  if (gaugeHost) {
    gaugeHost.innerHTML = `<strong>Compteur de vigilance : ${score}%</strong><span>${sat} SAT · ${unsat} UNSAT · ${unknown} UNKNOWN</span>`
  }

  if (entityOutput) {
    const tableRows = rows.map(([label, value, status]) => `
      <tr>
        <th scope="row">${label}</th>
        <td>${value || 'Non renseigné'}</td>
        <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
      </tr>
    `).join('')
    entityOutput.innerHTML = `
      <table class="entity-table">
        <thead><tr><th>Donnée</th><th>Valeur</th><th>SSF-IRS</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `
  }

  if (diagnosticOutput) {
    diagnosticOutput.textContent = JSON.stringify({
      mode: 'platform-rgpd-public-lookup',
      policy: 'NO_ACCOUNT_NO_TOKEN_PUBLIC_IDENTITY_ONLY',
      seed,
      links,
      entity,
      registryFound,
      diagnostic
    }, null, 2)
  }

  try {
    localStorage.setItem(LOOKUP_KEY, JSON.stringify({ at: new Date().toISOString(), seed, links, entity, registryFound }))
  } catch {
    // localStorage may be disabled.
  }
}

async function queryRegistry(seed) {
  const links = publicLinks(seed)
  renderLinks(links)
  const apiLink = links.find(link => link.type === 'api-open')

  try {
    const response = await fetch(apiLink.url, { method: 'GET', credentials: 'omit', mode: 'cors' })
    if (!response.ok) throw new Error(`Réponse API ${response.status}`)
    const payload = await response.json()
    const results = Array.isArray(payload.results) ? payload.results : []
    return { links, selected: results[0] || null, resultCount: results.length, error: '' }
  } catch (error) {
    return { links, selected: null, resultCount: 0, error: error.message || 'API indisponible' }
  }
}

async function runLookup(event) {
  if (event) event.preventDefault()
  try {
    setStatus('Construction des liens publics et requête API ouverte...')
    const seed = buildSeed()
    const registry = await queryRegistry(seed)
    const entity = mapRegistryEntity(registry.selected)
    renderResult({
      seed,
      links: registry.links,
      entity,
      registryFound: Boolean(registry.selected),
      diagnostic: { requestUrl: registry.links.find(link => link.type === 'api-open')?.url || '', resultCount: registry.resultCount, error: registry.error }
    })
    setStatus(registry.selected ? 'Entité récupérée depuis une source publique ouverte.' : 'Liens publics construits. API sans résultat exploitable ou indisponible.')
  } catch (error) {
    setStatus(error.message || 'Recherche impossible.')
  }
}

function runBuildLinks() {
  try {
    const seed = buildSeed()
    const links = publicLinks(seed)
    renderLinks(links)
    renderResult({ seed, links, entity: {}, registryFound: false, diagnostic: { linksOnly: true } })
    setStatus('Liens publics construits sans compte ni jeton.')
  } catch (error) {
    setStatus(error.message || 'Construction impossible.')
  }
}

function runImport() {
  const text = String(importInput ? importInput.value : '').trim()
  if (!text) {
    setStatus('Coller un extrait public avant import.')
    return
  }
  const entity = extractionFromText(text)
  const seed = { query: entity.siret || entity.siren || entity.name || 'texte public collé', queryType: 'pasted-public-text', source: 'user-paste' }
  const links = publicLinks(seed)
  renderLinks(links)
  renderResult({ seed, links, entity, registryFound: false, diagnostic: { pastedTextLength: text.length, registryNotQueried: true } })
  setStatus('Texte public importé localement. Vérification registre disponible via les liens construits.')
}

function clearOutput() {
  if (linksHost) linksHost.innerHTML = ''
  if (entityOutput) entityOutput.innerHTML = ''
  if (gaugeHost) gaugeHost.textContent = ''
  if (diagnosticOutput) diagnosticOutput.textContent = 'Aucun diagnostic affiché.'
  if (resultPanel) resultPanel.hidden = true
  setStatus('Affichage effacé.')
}

if (form) form.addEventListener('submit', runLookup)
if (buildLinksButton) buildLinksButton.addEventListener('click', runBuildLinks)
if (importButton) importButton.addEventListener('click', runImport)
if (clearButton) clearButton.addEventListener('click', clearOutput)
