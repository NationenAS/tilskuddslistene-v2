<script lang="ts">

import Select from "./Select.svelte";
import { counties } from "./lib/counties"
import { municipalities } from "./lib/municipalities"
import { selectableCodes } from "./lib/selectList";
import { defaultConfig, configStore } from "./stores"
import type { Config } from "./stores";

let localConfig: Config = { ...$configStore };

const updateConfig = () => {
    // If municipality, set county
    if (localConfig.municipality != $configStore.municipality && localConfig.municipality != undefined) {
        localConfig.county = municipalities.find(e => e[1] == localConfig.municipality)?.[2] || undefined;
    }
    // If county, reset municipality
    else if (localConfig.county != $configStore.county) {
        localConfig.municipality = undefined
    }
    // If type, set unit
    else if (localConfig.type != $configStore.type) {
        localConfig.unit = selectableCodes.find(c => c[0] == localConfig.type)?.[3] || undefined
    }
    if (localConfig.name == '') localConfig.name = undefined
    $configStore = { ...localConfig }
}

const reset = () => {
    localConfig = { ...defaultConfig }
    $configStore = { ...defaultConfig }
}

$: filteredMunicipalities = $configStore.county == undefined ? municipalities : municipalities.filter(m => m[2] == $configStore.county)

</script>

<form>
    <div class="navigation">
        <div>
            <Select 
                value={localConfig.year}
                options={[{ label: '2022', value: '2022' }]} 
                callback={updateConfig}
                disabled
            />
        </div>
        <div>
            <Select 
                bind:value={localConfig.county}
                options={[{ label: 'Alle fylker', value: undefined }, ...counties.map(c => ({ label: c[0], value: c[1] }))]} 
                callback={updateConfig} 
            />
            <Select 
                bind:value={localConfig.municipality}
                options={[
                    { label: 'Alle kommuner', value: undefined }, 
                    ...filteredMunicipalities.map(m => ({ label: m[0], value: m[1] }))
                ]} 
                callback={updateConfig}
            />
        </div>
        <div>
            <Select 
                bind:value={localConfig.type}
                options={selectableCodes.map(c => ({ label: c[1], value: c[0] }))} 
                callback={updateConfig}
            />
        </div>
        <div>
            <input class:active={localConfig.name} type="text" placeholder="Søk på navn" bind:value={localConfig.name}>
            <input type="submit" value="Søk" on:click|preventDefault={updateConfig}>
        </div>
        <div>
            <input type="submit" class="reset" value="Tilbakestill" on:click={() => { reset() }}>
        </div>
    </div>
</form>

<style>
.navigation {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
.navigation > div {
    display: flex;
    gap: 1rem;
    width: fit-content;
}
input[type=text] {
    all: unset;
    flex: 1;
    min-width: 300px;
    border-bottom: 2px solid var(--TLAccentColorFull);
}
input[type=submit] {
    all: unset;
    padding: var(--TLButtonPadding);
    border: 2px solid var(--TLAccentColorLight);
    border-radius: var(--TLButtonBorderRadius);
    background: var(--TLAccentColorLight);
    cursor: pointer;
    transition: all 0.2s;
}
input[type=submit]:hover {
    background: var(--TLAccentColorFull);
    border-color: var(--TLAccentColorFull);
    color: black;
}
input.reset {
    border-color: black;
    background: white;
}
</style>