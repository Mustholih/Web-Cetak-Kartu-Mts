import React from 'react';
import {
  LayoutDashboard,
  Users,
  ImageUp,
  School,
  BookOpen,
  CreditCard,
  Printer,
  CalendarDays,
  DatabaseBackup,
  Award,
  UserCheck,
} from 'lucide-react';
import { ActiveTab, SchoolIdentity } from '../../types';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  identity: SchoolIdentity;
  totalStudents: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  identity,
  totalStudents,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'data-siswa',
      label: 'Data Siswa',
      icon: <Users className="w-5 h-5" />,
      badge: `${totalStudents}`,
    },
    {
      id: 'upload-foto',
      label: 'Upload Foto Massal',
      icon: <ImageUp className="w-5 h-5" />,
    },
    {
      id: 'identitas-madrasah',
      label: 'Identitas Madrasah',
      icon: <School className="w-5 h-5" />,
    },
    {
      id: 'desain-perpus',
      label: 'Desain Kartu Perpus',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'desain-siswa',
      label: 'Desain Kartu Siswa',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'cetak-kartu',
      label: 'Cetak Kartu Siswa',
      icon: <Printer className="w-5 h-5" />,
      badge: 'Utama',
    },
    {
      id: 'manajemen-ujian',
      label: 'Manajemen Ujian',
      icon: <Award className="w-5 h-5" />,
      badge: 'Baru',
    },
    {
      id: 'data-guru',
      label: 'Data Guru / Pengawas',
      icon: <UserCheck className="w-5 h-5" />,
      badge: 'Guru',
    },
    {
      id: 'tahun-pelajaran',
      label: 'Tahun Pelajaran',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'backup-data',
      label: 'Backup & Restore',
      icon: <DatabaseBackup className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-72 bg-emerald-950 text-white flex flex-col border-r border-emerald-900 flex-shrink-0 select-none shadow-xl no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-emerald-900/80 bg-gradient-to-b from-emerald-900 to-emerald-950">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-amber-400 shadow-md flex items-center justify-center flex-shrink-0">
            {identity.logoUrl ? (
              <img src={identity.logoUrl} alt="Logo Madrasah" className="w-full h-full object-contain" />
            ) : (
              <Award className="w-8 h-8 text-emerald-800" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight font-serif truncate">
              MTs MIFTAHUL HUDA
            </h1>
            <p className="text-[11px] font-medium text-amber-400 font-sans tracking-wide leading-tight mt-0.5">
              Sistem Cetak Kartu
            </p>
            <p className="text-[10px] text-emerald-300 truncate opacity-80 mt-0.5">
              T.P. {identity.tahunPelajaran}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
          Menu Navigasi
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md shadow-emerald-950/40 border-l-4 border-amber-400 pl-3'
                  : 'text-emerald-100/90 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-amber-300' : 'text-emerald-300'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.badge === 'Utama'
                      ? 'bg-amber-400 text-emerald-950 shadow-xs'
                      : isActive
                      ? 'bg-emerald-900 text-amber-300'
                      : 'bg-emerald-900/70 text-emerald-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator Status Footer */}
      <div className="p-3 border-t border-emerald-900/80 bg-emerald-950/80">
        <div className="bg-emerald-900/50 p-2.5 rounded-xl border border-emerald-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300 font-bold text-xs flex-shrink-0">
            OP
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-white truncate">Operator Madrasah</p>
            <p className="text-[10px] text-emerald-300 truncate">Tabir Selatan, Merangin</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" title="Online & Aktif" />
        </div>
      </div>
    </aside>
  );
};
