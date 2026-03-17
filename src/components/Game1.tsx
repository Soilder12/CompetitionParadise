import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/audio';

const questions = [
  { q: '物联网（IoT）架构通常分为哪三个核心层级？', options: ['A. 物理层、数据链路层、网络层', 'B. 感知层、网络层、应用层', 'C. 硬件层、软件层、云端层', 'D. 采集层、传输层、展示层'], a: 1, exp: '物联网经典三层架构是：感知层（收集数据）、网络层（传输数据）、应用层（处理和展示数据）。' },
  { q: '在物联网中，"边缘计算"（Edge Computing）的主要优势是什么？', options: ['A. 增加云端服务器的存储容量', 'B. 降低设备成本', 'C. 减少数据传输延迟并减轻云端带宽压力', 'D. 让设备外观更美观'], a: 2, exp: '边缘计算将数据处理放在离数据源更近的地方（如网关），从而大大减少了传输延迟和带宽消耗。' },
  { q: '哪种无线通信技术最适合"低功耗、长距离、低带宽"的物联网场景（如智能水表）？', options: ['A. Wi-Fi', 'B. 蓝牙 (Bluetooth)', 'C. NB-IoT / LoRa', 'D. 5G 毫米波'], a: 2, exp: 'NB-IoT和LoRa属于低功耗广域网（LPWAN）技术，电池寿命可达数年，且覆盖范围广，非常适合智能抄表。' },
  { q: 'MQTT协议在物联网中被广泛使用，它的核心通信模式是什么？', options: ['A. 客户端-服务器 (Client-Server) 请求响应', 'B. 发布/订阅 (Publish/Subscribe) 模式', 'C. 点对点 (Peer-to-Peer) 模式', 'D. 广播 (Broadcast) 模式'], a: 1, exp: 'MQTT采用轻量级的发布/订阅模式，设备可以向主题发布消息，也可以订阅主题接收消息，非常适合低带宽环境。' },
  { q: 'RFID（射频识别）技术最常用于以下哪个物联网场景？', options: ['A. 测量环境温度', 'B. 仓储物流追踪与门禁系统', 'C. 播放高清视频', 'D. 实时语音通话'], a: 1, exp: 'RFID通过无线电讯号识别特定目标并读写相关数据，广泛应用于物流追踪、超市防盗和门禁卡。' },
  { q: '智能家居中，Zigbee协议相比Wi-Fi的主要优势是？', options: ['A. 传输速度更快', 'B. 功耗更低且支持自组网（Mesh网络）', 'C. 穿墙能力极强', 'D. 可以直接连接互联网'], a: 1, exp: 'Zigbee功耗极低，且设备之间可以互相转发信号形成Mesh网络，非常适合家里大量智能设备的连接。' },
  { q: '什么是物联网中的"数字孪生"（Digital Twin）？', options: ['A. 生产两个一模一样的硬件设备', 'B. 物理实体在虚拟数字世界中的实时动态映射', 'C. 一种双频段的路由器', 'D. 备份数据的两块硬盘'], a: 1, exp: '数字孪生是利用传感器数据，在电脑里构建一个与真实设备完全同步的虚拟模型，用于模拟和预测。' },
  { q: '在工业物联网（IIoT）中，PLC通常代表什么？', options: ['A. 个人局域网', 'B. 可编程逻辑控制器', 'C. 公共云服务', 'D. 物理链路连接'], a: 1, exp: 'PLC（Programmable Logic Controller）是工业自动化中最常用的控制设备，相当于工厂机器的大脑。' },
  { q: '传感器采集到的模拟信号（如连续的电压变化），需要经过什么处理才能被微控制器识别？', options: ['A. 放大处理', 'B. 滤波处理', 'C. 模数转换（ADC）', 'D. 数模转换（DAC）'], a: 2, exp: '微控制器只能处理数字信号（0和1），因此必须通过ADC（模数转换器）将模拟信号转换为数字信号。' },
  { q: '以下哪项不是物联网设备面临的主要安全威胁？', options: ['A. 默认密码未修改导致被黑客控制', 'B. 固件长期不更新存在漏洞', 'C. 数据在传输过程中被窃听', 'D. 设备外壳颜色褪色'], a: 3, exp: '外壳褪色是物理损耗，而默认密码、固件漏洞和数据窃听是物联网面临的严重网络安全威胁。' },
  { q: '智能农业中，为了精准灌溉，通常需要综合分析哪些传感器的数据？', options: ['A. 土壤湿度、环境温度、光照强度', 'B. 声音、烟雾、加速度', 'C. 心率、血压、血氧', 'D. 磁场、重力、紫外线'], a: 0, exp: '精准灌溉需要知道土壤缺不缺水（湿度）、水分蒸发快不快（温度和光照），从而决定浇水量。' },
  { q: 'IPv6在物联网发展中起到了至关重要的作用，主要是因为？', options: ['A. 它的传输速度比IPv4快100倍', 'B. 它提供了几乎无限的IP地址，满足海量设备联网需求', 'C. 它完全免疫黑客攻击', 'D. 它不需要消耗电力'], a: 1, exp: '物联网设备数量庞大，IPv4地址早已耗尽，而IPv6提供了海量的地址空间，让每个设备都能拥有独立IP。' },
  { q: '当智能手环监测到老人摔倒并自动拨打急救电话时，这个过程体现了物联网的什么特性？', options: ['A. 仅仅是数据收集', 'B. 智能感知、分析与自动控制闭环', 'C. 虚拟现实技术', 'D. 区块链加密'], a: 1, exp: '手环感知加速度异常（感知），判断为摔倒（分析），触发报警（控制），形成了一个完整的智能闭环。' },
  { q: '在物联网网关中，"协议转换"的主要目的是什么？', options: ['A. 加密数据', 'B. 将不同设备使用的不同通信语言（如蓝牙、Zigbee）统一转换为云端能懂的语言（如HTTP/MQTT）', 'C. 提高网络带宽', 'D. 压缩视频文件'], a: 1, exp: '底层设备使用的协议五花八门，网关就像一个翻译官，把它们统一翻译成标准协议发给云端。' },
  { q: '下面哪个设备属于物联网中的"执行器"（Actuator）？', options: ['A. 继电器（控制电路通断）', 'B. 光敏电阻', 'C. 温湿度探头', 'D. 监控摄像头'], a: 0, exp: '执行器是接收指令并产生物理动作的设备，继电器可以控制大功率电器的开关，属于典型的执行器。' },
  { q: '车联网（V2X）中，V2V代表什么意思？', options: ['A. 车辆到云端', 'B. 车辆到基础设施', 'C. 车辆到车辆的直接通信', 'D. 车辆到行人'], a: 2, exp: 'V2V (Vehicle-to-Vehicle) 允许车辆之间直接交换速度、位置等信息，用于防碰撞预警等高级安全功能。' },
  { q: '智能水表通常使用电池供电，为了保证电池能用5年以上，它通常采用什么工作模式？', options: ['A. 24小时持续连接Wi-Fi', 'B. 深度休眠，仅在特定时间唤醒发送数据后继续休眠', 'C. 实时进行高清视频传输', 'D. 开启蓝牙持续广播'], a: 1, exp: '为了极致省电，低功耗物联网设备大部分时间处于深度休眠状态，只在需要发送数据时短暂唤醒。' },
  { q: '在智慧城市中，智能垃圾桶如何知道自己已经满了？', options: ['A. 通过称重传感器或超声波测距传感器', 'B. 通过温度传感器', 'C. 通过GPS定位', 'D. 通过麦克风听声音'], a: 0, exp: '超声波传感器可以测量垃圾桶顶部到垃圾表面的距离，距离变短说明垃圾满了；称重传感器也可以辅助判断。' },
  { q: 'API（应用程序接口）在物联网云平台中的作用是？', options: ['A. 提供硬件接口插槽', 'B. 允许不同的软件系统、手机APP与云平台进行数据交互和功能调用', 'C. 专门用于给设备充电', 'D. 拦截病毒攻击'], a: 1, exp: 'API就像是云平台开的一扇扇服务窗口，手机APP通过调用API就能获取设备数据或发送控制指令。' },
  { q: '如果一个物联网系统要求极高的实时性（如自动驾驶刹车），数据处理应该放在哪里？', options: ['A. 遥远的公有云', 'B. 车辆本地的边缘计算节点', 'C. 手机APP上', 'D. 打印出来人工处理'], a: 1, exp: '自动驾驶对延迟要求极高（毫秒级），数据传到云端再传回来太慢了，必须在本地（边缘端）瞬间完成处理。' },
  { q: 'OTA（Over-The-Air）技术对物联网设备有什么重要意义？', options: ['A. 可以通过空气充电', 'B. 允许设备通过网络远程下载并升级固件，修复漏洞或增加新功能', 'C. 增强Wi-Fi信号', 'D. 降低设备发热'], a: 1, exp: 'OTA空中升级让成千上万的物联网设备无需人工接触，就能远程完成系统更新和漏洞修复。' },
  { q: '超声波传感器测距的原理是什么？', options: ['A. 测量光线反射的强度', 'B. 发射超声波并测量声波遇到障碍物反射回来的时间差', 'C. 测量空气的压力变化', 'D. 测量磁场的强度'], a: 1, exp: '超声波传感器通过计算声波“发射-遇到障碍-反射回来”的时间，结合声速，就能算出精确的距离。' },
  { q: '在智能家居中，如果断网了，有些设备依然能互相联动（如按开关开灯），这是因为？', options: ['A. 它们使用了魔法', 'B. 本地网关具备边缘计算和本地控制能力', 'C. 它们自带了卫星通信', 'D. 电池电量充足'], a: 1, exp: '优秀的智能家居系统拥有本地网关，即使外网断开，网关依然能在局域网内处理逻辑，保证基础联动。' },
  { q: '以下哪种传感器常用于检测可燃气体泄漏？', options: ['A. MQ系列气体传感器', 'B. DHT11温湿度传感器', 'C. BMP280气压传感器', 'D. LDR光敏电阻'], a: 0, exp: 'MQ系列传感器（如MQ-2）对甲烷、天然气等可燃气体非常敏感，常用于厨房燃气泄漏报警。' },
  { q: '物联网设备生成的数据通常具有什么特征？', options: ['A. 数据量小且价值密度极高', 'B. 海量、碎片化、时序性强（带时间戳）', 'C. 全部是高清视频', 'D. 只有文字格式'], a: 1, exp: '物联网传感器每秒都在产生数据，这些数据量巨大、单条价值低，且都带有时间戳，属于典型的时序数据。' }
].sort(() => Math.random() - 0.5).slice(0, 15);

