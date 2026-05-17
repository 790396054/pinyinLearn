// AI 图片生成脚本
// 使用 Pollinations.ai（免费，无需 API Key）批量生成儿童卡通风格配图
// 运行方式: node generate-images.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'images');
const STYLE = 'cute cartoon illustration for children book, simple style, bright colors, clean white background, kid-friendly, no text, no letters';

// 每个汉字的英文描述（用于 AI 生图提示词）
const prompts = {
    // 动物
    '猫': 'a cute orange tabby cat sitting happily',
    '狗': 'a cute brown puppy dog wagging tail',
    '鸟': 'a cute small yellow bird singing on a branch',
    '鱼': 'a cute orange goldfish swimming with bubbles',
    '马': 'a cute brown horse with mane running',
    '牛': 'a cute cow with black and white spots',
    '羊': 'a cute fluffy white sheep',
    '鸡': 'a cute red rooster chicken standing',
    '兔': 'a cute white bunny rabbit with long ears',
    '鸭': 'a cute yellow duckling',

    // 水果
    '瓜': 'a cute round green watermelon with red inside',
    '果': 'a cute shiny red apple',
    '桃': 'a cute pink peach fruit with leaf',
    '梨': 'a cute yellow pear fruit',
    '莓': 'a cute red strawberry with green top',
    '蕉': 'a cute yellow banana',
    '橙': 'a cute round orange fruit',
    '葡': 'a cute bunch of purple grapes',

    // 自然
    '山': 'a cute green mountain with snow cap',
    '水': 'a cute blue water droplet character',
    '火': 'a cute warm campfire flame',
    '花': 'a cute pink cherry blossom flower with five petals',
    '月': 'a cute yellow crescent moon with stars',
    '星': 'a cute yellow twinkling star shape',
    '云': 'a cute fluffy white cloud in blue sky',
    '日': 'a cute bright yellow sun with smile',

    // 数字（用物品表示）
    '一': 'a cute single birthday candle',
    '二': 'a cute pair of two little ducks',
    '三': 'three cute colorful balloons',
    '四': 'a cute four leaf clover',
    '五': 'a cute hand showing five fingers',
    '六': 'six cute colorful marbles',
    '七': 'a cute rainbow with seven colors',
    '八': 'a cute octopus with eight legs',
    '九': 'nine cute tiny stars in the sky',
    '十': 'ten cute colorful counting blocks',

    // 颜色
    '红': 'a cute bright red heart shape',
    '黄': 'a cute yellow sunflower',
    '蓝': 'a cute blue butterfly',
    '绿': 'a cute green frog on a leaf',
    '白': 'a cute white snowman',
    '黑': 'a cute black and white panda face',
    '紫': 'a cute purple bunch of lavender flowers',
    '粉': 'a cute pink flamingo bird',

    // 身体
    '手': 'a cute open hand palm waving hello',
    '口': 'a cute smiling mouth with red lips',
    '目': 'a cute big bright eye',
    '耳': 'a cute ear shape listening',
    '足': 'a cute little foot with toes',
    '头': 'a cute round child face smiling',
    '牙': 'a cute white tooth smiling with toothbrush',
    '舌': 'a cute pink tongue tasting ice cream',
};

function generatePrompt(char, englishDesc) {
    return `${englishDesc}, ${STYLE}`;
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, (response) => {
            // 处理重定向
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filepath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                // 验证文件大小
                const stat = fs.statSync(filepath);
                if (stat.size < 500) {
                    reject(new Error('Image too small, likely generation failed'));
                } else {
                    resolve();
                }
            });
            file.on('error', reject);
        }).on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
    });
}

function buildImageUrl(prompt) {
    const encoded = encodeURIComponent(prompt);
    // Pollinations.ai 免费图片生成 API
    return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux`;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAll() {
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const entries = Object.entries(prompts);
    const total = entries.length;
    let success = 0;
    let failed = [];

    console.log(`🎨 开始生成 ${total} 张配图...\n`);

    for (let i = 0; i < entries.length; i++) {
        const [char, englishDesc] = entries[i];
        const prompt = generatePrompt(char, englishDesc);
        const filename = `${char}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        // 跳过已存在的图片
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 500) {
            console.log(`[${i + 1}/${total}] ⏭  ${char} - 已存在，跳过`);
            success++;
            continue;
        }

        const url = buildImageUrl(prompt);
        console.log(`[${i + 1}/${total}] 🖼  生成: ${char} (${englishDesc})`);

        try {
            await downloadImage(url, filepath);
            const stat = fs.statSync(filepath);
            console.log(`           ✅ 成功 (${(stat.size / 1024).toFixed(1)} KB)`);
            success++;
        } catch (err) {
            console.log(`           ❌ 失败: ${err.message}`);
            failed.push(char);
        }

        // 避免请求过快
        if (i < entries.length - 1) {
            await sleep(2000);
        }
    }

    console.log(`\n📊 完成: ${success}/${total} 成功`);
    if (failed.length > 0) {
        console.log(`⚠️  失败: ${failed.join(', ')}`);
        console.log('  重新运行脚本会重试失败的图片');
    }
    console.log(`\n图片保存在: ${OUTPUT_DIR}`);
}

generateAll().catch(console.error);
