import { Logger } from 'log4js';
import * as Client from '../utils/doveRequest';
import { config } from '../config';
import { createHmac } from 'crypto';

export class ModerationService {
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public makeRequest() {
    return Client.create(this.logger, {
      baseURL: config.ModerationApi.baseURL
    });
  }

  public async getProjectConfig(vid: number) {
    const request = this.makeRequest();
    const res = await request.get(`/admin/v1/projects/image-moderation/envs/${config.ModerationApi.env}/vids/${vid}/appConfigInfo`);
    return res.data;
  }

  public async setProjectConfig(vid: number, content: string) {
    const data = {
      content: content,
      sourceUser: 'Console Server'
    };
    const message = JSON.stringify(data);
    const hmac = createHmac('sha256', config.ModerationApi.apiKey);
    const token = hmac.update(message).digest('hex');
    const request = this.makeRequest();
    const res = await request.put(`/admin/v1/projects/image-moderation/envs/${config.ModerationApi.env}/vids/${vid}/appConfigInfo`, data, { headers: { 'Agora-Config-Signature': token } });
    return res.data;
  }
}
