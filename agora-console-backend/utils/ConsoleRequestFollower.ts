import { RequestFollower } from './RequestFollower';
import { ConsoleAlert } from '../externalService/ConsoleAlert';

// 上游服务错误告警
export class ConsoleRequestFollower extends RequestFollower {
  onDisposeErrorMsg(errMsg: string) {
    ConsoleAlert.notify(this.logger, errMsg);
  }
}
