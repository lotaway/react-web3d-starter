import {defineConfig, ProxyOptions} from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import wasm from "vite-plugin-wasm"
import {resolve} from "node:path"
import fs from 'node:fs'

const nginxConfig = fs.readFileSync(resolve(__dirname, 'public/nginx.conf'), 'utf8')
const locationRegex = /location\s+\^~\s+\/([\w\/]+)\s+\{[\s\S]*?proxy_pass\s+(http[s]?:\/\/[^;]+);[\s\S]*?\}/g
let proxy: Record<string, ProxyOptions> = {}
let match
while ((match = locationRegex.exec(nginxConfig)) !== null) {
    // 获取路径和目标URL
    const matchPrefix = `/${match[1]}`
    const target = match[2]
    // 添加到结果对象
    proxy[matchPrefix] = {
        target,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(new RegExp(`^${matchPrefix}`), ''),
    }
}
// console.log(proxy)
// Object.values(proxy).forEach(item => console.log(item.rewrite?.toString()))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        wasm(),
        react(),
    ],
    //  配置前端服务地址和端口
    server: {
        host: 'localhost',
        port: parseInt(process.env.VITE_PORT) ||30001,
        //  是否开启https
        // https: true,
        // 设置反向代理，跨域
        proxy,
    },
})
