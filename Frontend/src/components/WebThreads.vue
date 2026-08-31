<script setup>
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Vue 3 lifecycle port of https://reactbits.dev/r/WebThreads-JS-TW.json.
// The registry's WebGL shaders and rendering behavior are preserved.

const props = defineProps({
  color1: { type: String, default: '#5227FF' },
  color2: { type: String, default: '#FF9FFC' },
  color3: { type: String, default: '#FFFFFF' },
  speed: { type: Number, default: 0.2 },
  threadCount: { type: Number, default: 6 },
  frequency: { type: Number, default: 5.0 },
  spread: { type: Number, default: 0.18 },
  taper: { type: Number, default: 1.0 },
  position: { type: Number, default: 0.5 },
  fanMode: { type: String, default: 'center' },
  glow: { type: Number, default: 0.02 },
  falloff: { type: Number, default: 0.6 },
  thickness: { type: Number, default: 1.1 },
  brightness: { type: Number, default: 0.6 },
  opacity: { type: Number, default: 1.0 },
  mirror: { type: Boolean, default: true },
  shimmer: { type: Boolean, default: false },
  grain: { type: Boolean, default: true },
  grainIntensity: { type: Number, default: 0.05 },
  mouseInteraction: { type: Boolean, default: true },
  mouseStrength: { type: Number, default: 0.3 },
})

const container = ref(null)

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

const FAN_MODE = { center: 0, left: 1, right: 2 }

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uThreadCount;
uniform float uFrequency;
uniform float uSpread;
uniform float uTaper;
uniform float uPosition;
uniform float uFanMode;
uniform float uGlow;
uniform float uFalloff;
uniform float uThickness;
uniform float uBrightness;
uniform float uOpacity;
uniform float uMirror;
uniform float uShimmer;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uEnableMouse;
uniform float uMouseActive;
out vec4 fragColor;

#define TAU 6.28318530718
#define MAX_THREADS 10

