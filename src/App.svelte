<script lang="ts">

import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"
import Map from "./Map.svelte"
import { municipalities } from "./lib/municipalities"
import { productionCodes } from "./lib/productionCodes"
import { configStore, dataStore, totals } from "./stores"
import type { Config } from "./stores"

const endpoint = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

// Main list
let listData: any[] = []

// Unique
let uniqueData: any = {}, 
    lastUniqueData: any = {},
    relevantCodes: any[] = []

// UI
const nextLength = 25
let fetching = false,
    listLength = 0,
    map: any

const updateListData = (length: number) => {
    let x = $dataStore.slice(0, length)
    listData = x
}
function getNextElements() {
    let left = $dataStore.length - listLength
    listLength += left >= nextLength ? nextLength : left
}

const getMunicipality = (number: string): string | undefined => {
    let m = municipalities.find(e => e[1] == number)
    return m ? m[0]: undefined
}
const reset = () => {
    $dataStore = []
    listData = []
    listLength = 0
    uniqueData = {}
}
const updateQuery = (config: Config) => {

    reset()
    console.table(config)
    const params = new URLSearchParams()
    params.append('sortBy', config.type)
    params.append('fields', `(id,orgnavn,saksbehandlende_kommune,geometry,${config.type})`)
    params.append('limit', config.limit.toString())
    params.append('greaterThan', `${config.type}:0`)
    if (config.municipality != undefined) params.append('equal', `saksbehandlende_kommune:${config.municipality}`)
    else if (config.county != undefined) params.append('equal', `county:${config.county}`)
    if (config.name != undefined) params.append('q', `orgnavn:${config.name}`)

    fetching = true
    let start = performance.now()
    console.log("Fetching: " + endpoint + params)
    fetch(endpoint + params)
        .then(r => {
            console.log("Fetch time:", performance.now() - start + " ms")
            console.log("Fetch size:", Number(r.headers.get("content-length"))/1000 + " kB")
            return r.json()
        })
        .then(d => {
            $dataStore = d
            listLength = 10
            fetching = false
            console.log("Hits:", d.length)
        }).catch(e => {
            console.log("Fetch error, time:", performance.now() - start + " ms, msg:", e)
        })
}
$: updateQuery($configStore)

function getProduction() {
    relevantCodes = []
    for (const code in uniqueData) {        
        let value = uniqueData[code]                                    // Loop though production codes in fetch result
        if (code.startsWith("p") && value > 0) {                        // Get code if has production
            let details = productionCodes.find(e => e[0] == code)       // Get details from productionCodes.js
            if (details) {                                              // If found in productionCodes.js, add to array
                let name = details[1]
                let unit = details[3] == "dekar" ? "da." : details[3]
                let color = 
                    code.startsWith('p1') ? "#f3dfdf" :
                    code.startsWith('p2') ? "#ede6dd" :
                    code.startsWith('p8') ? "#e2e5e0" :
                    "#eee"
                relevantCodes.push({ name: name, value: value, unit: unit, color: color})
            }
        }
    }
}

function toggleInfo(id: string) {  // TODO: Put in child template
    if (id == uniqueData.id) { lastUniqueData = uniqueData; uniqueData = {}; return }
    if (id == lastUniqueData.id) { uniqueData = lastUniqueData; return } // Prevent data fetch if user re-opens last expanded item
    let params = `limit=1&equal=id:${id}`
    console.log("Fetching unique: " + endpoint + params)
    fetch(endpoint + params)
        .then(r => r.json())
        .then(d => {
            uniqueData = d[0]
            getProduction()
        })
}

$: updateListData(listLength)

</script>

<h2>Tilskuddslistene</h2>

<Navigation />

{#if $totals.count == 0 && fetching}
<Spinner />

{:else if $totals.count == 0}
<div class="items-count">Ingen oppføringer</div>

{:else if $totals.count > 0}
Antall mottakere: {$totals.count}. Totalt {$totals.sum} {$configStore.unit}.

<div class="result-container">
    <Map data={$dataStore} config={$configStore} bind:this={map} />
    {#if uniqueData.id}
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
            {#each relevantCodes as p}
                <div style="background: {p.color};"><div>{p.name}</div><div>{p.value} {p.unit}</div></div>
            {/each}
        </div>
    </div>
    {/if}
    <div class="result-table">
        <div class="result-row result-header">
            <div>Navn</div>
            <div>Kommune</div>
            <div class="result-sum">{$configStore.unit} <span>&#9660;</span></div>
        </div>
        {#each listData as item (item.id)}
        <div class="result-row" class:expanded={uniqueData.id == item.id} on:click={() => { toggleInfo(item.id) }} on:keypress={() => { toggleInfo(item.id) }}>
            <div>{item.orgnavn}</div>
            <div>{getMunicipality(item.saksbehandlende_kommune)}</div>
            <div class="result-sum">{ item[$configStore.type].toLocaleString('nb-NO') }</div>
        </div>
        {/each}
        {#if listData.length < $totals.count}
        <div class="result-more" on:click={() => { getNextElements() }} on:keypress={() => { getNextElements() }}>Se flere</div>
        {/if}
    </div>
</div>
{/if}


<style>
h2 {
    margin-bottom: 15px;
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
.result-row:hover {
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
    .info-details > div {
        width: 100%;
        padding: 3px 8px;
    }
}
</style>