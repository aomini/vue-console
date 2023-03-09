export interface ListReply<T> {
  total: number;
  items: T[];
}

export class ListParams {
  private _limit: number;
  private defaultLimit: number = 10;

  private _page: number;
  private _params: { [key: string]: number; };

  constructor(limit: number = 10, page: number = 1, params?: { [key: string]: any; }) {
    if (this.limit <= 0) {
      limit = this.defaultLimit;
    }
    this._limit = limit;
    if (page < 0) page = 1;
    this._page = page;
    if (!params) params = {};
    this._params = params;
  }

  set limit (limit: number) {
    this._limit = limit | 0;
    if (this._limit <= 0) {
      this._limit = this.defaultLimit;
    }
  }
  get limit (): number {
    return this._limit;
  }

  get page (): number {
    return this._page;
  }

  get skip (): number {
    return (this._page - 1) * this._limit;
  }

  get params (): { [key: string]: any; } {
    return this._params;
  }

  set(key: string, val: any) {
    this._params[key] = val;
  }
}

export class Params {
  private _params: { [key: string]: number; };
  constructor(params?: { [key: string]: any; }) {
    if (!params) params = {};
    this._params = params;
  }

  get params (): { [key: string]: any; } {
    return this._params;
  }

  set(key: string, val: any) {
    this._params[key] = val;
  }

}
