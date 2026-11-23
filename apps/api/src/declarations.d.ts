declare module 'express' {
  export interface Request {
    headers: Record<string, string | string[] | undefined>;
    url: string;
    method: string;
    ip?: string;
    user?: any;
    [key: string]: any;
  }
  export interface Response {
    statusCode: number;
    status(code: number): this;
    json(body?: any): this;
    setHeader(name: string, value: any): this;
    [key: string]: any;
  }
  export type NextFunction = (err?: any) => void;
}

declare module 'passport-jwt' {
  export class Strategy {
    constructor(options: any, verify: any);
  }
  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (req: any) => string | null;
    [key: string]: any;
  };
}
