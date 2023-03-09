import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, JoinColumn, OneToOne } from 'typeorm';
import { Company } from './company';

@Entity()
export class VendorGroup extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @OneToOne(type => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'vendors_id' })
  vendorsId: String;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'update_at' })
  updateAt: Date;
}
