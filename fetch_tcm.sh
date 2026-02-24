#!/bin/bash
# 从 AWS 拉取岐黄每日数据 + Open-Meteo 实时天气，合并输出
CACHE="$HOME/.tcm-bar-cache.json"
TMP_TCM="/tmp/tcm-bar-raw.json"
TMP_WEATHER="/tmp/tcm-bar-weather.json"
SSH_KEY="$HOME/.ssh/id_ed25519"

# 1. 拉取 TCM 数据
ssh -i "$SSH_KEY" -o ProxyCommand=none -o ConnectTimeout=10 -o BatchMode=yes -o StrictHostKeyChecking=no \
    ubuntu@100.90.249.117 \
    'cat ~/.openclaw/workspace-tcm/data/latest.json' > "$TMP_TCM" 2>/dev/null

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

# 3. 合并
python3 -c "
import json

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
