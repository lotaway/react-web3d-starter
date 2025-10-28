import fs from 'fs'
import path from 'path'

// 使用 import.meta.url 获取当前文件的路径
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 使用 path.resolve 确保得到绝对路径
const SRC_DIR = path.resolve(__dirname, '../../solana-contract')
const OUT_DIR = path.resolve(__dirname, '../src/generated/solana-contract')
const OUT_FILE = 'seeds.ts'

// 添加调试信息
console.log('Current directory:', process.cwd())
console.log('Script directory:', __dirname)
console.log('Source directory:', SRC_DIR)
console.log('Output directory:', OUT_DIR)

// 存储所有发现的 Rust 常量定义
const rustConstants = new Map()

// 首先收集所有的常量定义
function collectConstants(content) {
    const constantRe = /pub\s+const\s+(\w+)\s*:\s*&\[u8\]\s*=\s*(b"[^"]+");/g
    let match
    while ((match = constantRe.exec(content)) !== null) {
        const [_, name, value] = match
        rustConstants.set(name, value)
    }
}

// 查找所有 Rust 文件
const rustFiles = []
function walk(dir) {
    const entries = fs.readdirSync(dir)
    for (const entry of entries) {
        const full = path.join(dir, entry)
        const stat = fs.statSync(full)
        if (stat.isDirectory()) walk(full)
        else if (entry.endsWith('.rs')) {
            rustFiles.push(full)
            // 如果是 seeds.rs，先处理常量定义
            if (entry === 'seeds.rs') {
                const content = fs.readFileSync(full, 'utf8')
                collectConstants(content)
            }
        }
    }
}

walk(SRC_DIR)

const results = []

// 将 Rust 字节字符串转换为 TypeScript Buffer
function convertBytesToTS(rustBytes) {
    return `Buffer.from(${rustBytes.replace(/^b/, '')})`
}

for (const file of rustFiles) {
    // if (file.endsWith('seeds.rs')) continue // 跳过 seeds.rs，因为已经处理过了
    
    const content = fs.readFileSync(file, 'utf8')

    // 匹配所有 struct
    const structRe = /pub\s+struct\s+(\w+)\s*{([^}]*)}/gs
    let structMatch
    while ((structMatch = structRe.exec(content)) !== null) {
        const structName = structMatch[1]
        const structBody = structMatch[2]

        // 匹配带 seeds 注解的字段
        const fieldRe = /#\[account\s*\(([^)]*seeds\s*=\s*\[[^\]]+\][^)]*)\)\]\s*pub\s+(\w+):/g
        let fieldMatch
        while ((fieldMatch = fieldRe.exec(structBody)) !== null) {
            const attr = fieldMatch[1]
            const fieldName = fieldMatch[2]

            const seedMatch = attr.match(/seeds\s*=\s*\[([^\]]+)\]/)
            if (!seedMatch) continue

            const rawSeeds = seedMatch[1]
            const seeds = rawSeeds.split(',').map(s => s.trim()).filter(Boolean)

            seeds.forEach((seed, idx) => {
                let constName = `${structName}_${fieldName}_Seed${idx}`
                let value = ''

                // 处理 seeds::CONSTANT_NAME 形式的引用
                if (seed.startsWith('seeds::')) {
                    const constName = seed.split('::')[1]
                    const rustValue = rustConstants.get(constName)
                    if (rustValue) {
                        value = convertBytesToTS(rustValue)
                    } else {
                        console.warn(`Warning: Constant ${constName} not found in seeds.rs`)
                        value = seed // 保持原样作为后备
                    }
                }
                // 处理其他形式的 seed
                else if (/^b?["'].*["']$/.test(seed)) {
                    value = convertBytesToTS(seed)
                } else if (/^\[.*\]$/.test(seed)) {
                    value = `Buffer.from(${seed})`
                } else if (seed.includes('.key()')) {
                    // 处理 .key() 调用
                    value = `// Dynamic: ${seed}\nBuffer.alloc(32)` // 占位符
                } else {
                    value = seed
                }

                results.push(`export const ${constName} = ${value}`)
            })
        }
    }
}

// 添加从 seeds.rs 导出的常量
for (const [name, value] of rustConstants.entries()) {
    results.push(`export const ${name} = ${convertBytesToTS(value)}`)
}

// 检查并创建目录
try {
    // 先删除目录（如果存在）
    if (fs.existsSync(OUT_DIR)) {
        fs.rmSync(OUT_DIR, { recursive: true, force: true });
        console.log('Removed existing directory');
    }
    
    // 创建新目录
    fs.mkdirSync(OUT_DIR, { recursive: true });
    // console.log('Created directory:', OUT_DIR);
    
    // 验证目录是否真的创建成功
    // const dirStats = fs.statSync(OUT_DIR);
    // console.log('Directory exists:', fs.existsSync(OUT_DIR));
    // console.log('Is directory:', dirStats.isDirectory());
    // console.log('Directory permissions:', dirStats.mode.toString(8));
    
    // 写入文件
    const fullPath = path.join(OUT_DIR, OUT_FILE);
    fs.writeFileSync(fullPath, results.join('\n') + '\n');
    console.log('✅ Successfully generated:', fullPath);
} catch (error) {
    console.error('Detailed error:', {
        error: error.message,
        code: error.code,
        syscall: error.syscall,
        path: error.path
    });
}
