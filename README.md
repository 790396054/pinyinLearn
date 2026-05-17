# 拼音学习 - 儿童版

6 岁幼儿园大班儿童拼音学习 Web 应用。打开浏览器即用，无需安装。

## 功能

- **学习模式** — 浏览汉字卡片，看图片 + 拼音 + 听发音
- **练习模式** — 拼音填空，声母或韵母随机留空，四选一
- **AI 配图** — 每个汉字都有对应的卡通图片
- **语音播放** — 汉字发音 + 答对鼓励语音
- **星星计分** — 答对得星，连续答对有连对奖励和撒花动画
- **6 个类别** — 动物、水果、自然、数字、颜色、身体，共 52 个汉字

## 使用

直接双击 `index.html` 在浏览器中打开即可。

键盘快捷键（学习模式）：← → 切换卡片，空格/回车 听发音。

## 目录结构

```
index.html              — 主页面
css/style.css           — 样式
js/data.js              — 词库（52 字，6 类）
js/audio.js             — 语音播放
js/app.js               — 主逻辑
audio/                  — MP3 音频文件
audio/encourage/        — 鼓励语音
images/                 — AI 生成的配图（PNG）
generate-audio.py       — 音频生成脚本（edge-tts）
generate-images-tongyi.js — 图片生成脚本（通义万相）
```

## 自己生成资源

### 配图

```bash
DASHSCOPE_API_KEY="sk-xxx" node generate-images-tongyi.js
```

### 音频

```bash
pipx install edge-tts
python3 generate-audio.py
```
