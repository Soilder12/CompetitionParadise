import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/audio';
import { Thermometer, Lightbulb, Lock, Fan, Droplets, Zap } from 'lucide-react';

const faults = [
  { id: 'f1', type: 'temp', name: '房间太热', icon: Thermometer, x: 20, y: 30, q: '用什么设备来检测温度？', options: ['A. 湿度传感器', 'B. 温度传感器', 'C. 摄像头', 'D. 麦克风'], a: 1, exp: '温度传感器可以实时监测房间的冷热变化！' },
  { id: 'f2', type: 'light', name: '灯不亮了', icon: Lightbulb, x: 70, y: 20, q: '用什么设备来控制灯光？', options: ['A. 智能开关/继电器', 'B. 水泵', 'C. 烟雾报警器', 'D. 路由器'], a: 0, exp: '智能开关（执行器）接收指令后可以控制灯的亮灭！' },
  { id: 'f3', type: 'lock', name: '门没锁', icon: Lock, x: 80, y: 60, q: '用什么设备来检测门窗状态？', options: ['A. 门磁传感器', 'B. 光敏传感器', 'C. 压力传感器', 'D. 速度传感器'], a: 0, exp: '门磁传感器由两部分组成，分开时就会报警门没关好！' },
  { id: 'f4', type: 'air', name: '空气很闷', icon: Fan, x: 30, y: 70, q: '用什么设备来改善空气？', options: ['A. 电视机', 'B. 智能排风扇', 'C. 冰箱', 'D. 烤箱'], a: 1, exp: '排风扇（执行器）可以加速空气流通，改善闷热环境！' },
  { id: 'f5', type: 'water', name: '漏水了', icon: Droplets, x: 50, y: 80, q: '用什么设备来检测漏水？', options: ['A. 水浸传感器', 'B. 运动传感器', 'C. 声音传感器', 'D. 颜色传感器'], a: 0, exp: '水浸传感器接触到水时会改变电阻，从而发出漏水报警！' },
];

