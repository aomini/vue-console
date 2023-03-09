import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { MinPackage } from './minPackage';

@Entity()
export class MinPackageProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_id' })
  packageId: number;

  @Column({ name: 'product_type' })
  productType: number;

  @Column({ name: 'media_type' })
  mediaType: number;

  @Column({ name: 'created_at' })
  createdAt: string;

  @Column({ name: 'updated_at' })
  updatedAt: string;

  @Column()
  description: string;

  @Column({ name: 'usage_quote' })
  usageQuote: number;

  @ManyToOne(type => MinPackage, minPackage => minPackage.minPackageProduct)
  @JoinColumn({ name: 'package_id' })
  minPackage: MinPackage;
}
