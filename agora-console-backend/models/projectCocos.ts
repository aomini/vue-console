import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class ProjectCocos extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  uid: number;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'game_id' })
  gameId: number;

  @Column({
    length: 30
  })
  name: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'corporation_id' })
  corporationId: number;

  @Column()
  created: number;

  @Column({ name: 'action_type' })
  actionType: number;

  @Column({ name: 'sync_status' })
  syncStatus: number;
}
