import React, { useState } from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';

const SwipeToDelete: React.FC = () => {
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const [swipeEnd, setSwipeEnd] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX);
    setDeleteIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStart !== null) {
      setSwipeEnd(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (swipeStart !== null && swipeEnd !== null && deleteIndex !== null) {
      const swipeDistance = swipeStart - swipeEnd;
      if (swipeDistance > 100) {
        // Perform delete action
        console.log(`Delete item at index: ${deleteIndex}`);
        // Reset state
        setSwipeStart(null);
        setSwipeEnd(null);
        setDeleteIndex(null);
      } else {
        // Reset state if swipe distance is not enough
        setSwipeStart(null);
        setSwipeEnd(null);
        setDeleteIndex(null);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Evidencias</h1>
      <p className="mb-6">Pulsa <AssignmentIcon className="inline-block" /> para consultar alguna evidencia. Mantén presionado para borrar.</p>
      
      {[1, 2, 3].map((incident, index) => (
        <div
          key={incident}
          className="relative flex items-center justify-between p-4 mb-4 bg-white border rounded shadow"
          onTouchStart={(e) => handleTouchStart(index, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center">
            <AssignmentIcon className="text-blue-500" />
            <span className="ml-2">Evidencia - Incidente {incident}</span>
          </div>
          {deleteIndex === index && swipeEnd !== null && swipeStart !== null && (swipeStart - swipeEnd) > 100 && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-16 bg-red-500 text-white">
              Delete
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => console.log('Solicitar')}
        className="w-full py-2 mt-6 text-white bg-green-500 rounded hover:bg-green-600"
      >
        Solicitar
      </button>
    </div>
  );
};

export default SwipeToDelete;