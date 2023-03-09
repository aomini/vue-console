import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity({ name: 'company_finance_setting' })
export class CompanyFinanceSetting extends BaseEntity {
  @PrimaryColumn()
  _rid: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'wire_destination' })
  wireDestination: number;

  @Column({ name: 'create_time' })
  createdTime: Date;

  @Column({ name: 'update_time' })
  updatedTime: Date;

}
