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

    // Create the source graphic.
    svg.create('circle').set({
      cx: 500,
      cy: 500,
      r: Gen.random(250, 350),
      fill: '#000',
      filter: 'url(#cosmic)',
    })

    // Initialise the filter.
    const filter = svg.createFilter('cosmic')

    // Create a random amount of turbulence.
    // - We’ll randomize the seed, keep the dial low on the baseFrequency, and crank up the numOctaves to 4, to bring out some of the texture details.
    filter.create('feTurbulence').set({
      // type
      // - This can be set to fractalNoise or turbulence (the default).
      // - The former produces the same kind of noise pattern across the red, green, blue, and alpha channels, and the latter produces a different pattern in the alpha channel.
      // - The fractalNoise type has a softer look and is great for generating gaseous textures like clouds.
      // - The turbulence type, on the other hand, is more liquid-like in appearance.
      type: 'fractalNoise',

      // baseFrequency
      // - This is the only mandatory attribute, and we can think of it as defining the noise “zoom level.”
      // - It’s typical for the lowest value to start at 0.0001 (though you can start lower), and the higher the values go, the more of our noise terrain is revealed.
      // - If you supply two numeric values instead of one, the first will define the frequency along the x axis and the second along the y axis.
      //   Decoupling the values this way makes it possible to stretch or compress the resulting texture horizontally or vertically.
      baseFrequency: Gen.random(0.002, 0.006, true),

      // seed
      // - This allows us to change the “location” from which we sample our noise.
      // - If the baseFrequency is our zoom level, the seed is our position.
      // - A valid seed value should be a positive integer anywhere from 0 to 10 million.
      seed: Gen.random(0, 10000),

      // numOctaves
      // - This attribute refers to the number of octaves present in the noise signal and determines the level of detail we can discern.
      // - Higher values render more natural results but are more processor-intensive.
      // - The most usable results lie in the range of 1 to 5.
      numOctaves: 4,

      // stitchTiles
      // - This attribute accepts either stitch or noStitch and refers to how adjacent areas of the noise terrain are blended together.
      // - With it set to noStitch (the default), certain noise configurations can lead to a “tiling” effect, where the boundary between noise regions is quite pronounced.
      //   Setting a value of stitch can soften this.
      stitchTiles: 'stitch',

      result: 'turbulence',
    })

    // In our next step, we’ll create a target region to displace (i.e., apply distortion to).
    // To create this target area, what we’ll do is soften the edges of the source graphic (the circle) using an feGaussianBlur; this has the effect of introducing some transparency to the circle’s perimeter.
    // This area of receding transparency (another way of describing a blur) will be what we use to apply distortion to our turbulence.

    // Blur the edges of the source graphic.
    filter.create('feGaussianBlur').set({
      stdDeviation: Gen.random(10, 25),
      in: 'SourceGraphic',
      result: 'blurred',
    })

    // Displace the turbulence with the blurred edge of the circle.
    // - This primitive allows us to distort the first input, in, using values from the second input, in2. This second input acts as the map from which we can derive the displacement values, that is, the values that decide how much distortion we should apply along the x and y axes.
    //   This means that we could use the output from feTurbulence to distort our SourceGraphic by feeding both through feDisplacementMap.
    filter.create('feDisplacementMap').set({
      in: 'turbulence',
      in2: 'blurred',

      // scale
      // - determines how much distortion to apply (i.e., to what extent is in distorted by in2)
      scale: Gen.random(250, 500),

      result: 'distortion',
    })

    // Remove everything beyond the blurred perimeter.
    filter.create('feComposite').set({
      in: 'distortion',
      in2: 'blurred',
      operator: 'atop',
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
