import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/audio';
import { Server, Wifi, Cpu, Zap } from 'lucide-react';

const nodes = [
  { id: 'sensor', name: '传感器节点', icon: Zap, color: 'text-yellow-400', actions: ['采集数据', '播放音乐', '加热食物'], correct: 0, exp: '传感器负责从环境中采集温度、湿度等数据！' },
  { id: 'gateway', name: '边缘网关', icon: Cpu, color: 'text-green-400', actions: ['直接丢弃', '本地处理与过滤', '打印出来'], correct: 1, exp: '网关可以对数据进行初步处理和过滤，减少传输压力！' },
  { id: 'cloud', name: '云端服务器', icon: Server, color: 'text-blue-400', actions: ['大数据分析', '变成水蒸气', '玩游戏'], correct: 0, exp: '云端拥有强大的计算能力，负责存储和分析海量数据！' },
  { id: 'actuator', name: '执行器节点', icon: Wifi, color: 'text-red-400', actions: ['继续睡觉', '接收指令并执行', '拍照留念'], correct: 1, exp: '执行器接收到云端或网关的指令后，执行具体动作（如开灯）！' },
];

export default function Game4({ onEnd, onBack }: { onEnd: (score: number) => void, onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentNode, setCurrentNode] = useState(0);
  const [combo, setCombo] = useState(0);
  const [transfers, setTransfers] = useState(0);
  const [showExp, setShowExp] = useState<{ type: 'correct'|'wrong', text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setCurrentNode(0);
    setCombo(0);
    setTransfers(0);
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
    if (isFinished || showExp) return;
    
    timerRef.current = setTimeout(() => {
      handleMiss();
    }, 4000); // 4 seconds to answer

    return () => clearTimeout(timerRef.current);
  }, [currentNode, isFinished, showExp]);

  const handleMiss = () => {
    playSound('wrong');
    setScore(s => Math.max(0, s - 50));
    setCombo(0);
    const node = nodes[currentNode];
    setShowExp({ type: 'wrong', text: `传输超时啦！\n${node.name}应该：${node.actions[node.correct]}\n${node.exp}` });
    setTimeout(() => {
      setShowExp(null);
      setCurrentNode(0); // Reset to start
    }, 2500);
  };

  const handleAction = (idx: number) => {
    const node = nodes[currentNode];
    if (idx !== node.correct) {
      playSound('wrong');
      setScore(s => Math.max(0, s - 50));
      setCombo(0);
      setShowExp({ type: 'wrong', text: `操作错误！\n${node.name}应该：${node.actions[node.correct]}\n${node.exp}` });
      setTimeout(() => {
        setShowExp(null);
        setCurrentNode(0); // Reset to start
      }, 2500);
    } else {
      playSound('correct');
      clearTimeout(timerRef.current);
      const newCombo = combo + 1;
      setCombo(newCombo);
      let points = 80;
      if (newCombo % 4 === 0) points += 100; // Bonus for completing a full relay
      setScore(s => s + points);
      
      if (currentNode < 3) {
        setCurrentNode(c => c + 1);
      } else {
        setTransfers(t => t + 1);
        setShowExp({ type: 'correct', text: `完整传输成功！连击奖励+100！\n数据已成功送达并执行！` });
        setTimeout(() => {
          setShowExp(null);
          setCurrentNode(0); // Start new relay
        }, 2000);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-8 text-green-400">游戏结束！</h1>
        <p className="text-4xl mb-4">最终得分：{score}</p>
        <p className="text-4xl mb-4">成功传输次数：{transfers}</p>
        <p className="text-5xl font-bold text-yellow-400 mb-12">称号：数据传输大师</p>
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
        <div className="text-4xl font-bold text-white">倒计时: {timeLeft}秒</div>
        <div className="text-4xl font-bold text-green-400">得分: {score} <span className="text-yellow-400 text-3xl ml-4">连击: {combo}</span></div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-700 text-white rounded-2xl text-3xl font-bold active:scale-95">返回菜单</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full gap-16">
        {/* Nodes Visualization */}
        <div className="flex justify-between items-center w-full px-16 relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-16 right-16 h-4 bg-slate-700 -translate-y-1/2 z-0 rounded-full"></div>
          
          {/* Active Path Line */}
          <div 
            className="absolute top-1/2 left-16 h-4 bg-blue-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
            style={{ width: `calc(${(currentNode / 3) * 100}% - 2rem)` }}
          ></div>

          {nodes.map((node, i) => {
            const Icon = node.icon;
            const isActive = i === currentNode;
            const isPassed = i < currentNode;
            return (
              <div key={node.id} className="relative z-10 flex flex-col items-center gap-4">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 transition-all duration-300 ${
                  isActive ? 'bg-slate-800 border-blue-500 scale-125 shadow-[0_0_30px_rgba(59,130,246,0.5)]' :
                  isPassed ? 'bg-slate-800 border-green-500' : 'bg-slate-800 border-slate-600 opacity-50'
                }`}>
                  <Icon size={48} className={node.color} />
                </div>
                <div className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{node.name}</div>
              </div>
            );
          })}

          {/* Data Packet Animation */}
          {!showExp && (
            <motion.div
              className="absolute top-1/2 w-8 h-8 bg-yellow-400 rounded-full z-20 shadow-[0_0_20px_rgba(250,204,21,0.8)]"
              initial={{ x: `calc(${currentNode * 33.33}% - 1rem)`, y: '-50%' }}
              animate={{ x: `calc(${currentNode * 33.33}% - 1rem)`, y: '-50%' }}
              transition={{ type: 'spring', stiffness: 100 }}
              style={{ left: '4rem' }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-4xl bg-slate-800 p-8 rounded-3xl border-4 border-slate-600">
          <h3 className="text-4xl font-bold text-white mb-8 text-center">请选择 {nodes[currentNode].name} 的操作：</h3>
          <div className="grid grid-cols-3 gap-6">
            {nodes[currentNode].actions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleAction(i)}
                disabled={!!showExp}
                className="p-6 bg-slate-700 border-4 border-slate-500 rounded-2xl text-3xl text-white font-bold hover:bg-slate-600 active:scale-95 disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>
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
