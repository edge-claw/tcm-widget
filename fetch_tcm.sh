#!/bin/bash
# 从 AWS 拉取岐黄每日数据，输出 JSON
ssh -o ProxyCommand=none -o ConnectTimeout=10 -o BatchMode=yes \
    ubuntu@100.90.249.117 \
    'cat ~/.openclaw/workspace-tcm/data/latest.json' 2>/dev/null
