
// src/components/admin/profile/ProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, updateUserProfile } from '@/app/admin/profile/actions';
import Image from 'next/image';

/**
 * Formulário para edição do perfil do usuário.
 * 
 * Este componente de cliente permite que o usuário visualize e atualize
 * suas informações de perfil, como nome e e-mail.
 */
interface ProfileFormProps {
  initialUser: User;
}

const ProfileForm = ({ initialUser }: ProfileFormProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user.avatar || null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (avatarFile) {
        data.append('avatar', avatarFile);
      } else if (avatarPreview === null) {
        data.append('avatar', ''); // Para remover avatar
      }
      const updatedUser = await updateUserProfile(data);
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      if (updatedUser.avatar) setAvatarPreview(updatedUser.avatar);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="text-center text-muted-foreground">Carregando perfil...</div>;
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <Image src="/images/iconeuniatende.png" alt="Avatar padrão" width={96} height={96} className="object-cover w-full h-full" />
            )}
            {avatarPreview && (
              <button type="button" onClick={handleRemoveAvatar} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-xs">✕</button>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
