const routeFactorInput = document.querySelector('#route-factor')
const routeSupplyTempInput = document.querySelector('#route-supply-temp')
const routeReturnTempInput = document.querySelector('#route-return-temp')
const routeVelocityInput = document.querySelector('#route-velocity')
const routeLinearLossInput = document.querySelector('#route-linear-loss')
const routePressureGradientInput = document.querySelector('#route-pressure-gradient')
const routePumpEfficiencyInput = document.querySelector('#route-pump-efficiency')
const runRouteButton = document.querySelector('#run-route')
const routeStatus = document.querySelector('#route-status')
const routeMap = document.querySelector('#thermal-route-map')
const routeSegmentsBody = document.querySelector('#route-segments-body')

const routeGeoLengthResult = document.querySelector('#route-geo-length-result')
const routeAdjustedLengthResult = document.querySelector('#route-adjusted-length-result')
const routePipeLengthResult = document.querySelector('#route-pipe-length-result')
const routeSourceFlowResult = document.querySelector('#route-source-flow-result')
const routeMaxDnResult = document.querySelector('#route-max-dn-result')
const routeHeatLossResult = document.querySelector('#route-heat-loss-result')
const routePumpPowerResult = document.querySelector('#route-pump-power-result')
const routePumpEnergyResult = document.querySelector('#route-pump-energy-result')

const routeNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const routeInteger = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

const SVG_NS = 'http://www.w3.org/2000/svg'
const WATER_CP = 4180
const WATER_DENSITY = 980
const STANDARD_DN = [50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000]

const THERMAL_SOURCE = Object.freeze({
  id: 'source',
  name: 'CNPE Saint-Alban / Saint-Maurice',
  lat: 45.4024075,
  lon: 4.769878,
  households: 0,
  source: true
})

function routeNumeric(input) {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : null
}

function selectedRouteTerritories() {
  if (!window.MuzeEnergyTerritory) return []
  return window.MuzeEnergyTerritory.selectedTerritories()
}

function haversineKm(a, b) {
  const toRad = degrees => degrees * Math.PI / 180
  const earthRadiusKm = 6371
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLat = lat2 - lat1
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h))
}

function buildMinimumSpanningTree(nodes) {
  if (nodes.length < 2) return []
  const visited = new Set([nodes[0].id])
  const edges = []

  while (visited.size < nodes.length) {
    let best = null
    nodes.forEach(parent => {
      if (!visited.has(parent.id)) return
      nodes.forEach(child => {
        if (visited.has(child.id)) return
        const distanceKm = haversineKm(parent, child)
        if (!best || distanceKm < best.distanceKm) {
          best = { parent, child, distanceKm }
        }
      })
    })
    if (!best) break
    edges.push(best)
    visited.add(best.child.id)
  }

  return edges
}

function subtreeHouseholds(nodeId, edges, nodeById) {
  const own = nodeById.get(nodeId)?.households || 0
  const children = edges.filter(edge => edge.parent.id === nodeId)
  return own + children.reduce((sum, edge) => sum + subtreeHouseholds(edge.child.id, edges, nodeById), 0)
}

function suggestedDn(diameterMm) {
  return STANDARD_DN.find(dn => dn >= diameterMm) || STANDARD_DN[STANDARD_DN.length - 1]
}

function formatRouteEnergy(mwh) {
  if (mwh >= 1000) return `${routeNumber.format(mwh / 1000)} GWh/an`
  return `${routeNumber.format(mwh)} MWh/an`
}

function projectNodes(nodes) {
  const width = 760
  const height = 460
  const pad = 62
  const meanLat = nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length
  const lonScale = Math.cos(meanLat * Math.PI / 180)
  const points = nodes.map(node => ({
    ...node,
    px: node.lon * lonScale,
    py: node.lat
  }))
  const xs = points.map(point => point.px)
  const ys = points.map(point => point.py)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = Math.max(maxX - minX, 0.01)
  const spanY = Math.max(maxY - minY, 0.01)

  return points.map(point => ({
    ...point,
    x: pad + ((point.px - minX) / spanX) * (width - pad * 2),
    y: height - pad - ((point.py - minY) / spanY) * (height - pad * 2)
  }))
}

