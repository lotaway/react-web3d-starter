import { memo, createRef, useEffect } from "react"
import {
    BindGroupProxy,
    GPUBindGroupBuilder,
    GPUBufferBuilder, GPUDepthStencilStateBuilder,
    GPUFragmentStateBuilder,
    GPUPrimitiveStateBuilder, GPURenderPassBuilder, GPURenderPipelineBuilder, GPUSamplerBuilder,
    GPUShaderModuleBuilder,
    GPUTextureBuilder, GPUVertexStateBuilder, IndexProxy,
    ThreeGPU,
    VertexBuilder,
    WebGPUBuilder
} from "../../../system/webGPU"
import positionVertWGSL from "../../shader/position.vert.wgsl?raw"
import vertexWGSL from "../../shader/triangle.vert.wgsl?raw"
import shadowDepthWGSL from "../../shader/shadow-depth.wgsl?raw"
import pinkFragmentWGSL from "../../shader/pink.frag.wgsl?raw"
import colorFragmentWGSL from "../../shader/color.frag.wgsl?raw"
import style from "./NewWorld.module.sass"
import { mat4, vec3 } from "gl-matrix"

interface RenderOptions {
    textureView?: GPUTextureView,
    vert: {
        vertex: ThreeGPU.Vertex<Float32Array>,
        index: Uint16Array,
        vertexBuffer: GPUBuffer,
        vertexIndexBuffer: GPUBuffer,
        vertexColorsBuffer: GPUBuffer,
    },
    depthTexture: GPUTexture,
    shadowDepthTextureView: GPUTextureView
}

class Web3d {

    private shadowPipelineBuilder: GPURenderPipelineBuilder | undefined
    private renderPipelineBuilder: GPURenderPipelineBuilder | undefined
    groupProxy: BindGroupProxy
    bindGroups: Array<{
        slot: number
        entries: Iterable<GPUBindingResource>
    }>

    constructor(
        private readonly webGpu: WebGPUBuilder
    ) {
        this.groupProxy = new BindGroupProxy()
        this.bindGroups = []
    }

    async init() {
        const { vert, depthTexture, shadowDepthTexture } = await this.initPipeline()
        this.initUniform()
        await this.initTexture()
        this.render({
            vert,
            depthTexture,
            shadowDepthTextureView: shadowDepthTexture.createView(),
        })
    }

    static async create(element: ThreeGPU.CreateGPUParams) {
        const webGpu = await WebGPUBuilder.create(element)
        return new Web3d(webGpu)
    }

    static getTriangleVertex() {
        return [
            { x: 0.0, y: 0.0, z: 0.0 },
            { x: 0.5, y: 0.0, z: 0.0 },
            { x: 0.0, y: 0.5, z: 0.0 },
            { x: 0.0, y: 0.5, z: 0.0 },
            { x: 0.5, y: 0.0, z: 0.0 },
            { x: 0.5, y: 0.5, z: 0.0 }
        ]
    }

    //  对应顶点的连线方式
    static getDrawIndex() {
        return [
            0, 1, 2,
            1, 2, 3,

            4, 5, 6,
            5, 6, 7,

            8, 9, 10,
            9, 10, 11,

            12, 13, 14,
            13, 14, 15,

            16, 17, 18,
            17, 18, 19,

            20, 21, 22,
            21, 22, 23,
        ]
    }

    static getCubeVertex() {
        return [
            //  正面
            { x: -1.0, y: 1.0, z: -1.0 },
            { x: -1.0, y: -1.0, z: -1.0 },
            { x: 1.0, y: 1.0, z: -1.0 },
            { x: 1.0, y: -1.0, z: -1.0 },
            //  背面
            { x: -1.0, y: 1.0, z: 1.0 },
            { x: -1.0, y: -1.0, z: 1.0 },
            { x: 1.0, y: 1.0, z: 1.0 },
            { x: 1.0, y: -1.0, z: 1.0 },
            //  左面
            { x: -1.0, y: -1.0, z: -1.0 },
            { x: -1.0, y: 1.0, z: -1.0 },
            { x: -1.0, y: -1.0, z: 1.0 },
            { x: -1.0, y: 1.0, z: 1.0 },
            //  右面
            { x: 1.0, y: -1.0, z: -1.0 },
            { x: 1.0, y: 1.0, z: -1.0 },
            { x: 1.0, y: -1.0, z: 1.0 },
            { x: 1.0, y: 1.0, z: 1.0 },
            //  上面
            { x: -1.0, y: 1.0, z: 1.0 },
            { x: 1.0, y: 1.0, z: 1.0 },
            { x: -1.0, y: 1.0, z: -1.0 },
            { x: 1.0, y: 1.0, z: -1.0 },
            //  下面
            { x: -1.0, y: -1.0, z: 1.0 },
            { x: 1.0, y: -1.0, z: 1.0 },
            { x: -1.0, y: -1.0, z: -1.0 },
            { x: 1.0, y: -1.0, z: -1.0 },
        ]
    }

