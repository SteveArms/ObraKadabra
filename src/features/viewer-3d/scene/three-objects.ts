import { BoxGeometry, BufferGeometry, ExtrudeGeometry, Matrix4, Mesh, Quaternion, Shape, Vector2, Vector3, type Material } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { SceneBox, ScenePrism, SceneElement } from "./types";

// One unit cube shared by every single-box element (columns, footings, plain walls): only the transform changes
const UNIT_BOX = new BoxGeometry(1, 1, 1);
const Y_AXIS = new Vector3(0, 1, 0);

function boxMatrix(box: SceneBox): Matrix4 {
  const rotation = new Quaternion().setFromAxisAngle(Y_AXIS, box.rotationY);
  return new Matrix4().compose(new Vector3(...box.center), rotation, new Vector3(...box.size));
}

function mergedBoxes(boxes: SceneBox[]): BufferGeometry {
  if (boxes.length === 0) return new BufferGeometry();
  return mergeGeometries(boxes.map((box) => UNIT_BOX.clone().applyMatrix4(boxMatrix(box))));
}

// Shape points use (x, -z) so that rotating the extrusion -90° about X lands them on (x, z) with height along +Y
function prismGeometry(prism: ScenePrism): BufferGeometry {
  const shape = new Shape(prism.polygon.map(([x, z]) => new Vector2(x, -z)));
  const geometry = new ExtrudeGeometry(shape, { depth: prism.thickness, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, prism.bottom, 0);
  return geometry;
}

export function buildElementMesh(element: SceneElement, material: Material): Mesh {
  const shape = element.shape;
  const mesh =
    shape.kind === "prism"
      ? new Mesh(prismGeometry(shape.prism), material)
      : shape.boxes.length === 1
        ? new Mesh(UNIT_BOX, material)
        : new Mesh(mergedBoxes(shape.boxes), material);
  if (shape.kind === "boxes" && shape.boxes.length === 1) boxMatrix(shape.boxes[0]).decompose(mesh.position, mesh.quaternion, mesh.scale);
  mesh.name = element.key;
  mesh.userData = { elementKey: element.key };
  return mesh;
}

export function disposeElementMesh(mesh: Mesh): void {
  if (mesh.geometry !== UNIT_BOX) mesh.geometry.dispose();
}
