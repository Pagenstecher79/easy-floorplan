/**
 * Collapses a burst of values into one delivery per animation frame.
 *
 * Pointer events arrive faster than a browser can render — a 1000Hz mouse
 * against a 60Hz display is 16 events per frame. Handling every one of them
 * does not make the drag smoother, it makes it *later*: the work queues up and
 * the gap between the cursor and what it is dragging grows for as long as the
 * gesture lasts. Delivering only the newest value each frame bounds that queue
 * at one event, so the drag can fall at most one frame behind however fast the
 * pointer moves.
 *
 * The scheduler is injected so tests can drive frames by hand.
 */
export interface FrameScheduler {
  request(cb: () => void): number;
  cancel(handle: number): void;
}

export const rafScheduler: FrameScheduler = {
  request: (cb) => requestAnimationFrame(cb),
  cancel: (handle) => cancelAnimationFrame(handle),
};

export class FrameCoalescer<T> {
  private _pending: T | null = null;
  private _handle: number | null = null;

  constructor(
    private readonly frames: FrameScheduler,
    private readonly deliver: (value: T) => void,
  ) {}

  /** True while a value is waiting for its frame. */
  get pending(): boolean {
    return this._handle !== null;
  }

  /** Queue a value, replacing any still waiting for this frame. */
  push(value: T): void {
    this._pending = value;
    if (this._handle !== null) return;
    this._handle = this.frames.request(() => {
      this._handle = null;
      const value = this._pending;
      this._pending = null;
      if (value !== null) this.deliver(value);
    });
  }

  /**
   * Deliver the newest queued value now. For the end of a gesture: pointerup
   * must land on the last position the pointer actually reported, not on
   * whatever the previous frame happened to catch.
   */
  settle(): void {
    if (this._handle !== null) {
      this.frames.cancel(this._handle);
      this._handle = null;
    }
    const value = this._pending;
    this._pending = null;
    if (value !== null) this.deliver(value);
  }

  /** Drop anything queued without delivering it (the gesture was canceled). */
  cancel(): void {
    if (this._handle !== null) {
      this.frames.cancel(this._handle);
      this._handle = null;
    }
    this._pending = null;
  }
}
