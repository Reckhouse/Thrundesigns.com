import {
  TWIN_ORBIT_STATE,
  type ISimulationBackend,
  type SimulationInitializeOptions,
  type SimulationMetrics,
  type SimulationRenderData,
  type SimulationState,
} from './types';
import { createSeededRandom, type FieldConfig, type FieldEmitter } from '../domain/field';

const TAU = Math.PI * 2;
const METRIC_SAMPLE_COUNT = 512;

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function clampMagnitude(x: number, y: number, z: number, maximum: number): [number, number, number] {
  const magnitudeSquared = x * x + y * y + z * z;
  if (magnitudeSquared <= maximum * maximum || magnitudeSquared === 0) return [x, y, z];
  const scale = maximum / Math.sqrt(magnitudeSquared);
  return [x * scale, y * scale, z * scale];
}

/** Deterministic reference backend and compatibility baseline for the first slice. */
export class CpuSimulationBackend implements ISimulationBackend {
  private positions = new Float32Array();
  private velocities = new Float32Array();
  private memory = new Float32Array();
  private polarity = new Float32Array();
  private state: SimulationState = TWIN_ORBIT_STATE;
  private fieldConfig: FieldConfig = { emitters: [], accelerationClamp: 12 };
  private seed = TWIN_ORBIT_STATE.seed;
  private count = 0;
  private time = 0;
  private version = 0;
  private respawns = 0;
  private metrics: SimulationMetrics = {
    simulationTime: 0,
    particleCount: 0,
    kineticEnergy: 0,
    angularCoherence: 0,
    radialCompactness: 1,
    stability: 0,
    candidate: 'chaotic',
    respawnCount: 0,
  };

  initialize(options: SimulationInitializeOptions): void {
    const requested = Number.isFinite(options.particleCount) ? Math.floor(options.particleCount) : 4_096;
    const configuredLimit = options.capabilities?.maxParticleCount;
    const limit = Number.isFinite(configuredLimit) ? Math.max(Math.floor(configuredLimit ?? requested), 256) : requested;
    this.count = Math.max(256, Math.min(requested, limit));
    this.seed = options.seed >>> 0;
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.memory = new Float32Array(this.count * 3);
    this.polarity = new Float32Array(this.count);
    this.reset(this.seed);
  }

  setState(state: SimulationState): void {
    this.state = state;
    this.fieldConfig = {
      accelerationClamp: state.maxAcceleration,
      normalizeWeights: false,
      symmetry: state.symmetry > 1 ? { count: state.symmetry, strength: 0.08 } : undefined,
      emitters: state.emitters.slice(0, 8).map((emitter): FieldEmitter => ({
        id: emitter.id,
        position: { x: emitter.position[0], y: emitter.position[1], z: emitter.position[2] },
        axis: { x: emitter.axis[0], y: emitter.axis[1], z: emitter.axis[2] },
        polarity: emitter.polarity,
        strength: emitter.strength,
        coreRadius: emitter.coreRadius,
        reach: emitter.reach,
        falloff: 1,
        weights: {
          spatial: emitter.spatialWeight,
          counterspatial: emitter.counterspatialWeight,
          circular: emitter.circularWeight,
          radial: emitter.radialWeight,
        },
        angularSpeed: emitter.rotation,
        pressure: emitter.pressure,
        pulseWaveNumber: 2.6,
        pulseFrequency: 1.2,
        phase: emitter.phase,
        contributionClamp: state.maxAcceleration / Math.max(state.emitters.length, 1),
      })),
    };
  }

  step(fixedDt: number, substeps = 1): void {
    for (let stepIndex = 0; stepIndex < substeps; stepIndex += 1) this.integrate(fixedDt);
  }

  renderData(): SimulationRenderData {
    return {
      positions: this.positions,
      velocities: this.velocities,
      polarity: this.polarity,
      particleCount: this.count,
      version: this.version,
    };
  }

  requestMetrics(): SimulationMetrics {
    return this.metrics;
  }

  reset(seed = this.seed): void {
    this.seed = seed >>> 0;
    this.time = 0;
    this.version = 0;
    this.respawns = 0;
    const random = createSeededRandom(this.seed);
    for (let index = 0; index < this.count; index += 1) this.seedParticle(index, random);
    this.updateMetrics();
  }

  dispose(): void {
    this.positions = new Float32Array();
    this.velocities = new Float32Array();
    this.memory = new Float32Array();
    this.polarity = new Float32Array();
    this.count = 0;
  }

  private seedParticle(index: number, random: () => number): void {
    const offset = index * 3;
    const angle = random() * TAU;
    const tubeAngle = random() * TAU;
    const majorRadius = 1.65 + (random() - 0.5) * 0.55;
    const tubeRadius = 0.55 * Math.sqrt(random());
    const x = tubeRadius * Math.sin(tubeAngle);
    const radial = majorRadius + tubeRadius * Math.cos(tubeAngle);
    this.positions[offset] = x;
    this.positions[offset + 1] = radial * Math.cos(angle);
    this.positions[offset + 2] = radial * Math.sin(angle);
    const speed = 0.22 + random() * 0.28;
    this.velocities[offset] = (random() - 0.5) * 0.08;
    this.velocities[offset + 1] = -Math.sin(angle) * speed;
    this.velocities[offset + 2] = Math.cos(angle) * speed;
    this.memory[offset] = 0;
    this.memory[offset + 1] = 0;
    this.memory[offset + 2] = 0;
    this.polarity[index] = x >= 0 ? -0.8 : 0.8;
  }

