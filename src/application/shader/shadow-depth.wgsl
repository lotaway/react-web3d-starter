//  wgsl着色器
//  顶点着色器主函数
/*@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    //  内部设置三角形顶点坐标
    var pos = array<vec2<f32>, 6>(
        vec2(0.0, 0.5),
        vec2(-0.5, -0.5),
        vec2(0.5, -0.5),
        vec2(0.0, 0.5),
        vec2(-0.5, -0.5),
        vec2(-1.0, 1.0),
    );
    return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
}*/

@group(2) @binding(0) var<uniform> modelView: mat4x4<f32>;
@group(2) @binding(1) var<uniform> lightProjection: mat4x4<f32>;
@group(2) @binding(2) var<uniform> cameraProjection: mat4x4<f32>;

struct Input {
    //  获取当前请求的实例索引
    @builtin(instance_index) instanceIndex : u32,
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

@vertex
fn main(input: Input) -> @builtin(position) vec4<f32> {
    let _cameraProjection = cameraProjection;
//    let modelView = modelViews[input.instanceIndex];
    let pos = vec4(input.position, 1.0);
    return lightProjection * modelView * pos;
}