function svgElement(name, attrs = {}) {
  const element = document.createElementNS(SVG_NS, name)
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)))
  return element
}

function renderRouteMap(nodes, edgeModels, sourceMw) {
  routeMap.innerHTML = ''
  routeMap.setAttribute('viewBox', '0 0 760 460')
  const projected = projectNodes(nodes)
  const projectedById = new Map(projected.map(node => [node.id, node]))

  const north = svgElement('text', { x: 710, y: 34, class: 'route-north', 'text-anchor': 'middle' })
  north.textContent = 'N ↑'
  routeMap.appendChild(north)

  edgeModels.forEach(edge => {
    const a = projectedById.get(edge.parent.id)
    const b = projectedById.get(edge.child.id)
    const width = sourceMw > 0 ? 2.5 + Math.min(8, (edge.designPowerMw / sourceMw) * 8) : 3
    const line = svgElement('line', {
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      class: 'route-edge',
      'stroke-width': width
    })
    const title = svgElement('title')
    title.textContent = `${edge.parent.name} → ${edge.child.name} · ${routeNumber.format(edge.adjustedKm)} km · DN ${edge.dn}`
    line.appendChild(title)
    routeMap.appendChild(line)
  })

  projected.forEach(node => {
    const group = svgElement('g')
    const circle = svgElement('circle', {
      cx: node.x,
      cy: node.y,
      r: node.source ? 10 : 7 + Math.min(6, Math.sqrt(node.households || 0) / 18),
      class: `route-node${node.source ? ' source' : ''}`
    })
    group.appendChild(circle)

    const text = svgElement('text', {
      x: node.x + 14,
      y: node.y - 7,
      class: 'route-label'
    })
    text.textContent = node.source ? 'CNPE Saint-Alban' : node.name
    group.appendChild(text)

    if (!node.source) {
      const small = svgElement('text', {
        x: node.x + 14,
        y: node.y + 10,
        class: 'route-small'
      })
      small.textContent = `${routeInteger.format(node.households)} ménages`
      group.appendChild(small)
    }

    routeMap.appendChild(group)
  })
}

function renderSegments(edgeModels) {
  routeSegmentsBody.innerHTML = ''
  edgeModels.forEach(edge => {
    const row = document.createElement('tr')
    const values = [
      edge.parent.name,
      edge.child.name,
      `${routeNumber.format(edge.distanceKm)} km`,
      `${routeNumber.format(edge.adjustedKm)} km`,
      routeInteger.format(edge.downstreamHouseholds),
      `${routeNumber.format(edge.designPowerMw)} MWₜₕ`,
      `${routeNumber.format(edge.massFlowKgS)} kg/s`,
      `DN ${edge.dn}`
    ]
    values.forEach((value, index) => {
      const cell = document.createElement('td')
      if (index === 7) {
        const badge = document.createElement('span')
        badge.className = 'route-badge'
        badge.textContent = value
        cell.appendChild(badge)
      } else {
        cell.textContent = value
      }
      row.appendChild(cell)
    })
    routeSegmentsBody.appendChild(row)
  })
}

