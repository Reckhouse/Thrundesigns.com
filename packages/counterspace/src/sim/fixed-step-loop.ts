export interface FixedStepLoopOptions {
  readonly fixedDt?: number;
  readonly maxSubsteps?: number;
  readonly maxFrameDelta?: number;
}

export class FixedStepLoop {
  readonly fixedDt: number;
  readonly maxSubsteps: number;
  readonly maxFrameDelta: number;

  private accumulator = 0;
  private lastTime: number | undefined;

  constructor(options: FixedStepLoopOptions = {}) {
    this.fixedDt = options.fixedDt ?? 1 / 120;
    this.maxSubsteps = options.maxSubsteps ?? 4;
    this.maxFrameDelta = options.maxFrameDelta ?? 0.1;
  }

  advance(nowSeconds: number, step: (fixedDt: number) => void): number {
    if (this.lastTime === undefined) {
      this.lastTime = nowSeconds;
      return 0;
    }

    const frameDelta = Math.min(Math.max(nowSeconds - this.lastTime, 0), this.maxFrameDelta);
    this.lastTime = nowSeconds;
    this.accumulator = Math.min(this.accumulator + frameDelta, this.fixedDt * this.maxSubsteps);

    let substeps = 0;
    while (this.accumulator >= this.fixedDt && substeps < this.maxSubsteps) {
      step(this.fixedDt);
      this.accumulator -= this.fixedDt;
      substeps += 1;
    }
    return substeps;
  }

  reset(nowSeconds?: number): void {
    this.accumulator = 0;
    this.lastTime = nowSeconds;
  }
}

