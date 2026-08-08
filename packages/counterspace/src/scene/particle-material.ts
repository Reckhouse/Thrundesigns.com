import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  NormalBlending,
  Points,
  ShaderMaterial,
} from 'three';
import type { SimulationRenderData } from '../sim';

const vertexShader = /* glsl */ `
  attribute float polarity;
  attribute vec3 velocity;
  varying float vPolarity;
  varying float vSpeed;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vPolarity = clamp(polarity, -1.0, 1.0);
    vSpeed = clamp(length(velocity) / 3.0, 0.0, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp((3.0 + vSpeed * 2.2) * (10.0 / max(-viewPosition.z, 1.0)), 1.6, 6.5);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 positiveColor;
  uniform vec3 negativeColor;
  uniform vec3 balancedColor;
  uniform float opacity;
  varying float vPolarity;
  varying float vSpeed;

  void main() {
    vec2 delta = gl_PointCoord - vec2(0.5);
    float radius = length(delta) * 2.0;
    if (radius > 1.0) discard;
    float signedMix = vPolarity * 0.5 + 0.5;
    vec3 polarityColor = mix(negativeColor, positiveColor, signedMix);
    float balance = 1.0 - smoothstep(0.0, 0.42, abs(vPolarity));
    vec3 color = mix(polarityColor, balancedColor, balance * 0.7);
    float core = 1.0 - smoothstep(0.0, 0.35, radius);
    float halo = (1.0 - smoothstep(0.15, 1.0, radius)) * 0.5;
    float alpha = (core + halo) * opacity * (0.72 + vSpeed * 0.28);
    gl_FragColor = vec4(color * (0.82 + core * 0.4), alpha);
  }
`;

export interface ParticleCloud {
  readonly points: Points<BufferGeometry, ShaderMaterial>;
  sync(data: SimulationRenderData): void;
  dispose(): void;
}

export function createParticleCloud(data: SimulationRenderData): ParticleCloud {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(data.positions, 3).setUsage(DynamicDrawUsage);
  const velocity = new BufferAttribute(data.velocities, 3).setUsage(DynamicDrawUsage);
  const polarity = new BufferAttribute(data.polarity, 1).setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', position);
  geometry.setAttribute('velocity', velocity);
  geometry.setAttribute('polarity', polarity);
  geometry.setDrawRange(0, data.particleCount);

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    // Normal blending preserves red/blue structure against the near-white paper field.
    blending: NormalBlending,
    uniforms: {
      positiveColor: { value: new Color('#d93a32') },
      negativeColor: { value: new Color('#1146db') },
      balancedColor: { value: new Color('#fffaf0') },
      opacity: { value: 0.9 },
    },
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 2;

  return {
    points,
    sync(nextData) {
      let positionAttribute = geometry.getAttribute('position') as BufferAttribute;
      let velocityAttribute = geometry.getAttribute('velocity') as BufferAttribute;
      let polarityAttribute = geometry.getAttribute('polarity') as BufferAttribute;
      if (positionAttribute.array !== nextData.positions) {
        positionAttribute = new BufferAttribute(nextData.positions, 3).setUsage(DynamicDrawUsage);
        geometry.setAttribute('position', positionAttribute);
      }
      if (velocityAttribute.array !== nextData.velocities) {
        velocityAttribute = new BufferAttribute(nextData.velocities, 3).setUsage(DynamicDrawUsage);
        geometry.setAttribute('velocity', velocityAttribute);
      }
      if (polarityAttribute.array !== nextData.polarity) {
        polarityAttribute = new BufferAttribute(nextData.polarity, 1).setUsage(DynamicDrawUsage);
        geometry.setAttribute('polarity', polarityAttribute);
      }
      positionAttribute.needsUpdate = true;
      velocityAttribute.needsUpdate = true;
      polarityAttribute.needsUpdate = true;
      geometry.setDrawRange(0, nextData.particleCount);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
