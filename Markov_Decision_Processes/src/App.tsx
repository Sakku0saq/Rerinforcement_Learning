/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, RotateCcw, Play, Pause, BrainCircuit, Heart, Flame } from 'lucide-react';

// --- MDP Configuration Data ---
type StateKey = 0 | 1 | 2;
type ActionKey = 'a0' | 'a1' | 'a2';

interface Transition {
  to: StateKey;
  p: number;
  r: number;
}

interface ActionDef {
  name: string;
  transitions: Transition[];
}

interface StateDef {
  name: string;
  actions: Partial<Record<ActionKey, ActionDef>>;
}

const MDP_DATA: Record<StateKey, StateDef> = {
  0: {
    name: 'S0',
    actions: {
      a0: { name: 'a0', transitions: [{ to: 0, p: 0.7, r: 10 }, { to: 1, p: 0.3, r: 0 }] },
      a1: { name: 'a1', transitions: [{ to: 0, p: 1.0, r: 0 }] },
      a2: { name: 'a2', transitions: [{ to: 0, p: 0.8, r: 0 }, { to: 1, p: 0.2, r: 0 }] }
    }
  },
  1: {
    name: 'S1',
    actions: {
      a0: { name: 'a0', transitions: [{ to: 0, p: 1.0, r: 0 }] },
      a2: { name: 'a2', transitions: [{ to: 2, p: 1.0, r: -50 }] }
    }
  },
  2: {
    name: 'S2',
    actions: {
      a1: { name: 'a1', transitions: [{ to: 0, p: 0.8, r: 40 }, { to: 1, p: 0.1, r: 0 }, { to: 2, p: 0.1, r: 0 }] }
    }
  }
};

// Pre-calculated Q-Values from the Python output
const Q_VALUES: Record<StateKey, Partial<Record<ActionKey, number>>> = {
  0: { a0: 18.92, a1: 17.03, a2: 13.62 },
  1: { a0: 0.00, a2: -4.88 },
  2: { a1: 50.13 }
};

const OPTIMAL_POLICY: Record<StateKey, ActionKey> = {
  0: 'a0',
  1: 'a0',
  2: 'a1'
};

const STATE_COORDS = {
  0: { x: 200, y: 220 },
  1: { x: 500, y: 220 },
  2: { x: 800, y: 220 },
};

const ACTION_COORDS: Record<string, { x: number, y: number }> = {
  '0_a0': { x: 200, y: 320 },
  '0_a1': { x: 120, y: 120 },
  '0_a2': { x: 330, y: 220 },
  '1_a0': { x: 500, y: 320 },
  '1_a2': { x: 650, y: 220 },
  '2_a1': { x: 800, y: 120 },
};

type FloatingReward = { id: number; text: string; x: number; y: number; isPositive: boolean };
type LogEntry = { id: number; step: number; from: StateKey; action: ActionKey; to: StateKey; reward: number };

const ActionDiamond = ({ x, y, label, isOptimal }: { x: number; y: number; label: string; isOptimal?: boolean }) => (
  <g transform={`translate(${x}, ${y})`}>
    <polygon 
      points="-22,0 0,-22 22,0 0,22" 
      className={`stroke-[3px] transition-colors ${isOptimal ? 'fill-amber-50 stroke-amber-500' : 'fill-blue-50 stroke-blue-500'}`} 
    />
    <text y="5" textAnchor="middle" className={`text-[12px] font-black ${isOptimal ? 'fill-amber-700' : 'fill-blue-700'}`}>{label}</text>
  </g>
);

const TransitionLabel = ({ x, y, prob }: { x: number; y: number; prob: string }) => (
  <text x={x} y={y} textAnchor="middle" className="text-sm fill-slate-500 font-bold bg-white">{prob}</text>
);

