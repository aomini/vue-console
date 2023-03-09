import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { MarketplacePackage } from './marketplacePackage';

@Entity()
export class MarketplacePackageProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_id' })
  packageId: number;

  @Column({ name: 'sku_id' })
  skuId: number;

  @Column({ name: 'sku_type' })
  skuType: number;

  @Column()
  description: string;

  @Column({ name: 'usage_quote' })
  usageQuote: number;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;

  @ManyToOne(type => MarketplacePackage, marketplacePackage => marketplacePackage.marketplacePackageProduct)
  @JoinColumn({ name: 'package_id' })
  marketplacePackage: MarketplacePackage;
}
