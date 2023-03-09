import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class SupportPackage extends BaseEntity {
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

  @Column({ name: 'is_enterprise' })
  isEnterprise: number;
}
