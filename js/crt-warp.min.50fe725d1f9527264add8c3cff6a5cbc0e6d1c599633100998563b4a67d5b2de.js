(function(){"use strict";var p="crt-warp-container",w="crt-warp-canvas",_={none:0,aperture:1,shadow:2,slot:3},y=.56,i=1.6,l=.8,c=Math.PI*2,j=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,O=`#version 300 es
precision highp float;
uniform vec2 uGrid;
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uLevels;
uniform float uDecay;
uniform float uReveal;
uniform float uRise;
uniform vec4 uSeed;
uniform sampler2D uPrevious;
out vec4 outColor;

float field(vec2 uv, float t) {
  uv = (uv - 0.5) * uFrequency + 0.5;
  float f = 0.0;
  f += 0.7 * sin(0.5 * uv.x + t / 5.0 + uSeed.x);
  f += 3.0 * sin(1.6 * uv.y + t / 5.0 + uSeed.y);
  f += sin(10.0 * (uv.y * sin(t / 2.0 + uSeed.z) + uv.x * cos(t / 5.0)) + t / 2.0);
  float cx = uv.x + 0.5 * sin(t / 2.0 + uSeed.w);
  float cy = uv.y + 0.5 * cos(t / 4.0 + uSeed.x * 0.7);
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));
  return f;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 uv = (cell + 0.5) / uGrid;
  float s = (0.5 + 0.499 * sin(field(uv, uTime) * uAmplitude)) * mix(1.0 / uLevels, 1.0, uReveal);
  float level = floor(s * uLevels) / max(uLevels - 1.0, 1.0);
  float previous = texelFetch(uPrevious, ivec2(cell), 0).r;
  float lifted = min(level, previous + uRise);
  outColor = vec4(max(lifted, previous * uDecay - 0.004), level, 0.0, 1.0);
}`,v=`#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform vec2 uSize;
out vec4 outColor;

void main() {
  float v = texture(uContent, gl_FragCoord.xy / uSize).r;
  outColor = vec4(v * v, 0.0, 0.0, 1.0);
}`,C=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uSize;
uniform vec2 uDirection;
uniform float uSigma;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  float stride = max(uSigma * 0.55, 0.5);
  float total = 0.0;
  float sum = 0.0;
  for (int i = -7; i <= 7; i++) {
    float x = float(i) * stride;
    float w = exp(-0.5 * x * x / (uSigma * uSigma));
    sum += texture(uSource, uv + uDirection * x / uSize).r * w;
    total += w;
  }
  outColor = vec4(sum / total, 0.0, 0.0, 1.0);
}`,x=`#version 300 es
precision highp float;
uniform sampler2D uContent;
uniform sampler2D uGlow;
uniform vec2 uGrid;
uniform vec2 uResolution;
uniform float uPixel;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform float uLines;
uniform float uScanline;
uniform float uCurve;
uniform float uCorners;
uniform int uMaskType;
uniform float uMask;
uniform float uBloom;
uniform float uBrightness;
uniform float uNoise;
uniform float uFlicker;
uniform float uInterference;
uniform float uVignette;
uniform float uShift;
uniform float uWarm;
uniform float uFocus;
uniform float uStatic;
uniform float uRoll;
uniform float uTear;
uniform float uGain;
uniform vec4 uMagnet;
uniform float uPurity;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 curve(vec2 uv) {
  if (uCurve <= 0.0) return uv;
  vec2 p = (uv - 0.5) * 2.0;
  float corner = uCurve / sqrt(max(uCurve * uCurve - 2.0, 0.001));
  p = uCurve * p / sqrt(max(uCurve * uCurve - dot(p, p), 0.001));
  p /= corner;
  return p * 0.5 + 0.5;
}

float lineValue(float x, float y) {
  if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) return 0.0;
  float cx = x * uGrid.x - 0.5;
  float c0 = floor(cx);
  int row = int(clamp(floor(y * uGrid.y), 0.0, uGrid.y - 1.0));
  float a = texelFetch(uContent, ivec2(int(clamp(c0, 0.0, uGrid.x - 1.0)), row), 0).r;
  float b = texelFetch(uContent, ivec2(int(clamp(c0 + 1.0, 0.0, uGrid.x - 1.0)), row), 0).r;
  float soft = mix(0.5, 0.14, uFocus);
  return pow(mix(a, b, smoothstep(0.5 - soft, 0.5 + soft, cx - c0)), 1.25);
}

