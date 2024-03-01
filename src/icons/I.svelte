<script>
export let size = undefined;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width={size} height={size} style="min-width:{size}">
  <circle cx="25" cy="25" r="25" class="back"></circle>
  <circle cx="25" cy="14" r="3" class="front"></circle>
  <rect x="22.5" y="20" width="5" height="18" class="front"></rect>
</svg>

<style>
  .back {
    fill: var(--TLAccentColorDark);
  }
  .front {
    fill: #f9f9f9;
  }
</style>