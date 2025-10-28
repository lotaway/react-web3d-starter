import {mat4, vec2, vec3, vec4} from "gl-matrix"

export namespace ThreeGPU {

    type GPUId = string

    export type CreateGPUParams = GPUId | HTMLCanvasElement

    export interface CanvasRes<T extends RenderingContext | GPUCanvasContext = RenderingContext | GPUCanvasContext> {
        canvas: HTMLCanvasElement
        context: T
    }

    export type TypedArray =
        Int16ArrayConstructor
        | Int32ArrayConstructor
        | Float32ArrayConstructor
        | Float64ArrayConstructor

    export interface Vertex<DataType = TypedArray> {
        data: DataType,
        size: number
    }
}

export interface ToArray<T> {
    toArray(): Array<T>
}

export interface Vec {
    x: number
}

export interface Vec2 extends Vec {
    y: number
}

export interface Vec3 extends Vec2 {
    z: number
    // get xy(): Vec2
}

export interface Vec4 extends Vec3 {
    w: number
    // get xyz(): Vec3
}

export interface WebGPUOptions {
    canvas: HTMLCanvasElement
    context: GPUCanvasContext
    shaderLocation?: number
    adapter: GPUAdapter
    device: GPUDevice
    format: GPUTextureFormat
}

export class WebGPUOptionsWrapper implements WebGPUOptions {
    adapter: GPUAdapter
    canvas: HTMLCanvasElement
    context: GPUCanvasContext
    device: GPUDevice
    format: GPUTextureFormat

    constructor(options: WebGPUOptions) {
        this.adapter = options.adapter
        this.canvas = options.canvas
        this.context = options.context
        this.device = options.device
        this.format = options.format
    }

    static async create(_targetCanvas: ThreeGPU.CreateGPUParams) {
        if (!navigator?.gpu)
            throw new Error("No gpu found.")
        //  获取最合适的GPU
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter)
            throw new Error("No gpu adapter.")
        // adapter.features:array
        // adapter.limits:object
        //  获取设备并请求分配一定资源
        const device = await adapter.requestDevice({
            requiredFeatures: ["texture-compression-bc"],
            requiredLimits: {
                maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize
            }
        })
        const {canvas, context} = WebGPUBuilder.getCanvas<GPUCanvasContext>(_targetCanvas)
        //  自行指定
        // const format = "rgba8unorm"
        //  根据显卡支持的格式里选最佳的
        const format = navigator.gpu.getPreferredCanvasFormat()
        const size = [canvas.clientWidth * window.devicePixelRatio, canvas.clientHeight * window.devicePixelRatio]
        const configure: GPUCanvasConfiguration = {
            device,
            //  绘制画布的格式，可手动定义，这里是使用自动获取最佳格式
            format,
            // size,
            //  设置不透明
            alphaMode: "opaque",
            // compositingAlphaMode: "opaque"
        }
        //  配置上下文
        context.configure(configure)
        return new WebGPUOptionsWrapper({
            adapter,
            canvas,
            context,
            device,
            format,
        })
    }
}

export class WebGPUBuilder {
    canvas: HTMLCanvasElement
    context: GPUCanvasContext
    adapter: GPUAdapter
    device: GPUDevice
    format: GPUTextureFormat
    private _shaderLocation: number

    constructor(options: WebGPUOptions) {
        this.canvas = options.canvas
        this.context = options.context
        this.adapter = options.adapter
        this.device = options.device
        this.format = options.format
        this._shaderLocation = options.shaderLocation ?? 0
    }

    static async create(_targetCanvas: ThreeGPU.CreateGPUParams) {
        const {adapter, device, format, canvas, context} = await WebGPUOptionsWrapper.create(_targetCanvas)
        return new WebGPUBuilder({
            adapter,
            device,
            format,
            canvas,
            context
        })
    }

