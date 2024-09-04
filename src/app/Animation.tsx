"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

const Animation = () => {
  const totalFrames = 243;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [velocidad, setVelocidad] = useState(13);
  const [images, setImages] = useState<string[]>([]);

  // Precargar todas las imágenes cuando el componente se monta
  useEffect(() => {
    const preloadImages = () => {
      const loadedImages = [];
      for (let i = 0; i < totalFrames; i++) {
        const frameNumber = i.toString().padStart(5, '0');
        const imagePath = `/anim/anim_${frameNumber}.png`;
        loadedImages.push(imagePath);
      }
      setImages(loadedImages);
      setImagesLoaded(true); // Marcamos que todas las imágenes están precargadas
    };

    preloadImages();
  }, []);

  // Efecto para cambiar de imagen
  useEffect(() => {
    if (!imagesLoaded) return;

    const intervalId = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % totalFrames);
    }, velocidad);

    return () => clearInterval(intervalId);
  }, [imagesLoaded, velocidad]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {imagesLoaded ? (
        <Image
          src={images[currentFrame]}
          alt="Animación"
          width={500} // Ajusta el tamaño de la imagen según tu diseño
          height={500}
        />
      ) : (
        <p>Cargando animación...</p>
      )}
    </div>
  );
};

export default Animation;