  private respawnParticle(index: number): void {
    const random = createSeededRandom((this.seed + Math.imul(index + 1, 0x9e3779b1) + this.respawns) >>> 0);
    this.seedParticle(index, random);
    this.respawns += 1;
  }

  private integrate(dt: number): void {
    const state = this.state;
    const boundary = Math.max(state.chamberRadius, 0.5);
    const memoryBlend = state.memorySeconds <= 0 ? 1 : 1 - Math.exp(-dt / state.memorySeconds);
    const damping = Math.exp(-Math.max(state.damping, 0) * dt);
    const emitters = this.fieldConfig.emitters;
    const emitterCount = emitters.length;

    for (let index = 0; index < this.count; index += 1) {
      const offset = index * 3;
      let px = this.positions[offset] ?? 0;
      let py = this.positions[offset + 1] ?? 0;
      let pz = this.positions[offset + 2] ?? 0;
      let vx = this.velocities[offset] ?? 0;
      let vy = this.velocities[offset + 1] ?? 0;
      let vz = this.velocities[offset + 2] ?? 0;
      let ax = 0;
      let ay = 0;
      let az = 0;
      let influence = 0;

      for (let emitterIndex = 0; emitterIndex < emitterCount; emitterIndex += 1) {
        const emitter = emitters[emitterIndex];
        if (!emitter) continue;
        const rx = px - emitter.position.x;
        const ry = py - emitter.position.y;
        const rz = pz - emitter.position.z;
        const core = Math.max(emitter.coreRadius, 0.025);
        const rho = Math.sqrt(rx * rx + ry * ry + rz * rz + core * core);
        const inverseRho = 1 / rho;
        const nx = rx * inverseRho;
        const ny = ry * inverseRho;
        const nz = rz * inverseRho;
        const reach = Math.max(emitter.reach, core);
        const envelope = Math.exp(-((rho / reach) ** 2)) / (rho + core);
        const axisLength = Math.hypot(emitter.axis.x, emitter.axis.y, emitter.axis.z) || 1;
        const ux = emitter.axis.x / axisLength;
        const uy = emitter.axis.y / axisLength;
        const uz = emitter.axis.z / axisLength;
        const dot = nx * ux + ny * uy + nz * uz;
        const spatialX = ux * dot - nx * 0.35;
        const spatialY = uy * dot - ny * 0.35;
        const spatialZ = uz * dot - nz * 0.35;
        let curlX = uy * nz - uz * ny;
        let curlY = uz * nx - ux * nz;
        let curlZ = ux * ny - uy * nx;
        const curlLength = Math.hypot(curlX, curlY, curlZ) || 1;
        curlX /= curlLength;
        curlY /= curlLength;
        curlZ /= curlLength;
        const pulse = Math.cos(rho * emitter.pulseWaveNumber - this.time * emitter.pulseFrequency + emitter.phase) * emitter.pressure;
        const axial = Math.tanh((rx * ux + ry * uy + rz * uz) / Math.max(reach * 0.35, 0.1));
        const signedStrength = emitter.polarity * emitter.strength * envelope;
        let ex = signedStrength * (
          emitter.weights.spatial * spatialX - emitter.weights.counterspatial * nx
          + emitter.weights.circular * emitter.angularSpeed * curlX + emitter.weights.radial * pulse * nx
          + (state.emitters[emitterIndex]?.axialBias ?? 0) * axial * ux
        );
        let ey = signedStrength * (
          emitter.weights.spatial * spatialY - emitter.weights.counterspatial * ny
          + emitter.weights.circular * emitter.angularSpeed * curlY + emitter.weights.radial * pulse * ny
          + (state.emitters[emitterIndex]?.axialBias ?? 0) * axial * uy
        );
        let ez = signedStrength * (
          emitter.weights.spatial * spatialZ - emitter.weights.counterspatial * nz
          + emitter.weights.circular * emitter.angularSpeed * curlZ + emitter.weights.radial * pulse * nz
          + (state.emitters[emitterIndex]?.axialBias ?? 0) * axial * uz
        );
        [ex, ey, ez] = clampMagnitude(ex, ey, ez, emitter.contributionClamp ?? state.maxAcceleration);
        ax += ex;
        ay += ey;
        az += ez;
        influence += signedStrength;
      }

      const radius = Math.hypot(px, py, pz);
      if (radius > boundary * 0.88) {
        const depth = (radius - boundary * 0.88) / Math.max(boundary * 0.12, 0.01);
        const penalty = Math.min(Math.max(depth, 0), 2) * state.maxAcceleration;
        ax -= (px / radius) * penalty;
        ay -= (py / radius) * penalty;
        az -= (pz / radius) * penalty;
      }

      const turbulence = state.turbulence;
      ax += Math.sin(py * 1.37 + this.time * 0.71) * Math.cos(pz * 0.91 - this.time * 0.43) * turbulence;
      ay += Math.sin(pz * 1.13 + this.time * 0.53) * Math.cos(px * 1.19 + this.time * 0.31) * turbulence;
      az += Math.sin(px * 0.97 - this.time * 0.47) * Math.cos(py * 1.29 + this.time * 0.37) * turbulence;

      let mx = this.memory[offset] ?? 0;
      let my = this.memory[offset + 1] ?? 0;
      let mz = this.memory[offset + 2] ?? 0;
      mx += (vx - mx) * memoryBlend;
      my += (vy - my) * memoryBlend;
      mz += (vz - mz) * memoryBlend;
      [ax, ay, az] = clampMagnitude(ax + mx * 0.08, ay + my * 0.08, az + mz * 0.08, state.maxAcceleration);
      vx = (vx + ax * dt) * damping;
      vy = (vy + ay * dt) * damping;
      vz = (vz + az * dt) * damping;
      [vx, vy, vz] = clampMagnitude(vx, vy, vz, state.maxVelocity);
      px += vx * dt;
      py += vy * dt;
      pz += vz * dt;

      if (![px, py, pz, vx, vy, vz].every(Number.isFinite) || Math.hypot(px, py, pz) > boundary * 1.8) {
        this.respawnParticle(index);
        continue;
      }

      this.positions[offset] = finite(px);
      this.positions[offset + 1] = finite(py);
      this.positions[offset + 2] = finite(pz);
      this.velocities[offset] = finite(vx);
      this.velocities[offset + 1] = finite(vy);
      this.velocities[offset + 2] = finite(vz);
      this.memory[offset] = finite(mx);
      this.memory[offset + 1] = finite(my);
      this.memory[offset + 2] = finite(mz);
      // Preserve a legible red/blue field topology on the light paper surface.
      // The emitter influence still bends the split, while the local axial side
      // prevents balanced regions from collapsing into one muddy hue.
      const colorTarget = Math.tanh((-px / Math.max(boundary * 0.25, 0.1)) * 1.8 + influence * 0.15);
      const currentColorPhase = this.polarity[index] ?? 0;
      this.polarity[index] = currentColorPhase + (colorTarget - currentColorPhase) * 0.08;
    }

    this.time += dt;
    this.version += 1;
    if (this.version % 15 === 0) this.updateMetrics();
  }