    static getCanvas<T extends ThreeGPU.CanvasRes["context"]>(_targetCanvas: Readonly<ThreeGPU.CreateGPUParams>, contextId: string = "webgpu"): ThreeGPU.CanvasRes<T> {
        let canvas
        if (typeof _targetCanvas === "string")
            canvas = document.getElementById(_targetCanvas) as HTMLCanvasElement
        else
            canvas = _targetCanvas as HTMLCanvasElement
        if (!canvas)
            throw new Error("No canvas found.")
        const context = canvas.getContext(contextId) as T
        if (!context)
            throw new Error(`No canvas ${contextId}} context`)
        return {canvas, context}
    }

    get shaderLocation() {
        return {
            next: () => {
                this._shaderLocation++
                return this
            },
            value: this._shaderLocation
        }
    }
}

export class GPUVertexBufferLayoutBuilder implements GPUVertexBufferLayout {
    constructor(
        readonly arrayStride: number,
        readonly attributes: Iterable<GPUVertexAttribute>,
        readonly stepMode?: GPUVertexStepMode | undefined,
    ) {
    }

}

export class GPUFragmentStateBuilder implements GPUFragmentState {
    constructor(
        readonly targets: Iterable<GPUColorTargetState | null>,
        readonly module: GPUShaderModule,
        readonly entryPoint: string,
        readonly constants?: Record<string, number> | undefined,
    ) {

    }

    static create(targets: Iterable<GPUColorTargetState | null>,
                  //  着色器文件
                  module: GPUShaderModule, entryPoint: string = "main", constants?: Record<string, number> | undefined) {
        return new GPUFragmentStateBuilder(targets, module, entryPoint, constants)
    }
}

export class GPUPrimitiveStateBuilder implements GPUPrimitiveState {
    constructor(
        // 指定是三角形
        readonly topology: GPUPrimitiveTopology,
        readonly stripIndexFormat?: GPUIndexFormat | undefined,
        readonly frontFace?: GPUFrontFace | undefined,
        readonly cullMode?: GPUCullMode | undefined,
        readonly unclippedDepth?: boolean | undefined,
    ) {
    }

    static create(topology: GPUPrimitiveTopology = "triangle-list") {
        return new GPUPrimitiveStateBuilder(topology, undefined, undefined, /*"back"*/)
    }

    build() {
        return this as GPUPrimitiveState
    }

}

export class GPUDepthStencilStateBuilder implements GPUDepthStencilState {
    constructor(
        readonly format: GPUTextureFormat,
        readonly depthWriteEnabled: boolean,
        readonly depthCompare: GPUCompareFunction,
        readonly stencilFront?: GPUStencilFaceState | undefined,
        readonly stencilBack?: GPUStencilFaceState | undefined,
        readonly stencilReadMask?: number | undefined,
        readonly stencilWriteMask?: number | undefined,
        readonly depthBias?: number | undefined,
        readonly depthBiasSlopeScale?: number | undefined,
        readonly depthBiasClamp?: number | undefined,
    ) {
    }

    static create() {
        return new GPUDepthStencilStateBuilder("depth32float", true, "less")
    }

    build() {
        return this as GPUDepthStencilState
    }
}

export class IndexProxy {
    private currentValue: number | undefined
    private startValue: number

    constructor(initialValue: number = 0) {
        this.startValue = initialValue
    }

    get value(): number {
        if (this.currentValue === undefined)
            throw new Error("value is not initial! Please call next before get value!")
        return this.currentValue
    }

    next(): IndexProxy {
        this.currentValue = this.currentValue === undefined ? this.startValue : this.currentValue + 1
        return this
    }
}

export class BindGroupProxy extends IndexProxy {
    private groupProxies: Array<IndexProxy>

    constructor() {
        super()
        this.groupProxies = [new IndexProxy()]
    }

    get groupIndex() {
        return this.value
    }

    get group() {
        return this.groupProxies[this.value]
    }

    get binding() {
        return this.group.value
    }

    next(): BindGroupProxy {
        this.groupProxies.push(new IndexProxy())
        super.next()
        return this
    }

    nextGroup() {
        this.next()
        return this.group
    }

    nextBinding() {
        return this.group.next()
    }
}

