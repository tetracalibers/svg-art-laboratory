const NAMESPACE = 'http://www.w3.org/2000/svg'

type SVGTagName = keyof SVGElementTagNameMap

export class SkSVG<T extends SVGTagName = 'svg'> {
  element: SVGElementTagNameMap[T]
  child?: SkSVG<SVGTagName>

  constructor(elementName: T | 'svg' = 'svg', namespace = NAMESPACE) {
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

  set(attributes: Record<string, string | number>) {
    for (let key in attributes) {
      // JavaScriptで属性を設定するときにハイフンを使うことはできない
      // そのため、stroke_widthのような属性名をstroke-widthに変換する
      const prop = key.replace(/_/g, '-')
      this.element.setAttributeNS(null, prop, attributes[key].toString())
    }
    return this
  }

  // create an element and automatically append it to our parent SVG
  create(elementName: SVGTagName) {
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
