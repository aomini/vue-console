import * as Koa from 'koa';
import { stores, opts, Session } from 'koa-session';
import { getManager } from 'typeorm';
import * as uid from 'uid-safe';

import { Session as DBSession } from '../models/session';

import { config } from '../config';

const getSessionDBName = (key: string): string => {
  const arr = key.split('-');
  if (arr.length === 1) return `session-${config.zone}`;
  return `session-${arr[0]}`;
};

export class MysqlStore implements stores {
  /**
   * get session object by key
   */
  async get(
    key: string,
    maxAge?: number,
    data?: { rolling: opts['rolling'] }
  ): Promise<any> {
    const dbname = getSessionDBName(key);
    const db = getManager(dbname).getRepository(DBSession);
    const sess = await db.findOne({ key });
    if (!sess) {
      return undefined;
    }
    if (!this.isValid(sess.created_at, sess.expired)) {
      await this.destroy(key);
      return undefined;
    }
    try {
      const val = JSON.parse(sess.value);
      return val;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * set session object for key, with a maxAge (in ms)
   */
  async set(
    key: string,
    sess: Partial<Session> & { _expire?: number; _maxAge?: number },
    maxAge?: opts['maxAge'],
    data?: { changed: boolean; rolling: opts['rolling'] }
  ): Promise<any> {
    const dbname = getSessionDBName(key);
    const db = getManager(dbname).getRepository(DBSession);
    const nsess = new DBSession();
    nsess.key = key;
    nsess.expired = sess._expire;
    nsess.value = JSON.stringify(sess);
    await db.save(nsess, { reload: false });
    return;
  }

  /**
   * destroy session for key
   */
  async destroy(key: string): Promise<any> {
    const dbname = getSessionDBName(key);
    const db = getManager(dbname).getRepository(DBSession);
    await db.delete({ key });
    return;
  }

  isValid (created_at: Date, expired: number): boolean {
    const now = +new Date();
    if (now - expired >= 0) return false;
    return true;
  }
}

export const externalKey = {
  get (ctx: Koa.Context): string {
    const key = ctx.cookies.get(config.cookieName) || `${config.zone}-${uid.sync(18)}`;
    return key;
  },
  set (ctx: Koa.Context, val: string) {
    ctx.cookies.set(config.cookieName, val, config.cookie);
  }
};

export const genid = () => {
  return `${config.zone}-${uid.sync(18)}`;
};
