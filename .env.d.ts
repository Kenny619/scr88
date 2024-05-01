declare namespace NodeJS {
  export interface ProcessEnv {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }
}