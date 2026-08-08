import {
  Color,
  Fog,
  Group,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CpuSimulationBackend,
  FixedStepLoop,
  TWIN_ORBIT_STATE,
  type ISimulationBackend,
  type SimulationMetrics,
  type SimulationState,
} from '../sim';
import { createConstructionGeometry, disposeObjectTree } from './construction-geometry';
import { createEmitterGlyph } from './emitter-glyph';
import { createParticleCloud, type ParticleCloud } from './particle-material';

export type ChamberPreset = 'twin-orbit' | 'pressure-vessel' | 'axial-rotor';

export interface ChamberControllerOptions {
  readonly backend?: ISimulationBackend;
  readonly initialState?: SimulationState;
  readonly particleCount?: number;
  readonly maxPixelRatio?: number;
  readonly reducedMotion?: boolean;
  readonly onMetrics?: (metrics: SimulationMetrics) => void;
  readonly onError?: (error: Error) => void;
}

export interface ChamberController {
  readonly canvas: HTMLCanvasElement;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  pause(): void;
  play(): void;
  togglePause(): boolean;
  isPaused(): boolean;
  step(): void;
  reset(options?: { readonly preserveState?: boolean; readonly seed?: number }): void;
  resetView(): void;
  setPreset(preset: ChamberPreset): void;
  updateState(state: SimulationState, options?: { readonly reseed?: boolean }): void;
  getState(): SimulationState;
  getMetrics(): SimulationMetrics;
  resize(): void;
  dispose(): void;
}

const PRESSURE_VESSEL_STATE: SimulationState = {
  ...TWIN_ORBIT_STATE,
  seed: 0x83c4e21d,
  damping: 0.5,
  memorySeconds: 0.42,
  turbulence: 0.025,
  emitters: [{
    ...TWIN_ORBIT_STATE.emitters[0]!,
    id: 'vessel-core',
    position: [0, 0, 0],
    axis: [0, 1, 0],
    strength: 2.8,
    polarity: -1,
    circularWeight: 0.18,
    counterspatialWeight: 0.55,
    radialWeight: 1,
    pressure: 1,
  }],
};

const AXIAL_ROTOR_STATE: SimulationState = {
  ...TWIN_ORBIT_STATE,
  seed: 0x2f18bd6a,
  damping: 0.42,
  memorySeconds: 1.05,
  turbulence: 0.035,
  emitters: TWIN_ORBIT_STATE.emitters.map((emitter) => ({
    ...emitter,
    axis: [0, 1, 0] as const,
    position: [emitter.position[0] * 0.4, emitter.position[0], 0] as const,
    spatialWeight: 0.5,
    counterspatialWeight: 0.45,
    circularWeight: 0.7,
    axialBias: 0.75,
  })),
};

const PRESETS: Record<ChamberPreset, SimulationState> = {
  'twin-orbit': TWIN_ORBIT_STATE,
  'pressure-vessel': PRESSURE_VESSEL_STATE,
  'axial-rotor': AXIAL_ROTOR_STATE,
};

