<script lang="ts">

import Select from "./Select.svelte";
import { counties as counties2023 } from "./lib/counties"
import { municipalities as municipalities2023 } from "./lib/municipalities"
import { counties, municipalities } from "./lib/newGeo";
// import { selectableCodes } from "./lib/selectList";
import { selectableCodes } from "./lib/codes";
import { defaultConfig, configStore } from "./stores"
import type { Config } from "./stores";

const getGeo = (year: string): { municipalities: [name: string, code: string, county: string][]; counties: [name: string, code: string][] } => {
    if (year == '2024') return { 
        municipalities: municipalities.map(item => [item.name, item.code, item.parent.code]),
        counties: counties.map(item => [item.name, item.code]) }
    return { municipalities: municipalities2023, counties: counties2023 }
}

$: geo = getGeo($configStore.year)

let localConfig: Config = { ...$configStore };

const updateConfig = () => {
    // If municipality, set county
    if (localConfig.municipality != $configStore.municipality && localConfig.municipality != undefined) {
        localConfig.county = geo.municipalities.find(e => e[1] == localConfig.municipality)?.[2] || undefined;
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

$: filteredMunicipalities = $configStore.county == undefined ? geo.municipalities : geo.municipalities.filter(m => m[2] == $configStore.county)

</script>

<form>
    <div class="navigation">
        <fieldset>
            <legend>Tilskuddsår</legend>
            <Select 
                bind:value={localConfig.year}
                options={[
                    { label: '2024', value: '2024' },
                    { label: '2023', value: '2023' },
                    { label: '2022', value: '2022' }
                ]} 
                callback={updateConfig}
            />
        </fieldset>
        <!-- <fieldset>
            <legend>Produksjon</legend>
            <Select 
                bind:value={localConfig.type}
                options={[
                    { label: 'Alle typer', value: undefined },
                    ...selectableCodes.map(c => ({ label: c.textShort, value: c.id }))
                ]} 
                callback={updateConfig}
            />
        </fieldset> -->
        <fieldset>
            <legend>Geografi</legend>
            <Select 
                bind:value={localConfig.county}
                options={[{ label: 'Alle fylker', value: undefined }, ...geo.counties.map(c => ({ label: c[0], value: c[1] }))]} 
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
            <div class="text-submit" class:active={$configStore.name}>
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
    flex-wrap: wrap;
}
legend {
    margin-bottom: 0.3rem;
    font-size: 0.9em;
    font-weight: 100;
    color: #333;
}
input {
    user-select: none;
    color: #333;
}
.text-submit {
    display: flex;
}
input[type=text] {
    all: unset;
    flex: 1;
    border: 2px solid var(--TLAccentColorLight);
    border-radius: var(--TLButtonBorderRadius) 0 0 var(--TLButtonBorderRadius); 
    padding: var(--TLButtonPadding);
}
.text-submit.active input[type=text] {
    border-color: var(--TLAccentColorFull);
    z-index: 2;
}
.text-submit.active input[type=submit] {
    background: var(--TLAccentColorFull);
    border-color: var(--TLAccentColorFull);
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
    border-radius: 0 var(--TLButtonBorderRadius) var(--TLButtonBorderRadius) 0;
    margin-left: -2px;
    padding-left: 1rem;
}
input:focus,
input:hover {
    z-index: 100;
    border-color: black;
}
input.reset {
    background: white;
}
</style>