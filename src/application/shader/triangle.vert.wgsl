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
//@group(0) @binding(0) var<uniform> colors: array<vec4<f32>>;
@group(2) @binding(0) var<uniform> modelView: mat4x4<f32>;
@group(2) @binding(1) var<uniform> lightProjection: mat4x4<f32>;
@group(2) @binding(2) var<uniform> cameraProjection: mat4x4<f32>;

struct Input {
    //  内置变量，顶点索引值
//    @builtin(vertex_index) vertexINdex: u32,
    //  内置变量，物体的索引值
    @builtin(instance_index) instanceIndex: u32,
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) colors: vec3<f32>,
}

struct Out {
    @builtin(position) v_pos: vec4<f32>,
    @location(0) f_pos: vec3<f32>,
    @location(1) f_normal: vec3<f32>,
    @location(2) f_uv: vec2<f32>,
    @location(3) shadow_pos: vec3<f32>,
    @location(4) v_colors: vec3<f32>,
}

@vertex
fn main(input: Input) -> Out {
//    let modelView = modelViews[input.instanceIndex];
    let pos = vec4<f32>(input.position, 1.0);

    var out: Out;
    out.v_pos = cameraProjection * modelView * pos;
    out.f_pos = (modelView * pos).xyz;  //  只需要真实坐标，不需要摄像机显示位置，因此不需要乘以cameraProjection
    out.f_normal = (modelView * vec4<f32>(input.normal, 0.0)).xyz;
    out.f_uv = input.uv;
//    out.v_colors = colors[instance_index];
    out.v_colors = input.colors;

    let pos_from_light = lightProjection * modelView * pos;
    out.shadow_pos = vec3<f32>(pos_from_light.xy * vec2<f32>(0.5, -0.5), pos_from_light.z);
//    var m4s = default_m4s();
//    var m4t = default_m4t();
    return out;
}

fn matrix_create() -> mat4x4<f32> {
    return mat4x4<f32>(
        1.0,0.0,0.0,0.0,
        0.0,1.0,0.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0,
    );
}

fn default_m4s() -> mat4x4<f32> {
    return mat4x4<f32>(
        0.5,0.0,0.0,0.0,
        0.0,0.5,0.0,0.0,
        0.0,0.0,0.5,0.0,
        0.0,0.0,0.0,1.0,
    );
}

fn default_m4t() -> mat4x4<f32> {
    return mat4x4<f32>(
        1.0,0.0,0.0,-0.5,
        0.0,1.0,0.0,-0.5,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0,
    );
}