<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { PerlinNoise2D } from '@/lib/sksvg/noise'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // Noise-related.
  const noise = new PerlinNoise2D()
  let n = Gen.random(0, 1000)
  const speed = 0.05
  // this will be used when we map the noise value to a new range (increasing its volume so to speak).
  const amplifier = Gen.random(200, 500)

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Curve and colour-related.
    const curves = svg.create('g')
    const numCurves = Gen.random(75, 125)
    let hue = Gen.random(0, 360)

    for (let i = 0; i < numCurves; i += 1) {
      // retrieve and then re-map our noise into a more fit-for-purpose range (using the aforementioned amplifier variable).
      // - Notice here that the range will span positive and negative values, so we won’t know the polarity in advance.
      //   In the case of our curves, this will help us mimic a more organic movement, as the values won’t always be uniformly offset from the original starting point, but wrap around them more naturally.
      let noiseValue = noise.get(n)
      noiseValue = Gen.map(noiseValue, -1, 1, -amplifier, amplifier, false)

      // M command co-ordinates.
      const mx = 0
      const my = 0 + i * 5
      // C command co-ordinates.
      const cpx1 = 0 + noiseValue
      const cpy1 = -100
      const cpx2 = 250 + noiseValue
      const cpy2 = -100
      const x2 = 300
      const y2 = 0
      // S command co-ordinates.
      const spx = 350 + noiseValue
      const spy = 100
      const x3 = 300
      const y3 = -50

      // Create the organic curve.
      curves.create('path').set({
        fill: 'none',
        stroke: `hsl(${hue} 80% 80% / 0.8)`,
        d: `M ${[mx, my]}
            c ${[cpx1, cpy1, cpx2, cpy2, x2, y2]}
            s ${[spx, spy, x3, y3]}`,
      })

      // Increment the noise and hue.
      n += speed
      hue = (hue % 360) + noiseValue / 25

      // 10% chance of spawning a 'bubble'.
      if (Gen.chance(10)) {
        svg.create('circle').set({
          r: Gen.random(5, 50),
          cx: Gen.random(150, 850),
          cy: Gen.random(150, 850),
          fill: `hsl(0 0% 100% / 0.1)`,
          stroke: '#888',
        })
      }
    }

    // to center-align our curve group
    curves.moveTo(500, 500)
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
