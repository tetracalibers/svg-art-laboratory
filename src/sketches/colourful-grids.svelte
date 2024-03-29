<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import { pickRandom } from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  const palettes = [
    ['#5465FF', '#788BFF', '#9BB1FF', '#BFD7FF', '#E2FDFF'],
    ['#22577A', '#38A3A5', '#57CC99', '#80ED99', '#C7f9CC'],
    ['#4C5760', '#93A8AC', '#D7CEB2', '#A59E8C', '#66635B'],
  ]

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize =
      winInnerWidth < winInnerHeight ? winInnerWidth : winInnerHeight

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Create our grid container group.
    const grid = svg.create('g')

    const palette = pickRandom(palettes)

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
        // Create our clip path with a unique id.
        const clip = svg.create('clipPath').set({ id: `${x}${y}` })
        // Create the clip path shape.
        clip.create('rect').set({
          x: x,
          y: y,
          width: cellSize,
          height: cellSize,
        })

        // Define our possible positions.
        const positions = [
          [x, y], // top left
          [x + cellSize, y], // top right
          [x + cellSize, y + cellSize], // bottom right
          [x, y + cellSize], // bottom left
        ]
        // Pick a random position.
        const position = pickRandom(positions)

        // Create a group for our circles.
        const circles = grid.create('g')
        // Create the circles, applying the picked position and palette.
        for (let i = 0; i < 5; i += 1) {
          circles.create('circle').set({
            cx: position[0],
            cy: position[1],
            r: cellSize - i * (cellSize / 5), // this took a bit of tweaking
            fill: palette[i],
          })
        }

        // Apply the clip path to the circle group.
        circles.set({
          clip_path: `url(#${clip.get('id')})`,
        })

        // Create a square to frame the cell.
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
