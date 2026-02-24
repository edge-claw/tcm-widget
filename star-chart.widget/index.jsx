// 星图·二十八宿 - macOS 桌面组件 (Übersicht)
// 圆形星图：28宿环 + 四象分组 + 北斗斗柄方位

export const command = `cat /Users/chaishaoguo/.tcm-bar-cache.json 2>/dev/null`;
export const refreshFrequency = 600000; // 10 分钟

export const className = `
  top: 40px;
  left: 430px;
  width: 340px;
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  color: #e8e4df;
  z-index: 1;
  * { margin: 0; padding: 0; box-sizing: border-box; }
`;

// 二十八宿名（单字，按传统顺序）
const MS = [
  '角','亢','氐','房','心','尾','箕',
  '斗','牛','女','虚','危','室','壁',
  '奎','娄','胃','昴','毕','觜','参',
  '井','鬼','柳','星','张','翼','轸'
];

// 四象分组
const GS = [
  { label: '苍龙', dir: '东', s: 0,  e: 7,  c: '#66bb6a' },
  { label: '玄武', dir: '北', s: 7,  e: 14, c: '#5c6bc0' },
  { label: '白虎', dir: '西', s: 14, e: 21, c: '#b0bec5' },
  { label: '朱雀', dir: '南', s: 21, e: 28, c: '#ef5350' },
];

const gOf = i => GS.find(g => i >= g.s && i < g.e);

