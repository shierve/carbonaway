export interface Flow {
  process: (message: any) => Promise<void>;
  finalize: () => Promise<void>;
}
