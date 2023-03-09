import * as Client from '../utils/request';
import * as moment from 'moment';
import { Logger } from 'log4js';
import * as os from 'os';

interface ApiErrorParams {
  user: string;
  method: string;
  api: string;
  statusCode: number;
  errorMsg: string;
  reqid: string;
}
export interface AlertConfig {
  baseURL: string;
  uid: string;
  token: string;
}

export class AgoletProxy {
  private readonly _options: AlertConfig;
  private _mute: boolean = false;
  private _retainChannel!: string;
  private _tag: string = '';
  private _hostnameHidden: boolean = false;
  public readonly hostname: string;

  public constructor(options: AlertConfig) {
    this._options = options;
    this.hostname = os.hostname();
  }

  public setMuteMode(mute = true) {
    this._mute = mute;
    return this;
  }

  public setTag(tag: string) {
    this._tag = tag;
    return this;
  }

  public setRetainChannel(channel: string) {
    this._retainChannel = channel;
    return this;
  }

  public async notify(log: Logger, message: string) {
    if (!this._retainChannel) return;
    try {
      await this.sendMessage(log, this._retainChannel, message);
    } catch (e) {
      console.error(e);
    }
  }

  public async sendMessage(log: Logger, channel: string, message: string) {
    const extrasList: string[] = [];
    if (this._tag) {
      extrasList.push(this._tag);
    }
    if (!this._hostnameHidden) {
      extrasList.push(this.hostname);
    }
    if (this._mute) {
      console.error('sendMessage in mute-mode:', message);
      return;
    }
    const extras = extrasList.map((item) => `[${item}]`).join('');
    message = `${extras} ${message}`;
    const nopt = {};
    nopt['baseURL'] = this._options.baseURL;
    nopt['headers'] = {
      uid: this._options.uid,
      token: this._options.token
    };
    const client = Client.create(log, nopt);
    const params = {
      channel: channel,
      body: message.trim()
    };
    await client.post(
      `/v1/agobot/message`,
      params
    );
  }

  public async notifyApiError(log: Logger, params: ApiErrorParams) {
    const infos = [
      `Api Error`,
      `Error: [${params.statusCode}] ${params.errorMsg}`,
      `Action: ${params.method} ${params.api}`,
      `User: ${params.user}`,
      `Reqid: ${params.reqid}`,
      `Time: ${moment().format()}`
    ];
    return this.notify(log, infos.join('\n'));
  }
}