export class GPUSamplerBuilder implements GPUSamplerDescriptor {
    constructor(
        readonly magFilter?: GPUFilterMode,
        readonly minFilter?: GPUFilterMode,
        readonly addressModeU?: GPUAddressMode,
        readonly addressModeV?: GPUAddressMode,
        readonly compare?: GPUCompareFunction
    ) {
    }

    static create() {
        return new GPUSamplerBuilder("linear", "linear")
    }

    static createShadow() {
        return new GPUSamplerBuilder(undefined, undefined, undefined, undefined, "less")
    }

    build(device: GPUDevice) {
        return device.createSampler(this)
    }
}

export class GPUTextureBuilder implements GPUTextureDescriptor {

    constructor(
        readonly size: GPUExtent3DStrict,
        readonly format: GPUTextureFormat,
        readonly usage: number,
        readonly mipLevelCount?: number | undefined,
        readonly sampleCount?: number | undefined,
        readonly dimension?: GPUTextureDimension | undefined,
        readonly viewFormats?: Iterable<GPUTextureFormat> | undefined,
        readonly label?: string | undefined,
    ) {
    }

    static create(size: GPUExtent3DStrict, sampleCount?: number) {
        return new GPUTextureBuilder(
            size,
            "rgba8unorm",
            GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
            undefined,
            sampleCount
        )
    }

    static createForDepth(size: GPUExtent3DStrict, format: GPUTextureFormat = "depth32float") {
        return new GPUTextureBuilder(size, format, GPUTextureUsage.RENDER_ATTACHMENT)
    }

    static createForShadowDepth(size: GPUExtent3DStrict, format: GPUTextureFormat = "depth32float") {
        return new GPUTextureBuilder(size, format, GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING)
    }

    build(device: GPUDevice) {
        return device.createTexture(this)
    }

    buildWithImage(device: GPUDevice, source: GPUImageCopyExternalImageSource) {
        const texture = this.build(device)
        device.queue.copyExternalImageToTexture({
            source
        }, {
            texture
        }, this.size)
        return texture
    }

    createView(device: GPUDevice) {
        return device.createTexture(this).createView()
    }

}

export class GPUBindGroupLayoutEntryBuilder implements GPUBindGroupLayoutEntry {
    constructor(
        readonly binding: number,
        readonly visibility: number,
        readonly buffer?: GPUBufferBindingLayout | undefined,
        readonly sampler?: GPUSamplerBindingLayout | undefined,
        readonly texture?: GPUTextureBindingLayout | undefined,
        readonly storageTexture?: GPUStorageTextureBindingLayout | undefined,
        readonly externalTexture?: GPUExternalTextureBindingLayout | undefined,
    ) {

    }

    static create(binding: number = 0, visibility: number = GPUShaderStage.VERTEX) {
        GPUShaderStage.VERTEX
        return new GPUBindGroupLayoutEntryBuilder(
            binding,
            visibility,
            {
                type: 'uniform',
                hasDynamicOffset: true,
                minBindingSize: 0
            })
    }
}

// https://blog.csdn.net/m0_51146371/article/details/126943884?spm=1001.2014.3001.5502
export class GPUBindGroupLayoutBuilder implements GPUBindGroupLayoutDescriptor {
    constructor(
        readonly entries: Iterable<GPUBindGroupLayoutEntry>,
        readonly label?: string | undefined
    ) {
    }

    static create() {
        return new GPUBindGroupLayoutBuilder(Array.of(GPUBindGroupLayoutEntryBuilder.create()))
    }

    build(device: GPUDevice) {
        return device.createBindGroupLayout(this)
    }
}

export class GPUBindGroupEntryBuilder implements GPUBindGroupEntry {
    constructor(
        readonly resource: GPUBindingResource,
        readonly binding: number = 0,
    ) {
    }

    build() {
        return this as GPUBindGroupEntry
    }
}

export class GPUBindGroupEntriesBuilder {

    constructor(private list: Array<GPUBindingResource> = []) {
        this.list = list
    }

    static create() {
        return new GPUBindGroupEntriesBuilder()
    }

    push(item: GPUBindingResource) {
        this.list.push(item)
    }

