<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import { Vector2 } from '@/lib/math/vector'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- フェルマー螺旋上の点を描画する ---
  interface DrawPointOnFermatSpiralArgs {
    rot: number // 回転角
    i: number // 何番目の点か
    scale: number // 拡大倍率
  }
  const drawPointOnFermatSpiral = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    useId: string,
    { rot, i, scale }: DrawPointOnFermatSpiralArgs
  ) => {
    const theta = rot * i * Math.PI * 2
    const r = scale * Math.sqrt(i)

    const v = Vector2.fromAngle(theta).scale(r)

    return ctx.create('use').set({ href: `#${useId}`, x: v.x, y: v.y })
  }

  // --- 黄金数の離散的なフェルマー螺旋 ---
  onMount(() => {
    // --- settings ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    // 拡大倍率（点の大きさ）
    const scale = 5

    // 回転角
    const rot = (1 + Math.sqrt(5)) / 2

    // 点の最大数
    const maxIter = 1000

    // --- initialize elements ---

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      width: svgSize,
      height: svgSize,
    })

    const group = svg.create('g')
    group.moveTo(canvasSize / 2, canvasSize / 2)

    const id = 'point'
    svg.createForUse('circle', id).set({
      cx: scale / 2,
      cy: scale / 2,
      r: scale / 2,
      fill: '#EDB7ED',
    })

    const points: SkSVG<'use'>[] = []

    for (let i = 0; i < maxIter; i++) {
      const p = drawPointOnFermatSpiral(group, id, { rot, i, scale }).hide()
      points.push(p)
    }

    // --- main process ---

    // 描画の繰り返し回数を数える変数
    let i = 0

    const animate = () => {
      if (i > points.length - 1) return

      points[i].show()

      i++

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
