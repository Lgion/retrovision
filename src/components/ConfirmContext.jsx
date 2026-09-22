import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from './ConfirmModal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    confirmVariant: 'danger'
  });
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      if (typeof options === 'string') {
        setModalState({
          isOpen: true,
          title: "Confirmation",
          message: options,
          confirmText: "Oui, quitter",
          cancelText: "Continuer à jouer",
          confirmVariant: "danger"
        });
      } else {
        setModalState({
          isOpen: true,
          title: options.title || "Confirmation",
          message: options.message || "Voulez-vous vraiment continuer ?",
          confirmText: options.confirmText || "Confirmer",
          cancelText: options.cancelText || "Annuler",
          confirmVariant: options.confirmVariant || "danger"
        });
      }
    });
  }, []);

  const handleConfirm = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        confirmVariant={modalState.confirmVariant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Fallback gracieux si hors Provider
    return (options) => Promise.resolve(window.confirm(typeof options === 'string' ? options : options.message));
  }
  return context;
}

export default ConfirmContext;