function runThermalRoute() {
  const selected = selectedRouteTerritories()
  const routeFactor = routeNumeric(routeFactorInput)
  const supplyTemp = routeNumeric(routeSupplyTempInput)
  const returnTemp = routeNumeric(routeReturnTempInput)
  const velocity = routeNumeric(routeVelocityInput)
  const linearLoss = routeNumeric(routeLinearLossInput)
  const pressureGradient = routeNumeric(routePressureGradientInput)
  const pumpEfficiencyPct = routeNumeric(routePumpEfficiencyInput)
  const sourceMw = routeNumeric(document.querySelector('#territory-source-mw'))
  const hours = routeNumeric(document.querySelector('#territory-hours'))

  const invalid = !selected.length
    || [routeFactor, supplyTemp, returnTemp, velocity, linearLoss, pressureGradient, pumpEfficiencyPct, sourceMw, hours].some(value => value === null)
    || routeFactor < 1
    || supplyTemp <= returnTemp
    || velocity <= 0
    || linearLoss < 0
    || pressureGradient < 0
    || pumpEfficiencyPct <= 0
    || pumpEfficiencyPct > 100
    || sourceMw <= 0
    || hours <= 0

  if (invalid) {
    routeStatus.textContent = 'Vérifier les hypothèses : au moins une commune, facteur de tracé ≥ 1, départ > retour, valeurs positives et rendement de pompe ≤ 100 %.'
    return
  }

  const nodes = [THERMAL_SOURCE, ...selected]
  const tree = buildMinimumSpanningTree(nodes)
  const nodeById = new Map(nodes.map(node => [node.id, node]))
  const totalHouseholds = selected.reduce((sum, place) => sum + place.households, 0)
  const deltaT = supplyTemp - returnTemp
  const pumpEfficiency = pumpEfficiencyPct / 100

  const edgeModels = tree.map(edge => {
    const downstreamHouseholds = subtreeHouseholds(edge.child.id, tree, nodeById)
    const demandShare = downstreamHouseholds / totalHouseholds
    const designPowerMw = sourceMw * demandShare
    const massFlowKgS = (designPowerMw * 1e6) / (WATER_CP * deltaT)
    const volumeFlowM3S = massFlowKgS / WATER_DENSITY
    const diameterM = Math.sqrt((4 * volumeFlowM3S) / (Math.PI * velocity))
    const dn = suggestedDn(diameterM * 1000)
    const adjustedKm = edge.distanceKm * routeFactor
    const roundTripM = adjustedKm * 1000 * 2
    const pressureDropPa = pressureGradient * roundTripM
    const pumpPowerW = (pressureDropPa * volumeFlowM3S) / pumpEfficiency

    return {
      ...edge,
      adjustedKm,
      downstreamHouseholds,
      designPowerMw,
      massFlowKgS,
      volumeFlowM3S,
      diameterM,
      dn,
      pumpPowerW
    }
  })

  const geoKm = edgeModels.reduce((sum, edge) => sum + edge.distanceKm, 0)
  const adjustedKm = edgeModels.reduce((sum, edge) => sum + edge.adjustedKm, 0)
  const pairedPipeKm = adjustedKm * 2
  const sourceMassFlowKgS = (sourceMw * 1e6) / (WATER_CP * deltaT)
  const maxDn = Math.max(...edgeModels.map(edge => edge.dn))
  const heatLossMwh = (linearLoss * adjustedKm * 1000 * hours) / 1e6
  const transportedMwh = sourceMw * hours
  const heatLossShare = transportedMwh > 0 ? (heatLossMwh / transportedMwh) * 100 : 0
  const pumpPowerMw = edgeModels.reduce((sum, edge) => sum + edge.pumpPowerW, 0) / 1e6
  const pumpEnergyMwh = pumpPowerMw * hours

  routeGeoLengthResult.textContent = `${routeNumber.format(geoKm)} km`
  routeAdjustedLengthResult.textContent = `${routeNumber.format(adjustedKm)} km`
  routePipeLengthResult.textContent = `${routeNumber.format(pairedPipeKm)} km`
  routeSourceFlowResult.textContent = `${routeNumber.format(sourceMassFlowKgS)} kg/s`
  routeMaxDnResult.textContent = `DN ${maxDn}`
  routeHeatLossResult.textContent = `${formatRouteEnergy(heatLossMwh)} · ${routeNumber.format(heatLossShare)} %`
  routePumpPowerResult.textContent = `${routeNumber.format(pumpPowerMw)} MWₑ`
  routePumpEnergyResult.textContent = formatRouteEnergy(pumpEnergyMwh)

  renderRouteMap(nodes, edgeModels, sourceMw)
  renderSegments(edgeModels)

  routeStatus.textContent = `Tracé mathématique : ${tree.length} segment(s), ${routeNumber.format(geoKm)} km géodésiques puis ${routeNumber.format(adjustedKm)} km après facteur ${routeNumber.format(routeFactor)}. Ce résultat est un pré-dimensionnement géométrique, pas un tracé de travaux.`
}

runRouteButton.addEventListener('click', runThermalRoute)
;[routeFactorInput, routeSupplyTempInput, routeReturnTempInput, routeVelocityInput, routeLinearLossInput, routePressureGradientInput, routePumpEfficiencyInput]
  .forEach(input => input.addEventListener('change', runThermalRoute))

window.addEventListener('muze:territory-updated', runThermalRoute)
runThermalRoute()
