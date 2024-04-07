export function random(min = 0, max = 1, float = false): number {
  // gets a random number between a minimum and maximum value
  const random = Math.random() * (max - min) + min
  return float || max - min <= 1 ? random : Math.round(random)
}

export const pickRandom = <Item>(items: Item[]): Item => {
  return items[Math.round(Math.random() * (items.length - 1))]
}

// Constrains (or clamps) a value between a minimum and maximum value.
export const constrain = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max)
}

// Re-maps a number from one range to another.
export const map = (
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  float = false
) => {
  let n = ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
  return float ? n : Math.round(n)
}

// n2が未指定の場合 => n1%の確率でtrueを返す
// n2を指定した場合 => n1 : n2 の確率でtrueを返す
export const chance = (n1 = 50, n2?: number) => {
  const n = n2 !== undefined ? (n2 / (n1 + n2)) * 100 : n1
  return n > Math.random() * 100
}

// ガウス分布
// - ほとんどの値が集積する中点を平均と呼び、この平均からどの程度ずれるかをシグマ（標準偏差）と呼ぶ
// - ガウス分布の値は有界ではないので、時折極端な異常値が発生する可能性がある（この場合、constrain関数で制限するとよい）
//
// デフォルトではこの関数は約-3から+3の間の値を返し、平均は0、標準偏差は1となる
// すなわち、
// - 値の68%は-1と1(標準偏差)の間にある
// - 値の95%は-2と2の間にある
// - 値の99%は-3と3の間にある
//
// 第3引数は、浮動小数点数（より正確だが桁数が多い）と整数（整数）のどちらを返すかを決める
// 整数を扱うと、生成されるマークアップがおよそ2分の1になる
export const gaussian = (mean = 0, sigma = 1, float = false) => {
  const u = 1 - Math.random()
  const v = Math.random()
  const z = Math.cos(Math.PI * v) * Math.sqrt(-Math.log(u))
  const g = z * sigma + mean
  return float ? g : Math.round(g)
}

// パレート分布（パレートの原理、80対20の法則）
// - 社会の人口のわずか20％がその富の80％を支配している
//
// これはジェネレーティブアートにおいて、大きさの異なる要素のバランスを取るのに役立つ
// - 例：ポルト・パレートと呼ばれる擬似的な都市景観の作成で、街の建物の大きさを変化させるのに使う
//
// 第1引数：範囲の最小の数を定義する
export const pareto = (min: number, float = false) => {
  const n = 1.0 - Math.random()
  const a = Math.log(5) / Math.log(4)
  const p = min / Math.pow(n, 1.0 / a)
  return float ? p : Math.round(p)
}

// 極座標系から直交座標系への変換
export const polarToCartesian = (
  x: number,
  y: number,
  radius: number,
  radian: number
) => {
  return {
    x: x + radius * Math.cos(radian),
    y: y + radius * Math.sin(radian),
  }
}

export const radianToDegree = (radian: number) => {
  return (radian * 180) / Math.PI
}
