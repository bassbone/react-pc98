'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface MenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: false;
  onClick?: () => void;
}

export interface MenuSeparator {
  separator: true;
}

export interface MenuEntry {
  label: string;
  items: (MenuItem | MenuSeparator)[];
}

export interface MenuBarProps {
  menus: MenuEntry[];
}

export function MenuBar({ menus }: MenuBarProps) {
  const [open, setOpen] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === null) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div
      ref={barRef}
      style={{
        display: 'flex',
        backgroundColor: 'var(--pc98-light-gray)',
        color: 'var(--pc98-black)',
        borderBottom: '2px solid var(--pc98-dark-gray)',
        position: 'relative',
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      {menus.map((menu, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <div
            onMouseDown={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => open !== null && setOpen(i)}
            style={{
              padding: '2px 12px',
              backgroundColor: open === i ? 'var(--pc98-dark-blue)' : 'transparent',
              color: open === i ? 'var(--pc98-white)' : 'var(--pc98-black)',
              cursor: 'pointer',
            }}
          >
            {menu.label}
          </div>

          {open === i && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                minWidth: 180,
                backgroundColor: 'var(--pc98-light-gray)',
                border: '2px solid',
                borderColor: 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
                boxShadow: '2px 2px 0 var(--pc98-black)',
                zIndex: 200,
              }}
            >
              {menu.items.map((item, j) => {
                if ('separator' in item && item.separator) {
                  return (
                    <div
                      key={j}
                      style={{
                        height: 2,
                        margin: '2px 4px',
                        backgroundColor: 'var(--pc98-dark-gray)',
                        borderTop: '1px solid var(--pc98-white)',
                      }}
                    />
                  );
                }
                const mi = item as MenuItem;
                return (
                  <div
                    key={j}
                    onMouseDown={() => {
                      if (mi.disabled) return;
                      mi.onClick?.();
                      setOpen(null);
                    }}
                    style={{
                      padding: '3px 20px 3px 12px',
                      cursor: mi.disabled ? 'not-allowed' : 'pointer',
                      color: mi.disabled ? 'var(--pc98-dark-gray)' : 'var(--pc98-black)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 24,
                    }}
                    onMouseEnter={(e) => {
                      if (!mi.disabled)
                        (e.currentTarget as HTMLDivElement).style.cssText +=
                          ';background-color:var(--pc98-dark-blue);color:var(--pc98-white)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
                      (e.currentTarget as HTMLDivElement).style.color = mi.disabled
                        ? 'var(--pc98-dark-gray)'
                        : 'var(--pc98-black)';
                    }}
                  >
                    <span>{mi.label}</span>
                    {mi.shortcut && (
                      <span style={{ color: 'inherit', opacity: 0.7 }}>{mi.shortcut}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
