import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class AliIdentity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;

  @Column({ name: 'certify_id' })
  certifyId: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column()
  status: number;
}

export enum IdentityStatus {
  Review = 0,
  Pass = 1,
  Reject = 2
}
