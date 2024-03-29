export class PerlinNoise2D {
  cache: Map<[number, number], number>
  grad: Map<[number, number], { x: number; y: number }>

  constructor() {
    this.cache = new Map()
    this.grad = new Map()
  }

  // Get the noise value at the specified co-ordinates.
  // - accepts an x coordinate and optional y coordinate as arguments and returns the value at that point in the noise space
  get(x: number, y = 0) {
    const cached = this.cache.get([x, y])
    if (cached) return cached

    const xf = Math.floor(x)
    const yf = Math.floor(y)

    const tl = this.#gridDotProduct(x, y, xf, yf)
    const tr = this.#gridDotProduct(x, y, xf + 1, yf)
    const bl = this.#gridDotProduct(x, y, xf, yf + 1)
    const br = this.#gridDotProduct(x, y, xf + 1, yf + 1)

    const xt = this.#fade(x - xf, tl, tr)
    const xb = this.#fade(x - xf, bl, br)
    const v = this.#fade(y - yf, xt, xb)

    this.cache.set([x, y], v)

    return v
  }

  #gridDotProduct(x: number, y: number, vx: number, vy: number) {
    let gVec: { x: number; y: number }
    const dVec = { x: x - vx, y: y - vy }

    const prev = this.grad.get([vx, vy])

    if (prev) {
      gVec = prev
    } else {
      let th = Math.random() * 2 * Math.PI
      gVec = { x: Math.cos(th), y: Math.sin(th) }
      this.grad.set([vx, vy], gVec)
    }

    return dVec.x * gVec.x + dVec.y * gVec.y
  }

  #fade(x: number, a: number, b: number) {
    let s = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3
    return a + s * (b - a)
  }
}
