export class Vector2 {
  public x: number
  public y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * ベクトルの長さ
   */
  get mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
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

  /**
   * ベクトルの回転
   */
  public rotate(angle: number): Vector2 {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
  }
}
