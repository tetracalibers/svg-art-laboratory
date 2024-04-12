<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import { Vector2 } from '@/lib/math/vector'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- ベクトルから多角形を描画する ---
  interface DrawPolygonArgs {
    vertex: Vector2[]
  }
  const drawPolygon = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { vertex }: DrawPolygonArgs
  ) => {
    return ctx.create('polygon').set({
      points: vertex.map((v) => `${v.x},${v.y}`).join(' '),
      stroke: '#D2E0FB',
      fill: 'none',
    })
  }

  // --- 頂点のずれを表す差分ベクトルの計算 ---
  const getGapVector = (vertex: Vector2[], gap: number) => {
    const diff: Vector2[] = []

    const n = vertex.length

    for (let i = 0; i < n; i++) {
      const curr = vertex[i]
      const next = vertex[(i + 1) % n]

      // ２頂点間の方向ベクトル
      // gap分だけずらす
      const dir = next.sub(curr).scale(gap)
      diff.push(dir)
    }

    return diff
  }

  // --- 正多角形の頂点をずらしながら再帰的に描画 ---
  onMount(() => {
    // --- settings ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    // 正多角形の頂点数
    const n = 5
    // 内接する正多角形のずれ
    const gap = 0.05
    // 描画する正多角形の最大数
    const maxRender = 200

    // --- initialize elements ---

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      width: svgSize,
      height: svgSize,
    })

    const group = svg.create('g')

    // --- render ---

    // 頂点
    let vertex: Vector2[] = []

    for (let i = 0; i < n; i++) {
      vertex[i] = Vector2.fromAngle((Math.PI * 2 * i) / n).scale(canvasSize / 2)
    }

    drawPolygon(group, { vertex }).set({
      transform: `translate(${canvasSize / 2},${canvasSize / 2})`,
    })

    // --- re-render ---

    let count = 0

    const animate = () => {
      count++
      if (count > maxRender) return

      const diff = getGapVector(vertex, gap)
      vertex = vertex.map((v, i) => v.add(diff[i]))

      drawPolygon(group, { vertex }).set({
        transform: `translate(${canvasSize / 2},${canvasSize / 2})`,
      })

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
