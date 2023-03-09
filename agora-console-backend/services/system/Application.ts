import axios from 'axios';
import { ConsoleAlert } from '../../externalService/ConsoleAlert';
import { Logger } from '../../logging';
import { AppInfo } from '../../dataModel/common';
import * as os from 'os';
import { config } from '../../config';

class Application {
  public readonly appInfo: AppInfo;
  public constructor() {
    this.appInfo = {
      env: config.Env,
      tags: config.Tags || ['Unknown'],
      codeVersion: process.env.CODE_VERSION || 'Unknown',
      runningMachine: os.hostname() || 'Unknown',
      retainMsg: config.retainMsg || 'Unknown',
      configVersion: config.configVersion || 'Unknown'
    };
  }

  public async checkHealth() {
    await Promise.all([
      axios.get(`http://network.agora.io/_health`)
    ]).catch((err) => {
      const logger = Logger();
      ConsoleAlert.notify(logger, `健康检查有误. ${err.message}`);
    });
  }
}

export const WebApplication = new Application();
