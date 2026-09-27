'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Types ────────────────────────────────────────────────────────────────────
type CalcMode = 'DEG' | 'RAD'

// ─── Nuclear Decay Calculator ─────────────────────────────────────────────────
function NuclearDecayCalc() {
  const [n0, setN0] = useState('')
  const [halfLife, setHalfLife] = useState('')
  const [time, setTime] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const calculate = () => {
    const N0 = parseFloat(n0)
    const T = parseFloat(halfLife)
    const t = parseFloat(time)
    if (isNaN(N0) || isNaN(T) || isNaN(t) || T <= 0) {
      setResult('Input tidak valid')
      return
    }
    const lambda = Math.LN2 / T
    const Nt = N0 * Math.exp(-lambda * t)
    setResult(
      `N(t) = ${Nt.toExponential(4)}\nAktivitas tersisa: ${((Nt / N0) * 100).toFixed(2)}%`,
    )
  }

  return (
    <div className="p-3 space-y-2">
      <p className="text-[10px] font-mono text-slate-400 text-center mb-1">
        N(t) = N₀ · e<sup>−λt</sup>
      </p>
      <div className="space-y-1.5">
        <div>
          <label className="text-[10px] text-slate-400">N₀ (Awal)</label>
          <Input
            value={n0}
            onChange={(e) => setN0(e.target.value)}
            placeholder="mis. 100"
            className="h-7 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">T½ (Waktu Paro)</label>
          <Input
            value={halfLife}
            onChange={(e) => setHalfLife(e.target.value)}
            placeholder="mis. 73.83"
            className="h-7 text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">t (Waktu)</label>
          <Input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="mis. 30"
            className="h-7 text-xs"
          />
        </div>
      </div>
      <Button size="sm" className="w-full h-7 text-xs" onClick={calculate}>
        Hitung
      </Button>
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
          <pre className="text-[11px] text-emerald-800 whitespace-pre-wrap font-mono">{result}</pre>
        </div>
      )}
    </div>
  )
}

export interface ScientificCalculatorProps {
  onClose?: () => void;
}

