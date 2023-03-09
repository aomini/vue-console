import { NcsWebhookConfig } from '../models/ncsWebhookConfig';
import { NcsWebhookEvent } from '../models/ncsWebhookEvent';
import { NcsWebhookSubscription } from '../models/ncsWebhookSubscription';
import { getConnection, getManager, IsNull } from 'typeorm';
import { Logger } from 'log4js';
import { donsoleProxyForSession } from '../externalService/DonsoleProxy';
import { RtmWebhookConfig } from '../models/rtmWebhookConfig';
import { NcsWebhookProduct } from '../models/ncsWebhookProduct';

export const getProjectNCSConfig = async(projectId: string) => {
  const res = await NcsWebhookConfig.findOne({ where: { projectId: projectId, productId: 1, deletedAt: IsNull() } });
  if (res) {
    const ncsInfoDB = getManager().getRepository(NcsWebhookSubscription);
    const ncsInfoDBQuery = ncsInfoDB.createQueryBuilder('ncsWebhookSubscription')
      .innerJoin(NcsWebhookEvent, 'ncsWebhookEvent', 'ncsWebhookSubscription.eventId = ncsWebhookEvent.id')
      .where('(ncsWebhookSubscription.config_id = :configId)', { configId: res.id })
      .andWhere('ncsWebhookSubscription.deleted_at IS NULL');

    ncsInfoDBQuery.select('ncsWebhookSubscription.id', 'id')
      .addSelect('ncsWebhookSubscription.config_id', 'configId')
      .addSelect('ncsWebhookSubscription.event_id', 'eventId')
      .addSelect('ncsWebhookEvent.event_type', 'eventType')
      .addSelect('ncsWebhookEvent.payload', 'payload');
    const events = await ncsInfoDBQuery.getRawMany();
    res['events'] = events;
  }
  return res;
};

export const getProductEvents = async(productId: number = 1) => {
  const res = await NcsWebhookEvent.find({ where: { productId: productId } });
  return res;
};

export const submitNCSAuditForm = async(log: Logger, vendorId: number, formData: any) => {
  const params = {
    templateId: 'ncs-config',
    holdEvent: 'NCSConfigApply',
    formData: formData,
    formParams: { expressionVars: {} },
    targetId: vendorId
  };
  const res = await donsoleProxyForSession(log).auditFormSubmit(params);
  return res;
};

export const closeNCS = async(log: Logger, vendorId: number, configId: number) => {
  const res = await NcsWebhookConfig.findOne({ where: { id: configId, vendorId: vendorId, productId: 1 } });
  const product = await NcsWebhookProduct.findOne({ where: { id: res.productId } });
  if (!res) return;
  const rtmConfigWithVid = await RtmWebhookConfig.findOne({ where: { urlName: `1:${res.vendorId}:${product.name}`, deletedAt: IsNull() } });
  const rtmConfigWithAppId = await RtmWebhookConfig.findOne({ where: { urlName: `2:${res.appId}:${product.name}`, deletedAt: IsNull() } });
  if (!rtmConfigWithVid || !rtmConfigWithAppId) {
    return;
  }
  await getConnection().transaction(async transactionalEntityManager => {
    await transactionalEntityManager
      .createQueryBuilder()
      .update(NcsWebhookConfig)
      .set({ enabled: false })
      .where({ id: res.id })
      .execute();

    await transactionalEntityManager
      .createQueryBuilder()
      .update(RtmWebhookConfig)
      .set({ enabled: false })
      .where({ id: rtmConfigWithVid.id })
      .execute();

    await transactionalEntityManager
      .createQueryBuilder()
      .update(RtmWebhookConfig)
      .set({ enabled: false })
      .where({ id: rtmConfigWithAppId.id })
      .execute();
  });
  return res;
};
