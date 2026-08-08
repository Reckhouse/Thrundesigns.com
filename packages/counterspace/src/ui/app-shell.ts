import { createChamberController, type ChamberController, type ChamberPreset } from '../scene';
import { TWIN_ORBIT_STATE, type SimulationEmitter, type SimulationMetrics, type SimulationState } from '../sim';

const DISCLOSURE = 'This laboratory explores invented vector fields inspired by geometric diagrams. It is an art-and-mathematics simulation, not a model of real electromagnetism.';

function icon(name: 'pause' | 'play' | 'reset' | 'share' | 'plus' | 'duplicate' | 'trash' | 'axis' | 'inspect'): string {
  const paths = {
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="m8 5 11 7-11 7Z"/>',
    reset: '<path d="M4 10a8 8 0 1 1 2 7M4 10V4m0 6h6"/>',
    share: '<path d="M12 16V4m0 0L8 8m4-4 4 4M5 13v6h14v-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    duplicate: '<rect x="8" y="8" width="11" height="11" rx="1"/><path d="M16 8V5H5v11h3"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5"/>',
    axis: '<circle cx="12" cy="12" r="8"/><path d="M12 2v20M2 12h20M12 4l-2 3m2-3 2 3"/>',
    inspect: '<circle cx="11" cy="11" r="6"/><path d="m16 16 5 5M11 8v6m-3-3h6"/>',
  } as const;
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function mustQuery<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required interface element: ${selector}`);
  return element;
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

function cloneEmitter(emitter: SimulationEmitter, patch: Partial<SimulationEmitter>): SimulationEmitter {
  return { ...emitter, ...patch };
}

function statePayload(state: SimulationState): string {
  const json = JSON.stringify({ schemaVersion: 1, seed: state.seed, emitters: state.emitters, field: {
    damping: state.damping,
    memorySeconds: state.memorySeconds,
    turbulence: state.turbulence,
    symmetry: state.symmetry,
  } });
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Shared state must be an object.');
  return value as Record<string, unknown>;
}

function boundedNumber(value: unknown, minimum: number, maximum: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(Math.max(value, minimum), maximum) : fallback;
}

function vectorTuple(value: unknown, fallback: SimulationEmitter['position']): SimulationEmitter['position'] {
  if (!Array.isArray(value) || value.length !== 3) return fallback;
  return [
    boundedNumber(value[0], -4.2, 4.2, fallback[0]),
    boundedNumber(value[1], -4.2, 4.2, fallback[1]),
    boundedNumber(value[2], -4.2, 4.2, fallback[2]),
  ];
}

function sharedStateFromHash(): { state?: SimulationState; error?: string } {
  const encoded = new URLSearchParams(location.hash.slice(1)).get('field');
  if (!encoded) return {};
  try {
    const normalized = encoded.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const payload = record(JSON.parse(new TextDecoder().decode(bytes)) as unknown);
    if (payload.schemaVersion !== 1) throw new Error('Unsupported shared-state version.');
    if (!Array.isArray(payload.emitters) || payload.emitters.length < 1 || payload.emitters.length > 8) throw new Error('Shared state must contain one to eight emitters.');
    const emitters = payload.emitters.map((value, index): SimulationEmitter => {
      const raw = record(value);
      const fallback = TWIN_ORBIT_STATE.emitters[index % TWIN_ORBIT_STATE.emitters.length]!;
      const axis = vectorTuple(raw.axis, fallback.axis);
      const axisLength = Math.hypot(...axis);
      const normalizedAxis: SimulationEmitter['axis'] = axisLength > 0.0001 ? [axis[0] / axisLength, axis[1] / axisLength, axis[2] / axisLength] : fallback.axis;
      return {
        id: typeof raw.id === 'string' && raw.id.length <= 64 ? raw.id : `shared-${index + 1}`,
        position: vectorTuple(raw.position, fallback.position),
        axis: normalizedAxis,
        polarity: boundedNumber(raw.polarity, -1, 1, fallback.polarity),
        strength: boundedNumber(raw.strength, 0, 3, fallback.strength),
        reach: boundedNumber(raw.reach, 0.1, 4, fallback.reach),
        coreRadius: boundedNumber(raw.coreRadius, 0.025, 0.5, fallback.coreRadius),
        spatialWeight: boundedNumber(raw.spatialWeight, 0, 1, fallback.spatialWeight),
        counterspatialWeight: boundedNumber(raw.counterspatialWeight, 0, 1, fallback.counterspatialWeight),
        circularWeight: boundedNumber(raw.circularWeight, 0, 1, fallback.circularWeight),
        radialWeight: boundedNumber(raw.radialWeight, 0, 1, fallback.radialWeight),
        rotation: boundedNumber(raw.rotation, -Math.PI * 4, Math.PI * 4, fallback.rotation),
        pressure: boundedNumber(raw.pressure, 0, 3, fallback.pressure),
        phase: boundedNumber(raw.phase, 0, Math.PI * 2, fallback.phase),
        axialBias: boundedNumber(raw.axialBias, -2, 2, fallback.axialBias),
      };
    });
    const field = record(payload.field);
    return { state: {
      ...TWIN_ORBIT_STATE,
      seed: Math.floor(boundedNumber(payload.seed, 0, 0xffffffff, TWIN_ORBIT_STATE.seed)) >>> 0,
      emitters,
      damping: boundedNumber(field.damping, 0, 2, TWIN_ORBIT_STATE.damping),
      memorySeconds: boundedNumber(field.memorySeconds, 0, 3, TWIN_ORBIT_STATE.memorySeconds),
      turbulence: boundedNumber(field.turbulence, 0, 0.5, TWIN_ORBIT_STATE.turbulence),
      symmetry: Math.round(boundedNumber(field.symmetry, 1, 12, TWIN_ORBIT_STATE.symmetry)),
    } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The shared field could not be read.' };
  }
}

export type LaboratoryAppHandle = {
  dispose: () => void;
};

export function createLaboratoryApp(root: HTMLElement): LaboratoryAppHandle {
  root.innerHTML = `
    <div class="laboratory-shell">
      <header class="topbar">
        <a class="brand" href="#chamber" aria-label="Counterspace Field Laboratory home">
          <span class="brand-mark" aria-hidden="true"><i></i><i></i></span>
          <span>Counterspace Field Laboratory</span>
        </a>
        <p class="truth-label">Speculative geometry sandbox</p>
        <div class="topbar-actions">
          <label class="preset-control"><span>Preset</span>
            <select id="preset-select" aria-label="Field preset">
              <option value="twin-orbit">Twin Orbit</option>
              <option value="pressure-vessel">Pressure Vessel</option>
              <option value="axial-rotor">Axial Engine</option>
            </select>
          </label>
          <button class="action-button" id="pause-button" type="button" aria-label="Pause simulation">${icon('pause')}<span>Pause</span></button>
          <button class="action-button" id="reset-button" type="button" aria-label="Reset particles">${icon('reset')}<span>Reset</span></button>
          <button class="action-button" id="share-button" type="button" aria-label="Share configuration">${icon('share')}<span>Share</span></button>
        </div>
      </header>

      <aside class="emitter-rail" aria-label="Emitter ledger">
        <div class="rail-heading">
          <div><span class="section-label">Emitter ledger</span><strong id="emitter-count">2 / 8</strong></div>
          <button class="icon-button" id="add-emitter" type="button" aria-label="Add mirrored emitter pair">${icon('plus')}</button>
        </div>
        <div id="emitter-list" class="emitter-list"></div>
        <div class="rail-actions">
          <button class="text-button" id="duplicate-emitter" type="button">${icon('duplicate')} Duplicate</button>
          <button class="text-button" id="delete-emitter" type="button">${icon('trash')} Delete</button>
        </div>
        <div class="operator-key" aria-label="Field operator key">
          <span>S</span><small>Spatial</small>
          <span>K</span><small>Counterspatial</small>
          <span>C</span><small>Circular</small>
          <span>R</span><small>Radial</small>
        </div>
      </aside>

      <main class="chamber-region" id="chamber">
        <div id="canvas-mount" class="canvas-mount"></div>
        <div class="chamber-overlay" aria-hidden="true">
          <span class="axis-label axis-x">X</span><span class="axis-label axis-y">Y</span>
          <span class="plane-label">P.I. / INERTIA PLANE</span>
          <span class="seed-label" id="seed-label">SEED 6D2B79F5</span>
        </div>
        <section class="first-run" id="first-run" aria-label="About this simulation">
          <p>${DISCLOSURE}</p>
          <button type="button" id="dismiss-intro">Enter laboratory</button>
        </section>
        <p id="canvas-description" class="sr-only" aria-live="polite">Two signed emitters are forming a chaotic field.</p>
        <div class="toast" id="toast" role="status" aria-live="polite"></div>
      </main>

      <aside class="control-panel" aria-label="Laboratory controls">
        <div class="mobile-tabs" role="tablist" aria-label="Control groups">
          <button id="tab-emitter" type="button" role="tab" aria-selected="true" aria-expanded="false" aria-controls="panel-emitter" tabindex="0" data-tab="emitter">Emitter</button>
          <button id="tab-field" type="button" role="tab" aria-selected="false" aria-expanded="false" aria-controls="panel-field" tabindex="-1" data-tab="field">Field</button>
          <button id="tab-inspect" type="button" role="tab" aria-selected="false" aria-expanded="false" aria-controls="panel-inspect" tabindex="-1" data-tab="inspect">Inspect</button>
        </div>
        <section class="control-section" id="panel-emitter" role="tabpanel" aria-labelledby="tab-emitter" data-panel="emitter">
          <header><div><span class="section-label">Selected emitter</span><strong id="selected-name">Emitter A</strong></div><span class="polarity-badge positive" id="polarity-badge">+</span></header>
          <div id="mobile-emitter-list" class="emitter-list mobile-emitter-list"></div>
          <div class="rail-actions mobile-emitter-actions">
            <button class="text-button" id="mobile-add-emitter" type="button">${icon('plus')} Add pair</button>
            <button class="text-button" id="mobile-duplicate-emitter" type="button">${icon('duplicate')} Duplicate</button>
            <button class="text-button" id="mobile-delete-emitter" type="button">${icon('trash')} Delete</button>
            <button class="text-button" id="mobile-reset" type="button">${icon('reset')} Reset</button>
          </div>
          <label class="range-control"><span>Polarity <output id="polarity-output">+1.00</output></span><input id="polarity-input" type="range" min="-1" max="1" step="0.01" value="1"></label>
          <label class="range-control"><span>Strength <output id="strength-output">2.50</output></span><input id="strength-input" type="range" min="0" max="3" step="0.01" value="2.5"></label>
          <label class="range-control"><span>Reach <output id="reach-output">3.70</output></span><input id="reach-input" type="range" min="0.1" max="4" step="0.05" value="3.7"></label>
        </section>
        <section class="control-section" id="panel-field" role="tabpanel" aria-labelledby="tab-field" data-panel="field">
          <header><div><span class="section-label">Field composition</span><strong>Global controls</strong></div>${icon('axis')}</header>
          <label class="range-control bipolar"><span>Convergence / divergence <output id="convergence-output">−0.77</output></span><input id="convergence-input" type="range" min="-1" max="1" step="0.01" value="-0.77"></label>
          <label class="range-control bipolar"><span>Radial / circular <output id="motion-output">+0.74</output></span><input id="motion-input" type="range" min="-1" max="1" step="0.01" value="0.74"></label>
          <label class="range-control"><span>Particle memory <output id="memory-output">0.75 s</output></span><input id="memory-input" type="range" min="0" max="3" step="0.05" value="0.75"></label>
          <label class="range-control"><span>Turbulence <output id="turbulence-output">6%</output></span><input id="turbulence-input" type="range" min="0" max="0.5" step="0.005" value="0.055"></label>
          <label class="range-control"><span>Symmetry <output id="symmetry-output">N = 1</output></span><input id="symmetry-input" type="range" min="1" max="12" step="1" value="1"></label>
        </section>
        <section class="control-section inspector" id="panel-inspect" role="tabpanel" aria-labelledby="tab-inspect" data-panel="inspect">
          <header><div><span class="section-label">Field inspector</span><strong>Live measurements</strong></div>${icon('inspect')}</header>
          <dl>
            <div><dt>Kinetic energy</dt><dd id="kinetic-metric">0.000</dd></div>
            <div><dt>Angular coherence</dt><dd id="coherence-metric">0.000</dd></div>
            <div><dt>Radial residual</dt><dd id="radial-metric">1.000</dd></div>
            <div><dt>Particle sample</dt><dd id="particle-metric">8,192</dd></div>
            <div><dt>Respawns</dt><dd id="respawn-metric">0</dd></div>
          </dl>
          <p class="equation">aᵢ = Σ pⱼqⱼ [wₛS + wₖK + w꜀C + wᵣR]</p>
          <label class="sensory-toggle"><input id="low-sensory-input" type="checkbox"><span><strong>Low Sensory</strong><small>Suppress equilibrium choreography and nonessential motion.</small></span></label>
        </section>
      </aside>

      <footer class="stability-instrument" aria-label="Stability instrument">
        <div class="stability-title"><span class="section-label">Field stability</span><strong id="stability-state">Chaotic</strong></div>
        <div class="stability-scale" id="stability-scale" style="--stability: 0%">
          <div class="scale-track"><i></i></div>
          <div class="scale-labels"><span>Chaotic</span><span>Cohering</span><span>Stable</span></div>
        </div>
        <div class="structure-readout"><span id="stability-score">E = 0.00</span><strong id="structure-name">No persistent form</strong></div>
        <div class="simulation-readout"><span id="simulation-time">T + 0.0 s</span><span id="particle-count">8,192 particles</span></div>
      </footer>
    </div>
  `;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sharedField = sharedStateFromHash();
  const canvasMount = mustQuery<HTMLElement>(root, '#canvas-mount');
  const shell = mustQuery<HTMLElement>(root, '.laboratory-shell');
  let selectedEmitterId = sharedField.state?.emitters[0]?.id ?? 'positive';
  let toastTimer = 0;
  let equilibriumTimer = 0;
  let equilibriumActive = false;
  let stableSince: number | undefined;
  let stableLatched = false;
  let lowSensoryEnabled = reducedMotion;
  try { lowSensoryEnabled ||= localStorage.getItem('counterspace-low-sensory') === 'true'; } catch { /* Storage can be unavailable in private contexts. */ }
  shell.classList.toggle('low-sensory', lowSensoryEnabled);
  let controller: ChamberController;

  const toast = (message: string): void => {
    const element = mustQuery<HTMLElement>(root, '#toast');
    element.textContent = message;
    element.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove('visible'), 2400);
  };

  const triggerEquilibrium = (candidate: string): void => {
    toast(`Coherence found — ${candidate.toLowerCase()}.`);
    if (lowSensoryEnabled) return;
    equilibriumActive = true;
    shell.classList.add('equilibrium-lock');
    controller.camera.position.multiplyScalar(0.96);
    window.clearTimeout(equilibriumTimer);
    equilibriumTimer = window.setTimeout(() => {
      shell.classList.remove('equilibrium-lock');
      controller.camera.position.multiplyScalar(1 / 0.96);
      equilibriumActive = false;
    }, 1200);
  };

  const publishMetrics = (metrics: SimulationMetrics): void => {
    const score = metrics.stability;
    const stateName = score >= 82 ? 'Stable' : score >= 70 ? 'Cohering' : score >= 52 ? 'Forming' : 'Chaotic';
    const candidate = metrics.candidate === 'chaotic' ? 'No persistent form' : metrics.candidate === 'torus' ? 'Torus candidate' : metrics.candidate === 'shell' ? 'Shell candidate' : 'Axial candidate';
    mustQuery<HTMLElement>(root, '#stability-state').textContent = stateName;
    mustQuery<HTMLElement>(root, '#stability-score').textContent = `E = ${(score / 100).toFixed(2)}`;
    mustQuery<HTMLElement>(root, '#structure-name').textContent = candidate;
    mustQuery<HTMLElement>(root, '#simulation-time').textContent = `T + ${metrics.simulationTime.toFixed(1)} s`;
    mustQuery<HTMLElement>(root, '#particle-count').textContent = `${metrics.particleCount.toLocaleString()} particles`;
    mustQuery<HTMLElement>(root, '#kinetic-metric').textContent = metrics.kineticEnergy.toFixed(3);
    mustQuery<HTMLElement>(root, '#coherence-metric').textContent = metrics.angularCoherence.toFixed(3);
    mustQuery<HTMLElement>(root, '#radial-metric').textContent = metrics.radialCompactness.toFixed(3);
    mustQuery<HTMLElement>(root, '#particle-metric').textContent = metrics.particleCount.toLocaleString();
    mustQuery<HTMLElement>(root, '#respawn-metric').textContent = String(metrics.respawnCount);
    mustQuery<HTMLElement>(root, '#canvas-description').textContent = `${metrics.particleCount.toLocaleString()} particles and ${controller?.getState().emitters.length ?? 2} signed emitters are ${stateName.toLowerCase()}; ${candidate.toLowerCase()}.`;
    const scale = mustQuery<HTMLElement>(root, '#stability-scale');
    scale.style.setProperty('--stability', `${score}%`);
    scale.dataset.state = stateName.toLowerCase();
    if (score >= 82) {
      stableSince ??= metrics.simulationTime;
      if (!stableLatched && metrics.simulationTime - stableSince >= 1.5) {
        stableLatched = true;
        triggerEquilibrium(candidate);
      }
    } else if (score < 72) {
      stableSince = undefined;
      stableLatched = false;
    }
  };

  try {
    controller = createChamberController(canvasMount, {
      particleCount: innerWidth < 760 ? 4_096 : 8_192,
      reducedMotion: lowSensoryEnabled,
      initialState: sharedField.state,
      onMetrics: publishMetrics,
      onError: (error) => toast(error.message),
    });
  } catch (error) {
    canvasMount.innerHTML = `<div class="canvas-fallback"><strong>Reduced presentation</strong><p>The live WebGL chamber is unavailable in this browser. The controls and mathematical model remain documented in the project.</p></div>`;
    throw error;
  }

  if (sharedField.state) {
    const preset = mustQuery<HTMLSelectElement>(root, '#preset-select');
    preset.add(new Option('Shared field', 'shared', true, true));
    queueMicrotask(() => toast('Shared field restored and validated.'));
  } else if (sharedField.error) {
    queueMicrotask(() => toast(`Shared field ignored: ${sharedField.error}`));
  }

  const currentEmitter = (): SimulationEmitter => controller.getState().emitters.find((emitter) => emitter.id === selectedEmitterId) ?? controller.getState().emitters[0]!;

  const syncSelectedControls = (): void => {
    const emitter = currentEmitter();
    selectedEmitterId = emitter.id;
    mustQuery<HTMLElement>(root, '#selected-name').textContent = emitter.id === 'positive' ? 'Emitter A' : emitter.id === 'negative' ? 'Emitter B' : emitter.id.replaceAll('-', ' ');
    const badge = mustQuery<HTMLElement>(root, '#polarity-badge');
    badge.textContent = emitter.polarity >= 0 ? '+' : '−';
    badge.className = `polarity-badge ${emitter.polarity >= 0 ? 'positive' : 'negative'}`;
    const values: Array<[string, number, string]> = [
      ['#polarity-input', emitter.polarity, formatSigned(emitter.polarity)],
      ['#strength-input', emitter.strength, emitter.strength.toFixed(2)],
      ['#reach-input', emitter.reach, emitter.reach.toFixed(2)],
    ];
    for (const [selector, value] of values) mustQuery<HTMLInputElement>(root, selector).value = String(value);
    mustQuery<HTMLOutputElement>(root, '#polarity-output').value = values[0]![2];
    mustQuery<HTMLOutputElement>(root, '#strength-output').value = values[1]![2];
    mustQuery<HTMLOutputElement>(root, '#reach-output').value = values[2]![2];
  };

  const renderEmitterList = (): void => {
    const state = controller.getState();
    mustQuery<HTMLElement>(root, '#emitter-count').textContent = `${state.emitters.length} / 8`;
    const markup = state.emitters.map((emitter, index) => `
      <button type="button" class="emitter-entry ${emitter.id === selectedEmitterId ? 'selected' : ''}" data-emitter-id="${emitter.id}" aria-pressed="${emitter.id === selectedEmitterId}">
        <span class="emitter-glyph ${emitter.polarity >= 0 ? 'positive' : 'negative'}"><i></i><b>${emitter.polarity >= 0 ? '+' : '−'}</b></span>
        <span><strong>${index < 2 ? `Emitter ${String.fromCharCode(65 + index)}` : `Emitter ${index + 1}`}</strong><small>${emitter.polarity >= 0 ? 'Positive / divergent' : 'Negative / convergent'}</small></span>
        <output>${formatSigned(emitter.polarity)}</output>
      </button>`).join('');
    for (const list of root.querySelectorAll<HTMLElement>('#emitter-list, #mobile-emitter-list')) {
      list.innerHTML = markup;
      for (const button of list.querySelectorAll<HTMLButtonElement>('[data-emitter-id]')) {
        button.addEventListener('click', () => {
          selectedEmitterId = button.dataset.emitterId ?? selectedEmitterId;
          renderEmitterList();
          syncSelectedControls();
        });
      }
    }
    syncSelectedControls();
  };

  const updateState = (next: SimulationState, reseed = false): void => {
    controller.updateState(next, { reseed });
    renderEmitterList();
    mustQuery<HTMLElement>(root, '#seed-label').textContent = `SEED ${next.seed.toString(16).padStart(8, '0').toUpperCase()}`;
  };

  const patchSelected = (patch: Partial<SimulationEmitter>): void => {
    const state = controller.getState();
    updateState({ ...state, emitters: state.emitters.map((emitter) => emitter.id === selectedEmitterId ? cloneEmitter(emitter, patch) : emitter) });
  };

  mustQuery<HTMLButtonElement>(root, '#pause-button').addEventListener('click', (event) => {
    const paused = controller.togglePause();
    const button = event.currentTarget as HTMLButtonElement;
    button.innerHTML = `${icon(paused ? 'play' : 'pause')}<span>${paused ? 'Play' : 'Pause'}</span>`;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume simulation' : 'Pause simulation');
  });
  const resetParticles = (): void => { controller.reset({ preserveState: true }); toast('Particles reset; controls preserved.'); };
  mustQuery<HTMLButtonElement>(root, '#reset-button').addEventListener('click', resetParticles);
  mustQuery<HTMLButtonElement>(root, '#mobile-reset').addEventListener('click', resetParticles);
  mustQuery<HTMLSelectElement>(root, '#preset-select').addEventListener('change', (event) => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (value === 'shared') return;
    controller.setPreset(value as ChamberPreset);
    selectedEmitterId = controller.getState().emitters[0]?.id ?? selectedEmitterId;
    renderEmitterList();
    syncFieldControls();
    toast('Preset loaded from deterministic initial conditions.');
  });
  mustQuery<HTMLButtonElement>(root, '#share-button').addEventListener('click', async () => {
    const fragment = `field=${statePayload(controller.getState())}`;
    history.replaceState(null, '', `#${fragment}`);
    try { await navigator.clipboard.writeText(location.href); toast('Share URL copied.'); }
    catch { toast('Share state added to the address bar.'); }
  });

  const bindEmitterRange = (inputSelector: string, outputSelector: string, property: 'polarity' | 'strength' | 'reach', formatter: (value: number) => string): void => {
    mustQuery<HTMLInputElement>(root, inputSelector).addEventListener('input', (event) => {
      const value = Number((event.currentTarget as HTMLInputElement).value);
      mustQuery<HTMLOutputElement>(root, outputSelector).value = formatter(value);
      patchSelected({ [property]: value });
    });
  };
  bindEmitterRange('#polarity-input', '#polarity-output', 'polarity', formatSigned);
  bindEmitterRange('#strength-input', '#strength-output', 'strength', (value) => value.toFixed(2));
  bindEmitterRange('#reach-input', '#reach-output', 'reach', (value) => value.toFixed(2));

  const syncFieldControls = (): void => {
    const state = controller.getState();
    const emitter = state.emitters[0];
    const convergence = emitter ? emitter.spatialWeight - emitter.counterspatialWeight : 0;
    const motion = emitter ? emitter.circularWeight - emitter.radialWeight : 0;
    const entries: Array<[string, number, string, string]> = [
      ['#convergence-input', convergence, '#convergence-output', formatSigned(convergence)],
      ['#motion-input', motion, '#motion-output', formatSigned(motion)],
      ['#memory-input', state.memorySeconds, '#memory-output', `${state.memorySeconds.toFixed(2)} s`],
      ['#turbulence-input', state.turbulence, '#turbulence-output', `${Math.round(state.turbulence * 100)}%`],
      ['#symmetry-input', state.symmetry, '#symmetry-output', `N = ${state.symmetry}`],
    ];
    for (const [input, value, output, label] of entries) {
      mustQuery<HTMLInputElement>(root, input).value = String(value);
      mustQuery<HTMLOutputElement>(root, output).value = label;
    }
  };

  mustQuery<HTMLInputElement>(root, '#convergence-input').addEventListener('input', (event) => {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    mustQuery<HTMLOutputElement>(root, '#convergence-output').value = formatSigned(value);
    const spatial = (value + 1) / 2;
    const state = controller.getState();
    updateState({ ...state, emitters: state.emitters.map((emitter) => cloneEmitter(emitter, { spatialWeight: spatial, counterspatialWeight: 1 - spatial })) });
  });
  mustQuery<HTMLInputElement>(root, '#motion-input').addEventListener('input', (event) => {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    mustQuery<HTMLOutputElement>(root, '#motion-output').value = formatSigned(value);
    const circular = (value + 1) / 2;
    const state = controller.getState();
    updateState({ ...state, emitters: state.emitters.map((emitter) => cloneEmitter(emitter, { circularWeight: circular, radialWeight: 1 - circular })) });
  });
  mustQuery<HTMLInputElement>(root, '#memory-input').addEventListener('input', (event) => {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    mustQuery<HTMLOutputElement>(root, '#memory-output').value = `${value.toFixed(2)} s`;
    updateState({ ...controller.getState(), memorySeconds: value });
  });
  mustQuery<HTMLInputElement>(root, '#turbulence-input').addEventListener('input', (event) => {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    mustQuery<HTMLOutputElement>(root, '#turbulence-output').value = `${Math.round(value * 100)}%`;
    updateState({ ...controller.getState(), turbulence: value });
  });
  mustQuery<HTMLInputElement>(root, '#symmetry-input').addEventListener('input', (event) => {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    mustQuery<HTMLOutputElement>(root, '#symmetry-output').value = `N = ${value}`;
    updateState({ ...controller.getState(), symmetry: value });
  });

  const addEmitterPair = (): void => {
    const state = controller.getState();
    if (state.emitters.length > 6) { toast('The initial release supports eight physical emitters.'); return; }
    const source = currentEmitter();
    const offset = 0.55 + state.emitters.length * 0.08;
    const pair: SimulationEmitter[] = [
      cloneEmitter(source, { id: `emitter-${state.emitters.length + 1}`, position: [source.position[0], offset, source.position[2]], polarity: Math.abs(source.polarity) || 1 }),
      cloneEmitter(source, { id: `emitter-${state.emitters.length + 2}`, position: [-source.position[0], -offset, source.position[2]], polarity: -(Math.abs(source.polarity) || 1), rotation: -source.rotation }),
    ];
    selectedEmitterId = pair[0]!.id;
    updateState({ ...state, emitters: [...state.emitters, ...pair] }, true);
    toast('Mirrored emitter pair added.');
  };
  const duplicateEmitter = (): void => {
    const state = controller.getState();
    if (state.emitters.length >= 8) { toast('Emitter limit reached.'); return; }
    const source = currentEmitter();
    const duplicate = cloneEmitter(source, { id: `emitter-${state.emitters.length + 1}`, position: [source.position[0], source.position[1] + 0.45, source.position[2]] });
    selectedEmitterId = duplicate.id;
    updateState({ ...state, emitters: [...state.emitters, duplicate] }, true);
    toast('Emitter duplicated.');
  };
  const deleteEmitter = (): void => {
    const state = controller.getState();
    if (state.emitters.length <= 1) { toast('At least one emitter is required.'); return; }
    const emitters = state.emitters.filter((emitter) => emitter.id !== selectedEmitterId);
    selectedEmitterId = emitters[0]!.id;
    updateState({ ...state, emitters }, true);
    toast('Emitter removed.');
  };
  for (const selector of ['#add-emitter', '#mobile-add-emitter']) mustQuery<HTMLButtonElement>(root, selector).addEventListener('click', addEmitterPair);
  for (const selector of ['#duplicate-emitter', '#mobile-duplicate-emitter']) mustQuery<HTMLButtonElement>(root, selector).addEventListener('click', duplicateEmitter);
  for (const selector of ['#delete-emitter', '#mobile-delete-emitter']) mustQuery<HTMLButtonElement>(root, selector).addEventListener('click', deleteEmitter);

  const controlPanel = mustQuery<HTMLElement>(root, '.control-panel');
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  let selectedTab = 'emitter';
  let sheetOpen = false;
  const isMobileLayout = (): boolean => matchMedia('(max-width: 820px)').matches;
  const applyTabState = (): void => {
    const mobile = isMobileLayout();
    controlPanel.classList.toggle('is-open', mobile && sheetOpen);
    for (const tab of tabs) {
      const selected = tab.dataset.tab === selectedTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('aria-expanded', String(mobile && sheetOpen && selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = mobile && (!sheetOpen || panel.dataset.panel !== selectedTab);
  };
  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => {
      const next = tab.dataset.tab ?? selectedTab;
      sheetOpen = !(sheetOpen && selectedTab === next);
      selectedTab = next;
      applyTabState();
    });
    tab.addEventListener('keydown', (event) => {
      let nextIndex: number | undefined;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      selectedTab = tabs[nextIndex]?.dataset.tab ?? selectedTab;
      sheetOpen = true;
      applyTabState();
      tabs[nextIndex]?.focus();
    });
  }
  window.addEventListener('resize', applyTabState, { passive: true });
  applyTabState();

  const lowSensoryInput = mustQuery<HTMLInputElement>(root, '#low-sensory-input');
  lowSensoryInput.checked = lowSensoryEnabled;
  lowSensoryInput.addEventListener('change', () => {
    lowSensoryEnabled = lowSensoryInput.checked;
    shell.classList.toggle('low-sensory', lowSensoryEnabled);
    if (lowSensoryEnabled && equilibriumActive) {
      window.clearTimeout(equilibriumTimer);
      shell.classList.remove('equilibrium-lock');
      controller.camera.position.multiplyScalar(1 / 0.96);
      equilibriumActive = false;
    }
    try { localStorage.setItem('counterspace-low-sensory', String(lowSensoryEnabled)); } catch { /* Optional persistence. */ }
    toast(lowSensoryEnabled ? 'Low Sensory mode enabled.' : 'Full equilibrium choreography enabled.');
  });

  mustQuery<HTMLButtonElement>(root, '#dismiss-intro').addEventListener('click', () => mustQuery<HTMLElement>(root, '#first-run').classList.add('dismissed'));
  const onKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    if (target?.matches('input, select, button, textarea')) return;
    if (event.code === 'Space') { event.preventDefault(); mustQuery<HTMLButtonElement>(root, '#pause-button').click(); }
    if (event.key.toLowerCase() === 'n' && controller.isPaused()) controller.step();
    if (event.key.toLowerCase() === 'r') { controller.reset({ preserveState: true }); toast('Particles reset.'); }
    if (event.key.toLowerCase() === 'f') controller.resetView();
  };
  window.addEventListener('keydown', onKeyDown);

  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(toastTimer);
    window.clearTimeout(equilibriumTimer);
    window.removeEventListener('resize', applyTabState);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pagehide', onPageHide);
    controller.dispose();
    root.replaceChildren();
  };
  const onPageHide = (): void => {
    dispose();
  };
  window.addEventListener('pagehide', onPageHide);

  renderEmitterList();
  syncFieldControls();
  const initialState = controller.getState();
  mustQuery<HTMLElement>(root, '#seed-label').textContent = `SEED ${initialState.seed.toString(16).padStart(8, '0').toUpperCase()}`;

  return { dispose };
}
