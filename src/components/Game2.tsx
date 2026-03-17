import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/audio';

const allSensors = [
  { name: '温度传感器', q: '哪个传感器能检测机房服务器是否过热？', options: ['A. 烟雾报警器', 'B. 门磁传感器', 'C. 温度传感器', 'D. 压力传感器'], a: 2, exp: '温度传感器可以实时监测服务器机架的温度，防止过热宕机。' },
  { name: '湿度传感器', q: '在博物馆保护古董字画，最需要哪个传感器？', options: ['A. 紫外线传感器', 'B. 湿度传感器', 'C. 声音传感器', 'D. 速度传感器'], a: 1, exp: '字画对空气水分非常敏感，湿度传感器能帮助维持恒定的湿度环境。' },
  { name: '光敏传感器', q: '手机屏幕亮度自动调节，是哪个传感器的功劳？', options: ['A. 距离传感器', 'B. 陀螺仪', 'C. 光敏传感器', 'D. 霍尔传感器'], a: 2, exp: '光敏传感器（环境光传感器）能感知外界光线强弱，从而自动调节屏幕亮度。' },
  { name: '红外/运动传感器', q: '商场自动门感应到人走近就打开，用的是什么？', options: ['A. 称重传感器', 'B. 麦克风', 'C. 红外/微波运动传感器', 'D. 颜色传感器'], a: 2, exp: '红外或微波传感器可以探测到人体的移动或热量变化，从而触发开门动作。' },
  { name: '土壤湿度传感器', q: '智慧农业中，决定是否启动滴灌系统的关键数据来自？', options: ['A. 风速计', 'B. 土壤湿度传感器', 'C. 气压计', 'D. 摄像头'], a: 1, exp: '土壤湿度传感器直接插入泥土，准确测量植物根部的水分情况。' },
  { name: '烟雾传感器', q: '厨房里防止火灾隐患，必须安装什么？', options: ['A. 燃气表', 'B. 烟雾/可燃气体传感器', 'C. 抽油烟机', 'D. 湿度传感器'], a: 1, exp: '烟雾或可燃气体传感器能在火灾初期或燃气泄漏时发出警报。' },
  { name: '超声波传感器', q: '汽车倒车雷达测量与后方障碍物距离的原理是？', options: ['A. 激光反射', 'B. 摄像头视觉识别', 'C. 发射超声波并计算回波时间', 'D. 测量磁场变化'], a: 2, exp: '倒车雷达通常使用超声波传感器，通过声波反射时间计算精确距离。' },
  { name: '加速度传感器', q: '计步器和智能手表如何知道你在走路或跑步？', options: ['A. GPS定位', 'B. 心率监测', 'C. 加速度传感器', 'D. 气压变化'], a: 2, exp: '加速度传感器可以感知三个维度的运动加速度，通过算法识别出步频和运动状态。' },
  { name: '陀螺仪', q: '玩手机赛车游戏时，倾斜手机就能转弯，这依赖于？', options: ['A. 距离传感器', 'B. 陀螺仪', 'C. 电子罗盘', 'D. 触摸屏'], a: 1, exp: '陀螺仪专门用来测量设备的旋转角速度，感知手机的倾斜和翻转。' },
  { name: '气压传感器', q: '无人机如何知道自己飞了多高（定高飞行）？', options: ['A. 往下看', 'B. 测量空气压力', 'C. 测量温度', 'D. 测量风速'], a: 1, exp: '海拔越高气压越低，气压传感器通过测量大气压的微小变化来计算高度。' },
  { name: '霍尔传感器', q: '笔记本电脑合上盖子自动休眠，通常使用了什么传感器？', options: ['A. 光敏传感器', 'B. 压力传感器', 'C. 霍尔传感器（磁场）', 'D. 声音传感器'], a: 2, exp: '霍尔传感器对磁场敏感，屏幕边框的磁铁靠近键盘区的传感器时，就会触发休眠。' },
  { name: 'RFID读写器', q: '高速公路ETC（不停车收费）系统主要使用了哪种技术？', options: ['A. 蓝牙', 'B. Wi-Fi', 'C. RFID（射频识别）', 'D. 二维码扫描'], a: 2, exp: 'ETC利用RFID技术，通过微波天线与车载电子标签进行远距离、非接触式的信息交换。' },
  { name: '水浸传感器', q: '机房地板下如果漏水了，哪个传感器能第一时间报警？', options: ['A. 湿度传感器', 'B. 水浸传感器', 'C. 压力传感器', 'D. 流量计'], a: 1, exp: '水浸传感器的探头接触到水时，水的导电性会改变电路状态，从而触发报警。' },
  { name: 'PM2.5传感器', q: '空气净化器如何判断当前空气质量好坏？', options: ['A. 闻气味', 'B. 测量温度', 'C. 激光粉尘/PM2.5传感器', 'D. 测量二氧化碳'], a: 2, exp: '激光粉尘传感器通过激光散射原理，精确测量空气中微小颗粒物（如PM2.5）的浓度。' },
  { name: '心率传感器', q: '智能手环背面发绿光的部分是什么传感器？', options: ['A. 紫外线传感器', 'B. 光电容积脉搏波（PPG）心率传感器', 'C. 温度传感器', 'D. 激光测距仪'], a: 1, exp: 'PPG传感器通过绿光照射皮肤，测量血液流动时光线吸收的变化，从而计算出心率。' }
];