    static getNormal() {
        return [

            { x: 0, y: 0, z: -1, },
            { x: 0, y: 0, z: -1, },
            { x: 0, y: 0, z: -1, },
            { x: 0, y: 0, z: -1, },

            { x: 0, y: 0, z: 1, },
            { x: 0, y: 0, z: 1, },
            { x: 0, y: 0, z: 1, },
            { x: 0, y: 0, z: 1, },

            { x: -1, y: 0, z: 0, },
            { x: -1, y: 0, z: 0, },
            { x: -1, y: 0, z: 0, },
            { x: -1, y: 0, z: 0, },

            { x: 1, y: 0, z: 0, },
            { x: 1, y: 0, z: 0, },
            { x: 1, y: 0, z: 0, },
            { x: 1, y: 0, z: 0, },

            { x: 0, y: 1, z: 0, },
            { x: 0, y: 1, z: 0, },
            { x: 0, y: 1, z: 0, },
            { x: 0, y: 1, z: 0, },

            { x: 0, y: -1, z: 0, },
            { x: 0, y: -1, z: 0, },
            { x: 0, y: -1, z: 0, },
            { x: 0, y: -1, z: 0, },
        ]
    }

    static getUV() {
        return [{
            u: 0, v: 0
        }, {
            u: 0, v: 1
        }, {
            u: 1, v: 0
        }, {
            u: 1, v: 1
        }]
    }

    static getVertexColors() {
        return [
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.0, 0.0, 0.0,
            0.2, 1.0, 0.0,
            0.5, 0.5, 1.0,
        ]
    }

    static getCircleVertex() {
        return [
            // float3 position, float3 normal, float2 uv
            0.5, 0.5, 0.5, 1, 0, 0, 0, 1,
            0.5, 0.5, -0.5, 1, 0, 0, 1, 1,
            0.5, -0.5, 0.5, 1, 0, 0, 0, 0,
            0.5, -0.5, -0.5, 1, 0, 0, 1, 0,
            -0.5, 0.5, -0.5, -1, 0, 0, 0, 1,
            -0.5, 0.5, 0.5, -1, 0, 0, 1, 1,
            -0.5, -0.5, -0.5, -1, 0, 0, 0, 0,
            -0.5, -0.5, 0.5, -1, 0, 0, 1, 0,
            -0.5, 0.5, -0.5, 0, 1, 0, 0, 1,
            0.5, 0.5, -0.5, 0, 1, 0, 1, 1,
            -0.5, 0.5, 0.5, 0, 1, 0, 0, 0,
            0.5, 0.5, 0.5, 0, 1, 0, 1, 0,
            -0.5, -0.5, 0.5, 0, -1, 0, 0, 1,
            0.5, -0.5, 0.5, 0, -1, 0, 1, 1,
            -0.5, -0.5, -0.5, 0, -1, 0, 0, 0,
            0.5, -0.5, -0.5, 0, -1, 0, 1, 0,
            -0.5, 0.5, 0.5, 0, 0, 1, 0, 1,
            0.5, 0.5, 0.5, 0, 0, 1, 1, 1,
            -0.5, -0.5, 0.5, 0, 0, 1, 0, 0,
            0.5, -0.5, 0.5, 0, 0, 1, 1, 0,
            0.5, 0.5, -0.5, 0, 0, -1, 0, 1,
            -0.5, 0.5, -0.5, 0, 0, -1, 1, 1,
            0.5, -0.5, -0.5, 0, 0, -1, 0, 0,
            -0.5, -0.5, -0.5, 0, 0, -1, 1, 0
        ]
    }

