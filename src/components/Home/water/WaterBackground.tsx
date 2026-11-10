import { useEffect, useRef } from "react";

/* Nền mặt nước vẽ bằng WebGL (trang chỉ cho hiện ở góc phải trên qua mask CSS): nước gợn mềm (nhiễu cuộn) + vân sáng khúc xạ (caustics) chạy lăn tăn,
   sáng dần về phía trên như ánh nắng xuyên qua mặt nước. Tông màu theo bộ cũ (xanh rêu, xanh lá, vàng cát).
   Vẽ ở nửa độ phân giải cho nhẹ máy; tab ẩn thì dừng; giảm chuyển động thì chỉ vẽ một khung;
   không có WebGL thì để nền gradient CSS phía sau. */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + 1.0), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 4; k++) { v += a * n(p); p = p * 2.03 + 1.7; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / r.y;
  float tt = t * 0.03;
  // mặt nước cuộn nhẹ
  vec2 q = vec2(fbm(uv * 1.4 + vec2(tt, tt * 0.6)), fbm(uv * 1.4 - vec2(tt * 0.8, tt) + 5.2));
  vec2 w = uv * 2.6 + q * 1.7 + vec2(tt * 0.6, -tt * 0.9);
  // vân sáng: làm nhọn đỉnh của hai lớp nhiễu lệch nhau
  float c1 = abs(fbm(w) - 0.5);
  float c2 = abs(fbm(w * 1.6 + 3.1 + vec2(-tt, tt * 0.5)) - 0.5);
  float caust = pow(clamp(1.0 - min(c1, c2) * 2.6, 0.0, 1.0), 9.0);
  float depth = gl_FragCoord.y / r.y; // 0 đáy, 1 mặt nước
  vec3 deep = vec3(0.016, 0.045, 0.030);
  vec3 mid  = vec3(0.045, 0.150, 0.090);
  vec3 col = mix(deep, mid, clamp(depth * 0.85 + (q.x - 0.5) * 0.4, 0.0, 1.0));
  col += caust * vec3(0.05, 0.26, 0.14) * (0.2 + depth * 0.8);
  col += pow(caust, 3.0) * vec3(0.18, 0.15, 0.03) * depth;
  // tia sáng mờ từ trên xuống
  float ray = smoothstep(0.55, 1.0, fbm(vec2(uv.x * 3.0 + tt * 2.0, 0.0))) * depth * depth;
  col += ray * vec3(0.02, 0.07, 0.04);
  gl_FragColor = vec4(col, 1.0);
}`;

export default function WaterBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");

    const SCALE = 0.5; // nửa độ phân giải, CSS kéo giãn lại cho nhẹ máy
    const resize = () => {
      canvas.width = Math.max(1, Math.round(window.innerWidth * SCALE));
      canvas.height = Math.max(1, Math.round(window.innerHeight * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    canvas.classList.add("is-ready");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (now - start) / 1000 + 20);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVis = () => { if (!document.hidden && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } };
    const onResize = () => { resize(); if (reduce) draw(performance.now()); };
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="wt-water" aria-hidden />;
}
