// 拼音学习 - 主应用逻辑

const App = {
    // 状态
    mode: 'learn',        // 'learn' | 'practice'
    category: 'animals',
    wordIndex: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,

    // 练习模式状态
    practiceWords: [],    // 本轮练习词列表（已打乱）
    practiceIndex: 0,
    blankType: '',        // 'initial' | 'final'
    correctAnswer: '',
    options: [],
    answered: false,

    // 练习轮次大小
    roundSize: 10,

    // ===== 初始化 =====
    init() {
        AudioPlayer.init();
        this.category = categoryKeys[0];
        this.render();
        this.bindEvents();
    },

    // ===== 获取当前类别的词列表 =====
    getWords() {
        return wordBank[this.category].words;
    },

    getCurrentWord() {
        return this.getWords()[this.wordIndex];
    },

    // ===== 渲染主界面 =====
    render() {
        this.renderTopBar();
        this.renderCard();
        this.renderCategoryBar();
        this.renderNavBar();
        this.updateCatButtonColors();
    },

    // ===== 顶栏 =====
    renderTopBar() {
        document.getElementById('stars-display').innerHTML =
            `<span class="star-icon">⭐</span> ${this.score}`;
        document.getElementById('combo-text').textContent =
            this.combo > 1 ? `🔥 ${this.combo}连对` : '';

        const learnBtn = document.getElementById('mode-learn');
        const practiceBtn = document.getElementById('mode-practice');
        learnBtn.classList.toggle('active', this.mode === 'learn');
        practiceBtn.classList.toggle('active', this.mode === 'practice');
    },

    // ===== 主卡片 =====
    renderCard() {
        if (this.mode === 'learn') {
            this.renderLearnCard();
        } else {
            this.renderPracticeCard();
        }
    },

    // 学习模式卡片
    renderLearnCard() {
        const word = this.getCurrentWord();
        const card = document.getElementById('main-card');
        card.className = 'main-card';

        document.getElementById('card-content').innerHTML = `
            ${this.renderWordImage(word)}
            <div class="char-display">${word.char}</div>
            <div class="pinyin-full">${word.pinyin}</div>
            <button class="audio-btn" id="audio-btn" title="听发音">🔊</button>
        `;

        document.getElementById('audio-btn').onclick = () => {
            AudioPlayer.speakChar(word.char);
        };
    },

    // 练习模式卡片
    renderPracticeCard() {
        if (this.practiceWords.length === 0) {
            this.startPracticeRound();
        }

        const word = this.practiceWords[this.practiceIndex];
        const parsed = parsePinyin(word.pinyin);
        this.answered = false;

        // 决定空白声母还是韵母
        if (parsed.initial === '') {
            this.blankType = 'final';
        } else {
            this.blankType = Math.random() < 0.5 ? 'initial' : 'final';
        }

        if (this.blankType === 'initial') {
            this.correctAnswer = parsed.initial;
        } else {
            this.correctAnswer = parsed.final;
        }

        this.options = this.generateOptions();

        const card = document.getElementById('main-card');
        card.className = 'main-card';

        // 构建拼音显示
        let pinyinHTML = '';
        if (this.blankType === 'initial') {
            pinyinHTML = `
                <span class="pinyin-blank" id="pinyin-blank">?</span>
                <span class="pinyin-char">${this.escapeHTML(parsed.final)}</span>
            `;
        } else {
            if (parsed.initial) {
                pinyinHTML = `
                    <span class="pinyin-char">${this.escapeHTML(parsed.initial)}</span>
                    <span class="pinyin-blank" id="pinyin-blank">?</span>
                `;
            } else {
                pinyinHTML = `
                    <span class="pinyin-blank" id="pinyin-blank">?</span>
                `;
            }
        }

        document.getElementById('card-content').innerHTML = `
            ${this.renderWordImage(word)}
            <div class="char-display">${word.char}</div>
            <div class="pinyin-area">${pinyinHTML}</div>
            <div class="options-area" id="options-area"></div>
            <div class="message-area" id="message-area"></div>
            <button class="audio-btn" id="audio-btn" title="听发音">🔊</button>
        `;

        // 渲染选项按钮
        const optsContainer = document.getElementById('options-area');
        this.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => this.selectOption(opt, btn);
            optsContainer.appendChild(btn);
        });

        document.getElementById('audio-btn').onclick = () => {
            AudioPlayer.speakChar(word.char);
        };
    },

    // 生成干扰选项（共4个）
    generateOptions() {
        const correct = this.correctAnswer;
        const options = new Set([correct]);

        if (this.blankType === 'initial') {
            // 从声母表随机选干扰项
            const others = INITIALS.filter(i => i !== correct);
            this.shuffle(others);
            for (const item of others) {
                if (options.size >= 4) break;
                options.add(item);
            }
        } else {
            // 韵母：从词库中随机选取不同的韵母作为干扰项
            const allFinals = this.collectAllFinals();
            const others = allFinals.filter(f => f !== correct);
            this.shuffle(others);
            for (const item of others) {
                if (options.size >= 4) break;
                options.add(item);
            }
        }

        // 转为数组并打乱顺序
        const result = [...options];
        this.shuffle(result);
        return result;
    },

    collectAllFinals() {
        const finals = new Set();
        for (const key of categoryKeys) {
            for (const w of wordBank[key].words) {
                finals.add(parsePinyin(w.pinyin).final);
            }
        }
        return [...finals];
    },

    // 选择选项
    selectOption(option, btnElement) {
        if (this.answered) return;
        this.answered = true;

        const isCorrect = (option === this.correctAnswer);
        const allBtns = document.querySelectorAll('.option-btn');

        // 禁用所有按钮
        allBtns.forEach(b => b.disabled = true);

        if (isCorrect) {
            this.onCorrect(btnElement);
            // 答对：延迟进入下一题
            setTimeout(() => this.nextPracticeWord(), 1000);
        } else {
            this.onWrong(btnElement, allBtns);
            // 答错：短暂反馈后恢复，留在当前题目
            setTimeout(() => this.resetForRetry(), 800);
        }
    },

    onCorrect(btnElement) {
        btnElement.classList.add('correct-choice');
        this.score++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        document.getElementById('pinyin-blank').classList.add('filled');
        document.getElementById('pinyin-blank').textContent = this.correctAnswer;
        document.getElementById('main-card').classList.add('bounce');

        const messages = ['太棒了!', '真厉害!', '好聪明!', '答对了!', '真棒!', '非常好!'];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        this.showMessage(msg, 'correct-msg');
        AudioPlayer.speak(msg, 0.9);

        // 撒星星
        if (this.combo >= 3) {
            this.burstStars(3);
        } else {
            this.burstStars(1);
        }

        this.renderTopBar();
    },

    onWrong(btnElement, allBtns) {
        btnElement.classList.add('wrong-choice');
        this.combo = 0;

        document.getElementById('pinyin-blank').classList.add('wrong-flash');
        document.getElementById('main-card').classList.add('shake');

        // 高亮正确答案
        allBtns.forEach(b => {
            if (b.textContent === this.correctAnswer) {
                b.classList.add('correct-choice');
            }
        });

        this.showMessage('再试试!', 'wrong-msg');
        this.renderTopBar();
    },

    showMessage(text, cls) {
        const area = document.getElementById('message-area');
        area.innerHTML = `<span class="message-text ${cls}">${text}</span>`;
    },

    // 答错后恢复题目，留在当前题重试
    resetForRetry() {
        this.answered = false;

        // 移除所有按钮的高亮和禁用
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(b => {
            b.disabled = false;
            b.classList.remove('correct-choice', 'wrong-choice');
        });

        // 恢复拼音空白样式
        const blank = document.getElementById('pinyin-blank');
        if (blank) {
            blank.classList.remove('wrong-flash');
            blank.textContent = '?';
        }

        // 移除卡片动画
        const card = document.getElementById('main-card');
        if (card) card.classList.remove('shake');

        // 清除消息
        document.getElementById('message-area').innerHTML = '';
    },

    // 进入下一道练习
    nextPracticeWord() {
        this.practiceIndex++;
        if (this.practiceIndex >= this.practiceWords.length) {
            this.showCompletionModal();
        } else {
            this.renderCard();
        }
    },

    // 开始新一轮练习
    startPracticeRound() {
        const words = this.getWords();
        // 随机抽取并打乱
        const pool = [...words];
        this.shuffle(pool);
        this.practiceWords = pool.slice(0, Math.min(this.roundSize, pool.length));
        this.practiceIndex = 0;
    },

    // 完成弹窗
    showCompletionModal() {
        const roundTotal = this.practiceWords.length;
        const emoji = this.score >= roundTotal * 0.8 ? '🎉' : this.score >= roundTotal * 0.5 ? '😊' : '💪';
        const title = this.score >= roundTotal * 0.8 ? '太厉害了!' : this.score >= roundTotal * 0.5 ? '做得不错!' : '继续加油!';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'completion-modal';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-emoji">${emoji}</div>
                <div class="modal-title">${title}</div>
                <div class="modal-stars">${'⭐'.repeat(Math.min(this.score, 10))}</div>
                <div class="modal-text">你答对了 <strong>${this.score}</strong> 道题<br>最高连对: <strong>${this.maxCombo}</strong></div>
                <button class="modal-btn" id="modal-again-btn">再来一轮</button>
                <button class="modal-btn" id="modal-learn-btn" style="background: linear-gradient(135deg, #A78BFA, #8B5CF6); margin-top: 8px;">去学习模式</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('modal-again-btn').onclick = () => {
            overlay.remove();
            this.score = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.practiceWords = [];
            this.startPracticeRound();
            this.render();
        };

        document.getElementById('modal-learn-btn').onclick = () => {
            overlay.remove();
            this.score = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.practiceWords = [];
            this.setMode('learn');
        };
    },

    // 撒星星粒子
    burstStars(count) {
        const card = document.getElementById('main-card');
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        for (let i = 0; i < count * 3; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            star.textContent = ['⭐', '🌟', '✨'][Math.floor(Math.random() * 3)];
            star.style.left = cx + 'px';
            star.style.top = cy + 'px';
            star.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
            star.style.setProperty('--dy', (Math.random() * -150 - 40) + 'px');
            star.style.setProperty('--rot', (Math.random() - 0.5) * 360 + 'deg');
            star.style.animationDuration = (0.6 + Math.random() * 0.6) + 's';
            document.body.appendChild(star);

            star.addEventListener('animationend', () => star.remove());
        }
    },

    // ===== 类别栏 =====
    renderCategoryBar() {
        const bar = document.getElementById('category-bar');
        bar.innerHTML = '';

        categoryKeys.forEach(key => {
            const cat = wordBank[key];
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.dataset.category = key;
            btn.innerHTML = `<span class="cat-emoji">${cat.emoji}</span> ${cat.name}`;
            btn.onclick = () => this.setCategory(key);
            if (key === this.category) btn.classList.add('active');
            bar.appendChild(btn);
        });
    },

    setCategory(key) {
        this.category = key;
        this.wordIndex = 0;
        this.practiceWords = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.render();
    },

    updateCatButtonColors() {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            const key = btn.dataset.category;
            if (key === this.category) {
                btn.classList.add('active');
                btn.style.background = wordBank[key].color;
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // ===== 导航栏 =====
    renderNavBar() {
        const bar = document.getElementById('nav-bar');

        if (this.mode === 'learn') {
            bar.innerHTML = `
                <button class="nav-btn prev-btn" id="nav-prev">◀ 上一个</button>
                <button class="nav-btn speak-btn" id="nav-speak">🔊</button>
                <button class="nav-btn next-btn" id="nav-next">下一个 ▶</button>
            `;

            const words = this.getWords();
            document.getElementById('nav-prev').onclick = () => {
                this.wordIndex = (this.wordIndex - 1 + words.length) % words.length;
                this.renderCard();
            };
            document.getElementById('nav-next').onclick = () => {
                this.wordIndex = (this.wordIndex + 1) % words.length;
                this.renderCard();
            };
            document.getElementById('nav-speak').onclick = () => {
                AudioPlayer.speakChar(this.getCurrentWord().char);
            };
        } else {
            bar.innerHTML = `
                <button class="nav-btn prev-btn" id="nav-skip">跳过</button>
                <button class="nav-btn speak-btn" id="nav-speak">🔊</button>
                <button class="nav-btn learn-btn" id="nav-end-practice">结束练习</button>
            `;

            document.getElementById('nav-skip').onclick = () => {
                this.nextPracticeWord();
            };
            document.getElementById('nav-speak').onclick = () => {
                const word = this.practiceWords[this.practiceIndex];
                if (word) AudioPlayer.speakChar(word.char);
            };
            document.getElementById('nav-end-practice').onclick = () => {
                this.showCompletionModal();
            };
        }
    },

    // ===== 模式切换 =====
    setMode(mode) {
        this.mode = mode;
        this.wordIndex = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.practiceWords = [];
        this.render();
    },

    // ===== 事件绑定 =====
    bindEvents() {
        document.getElementById('mode-learn').onclick = () => this.setMode('learn');
        document.getElementById('mode-practice').onclick = () => this.setMode('practice');

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (this.mode === 'learn') {
                const words = this.getWords();
                if (e.key === 'ArrowLeft') {
                    this.wordIndex = (this.wordIndex - 1 + words.length) % words.length;
                    this.renderCard();
                } else if (e.key === 'ArrowRight') {
                    this.wordIndex = (this.wordIndex + 1) % words.length;
                    this.renderCard();
                } else if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    AudioPlayer.speakChar(this.getCurrentWord().char);
                }
            }
        });
    },

    // ===== 图片渲染（AI 生图 + Emoji 兜底） =====
    renderWordImage(word, extraClass = '') {
        return `
            <div class="image-container ${extraClass}">
                <img src="${getImagePath(word.char)}"
                     alt="${word.char}"
                     class="word-image"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <span class="emoji-fallback" style="display:none">${word.emoji}</span>
            </div>
        `;
    },

    // ===== 工具函数 =====
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
