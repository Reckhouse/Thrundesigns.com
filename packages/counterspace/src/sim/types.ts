export type Vec3Tuple = readonly [number, number, number];

export interface SimulationEmitter {
  readonly id: string;
  readonly position: Vec3Tuple;
  readonly axis: Vec3Tuple;
  readonly polarity: number;
  readonly strength: number;
  readonly reach: number;
  readonly coreRadius: number;
  readonly spatialWeight: number;
  readonly counterspatialWeight: number;
  readonly circularWeight: number;
  readonly radialWeight: number;
  readonly rotation: number;
  readonly pressure: number;
  readonly phase: number;
  readonly axialBias: number;
}

export interface SimulationState {
  readonly seed: number;
  readonly chamberRadius: number;
  readonly emitters: readonly SimulationEmitter[];
  readonly damping: number;
  readonly maxAcceleration: number;
  readonly maxVelocity: number;
  readonly memorySeconds: number;
  readonly turbulence: number;
  readonly symmetry: number;
}

export interface SimulationCapabilities {
  readonly maxParticleCount?: number;
}

export interface SimulationInitializeOptions {
  readonly seed: number;
  readonly particleCount: number;
  readonly capabilities?: SimulationCapabilities;
}

export interface SimulationRenderData {
  readonly positions: Float32Array;
  readonly velocities: Float32Array;
  readonly polarity: Float32Array;
  readonly particleCount: number;
  readonly version: number;
}

export type StructureCandidate = 'chaotic' | 'torus' | 'shell' | 'axial';

export interface SimulationMetrics {
  readonly simulationTime: number;
  readonly particleCount: number;
  readonly kineticEnergy: number;
  readonly angularCoherence: number;
  readonly radialCompactness: number;
  readonly stability: number;
  readonly candidate: StructureCandidate;
  readonly respawnCount: number;
}

export interface ISimulationBackend {
  initialize(options: SimulationInitializeOptions): void;
  setState(state: SimulationState): void;
  step(fixedDt: number, substeps?: number): void;
  renderData(): SimulationRenderData;
  requestMetrics(): SimulationMetrics;
  reset(seed?: number): void;
  dispose(): void;
}

export const TWIN_ORBIT_STATE: SimulationState = {
  seed: 0x6d2b79f5,
  chamberRadius: 4.2,
  damping: 0.35,
  maxAcceleration: 12,
  maxVelocity: 6,
  memorySeconds: 0.75,
  turbulence: 0.055,
  symmetry: 1,
  emitters: [
    {
      id: 'positive',
      position: [-1.45, 0, 0],
      axis: [1, 0, 0],
      polarity: 1,
      strength: 2.5,
      reach: 3.7,
      coreRadius: 0.15,
      spatialWeight: 0.05,
      counterspatialWeight: 0.82,
      circularWeight: 1,
      radialWeight: 0.15,
      rotation: 0.9,
      pressure: 0.25,
      phase: 0,
      axialBias: 0.08,
    },
    {
      id: 'negative',
      position: [1.45, 0, 0],
      axis: [-1, 0, 0],
      polarity: -1,
      strength: 2.5,
      reach: 3.7,
      coreRadius: 0.15,
      spatialWeight: 0.05,
      counterspatialWeight: 0.82,
      circularWeight: 1,
      radialWeight: 0.15,
      rotation: -0.9,
      pressure: 0.25,
      phase: Math.PI,
      axialBias: 0.08,
    },
  ],
};

