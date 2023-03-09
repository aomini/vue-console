import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ncs_webhook_subscription' })
export class NcsWebhookSubscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'config_id' })
  configId: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date;
}
