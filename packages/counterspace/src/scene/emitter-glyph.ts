import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import type { SimulationEmitter } from '../sim';

function makeRing(radius: number, color: Color, opacity: number): LineLoop {
  const positions: number[] = [];
  for (let index = 0; index < 64; index += 1) {
    const angle = (index / 64) * Math.PI * 2;
    positions.push(0, Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return new LineLoop(geometry, new LineBasicMaterial({ color, transparent: true, opacity }));
}

export function createEmitterGlyph(emitter: SimulationEmitter): Group {
  const group = new Group();
  group.name = `emitter-${emitter.id}`;
  const color = new Color(emitter.polarity >= 0 ? '#d93a32' : '#1146db');
  const core = new Mesh(
    new SphereGeometry(0.105, 16, 12),
    new MeshBasicMaterial({ color, transparent: true, opacity: 0.96 }),
  );
  group.add(core);
  group.add(makeRing(0.25, color, 0.66));
  group.add(makeRing(Math.min(Math.max(emitter.reach * 0.22, 0.42), 0.9), color, 0.14));

  const glyphScale = 0.16;
  const signVertices = emitter.polarity >= 0
    ? [0, -glyphScale, 0, 0, glyphScale, 0, 0, 0, -glyphScale, 0, 0, glyphScale]
    : [0, 0, -glyphScale, 0, 0, glyphScale];
  const signGeometry = new BufferGeometry();
  signGeometry.setAttribute('position', new Float32BufferAttribute(signVertices, 3));
  const sign = new LineSegments(signGeometry, new LineBasicMaterial({ color: '#fffaf0', opacity: 0.95, transparent: true }));
  group.add(sign);

  const axisLength = 0.72;
  const axisGeometry = new BufferGeometry();
  axisGeometry.setAttribute('position', new Float32BufferAttribute([-axisLength, 0, 0, axisLength, 0, 0], 3));
  group.add(new LineSegments(axisGeometry, new LineBasicMaterial({ color, transparent: true, opacity: 0.46 })));

  group.position.fromArray(emitter.position);
  const targetAxis = new Vector3(...emitter.axis).normalize();
  group.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), targetAxis);
  return group;
}

