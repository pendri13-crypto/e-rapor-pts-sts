import React, { useState, useEffect } from 'react';
import { UserAccount } from './types';
import { StorageService } from './services/storage';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { DashboardHome } from './components/DashboardHome';
import { GradeInputView } from './components/guru/GradeInputView';
import { RekapitulasiView } from './components/rekap/RekapitulasiView';
import { LegerNilaiView } from './components/rekap/LegerNilaiView';
import { DataMasterView } from './components/admin/DataMasterView';
import { PengaturanSekolahView } from './components/admin/PengaturanSekolahView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('VII-A');
  const [selectedMapelId, setSelectedMapelId] = useState<string>('PAIBP');

  // Auto-sync cloud data from Supabase on application load
  useEffect(() => {
    StorageService.initCloudSync();

    const handleSync = () => {
      const refreshed = StorageService.getCurrentUser();
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    };

    window.addEventListener('erapor_data_synced', handleSync);
    return () => window.removeEventListener('erapor_data_synced', handleSync);
  }, []);

  // Handle user logout
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  // Handle user login success
  const handleLoginSuccess = (user: UserAccount) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  // Switch user role (demo tester)
  const handleSwitchUser = (user: UserAccount) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  // Navigate with optional class & mapel context
  const handleNavigate = (tab: string, classId?: string, mapelId?: string) => {
    if (classId) setSelectedClassId(classId);
    if (mapelId) setSelectedMapelId(mapelId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not authenticated, render login screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <DashboardHome
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'input-nilai' && (
          <GradeInputView
            currentUser={currentUser}
            initialClassId={selectedClassId}
            initialMapelId={selectedMapelId}
          />
        )}

        {activeTab === 'rekap-3bulan' && (
          <RekapitulasiView
            currentUser={currentUser}
            initialClassId={selectedClassId}
            onNavigateToLeger={(classId) => handleNavigate('leger-nilai', classId)}
            onNavigateToInput={(classId, mapelId) => handleNavigate('input-nilai', classId, mapelId)}
          />
        )}

        {activeTab === 'leger-nilai' && (
          <LegerNilaiView
            currentUser={currentUser}
            initialClassId={selectedClassId}
            onNavigateToInput={(classId, mapelId) => handleNavigate('input-nilai', classId, mapelId)}
          />
        )}

        {activeTab === 'data-master' && currentUser.role === 'SUPER_ADMIN' && (
          <DataMasterView />
        )}

        {activeTab === 'pengaturan' && currentUser.role === 'SUPER_ADMIN' && (
          <PengaturanSekolahView />
        )}
      </main>

      {/* Footer (Hidden on print) */}
      <footer className="border-t border-slate-200 bg-white py-6 mb-16 lg:mb-0 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">e-Rapor PTS SMP</span>
            <span>•</span>
            <span>33 Kelas (VII-A s.d IX-K)</span>
            <span>•</span>
            <span>11 Mata Pelajaran Resmi</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Standar Kurikulum Merdeka</span>
            <span>Rekapitulasi 3 Bulanan Otomatis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
