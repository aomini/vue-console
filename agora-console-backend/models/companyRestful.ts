import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity({ name: 'company_restful_key' })
export class CompanyRestful extends BaseEntity {

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @PrimaryColumn()
  key: string;

  @Column()
  secret: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ name: 'downloaded' })
  downloaded: number;
}