float beam(vec2 uv) {
  float ly = uv.y * uLines - 0.5;
  float r0 = floor(ly);
  float f = ly - r0;
  float a = lineValue(uv.x, (r0 + 0.5) / uLines);
  float b = lineValue(uv.x, (r0 + 1.5) / uLines);
  float nearest = f < 0.5 ? a : b;
  float sa = mix(0.16, 0.34, sqrt(a));
  float sb = mix(0.16, 0.34, sqrt(b));
  float lit = a * exp(-0.5 * f * f / (sa * sa)) + b * exp(-0.5 * (1.0 - f) * (1.0 - f) / (sb * sb));
  return mix(nearest, lit * 1.18, uScanline * mix(0.3, 1.0, uFocus));
}

vec3 maskAt(vec2 px) {
  if (uMaskType == 0 || uMask <= 0.0) return vec3(1.0);
  float size = max(1.0, floor(uPixel + 0.5));
  vec2 q = floor(px / size);
  float low = 1.0 - uMask;
  vec3 m = vec3(low);
  float column = q.x;
  if (uMaskType == 2) column += mod(floor(q.y / 2.0), 2.0) * 1.5;
  int stripe = int(mod(floor(column), 3.0));
  if (stripe == 0) m.r = 1.0;
  else if (stripe == 1) m.g = 1.0;
  else m.b = 1.0;
  if (uMaskType == 2 && mod(q.y, 2.0) > 0.5) m *= mix(1.0, 0.72, uMask);
  if (uMaskType == 3) {
    float slot = mod(q.y + mod(floor(q.x / 3.0), 2.0) * 2.0, 4.0);
    if (slot < 1.0) m *= mix(1.0, 0.45, uMask);
  }
  return m / sqrt((1.0 + 2.0 * low) / 3.0);
}

vec3 phosphor(vec3 cov) {
  float peak = max(max(uColor.r, uColor.g), max(uColor.b, 0.001));
  vec3 weight = 1.0 - uColor / peak;
  return uColor * cov * pow(max(cov, vec3(0.0001)), 0.7 * weight);
}