float glow(float x, float str, float dist) {
  return dist / pow(max(x, 1e-4), str);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float n = max(uThreadCount, 1.0);

  float pinchX = uFanMode < 0.5 ? 0.5 : (uFanMode < 1.5 ? 0.0 : 1.0);
  if (uEnableMouse > 0.5) {
    pinchX = mix(pinchX, uMouse.x, clamp(uMouseStrength, 0.0, 1.0) * uMouseActive);
  }

  float spreadDx = uSpread * abs(uv.x - pinchX);
  float baseT = iTime * uSpeed;
  float tauOverN = TAU / n;
  float mirror = uMirror > 0.5 ? sign(pinchX - uv.x) : 1.0;
  bool doShimmer = uShimmer > 0.5;
  float shimmerT = iTime * 1.7;
  float invThickness = 1.0 / max(uThickness, 0.01);
  float xFreq = uv.x * uFrequency;
  float yOff = uv.y - uPosition;
  float ciScale = n > 1.0 ? 1.0 / (n - 1.0) : 0.0;

  vec3 col = vec3(0.0);
  float gsum = 0.0;

  for (int idx = 0; idx < MAX_THREADS; idx++) {
    float i = float(idx);
    if (i >= n) break;

    float amplitude = spreadDx * (1.0 + i * uTaper);
    float shimmer = doShimmer ? sin(shimmerT + i * 1.3) * 0.35 : 0.0;
    float phase = (baseT + i * tauOverN) * mirror + shimmer;

    float sdf = abs(yOff + sin(xFreq + phase) * amplitude) * invThickness;

    float g = glow(sdf, uFalloff, uGlow);
    float ci = i * ciScale;
    vec3 threadCol = mix(uColor1, uColor2, ci);

    col += g * threadCol;
    gsum += g;
  }

  float coreAmt = smoothstep(0.5, 2.2, gsum);
  col = mix(col, uColor3 * gsum, coreAmt * 0.5);

  float bright = uBrightness;
  if (uEnableMouse > 0.5) {
    vec2 md = uv - uMouse;
    float d2 = dot(md, md);
    bright += clamp(uMouseStrength, 0.0, 1.0) * uMouseActive * exp(-d2 * 6.0) * 0.6;
  }
  col *= bright;

  float alpha = clamp(gsum, 0.0, 1.0) * uOpacity;

  vec3 outRgb = col * alpha;

  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }

  fragColor = vec4(outRgb, alpha);
}
`

let renderer
let program
let mesh
let canvas
let resizeObserver
let intersectionObserver
let frame = 0
let isVisible = true
let isPageVisible = true
let removeInteractionListeners

const updateUniforms = () => {
  if (!program) return

  const uniforms = program.uniforms
  uniforms.uSpeed.value = props.speed
  uniforms.uThreadCount.value = Math.round(props.threadCount)
  uniforms.uFrequency.value = props.frequency
  uniforms.uSpread.value = props.spread
  uniforms.uTaper.value = props.taper
  uniforms.uPosition.value = props.position
  uniforms.uFanMode.value = FAN_MODE[props.fanMode] ?? 0
  uniforms.uGlow.value = props.glow
  uniforms.uFalloff.value = props.falloff
  uniforms.uThickness.value = props.thickness
  uniforms.uBrightness.value = props.brightness
  uniforms.uOpacity.value = props.opacity
  uniforms.uMirror.value = props.mirror ? 1.0 : 0.0
  uniforms.uShimmer.value = props.shimmer ? 1.0 : 0.0
  uniforms.uGrain.value = props.grain ? 1.0 : 0.0
  uniforms.uGrainIntensity.value = props.grainIntensity

  ;[
    [uniforms.uColor1.value, hexToRgb(props.color1)],
    [uniforms.uColor2.value, hexToRgb(props.color2)],
    [uniforms.uColor3.value, hexToRgb(props.color3)],
  ].forEach(([uniform, rgb]) => {
    uniform[0] = rgb[0]
    uniform[1] = rgb[1]
    uniform[2] = rgb[2]
  })

  uniforms.uMouseStrength.value = props.mouseStrength
  uniforms.uEnableMouse.value = props.mouseInteraction ? 1.0 : 0.0
}

watch(props, updateUniforms)

onMounted(() => {
  const element = container.value
  if (!element) return

  renderer = new Renderer({
    webgl: 2,
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  })

  const gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)
  canvas = gl.canvas
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'block'
  element.appendChild(canvas)

  const geometry = new Triangle(gl)
  program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uSpeed: { value: 0.2 },
      uThreadCount: { value: 6 },
      uFrequency: { value: 5.0 },
      uSpread: { value: 0.18 },
      uTaper: { value: 1.0 },
      uPosition: { value: 0.5 },
      uFanMode: { value: 0 },
      uGlow: { value: 0.02 },
      uFalloff: { value: 0.6 },
      uThickness: { value: 1.1 },
      uBrightness: { value: 0.6 },
      uOpacity: { value: 1.0 },
      uMirror: { value: 1.0 },
      uShimmer: { value: 0.0 },
      uGrain: { value: 1.0 },
      uGrainIntensity: { value: 0.05 },
      uColor1: { value: new Float32Array([1, 1, 1]) },
      uColor2: { value: new Float32Array([1, 1, 1]) },
      uColor3: { value: new Float32Array([1, 1, 1]) },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uMouseStrength: { value: 0.3 },
      uEnableMouse: { value: 1.0 },
      uMouseActive: { value: 0 },
    },
  })

  mesh = new Mesh(gl, { geometry, program })
  updateUniforms()

  const setSize = () => {
    const rect = element.getBoundingClientRect()
    renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)))
    const resolution = program.uniforms.iResolution.value
    resolution[0] = gl.drawingBufferWidth
    resolution[1] = gl.drawingBufferHeight
    renderer.render({ scene: mesh })
  }

  resizeObserver = new ResizeObserver(setSize)
  resizeObserver.observe(element)
  setSize()

  const currentMouse = [0.5, 0.5]
  const targetMouse = [0.5, 0.5]
  let currentActive = 0
  let targetActive = 0

  const onMouseMove = (event) => {
    const rect = canvas.getBoundingClientRect()
    const isInside = event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom

    if (!isInside) {
      targetActive = 0
      return
    }

    targetMouse[0] = (event.clientX - rect.left) / rect.width
    targetMouse[1] = 1.0 - (event.clientY - rect.top) / rect.height
    targetActive = 1
  }
  const onMouseLeave = () => { targetActive = 0 }

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('blur', onMouseLeave)
  document.addEventListener('mouseleave', onMouseLeave)
  removeInteractionListeners = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('blur', onMouseLeave)
    document.removeEventListener('mouseleave', onMouseLeave)
  }

  const startedAt = performance.now()
  const loop = (time) => {
    program.uniforms.iTime.value = (time - startedAt) * 0.001
    currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0])
    currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1])
    currentActive += 0.05 * (targetActive - currentActive)
    program.uniforms.uMouse.value[0] = currentMouse[0]
    program.uniforms.uMouse.value[1] = currentMouse[1]
    program.uniforms.uMouseActive.value = currentActive
    renderer.render({ scene: mesh })
    frame = requestAnimationFrame(loop)
  }

  const tryStart = () => {
    if (isVisible && isPageVisible && frame === 0) frame = requestAnimationFrame(loop)
  }
  const tryStop = () => {
    if (frame === 0) return
    cancelAnimationFrame(frame)
    frame = 0
  }

  intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting
    isVisible ? tryStart() : tryStop()
  }, { threshold: 0 })
  intersectionObserver.observe(element)

  const onVisibility = () => {
    isPageVisible = !document.hidden
    isPageVisible ? tryStart() : tryStop()
  }
  document.addEventListener('visibilitychange', onVisibility)
  isPageVisible = !document.hidden
  tryStart()

  removeInteractionListeners = ((removeMouseListeners) => () => {
    removeMouseListeners()
    document.removeEventListener('visibilitychange', onVisibility)
  })(removeInteractionListeners)
})

onBeforeUnmount(() => {
  if (frame !== 0) cancelAnimationFrame(frame)
  frame = 0
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  removeInteractionListeners?.()

  const gl = renderer?.gl
  if (canvas?.parentNode === container.value) container.value.removeChild(canvas)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
})
</script>

<template>
  <div ref="container" class="relative h-full w-full overflow-hidden" />
</template>
