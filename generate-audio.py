#!/usr/bin/env python3
"""
edge-tts 批量生成拼音学习 MP3 音频
微软 Xiaoxiao 语音，中文声调准确
运行: python3 generate-audio.py
"""

import subprocess
import os
import sys

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio")
VOICE = "zh-CN-XiaoxiaoNeural"

# 汉字 → 语境短语（先词组后单字，声调更准）
PHRASES = {
    "猫": "小猫。猫",
    "狗": "小狗。狗",
    "鸟": "小鸟。鸟",
    "鱼": "小鱼。鱼",
    "马": "小马。马",
    "牛": "小牛。牛",
    "羊": "小羊。羊",
    "鸡": "小鸡。鸡",
    "兔": "小兔。兔",
    "鸭": "小鸭。鸭",
    "瓜": "西瓜。瓜",
    "果": "苹果。果",
    "桃": "桃子。桃",
    "梨": "雪梨。梨",
    "莓": "草莓。莓",
    "蕉": "香蕉。蕉",
    "橙": "橙子。橙",
    "葡": "葡萄。葡",
    "山": "大山。山",
    "水": "喝水。水",
    "火": "大火。火",
    "花": "花儿。花",
    "月": "月亮。月",
    "星": "星星。星",
    "云": "白云。云",
    "日": "太阳。日",
    "一": "一个。一",
    "二": "两个。二",
    "三": "三个。三",
    "四": "四个。四",
    "五": "五个。五",
    "六": "六个。六",
    "七": "七个。七",
    "八": "八个。八",
    "九": "九个。九",
    "十": "十个。十",
    "红": "红色。红",
    "黄": "黄色。黄",
    "蓝": "蓝色。蓝",
    "绿": "绿色。绿",
    "白": "白色。白",
    "黑": "黑色。黑",
    "紫": "紫色。紫",
    "粉": "粉色。粉",
    "手": "小手。手",
    "口": "嘴巴。口",
    "目": "眼睛。目",
    "耳": "耳朵。耳",
    "足": "小脚。足",
    "头": "小头。头",
    "牙": "牙齿。牙",
    "舌": "舌头。舌",
}


def generate_audio(char, text):
    """为单个汉字生成 MP3 音频"""
    output = os.path.join(AUDIO_DIR, f"{char}.mp3")

    # 跳过已生成的
    if os.path.exists(output) and os.path.getsize(output) > 500:
        return "skip"

    edge_tts = os.path.expanduser("~/.local/bin/edge-tts")
    if not os.path.exists(edge_tts):
        edge_tts = "edge-tts"  # fallback to PATH

    cmd = [
        edge_tts,
        "--voice", VOICE,
        "--text", text,
        "--write-media", output,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise Exception(result.stderr)

    size_kb = os.path.getsize(output) // 1024
    return size_kb


def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)

    # 按字符排序（优先保证类别顺序）
    chars = sorted(PHRASES.keys(), key=lambda c: ord(c))
    total = len(chars)
    success = 0
    skipped = 0

    print(f"🎧 开始生成 {total} 个音频文件...")
    print(f"   语音: {VOICE}")
    print()

    for i, char in enumerate(chars, 1):
        text = PHRASES[char]
        print(f"[{i}/{total}] {char} → {text}", end=" ")

        try:
            result = generate_audio(char, text)
            if result == "skip":
                print("⏭ 已存在")
                skipped += 1
            else:
                print(f"✅ {result}KB")
                success += 1
        except Exception as e:
            print(f"❌ {e}")

    print()
    print(f"📊 完成！新生成: {success} | 跳过: {skipped} | 总计: {total}")
    print(f"   保存在: {AUDIO_DIR}")


if __name__ == "__main__":
    main()