void main() {
  vec2 frag = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = curve(frag);
  float shape = 1.0;
  if (uCorners > 0.0) {
    float margin = uCorners * 0.035;
    float radius = uCorners * 0.1;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 box = (0.5 - margin) * vec2(aspect, 1.0);
    vec2 q = abs(p) - box + radius;
    float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    float aa = max(fwidth(sd), 0.0005);
    shape = (1.0 - smoothstep(-aa, aa, sd)) * mix(1.0, smoothstep(0.0, 0.06, -sd), 0.35);
    uv = (uv - 0.5) / (1.0 - 2.0 * margin) + 0.5;
  }
  float rolling = step(0.0001, abs(uRoll));
  uv.y += uRoll;
  float wrapped = fract(uv.y);
  uv.y = mix(uv.y, wrapped, rolling);
  float offset = fract(uRoll);
  float reach = smoothstep(0.0, 0.08, min(offset, 1.0 - offset));
  float blank = mix(1.0, smoothstep(0.0, 0.05, wrapped) * smoothstep(1.0, 0.95, wrapped), rolling * reach);

  float line = floor(uv.y * uLines);
  float tick = floor(uTime * 30.0);
  uv.x += uTear * (sin(uv.y * 21.0 + uTime * 37.0) * 0.6 + hash(vec2(line, tick)) - 0.5) * 0.05;
  uv.x += uInterference * 0.003 * (hash(vec2(line * 0.37, floor(uTime * 24.0))) - 0.5);

  vec2 dp = (frag - uMagnet.xy) * vec2(aspect, 1.0);
  float fall = exp(-dot(dp, dp) / max(uMagnet.w * uMagnet.w, 0.0001));
  vec2 swirl = vec2(-dp.y, dp.x) / vec2(aspect, 1.0) * fall * uMagnet.z * 0.5;
  vec3 spread = mix(vec3(0.85), vec3(1.0, 0.6, 0.2), uPurity);

  vec3 level = vec3(
    beam(uv + swirl * spread.r + vec2(uShift, 0.0)),
    beam(uv + swirl * spread.g),
    beam(uv + swirl * spread.b - vec2(uShift, 0.0))
  );

  float turn = uTime * 0.35;
  vec2 axis = vec2(cos(turn), sin(turn));
  float lobe = dot(dp, axis) / max(uMagnet.w, 0.0001);
  float side = dot(dp, vec2(-axis.y, axis.x)) / max(uMagnet.w, 0.0001);
  vec3 purity = vec3(lobe, -0.35 * lobe + 0.6 * side, -lobe);
  level *= 1.0 + uPurity * fall * uMagnet.z * 0.9 * purity;

  float glow = texture(uGlow, uv).r * uBloom;
  float hum = 1.0 - uInterference * 0.24 * smoothstep(0.2, 1.0, 0.5 + 0.5 * sin((frag.y - uTime * 0.09) * 6.2831853));
  float flick = 1.0 + uFlicker * 0.1 * (hash(vec2(floor(uTime * 60.0), 7.3)) - 0.5);
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 173.0) - 0.5;
  vec2 v = frag - 0.5;
  float vignette = mix(1.0, smoothstep(0.0, 1.0, clamp(1.0 - dot(v, v) * 2.0, 0.0, 1.0)), uVignette);
  float gain = uBrightness * hum * flick * vignette * blank * uGain * uWarm;

  float noise = hash(floor(gl_FragCoord.xy / (uPixel * 1.5)) + fract(uTime * 13.7) * 91.0);
  level = mix(level, vec3(noise * noise * 1.15), uStatic);
  level *= gain * (1.0 + grain * uNoise * 2.0);
  level *= maskAt(gl_FragCoord.xy);
  glow *= gain * shape * (1.0 + 0.6 * (1.0 - uFocus));
  level *= shape;

  vec3 color;
  float alpha;
  if (uLight < 0.5) {
    vec3 cov = clamp(level, 0.0, 1.0);
    vec3 light = phosphor(cov) + uColor * glow * 0.5 * (1.0 - cov);
    vec3 excess = max(level - 1.1, 0.0);
    light += (1.0 - light) * (1.0 - exp(-excess * 0.6));
    light = clamp(light, 0.0, 1.0);
    color = uBackground + light * (1.0 - uBackground);
    alpha = max(max(light.r, light.g), light.b);
    if (uOpaque < 0.5) color = light;
  } else {
    vec3 cov = clamp(level * 0.86, 0.0, 0.88);
    cov += clamp(glow * 0.12, 0.0, 0.2) * (1.0 - cov);
    color = mix(uBackground, uColor, cov);
    alpha = max(max(cov.r, cov.g), cov.b);
    if (uOpaque < 0.5) color = uColor * cov;
  }
  outColor = uOpaque > 0.5 ? vec4(color, 1.0) : vec4(color, alpha);
}`,e=function(e,t,n){return Math.min(n,Math.max(t,e))},r=function(e){return e*e*(3-2*e)},g=function(e){return e<.5?4*e*e*e:1-(-2*e+2)**3/2},t=null,a=function(e,n){if(e==="transparent")return null;if(typeof document=="undefined")return n;if(t||(t=document.createElement("canvas").getContext("2d")),!t)return n;t.fillStyle="#000000",t.fillStyle=e;var s,o,i=t.fillStyle;return i.startsWith("#")?(o=parseInt(i.slice(1),16),[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255]):(s=/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(i),s?s[4]!==0[0]&&Number(s[4])===0?null:[Number(s[1])/255,Number(s[2])/255,Number(s[3])/255]:n)},f=function(e){var n=Math.sin(e*12.9898+1.7)*43758.5453,s=Math.sin(e*78.233+4.1)*24634.6345,o=Math.sin(e*37.719+2.9)*17431.7731,i=Math.sin(e*91.113+.3)*31337.1337,t=function(e){return(e-Math.floor(e))*c};return e===0?[0,0,0,0]:[t(n),t(s),t(o),t(i)]},b=function(t){if(t>=i)return[1,1,1];var n=r(e(t/i,0,1)),s=r(e(t/.6,0,1)),o=r(e((t-.15)/(i-.15),0,1));return[n,s,o]},m=function(e,t,n){var s=e.createShader(t);return s?(e.shaderSource(s,n),e.compileShader(s),e.getShaderParameter(s,e.COMPILE_STATUS)?s:(console.warn(e.getShaderInfoLog(s)),e.deleteShader(s),null)):null},o=function(e,t,n){var s,a,o=m(e,e.VERTEX_SHADER,j),i=m(e,e.FRAGMENT_SHADER,t);return!o||!i?null:(s=e.createProgram(),s?(e.attachShader(s,o),e.attachShader(s,i),e.bindAttribLocation(s,0,"aPosition"),e.linkProgram(s),e.deleteShader(o),e.deleteShader(i),e.getProgramParameter(s,e.LINK_STATUS)?(a={},n.forEach(function(t){a[t]=e.getUniformLocation(s,t)}),{program:s,uniforms:a}):(console.warn(e.getProgramInfoLog(s)),e.deleteProgram(s),null)):null)},s=function(e,t,n){var o,s=e.createTexture();return e.bindTexture(e.TEXTURE_2D,s),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,n,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),o=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,o),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,s,0),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),{texture:s,framebuffer:o,width:t,height:n}},n=function(e,t){if(!t)return;e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer)},h=function(){return typeof window!="undefined"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1)};function u(t,r){if(!t)return null;var d,u,p,j,E,S,M,F,T,z,D,N,L,R,P,H,I,B,V,$,W,U,K,q,Y,G,X,m=Object.assign({color:"#c755f7",backgroundColor:"#120f17",lightMode:!1,speed:.5,variation:0,waveAmplitude:.3,waveFrequency:2.5,levels:3,columns:80,persistence:.4,curvature:.25,corners:0,scanlineStrength:.6,scanlineFrequency:200,mask:"aperture",maskStrength:.3,bloom:1.5,bloomRadius:1,rgbShift:.003,noise:.1,flicker:.15,interference:.2,vignette:.3,brightness:1,intro:!0,mouseReact:!0,mouseStrength:.5,changeOnClick:!1,dpr:2,fps:60,paused:!1},r||{}),Z=a(m.color,[.78,.33,.97])??[.78,.33,.97],Q=a(m.backgroundColor,[.07,.06,.09]),A={ink:Z,paper:Q,lightMode:m.lightMode,speed:m.speed,variation:m.variation,amplitude:Math.max(0,m.waveAmplitude)/.28,frequency:Math.max(.01,m.waveFrequency)/2.2,levels:e(Math.round(m.levels),2,12),columns:e(Math.round(m.columns),8,400),persistence:e(m.persistence,0,.98),curve:m.curvature>.001?1.1+.42/m.curvature:0,corners:e(m.corners,0,1),scanline:e(m.scanlineStrength,0,1),lines:e(m.scanlineFrequency,20,1200),mask:_[m.mask]??0,maskStrength:e(m.maskStrength,0,1),bloom:Math.max(0,m.bloom),bloomRadius:Math.max(.05,m.bloomRadius),rgbShift:m.rgbShift,noise:Math.max(0,m.noise),flicker:Math.max(0,m.flicker),interference:Math.max(0,m.interference),vignette:e(m.vignette,0,1),brightness:Math.max(0,m.brightness),intro:m.intro,mouseReact:m.mouseReact,mouseStrength:Math.max(0,m.mouseStrength),changeOnClick:m.changeOnClick,dpr:Math.max(.5,m.dpr),fps:Math.max(1,m.fps),paused:m.paused},k=document.createElement("canvas");if(k.className=w,t.appendChild(k),u=k.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!0,powerPreference:"high-performance"}),!u)return k.remove(),null;if(p=o(u,O,["uGrid","uTime","uAmplitude","uFrequency","uLevels","uDecay","uReveal","uRise","uSeed","uPrevious"]),T=o(u,v,["uContent","uSize"]),E=o(u,C,["uSource","uSize","uDirection","uSigma"]),z=o(u,x,["uContent","uGlow","uGrid","uResolution","uPixel","uTime","uColor","uBackground","uOpaque","uLight","uLines","uScanline","uCurve","uCorners","uMaskType","uMask","uBloom","uBrightness","uNoise","uFlicker","uInterference","uVignette","uShift","uWarm","uFocus","uStatic","uRoll","uTear","uGain","uMagnet","uPurity"]),!p||!T||!E||!z)return k.remove(),null;K=u.createVertexArray(),u.bindVertexArray(K),q=u.createBuffer(),u.bindBuffer(u.ARRAY_BUFFER,q),u.bufferData(u.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),u.STATIC_DRAW),u.enableVertexAttribArray(0),u.vertexAttribPointer(0,2,u.FLOAT,!1,0,0),d={width:1,height:1,pixel:1,grid:[0,0],cells:[null,null],glows:[null,null],flip:0,time:0,clock:0,last:0,frame:0,raf:0,visible:!1,introAt:-1,flipAt:-1,flipped:!0,channel:0,pointer:[.5,.5],magnet:[.5,.5,0,0,0],magnetGoal:0,lost:!1,quiet:0,seen:null};try{L=sessionStorage.getItem("crt_warp_time"),I=sessionStorage.getItem("crt_warp_clock"),L&&I&&(d.time=parseFloat(L)||0,d.clock=parseFloat(I)||0,d.introAt=-999),d.channel=0}catch{}return X=function(){var i,a,r,c=A,t=c.columns,o=e(Math.round(t*y*d.height/Math.max(d.width,1)),4,300);(t!==d.grid[0]||o!==d.grid[1])&&(d.cells.forEach(function(e){return n(u,e)}),d.cells=[s(u,t,o),s(u,t,o)],d.grid=[t,o]),i=Math.max(1,Math.round(d.width/4)),a=Math.max(1,Math.round(d.height/4)),r=d.glows[0],(!r||r.width!==i||r.height!==a)&&(d.glows.forEach(function(e){return n(u,e)}),d.glows=[s(u,i,a),s(u,i,a)])},R=function(){var o=A,e=Math.min(window.devicePixelRatio||1,o.dpr),n=Math.max(1,Math.round(t.clientWidth*e)),s=Math.max(1,Math.round(t.clientHeight*e));if(d.pixel=e,n===d.width&&s===d.height)return;d.quiet=0,d.width=n,d.height=s,k.width=n,k.height=s},F=function(e,t,n){u.bindFramebuffer(u.FRAMEBUFFER,e?e.framebuffer:null),u.viewport(0,0,t,n),u.drawArrays(u.TRIANGLES,0,3)},S=function(e,t,n){u.activeTexture(u.TEXTURE0+e),u.bindTexture(u.TEXTURE_2D,t),u.uniform1i(n,e)},G=function(t,n){var s,i,a,r,c,h,m,v,j,y,_,w,O,x,C,k,M,D,N,L,R,o=A;if(X(),y=d.grid[0],v=d.grid[1],h=f(o.variation+d.channel),D=d.introAt<0?0:d.clock-d.introAt,m=o.intro&&!n?b(D):[1,1,1],C=m[0],R=m[1],L=m[2],M=d.cells[d.flip],c=d.cells[1-d.flip],i=d.glows[0],r=d.glows[1],!M||!c||!i||!r)return;u.useProgram(p.program),u.uniform2f(p.uniforms.uGrid,y,v),u.uniform1f(p.uniforms.uTime,d.time),u.uniform1f(p.uniforms.uAmplitude,o.amplitude),u.uniform1f(p.uniforms.uFrequency,o.frequency),u.uniform1f(p.uniforms.uLevels,o.levels),u.uniform1f(p.uniforms.uDecay,n?0:o.persistence**(t*60)),u.uniform1f(p.uniforms.uReveal,C),u.uniform1f(p.uniforms.uRise,C<1?t/.22:1),u.uniform4f(p.uniforms.uSeed,h[0],h[1],h[2],h[3]),S(0,M.texture,p.uniforms.uPrevious),F(c,y,v),d.flip=1-d.flip,u.useProgram(T.program),u.uniform2f(T.uniforms.uSize,i.width,i.height),S(0,c.texture,T.uniforms.uContent),F(i,i.width,i.height),N=Math.max(.6,i.height/48*o.bloomRadius),u.useProgram(E.program),u.uniform2f(E.uniforms.uSize,i.width,i.height),u.uniform1f(E.uniforms.uSigma,N),u.uniform2f(E.uniforms.uDirection,1,0),S(0,i.texture,E.uniforms.uSource),F(r,r.width,r.height),u.uniform2f(E.uniforms.uDirection,0,1),S(0,r.texture,E.uniforms.uSource),F(i,i.width,i.height),_=0,w=0,O=0,x=1,d.flipAt>=0&&(a=d.clock-d.flipAt,!d.flipped&&a>=.22&&(d.flipped=!0,d.channel+=1),a>=l?d.flipAt=-1:(k=a/l,_=g(k),w=Math.sin(Math.PI*e(a/.5,0,1))*.6,O=Math.sin(Math.PI*e(a/.55,0,1))*.75,x=1-.3*Math.sin(Math.PI*k))),u.useProgram(z.program),s=z.uniforms,S(0,c.texture,s.uContent),S(1,i.texture,s.uGlow),u.uniform2f(s.uGrid,y,v),u.uniform2f(s.uResolution,d.width,d.height),u.uniform1f(s.uPixel,d.pixel),u.uniform1f(s.uTime,n?0:d.clock),u.uniform3f(s.uColor,o.ink[0],o.ink[1],o.ink[2]),j=o.paper??[0,0,0],u.uniform3f(s.uBackground,j[0],j[1],j[2]),u.uniform1f(s.uOpaque,o.paper?1:0),u.uniform1f(s.uLight,o.lightMode?1:0),u.uniform1f(s.uLines,o.lines),u.uniform1f(s.uScanline,o.scanline),u.uniform1f(s.uCurve,o.curve),u.uniform1f(s.uCorners,o.corners),u.uniform1i(s.uMaskType,o.mask),u.uniform1f(s.uMask,o.maskStrength),u.uniform1f(s.uBloom,o.bloom),u.uniform1f(s.uBrightness,o.brightness),u.uniform1f(s.uNoise,o.noise),u.uniform1f(s.uFlicker,n?0:o.flicker),u.uniform1f(s.uInterference,o.interference),u.uniform1f(s.uVignette,o.vignette),u.uniform1f(s.uShift,o.rgbShift),u.uniform1f(s.uWarm,R),u.uniform1f(s.uFocus,L),u.uniform1f(s.uStatic,O),u.uniform1f(s.uRoll,_),u.uniform1f(s.uTear,w),u.uniform1f(s.uGain,x),u.uniform4f(s.uMagnet,d.magnet[0],1-d.magnet[1],d.magnet[4]*o.mouseStrength*2,.24),u.uniform1f(s.uPurity,o.mask>0?1:0),F(null,d.width,d.height)},B=0,D=function(e){if(d.raf=requestAnimationFrame(D),!d.visible||document.hidden||d.lost){d.last=e;return}var t,n,o,a,r,l,u,m,f,p,s=A,g=1e3/s.fps;if(d.last&&e-d.last<g-1)return;if(o=d.last?Math.min((e-d.last)/1e3,.1):1/60,d.last=e,a=h(),d.clock+=o,d.introAt<0&&(d.introAt=d.clock),!s.paused&&!a&&(d.time+=o*s.speed),d.clock-B>.5){B=d.clock;try{sessionStorage.setItem("crt_warp_time",d.time.toString()),sessionStorage.setItem("crt_warp_clock",d.clock.toString()),sessionStorage.setItem("crt_warp_channel","0")}catch{}}for(t=d.magnet,r=c/.3,n=0;n<2;n++)u=-r*r*(t[n]-d.pointer[n])-2*r*t[2+n],t[2+n]+=u*o,t[n]+=t[2+n]*o;if(l=s.mouseReact&&!a?d.magnetGoal:0,t[4]+=(l-t[4])*(1-Math.exp(-o/.18)),m=s.paused||a,f=Math.abs(t[4]-l)>.002||t[4]>.002&&(Math.abs(t[2])+Math.abs(t[3])>5e-4||Math.abs(t[0]-d.pointer[0])>5e-4),p=d.flipAt>=0||s.intro&&!a&&d.clock-d.introAt<i||f,d.seen!==s||p||!m?d.quiet=0:d.quiet+=1,d.seen=s,d.quiet>90)return;G(o,a)},$=function(e){var n=t.getBoundingClientRect();return{x:(e.clientX-n.left)/Math.max(n.width,1),y:(e.clientY-n.top)/Math.max(n.height,1),inside:e.clientX>=n.left&&e.clientX<=n.right&&e.clientY>=n.top&&e.clientY<=n.bottom}},W=function(e){var t=$(e);t.inside&&(d.magnetGoal===0&&d.magnet[4]<.02&&(d.magnet[0]=t.x,d.magnet[1]=t.y,d.magnet[2]=0,d.magnet[3]=0),d.pointer=[t.x,t.y]),d.magnetGoal=t.inside?1:0},j=function(){d.magnetGoal=0},N=function(e){var t,n=A;if(!n.changeOnClick||e.pointerType==="touch"||e.button!==0)return;if(e.target instanceof Element&&e.target.closest('a, button, input, textarea, select, label, [role="button"], img, .agent-avatar, .pr-header-row, .thm-badge-item, iframe'))return;if(t=$(e),!t.inside)return;if(h())return;if(d.flipAt>=0)return;d.flipAt=d.clock,d.flipped=!1,d.quiet=0},H=function(e){e.preventDefault(),d.lost=!0},Y=new IntersectionObserver(function(e){d.visible=e.some(function(e){return e.isIntersecting})}),Y.observe(t),U=new ResizeObserver(R),U.observe(t),R(),window.addEventListener("pointermove",W,{passive:!0}),window.addEventListener("pointerdown",N),window.addEventListener("pointerup",j),window.addEventListener("pointercancel",j),window.addEventListener("touchend",j,{passive:!0}),window.addEventListener("touchcancel",j,{passive:!0}),document.documentElement.addEventListener("pointerleave",j),k.addEventListener("webglcontextlost",H),d.raf=requestAnimationFrame(D),V=new MutationObserver(function(){A.ink=a(m.color||"#c755f7",[.78,.33,.97]),A.paper=a(m.backgroundColor||"#120f17",[.07,.06,.09]),A.lightMode=!1,d.quiet=0}),V.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]}),P=function(e){e.persisted&&(d.last=performance.now(),d.quiet=0,d.raf||(d.raf=requestAnimationFrame(D)))},window.addEventListener("pageshow",P),M=function(){try{sessionStorage.setItem("crt_warp_time",d.time.toString()),sessionStorage.setItem("crt_warp_clock",d.clock.toString()),sessionStorage.setItem("crt_warp_channel","0")}catch{}},window.addEventListener("beforeunload",M),window.addEventListener("pagehide",M),document.addEventListener("visibilitychange",function(){document.visibilityState==="hidden"&&M()}),function(){cancelAnimationFrame(d.raf),Y.disconnect(),U.disconnect(),V.disconnect(),window.removeEventListener("pointermove",W),window.removeEventListener("pointerdown",N),window.removeEventListener("pointerup",j),window.removeEventListener("pointercancel",j),window.removeEventListener("touchend",j),window.removeEventListener("touchcancel",j),window.removeEventListener("pageshow",P),window.removeEventListener("beforeunload",M),window.removeEventListener("pagehide",M),document.documentElement.removeEventListener("pointerleave",j),k.removeEventListener("webglcontextlost",H),d.cells.forEach(function(e){return n(u,e)}),d.glows.forEach(function(e){return n(u,e)}),[p,T,E,z].forEach(function(e){return u.deleteProgram(e.program)}),u.deleteBuffer(q),u.deleteVertexArray(K),u.getExtension("WEBGL_lose_context")?.loseContext(),k.remove()}}window.initCRTWarp=u;function d(){var e,t=document.getElementById(p);if(!t)return;e=function(){var e=document.getElementById("crt-warp-bg");e&&e.parentElement!==document.body&&document.body.prepend(e),document.documentElement.classList.add("home-crt-active"),document.documentElement.classList.add("crt-bg-active"),u(t,{color:"#c755f7",backgroundColor:"#120f17",lightMode:!1,mask:"aperture",curvature:.25,persistence:.4,brightness:.55,changeOnClick:!1,fps:window.innerWidth<768?30:60})},"requestIdleCallback"in window?requestIdleCallback(e,{timeout:1e3}):setTimeout(e,60)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d()})()