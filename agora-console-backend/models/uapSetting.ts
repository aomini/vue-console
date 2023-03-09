import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class UapInfo extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'app_key' })
  appKey: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'project_name' })
  projectName: string;

  @Column({ name: 'max_subscribe_load' })
  maxSubscribeLoad: number;

  @Column({ name: 'max_resolution' })
  maxResolution: string;

  @Column()
  status: number;

  @Column()
  region: number;
}
