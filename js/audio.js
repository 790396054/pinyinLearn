// 语音播放模块 - edge-tts 本地 MP3（微软 Xiaoxiao 语音）

const AudioPlayer = {
    _audio: null,

    init() {
        this._audio = new Audio();
        this._audio.preload = 'none';
    },

    // 播放汉字 MP3（词组 + 单字语境）
    speakChar(char) {
        if (!this._audio) return;
        this._audio.src = `audio/${encodeURIComponent(char)}.mp3`;
        this._audio.load();
        this._audio.play().catch(() => {});
    },

    // 答对鼓励语 MP3（去掉标点匹配文件名）
    speak(text) {
        if (!this._audio) return;
        const clean = text.replace(/[!！?？。，、]/g, '');
        this._audio.src = `audio/encourage/${encodeURIComponent(clean)}.mp3`;
        this._audio.load();
        this._audio.play().catch(() => {});
    },
};
