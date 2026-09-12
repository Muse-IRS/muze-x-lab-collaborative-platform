const SAINT_ALBAN_EVIDENCE = Object.freeze({
  coolingWater2025Mm3: [346, 312, 345, 334, 329, 189, 178, 224, 309, 336, 335, 346],
  months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  sources: Object.freeze({
    edfEnvironment2025: 'https://www.edf.fr/sites/groupe/files/2026-06/Rapport%20Environnemental%20Annuel%20SAL%202025_0.pdf',
    asnrThermal: 'https://www.asnr.fr/rejets-thermiques-des-centrales-nucleaires-pendant-les-periodes-estivales',
    mraeRhoneVareze: 'https://www.mrae.developpement-durable.gouv.fr/IMG/pdf/20260324_apara2018_cadrage_zaerhonevareze_saintmauricelexilclonassurvareze_38_delibere.pdf',
    osirisNetwork: 'https://france-chaleur-urbaine.beta.gouv.fr/reseaux/3823C',
    osirisServices: 'https://www.osiris-gie.com/nos-services',
    irsn1300: 'https://www.irsn.fr/sites/default/files/documents/larecherche/publications-documentation/collection-ouvrages-irsn/6_LAG_chap02.pdf',
    inseeSaintMaurice: 'https://www.insee.fr/fr/statistiques/2011101?geo=COM-38425'
  })
})

function evidenceLink(label, href) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
}