export default function Game2({ onEnd, onBack }: { onEnd: (score: number) => void, onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [currentSensor, setCurrentSensor] = useState<typeof allSensors[0] | null>(null);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [showExp, setShowExp] = useState<{ type: 'correct'|'wrong', text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [availableSensors, setAvailableSensors] = useState([...allSensors]);
  const timerRef = useRef<NodeJS.Timeout>();

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setActiveHole(null);
    setCurrentSensor(null);
    setCombo(0);
    setHits(0);
    setShowExp(null);
    setIsFinished(false);
    setAvailableSensors([...allSensors]);
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
    spawnMole();
    return () => clearTimeout(timerRef.current);
  }, [isFinished, showExp]);

  const spawnMole = () => {
    if (activeHole !== null) return;
    
    let pool = availableSensors;
    if (pool.length === 0) {
      pool = [...allSensors];
      setAvailableSensors(pool);
    }

    const hole = Math.floor(Math.random() * 9);
    const sensorIndex = Math.floor(Math.random() * pool.length);
    const sensor = pool[sensorIndex];
    
    // Remove the selected sensor from the available pool
    setAvailableSensors(pool.filter((_, i) => i !== sensorIndex));

    setActiveHole(hole);
    setCurrentSensor(sensor);
    
    timerRef.current = setTimeout(() => {
      handleMiss();
    }, 4000); // Increased time slightly for harder questions
  };

  const handleMiss = () => {
    playSound('wrong');
    setScore(s => Math.max(0, s - 40));
    setCombo(0);
    setShowExp({ type: 'wrong', text: `哎呀，地鼠逃跑了！\n${currentSensor?.exp}` });
    setActiveHole(null);
    setTimeout(() => setShowExp(null), 2000);
  };

  const handleHit = (idx: number) => {
    if (idx !== currentSensor?.a) {
      playSound('wrong');
      setScore(s => Math.max(0, s - 40));
      setCombo(0);
      setShowExp({ type: 'wrong', text: `打错啦！正确答案是：${currentSensor?.options[currentSensor.a]}\n${currentSensor?.exp}` });
    } else {
      playSound('correct');
      clearTimeout(timerRef.current);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setHits(h => h + 1);
      let points = 100;
      if (newCombo % 3 === 0) points += 50;
      setScore(s => s + points);
      setShowExp({ type: 'correct', text: `击中！${newCombo % 3 === 0 ? '连击奖励+50！\n' : '\n'}${currentSensor?.exp}` });
    }
    setActiveHole(null);
    setTimeout(() => setShowExp(null), 2000);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-8 text-green-400">游戏结束！</h1>
        <p className="text-4xl mb-4">最终得分：{score}</p>
        <p className="text-4xl mb-4">击中次数：{hits}</p>
        <p className="text-5xl font-bold text-yellow-400 mb-12">称号：最快修复高手</p>
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

      <div className="flex-1 flex gap-8 max-w-7xl mx-auto w-full">
        <div className="flex-1 grid grid-cols-3 gap-4 bg-slate-800 p-8 rounded-3xl border-4 border-slate-600">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="relative aspect-square bg-slate-900 rounded-full border-8 border-slate-700 overflow-hidden flex items-end justify-center">
              <div className="absolute bottom-0 w-full h-1/2 bg-slate-800 rounded-t-full z-10"></div>
              <AnimatePresence>
                {activeHole === i && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '100%' }}
                    className="absolute bottom-4 w-3/4 h-3/4 bg-green-500 rounded-t-full z-0 flex flex-col items-center justify-start pt-4 border-4 border-green-400"
                  >
                    <div className="text-2xl font-bold text-white text-center px-2">{currentSensor?.name}</div>
                    <div className="flex gap-2 mt-2">
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="w-[500px] flex flex-col gap-4">
          {activeHole !== null && currentSensor && !showExp ? (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-800 p-8 rounded-3xl border-4 border-blue-500 h-full flex flex-col">
              <h3 className="text-4xl font-bold text-white mb-8">{currentSensor.q}</h3>
              <div className="flex flex-col gap-4 flex-1">
                {currentSensor.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleHit(i)}
                    className="flex-1 p-4 bg-slate-700 border-4 border-slate-500 rounded-2xl text-3xl text-white font-bold text-left hover:bg-slate-600 active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-3xl border-4 border-slate-600 h-full flex items-center justify-center">
              <p className="text-3xl text-slate-400 font-bold text-center">等待地鼠出现...</p>
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
              {showExp.type === 'correct' ? '击中！' : '哎呀！'}
            </div>
            <div className="text-4xl text-white leading-relaxed whitespace-pre-line">{showExp.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