export default function ScientificCalculator({ onClose }: ScientificCalculatorProps = {}) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [mode, setMode] = useState<CalcMode>('DEG')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [memory, setMemory] = useState<number>(0)
  const [error, setError] = useState(false)

  const toRad = (deg: number) => (deg * Math.PI) / 180

  // ── Input digit/decimal ────────────────────────────────────────────────────
  const inputDigit = useCallback(
    (digit: string) => {
      if (error) { setDisplay('0'); setExpression(''); setError(false); setWaitingForOperand(false) }
      if (waitingForOperand) {
        setDisplay(digit)
        setWaitingForOperand(false)
      } else {
        setDisplay(display === '0' ? digit : display + digit)
      }
    },
    [display, waitingForOperand, error],
  )

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return }
    if (!display.includes('.')) setDisplay(display + '.')
  }, [display, waitingForOperand])

  // ── Operator ───────────────────────────────────────────────────────────────
  const performOperation = useCallback(
    (operator: string) => {
      const currentValue = parseFloat(display)
      const newExpr = expression + display + ' ' + operator + ' '
      setExpression(newExpr)
      setWaitingForOperand(true)
    },
    [display, expression],
  )

  // ── Equals ────────────────────────────────────────────────────────────────
  const calculate = useCallback(() => {
    const fullExpr = expression + display
    try {
      // Safe eval: replace ^ with ** and handle basic ops
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + sanitized + ')')()
      const formatted =
        typeof result === 'number' && isFinite(result)
          ? parseFloat(result.toPrecision(12)).toString()
          : 'Error'
      setDisplay(formatted)
      setExpression(fullExpr + ' =')
      setWaitingForOperand(true)
      if (formatted === 'Error') setError(true)
    } catch {
      setDisplay('Error')
      setError(true)
    }
  }, [display, expression])

  // ── Scientific ops ─────────────────────────────────────────────────────────
  const applyScientific = useCallback(
    (fn: string) => {
      const val = parseFloat(display)
      let result: number
      try {
        switch (fn) {
          case 'sin': result = Math.sin(mode === 'DEG' ? toRad(val) : val); break
          case 'cos': result = Math.cos(mode === 'DEG' ? toRad(val) : val); break
          case 'tan': result = Math.tan(mode === 'DEG' ? toRad(val) : val); break
          case 'asin': result = mode === 'DEG' ? (Math.asin(val) * 180) / Math.PI : Math.asin(val); break
          case 'acos': result = mode === 'DEG' ? (Math.acos(val) * 180) / Math.PI : Math.acos(val); break
          case 'atan': result = mode === 'DEG' ? (Math.atan(val) * 180) / Math.PI : Math.atan(val); break
          case 'log': result = Math.log10(val); break
          case 'ln': result = Math.log(val); break
          case 'sqrt': result = Math.sqrt(val); break
          case 'x2': result = val * val; break
          case 'x3': result = val * val * val; break
          case '1/x': result = 1 / val; break
          case 'exp': result = Math.exp(val); break
          case 'pi': result = Math.PI; break
          case 'e': result = Math.E; break
          case 'abs': result = Math.abs(val); break
          case 'fact': {
            if (val < 0 || !Number.isInteger(val)) { setDisplay('Error'); setError(true); return }
            result = 1; for (let i = 2; i <= val; i++) result *= i; break
          }
          case '10x': result = Math.pow(10, val); break
          case 'neg': result = -val; break
          default: return
        }
        const formatted = isFinite(result) ? parseFloat(result.toPrecision(10)).toString() : 'Error'
        setDisplay(formatted)
        setExpression(`${fn}(${val}) =`)
        setWaitingForOperand(true)
        if (formatted === 'Error') setError(true)
      } catch {
        setDisplay('Error'); setError(true)
      }
    },
    [display, mode],
  )

  // ── Clear / Backspace ─────────────────────────────────────────────────────
  const clear = () => { setDisplay('0'); setExpression(''); setWaitingForOperand(false); setError(false) }
  const backspace = () => {
    if (waitingForOperand || error) return
    const newDisplay = display.slice(0, -1) || '0'
    setDisplay(newDisplay)
  }

  // ── Memory ────────────────────────────────────────────────────────────────
  const memStore = () => setMemory(parseFloat(display))
  const memRecall = () => { setDisplay(memory.toString()); setWaitingForOperand(false) }
  const memClear = () => setMemory(0)
  const memAdd = () => setMemory(memory + parseFloat(display))

  // ── Button component ──────────────────────────────────────────────────────
  const Btn = ({
    label, onClick, className, wide,
  }: { label: React.ReactNode; onClick: () => void; className?: string; wide?: boolean }) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-lg text-xs font-medium h-8 transition-all active:scale-95',
        'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700',
        wide && 'col-span-2',
        className,
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-slate-900 w-72 select-none rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {onClose && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-xs text-slate-300">
          <span className="font-semibold text-blue-400">Kalkulator Scientific</span>
          <button onClick={onClose} className="hover:text-red-400 p-0.5 rounded font-bold">✕</button>
        </div>
      )}
      <Tabs defaultValue="sci">
        <TabsList className="w-full rounded-none bg-slate-800 h-8">
          <TabsTrigger value="sci" className="flex-1 text-xs h-6">Saintifik</TabsTrigger>
          <TabsTrigger value="nuclear" className="flex-1 text-xs h-6">Nuklir</TabsTrigger>
        </TabsList>

        <TabsContent value="sci" className="mt-0">
          {/* Display */}
          <div className="p-3 bg-slate-900 space-y-0.5">
            <div className="text-slate-400 text-[10px] font-mono h-4 truncate text-right">
              {expression || '\u00a0'}
            </div>
            <div
              className={cn(
                'text-right font-mono text-2xl font-bold truncate',
                error ? 'text-red-400' : 'text-white',
              )}
            >
              {display}
            </div>
            {memory !== 0 && (
              <div className="text-right text-[10px] text-blue-400 font-mono">M: {memory}</div>
            )}
          </div>

          <div className="p-2 space-y-1.5">
            {/* Mode + Memory row */}
            <div className="grid grid-cols-4 gap-1">
              <Btn
                label={mode}
                onClick={() => setMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
                className="bg-blue-900/60 text-blue-300 border-blue-800 hover:bg-blue-800/60"
              />
              <Btn label="MC" onClick={memClear} className="bg-slate-800 text-slate-300 border-slate-700" />
              <Btn label="MR" onClick={memRecall} className="bg-slate-800 text-slate-300 border-slate-700" />
              <Btn label="M+" onClick={memAdd} className="bg-slate-800 text-slate-300 border-slate-700" />
            </div>

            {/* Scientific row 1 */}
            <div className="grid grid-cols-4 gap-1">
              <Btn label="sin" onClick={() => applyScientific('sin')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="cos" onClick={() => applyScientific('cos')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="tan" onClick={() => applyScientific('tan')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="π" onClick={() => applyScientific('pi')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
            </div>

            {/* Scientific row 2 */}
            <div className="grid grid-cols-4 gap-1">
              <Btn label="log" onClick={() => applyScientific('log')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="ln" onClick={() => applyScientific('ln')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="eˣ" onClick={() => applyScientific('exp')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="e" onClick={() => applyScientific('e')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
            </div>

            {/* Scientific row 3 */}
            <div className="grid grid-cols-4 gap-1">
              <Btn label="√x" onClick={() => applyScientific('sqrt')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="x²" onClick={() => applyScientific('x2')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="1/x" onClick={() => applyScientific('1/x')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="|x|" onClick={() => applyScientific('abs')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
            </div>

            <Separator className="bg-slate-700" />

            {/* Standard calculator rows */}
            <div className="grid grid-cols-4 gap-1">
              <Btn label="AC" onClick={clear} className="bg-red-900/60 text-red-300 border-red-800 hover:bg-red-800/60" />
              <Btn label="⌫" onClick={backspace} className="bg-slate-700 text-slate-200 border-slate-600" />
              <Btn label="(" onClick={() => { setExpression(expression + display + ' ('); setDisplay('0') }} className="bg-slate-700 text-slate-200 border-slate-600" />
              <Btn label=")" onClick={() => { setExpression(expression + display + ') '); setWaitingForOperand(true) }} className="bg-slate-700 text-slate-200 border-slate-600" />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {['7', '8', '9'].map((d) => (
                <Btn key={d} label={d} onClick={() => inputDigit(d)} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              ))}
              <Btn label="÷" onClick={() => performOperation('/')} className="bg-amber-600/80 text-white border-amber-600 hover:bg-amber-600" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['4', '5', '6'].map((d) => (
                <Btn key={d} label={d} onClick={() => inputDigit(d)} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              ))}
              <Btn label="×" onClick={() => performOperation('*')} className="bg-amber-600/80 text-white border-amber-600 hover:bg-amber-600" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['1', '2', '3'].map((d) => (
                <Btn key={d} label={d} onClick={() => inputDigit(d)} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              ))}
              <Btn label="−" onClick={() => performOperation('-')} className="bg-amber-600/80 text-white border-amber-600 hover:bg-amber-600" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <Btn label="+/−" onClick={() => applyScientific('neg')} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              <Btn label="0" onClick={() => inputDigit('0')} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              <Btn label="." onClick={inputDecimal} className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              <Btn label="+" onClick={() => performOperation('+')} className="bg-amber-600/80 text-white border-amber-600 hover:bg-amber-600" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <Btn label="xʸ" onClick={() => performOperation('**')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="10ˣ" onClick={() => applyScientific('10x')} className="bg-indigo-900/50 text-indigo-300 border-indigo-800 hover:bg-indigo-800/50" />
              <Btn label="MS" onClick={memStore} className="bg-slate-700 text-slate-200 border-slate-600" />
              <Btn
                label="="
                onClick={calculate}
                className="bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nuclear" className="mt-0 bg-slate-800">
          <NuclearDecayCalc />
        </TabsContent>
      </Tabs>
    </div>
  )
}
