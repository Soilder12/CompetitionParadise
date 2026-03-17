import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/audio';
import { Thermometer, Droplets, Sun, Activity, Lightbulb, Fan } from 'lucide-react';

const devices = [
  { id: 'temp', name: '温度传感器', icon: Thermometer, color: 'text-red-400' },
  { id: 'hum', name: '湿度传感器', icon: Droplets, color: 'text-blue-400' },
  { id: 'light', name: '光敏传感器', icon: Sun, color: 'text-yellow-400' },
  { id: 'motion', name: '运动传感器', icon: Activity, color: 'text-green-400' },
  { id: 'led', name: 'LED路灯', icon: Lightbulb, color: 'text-yellow-200' },
  { id: 'pump', name: '水泵', icon: Fan, color: 'text-cyan-400' },
];

const initialLevels = [
  {
    id: 1,
    title: '第一关：黑暗的街道',
    desc: '街道太黑了，需要自动亮起的路灯！',
    problems: [
      { id: 'p1', x: 20, y: 30, text: '这里需要感知天黑', target: 'light', solved: false },
      { id: 'p2', x: 70, y: 30, text: '这里需要发光照明', target: 'led', solved: false },
    ],
    exp: '光敏传感器检测到天黑，把信号传给控制器，控制器打开LED路灯！'
  },
  {
    id: 2,
    title: '第二关：干旱的花园',
    desc: '花园里的花快枯萎了，需要自动浇水！',
    problems: [
      { id: 'p1', x: 30, y: 60, text: '这里需要检测土壤干不干', target: 'hum', solved: false },
      { id: 'p2', x: 80, y: 60, text: '这里需要抽水浇花', target: 'pump', solved: false },
    ],
    exp: '土壤湿度传感器发现土太干了，控制器就会启动水泵抽水浇花！'
  },
  {
    id: 3,
    title: '第三关：闷热的温室',
    desc: '温室里太热了，植物受不了啦！',
    problems: [
      { id: 'p1', x: 50, y: 40, text: '这里需要测量有多热', target: 'temp', solved: false },
      { id: 'p2', x: 50, y: 80, text: '这里需要吹风降温', target: 'pump', solved: false }, // Using pump icon as fan for simplicity
    ],
    exp: '温度传感器测出温度过高，控制器就会打开排风扇（水泵图标代替）降温！'
  }
];

const getInitialLevels = () => JSON.parse(JSON.stringify(initialLevels));

export default function Game3({ onEnd, onBack }: { onEnd: (score: number) => void, onBack: () => void }) {
  const [levels, setLevels] = useState(getInitialLevels());
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [draggedDevice, setDraggedDevice] = useState<string | null>(null);
  const [levelData, setLevelData] = useState(levels[0]);
  const [showExp, setShowExp] = useState<{ type: 'correct'|'wrong', text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const resetGame = () => {
    const newLevels = getInitialLevels();
    setLevels(newLevels);
    setCurrentLevel(0);
    setScore(0);
    setDraggedDevice(null);
    setLevelData(newLevels[0]);
    setShowExp(null);
    setIsFinished(false);
  };

  const handleDrop = (problemId: string) => {
    if (!draggedDevice || showExp) return;

    const problem = levelData.problems.find(p => p.id === problemId);
    if (!problem || problem.solved) return;

    if (problem.target === draggedDevice) {
      playSound('correct');
      setScore(s => s + 200);
      
      const newProblems = levelData.problems.map(p => 
        p.id === problemId ? { ...p, solved: true } : p
      );
      
      setLevelData({ ...levelData, problems: newProblems });
      
      if (newProblems.every(p => p.solved)) {
        setShowExp({ type: 'correct', text: `太棒了！关卡完成！\n${levelData.exp}` });
        setTimeout(() => {
          setShowExp(null);
          if (currentLevel < levels.length - 1) {
            setCurrentLevel(c => c + 1);
            setLevelData(levels[currentLevel + 1]);
          } else {
            playSound('success');
            setIsFinished(true);
          }
        }, 4000);
      } else {
        setShowExp({ type: 'correct', text: '放置正确！继续解决下一个问题！' });
        setTimeout(() => setShowExp(null), 1500);
      }
    } else {
      playSound('wrong');
      setScore(s => Math.max(0, s - 50));
      setShowExp({ type: 'wrong', text: '放错啦！这个设备不能解决这个问题哦！' });
      setTimeout(() => setShowExp(null), 1500);
    }
    setDraggedDevice(null);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-8 text-green-400">游戏结束！</h1>
        <p className="text-4xl mb-4">最终得分：{score}</p>
        <p className="text-5xl font-bold text-yellow-400 mb-12">称号：最佳城市规划师</p>
        <div className="flex gap-8">
          <button onClick={() => onEnd(score)} className="px-12 py-6 bg-slate-600 rounded-3xl text-4xl font-bold active:scale-95">返回主菜单</button>
          <button onClick={resetGame} className="px-12 py-6 bg-green-500 rounded-3xl text-4xl font-bold active:scale-95">再来一局</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div className="text-4xl font-bold text-white">{levelData.title}</div>
        <div className="text-4xl font-bold text-green-400">得分: {score}</div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-700 text-white rounded-2xl text-3xl font-bold active:scale-95">返回菜单</button>
      </div>

      <div className="text-3xl text-slate-300 mb-8 text-center">{levelData.desc}</div>

      <div className="flex-1 flex gap-8 max-w-7xl mx-auto w-full">
        {/* Toolbar */}
        <div className="w-64 bg-slate-800 p-6 rounded-3xl border-4 border-slate-600 flex flex-col gap-4">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">设备箱</h3>
          {devices.map(dev => {
            const Icon = dev.icon;
            return (
              <div
                key={dev.id}
                draggable
                onDragStart={() => setDraggedDevice(dev.id)}
                onDragEnd={() => setDraggedDevice(null)}
                className="p-4 bg-slate-700 rounded-2xl border-2 border-slate-500 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-slate-600"
              >
                <Icon size={48} className={dev.color} />
                <span className="text-white font-bold text-xl">{dev.name}</span>
              </div>
            );
          })}
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-slate-900 rounded-3xl border-4 border-blue-500 relative overflow-hidden">
          {/* Simple City Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#334155 2px, transparent 2px), linear-gradient(90deg, #334155 2px, transparent 2px)',
            backgroundSize: '50px 50px'
          }}></div>

          {levelData.problems.map(p => (
            <div
              key={p.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(p.id)}
              className={`absolute w-48 h-48 -ml-24 -mt-24 rounded-full border-4 flex flex-col items-center justify-center p-4 text-center transition-colors ${
                p.solved ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500 border-dashed animate-pulse'
              }`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.solved ? (
                <div className="text-green-400 font-bold text-2xl">已解决!</div>
              ) : (
                <div className="text-white font-bold text-xl">{p.text}</div>
              )}
            </div>
          ))}
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
              {showExp.type === 'correct' ? '正确！' : '哎呀！'}
            </div>
            <div className="text-4xl text-white leading-relaxed whitespace-pre-line">{showExp.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
