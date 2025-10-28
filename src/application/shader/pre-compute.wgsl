@group(0) @binding(1) var<storage, read> modelViews: array<mat4x4<f32>>;
@group(0) @binding(2) var<storage, read> projection: mat4x4<f32>;
@group(0) @binding(3) var<uniform> count: u32;
//  需要添加redd_write让其启用读写权限，否则默认只有读取权限
@group(0) @binding(4) var<storage, read_write> mvp: array<mat4x4<f32>>;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
    let index = globalId.x;
    if (index >= count) {
        return;
    }
    mvp[index] = projection * modelView[index];
}