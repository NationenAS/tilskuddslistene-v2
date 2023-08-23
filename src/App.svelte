<script>

import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"
import Map from "./Map.svelte"
import { municipalities } from "./municipalities"
import { productionCodes } from "./productionCodes"

const url = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

// Main list
let listData = [],
    totals = {},
    config

// Unique
let uniqueData = {}, 
    lastUniqueData = {},
    relevantCodes = []

// UI
let showHidden = false,
    fetching = false,
    map

$:  viewMap = true

function getMunicipality(number) {
    let m = municipalities.find(e => e[1] == number)
    return m[0]
}
function updateFromNav(event) {
    listData = []
    uniqueData = {}
    showHidden = false
    console.log(event.detail.config)
    let limit = event.detail.limit || 99999
    let fields = `id,orgnavn,saksbehandlende_kommune,geometry,${event.detail.config.type}`
    let params = `sortBy=${event.detail.config.type}&fields=(${fields})`
    let start = performance.now()
    console.log("Fetching: " + url + params + event.detail.params)
    fetching = true
    fetch(url + params + event.detail.params + "&limit=" + limit)
        .then(r => {
            console.log("Fetch time:", performance.now() - start + " ms")
            console.log("Fetch size:", Number(r.headers.get("content-length"))/1000 + " kB")
            return r.json()
        })
        .then(d => {
            listData = d
            config = event.detail.config
            config.unit = productionCodes.find(c => c[0] == config.type)[3]
            fetching = false
            if (event.detail.limit != 10) getTotals()
            console.log("Hits:", d.length)
        }).catch(e => {
            console.log("Fetch error, time:", performance.now() - start + " ms, msg:", e)
        })
}
function getProduction() {
    relevantCodes = []
    for (const code in uniqueData) {
        if (code.startsWith("p") && uniqueData[code] > 0) { // MINIMUMSVERDI FRA PR-CO
            let details = productionCodes.find(e => e[0] == code)
            if (details) {
                let name = details ? details[2] : code
                relevantCodes.push([name, uniqueData[code]])
            }
        }
    }
}
function getTotals() {
    let sum = listData.reduce( (a, b) => {
                return a + b[config.type]
            }, 0)
    let string = `Totalt: ${sum.toLocaleString('nb-NO')} (${config.unit}).`
    totals = {
        count: listData.length,
        sum: string
    }
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

{#if listData.length == 0 && fetching}
<Spinner />

{:else if listData.length == 0}
<div class="no-items">Ingen oppføringer</div>

{:else}
<div class="result-container">
    <div class="toggle-view" on:click={() => { toggleView() }} on:keypress={() => { toggleView() }}>{viewMap ? "Skjul" : "Vis"} kart</div>
    {#if viewMap}
    <Map data={listData} config={config} bind:this={map} />
    {/if}
    {#if totals.count }
    <div class="result-totals">
        Antall mottakere: {totals.count}. {totals.sum}
    </div>
    {/if}
    <div class="result-table">
        <div class="result-row">
            <div>Navn</div>
            <div>Kommune</div>
            <div class="result-sum">{config.unit}</div>
        </div>
        {#each listData as item, i}
        {#if i < 100}
        <div class="result-row" class:hidden="{i > 9 && !showHidden}" on:click={() => { toggleInfo(item.id) }} on:keypress={() => { toggleInfo(item.id) }}>
            <div>{item.orgnavn}</div>
            <div>{getMunicipality(item.saksbehandlende_kommune)}</div>
            <div class="result-sum">{ item[config.type].toLocaleString('nb-NO') }</div>
        </div>
        {/if}
        {#if uniqueData.id == item.id}
        <div class="info">
            <div class="info-header">
                <div>
                    Org.nr: <span>{uniqueData.orgnr}</span><br>
                    Totalt areal: <span>{uniqueData.totalareal} dekar</span>
                </div>
                <div on:click={() => { map.zoomToPoint(uniqueData.id) }}><svg viewBox="0 0 23 33.6"><path d="M11.5,0c6.3-.1,12,6.1,11.5,12.5-.1,3.2-2,5.8-3.5,8.5-2.1,3.7-6.7,11.8-7,12.1-.5,.8-1.7,.7-2.1,0-.5-.9-5.8-10-7.9-13.7C1.3,17.3,.1,15,0,12.6-.5,6.2,5.1,0,11.5,0c0,0,0,0,0,0ZM6.4,12c0,2.9,2.3,5,4.8,5.1,7.2,0,7.2-10.2,.2-10.3-2.6,0-5,2.3-5,5.1Z"></path></svg><u>Se gården på kart</u></div>
            </div>
            <h4>Produksjon</h4>
            <div class="info-details">
                {#each relevantCodes as code}
                    <div><div>{code[0]}</div><div>{code[1]}</div></div>
                {/each}
            </div>
        </div>
        {/if}
        {/each}
        {#if listData.length > 10 && showHidden == false}
        <div class="result-more" on:click={() => { showHidden = true }} on:keypress={() => { showHidden = true }}>Se flere ({listData.length})</div>
        {/if}
    </div>
    <div class="result-notes">Listen over produksjon er ikke utfyllende.</div>
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
.result-totals {
    margin-block: 1rem;
    font-size: .9em;
}
.result-row {
    display: grid;
    grid-template-columns: 4fr 1fr 1fr;
    grid-template-rows: 30px;
    align-items: center;
    cursor: pointer;
}
.result-row:hover {
    background: #eee;
}
.result-row:nth-child(1) {
    font-weight: bold;
    cursor: initial;
}
.result-row:nth-child(1) .result-sum {
    text-transform: capitalize;
}
.result-row:nth-child(1):hover {
    background: initial;
}
.result-row.hidden {
    display: none;
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
.result-notes {
    font-size: .8em;
    margin-top: 1em;
    opacity: .7;
}
.info {
    margin-block: 1rem;
    padding-left: 1.5rem;
    border-left: 3px solid #406619;
    font-size: .9em;
}
.info-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;
}
h4 {
    font-size: 1.05em;
    margin-bottom: 4px;
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
</style>