function mountEvidenceUi() {
  if (document.querySelector('#preuves-reelles')) return

  if (!document.querySelector('link[href="./evidence.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = './evidence.css'
    document.head.appendChild(link)
  }

  const nav = document.querySelector('.energy-local-nav')
  if (nav && !nav.querySelector('a[href="#preuves-reelles"]')) {
    const anchor = document.createElement('a')
    anchor.href = '#preuves-reelles'
    anchor.textContent = 'Preuves réelles'
    const limitsLink = nav.querySelector('a[href="#limites"]')
    nav.insertBefore(anchor, limitsLink || null)
  }

  const limits = document.querySelector('#limites')
  if (!limits) return

  const s = SAINT_ALBAN_EVIDENCE.sources
  const section = document.createElement('section')
  section.id = 'preuves-reelles'
  section.className = 'panel evidence-anchor'
  section.setAttribute('aria-labelledby', 'evidence-title')
  section.innerHTML = `
    <p class="eyebrow">11 · Remplacer les hypothèses par des preuves</p>
    <h2 id="evidence-title">Saint-Alban : registre probatoire vivant du modèle thermique.</h2>
    <p>Cette couche ne cherche plus à enrichir le modèle par une nouvelle équation. Elle classe chaque variable en <strong>prouvée</strong>, <strong>partiellement documentée</strong> ou <strong>encore ouverte</strong>, puis empêche une donnée réelle d’être confondue avec une hypothèse de simulation.</p>

    <div class="evidence-summary">
      <article><strong>4</strong><span>blocs déjà prouvés par des sources publiques spécifiques au territoire ou au site.</span></article>
      <article><strong>2</strong><span>blocs partiellement documentés : la physique existe, mais pas encore la donnée Saint-Alban nécessaire au projet.</span></article>
      <article><strong>4</strong><span>blocs toujours ouverts : devis, emprises opposables, contrat/financement et soutirage nucléaire autorisé.</span></article>
      <article><strong>0</strong><span>valeur industrielle inventée par défaut : une donnée non prouvée reste à zéro ou reste explicitement hypothétique.</span></article>
    </div>

    <div class="evidence-grid">
      <article class="evidence-card">
        <div class="evidence-head"><strong>E-01 · Source froide et hydraulique 2025</strong><span class="evidence-badge proved">Prouvé</span></div>
        <p>Saint-Alban fonctionne en <strong>circuit de refroidissement ouvert</strong>. Le rapport EDF 2025 publie les prélèvements mensuels, environ <strong>3,583 milliards de m³</strong> prélevés au Rhône sur l’année, un maximum instantané observé d’environ <strong>134 m³/s</strong> pour une limite de 140 m³/s, et indique que les prélèvements sont restitués à la masse d’eau.</p>
        <span class="evidence-source">${evidenceLink('EDF — Rapport environnemental annuel 2025', s.edfEnvironment2025)}</span>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-02 · Rejets thermiques mesurés et limites</strong><span class="evidence-badge proved">Prouvé</span></div>
        <p>EDF mesure en continu température amont, aval et échauffement. En 2025, l’échauffement maximal rapporté est de <strong>3,29 °C</strong> sur la période froide et <strong>2,07 °C</strong> sur la période chaude. Les limites permanentes Saint-Alban sont 4 °C / 26 °C du 1er octobre au 15 mai, puis 3 °C / 28 °C du 16 mai au 30 septembre.</p>
        <span class="evidence-source">${evidenceLink('EDF 2025', s.edfEnvironment2025)} · ${evidenceLink('ASNR — limites thermiques', s.asnrThermal)}</span>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-03 · Opportunité territoriale Saint-Alban</strong><span class="evidence-badge proved">Prouvé</span></div>
        <p>Le cadrage MRAe du 24 mars 2026 pour l’extension de la ZAE Rhône-Varèze demande d’approfondir l’étude de faisabilité d’un réseau de chaleur ou de froid utilisant des énergies de récupération, <strong>notamment de la centrale de Saint-Alban</strong>. Notre question n’est donc plus extérieure au référentiel territorial.</p>
        <span class="evidence-source">${evidenceLink('MRAe Auvergne-Rhône-Alpes — cadrage Rhône-Varèze 2026', s.mraeRhoneVareze)}</span>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-04 · Demande industrielle existante : OSIRIS</strong><span class="evidence-badge proved">Prouvé</span></div>
        <p>Le réseau OSIRIS (3823C) a livré <strong>909 GWh</strong> de chaleur à l’industrie en 2024, avec <strong>6 points de livraison</strong> et <strong>125 MW</strong> de puissance installée. France Chaleur Urbaine indique un réseau <strong>100 % vapeur</strong> dans les données techniques disponibles et un prix moyen 2024 de <strong>39 € TTC/MWh</strong>. Maître d’ouvrage et gestionnaire : OSIRIS privé.</p>
        <span class="evidence-source">${evidenceLink('France Chaleur Urbaine — OSIRIS 3823C', s.osirisNetwork)}</span>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-05 · Niveau de température / vapeur</strong><span class="evidence-badge partial">Partiel</span></div>
        <p>OSIRIS fournit de la vapeur à <strong>32 bar et 6 bar</strong>. Pour le palier générique 1 300 MWe, l’IRSN documente environ <strong>65 bar absolus et 281 °C</strong> à la sortie des générateurs de vapeur. Cela prouve une proximité de niveau thermodynamique, mais <strong>pas</strong> l’existence d’un point de soutirage autorisé à Saint-Alban ni sa capacité disponible.</p>
        <span class="evidence-source">${evidenceLink('GIE OSIRIS — services énergie', s.osirisServices)} · ${evidenceLink('IRSN — conception REP 1 300 MWe', s.irsn1300)}</span>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-06 · Besoin résidentiel</strong><span class="evidence-badge partial">Partiel</span></div>
        <p>L’INSEE documente le parc et les combustibles principaux de chauffage à Saint-Maurice-l’Exil, mais pas un profil thermique horaire mesuré utilisable directement. Le besoin résidentiel annuel et sa saisonnalité restent donc des hypothèses tant qu’une donnée de consommation énergétique agrégée suffisamment précise n’est pas reliée au périmètre étudié.</p>
        <span class="evidence-source">${evidenceLink('INSEE — Saint-Maurice-l’Exil, RP2023', s.inseeSaintMaurice)}</span>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-07 · Emprises et servitudes</strong><span class="evidence-badge open">Ouvert</span></div>
        <p>Les routes, zones industrielles et franchissements identifiés indiquent des corridors à étudier. Ils ne prouvent ni disponibilité du sous-sol, ni servitude, ni droit de passage, ni compatibilité avec les réseaux existants. Aucun linéaire de chantier n’est donc promu au rang de preuve.</p>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-08 · Devis / CAPEX Saint-Alban</strong><span class="evidence-badge open">Ouvert</span></div>
        <p>Les coûts M€/km, échangeurs, franchissements et sous-stations restent pédagogiques. Ils devront être remplacés par des devis, bordereaux de prix, marchés comparables ou estimations d’ingénierie traçables avant toute conclusion économique locale.</p>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-09 · Contrat, financement, tarif, propriété du futur réseau</strong><span class="evidence-badge open">Ouvert</span></div>
        <p>Le modèle teste régie, concession et financement mixte, mais aucun de ces montages n’est attribué à un projet réel de récupération de chaleur nucléaire à Saint-Alban. Les propriétés réelles d’OSIRIS ne doivent pas être transférées par analogie à un futur réseau.</p>
      </article>

      <article class="evidence-card">
        <div class="evidence-head"><strong>E-10 · Soutirage nucléaire autorisé</strong><span class="evidence-badge open">Ouvert</span></div>
        <p>La centrale produit de la vapeur et rejette de la chaleur, mais le modèle ne dispose pas encore d’une étude EDF/ASNR définissant un soutirage de chaleur pour ce projet : point de prélèvement, puissance, disponibilité, transitoires, sûreté, modifications d’installation et coût d’opportunité réels restent à établir.</p>
      </article>
    </div>

    <h3>Profil mesuré de fonctionnement — eau de refroidissement 2025</h3>
    <p class="evidence-note">Volumes mensuels EDF en millions de m³. Ce graphe décrit l’usage réel de la source froide et constitue un <strong>proxy d’activité du condenseur</strong> ; il ne doit pas être converti directement en MWh thermiques sans les grandeurs thermodynamiques adaptées.</p>
    <div id="evidence-cooling-profile" class="evidence-profile" aria-label="Prélèvements mensuels d’eau de refroidissement du CNPE de Saint-Alban en 2025"></div>

    <div class="evidence-metrics">
      <div class="metric"><span>Eau de refroidissement 2025</span><strong>≈ 3,583 Md m³</strong><small>Somme des valeurs mensuelles publiées.</small></div>
      <div class="metric"><span>Débit instantané maximal observé</span><strong>≈ 134 m³/s</strong><small>Limite réglementaire de prélèvement : 140 m³/s.</small></div>
      <div class="metric"><span>OSIRIS — chaleur livrée 2024</span><strong>909 GWh</strong><small>Industrie, réseau vapeur existant.</small></div>
      <div class="metric"><span>OSIRIS — puissance installée</span><strong>125 MW</strong><small>Référence réelle, pas puissance substituable automatiquement.</small></div>
      <div class="metric"><span>OSIRIS — prix moyen 2024</span><strong>39 € TTC/MWh</strong><small>Tarif du réseau existant, pas tarif du projet nucléaire hypothétique.</small></div>
      <div class="metric"><span>Palier REP 1 300 MWe</span><strong>65 bar · 281 °C</strong><small>Référence générique IRSN à la sortie des GV.</small></div>
    </div>

    <div class="evidence-warning">
      <strong>Falsification importante :</strong> le réseau industriel OSIRIS utilise de la vapeur à 32/6 bar. Le circuit territorial 90/50 °C actuellement simulé ne peut donc pas représenter simultanément le chauffage résidentiel et les besoins vapeur industriels. Le modèle doit conserver <strong>deux branches thermiques distinctes</strong> : basse/moyenne température pour bâtiments et haute température/vapeur pour l’industrie.
    </div>

    <div class="evidence-chain" aria-label="Chaîne de preuve Saint-Alban">
      <span>source mesurée</span><span>→</span><span>règles ASNR</span><span>→</span><span>demande industrielle réelle</span><span>→</span><span>qualité de chaleur</span><span>→</span><strong>devis + emprises + contrat + soutirage autorisé</strong>
    </div>

    <div class="evidence-table-wrap">
      <table class="evidence-table">
        <thead><tr><th>Variable du modèle</th><th>Avant</th><th>État probatoire actuel</th><th>Effet</th></tr></thead>
        <tbody>
          <tr><td>Mode de refroidissement Saint-Alban</td><td>Contexte générique</td><td><span class="evidence-badge proved">Prouvé</span> circuit ouvert</td><td>Devient une donnée fixe du site.</td></tr>
          <tr><td>Contraintes thermiques Rhône</td><td>Qualitatives</td><td><span class="evidence-badge proved">Prouvé</span> limites + mesures 2025</td><td>Le rejet thermique devient une contrainte quantifiée.</td></tr>
          <tr><td>Besoin industriel Roussillon</td><td>0 par prudence</td><td><span class="evidence-badge proved">Prouvé</span> OSIRIS 909 GWh/an</td><td>Référence réelle disponible, sans supposer qu’elle est substituable à 100 %.</td></tr>
          <tr><td>Qualité industrielle</td><td>Charge thermique abstraite</td><td><span class="evidence-badge proved">Prouvé</span> vapeur 32/6 bar</td><td>Impose une branche vapeur distincte du 90/50 °C.</td></tr>
          <tr><td>Intérêt territorial récupération Saint-Alban</td><td>Hypothèse de travail</td><td><span class="evidence-badge proved">Prouvé</span> MRAe 2026</td><td>La faisabilité est explicitement demandée dans un dossier territorial.</td></tr>
          <tr><td>CAPEX, emprises, contrat, soutirage</td><td>Hypothèses</td><td><span class="evidence-badge open">Ouvert</span></td><td>Interdit une conclusion de rentabilité locale définitive.</td></tr>
        </tbody>
      </table>
    </div>

    <div class="callout">
      <p><strong>État du modèle :</strong> la question n’est plus « existe-t-il une source et une demande ? ». Les deux sont documentées, et un réseau vapeur industriel de très grande taille existe déjà sur le territoire. La frontière réelle est maintenant l’interface entre les deux systèmes : <strong>quel soutirage nucléaire, à quel niveau thermodynamique, par quel corridor, sous quel contrat et à quel coût ?</strong></p>
    </div>
  `

  limits.parentNode.insertBefore(section, limits)
  const limitsEyebrow = limits.querySelector('.eyebrow')
  if (limitsEyebrow) limitsEyebrow.textContent = '12 · Ce que le modèle ne prouve pas'

  const nextTitle = document.querySelector('#next-title')
  if (nextTitle) {
    nextTitle.textContent = 'Le modèle devient un registre de preuves à compléter.'
    const paragraph = nextTitle.nextElementSibling
    if (paragraph) paragraph.innerHTML = 'Les prochaines modifications doivent désormais <strong>réduire le nombre d’hypothèses</strong>, pas ajouter des couches conceptuelles : intégrer les profils thermiques mesurés disponibles, obtenir des coûts traçables, vérifier les emprises, identifier les contrats et établir avec EDF/ASNR les conditions réelles d’un soutirage de chaleur à Saint-Alban.'
  }

  renderCoolingProfile()
  annotateExistingModel()
}

function renderCoolingProfile() {
  const host = document.querySelector('#evidence-cooling-profile')
  if (!host) return
  host.innerHTML = ''
  const values = SAINT_ALBAN_EVIDENCE.coolingWater2025Mm3
  const max = Math.max(...values)
  values.forEach((value, index) => {
    const item = document.createElement('div')
    item.className = 'evidence-month'
    const bar = document.createElement('div')
    bar.className = 'evidence-bar'
    bar.style.height = `${Math.max(4, value / max * 100)}%`
    bar.title = `${SAINT_ALBAN_EVIDENCE.months[index]} · ${value} millions de m³`
    const label = document.createElement('small')
    label.textContent = SAINT_ALBAN_EVIDENCE.months[index]
    item.append(bar, label)
    host.appendChild(item)
  })
}

function annotateExistingModel() {
  const industrialCards = [...document.querySelectorAll('.industrial-load-grid article')]
  const roussillon = industrialCards.find(card => card.textContent.includes('Plateforme chimique de Roussillon'))
  const description = roussillon?.querySelector('span')
  if (description) {
    description.textContent = 'Réseau vapeur OSIRIS documenté : 909 GWh livrés en 2024, 125 MW installés, 6 points de livraison. Ces données servent de référence réelle mais ne sont pas injectées automatiquement comme chaleur substituable.'
  }
}

mountEvidenceUi()
