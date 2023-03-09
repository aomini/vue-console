import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { MinPackageProduct } from './minPackageProduct';

@Entity()
export class MinPackage extends BaseEntity {
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

  @Column({ name: 'max_quantity' })
  maxQuantity: number;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;

  @Column({ name: 'updated_by' })
  updatedBy: string;

  @Column({ name: 'package_type' })
  packageType: number;

  @Column()
  description: string;

  @OneToMany(type => MinPackageProduct, minPackageProduct => minPackageProduct.minPackage)
  minPackageProduct: MinPackageProduct[];
}
