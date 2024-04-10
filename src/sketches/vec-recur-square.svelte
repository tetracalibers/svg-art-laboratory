<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import { Vector2 } from '@/lib/math/vector'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- ベクトルから正方形を描画する ---
  interface DrawSquareArgs {
    vertex: Vector2[]
  }
  const drawSquare = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { vertex }: DrawSquareArgs
  ) => {
    return ctx.create('polygon').set({
      points: vertex.map((v) => `${v.x},${v.y}`).join(' '),
      stroke: '#D2E0FB',
      fill: 'none',
    })
  }

  // --- 頂点のずれを表す差分ベクトルの計算 ---
  const getGapVector = (vertex: Vector2[], gap: number) => {
    if (vertex.length !== 4) return []

    const diff: Vector2[] = []

    for (let i = 0; i < 4; i++) {
      const curr = vertex[i]
      const next = vertex[(i + 1) % 4]

      // ２頂点間の方向ベクトル
      // gap分だけずらす
      const dir = next.sub(curr).scale(gap)
      diff.push(dir)
    }

    return diff
  }

  // --- 正方形の頂点をずらしながら再帰的に描画 ---
  onMount(() => {
    // --- settings ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

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

    const initialVertex = [
      new Vector2(0, 0), // 左上
      new Vector2(canvasSize, 0), // 右上
      new Vector2(canvasSize, canvasSize), // 右下
      new Vector2(0, canvasSize), // 左下
    ]

    // 頂点
    let vertex = initialVertex

    drawSquare(group, { vertex })

    // --- re-render ---

    const modeList = [
      {
        gap: 0.5,
        maxRender: 30,
      },
      {
        gap: 0.2,
        maxRender: 30,
      },
      {
        gap: 0.1,
        maxRender: 70,
      },
      {
        gap: 0.02,
        maxRender: 300,
      },
    ]

    let modeIdx = 0
    let count = 0

    const animate = () => {
      const mode = modeList[modeIdx]

      const diff = getGapVector(vertex, mode.gap)
      vertex = vertex.map((v, i) => v.add(diff[i]))

      drawSquare(group, { vertex })

      count++
      if (count > mode.maxRender) {
        // switch to next mode
        modeIdx++
        if (modeIdx > modeList.length - 1) {
          modeIdx = 0
        }

        // clear
        count = 0
        group.clear()

        // init
        vertex = initialVertex
        drawSquare(group, { vertex })
      }

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
