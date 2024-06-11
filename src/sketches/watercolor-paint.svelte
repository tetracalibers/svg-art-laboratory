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
    svg.set({ viewBox: '0 0 200 200', width: svgSize, height: svgSize })

    // background
    svg.create('rect').set({ width: 200, height: 200, fill: '#fff' })

    // picture like a watercolor
    const picture = svg.create('g').set({ filter: 'url(#watercolor)' })

    // add circle
    picture.create('circle').set({
      cx: 100,
      cy: 60,
      r: 40,
      fill: 'rgb(64,127,224)',
      'fill-opacity': 0.8,
    })

    // add text
    picture
      .create('text')
      .set({
        x: 100,
        y: 160,
        'font-size': '40pt',
        'font-family': 'cursive',
        'text-anchor': 'middle',
        'font-weight': 'bold',
        fill: 'rgb(64,64,200)',
      })
      .content('Color')

    // Initialise the filter.
    const filter = svg.createFilter('watercolor').set({
      'color-interpolation-filters': 'linearRGB',
    })

    // --- noise texture ---

    filter.create('feTurbulence').set({
      type: 'fractalNoise',
      // 値が高くなるほど、ノイズ領域がより明らかになる
      baseFrequency: 0.04,
      // 値を大きくすると、より自然な結果が得られるが、プロセッサの負荷が高くなる
      // 1 ~ 5 くらいが適切
      numOctaves: 2,
      seed: 1458,
      result: 'noise-lg',
    })

    filter.create('feTurbulence').set({
      type: 'fractalNoise',
      baseFrequency: 0.2,
      numOctaves: 3,
      seed: 7218,
      result: 'noise-md',
    })

    // --- pictureの各アイテムの内部に波を含ませる ---

    filter.create('feComposite').set({
      result: 'BaseGraphic',
      in: 'SourceGraphic',
      in2: 'noise-lg',
      operator: 'arithmetic',
      k1: 0.5,
      k2: 0.6,
      k4: -0.07,
    })

    // --- layer-1: 周囲に広がる滲み（モノクロ） ---

    // 膨張させる
    filter.create('feMorphology').set({
      result: 'layer-1',
      in: 'BaseGraphic',
      operator: 'dilate',
      radius: 1,
    })

    // 輪郭を揺らがせる
    filter.create('feDisplacementMap').set({
      result: 'layer-1',
      in: 'layer-1',
      in2: 'noise-lg',
      xChannelSelector: 'R',
      yChannelSelector: 'B',
      scale: 2,
    })

    // 輪郭に細かく波打つような歪みを加える
    filter.create('feDisplacementMap').set({
      result: 'layer-1',
      in: 'layer-1',
      in2: 'noise-md',
      xChannelSelector: 'R',
      yChannelSelector: 'B',
      scale: 4,
    })

    // 透明度に関して歪みを加える
    filter.create('feDisplacementMap').set({
      result: 'mask',
      in: 'layer-1',
      in2: 'noise-lg',
      xChannelSelector: 'A',
      yChannelSelector: 'A',
      scale: 6,
    })

    // ぼかす
    filter.create('feGaussianBlur').set({
      result: 'mask',
      in: 'mask',
      stdDeviation: 1,
    })

    // 重ねる（結果はモノクロになる）
    filter.create('feComposite').set({
      result: 'layer-1',
      in: 'layer-1',
      in2: 'mask',
      operator: 'arithmetic',
      k1: 1.2,
      k2: -0.25,
      k3: -0.25,
      k4: 0,
    })

    // --- layer-2: 絵の具の混ざりと滲み（カラー） ---

    // 輪郭の揺らぎ
    filter.create('feDisplacementMap').set({
      result: 'layer-2',
      in: 'BaseGraphic',
      in2: 'noise-lg',
      xChannelSelector: 'G',
      yChannelSelector: 'R',
      scale: 4,
    })

    // 輪郭の細かな歪み
    filter.create('feDisplacementMap').set({
      result: 'layer-2',
      in: 'layer-2',
      in2: 'noise-md',
      xChannelSelector: 'A',
      yChannelSelector: 'G',
      scale: 2,
    })

    // 絵の具の混じりを表現するため、思い切り捻る
    filter.create('feDisplacementMap').set({
      result: 'glow',
      in: 'BaseGraphic',
      in2: 'noise-lg',
      xChannelSelector: 'R',
      yChannelSelector: 'A',
      scale: 16,
    })

    // 捻った結果は形状の内部に収まるよう、収縮させる
    filter.create('feMorphology').set({
      result: 'glow-diff',
      in: 'glow',
      operator: 'erode',
      radius: 1,
    })

    // 捻った結果のアウトラインが描かれる
    filter.create('feComposite').set({
      result: 'glow',
      in: 'glow',
      in2: 'glow-diff',
      operator: 'out',
    })

    // 捻った結果をぼかす
    filter.create('feGaussianBlur').set({
      result: 'glow',
      in: 'glow',
      stdDeviation: 1.6,
    })

    // 歪めた形状と、捻ってぼかしたアウトラインを合成
    filter.create('feComposite').set({
      result: 'layer-2',
      in: 'layer-2',
      in2: 'glow',
      operator: 'arithmetic',
      k1: 1.5,
      k2: 0,
      k3: 0.3,
    })

    // --- layer-1とlayer-2の合成 ---

    filter.create('feComposite').set({
      result: 'composite',
      in: 'layer-1',
      in2: 'layer-2',
      operator: 'arithmetic',
      k1: -0.8,
      k2: 0.8,
      k3: 1.4,
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
