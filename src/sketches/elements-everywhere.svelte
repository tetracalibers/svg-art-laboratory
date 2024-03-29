<script lang="ts">
  import { SkSVG } from '@/lib/sksvg/render'
  import { pickRandom, random } from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  const iterations = random(500, 1000)
  const elements = ['circle', 'line', 'rect']

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize =
      winInnerWidth < winInnerHeight ? winInnerWidth : winInnerHeight

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    for (let i = 0; i < iterations; i += 1) {
      const element = pickRandom(elements)

      // I’ve constrained the x and y variables to a range of 200 to 800,
      // which ensures our shapes remain within that region and don’t cover the entire canvas.
      // This is so that we end up something that more closely resembles a composition than an explosion.
      const x = random(200, 800)
      const y = random(200, 800)

      const fill = `hsl(${random(120, 240)} 80% 80% / ${random(5, 40)}%)`
      const stroke = `hsl(${random(0, 120)} 80% 80% / ${random(5, 40)}%)`
      const strokeWidth = `${random(1, 3)}`

      const props = (() => {
        switch (element) {
          case 'circle':
            return {
              cx: x,
              cy: y,
              r: random(1, 10),
              fill: fill,
              stroke: stroke,
              stroke_width: strokeWidth,
            }
          case 'line':
            return {
              x1: x,
              y1: y,
              x2: x + random(-20, 20),
              y2: y + random(-20, 20),
              stroke: stroke,
            }
          case 'rect':
            return {
              x: x,
              y: y,
              width: random(5, 25),
              height: random(5, 25),
              fill: fill,
              stroke: stroke,
              stroke_width: strokeWidth,
              // we are randomly rotating the rect relative to 500 500,
              // that is, the center of the viewBox.
              transform: `rotate(${random(0, 360)} 500 500)`,
            }
          default:
            return {}
        }
      })()

      svg.create(element).set(props)
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
