export class PerlinNoise2D {
  private grad: { [key: string]: { x: number; y: number } }
  private cache: { [key: string]: number }

  constructor() {
    this.grad = {}
    this.cache = {}
  }

  get(x: number, y: number = 0): number {
    const key = `${x},${y}`

    if (key in this.cache) {
      return this.cache[key]
    }

    const xf = Math.floor(x)
    const yf = Math.floor(y)

    const tl = this.#gridDotProduct(x, y, xf, yf)
    const tr = this.#gridDotProduct(x, y, xf + 1, yf)
    const bl = this.#gridDotProduct(x, y, xf, yf + 1)
    const br = this.#gridDotProduct(x, y, xf + 1, yf + 1)

    const xt = this.#fade(x - xf, tl, tr)
    const xb = this.#fade(x - xf, bl, br)
    const v = this.#fade(y - yf, xt, xb)

    this.cache[key] = v

    return v
  }

  #gridDotProduct(x: number, y: number, vx: number, vy: number): number {
    const key = `${vx},${vy}`
    let gVec: { x: number; y: number }
    let dVec = { x: x - vx, y: y - vy }

    if (key in this.grad) {
      gVec = this.grad[key]
    } else {
      const th = Math.random() * 2 * Math.PI
      gVec = { x: Math.cos(th), y: Math.sin(th) }
      this.grad[key] = gVec
    }

    return dVec.x * gVec.x + dVec.y * gVec.y
  }

  #fade(t: number, a: number, b: number): number {
    const t3 = t * t * t
    const t4 = t3 * t
    const t5 = t4 * t
    return a + (6 * t5 - 15 * t4 + 10 * t3) * (b - a)
  }
}
