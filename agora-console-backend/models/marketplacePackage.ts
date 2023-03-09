import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToOne } from 'typeorm';
import { MarketplacePackageProduct } from './MarketplacePackageProduct';

@Entity()
export class MarketplacePackage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'package_status' })
  packageStatus: number;

  @Column({ name: 'is_public' })
  isPublic: number;

  @Column({ name: 'available_to' })
  availableTo: number;

  @Column({ name: 'price_cny' })
  priceCNY: string;

  @Column({ name: 'price_usd' })
  priceUSD: string;

  @Column()
  duration: number;

  @Column()
  priority: number;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;

  @Column({ name: 'updated_by' })
  updatedBy: string;

  @Column({ name: 'sku_type' })
  skuType: number;

  @Column()
  description: string;

  @OneToOne(type => MarketplacePackageProduct, marketplacePackageProduct => marketplacePackageProduct.marketplacePackage)
  marketplacePackageProduct: MarketplacePackageProduct;
}
