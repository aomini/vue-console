import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'netless_2_company' })
export class Netless2Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
