export interface Handler {
  (payload?: any): any;
}

export class Method {
  constructor(
    public handler: Handler,
    public options: any = {}
  ) {
  }

  async execute(rpc: any, params: any): Promise<any> {
    if (params == null) {
      params = [];
    } else if (!Array.isArray(params)) {
      params = [params];
    }
    try {
      return await this.handler.call(rpc, ...params);
    } catch (e) {
      throw e;
    }

  }
}
