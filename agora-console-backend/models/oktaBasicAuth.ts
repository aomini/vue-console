import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { generateUUID } from '../utils/encryptTool';

@Entity({ name: 'okta_basic_auth' })
export class OktaBasicAuth extends BaseEntity {
  @PrimaryColumn({ name: 'company_id' })
  companyId: number;

  @PrimaryColumn()
  username: string;

  @Column()
  password: string;

  @Column()
  enable: number;

  get isEnabled() {
    return this.enable === 1;
  }

  set isEnabled(enable: Boolean) {
    this.enable = enable ? 1 : 0;
  }

  static generateUsername() {
    return generateUUID();
  }

  static generatePassword() {
    return generateUUID();
  }

  static findOneByCompanyId(companyId: number) {
    return OktaBasicAuth.findOne({ where: { companyId } });
  }

  static findOneByUsername(username: string) {
    return OktaBasicAuth.findOne({ where: { username } });
  }
}