    get entries() {
        return this.list
    }

    build(layout: GPUBindGroupLayout) {
        return GPUBindGroupBuilder.create(this.list, layout)
    }
}

export class GPUBindGroupBuilder implements GPUBindGroupDescriptor {
    constructor(
        readonly layout: GPUBindGroupLayout,
        readonly entries: Iterable<GPUBindGroupEntry>,
        readonly label?: string | undefined,
    ) {
    }

    static create(resources: Iterable<GPUBindingResource>, layout: GPUBindGroupLayout, bindingProxy?: BindGroupProxy, label: string | undefined = "gpu bind group") {
        if (!bindingProxy)
            bindingProxy = new BindGroupProxy().next()
        const entries: Array<GPUBindGroupEntry> = []
        for (const resource of resources) {
            entries.push({
                binding: bindingProxy.nextBinding().value,
                resource
            })
        }
        return new GPUBindGroupBuilder(layout, entries, label)
    }

    build(device: GPUDevice) {
        return device.createBindGroup(this)
    }

    setToPass(renderPass: GPURenderPassEncoder, bindGroup: GPUBindGroup, groupIndex: number = 0) {
        return renderPass.setBindGroup(groupIndex, bindGroup)
    }
}

export class GPUPipelineLayoutBuilder implements GPUPipelineLayoutDescriptor {
    constructor(
        readonly bindGroupLayouts: Iterable<GPUBindGroupLayout>,
        readonly label?: string | undefined
    ) {
    }

    static create(layout: GPUBindGroupLayout) {
        return new GPUPipelineLayoutBuilder([layout])
    }

    build(device: GPUDevice) {
        return device.createPipelineLayout(this)
    }
}

export class GPUImpl implements GPU {
    __brand: "GPU"
    wgslLanguageFeatures: WGSLLanguageFeatures
    _requestAdapter: (options?: GPURequestAdapterOptions) => Promise<GPUAdapter | null>
    _getPreferredCanvasFormat: () => GPUTextureFormat

    constructor(gpu: GPU) {
        this.__brand = gpu.__brand
        this.wgslLanguageFeatures = gpu.wgslLanguageFeatures
        this._requestAdapter = gpu.requestAdapter
        this._getPreferredCanvasFormat = gpu.getPreferredCanvasFormat
    }

    static fromBrowser() {
        return new GPUImpl(window.navigator.gpu)
    }

    getPreferredCanvasFormat(): GPUTextureFormat {
        return this._getPreferredCanvasFormat()
    }

    async requestAdapter(options?: GPURequestAdapterOptions) {
        return await this._requestAdapter(options)
    }
}

export class GPUBufferBuilder implements GPUBufferDescriptor {
    constructor(
        readonly size: number,
        public usage: number,
        readonly mappedAtCreation?: boolean | undefined,
        readonly label?: string | undefined
    ) {
    }

    static create(size: number, usage: number, options?: {
        mappedAtCreation?: boolean | undefined,
        label?: string | undefined
    }) {
        return new GPUBufferBuilder(size, usage, options?.mappedAtCreation, options?.label)
    }

    static createForVertex(size: number) {
        return GPUBufferBuilder.create(size, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, {
            label: "GPUBuffer for vertex"
        })
    }

    static createForVertexIndex(size: number, label: string = "GPUBuffer for vertex index") {
        return GPUBufferBuilder.create(size, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, {
            label
        })
    }

    static createForUniform(size: number, label: string = "GPUBuffer for uniform") {
        return GPUBufferBuilder.create(size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, {
            label
        })
    }

    static createStorage(size: number, label: string = "GPUBuffer for storage") {
        return GPUBufferBuilder.create(
            size,
            GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            {
                label
            }
        )
    }

    static createRead(size: number, label: string = "GPUBuffer for read") {
        return GPUBufferBuilder.create(
            size,
            GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            {
                label
            }
        )
    }

    from(descriptor: GPUBufferDescriptor) {
        return new GPUBufferBuilder(descriptor.size, descriptor.usage, descriptor.mappedAtCreation, descriptor.label)
    }

