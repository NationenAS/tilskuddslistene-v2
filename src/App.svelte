<script lang="ts">

import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"
import Map from "./Map.svelte"
import I from "./icons/I.svelte"
import { municipalities } from "./lib/municipalities"
import { productionCodes } from "./lib/productionCodes"
import { configStore, dataStore, totals } from "./stores"
import type { Config, AgriculturalSubsidy } from "./stores"

const endpoint = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

// Main list
let listData: any[] = []

// Unique
let uniqueData: any[] = [],
    uniqueOrgnr: string,
    lastUniqueData: any[] = [],
    lastUniqueOrgnr: string,
    relevantCodes: any[] = []

// UI
const nextLength = 25
let fetching = false,
    listLength = 0,
    map: any

// TEMP
const nationaLimit = 5000

const updateListData = (length: number) => {
    listData = $dataStore.sort((a, b) => b.sum - a.sum).slice(0, length)
}
const expandList = () => {
    const left = $totals.count - listLength
    listLength += left >= nextLength ? nextLength : left
}
const getMunicipality = (number: string): string | undefined => {
    const m = municipalities.find(e => e[1] == number)
    return m ? m[0] : undefined
}
const reset = () => {
    $dataStore = []
    listData = []
    listLength = 0
    uniqueData = []
    uniqueOrgnr = ""
}
const getSum = (row: AgriculturalSubsidy, codes: string[]) => {
    let sum = 0
    for (const code of codes) {
        sum = sum + Number(row[code])
    }
    return { ...row, sum } 
}
const updateQuery = (config: Config) => {

    reset()
    console.table(config)
    const params = new URLSearchParams()
    params.append('fields', `(id,orgnavn,orgnr,avloesertilskudd,soeknads_aar,saksbehandlende_kommune,geometry,${config.codes.join(',')})`)
    params.append('limit', config.limit.toString())
    // // If only one code, sort by that, or else we need to get the whole list and sort it client side
    if (config.codes.length == 1) params.append('sortBy', config.codes[0])
    // const codeClauses = config.codes.map(c => `${c}:0`).join('|')
    // params.append('greaterThan', codeClauses)
    if (config.municipality != undefined) 
        params.append('equal', `saksbehandlende_kommune:${config.municipality};soeknads_aar:${config.year}`)
    else if (config.county != undefined) 
        params.append('equal', `county:${config.county};soeknads_aar:${config.year}`)
    else { 
        params.append('equal', `soeknads_aar:${config.year}`)
        params.set('limit', '5000')
    }
    if (config.name != undefined) 
        params.append('q', `orgnavn:${config.name}`)

    fetching = true
    let start = performance.now()
    console.log("Fetching: " + endpoint + params)
    fetch(endpoint + params)
        .then(r => {
            console.log("Fetch time:", (performance.now() - start).toFixed(0) + " ms")
            console.log("Fetch size:", Number(r.headers.get("content-length"))/1000 + " kB")
            return r.json()
        })
        .then((d: AgriculturalSubsidy[]) => {
            $dataStore = [...d.map((row) => getSum(row, config.codes)).sort((a, b) => b.sum - a.sum)];
            listLength = 10 // This will trigger updateListData
            fetching = false
        }).catch(e => {
            console.log("Fetch error, time:", performance.now() - start + " ms, msg:", e)
        })
}

$: updateQuery($configStore)
$: updateListData(listLength)

function getProduction() {
    relevantCodes = []
    const thisYear = uniqueData.find(e => e.soeknads_aar == $configStore.year)
    for (const code in thisYear) {
        let value = thisYear[code]                                    // Loop though production codes in fetch result
        if (code.startsWith("p") && value > 0) {                        // Get code if has production
            let details = productionCodes.find(e => e[0] == code)       // Get details from productionCodes.js
            if (details) {                                              // If found in productionCodes.js, add to array
                let name = details[1]
                let unit = details[3] == "dekar" ? "da." : details[3]
                let color = 
                    // code.startsWith('p1') ? "#f3dfdf" :
                    // code.startsWith('p2') ? "#ede6dd" :
                    // code.startsWith('p8') ? "#e2e5e0" :
                    "#f3f3f3"
                relevantCodes.push({ name: name, value: value, unit: unit, color: color})
            }
        }
    }
}

