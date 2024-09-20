import { useState } from 'react';
import Container from './Container'; 

const Tutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false); // Controla el estado de inicio

  const steps = [
    {
      title: "Planifica rutas fácil y sin problemas",
      description:
        "Navega fácilmente a través de nuestro mapa interactivo y menú intuitivo para planificar y revisar tus rutas con solo unos pocos clics.",
      buttonText: "Next",
      gif: "/location-marker.gif", // GIF de planificación de rutas
    },
    {
      title: "Reporta incidentes rápidamente",
      description:
        "La app alerta a los supervisores correspondientes, validando cada reporte.",
      buttonText: "Next",
      gif: "/document.gif", // GIF de alertas o incidentes
    },
    {
      title: "Explora Rutas Óptimas con Nuestro Algoritmo Inteligente",
      description:
        "Encuentra la mejor ruta con nuestro algoritmo que considera distancia, disponibilidad y precio. Navega de manera óptima con un clic.",
      buttonText: "Iniciar",
      gif: "/algorithm.gif", // GIF de rutas óptimas
    },
  ];

  const handleNext = () => {
    if (steps[currentStep].buttonText === "Iniciar") {
      setHasStarted(true); // Cambia al estado de iniciado
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setHasStarted(true); // Cambia al estado de iniciado al hacer clic en "Saltar"
  };

  return (
    <>
      {hasStarted ? (
        <Container /> // Muestra el componente Container cuando el tutorial ha comenzado
      ) : (
        <div className="flex flex-col items-center justify-between h-[93vh] sm:h-screen mx-auto p-6 bg-white">
          {/* Contenedor fijo para el GIF con margen superior */}
          <div className="flex justify-center w-full mt-16 mb-8">
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-md overflow-hidden">
              <img
                src={steps[currentStep].gif}
                alt="Tutorial Gif"
                className="object-contain w-full h-full bg-white"
              />
            </div>
          </div>

          {/* Contenido principal sin limitaciones */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mb-8 text-[#6C7976]">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Navegación */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`prev-btn px-6 py-2 rounded-full ${
                  currentStep === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#a7d8cb] text-white"
                }`}
              >
                Prev
              </button>
              <div className="pagination flex items-center">
                {steps.map((_, index) => (
                  <span
                    key={index}
                    className={`dot h-2 w-2 mx-1 rounded-full ${
                      index === currentStep ? "bg-teal-500" : "bg-gray-300"
                    }`}
                  ></span>
                ))}
              </div>
              <button
                onClick={handleNext}
                className={`next-btn px-6 py-2 rounded-full ${
                  steps[currentStep].buttonText === "Iniciar"
                    ? "bg-purple-500 text-white"
                    : "bg-teal-500 text-white"
                }`}
              >
                {steps[currentStep].buttonText}
              </button>
            </div>
            <button
              onClick={handleSkip}
              className="skip-btn text-gray-500 w-full text-center"
            >
              Saltar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Tutorial;
