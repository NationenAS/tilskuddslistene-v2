<script>

import { counties } from "./lib/counties"
import { municipalities } from "./lib/municipalities"
import { selectableCodes } from "./lib/selectList";
import { createEventDispatcher } from 'svelte'
import { onMount } from "svelte"

const dispatch = createEventDispatcher()

let config = {
    municipality: "",
    county: "",
    name: "",
    type: "sum_produksjons_og_avloesertilskudd",
    year: "2022",
    limit: 1000
}
let preventUpdate = true

// Get params string and set config
function getParams() {
    let paramsString = `&greaterThan=${config.type}:0`
    if (config.municipality != "") paramsString += `&equal=saksbehandlende_kommune:${config.municipality}`
    else if (config.county != "") paramsString += `&inPolygon=geometry:county:${config.county}`
    if (config.name != "") paramsString += `&in=orgnavn:${config.name}`
    if (config.name != "" || config.municipality != "") {
        paramsString += "&limit=" + 99999
        config.limit = 99999
    }
    else paramsString += "&limit=" + config.limit
    config.unit = selectableCodes.find(c => c[0] == config.type)[3]
    return paramsString
}

function getCounty(municipalityNumber) {
    let m = municipalities.find(e => e[1] == municipalityNumber)
    return { name: m[0], number: m[1], county: m[2] }
}

function setCorrectCounty() {
    preventUpdate = false
    if (config.municipality != "") {
        let m = getCounty(config.municipality)
        if (config.county != m.county) config.county = m.county
    }
}

function resetMunicipality() {
    preventUpdate = false
    config.municipality = ""
}

function update(c) {
    let p = getParams()
    dispatch('navigationChange', {
        params: p,
        config: c
    })
    preventUpdate = true
}

$: if (!preventUpdate) update(config)

onMount(() => {
    update(config)
})

</script>

<form on:submit|preventDefault={() => {preventUpdate = false, update()}}>
    <div class="navigation">
        <select name="year" bind:value={config.year} disabled>
            <option value="2022">2022</option>
        </select>
        <select class:active="{config.county}" name="county" bind:value={config.county} on:change={resetMunicipality}>
            <option value="">Alle fylker</option>
            {#each counties as county}
            <option value="{county[1]}">{county[0]}</option>
            {/each}
        </select>
        <select class:active="{config.municipality}" name="municipality" bind:value={config.municipality} on:change={setCorrectCounty}>
            <option value="">Alle kommuner</option>
            {#each municipalities as municipality}
            {#if ( config.county != "" && config.county == municipality[2] ) || config.county == "" }
            <option value="{municipality[1]}">{municipality[0]}</option>
            {/if}
            {/each}
        </select>
        <select class:active="{config.type}" name="type" bind:value={config.type} on:change={() => {preventUpdate = false, update()}}>
            {#each selectableCodes as code}
            <option value="{code[0]}">{code[1]}</option>
            {/each}
        </select>
        <input class:active="{config.name}" type="text" placeholder="Søk på navn" bind:value={config.name}>
        <input type="submit" value="Søk" on:click={() => {preventUpdate = false, update()}} on:submit={() => {preventUpdate = false, update()}}>
        <input type="submit" value="Tilbakestill" on:click={() => {preventUpdate = false; config = { municipality: "", county: "", name: "", type: "sum_produksjons_og_avloesertilskudd", year: "2022", limit: 100, unit: "kr"}; }}>
    </div>
</form>

<style>
form {
    padding-block: 20px 30px;
    border: 3px solid #eee;
    border-radius: 5px;
}
.navigation {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;
}
select, input {
    display: block;
    border: none;
    border-bottom: 3px solid #ccc;
    padding: 5px 5px 5px 0;
    font-size: 1rem;
    color: #666;
    outline: none;
}
.active {
    border-color: #406619;
    color: black;
}
select, input[type=submit] {
    cursor: pointer;
}
input[type=submit] {
    border: 3px solid #ccc;
    background: white;
    padding-inline: 10px;
    border-radius: 3px;
}
select:hover, input[type=submit]:hover, input[type=text]:focus {
    filter: brightness(1.1);
}
select:disabled {
    cursor: not-allowed;
    border-bottom-style: dotted;
}
input::placeholder {
    color: #666;
    opacity: .7;
}
</style>