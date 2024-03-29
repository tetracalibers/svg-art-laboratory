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

    // Create a group for our generative city.
    const portoPareto = svg.create('g')

    // Create the sky gradient.
    svg.createGradient(
      'sky',
      'linear',
      ['#f58b10', '#d21263', '#940c5e', '#25226c'],
      90
    )
    // Create the sky and apply the gradient.
    portoPareto.create('rect').set({
      x: 150,
      y: 150,
      width: 700,
      height: 400,
      fill: 'url(#sky)',
    })

    // Create the river gradient.
    svg.createGradient('river', 'linear', ['#80e5ff10', '#70b566'], 90)
    // Create the river and apply the gradient.
    portoPareto.create('rect').set({
      x: 150,
      y: 555,
      width: 700,
      height: 295,
      fill: 'url(#river)',
    })

    // I’d like it to be framed within a circle and for the colors to look like they’re emanating outward.
    // To achieve this, I’m going to use something called a mask.

    // Create a radial gradient.
    svg.createGradient('radialGrad', 'radial', ['#ffffff', '#ffffff60'])
    // Create a mask, and inside it create the circle with the radial gradient.
    let mask = svg.create('mask').set({ id: 'mask' })
    mask.create('circle').set({
      cx: 500,
      cy: 500,
      r: 325,
      fill: 'url(#radialGrad)',
    })
    // Apply the mask to the group.
    portoPareto.set({ mask: 'url(#mask)' })

    // You should now see the cityscape cut out in the shape of this circle, with the edges slightly fading out.
    // As a final step, I’ve added in a gradiented circular stroke to frame the content a little more clearly.

    // Create a linear gradient for our circular frame.
    svg.createGradient('strokeGrad', 'linear', ['#eeeeee', '#eeeeee15'])
    // Create the frame and apply the gradient.
    svg.create('circle').set({
      cx: 500,
      cy: 500,
      r: 345,
      fill: 'none',
      stroke: 'url(#strokeGrad)',
      stroke_width: 2.5,
    })

    // A loop for our generative cityscape.
    for (let i = 0; i < 60; i += 1) {
      // Get a pareto distribution with a min height of 20.
      let pareto = Gen.pareto(20)
      // Constrain the height, and slightly randomise the upper limit.
      // - Without Gen.constrain() function, our Pareto distribution would generate some dizzyingly high buildings that would extend well beyond the canvas limits.
      // - However, using Gen.constrain() alone with a set upper limit leads to a clipped effect on the highest buildings,
      //   so to even this out, I’ve added in a Gen.random() function to vary the upper limit.
      let height = Gen.constrain(pareto, 20, Gen.random(150, 200))
      // Create our buildings.
      portoPareto.create('line').set({
        x1: 150 + i * 12,
        y1: 550,
        x2: 150 + i * 12,
        y2: 550 - height,
        stroke: '#181818',
        stroke_width: 8,
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
