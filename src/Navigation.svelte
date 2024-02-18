<script lang="ts">

import Select from "./Select.svelte";
import { counties } from "./lib/counties"
import { municipalities } from "./lib/municipalities"
// import { selectableCodes } from "./lib/selectList";
import { selectableCodes } from "./lib/codes";
import { defaultConfig, configStore } from "./stores"
import type { Config } from "./stores";
    import I from "./icons/I.svelte";

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
    // If type, set codes and unit
    else if (localConfig.type != $configStore.type) {
        if (localConfig.type == undefined) {
            localConfig.codes = defaultConfig.codes
            localConfig.unit = defaultConfig.unit
        }
        else {
            localConfig.codes = selectableCodes.find(c => c.id == localConfig.type)?.codes || []
            localConfig.unit = selectableCodes.find(c => c.id == localConfig.type)?.unit || undefined
        }
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
        <fieldset>
            <legend>Tilskuddsår</legend>
            <Select 
                value={localConfig.year}
                options={[{ label: '2022', value: '2022' }]} 
                callback={updateConfig}
                disabled
            />
        </fieldset>
        <fieldset>
            <legend>Produksjon</legend>
            <Select 
                bind:value={localConfig.type}
                options={[
                    { label: 'Alle typer', value: undefined },
                    ...selectableCodes.map(c => ({ label: c.textShort, value: c.id }))
                ]} 
                callback={updateConfig}
            />
        </fieldset>
        <fieldset>
            <legend>Geografi</legend>
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
        </fieldset>
        <fieldset>
            <legend>Navn på foretak</legend>
            <div class="text-submit">
                <input class:active={localConfig.name} type="text" placeholder="Søk på navn" bind:value={localConfig.name}>
                <input class="search" type="submit" value="Søk" on:click|preventDefault={updateConfig}>
            </div>
            <input type="submit" class="reset" value="Tilbakestill" on:click={() => { reset() }}>
        </fieldset>
    </div>
</form>

<style>
.navigation {
    display: flex;
    flex-wrap: wrap;
    gap: 1.3rem;
}
fieldset {
    all: unset;
    display: flex;
    gap: 0.8rem;
}
legend {
    margin-bottom: 0.4rem;
    font-size: 0.9em;
    font-weight: 100;
    color: #333;
}
fieldset .info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9em;
}
input {
    user-select: none;
    color: #333;
}
.text-submit {
    position: relative;
    display: flex;
    gap: 0.5rem;
    border: 2px solid var(--TLAccentColorLight);
    border-radius: var(--TLButtonBorderRadius); 
}
input[type=text] {
    all: unset;
    flex: 1;
    min-width: 15rem;
    padding: var(--TLButtonPadding);
}
input[type=submit] {
    all: unset;
    color: #333;
    padding: var(--TLButtonPadding);
    border: 2px solid var(--TLAccentColorLight);
    border-radius: var(--TLButtonBorderRadius);
    background: var(--TLAccentColorLight);
    cursor: pointer;
    transition: all 0.2s;
}
input[type=submit].search {
    position: absolute;
    right: -2px;
    top: -2px;
}
input[type=submit]:hover {
    border-color: black;
    color: black;
}
input[type=submit]:focus {
    border-color: black;
}
input.reset {
    background: white;
}
</style>