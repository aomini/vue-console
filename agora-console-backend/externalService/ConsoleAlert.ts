import { config } from '../config';
import { AgoletProxy } from './agoletService';

const proxy = new AgoletProxy(config.AgoletAlert);
if (!['staging', 'production'].includes(config.Env)) {
  proxy.setMuteMode(true);
}
proxy.setTag(config.Env);
if (config.Env === 'production') {
  proxy.setRetainChannel('Console-alert');
} else {
  proxy.setRetainChannel('test-xueqifang');
}
export const ConsoleAlert = proxy;