function toggleInfo(orgnr: string) { 
    console.log(orgnr)
    // Clicked on same item
    if (orgnr == uniqueOrgnr) { 
        lastUniqueData = uniqueData; 
        lastUniqueOrgnr = uniqueOrgnr;
        uniqueData = [];
        uniqueOrgnr = ""; 
        return ;
    }
    // Clicked on last expanded item
    if (orgnr == lastUniqueOrgnr ) { 
        uniqueData = lastUniqueData;
        uniqueOrgnr = lastUniqueOrgnr;
        return 
    }
    let params = `limit=2&equal=orgnr:${orgnr}`
    console.log("Fetching unique: " + endpoint + params)
    fetch(endpoint + params)
        .then(r => r.json())
        .then(d => {
            uniqueData = d
            uniqueOrgnr = orgnr
            getProduction()
            console.log(d)
        })
}

</script>


<h2>Tilskuddslistene {$configStore.year}</h2>

<Navigation />

{#if $totals.count == 0 && fetching}
<Spinner />

{:else if $totals.count == 0}
<div class="no-items">Ingen oppføringer</div>

{:else if $totals.count > 0}
<div class="search-info">
    {#if $totals.count == nationaLimit}
        <I size="1.1rem" />Det er mange treff i søket, viser kun de største { nationaLimit } mottakere. Filtrer på geografi for å se alle.
    {:else if $totals.count > 0}
        <span>Antall mottakere: {$totals.count.toLocaleString('nb-NO')}.</span>
        <span>
            Totalt {$totals.sum > 1_000_000 ? $totals.sum.toLocaleString('nb-NO', {
                notation: "compact",
                compactDisplay: "long"
            }) : $totals.sum.toLocaleString('nb-NO')} {$configStore.unit}.
        </span>
    {/if}
</div>

<div class="result-container">
    <Map data={$dataStore} bind:this={map} />
    <div class="result-table">
        <div class="result-row result-header">
            <div>Navn</div>
            <div>Kommune</div>
            <div class="result-sum">
                {$configStore.unit}
                <svg
                aria-hidden="true"
                class="chevron"
                viewBox="0 0 15 9"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline points="1,1 8,8 14,1" />
              </svg>
            </div>
        </div>
        {#each listData as item (item.id)}
        <div class="result-row" class:expanded={uniqueOrgnr == item.orgnr} on:click={() => { toggleInfo(item.orgnr) }} on:keypress={() => { toggleInfo(item.orgnr) }}>
            <div>{item.orgnavn}</div>
            <div>{getMunicipality(item.saksbehandlende_kommune)}</div>
            <div class="result-sum">{ item.sum.toLocaleString('nb-NO') }</div>
            {#if uniqueOrgnr == item.orgnr}
            <div class="info">
                <div class="info-header">
                    <div>
                        <p><span>Org.nr:</span> {uniqueData[0].orgnr}</p>
                        <p><span>Totalt areal:</span> {uniqueData.find(year => year.soeknads_aar == $configStore.year).totalareal} dekar</p>
                    </div>
                    <div on:click={() => { map.zoomToPoint(uniqueData.find(year => year.soeknads_aar == $configStore.year).id) }} on:keypress={() => { map.zoomToPoint(uniqueData.find(year => year.soeknads_aar == $configStore.year).id) }}><svg viewBox="0 0 23 33.6"><path d="M11.5,0c6.3-.1,12,6.1,11.5,12.5-.1,3.2-2,5.8-3.5,8.5-2.1,3.7-6.7,11.8-7,12.1-.5,.8-1.7,.7-2.1,0-.5-.9-5.8-10-7.9-13.7C1.3,17.3,.1,15,0,12.6-.5,6.2,5.1,0,11.5,0c0,0,0,0,0,0ZM6.4,12c0,2.9,2.3,5,4.8,5.1,7.2,0,7.2-10.2,.2-10.3-2.6,0-5,2.3-5,5.1Z"></path></svg><u>Se gården på kart</u></div>
                </div>
                <div class="info-summary">
                    <div>
                        <div>
                            <div>{$configStore.year}</div>
                            <div>Sum produksjons- og avløsertilskudd</div>
                            <div>{ item.sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO') }</div>
                        </div>
                        <div>
                            <div></div>
                            <div>&mdash; Hvorav avløsertilskudd</div>
                            <div>{ item.avloesertilskudd.toLocaleString('nb-NO') }</div>
                        </div>
                    </div>
                    {#if $configStore.year != '2022' && uniqueData.find(year => year.soeknads_aar == '2022')}
                    <div>
                        <div>
                            <div>2022</div>
                            <div>Sum produksjons- og avløsertilskudd</div>
                            <div>{ uniqueData.find(year => year.soeknads_aar == '2022').sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO') }</div>
                        </div>
                        <div>
                            <div></div>
                            <div>&mdash; Hvorav avløsertilskudd</div>
                            <div>{ uniqueData.find(year => year.soeknads_aar == '2022').avloesertilskudd.toLocaleString('nb-NO') }</div>
                        </div>
                    </div>
                    {/if}
                </div>
                <h4>Utdrag av produksjon</h4>
                <div class="info-details">
                    {#each relevantCodes as p}
                        <div style="background: {p.color};">
                            <div class="name">{p.name}</div>
                            <div class="amount">{p.value} {p.unit}</div>
                        </div>
                    {/each}
                </div>
                <div class="info-disclaimer">Vi tar forbehold om at listen ikke er fullstendig.</div>
            </div>
            {/if}
        </div>
        {/each}
        {#if listData.length < $totals.count}
        <div class="result-more" on:click={() => { expandList() }} on:keypress={() => { expandList() }}>Se flere</div>
        {/if}
    </div>
</div>
{/if}


<style>
h2 {
    margin-bottom: 0;
}
.no-items {
    margin-top: 1.5rem;
}
.search-info {
    display: flex;
    align-items: center;
    gap: 0.5em;
}
.result-container {
    position: relative;   
}
.result-table {
    margin-top: 1em;
}
.result-row {
    display: grid;
    grid-template-columns: 4fr 1fr 1fr;
    align-items: center;
    cursor: pointer;
    padding: 0.8rem 0;
    border-bottom: 1px solid #333;
}
.result-row:not(.result-header):hover {
    background: #eee;
}
.result-row.expanded:hover {
    background: initial;
}
.result-header {
    font-weight: 500;
    font-size: 1rem;
    text-transform: uppercase;
    cursor: initial;
}
.result-header .chevron {
    height: 0.6em;
    fill: none;
    stroke: var(--TLAccentColorFull);
    stroke-width: 2px;
    stroke-linecap: round;
    stroke-linejoin: round;
    margin-left: 0.2rem;
}
.result-sum {
    text-align: right;
    font-variant-numeric: tabular-nums;
}
.result-more {
    text-align: center;
    margin-top: 10px;
    text-decoration: underline;
    font-size: .9em;
    cursor: pointer;
}
.info {
    grid-column: 1/-1;
    padding: 1rem 0 0.5rem;
}
.info-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;
}
.info p {
    margin: 0 0 0.3rem;
}
.info p span {
    font-weight: 500;
}
.info-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.95rem;
}
.info-summary > div {
    padding: 0.4rem;
    background: #eee;
}
.info-summary > div > div {
    display: grid;
    grid-template-columns: 3rem 1fr 6rem;
}
.info-summary > div > div > div:last-child {
    text-align: right;
    font-variant-numeric: tabular-nums;
}
h4 {
    font-size: 1.05em;
    margin-block: .8em .7em;
}
.info-details {
    display: flex;
    flex-wrap: wrap;
    font-size: 0.9rem;
    gap: 6px;
}
.info-details > div {
    display: flex;
    justify-content: space-between;
    width: calc(50% - 3px);
    background: #eee;
    padding: 3px 8px;
}
.info-details .amount {
    min-width: 25%;
    text-align: right;
}
.info-disclaimer {
    margin-top: 0.5rem;
    font-size: .8em;
    color: #666;
}
.info svg {
    height: 1em;
    margin-right: .5em;
}
@media (max-width: 600px) {
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