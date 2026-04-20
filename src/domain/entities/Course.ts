import { CourseSlug } from '../value-objects/CourseSlug';

export interface CourseProps {
  id: string;
  slug: CourseSlug;
  title: string;
  description: string;
  published: boolean;
  createdAt: Date;
}

export class Course {
  private readonly _id: string;
  private readonly _slug: CourseSlug;
  private _title: string;
  private _description: string;
  private _published: boolean;
  private readonly _createdAt: Date;

  constructor(props: CourseProps) {
    if (!props.id) throw new Error('Course.id is required');
    if (!props.title || props.title.trim().length < 3) {
      throw new Error('Course.title must be at least 3 characters');
    }
    if (!props.description || props.description.trim().length < 10) {
      throw new Error('Course.description must be at least 10 characters');
    }
    this._id = props.id;
    this._slug = props.slug;
    this._title = props.title.trim();
    this._description = props.description.trim();
    this._published = props.published;
    this._createdAt = props.createdAt;
  }

  get id(): string {
    return this._id;
  }
  get slug(): CourseSlug {
    return this._slug;
  }
  get title(): string {
    return this._title;
  }
  get description(): string {
    return this._description;
  }
  get published(): boolean {
    return this._published;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  publish(): void {
    if (this._published) {
      throw new Error('Course is already published');
    }
    this._published = true;
  }

  unpublish(): void {
    this._published = false;
  }

  updateTitle(title: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error('Course.title must be at least 3 characters');
    }
    this._title = title.trim();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length < 10) {
      throw new Error('Course.description must be at least 10 characters');
    }
    this._description = description.trim();
  }
}
