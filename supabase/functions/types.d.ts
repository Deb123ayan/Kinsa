// Type definitions for Supabase Edge Functions (Deno runtime)

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };

  // Standard Web APIs available in Deno
  interface Request {
    json(): Promise<any>;
    text(): Promise<string>;
    headers: Headers;
    method: string;
    url: string;
  }

  interface Response {
    constructor(body?: BodyInit | null, init?: ResponseInit): Response;
  }

  interface Headers {
    get(name: string): string | null;
    set(name: string, value: string): void;
    append(name: string, value: string): void;
    delete(name: string): void;
    has(name: string): boolean;
  }

  // Utility functions
  function btoa(data: string): string;
  function atob(data: string): string;
}

export {};