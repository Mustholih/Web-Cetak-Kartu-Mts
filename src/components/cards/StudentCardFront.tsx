import React from 'react';
import { Student, SchoolIdentity, StudentCardConfig } from '../../types';

interface Props {
  student: Student;
  identity: SchoolIdentity;
  config: StudentCardConfig;
  scale?: number;
}

export const StudentCardFront: React.FC<Props> = ({
  student,
  identity,
  config,
  scale = 1,
}) => {
  return (
    <div
      className="relative overflow-hidden font-sans select-none border box-border shadow-sm print:shadow-none"
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
      {/* Background Graphic Accents */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
        }}
      />
      {identity.logoUrl && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ opacity: config.watermarkOpacity }}
        >
          <img
            src={identity.logoUrl}
            alt="Watermark"
            className="w-44 h-44 object-contain filter grayscale"
          />
        </div>
      )}

      {/* Decorative Gold Side Ribbon */}
      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 z-10" />

      {/* Header Section */}
      <div
        className="relative z-10 px-2.5 pt-1.5 pb-1 flex items-center gap-2 border-b-2"
        style={{
          backgroundColor: config.headerBg,
          color: config.headerTextColor,
          borderColor: config.accentColor,
        }}
      >
        {/* Logo */}
        <div className="w-9 h-9 flex-shrink-0 bg-white p-0.5 rounded-full border-2 border-amber-400 shadow flex items-center justify-center">
          {identity.logoUrl ? (
            <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-emerald-700 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
              MTs
            </div>
          )}
        </div>

        {/* Header Titles */}
        <div className="flex-1 text-center pr-3">
          <p className="text-[6.5px] font-bold tracking-widest text-emerald-200 uppercase leading-none">
            KEMENTERIAN AGAMA REPUBLIK INDONESIA
          </p>
          <h2 className="text-[10.5px] font-black uppercase tracking-tight text-white leading-tight font-serif mt-0.5">
            {identity.namaMadrasah}
          </h2>
          <div className="mt-0.5 px-2 py-0.2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[7.5px] tracking-wider rounded inline-block uppercase leading-none shadow-xs">
            {config.headerTitle}
          </div>
          <p className="text-[5.5px] text-emerald-100 opacity-90 truncate leading-none mt-0.5">
            NSM: {identity.nsm} • NPSN: {identity.npsn} • Merangin, Jambi
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="relative z-10 p-2 flex gap-2.5 items-start h-[calc(53.98mm-17.5mm)]">
        {/* Left: Photo + Mini Barcode */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-[20.5mm] h-[26.5mm] bg-slate-50 overflow-hidden shadow-xs relative flex items-center justify-center"
            style={{
              border: `1.5px solid ${config.photoBorderColor}`,
              borderRadius: `${config.photoBorderRadius}px`,
            }}
          >
            {student.fotoUrl ? (
              <img
                src={student.fotoUrl}
                alt={student.nama}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-1">
                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[6px] text-slate-600 font-medium leading-tight">PASFOTO</span>
              </div>
            )}
          </div>

          {/* Barcode */}
          {config.showBarcode && (
            <div className="mt-1 flex flex-col items-center">
              <div className="flex items-center gap-[1px] h-3 px-1 bg-white rounded border border-slate-300">
                {student.nis.split('').map((c, i) => (
                  <span
                    key={i}
                    className="inline-block bg-slate-900"
                    style={{
                      width: i % 2 === 0 ? '2px' : '1.5px',
                      height: `${8 + (c.charCodeAt(0) % 4)}px`,
                    }}
                  />
                ))}
                <span className="inline-block bg-slate-900 w-[2.5px] h-3 ml-[1px]" />
              </div>
              <span className="text-[5.5px] font-mono font-bold text-slate-800 tracking-wider">
                NIS: {student.nis}
              </span>
            </div>
          )}
        </div>

        {/* Right: Detailed Student Credentials & Official Sign-off */}
        <div className="flex-1 flex flex-col justify-between h-full pr-1">
          <table className="text-[7.2px] leading-[1.28] w-full border-collapse">
            <tbody>
              <tr>
                <td className="font-semibold text-slate-600 w-16 py-0.2">Nama Siswa</td>
                <td className="w-1.5">:</td>
                <td className="font-extrabold text-[7.8px] text-emerald-950 leading-tight">
                  {student.nama}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-slate-600 py-0.2">NIS / NISN</td>
                <td>:</td>
                <td className="font-bold text-slate-900">
                  {student.nis} / {student.nisn || '-'}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-slate-600 py-0.2">Kelas</td>
                <td>:</td>
                <td className="font-extrabold text-emerald-800">{student.kelas}</td>
              </tr>
              <tr>
                <td className="font-semibold text-slate-600 py-0.2">TTL</td>
                <td>:</td>
                <td className="text-slate-800 text-[6.8px] truncate">
                  {student.tempatLahir}, {student.tanggalLahir}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-slate-600 py-0.2">Jenis Kelamin</td>
                <td>:</td>
                <td className="text-slate-800 text-[6.8px]">
                  {student.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-slate-600 py-0.2">Tahun Ajaran</td>
                <td>:</td>
                <td className="font-bold text-amber-700 text-[6.8px]">
                  {identity.tahunPelajaran}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature Block */}
          <div className="flex justify-end items-end relative mt-0.5">
            <div className="text-center relative w-28 text-[6.2px]">
              <p className="text-[5.8px] text-slate-600 leading-none">
                {identity.kotaPenerbitan}, {identity.tanggalTerbit}
              </p>
              <p className="font-semibold text-slate-900 leading-tight mt-0.5">
                Kepala Madrasah,
              </p>

              {/* TTD + Stempel Overlap */}
              <div className="relative h-7 flex items-center justify-center my-0.5">
                {identity.showStempel && identity.stempelUrl && (
                  <img
                    src={identity.stempelUrl}
                    alt="Stempel"
                    className="absolute -left-1.5 -top-1 w-9 h-9 object-contain pointer-events-none select-none z-10"
                    style={{ opacity: identity.stempelOpacity }}
                  />
                )}
                {identity.ttdUrl && (
                  <img
                    src={identity.ttdUrl}
                    alt="Tanda Tangan"
                    className="h-7 max-w-[85px] object-contain relative z-20"
                    style={{
                      transform: `scale(${identity.ttdScale}) translateY(${identity.ttdOffsetY}px)`,
                    }}
                  />
                )}
              </div>

              {/* Name & NIP */}
              <p className="font-bold text-slate-950 underline leading-none truncate text-[6.5px]">
                {identity.kepalaMadrasah}
              </p>
              <p className="text-[5.5px] text-slate-600 leading-tight">
                NIP. {identity.nipKepala}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
