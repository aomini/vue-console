import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export const ConsoleOperationAllowanceStatus = {
  DISALLOW: 1,
  ALLOW: 2
};

export const ConsoleOperationAllowanceIsDeleted = {
  NOT_DELETED: 0,
  DELETED: 1
};

@Entity()
export class ConsoleOperationAllowance extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'allowed_by' })
  allowedBy: number;

  @Column({ name: 'expired_at' })
  expiredAt: number;

  @Column({ name: 'is_deleted' })
  isDeleted: number;
}
