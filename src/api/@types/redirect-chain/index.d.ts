/// <reference types="node" />

declare function RedirectChain(options?: any): any;

declare namespace RedirectChain {
  export function urls(url: string): string[];
  export function domains(url: string): string[];
  export function destination(url: string): string;
}
declare module 'redirect-chain' {
  export = RedirectChain;
}
