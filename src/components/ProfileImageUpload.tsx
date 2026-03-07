import { useState, useRef } from 'react';
import { Upload, User, X, Move } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { studentAvatars } from '../data/studentImages';
import { ProfileImageCropper } from './ProfileImageCropper';

const DEFAULT_AVATARS = studentAvatars;

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  currentImageType?: 'upload' | 'avatar';
  onImageChange: (url: string, type: 'upload' | 'avatar') => void;
}

export default function ProfileImageUpload({
  currentImageUrl,
  currentImageType,
  onImageChange,
}: ProfileImageUploadProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    currentImageType === 'avatar' ? currentImageUrl || null : null
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    currentImageType === 'upload' ? currentImageUrl || null : null
  );
  const [uploading, setUploading] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToPosition, setImageToPosition] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setUploadedImage(publicUrl);
      setSelectedAvatar(null);
      setImageToPosition(publicUrl);
      setShowCropper(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setUploadedImage(null);
    onImageChange(avatarUrl, 'avatar');
    setShowAvatars(false);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setSelectedAvatar(null);
    onImageChange('', 'avatar');
  };

  const handleSavePosition = (position: { x: number; y: number }) => {
    setImagePosition(position);
    setShowCropper(false);
    if (imageToPosition) {
      onImageChange(imageToPosition, 'upload');
    }
  };

  const handleCancelPosition = () => {
    setShowCropper(false);
    setUploadedImage(null);
    setImageToPosition(null);
  };

  const handlePositionImage = () => {
    const imageUrl = uploadedImage || selectedAvatar;
    if (imageUrl) {
      setImageToPosition(imageUrl);
      setShowCropper(true);
    }
  };

  const currentImage = uploadedImage || selectedAvatar;

  return (
    <>
      {showCropper && imageToPosition && (
        <ProfileImageCropper
          imageUrl={imageToPosition}
          onSave={handleSavePosition}
          onCancel={handleCancelPosition}
          initialPosition={imagePosition}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-green-500 flex items-center justify-center overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-600" />
            )}
          </div>
          {currentImage && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAvatars(!showAvatars)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              {showAvatars ? 'Hide Avatars' : 'Choose Avatar'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            {currentImage && (
              <button
                type="button"
                onClick={handlePositionImage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Move className="w-4 h-4" />
                Position
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400">
            Choose an avatar, upload your own photo (max 5MB), or reposition current image
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {showAvatars && (
        <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-semibold text-white">Select Your Avatar</h4>
            <button
              onClick={() => setShowAvatars(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Choose from our collection of professional avatars</p>
          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {DEFAULT_AVATARS.map((avatarUrl, index) => (
              <button
                key={index}
                onClick={() => handleAvatarSelect(avatarUrl)}
                className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  selectedAvatar === avatarUrl
                    ? 'border-green-500 ring-2 ring-green-500 shadow-lg shadow-green-500/20'
                    : 'border-gray-700 hover:border-green-500'
                }`}
              >
                <img
                  src={avatarUrl}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedAvatar === avatarUrl && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
