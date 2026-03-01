#!/bin/bash
# 从 qi-huang.com 拉取岐黄每日数据 + Open-Meteo 实时天气，合并输出
CACHE="$HOME/.tcm-bar-cache.json"
TMP_TCM="/tmp/tcm-bar-raw.json"
TMP_WEATHER="/tmp/tcm-bar-weather.json"

# 加载环境变量（Übersicht 非交互式 shell 不会自动加载）
[ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc" 2>/dev/null
API_KEY="${QIHUANG_API_KEY:-}"

# 1. 从 qi-huang.com 拉取 TCM 数据（需 API Key）
curl -s --max-time 10 "https://qi-huang.com/data/latest.json?key=${API_KEY}" > "$TMP_TCM" 2>/dev/null

if [ ! -s "$TMP_TCM" ]; then
    cp "$CACHE" "$TMP_TCM" 2>/dev/null
fi

if [ ! -s "$TMP_TCM" ]; then
    echo "{}"
    exit 0
fi

# 2. 拉取实时天气（Open-Meteo，西安坐标，免费无Key）
curl -s --max-time 8 \
    "https://api.open-meteo.com/v1/forecast?latitude=34.26&longitude=108.94&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" \
    > "$TMP_WEATHER" 2>/dev/null

# 3. 合并（修正日期 + 天气）
python3 -c "
import json
from datetime import datetime

# WMO 天气代码 -> 中文描述
WMO = {
    0:'晴', 1:'大部晴', 2:'多云', 3:'阴天',
    45:'雾', 48:'雾凇', 51:'小毛毛雨', 53:'毛毛雨', 55:'大毛毛雨',
    61:'小雨', 63:'中雨', 65:'大雨', 66:'冻雨', 67:'大冻雨',
    71:'小雪', 73:'中雪', 75:'大雪', 77:'雪粒',
    80:'小阵雨', 81:'阵雨', 82:'大阵雨',
    85:'小阵雪', 86:'大阵雪', 95:'雷暴', 96:'雷暴冰雹', 99:'强雷暴冰雹',
}

tcm = json.load(open('$TMP_TCM'))

# 用本地日期覆盖 API 可能返回的过期日期
now = datetime.now()
weekdays = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日']
if 'date' not in tcm:
    tcm['date'] = {}
tcm['date']['solar'] = now.strftime('%Y-%m-%d')
tcm['date']['weekday'] = weekdays[now.weekday()]
try:
    import cnlunar
    a = cnlunar.Lunar(now, godType='8char')
    month = a.lunarMonthCn.replace('大','').replace('小','')
    tcm['date']['lunar'] = f'{a.year8Char}年{month}{a.lunarDayCn}'
    tcm['date']['ganZhi'] = f'{a.year8Char}年'
except:
    pass  # cnlunar 不可用时保留 API 原值

try:
    w = json.load(open('$TMP_WEATHER'))
    c = w['current']
    code = c.get('weather_code', -1)
    tcm['weather'] = {
        'location': '西安',
        'condition': WMO.get(code, f'代码{code}'),
        'temperature': str(round(c['temperature_2m'])) + '°C',
        'humidity': str(c['relative_humidity_2m']) + '%',
        'windSpeed': str(round(c['wind_speed_10m'])) + 'km/h',
    }
except:
    pass

out = json.dumps(tcm, ensure_ascii=False)
print(out)
open('$CACHE','w').write(out)
" 2>/dev/null || cat "$CACHE" 2>/dev/null
