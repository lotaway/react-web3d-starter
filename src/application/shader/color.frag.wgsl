//  片元着色器
@group(0) @binding(0) var<uniform> colors: vec3<f32>;
@group(1) @binding(0) var text: texture_2d<f32>;
@group(1) @binding(1) var sam: sampler;
@group(3) @binding(0) var<uniform> ambientIntensity: f32;
@group(3) @binding(1) var<uniform> pointLight: array<vec4<f32>, 2>;
@group(3) @binding(2) var<uniform> directionLight: array<vec4<f32>, 2>;
@group(3) @binding(3) var shadowMap: texture_depth_2d;
@group(3) @binding(4) var shadowSampler: sampler_comparison;

struct Input {
    @location(0) f_pos: vec3<f32>,
    @location(1) f_normal: vec3<f32>,
    @location(2) f_uv: vec2<f32>,
    @location(3) shadow_pos: vec3<f32>,
    @location(4) v_colors: vec3<f32>,
}

@fragment
fn main(input: Input) -> @location(0) vec4<f32> {
//    var object_color = input.v_colors.rgb;
    var ambient_light_color = vec3(1.0, 1.0, 1.0);
    var point_light_color = vec3(1.0, 1.0, 1.0);
    var dir_light_color = vec3(1.0, 1.0, 1.0);
    var light_result = vec3(0.0, 0.0, 0.0);
//    return vec4(input.f_pos.x, colors.y, 1 - input.f_pos.y, 1.0);
    var out_colors = vec4(input.v_colors.x, input.v_colors.y, input.f_pos.y - colors.z, 1.0);
    //  ambient
    light_result += ambient_light_color * ambientIntensity;
    // directional light
    var direction_position = directionLight[0].xyz;
    var direction_intensity: f32 = directionLight[1][0];
    var diffuse: f32 = max(dot(normalize(direction_position), input.f_normal), 0.0);
    light_result += dir_light_color * direction_intensity * diffuse;
    //   point light
    var point_position = pointLight[0].xyz;
    var point_intensity: f32 = pointLight[1][0];
    var point_radius: f32 = pointLight[1][1];
    var L = point_position - input.f_pos;
    var distance = length(L);
    var diffuse2: f32 = max(dot(normalize(L), input.f_normal), 0.0);
    if (distance < point_radius) {
        var distance_factor: f32 = pow(1.0 - distance / point_radius, 2.0);
        light_result += point_light_color * point_intensity * diffuse2 * distance_factor;
    }

    // add shadow factor
    var shadow: f32 = 0.0;
    let size = f32(textureDimensions(shadowMap).x);
    for (var y: i32 = -1; y <= 1 ; y = y + 1) {
        for (var x: i32 = -1; x <= 1; x = x + 1) {
            let offset = vec2<f32>(f32(x) / size, f32(y) / size);
            shadow = shadow + textureSampleCompare(
                shadowMap,
                shadowSampler,
                input.f_pos.xy + offset,
                input.f_pos.z - 0.005,
            );
              // apply a small bias to avoid acne
        }
    }
    shadow = shadow / 9.0;
    let lightFactor = min(0.3 + shadow * diffuse, 1.0);
    light_result += lightFactor;

    return vec4<f32>(textureSample(text, sam, input.f_uv).xyz * light_result, 1.0);
}

@fragment
fn fs_color(@builtin(position) fragCode: vec4<f32>) -> @location(0) vec4<f32> {
//colors.x
    return vec4((fragCode.x - 50.0) / 150.0, colors.y, colors.z, 1.0);
}

/*
关于WGSL的内置方法、函数和类，以下是一些常用的内置函数和类：
- 数学函数：abs、sin、cos、tan、sqrt、pow等。
- 向量和矩阵操作：dot、cross、normalize、length、transpose等。
- 采样器和纹理操作：textureSample、textureSampleLevel、textureLoad、textureStore等。
- 条件和循环：if、else、for、while等。
- 数据类型：bool、int、uint、float、vec2、vec3、vec4、mat2、mat3、mat4等。
*/
fn random() -> f32 {
  var seed: u32 = 0; // 设置一个种子值
  seed = (seed * 1664525u + 1013904223u) & 0xFFFFFFFFu; // 更新种子值
  return f32(seed) / 4294967296.0; // 将种子值转换为浮点数并返回
}