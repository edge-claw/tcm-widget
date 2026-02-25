// 岐黄令 - macOS 桌面组件 (Übersicht)
// 每 30 分钟从 qi-huang.com 拉取中医养生数据

export const command = `$HOME/cc/tcm-widget/fetch_tcm.sh`;
export const refreshFrequency = 1800000; // 30 分钟

export const className = `
  top: 40px;
  left: 30px;
  width: 380px;
  font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
  color: #e8e4df;
  z-index: 1;

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .container {
    background: rgba(20, 20, 20, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #c8e6c9;
    letter-spacing: 1px;
  }

  .date-info {
    font-size: 11px;
    color: #999;
    text-align: right;
    line-height: 1.5;
  }

  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
    margin: 10px 0;
  }

  .section {
    margin: 10px 0;
  }

  .section-title {
    font-size: 11px;
    color: #81c784;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 6px;
  }

  .weather-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #bbb;
  }

  .weather-temp {
    font-size: 22px;
    font-weight: 300;
    color: #e0e0e0;
  }

  .term-block {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
  }

  .term-name {
    font-size: 24px;
    font-weight: 700;
    color: #a5d6a7;
  }

  .term-season {
    font-size: 13px;
    color: #81c784;
  }

  .phenology {
    font-size: 13px;
    color: #ccc;
    margin-top: 4px;
    line-height: 1.6;
  }

  .phenology-current {
    color: #a5d6a7;
    font-weight: 600;
    font-size: 14px;
    background: rgba(129, 199, 132, 0.1);
    border-left: 3px solid #66bb6a;
    padding: 3px 0 3px 8px;
    margin: 2px 0;
    border-radius: 0 6px 6px 0;
    text-shadow: 0 0 8px rgba(129, 199, 132, 0.3);
  }

  .phenology-dim {
    color: #666;
    padding-left: 14px;
  }

  .neijing {
    font-size: 12px;
    color: #bca;
    font-style: italic;
    line-height: 1.7;
    margin-bottom: 8px;
    border-left: 2px solid rgba(165, 214, 167, 0.3);
    padding-left: 10px;
  }

  .guidance-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 12px;
    font-size: 12px;
  }

  .guidance-item {
    color: #aaa;
  }

  .guidance-item .icon {
    margin-right: 4px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #666;
    margin-top: 4px;
  }

  .footer-left {
    color: #90a4ae;
  }

  .footer-right {
    color: #555;
    font-size: 10px;
  }

  .error {
    font-size: 14px;
    color: #ef9a9a;
    text-align: center;
    padding: 30px 0;
  }
`;

export const render = ({ output, error }) => {
  if (error || !output || output.trim() === "") {
    return (
      <div className="container">
        <div className="error">🍃 岐黄令 · 数据加载中...</div>
      </div>
    );
  }

  let d;
  try {
    d = JSON.parse(output);
  } catch (e) {
    return (
      <div className="container">
        <div className="error">⚠️ 数据解析失败</div>
      </div>
    );
  }

  const date = d.date || {};
  const weather = d.weather || {};
  const term = d.solarTerm || {};
  const phen = term.phenology || {};
  const allPhen = term.allPhenologies || [];
  const nj = d.neijing || {};
  const guidance = nj.guidance || {};
  const wy = d.wuyunLiuqi || {};

  const originalShort = (nj.original || "").length > 50
    ? nj.original.substring(0, 50) + "..."
    : nj.original || "";

  return (
    <div className="container">
      {/* 头部 */}
      <div className="header">
        <div className="title">🍃 岐黄令</div>
        <div className="date-info">
          <div>{date.solar} {date.weekday}</div>
          <div>{date.lunar}</div>
        </div>
      </div>

      {/* 天气 */}
      <div className="weather-row">
        <span className="weather-temp">西安 {weather.temperature}</span>
        <span>{weather.condition}</span>
        <span>💧{weather.humidity}</span>
        <span>🌬{weather.windSpeed}</span>
      </div>

      <div className="divider" />

      {/* 节气物候 */}
      <div className="section">
        <div className="term-block">
          <span className="term-name">{term.name}</span>
          <span className="term-season">{term.season}季</span>
        </div>
        <div className="phenology">
          {allPhen.map((p, i) => {
            const isCurrent = p.name === (phen.current || phen.name);
            const style = isCurrent
              ? { color: '#b0b0b0', fontWeight: 500,
                  borderLeft: '2px solid rgba(129,199,132,0.5)',
                  paddingLeft: '10px', margin: '1px 0' }
              : { color: '#666', paddingLeft: '16px' };
            return (
              <div key={i} style={style}>
                {isCurrent ? "▸ " : ""}{p.phase} · {p.name} — {p.description}
              </div>
            );
          })}
        </div>
      </div>

      <div className="divider" />

      {/* 黄帝内经 */}
      <div className="section">
        <div className="section-title">《黄帝内经》{nj.season}季养生</div>
        <div className="neijing">「{originalShort}」</div>
        <div className="guidance-grid">
          <div className="guidance-item"><span className="icon">😴</span>{guidance.sleep}</div>
          <div className="guidance-item"><span className="icon">😊</span>{guidance.emotion}</div>
          <div className="guidance-item"><span className="icon">🏃</span>{guidance.exercise}</div>
          <div className="guidance-item"><span className="icon">🥗</span>{guidance.diet}</div>
        </div>
      </div>

      <div className="divider" />

      {/* 底部：五运六气 + 来源 */}
      <div className="footer">
        <span className="footer-left">☯ {wy.wuyun} · 司天{wy.siTian} · 在泉{wy.zaiQuan}</span>
        <span className="footer-right">qi-huang.com</span>
      </div>
    </div>
  );
};
