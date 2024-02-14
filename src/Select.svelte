<script lang="ts">
  import { afterUpdate } from 'svelte';

  export let disabled = false;
  export let value: any = undefined;
  export let options: {
    value: any;
    label: any;
  }[] = [];
  export let callback: (event: Event) => void = (event: Event) => {};

  let select: HTMLSelectElement;

  const resizeSelect = (select: HTMLSelectElement) => {
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.fontFamily = 'national2, "National 2", sans-serif'; // FIX BRICK!
    temp.style.fontSize = '1rem';
    temp.innerText = select.selectedOptions[0]?.textContent || '';
    document.body.appendChild(temp);
    select.style.width = `calc(${
      temp.getClientRects().item(0)?.width
    }px +  3em)`;
    temp.remove();
  };

  afterUpdate(() => {
    resizeSelect(select);
  });
</script>

<div class="select" class:active={value !== undefined} class:disabled>
  <select bind:value bind:this={select} on:change={callback} {disabled}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <svg
    aria-hidden="true"
    class="chevron"
    viewBox="0 0 15 9"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="1,1 8,8 14,1" />
  </svg>
</div>

<style>
  .select {
    position: relative;
    display: flex;
  }

  .select select {
    border: 2px solid var(--TLAccentColorLight);
    padding: var(--TLButtonPadding);
    border-radius: var(--TLButtonBorderRadius);
    font-family: inherit;
    font-size: inherit;
    background: var(--TLAccentColorLight);
    appearance: none;
    color: #333;
    cursor: pointer;
  }
  .select .chevron {
    pointer-events: none;
    position: absolute;
    right: 0.8em;
    top: 50%;
    transform: translateY(-50%);
    fill: none;
    stroke: #333;
    stroke-width: 2px;
    stroke-linecap: round;
    stroke-linejoin: round;
    width: 0.6em;
    height: auto;
  }
  .select.active select,
  .select.active .chevron {
    background: var(--TLAccentColorFull);
    border-color: var(--TLAccentColorFull);
    color: black;
    stroke: black;
  }
  .select:not(.disabled):hover select,
  .select:hover .chevron {
    border-color: black;
    stroke: black;
    color: black;
  }
  .select select option {
    font-family: inherit;
  }
  .select select:disabled {
    background: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
    user-select: none;
  }
  .select.disabled .chevron {
    opacity: 0.7;
    background: inherit;
  }
</style>
