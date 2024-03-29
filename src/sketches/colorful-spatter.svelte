<script lang="ts">
  import { SkSVG } from '@/lib/sksvg/render'
  import { random } from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  const iterations = random(500, 1000)

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize =
      winInnerWidth < winInnerHeight ? winInnerWidth : winInnerHeight

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    for (let i = 0; i < iterations; i += 1) {
      svg.create('circle').set({
        cx: random(0, 1000),
        cy: random(0, 1000),
        r: random(1, 10),
        fill: `hsl(${random(0, 360)} 80% 80% / ${random(5, 40)}%)`,
      })
    }
  })
</script>

<svelte:window
  bind:innerWidth="{winInnerWidth}"
  bind:innerHeight="{winInnerHeight}"
/>

<div bind:this="{container}" class="sketch-container"></div>

<style>
  .sketch-container {
    display: flex;
  }
</style>
