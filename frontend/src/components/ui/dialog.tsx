import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps & { overlayClassName?: string }> = ({ open, onOpenChange, children, overlayClassName }) => {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${overlayClassName || ''}`}>
      {children}
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={`relative w-full max-w-md sm:max-w-[600px] rounded-lg bg-white p-6 shadow-lg border border-border ${className || ''}`}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4 text-center">{children}</div>;
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h3 className="text-xl font-semibold">{children}</h3>;
};

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return <div className="mt-6 flex justify-end space-x-2">{children}</div>;
};
