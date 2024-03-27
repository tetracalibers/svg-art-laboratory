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
      const prop = key.replace(/_/g, '-')
      this.element.setAttributeNS(null, prop, attributes[key].toString())
    }
    return this
  }

  create(elementName: SVGTagName) {
    this.child = new SkSVG(elementName)

    if (elementName === 'defs') {
      this.child.element = this.#defsCheck()
    } else {
      this.element.appendChild(this.child.element)
    }

    return this.child
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
