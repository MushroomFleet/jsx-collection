import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const VennDiagram3D = () => {
  const [activeView, setActiveView] = useState('venn');
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Rotate the scene slowly
      scene.rotation.y += 0.003;
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous objects (except lights and camera)
    const objectsToRemove = [];
    sceneRef.current.children.forEach(child => {
      if (child.type === 'Mesh' || child.type === 'Group' || child.type === 'Sprite' || child.type === 'LineSegments') {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => sceneRef.current.remove(obj));

    // Create the selected visualization
    switch (activeView) {
      case 'venn':
        createVennSpheres();
        break;
      case 'ballantine':
        createBallantineDiagram();
        break;
      case 'volumetric':
        createVolumetricDiagram();
        break;
      case 'tetrahedron':
        createTetrahedronDiagram();
        break;
    }
  }, [activeView]);

  const createVennSpheres = () => {
    const radius = 1.5;
    const offset = 1.2;

    // Create three overlapping spheres
    const sphere1 = createTransparentSphere(radius, 0xff6b6b, new THREE.Vector3(-offset, offset * 0.5, 0));
    const sphere2 = createTransparentSphere(radius, 0x4ecdc4, new THREE.Vector3(offset, offset * 0.5, 0));
    const sphere3 = createTransparentSphere(radius, 0xffe66d, new THREE.Vector3(0, -offset, 0));

    sceneRef.current.add(sphere1);
    sceneRef.current.add(sphere2);
    sceneRef.current.add(sphere3);

    // Add labels
    addLabel('Set A\n(120)', -offset - 0.5, offset * 0.5 + 1.5, 0.5, 0xff6b6b);
    addLabel('Set B\n(150)', offset + 0.5, offset * 0.5 + 1.5, 0.5, 0x4ecdc4);
    addLabel('Set C\n(100)', 0, -offset - 1.8, 0.5, 0xffe66d);
    addLabel('A∩B: 30', 0, offset * 0.8, 1, 0xffffff);
    addLabel('A∩B∩C\n15', 0, 0, 0, 0xffffff);
  };

  const createBallantineDiagram = () => {
    const radius = 1.5;
    const offset = 1.3;

    // Classic Ballantine's three-sphere arrangement
    const angle = (2 * Math.PI) / 3;
    
    for (let i = 0; i < 3; i++) {
      const x = Math.cos(angle * i) * offset;
      const z = Math.sin(angle * i) * offset;
      const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d];
      const sphere = createTransparentSphere(radius, colors[i], new THREE.Vector3(x, 0, z));
      sceneRef.current.add(sphere);
    }

    // Add labels
    const labels = ['Quality\n(85%)', 'Value\n(75%)', 'Service\n(90%)'];
    for (let i = 0; i < 3; i++) {
      const x = Math.cos(angle * i) * (offset + 1.2);
      const z = Math.sin(angle * i) * (offset + 1.2);
      addLabel(labels[i], x, 0.5, z, 0xffffff);
    }
    addLabel('Core\n60%', 0, 0, 0, 0xffffff);
  };

  const createVolumetricDiagram = () => {
    const radius = 1.5;
    
    // Four spheres in tetrahedral arrangement
    const positions = [
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(1.5, -0.5, 1.5),
      new THREE.Vector3(-1.5, -0.5, 1.5),
      new THREE.Vector3(0, -0.5, -2)
    ];
    
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];
    const labels = ['Data A', 'Data B', 'Data C', 'Data D'];

    positions.forEach((pos, i) => {
      const sphere = createTransparentSphere(radius, colors[i], pos);
      sceneRef.current.add(sphere);
      addLabel(labels[i], pos.x, pos.y + 1.2, pos.z, colors[i]);
    });

    addLabel('Intersection\nVolume', 0, 0, 0, 0xffffff);
  };

  const createTetrahedronDiagram = () => {
    // Reuleaux tetrahedron approximation with curved surfaces
    const size = 2;
    
    // Create a tetrahedron wireframe
    const geometry = new THREE.TetrahedronGeometry(size);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 })
    );
    sceneRef.current.add(line);

    // Add spheres at vertices
    const vertices = geometry.attributes.position.array;
    const uniqueVertices = [];
    for (let i = 0; i < vertices.length; i += 3) {
      const v = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      if (!uniqueVertices.some(uv => uv.distanceTo(v) < 0.01)) {
        uniqueVertices.push(v);
      }
    }

    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];
    uniqueVertices.forEach((vertex, i) => {
      const sphere = createTransparentSphere(0.5, colors[i], vertex);
      sceneRef.current.add(sphere);
    });

    addLabel('Reuleaux\nTetrahedron', 0, 3, 0, 0xffffff);
  };

  const createTransparentSphere = (radius, color, position) => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    return sphere;
  };

  const addLabel = (text, x, y, z, color) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      context.fillText(line, 128, 64 + (i - lines.length / 2 + 0.5) * 30);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(2, 1, 1);
    
    sceneRef.current.add(sprite);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            3D Venn Diagram Types
          </h1>
          <p className="text-slate-600">
            Interactive visualization of different 3D set diagram approaches
          </p>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setActiveView('venn')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'venn'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Venn Spheres
          </button>
          <button
            onClick={() => setActiveView('ballantine')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'ballantine'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Ballantine's Diagram
          </button>
          <button
            onClick={() => setActiveView('volumetric')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'volumetric'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Volumetric (4 Sets)
          </button>
          <button
            onClick={() => setActiveView('tetrahedron')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'tetrahedron'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Reuleaux Tetrahedron
          </button>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          <div ref={mountRef} className="w-full h-full" />
          
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-md">
            <h3 className="font-bold text-lg text-slate-800 mb-2">
              {activeView === 'venn' && 'Venn Spheres'}
              {activeView === 'ballantine' && "Ballantine's Diagram"}
              {activeView === 'volumetric' && 'Volumetric Diagram'}
              {activeView === 'tetrahedron' && 'Reuleaux Tetrahedron'}
            </h3>
            <p className="text-sm text-slate-600">
              {activeView === 'venn' && 'Classic 3-sphere Venn diagram showing set intersections with mock data representing overlapping categories.'}
              {activeView === 'ballantine' && 'Named after the Ballantine whisky logo, this shows three equal spheres in circular arrangement, often used for brand attributes.'}
              {activeView === 'volumetric' && 'Four-set diagram in tetrahedral arrangement, demonstrating complex multi-dimensional set relationships.'}
              {activeView === 'tetrahedron' && 'A Reuleaux tetrahedron approximation - a 3D shape with curved surfaces formed by sphere intersections.'}
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          🖱️ The diagram rotates automatically. Each visualization shows different approaches to 3D set representation.
        </div>
      </div>
    </div>
  );
};

export default VennDiagram3D;
