import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { User, UserRole } from '../../domain/entities/User';
import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: EmailAddress): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.value } });
    return row ? this.toDomain(row) : null;
  }

  async findByWorkosId(workosId: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { workosId } });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: this.toPrismaRole(user.role),
        workosId: user.workosId,
        createdAt: user.createdAt,
      },
      update: {
        email: user.email.value,
        name: user.name,
        role: this.toPrismaRole(user.role),
        workosId: user.workosId,
      },
    });
  }

  private toPrismaRole(role: UserRole): PrismaRole {
    return role as PrismaRole;
  }

  private toDomain(row: {
    id: string;
    email: string;
    name: string;
    role: PrismaRole;
    workosId: string | null;
    createdAt: Date;
  }): User {
    return new User({
      id: row.id,
      email: new EmailAddress(row.email),
      name: row.name,
      role: row.role as UserRole,
      workosId: row.workosId,
      createdAt: row.createdAt,
    });
  }
}
