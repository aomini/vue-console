import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MessageTypes {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    key: string;

  @Column({ name: 'parent_id' })
    parentId: number;

  setting: MessageSetting;
}

@Entity()
export class MessageSetting {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'dashboard_open', default: 1 })
  dashboardOpen: number;

  @Column({ name: 'email_open', default: 1 })
  emailOpen: number;

  @Column({ name: 'text_open' })
  textOpen: number;

  @Column({ name: 'account_type' })
  accountType: number;
}
