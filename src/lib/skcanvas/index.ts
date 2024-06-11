export class SkCanvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')

    const _ctx = this.canvas.getContext('2d')
    if (!_ctx) {
      throw new Error('CanvasRenderingContext2D is not supported')
    }
    this.ctx = _ctx
  }

  addTo(node: Element) {
    node.appendChild(this.canvas)
    return this
  }

  set(attributes: { [name: string]: any }) {
    for (let key in attributes) {
      // JavaScriptで属性を設定するときにハイフンを使うことはできない
      // そのため、stroke_widthのような属性名をstroke-widthに変換する
      const prop = key.replace(/_/g, '-')
      this.canvas.setAttribute(prop, attributes[key].toString())
    }
    return this
  }

  circle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2)
    this.ctx.closePath()
    return this
  }

  fill(color?: string) {
    if (color) {
      this.ctx.fillStyle = color
    }
    this.ctx.fill()
    return this
  }

  fillRGB(r: number, g: number, b: number) {
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    this.ctx.fill()
    return this
  }
}
