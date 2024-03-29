<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
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

    const gridSize = 700
    const rows = 15
    const spacing = 5

    const increment = gridSize / rows
    // The Math.abs() function just ensures our cellSize is always a positive value,
    // which can prevent errors if we go crazy with our rows and spacing values.
    const cellSize = Math.abs(increment - spacing)

    // A nested loop to visualise the grid.
    for (let y = 0; y < gridSize; y += increment) {
      for (let x = 0; x < gridSize; x += increment) {
        grid.create('rect').set({
          x: x,
          y: y,
          width: cellSize,
          height: cellSize,
          fill: 'none',
          stroke: '#eee',
        })
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
