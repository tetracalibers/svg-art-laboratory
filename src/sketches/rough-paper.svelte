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

    // Create a parchment-coloured gradient.
    svg.createGradient('parchment', 'linear', ['#fffbeb', '#fde68a'], 90)
    // Create the path for the ripped paper.
    const paper = svg.create('path').set({
      fill: 'url(#parchment)',
      stroke: '#4444',
      d: 'M 0,0 h 175 l 175,550 h -350 Z M 210,0 h 340 v 550 h -165 Z',
      filter: 'url(#rough-paper)',
    })
    // Centre it.
    paper.moveTo(500, 500)

    // Initialise the filter.
    const filter = svg.createFilter('rough-paper')

    // Add turbulence to simulate paper grain.
    filter.create('feTurbulence').set({
      type: 'fractalNoise',
      numOctaves: 5,
      baseFrequency: 0.04,
      seed: Gen.random(0, 100),
      result: 'turbulence',
    })

    // Shine diffuse lighting on the turbulence.
    filter
      // feDiffuseLighting
      // - simulates diffuse reflection
      //   What this means is that the light that strikes the surface of a diffuse-lit object is scattered in all directions, as is characteristic of rough surface textures (like linen).
      .create('feDiffuseLighting')
      .set({
        // surfaceScale
        // - defines the relative height of the bump map
        surfaceScale: 1,

        // diffuseConstant
        // - determines the strength of the light cast by the source
        diffuseConstant: 1.3,

        in: 'turbulence',
        result: 'lighting',
      })
      // feDistantLight
      // - an ambient light that emits rays uniformly in all directions (such as the sun)
      .create('feDistantLight')
      .set({
        // azimuth
        // - specifies the angle of direction of the light
        // elevation
        // - specifies the height of the light source
        // To use the sun analogy, at dawn it would rise in the east (at an azimuth and elevation of 0) and by midday at the equator, it would have climbed to an elevation of 90, directly overhead.
        azimuth: 180,
        elevation: 45,
      })

    // Distort the paper source graphic with turbulence.
    // - rough up the edges of our source graphic
    filter.create('feDisplacementMap').set({
      in: 'SourceGraphic',
      in2: 'turbulence',
      scale: 25,
      result: 'distortion',
    })

    // Merge the lighting with the rough-edged paper.
    filter.create('feComposite').set({
      in: 'lighting',
      in2: 'distortion',
      operator: 'in',
      result: 'composite',
    })

    // Re-introduce the parchment gradient.
    filter.create('feBlend').set({
      in: 'composite',
      in2: 'distortion',
      mode: 'multiply',
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
