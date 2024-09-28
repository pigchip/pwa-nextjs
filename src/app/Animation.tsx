"use client";

import Image from 'next/image';

const Animation = () => {
  return (
    <div className="flex justify-center items-center h-[93vh] sm:h-screen bg-gray-100">
      <Image
        unoptimized
        src="/main_anim.gif"
        alt="Animación"
        width={500} // Ajusta el tamaño de la imagen según tu diseño
        height={500}
        priority
      />
    </div>
  );
};

export default Animation;
