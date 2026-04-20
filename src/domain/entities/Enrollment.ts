import { Progress } from '../value-objects/Progress';

export interface EnrollmentProps {
  id: string;
  userId: string;
  courseId: string;
  progress: Progress;
  enrolledAt: Date;
}

export class Enrollment {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _courseId: string;
  private _progress: Progress;
  private readonly _enrolledAt: Date;

  constructor(props: EnrollmentProps) {
    if (!props.id) throw new Error('Enrollment.id is required');
    if (!props.userId) throw new Error('Enrollment.userId is required');
    if (!props.courseId) throw new Error('Enrollment.courseId is required');
    this._id = props.id;
    this._userId = props.userId;
    this._courseId = props.courseId;
    this._progress = props.progress;
    this._enrolledAt = props.enrolledAt;
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get courseId(): string {
    return this._courseId;
  }
  get progress(): Progress {
    return this._progress;
  }
  get enrolledAt(): Date {
    return this._enrolledAt;
  }

  recordProgress(delta: number): void {
    this._progress = this._progress.advance(delta);
  }

  markComplete(): void {
    this._progress = Progress.complete();
  }

  isComplete(): boolean {
    return this._progress.isComplete();
  }
}
