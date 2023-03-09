import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ database: 'paas' })
export class AppInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'app_id' })
  appId: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column()
  overdue: number;

  @Column()
  disabled: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
