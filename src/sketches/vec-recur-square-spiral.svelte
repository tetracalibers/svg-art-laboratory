<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import { Vector2 } from '@/lib/math/vector'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- 補助線として対数螺旋を描画する ---
  interface DrawLogSpiralArgs {
    gap: number
    canvasSize: number
  }
  const drawLogSpiral = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { gap, canvasSize }: DrawLogSpiralArgs
  ) => {
    const CURVE_STEP = 2 * Math.PI * 0.001

    const b = Math.sqrt(2 * gap * gap - 2 * gap + 1)
    const c = Math.atan(gap / (1 - gap))

    const center = new Vector2(canvasSize / 2, canvasSize / 2)

    let v = new Vector2(0, 0).sub(center)

    const points = [v.x, v.y]

    while (v.mag > 1) {
      const next = v.rotate(CURVE_STEP).scale(Math.pow(b, CURVE_STEP / c))
      points.push(next.x, next.y)
      v = next
    }

    ctx.create('polyline').set({
      points: points.join(' '),
      stroke: '#EB6383',
      stroke_width: 2,
      transform: `translate(${center.x} ${center.y})`,
      stroke_linecap: 'round',
      fill: 'none',
    })
  }

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

  // --- 正方形の軌跡と対数螺旋 ---
  onMount(() => {
    // --- settings ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    const initialVertex = [
      new Vector2(0, 0), // 左上
      new Vector2(canvasSize, 0), // 右上
      new Vector2(canvasSize, canvasSize), // 右下
      new Vector2(0, canvasSize), // 左下
    ]

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

    // --- initialize elements ---

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      width: svgSize,
      height: svgSize,
    })

    // spiralの方を上に表示したい
    const groupSquare = svg.create('g')
    const groupSpiral = svg.create('g')

    // --- render ---

    let vertex = initialVertex
    let modeIdx = 0

    drawLogSpiral(groupSpiral, { gap: modeList[modeIdx].gap, canvasSize })
    drawSquare(groupSquare, { vertex })

    // --- re-render ---

    let count = 0

    const animate = () => {
      const mode = modeList[modeIdx]

      const diff = getGapVector(vertex, mode.gap)
      vertex = vertex.map((v, i) => v.add(diff[i]))

      drawSquare(groupSquare, { vertex })

      count++
      if (count > mode.maxRender) {
        // switch to next mode
        modeIdx++
        if (modeIdx > modeList.length - 1) {
          modeIdx = 0
        }
        const newMode = modeList[modeIdx]

        // clear
        count = 0
        groupSquare.clear()
        groupSpiral.clear()

        // init
        vertex = initialVertex
        drawSquare(groupSquare, { vertex })
        drawLogSpiral(groupSpiral, { gap: newMode.gap, canvasSize })
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
