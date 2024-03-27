export function random(min = 0, max = 1, float = false): number {
  if (Array.isArray(arguments[0])) {
    // picks a random item from an array
    const arr = arguments[0]
    return arr[Math.round(Math.random() * (arr.length - 1))]
  } else {
    // gets a random number between a minimum and maximum value
    const random = Math.random() * (max - min) + min
    return float || max - min <= 1 ? random : Math.round(random)
  }
}
