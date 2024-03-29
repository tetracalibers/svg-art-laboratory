<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import { chance, random } from '@/lib/sksvg/generative'
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

    // Create our grid container group.
    const grid = svg.create('g')

    // Pick a random hue.
    let hue = random(0, 360)

    const gridSize = 700
    const rows = 15
    const spacing = 5

    const increment = gridSize / rows
    // The Math.abs() function just ensures our cellSize is always a positive value,
    // which can prevent errors if we go crazy with our rows and spacing values.
    const cellSize = Math.abs(increment - spacing)

    // A nested loop to visualise the grid.
    for (let y = 0; y < gridSize; y += increment) {
      // Increment the hue relative to the rows, keeping it within 0 and 360.
      hue = hue >= 360 ? hue - 360 + 120 / rows : hue + 120 / rows

      for (let x = 0; x < gridSize; x += increment) {
        // This loop will create random line elements inside each cell,
        // but only if the cell is activated by the Gen.chance() function.
        if (chance(60)) {
          for (let i = 0; i < cellSize; i += 1) {
            grid.create('line').set({
              x1: random(x, x + cellSize),
              y1: random(y, y + cellSize),
              x2: random(x, x + cellSize),
              y2: random(y, y + cellSize),
              stroke: `hsl(${hue} 80% 80% / 0.33)`,
            })
          }
        }
      }
    }

    // Centre the grid within the viewBox.
    grid.moveTo(500, 500)
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
