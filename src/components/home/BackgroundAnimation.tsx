import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  avatar_url: string | null;
}

const BackgroundAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Fetch profile image URL
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .single();
        
        if (error) {
          console.error('Error fetching profile image:', error);
          return;
        }
        
        if (data?.avatar_url) {
          setProfileImageUrl(data.avatar_url);
        } else {
          // Use placeholder if no avatar
          setProfileImageUrl(`${import.meta.env.BASE_URL}placeholder.svg`);
        }
      } catch (error) {
        console.error('Error in profile image fetch:', error);
      }
    };

    fetchProfileImage();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !profileImageUrl) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 500;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Set up canvas
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    containerRef.current.appendChild(canvas);

    // Load the profile image texture
    const textureLoader = new THREE.TextureLoader();
    let profileTexture: THREE.Texture;

    // Process the image to use for flying profile pictures
    const processProfileImage = (url: string, callback: () => void) => {
      textureLoader.load(url, (texture) => {
        profileTexture = texture;
        profileTexture.minFilter = THREE.LinearFilter;
        callback();
      }, undefined, (error) => {
        console.error('Error loading profile texture:', error);
        // Fallback to a default texture
        textureLoader.load(`${import.meta.env.BASE_URL}placeholder.svg`, (texture) => {
          profileTexture = texture;
          profileTexture.minFilter = THREE.LinearFilter;
          callback();
        });
      });
    };

    // Create flying profile pictures
    const createFlyingProfiles = () => {
      const profilesGroup = new THREE.Group();
      const profileCount = 18; // Reduced to 18 (fewer but bigger!)
      
      for (let i = 0; i < profileCount; i++) {
        // Create a wider range of sizes with MUCH more gigantic profiles
        let sizeFactor;
        
        if (i < 2) {
          // Ultra gigantic profile pictures (300-400)
          sizeFactor = 300 + Math.random() * 100;
        } else if (i < 4) {
          // Super gigantic profile pictures (200-280)
          sizeFactor = 200 + Math.random() * 80;
        } else if (i < 7) {
          // Gigantic profile pictures (100-180) 
          sizeFactor = 100 + Math.random() * 80;
        } else if (i < 11) {
          // Medium profile pictures (30-60)
          sizeFactor = 30 + Math.random() * 30;
        } else {
          // Tiny dwarf profile pictures (4-12)
          sizeFactor = 4 + Math.random() * 8;
        }
        
        // Create circular clipping for profile pics
        const circleGeometry = new THREE.CircleGeometry(sizeFactor / 2, 32);
        
        // Use the profile texture for the material with dimmer opacity
        const profileMaterial = new THREE.MeshBasicMaterial({
          map: profileTexture,
          transparent: true,
          opacity: 0.3 + Math.random() * 0.2, // Reduced from 0.7 to 0.3-0.5 range
        });
        
        const profile = new THREE.Mesh(circleGeometry, profileMaterial);
        
        // Position profiles randomly in 3D space
        // Much more depth distribution based on size
        // Ultra gigantic ones should appear significantly further back
        let depth;
        
        if (sizeFactor > 200) {
          // Ultra gigantic profiles appear far in the background
          depth = -800 - Math.random() * 400;
        } else if (sizeFactor > 100) {
          // Gigantic profiles appear in mid-background
          depth = -600 - Math.random() * 200;
        } else if (sizeFactor > 30) {
          // Medium profiles in middle ground
          depth = -300 - Math.random() * 200;
        } else {
          // Dwarf profiles appear closer to viewer
          depth = -100 - Math.random() * 150;
        }
        
        profile.position.x = Math.random() * 2400 - 1200; // Even wider spread
        profile.position.y = Math.random() * 1500 - 750; // Even wider spread
        profile.position.z = depth;
        
        // Random rotation
        profile.rotation.z = Math.random() * Math.PI * 2;
        
        // Store movement data in userData with size-dependent speeds
        // Larger pictures should move MUCH slower, smaller ones much faster
        // The bigger, the slower
        const speedFactor = Math.max(0.05, 1 - Math.min(0.95, sizeFactor / 200)); 
        
        profile.userData = {
          speedX: (Math.random() - 0.5) * 2 * speedFactor, // Slower for big profiles
          speedY: (Math.random() - 0.5) * 2 * speedFactor,
          speedRotation: (Math.random() - 0.5) * 0.02 * speedFactor,
          scalePulse: {
            speed: 0.1 + Math.random() * 0.3, // Slower pulsing for bigger images
            min: 0.95,
            max: 1.05, // Gentler pulsing
            value: Math.random()
          },
          size: sizeFactor // Store size for reference
        };
        
        // Add a more subtle glow effect with dimmer colors
        const glowGeometry = new THREE.CircleGeometry((sizeFactor / 2) * 1.2, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xcccccc, // Changed from white to light gray
          transparent: true,
          opacity: 0.05 + (sizeFactor / 300) * 0.08, // Reduced opacity by ~50%
          side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.1;
        profile.add(glow);
        
        profilesGroup.add(profile);
      }
      
      return profilesGroup;
    };

    // Create all scene elements once the profile texture is loaded
    processProfileImage(profileImageUrl, () => {
      const flyingProfiles = createFlyingProfiles();
      scene.add(flyingProfiles);
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Mouse movement tracking for interactivity
      const mouse = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
      };
      
      const handleMouseMove = (event: MouseEvent) => {
        mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      
      // Animation loop
      const clock = new THREE.Clock();
      let frameId: number;
      
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        // Update flying profiles
        flyingProfiles.children.forEach((profile: THREE.Object3D) => {
          const profileMesh = profile as THREE.Mesh;
          const userData = profileMesh.userData;
          
          // Move the profile
          profileMesh.position.x += userData.speedX;
          profileMesh.position.y += userData.speedY;
          
          // Rotate the profile
          profileMesh.rotation.z += userData.speedRotation;
          
          // Apply pulsing scale effect
          userData.scalePulse.value += userData.scalePulse.speed * 0.01;
          const pulseFactor = 
            userData.scalePulse.min + 
            (Math.sin(userData.scalePulse.value) + 1) / 2 * 
            (userData.scalePulse.max - userData.scalePulse.min);
          
          profileMesh.scale.set(pulseFactor, pulseFactor, pulseFactor);
          
          // Wrap around when out of screen with much larger buffer for gigantic profiles
          const buffer = 100 + userData.size * 1.5; // Much larger buffer for bigger profiles
          const maxX = (camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) + buffer;
          const maxY = (camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) + buffer;
          
          if (profileMesh.position.x > maxX) {
            profileMesh.position.x = -maxX;
          } else if (profileMesh.position.x < -maxX) {
            profileMesh.position.x = maxX;
          }
          
          if (profileMesh.position.y > maxY) {
            profileMesh.position.y = -maxY;
          } else if (profileMesh.position.y < -maxY) {
            profileMesh.position.y = maxY;
          }
        });
        
        // Smooth camera movement based on mouse position
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
        
        // Apply subtle camera movement based on mouse
        camera.position.x = mouse.x * 30;
        camera.position.y = mouse.y * 30;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Clean up function
      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        
        // Dispose of resources
        flyingProfiles.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        
        scene.clear();
        renderer.dispose();
      };
    });

    return () => {
      if (containerRef.current && containerRef.current.contains(canvas)) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, [profileImageUrl]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        filter: 'blur(4px) brightness(0.8)', // Added brightness reduction to make it dimmer
        WebkitFilter: 'blur(4px) brightness(0.8)' // For Safari support
      }}
    />
  );
};

export default BackgroundAnimation;