export function createChamberController(
  container: HTMLElement,
  options: ChamberControllerOptions = {},
): ChamberController {
  const backend = options.backend ?? new CpuSimulationBackend();
  let state = options.initialState ?? TWIN_ORBIT_STATE;
  let paused = false;
  let disposed = false;
  let animationFrame = 0;
  let lastMetricPublish = -Infinity;
  let emitterGroup: Group | undefined;

  const scene = new Scene();
  scene.background = new Color('#f9f6ef');
  scene.fog = new Fog('#f9f6ef', 8.5, 16);

  const camera = new PerspectiveCamera(42, 1, 0.05, 60);
  camera.position.set(6.7, 4.15, 8.35);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.maxPixelRatio ?? 1.5));
  renderer.domElement.className = 'chamber-canvas';
  renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional particle chamber with two signed emitters.');
  renderer.domElement.setAttribute('role', 'img');
  container.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !options.reducedMotion;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 5.3;
  controls.maxDistance = 15;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.88;
  controls.target.set(0, 0, 0);

  backend.initialize({ seed: state.seed, particleCount: options.particleCount ?? 8_192 });
  backend.setState(state);
  let construction = createConstructionGeometry(state.chamberRadius);
  scene.add(construction);
  const particleCloud: ParticleCloud = createParticleCloud(backend.renderData());
  scene.add(particleCloud.points);

  function rebuildEmitters(): void {
    if (emitterGroup) {
      scene.remove(emitterGroup);
      disposeObjectTree(emitterGroup);
    }
    emitterGroup = new Group();
    emitterGroup.name = 'signed-emitters';
    for (const emitter of state.emitters.slice(0, 8)) emitterGroup.add(createEmitterGlyph(emitter));
    scene.add(emitterGroup);
  }

  rebuildEmitters();
  const loop = new FixedStepLoop({ fixedDt: 1 / 120, maxSubsteps: 4 });

  function reportError(cause: unknown): void {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    options.onError?.(error);
  }

  function render(nowMilliseconds: number): void {
    if (disposed) return;
    animationFrame = requestAnimationFrame(render);
    try {
      if (!paused) loop.advance(nowMilliseconds / 1000, (dt) => backend.step(dt));
      else loop.reset(nowMilliseconds / 1000);
      controls.update();
      particleCloud.sync(backend.renderData());
      renderer.render(scene, camera);
      if (nowMilliseconds - lastMetricPublish >= 200) {
        lastMetricPublish = nowMilliseconds;
        options.onMetrics?.(backend.requestMetrics());
      }
    } catch (error) {
      paused = true;
      reportError(error);
    }
  }

  function resize(): void {
    if (disposed) return;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
  resizeObserver?.observe(container);
  window.addEventListener('resize', resize, { passive: true });
  const onContextLost = (event: Event): void => {
    event.preventDefault();
    paused = true;
    reportError(new Error('The particle chamber lost its WebGL context.'));
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  resize();
  animationFrame = requestAnimationFrame(render);

  function updateState(nextState: SimulationState, updateOptions: { readonly reseed?: boolean } = {}): void {
    const chamberRadiusChanged = nextState.chamberRadius !== state.chamberRadius;
    state = nextState;
    backend.setState(state);
    if (chamberRadiusChanged) {
      scene.remove(construction);
      disposeObjectTree(construction);
      construction = createConstructionGeometry(state.chamberRadius);
      scene.add(construction);
    }
    rebuildEmitters();
    if (updateOptions.reseed) backend.reset(state.seed);
  }

  return {
    canvas: renderer.domElement,
    camera,
    renderer,
    pause() {
      paused = true;
    },
    play() {
      paused = false;
      loop.reset(performance.now() / 1000);
    },
    togglePause() {
      paused = !paused;
      loop.reset(performance.now() / 1000);
      return paused;
    },
    isPaused() {
      return paused;
    },
    step() {
      if (!paused) return;
      backend.step(loop.fixedDt);
      particleCloud.sync(backend.renderData());
      options.onMetrics?.(backend.requestMetrics());
    },
    reset(resetOptions = {}) {
      if (!resetOptions.preserveState) backend.setState(state);
      backend.reset(resetOptions.seed ?? state.seed);
      loop.reset(performance.now() / 1000);
    },
    resetView() {
      camera.position.set(6.7, 4.15, 8.35);
      controls.target.set(0, 0, 0);
      controls.update();
    },
    setPreset(preset) {
      updateState(PRESETS[preset], { reseed: true });
    },
    updateState,
    getState() {
      return state;
    },
    getMetrics() {
      return backend.requestMetrics();
    },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      particleCloud.dispose();
      disposeObjectTree(construction);
      if (emitterGroup) disposeObjectTree(emitterGroup);
      backend.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
