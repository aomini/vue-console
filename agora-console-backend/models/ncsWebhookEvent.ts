import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ncs_webhook_event' })
export class NcsWebhookEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'event_type' })
  eventType: number;

  @Column()
  payload: string;

  @Column({ name: 'report_session' })
  reportSession: number;

  @Column()
  internal: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

}
