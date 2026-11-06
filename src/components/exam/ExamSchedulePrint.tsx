import React from 'react';
import { SchoolIdentity, ExamInfo, ExamRoom, ExamScheduleItem, Teacher } from '../../types';

interface Props {
  identity: SchoolIdentity;
  examInfo: ExamInfo;
  examRooms: ExamRoom[];
  examSchedule: ExamScheduleItem[];
  teachers: Teacher[];
}

export const ExamSchedulePrint: React.FC<Props> = ({
  identity,
  examInfo,
  examRooms,
  examSchedule,
  teachers,
}) => {
  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => {
    teacherMap.set(t.inisial.toUpperCase(), t);
  });

  return (
    <div
      className="bg-white p-7 font-sans text-slate-900 border border-slate-300 shadow-xl print:shadow-none print:border-none a4-sheet-page flex flex-col justify-between"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      <div>
        {/* Kop Surat Resmi Madrasah */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3 mb-3">
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
            {identity.logoUrl ? (
              <img src={identity.logoUrl} alt="Logo Madrasah" className="w-full h-full object-contain" />
            ) : (
              <div className="w-14 h-14 bg-emerald-800 rounded-full" />
            )}
          </div>
          <div className="flex-1 text-center pr-12">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </p>
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-700">
              KANTOR KEMENTERIAN AGAMA KABUPATEN {identity.kabupaten.toUpperCase()}
            </p>
            <h1 className="text-base font-black font-serif uppercase tracking-tight text-slate-950">
              {identity.namaMadrasah}
            </h1>
            <p className="text-[8.5px] text-slate-600 mt-0.5">
              {identity.alamat} • Telp: {identity.telepon}
            </p>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-emerald-950 underline">
            JADWAL UJIAN DAN PEMBAGIAN PENGAWAS RUANG
          </h2>
          <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
            {examInfo.namaUjian}
          </p>
          <p className="text-[11px] font-semibold text-slate-600">
            Tahun Pelajaran {identity.tahunPelajaran} • Semester {examInfo.semester}
          </p>
        </div>

        {/* Tabel Jadwal & Pengawas Ruang (Inisial) */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-950 text-center font-bold">
                <th rowSpan={2} className="border border-slate-900 py-2 px-1.5 w-8">
                  No
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-2.5 w-36 text-left">
                  Hari, Tanggal
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-2 w-28 text-center">
                  Waktu / Jam
                </th>
                <th rowSpan={2} className="border border-slate-900 py-2 px-3 text-left">
                  Mata Pelajaran
                </th>
                <th
                  colSpan={examRooms.length}
                  className="border border-slate-900 py-1.5 px-2 bg-emerald-900 text-white font-bold uppercase tracking-wider text-[11px]"
                >
                  Pengawas Ruang Ujian (Inisial)
                </th>
              </tr>
              <tr className="bg-slate-200 text-slate-900 text-center font-bold text-[10.5px]">
                {examRooms.map((room) => (
                  <th key={room.id} className="border border-slate-900 py-1 px-1.5 min-w-[58px]">
                    <div>{room.nomorRuang}</div>
                    <div className="text-[9px] font-normal text-slate-600">({room.namaRuang})</div>
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
                    className={`${isEven ? 'bg-slate-50' : 'bg-white'} hover:bg-emerald-50/50 transition-colors`}
                  >
                    <td className="border border-slate-900 py-1.5 px-1 text-center font-bold text-slate-700">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 font-medium text-slate-900 whitespace-nowrap">
                      {item.hariTanggal}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-center text-slate-800 font-mono text-[11px] whitespace-nowrap">
                      {item.jam}
                    </td>
                    <td className="border border-slate-900 py-1.5 px-3 font-bold text-slate-900">
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
                          className="border border-slate-900 py-1.5 px-1 text-center font-bold"
                        >
                          {isAssigned ? (
                            <span
                              className="inline-block px-2 py-0.5 rounded font-black text-xs text-emerald-950 bg-emerald-100/90 border border-emerald-300"
                              title={teacherMap.get(initial.toUpperCase())?.nama || initial}
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

        {/* Keterangan Kode / Inisial Pengawas Ruang */}
        <div className="border border-slate-400 rounded-lg p-2.5 bg-slate-50 mb-3 text-[10.5px]">
          <div className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-1.5 flex items-center justify-between">
            <span>Keterangan Kode / Inisial Guru Pengawas Ruang:</span>
            <span className="text-[9.5px] font-normal text-slate-500 normal-case">
              Total {teachers.length} Guru Terdaftar
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-1">
            {teachers.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 truncate">
                <span className="px-1.5 py-0.2 rounded bg-emerald-800 text-white font-mono font-bold text-[9.5px] flex-shrink-0">
                  {t.inisial}
                </span>
                <span className="text-slate-800 font-medium truncate" title={t.nama}>
                  : {t.nama}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bagian Tanda Tangan: Kiri Bawah (Kepala Madrasah) & Kanan Bawah (Ketua Panitia Ujian) */}
      <div className="pt-3 border-t-2 border-slate-900 mt-2 text-xs">
        <div className="grid grid-cols-2 gap-8">
          {/* Sebelah Kiri Bawah: Tanda Tangan Kepala Madrasah */}
          <div className="text-left">
            <p className="text-[11px] text-slate-600 mb-0.5">Mengetahui,</p>
            <p className="font-bold text-slate-900 text-xs">
              Kepala Madrasah
            </p>
            <div className="h-16 flex items-center justify-start my-1">
              {identity.ttdUrl ? (
                <img
                  src={identity.ttdUrl}
                  alt="Tanda Tangan Kepala Madrasah"
                  className="max-h-14 object-contain"
                />
              ) : (
                <div className="text-[10px] text-slate-300 italic pt-6">
                  ( Tanda Tangan & Stempel )
                </div>
              )}
            </div>
            <p className="font-bold text-slate-950 underline text-xs">
              {identity.kepalaMadrasah}
            </p>
            <p className="text-[10.5px] text-slate-600">
              NIP. {identity.nipKepala || '-'}
            </p>
          </div>

          {/* Sebelah Kanan Bawah: Tanda Tangan Ketua Panitia Ujian */}
          <div className="text-right">
            <p className="text-[11px] text-slate-600 mb-0.5">
              {examInfo.tempatTanggalJadwal || `${identity.kotaPenerbitan}, 25 November 2026`}
            </p>
            <p className="font-bold text-slate-900 text-xs">
              Ketua Panitia Ujian,
            </p>
            <div className="h-16 flex items-center justify-end my-1">
              <div className="text-[10px] text-slate-300 italic pt-6">
                ( Tanda Tangan )
              </div>
            </div>
            <p className="font-bold text-slate-950 underline text-xs">
              {examInfo.ketuaPanitiaNama || 'H. AHMAD RIFA\'I, S.Pd.I.'}
            </p>
            <p className="text-[10.5px] text-slate-600">
              NIP. {examInfo.ketuaPanitiaNip || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
