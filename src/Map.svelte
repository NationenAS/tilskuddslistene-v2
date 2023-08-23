<script>

import * as L from "leaflet"

export let data
export let config
export function zoomToPoint(id) {
    console.log("Zoom to " + id)
    map.setView(markers[id].getLatLng(), 15)
}

let map,
    minMax,
    pointGroup = L.featureGroup(),
    mounted = false,
    markers = []
    // renderer = L.canvas({ padding: 10 })

const minRadius = 2
const maxRadius = 10
const color = [90, 61]

function getMinMax() {
    let d = data.map(d => d[config.type])
    let min = Math.min(...d)
    let max = Math.max(...d)
    let specter = max-min
    return { min: min, max: max, specter: specter }
}

function getSize(point) {
    let r = (point[config.type] - minMax.min) / minMax.specter
    return {
        r: r,
        radius: r * (maxRadius - minRadius) + minRadius,
        color: `hsl(${color[0]}, ${color[1]}%, ${Math.round((1 - r) * 25 + 20)}%)`
    }
}

function update(data) {
    pointGroup.clearLayers().remove()
    minMax = getMinMax()
    markers = []
    for (const point of data) {
        if (point.geometry.x == 0) continue
        let size = getSize(point)
        markers[point.id] = L.circleMarker([point.geometry.y, point.geometry.x], { radius: size.radius }) // { renderer: renderer}
            .on('click', () => {
                console.log(`${point.orgnavn}: ${size.color}`)
            })
            .setStyle({
                fillColor: size.color,
                fillOpacity: 1,
                stroke: false
            })
        markers[point.id].addTo(pointGroup)
    }
    pointGroup.addTo(map)
    map.flyToBounds(pointGroup.getBounds(), {
        duration: 1
    })
    console.log("Map updated")
}

$: if(mounted) update(data)

function createMap(container) {
    map = L.map(container, { preferCanvas: true })
		.setView([61, 9], 7)
		//.on('moveend', update)
	L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' // ADD BASEMAP SOURCE
	}).addTo(map)
    console.log("Map created")
    mounted = true
}

</script>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

<div class="map-container">
    <div class="legend"><span style="height: {minRadius * 2}px; width: {minRadius * 2}px; background: hsl(90, 61%, 45%)"></span> {getMinMax().min} <span style="height: {maxRadius * 2}px; width: {maxRadius * 2}px; background: hsl(90, 61%, 25%);"></span> {getMinMax().max}</div>
    <div class="map" use:createMap></div>
</div>

<style>
.map-container {
    position: relative;
}
.map {
    height: 600px;
    outline: none;
    border-radius: 5px;
}
.legend {
    position: absolute;
    right: 0;
    top: -30px;
    font-size: 12px;
    display: flex;
    gap: 5px;
    align-items: center;
}
.legend span {
    display: inline-block;
    background: green;
    border-radius: 50%;
}


</style>