export const render = ({ output, error }) => {
  const box = {
    background: 'rgba(20, 20, 20, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '16px 18px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };

  if (error || !output || !output.trim()) {
    return (
      <div style={box}>
        <div style={{ color: '#ef9a9a', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>
          ⭐ 星图加载中...
        </div>
      </div>
    );
  }

  let d;
  try { d = JSON.parse(output); } catch (e) {
    return (
      <div style={box}>
        <div style={{ color: '#ef9a9a', textAlign: 'center' }}>⚠️ 数据解析失败</div>
      </div>
    );
  }

  const mn = d.mansion || {};
  const dp = d.bigDipper || {};
  const ci = (mn.index || 1) - 1; // 转为 0-based

  // SVG 参数
  const W = 300, H = 300, cx = 150, cy = 150;
  const Rn = 128;  // 宿名半径
  const Rd = 104;  // 星点半径
  const Rl = 62;   // 四象标签半径
  const Ra = 48;   // 北斗箭头长度
  const S = (2 * Math.PI) / 28;
  const O = -3.5;  // 偏移量：使四象居中于四正方位

  // 坐标计算（数学坐标系，y 轴取反适配 SVG）
  const px = (i, r) => cx + r * Math.cos((i + O) * S);
  const py = (i, r) => cy - r * Math.sin((i + O) * S);

  // 北斗斗柄箭头（handleAngle: 0°=北, 顺时针）
  const ha = (dp.handleAngle || 0) * Math.PI / 180;
  const ax = cx + Ra * Math.sin(ha);
  const ay = cy - Ra * Math.cos(ha);
  // 箭头三角
  const tl = 7, ta = 0.35;
  const t1x = ax - tl * Math.sin(ha - ta), t1y = ay + tl * Math.cos(ha - ta);
  const t2x = ax - tl * Math.sin(ha + ta), t2y = ay + tl * Math.cos(ha + ta);

  return (
    <div style={box}>
      {/* 标题 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
      }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#c8e6c9', letterSpacing: '1px' }}>
          ⭐ 星图 · 二十八宿
        </span>
        <span style={{ fontSize: '11px', color: '#888' }}>{dp.directionText}</span>
      </div>

      {/* 星图 SVG */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', margin: '0 auto' }}>
        {/* 底层环形 */}
        <circle cx={cx} cy={cy} r={Rd} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={26} />

        {/* 四象分界线 */}
        {GS.map((g, gi) => {
          const a = (g.s + O) * S;
          return (
            <line key={`div-${gi}`}
              x1={cx + (Rd - 16) * Math.cos(a)} y1={cy - (Rd - 16) * Math.sin(a)}
              x2={cx + (Rd + 16) * Math.cos(a)} y2={cy - (Rd + 16) * Math.sin(a)}
              stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
          );
        })}

        {/* 四象连接线（宿星连线） */}
        {GS.map((g, gi) => {
          const pts = [];
          for (let i = g.s; i < g.e; i++) pts.push(`${px(i, Rd)},${py(i, Rd)}`);
          return (
            <polyline key={`line-${gi}`}
              points={pts.join(' ')} fill="none" stroke={g.c} strokeWidth={1} opacity={0.15} />
          );
        })}

        {/* 二十八宿 星点 + 宿名 */}
        {MS.map((name, i) => {
          const g = gOf(i);
          const cur = i === ci;
          return (
            <g key={i}>
              {/* 星点 */}
              <circle cx={px(i, Rd)} cy={py(i, Rd)} r={cur ? 4.5 : 2}
                fill={cur ? '#fff' : g.c} opacity={cur ? 1 : 0.4} />
              {/* 当前值宿：发光环 */}
              {cur && (
                <circle cx={px(i, Rd)} cy={py(i, Rd)} r={10}
                  fill="none" stroke={g.c} strokeWidth={1.5} opacity={0.5} />
              )}
              {cur && (
                <circle cx={px(i, Rd)} cy={py(i, Rd)} r={16}
                  fill="none" stroke={g.c} strokeWidth={0.5} opacity={0.15} />
              )}
              {/* 宿名 */}
              <text x={px(i, Rn)} y={py(i, Rn)}
                textAnchor="middle" dominantBaseline="central"
                fill={cur ? '#fff' : g.c}
                fontSize={cur ? 13 : 10}
                fontWeight={cur ? 700 : 400}
                opacity={cur ? 1 : 0.5}>
                {name}
              </text>
            </g>
          );
        })}

        {/* 四象名称 */}
        {GS.map((g, gi) => {
          const mi = g.s + 3.5;
          return (
            <text key={`label-${gi}`} x={px(mi, Rl)} y={py(mi, Rl)}
              textAnchor="middle" dominantBaseline="central"
              fill={g.c} fontSize={11} fontWeight={500} opacity={0.3}>
              {g.label}
            </text>
          );
        })}

        {/* 四正方位标记 */}
        <text x={W - 6} y={cy + 4} textAnchor="end" fill="#555" fontSize={9}>东</text>
        <text x={cx} y={10} textAnchor="middle" fill="#555" fontSize={9}>北</text>
        <text x={6} y={cy + 4} textAnchor="start" fill="#555" fontSize={9}>西</text>
        <text x={cx} y={H - 3} textAnchor="middle" fill="#555" fontSize={9}>南</text>

        {/* 北斗斗柄箭头 */}
        <line x1={cx} y1={cy} x2={ax} y2={ay}
          stroke="#ffd54f" strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        <polygon points={`${ax},${ay} ${t1x},${t1y} ${t2x},${t2y}`}
          fill="#ffd54f" opacity={0.7} />
        <circle cx={cx} cy={cy} r={2.5} fill="#ffd54f" opacity={0.5} />
        <text x={cx} y={cy + 14} textAnchor="middle"
          fill="#ffd54f" fontSize={8} opacity={0.4}>北斗</text>
      </svg>

      {/* 底部信息 */}
      <div style={{ marginTop: '6px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px'
        }}>
          <span style={{ color: '#aaa' }}>
            今日值宿{' '}
            <span style={{ color: '#e0e0e0', fontWeight: 600 }}>{mn.name}</span>
            <span style={{ color: '#666', marginLeft: '6px' }}>({mn.group})</span>
          </span>
          <span style={{ color: '#90a4ae', fontSize: '11px' }}>{mn.healthAdvice}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>
          ☆ {mn.star}（{mn.starCn}）· 北斗{dp.direction} · {dp.monthDizhi}月
        </div>
      </div>
    </div>
  );
};
