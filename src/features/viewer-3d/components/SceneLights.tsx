// Warm sun from the side the camera faces casts the only shadows; a cool fill and a sky light keep the shaded faces readable
export function SceneLights() {
  return (
    <>
      <hemisphereLight args={["#fff7ec", "#2a2d33", 1.1]} />
      <directionalLight
        position={[-10, 24, 16]}
        intensity={2.2}
        color="#fff4e5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={80}
      />
      <directionalLight position={[14, 8, -12]} intensity={0.45} color="#dbe4ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.28} />
      </mesh>
    </>
  );
}
