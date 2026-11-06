import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Student,
  SchoolIdentity,
  LibraryCardConfig,
  StudentCardConfig,
  ExamInfo,
  ExamRoom,
  ExamAllocation,
  ExamScheduleItem,
} from './types';
import { StorageService } from './services/storage';
import { Sidebar } from './components/navigation/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { DataSiswaView } from './components/views/DataSiswaView';
import { UploadFotoMassalView } from './components/views/UploadFotoMassalView';
import { IdentitasMadrasahView } from './components/views/IdentitasMadrasahView';
import { DesainKartuPerpusView } from './components/views/DesainKartuPerpusView';
import { DesainKartuSiswaView } from './components/views/DesainKartuSiswaView';
import { CetakKartuView } from './components/views/CetakKartuView';
import { ManajemenUjianView } from './components/views/ManajemenUjianView';
import { TahunPelajaranView } from './components/views/TahunPelajaranView';
import { BackupDataView } from './components/views/BackupDataView';
import { ImportExcelModal } from './components/modals/ImportExcelModal';
import { QuickPreviewModal } from './components/modals/QuickPreviewModal';
import {
  Bell,
  Calendar,
  Sparkles,
  HelpCircle,
  School,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [identity, setIdentity] = useState<SchoolIdentity>(StorageService.getSchoolIdentity());
  const [libraryConfig, setLibraryConfig] = useState<LibraryCardConfig>(
    StorageService.getLibraryConfig()
  );
  const [studentConfig, setStudentConfig] = useState<StudentCardConfig>(
    StorageService.getStudentConfig()
  );
  const [academicYears, setAcademicYears] = useState<string[]>(
    StorageService.getAcademicYears()
  );
  const [adminPin, setAdminPin] = useState<string>(StorageService.getAdminPin());

  // Exam Management state
  const [examInfo, setExamInfo] = useState<ExamInfo>(StorageService.getExamInfo());
  const [examRooms, setExamRooms] = useState<ExamRoom[]>(StorageService.getExamRooms());
  const [examAllocations, setExamAllocations] = useState<ExamAllocation[]>(
    StorageService.getExamAllocations()
  );
  const [examSchedule, setExamSchedule] = useState<ExamScheduleItem[]>(
    StorageService.getExamSchedule()
  );

  // Modals & Navigation state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickPreviewStudent, setQuickPreviewStudent] = useState<Student | null>(null);
  const [quickPreviewType, setQuickPreviewType] = useState<'perpus' | 'siswa'>('perpus');
  const [preSelectedPrintIds, setPreSelectedPrintIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedStudents = StorageService.getStudents();
    setStudents(loadedStudents);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student CRUD
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const res = StorageService.addStudent(studentData);
    if (res.success) {
      setStudents(StorageService.getStudents());
      showToast('Data siswa berhasil ditambahkan!');
    }
    return res;
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const res = StorageService.updateStudent(updatedStudent);
    if (res.success) {
      setStudents(StorageService.getStudents());
      showToast('Data siswa berhasil diperbarui!');
    }
    return res;
  };

  const handleDeleteStudent = (id: string) => {
    if (StorageService.deleteStudent(id)) {
      setStudents(StorageService.getStudents());
      showToast('Data siswa telah dihapus.');
    }
  };

  const handleDeleteMultipleStudents = (ids: string[]) => {
    const count = StorageService.deleteMultipleStudents(ids);
    setStudents(StorageService.getStudents());
    showToast(`${count} data siswa berhasil dihapus.`);
  };

  // Mass Import Excel
  const handleImportComplete = (imported: Omit<Student, 'id'>[]) => {
    const current = StorageService.getStudents();
    const newStudents: Student[] = imported.map((item, idx) => ({
      ...item,
      id: `std-import-${Date.now()}-${idx}`,
      noAnggotaPerpus: item.noAnggotaPerpus || `P-${item.nis}`,
      isLibraryCardPrinted: false,
      isStudentCardPrinted: false,
      updatedAt: new Date().toISOString(),
    }));

    const combined = [...newStudents, ...current];
    StorageService.saveStudents(combined);
    setStudents(combined);
    showToast(`Berhasil mengimport ${imported.length} data siswa dari Excel!`);
  };

  // Bulk Apply Photos
  const handleApplyPhotos = (matchedList: { studentId: string; photoUrl: string }[]) => {
    const current = [...students];
    const matchMap = new Map(matchedList.map((m) => [m.studentId, m.photoUrl]));

    const updated = current.map((s) => {
      if (matchMap.has(s.id)) {
        return {
          ...s,
          fotoUrl: matchMap.get(s.id),
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    StorageService.saveStudents(updated);
    setStudents(updated);
    showToast(`Berhasil menerapkan foto untuk ${matchedList.length} siswa!`);
  };

  // Identity & Config Savers
  const handleSaveIdentity = (newIdentity: SchoolIdentity) => {
    StorageService.saveSchoolIdentity(newIdentity);
    setIdentity(newIdentity);
  };

  const handleSaveLibraryConfig = (newConfig: LibraryCardConfig) => {
    StorageService.saveLibraryConfig(newConfig);
    setLibraryConfig(newConfig);
  };

  const handleSaveStudentConfig = (newConfig: StudentCardConfig) => {
    StorageService.saveStudentConfig(newConfig);
    setStudentConfig(newConfig);
  };

  const handleSaveAcademicYears = (years: string[]) => {
    StorageService.saveAcademicYears(years);
    setAcademicYears(years);
  };

  const handleUpdateAdminPin = (pin: string) => {
    StorageService.setAdminPin(pin);
    setAdminPin(pin);
  };

  // Exam Management Handlers
  const handleSaveExamInfo = (newInfo: ExamInfo) => {
    StorageService.saveExamInfo(newInfo);
    setExamInfo(newInfo);
    showToast('Pengaturan ujian berhasil disimpan!');
  };

  const handleSaveExamRooms = (newRooms: ExamRoom[]) => {
    StorageService.saveExamRooms(newRooms);
    setExamRooms(newRooms);
    showToast('Data ruang ujian berhasil disimpan!');
  };

  const handleSaveExamAllocations = (newAllocations: ExamAllocation[]) => {
    StorageService.saveExamAllocations(newAllocations);
    setExamAllocations(newAllocations);
    showToast('Penempatan siswa berhasil disimpan!');
  };

  const handleSaveExamSchedule = (newSchedule: ExamScheduleItem[]) => {
    StorageService.saveExamSchedule(newSchedule);
    setExamSchedule(newSchedule);
    showToast('Jadwal ujian berhasil disimpan!');
  };

  // Mass Promotion
  const handlePromoteStudents = () => {
    const current = [...students];
    const updated = current.map((s) => {
      let nextClass = s.kelas;
      if (s.kelas.startsWith('7')) {
        nextClass = s.kelas.replace(/^7/, '8');
      } else if (s.kelas.startsWith('8')) {
        nextClass = s.kelas.replace(/^8/, '9');
      } else if (s.kelas.startsWith('9')) {
        nextClass = 'ALUMNI / LULUS';
      }
      return {
        ...s,
        kelas: nextClass,
        isLibraryCardPrinted: false,
        isStudentCardPrinted: false,
        updatedAt: new Date().toISOString(),
      };
    });

    StorageService.saveStudents(updated);
    setStudents(updated);
    showToast('Kenaikan kelas massal berhasil diterapkan!');
  };

  // Reset Print Status
  const handleResetPrintStatus = () => {
    const current = students.map((s) => ({
      ...s,
      isLibraryCardPrinted: false,
      isStudentCardPrinted: false,
    }));
    StorageService.saveStudents(current);
    setStudents(current);
    showToast('Status cetak kartu telah di-reset ke belum dicetak.');
  };

  // Mark Cards as Printed
  const handleMarkAsPrinted = (studentIds: string[], type: 'perpus' | 'siswa') => {
    const idSet = new Set(studentIds);
    const updated = students.map((s) => {
      if (idSet.has(s.id)) {
        return {
          ...s,
          isLibraryCardPrinted: type === 'perpus' ? true : s.isLibraryCardPrinted,
          isStudentCardPrinted: type === 'siswa' ? true : s.isStudentCardPrinted,
        };
      }
      return s;
    });

    StorageService.saveStudents(updated);
    setStudents(updated);
  };

  // Quick Card Preview Trigger
  const handleQuickPreview = (student: Student, type: 'perpus' | 'siswa') => {
    setQuickPreviewStudent(student);
    setQuickPreviewType(type);
  };

  // Jump from DataSiswa selection to CetakKartu
  const handleSendToPrint = (selectedIds: string[]) => {
    setPreSelectedPrintIds(selectedIds);
    setActiveTab('cetak-kartu');
  };

  // Full Restore Refresh
  const handleFullRestore = () => {
    setStudents(StorageService.getStudents());
    setIdentity(StorageService.getSchoolIdentity());
    setLibraryConfig(StorageService.getLibraryConfig());
    setStudentConfig(StorageService.getStudentConfig());
    setAcademicYears(StorageService.getAcademicYears());
    setAdminPin(StorageService.getAdminPin());
    setExamInfo(StorageService.getExamInfo());
    setExamRooms(StorageService.getExamRooms());
    setExamAllocations(StorageService.getExamAllocations());
    setExamSchedule(StorageService.getExamSchedule());
    showToast('Seluruh data berhasil disinkronisasi dari cadangan!');
  };

  const sampleStudent = students[0] || {
    id: 'sample',
    nis: '2607001',
    nisn: '0112345678',
    nama: 'AHMAD FAIZIN AL-FARUQ',
    kelas: '7A',
    tempatLahir: 'Merangin',
    tanggalLahir: '12 Mei 2013',
    jenisKelamin: 'L',
    noAnggotaPerpus: 'P-2607001',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 no-print">
          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        identity={identity}
        totalStudents={students.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 no-print z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
              <School className="w-4 h-4 text-emerald-700" />
              <span>{identity.namaMadrasah}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>T.P. {identity.tahunPelajaran}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Import Siswa</span>
            </button>
            <button
              onClick={() => setActiveTab('cetak-kartu')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <span>Cetak Kartu</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* Operator Avatar Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-300 shadow-xs">
                OP
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">Operator TU</p>
                <p className="text-[10px] text-emerald-700 font-medium">MTs Miftahul Huda</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Views Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/90">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView
                students={students}
                identity={identity}
                setActiveTab={setActiveTab}
                onOpenAddModal={() => setActiveTab('data-siswa')}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onQuickPreviewStudent={handleQuickPreview}
              />
            )}

            {activeTab === 'data-siswa' && (
              <DataSiswaView
                students={students}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onDeleteMultipleStudents={handleDeleteMultipleStudents}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onQuickPreviewStudent={handleQuickPreview}
                onSendToPrint={handleSendToPrint}
              />
            )}

            {activeTab === 'upload-foto' && (
              <UploadFotoMassalView
                students={students}
                onApplyPhotos={handleApplyPhotos}
              />
            )}

            {activeTab === 'identitas-madrasah' && (
              <IdentitasMadrasahView
                identity={identity}
                onSaveIdentity={handleSaveIdentity}
                sampleStudent={sampleStudent}
                libraryConfig={libraryConfig}
              />
            )}

            {activeTab === 'desain-perpus' && (
              <DesainKartuPerpusView
                identity={identity}
                config={libraryConfig}
                onSaveConfig={handleSaveLibraryConfig}
                sampleStudent={sampleStudent}
                students={students}
              />
            )}

            {activeTab === 'desain-siswa' && (
              <DesainKartuSiswaView
                identity={identity}
                config={studentConfig}
                onSaveConfig={handleSaveStudentConfig}
                sampleStudent={sampleStudent}
                students={students}
              />
            )}

            {activeTab === 'cetak-kartu' && (
              <CetakKartuView
                students={students}
                identity={identity}
                libraryConfig={libraryConfig}
                studentConfig={studentConfig}
                onMarkAsPrinted={handleMarkAsPrinted}
                preSelectedIds={preSelectedPrintIds}
              />
            )}

            {activeTab === 'manajemen-ujian' && (
              <ManajemenUjianView
                students={students}
                identity={identity}
                examInfo={examInfo}
                examRooms={examRooms}
                examAllocations={examAllocations}
                examSchedule={examSchedule}
                onSaveExamInfo={handleSaveExamInfo}
                onSaveExamRooms={handleSaveExamRooms}
                onSaveExamAllocations={handleSaveExamAllocations}
                onSaveExamSchedule={handleSaveExamSchedule}
              />
            )}

            {activeTab === 'tahun-pelajaran' && (
              <TahunPelajaranView
                identity={identity}
                academicYears={academicYears}
                onSaveAcademicYears={handleSaveAcademicYears}
                onUpdateIdentity={handleSaveIdentity}
                students={students}
                onPromoteStudents={handlePromoteStudents}
                onResetPrintStatus={handleResetPrintStatus}
              />
            )}

            {activeTab === 'backup-data' && (
              <BackupDataView
                students={students}
                identity={identity}
                onFullRestore={handleFullRestore}
                adminPin={adminPin}
                onUpdateAdminPin={handleUpdateAdminPin}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingStudents={students}
        onImportComplete={handleImportComplete}
      />

      <QuickPreviewModal
        student={quickPreviewStudent}
        cardType={quickPreviewType}
        identity={identity}
        libraryConfig={libraryConfig}
        studentConfig={studentConfig}
        onClose={() => setQuickPreviewStudent(null)}
        onMarkPrinted={(id, type) => handleMarkAsPrinted([id], type)}
      />
    </div>
  );
}
