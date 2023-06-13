<script>
import { counties } from "./counties"
import { municipalities } from "./municipalities"
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

let config = {
    municipality: "",
    county: ""
}

function getParams() {
    let paramsString = String()
    for (const element in config) {
        if (config[element] != "") {
            if (element == "municipality") paramsString += `&inPolygon=geometry:municipality:${config[element]}`
            else if (element == "county") paramsString += `&inPolygon=geometry:county:${config[element]}`
        }
    }
    return paramsString
}

function update() {
    console.log(config)
    dispatch('navigationChange', {
        params: getParams()
    })
}

function handleSubmit() {

}

$: update(config)

</script>

<form on:submit|preventDefault={handleSubmit}>
    <select class="form-control" name="county" bind:value={config.county}>
        <option value="">Alle fylker</option>
        {#each counties as county}
        <option value="{county[1]}">{county[0]}</option>
        {/each}
    </select>
    <select class="form-control" name="municipality" bind:value={config.municipality}>
        <option value="">Alle kommuner</option>
        {#each municipalities as municipality}
        <option value="{municipality[1]}">{municipality[0]}</option>
        {/each}
    </select>
</form>

<style>
</style>