const SkyBoxVertexShader = `
  varying vec3 vUv;
            
  void main() {
    vUv = position; 

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition; 
  }
`;

const SkyBoxFragmentShader = `
  // hsvr2rgb from https://www.shadertoy.com/view/MsS3Wc

  #define PI 3.1415926535

  // Official HSV to RGB conversion 
  vec3 hsv2rgb( in vec3 c )
  {
      vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z * mix( vec3(1.0), rgb, c.y);
  }

  vec3 hsv2rgb_smooth( in vec3 c )
  {
      vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	

    return c.z * mix( vec3(1.0), rgb, c.y);
  }

  varying vec3 vUv;
  uniform vec3 u_size;
  uniform float u_time;
  
  void main() {
    vec3 p = vUv/u_size;

    vec3 q = vec3(1.0, 0, 0); // the sun rises from the east and sets in the west

    // Colors are in hsv and then converted to rgb
    vec3 dayColor = vec3( 0.548, 0.425, 0.922 );
    
    //vec3 nightColor = vec3( 0.717, 0.853, 0.9 );
    vec3 nightColor = vec3( 0.0, 0.0, 0.0 );
    
    vec3 skyColor = mix(dayColor, nightColor, (sin(u_time+PI)+1.0)/2.0);

    // center at origin  
    //vec3 col = (p + 1.0)/2.0;

    vec3 col;

    float r = 0.2;
    
    // find a way for us to make the sun added and blend with the sky
    float l = length(p-q);
    col = hsv2rgb(skyColor);

    //if (l < 0.5)



    // this one changes the sun's color...
    //col += smoothstep(0.4, 0.8, length(p-q));

    // this one inverts the previous
    // adding *(sin(u_time+PI)+1.0)/2.0 turns the sun off in night
    col += smoothstep(r, r+0.2, 0.02/length(p-q))*(sin(u_time)+1.0)/2.0;
    
    // this kinda works, but i dunno what is going on
    //col += 0.1/l;

    //col.y = clamp(col.y, 0.9, 1.0 );
      
    gl_FragColor = vec4( col, 1.0 );
  }
`;

export { SkyBoxVertexShader, SkyBoxFragmentShader };
