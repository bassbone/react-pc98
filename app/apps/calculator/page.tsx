'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Desktop }   from '../../../lib/components/Desktop';
import { Window }    from '../../../lib/components/Window';
import { Button }    from '../../../lib/components/Button';
import { MenuBar }   from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';

type CalcOp = '+' | '-' | '×' | '÷' | null;

export default function CalculatorPage() {
  const router = useRouter();

  const [display, setDisplay]       = useState('0');
  const [expression, setExpression] = useState('');
  const [operand, setOperand]       = useState<number | null>(null);
  const [operator, setOperator]     = useState<CalcOp>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [memory, setMemory]         = useState<number>(0);
  const [error, setError]           = useState(false);

  const currentValue = parseFloat(display);

  const inputDigit = useCallback((digit: string) => {
    if (error) return;
    if (waitingForNext) {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForNext(false);
    } else {
      if (digit === '.') {
        setDisplay(display.includes('.') ? display : display + '.');
      } else {
        setDisplay(display === '0' ? digit : display + digit);
      }
    }
  }, [display, waitingForNext, error]);

  const inputOperator = useCallback((op: CalcOp) => {
    if (error) return;
    const val = parseFloat(display);

    if (operand !== null && !waitingForNext) {
      const result = calculate(operand, val, operator);
      if (result === null) {
        setDisplay('エラー');
        setExpression('');
        setError(true);
        setOperand(null);
        setOperator(null);
        setWaitingForNext(true);
        return;
      }
      const resultStr = formatResult(result);
      setDisplay(resultStr);
      setExpression(`${resultStr} ${op}`);
      setOperand(result);
    } else {
      setExpression(`${display} ${op}`);
      setOperand(val);
    }

    setOperator(op);
    setWaitingForNext(true);
  }, [display, operand, operator, waitingForNext, error]);

  const calculate = (a: number, b: number, op: CalcOp): number | null => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? null : a / b;
      default:  return b;
    }
  };

  const formatResult = (n: number): string => {
    if (!isFinite(n)) return 'エラー';
    const s = n.toPrecision(10);
    const parsed = parseFloat(s);
    return String(parsed);
  };

  const handleEquals = useCallback(() => {
    if (error) return;
    if (operand === null || operator === null) return;
    const val = parseFloat(display);
    const result = calculate(operand, val, operator);
    if (result === null) {
      setDisplay('0÷0');
      setExpression('');
      setError(true);
      setOperand(null);
      setOperator(null);
      setWaitingForNext(true);
      return;
    }
    const resultStr = formatResult(result);
    setExpression(`${expression} ${display} =`);
    setDisplay(resultStr);
    setOperand(null);
    setOperator(null);
    setWaitingForNext(true);
  }, [display, operand, operator, expression, error]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setOperand(null);
    setOperator(null);
    setWaitingForNext(false);
    setError(false);
  }, []);

  const handleToggleSign = useCallback(() => {
    if (error) return;
    const val = parseFloat(display);
    setDisplay(formatResult(-val));
  }, [display, error]);

  const handleBackspace = useCallback(() => {
    if (error || waitingForNext) return;
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForNext, error]);

  const handleMemoryClear  = () => setMemory(0);
  const handleMemoryRecall = () => {
    setDisplay(formatResult(memory));
    setWaitingForNext(false);
  };
  const handleMemoryPlus   = () => setMemory(m => m + currentValue);
  const handleMemoryMinus  = () => setMemory(m => m - currentValue);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k >= '0' && k <= '9')      { e.preventDefault(); inputDigit(k); }
      else if (k === '.')            { e.preventDefault(); inputDigit('.'); }
      else if (k === '+')            { e.preventDefault(); inputOperator('+'); }
      else if (k === '-')            { e.preventDefault(); inputOperator('-'); }
      else if (k === '*')            { e.preventDefault(); inputOperator('×'); }
      else if (k === '/')            { e.preventDefault(); inputOperator('÷'); }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); handleEquals(); }
      else if (k === 'Escape')       { e.preventDefault(); handleClear(); }
      else if (k === 'Backspace')    { e.preventDefault(); handleBackspace(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputDigit, inputOperator, handleEquals, handleClear, handleBackspace]);

  const btnStyle: React.CSSProperties = {
    width: 52,
    height: 36,
    fontSize: 14,
    padding: '0',
  };

  const opStyle: React.CSSProperties = {
    ...btnStyle,
    fontFamily: 'var(--pc98-font)',
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
            label: '編集(E)',
            items: [
              { label: 'クリア', onClick: handleClear },
              { label: 'メモリクリア', onClick: handleMemoryClear },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window title="電卓" x={120} y={40} width={280} height={340} onClose={() => router.push('/')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Display */}
            <div
              style={{
                backgroundColor: 'var(--pc98-black)',
                border: '2px solid',
                borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
                padding: '4px 8px',
                textAlign: 'right',
                fontFamily: 'var(--pc98-font)',
              }}
            >
              <div style={{ color: 'var(--pc98-dark-gray)', fontSize: 11, minHeight: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {expression || ' '}
              </div>
              <div style={{
                color: error ? 'var(--pc98-red)' : 'var(--pc98-white)',
                fontSize: 22,
                letterSpacing: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {display}
              </div>
            </div>

            {/* Memory row */}
            <div style={{ display: 'flex', gap: 4 }}>
              <Button style={btnStyle} onClick={handleMemoryClear}>MC</Button>
              <Button style={btnStyle} onClick={handleMemoryRecall}>MR</Button>
              <Button style={btnStyle} onClick={handleMemoryPlus}>M+</Button>
              <Button style={btnStyle} onClick={handleMemoryMinus}>M-</Button>
            </div>

            {/* Number rows */}
            <div style={{ display: 'flex', gap: 4 }}>
              <Button style={btnStyle} onClick={() => inputDigit('7')}>7</Button>
              <Button style={btnStyle} onClick={() => inputDigit('8')}>8</Button>
              <Button style={btnStyle} onClick={() => inputDigit('9')}>9</Button>
              <Button style={opStyle} variant="primary" onClick={() => inputOperator('÷')}>÷</Button>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button style={btnStyle} onClick={() => inputDigit('4')}>4</Button>
              <Button style={btnStyle} onClick={() => inputDigit('5')}>5</Button>
              <Button style={btnStyle} onClick={() => inputDigit('6')}>6</Button>
              <Button style={opStyle} variant="primary" onClick={() => inputOperator('×')}>×</Button>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button style={btnStyle} onClick={() => inputDigit('1')}>1</Button>
              <Button style={btnStyle} onClick={() => inputDigit('2')}>2</Button>
              <Button style={btnStyle} onClick={() => inputDigit('3')}>3</Button>
              <Button style={opStyle} variant="primary" onClick={() => inputOperator('-')}>-</Button>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button style={btnStyle} onClick={handleToggleSign}>±</Button>
              <Button style={btnStyle} onClick={() => inputDigit('0')}>0</Button>
              <Button style={btnStyle} onClick={() => inputDigit('.')}>.</Button>
              <Button style={opStyle} variant="primary" onClick={() => inputOperator('+')}>+</Button>
            </div>

            {/* Bottom row: C and = */}
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                style={{ ...btnStyle, width: 52 }}
                variant="danger"
                onClick={handleClear}
              >
                C
              </Button>
              <Button
                style={{ ...btnStyle, width: 112, flex: 1 }}
                variant="primary"
                onClick={handleEquals}
              >
                =
              </Button>
            </div>
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: '電卓', flex: 2 },
          { text: `メモリ: ${formatResult(memory)}`, flex: 2 },
          { text: operator ? `演算: ${operator}` : '待機中', flex: 1, align: 'right' },
        ]}
      />
    </div>
  );
}
