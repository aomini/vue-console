import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'account_role' })
export class AccountRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'role_id' })
  roleId: number;
}

@Entity({ name: 'role_permission' })
export class AccountRolePermission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'permission_id' })
  permissionId: number;

  @Column({ name: 'role_id' })
  roleId: number;
}
