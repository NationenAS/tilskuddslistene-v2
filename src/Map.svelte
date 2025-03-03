<script>
import * as L from "leaflet";

export let data;
export function zoomToPoint(id) {
    console.log("Zoom to " + id);
    map.setView(markers[id].getLatLng(), 15);
}

let map,
    minMax,
    pointGroup = L.featureGroup(),
    mounted = false,
    markers = [],
    interactionEnabled = true;

const minRadius = 1.2;
const maxRadius = 4;
const color = [90, 61];

function getMinMax() {
    let d = data.map(d => d.sum);
    let min = Math.min(...d);
    let max = Math.max(...d);
    let specter = max - min;
    return { min: min, max: max, specter: specter };
}

function getSize(point) {
    let r = (point.sum - minMax.min) / minMax.specter;
    return {
        r: r,
        radius: r * (maxRadius - minRadius) + minRadius,
        color: `hsl(${color[0]}, ${color[1]}%, ${Math.round((1 - r) * 25 + 20)}%)`
    };
}

function updateRadius() {
    let level = map.getZoom() / 4;
    markers.map(e => e.setRadius(level * e.options.originalRadius));
}

function update(data) {
    pointGroup.clearLayers().remove();
    minMax = getMinMax();
    markers = [];
    data = data.reverse();
    for (const point of data) {
        if (point.geometry.x == 0) continue;
        let size = getSize(point);
        markers[point.id] = L.circleMarker([point.geometry.y, point.geometry.x], { radius: size.radius, originalRadius: size.radius })
            .on('click', () => {
                console.log(`${markers[point.id].options.radius}`);
            })
            .setStyle({
                fillColor: size.color,
                fillOpacity: 1,
                stroke: false
            });
        markers[point.id].addTo(pointGroup);
    }
    pointGroup.addTo(map);
    map.flyToBounds(pointGroup.getBounds(), {
        duration: 1
    });
    console.log("Map updated");
}

$: if (mounted) update(data);

function createMap(container) {
    map = L.map(container, { preferCanvas: true })
        .setView([61, 9], 7)
        .on('zoomend', updateRadius);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    console.log("Map created");
    toggleInteraction();
    mounted = true;
}

function toggleInteraction() {
    interactionEnabled = !interactionEnabled;
    if (interactionEnabled) {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
    } else {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
    }
}
</script>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="map-container">
    {#if minMax}
        <div class="legend">
            <span style="height: {minRadius * 2}px; width: {minRadius * 2}px; background: hsl(90, 61%, 45%)"></span> 
            {minMax.min.toLocaleString('nb-NO', { notation: 'compact', compactDisplay: 'short' })} 
            <span style="height: {maxRadius * 2}px; width: {maxRadius * 2}px; background: hsl(90, 61%, 20%);"></span> 
            {minMax.max.toLocaleString('nb-NO', { notation: 'compact', compactDisplay: 'short' })}
        </div>
    {/if}
    <div class="map" use:createMap></div>
    <button on:click|stopPropagation={toggleInteraction} class:interactive={interactionEnabled}>
        {interactionEnabled ? "Lås kartet" : "Aktiver kartet"}
    </button>
</div>

<style>
.map-container {
    position: relative;
}
.map {
    height: 500px;
    outline: none;
    border-radius: var(--TLBoxBorderRadius);
}
.legend {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 12px;
    display: flex;
    gap: 5px;
    align-items: center;
    z-index: 1000;
}
.legend span {
    display: inline-block;
    background: green;
    border-radius: 50%;
}
button {
    all: unset;
    position: absolute;
    bottom: 1rem;
    right: 50%;
    transform: translateX(50%);
    z-index: 1000;
    padding: 0.5rem 1rem;
    color: #333;
    padding: var(--TLButtonPadding);
    border: 2px solid var(--TLAccentColorLight);
    border-radius: var(--TLButtonBorderRadius);
    background: var(--TLAccentColorLight);
    cursor: pointer;
    transition: all 0.2s ease-out;
}
button.interactive {
    right: 1rem;
    transform: translateX(0);
    background: var(--TLAccentColorFull);
    border-color: var(--TLAccentColorFull);
}
button:hover {
    background: var(--TLAccentColorFull);
    border-color: black;
}
@media (max-width: 600px) {
    .map {
        height: 360px;
    }
}
</style>

