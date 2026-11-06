import React from 'react';
import { Student, SchoolIdentity, ExamInfo, ExamRoom, ExamAllocation } from '../../types';

interface Props {
  room: ExamRoom;
  students: Student[];
  allocations: ExamAllocation[];
  identity: SchoolIdentity;
  examInfo: ExamInfo;
  subjectName?: string;
  examDate?: string;
  examTime?: string;
}

export const ExamAttendancePrint: React.FC<Props> = ({
  room,
  students,
  allocations,
  identity,
  examInfo,
  subjectName = 'Al-Qur\'an Hadis',
  examDate = 'Senin, 01 Desember 2026',
  examTime = '07.30 - 09.30 WIB',
}) => {
  const roomAllocations = allocations
    .filter((a) => a.roomId === room.id)
    .sort((a, b) => a.nomorMeja - b.nomorMeja);

  const studentMap = new Map(students.map((s) => [s.id, s]));

  return (
    <div
      className="bg-white p-6 font-sans text-slate-900 border border-slate-300 shadow-xl print:shadow-none print:border-none a4-sheet-page"
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Kop Surat Madrasah */}
      <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3 mb-3">
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          {identity.logoUrl && (
            <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          )}
        </div>
        <div className="flex-1 text-center pr-10">
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

      {/* Document Header */}
      <div className="text-center mb-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-emerald-950 underline">
          DAFTAR HADIR PESERTA UJIAN
        </h2>
        <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">
          {examInfo.namaUjian}
        </p>
        <p className="text-[11px] font-semibold text-slate-600">
          Tahun Pelajaran {identity.tahunPelajaran} • Semester {examInfo.semester}
        </p>
      </div>

      {/* Exam Details Grid */}
      <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs grid grid-cols-2 gap-x-6 gap-y-1">
        <div className="flex items-center">
          <span className="w-28 font-bold text-slate-700">Ruang Ujian</span>
          <span className="mr-2">:</span>
          <span className="font-extrabold text-emerald-900">
            {room.nomorRuang} ({room.namaRuang})
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-28 font-bold text-slate-700">Mata Pelajaran</span>
          <span className="mr-2">:</span>
          <span className="font-extrabold text-slate-900">{subjectName}</span>
        </div>
        <div className="flex items-center">
          <span className="w-28 font-bold text-slate-700">Hari / Tanggal</span>
          <span className="mr-2">:</span>
          <span className="text-slate-800 font-medium">{examDate}</span>
        </div>
        <div className="flex items-center">
          <span className="w-28 font-bold text-slate-700">Waktu Ujian</span>
          <span className="mr-2">:</span>
          <span className="text-slate-800 font-medium">{examTime}</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="border border-slate-400 rounded overflow-hidden mb-4">
        <table className="w-full text-left text-[10.5px] border-collapse">
          <thead className="bg-slate-100 border-b border-slate-400 text-slate-900 font-black text-center uppercase">
            <tr>
              <th className="py-2 px-2 border-r border-slate-300 w-8">No</th>
              <th className="py-2 px-2 border-r border-slate-300 w-24">No. Peserta</th>
              <th className="py-2 px-2 border-r border-slate-300 w-24">NIS / NISN</th>
              <th className="py-2 px-3 border-r border-slate-300">Nama Lengkap Siswa</th>
              <th className="py-2 px-2 border-r border-slate-300 w-12">Kelas</th>
              <th className="py-2 px-2 border-r border-slate-300 w-14">Meja</th>
              <th className="py-2 px-4 border-r border-slate-300 w-36">Tanda Tangan</th>
              <th className="py-2 px-2 w-16">Ket.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {roomAllocations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                  Belum ada siswa yang ditempatkan di ruang ujian ini.
                </td>
              </tr>
            ) : (
              roomAllocations.map((alloc, idx) => {
                const std = studentMap.get(alloc.studentId);
                const isOdd = idx % 2 === 0;
                return (
                  <tr key={alloc.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-emerald-950 border-r border-slate-200 text-center">
                      {alloc.nomorPeserta}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-[9.5px] border-r border-slate-200 text-center">
                      {std ? `${std.nis} / ${std.nisn || '-'}` : '-'}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-900 uppercase border-r border-slate-200 truncate max-w-[160px]">
                      {std?.nama || 'Siswa Dihapus'}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-emerald-900 border-r border-slate-200">
                      {std?.kelas || '-'}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">
                      {alloc.nomorMeja}
                    </td>
                    {/* Staggered Signature Columns */}
                    <td className="py-1.5 px-2 border-r border-slate-200">
                      <div className="flex items-center text-[9px] text-slate-400 font-medium">
                        {isOdd ? (
                          <span>{idx + 1}. ....................</span>
                        ) : (
                          <span className="ml-auto">{idx + 1}. ....................</span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center text-slate-400 text-[9px]">
                      [ &nbsp;&nbsp;&nbsp; ]
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Summary and Supervisors Block */}
      <div className="mt-auto pt-3 border-t-2 border-slate-300 text-xs flex justify-between items-start">
        {/* Statistics Box */}
        <div className="p-2.5 rounded bg-slate-50 border border-slate-300 w-64 text-[10.5px] space-y-1">
          <p className="font-bold text-slate-800 border-b pb-0.5">Catatan Kehadiran:</p>
          <div className="flex justify-between">
            <span>Jumlah Peserta Terdaftar</span>
            <span className="font-bold">{roomAllocations.length} Orang</span>
          </div>
          <div className="flex justify-between">
            <span>Jumlah Peserta Hadir</span>
            <span>: ...... Orang</span>
          </div>
          <div className="flex justify-between">
            <span>Jumlah Peserta Tidak Hadir</span>
            <span>: ...... Orang</span>
          </div>
        </div>

        {/* Supervisors Signatures */}
        <div className="text-right">
          <p className="text-[11px] text-slate-600 mb-1">
            {identity.kotaPenerbitan}, {examDate}
          </p>
          <p className="font-bold text-slate-900 text-xs">
            Pengawas Ujian,
          </p>

          <div className="mt-8 grid grid-cols-2 gap-8 text-center text-[10px]">
            <div>
              <div className="border-b border-slate-900 pb-0.5 font-bold">
                {room.pengawas1 || '( ........................................ )'}
              </div>
              <p className="text-slate-500 mt-0.5">Pengawas 1</p>
            </div>
            <div>
              <div className="border-b border-slate-900 pb-0.5 font-bold">
                {room.pengawas2 || '( ........................................ )'}
              </div>
              <p className="text-slate-500 mt-0.5">Pengawas 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
