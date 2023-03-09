import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vendor_product')
export class ProjectRelation extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'vendor_id' })
  vendorId: number;
  @Column({ name: 'product_type_id' })
  productTypeId: string;
  @Column({ name: 'platform_id' })
  platformId: string;
  @Column({ name: 'create_time' })
  createTime: string;
  @Column({ name: 'creator' })
  creator: string;
}
