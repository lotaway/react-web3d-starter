const path = require("node:path")
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config({path: path.resolve(__dirname, '../.env.development')});

// Contract DIR
const contractRootDir = process.env.CONTRACT_ROOT_DIR || '../contract'
// TypeScript output DIR
const contractDestDir = '../src/generated/contract'

const typeSrcDir = path.join(__dirname, contractRootDir, "target/types")
const typeDestDir = path.join(__dirname, contractDestDir, "types")

async function copyContract2WASM() {
    // @todo copy calculate fn and const to wasm, maybe also include account and context generate ?
    await Promise.resolve()
}

async function copyIDL2TS() {
    const filles = await fs.promises.readdir(typeSrcDir)
    for (const file of filles) {
        const ext = path.extname(file)
        if (ext !== ".ts" || !isIDLTSFile(await fs.promises.readFile(path.join(typeSrcDir, file), "utf-8"))) {
            console.log(`Skip ${file} because it is not a IDL file`)
            continue
        }
        const src = path.join(typeSrcDir, file)
        const dest = path.join(typeDestDir, file)
        if (!fs.existsSync(typeDestDir)) {
            fs.mkdirSync(typeDestDir, {recursive: true})
        }
        await fs.promises.copyFile(src, dest)
        console.log(`Copy ${file} to ${dest} done.`)
    }
}

function isIDLTSFile(content) {
    const hasTypeDefinition = /export\s+type\s+\w+\s*=\s*{/.test(content)
    const hasExportObject = /export\s+const\s+\w+(:\s*\w+)?\s*=\s*{/.test(content)
    
    if (hasTypeDefinition && hasExportObject) {
      const hasVersion = /"version":\s*"\d+\.\d+\.\d+"/.test(content)
      const hasInstructions = /"instructions":\s*\[/.test(content)
      const hasAccounts = /"accounts":\s*\[/.test(content)
      const hasTypes = /"types":\s*\[/.test(content)
      
      return hasVersion && hasInstructions && hasAccounts && hasTypes
    }
  
    return false
  }

async function main() {
    console.log("Start to copy IDL to TS...")
    await copyIDL2TS()
    console.log("Copy IDL to TS done.")
    console.log("Start copy contract to wasm...")
    await copyContract2WASM()
    console.log("Copy contract to wasm done.")
}

main().then(() => {
    console.log("Done.")
})
.catch(err => {
    console.error(err)
})