    copy(commandEncoder: GPUCommandEncoder, sourceBuffer: GPUBuffer, destBuffer: GPUBuffer, size: number) {
        return commandEncoder.copyBufferToBuffer(sourceBuffer, 0, destBuffer, 0, size)
    }

    async shareToCPU(buffer: GPUBuffer) {
        //  获得可被CPU操作的内存片段
        await buffer.mapAsync(GPUMapMode.READ)
        //  将内存片段映射到CPU，这里是js环境因此呈现出来的是ArrayBuffer对象
        const copyBuffer = buffer.getMappedRange()
        return new Float32Array(copyBuffer)
    }

    build(device: GPUDevice) {
        return device.createBuffer(this)
    }

    write(device: GPUDevice, array: BufferSource | SharedArrayBuffer, buffer?: GPUBuffer) {
        device.queue.writeBuffer(buffer ?? this.build(device), 0, array)
        return this
    }
}

export class GPUColorIterator implements Iterator<number, null> {
    readonly list: ArrayLike<number>
    index: number = -1

    constructor(readonly color: GPUColorDict) {
        this.list = [color.r, color.g, color.b, color.a]
        if (this.list.length)
            this.index = 0
    }

    get isDone() {
        return this.index == this.list.length - 1
    }

    next(...args: [] | [undefined]): IteratorResult<number, any> {
        const done = this.isDone
        if (done) {
            return this.return(null)
        }
        return {
            done,
            value: this.list[this.index++]
        }
    }

    return(value: null): IteratorResult<number, null> {
        return {
            done: true,
            value
        }
    }

}

export class GPUColorDircWrapper implements GPUColorDict, Iterable<number> {
    constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
        public readonly a: number = 1.0,
    ) {

    }

    static create() {
        return this.createWhite()
    }

    static createBlack() {
        return new GPUColorDircWrapper(0.0, 0.0, 0.0)
    }

    static createWhite() {
        return new GPUColorDircWrapper(1.0, 1.0, 1.0)
    }

    [Symbol.iterator](): Iterator<number> {
        return new GPUColorIterator(this);
    }

    toList = () => [this.r, this.g, this.b, this.a]
}

export class VecIterator implements Iterator<number> {

    readonly vecs: Array<number>
    protected index = 0

    constructor(items: Array<number>) {
        this.vecs = items
    }

    get isEnd() {
        return this.vecs.length - 1 <= this.index
    }

    next(...args: [] | [undefined]): IteratorResult<number, any> {
        if (this.isEnd)
            return this.return(null)
        return {
            done: false,
            value: this.vecs[this.index++]
        }
    }

    return(value?: any): IteratorResult<number, any> {
        return {
            done: true,
            value: null
        };
    }

}

export class VecBuilder {

}

export class Vec2Builder extends VecBuilder implements Vec2, ToArray<number>, Iterable<number> {
    x: number
    y: number

    constructor(options: {
        x: number,
        y: number
    }) {
        super()
        this.x = options.x
        this.y = options.y
    }

    static create() {
        return new Vec2Builder({x: 0, y: 0})
    }

    [Symbol.iterator](): Iterator<number> {
        return new VecIterator(this.toArray());
    }

    fromArray(arr: Iterable<number>) {
        const selfArr = this.toArray()
        for (const num of arr) {
            if (selfArr.length == 0)
                break
            selfArr[0] = num
            selfArr.shift()
        }
    }

    toArray(): Array<number> {
        return [this.x, this.y]
    }

    toVec(): vec2 {
        return this.toArray() as vec2
    }
}

export class Vec3Builder extends VecBuilder implements Vec3, ToArray<number>, Iterable<number> {
    x: number
    y: number
    z: number

    constructor(options: {
        x: number,
        y: number,
        z: number
    }) {
        super()
        this.x = options.x
        this.y = options.y
        this.z = options.z
    }

    // get xy => this.proxy.xy

    static create() {
        return new Vec3Builder({x: 0, y: 0, z: 0})
    }

    get xy(): vec2 {
        return [this.x, this.y]
    }

