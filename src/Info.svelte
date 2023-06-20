<script>
import { fly } from 'svelte/transition'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

function hide() {
    dispatch('hide')
}

export let data

data = data[0]

</script>

<div class="result-info" in:fly="{{ x: 1000, duration: 500 }}" out:fly="{{ x: 1000, duration: 500 }}" on:click={() => { hide() }} on:keypress={() => { hide() }}>
    <h3>{data.orgnavn}</h3>
    <div>{data.orgnr}</div>
    <div>Sum mottatt i {data.soeknads_aar}: {data.sum_produksjons_og_avloesertilskudd.toLocaleString('nb-NO')} kroner</div>
</div>

<style>
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