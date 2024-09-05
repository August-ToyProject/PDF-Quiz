declare module 'event-source-polyfill' {
    export interface EventSourcePolyfillInit extends EventSourceInit {
      headers?: {[key: string]: string};
      heartbeatTimeout?: number;
      withCredentials?: boolean;
    }
  
    export class EventSourcePolyfill extends EventSource {
      constructor(url: string, eventSourceInitDict?: EventSourcePolyfillInit);
    }
  }