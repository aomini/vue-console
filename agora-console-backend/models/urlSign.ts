import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class UrlSign extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'expired_ts' })
  expiredTs: number;

  @Column()
  type: number;

  @Column()
  content: string;
}
