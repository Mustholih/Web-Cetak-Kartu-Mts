import React from 'react';
import { SchoolIdentity, ExamInfo, ExamRoom, ExamScheduleItem, Teacher } from '../../types';

interface Props {
  identity: SchoolIdentity;
  examInfo: ExamInfo;
  examRooms: ExamRoom[];
  examSchedule: ExamScheduleItem[];
  teachers: Teacher[];
  paperSize?: 'A4' | 'F4';
  showLegend?: boolean;
  signatureMode?: 'wet' | 'digital';
  tableDensity?: 'compact' | 'normal' | 'relaxed';
}

export const ExamSchedulePrint: React.FC<Props> = ({
  identity,
  examInfo,
  examRooms,
  examSchedule,
  teachers,
  paperSize = 'A4',
  showLegend = false,
  signatureMode = 'wet',
  tableDensity = 'normal',
}) => {
  const isF4 = paperSize === 'F4';

  // Build teacher map for tooltip / legend lookup
  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => {
    teacherMap.set(t.inisial.toUpperCase(), t);
  });

  // Dynamic vertical padding per density
  const cellPy =
    tableDensity === 'compact'
      ? 'py-1'
      : tableDensity === 'relaxed'
      ? isF4
        ? 'py-2'
        : 'py-1.5'
      : isF4
      ? 'py-1.5'
      : 'py-1.2';

  // Signature spacing based on whether legend is displayed and paper size
  const signatureHeightClass = showLegend
    ? 'h-14'
    : isF4
    ? 'h-24'
    : 'h-20';

  return (
    <div
      className={`bg-white font-sans text-slate-900 border border-slate-300 shadow-xl print:shadow-none print:border-none ${
        isF4 ? 'f4-sheet-page' : 'a4-sheet-page'
      } flex flex-col justify-between overflow-hidden print:m-0 ${
        isF4 ? 'p-7 sm:p-8' : 'p-6 sm:p-7'
      }`}
      style={{
        width: isF4 ? '215mm' : '210mm',
        height: isF4 ? '330mm' : '297mm',
        maxHeight: isF4 ? '330mm' : '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Top Section: Kop Surat, Judul, dan Tabel Jadwal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Kop Surat Resmi Madrasah */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-2.5 mb-2.5 flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center">
            {identity.logoUrl ? (
              <img
                src={identity.logoUrl}
                alt="Logo Madrasah"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-14 h-14 bg-emerald-800 rounded-full flex items-center justify-center text-white font-bold text-xs">
                MTS
              </div>
            )}
          </div>
          <div className="flex-1 text-center pr-12">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 leading-tight">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </p>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-700 leading-tight">
              KANTOR KEMENTERIAN AGAMA KABUPATEN {identity.kabupaten.toUpperCase()}
            </p>
            <h1 className="text-base sm:text-lg font-black font-serif uppercase tracking-tight text-slate-950 leading-tight mt-0.5">
              {identity.namaMadrasah}
            </h1>
            <p className="text-[8.5px] text-slate-600 mt-0.5 leading-tight">
              {identity.alamat} • Telp: {identity.telepon || '-'}
            </p>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-2.5 flex-shrink-0">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-emerald-950 underline leading-tight">
            JADWAL UJIAN DAN PEMBAGIAN PENGAWAS RUANG
          </h2>
          <p className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase mt-0.5 leading-tight">
            {examInfo.namaUjian}
          </p>
          <p className="text-[10.5px] font-semibold text-slate-600 leading-tight">
            Tahun Pelajaran {identity.tahunPelajaran} • Semester {examInfo.semester}
          </p>
        </div>

        {/* Tabel Jadwal & Pengawas Ruang (Inisial) */}
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-950 text-center font-bold">
                <th
                  rowSpan={2}
                  className="border border-slate-900 py-1.5 px-1.5 w-8 text-center text-[10.5px]"
                >
                  No
                </th>
                <th
                  rowSpan={2}
                  className="border border-slate-900 py-1.5 px-2 w-32 sm:w-36 text-left text-[10.5px]"
                >
                  Hari, Tanggal
                </th>
                <th
                  rowSpan={2}
                  className="border border-slate-900 py-1.5 px-1.5 w-24 sm:w-28 text-center text-[10.5px]"
                >
                  Waktu
                </th>
                <th
                  rowSpan={2}
                  className="border border-slate-900 py-1.5 px-2.5 text-left text-[10.5px]"
                >
                  Mata Pelajaran
                </th>
                <th
                  colSpan={examRooms.length}
                  className="border border-slate-900 py-1 px-2 bg-emerald-900 text-white font-bold uppercase tracking-wider text-[10.5px]"
                >
                  Pengawas Ruang Ujian (Inisial)
                </th>
              </tr>
              <tr className="bg-slate-200 text-slate-900 text-center font-bold text-[10px]">
                {examRooms.map((room) => (
                  <th
                    key={room.id}
                    className="border border-slate-900 py-1 px-1.5 min-w-[54px]"
                  >
                    <div>{room.nomorRuang}</div>
                    <div className="text-[8.5px] font-normal text-slate-600">
                      ({room.namaRuang})
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examSchedule.map((item, idx) => {
                const isEven = idx % 2 === 1;
                return (
                  <tr
                    key={item.id || idx}
                    className={`${
                      isEven ? 'bg-slate-50' : 'bg-white'
                    } text-[10.5px] sm:text-[11px]`}
                  >
                    <td
                      className={`border border-slate-900 ${cellPy} px-1 text-center font-bold text-slate-700`}
                    >
                      {idx + 1}
                    </td>
                    <td
                      className={`border border-slate-900 ${cellPy} px-2 font-medium text-slate-900 whitespace-nowrap`}
                    >
                      {item.hariTanggal}
                    </td>
                    <td
                      className={`border border-slate-900 ${cellPy} px-1 text-center text-slate-800 font-mono text-[10px] whitespace-nowrap`}
                    >
                      {item.jam}
                    </td>
                    <td
                      className={`border border-slate-900 ${cellPy} px-2.5 font-bold text-slate-900`}
                    >
                      {item.mataPelajaran}
                    </td>
                    {examRooms.map((room) => {
                      const initial =
                        item.roomSupervisors?.[room.id] ||
                        item.roomSupervisors?.[room.nomorRuang] ||
                        '-';
                      const isAssigned = initial !== '-' && initial.trim() !== '';

                      return (
                        <td
                          key={room.id}
                          className={`border border-slate-900 ${cellPy} px-1 text-center font-bold`}
                        >
                          {isAssigned ? (
                            <span
                              className="inline-block px-1.5 py-0.5 rounded font-black text-[10.5px] text-emerald-950 bg-emerald-100/90 border border-emerald-300 min-w-[28px]"
                              title={
                                teacherMap.get(initial.toUpperCase())?.nama || initial
                              }
                            >
                              {initial}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Opsional: Keterangan Kode / Inisial Pengawas Ruang (Bisa Dimunculkan jika Ruang Cukup / F4) */}
        {showLegend && (
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50 mt-2 text-[10px] flex-shrink-0">
            <div className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-0.5 mb-1 flex items-center justify-between text-[9.5px]">
              <span>Keterangan Inisial Guru Pengawas:</span>
              <span className="text-[9px] font-normal text-slate-500 normal-case">
                Total {teachers.length} Guru
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-0.5">
              {teachers.map((t) => (
                <div key={t.id} className="flex items-center gap-1 truncate">
                  <span className="px-1 py-0.2 rounded bg-emerald-800 text-white font-mono font-bold text-[9px] flex-shrink-0">
                    {t.inisial}
                  </span>
                  <span className="text-slate-800 font-medium truncate" title={t.nama}>
                    : {t.nama}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bagian Bawah: Tanda Tangan Basah yang Lapang dan Proporsional (1 Lembar Pas) */}
      <div className="pt-2.5 border-t-2 border-slate-900 mt-2 flex-shrink-0 text-xs">
        <div className="grid grid-cols-2 gap-8 items-end">
          {/* Sebelah Kiri Bawah: Tanda Tangan Kepala Madrasah */}
          <div className="text-left">
            <p className="text-[11px] text-slate-700 leading-tight">Mengetahui,</p>
            <p className="font-bold text-slate-950 text-xs leading-tight">
              Kepala Madrasah
            </p>

            {/* Area Tanda Tangan Basah (Spacious Area for Wet Signature & Official Stamp) */}
            <div className={`${signatureHeightClass} flex items-center justify-start my-1 relative`}>
              {signatureMode === 'digital' && identity.ttdUrl ? (
                <img
                  src={identity.ttdUrl}
                  alt="Tanda Tangan Kepala Madrasah"
                  className="max-h-16 object-contain"
                />
              ) : (
                <div className="w-44 h-full flex flex-col justify-center text-[10px] text-slate-400/80 italic select-none">
                  <span className="text-[9.5px] opacity-60">
                    ( Tanda Tangan Basah & Stempel )
                  </span>
                </div>
              )}
            </div>

            <p className="font-bold text-slate-950 underline text-xs leading-tight">
              {identity.kepalaMadrasah}
            </p>
            <p className="text-[10.5px] text-slate-700 leading-tight mt-0.5">
              NIP. {identity.nipKepala || '-'}
            </p>
          </div>

          {/* Sebelah Kanan Bawah: Tanda Tangan Ketua Panitia Ujian */}
          <div className="text-right">
            <p className="text-[11px] text-slate-700 leading-tight">
              {examInfo.tempatTanggalJadwal ||
                `${identity.kotaPenerbitan || 'Tabir Selatan'}, 25 November 2026`}
            </p>
            <p className="font-bold text-slate-950 text-xs leading-tight">
              Ketua Panitia Ujian,
            </p>

            {/* Area Tanda Tangan Basah Panitia */}
            <div className={`${signatureHeightClass} flex items-center justify-end my-1 relative`}>
              <div className="w-44 h-full flex flex-col justify-center items-end text-[10px] text-slate-400/80 italic select-none">
                <span className="text-[9.5px] opacity-60">( Tanda Tangan Basah )</span>
              </div>
            </div>

            <p className="font-bold text-slate-950 underline text-xs leading-tight">
              {examInfo.ketuaPanitiaNama || "H. AHMAD RIFA'I, S.Pd.I."}
            </p>
            <p className="text-[10.5px] text-slate-700 leading-tight mt-0.5">
              NIP. {examInfo.ketuaPanitiaNip || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
