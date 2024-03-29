export function random(min = 0, max = 1, float = false): number {
  // gets a random number between a minimum and maximum value
  const random = Math.random() * (max - min) + min
  return float || max - min <= 1 ? random : Math.round(random)
}

export const pickRandom = <Item>(items: Item[]): Item => {
  return items[Math.round(Math.random() * (items.length - 1))]
}

// n2が未指定の場合 => n1%の確率でtrueを返す
// n2を指定した場合 => n1 : n2 の確率でtrueを返す
export const chance = (n1 = 50, n2?: number) => {
  const n = n2 !== undefined ? (n2 / (n1 + n2)) * 100 : n1
  return n > Math.random() * 100
}
