import React from 'react';
import { SchoolIdentity, LibraryCardConfig } from '../../types';

interface Props {
  identity: SchoolIdentity;
  config: LibraryCardConfig;
  scale?: number;
}

export const LibraryCardBack: React.FC<Props> = ({
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
        backgroundColor: '#f8fafc',
        borderColor: config.borderColor,
        borderWidth: `${config.borderWidth}px`,
        borderRadius: '3.5mm',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-600 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-600 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-600 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-600 rounded-br-sm pointer-events-none" />

      {/* Header */}
      <div className="text-center border-b border-emerald-600 pb-1">
        <h3 className="text-[9px] font-extrabold uppercase text-emerald-900 tracking-wide">
          {config.rulesTitle || 'TATA TERTIB PERPUSTAKAAN'}
        </h3>
        <p className="text-[6.5px] font-semibold text-amber-700 tracking-wider uppercase">
          PERPUSTAKAAN &quot;BAHRUL &apos;ULUM&quot; MTs MIFTAHUL HUDA
        </p>
      </div>

      {/* Rules numbered list */}
      <div className="my-auto px-1 py-1">
        <ol className="text-[6.8px] text-slate-800 space-y-1 list-decimal list-inside leading-tight">
          {config.rulesList.map((rule, idx) => (
            <li key={idx} className="pl-0.5">
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Footer warning & return notice */}
      <div className="border-t border-slate-300 pt-1 text-center bg-emerald-50/70 rounded p-1">
        <p className="text-[6px] text-emerald-950 font-bold uppercase tracking-tight">
          BARANG SIAPA MENEMUKAN KARTU INI HARAP MENGEMBALIKAN KE:
        </p>
        <p className="text-[5.5px] text-slate-700 leading-tight">
          Perpustakaan MTs Miftahul Huda, {identity.alamat}
        </p>
        <p className="text-[5.5px] text-emerald-700 font-semibold mt-0.5">
          Telp: {identity.telepon} • Website: {identity.email}
        </p>
      </div>
    </div>
  );
};