export default function Game1({ onEnd, onBack }: { onEnd: (score: number) => void, onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showExp, setShowExp] = useState<{ type: 'correct'|'wrong'|'timeout', text: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const resetGame = () => {
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(10);
    setShowExp(null);
    setIsFinished(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (showExp || isFinished) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showExp, isFinished]);

  const handleAnswer = (idx: number) => {
    if (showExp || isFinished) return;
    const q = questions[currentQ];
    if (idx === q.a) {
      playSound('correct');
      setScore(s => s + 100);
      setShowExp({ type: 'correct', text: q.exp });
    } else {
      playSound('wrong');
      setScore(s => Math.max(0, s - 30));
      setShowExp({ type: 'wrong', text: `正确答案是：${q.options[q.a]}\n${q.exp}` });
    }
    setTimeout(nextQuestion, 3000);
  };

  const handleTimeout = () => {
    playSound('wrong');
    setScore(s => Math.max(0, s - 50));
    const q = questions[currentQ];
    setShowExp({ type: 'timeout', text: `正确答案是：${q.options[q.a]}\n${q.exp}` });
    setTimeout(nextQuestion, 3000);
  };

  const nextQuestion = () => {
    setShowExp(null);
    if (currentQ < 14) {
      setCurrentQ(q => q + 1);
      setTimeLeft(10);
    } else {
      playSound('success');
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const timeUsed = Math.floor((Date.now() - startTime) / 1000);
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-8 text-green-400">游戏结束！</h1>
        <p className="text-4xl mb-4">本局得分：{score}</p>
        <p className="text-4xl mb-12">用时：{timeUsed}秒</p>
        <div className="flex gap-8">
          <button onClick={() => onEnd(score)} className="px-12 py-6 bg-slate-600 rounded-3xl text-4xl font-bold active:scale-95">返回主菜单</button>
          <button onClick={resetGame} className="px-12 py-6 bg-green-500 rounded-3xl text-4xl font-bold active:scale-95">再来一局</button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex flex-col h-full p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div className="text-4xl font-bold text-white">题目 {currentQ + 1}/15</div>
        <div className="text-4xl font-bold text-green-400">得分: {score}</div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-700 text-white rounded-2xl text-3xl font-bold active:scale-95">返回菜单</button>
      </div>

      <div className="w-full h-8 bg-slate-700 rounded-full mb-12 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${timeLeft > 3 ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${(timeLeft / 10) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        <h2 className="text-5xl font-bold text-white text-center mb-16 leading-tight">{q.q}</h2>
        
        <div className="grid grid-cols-2 gap-8 w-full">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="min-h-[120px] p-8 bg-slate-800 border-4 border-slate-600 rounded-3xl text-4xl text-white font-bold text-left hover:bg-slate-700 active:scale-95 transition-transform"
            >
              {opt}
            </button>
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
              showExp.type === 'correct' ? 'bg-green-900 border-green-500' :
              showExp.type === 'wrong' ? 'bg-red-900 border-red-500' : 'bg-yellow-900 border-yellow-500'
            }`}
          >
            <div className="text-6xl font-bold text-white mb-8">
              {showExp.type === 'correct' ? '太棒了！正确！' : showExp.type === 'wrong' ? '哎呀，错了！' : '时间到啦！'}
            </div>
            <div className="text-4xl text-white leading-relaxed whitespace-pre-line">{showExp.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