  private updateMetrics(): void {
    const samples = Math.min(this.count, METRIC_SAMPLE_COUNT);
    if (samples === 0) return;
    const stride = Math.max(Math.floor(this.count / samples), 1);
    let speedSum = 0;
    let speedSquaredSum = 0;
    let radiusSum = 0;
    let radiusSquaredSum = 0;
    let angularX = 0;
    let angularY = 0;
    let angularZ = 0;
    let measured = 0;
    for (let index = 0; index < this.count && measured < samples; index += stride) {
      const offset = index * 3;
      const px = this.positions[offset] ?? 0;
      const py = this.positions[offset + 1] ?? 0;
      const pz = this.positions[offset + 2] ?? 0;
      const vx = this.velocities[offset] ?? 0;
      const vy = this.velocities[offset + 1] ?? 0;
      const vz = this.velocities[offset + 2] ?? 0;
      const speed = Math.hypot(vx, vy, vz);
      const radius = Math.hypot(px, py, pz);
      speedSum += speed;
      speedSquaredSum += speed * speed;
      radiusSum += radius;
      radiusSquaredSum += radius * radius;
      const lx = py * vz - pz * vy;
      const ly = pz * vx - px * vz;
      const lz = px * vy - py * vx;
      const length = Math.hypot(lx, ly, lz) || 1;
      angularX += lx / length;
      angularY += ly / length;
      angularZ += lz / length;
      measured += 1;
    }
    const inverse = 1 / measured;
    const meanSpeed = speedSum * inverse;
    const kineticVariation = Math.max(speedSquaredSum * inverse - meanSpeed * meanSpeed, 0);
    const meanRadius = radiusSum * inverse;
    const radiusVariance = Math.max(radiusSquaredSum * inverse - meanRadius * meanRadius, 0);
    const compactness = Math.min(Math.sqrt(radiusVariance) / Math.max(meanRadius, 0.001), 1);
    const coherence = Math.min(Math.hypot(angularX, angularY, angularZ) * inverse, 1);
    const calm = 1 / (1 + kineticVariation * 5);
    const stability = Math.min(Math.max((calm * 0.42 + coherence * 0.43 + (1 - compactness) * 0.15) * 100, 0), 100);
    const candidate = stability < 52 ? 'chaotic' : coherence > 0.48 ? 'torus' : compactness < 0.24 ? 'shell' : 'axial';
    this.metrics = {
      simulationTime: this.time,
      particleCount: this.count,
      kineticEnergy: 0.5 * meanSpeed * meanSpeed,
      angularCoherence: coherence,
      radialCompactness: compactness,
      stability,
      candidate,
      respawnCount: this.respawns,
    };
  }
}
