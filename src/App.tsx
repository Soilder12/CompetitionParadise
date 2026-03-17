/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Target, Map, Wifi, Wrench, Info, Trophy, X } from 'lucide-react';
import Game1 from './components/Game1';
import Game2 from './components/Game2';
import Game3 from './components/Game3';
import Game4 from './components/Game4';
import Game5 from './components/Game5';

const games = [
  { id: 1, name: 'IoT闪电竞答王', desc: '测试你的物联网基础知识！', icon: Zap, color: 'bg-yellow-500', component: Game1 },
  { id: 2, name: '传感器打地鼠', desc: '快速识别各种传感器的作用！', icon: Target, color: 'bg-red-500', component: Game2 },
  { id: 3, name: '智慧城市建造师', desc: '用物联网设备解决城市问题！', icon: Map, color: 'bg-blue-500', component: Game3 },
  { id: 4, name: '数据传输接力赛', desc: '体验数据从传感器到云端的旅程！', icon: Wifi, color: 'bg-purple-500', component: Game4 },
  { id: 5, name: 'IoT故障修复大师', desc: '找出智能家居里的故障并修复！', icon: Wrench, color: 'bg-orange-500', component: Game5 },
];

export default function App() {
  const [activeGame, setActiveGame] = useState<number | null>(null);
  const [showRules, setShowRules] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [highScores, setHighScores] = useState<Record<number, number>>({});
  const [badges, setBadges] = useState(0);

  useEffect(() => {
    const savedScores = localStorage.getItem('iot_highscores');
    const savedBadges = localStorage.getItem('iot_badges');
    if (savedScores) setHighScores(JSON.parse(savedScores));
    if (savedBadges) setBadges(parseInt(savedBadges, 10));
  }, []);

  const handleGameEnd = (gameId: number, score: number) => {
    const currentHigh = highScores[gameId] || 0;
    if (score > currentHigh) {
      const newScores = { ...highScores, [gameId]: score };
      setHighScores(newScores);
      localStorage.setItem('iot_highscores', JSON.stringify(newScores));
    }
    
    // Award a badge if score is decent (e.g., > 500)
    if (score >= 500) {
      const newBadges = badges + 1;
      setBadges(newBadges);
      localStorage.setItem('iot_badges', newBadges.toString());
    }
    
    setActiveGame(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden font-sans relative select-none">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <AnimatePresence mode="wait">
        {activeGame === null && showRules === null && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10"
          >
            <button 
              onClick={() => setShowInfo(true)}
              className="absolute top-8 right-8 p-4 bg-blue-600 text-white rounded-full hover:bg-blue-500 active:scale-95 transition-transform flex items-center gap-2"
            >
              <Info size={32} />
              <span className="text-2xl font-bold">关于物联网</span>
            </button>

            <div className="absolute top-8 left-8 flex items-center gap-4 bg-slate-800 p-4 rounded-3xl border-2 border-slate-700">
              <Trophy size={40} className="text-yellow-400" />
              <div className="text-white">
                <div className="text-xl text-slate-400">物联网小专家徽章</div>
                <div className="text-4xl font-bold text-yellow-400">{badges}</div>
              </div>
            </div>

            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4 tracking-tight drop-shadow-lg">
              物联网竞赛乐园
            </h1>
            <p className="text-4xl text-slate-300 mb-16 font-medium">探索、学习、成为物联网小专家！</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
              {games.map((game) => {
                const Icon = game.icon;
                return (
                  <motion.button
                    key={game.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRules(game.id)}
                    className="bg-slate-800 rounded-3xl p-8 border-4 border-slate-700 flex flex-col items-center text-center group hover:border-green-500 transition-colors relative overflow-hidden"
                  >
                    <div className={`w-32 h-32 rounded-full ${game.color} flex items-center justify-center mb-6 shadow-lg group-hover:animate-bounce`}>
                      <Icon size={64} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">{game.name}</h2>
                    <p className="text-2xl text-slate-400 mb-6">{game.desc}</p>
                    <div className="mt-auto bg-slate-900 w-full py-3 rounded-xl text-xl text-green-400 font-bold">
                      最高分: {highScores[game.id] || 0}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {showRules !== null && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10"
          >
            <div className="bg-slate-800 p-12 rounded-[3rem] border-4 border-blue-500 max-w-4xl w-full text-center">
              <h2 className="text-6xl font-bold text-white mb-8">{games.find(g => g.id === showRules)?.name} - 游戏规则</h2>
              <div className="text-3xl text-slate-300 leading-relaxed mb-12 text-left space-y-6">
                {showRules === 1 && (
                  <>
                    <p>1. 共有15道关于物联网的选择题。</p>
                    <p>2. 每道题有10秒钟的答题时间。</p>
                    <p>3. 答对加100分，答错扣30分，超时扣50分。</p>
                    <p>4. 准备好挑战你的知识储备了吗？</p>
                  </>
                )}
                {showRules === 2 && (
                  <>
                    <p>1. 游戏时间60秒。</p>
                    <p>2. 地鼠（传感器）会随机从洞里钻出来，并带有一个问题。</p>
                    <p>3. 在3秒内点击正确的答案选项“击中”地鼠。</p>
                    <p>4. 答对加100分，连续击中3次有额外加分！答错或超时扣40分。</p>
                  </>
                )}
                {showRules === 3 && (
                  <>
                    <p>1. 共有3个关卡，每个关卡有城市问题需要解决。</p>
                    <p>2. 从左侧设备箱中拖拽正确的物联网设备到地图上的问题区域。</p>
                    <p>3. 放置正确加200分，放置错误扣50分。</p>
                    <p>4. 成为最棒的智慧城市规划师！</p>
                  </>
                )}
                {showRules === 4 && (
                  <>
                    <p>1. 游戏时间60秒。</p>
                    <p>2. 数据包会在传感器、网关、云端、执行器之间传输。</p>
                    <p>3. 当数据包到达一个节点时，请在4秒内选择该节点应该执行的正确操作。</p>
                    <p>4. 选择正确加80分，完成一次完整传输有额外加分！错误或超时扣50分。</p>
                  </>
                )}
                {showRules === 5 && (
                  <>
                    <p>1. 游戏时间90秒。</p>
                    <p>2. 智能家居房间里会随机出现故障（闪烁的图标）。</p>
                    <p>3. 点击故障图标，回答应该用什么设备来修复它。</p>
                    <p>4. 答对加150分，连续修复有额外加分！答错扣50分。</p>
                  </>
                )}
              </div>
              <div className="flex justify-center gap-8">
                <button 
                  onClick={() => setShowRules(null)}
                  className="px-12 py-6 bg-slate-600 text-white rounded-3xl text-4xl font-bold hover:bg-slate-500 active:scale-95"
                >
                  返回
                </button>
                <button 
                  onClick={() => {
                    setActiveGame(showRules);
                    setShowRules(null);
                  }}
                  className="px-12 py-6 bg-green-500 text-white rounded-3xl text-4xl font-bold hover:bg-green-400 active:scale-95"
                >
                  开始游戏
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeGame === 1 && <Game1 onEnd={(score) => handleGameEnd(1, score)} onBack={() => setActiveGame(null)} />}
        {activeGame === 2 && <Game2 onEnd={(score) => handleGameEnd(2, score)} onBack={() => setActiveGame(null)} />}
        {activeGame === 3 && <Game3 onEnd={(score) => handleGameEnd(3, score)} onBack={() => setActiveGame(null)} />}
        {activeGame === 4 && <Game4 onEnd={(score) => handleGameEnd(4, score)} onBack={() => setActiveGame(null)} />}
        {activeGame === 5 && <Game5 onEnd={(score) => handleGameEnd(5, score)} onBack={() => setActiveGame(null)} />}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 p-12 rounded-[3rem] border-4 border-green-500 max-w-5xl w-full relative"
            >
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-white"
              >
                <X size={48} />
              </button>
              <h2 className="text-6xl font-bold text-white mb-8 text-center">什么是物联网 (IoT)?</h2>
              <div className="text-3xl text-slate-300 leading-relaxed space-y-6">
                <p><strong>物联网 (Internet of Things)</strong> 就是把各种物品通过网络连接起来，让它们能够互相交流和分享数据。</p>
                <p>它主要由四个部分组成：</p>
                <ul className="list-disc pl-12 space-y-4">
                  <li><strong className="text-yellow-400">传感器：</strong> 像人的眼睛和耳朵，负责感知环境（如温度、光线）。</li>
                  <li><strong className="text-green-400">网关/网络：</strong> 像神经系统，负责把数据传输出去。</li>
                  <li><strong className="text-blue-400">云端大脑：</strong> 像人的大脑，负责存储和分析海量数据。</li>
                  <li><strong className="text-red-400">执行器：</strong> 像人的手和脚，接收指令后去干活（如开灯、电机转动）。</li>
                </ul>
                <p className="mt-8 text-center text-green-400 font-bold">在《竞赛乐园》里，你将通过游戏掌握这些神奇的知识！</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
