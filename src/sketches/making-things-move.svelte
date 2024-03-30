<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // Arrays to contain our shapes and their colours.
  const palette = ['#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
  const shapes: SkSVG<'rect'>[] = []

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Initialise our four shapes.
    for (let i = 0; i < 4; i += 1) {
      const size = 500 - i * 125
      const position = 250 + i * 62.5
      const shape = svg.create('rect').set({
        x: position,
        y: position,
        width: size,
        height: size,
        fill: palette[i],
        transform_origin: '50% 50%',
        transform: 'rotate(45)',
      })
      shapes.push(shape)
    }

    // --- Animation with CSS Keyframes ---

    // Set an id for our first shape.
    shapes[0].set({ id: 'cssShape' })
    // Animate this shape with CSS.
    svg.create('style').content(`
      @keyframes scaleRotate {
        0% { transform: rotate(0) scale(1, 1) }
        50% { transform: rotate(180deg) scale(0.5, 1.5) }
        100% { transform: rotate(360deg) scale(1, 1) }
      }
      #cssShape {
        animation-name: scaleRotate;
        animation-duration: 5s;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
      }
    `)

    // --- Animation with SMIL ---

    // Rotate the second shape using SMIL.
    shapes[1].create('animateTransform').set({
      attributeName: 'transform',
      type: 'rotate',
      from: '0',
      to: '360',
      dur: '5s',
      repeatCount: 'indefinite',
    })
    // Scale the second shape using SMIL.
    shapes[1].create('animateTransform').set({
      attributeName: 'transform',
      type: 'scale',
      // It has more than two states, so instead of the from and to attributes, we have a values attribute that can store multiple states.
      // In this case, we supply it with a semicolon-separated list of our transform values.
      values: '1 1; 0.5 1.5; 1 1',
      dur: '5s',
      // We also need to include an additional additive attribute with a value of sum so that the scale transform adds to (and doesn’t overwrite) the previous rotate transform.
      additive: 'sum',
      repeatCount: 'indefinite',
    })

    // --- Animation with Web Animations API ---

    shapes[2].animate(
      {
        transform: [
          'rotate(0deg) scale(1, 1)',
          'rotate(180deg) scale(0.5, 1.5)',
          'rotate(360deg) scale(1, 1)',
        ],
      },
      {
        duration: 5000,
        iterations: Infinity,
      }
    )

    // --- Animation with requestAnimationFrame ---

    // for scale
    // - if we tried creating these states inside the loop, they would get overwritten on each iteration.
    // - The scale increment value needs to swing back and forth between an upper and a lower limit, and the most straightforward way to achieve this is to keep track of the current scale value and its polarity (i.e., whether it’s swinging one way or another).
    //   For this, we’ll need a boolean that we can toggle back and forth like a switch.
    //   We’ll also need a way to increment the scale value in a way that synchronizes with the time but doesn’t use the timestamp value directly as this would only increment it indefinitely.
    let isPositive = true
    let scale = 0
    let tick = 0
    let prevTime = 0

    // Animate the last shape using requestAnimationFrame.
    function animate(time = 0) {
      // Rotate 360° in 5000ms: 360/5000 = 0.072.
      const angle = time * 0.072

      // We need a constant tick value that doesn't increment indefinitely.
      tick = time - prevTime
      // Scale by 0.5 in 2500ms: 0.5/2500 = 0.0002.
      scale = isPositive ? scale + tick * 0.0002 : scale - tick * 0.0002

      // Apply the rotation and scale values.
      shapes[3].set({
        transform: `rotate(${angle}) scale(${1 - scale}, ${1 + scale})`,
      })

      // Flip the polarity if the scale value falls outside these bounds.
      if (scale < 0 || scale > 0.5) isPositive = !isPositive
      // Capture the time before it increments.
      prevTime = time

      // The recursive bit.
      requestAnimationFrame(animate)
    }
    animate()
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
