/**
 * Persistence adapter for Controlled Chaos.
 * Phase 7 wires these methods to `/api/creations*`.
 * The real package will call this interface — do not put storage logic in UI.
 */

export type ControlledChaosCreationRecord = {
  id: string;
  payload: unknown;
};

export type ControlledChaosPersistenceAdapter = {
  save(creation: unknown): Promise<{ id: string }>;
  load(creationId: string): Promise<ControlledChaosCreationRecord>;
  duplicate(creationId: string): Promise<{ id: string }>;
};

export class CreationsApiNotReadyError extends Error {
  constructor(action: string) {
    super(
      `Controlled Chaos persistence "${action}" is not available yet. Creations API ships in Phase 7.`,
    );
    this.name = "CreationsApiNotReadyError";
  }
}

export const controlledChaosPersistenceAdapter: ControlledChaosPersistenceAdapter =
  {
    async save() {
      throw new CreationsApiNotReadyError("save");
    },
    async load() {
      throw new CreationsApiNotReadyError("load");
    },
    async duplicate() {
      throw new CreationsApiNotReadyError("duplicate");
    },
  };
