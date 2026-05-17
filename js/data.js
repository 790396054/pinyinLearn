// 拼音词库 - 适用于 6 岁幼儿园大班儿童
// 声母列表（用于拼音解析）
const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];

// 解析拼音为声母和韵母
function parsePinyin(pinyin) {
    for (const initial of INITIALS) {
        if (pinyin.startsWith(initial)) {
            return { initial, final: pinyin.slice(initial.length) };
        }
    }
    return { initial: '', final: pinyin };
}

// 词库：按类别组织
const wordBank = {
    animals: {
        name: '动物',
        emoji: '🐾',
        color: '#FF8C42',
        words: [
            { char: '猫', pinyin: 'māo', emoji: '🐱' },
            { char: '狗', pinyin: 'gǒu', emoji: '🐶' },
            { char: '鸟', pinyin: 'niǎo', emoji: '🐦' },
            { char: '鱼', pinyin: 'yú', emoji: '🐟' },
            { char: '马', pinyin: 'mǎ', emoji: '🐴' },
            { char: '牛', pinyin: 'niú', emoji: '🐮' },
            { char: '羊', pinyin: 'yáng', emoji: '🐑' },
            { char: '鸡', pinyin: 'jī', emoji: '🐔' },
            { char: '兔', pinyin: 'tù', emoji: '🐰' },
            { char: '鸭', pinyin: 'yā', emoji: '🦆' },
        ]
    },
    fruits: {
        name: '水果',
        emoji: '🍎',
        color: '#FF6B6B',
        words: [
            { char: '瓜', pinyin: 'guā', emoji: '🍉' },
            { char: '果', pinyin: 'guǒ', emoji: '🍎' },
            { char: '桃', pinyin: 'táo', emoji: '🍑' },
            { char: '梨', pinyin: 'lí', emoji: '🍐' },
            { char: '莓', pinyin: 'méi', emoji: '🍓' },
            { char: '蕉', pinyin: 'jiāo', emoji: '🍌' },
            { char: '橙', pinyin: 'chéng', emoji: '🍊' },
            { char: '葡', pinyin: 'pú', emoji: '🍇' },
        ]
    },
    nature: {
        name: '自然',
        emoji: '🌿',
        color: '#4ECDC4',
        words: [
            { char: '山', pinyin: 'shān', emoji: '⛰️' },
            { char: '水', pinyin: 'shuǐ', emoji: '💧' },
            { char: '火', pinyin: 'huǒ', emoji: '🔥' },
            { char: '花', pinyin: 'huā', emoji: '🌸' },
            { char: '月', pinyin: 'yuè', emoji: '🌙' },
            { char: '星', pinyin: 'xīng', emoji: '⭐' },
            { char: '云', pinyin: 'yún', emoji: '☁️' },
            { char: '日', pinyin: 'rì', emoji: '☀️' },
        ]
    },
    numbers: {
        name: '数字',
        emoji: '🔢',
        color: '#FFD93D',
        words: [
            { char: '一', pinyin: 'yī', emoji: '1️⃣' },
            { char: '二', pinyin: 'èr', emoji: '2️⃣' },
            { char: '三', pinyin: 'sān', emoji: '3️⃣' },
            { char: '四', pinyin: 'sì', emoji: '4️⃣' },
            { char: '五', pinyin: 'wǔ', emoji: '5️⃣' },
            { char: '六', pinyin: 'liù', emoji: '6️⃣' },
            { char: '七', pinyin: 'qī', emoji: '7️⃣' },
            { char: '八', pinyin: 'bā', emoji: '8️⃣' },
            { char: '九', pinyin: 'jiǔ', emoji: '9️⃣' },
            { char: '十', pinyin: 'shí', emoji: '🔟' },
        ]
    },
    colors: {
        name: '颜色',
        emoji: '🎨',
        color: '#A78BFA',
        words: [
            { char: '红', pinyin: 'hóng', emoji: '🔴' },
            { char: '黄', pinyin: 'huáng', emoji: '🟡' },
            { char: '蓝', pinyin: 'lán', emoji: '🔵' },
            { char: '绿', pinyin: 'lǜ', emoji: '🟢' },
            { char: '白', pinyin: 'bái', emoji: '⚪' },
            { char: '黑', pinyin: 'hēi', emoji: '⚫' },
            { char: '紫', pinyin: 'zǐ', emoji: '🟣' },
            { char: '粉', pinyin: 'fěn', emoji: '🩷' },
        ]
    },
    body: {
        name: '身体',
        emoji: '🙌',
        color: '#FB7185',
        words: [
            { char: '手', pinyin: 'shǒu', emoji: '✋' },
            { char: '口', pinyin: 'kǒu', emoji: '👄' },
            { char: '目', pinyin: 'mù', emoji: '👁️' },
            { char: '耳', pinyin: 'ěr', emoji: '👂' },
            { char: '足', pinyin: 'zú', emoji: '🦶' },
            { char: '头', pinyin: 'tóu', emoji: '🗣️' },
            { char: '牙', pinyin: 'yá', emoji: '🦷' },
            { char: '舌', pinyin: 'shé', emoji: '👅' },
        ]
    },
};

// 类别键名列表
const categoryKeys = Object.keys(wordBank);

// 获取汉字对应的图片路径
function getImagePath(char) {
    return `images/${char}.png`;
}

// 获取所有词（展平）
function getAllWords() {
    const all = [];
    for (const key of categoryKeys) {
        for (const word of wordBank[key].words) {
            all.push({ ...word, category: key, categoryName: wordBank[key].name });
        }
    }
    return all;
}
