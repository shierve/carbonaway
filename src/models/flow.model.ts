export interface Flow {
  process: (message: any) => Promise<void>;
  finalize: () => Promise<void>;
  store: () => Promise<void>;
}
