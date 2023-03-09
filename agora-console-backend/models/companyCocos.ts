import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class CompanyCocos extends BaseEntity {
  @PrimaryColumn({ name: 'corporation_id' })
  corporationId: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column()
  name: number;

  @Column()
  mobile: number;

  @Column()
  address: string;
}
