
// src/components/ui/DeleteConfirmationModal.tsx
'use client';

import React from 'react';
import { Button } from './button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType?: string; // Ex: 'usuário', 'domínio'
  itemName?: string; // Ex: 'Alice Admin', 'exemplo.com'
}

/**
 * Modal genérico de confirmação de exclusão.
 * 
 * Exibe uma mensagem de confirmação antes de realizar uma ação de exclusão,
 * prevenindo exclusões acidentais.
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemType = 'item', itemName = 'selecionado' }: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl border border-border">
        <h2 className="mb-4 text-xl font-bold text-foreground">Confirmar Exclusão</h2>
        <p className="mb-6 text-muted-foreground">
          Tem certeza que deseja excluir o {itemType} <span className="font-semibold text-foreground">{itemName}</span>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
