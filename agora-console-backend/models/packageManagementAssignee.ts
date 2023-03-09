import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class PackageManagementAssignee extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_management_id' })
  packageManagementId: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  role: number;
}
