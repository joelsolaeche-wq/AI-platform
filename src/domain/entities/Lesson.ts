export interface LessonProps {
  id: string;
  courseId: string;
  title: string;
  content: string;
  orderIndex: number;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  durationSec: number | null;
  createdAt: Date;
}

export class Lesson {
  private readonly _id: string;
  private readonly _courseId: string;
  private _title: string;
  private _content: string;
  private _orderIndex: number;
  private _muxAssetId: string | null;
  private _muxPlaybackId: string | null;
  private _durationSec: number | null;
  private readonly _createdAt: Date;

  constructor(props: LessonProps) {
    if (!props.id) throw new Error('Lesson.id is required');
    if (!props.courseId) throw new Error('Lesson.courseId is required');
    if (!props.title || props.title.trim().length < 1) {
      throw new Error('Lesson.title must not be empty');
    }
    if (props.orderIndex < 0 || !Number.isInteger(props.orderIndex)) {
      throw new Error('Lesson.orderIndex must be a non-negative integer');
    }
    if (props.durationSec !== null && props.durationSec < 0) {
      throw new Error('Lesson.durationSec must be non-negative');
    }
    this._id = props.id;
    this._courseId = props.courseId;
    this._title = props.title.trim();
    this._content = props.content;
    this._orderIndex = props.orderIndex;
    this._muxAssetId = props.muxAssetId;
    this._muxPlaybackId = props.muxPlaybackId;
    this._durationSec = props.durationSec;
    this._createdAt = props.createdAt;
  }

  get id(): string {
    return this._id;
  }
  get courseId(): string {
    return this._courseId;
  }
  get title(): string {
    return this._title;
  }
  get content(): string {
    return this._content;
  }
  get orderIndex(): number {
    return this._orderIndex;
  }
  get muxAssetId(): string | null {
    return this._muxAssetId;
  }
  get muxPlaybackId(): string | null {
    return this._muxPlaybackId;
  }
  get durationSec(): number | null {
    return this._durationSec;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  hasVideo(): boolean {
    return this._muxPlaybackId !== null;
  }

  attachVideo(muxAssetId: string, muxPlaybackId: string, durationSec: number): void {
    if (!muxAssetId || !muxPlaybackId) {
      throw new Error('Mux IDs are required to attach a video');
    }
    if (durationSec < 0) {
      throw new Error('durationSec must be non-negative');
    }
    this._muxAssetId = muxAssetId;
    this._muxPlaybackId = muxPlaybackId;
    this._durationSec = durationSec;
  }
}