export default function Game5({ onEnd, onBack }: { onEnd: (score: number) => void, onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [activeFaults, setActiveFaults] = useState<string[]>([]);
  const [selectedFault, setSelectedFault] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [repairs, setRepairs] = useState(0);
  const [showExp, setShowExp] = useState<{ type: 'correct'|'wrong', text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const spawnTimerRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setScore(0);
    setTimeLeft(90);
    setActiveFaults([]);
    setSelectedFault(null);
    setCombo(0);
    setRepairs(0);
    setShowExp(null);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      playSound('success');
      setIsFinished(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isFinished]);

  useEffect(() => {
    if (isFinished || showExp || selectedFault) return;
    
    const spawnFault = () => {
      setActiveFaults(prev => {
        if (prev.length >= 3) return prev;
        const available = faults.filter(f => !prev.includes(f.id));
        if (available.length === 0) return prev;
        const newFault = available[Math.floor(Math.random() * available.length)];
        return [...prev, newFault.id];
      });
      spawnTimerRef.current = setTimeout(spawnFault, 2000 + Math.random() * 3000);
    };

    spawnTimerRef.current = setTimeout(spawnFault, 1000);

    return () => clearTimeout(spawnTimerRef.current);
  }, [isFinished, showExp, selectedFault]);

  const handleFaultClick = (id: string) => {
    if (showExp) return;
    playSound('success'); // Just a click sound
    setSelectedFault(id);
  };

  const handleAnswer = (idx: number) => {
    const fault = faults.find(f => f.id === selectedFault);
    if (!fault) return;

    if (idx !== fault.a) {
      playSound('wrong');
      setScore(s => Math.max(0, s - 50));
      setCombo(0);
      setShowExp({ type: 'wrong', text: `修复失败！正确答案是：${fault.options[fault.a]}\n${fault.exp}` });
    } else {
      playSound('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setRepairs(r => r + 1);
      let points = 150;
      if (newCombo % 3 === 0) points += 100;
      setScore(s => s + points);
      setActiveFaults(prev => prev.filter(id => id !== selectedFault));
      setShowExp({ type: 'correct', text: `修复成功！${newCombo % 3 === 0 ? '连击奖励+100！\n' : '\n'}${fault.exp}` });
    }
    
    setTimeout(() => {
      setShowExp(null);
      setSelectedFault(null);
    }, 2500);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-8 text-green-400">游戏结束！</h1>
        <p className="text-4xl mb-4">最终得分：{score}</p>
        <p className="text-4xl mb-4">成功修复次数：{repairs}</p>
        <p className="text-5xl font-bold text-yellow-400 mb-12">称号：家居修复专家</p>
        <div className="flex gap-8">
          <button onClick={() => onEnd(score)} className="px-12 py-6 bg-slate-600 rounded-3xl text-4xl font-bold active:scale-95">返回主菜单</button>
          <button onClick={resetGame} className="px-12 py-6 bg-green-500 rounded-3xl text-4xl font-bold active:scale-95">再来一局</button>
        </div>
      </div>
    );
  }

  const currentFaultObj = faults.find(f => f.id === selectedFault);

  return (
    <div className="flex flex-col h-full p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div className="text-4xl font-bold text-white">倒计时: {timeLeft}秒</div>
        <div className="text-4xl font-bold text-green-400">得分: {score} <span className="text-yellow-400 text-3xl ml-4">连击: {combo}</span></div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-700 text-white rounded-2xl text-3xl font-bold active:scale-95">返回菜单</button>
      </div>

      <div className="flex-1 flex gap-8 max-w-7xl mx-auto w-full">
        {/* Smart Home Room Map */}
        <div className="flex-1 bg-slate-800 rounded-3xl border-4 border-slate-600 relative overflow-hidden">
          {/* Room Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#94a3b8 2px, transparent 2px), linear-gradient(90deg, #94a3b8 2px, transparent 2px)',
            backgroundSize: '100px 100px'
          }}></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Zap size={400} />
          </div>

          {faults.map(fault => {
            const isActive = activeFaults.includes(fault.id);
            const Icon = fault.icon;
            if (!isActive) return null;

            return (
              <button
                key={fault.id}
                onClick={() => handleFaultClick(fault.id)}
                className={`absolute w-32 h-32 -ml-16 -mt-16 rounded-full border-4 flex flex-col items-center justify-center p-2 transition-transform hover:scale-110 ${
                  selectedFault === fault.id ? 'bg-blue-900/80 border-blue-500 animate-pulse' : 'bg-red-900/80 border-red-500 animate-bounce'
                }`}
                style={{ left: `${fault.x}%`, top: `${fault.y}%` }}
              >
                <Icon size={48} className={selectedFault === fault.id ? 'text-blue-400' : 'text-red-400'} />
                <span className="text-white font-bold text-lg mt-2">{fault.name}</span>
              </button>
            );
          })}
        </div>

        {/* Question Panel */}
        <div className="w-[500px] flex flex-col gap-4">
          {selectedFault && currentFaultObj && !showExp ? (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-800 p-8 rounded-3xl border-4 border-blue-500 h-full flex flex-col">
              <h3 className="text-4xl font-bold text-white mb-8 leading-tight">{currentFaultObj.q}</h3>
              <div className="flex flex-col gap-4 flex-1">
                {currentFaultObj.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="flex-1 p-4 bg-slate-700 border-4 border-slate-500 rounded-2xl text-3xl text-white font-bold text-left hover:bg-slate-600 active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-3xl border-4 border-slate-600 h-full flex items-center justify-center">
              <p className="text-3xl text-slate-400 font-bold text-center">点击闪烁的故障点进行修复</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showExp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 rounded-3xl border-4 shadow-2xl z-50 text-center w-[80%] max-w-4xl ${
              showExp.type === 'correct' ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'
            }`}
          >
            <div className="text-6xl font-bold text-white mb-8">
              {showExp.type === 'correct' ? '修复成功！' : '修复失败！'}
            </div>
            <div className="text-4xl text-white leading-relaxed whitespace-pre-line">{showExp.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
