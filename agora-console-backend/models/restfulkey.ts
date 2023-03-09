import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class CompanyRestfulKey {
  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'role_id' })
  roleId: number; // 预先设计后续权限对接

  @PrimaryColumn()
  key: string;

  @Column()
  secret: string;

  @Column({ nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @Column({ nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'created_at' })
  createdAt: Date;
}
