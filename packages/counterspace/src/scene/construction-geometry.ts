import {
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  RingGeometry,
} from 'three';

function circle(radius: number, opacity: number): LineLoop {
  const vertices: number[] = [];
  const segments = 128;
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  return new LineLoop(
    geometry,
    new LineBasicMaterial({ color: new Color('#1b1a18'), transparent: true, opacity }),
  );
}

export function createConstructionGeometry(chamberRadius: number): Group {
  const group = new Group();
  group.name = 'construction-geometry';

  const axisLength = chamberRadius * 1.08;
  const axisGeometry = new BufferGeometry();
  axisGeometry.setAttribute('position', new Float32BufferAttribute([
    -axisLength, 0, 0, axisLength, 0, 0,
    0, -axisLength, 0, 0, axisLength, 0,
    0, 0, -axisLength, 0, 0, axisLength,
  ], 3));
  const axes = new LineSegments(
    axisGeometry,
    new LineBasicMaterial({ color: '#1b1a18', transparent: true, opacity: 0.26 }),
  );
  group.add(axes);

  const planeGeometry = new CircleGeometry(chamberRadius * 0.78, 96);
  const plane = new Mesh(
    planeGeometry,
    new MeshBasicMaterial({
      color: '#8f8a80',
      transparent: true,
      opacity: 0.027,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  plane.rotation.x = Math.PI / 2;
  plane.renderOrder = 0;
  group.add(plane);

  for (const radius of [0.82, 1.65, 2.5, 3.3]) {
    const ring = circle(radius, radius === 1.65 ? 0.22 : 0.105);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  const chamberRing = new Mesh(
    new RingGeometry(chamberRadius * 0.994, chamberRadius, 160),
    new MeshBasicMaterial({
      color: '#1b1a18',
      transparent: true,
      opacity: 0.16,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  chamberRing.rotation.x = Math.PI / 2;
  group.add(chamberRing);
  return group;
}

export function disposeObjectTree(root: Object3D): void {
  root.traverse((object) => {
    if ('geometry' in object && object.geometry instanceof BufferGeometry) object.geometry.dispose();
    if ('material' in object) {
      const material = object.material;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else if (material instanceof Material) material.dispose();
    }
  });
}
