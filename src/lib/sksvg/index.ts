const NAMESPACE = 'http://www.w3.org/2000/svg'

type SVGTagName = keyof SVGElementTagNameMap

export class SkSVG<T extends SVGTagName = 'svg'> {
  element: SVGElementTagNameMap[T]
  child?: SkSVG<SVGTagName>

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
  create(elementName: string) {
    this.child = new SkSVG(elementName)

    if (elementName === 'defs') {
      this.child.element = this.#defsCheck()
    } else {
      this.element.appendChild(this.child.element)
    }

    return this.child
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
