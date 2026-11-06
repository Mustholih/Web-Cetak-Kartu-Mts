import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  FileDown,
  Image as ImageIcon,
  BookOpen,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Student, SchoolIdentity, LibraryCardConfig, StudentCardConfig } from '../../types';
import { LibraryCardFront } from '../cards/LibraryCardFront';
import { LibraryCardBack } from '../cards/LibraryCardBack';
import { StudentCardFront } from '../cards/StudentCardFront';
import { StudentCardBack } from '../cards/StudentCardBack';
import { PrintService } from '../../services/printService';

interface Props {
  student: Student | null;
  cardType: 'perpus' | 'siswa';
  identity: SchoolIdentity;
  libraryConfig: LibraryCardConfig;
  studentConfig: StudentCardConfig;
  onClose: () => void;
  onMarkPrinted: (studentId: string, type: 'perpus' | 'siswa') => void;
}

export const QuickPreviewModal: React.FC<Props> = ({
  student,
  cardType,
  identity,
  libraryConfig,
  studentConfig,
  onClose,
  onMarkPrinted,
}) => {
  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const typeLabel = cardType === 'perpus' ? 'Kartu_Perpus' : 'Kartu_Siswa';
      await PrintService.downloadSingleCardPdf(
        cardRef.current,
        `${typeLabel}_${student.nis}_${student.nama.replace(/\s+/g, '_')}`
      );
      onMarkPrinted(student.id, cardType);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const typeLabel = cardType === 'perpus' ? 'Kartu_Perpus' : 'Kartu_Siswa';
      await PrintService.downloadElementAsPng(
        cardRef.current,
        `${typeLabel}_${student.nis}_${student.nama.replace(/\s+/g, '_')}`
      );
      onMarkPrinted(student.id, cardType);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    onMarkPrinted(student.id, cardType);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in no-print">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              {cardType === 'perpus' ? (
                <BookOpen className="w-4 h-4 text-emerald-300" />
              ) : (
                <CreditCard className="w-4 h-4 text-amber-300" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {cardType === 'perpus' ? 'Kartu Anggota Perpustakaan' : 'Kartu Tanda Peserta Didik'}
              </h3>
              <p className="text-xs text-emerald-200">
                {student.nama} (NIS: {student.nis} • Kelas {student.kelas})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Side Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveSide('FRONT')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSide === 'FRONT'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sisi Depan
              </button>
              <button
                onClick={() => setActiveSide('BACK')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSide === 'BACK'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sisi Belakang
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Ukuran Standar ID-1 (85.60 × 53.98 mm)
            </span>
          </div>

          {/* Card Preview Box */}
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-300 flex items-center justify-center overflow-hidden">
            <div ref={cardRef} className="shadow-2xl rounded-xl overflow-hidden bg-white">
              {cardType === 'perpus' ? (
                activeSide === 'FRONT' ? (
                  <LibraryCardFront
                    student={student}
                    identity={identity}
                    config={libraryConfig}
                    scale={1}
                  />
                ) : (
                  <LibraryCardBack identity={identity} config={libraryConfig} scale={1} />
                )
              ) : activeSide === 'FRONT' ? (
                <StudentCardFront
                  student={student}
                  identity={identity}
                  config={studentConfig}
                  scale={1}
                />
              ) : (
                <StudentCardBack identity={identity} config={studentConfig} scale={1} />
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleDirectPrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Langsung</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
