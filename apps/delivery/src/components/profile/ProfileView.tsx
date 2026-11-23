import React, { useState } from 'react';
import { MainProfileView } from './MainProfileView';
import { DetailedMyProfileView } from './DetailedMyProfileView';

interface ProfileViewProps {
  onOpenHelpSupport?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenHelpSupport }) => {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'detailed'>('main');

  return (
    <div className="w-full">
      {currentScreen === 'main' ? (
        <MainProfileView
          onOpenMyProfile={() => setCurrentScreen('detailed')}
          onOpenHelpSupport={() => {
            if (onOpenHelpSupport) {
              onOpenHelpSupport();
            }
          }}
        />
      ) : (
        <DetailedMyProfileView onBack={() => setCurrentScreen('main')} />
      )}
    </div>
  );
};