    //  创建渲染管线
    async initPipeline() {
        const vertexModule = GPUShaderModuleBuilder
            .fromWGSL(vertexWGSL)
            .build(this.webGpu.device)
        /*const vertex = {
            data: Float32Array.from([
                // x, y, z三个一组，并无硬性规定，只要方便下方buffers使用即可
                0.0, 0.0, 0.0,
                0.5, 0.0, 0.0,
                0.0, 0.5, 0.0,
                0.0, 0.5, 0.0,
                0.5, 0.0, 0.0,
                0.5, 0.5, 0.0,
            ]),
            size: 6
        }*/
        // const triangleVertex = VertexBuilder.fromVex(Web3d.getTriangleVertex())
        const shadowModule = GPUShaderModuleBuilder
            .fromWGSL(shadowDepthWGSL)
            .build(this.webGpu.device)
        const normalArr = Web3d.getNormal()
        const uvArr = Web3d.getUV()
        const cubeVertex = VertexBuilder.fromVex(
            Web3d.getCubeVertex()
                .map((item, index) => ({
                    x: item.x,
                    y: item.y,
                    z: item.z,
                    j: normalArr[index].x,
                    K: normalArr[index].y,
                    l: normalArr[index].z,
                    u: uvArr[index % uvArr.length].u,
                    v: uvArr[index % uvArr.length].v,
                }))
        )
        const vertexBufferBuilder = GPUBufferBuilder.createForVertex(cubeVertex.data.byteLength)
        const vertexBuffer = vertexBufferBuilder.build(this.webGpu.device)
        // await vertexBuffer.mapAsync(GPUMapMode.WRITE)
        // const vertexBMap = new Float32Array(vertexBuffer.getMappedRange())
        // vertexBMap.set(vertex.data)
        // vertexBuffer.unmap()
        vertexBufferBuilder.write(this.webGpu.device, cubeVertex.data, vertexBuffer)

        const vertexIndex = Uint16Array.from(Web3d.getDrawIndex())
        const vertexIndexBufferBuilder = GPUBufferBuilder.createForVertexIndex(vertexIndex.byteLength)
        const vertexIndexBuffer = vertexIndexBufferBuilder.build(this.webGpu.device)
        vertexIndexBufferBuilder.write(this.webGpu.device, vertexIndex, vertexIndexBuffer)

        const vertexColors = Float32Array.from(Web3d.getVertexColors())
        const colorBufferBuilder = GPUBufferBuilder.createForVertex(vertexColors.byteLength)
        const vertexColorsBuffer = colorBufferBuilder.build(this.webGpu.device)
        colorBufferBuilder.write(this.webGpu.device, vertexColors, vertexColorsBuffer)

        const fragmentModule = GPUShaderModuleBuilder.fromWGSL(colorFragmentWGSL).build(this.webGpu.device)
        const locationIndexProxy = new IndexProxy()
        const position: GPUVertexAttribute = {
            shaderLocation: locationIndexProxy.next().value,
            offset: 0,
            format: "float32x3",
        }
        const normal: GPUVertexAttribute = {
            shaderLocation: locationIndexProxy.next().value,
            offset: 3 * 4,
            format: "float32x3"
        }
        const uv: GPUVertexAttribute = {
            shaderLocation: locationIndexProxy.next().value,
            offset: 6 * 4,
            format: "float32x2",
        }
        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 8 * 4, //  表示一组为3个值乘以（float32）4个字节的长度
            attributes: [position, normal, uv],
        }
        const colorsBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 3 * 4,
            attributes: [{
                shaderLocation: locationIndexProxy.next().value,
                offset: 0,
                format: "float32x3",
            }]
        }
        const primitive = GPUPrimitiveStateBuilder.create().build()
        const depthStencil = GPUDepthStencilStateBuilder.create().build()
        const depthTexture = GPUTextureBuilder.createForDepth(this.webGpu.canvas).build(this.webGpu.device)

        const shadowDepthTexture = GPUTextureBuilder.createForShadowDepth([2048, 2048]).build(this.webGpu.device)  //  注意size根据贴图大小而定
        this.shadowPipelineBuilder = GPURenderPipelineBuilder
            .create(
                GPUVertexStateBuilder
                    .create(
                        shadowModule,
                        [vertexBufferLayout]
                    )
                    .build(),
                undefined,
                undefined,
                primitive,
                depthStencil,
                undefined,
                "shadow pipeline"
            )
            .build(this.webGpu.device)

        const renderPipelineBuilder = GPURenderPipelineBuilder
            .create(
                //  指定顶点着色器
                GPUVertexStateBuilder
                    .create(
                        //  着色器文件
                        vertexModule,
                        [vertexBufferLayout, colorsBufferLayout]
                    )
                    .build(),
                //  指定片元着色器
                GPUFragmentStateBuilder.create([{
                    format: this.webGpu.format
                }], fragmentModule),
                //  布局，用于着色器中资源的绑定
                undefined,
                //  图元类型
                primitive,
                depthStencil,
                //  多重采样，用于抗锯齿
                /*{
                    count: 4
                },*/
            )
        this.renderPipelineBuilder = renderPipelineBuilder
        return {
            vert: {
                vertex: cubeVertex,
                index: vertexIndex,
                vertexBuffer,
                vertexIndexBuffer,
                vertexColorsBuffer
            },
            depthTexture,
            shadowDepthTexture
        }
    }

    //  创建纹理
    async initTexture() {
        const res = await fetch("/texture-1.jpg")
        const img = await res.blob()
        const bitmap = await createImageBitmap(img)
        const groupIndex = this.groupProxy.next().value
        const texture = GPUTextureBuilder.create([bitmap.width, bitmap.height]).buildWithImage(this.webGpu.device, bitmap)
        const sampler = GPUSamplerBuilder.create().build(this.webGpu.device)
        this.bindGroups.push({
            slot: groupIndex,
            entries: [
                texture.createView(),
                sampler,
            ],
        })
    }

    //  Uniform负责实现变形矩阵，bindGroup可以实现对顶点着色器和片元着色器传递值
    initUniform() {
        const colorsArray = Float32Array.from([Math.random(), Math.random(), Math.random()])
        const gpuBufferBuilder = GPUBufferBuilder.createForUniform(colorsArray.byteLength)
        const colorsBuffer = gpuBufferBuilder.build(this.webGpu.device)
        gpuBufferBuilder.write(this.webGpu.device, colorsArray, colorsBuffer)
        const fragmentGroupIndex = this.groupProxy.next().value
        this.bindGroups.push({
            slot: fragmentGroupIndex,
            entries: [{
                buffer: colorsBuffer
            }]
        })
    }

    setUniform(renderPass: GPURenderPassEncoder, pipeline: GPURenderPipeline, datas: BufferSource | SharedArrayBuffer | Array<BufferSource | SharedArrayBuffer>, groupIndex: number, indexProxy = new IndexProxy()) {
        if (!(datas instanceof Array)) {
            datas = [datas as BufferSource | SharedArrayBuffer]
        }
        const entries: Array<GPUBindGroupEntry> = []
        for (const data of datas as Array<BufferSource | SharedArrayBuffer>) {
            const bufferBuilder = GPUBufferBuilder.createForUniform(data.byteLength)
            const buffer = bufferBuilder.build(this.webGpu.device)
            bufferBuilder.write(this.webGpu.device, data, buffer)
            entries.push({
                binding: indexProxy.next().value,
                resource: {
                    buffer,
                },
            })
        }
        const bindGroupBuilder = new GPUBindGroupBuilder(
            pipeline.getBindGroupLayout(groupIndex),
            entries,
        )
        bindGroupBuilder.setToPass(renderPass, bindGroupBuilder.build(this.webGpu.device), groupIndex)
    }

    getMatrix(position: vec3, rotate: vec3, scale: vec3) {
        //  想要放置的实际位置
        const modelViewMatrix = mat4.create()
        mat4.translate(modelViewMatrix, modelViewMatrix, position)
        mat4.rotateX(modelViewMatrix, modelViewMatrix, rotate[0])
        mat4.rotateY(modelViewMatrix, modelViewMatrix, rotate[1])
        mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotate[2])
        mat4.scale(modelViewMatrix, modelViewMatrix, scale)
        const cameraProjectionMatrix = mat4.create()
        mat4.perspective(cameraProjectionMatrix, Math.PI / 2, this.webGpu.canvas.width / this.webGpu.canvas.height, 1, 100)
        // const mvpMatrix = mat4.create() as Float32Array
        // mat4.multiply(mvpMatrix, cameraProjectionMatrix, modelViewMatrix)
        return { modelViewMatrix, cameraProjectionMatrix }
    }

    drawTestMatrix(renderPass: GPURenderPassEncoder, pipeline: GPURenderPipeline, drawHandler: Function, groupIndex: number, angle: number, directionalArray: Float32Array | mat4) {
        //  状态1，绘制成第1个图形
        const mvpMatrix1 = this.getMatrix(
            vec3.fromValues(2.0, 1.5, -5.0),
            vec3.fromValues(angle, angle, 0),
            vec3.fromValues(1.0, 1.0, 1.0)
        )
        this.setUniform(renderPass, pipeline, [mvpMatrix1.modelViewMatrix, directionalArray, mvpMatrix1.cameraProjectionMatrix] as Array<Float32Array>, groupIndex)
        drawHandler()

        //  状态2，绘制成第2个图形
        const mvpMatrix2 = this.getMatrix(
            vec3.fromValues(-0.5, 0.0, -8.0),
            vec3.fromValues(angle * 1.7, Math.pow(angle * 1.3, 2), 0.1),
            vec3.fromValues(1.0, 1.0, 1.0)
        )
        this.setUniform(renderPass, pipeline, [mvpMatrix2.modelViewMatrix, directionalArray, mvpMatrix2.cameraProjectionMatrix] as Array<Float32Array>, groupIndex)
        drawHandler()

        //  状态3，绘制成第3个图形
        const mvpMatrix3 = this.getMatrix(
            vec3.fromValues(4.0, -1.5, -12.0),
            vec3.fromValues(Math.pow(angle * 2.1, 2), angle * 2.2, 0.05),
            vec3.fromValues(1.0, 1.0, 1.0)
        )
        this.setUniform(renderPass, pipeline, [mvpMatrix3.modelViewMatrix, directionalArray, mvpMatrix3.cameraProjectionMatrix] as Array<Float32Array>, groupIndex)
        drawHandler()
    }

    render(options: RenderOptions) {
        const web3d = this

        function loop() {
            //  创建渲染通道，可以添加命令编码，用于执行各种指令，独立于JS之外的线程
            const commandEncoder = web3d.webGpu.device.createCommandEncoder()
            const isPlus = Math.random() * 2 > 1 ? 1 : -1
            baseBg.r = baseBg.r + Math.random() * changeRedis * isPlus
            baseBg.r = baseBg.r > 0.5 ? 0.47 : baseBg.r
            baseBg.r = baseBg.r < 0.4 ? 0.43 : baseBg.r
            baseBg.g = baseBg.g + Math.random() * changeRedis * isPlus
            baseBg.g = baseBg.g > 0.5 ? 0.47 : baseBg.g
            baseBg.g = baseBg.g < 0.4 ? 0.43 : baseBg.g
            baseBg.b = baseBg.b + Math.random() * changeRedis * isPlus
            baseBg.b = baseBg.b > 0.5 ? 0.47 : baseBg.b
            baseBg.b = baseBg.b < 0.4 ? 0.43 : baseBg.b

            angle += 0.001
            const now = performance.now()
            ambientBufferBuilder.write(web3d.webGpu.device, ambientArray, ambientBuffer)
            pointArray[0] = 10 * Math.sin(now / 1000)
            pointArray[1] = 10 * Math.cos(now / 1000)
            pointArray[2] = -60 + 10 * Math.cos(now / 1000)
            pointBufferBuilder.write(web3d.webGpu.device, pointArray, pointBuffer)
            directionalArray[0] = Math.sin(now / 1500)
            directionalArray[2] = Math.cos(now / 1500)
            directionalBufferBuilder.write(web3d.webGpu.device, directionalArray, directionalBuffer)

            const shadowPass = GPURenderPassBuilder.createShadow(options.shadowDepthTextureView).build(commandEncoder)
            shadowPass.setPipeline(shadowPipeline)
            shadowPass.setVertexBuffer(0, options.vert.vertexBuffer)
            shadowPass.setIndexBuffer(options.vert.vertexIndexBuffer, "uint16")
            shadowPass.setVertexBuffer(1, options.vert.vertexColorsBuffer)
            for (const item of shadowBindGroups) {
                shadowPass.setBindGroup(item.slot, item.bindGroup)
            }
            web3d.drawTestMatrix(shadowPass, shadowPipeline, () => {
                //  开启绘制顶点就会报错group index 0没有设置，是否就算没有使用0也因为用了2所以必须设置？
                // shadowPass.drawIndexed(vert.index.length, 2, 0, 0, 0)
            }, mvpGroupIndex, angle, directProjectionMatrix as Float32Array)
            shadowPass.end()

            //  开启一个渲染通道（类似图层）
            const renderPass = new GPURenderPassBuilder(
                //  颜色附件数组
                [{
                    //  最终解析的纹理
                    view: options.textureView ?? web3d.webGpu.context.getCurrentTexture().createView(),
                    //  中途解析的纹理
                    // resolveTarget: context.getCurrentTexture().createView(),
                    clearValue: baseBg,
                    //  是否保留原有内容，这里表示清空
                    loadOp: "clear",
                    //  保存操作
                    storeOp: "store",
                }],
                {
                    view: options.depthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: "clear",
                    depthStoreOp: "store"
                }
            ).build(commandEncoder)
            //  设置渲染管线
            renderPass.setPipeline(renderPipeline)
            //  插入顶点值，slot对应buffers所在的index
            renderPass.setVertexBuffer(0, options.vert.vertexBuffer)
            renderPass.setIndexBuffer(options.vert.vertexIndexBuffer, "uint16")
            renderPass.setVertexBuffer(1, options.vert.vertexColorsBuffer)
            //  设置uniform
            for (const item of renderBindGroups) {
                renderPass.setBindGroup(item.slot, item.bindGroup)
            }
            lightGroupBuilder.setToPass(renderPass, lightGroup, lightGroupIndex)

            web3d.drawTestMatrix(renderPass, renderPipeline, () => {
                //  绘制三角形，根据wgsl定义好的顶点数
                // renderPass.draw(6, 1, 0, 0)
                //  绘制图形，根据js里自定义的vertex
                // renderPass.draw(vert.vertex.size)
                renderPass.drawIndexed(options.vert.index.length, 2, 0, 0, 0)
            }, mvpGroupIndex, angle, directProjectionMatrix as Float32Array)

            //  结束渲染通道
            renderPass.end()
            //  将定义好的一连串命令生成GPU缓冲区对象
            const cmdBuffer = commandEncoder.finish()
            //  提交命令
            web3d.webGpu.device.queue.submit([cmdBuffer])
            requestAnimationFrame(() => loop())
        }

        if (!web3d.shadowPipelineBuilder || !web3d.renderPipelineBuilder)
            return
        const shadowPipeline = web3d.shadowPipelineBuilder.build(web3d.webGpu.device).gpuRenderPipeline as GPURenderPipeline
        const renderPipeline = web3d.renderPipelineBuilder.build(web3d.webGpu.device).gpuRenderPipeline as GPURenderPipeline
        const shadowBindGroups: Array<{ slot: number; bindGroup: GPUBindGroup }> = []
        const renderBindGroups: Array<{ slot: number; bindGroup: GPUBindGroup }> = []
        for (const item of web3d.bindGroups) {
            if (shadowPipeline && item.slot === 2)
                shadowBindGroups.push({
                    slot: item.slot,
                    bindGroup: GPUBindGroupBuilder.create(
                        item.entries,
                        shadowPipeline.getBindGroupLayout(item.slot),
                        undefined,
                        "circle shadow bind group",
                    ).build(this.webGpu.device)
                })
            renderBindGroups.push({
                slot: item.slot,
                bindGroup: GPUBindGroupBuilder.create(
                    item.entries,
                    renderPipeline.getBindGroupLayout(item.slot),
                    undefined,
                    "circle render bind group",
                ).build(this.webGpu.device)
            })
        }

        const mvpGroupIndex = this.groupProxy.next().value
        const lightGroupIndex = this.groupProxy.next().value

        // console.log(Web3d.getCircleVertex().length / 8)
        const num = 500
        const changeRedis = 0.001
        const baseBg: GPUColorDict = {
            r: 0.0,
            g: 0.0,
            // b: 0.5,
            // b: Math.random() * 0.1,
            b: 0.0,
            a: 1.0,
        }
        let angle = 0.5

        const ambientArray = Float32Array.from([0, 1])
        const ambientBufferBuilder = GPUBufferBuilder.createForUniform(ambientArray.byteLength)
        const ambientBuffer = ambientBufferBuilder.build(this.webGpu.device)
        const pointArray = new Float32Array(8)
        pointArray[2] = -50 //  z
        pointArray[4] = 1   // intensity
        pointArray[5] = 20  // radius
        const pointBufferBuilder = GPUBufferBuilder.createForUniform(pointArray.byteLength)
        const pointBuffer = pointBufferBuilder.build(this.webGpu.device)

        const directionalArray = new Float32Array(8)
        directionalArray[4] = 0.5   //   intensity

        function changeDirectLight(now: number) {
            directPosition[0] = Math.sin((now / 1500)) * 50
            directPosition[2] = Math.cos(now / 1500) * 50
            mat4.lookAt(directViewMatrix, directPosition, origin, up)
            //  生成正交矩阵，符合直射光平行照射下的正交投影计算，参数是用于生成包裹所有物品的矩形空间
            mat4.ortho(directViewMatrix, -40, 40, -40, 40, -50, 200)
            mat4.multiply(directProjectionMatrix, directProjectionMatrix, directViewMatrix)
        }

        const directViewMatrix = mat4.create()
        const directProjectionMatrix = mat4.create()
        const directPosition = vec3.fromValues(0, 100, 0)
        const up = vec3.fromValues(0, 1, 0)
        const origin = vec3.fromValues(0, 0, 0)
        // changeLight(now)
        const dirBufferBuilder = GPUBufferBuilder.createForUniform((directViewMatrix as Float32Array).byteLength)
        const dirBuffer = dirBufferBuilder.build(web3d.webGpu.device)
        dirBufferBuilder.write(web3d.webGpu.device, directViewMatrix as Float32Array, dirBuffer)

        const directionalBufferBuilder = GPUBufferBuilder.createForUniform(directionalArray.byteLength)
        const directionalBuffer = directionalBufferBuilder.build(this.webGpu.device)

        const lightGroupBuilder = new GPUBindGroupBuilder(
            renderPipeline.getBindGroupLayout(lightGroupIndex),
            [{
                binding: this.groupProxy.nextBinding().value,
                resource: {
                    buffer: ambientBuffer
                }
            }, {
                binding: this.groupProxy.nextBinding().value,
                resource: {
                    buffer: pointBuffer
                }
            }, {
                binding: this.groupProxy.nextBinding().value,
                resource: {
                    buffer: directionalBuffer
                }
            }, {
                binding: this.groupProxy.nextBinding().value,
                resource: options.shadowDepthTextureView
            }, {
                binding: this.groupProxy.nextBinding().value,
                resource: GPUSamplerBuilder.createShadow().build(this.webGpu.device)
            }],
            "GPU binding group for light"
        )
        const lightGroup = lightGroupBuilder.build(this.webGpu.device)

        loop()
    }
}

function NewWorld() {
    const canvasRef = createRef<HTMLCanvasElement>()
    useEffect(() => {
        function dispose() {
            if (timer)
                clearTimeout(timer)
        }

        if (!canvasRef?.current)
            return
        let timer = setTimeout(async (canvas: HTMLCanvasElement) => {
            try {
                const web3d = await Web3d.create(canvas)
                await web3d.init()
            } catch (err) {
                console.log(`creating gpu error: ${err}`)
            }
        }, 300, canvasRef.current)
        return dispose
    }, [])
    return (
        <canvas ref={canvasRef} width="800" height="600" className={style.newWorld} />
    )
}

export default memo(NewWorld, () => true)
