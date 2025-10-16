import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { SubscriptionPlan, PlanName } from './SubscriptionPlan';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @IsEmail()
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  @MinLength(8)
  password: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  discordId: string | null;

  @Column({ type: 'varchar', nullable: true })
  discordUsername: string | null;

  @Column({ type: 'varchar', nullable: true })
  discordAvatar: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  twoFactorSecret: string | null;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', default: PlanName.FREE })
  subscriptionPlan: PlanName;

  @Column({ type: 'varchar', default: SubscriptionStatus.ACTIVE })
  subscriptionStatus: SubscriptionStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  subscriptionStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }
}
