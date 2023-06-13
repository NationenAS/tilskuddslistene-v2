<script>

import { counties } from "./counties"
import { municipalities } from "./municipalities"
import { createEventDispatcher } from 'svelte'
import { onMount } from "svelte"

const dispatch = createEventDispatcher()

let config = {
    municipality: "",
    county: "",
    name: ""
}
let preventUpdate = true

function getParams() {
    let paramsString = String()
    if (config.municipality != "") paramsString += `&inPolygon=geometry:municipality:${config.municipality}`
    else if (config.county != "") paramsString += `&inPolygon=geometry:county:${config.county}`
    if (config.name != "") paramsString += `&in=orgnavn:${config.name}`
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

function update() {
    console.log(config)
    dispatch('navigationChange', {
        params: getParams()
    })
    preventUpdate = true
}

function handleSubmit() {

}

$: if (!preventUpdate) update(config)

onMount(() => {
    update()
})

</script>

<form on:submit|preventDefault={() => {preventUpdate = false, update()}}>
    <select class="form-control" name="county" bind:value={config.county} on:change={resetMunicipality}>
        <option value="">Alle fylker</option>
        {#each counties as county}
        <option value="{county[1]}">{county[0]}</option>
        {/each}
    </select>
    <select class="form-control" name="municipality" bind:value={config.municipality} on:change={setCorrectCounty}>
        <option value="">Alle kommuner</option>
        {#each municipalities as municipality}
        {#if ( config.county != "" && config.county == municipality[2] ) || config.county == "" }
        <option value="{municipality[1]}">{municipality[0]}</option>
        {/if}
        {/each}
    </select>
    <input type="text" placeholder="Søk på navn" bind:value={config.name}>
    <input type="submit">
</form>

<style>
</style>