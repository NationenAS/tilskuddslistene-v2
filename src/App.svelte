<script>

import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"
import { municipalities } from "./municipalities"
import { productionCodes } from "./productionCodes"

const url = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

let listData = []
let uniqueData = {}
let lastUniqueData = {}
let relevantCodes = []
let showHidden = false
let fetching = false

function getMunicipality(number) {
    let m = municipalities.find(e => e[1] == number)
    return m[0]
}
function updateFromNav(event) {
    listData = []
    uniqueData = {}
    showHidden = false
    let limit = event.detail.limit || 10
    let params = "sortBy=sum_produksjons_og_avloesertilskudd&fields=(id,orgnavn,saksbehandlende_kommune,sum_produksjons_og_avloesertilskudd)"
    let start = performance.now()
    console.log("Fetching: " + url + params + event.detail.params)
    fetching = true
    fetch(url + params + event.detail.params + "&limit=" + limit)
        .then(r => r.json())
        .then(d => {
            console.log("Fetch time", performance.now() - start + " ms")
            listData = d
            fetching = false
            console.log("Hits", d.length)
        }).catch(e => {
            console.log("Fetch error, time", performance.now() - start + " ms")
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
function toggleInfo(id) {
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

</script>

<h2>Tilskuddslistene</h2>
<Navigation on:navigationChange={updateFromNav} />

{#if listData.length == 0 && fetching}
<Spinner />
{:else if listData.length == 0}
<div>Ingen oppføringer</div>
{:else}
<div class="result-container">
    <div class="result-table">
        <div class="result-row">
            <div>Navn</div>
            <div>Kommune</div>
            <div class="result-sum">Sum</div>
        </div>
        {#each listData as item, i}
        <div class="result-row" class:hidden="{i > 9 && !showHidden}" on:click={() => { toggleInfo(item.id) }} on:keypress={() => { toggleInfo(item.id) }}>
            <div>{item.orgnavn}</div>
            <div>{getMunicipality(item.saksbehandlende_kommune)}</div>
            <div class="result-sum">{item.sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO')} kr</div>
        </div>
        {#if uniqueData.id == item.id}
        <div class="info">
            <div class="info-header">
                <div>
                    Org.nr: <span>{uniqueData.orgnr}</span><br>
                    Totalt areal: <span>{uniqueData.totalareal} dekar</span>
                </div>
                <div><svg viewBox="0 0 23 33.6"><path d="M11.5,0c6.3-.1,12,6.1,11.5,12.5-.1,3.2-2,5.8-3.5,8.5-2.1,3.7-6.7,11.8-7,12.1-.5,.8-1.7,.7-2.1,0-.5-.9-5.8-10-7.9-13.7C1.3,17.3,.1,15,0,12.6-.5,6.2,5.1,0,11.5,0c0,0,0,0,0,0ZM6.4,12c0,2.9,2.3,5,4.8,5.1,7.2,0,7.2-10.2,.2-10.3-2.6,0-5,2.3-5,5.1Z"></path></svg><u>Se gården på kart</u></div>
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
.result-container {
    position: relative;   
}
.result-table {
    margin-top: 20px;
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