import { sleep } from "./retry.js";

/** Serializes request starts so embed batches cannot burst faster than minIntervalMs. */
export class MinIntervalGate {
  private lastStartedAt = 0;
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly minIntervalMs: number) {}

  async wait(): Promise<void> {
    const turn = this.tail.then(async () => {
      const now = Date.now();
      const waitMs = Math.max(0, this.minIntervalMs - (now - this.lastStartedAt));
      if (waitMs > 0) {
        await sleep(waitMs);
      }
      this.lastStartedAt = Date.now();
    });

    this.tail = turn.catch(() => undefined);
    await turn;
  }
}
