// 通义万相（阿里 DashScope）图片生成脚本
// 需要设置环境变量: export DASHSCOPE_API_KEY="sk-bd1c773a9250472cad8fc0bcc3f9cc59"
// 获取 API Key: https://dashscope.aliyun.com/
// 新用户有免费额度
// 运行方式: node generate-images-tongyi.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.DASHSCOPE_API_KEY;
const API_HOST = 'dashscope.aliyuncs.com';
const OUTPUT_DIR = path.join(__dirname, 'images');

// 每个汉字的 prompt（中文提示词，通义万相中文理解更好）
const prompts = {
    '莓': '一颗可爱的红色草莓，卡通风格，儿童绘本，简洁明亮，白色背景',
    '蕉': '一根可爱的黄色香蕉，卡通风格，儿童绘本，简洁明亮，白色背景',
    '橙': '一个可爱的圆形橙子，卡通风格，儿童绘本，简洁明亮，白色背景',
    '葡': '一串可爱的紫色葡萄，卡通风格，儿童绘本，简洁明亮，白色背景',
    '山': '一座可爱的绿色山峰，卡通风格，儿童绘本，简洁明亮，白色背景',
    '水': '一颗可爱的蓝色水滴，卡通风格，儿童绘本，简洁明亮，白色背景',
    '火': '一团可爱的橙色火焰，卡通风格，儿童绘本，简洁明亮，白色背景',
    '花': '一朵可爱的粉色小花，五瓣，卡通风格，儿童绘本，简洁明亮，白色背景',
    '月': '一弯可爱的黄色月牙和星星，卡通风格，儿童绘本，简洁明亮，白色背景',
    '星': '一颗可爱的黄色五角星，发光，卡通风格，儿童绘本，简洁明亮，白色背景',
    '云': '一朵可爱的白色云朵，卡通风格，儿童绘本，简洁明亮，天蓝色背景',
    '日': '一个可爱的黄色太阳，卡通风格，儿童绘本，简洁明亮，白色背景',
    '一': '一根可爱的生日蜡烛，卡通风格，儿童绘本，简洁明亮，白色背景',
    '二': '两只可爱的小鸭子，卡通风格，儿童绘本，简洁明亮，白色背景',
    '三': '三个可爱的彩色气球，卡通风格，儿童绘本，简洁明亮，白色背景',
    '四': '一片可爱的四叶草，卡通风格，儿童绘本，简洁明亮，白色背景',
    '五': '一只可爱的小手张开五个手指，卡通风格，儿童绘本，简洁明亮，白色背景',
    '六': '六颗可爱的彩色弹珠，卡通风格，儿童绘本，简洁明亮，白色背景',
    '七': '一道可爱的七色彩虹，卡通风格，儿童绘本，简洁明亮，白色背景',
    '八': '一只可爱的八条腿章鱼，卡通风格，儿童绘本，简洁明亮，白色背景',
    '九': '九颗可爱的小星星，卡通风格，儿童绘本，简洁明亮，白色背景',
    '十': '十个可爱的彩色积木，卡通风格，儿童绘本，简洁明亮，白色背景',
    '红': '一个可爱的红色爱心，卡通风格，儿童绘本，简洁明亮，白色背景',
    '黄': '一朵可爱的黄色向日葵，卡通风格，儿童绘本，简洁明亮，白色背景',
    '蓝': '一只可爱的蓝色蝴蝶，卡通风格，儿童绘本，简洁明亮，白色背景',
    '绿': '一只可爱的绿色青蛙，卡通风格，儿童绘本，简洁明亮，白色背景',
    '白': '一个可爱的白色雪人，卡通风格，儿童绘本，简洁明亮，白色背景',
    '黑': '一张可爱的黑白熊猫脸，卡通风格，儿童绘本，简洁明亮，白色背景',
    '紫': '一束可爱的紫色薰衣草，卡通风格，儿童绘本，简洁明亮，白色背景',
    '粉': '一只可爱的粉色火烈鸟，卡通风格，儿童绘本，简洁明亮，白色背景',
    '手': '一只可爱的张开手掌打招呼，卡通风格，儿童绘本，简洁明亮，白色背景',
    '口': '一个可爱的微笑嘴巴，卡通风格，儿童绘本，简洁明亮，白色背景',
    '目': '一只可爱的大眼睛，卡通风格，儿童绘本，简洁明亮，白色背景',
    '耳': '一只可爱的耳朵，卡通风格，儿童绘本，简洁明亮，白色背景',
    '足': '一只可爱的小脚丫，卡通风格，儿童绘本，简洁明亮，白色背景',
    '头': '一个可爱的圆形小朋友笑脸，卡通风格，儿童绘本，简洁明亮，白色背景',
    '牙': '一颗可爱的白色牙齿微笑，卡通风格，儿童绘本，简洁明亮，白色背景',
    '舌': '一个可爱的粉色舌头，卡通风格，儿童绘本，简洁明亮，白色背景',
};

function httpRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            path,
            method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'X-DashScope-Async': 'enable',
            },
            timeout: 60000,
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
                } catch {
                    reject(new Error(`解析失败: ${data}`));
                }
            });
        });

        req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function pollTask(taskId) {
    // 轮询直到任务完成
    for (let i = 0; i < 30; i++) {
        const res = await httpRequest('GET', `/api/v1/tasks/${taskId}`);
        const status = res.body.output.task_status;
        if (status === 'SUCCEEDED') {
            return res.body.output.results[0].url;
        }
        if (status === 'FAILED') {
            throw new Error(`生成失败: ${res.body.output.message || '未知错误'}`);
        }
        await sleep(2000);
    }
    throw new Error('任务超时');
}

async function generateImage(prompt) {
    // 调用通义万相文本生图 API（异步模式）
    const response = await httpRequest('POST', '/api/v1/services/aigc/text2image/image-synthesis', {
        model: 'wanx-v1',
        input: { prompt },
        parameters: { size: '1024*1024', n: 1 },
    });

    if (response.statusCode !== 200) {
        throw new Error(`API 错误 (${response.statusCode}): ${JSON.stringify(response.body)}`);
    }

    const taskId = response.body.output.task_id;
    if (!taskId) throw new Error('未获取到 task_id');

    // 轮询等待结果
    return await pollTask(taskId);
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        const req = protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`下载失败 HTTP ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filepath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                const stat = fs.statSync(filepath);
                if (stat.size < 500) reject(new Error('图片太小'));
                else resolve();
            });
            file.on('error', reject);
        });
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('下载超时')); });
        req.on('error', reject);
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAll() {
    if (!API_KEY) {
        console.error('❌ 请先设置 API Key: export DASHSCOPE_API_KEY="sk-xxx"');
        console.error('   获取地址: https://dashscope.aliyun.com/');
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const entries = Object.entries(prompts);
    const total = entries.length;
    let success = 0;
    const failed = [];

    console.log(`🎨 通义万相 - 开始生成 ${total} 张配图...\n`);

    for (let i = 0; i < entries.length; i++) {
        const [char, prompt] = entries[i];
        const filepath = path.join(OUTPUT_DIR, `${char}.png`);

        // 跳过已存在的图片
        if (fs.existsSync(filepath) && fs.statSync(filepath).size > 500) {
            console.log(`[${i + 1}/${total}] ⏭  ${char} - 已存在，跳过`);
            success++;
            continue;
        }

        console.log(`[${i + 1}/${total}] 🖼  生成: ${char}`);

        try {
            const imageUrl = await generateImage(prompt);
            await downloadImage(imageUrl, filepath);
            const stat = fs.statSync(filepath);
            console.log(`           ✅ 成功 (${(stat.size / 1024).toFixed(1)} KB)`);
            success++;
        } catch (err) {
            console.log(`           ❌ 失败: ${err.message}`);
            failed.push(char);
        }

        // API 限速：每秒 1 次请求
        if (i < entries.length - 1) {
            await sleep(1500);
        }
    }

    console.log(`\n📊 完成: ${success}/${total} 成功`);
    if (failed.length > 0) {
        console.log(`⚠️  失败: ${failed.join(', ')}`);
    }
}

generateAll().catch(console.error);
