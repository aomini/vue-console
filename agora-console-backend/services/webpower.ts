import * as Client from '../utils/request';
import { config } from '../config';
import { Logger } from '../logging';

export const sendEmail = async (tplId, email, customerData) => {
  const tranid = + new Date();
  const params = {
    customerTransId: tranid,
    mailTemplateId: tplId,
    customized: customerData,
    recipients: [
      {
        mail: email
      }
    ]
  };
  const request = Client.create(Logger());
  const reply = await request.post(config.webpowerUrl, params);
  return reply;
};
