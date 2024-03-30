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

    // Create our source graphic.
    svg.create('circle').set({
      r: 300,
      cx: 500,
      cy: 500,
      fill: 'url(#random-gradient)',
      filter: 'url(#rocky-randomness)',
    })

    // A random colour array.
    const colours = [
      `hsl(${Gen.random(0, 360)} 80% 80% / 0.75)`,
      `hsl(${Gen.random(0, 360)} 80% 80% / 0.75)`,
      `hsl(${Gen.random(0, 360)} 80% 80% / 0.75)`,
    ]
    // A gradient with a randomised rotation and array of colours.
    svg.createGradient('random-gradient', 'linear', colours, Gen.random(0, 360))

    // Initalise the filter.
    const filter = svg.createFilter('rocky-randomness')

    // Create the primary turbulence.
    filter.create('feTurbulence').set({
      type: 'turbulence',

      // The numOctaves will vary between 2 and 7, which will allow for quite a degree of variation in the level of detail.
      numOctaves: Gen.random(2, 7),

      baseFrequency: Gen.random(0.003, 0.01, true),
      seed: Gen.random(0, 1000),
      result: 'turbulence',
    })

    // Now we have raw turbulence covering the canvas, and while it does vary on each refresh, it still feels a little too uniform.
    // How can we create something more organic and a little less grid-like?
    // Well, we could distort it with … more turbulence!

    // Set up another instance of turbulence.
    filter.create('feTurbulence').set({
      type: 'fractalNoise',

      // The baseFrequency we’ll ramp up a little
      baseFrequency: Gen.random(0.01, 0.07, true),

      // we’ll keep numOctaves and the seed to a similar range
      numOctaves: Gen.random(3, 7),
      seed: Gen.random(0, 1000),

      result: 'noise',
    })

    // Distort the first instance of turbulence with the second.
    filter.create('feDisplacementMap').set({
      // distort the first input, in, using values from the second input, in2
      // in2 acts as the map from which we can derive the displacement values, that is, the values that decide how much distortion we should apply along the x and y axes.
      in: 'turbulence',
      in2: 'noise',

      // randomize the scale value (which determines the strength of the distortion)
      // - scale determines how much distortion to apply (i.e., to what extent is in distorted by in2)
      scale: Gen.random(25, 40),

      // set R and G as the x and y channel selectors (purely because I didn’t really like the default output of alpha on this occasion)
      // - xChannelSelector and yChannelSelector specify which channels are responsible for horizontal and vertical displacement
      // - If we take a single color channel, R, as an example, its value can range from 0 to 255. Values below 127 result in negative displacement (they’re shifted left along the x axis, or up along the y axis), whereas values above 127 result in positive displacement (shifted to the right along the x axis, or down along the y axis).
      xChannelSelector: 'R',
      yChannelSelector: 'G',

      result: 'distortion',
    })

    // Shine a specular point light on the distorted output.
    // - setting up a light in SVG involves defining two elements: one, the outer node, which defines whether the target surface of the lighting is diffuse or specular; and two, the inner node, which defines the type of light source to be used.
    filter
      // feSpecularLighting
      // - simulates specular reflection, which is characteristic of smoother surfaces (like a bowling ball).
      // - With specular reflection, the light that strikes the surface bounces at a definite angle.
      .create('feSpecularLighting')
      .set({
        in: 'distortion',

        // surfaceScale
        // - defines the relative height of the bump map
        surfaceScale: Gen.random(5, 30),

        // specularConstant
        // - determines the strength of the light cast by the source
        specularConstant: Gen.random(2, 6),

        // specularExponent
        // - controls the focal point strength
        specularExponent: Gen.random(10, 25),

        result: 'lighting',
      })
      // fePointLight
      // - a more proximate light source that has a defined focal point
      .create('fePointLight')
      .set({
        // The fePointLight source has no azimuth or elevation; it is instead defined entirely by x, y, and z attributes.

        // you’ll see that these combinations keep the lighting to the periphery of the canvas.
        // This is mainly to prevent any direct shine (think of an unwelcome camera flash in a photograph).
        // - the x and y attributes refer to the standard two-dimensional position in the current coordinate space.
        x: Gen.pickRandom([-50, 500, 1050]),
        y: Gen.pickRandom([-50, 1050]),

        // - the z attribute would correspond with the elevation or height of the light source
        z: Gen.random(50, 250),
      })

    // If you load up the sketch at this point, you should see some interesting generative terrain emerge.
    // Before we bring the terrain and the source graphic back together, we’re going to soften the edges of the latter with some feGaussianBlur.

    // Blur the source graphic.
    filter.create('feGaussianBlur').set({
      in: 'SourceGraphic',
      stdDeviation: Gen.random(25, 50),
      result: 'blur',
    })

    // Bring the lit texture in via the blurred source graphic.
    filter.create('feComposite').set({
      in: 'lighting',
      in2: 'blur',
      operator: 'in',
      result: 'comp1',
    })

    // Recover the original gradient.
    filter.create('feComposite').set({
      in: 'blur',
      in2: 'comp1',
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
