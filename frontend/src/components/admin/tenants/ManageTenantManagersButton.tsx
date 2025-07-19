import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Tenant } from '@/lib/definitions';
import ManageTenantManagersModal from './ManageTenantManagersModal';

interface ManageTenantManagersButtonProps {
  tenant: Tenant;
  userRole: string;
}

const ManageTenantManagersButton = ({ tenant, userRole }: ManageTenantManagersButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (userRole !== 'admin') {
    return null; // Não renderiza o botão se o usuário não for admin
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={handleOpenModal} className="text-blue-500 hover:text-blue-700">
        <Users className="h-5 w-5" />
      </Button>
      {isModalOpen && (
        <ManageTenantManagersModal
          tenant={tenant}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ManageTenantManagersButton;
