const NAMESPACE = 'http://www.w3.org/2000/svg'

export type SVGTagName = keyof SVGElementTagNameMap

export class SkSVG<T extends SVGTagName = 'svg'> {
  element: SVGElementTagNameMap[T]
  child?: SkSVG<SVGTagName>
  cursorX?: number
  cursorY?: number

  constructor(elementName: string = 'svg', namespace = NAMESPACE) {
    this.element = <SVGElementTagNameMap[T]>(
      document.createElementNS(namespace, elementName)
    )

    if (this.element.nodeName === 'svg') {
      this.element.setAttribute('xmlns', namespace)
    }
  }

  addTo(node: Element) {
    node.appendChild(this.element)
    return this
  }

  clear() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }
    return this
  }

  set(attributes: { [name: string]: any }) {
    for (let key in attributes) {
      // JavaScriptで属性を設定するときにハイフンを使うことはできない
      // そのため、stroke_widthのような属性名をstroke-widthに変換する
      const prop = key.replace(/_/g, '-')
      this.element.setAttributeNS(null, prop, attributes[key].toString())
    }
    return this
  }

  // create an element and automatically append it to our parent SVG
  create<Name extends SVGTagName>(elementName: Name): SkSVG<Name> {
    const newElement = new SkSVG<Name>(elementName)
    this.child = newElement

    if (elementName === 'defs') {
      this.child.element = this.#defsCheck()
    } else {
      this.element.appendChild(this.child.element)
    }

    return newElement
  }

  createForUse<Name extends SVGTagName>(
    elementName: Name,
    id: string
  ): SkSVG<Name> {
    this.#isMainSVG()

    const newElement = new SkSVG<Name>(elementName).set({ id })

    const defs = this.#defsCheck()
    defs.appendChild(newElement.element)

    return newElement
  }

  createPattern(id: string, width: number, height: number) {
    this.#isMainSVG()

    const pattern = new SkSVG('pattern')
    pattern.set({
      id: id,
      x: 0,
      y: 0,
      width: width,
      height: height,
      patternUnits: 'userSpaceOnUse',
    })

    const defs = this.#defsCheck()
    defs.appendChild(pattern.element)

    return pattern
  }

  createGradient(
    id: string,
    type: 'linear' | 'radial',
    colours: string[],
    rotation = 45
  ) {
    this.#isMainSVG()

    const gradient = new SkSVG(`${type}Gradient`)
    gradient.set({ id: id })

    if (type === 'linear') {
      gradient.set({ gradientTransform: `rotate(${rotation})` })
    }

    for (let i = 0; i < colours.length; i += 1) {
      gradient.create('stop').set({
        stop_color: colours[i],
        offset: (i * (100 / (colours.length - 1))) / 100,
      })
    }

    const defs = this.#defsCheck()
    defs.appendChild(gradient.element)

    return gradient
  }

  // Creates a filter and appends it to the defs element.
  createFilter(id: string) {
    this.#isMainSVG()

    const filter = new SkSVG('filter')
    filter.set({
      id: id,
      x: '-25%',
      y: '-25%',
      width: '150%',
      height: '150%',
      filterUnits: 'userSpaceOnUse',
      color_interpolation_filters: 'sRGB',
    })

    const defs = this.#defsCheck()
    defs.appendChild(filter.element)

    return filter
  }

  // Creates a smooth, open bezier curve from an array of points.
  // - curveFactor: 0 means that points connected by straight lines. Default is 1.
  createCurve(points: number[], curveFactor = 1) {
    const path = new SkSVG('path')

    let pathData = `M ${[points[0], points[1]]}`

    for (let i = 0; i < points.length - 2; i += 2) {
      const x0 = i ? points[i - 2] : points[0]
      const y0 = i ? points[i - 1] : points[1]

      const x1 = points[i]
      const y1 = points[i + 1]

      const x2 = points[i + 2]
      const y2 = points[i + 3]

      const x3 = i !== points.length - 4 ? points[i + 4] : x2
      const y3 = i !== points.length - 4 ? points[i + 5] : y2

      const cp1x = x1 + ((x2 - x0) / 6) * curveFactor
      const cp1y = y1 + ((y2 - y0) / 6) * curveFactor

      const cp2x = x2 - ((x3 - x1) / 6) * curveFactor
      const cp2y = y2 - ((y3 - y1) / 6) * curveFactor

      pathData += `C ${[cp1x, cp1y, cp2x, cp2y, x2, y2]}`
    }

    path.set({
      d: pathData,
      fill: 'none',
    })

    this.element.appendChild(path.element)

    return path
  }

  // Get a given attribute's value.
  get(attribute: string) {
    return this.element.getAttributeNS(null, attribute)
  }

  // Inserts content within an element. Useful for textual elements.
  content(text: string) {
    this.element.innerHTML = text
    return this
  }

  // Get a given element's centre { x, y } co-ordinates.
  getCentre() {
    if (!('getBBox' in this.element)) {
      throw new Error(
        'This function can only be called on elements that have a bounding box.'
      )
    }
    const bbox = this.element.getBBox()
    const cx = bbox.x + bbox.width / 2
    const cy = bbox.y + bbox.height / 2
    return { x: cx, y: cy }
  }

  trackCursor(callback?: (event: Event) => void) {
    this.#isMainSVG()

    let point = new DOMPoint()

    const onPointerMove = (_event: Event) => {
      const event = <PointerEvent>_event

      if (!('getScreenCTM' in this.element)) {
        throw new Error(
          'This function can only be called on elements that are part of the DOM.'
        )
      }

      this.element.style.touchAction = 'none'

      point.x = event.clientX
      point.y = event.clientY

      const matrix = this.element.getScreenCTM()
      if (!matrix) return

      point = point.matrixTransform(matrix.inverse())
      this.cursorX = Math.ceil(point.x)
      this.cursorY = Math.ceil(point.y)

      if (callback) {
        callback(event)
      }
    }

    const onPointerLeave = () => {
      this.element.style.touchAction = 'auto'
    }

    this.element.addEventListener('pointermove', onPointerMove)
    this.element.addEventListener('pointerleave', onPointerLeave)

    const unobserve = () => {
      this.element.removeEventListener('pointermove', onPointerMove)
      this.element.removeEventListener('pointerleave', onPointerLeave)
    }

    return unobserve
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    this.element.addEventListener(type, listener, options)

    const dispose = () => {
      this.element.removeEventListener(type, listener, options)
    }

    return dispose
  }

  // Animate an element using the Web Animations API.
  animate(
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions
  ) {
    this.element.animate(keyframes, options)

    return this
  }

  // Move an element to a desired position with respect to its centre.
  moveTo(x: number, y: number) {
    let c = this.getCentre()
    let t = this.#createTransform()

    t.setTranslate(x - c.x, y - c.y)

    this.#addTransform(t)

    return this
  }

  // Rotate an element around a specified origin point (the element centre by default).
  rotate(angle: number, cx?: number, cy?: number) {
    const c = this.getCentre()
    const t = this.#createTransform()

    t.setRotate(angle, cx ?? c.x, cy ?? c.y)

    this.#addTransform(t)

    return this
  }

  // Appends an SVG transform object to a transform list.
  #addTransform(transform: SVGTransform) {
    if (!('transform' in this.element)) {
      throw new Error('This element does not support the transform attribute.')
    }
    this.element.transform.baseVal.appendItem(transform)
  }

  // Alows for the creation of a cumulative transform.
  #createTransform() {
    const root = new SkSVG()
    return root.element.createSVGTransform()
  }

  #isMainSVG() {
    if (this.element.nodeName !== 'svg') {
      throw new Error(
        'This function can only be called on the main SVG element.'
      )
    }
  }

  // Checks if the def element already exists, and creates it if it doesn't.
  #defsCheck() {
    let defs = document.querySelector('defs')
    if (defs) return defs

    defs = new SkSVG('defs').element
    this.element.prepend(defs)

    return defs
  }
}
