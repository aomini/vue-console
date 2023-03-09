import { Entity, CreateDateColumn, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryColumn()
  key: string;

  @Column()
  value: string;

  @Column({ type: 'bigint' })
  expired: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
