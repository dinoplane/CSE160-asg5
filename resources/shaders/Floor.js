const FloorVertexShader = `
varying vec3 vUv; 

void main() {
  vUv = position; 

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition; 
}
`;

const FloorFragmentShader = `
// Adapted from https://thebookofshaders.com/09/
// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vUv; 

vec2 brickTile(vec2 _st, float _zoom){
    _st *= _zoom;

    // Here is where the offset is happening

    _st.y += step(1., mod(_st.x,2.0)) * 0.5 + (step(1., mod(_st.x,2.0))*2.0-1.0)* u_time;
    _st.x += step(1., mod(_st.y,2.0)) * 0.5 + (step(1., mod(_st.y,2.0))*2.0-1.0)* u_time;

    return fract(_st);
}

float box(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;
    vec2 uv = smoothstep(_size,_size+vec2(1e-4),_st);
    uv *= smoothstep(_size,_size+vec2(1e-4),vec2(1.0)-_st);
    return uv.x*uv.y;
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // Modern metric brick of 215mm x 102.5mm x 65mm
    // http://www.jaharrison.me.uk/Brickwork/Sizes.html
    // st /= vec2(2.15,0.65)/1.5;

    // Apply the brick tiling
    st = brickTile(st,10.0);

    color = vec3(box(st,vec2(0.9)));

    // Uncomment to see the space coordinates
    color = vec3(st.y*0.5, st.x*1.5,0.0);

	gl_FragColor = vec4(color,1.0);
}
`

export { FloorVertexShader, FloorFragmentShader };