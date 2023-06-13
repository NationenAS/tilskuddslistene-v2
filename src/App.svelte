<script>

import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"
import { fly } from 'svelte/transition'

const url = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

let listData = []
let currentQuery = ""
let uniqueData = {}
let uniqueBox = false

function updateFromNav(event) {
    listData = []
    let params = "limit=10&sortBy=sum_produksjons_og_avloesertilskudd&fields=(id,orgnavn,sum_produksjons_og_avloesertilskudd,soeknads_aar)"
    let start = performance.now()
    console.log("Fetching: " + url + params + event.detail.params)
    currentQuery = url + params + event.detail.params
    fetch(url + params + event.detail.params)
        .then(r => r.json())
        .then(d => {
            listData = d
            console.log("Fetch", performance.now() - start + " ms")
        }).catch(e => {
            console.log("Fetch error", performance.now() - start + " ms")
        })
}

function showInfo(id) {
    uniqueBox = true
    let params = `limit=1&equal=id:${id}&fields=(id,orgnavn,orgnr,sum_produksjons_og_avloesertilskudd,soeknads_aar)`
    console.log("Fetching unique: " + url + params)
    fetch(url + params)
        .then(r => r.json())
        .then(d => {
            uniqueData = d[0]
        })
}
function hideInfo() {
    uniqueData = {}
    uniqueBox = false
}

</script>

<h2>Tilskuddslistene</h2>
<Navigation on:navigationChange={updateFromNav} />

{#if listData.length == 0}
<Spinner />
{:else}
<div class="result-container">
    <div class="result-table">
        <div class="result-row">
            <div>År</div>
            <div>Navn</div>
            <div class="result-sum">Sum</div>
        </div>
        {#each listData as item}
        <div class="result-row" on:click={() => { showInfo(item.id) }} on:keypress={() => { showInfo(item.id) }}>
            <div>{item.soeknads_aar}</div>
            <div>{item.orgnavn}</div>
            <div class="result-sum">{item.sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO')} kr</div>
        </div>
        {/each}
    </div>
    {#if uniqueBox }
    <div class="result-info" in:fly="{{ x: 1000, duration: 500 }}" out:fly="{{ x: 1000, duration: 500 }}" on:click={() => { hideInfo() }}>
        {#if Object.keys(uniqueData).length == 0}
        <Spinner />
        {:else}
        <h3>{uniqueData.orgnavn}</h3>
        <div>{uniqueData.orgnr}</div>
        <div>Sum mottatt i {uniqueData.soeknads_aar}: {uniqueData.sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO')} kroner</div>
        {/if}
    </div>
    {/if}
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
    grid-template-columns: 1fr 4fr 1fr;
    grid-template-rows: 30px;
    align-items: center;
    cursor: pointer;
}
.result-row:hover {
    background: #eee;
}
.result-sum {
    text-align: right;
}
.result-info {
    position: absolute;
    top: 0%;
    height: 100%;
    left: 50%;
    width: 50%;
    background: black;
    color: white;
    padding: 30px;
    cursor: pointer;
}
</style>