/**
 * =========================================================
 * APPLE WATCH SERIES 11 — PREMIUM 3D PRODUCT SHOWCASE
 * Strictly Vanilla JavaScript, WebGL / Three.js, and HTML5.
 * =========================================================
 */

import * as THREE from 'three';

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. FINISH & BAND DEFINITIONS
  --------------------------------------------------------- */
  const FINISHES = {
    natural: {
      name: 'Natural Titanium',
      caseColor: 0xd8d6d2,
      caseRoughness: 0.22,
      caseMetalness: 0.92,
      clearcoat: 0.5,
    },
    jetblack: {
      name: 'Jet Black',
      caseColor: 0x161619,
      caseRoughness: 0.12,
      caseMetalness: 0.98,
      clearcoat: 0.9,
    },
    slate: {
      name: 'Space Slate',
      caseColor: 0x484950,
      caseRoughness: 0.24,
      caseMetalness: 0.88,
      clearcoat: 0.45,
    },
    gold: {
      name: 'Gold Titanium',
      caseColor: 0xd6b797,
      caseRoughness: 0.2,
      caseMetalness: 0.92,
      clearcoat: 0.6,
    },
  };

  const BANDS = {
    midnight: { color: 0x18181f },
    desert: { color: 0x928b80 },
    navy: { color: 0x19273c },
    chalk: { color: 0xe6e6eb },
  };

  let currentFinish = FINISHES.natural;
  let currentBand = BANDS.midnight;

  /* ---------------------------------------------------------
     2. DYNAMIC OLED WATCH FACE CANVAS TEXTURE GENERATOR
  --------------------------------------------------------- */
  function safeRoundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }

  function createWatchFaceCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    drawWatchFace(canvas);
    return canvas;
  }

  function drawWatchFace(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds();
    const timeStr = `${hours}:${minutes}`;

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;

    // Pure OLED deep black background
    ctx.fillStyle = '#010103';
    ctx.fillRect(0, 0, width, height);

    // Subtle edge gradient for curved display boundary
    const edgeGradient = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.38,
      width / 2, height / 2, width * 0.52
    );
    edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edgeGradient.addColorStop(0.85, 'rgba(10, 10, 16, 0.4)');
    edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = edgeGradient;
    ctx.fillRect(0, 0, width, height);

    // 1. Status Bar (Top)
    ctx.save();
    // Battery readout
    ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
    ctx.fillStyle = '#30d158';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('84%', width - 180, 140);

    // Battery pill icon
    ctx.strokeStyle = '#30d158';
    ctx.lineWidth = 4;
    ctx.strokeRect(width - 165, 126, 48, 26);
    ctx.fillStyle = '#30d158';
    ctx.fillRect(width - 162, 129, 32, 20);
    ctx.fillRect(width - 116, 134, 4, 10);

    // Cellular connectivity dots (Top Left)
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(140 + i * 20, 140, 5, 0, Math.PI * 2);
      ctx.fillStyle = i < 3 ? '#ffffff' : 'rgba(255,255,255,0.25)';
      ctx.fill();
    }
    ctx.restore();

    // 2. Date
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 36px "Space Grotesk", -apple-system, sans-serif';
    ctx.fillStyle = '#ff453a';
    ctx.letterSpacing = '2px';
    ctx.fillText(dateStr, width / 2, 220);
    ctx.restore();

    // 3. Main Digital Time
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 184px "Space Grotesk", -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.28)';
    ctx.shadowBlur = 24;
    ctx.fillText(timeStr, width / 2, 380);
    ctx.restore();

    // Seconds ticker
    ctx.save();
    ctx.font = '400 30px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'center';
    ctx.fillText(`${seconds.toString().padStart(2, '0')}s`, width / 2, 430);
    ctx.restore();

    // 4. Apple Activity Rings (Move, Exercise, Stand)
    const ringCenterX = width / 2;
    const ringCenterY = 620;
    const ringConfigs = [
      { r: 140, progress: 0.78, color: '#ff2d55', bg: 'rgba(255, 45, 85, 0.18)' },
      { r: 106, progress: 0.88, color: '#a4ff00', bg: 'rgba(164, 255, 0, 0.18)' },
      { r: 72, progress: 0.62, color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.18)' },
    ];

    ringConfigs.forEach((ring) => {
      // Track
      ctx.beginPath();
      ctx.arc(ringCenterX, ringCenterY, ring.r, 0, Math.PI * 2);
      ctx.lineWidth = 24;
      ctx.strokeStyle = ring.bg;
      ctx.stroke();

      // Progress
      ctx.save();
      ctx.beginPath();
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * ring.progress;
      ctx.arc(ringCenterX, ringCenterY, ring.r, startAngle, endAngle);
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.strokeStyle = ring.color;
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    });

    // Ring Center Stat
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 24px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CAL', ringCenterX, ringCenterY - 6);
    ctx.font = '700 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ff2d55';
    ctx.fillText('540', ringCenterX, ringCenterY + 24);
    ctx.restore();

    // 5. Complications: Heart Rate & Weather
    // Left: Heart Rate
    ctx.save();
    const hrX = 220;
    const hrY = 860;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    safeRoundRect(ctx, hrX - 90, hrY - 45, 180, 90, 26);
    ctx.fill();

    ctx.fillStyle = '#ff375f';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('❤️', hrX - 70, hrY + 12);

    ctx.font = '700 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('68', hrX - 22, hrY + 4);
    ctx.font = '500 20px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('BPM', hrX - 22, hrY + 28);
    ctx.restore();

    // Right: Weather
    ctx.save();
    const wX = width - 220;
    const wY = 860;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    safeRoundRect(ctx, wX - 90, wY - 45, 180, 90, 26);
    ctx.fill();

    ctx.fillStyle = '#ffd60a';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('☀️', wX - 70, wY + 12);

    ctx.font = '700 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('72°', wX - 22, wY + 4);
    ctx.font = '500 20px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('SUNNY', wX - 22, wY + 28);
    ctx.restore();

    // 6. Curved Glass Glare Sheen
    const sheen = ctx.createLinearGradient(0, 0, width, height);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    sheen.addColorStop(0.35, 'rgba(255, 255, 255, 0.02)');
    sheen.addColorStop(0.65, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
  }

  /* ---------------------------------------------------------
     3. 3D GEOMETRY BUILDERS
  --------------------------------------------------------- */
  function createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    return shape;
  }

  function createCurvedBandGeometry(width, thickness, length, curveDirection) {
    const segmentsLength = 30;
    const segmentsWidth = 14;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const sign = curveDirection === 'top' ? 1 : -1;
    const radius = 3.2;

    for (let i = 0; i <= segmentsLength; i++) {
      const t = i / segmentsLength;
      const distanceAlong = t * length;
      const arcAngle = Math.pow(t, 1.25) * 1.05;
      const y = sign * (2.1 + distanceAlong * Math.cos(arcAngle * 0.4));
      const z = -Math.sin(arcAngle) * radius * 0.95 - t * 0.4;
      const currentWidth = width * (1.0 - t * 0.08);

      for (let j = 0; j <= segmentsWidth; j++) {
        const u = j / segmentsWidth;
        const x = (u - 0.5) * currentWidth;
        positions.push(x, y, z);
        normals.push(0, 0, 1);
        uvs.push(u, t);
      }
    }

    const rowSize = segmentsWidth + 1;
    for (let i = 0; i < segmentsLength; i++) {
      for (let j = 0; j < segmentsWidth; j++) {
        const a = i * rowSize + j;
        const b = (i + 1) * rowSize + j;
        const c = (i + 1) * rowSize + (j + 1);
        const d = i * rowSize + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  /* ---------------------------------------------------------
     4. WATCH VIEWER CLASS (MODULAR & MODEL-EXTENSIBLE)
  --------------------------------------------------------- */
  class WatchViewer {
    constructor(canvas, container) {
      this.canvas = canvas;
      this.container = container;

      // Interaction State
      this.isDragging = false;
      this.is360Mode = false;
      this.lastPointerX = 0;
      this.lastPointerY = 0;

      // Default Showcase Orientation: slightly angled to reveal front display & side profile/crown
      this.defaultRotation = { x: -0.05, y: 0.22 };
      this.targetRotation = { x: -0.05, y: 0.22 };
      this.currentRotation = { x: -0.05, y: 0.22 };

      this.initScene();
      this.initWatchModel();
      this.initShadow();
      this.initListeners();
      this.startLoop();
    }

    initScene() {
      let width = this.container.clientWidth;
      let height = this.container.clientHeight;
      if (!width || width <= 0) width = 420;
      if (!height || height <= 0) height = 525;

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 14.5);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      this.scene.add(ambientLight);

      // Key Light
      const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.6);
      keyLight.position.set(6, 8, 8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      this.scene.add(keyLight);

      // Fill Light
      const fillLight = new THREE.DirectionalLight(0xbad2ff, 1.4);
      fillLight.position.set(-6, 4, 6);
      this.scene.add(fillLight);

      // Sharp Titanium Rim Light
      const rimLight = new THREE.DirectionalLight(0xffffff, 2.8);
      rimLight.position.set(4, -4, -6);
      this.scene.add(rimLight);

      // Overhead Light
      const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
      topLight.position.set(0, 10, 0);
      this.scene.add(topLight);
    }

    initWatchModel() {
      this.watchGroup = new THREE.Group();

      // 1. Titanium Case
      const caseWidth = 3.3;
      const caseHeight = 4.1;
      const caseCornerRadius = 0.82;
      const caseDepth = 0.55;

      const caseShape = createRoundedRectShape(caseWidth, caseHeight, caseCornerRadius);
      const caseGeometry = new THREE.ExtrudeGeometry(caseShape, {
        depth: caseDepth,
        bevelEnabled: true,
        bevelSegments: 10,
        steps: 1,
        bevelSize: 0.18,
        bevelThickness: 0.18,
      });
      caseGeometry.center();

      this.caseMaterial = new THREE.MeshPhysicalMaterial({
        color: currentFinish.caseColor,
        metalness: currentFinish.caseMetalness,
        roughness: currentFinish.caseRoughness,
        clearcoat: currentFinish.clearcoat,
        clearcoatRoughness: 0.15,
        reflectivity: 0.85,
      });

      this.caseMesh = new THREE.Mesh(caseGeometry, this.caseMaterial);
      this.caseMesh.castShadow = true;
      this.caseMesh.receiveShadow = true;
      this.watchGroup.add(this.caseMesh);

      // 2. High-Res OLED Screen Texture
      this.screenCanvas = createWatchFaceCanvas();
      this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
      this.screenTexture.generateMipmaps = true;
      this.screenTexture.minFilter = THREE.LinearMipmapLinearFilter;
      this.screenTexture.magFilter = THREE.LinearFilter;

      const screenWidth = caseWidth * 0.95;
      const screenHeight = caseHeight * 0.95;
      const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
      const screenMaterial = new THREE.MeshBasicMaterial({
        map: this.screenTexture,
        toneMapped: false,
      });

      this.screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
      this.screenMesh.position.set(0, 0, caseDepth / 2 + 0.181);
      this.watchGroup.add(this.screenMesh);

      // 3. Curved Sapphire Crystal Front Glass
      const glassShape = createRoundedRectShape(caseWidth * 0.96, caseHeight * 0.96, caseCornerRadius * 0.95);
      const glassGeometry = new THREE.ExtrudeGeometry(glassShape, {
        depth: 0.04,
        bevelEnabled: true,
        bevelSegments: 6,
        bevelSize: 0.1,
        bevelThickness: 0.08,
      });
      glassGeometry.center();

      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.32,
        roughness: 0.02,
        metalness: 0.05,
        transmission: 0.85,
        ior: 1.77,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.95,
      });

      this.glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
      this.glassMesh.position.set(0, 0, caseDepth / 2 + 0.22);
      this.watchGroup.add(this.glassMesh);

      // 4. Digital Crown (Milled Titanium Dial + Red Cellular Accent)
      const crownRadius = 0.36;
      const crownLength = 0.32;
      const crownGeometry = new THREE.CylinderGeometry(crownRadius, crownRadius, crownLength, 32);

      this.crownMaterial = new THREE.MeshPhysicalMaterial({
        color: currentFinish.caseColor,
        metalness: currentFinish.caseMetalness,
        roughness: 0.25,
        clearcoat: 0.4,
      });

      this.crownMesh = new THREE.Mesh(crownGeometry, this.crownMaterial);
      this.crownMesh.rotation.z = Math.PI / 2;
      this.crownMesh.position.set(caseWidth / 2 + 0.26, 0.85, 0.02);
      this.crownMesh.castShadow = true;
      this.watchGroup.add(this.crownMesh);

      // Red Accent Ring on Crown
      const accentGeometry = new THREE.CylinderGeometry(crownRadius * 0.84, crownRadius * 0.84, 0.02, 32);
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0xd62828,
        roughness: 0.3,
        metalness: 0.4,
      });
      const accentMesh = new THREE.Mesh(accentGeometry, accentMaterial);
      accentMesh.rotation.z = Math.PI / 2;
      accentMesh.position.set(caseWidth / 2 + 0.42, 0.85, 0.02);
      this.watchGroup.add(accentMesh);

      // 5. Side Button (Flush Pill Capsule)
      const sideButtonGeometry = new THREE.BoxGeometry(0.12, 0.92, 0.28);
      this.sideButtonMaterial = new THREE.MeshPhysicalMaterial({
        color: currentFinish.caseColor,
        metalness: currentFinish.caseMetalness,
        roughness: 0.2,
        clearcoat: 0.5,
      });
      this.sideButtonMesh = new THREE.Mesh(sideButtonGeometry, this.sideButtonMaterial);
      this.sideButtonMesh.position.set(caseWidth / 2 + 0.2, -0.68, 0.02);
      this.watchGroup.add(this.sideButtonMesh);

      // Microphone pinhole
      const micGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12);
      const micMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const micMesh = new THREE.Mesh(micGeometry, micMaterial);
      micMesh.rotation.z = Math.PI / 2;
      micMesh.position.set(caseWidth / 2 + 0.18, 0.15, 0.02);
      this.watchGroup.add(micMesh);

      // Speaker grills on left flank
      for (let s = -1; s <= 1; s += 2) {
        const speakerGeom = new THREE.BoxGeometry(0.05, 0.4, 0.08);
        const speakerMesh = new THREE.Mesh(speakerGeom, micMaterial);
        speakerMesh.position.set(-caseWidth / 2 - 0.18, s * 0.35, 0.02);
        this.watchGroup.add(speakerMesh);
      }

      // 6. Ceramic Sensor Cluster on Back
      const backRingGeom = new THREE.CylinderGeometry(1.22, 1.22, 0.08, 36);
      const backRingMat = new THREE.MeshPhysicalMaterial({
        color: 0x18181b,
        metalness: 0.15,
        roughness: 0.12,
        clearcoat: 0.9,
      });
      const backRingMesh = new THREE.Mesh(backRingGeom, backRingMat);
      backRingMesh.rotation.x = Math.PI / 2;
      backRingMesh.position.set(0, 0, -caseDepth / 2 - 0.18);
      this.watchGroup.add(backRingMesh);

      // 4 Optical Diodes
      for (let d = 0; d < 4; d++) {
        const angle = (d * Math.PI) / 2;
        const diodeGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
        const isGreen = d % 2 === 0;
        const diodeMat = new THREE.MeshStandardMaterial({
          color: isGreen ? 0x00ff66 : 0xff3344,
          emissive: isGreen ? 0x00aa33 : 0xaa1122,
          emissiveIntensity: 0.4,
          roughness: 0.2,
        });
        const diodeMesh = new THREE.Mesh(diodeGeom, diodeMat);
        diodeMesh.rotation.x = Math.PI / 2;
        diodeMesh.position.set(
          Math.cos(angle) * 0.58,
          Math.sin(angle) * 0.58,
          -caseDepth / 2 - 0.22
        );
        this.watchGroup.add(diodeMesh);
      }

      // 7. Sport Strap (Curved Fluoroelastomer Band)
      const bandWidth = 2.45;
      const bandThickness = 0.14;
      const bandLength = 3.6;

      const topBandGeom = createCurvedBandGeometry(bandWidth, bandThickness, bandLength, 'top');
      const bottomBandGeom = createCurvedBandGeometry(bandWidth, bandThickness, bandLength, 'bottom');

      this.bandMaterial = new THREE.MeshStandardMaterial({
        color: currentBand.color,
        roughness: 0.68,
        metalness: 0.04,
        side: THREE.DoubleSide,
      });

      this.topBandMesh = new THREE.Mesh(topBandGeom, this.bandMaterial);
      this.topBandMesh.castShadow = true;
      this.watchGroup.add(this.topBandMesh);

      this.bottomBandMesh = new THREE.Mesh(bottomBandGeom, this.bandMaterial);
      this.bottomBandMesh.castShadow = true;
      this.watchGroup.add(this.bottomBandMesh);

      // Band titanium fastener stud
      const pinGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24);
      this.pinMat = new THREE.MeshStandardMaterial({
        color: currentFinish.caseColor,
        metalness: 0.9,
        roughness: 0.2,
      });
      const pinMesh = new THREE.Mesh(pinGeom, this.pinMat);
      pinMesh.position.set(0, -3.8, -1.2);
      pinMesh.rotation.x = 0.4;
      this.watchGroup.add(pinMesh);

      // Setup position and default orientation
      this.watchGroup.position.set(0, 0.15, 0);
      this.watchGroup.rotation.set(this.defaultRotation.x, this.defaultRotation.y, 0);
      this.scene.add(this.watchGroup);
    }

    initShadow() {
      // Soft procedural contact ground shadow
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const sCtx = shadowCanvas.getContext('2d');
      if (sCtx) {
        const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.32)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 256, 256);
      }

      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      this.shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });

      const shadowGeo = new THREE.PlaneGeometry(7.5, 3.2);
      this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
      this.shadowMesh.rotation.x = -Math.PI / 2;
      this.shadowMesh.position.set(0, -4.6, 0);
      this.scene.add(this.shadowMesh);
    }

    /**
     * Extensibility method: enables replacing procedural 3D model with external GLTF/GLB
     */
    loadExternalModel(url) {
      console.log(`[WatchViewer] Model loader ready for asset: ${url}`);
    }

    setFinish(finishKey) {
      const finish = FINISHES[finishKey];
      if (!finish) return;
      currentFinish = finish;

      this.caseMaterial.color.setHex(finish.caseColor);
      this.caseMaterial.metalness = finish.caseMetalness;
      this.caseMaterial.roughness = finish.caseRoughness;
      this.caseMaterial.clearcoat = finish.clearcoat;
      this.crownMaterial.color.setHex(finish.caseColor);
      this.sideButtonMaterial.color.setHex(finish.caseColor);
      this.pinMat.color.setHex(finish.caseColor);
    }

    setBand(bandKey) {
      const band = BANDS[bandKey];
      if (!band) return;
      currentBand = band;
      this.bandMaterial.color.setHex(band.color);
    }

    resetOrientation() {
      this.targetRotation = { ...this.defaultRotation };
    }

    toggle360Mode() {
      this.is360Mode = !this.is360Mode;
      return this.is360Mode;
    }

    initListeners() {
      // 1. Natural Cursor-Based 3D Tilt Interaction
      const onPointerMove = (e) => {
        const rect = this.container.getBoundingClientRect();

        if (this.isDragging) {
          const deltaX = e.clientX - this.lastPointerX;
          const deltaY = e.clientY - this.lastPointerY;

          this.targetRotation.y += deltaX * 0.012;
          this.targetRotation.x += deltaY * 0.01;
          this.targetRotation.x = Math.max(-1.1, Math.min(1.1, this.targetRotation.x));

          this.lastPointerX = e.clientX;
          this.lastPointerY = e.clientY;
        } else {
          // Normalized cursor coordinates [-1, 1]
          const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;

          // Subtle physical tilt range (smooth and natural, never snapping)
          const maxTiltX = 0.26; // ~15 deg
          const maxTiltY = 0.34; // ~19 deg

          this.targetRotation.x = this.defaultRotation.x - py * maxTiltX;
          this.targetRotation.y = this.defaultRotation.y + px * maxTiltY;
        }
      };

      const onPointerDown = (e) => {
        this.isDragging = true;
        this.container.classList.add('grabbing');
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        if (this.container.setPointerCapture) {
          this.container.setPointerCapture(e.pointerId);
        }
      };

      const onPointerUp = (e) => {
        this.isDragging = false;
        this.container.classList.remove('grabbing');
        if (this.container.releasePointerCapture) {
          try {
            this.container.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
        if (!this.is360Mode) {
          this.resetOrientation();
        }
      };

      const onPointerLeave = () => {
        if (!this.isDragging && !this.is360Mode) {
          this.resetOrientation();
        }
      };

      this.container.addEventListener('pointermove', onPointerMove);
      this.container.addEventListener('pointerdown', onPointerDown);
      this.container.addEventListener('pointerup', onPointerUp);
      this.container.addEventListener('pointerleave', onPointerLeave);

      // 2. Responsive Resize
      const resize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (!width || !height || width <= 0 || height <= 0) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      };

      window.addEventListener('resize', resize);
      if ('ResizeObserver' in window) {
        new ResizeObserver(resize).observe(this.container);
      }

      // Initial synchronization sweeps after paint/reflow
      requestAnimationFrame(resize);
      setTimeout(resize, 60);
      setTimeout(resize, 200);
      setTimeout(resize, 500);

      // 3. Live Watch Face Time Tick
      setInterval(() => {
        if (this.screenCanvas && this.screenTexture) {
          drawWatchFace(this.screenCanvas);
          this.screenTexture.needsUpdate = true;
        }
      }, 1000);
    }

    startLoop() {
      const clock = new THREE.Clock();

      const lerp = (start, end, factor) => start + (end - start) * factor;

      const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth physical damping (eases rotation towards target)
        const smoothFactor = this.isDragging ? 0.18 : 0.07;
        this.currentRotation.x = lerp(this.currentRotation.x, this.targetRotation.x, smoothFactor);
        this.currentRotation.y = lerp(this.currentRotation.y, this.targetRotation.y, smoothFactor);

        // Subtle floating breathing oscillation
        const floatY = Math.sin(elapsedTime * 1.8) * 0.14;
        const floatTilt = Math.cos(elapsedTime * 1.4) * 0.02;

        this.watchGroup.position.y = 0.15 + floatY;
        this.watchGroup.rotation.x = this.currentRotation.x + floatTilt;
        this.watchGroup.rotation.y = this.currentRotation.y;

        // Shadow breathes in sync with height
        const shadowScale = 1.0 - floatY * 0.4;
        this.shadowMesh.scale.set(shadowScale, shadowScale, 1);
        this.shadowMat.opacity = 0.75 - floatY * 0.3;

        this.renderer.render(this.scene, this.camera);
      };

      animate();
    }
  }

  /* ---------------------------------------------------------
     5. EXPLODED VIEW SHOWCASE: 12-SYSTEM INTERNAL ARCHITECTURE
  --------------------------------------------------------- */
  const EXPLODED_COMPONENTS = {
    'sapphire-glass': {
      id: 'sapphire-glass',
      layer: 'Layer 01 of 12',
      name: 'Front Sapphire Crystal Glass',
      subtitle: 'Curved Display Boundary & Surface Shield',
      category: 'Ceramics & Glass',
      categoryClass: 'mat-ceramics',
      material: 'Pure Sapphire Crystal (Al₂O₃)',
      property: 'Mohs 9 Hardness · Diamond Polished',
      precision: '±0.5 µm CNC Atomic Polish',
      axis: 'Front Face (+Z = 4.8)',
      what: 'A custom precision-formed diamond-polished sapphire crystal lens, engineered with atomic-scale curvature that cascades seamlessly into the titanium midframe.',
      function: 'Guards the LTPO OLED display with Mohs-9 scratch resistance, while custom anti-reflective vacuum coatings maximize optical clarity even under direct harsh sunlight.',
      role: 'Enables edge-to-edge glanceability at extreme viewing angles while maintaining 50-meter ISO water resistance and extreme durability during high-impact sports.',
      assembledZ: 0.95,
      explodedZ: 4.8,
      hotspotOffset: { x: 0, y: 1.5, z: 4.8 },
    },
    'oled-display': {
      id: 'oled-display',
      layer: 'Layer 02 of 12',
      name: 'Wide-Angle LTPO3 OLED Display',
      subtitle: 'Always-On Flexible Light-Emitting Pixel Array',
      category: 'Semiconductors & Electronics',
      categoryClass: 'mat-semiconductors',
      material: 'LTPO OLED, Indium Tin Oxide (ITO), Polyimide',
      property: '1Hz to 60Hz Variable Refresh · Up to 2,000 Nits',
      precision: 'Sub-Pixel 1.2 µm Lithography',
      axis: 'Display Substrate (+Z = 3.6)',
      what: 'An ultra-thin flexible LTPO OLED panel featuring individually controlled sub-pixels and integrated high-precision capacitive touch sensors.',
      function: 'Scales refresh rate down to 1Hz in Always-On standby to conserve power, and surges to 60Hz with 2,000 nits peak brightness for fluid UI animations.',
      role: 'Serves as the primary visual interface, delivering up to 40% wider viewing angles for instant glanceability of vital health signs and notifications.',
      assembledZ: 0.88,
      explodedZ: 3.6,
      hotspotOffset: { x: -1.7, y: 1.1, z: 3.6 },
    },
    'thermal-shield': {
      id: 'thermal-shield',
      layer: 'Layer 03 of 12',
      name: 'Display Backing & Thermal Shield',
      subtitle: 'Multi-Layer Graphite & Polyimide Heat Diffuser',
      category: 'Plastics & Polymers',
      categoryClass: 'mat-polymers',
      material: 'Polyimide (PI), Pyrolytic Graphite & Silicone Adhesive',
      property: 'High Thermal Conductivity · EMI Interference Shield',
      precision: '25 µm Pyrolytic Graphite Layering',
      axis: 'Thermal Substrate (+Z = 2.5)',
      what: 'A multi-layered structural membrane combining flexible polyimide dielectric insulation, high-conductivity pyrolytic graphite foil, and pressure-sensitive silicone sealants.',
      function: 'Rapidly conducts heat generated by high-nits display LEDs away from the battery and processor into the titanium case for passive cooling.',
      role: 'Prevents thermal throttling during extended GPS outdoor workouts and cellular calls while providing acoustic dampening and airtight ingress sealing.',
      assembledZ: 0.75,
      explodedZ: 2.5,
      hotspotOffset: { x: 1.7, y: 0.9, z: 2.5 },
    },
    's11-sip': {
      id: 's11-sip',
      layer: 'Layer 04 of 12',
      name: 'Apple S11 SiP (System in Package)',
      subtitle: 'Integrated 64-Bit Compute Core & Neural Engine',
      category: 'Semiconductors & Electronics',
      categoryClass: 'mat-semiconductors',
      material: 'Silicon, Ceramic, Copper, Gold Bonding, High-Density Substrate',
      property: 'Dual-Core 64-Bit CPU · 4-Core Neural Engine',
      precision: 'TSMC 3nm Node (<0.1 µm FinFET Gate)',
      axis: 'Motherboard Stack (+Z = 1.4)',
      what: 'A hermetically sealed System-in-Package consolidating the dual-core 64-bit application processor, GPU, memory, power management IC, and 4-core Neural Engine into a single silicon module.',
      function: 'Executes billions of operations per second on-device, processing complex biometric algorithms, crash detection sensors, and machine learning models in real time.',
      role: 'Delivers instantaneous Siri voice processing and proactive health insights while sipping minimal power to guarantee all-day 18-hour endurance.',
      assembledZ: 0.5,
      explodedZ: 1.4,
      hotspotOffset: { x: -1.6, y: 0.2, z: 1.4 },
    },
    'battery-cell': {
      id: 'battery-cell',
      layer: 'Layer 05 of 12',
      name: 'Rechargeable Lithium-Ion Battery',
      subtitle: 'High-Density Energy Storage with Fast Charge',
      category: 'Other (Energy Storage)',
      categoryClass: 'mat-other',
      material: 'Lithium Cobalt Oxide (Cathode), Graphite (Anode), Aluminum Enclosure',
      property: '309 mAh Capacity · 3.82V Nominal · 80% in 30 Min',
      precision: '±5.0 µm Laser Foil Ultrasonic Weld',
      axis: 'Right Internal Cavity (X = +1.1, Z = +0.6)',
      what: 'A custom-shaped high-energy-density lithium-ion pouch cell engineered with micro-welded foil tabs and an integrated fuel-gauge controller board.',
      function: 'Stores electrical energy safely and discharges consistent current across extreme temperatures from -20°C to 55°C without voltage sag.',
      role: 'Powers the entire watch for 18 hours of normal usage (or up to 36 hours in Low Power Mode), supporting fast charging to 80% in approximately 30 minutes.',
      assembledZ: 0.22,
      explodedZ: 0.6,
      hotspotOffset: { x: 1.6, y: -0.7, z: 0.6 },
    },
    'taptic-engine': {
      id: 'taptic-engine',
      layer: 'Layer 06 of 12',
      name: 'Taptic Engine Haptic Actuator',
      subtitle: 'Linear Resonant Magnetic Tactile Generator',
      category: 'Metals & Other',
      categoryClass: 'mat-metals',
      material: 'Stainless Steel Enclosure (316L), Neodymium Magnet (NdFeB), Copper Coil',
      property: 'Linear Resonant Actuator · Sub-Millisecond Response',
      precision: '±2.0 µm Micro-Spring Suspension',
      axis: 'Left Internal Cavity (X = -1.1, Z = +0.6)',
      what: 'A precision linear resonant actuator containing an oscillating magnetic mass suspended on micromachined springs inside a hermetic stainless steel shell.',
      function: 'Creates discrete, nuanced tactile haptic sensations that mimic mechanical button clicks, notification taps, heartbeat pulses, and Digital Crown detents.',
      role: 'Provides intuitive non-visual sensory feedback, making interactions feel physical and natural without making audible noise.',
      assembledZ: 0.22,
      explodedZ: 0.6,
      hotspotOffset: { x: -1.6, y: -0.7, z: 0.6 },
    },
    'titanium-case': {
      id: 'titanium-case',
      layer: 'Layer 07 of 12',
      name: 'Grade 5 Aerospace Titanium Case',
      subtitle: 'Precision-Milled Structural Enclosure',
      category: 'Metals',
      categoryClass: 'mat-metals',
      material: 'Aerospace-Grade Grade 5 Titanium Alloy (Ti-6Al-4V)',
      property: 'Extreme Tensile Strength · Mirror-Polished Finish',
      precision: '±0.8 µm 5-Axis CNC Precision Datum',
      axis: 'Central Datum (Z = 0.0)',
      what: 'A single block of aerospace titanium forged, CNC-machined, and hand-buffed to a mirror sheen with precision internal antenna channels and gasket grooves.',
      function: 'Houses and aligns every internal electronic module while protecting sensitive components from crushing forces, torsion, and drops.',
      role: 'Delivers remarkable structural rigidity while shaving 10% off total watch weight, forming an impermeable 50m water-resistant chassis.',
      assembledZ: 0.0,
      explodedZ: 0.0,
      hotspotOffset: { x: 0, y: -1.7, z: 0.0 },
    },
    'digital-crown': {
      id: 'digital-crown',
      layer: 'Layer 08 of 12',
      name: 'Digital Crown & Side Button',
      subtitle: 'Infrared Optical Navigation & ECG Electrode',
      category: 'Metals & Ceramics',
      categoryClass: 'mat-metals',
      material: 'Grade 5 Titanium, Optical Encoder Rotor, Ceramic Top Ring',
      property: 'Infrared Optical Sensing · Tactile Feedback Switch',
      precision: '1.5 µm Optical Rotor Grating Pitch',
      axis: 'Right Flank (X = +3.4, Y = +0.65)',
      what: 'An intricately knurled rotary input dial with an optical rotation encoder, alongside a flush-mounted titanium power and action switch.',
      function: 'Detects minute rotational movements down to the pixel level and provides an integrated titanium electrode for taking real-time ECG recordings.',
      role: 'Enables precise scrolling, zoom, and app navigation without covering the display with your fingers, plus fingertip ECG readings.',
      assembledZ: 0.0,
      explodedZ: 0.0,
      hotspotOffset: { x: 3.2, y: 0.9, z: 0.0 },
    },
    'speaker-mic': {
      id: 'speaker-mic',
      layer: 'Layer 09 of 12',
      name: 'Acoustic Speaker & Water-Eject System',
      subtitle: 'Micro-Transducer & Directional MEMS Microphones',
      category: 'Metals & Polymers',
      categoryClass: 'mat-metals',
      material: 'Neodymium Magnet, Copper Voice Coil, Stainless Steel Grill, MEMS Silicon',
      property: 'Sonic Pulse Water Ejection · Dual Beamforming Mics',
      precision: '10 µm Laser-Micro-Perforated Mesh',
      axis: 'Left Flank (X = -3.2, Y = 0.0)',
      what: 'A micro-acoustic speaker transducer paired with dual directional MEMS microphones and acoustic hydrophobic mesh membranes.',
      function: 'Emits clear voice audio for phone calls and Siri, records crystal-clear speech with noise cancellation, and plays a low-frequency sound tone to expel trapped water.',
      role: 'Enables wrist-based phone calls, voice memos, and immediate speaker water clearing after swimming or showers.',
      assembledZ: 0.0,
      explodedZ: 0.0,
      hotspotOffset: { x: -3.2, y: 0.2, z: 0.0 },
    },
    'charging-coil': {
      id: 'charging-coil',
      layer: 'Layer 10 of 12',
      name: 'Magnetic Inductive Fast-Charging Coil',
      subtitle: 'Wireless Power Transfer & MagSafe Array',
      category: 'Metals & Polymers',
      categoryClass: 'mat-metals',
      material: 'High-Purity Oxygen-Free Copper Wire, Ferrite Backplate, Polyimide Shield',
      property: 'Inductive Magnetic Fast Charging · Qi / MagSafe Standard',
      precision: '15 µm High-Purity Copper Wire Pitch',
      axis: 'Rear Inductive Stack (Z = -1.6)',
      what: 'A planar spiral coil of ultra-fine copper wire wound around a high-permeability magnetic ferrite shield.',
      function: 'Receives electromagnetic energy from magnetic charging pucks and converts it to DC electrical current to recharge the Li-ion battery wirelessly.',
      role: 'Enables cable-free charging with snap-to-align magnetic positioning and high-efficiency thermal management.',
      assembledZ: -0.4,
      explodedZ: -1.6,
      hotspotOffset: { x: 1.6, y: -0.4, z: -1.6 },
    },
    'biometric-sensors': {
      id: 'biometric-sensors',
      layer: 'Layer 11 of 12',
      name: 'Photoplethysmography (PPG) Optical Sensor',
      subtitle: 'Dual-Wavelength Diode Cluster & Bio-Sensors',
      category: 'Semiconductors & Ceramics',
      categoryClass: 'mat-semiconductors',
      material: 'Sapphire Glass Lenses, PVD Stainless Steel Ring, GaAs Green/Red/IR LEDs',
      property: 'Optical Heart Rate · Blood Oxygen (SpO₂) · ECG Crystal',
      precision: '0.8 µm Optical Window Coplanarity',
      axis: 'Optical Sensor Core (Z = -3.1)',
      what: 'An optical sensor array combining 4 pairs of green, red, and infrared light-emitting diodes with sensitive photodiode light receivers.',
      function: 'Flashes LEDs hundreds of times per second through the skin to measure blood flow volume, calculating heart rate, heart rate variability, and blood oxygen saturation.',
      role: 'Delivers life-saving background vitals tracking, high/low heart rate notifications, and advanced sleep apnea detection.',
      assembledZ: -0.7,
      explodedZ: -3.1,
      hotspotOffset: { x: -1.6, y: -0.5, z: -3.1 },
    },
    'ceramic-back': {
      id: 'ceramic-back',
      layer: 'Layer 12 of 12',
      name: 'Zirconia Ceramic Back Cover',
      subtitle: 'Skin-Contact Plate & Antenna Window',
      category: 'Ceramics & Glass',
      categoryClass: 'mat-ceramics',
      material: 'Zirconium Oxide (ZrO₂) Ceramic & Pure Sapphire Crystal Windows',
      property: 'Biocompatible · RF-Transparent · Hypoallergenic',
      precision: '±1.0 µm Zirconia Sintering Profile',
      axis: 'Rear Enclosure Base (Z = -4.5)',
      what: 'A dense, polished zirconia ceramic plate with laser-drilled optical windows sealed with sapphire crystal and fine regulatory typography.',
      function: 'Creates an ultra-smooth, hypoallergenic contact surface against the user\'s wrist while remaining 100% transparent to radio frequencies (cellular, GPS, NFC) and magnetic flux.',
      role: 'Ensures skin comfort during 24/7 wear, guarantees optimal wireless signal transmission, and completes the rear hermetic water seal.',
      assembledZ: -0.92,
      explodedZ: -4.5,
      hotspotOffset: { x: 0, y: -1.5, z: -4.5 },
    },
  };

  /**
   * ExplodedWatchViewer
   * Independent, highly interactive 3D WebGL laboratory for Series 11 exploded architecture.
   */
  class ExplodedWatchViewer {
    constructor(canvas, stage) {
      this.canvas = canvas;
      this.stage = stage;
      this.hotspotsContainer = document.getElementById('explodedHotspots');

      this.isExploded = false;
      this.explosionProgress = 0.0;
      this.targetProgress = 0.0;
      this.selectedComponentId = 'sapphire-glass';

      // Drag / Orbit state
      this.isDragging = false;
      this.previousMousePos = { x: 0, y: 0 };
      this.targetRotation = { x: 0.15, y: -0.35 };
      this.currentRotation = { x: 0.15, y: -0.35 };
      this.defaultAssembledRotation = { x: 0.12, y: -0.25 };
      this.defaultExplodedRotation = { x: 0.26, y: -0.68 };

      // Component registry
      this.components = [];
      this.componentMap = new Map();
      this.hotspotElements = new Map();

      this.raycaster = new THREE.Raycaster();
      this.mouseCoords = new THREE.Vector2();

      this.isVisible = true;

      this.initScene();
      this.initLighting();
      this.buildExplodedModel();
      this.initHotspotsDOM();
      this.initPartsRailDOM();
      this.initEvents();
      this.initIntersectionObserver();
      this.setExploded(false);
      this.selectComponent('sapphire-glass');
      this.startRenderLoop();
    }

    initScene() {
      this.scene = new THREE.Scene();

      const rect = this.stage.getBoundingClientRect();
      const width = rect.width || 600;
      const height = rect.height || 620;

      this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 14.5);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });

      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      // Master 3D container group
      this.mainGroup = new THREE.Group();
      this.scene.add(this.mainGroup);
    }

    initLighting() {
      // 1. Balanced ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      this.scene.add(ambientLight);

      // 2. Crisp Key Studio Light
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(8, 12, 14);
      this.scene.add(keyLight);

      // 3. Blue Tech Rim Light (for edge separation of components)
      const rimLight = new THREE.DirectionalLight(0x70b4ff, 2.2);
      rimLight.position.set(-10, 6, -8);
      this.scene.add(rimLight);

      // 4. Soft Warm Fill Light
      const fillLight = new THREE.DirectionalLight(0xffeedd, 1.6);
      fillLight.position.set(6, -8, 8);
      this.scene.add(fillLight);

      // 5. Specular highlight light for sapphire and polished titanium
      const specLight = new THREE.PointLight(0xffffff, 2.0, 30);
      specLight.position.set(0, 10, 6);
      this.scene.add(specLight);
    }

    buildExplodedModel() {
      // Watch face texture canvas
      this.oledCanvas = createWatchFaceCanvas();
      this.oledTexture = new THREE.CanvasTexture(this.oledCanvas);
      this.oledTexture.colorSpace = THREE.SRGBColorSpace;

      // 1. Front Sapphire Crystal Glass
      const glassShape = this.createWatchShape(3.9, 4.7, 1.15);
      const glassGeo = new THREE.ExtrudeGeometry(glassShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.08,
        bevelThickness: 0.08,
      });
      glassGeo.center();

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.04,
        transparent: true,
        opacity: 0.42,
        depthWrite: false, // Prevents depth-buffer clipping of simulated exploded parts behind it!
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.85,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      this.registerComponent('sapphire-glass', glassMesh, { z: 0.95 }, { z: 4.8 });

      // 2. Wide-Angle LTPO3 OLED Display
      const oledShape = this.createWatchShape(3.7, 4.5, 1.05);
      const oledGeo = new THREE.ShapeGeometry(oledShape, 24);
      oledGeo.center();

      // UV map adjustment for watch face
      const pos = oledGeo.attributes.position;
      const uvs = [];
      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getX(i) + 1.85) / 3.7;
        const v = (pos.getY(i) + 2.25) / 4.5;
        uvs.push(u, v);
      }
      oledGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

      const oledMat = new THREE.MeshStandardMaterial({
        map: this.oledTexture,
        emissiveMap: this.oledTexture,
        emissive: 0xffffff,
        emissiveIntensity: 0.4,
        roughness: 0.15,
        metalness: 0.05,
      });
      const oledMesh = new THREE.Mesh(oledGeo, oledMat);
      this.registerComponent('oled-display', oledMesh, { z: 0.88 }, { z: 3.6 });

      // 3. Display Backing & Thermal Shield
      const shieldGroup = new THREE.Group();
      const shieldShape = this.createWatchShape(3.6, 4.4, 0.95);
      const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.05,
        bevelEnabled: false,
      });
      shieldGeo.center();
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x8a5a2b, // Polyimide amber flex
        metalness: 0.35,
        roughness: 0.5,
      });
      const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
      shieldGroup.add(shieldMesh);

      // Central pyrolytic graphite thermal pad
      const padGeo = new THREE.BoxGeometry(2.4, 3.0, 0.03);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x1f2124, // Graphite sheet
        metalness: 0.8,
        roughness: 0.35,
      });
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.z = 0.03;
      shieldGroup.add(padMesh);

      // Flexible printed circuit (FPC) copper ribbon connector
      const ribbonGeo = new THREE.BoxGeometry(0.8, 1.2, 0.02);
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0xd9822b,
        metalness: 0.85,
        roughness: 0.25,
      });
      const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbonMesh.position.set(0, -2.1, 0.03);
      shieldGroup.add(ribbonMesh);

      this.registerComponent('thermal-shield', shieldGroup, { z: 0.75 }, { z: 2.5 });

      // 4. Apple S11 SiP (System in Package)
      const sipGroup = new THREE.Group();
      // Main PCB Substrate
      const pcbGeo = new THREE.BoxGeometry(3.3, 3.8, 0.1);
      const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x12171c, // High density black FR4 substrate
        metalness: 0.3,
        roughness: 0.7,
      });
      const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
      sipGroup.add(pcbMesh);

      // S11 SiP Central Processing Unit Cap
      const s11ChipGeo = new THREE.BoxGeometry(1.8, 1.8, 0.12);
      const s11ChipMat = new THREE.MeshStandardMaterial({
        color: 0x22242a,
        metalness: 0.85,
        roughness: 0.25,
      });
      const s11ChipMesh = new THREE.Mesh(s11ChipGeo, s11ChipMat);
      s11ChipMesh.position.set(0, 0.25, 0.08);
      sipGroup.add(s11ChipMesh);

      // S11 Chip Etched Logo Top
      const chipCanvas = document.createElement('canvas');
      chipCanvas.width = 256;
      chipCanvas.height = 256;
      const chipCtx = chipCanvas.getContext('2d');
      chipCtx.fillStyle = '#1c1e24';
      chipCtx.fillRect(0, 0, 256, 256);
      chipCtx.strokeStyle = 'rgba(255,255,255,0.3)';
      chipCtx.lineWidth = 6;
      chipCtx.strokeRect(10, 10, 236, 236);
      chipCtx.fillStyle = '#ffffff';
      chipCtx.font = 'bold 58px -apple-system, sans-serif';
      chipCtx.textAlign = 'center';
      chipCtx.textBaseline = 'middle';
      chipCtx.fillText('S11', 128, 118);
      chipCtx.font = '500 24px -apple-system, sans-serif';
      chipCtx.fillStyle = '#9aa0a6';
      chipCtx.fillText('APPLE SiP', 128, 172);

      const chipTopTexture = new THREE.CanvasTexture(chipCanvas);
      const chipTopGeo = new THREE.PlaneGeometry(1.7, 1.7);
      const chipTopMat = new THREE.MeshStandardMaterial({
        map: chipTopTexture,
        roughness: 0.3,
        metalness: 0.5,
      });
      const chipTopMesh = new THREE.Mesh(chipTopGeo, chipTopMat);
      chipTopMesh.position.set(0, 0.25, 0.15);
      sipGroup.add(chipTopMesh);

      // Micro surface mount components (SMD capacitors)
      const smdGeo = new THREE.BoxGeometry(0.18, 0.1, 0.06);
      const smdMat = new THREE.MeshStandardMaterial({
        color: 0x98733c,
        metalness: 0.9,
        roughness: 0.2,
      });
      for (let c = 0; c < 12; c++) {
        const m = new THREE.Mesh(smdGeo, smdMat);
        const ang = (c / 12) * Math.PI * 2;
        m.position.set(Math.cos(ang) * 1.3, Math.sin(ang) * 1.3 + 0.2, 0.08);
        sipGroup.add(m);
      }

      this.registerComponent('s11-sip', sipGroup, { z: 0.5 }, { z: 1.4 });

      // 5. Rechargeable Li-Ion Battery Cell
      const battGroup = new THREE.Group();
      const battGeo = new THREE.BoxGeometry(1.4, 2.2, 0.38);
      const battMat = new THREE.MeshStandardMaterial({
        color: 0xc8cdd2, // Brushed aluminum pouch
        metalness: 0.88,
        roughness: 0.32,
      });
      const battMesh = new THREE.Mesh(battGeo, battMat);
      battGroup.add(battMesh);

      // Battery label
      const battCanvas = document.createElement('canvas');
      battCanvas.width = 256;
      battCanvas.height = 256;
      const bCtx = battCanvas.getContext('2d');
      bCtx.fillStyle = '#b8bec4';
      bCtx.fillRect(0, 0, 256, 256);
      bCtx.fillStyle = '#111111';
      bCtx.font = 'bold 24px -apple-system, sans-serif';
      bCtx.textAlign = 'center';
      bCtx.fillText('APPLE INC.', 128, 60);
      bCtx.font = '500 20px -apple-system, sans-serif';
      bCtx.fillText('309 mAh · 3.82V', 128, 105);
      bCtx.fillText('1.18 Wh · Li-Ion', 128, 140);
      bCtx.fillStyle = '#d93829';
      bCtx.font = 'bold 18px -apple-system, sans-serif';
      bCtx.fillText('WARNING: RECHARGEABLE', 128, 190);

      const battLabelTex = new THREE.CanvasTexture(battCanvas);
      const labelPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 1.8),
        new THREE.MeshStandardMaterial({ map: battLabelTex, roughness: 0.4 })
      );
      labelPlane.position.z = 0.2;
      battGroup.add(labelPlane);

      // Battery gold terminal tabs
      const tabGeo = new THREE.BoxGeometry(0.3, 0.15, 0.04);
      const tabMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95 });
      const tabMesh = new THREE.Mesh(tabGeo, tabMat);
      tabMesh.position.set(0, 1.15, 0.1);
      battGroup.add(tabMesh);

      battGroup.position.set(0.85, -0.4, 0.22);
      this.registerComponent(
        'battery-cell',
        battGroup,
        { x: 0.85, y: -0.4, z: 0.22 },
        { x: 1.4, y: -0.85, z: 0.6 }
      );

      // 6. Taptic Engine Haptic Actuator
      const tapticGroup = new THREE.Group();
      const tapGeo = new THREE.BoxGeometry(1.35, 1.6, 0.35);
      const tapMat = new THREE.MeshStandardMaterial({
        color: 0x9ca3af, // 316L Stainless steel
        metalness: 0.92,
        roughness: 0.24,
      });
      const tapMesh = new THREE.Mesh(tapGeo, tapMat);
      tapticGroup.add(tapMesh);

      // Resonant motor core ring
      const ringGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x374151,
        metalness: 0.7,
        roughness: 0.3,
      });
      const coreMesh = new THREE.Mesh(ringGeo, ringMat);
      coreMesh.rotation.x = Math.PI / 2;
      coreMesh.position.z = 0.18;
      tapticGroup.add(coreMesh);

      tapticGroup.position.set(-0.85, -0.4, 0.22);
      this.registerComponent(
        'taptic-engine',
        tapticGroup,
        { x: -0.85, y: -0.4, z: 0.22 },
        { x: -1.4, y: -0.85, z: 0.6 }
      );

      // 7. Grade 5 Aerospace Titanium Case (Central Datum)
      const caseShape = this.createWatchShape(4.1, 4.9, 1.25);
      // Outer chassis
      const caseGeo = new THREE.ExtrudeGeometry(caseShape, {
        depth: 0.9,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 1,
        bevelSize: 0.14,
        bevelThickness: 0.14,
      });
      caseGeo.center();

      const caseMat = new THREE.MeshStandardMaterial({
        color: 0xd8d6d2, // Polished Natural Titanium
        metalness: 0.94,
        roughness: 0.22,
      });
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);

      // Hollow inner cavity to represent CNC precision milling
      const innerCutGeo = new THREE.BoxGeometry(3.6, 4.3, 0.95);
      const innerCutMat = new THREE.MeshStandardMaterial({
        color: 0x111317,
        metalness: 0.8,
        roughness: 0.6,
      });
      const innerCutMesh = new THREE.Mesh(innerCutGeo, innerCutMat);
      innerCutMesh.position.z = 0.02;

      const fullCaseGroup = new THREE.Group();
      fullCaseGroup.add(caseMesh);
      fullCaseGroup.add(innerCutMesh);

      this.registerComponent('titanium-case', fullCaseGroup, { z: 0 }, { z: 0 });

      // 8. Digital Crown & Side Button
      const crownGroup = new THREE.Group();
      // Crown cylinder
      const crownGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.55, 32);
      crownGeo.rotateZ(Math.PI / 2);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xd8d6d2,
        metalness: 0.94,
        roughness: 0.2,
      });
      const crownMesh = new THREE.Mesh(crownGeo, crownMat);
      crownMesh.position.set(2.2, 0.65, 0.0);
      crownGroup.add(crownMesh);

      // Red ceramic accent ring
      const redRingGeo = new THREE.TorusGeometry(0.36, 0.04, 16, 32);
      redRingGeo.rotateY(Math.PI / 2);
      const redRingMat = new THREE.MeshStandardMaterial({
        color: 0xd93829,
        roughness: 0.2,
        metalness: 0.1,
      });
      const redRingMesh = new THREE.Mesh(redRingGeo, redRingMat);
      redRingMesh.position.set(2.45, 0.65, 0.0);
      crownGroup.add(redRingMesh);

      // Side flush button
      const buttonGeo = new THREE.BoxGeometry(0.25, 0.9, 0.28);
      const buttonMat = new THREE.MeshStandardMaterial({
        color: 0xc8c6c2,
        metalness: 0.92,
        roughness: 0.25,
      });
      const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
      buttonMesh.position.set(2.18, -0.65, 0.0);
      crownGroup.add(buttonMesh);

      this.registerComponent(
        'digital-crown',
        crownGroup,
        { x: 0, y: 0, z: 0 },
        { x: 1.2, y: 0.2, z: 0 }
      );

      // 9. Acoustic Speaker System (Left Flank)
      const speakerGroup = new THREE.Group();
      const spkGeo = new THREE.BoxGeometry(0.35, 1.4, 0.4);
      const spkMat = new THREE.MeshStandardMaterial({
        color: 0x22242a,
        metalness: 0.75,
        roughness: 0.4,
      });
      const spkMesh = new THREE.Mesh(spkGeo, spkMat);
      speakerGroup.add(spkMesh);

      // Speaker acoustic mesh grill
      const grillGeo = new THREE.BoxGeometry(0.04, 1.1, 0.22);
      const grillMat = new THREE.MeshStandardMaterial({
        color: 0x050608,
        metalness: 0.9,
        roughness: 0.2,
      });
      const grillMesh = new THREE.Mesh(grillGeo, grillMat);
      grillMesh.position.x = -0.18;
      speakerGroup.add(grillMesh);

      speakerGroup.position.set(-2.15, 0.0, 0.0);
      this.registerComponent(
        'speaker-mic',
        speakerGroup,
        { x: -2.15, y: 0.0, z: 0.0 },
        { x: -3.3, y: 0.0, z: 0.0 }
      );

      // 10. Magnetic Inductive Fast-Charging Coil
      const coilGroup = new THREE.Group();
      const coilShieldGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.05, 48);
      coilShieldGeo.rotateX(Math.PI / 2);
      const coilShieldMat = new THREE.MeshStandardMaterial({
        color: 0x1f2328, // Dark Ferrite backing
        metalness: 0.6,
        roughness: 0.5,
      });
      const coilShieldMesh = new THREE.Mesh(coilShieldGeo, coilShieldMat);
      coilGroup.add(coilShieldMesh);

      // Concentric copper wire rings
      for (let r = 0.5; r <= 1.45; r += 0.16) {
        const wireGeo = new THREE.TorusGeometry(r, 0.035, 12, 48);
        const wireMat = new THREE.MeshStandardMaterial({
          color: 0xc87030, // Pure copper
          metalness: 0.95,
          roughness: 0.2,
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        wireMesh.position.z = 0.03;
        coilGroup.add(wireMesh);
      }

      this.registerComponent('charging-coil', coilGroup, { z: -0.4 }, { z: -1.6 });

      // 11. Biometric Optical Sensor Cluster
      const sensorGroup = new THREE.Group();
      const sensorBaseGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.08, 48);
      sensorBaseGeo.rotateX(Math.PI / 2);
      const sensorBaseMat = new THREE.MeshStandardMaterial({
        color: 0x14161a,
        metalness: 0.8,
        roughness: 0.3,
      });
      const sensorBaseMesh = new THREE.Mesh(sensorBaseGeo, sensorBaseMat);
      sensorGroup.add(sensorBaseMesh);

      // 4 Optical Diodes (2 Emerald Green LEDs, 1 Crimson Red LED, 1 Infrared/Photodiode)
      const diodeConfigs = [
        { x: 0, y: 0.72, color: 0x00ff66, emissive: 0x00ff66 }, // Green heart rate
        { x: 0, y: -0.72, color: 0x00ff66, emissive: 0x00ff66 }, // Green heart rate
        { x: 0.72, y: 0, color: 0xff3b30, emissive: 0xff3b30 }, // Red SpO2
        { x: -0.72, y: 0, color: 0x5856d6, emissive: 0x5856d6 }, // Infrared / Photodiode
      ];

      diodeConfigs.forEach((cfg) => {
        const diodeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24);
        diodeGeo.rotateX(Math.PI / 2);
        const diodeMat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          emissive: cfg.emissive,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.1,
        });
        const diodeMesh = new THREE.Mesh(diodeGeo, diodeMat);
        diodeMesh.position.set(cfg.x, cfg.y, 0.05);
        sensorGroup.add(diodeMesh);

        // Surrounding polished metal ring
        const bezelGeo = new THREE.TorusGeometry(0.26, 0.03, 12, 24);
        const bezelMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.95 });
        const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
        bezelMesh.position.set(cfg.x, cfg.y, 0.06);
        sensorGroup.add(bezelMesh);
      });

      this.registerComponent('biometric-sensors', sensorGroup, { z: -0.7 }, { z: -3.1 });

      // 12. Zirconia Ceramic Back Cover
      const backShape = this.createWatchShape(3.9, 4.7, 1.15);
      const backGeo = new THREE.ExtrudeGeometry(backShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.08,
        bevelThickness: 0.08,
      });
      backGeo.center();

      const backMat = new THREE.MeshStandardMaterial({
        color: 0x18191f, // Deep polished black ceramic
        roughness: 0.15,
        metalness: 0.4,
      });
      const backMesh = new THREE.Mesh(backGeo, backMat);

      // Engraved specification text ring on back
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 512;
      const tCtx = textCanvas.getContext('2d');
      tCtx.fillStyle = '#18191f';
      tCtx.fillRect(0, 0, 512, 512);

      tCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      tCtx.lineWidth = 2;
      tCtx.beginPath();
      tCtx.arc(256, 256, 210, 0, Math.PI * 2);
      tCtx.stroke();

      tCtx.font = 'bold 20px -apple-system, "Space Grotesk", sans-serif';
      tCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      tCtx.textAlign = 'center';
      tCtx.fillText('· WATCH SERIES 11 · 46MM TITANIUM ·', 256, 75);
      tCtx.fillText('· SAPPHIRE CRYSTAL · 50M WATER RESISTANT ·', 256, 450);

      const textTexture = new THREE.CanvasTexture(textCanvas);
      const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 3.6),
        new THREE.MeshStandardMaterial({
          map: textTexture,
          roughness: 0.2,
          transparent: true,
          opacity: 0.95,
        })
      );
      textPlane.rotation.y = Math.PI; // Face the rear
      textPlane.position.z = -0.16;

      const ceramicBackGroup = new THREE.Group();
      ceramicBackGroup.add(backMesh);
      ceramicBackGroup.add(textPlane);

      this.registerComponent('ceramic-back', ceramicBackGroup, { z: -0.92 }, { z: -4.5 });

      // 13. Fluoroelastomer Sport Bands (Top & Bottom Extensions)
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0x18181f, // Midnight
        roughness: 0.72,
        metalness: 0.05,
      });

      // Top Band
      const topBandGeo = new THREE.CylinderGeometry(1.4, 1.4, 3.2, 32, 1, false, 0, Math.PI);
      topBandGeo.rotateY(Math.PI / 2);
      topBandGeo.rotateX(-Math.PI / 2);
      const topBandMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.8, 0.32), bandMat);
      topBandMesh.position.set(0, 4.2, -0.12);

      // Bottom Band
      const bottomBandMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.0, 0.32), bandMat);
      bottomBandMesh.position.set(0, -4.3, -0.12);

      const bandsGroup = new THREE.Group();
      bandsGroup.add(topBandMesh);
      bandsGroup.add(bottomBandMesh);
      this.bandsGroup = bandsGroup;
      this.mainGroup.add(bandsGroup);
    }

    createWatchShape(width, height, radius) {
      const shape = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      shape.moveTo(x + radius, y);
      shape.lineTo(x + width - radius, y);
      shape.quadraticCurveTo(x + width, y, x + width, y + radius);
      shape.lineTo(x + width, y + height - radius);
      shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      shape.lineTo(x + radius, y + height);
      shape.quadraticCurveTo(x, y + height, x, y + height - radius);
      shape.lineTo(x, y + radius);
      shape.quadraticCurveTo(x, y, x + radius, y);
      return shape;
    }

    registerComponent(id, object3D, assembledPos, explodedPos) {
      const meta = EXPLODED_COMPONENTS[id];
      if (!meta) return;

      object3D.userData = { componentId: id };

      // Set initial assembled position
      object3D.position.set(
        assembledPos.x || 0,
        assembledPos.y || 0,
        assembledPos.z !== undefined ? assembledPos.z : 0
      );

      this.mainGroup.add(object3D);

      const compObj = {
        id,
        meta,
        mesh: object3D,
        assembledPos: new THREE.Vector3(
          assembledPos.x || 0,
          assembledPos.y || 0,
          assembledPos.z !== undefined ? assembledPos.z : 0
        ),
        explodedPos: new THREE.Vector3(
          explodedPos.x || 0,
          explodedPos.y || 0,
          explodedPos.z !== undefined ? explodedPos.z : 0
        ),
      };

      this.components.push(compObj);
      this.componentMap.set(id, compObj);
    }

    initHotspotsDOM() {
      if (!this.hotspotsContainer) return;
      this.hotspotsContainer.innerHTML = '';

      this.components.forEach((comp) => {
        const marker = document.createElement('div');
        marker.className = 'hotspot-marker';
        marker.dataset.component = comp.id;
        marker.setAttribute('role', 'button');
        marker.setAttribute('tabindex', '0');
        marker.setAttribute('aria-label', `Inspect ${comp.meta.name}`);

        const pin = document.createElement('span');
        pin.className = 'hotspot-pin';

        const label = document.createElement('span');
        label.className = 'hotspot-label';
        label.textContent = comp.meta.name;

        marker.appendChild(pin);
        marker.appendChild(label);

        marker.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectComponent(comp.id, true);
        });

        this.hotspotsContainer.appendChild(marker);
        this.hotspotElements.set(comp.id, marker);
      });
    }

    initPartsRailDOM() {
      const partsRail = document.getElementById('partsRail');
      if (!partsRail) return;
      partsRail.innerHTML = '';

      this.components.forEach((comp, idx) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `part-pill ${comp.id === this.selectedComponentId ? 'active' : ''}`;
        pill.dataset.component = comp.id;
        pill.setAttribute('role', 'tab');
        pill.setAttribute('aria-selected', String(comp.id === this.selectedComponentId));
        pill.setAttribute('aria-label', `Inspect ${comp.meta.name}`);

        const numStr = String(idx + 1).padStart(2, '0');
        pill.innerHTML = `
          <span class="pill-layer-num">${numStr}</span>
          <span class="pill-title">${comp.meta.name}</span>
        `;

        pill.addEventListener('click', (e) => {
          e.preventDefault();
          this.selectComponent(comp.id, true);
        });

        partsRail.appendChild(pill);
      });
    }

    initEvents() {
      let pointerDownPos = { x: 0, y: 0 };
      let dragDistance = 0;

      // 1. Pointer drag on canvas for 3D rotation
      const onPointerDown = (e) => {
        this.isDragging = true;
        this.stage.classList.add('grabbing');
        this.previousMousePos = { x: e.clientX, y: e.clientY };
        pointerDownPos = { x: e.clientX, y: e.clientY };
        dragDistance = 0;
      };

      const onPointerMove = (e) => {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.previousMousePos.x;
        const deltaY = e.clientY - this.previousMousePos.y;

        dragDistance += Math.hypot(deltaX, deltaY);

        this.targetRotation.y += deltaX * 0.0075;
        this.targetRotation.x += deltaY * 0.0075;

        // Clamp vertical tilt
        this.targetRotation.x = Math.max(-0.65, Math.min(0.85, this.targetRotation.x));

        this.previousMousePos = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        this.isDragging = false;
        this.stage.classList.remove('grabbing');
      };

      this.canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      // 2. Click on 3D meshes to inspect (only on intentional click, not after drag)
      this.canvas.addEventListener('click', (e) => {
        if (dragDistance > 6) return; // Ignore drag release

        const rect = this.canvas.getBoundingClientRect();
        this.mouseCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouseCoords, this.camera);
        const intersects = this.raycaster.intersectObjects(this.mainGroup.children, true);

        if (intersects.length > 0) {
          // Find closest ancestor with componentId
          let cur = intersects[0].object;
          while (cur && !cur.userData?.componentId && cur !== this.mainGroup) {
            cur = cur.parent;
          }
          if (cur && cur.userData?.componentId) {
            this.selectComponent(cur.userData.componentId, true);
          }
        }
      });

      // 3. Responsive ResizeObserver on stage
      const resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      resizeObserver.observe(this.stage);
    }

    handleResize() {
      const rect = this.stage.getBoundingClientRect();
      const width = Math.max(1, rect.width || 600);
      const height = Math.max(1, rect.height || 620);

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    }

    initIntersectionObserver() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0 }
      );
      observer.observe(this.stage);
    }

    setExploded(exploded) {
      this.isExploded = exploded;
      this.targetProgress = exploded ? 1.0 : 0.0;

      // Update Camera & Target Rotation to enhance exploded aesthetic
      if (exploded) {
        this.targetRotation.x = this.defaultExplodedRotation.x;
        this.targetRotation.y = this.defaultExplodedRotation.y;
      } else {
        this.targetRotation.x = this.defaultAssembledRotation.x;
        this.targetRotation.y = this.defaultAssembledRotation.y;
      }

      // Update UI Status & Buttons
      this.updateUIState();
    }

    toggleExplode() {
      this.setExploded(!this.isExploded);
    }

    resetCamera() {
      if (this.isExploded) {
        this.targetRotation.x = this.defaultExplodedRotation.x;
        this.targetRotation.y = this.defaultExplodedRotation.y;
      } else {
        this.targetRotation.x = this.defaultAssembledRotation.x;
        this.targetRotation.y = this.defaultAssembledRotation.y;
      }
    }

    selectComponent(componentId, userAction = false) {
      this.selectedComponentId = componentId;
      const comp = this.componentMap.get(componentId);
      if (!comp) return;

      // If user clicked a component while assembled, auto-explode so they can inspect clearly
      if (userAction && !this.isExploded) {
        this.setExploded(true);
      }

      // 1. Update HUD DOM elements
      const catBadge = document.getElementById('inspCategoryBadge');
      const layerTag = document.getElementById('inspLayerTag');
      const title = document.getElementById('inspTitle');
      const subtitle = document.getElementById('inspSubtitle');
      const what = document.getElementById('inspWhat');
      const func = document.getElementById('inspFunction');
      const role = document.getElementById('inspRole');
      const mat = document.getElementById('inspMaterial');
      const prop = document.getElementById('inspProperty');
      const prec = document.getElementById('inspPrecision');
      const axis = document.getElementById('inspAxis');

      if (catBadge) {
        catBadge.textContent = comp.meta.category;
        catBadge.className = `hud-category-badge ${comp.meta.categoryClass}`;
      }
      if (layerTag) layerTag.textContent = comp.meta.layer;
      if (title) title.textContent = comp.meta.name;
      if (subtitle) subtitle.textContent = comp.meta.subtitle;
      if (what) what.textContent = comp.meta.what;
      if (func) func.textContent = comp.meta.function;
      if (role) role.textContent = comp.meta.role;
      if (mat) mat.textContent = comp.meta.material;
      if (prop) prop.textContent = comp.meta.property;
      if (prec && comp.meta.precision) prec.textContent = comp.meta.precision;
      if (axis) axis.textContent = comp.meta.axis;

      // 2. Update active pill in parts rail without scrolling the browser window
      const rail = document.getElementById('partsRail');
      const pills = document.querySelectorAll('.part-pill');
      pills.forEach((p) => {
        const active = p.dataset.component === componentId;
        p.classList.toggle('active', active);
        p.setAttribute('aria-selected', String(active));
        if (active && rail) {
          // Smoothly scroll only the parts rail container, keeping the 3D watch simulation fixed in viewport
          const pillLeft = p.offsetLeft;
          const pillWidth = p.offsetWidth;
          const railWidth = rail.offsetWidth;
          rail.scrollTo({
            left: pillLeft - (railWidth / 2) + (pillWidth / 2),
            behavior: 'smooth',
          });
        }
      });

      // 3. Highlight hotspot marker
      this.hotspotElements.forEach((el, id) => {
        el.classList.toggle('active', id === componentId);
      });
    }

    updateUIState() {
      const triggerBtn = document.getElementById('explodeTriggerBtn');
      const btnLabel = document.getElementById('explodeBtnLabel');
      const btnBadge = document.getElementById('explodeBtnBadge');
      const iconExplode = triggerBtn ? triggerBtn.querySelector('.icon-explode') : null;
      const iconReassemble = triggerBtn ? triggerBtn.querySelector('.icon-reassemble') : null;

      const statusPill = document.getElementById('explodedStatusPill');
      const statusText = document.getElementById('explodedStatusText');
      const stageTip = document.getElementById('stageTip');

      if (triggerBtn) {
        triggerBtn.classList.toggle('is-exploded', this.isExploded);
        triggerBtn.setAttribute('aria-pressed', String(this.isExploded));
      }

      if (btnLabel) {
        btnLabel.textContent = this.isExploded ? 'Reassemble Watch' : 'Explore Components';
      }
      if (btnBadge) {
        btnBadge.textContent = this.isExploded ? 'Solid Model' : '12 Systems';
      }

      if (iconExplode) iconExplode.style.display = this.isExploded ? 'none' : 'block';
      if (iconReassemble) iconReassemble.style.display = this.isExploded ? 'block' : 'none';

      if (statusPill) {
        statusPill.classList.toggle('is-exploded', this.isExploded);
      }
      if (statusText) {
        statusText.textContent = this.isExploded
          ? 'Exploded Architecture · 12 Key Systems'
          : 'Complete Assembly · Solid Product';
      }
      if (stageTip) {
        stageTip.textContent = this.isExploded
          ? 'Click any component or hotspot to inspect engineering details.'
          : 'Click "Explore Components" to separate the watch into its precision parts.';
      }
    }

    updateHotspotProjections() {
      if (!this.hotspotsContainer) return;
      const showHotspots = this.explosionProgress > 0.35;
      const rect = this.canvas.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;

      this.components.forEach((comp) => {
        const el = this.hotspotElements.get(comp.id);
        if (!el) return;

        if (!showHotspots) {
          el.classList.remove('visible');
          return;
        }

        // Project world position of component to screen coords
        const worldPos = new THREE.Vector3();
        comp.mesh.getWorldPosition(worldPos);

        // Add slight vertical offset for readability
        worldPos.y += 0.35;

        worldPos.project(this.camera);

        // Check if behind camera
        if (worldPos.z > 1) {
          el.classList.remove('visible');
          return;
        }

        const screenX = worldPos.x * halfW + halfW;
        const screenY = -(worldPos.y * halfH) + halfH;

        el.style.left = `${screenX}px`;
        el.style.top = `${screenY}px`;
        el.classList.add('visible');
      });
    }

    startRenderLoop() {
      const clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);

        if (!this.isVisible) return;

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // 1. Smooth physical lerp for explosion progress
        const pFactor = 0.085;
        this.explosionProgress += (this.targetProgress - this.explosionProgress) * pFactor;

        // 2. Smooth rotation damping
        const rFactor = this.isDragging ? 0.2 : 0.06;
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * rFactor;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * rFactor;

        // Subtle gentle breathing oscillation when not dragging
        const breathe = !this.isDragging ? Math.sin(elapsed * 1.5) * 0.02 : 0;

        this.mainGroup.rotation.x = this.currentRotation.x + breathe;
        this.mainGroup.rotation.y = this.currentRotation.y;

        // 3. Update component positions along exploded axes
        this.components.forEach((comp) => {
          comp.mesh.position.lerpVectors(comp.assembledPos, comp.explodedPos, this.explosionProgress);

          // Subtle individual technical orientation in exploded mode
          if (comp.id === 'sapphire-glass' || comp.id === 'oled-display') {
            comp.mesh.rotation.y = this.explosionProgress * 0.05;
          }

          // Visual focus highlighting: highlight selected component while guaranteeing all exploded parts stay visible
          const isSelected = comp.id === this.selectedComponentId;
          comp.mesh.visible = true;
          comp.mesh.traverse((child) => {
            if (child.isMesh) {
              child.visible = true;
              if (child.material) {
                // Initialize default emissive backup if not set
                if (child.userData.defaultEmissive === undefined && child.material.emissive) {
                  child.userData.defaultEmissive = child.material.emissive.getHex();
                  child.userData.defaultEmissiveIntensity = child.material.emissiveIntensity !== undefined ? child.material.emissiveIntensity : 0;
                }

                if (child.material.emissive) {
                  if (isSelected && this.isExploded) {
                    if (comp.id === 'oled-display') {
                      child.material.emissive.setHex(0xffffff);
                      child.material.emissiveIntensity = 0.85;
                    } else {
                      child.material.emissive.setHex(0x2997ff);
                      child.material.emissiveIntensity = 0.35;
                    }
                  } else {
                    const defHex = child.userData.defaultEmissive !== undefined ? child.userData.defaultEmissive : 0x000000;
                    const defInt = child.userData.defaultEmissiveIntensity !== undefined ? child.userData.defaultEmissiveIntensity : 0.0;
                    child.material.emissive.setHex(defHex);
                    child.material.emissiveIntensity = defInt;
                  }
                }
              }
            }
          });
        });

        // 4. Update band positions
        if (this.bandsGroup) {
          const bandOffset = this.explosionProgress * 1.2;
          this.bandsGroup.children[0].position.y = 4.2 + bandOffset;
          this.bandsGroup.children[1].position.y = -4.3 - bandOffset;
        }

        // 5. Update live OLED watch face seconds
        if (Math.floor(elapsed * 2) % 2 === 0) {
          drawWatchFace(this.oledCanvas);
          this.oledTexture.needsUpdate = true;
        }

        // 6. Update Hotspots HTML position overlays
        this.updateHotspotProjections();

        // 7. Render 3D scene
        this.renderer.render(this.scene, this.camera);
      };

      animate();
    }
  }

  /* ---------------------------------------------------------
     6. INITIALIZATION & UI INTERACTION WIRING
  --------------------------------------------------------- */
  function initApp() {
    const stage = document.getElementById('watchStage');
    const canvas = document.getElementById('watchCanvas');

    let viewer = null;
    if (stage && canvas) {
      try {
        viewer = new WatchViewer(canvas, stage);
      } catch (err) {
        console.error('[WatchViewer] Error initializing 3D viewer:', err);
      }
    }

    // Toggle 360 Orbit Button
    const rotateBtn = document.getElementById('toggleRotateBtn');
    const rotateBtnLabel = document.getElementById('rotateBtnLabel');
    const resetBtn = document.getElementById('resetOrientationBtn');

    if (rotateBtn && viewer) {
      rotateBtn.addEventListener('click', () => {
        const isActive = viewer.toggle360Mode();
        rotateBtn.classList.toggle('active', isActive);
        rotateBtnLabel.textContent = isActive ? '360° Free Orbit Active' : 'Drag to Rotate 360°';
        if (!isActive) {
          viewer.resetOrientation();
        }
      });
    }

    if (resetBtn && viewer) {
      resetBtn.addEventListener('click', () => {
        viewer.resetOrientation();
      });
    }

    // Finish Swatches
    const finishSwatches = document.querySelectorAll('.finish-swatch');
    const activeFinishName = document.getElementById('activeFinishName');

    finishSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        finishSwatches.forEach((s) => s.classList.remove('active'));
        btn.classList.add('active');
        const finishKey = btn.dataset.finish;
        if (viewer) viewer.setFinish(finishKey);
        if (activeFinishName && FINISHES[finishKey]) {
          activeFinishName.textContent = FINISHES[finishKey].name;
        }
      });
    });

    // Band Swatches
    const bandSwatches = document.querySelectorAll('.band-swatch');
    bandSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        bandSwatches.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const bandKey = btn.dataset.band;
        if (viewer) viewer.setBand(bandKey);
      });
    });

    // Floating Bubble Glass Navigation & Mobile Menu
    const navWrapper = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileActiveLabel = document.getElementById('mobileActiveLabel');
    const allNavLinks = document.querySelectorAll('[data-nav]');

    const closeMobileMenu = () => {
      if (navWrapper) {
        navWrapper.classList.remove('menu-open');
      }
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    if (mobileMenuBtn && navWrapper) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navWrapper.classList.toggle('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }

    // Close mobile dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (navWrapper && navWrapper.classList.contains('menu-open')) {
        if (!navWrapper.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });

    // Smooth scroll for all nav links (desktop + mobile)
    allNavLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          closeMobileMenu();
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Hero CTA button smooth scroll
    const heroBtn = document.getElementById('heroBtn');
    if (heroBtn) {
      heroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const brand = document.querySelector('#brand');
        if (brand) brand.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Active Nav Highlight via IntersectionObserver
    const sections = ['home', 'brand', 'product', 'materials-origin', 'assembly-shipping', 'manufacturing', 'distribution', 'about']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const sectionLabels = {
      home: 'Home',
      brand: 'Brand',
      product: 'Product',
      'materials-origin': 'Materials',
      'assembly-shipping': 'Shipping',
      manufacturing: 'Manufacturing',
      distribution: 'Distribution',
      about: 'About Us',
    };

    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              allNavLinks.forEach((link) => {
                const isActive = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('active', isActive);
              });
              if (mobileActiveLabel && sectionLabels[id]) {
                mobileActiveLabel.textContent = sectionLabels[id];
              }
            }
          });
        },
        { rootMargin: '-35% 0px -45% 0px', threshold: 0 }
      );

      sections.forEach((section) => observer.observe(section));
    }

    // ---------------------------------------------------------
    // Brand Section: Scroll Reveals, Parallax & Card Accents
    // ---------------------------------------------------------
    const brandReveals = document.querySelectorAll('.brand-reveal');
    if ('IntersectionObserver' in window && brandReveals.length) {
      const brandObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              brandObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      brandReveals.forEach((el) => brandObserver.observe(el));
    } else {
      // Immediate fallback if observer not supported
      brandReveals.forEach((el) => el.classList.add('is-visible'));
    }

    // Apple Park Subtle Scroll Parallax
    const hqHeroImage = document.getElementById('hqHeroImage');
    const hqImageFrame = document.getElementById('hqImageFrame');
    if (hqHeroImage && hqImageFrame) {
      let ticking = false;
      const updateParallax = () => {
        const rect = hqImageFrame.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (rect.top + rect.height / 2 - windowHeight / 2) / (windowHeight / 2);
          const clamped = Math.max(-1, Math.min(1, progress));
          const translateY = clamped * -18;
          hqHeroImage.style.transform = `scale(1.06) translateY(${translateY.toFixed(2)}px)`;
        }
        ticking = false;
      };

      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
          }
        },
        { passive: true }
      );

      updateParallax();
    }

    // Glass Cards Subtle Mouse Position Tracking
    const interactiveCards = document.querySelectorAll('.company-card, .fact-card');
    interactiveCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // ---------------------------------------------------------
    // MNC Collapsible Toggle
    // ---------------------------------------------------------
    const mncCard = document.getElementById('infoType');
    const mncToggleBtn = document.getElementById('mncToggleBtn');
    const mncToggleLabel = document.getElementById('mncToggleLabel');

    if (mncCard && mncToggleBtn) {
      mncToggleBtn.addEventListener('click', () => {
        const isCollapsed = mncCard.classList.toggle('collapsed');
        mncToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
        if (mncToggleLabel) {
          mncToggleLabel.textContent = isCollapsed ? 'Why MNC?' : 'Collapse';
        }
      });
    }

    // ---------------------------------------------------------
    // Interactive Main Products Selection & Hovering
    // ---------------------------------------------------------
    const productCatalog = {
      watch: {
        badge: 'Flagship Wearable',
        title: 'Apple Watch',
        desc: "The world's leading smartwatch combining aerospace-grade titanium, edge-to-edge wide-angle OLED, precision ECG, and life-saving health sensors.",
      },
      iphone: {
        badge: 'Flagship Smartphone',
        title: 'iPhone',
        desc: 'Industry-defining smartphone powered by custom Apple Silicon, aerospace-grade titanium, Pro camera systems, Action button, and iOS.',
      },
      mac: {
        badge: 'Pro Workstations & Laptops',
        title: 'Mac',
        desc: 'Revolutionary personal computers supercharged by M-series unified memory architecture, extreme battery efficiency, and Liquid Retina XDR.',
      },
      ipad: {
        badge: 'Multi-Touch Computing',
        title: 'iPad',
        desc: 'Ultra-portable creative canvas blending desktop-class performance, Tandem OLED displays, Apple Pencil Pro, and modular Magic Keyboard.',
      },
      airpods: {
        badge: 'Personal Audio',
        title: 'AirPods',
        desc: 'Global leader in wireless audio with Personalized Spatial Audio, Active Noise Cancellation, Adaptive Audio, and seamless device switching.',
      },
      vision: {
        badge: 'Spatial Computing',
        title: 'Apple Vision Pro',
        desc: 'Breakthrough spatial computer seamlessly blending digital media with physical surroundings, navigated effortlessly by eyes, hands, and voice.',
      },
      services: {
        badge: 'Digital Ecosystem',
        title: 'Services',
        desc: 'High-margin recurring platforms including iCloud+, Apple Pay, Apple Music, Apple TV+, Apple Arcade, and the worldwide App Store.',
      },
      more: {
        badge: 'Connected Ecosystem',
        title: 'and more',
        desc: 'HomePod, Apple TV 4K, AirTag, MagSafe accessories, and an integrated smart home ecosystem designed for seamless privacy and performance.',
      },
    };

    const productPillsList = document.getElementById('productPillsList');
    const productPills = document.querySelectorAll('.product-pill');
    const previewBadge = document.getElementById('previewBadge');
    const previewTitle = document.getElementById('previewTitle');
    const previewDesc = document.getElementById('previewDesc');
    const productDetailPreview = document.getElementById('productDetailPreview');

    let activeProductKey = 'watch';

    const renderProductPreview = (key) => {
      const data = productCatalog[key];
      if (!data) return;

      if (productDetailPreview) {
        productDetailPreview.style.opacity = '0.5';
      }

      setTimeout(() => {
        if (previewBadge) previewBadge.textContent = data.badge;
        if (previewTitle) previewTitle.textContent = data.title;
        if (previewDesc) previewDesc.textContent = data.desc;
        if (productDetailPreview) {
          productDetailPreview.style.opacity = '1';
        }
      }, 70);
    };

    const setActiveProduct = (key) => {
      activeProductKey = key;
      productPills.forEach((pill) => {
        const isMatch = pill.dataset.product === key;
        pill.classList.toggle('active', isMatch);
        pill.setAttribute('aria-selected', String(isMatch));

        let dot = pill.querySelector('.pill-dot');
        if (isMatch && !dot) {
          dot = document.createElement('span');
          dot.className = 'pill-dot';
          pill.prepend(dot);
        } else if (!isMatch && dot) {
          dot.remove();
        }
      });
      renderProductPreview(key);
    };

    productPills.forEach((pill) => {
      const key = pill.dataset.product;

      pill.addEventListener('click', () => {
        setActiveProduct(key);
      });

      pill.addEventListener('pointerenter', () => {
        renderProductPreview(key);
      });
    });

    if (productPillsList) {
      productPillsList.addEventListener('pointerleave', () => {
        renderProductPreview(activeProductKey);
      });
    }

    /* ---------------------------------------------------------
       PRODUCT SECTION: EXPLODED VIEW 3D VIEWER INITIALIZATION
    --------------------------------------------------------- */
    const explodedStage = document.getElementById('explodedStage');
    const explodedCanvas = document.getElementById('explodedCanvas');
    let explodedViewer = null;

    if (explodedStage && explodedCanvas) {
      try {
        explodedViewer = new ExplodedWatchViewer(explodedCanvas, explodedStage);
      } catch (err) {
        console.error('[ExplodedWatchViewer] Error initializing exploded 3D viewer:', err);
      }
    }

    // Explode / Reassemble Toggle Button
    const explodeTriggerBtn = document.getElementById('explodeTriggerBtn');
    if (explodeTriggerBtn && explodedViewer) {
      explodeTriggerBtn.addEventListener('click', () => {
        explodedViewer.toggleExplode();
      });
    }

    // Reset Camera Orientation Button
    const resetExplodedCamBtn = document.getElementById('resetExplodedCamBtn');
    if (resetExplodedCamBtn && explodedViewer) {
      resetExplodedCamBtn.addEventListener('click', () => {
        explodedViewer.resetCamera();
      });
    }

    // Parts Navigation Rail (Horizontal Scrollable Pills)
    const partPills = document.querySelectorAll('.part-pill');
    partPills.forEach((pill) => {
      const componentId = pill.dataset.component;
      pill.addEventListener('click', () => {
        if (explodedViewer && componentId) {
          explodedViewer.selectComponent(componentId, true);
        }
      });
    });

    // Materials Blueprint Legend Clicks (Auto-selects related component)
    const legendItems = document.querySelectorAll('.legend-card, .legend-item');
    const categoryToComponent = {
      metals: 'titanium-case',
      ceramics: 'sapphire-glass',
      semiconductors: 's11-sip',
      polymers: 'thermal-shield',
      other: 'battery-cell',
    };

    legendItems.forEach((item) => {
      const cat = item.dataset.category;
      item.addEventListener('click', () => {
        const targetCompId = categoryToComponent[cat];
        if (explodedViewer && targetCompId) {
          explodedViewer.selectComponent(targetCompId, true);
        }
      });
    });

    /* ---------------------------------------------------------
       ORIGIN & OUTSOURCING + SHIPPING FLOW INTERACTIVITY
    --------------------------------------------------------- */
    initNewSectionsLogic();

    /* ---------------------------------------------------------
       MANUFACTURING PROCESS & DISTRIBUTION INTERACTIVITY
    --------------------------------------------------------- */
    initManufacturingProcessLogic();
    initMarketingDistributionLogic();
  }

  function initNewSectionsLogic() {
    // 1. Perspective View Mode Toggling (Complete View / Sourcing / Manufacturing)
    const materialsOriginSection = document.getElementById('materials-origin');
    const modeButtons = document.querySelectorAll('.origin-mode-btn');

    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const mode = btn.dataset.mode || 'all';
        if (materialsOriginSection) {
          if (mode === 'all') {
            materialsOriginSection.removeAttribute('data-active-mode');
          } else {
            materialsOriginSection.setAttribute('data-active-mode', mode);
          }
        }
      });
    });

    // 2. Component Category Filters
    const catFilterButtons = document.querySelectorAll('.cat-filter-btn');
    const originCards = document.querySelectorAll('.origin-card');

    catFilterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        catFilterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filterCat = btn.dataset.cat || 'all';
        originCards.forEach((card) => {
          const cardCat = card.dataset.category;
          if (filterCat === 'all' || cardCat === filterCat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 3. 5-Stage Shipping & Assembly Flow
    const flowSteps = document.querySelectorAll('.flow-step-node');
    const stageTagBadge = document.getElementById('stageTagBadge');
    const stageCardTitle = document.getElementById('stageCardTitle');
    const stageCardDesc = document.getElementById('stageCardDesc');
    const stageMetricLocs = document.getElementById('stageMetricLocs');
    const stageMetricTransit = document.getElementById('stageMetricTransit');
    const stageMetricDeliverable = document.getElementById('stageMetricDeliverable');

    const stagesData = {
      1: {
        tag: 'Phase 01 of 05 · Upstream Sourcing',
        title: 'Raw Materials: Extraction, Smelting & Refining',
        desc: 'Certified refiners and smelters worldwide process aerospace-grade titanium sponge, high-purity alumina for sapphire crystal synthesis, semiconductor silicon ingots, and 100% recycled cobalt, gold, and rare-earth elements. All smelters and refiners are independently audited against Apple Responsible Sourcing standards.',
        locs: 'Japan, USA, Australia, Switzerland',
        transit: 'Consolidated Freight / Bulk Sea',
        deliverable: 'Refined Ingots, Wafers, Powders',
      },
      2: {
        tag: 'Phase 02 of 05 · Precision Fabrication',
        title: 'Component Manufacturing: Specialized Tier-1 Fabrication',
        desc: 'TSMC fabricates 3nm silicon wafers in Taiwan; LG Display creates wide-angle LTPO3 OLED panels in South Korea; Foxconn forges Grade 5 titanium cases in Shenzhen and Zhengzhou; Lens Technology polishes curved sapphire crystals in Hunan; and Sunwoda and Desay assemble custom battery pouch cells.',
        locs: 'Taiwan, South Korea, China, Singapore, Europe',
        transit: 'Cleanroom Packaging & Anti-Static Trays',
        deliverable: 'Fabricated Dies, Panels, Cases & Batteries',
      },
      3: {
        tag: 'Phase 03 of 05 · Global Air Corridors',
        title: 'Parts Shipping: High-Priority Cargo Air Freight',
        desc: 'High-value, time-sensitive components (3nm S11 SiP chips from Taiwan, OLED panels from South Korea, and bio-sensors from Singapore/Europe) are packed in Nitrogen-purged anti-static cassettes and flown via dedicated Boeing 747/777 charter air freight directly into gateway airports: Zhengzhou (CGO), Shanghai (PVG), and Hanoi (HAN).',
        locs: 'Taipei (TPE), Seoul (ICN), Singapore (SIN) to CGO & HAN',
        transit: 'Dedicated Air Freight (6 – 24 Hours)',
        deliverable: 'Sub-assembly Kits at Assembly Gates',
      },
      4: {
        tag: 'Phase 04 of 05 · Cleanroom Integration',
        title: 'Final Assembly: Robotic Cleanroom Systems Integration',
        desc: 'At primary assembly hubs — Foxconn (Zhengzhou & Shenzhen), Luxshare Precision (Kunshan, China & Bac Giang, Vietnam), and Compal Electronics (Kunshan & Chengdu) — robotic SMT pick-and-place lines position parts with micron accuracy, followed by automated laser case sealing, acoustic calibration, and 100% 50-meter water-resistance chamber testing.',
        locs: 'Foxconn, Luxshare & Compal (China & Vietnam)',
        transit: 'Automated Robotic Transfer Lines',
        deliverable: '100% Tested Apple Watch Series 11 Units',
      },
      5: {
        tag: 'Phase 05 of 05 · Outbound Fulfillment',
        title: 'Finished Watch: 100% Fiber Packaging & Worldwide Delivery',
        desc: 'Each watch is sealed in plastic-free 100% fiber compact retail packaging, bundled into flight-optimized air cargo pallets, and flown directly to major regional distribution hubs: Memphis, Louisville, and Elk Grove for the Americas; Eindhoven and Cork for Europe; and Tokyo, Shanghai, and Singapore for Asia-Pacific.',
        locs: 'Global Distribution Hubs (USA, EU, APAC)',
        transit: 'Direct Air Charters & Regional Couriers',
        deliverable: 'Direct to Apple Stores & Customers Worldwide',
      },
    };

    flowSteps.forEach((stepBtn) => {
      stepBtn.addEventListener('click', () => {
        const stepNum = stepBtn.dataset.step;
        if (!stepNum || !stagesData[stepNum]) return;

        flowSteps.forEach((btn) => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        stepBtn.classList.add('active');
        stepBtn.setAttribute('aria-selected', 'true');

        const data = stagesData[stepNum];
        if (stageTagBadge) stageTagBadge.textContent = data.tag;
        if (stageCardTitle) stageCardTitle.textContent = data.title;
        if (stageCardDesc) stageCardDesc.textContent = data.desc;
        if (stageMetricLocs) stageMetricLocs.textContent = data.locs;
        if (stageMetricTransit) stageMetricTransit.textContent = data.transit;
        if (stageMetricDeliverable) stageMetricDeliverable.textContent = data.deliverable;
      });
    });
  }

  /* =========================================================
     MANUFACTURING PROCESS INTERACTIVE LOGIC
     ========================================================= */
  function initManufacturingProcessLogic() {
    const stepperBtns = document.querySelectorAll('.mfg-stepper-btn');
    const stageCards = document.querySelectorAll('.mfg-stage-card');
    const inspectorCard = document.getElementById('mfgInspectorCard');

    const tagEl = document.getElementById('mfgStageBadge') || document.getElementById('mfgActiveTag');
    const categoryEl = document.getElementById('mfgPhaseCat') || document.getElementById('mfgActiveCategory');
    const titleEl = document.getElementById('mfgStageTitle') || document.getElementById('mfgActiveTitle');
    const descEl = document.getElementById('mfgStageDesc') || document.getElementById('mfgActiveDesc');
    const locsEl = document.getElementById('mfgStageLocs') || document.getElementById('mfgActiveLocs');
    const opsEl = document.getElementById('mfgStageOps') || document.getElementById('mfgActiveOps');
    const delivEl = document.getElementById('mfgStageDeliverable') || document.getElementById('mfgActiveDeliv');
    const auditEl = document.getElementById('mfgAuditStatus') || document.getElementById('mfgActiveAudit');
    const disclosureEl = document.getElementById('mfgStageDisclosure') || document.getElementById('mfgActiveDisclosure');

    const mfgStages = {
      1: {
        tag: 'Stage 01 of 06 · Material Sourcing',
        category: 'Material Sourcing',
        audit: '✓ Verified via Apple Supplier Audit Registry',
        title: 'Raw Materials: Extraction, Boule Crystallization & Refining',
        desc: 'Aerospace-grade Grade 5 titanium sponge and scrap undergo vacuum arc remelting; synthetic sapphire boules are grown in specialized ultra-high-temperature hydrothermal furnaces; electronic-grade silicon boules are drawn; and secondary refiners recover 100% recycled cobalt, gold, and rare earth elements.',
        locs: 'Japan, United States, Switzerland, Australia & China',
        ops: 'Vacuum Arc Remelting, Boule Growth, Recycled Smelting',
        deliverable: 'Titanium Ingots, Polycrystalline Wafers, Alumina Boules',
        disclosure: 'Audited Tier-1 smelters; specific raw mining sites proprietary'
      },
      2: {
        tag: 'Stage 02 of 06 · Component Production',
        category: 'Component Production',
        audit: '✓ Public Foundry Disclosures & SEC Filings',
        title: 'Component Manufacturing: Advanced Silicon, OLED & Sensors',
        desc: 'Specialized Tier-1 foundries transform refined materials into complex micro-architecture: TSMC fabricates monolithic 3nm Apple S11 SiP chips using extreme ultraviolet (EUV) photolithography; LG Display and Samsung Display manufacture wide-angle LTPO3 OLED matrix panels; Sunwoda and Desay assemble high-density lithium-ion pouch cells; and STMicroelectronics produces MEMS bio-sensing diodes.',
        locs: 'TSMC (Taiwan), LG Display (S. Korea), Sunwoda/Desay (China), STMicro (France/Singapore)',
        ops: '3nm EUV Photolithography, LTPO Evaporation, Battery Pouch Stacking',
        deliverable: 'Monolithic 3nm Dies, Flexible OLED Panels, Battery Pouch Cells',
        disclosure: 'All primary Tier-1 foundries verified via Apple Supplier List'
      },
      3: {
        tag: 'Stage 03 of 06 · Component Processing',
        category: 'Component Processing',
        audit: '✓ Audited Tier-1 Precision Machining Facilities',
        title: 'Component Processing: 5-Axis CNC, Polishing & PVD Finishing',
        desc: 'Raw component blanks undergo multi-axis precision machining. Forged titanium billets are carved into the ultra-thin Series 11 case and Digital Crown via high-speed 5-axis CNC cutters. Sapphire crystal boules are sliced into curved front lenses, lapped with diamond slurry, and coated with oleophobic vacuum layers. Multi-layer rigid-flex high-density interconnect (HDI) substrates are laser etched.',
        locs: 'Foxconn & BYD (Shenzhen & Zhengzhou), Lens Tech (Hunan), Biel Crystal (Guangdong)',
        ops: '5-Axis High-Speed CNC Milling, Diamond Lapping, Oleophobic PVD',
        deliverable: 'Milled Titanium Enclosures, Polished Sapphire Lenses, HDI PCBs',
        disclosure: 'Proprietary PVD coating chemical ratios are trade secrets not publicly disclosed'
      },
      4: {
        tag: 'Stage 04 of 06 · Final Assembly',
        category: 'Final Assembly',
        audit: '✓ Apple Zero Waste & Clean Energy Certified',
        title: 'Assembly: Cleanroom Surface-Mount & Robotic Integration',
        desc: 'In Class 10,000 cleanrooms, automated SMT pick-and-place systems position hundreds of micro-components onto the S11 substrate. Multi-axis robotic arms position the battery pouch, custom Taptic Engine, speaker chamber, and optical heart-rate sensor package into the CNC titanium enclosure. Automated dispensers apply aerospace-grade elastomeric gaskets and UV-curable polymer seals to bond the display and ceramic backing.',
        locs: 'Luxshare (Kunshan & Bac Giang), Foxconn (Zhengzhou & Shenzhen), Compal (Kunshan)',
        ops: 'Robotic Micron Pick-and-Place, Laser Sealing, UV Adhesive Dispensing',
        deliverable: 'Hermetically Sealed, Fully Integrated Apple Watch Units',
        disclosure: 'Cleanroom integration campuses documented in Apple Supplier List'
      },
      5: {
        tag: 'Stage 05 of 06 · Testing & Validation',
        category: 'Testing & QA',
        audit: '✓ 100% Automated Multi-Chamber QA Mandate',
        title: 'Testing: 100% Multi-Chamber Sensor & Hydrostatic QA',
        desc: 'Every single assembled watch is routed into integrated automated quality assurance cells. Tests include 50-meter hydrostatic chamber pressure immersion (ISO 22810:2010), laser spectrophotometer calibration of blood oxygen (SpO2) and optical heart-rate diodes, anechoic soundproof acoustic frequency testing for dual microphones and speaker, and RF Faraday chamber verification of LTE, Wi-Fi 6, and Ultra Wideband radios.',
        locs: 'On-site automated test corridors in Kunshan, Zhengzhou, and Bac Giang',
        ops: '50m Hydrostatic Immersion, Anechoic Tuning, Faraday RF Testing',
        deliverable: 'Individually Calibrated & Certified Production Hardware',
        disclosure: '100% testing executed inside cleanroom facility testing corridors'
      },
      6: {
        tag: 'Stage 06 of 06 · Fiber Packaging',
        category: 'Packaging & Logistics Prep',
        audit: '✓ Zero Plastic Packaging Certification',
        title: 'Packaging: 100% Fiber Sealing & Pallet Density Optimization',
        desc: 'Finished Apple Watch Series 11 units are paired with their customer-selected band and magnetic fast charger. Packed in 100% fiber-based compact retail packaging made of recycled paper and wood fiber with zero plastic wrap and tamper-evident tear tabs. Boxes are consolidated onto specialized lightweight air-cargo pallets designed to maximize aircraft payload density.',
        locs: 'Assembly outbound logistics docks in Kunshan, Zhengzhou, and Bac Giang',
        ops: 'Thermoformed Pulp Tray Insertion, Tamper Sealing, Palletization',
        deliverable: 'Flight-Ready Air Cargo Pallets of Packaged Retail Units',
        disclosure: '100% fiber packaging verified under Apple 2030 Carbon Neutral goals'
      }
    };

    const activateStage = (stageNum) => {
      const data = mfgStages[stageNum];
      if (!data) return;

      // Update stepper buttons
      stepperBtns.forEach((btn) => {
        const btnStep = btn.dataset.mfgStep || btn.getAttribute('data-mfg-step');
        const isMatch = btnStep === String(stageNum);
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', String(isMatch));
      });

      // Update inspector card with smooth transition feedback
      if (inspectorCard) {
        inspectorCard.style.opacity = '0.7';
        inspectorCard.style.transform = 'translateY(2px)';
        setTimeout(() => {
          if (tagEl) tagEl.textContent = data.tag;
          if (categoryEl) categoryEl.textContent = data.category;
          if (auditEl) auditEl.textContent = data.audit;
          if (titleEl) titleEl.textContent = data.title;
          if (descEl) descEl.textContent = data.desc;
          if (locsEl) locsEl.textContent = data.locs;
          if (opsEl) opsEl.textContent = data.ops;
          if (delivEl) delivEl.textContent = data.deliverable;
          if (disclosureEl) disclosureEl.textContent = data.disclosure;

          inspectorCard.style.opacity = '1';
          inspectorCard.style.transform = 'translateY(0)';
        }, 60);
      } else {
        if (tagEl) tagEl.textContent = data.tag;
        if (categoryEl) categoryEl.textContent = data.category;
        if (auditEl) auditEl.textContent = data.audit;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (locsEl) locsEl.textContent = data.locs;
        if (opsEl) opsEl.textContent = data.ops;
        if (delivEl) delivEl.textContent = data.deliverable;
        if (disclosureEl) disclosureEl.textContent = data.disclosure;
      }

      // Highlight corresponding card in the flow grid
      stageCards.forEach((card) => {
        const cardStage = card.dataset.stage || card.dataset.stageNum || card.getAttribute('data-stage');
        const isMatch = cardStage === String(stageNum);
        card.classList.toggle('active-card', isMatch);
      });
    };

    stepperBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const step = parseInt(btn.dataset.mfgStep || btn.getAttribute('data-mfg-step'), 10);
        if (!isNaN(step)) {
          activateStage(step);
        }
      });
    });

    stageCards.forEach((card) => {
      card.addEventListener('click', () => {
        const step = parseInt(card.dataset.stage || card.dataset.stageNum || card.getAttribute('data-stage'), 10);
        if (!isNaN(step)) {
          activateStage(step);
        }
      });
    });

    // Initialize to active stage
    activateStage(1);
  }

  /* =========================================================
     MARKETING AND DISTRIBUTION INTERACTIVE LOGIC
     ========================================================= */
  function initMarketingDistributionLogic() {
    const tabBtns = document.querySelectorAll('.dist-tab-btn');
    const regionGroups = document.querySelectorAll('.map-region-group');
    const hubPins = document.querySelectorAll('.map-hub-pin');

    const segmentTagEl = document.getElementById('distSegmentTag');
    const regionNameEl = document.getElementById('distRegionName');
    const regionOverviewEl = document.getElementById('distRegionOverview');
    const hubsEl = document.getElementById('distHubs');
    const channelsEl = document.getElementById('distChannels');
    const featuresEl = document.getElementById('distFeatures');
    const transitEl = document.getElementById('distTransit');
    const airCorridorPath = document.getElementById('airCorridorPath');

    const distData = {
      americas: {
        tag: 'Reportable Segment 01 of 05 · Americas',
        name: 'Americas',
        overview: "Apple's largest commercial market by revenue. Encompasses nationwide retail flagships across the United States, Canada, Mexico, Brazil, and Latin America, directly connected to international express air-cargo gateways in Tennessee and California.",
        hubs: 'Elk Grove, California (Americas operations); Memphis, Tennessee & Louisville, Kentucky (air express sorting gateways); Carlisle, Pennsylvania.',
        channels: '270+ Apple Store architectural flagships, Apple Store Online (same-day courier dispatch in major metros), Tier-1 carriers (Verizon, AT&T, T-Mobile), and Apple Authorized Resellers.',
        features: 'FDA 510(k) cleared ECG and Sleep Apnea detection algorithms; North American cellular bands (Bands 2, 4, 5, 12, 13, 25, 26, 66); Apple Card monthly installments with 0% APR.',
        transit: 'Same-day personal pickup in Apple Stores; 1 to 2 business days standard express delivery via domestic courier networks.',
        flightCurve: 'M 765 205 Q 480 70 195 160'
      },
      europe: {
        tag: 'Reportable Segment 02 of 05 · Europe',
        name: 'Europe',
        overview: 'A sophisticated, high-adoption health and fitness market covering 30+ countries across the European Union, United Kingdom, Switzerland, and the Nordics, supported by dedicated European distribution headquarters.',
        hubs: 'Cork, Ireland (European Operations HQ & Logistics); Eindhoven, Netherlands (central European bonded distribution hub); Leipzig & Cologne (air cargo hubs).',
        channels: '110+ Apple Stores across 14 European nations, Apple Online Store in 20+ localized languages, major telecommunication operators (Vodafone, Deutsche Telekom, Orange, EE).',
        features: 'CE Medical Device mark for ECG and irregular rhythm notifications under EU MDR; localized multilingual Siri; WEEE recycling take-back directives; USB-C fast charging mandate compliance.',
        transit: 'Next-day store pickup; 1 to 3 business days direct-to-home courier fulfillment via DHL Express and UPS Europe.',
        flightCurve: 'M 765 205 Q 620 90 470 130'
      },
      china: {
        tag: 'Reportable Segment 03 of 05 · Greater China',
        name: 'Greater China',
        overview: 'One of Apple’s most strategically vital production and consumer regions, spanning mainland China, Hong Kong, and Taiwan with extensive urban retail presence and rapid direct-from-factory fulfillment loops.',
        hubs: 'Shanghai Regional Distribution Center, Shenzhen Bonded Logistics Park, and Hong Kong Air Cargo Terminal (SuperTerminal 1).',
        channels: '57 architectural flagship Apple Stores, Apple Online Store (WeChat Mini Program & Tmall official flagship), national carriers (China Mobile, China Telecom, China Unicom).',
        features: 'National Medical Products Administration (NMPA) Class-II medical certification; native transit card support across 300+ cities via Apple Pay; eSIM provisioning via China Unicom/Telecom.',
        transit: 'Same-day 2-hour courier delivery in top-tier metro cities; next-day nationwide direct dispatch.',
        flightCurve: 'M 765 205 Q 750 180 765 205'
      },
      japan: {
        tag: 'Reportable Segment 04 of 05 · Japan',
        name: 'Japan',
        overview: 'A flagship market characterized by exceptionally high Apple Watch adoption and deep integration with urban public transport networks and mobile contactless payment infrastructure.',
        hubs: 'Tokyo Central Logistics Center; Narita & Haneda International Airport air freight customs clearance facilities.',
        channels: '10 landmark Apple Stores (Ginza, Marunouchi, Shinjuku, Omotesando, Shibuya), Apple Online Store, nationwide carriers (NTT Docomo, KDDI au, SoftBank, Rakuten Mobile).',
        features: 'Hardware-integrated FeliCa NFC chip for contactless Suica, PASMO, and ICOCA train transit passes; PMDA medical certification for Afib and ECG.',
        transit: 'Same-day courier dispatch in Tokyo/Kanto; next-morning delivery across Honshu.',
        flightCurve: 'M 765 205 Q 810 180 850 185'
      },
      apac: {
        tag: 'Reportable Segment 05 of 05 · Rest of Asia Pacific',
        name: 'Rest of Asia Pacific',
        overview: 'Encompassing dynamic growth markets across Australia, South Korea, Singapore, India, the United Arab Emirates, Saudi Arabia, New Zealand, and Southeast Asia.',
        hubs: 'Singapore Changi Airport Logistics Hub (regional hub); Incheon (South Korea); Sydney (Oceania); Dubai Logistics City (Middle East).',
        channels: 'Expanding flagship Apple Stores (e.g. Marina Bay Sands, Apple Gangnam, BKC Mumbai, Saket New Delhi, Dubai Mall), Apple Online Store, regional carriers.',
        features: 'Multilingual voice dictation (Hindi, Korean, Arabic, Thai, Vietnamese); localized cellular spectrum support; temperature-resistant battery thermal algorithms.',
        transit: '1 to 3 business days international express fulfillment from regional distribution depots.',
        flightCurve: 'M 765 205 Q 780 250 745 305'
      }
    };

    const activateRegion = (regionKey) => {
      const data = distData[regionKey];
      if (!data) return;

      // Update tab buttons
      tabBtns.forEach((btn) => {
        const isMatch = btn.dataset.region === regionKey;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', String(isMatch));
      });

      // Update SVG map region highlighting
      regionGroups.forEach((group) => {
        const isMatch = group.dataset.region === regionKey;
        group.classList.toggle('active-region', isMatch);
      });

      // Update hub pins highlighting
      hubPins.forEach((pin) => {
        const isMatch = pin.dataset.region === regionKey;
        pin.classList.toggle('active-pin', isMatch);
      });

      // Animate air corridor path
      if (airCorridorPath && data.flightCurve) {
        airCorridorPath.setAttribute('d', data.flightCurve);
      }

      // Update HUD info card
      if (segmentTagEl) segmentTagEl.textContent = data.tag;
      if (regionNameEl) regionNameEl.textContent = data.name;
      if (regionOverviewEl) regionOverviewEl.textContent = data.overview;
      if (hubsEl) hubsEl.textContent = data.hubs;
      if (channelsEl) channelsEl.textContent = data.channels;
      if (featuresEl) featuresEl.textContent = data.features;
      if (transitEl) transitEl.textContent = data.transit;
    };

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const region = btn.dataset.region;
        activateRegion(region);
      });
    });

    regionGroups.forEach((group) => {
      group.addEventListener('click', () => {
        const region = group.dataset.region;
        activateRegion(region);
      });
    });

    hubPins.forEach((pin) => {
      pin.addEventListener('click', () => {
        const region = pin.dataset.region;
        activateRegion(region);
      });
    });
  }

  // Safe DOM ready execution (supports deferred ES modules and Live Server)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
