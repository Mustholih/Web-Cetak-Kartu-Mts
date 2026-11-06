import React from 'react';
import { SchoolIdentity, StudentCardConfig } from '../../types';

interface Props {
  identity: SchoolIdentity;
  config: StudentCardConfig;
  scale?: number;
}

export const StudentCardBack: React.FC<Props> = ({
  identity,
  config,
  scale = 1,
}) => {
  return (
    <div
      className="relative overflow-hidden font-sans select-none border box-border shadow-sm print:shadow-none p-3 flex flex-col justify-between"
      style={{
        width: '85.6mm',
        height: '53.98mm',
        minWidth: '85.6mm',
        minHeight: '53.98mm',
        maxWidth: '85.6mm',
        maxHeight: '53.98mm',
        backgroundColor: '#ffffff',
        borderColor: config.borderColor,
        borderWidth: `${config.borderWidth}px`,
        borderRadius: '3.5mm',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Decorative Border */}
      <div className="absolute inset-1 border border-emerald-200 rounded pointer-events-none" />

      {/* Header */}
      <div className="text-center border-b border-amber-400 pb-1">
        <h3 className="text-[8.5px] font-black uppercase text-emerald-950 tracking-wider">
          KETENTUAN KARTU TANDA PESERTA DIDIK
        </h3>
        <p className="text-[6.5px] font-bold text-amber-700 uppercase">
          {identity.namaMadrasah}
        </p>
      </div>

      {/* Visi & Rules */}
      <div className="space-y-1.5 my-auto px-1">
        <div className="bg-emerald-50 p-1.5 rounded border border-emerald-200">
          <p className="text-[6.2px] font-bold text-emerald-900 leading-tight">VISI MADRASAH:</p>
          <p className="text-[6px] italic text-emerald-800 leading-tight mt-0.5">
            &ldquo;{config.visiText}&rdquo;
          </p>
        </div>

        <div>
          <p className="text-[6.2px] font-bold text-slate-800 uppercase mb-0.5">Ketentuan:</p>
          <ul className="text-[6.2px] text-slate-700 space-y-0.8 list-disc list-inside leading-tight">
            <li>Kartu ini adalah identitas resmi siswa MTs Miftahul Huda.</li>
            <li>Wajib dipakai / dibawa selama mengikuti kegiatan madrasah.</li>
            <li>Apabila kartu hilang, segera melapor ke bagian Tata Usaha.</li>
          </ul>
        </div>
      </div>

      {/* Footer Address */}
      <div className="border-t border-slate-200 pt-1 text-center bg-slate-50 rounded p-1">
        <p className="text-[5.5px] text-slate-800 font-bold uppercase leading-none">
          {identity.alamat}
        </p>
        <p className="text-[5.5px] text-emerald-800 font-semibold mt-0.5">
          Tabir Selatan, Merangin - Jambi • Telp: {identity.telepon}
        </p>
      </div>
    </div>
  );
};
