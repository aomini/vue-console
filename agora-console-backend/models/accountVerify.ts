import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'email_token' })
export class EmailToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  accessToken: string;

  @Column()
  accessTokenExpiresAt: number;

  @Column()
  source: string;

  @Column()
  user: string;

  @Column()
  companyId: number;

  @Column({ name: 'account_type' })
  accountType: number;

  @Column({ name: 'origin_email' })
  originEmail: string;
}
