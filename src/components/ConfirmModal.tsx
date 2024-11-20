// components/ConfirmModal.tsx

import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
        <Typography id="modal-title" variant="h6" component="h2">
          Confirmar Cambio de Estado
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Estás seguro que deseas validar este incidente? La estación se verá afectada.
        </Typography>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} className="mr-2" style={{ backgroundColor: '#6ABDA6', color: 'white' }}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} variant="contained" style={{ backgroundColor: '#6ABDA6', color: 'white' }}>
            Confirmar
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;