    [Symbol.iterator](): Iterator<number> {
        return new VecIterator(this.toArray());
    }

    fromArray(arr: Iterable<number>) {
        const selfArr = this.toArray()
        for (const num of arr) {
            if (selfArr.length == 0)
                break
            selfArr[0] = num
            selfArr.shift()
        }
    }

    toArray(): Array<number> {
        return [this.x, this.y, this.z]
    }

    toVec(): vec3 {
        return this.toArray() as vec3
    }
}

export class Vec4Builder extends VecBuilder implements Vec4, ToArray<number>, Iterable<number> {
    x: number
    y: number
    z: number
    w: number

    constructor(options: {
        x: number,
        y: number,
        z: number,
        w: number
    }) {
        super()
        this.x = options.x
        this.y = options.y
        this.z = options.z
        this.w = options.w
    }

    static create() {
        return new Vec4Builder({x: 0, y: 0, z: 0, w: 0})
    }

    get xyz() {
        return [this.x, this.y, this.z]
    }

    [Symbol.iterator](): Iterator<number> {
        return new VecIterator(this.toArray());
    }

    fromArray(arr: Iterable<number>) {
        const selfArr = this.toArray()
        for (const num of arr) {
            if (selfArr.length == 0)
                break
            selfArr[0] = num
            selfArr.shift()
        }
    }

    toArray(): Array<number> {
        return [this.x, this.y, this.z]
    }

    toVec(): vec3 {
        return this.toArray() as vec3
    }
}

export class VertexBuilder<DataType = ThreeGPU.TypedArray> implements ThreeGPU.Vertex<DataType> {

    constructor(
        readonly data: DataType,
        readonly size: number
    ) {

    }

    static fromVex<DataType = Float32Array>(vexs: Iterable<object>, _TypedArray: ThreeGPU.TypedArray = Float32Array): ThreeGPU.Vertex<DataType> {
        let arr: Array<number> = []
        let size = 0
        for (let v of vexs) {
            arr.push(...Object.values(v))
            size++
        }
        return new VertexBuilder<DataType>(
            _TypedArray.from(arr) as DataType,
            size,
        )
    }

}

export class GPUShaderModuleDescriptorBuilder implements GPUShaderModuleDescriptor {
    constructor(
        readonly code: string,
        readonly sourceMap?: object | undefined,
        readonly hints?: Record<string, GPUShaderModuleCompilationHint> | undefined,
        readonly label?: string | undefined,
    ) {

    }
}

export class GPUShaderModuleBuilder {

    protected device?: GPUDevice

    constructor(protected readonly descriptor: GPUShaderModuleDescriptor) {

    }

    static fromWGSL(code: string): GPUShaderModuleBuilder {
        return new GPUShaderModuleBuilder({
            code
        })
    }

    static buildModule(device: GPUDevice, code: GPUShaderModuleDescriptor["code"]): GPUShaderModule {
        return GPUShaderModuleBuilder.fromWGSL(code).build(device)
    }

    getDescriptor(): GPUShaderModuleDescriptor {
        return this.descriptor
    }

    build(device: GPUDevice): GPUShaderModule {
        return device.createShaderModule(this.getDescriptor())
    }
}

export class GPUVertexStateBuilder implements GPUVertexState {
    constructor(
        readonly module: GPUShaderModule,
        readonly entryPoint: string,
        readonly buffers?: Iterable<GPUVertexBufferLayout | null> | undefined,
        readonly constants?: Record<string, number> | undefined
    ) {
    }

    static create(module: GPUShaderModule, buffers?: Iterable<GPUVertexBufferLayout | null> | undefined, entryPoint: string = "main") {
        return new GPUVertexStateBuilder(module, entryPoint, buffers)
    }

    build() {
        return this as GPUVertexState
    }
}

export class GPUComputePipelineBuilder implements GPUComputePipeline {
    constructor(
        readonly __brand: "GPUComputePipeline",
        readonly label: string,
    ) {
    }

    getBindGroupLayout(index: number): GPUBindGroupLayout {
        throw new Error("Method not implemented.")
    }
}

