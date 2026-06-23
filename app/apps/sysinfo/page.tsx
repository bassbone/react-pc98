'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Desktop }     from '../../../lib/components/Desktop';
import { Window }      from '../../../lib/components/Window';
import { ProgressBar } from '../../../lib/components/ProgressBar';
import { MenuBar }     from '../../../lib/components/MenuBar';
import { StatusBar }   from '../../../lib/components/StatusBar';

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024)        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024)               return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatJapaneseDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 `
       + `${pad(d.getHours())}時${pad(d.getMinutes())}分${pad(d.getSeconds())}秒`;
}

export default function SysInfoPage() {
  const router = useRouter();
  const [now, setNow]           = useState(() => new Date());
  const [memInfo, setMemInfo]   = useState<MemoryInfo | null>(null);
  const [cores, setCores]       = useState<number | null>(null);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setCores(navigator.hardwareConcurrency ?? null);
    setUserAgent(navigator.userAgent);

    try {
      const perf = (performance as unknown as { memory?: MemoryInfo }).memory;
      if (perf) setMemInfo(perf);
    } catch {
      // not available in this browser
    }

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hwRows: [string, string][] = [
    ['CPU',     `NEC V30 (8MHz)${cores !== null ? `  (実際: ${cores} コア)` : ''}`],
    ['RAM',     '640KB 従来メモリ + 15,360KB 拡張メモリ'],
    ['GPU',     'PC-98 グラフィックコントローラ (640×400, 16色)'],
    ['Storage', '5.25" FDD × 2, 40MB HDD'],
    ['Sound',   'FM音源 (OPM) + PSG × 3'],
  ];

  const memBars: { label: string; value: number; color?: string }[] = [
    { label: '従来メモリ',         value: 78, color: 'var(--pc98-green)' },
    { label: '拡張メモリ',         value: 45, color: 'var(--pc98-blue)'  },
    { label: 'ビデオメモリ',       value: 62, color: 'var(--pc98-cyan)'  },
    { label: 'ディスクキャッシュ', value: 33, color: 'var(--pc98-yellow)'},
  ];

  const osRows: [string, string][] = [
    ['OS',   'MS-DOS Version 5.0A'],
    ['BIOS', 'NEC PC-98 BIOS Rev.7.0'],
    ['ブラウザ', (userAgent ? userAgent.slice(0, 60) + (userAgent.length > 60 ? '…' : '') : '取得中...')],
    ['日時', formatJapaneseDate(now)],
  ];

  const cellLabel: React.CSSProperties = {
    color: 'var(--pc98-cyan)',
    whiteSpace: 'nowrap',
    paddingRight: 12,
    verticalAlign: 'top',
    fontFamily: 'var(--pc98-font)',
    fontSize: 12,
  };

  const cellValue: React.CSSProperties = {
    color: 'var(--pc98-white)',
    wordBreak: 'break-all',
    fontFamily: 'var(--pc98-font)',
    fontSize: 12,
    textAlign: 'right',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <MenuBar
        menus={[
          {
            label: 'ファイル(F)',
            items: [
              { label: '終了', onClick: () => router.push('/') },
            ],
          },
          {
            label: '表示(V)',
            items: [
              { label: '更新', onClick: () => setNow(new Date()) },
            ],
          },
        ]}
      />

      <Desktop wallpaper="grid" style={{ flex: 1 }}>
        {/* Window 1: Hardware */}
        <Window title="ハードウェア情報" x={20} y={20} width={380} height={220} onClose={() => {}}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {hwRows.map(([label, value]) => (
                <tr key={label}>
                  <td style={cellLabel}>{label}</td>
                  <td style={cellValue}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Window>

        {/* Window 2: Memory */}
        <Window title="メモリ状況" x={420} y={20} width={340} height={280} onClose={() => {}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {memBars.map(bar => (
              <ProgressBar key={bar.label} value={bar.value} label={bar.label} color={bar.color} />
            ))}

            {memInfo && (
              <div style={{ marginTop: 8, borderTop: '1px solid var(--pc98-dark-gray)', paddingTop: 8 }}>
                <div style={{ color: 'var(--pc98-cyan)', fontSize: 11, fontFamily: 'var(--pc98-font)', marginBottom: 4 }}>
                  ブラウザ実メモリ (performance.memory)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {([
                      ['使用中',   formatBytes(memInfo.usedJSHeapSize)],
                      ['合計確保', formatBytes(memInfo.totalJSHeapSize)],
                      ['上限',     formatBytes(memInfo.jsHeapSizeLimit)],
                    ] as [string, string][]).map(([l, v]) => (
                      <tr key={l}>
                        <td style={{ ...cellLabel, fontSize: 11 }}>{l}</td>
                        <td style={{ ...cellValue, fontSize: 11 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Window>

        {/* Window 3: OS Info */}
        <Window title="OS情報" x={20} y={260} width={380} height={200} onClose={() => {}}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {osRows.map(([label, value]) => (
                <tr key={label}>
                  <td style={{ ...cellLabel, paddingBottom: 6 }}>{label}</td>
                  <td style={{ ...cellValue, paddingBottom: 6 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'システム情報', flex: 2 },
          { text: `CPU: NEC V30 8MHz${cores !== null ? ` / 実際: ${cores}コア` : ''}`, flex: 3 },
          { text: formatJapaneseDate(now), flex: 3, align: 'right' },
        ]}
      />
    </div>
  );
}