export default function App() {
  const [currentState, setCurrentState] = useState<StateKey>(0);
  const [agentPos, setAgentPos] = useState(STATE_COORDS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [totalReward, setTotalReward] = useState(0);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showQValues, setShowQValues] = useState(true);
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);

  // Log auto-scroll ref
  const logEndRef = useRef<HTMLDivElement>(null);

  const addFloatingReward = (reward: number, state: StateKey) => {
    if (reward === 0) return;
    const id = Date.now() + Math.random();
    setFloatingRewards(prev => [...prev, {
      id,
      text: reward > 0 ? `+${reward}` : `${reward}`,
      x: STATE_COORDS[state].x,
      y: STATE_COORDS[state].y,
      isPositive: reward > 0
    }]);
    setTimeout(() => {
      setFloatingRewards(prev => prev.filter(r => r.id !== id));
    }, 1200);
  };

  const takeAction = async (actionKey: ActionKey) => {
    if (isTransitioning) return;
    
    const action = MDP_DATA[currentState].actions[actionKey];
    if (!action) return;

    setIsTransitioning(true);
    setAgentPos(ACTION_COORDS[`${currentState}_${actionKey}`]);
    
    await new Promise(r => setTimeout(r, 450)); // Wait for movement to action diamond

    const r = Math.random();
    let cumulative = 0;
    let nextState = currentState;
    let receivedReward = 0;

    for (const transition of action.transitions) {
      cumulative += transition.p;
      if (r <= cumulative) {
        nextState = transition.to;
        receivedReward = transition.r;
        break;
      }
    }

    setAgentPos(STATE_COORDS[nextState]);
    await new Promise(r => setTimeout(r, 450)); // Wait for movement to next state

    addFloatingReward(receivedReward, nextState);
    
    setTotalReward(prev => prev + receivedReward);
    setStep(prev => prev + 1);
    setLog(prev => [{
      id: Date.now() + Math.random(),
      step: prev.length > 0 ? prev[0].step + 1 : 1,
      from: currentState,
      action: actionKey,
      to: nextState,
      reward: receivedReward
    }, ...prev].slice(0, 50));

    setCurrentState(nextState);
    setIsTransitioning(false);
  };

  const resetSimulation = () => {
    setIsAutoPlaying(false);
    setIsTransitioning(false);
    setCurrentState(0);
    setAgentPos(STATE_COORDS[0]);
    setTotalReward(0);
    setStep(0);
    setLog([]);
    setFloatingRewards([]);
  };

  // Auto-play interval
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isAutoPlaying && !isTransitioning) {
      timeoutId = setTimeout(() => {
        const optimal = OPTIMAL_POLICY[currentState];
        takeAction(optimal);
      }, 800);
    }
    return () => clearTimeout(timeoutId);
  }, [isAutoPlaying, currentState, isTransitioning]);

  // Scroll to latest log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = 0;
    }
  }, [log]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 selection:bg-blue-100">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-600" />
            Markov Decision Process Simulator
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Interactive visualization of the MDP with Q-Learning policy evaluation.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SVG Canvas Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative" style={{ aspectRatio: '21/9', minHeight: '350px' }}>
              <svg viewBox="0 0 1000 440" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
                  </marker>
                </defs>

                {/* --- State to Action Lines (Solid) --- */}
                <path d="M 200 268 L 200 300" stroke="#94a3b8" strokeWidth="3" /> {/* S0 to a0 */}
                <path d="M 166 186 L 134 134" stroke="#94a3b8" strokeWidth="3" /> {/* S0 to a1 */}
                <path d="M 248 220 L 310 220" stroke="#94a3b8" strokeWidth="3" /> {/* S0 to a2 */}
                <path d="M 500 268 L 500 300" stroke="#94a3b8" strokeWidth="3" /> {/* S1 to a0 */}
                <path d="M 548 220 L 630 220" stroke="#94a3b8" strokeWidth="3" /> {/* S1 to a2 */}
                <path d="M 800 172 L 800 140" stroke="#94a3b8" strokeWidth="3" /> {/* S2 to a1 */}

                {/* --- Action to State Lines (Probabilities - Dashed) --- */}
                {/* S0_a0 */}
                <path d="M 180 320 Q 120 320 155 255" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={135} y={305} prob="0.7" />
                <g transform="translate(100, 260)">
                  <Heart className="text-rose-500 w-5 h-5 fill-rose-500" />
                  <text x="10" y="32" textAnchor="middle" className="text-[12px] fill-rose-600 font-black">+10</text>
                </g>

                <path d="M 220 320 Q 350 320 470 255" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={350} y={345} prob="0.3" />

                {/* S0_a1 */}
                <path d="M 100 120 Q 80 180 155 200" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={85} y={165} prob="1.0" />

                {/* S0_a2 */}
                <path d="M 330 200 Q 300 150 235 185" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={280} y={165} prob="0.8" />
                
                <path d="M 350 220 L 445 220" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={400} y={210} prob="0.2" />

                {/* S1_a0 */}
                <path d="M 480 320 Q 350 320 230 260" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={350} y={345} prob="1.0" />

                {/* S1_a2 */}
                <path d="M 670 220 L 745 220" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={710} y={210} prob="1.0" />
                <g transform="translate(680, 235)">
                  <Flame className="text-amber-500 w-5 h-5 fill-amber-500" />
                  <text x="10" y="32" textAnchor="middle" className="text-[12px] fill-amber-600 font-black">-50</text>
                </g>

                {/* S2_a1 */}
                <path d="M 820 120 Q 880 120 840 180" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={875} y={160} prob="0.1" />

                <path d="M 780 120 Q 650 120 530 180" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={650} y={135} prob="0.1" />

                <path d="M 780 105 Q 500 -20 200 170" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrowhead)" />
                <TransitionLabel x={500} y={50} prob="0.8" />
                <g transform="translate(460, -10)">
                  <Heart className="text-rose-500 w-5 h-5 fill-rose-500" />
                  <text x="10" y="32" textAnchor="middle" className="text-[12px] fill-rose-600 font-black">+40</text>
                </g>

                {/* --- Action Diamonds --- */}
                <ActionDiamond x={200} y={320} label="a0" isOptimal={OPTIMAL_POLICY[0] === 'a0' && showQValues} />
                <ActionDiamond x={120} y={120} label="a1" isOptimal={OPTIMAL_POLICY[0] === 'a1' && showQValues} />
                <ActionDiamond x={330} y={220} label="a2" isOptimal={OPTIMAL_POLICY[0] === 'a2' && showQValues} />
                <ActionDiamond x={500} y={320} label="a0" isOptimal={OPTIMAL_POLICY[1] === 'a0' && showQValues} />
                <ActionDiamond x={650} y={220} label="a2" isOptimal={OPTIMAL_POLICY[1] === 'a2' && showQValues} />
                <ActionDiamond x={800} y={120} label="a1" isOptimal={OPTIMAL_POLICY[2] === 'a1' && showQValues} />

                {/* --- State Nodes --- */}
                {[0, 1, 2].map((s) => {
                  const stateKey = s as StateKey;
                  const isActive = currentState === stateKey;
                  return (
                    <g key={s} transform={`translate(${STATE_COORDS[stateKey].x}, ${STATE_COORDS[stateKey].y})`}>
                      <circle 
                        r="48" 
                        className={`transition-colors duration-500 stroke-[4px] ${isActive ? 'fill-emerald-100 stroke-emerald-500' : 'fill-slate-50 stroke-slate-300'}`} 
                      />
                      <text textAnchor="middle" dy=".3em" className={`text-2xl font-black ${isActive ? 'fill-emerald-700' : 'fill-slate-400'}`}>
                        S{s}
                      </text>
                    </g>
                  );
                })}

                {/* --- The Agent --- */}
                <motion.g
                  initial={{ x: STATE_COORDS[0].x, y: STATE_COORDS[0].y - 80, opacity: 0 }}
                  animate={{ x: agentPos.x, y: agentPos.y, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 140, damping: 15 }}
                >
                  <circle r="20" className="fill-blue-500" />
                  <circle r="32" className="fill-blue-400/30 animate-ping" style={{ transformOrigin: 'center' }} />
                  <circle r="8" className="fill-white opacity-80" cx="-5" cy="-5" /> {/* Highlight */}
                </motion.g>

                {/* --- Floating Rewards --- */}
                <AnimatePresence>
                  {floatingRewards.map(fr => (
                    <motion.text
                      key={fr.id}
                      initial={{ x: fr.x, y: fr.y - 60, opacity: 0, scale: 0.5 }}
                      animate={{ y: fr.y - 140, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`text-5xl font-black ${fr.isPositive ? 'fill-rose-500' : 'fill-amber-500'}`}
                      textAnchor="middle"
                      style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                    >
                      {fr.text}
                    </motion.text>
                  ))}
                </AnimatePresence>
              </svg>
              
              {/* Optional: Overlay labels for rewards context */}
              <div className="absolute top-4 left-4 flex gap-4 opacity-70 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className="text-sm font-bold text-slate-700">+ Reward</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-slate-700">- Penalty</span>
                </div>
              </div>
            </div>

            {/* Action Console */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Actions for State S{currentState}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {Object.entries(MDP_DATA[currentState].actions).map(([actKey, actData]) => {
                  const key = actKey as ActionKey;
                  const isOptimal = OPTIMAL_POLICY[currentState] === key;
                  const isDisabled = isAutoPlaying || isTransitioning;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => takeAction(key)}
                      disabled={isDisabled}
                      className={`relative flex-1 min-w-[140px] flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]
                        ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'}
                        ${showQValues && isOptimal
                          ? 'border-amber-400 bg-amber-50/50 text-amber-900 shadow-amber-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 shadow-slate-100'
                        } shadow-sm`}
                    >
                      <span className="text-3xl font-black mb-1">{actData.name}</span>
                      
                      {/* Q-Value Display */}
                      <AnimatePresence>
                        {showQValues && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm font-semibold tracking-wide text-slate-500 bg-white/80 px-3 py-1 rounded-full mt-2"
                          >
                            Q: {Q_VALUES[currentState][key]?.toFixed(2)}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Optimal Badge */}
                      <AnimatePresence>
                        {showQValues && isOptimal && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-3 -right-3 bg-amber-400 text-amber-950 text-[11px] font-black tracking-wider px-3 py-1.5 rounded-full shadow-md border-2 border-white uppercase"
                          >
                            Best
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Panel: Stats & Logs */}
          <div className="space-y-6 flex flex-col h-full">
            
            {/* Stats Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Reward</div>
                  <div className={`text-4xl font-black ${totalReward > 0 ? 'text-emerald-600' : totalReward < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {totalReward > 0 ? '+' : ''}{totalReward}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Steps</div>
                  <div className="text-4xl font-black text-slate-800">{step}</div>
                </div>
              </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Simulation Controls</h3>
              
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${
                  isAutoPlaying 
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isAutoPlaying ? 'Pause Auto-Run' : 'Run Optimal Policy'}
              </button>

              <button 
                onClick={() => setShowQValues(!showQValues)}
                className="w-full flex items-center justify-between py-4 px-6 rounded-2xl font-bold text-slate-700 bg-slate-50 border-2 border-transparent hover:border-slate-200 transition-colors"
              >
                <span>Show Q-Values</span>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${showQValues ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showQValues ? 'translate-x-6' : ''}`} />
                </div>
              </button>

              <button 
                onClick={resetSimulation}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Simulation
              </button>
            </div>

            {/* Event Log */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-grow min-h-[300px]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Event Log</h3>
                <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">Last 50 steps</span>
              </div>
              <div 
                ref={logEndRef}
                className="flex-grow p-4 overflow-y-auto space-y-2 bg-white"
                style={{ maxHeight: '350px' }}
              >
                <AnimatePresence>
                  {log.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-slate-400 text-center py-8 font-medium"
                    >
                      No actions taken yet.<br/>Click an action to begin.
                    </motion.div>
                  ) : (
                    log.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <span className="text-slate-400 text-xs w-6 text-right font-mono">#{entry.step}</span>
                          <span className="font-bold text-slate-800">S{entry.from}</span>
                          <span className="text-blue-500 font-bold px-1.5 py-0.5 bg-blue-100 rounded text-xs">{entry.action}</span>
                          <span className="text-slate-400 text-xs">→</span>
                          <span className="font-bold text-slate-800">S{entry.to}</span>
                        </div>
                        {entry.reward !== 0 && (
                          <span className={`font-bold tabular-nums ${entry.reward > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {entry.reward > 0 ? '+' : ''}{entry.reward}
                          </span>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

