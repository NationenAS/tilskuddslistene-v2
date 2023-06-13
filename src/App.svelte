<script>

import { onMount } from "svelte"
import Spinner from "./Spinner.svelte"
import Navigation from "./Navigation.svelte"

const url = 'https://services.api.no/api/acies/v1/custom/AgriculturalSubsidy?'

let listData = []

function updateFromNav(event) {
    listData = []
    let params = "limit=10&sortBy=sum_produksjons_og_avloesertilskudd&fields=(id,orgnavn,sum_produksjons_og_avloesertilskudd,soeknads_aar)"
    let start = performance.now()
    console.log("Fetching " + url + params + event.detail.params)
    fetch(url + params + event.detail.params)
        .then(r => r.json())
        .then(d => {
            listData = d
            console.log("Fetch", performance.now() - start + " ms")
        })
}

</script>

<h2>Tilskuddslistene</h2>
<Navigation on:navigationChange={updateFromNav} />

{#if listData.length == 0}
<Spinner />
{:else}
<div class="result-table">
    {#each listData as item}
    <div>{item.soeknads_aar}</div>
    <div>{item.orgnavn}</div>
    <div>{item.sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO')}</div>
    {/each}
</div>
{/if}

<style>
.result-table {
    display: grid;

}
</style>