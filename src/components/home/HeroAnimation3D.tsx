import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const HeroAnimation3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set up scene with transparent background
    const scene = new THREE.Scene();
    scene.background = null; // Explicitly set background to null for transparency
    
    // Set up camera with wider field of view
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    camera.position.set(0, 0, 2.5);
    
    // Zoom control variables
    let currentZoom = 2.5;
    const minZoom = 1.5;  // Closest zoom (closer to laptop)
    const maxZoom = 4.0;  // Farthest zoom (away from laptop)
    const zoomSpeed = 0.2;
    
    // Improved renderer setup for perfect clarity and transparency
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: true, // Enable transparency
      premultipliedAlpha: false, // Ensure proper alpha blending
      preserveDrawingBuffer: false // Better transparency handling
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Enhanced transparency - ensure completely clear background
    renderer.setClearColor(0x000000, 0);
    
    // Apply completely transparent background to the canvas element
    const canvas = renderer.domElement;
    canvas.style.background = 'transparent';
    canvas.style.backgroundColor = 'transparent';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'auto';
    canvas.style.zIndex = '1';
    
    // Ensure container has perfect transparency
    containerRef.current.style.backgroundColor = 'transparent';
    containerRef.current.style.background = 'transparent';
    containerRef.current.style.backdropFilter = 'none'; // Remove any blur effects
    containerRef.current.style.WebkitBackdropFilter = 'none'; // For Safari
    containerRef.current.style.position = 'relative';
    
    containerRef.current.appendChild(canvas);
    
    // Add lighting - subtle ambient for overall visibility
    const ambientLight = new THREE.AmbientLight(0xffffeb, 0.4);
    scene.add(ambientLight);
    
    // Main light to cast shadows and highlights
    const mainLight = new THREE.DirectionalLight(0xffffeb, 0.8);
    mainLight.position.set(2, 2, 3);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -3;
    mainLight.shadow.camera.right = 3;
    mainLight.shadow.camera.top = 3;
    mainLight.shadow.camera.bottom = -3;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    
    // Rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x6fc3df, 0.5);
    rimLight.position.set(-2, 1, -1);
    scene.add(rimLight);
    
    // Monitor glow light
    const screenLight = new THREE.PointLight(0x6fc3df, 1);
    screenLight.position.set(0, 0.1, 0.2);
    screenLight.distance = 2;
    screenLight.intensity = 0.5;
    scene.add(screenLight);
    
    // Create floating laptop
    const createLaptop = () => {
      const laptopGroup = new THREE.Group();
      
      // Base/bottom part of laptop
      const baseGeometry = new THREE.BoxGeometry(1, 0.05, 0.75);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2
      });
      const laptopBase = new THREE.Mesh(baseGeometry, baseMaterial);
      laptopBase.castShadow = true;
      laptopBase.receiveShadow = true;
      laptopGroup.add(laptopBase);
      
      // Rounded edges for base (front edge)
      const baseEdgeGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 16, 1, false, 0, Math.PI);
      const baseEdge = new THREE.Mesh(baseEdgeGeometry, baseMaterial);
      baseEdge.rotation.x = Math.PI / 2;
      baseEdge.rotation.z = Math.PI / 2;
      baseEdge.position.set(0, 0, 0.375);
      laptopBase.add(baseEdge);
      
      // Back edge (hinge)
      const hingeGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 16);
      const hinge = new THREE.Mesh(hingeGeometry, baseMaterial);
      hinge.rotation.x = Math.PI / 2;
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(0, 0, -0.375);
      laptopBase.add(hinge);
      
      // Small indentation (touchpad)
      const touchpadGeometry = new THREE.PlaneGeometry(0.6, 0.4);
      const touchpadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.3,
        metalness: 0.8
      });
      const touchpad = new THREE.Mesh(touchpadGeometry, touchpadMaterial);
      touchpad.rotation.x = -Math.PI / 2;
      touchpad.position.y = 0.026;
      touchpad.position.z = 0.1;
      laptopBase.add(touchpad);
      
      // Keyboard
      const keyboardGeometry = new THREE.PlaneGeometry(0.85, 0.5);
      const createKeyboardTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 300;
        const context = canvas.getContext('2d');
        if (context) {
          // Keyboard background
          context.fillStyle = '#232323';
          context.fillRect(0, 0, 512, 300);
          
          // Draw keyboard keys
          context.fillStyle = '#2e2e2e';
          const keySize = 30;
          const keySpacing = 6;
          const startX = 20;
          const startY = 20;
          
          for (let row = 0; row < 6; row++) {
            const keys = row === 5 ? 8 : 12;
            for (let col = 0; col < keys; col++) {
              if (row === 5 && col === 3) {
                // Spacebar
                context.fillRect(
                  startX + col * (keySize + keySpacing) - keySize, 
                  startY + row * (keySize + keySpacing),
                  keySize * 3, 
                  keySize
                );
                col += 2;
              } else {
                context.fillRect(
                  startX + col * (keySize + keySpacing), 
                  startY + row * (keySize + keySpacing),
                  keySize, 
                  keySize
                );
              }
            }
          }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
      };
      
      const keyboardMaterial = new THREE.MeshStandardMaterial({ 
        map: createKeyboardTexture(),
        roughness: 0.8
      });
      const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
      keyboard.rotation.x = -Math.PI / 2;
      keyboard.position.y = 0.026;
      keyboard.position.z = -0.1;
      laptopBase.add(keyboard);
      
      // Create screen part of laptop
      const screenBaseGeometry = new THREE.BoxGeometry(1, 0.7, 0.05);
      const screenBaseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2
      });
      const screenBase = new THREE.Mesh(screenBaseGeometry, screenBaseMaterial);
      
      // Position the screen (tilted)
      screenBase.position.z = -0.375;
      screenBase.position.y = 0.35;
      screenBase.rotation.x = Math.PI / 6;
      screenBase.castShadow = true;
      
      // Logo on back of screen
      const logoGeometry = new THREE.CircleGeometry(0.15, 32);
      const logoMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      });
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.position.z = -0.026;
      logo.rotation.x = Math.PI;
      screenBase.add(logo);
      
      // Create screen content (VSCode-like interface)
      const screenGeometry = new THREE.PlaneGeometry(0.9, 0.6);
      
      const createScreenTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 680;
        const context = canvas.getContext('2d');
        if (context) {
          // VSCode-like background
          context.fillStyle = '#1e1e1e';
          context.fillRect(0, 0, 1024, 680);
          
          // Title bar
          context.fillStyle = '#323233';
          context.fillRect(0, 0, 1024, 30);
          
          // Title text
          context.font = '14px sans-serif';
          context.fillStyle = '#cccccc';
          context.fillText('portfolio.tsx - Mustaqeem Portfolio - Visual Studio Code', 10, 20);
          
          // Window controls
          context.fillStyle = '#ff6157'; // Close button
          context.beginPath();
          context.arc(1004, 15, 6, 0, Math.PI * 2);
          context.fill();
          
          context.fillStyle = '#febc2e'; // Minimize button
          context.beginPath();
          context.arc(984, 15, 6, 0, Math.PI * 2);
          context.fill();
          
          context.fillStyle = '#28c840'; // Expand button
          context.beginPath();
          context.arc(964, 15, 6, 0, Math.PI * 2);
          context.fill();
          
          // Sidebar
          context.fillStyle = '#252526';
          context.fillRect(0, 30, 50, 650);
          
          // File icons in sidebar
          const iconColors = ['#6cbbfa', '#dd6b7b', '#e5c17c', '#7ece9b', '#b180d7'];
          for (let i = 0; i < 8; i++) {
            context.fillStyle = iconColors[i % iconColors.length];
            context.fillRect(15, 50 + i * 30, 20, 15);
          }
          
          // Editor area
          context.fillStyle = '#1e1e1e';
          context.fillRect(50, 30, 974, 650);
          
          // Add code syntax highlighting
          context.font = '13px monospace';
          
          // Line numbers
          context.fillStyle = '#858585';
          for (let line = 1; line <= 20; line++) {
            context.fillText(String(line), 60, 30 + line * 20);
          }
          
          // React component code
          const renderLine = (lineNum: number, text: string, color: string = '#cccccc') => {
            context.fillStyle = color;
            context.fillText(text, 90, 30 + lineNum * 20);
          };
          
          renderLine(1, 'import React from "react";', '#dd6b7b');
          renderLine(2, 'import { motion } from "framer-motion";', '#dd6b7b');
          renderLine(3, 'import * as THREE from "three";', '#dd6b7b');
          renderLine(4, '');
          renderLine(5, 'const HeroAnimation3D: React.FC = () => {', '#6cbbfa');
          renderLine(6, '  const containerRef = useRef<HTMLDivElement>(null);', '#cccccc');
          renderLine(7, '  const [isRotating, setIsRotating] = useState(true);', '#cccccc');
          renderLine(8, '');
          renderLine(9, '  useEffect(() => {', '#e5c17c');
          renderLine(10, '    // Initialize Three.js scene', '#7da55a');
          renderLine(11, '    const scene = new THREE.Scene();', '#cccccc');
          renderLine(12, '    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);', '#cccccc');
          renderLine(13, '    const renderer = new THREE.WebGLRenderer({ antialias: true });', '#cccccc');
          renderLine(14, '');
          renderLine(15, '    // Create floating laptop model', '#7da55a');
          renderLine(16, '    const laptop = createLaptop();', '#cccccc');
          renderLine(17, '    scene.add(laptop);', '#cccccc');
          renderLine(18, '');
          renderLine(19, '    // Animation loop', '#7da55a');
          renderLine(20, '    const animate = () => {', '#6cbbfa');
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
      };
      
      const screenMaterial = new THREE.MeshStandardMaterial({ 
        map: createScreenTexture(),
        roughness: 0.6,
        emissive: 0xffffff,
        emissiveIntensity: 0.2 // Screen glow
      });
      
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.z = 0.026;
      screenBase.add(screen);
      
      laptopGroup.add(screenBase);
      
      // Add subtle lighting effects
      const keyboardLight = new THREE.PointLight(0x3399ff, 0.5, 0.5);
      keyboardLight.position.set(0, 0.1, 0);
      laptopBase.add(keyboardLight);
      
      return laptopGroup;
    };
    
    const laptop = createLaptop();
    scene.add(laptop);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Device-specific adjustments
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Adjust camera position for mobile view
      camera.position.z = 3.5;
      // Reduce animation intensity on mobile
      laptop.rotation.x = 0.2;
    }
    
    handleResize();
    
    // Animation variables
    let frameId: number;
    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    // Handle mouse movement
    const handlePointerMove = (event: PointerEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      targetRotationY = x * 0.5;
      targetRotationX = y * 0.3;
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    
    // Handle mouse wheel for zooming
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      // Determine zoom direction (in or out)
      const zoomDirection = Math.sign(event.deltaY);
      
      // Update current zoom level with limits
      currentZoom += zoomDirection * zoomSpeed;
      currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom));
      
      // Apply zoom to camera position
      camera.position.z = currentZoom;
      camera.updateProjectionMatrix();
    };
    
    // Add wheel event listener with passive: false to allow preventDefault
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
    
    // Animation loop
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Smooth rotation with mouse movement
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;
      
      // Apply rotation to laptop
      laptop.rotation.x = rotationX;
      laptop.rotation.y = rotationY + (Date.now() * 0.0001);
      
      // Make laptop float up and down subtly
      laptop.position.y = Math.sin(Date.now() * 0.001) * 0.05;
      
      // Update screen glow based on viewing angle
      const screenMesh = laptop.children[1].children[1] as THREE.Mesh;
      if (screenMesh && screenMesh.material) {
        const material = screenMesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.2 + Math.abs(Math.sin(Date.now() * 0.001)) * 0.1;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (containerRef.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
      
      scene.clear();
      renderer.dispose();
      if (containerRef.current && containerRef.current.contains(canvas)) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative" 
      style={{ 
        cursor: 'grab',
        background: 'transparent',
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        zIndex: '1',
        overflow: 'hidden'
      }}
    ></div>
  );
};

export default HeroAnimation3D;