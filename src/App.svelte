<script>

import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"
import Map from "./Map.svelte"
import { municipalities } from "./lib/municipalities"
import { productionCodes } from "./lib/productionCodes"

const url = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

// Main list
let data = [],
    listData = [],
    totals = {},
    config

// Unique
let uniqueData = {}, 
    lastUniqueData = {},
    relevantCodes = []

// UI
const nextLength = 25
let fetching = false,
    viewMap = true,
    listLength = 0,
    map

$:  setListData(listLength)
function setListData(length) {
    let x = data.slice(0,length)
    listData = x
}
function getNextElements() {
    let left = data.length - listLength
    listLength += left >= nextLength ? nextLength : left
}

function getMunicipality(number) {
    let m = municipalities.find(e => e[1] == number)
    return m[0]
}
function reset() {
    data = []
    listData = []
    listLength = 0
    uniqueData = {}
}
function updateFromNav(event) {
    reset()
    fetching = true
    console.log("Config:", performance.now(), event.detail.config)
    let fields = `id,orgnavn,saksbehandlende_kommune,geometry,${event.detail.config.type}`
    let params = `sortBy=${event.detail.config.type}&fields=(${fields})`
    let start = performance.now()
    console.log("Fetching: " + url + params + event.detail.params)
    fetch(url + params + event.detail.params)
        .then(r => {
            console.log("Fetch time:", performance.now() - start + " ms")
            console.log("Fetch size:", Number(r.headers.get("content-length"))/1000 + " kB")
            return r.json()
        })
        .then(d => {
            data = d
            listLength = 10
            config = event.detail.config
            fetching = false
            getTotals()
            console.log("Hits:", d.length)
        }).catch(e => {
            console.log("Fetch error, time:", performance.now() - start + " ms, msg:", e)
        })
}
function getProduction() {
    relevantCodes = []
    for (const code in uniqueData) {                                    // Loop though production codes in fetch result
        if (code.startsWith("p") && uniqueData[code] > 0) {             // Get code if has production
            let details = productionCodes.find(e => e[0] == code)       // Get details from productionCodes.js
            if (details) {                                              // If found in productionCodes.js, add to array
                let name = details[1]                                   // FIX NAME
                let unit = details[3] == "dekar" ? "da." : details[3]
                relevantCodes.push({ name: name, value: uniqueData[code], unit: unit})
            }
        }
    }
}
function getTotals() {
    let sum = data.reduce( (a, b) => {
                return a + b[config.type]
            }, 0)
    let string = `Totalt: ${sum.toLocaleString('nb-NO')} (${config.unit}).`
    totals = {
        count: data.length,
        sum: string
    }
    console.log("Totals:", totals)
}
function toggleInfo(id) {  // TODO: Put in child template
    if (id == uniqueData.id) { lastUniqueData = uniqueData; uniqueData = {}; return }
    if (id == lastUniqueData.id) { uniqueData = lastUniqueData; return } // Prevent data fetch if user re-opens last expanded item
    let params = `limit=1&equal=id:${id}`
    console.log("Fetching unique: " + url + params)
    fetch(url + params)
        .then(r => r.json())
        .then(d => {
            uniqueData = d[0]
            getProduction()
        })
}
function toggleView() {
    viewMap = !viewMap
}


</script>

<h2>Tilskuddslistene</h2>

<Navigation on:navigationChange={updateFromNav} />

