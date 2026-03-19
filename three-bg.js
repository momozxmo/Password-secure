// ===== AEGIS Vault — Three.js 3D Background =====
import * as THREE from 'three';

(function() {
    'use strict';

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = document.getElementById('threeBg');
    if (!container) return;

    // ===== Scene Setup =====
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a18, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050a18, 1);
    container.appendChild(renderer.domElement);

    // ===== Mouse tracking =====
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    document.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ===== Ambient Lighting =====
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.4);
    scene.add(ambientLight);

    // Main directional light — cyan
    const mainLight = new THREE.PointLight(0x38bdf8, 2, 60);
    mainLight.position.set(10, 10, 15);
    scene.add(mainLight);

    // Secondary light — purple
    const secondaryLight = new THREE.PointLight(0xa78bfa, 1.5, 50);
    secondaryLight.position.set(-10, -5, 10);
    scene.add(secondaryLight);

    // Subtle rim light
    const rimLight = new THREE.PointLight(0x818cf8, 0.8, 40);
    rimLight.position.set(0, 15, -10);
    scene.add(rimLight);

    // ===== Materials =====
    const wireframeMaterial = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.1,
    });

    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.08,
        emissive: 0xa78bfa,
        emissiveIntensity: 0.05,
        shininess: 100,
    });

    const solidMaterial = new THREE.MeshPhongMaterial({
        color: 0x1e3a5f,
        transparent: true,
        opacity: 0.3,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.03,
        shininess: 60,
    });

    // ===== Floating Geometric Objects =====
    const objects = [];

    // Create various shapes
    const geometries = [
        new THREE.TorusKnotGeometry(1.2, 0.35, 80, 12, 2, 3),
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(1.3, 0),
        new THREE.TorusGeometry(1.2, 0.4, 12, 36),
        new THREE.DodecahedronGeometry(1.1, 0),
        new THREE.TetrahedronGeometry(1.4, 0),
        new THREE.BoxGeometry(1.6, 1.6, 1.6),
        new THREE.ConeGeometry(1, 2, 6),
    ];

    // Place objects in a sphere around the camera
    const objectCount = 18;
    for (let i = 0; i < objectCount; i++) {
        const geom = geometries[i % geometries.length];
        const matChoice = Math.random();
        let mat;
        if (matChoice < 0.5) {
            mat = wireframeMaterial.clone();
            mat.opacity = 0.08 + Math.random() * 0.12;
        } else if (matChoice < 0.8) {
            mat = glassMaterial.clone();
            mat.opacity = 0.04 + Math.random() * 0.08;
        } else {
            mat = solidMaterial.clone();
            mat.opacity = 0.1 + Math.random() * 0.2;
        }

        const mesh = new THREE.Mesh(geom, mat);

        // Distribute in a volume
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 10 + Math.random() * 20;
        mesh.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi) - 5
        );

        const scale = 0.4 + Math.random() * 1.2;
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        scene.add(mesh);
        objects.push({
            mesh,
            rotSpeed: {
                x: (Math.random() - 0.5) * 0.003,
                y: (Math.random() - 0.5) * 0.003,
                z: (Math.random() - 0.5) * 0.002,
            },
            floatSpeed: 0.2 + Math.random() * 0.5,
            floatAmplitude: 0.3 + Math.random() * 0.8,
            initialY: mesh.position.y,
        });
    }

    // ===== Particle Field =====
    const particleCount = 600;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const cyan = new THREE.Color(0x38bdf8);
    const purple = new THREE.Color(0xa78bfa);
    const white = new THREE.Color(0xc8d6e5);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3]     = (Math.random() - 0.5) * 70;
        positions[i3 + 1] = (Math.random() - 0.5) * 70;
        positions[i3 + 2] = (Math.random() - 0.5) * 50 - 5;

        const colorChoice = Math.random();
        let col;
        if (colorChoice < 0.4) col = cyan;
        else if (colorChoice < 0.7) col = purple;
        else col = white;

        colors[i3]     = col.r;
        colors[i3 + 1] = col.g;
        colors[i3 + 2] = col.b;

        sizes[i] = 0.03 + Math.random() * 0.08;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ===== Central "lock" structure — wireframe rings =====
    const ringGroup = new THREE.Group();
    const ringGeom1 = new THREE.TorusGeometry(3, 0.04, 8, 60);
    const ringGeom2 = new THREE.TorusGeometry(4, 0.03, 8, 80);
    const ringGeom3 = new THREE.TorusGeometry(5.5, 0.02, 8, 100);

    const ringMat = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.12,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.15,
    });

    const ring1 = new THREE.Mesh(ringGeom1, ringMat);
    const ring2 = new THREE.Mesh(ringGeom2, ringMat.clone());
    ring2.material.opacity = 0.08;
    ring2.material.color.set(0xa78bfa);
    ring2.material.emissive.set(0xa78bfa);
    ring2.rotation.x = Math.PI / 2;

    const ring3 = new THREE.Mesh(ringGeom3, ringMat.clone());
    ring3.material.opacity = 0.05;
    ring3.rotation.y = Math.PI / 3;

    ringGroup.add(ring1, ring2, ring3);
    ringGroup.position.z = -5;
    scene.add(ringGroup);

    // ===== Connection lines between nearby objects =====
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = 50;
    const linePositions = new Float32Array(maxConnections * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(connectionLines);

    // ===== Animation Loop =====
    const clock = new THREE.Clock();

    function updateConnections() {
        let lineIndex = 0;
        const positions = connectionLines.geometry.attributes.position.array;

        for (let i = 0; i < objects.length && lineIndex < maxConnections; i++) {
            for (let j = i + 1; j < objects.length && lineIndex < maxConnections; j++) {
                const dist = objects[i].mesh.position.distanceTo(objects[j].mesh.position);
                if (dist < 12) {
                    const idx = lineIndex * 6;
                    positions[idx]     = objects[i].mesh.position.x;
                    positions[idx + 1] = objects[i].mesh.position.y;
                    positions[idx + 2] = objects[i].mesh.position.z;
                    positions[idx + 3] = objects[j].mesh.position.x;
                    positions[idx + 4] = objects[j].mesh.position.y;
                    positions[idx + 5] = objects[j].mesh.position.z;
                    lineIndex++;
                }
            }
        }

        // Clear unused
        for (let i = lineIndex * 6; i < maxConnections * 6; i++) {
            positions[i] = 0;
        }

        connectionLines.geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Smooth mouse following for camera
        mouse.x += (mouse.targetX - mouse.x) * 0.03;
        mouse.y += (mouse.targetY - mouse.y) * 0.03;

        camera.position.x = mouse.x * 3;
        camera.position.y = -mouse.y * 2;
        camera.lookAt(0, 0, -5);

        // Animate lights
        mainLight.position.x = Math.sin(elapsed * 0.3) * 15;
        mainLight.position.y = Math.cos(elapsed * 0.2) * 10;
        secondaryLight.position.x = Math.cos(elapsed * 0.25) * 12;
        secondaryLight.position.y = Math.sin(elapsed * 0.35) * 8;

        // Animate objects
        objects.forEach(obj => {
            obj.mesh.rotation.x += obj.rotSpeed.x;
            obj.mesh.rotation.y += obj.rotSpeed.y;
            obj.mesh.rotation.z += obj.rotSpeed.z;
            obj.mesh.position.y = obj.initialY + Math.sin(elapsed * obj.floatSpeed) * obj.floatAmplitude;
        });

        // Slowly rotate particle field
        particles.rotation.y = elapsed * 0.015;
        particles.rotation.x = Math.sin(elapsed * 0.01) * 0.1;

        // Rotate ring structure
        ringGroup.rotation.z = elapsed * 0.08;
        ringGroup.rotation.x = Math.sin(elapsed * 0.12) * 0.3;
        ring2.rotation.z = elapsed * 0.15;
        ring3.rotation.x = elapsed * 0.05;

        // Update connection lines every few frames
        if (Math.floor(elapsed * 10) % 3 === 0) {
            updateConnections();
        }

        renderer.render(scene, camera);
    }

    animate();

    // ===== Resize =====
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ===== Reduced motion toggle =====
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
            renderer.dispose();
            container.innerHTML = '';
        }
    });

})();
