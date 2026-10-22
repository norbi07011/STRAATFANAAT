import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * WebGL shader background — animowany dym w barwach Hagi (żółty / zielony) na czerni.
 * fbm noise + domain warping, reaguje lekko na kursor. Pauzuje poza ekranem.
 */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

// hash bez sin() — stabilny także przy mediump na telefonach
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8,-0.6,0.6,0.8);
  for (int i=0;i<5;i++){ v += a*noise(p); p = r*p*2.02; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5*uRes.xy) / uRes.y;
  float t = uTime * 0.06;
  vec2 m = (uMouse - 0.5) * 0.35;
  vec2 q = vec2(fbm(p*1.6 + vec2(0.0, t) + m), fbm(p*1.6 + vec2(5.2, -t*0.8)));
  vec2 r = vec2(fbm(p*2.0 + 3.0*q + vec2(1.7, 9.2) + t*0.7), fbm(p*2.0 + 3.0*q + vec2(8.3, 2.8) - t*0.5));
  float f = fbm(p*1.4 + 2.5*r);

  vec3 yellow = vec3(1.0, 0.82, 0.12);
  vec3 green  = vec3(0.04, 0.54, 0.27);
  // zielony dym z lewej, żółty z prawej — jak na zdjęciu SAVAGE
  float side = smoothstep(-0.2, 1.2, uv.x + (q.x-0.5)*0.6);
  vec3 tint = mix(green, yellow, side);
  float density = smoothstep(0.35, 0.95, f) * (0.55 + 0.45*length(r));
  // winieta: dym gęstszy przy krawędziach, środek ciemniejszy pod tekstem
  float vign = smoothstep(0.15, 1.05, length((uv-0.5)*vec2(1.3,1.0)));
  vec3 col = tint * density * (0.28 + 0.65*vign);
  col += 0.03*vec3(hash(gl_FragCoord.xy + floor(uTime*24.0))); // ziarno
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export const SmokeShader = ({ className = '' }: { className?: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl || gl.isContextLost()) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');

    // Shader liczony w niższej rozdzielczości (dym jest miękki, a GPU dziękuje)
    const SCALE = 0.5;
    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let mouse = [0.5, 0.5];
    let target = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      target = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      mouse = [mouse[0] + (target[0] - mouse[0]) * 0.04, mouse[1] + (target[1] - mouse[1]) * 0.04];
      gl.uniform1f(uTime, reduce ? 12 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduce) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      // bez loseContext(): React StrictMode montuje efekt dwa razy na tym samym canvasie
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className={`h-full w-full [image-rendering:auto] ${className}`} />;
};
