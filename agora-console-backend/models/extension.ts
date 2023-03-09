import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oversea_vendor')
export class Extension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'company_id' })
  companyId: string;
  @Column({ name: 'account_id' })
  accountId: string;
  @Column({ name: 'plan_id' })
  planId: string;
  @Column({ name: 'service_name' })
  serviceName: string;
  @Column({ name: 'en_name' })
  enName: string;
  @Column({ name: 'product_en_name' })
  productEnName: string;
  @Column({ name: 'cn_name' })
  cnName: string;
  @Column({ name: 'product_cn_name' })
  productCnName: string;
  @Column({ name: 'product_photo_url' })
  productPhotoUrl: string;
  @Column({ default: 0 })
  status: boolean;
}
