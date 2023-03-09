import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ name: 'customer_level' })
  level: number;

  @Column()
  status: number;

  @Column()
  salt: string;

  @Column()
  password: string;
}