{#if data.length == 0 && fetching}
<Spinner />

{:else if data.length == 0}
<div class="no-items">Ingen oppføringer</div>

{:else}
<div class="totals" class:notification={totals.count >= 1000}>
    {#if totals.count < 1000 }
    Antall mottakere: {totals.count}. {totals.sum}
    {:else}
    Det er et stort antall mottakere i søket. Du ser nå de {totals.count} største produsentene. Du kan snevre inn søket ved å velge kommune/fylke eller søke på navn.
    {/if}
</div>
<div class="result-container">
    <div class="toggle-view" on:click={() => { toggleView() }} on:keypress={() => { toggleView() }}>{viewMap ? "Skjul" : "Vis"} kart</div>
    {#if viewMap}
    <Map data={data} config={config} bind:this={map} />
    {/if}
    <div class="result-table">
        <div class="result-row result-header">
            <div>Navn</div>
            <div>Kommune</div>
            <div class="result-sum">{config.unit} <span>&#9660;</span></div>
        </div>
        {#each listData as item (item.id)}
        <div class="result-row" class:expanded={uniqueData.id == item.id} on:click={() => { toggleInfo(item.id) }} on:keypress={() => { toggleInfo(item.id) }}>
            <div>{item.orgnavn}</div>
            <div>{getMunicipality(item.saksbehandlende_kommune)}</div>
            <div class="result-sum">{ item[config.type].toLocaleString('nb-NO') }</div>
            {#if uniqueData.id == item.id}
            <div class="info">
                <div class="info-header">
                    <div>
                        Org.nr: <span>{uniqueData.orgnr}</span><br>
                        Totalt areal: <span>{uniqueData.totalareal} dekar</span>
                    </div>
                    <div on:click={() => { map.zoomToPoint(uniqueData.id) }} on:keypress={() => { map.zoomToPoint(uniqueData.id) }}><svg viewBox="0 0 23 33.6"><path d="M11.5,0c6.3-.1,12,6.1,11.5,12.5-.1,3.2-2,5.8-3.5,8.5-2.1,3.7-6.7,11.8-7,12.1-.5,.8-1.7,.7-2.1,0-.5-.9-5.8-10-7.9-13.7C1.3,17.3,.1,15,0,12.6-.5,6.2,5.1,0,11.5,0c0,0,0,0,0,0ZM6.4,12c0,2.9,2.3,5,4.8,5.1,7.2,0,7.2-10.2,.2-10.3-2.6,0-5,2.3-5,5.1Z"></path></svg><u>Se gården på kart</u></div>
                </div>
                <h4>Utdrag av produksjon</h4>
                <div class="info-details">
                    {#each relevantCodes as code}
                        <div><div>{code.name}</div><div>{code.value} {code.unit}</div></div>
                    {/each}
                </div>
            </div>
            {/if}
        </div>
        {/each}
        {#if listData.length < data.length}
        <div class="result-more" on:click={() => { getNextElements() }} on:keypress={() => { getNextElements() }}>Se flere</div>
        {/if}
    </div>
</div>
{/if}


<style>
h2 {
    margin-bottom: 15px;
}
.toggle-view {
    display: inline-block;
    font-size: 1rem;
    color: #666;
    outline: none;
    border: 3px solid #ccc;
    background: white;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    margin-bottom: 10px;
}
.no-items {
    margin-top: 1.5rem;
}
.result-container {
    position: relative;   
    margin-top: 1.5rem;
}
.totals {
    margin-block: 1rem;
    font-size: .9em;
}
.totals.notification {
    background: #eee;
    border-radius: 5px;
    padding: 1em 1.8em;
}
.result-table {
    margin-top: 1em;
}
.result-row {
    display: grid;
    grid-template-columns: 4fr 1fr 1fr;
    grid-template-rows: 30px;
    align-items: center;
    cursor: pointer;
    padding: 8px 10px;
}
.result-row:nth-child(even) {
    background: #f9f9f9;
}
.result-row:not(.expanded):hover {
    background: #eee;
}
.result-header {
    font-weight: bold;
    cursor: initial;
}
.result-header .result-sum {
    text-transform: capitalize;
}
.result-header:hover {
    background: initial;
}
.result-row > div > span {
    color: #406619;
    font-size: .9em;
    margin-bottom: .1em;
}
.result-row.expanded {
    background: white;
    margin-block: 1em;
    padding: 1em 1.5em 1.5em 1.5em;
    border: 3px solid #eee;
    border-radius: 5px;
}
.result-sum {
    text-align: right;
}
.result-more {
    text-align: center;
    margin-top: 10px;
    text-decoration: underline;
    font-size: .9em;
    font-weight: bold;
    cursor: pointer;
}
.info {
    font-size: .9em;
    grid-column: 1/-1;
    margin-top: 0.8em;
}
.info-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;
}
h4 {
    font-size: 1.05em;
    margin-block: .8em .7em;
}
.info-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.info-details > div {
    display: flex;
    justify-content: space-between;
    width: calc(50% - 3px);
    background: #eee;
    padding: 3px 8px;
}
.info svg {
    height: 1em;
    margin-right: .5em;
}
@media (max-width: 680px) {
    .result-row {
        grid-template-columns: 3fr 1fr;
    }
    .result-row > div:nth-child(2) {
        display: none;
    }
}
</style>