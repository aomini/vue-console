import { BaseEntity, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'okta_user_id' })
export class OktaUserId extends BaseEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'okta_user_id' })
  externalId: string;

  static findOneByUserId(userId: number) {
    return OktaUserId.findOne({ where: { userId } });
  }

  static findOneByExternalId(externalId: number) {
    return OktaUserId.findOne({ where: { externalId } });
  }
}
