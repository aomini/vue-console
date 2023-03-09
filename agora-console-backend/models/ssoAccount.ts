import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, BaseEntity } from 'typeorm';
import { UserProfile } from '../models/user';

export const COCOS_ORIGIN = 2; // cocos

@Entity()
export class SSOAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: Number;

  @Column()
  token: number;

  @Column()
  origin: number;

  @Column({ name: 'profile_id' })
  profileId: number;

  @OneToOne(type => UserProfile)
  @JoinColumn({ name: 'id' })
  userProfile: UserProfile;

  @Column()
  status: number;

  @Column({ name: 'corporation_id' })
  corporationId: number;
}
