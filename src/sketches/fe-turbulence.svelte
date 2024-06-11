<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Source graphic.
    svg.create('rect').set({
      width: 1000,
      height: 1000,
      filter: 'url(#play-turbulence)',
    })

    // Initialise the filter.
    const filter = svg.createFilter('play-turbulence')

    const noise = filter.create('feTurbulence').set({
      type: 'turbulence',
      numOctaves: 4,
      baseFrequency: 0.04,
      seed: Gen.random(0, 100),
    })

    // baseFrequencyを変化させるアニメーション
    noise.create('animate').set({
      attributeName: 'baseFrequency',
      from: '0.01',
      to: '0.1',
      dur: '10s',
      repeatCount: 'indefinite',
    })
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
