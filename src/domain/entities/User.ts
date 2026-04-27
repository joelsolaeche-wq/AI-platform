import { EmailAddress } from '../value-objects/EmailAddress';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface UserProps {
  id: string;
  email: EmailAddress;
  name: string;
  role: UserRole;
  workosId: string | null;
  createdAt: Date;
}

export class User {
  private readonly _id: string;
  private _email: EmailAddress;
  private _name: string;
  private _role: UserRole;
  private readonly _workosId: string | null;
  private readonly _createdAt: Date;

  constructor(props: UserProps) {
    if (!props.id) throw new Error('User.id is required');
    if (!props.name || props.name.trim().length < 1) {
      throw new Error('User.name must not be empty');
    }
    this._id = props.id;
    this._email = props.email;
    this._name = props.name.trim();
    this._role = props.role;
    this._workosId = props.workosId;
    this._createdAt = props.createdAt;
  }

  get id(): string {
    return this._id;
  }
  get email(): EmailAddress {
    return this._email;
  }
  get name(): string {
    return this._name;
  }
  get role(): UserRole {
    return this._role;
  }
  get workosId(): string | null {
    return this._workosId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length < 1) {
      throw new Error('Name must not be empty');
    }
    this._name = newName.trim();
  }

  changeEmail(newEmail: EmailAddress): void {
    this._email = newEmail;
  }

  changeRole(newRole: UserRole): void {
    this._role = newRole;
  }
}
