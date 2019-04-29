export interface Flow {
  process: (message: any) => Promise<void>; // gets a wit.ai interpreted object and processes it to modify the state of the flow and output to the user
  finalize: () => Promise<void>; // finalizes the flow
  store: () => Promise<void>; // stores the flow state in the database
}
