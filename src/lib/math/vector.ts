export class Vector2 {
  public x: number
  public y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * 他のベクトルを加算する
   */
  public add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y)
  }

  /**
   * 2つのベクトルを加算する
   */
  static add(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y)
  }

  /**
   * 他のベクトルを減算する
   */
  public sub(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y)
  }

  /**
   * 2つのベクトルを減算する
   */
  static sub(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y)
  }

  /**
   * 他のベクトルを乗算する
   */
  public mult(other: Vector2): Vector2 {
    return new Vector2(this.x * other.x, this.y * other.y)
  }

  /**
   * 2つのベクトルを乗算する
   */
  static mult(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x * b.x, a.y * b.y)
  }

  /**
   * スカラー倍する
   */
  public scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar)
  }
}
