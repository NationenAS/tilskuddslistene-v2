<script>

import { counties } from "./counties"
import { municipalities } from "./municipalities"
import { productionCodes } from "./productionCodes"
import { createEventDispatcher } from 'svelte'
import { onMount } from "svelte"

const dispatch = createEventDispatcher()

let config = {
    municipality: "",
    county: "",
    name: "",
    type: "",
    year: "2022"
}
let preventUpdate = true

function getParams() {
    let paramsString = String()
    if (config.municipality != "") paramsString += `&equal=saksbehandlende_kommune:${config.municipality}`
    else if (config.county != "") paramsString += `&inPolygon=geometry:county:${config.county}`
    if (config.type != "") paramsString += `&greaterThan=${config.type}:0`
    if (config.name != "") paramsString += `&in=orgnavn:${config.name}`
    let limit = (config.name != "" || config.county != "") ? 99999 : 10
    return { paramsString, limit }
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
    console.log("Config",c)
    let p = getParams()
    dispatch('navigationChange', {
        params: p.paramsString,
        limit: p.limit
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
            <option value="">Alle produksjonstyper</option>
            {#each productionCodes as code}
            <option value="{code[0]}">{code[1]}</option>
            {/each}
        </select>
        <input class:active="{config.name}" type="text" placeholder="Søk på navn" bind:value={config.name}>
        <input type="submit" value="Søk" on:click={() => {preventUpdate = false, update()}}>
    </div>
</form>

<style>
.navigation {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}
select, input {
    display: block;
    background: #636363;
    border: none;
    padding: 10px 15px;
    color: white;
    font-size: 1rem;
    border-radius: 2px;
    outline: none;
}
.active {
    background: #406619;
}
select, input[type=submit] {
    cursor: pointer;
}
select:hover, input[type=submit]:hover, input[type=text]:focus {
    filter: brightness(1.1);
}
select:disabled {
    cursor: not-allowed;
}
input::placeholder {
    color: white;
    opacity: .7;
}
</style>