export class GPURenderPipelineBuilder implements GPURenderPipelineDescriptor {

    private _gpuRenderPipeline: GPURenderPipeline | undefined
    private bindGroupProxy: BindGroupProxy

    constructor(
        readonly vertex: GPUVertexState,
        readonly layout: "auto" | GPUPipelineLayout,
        readonly fragment?: GPUFragmentState | undefined,
        readonly primitive?: GPUPrimitiveState | undefined,
        readonly depthStencil?: GPUDepthStencilState | undefined,
        readonly multisample?: GPUMultisampleState | undefined,
        readonly label?: string | undefined,
    ) {
        this.bindGroupProxy = new BindGroupProxy()
    }

    get gpuRenderPipeline() {
        return this._gpuRenderPipeline
    }

    get nextGroup() {
        return this.bindGroupProxy.nextGroup()
    }

    get nextBinding() {
        return this.bindGroupProxy.nextBinding()
    }

    static create(vertex: GPUVertexState, fragment?: GPUFragmentState | undefined, layout: "auto" | GPUPipelineLayout = "auto", primitive?: GPUPrimitiveState | undefined, depthStencil?: GPUDepthStencilState | undefined, multisample?: GPUMultisampleState | undefined, label: string = "render pipeline") {
        return new GPURenderPipelineBuilder(vertex, layout, fragment, primitive, depthStencil, multisample, label)
    }

    build(device: GPUDevice) {
        this._gpuRenderPipeline = device.createRenderPipeline(this)
        return this
    }
}

export class GPURenderPassBuilder implements GPURenderPassDescriptor {
    constructor(
        readonly colorAttachments: Iterable<GPURenderPassColorAttachment | null>,
        readonly depthStencilAttachment?: GPURenderPassDepthStencilAttachment | undefined,
        readonly occlusionQuerySet?: GPUQuerySet | undefined,
        readonly timestampWrites?: GPURenderPassTimestampWrites | undefined,
        readonly maxDrawCount?: number | undefined,
        readonly label?: string | undefined,
    ) {
    }

    /*static create(view: GPUTextureView, depthView: GPUTextureView, depthClearValue: number = 1.0, depthLoadOp: GPULoadOp = "clear", depthStoreOp: GPUStoreOp = "store") {
        return new GPURenderPassBuilder([{
            view,
            clearValue,
        }], {
            view: depthView,
            depthClearValue,
            depthLoadOp,
            depthStoreOp,
        })
    }*/

    static createShadow(view: GPUTextureView, depthClearValue: number = 1.0, depthLoadOp: GPULoadOp = "clear", depthStoreOp: GPUStoreOp = "store") {
        return new GPURenderPassBuilder([], {
            view,
            depthClearValue,
            depthLoadOp,
            depthStoreOp,
        })
    }

    build(encoder: GPUCommandEncoder) {
        return encoder.beginRenderPass(this)
    }
}

function testMatrix() {

    //  创建平移矩阵
    const m4 = mat4.create()
    const m4t = mat4.create()
    //  指定x轴平移2
    mat4.translate(m4, m4t, [2, 0, 0])
    //  创建缩放矩阵
    const m4s = mat4.create()
    //  指定x轴放大10倍
    mat4.scale(m4, m4s, [10, 1, 1])
    //  模型矩阵用于执行前面的先平移后缩放的矩阵乘法
    const model = mat4.create()
    //  以下由于矩阵乘法的特性实际先后顺序是倒过来的
    mat4.multiply(model, model, m4s)    //  后缩放
    mat4.multiply(model, model, m4t)    //  先平移

    // 以上代码的简化写法
    const model2 = mat4.create()
    mat4.scale(model2, model2, [10, 1, 0])
    mat4.translate(model2, model2, [2, 0, 0])

    //  创建两个顶点
    const p1 = vec3.fromValues(2, 0, 0)
    const p2 = vec3.create()
    //  对p1使用model/model2矩阵变换，并将结果存储在p2，相当于对顶点p1执行先平移后缩放的动作
    vec3.transformMat4(p2, p1, model2)
}