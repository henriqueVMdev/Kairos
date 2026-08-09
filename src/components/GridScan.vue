<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from 'postprocessing'
import * as THREE from 'three'

const props = defineProps({
  sensitivity: { type: Number, default: 0.55 },
  lineThickness: { type: Number, default: 1 },
  linesColor: { type: String, default: '#2F293A' },
  gridScale: { type: Number, default: 0.1 },
  lineStyle: {
    type: String,
    default: 'solid',
    validator: (value) => ['solid', 'dashed', 'dotted'].includes(value),
  },
  lineJitter: { type: Number, default: 0.1 },
  enablePost: { type: Boolean, default: true },
  bloomIntensity: { type: Number, default: 0 },
  bloomThreshold: { type: Number, default: 0 },
  bloomSmoothing: { type: Number, default: 0 },
  chromaticAberration: { type: Number, default: 0.002 },
  noiseIntensity: { type: Number, default: 0.01 },
  scanColor: { type: String, default: '#FF9FFC' },
  scanOpacity: { type: Number, default: 0.4 },
  scanDirection: {
    type: String,
    default: 'pingpong',
    validator: (value) => ['forward', 'backward', 'pingpong'].includes(value),
  },
  scanSoftness: { type: Number, default: 2 },
  scanGlow: { type: Number, default: 0.5 },
  scanPhaseTaper: { type: Number, default: 0.9 },
  scanDuration: { type: Number, default: 2 },
  scanDelay: { type: Number, default: 2 },
  enableGyro: { type: Boolean, default: false },
  scanOnClick: { type: Boolean, default: false },
  snapBackDelay: { type: Number, default: 250 },
})

const container = ref(null)

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uScanStarts[8];
uniform float uScanCount;
varying vec2 vUv;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x) {
  float t = clamp((x - a) / max(1e-5, b - a), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(p, 2.0));

  float cR = cos(uTilt), sR = sin(uTilt);
  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;
  float cY = cos(uYaw), sY = sin(uYaw);
  rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
  rd.xy += skew * rd.z;

  vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  float fadeStrength = 2.0;
  vec2 gridUV = vec2(0.0);
  float hitIsY = 1.0;

  for (int i = 0; i < 4; i++) {
    float isY = float(i < 2);
    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
    float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
    float den = isY * rd.y + (1.0 - isY) * rd.x;
    float t = num / den;
    vec3 h = ro + rd * t;
    float depthBoost = smoothstep(0.0, 3.0, h.z);
    h.xy += skew * 0.15 * depthBoost;
    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }

  vec3 hit = ro + rd * minT;
  float dist = length(hit - ro);
  float jitterAmt = clamp(uLineJitter, 0.0, 1.0);

  if (jitterAmt > 0.0) {
    vec2 jitter = vec2(
      sin(gridUV.y * 2.7 + iTime * 1.8),
      cos(gridUV.x * 2.3 - iTime * 1.6)
    ) * (0.15 * jitterAmt);
    gridUV += jitter;
  }

  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;
  float tx = halfPx * wx;
  float ty = halfPx * wy;
  float lineX = 1.0 - smoothstep(tx, tx + wx, ax);
  float lineY = 1.0 - smoothstep(ty, ty + wy, ay);

  if (uLineStyle > 0.5) {
    float dashMaskY = step(fract(gridUV.y * 4.0), 0.5);
    float dashMaskX = step(fract(gridUV.x * 4.0), 0.5);
    if (uLineStyle < 1.5) {
      lineX *= dashMaskY;
      lineY *= dashMaskX;
    } else {
      float cy = abs(fract(gridUV.y * 6.0) - 0.5);
      float cx = abs(fract(gridUV.x * 6.0) - 0.5);
      lineX *= 1.0 - smoothstep(0.18, 0.18 + fwidth(gridUV.y * 6.0), cy);
      lineY *= 1.0 - smoothstep(0.18, 0.18 + fwidth(gridUV.x * 6.0), cx);
    }
  }

  float primaryMask = max(lineX, lineY);
  vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;

  if (jitterAmt > 0.0) {
    vec2 jitter2 = vec2(
      cos(gridUV2.y * 2.1 - iTime * 1.4),
      sin(gridUV2.x * 2.5 + iTime * 1.7)
    ) * (0.15 * jitterAmt);
    gridUV2 += jitter2;
  }

  float fx2 = fract(gridUV2.x);
  float fy2 = fract(gridUV2.y);
  float ax2 = min(fx2, 1.0 - fx2);
  float ay2 = min(fy2, 1.0 - fy2);
  float wx2 = fwidth(gridUV2.x);
  float wy2 = fwidth(gridUV2.y);
  float tx2 = halfPx * wx2;
  float ty2 = halfPx * wy2;
  float lineX2 = 1.0 - smoothstep(tx2, tx2 + wx2, ax2);
  float lineY2 = 1.0 - smoothstep(ty2, ty2 + wy2, ay2);

  if (uLineStyle > 0.5) {
    float dashMaskY2 = step(fract(gridUV2.y * 4.0), 0.5);
    float dashMaskX2 = step(fract(gridUV2.x * 4.0), 0.5);
    if (uLineStyle < 1.5) {
      lineX2 *= dashMaskY2;
      lineY2 *= dashMaskX2;
    } else {
      float cy2 = abs(fract(gridUV2.y * 6.0) - 0.5);
      float cx2 = abs(fract(gridUV2.x * 6.0) - 0.5);
      lineX2 *= 1.0 - smoothstep(0.18, 0.18 + fwidth(gridUV2.y * 6.0), cy2);
      lineY2 *= 1.0 - smoothstep(0.18, 0.18 + fwidth(gridUV2.x * 6.0), cx2);
    }
  }

  float altMask = max(lineX2, lineY2);
  float edgeDistX = min(abs(hit.x + 0.5), abs(hit.x - 0.5));
  float edgeDistY = min(abs(hit.y + 0.2), abs(hit.y - 0.2));
  float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
  altMask *= 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);

  float lineMask = max(primaryMask, altMask);
  float fade = exp(-dist * fadeStrength);
  float dur = max(0.05, uScanDuration);
  float delay = max(0.0, uScanDelay);
  float sigma = max(0.001, 0.18 * max(0.1, uScanGlow) * uScanSoftness);
  float sigmaAura = sigma * 2.0;
  float combinedPulse = 0.0;
  float combinedAura = 0.0;

  float cycle = dur + delay;
  float timeInCycle = mod(iTime, cycle);
  float phase = clamp((timeInCycle - delay) / dur, 0.0, 1.0);
  if (uScanDirection > 0.5 && uScanDirection < 1.5) {
    phase = 1.0 - phase;
  } else if (uScanDirection > 1.5) {
    float pingpongTime = mod(max(0.0, iTime - delay), 2.0 * dur);
    phase = pingpongTime < dur ? pingpongTime / dur : 1.0 - (pingpongTime - dur) / dur;
  }

  float taper = clamp(uPhaseTaper, 0.0, 0.49);
  float phaseWindow = smoother01(0.0, taper, phase) * (1.0 - smoother01(1.0 - taper, 1.0, phase));
  float dz = abs(hit.z - phase * 2.0);
  combinedPulse += exp(-0.5 * (dz * dz) / (sigma * sigma)) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);
  combinedAura += exp(-0.5 * (dz * dz) / (sigmaAura * sigmaAura)) * 0.25 * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

  for (int i = 0; i < MAX_SCANS; i++) {
    if (float(i) >= uScanCount) break;
    float activeTime = iTime - uScanStarts[i];
    float activePhase = clamp(activeTime / dur, 0.0, 1.0);
    if (uScanDirection > 0.5 && uScanDirection < 1.5) activePhase = 1.0 - activePhase;
    float activeWindow = smoother01(0.0, taper, activePhase) * (1.0 - smoother01(1.0 - taper, 1.0, activePhase));
    float activeDz = abs(hit.z - activePhase * 2.0);
    combinedPulse += exp(-0.5 * (activeDz * activeDz) / (sigma * sigma)) * activeWindow * clamp(uScanOpacity, 0.0, 1.0);
    combinedAura += exp(-0.5 * (activeDz * activeDz) / (sigmaAura * sigmaAura)) * 0.25 * activeWindow * clamp(uScanOpacity, 0.0, 1.0);
  }

  vec3 gridColor = uLinesColor * lineMask * fade;
  color = gridColor + uScanColor * combinedPulse + uScanColor * combinedAura;
  float noise = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);
  color += (noise - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);

  float alpha = clamp(max(lineMask * fade, combinedPulse), 0.0, 1.0);
  float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + wx * 2.0, ax);
  float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + wy * 2.0, ay);
  alpha = max(alpha, max(gx, gy) * fade * clamp(uBloomOpacity, 0.0, 1.0));
  fragColor = vec4(color, alpha);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

const lookTarget = new THREE.Vector2()
const lookCurrent = new THREE.Vector2()
let tiltTarget = 0
let tiltCurrent = 0
let renderer
let composer
let bloom
let chroma
let material
let quad
let resizeObserver
let visibilityObserver
let motionQuery
let interactionTarget
let leaveTimer
let frameRequest
let lastFrame = 0
let isVisible = true
const scanStarts = []
const scanBuffer = new Float32Array(8)

const srgbColor = (value) => new THREE.Color(value).convertSRGBToLinear()

const lineStyleValue = () => {
  if (props.lineStyle === 'dashed') return 1
  if (props.lineStyle === 'dotted') return 2
  return 0
}

const scanDirectionValue = () => {
  if (props.scanDirection === 'backward') return 1
  if (props.scanDirection === 'pingpong') return 2
  return 0
}

const shouldAnimate = () => isVisible && !document.hidden && !motionQuery?.matches

const renderScene = (elapsed, delta = 0) => {
  if (!renderer || !material) return

  const sensitivity = THREE.MathUtils.clamp(props.sensitivity, 0, 1)
  const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, sensitivity)
  const damping = 1 - Math.exp(-Math.max(delta, 0.001) / smoothTime)
  lookCurrent.lerp(lookTarget, damping)
  tiltCurrent = THREE.MathUtils.lerp(tiltCurrent, tiltTarget, damping)

  const skewScale = THREE.MathUtils.lerp(0.06, 0.2, sensitivity)
  const yBoost = THREE.MathUtils.lerp(1.2, 1.6, sensitivity)
  material.uniforms.uSkew.value.set(lookCurrent.x * skewScale, -lookCurrent.y * yBoost * skewScale)
  material.uniforms.uTilt.value = tiltCurrent * THREE.MathUtils.lerp(0.12, 0.3, sensitivity)
  material.uniforms.iTime.value = elapsed

  renderer.clear(true, true, true)
  if (composer) composer.render(delta)
  else renderer.render(quad.parent, quad.parent.userData.camera)
}

const tick = (timestamp) => {
  frameRequest = undefined
  if (!shouldAnimate()) return
  const delta = lastFrame ? Math.min(0.1, (timestamp - lastFrame) / 1000) : 1 / 60
  lastFrame = timestamp
  renderScene(timestamp / 1000, delta)
  frameRequest = requestAnimationFrame(tick)
}

const startLoop = () => {
  if (shouldAnimate() && !frameRequest) {
    lastFrame = 0
    frameRequest = requestAnimationFrame(tick)
  } else if (!shouldAnimate() && material) {
    renderScene(0)
  }
}

const pushScan = () => {
  if (!material) return
  if (scanStarts.length >= 8) scanStarts.shift()
  scanStarts.push(performance.now() / 1000)
  scanBuffer.fill(0)
  scanStarts.forEach((start, index) => { scanBuffer[index] = start })
  material.uniforms.uScanStarts.value = scanBuffer
  material.uniforms.uScanCount.value = scanStarts.length
}

const onPointerMove = (event) => {
  if (!interactionTarget) return
  if (leaveTimer) window.clearTimeout(leaveTimer)
  const bounds = interactionTarget.getBoundingClientRect()
  const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  const y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  lookTarget.set(x, y)
}

const onPointerLeave = () => {
  if (leaveTimer) window.clearTimeout(leaveTimer)
  leaveTimer = window.setTimeout(() => {
    lookTarget.set(0, 0)
    tiltTarget = 0
  }, Math.max(0, props.snapBackDelay))
}

const onInteraction = async () => {
  if (props.scanOnClick) pushScan()
  if (props.enableGyro && typeof window.DeviceOrientationEvent?.requestPermission === 'function') {
    try {
      await window.DeviceOrientationEvent.requestPermission()
    } catch {
      // Device orientation remains optional.
    }
  }
}

const onOrientation = (event) => {
  const gamma = event.gamma ?? 0
  const beta = event.beta ?? 0
  lookTarget.set(
    THREE.MathUtils.clamp(gamma / 45, -1, 1),
    THREE.MathUtils.clamp(-beta / 30, -1, 1),
  )
  tiltTarget = THREE.MathUtils.degToRad(gamma) * 0.4
}

const resize = () => {
  const element = container.value
  if (!renderer || !material || !element) return
  const width = Math.max(1, element.clientWidth)
  const height = Math.max(1, element.clientHeight)
  renderer.setSize(width, height, false)
  composer?.setSize(width, height)
  material.uniforms.iResolution.value.set(width, height, renderer.getPixelRatio())
  renderScene(motionQuery?.matches ? 0 : performance.now() / 1000)
}

const syncUniforms = () => {
  if (!material) return
  const uniforms = material.uniforms
  uniforms.uLineThickness.value = props.lineThickness
  uniforms.uLinesColor.value.copy(srgbColor(props.linesColor))
  uniforms.uScanColor.value.copy(srgbColor(props.scanColor))
  uniforms.uGridScale.value = props.gridScale
  uniforms.uLineStyle.value = lineStyleValue()
  uniforms.uLineJitter.value = THREE.MathUtils.clamp(props.lineJitter, 0, 1)
  uniforms.uScanOpacity.value = THREE.MathUtils.clamp(props.scanOpacity, 0, 1)
  uniforms.uScanDirection.value = scanDirectionValue()
  uniforms.uNoise.value = Math.max(0, props.noiseIntensity)
  uniforms.uBloomOpacity.value = Math.max(0, props.bloomIntensity)
  uniforms.uScanGlow.value = props.scanGlow
  uniforms.uScanSoftness.value = props.scanSoftness
  uniforms.uPhaseTaper.value = props.scanPhaseTaper
  uniforms.uScanDuration.value = Math.max(0.05, props.scanDuration)
  uniforms.uScanDelay.value = Math.max(0, props.scanDelay)

  if (bloom) {
    bloom.blendMode.opacity.value = Math.max(0, props.bloomIntensity)
    bloom.luminanceMaterial.threshold = props.bloomThreshold
    bloom.luminanceMaterial.smoothing = props.bloomSmoothing
  }
  chroma?.offset.set(props.chromaticAberration, props.chromaticAberration)
}

onMounted(() => {
  const element = container.value
  if (!element) return

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.autoClear = false
  renderer.setClearColor(0x000000, 0)
  element.appendChild(renderer.domElement)

  material = new THREE.ShaderMaterial({
    uniforms: {
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2() },
      uTilt: { value: 0 },
      uYaw: { value: 0 },
      uLineThickness: { value: props.lineThickness },
      uLinesColor: { value: srgbColor(props.linesColor) },
      uScanColor: { value: srgbColor(props.scanColor) },
      uGridScale: { value: props.gridScale },
      uLineStyle: { value: lineStyleValue() },
      uLineJitter: { value: props.lineJitter },
      uScanOpacity: { value: props.scanOpacity },
      uScanDirection: { value: scanDirectionValue() },
      uNoise: { value: props.noiseIntensity },
      uBloomOpacity: { value: props.bloomIntensity },
      uScanGlow: { value: props.scanGlow },
      uScanSoftness: { value: props.scanSoftness },
      uPhaseTaper: { value: props.scanPhaseTaper },
      uScanDuration: { value: props.scanDuration },
      uScanDelay: { value: props.scanDelay },
      uScanStarts: { value: scanBuffer },
      uScanCount: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  scene.userData.camera = camera
  quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(quad)

  if (props.enablePost) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloom = new BloomEffect({
      intensity: 1,
      luminanceThreshold: props.bloomThreshold,
      luminanceSmoothing: props.bloomSmoothing,
    })
    bloom.blendMode.opacity.value = Math.max(0, props.bloomIntensity)
    chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(props.chromaticAberration, props.chromaticAberration),
      radialModulation: true,
      modulationOffset: 0,
    })
    const effectPass = new EffectPass(camera, bloom, chroma)
    effectPass.renderToScreen = true
    composer.addPass(effectPass)
  }

  interactionTarget = element.parentElement || element
  interactionTarget.addEventListener('pointermove', onPointerMove, { passive: true })
  interactionTarget.addEventListener('pointerleave', onPointerLeave)
  if (props.scanOnClick || props.enableGyro) interactionTarget.addEventListener('click', onInteraction)
  if (props.enableGyro) window.addEventListener('deviceorientation', onOrientation, { passive: true })

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', startLoop)
  document.addEventListener('visibilitychange', startLoop)

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(element)
  visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting
    startLoop()
  }, { threshold: 0.01 })
  visibilityObserver.observe(element)

  syncUniforms()
  resize()
  startLoop()
})

watch(
  () => [
    props.lineThickness,
    props.linesColor,
    props.scanColor,
    props.gridScale,
    props.lineStyle,
    props.lineJitter,
    props.bloomIntensity,
    props.bloomThreshold,
    props.bloomSmoothing,
    props.chromaticAberration,
    props.noiseIntensity,
    props.scanGlow,
    props.scanOpacity,
    props.scanDirection,
    props.scanSoftness,
    props.scanPhaseTaper,
    props.scanDuration,
    props.scanDelay,
  ],
  syncUniforms,
)

onBeforeUnmount(() => {
  if (frameRequest) cancelAnimationFrame(frameRequest)
  if (leaveTimer) window.clearTimeout(leaveTimer)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  motionQuery?.removeEventListener('change', startLoop)
  document.removeEventListener('visibilitychange', startLoop)
  interactionTarget?.removeEventListener('pointermove', onPointerMove)
  interactionTarget?.removeEventListener('pointerleave', onPointerLeave)
  interactionTarget?.removeEventListener('click', onInteraction)
  window.removeEventListener('deviceorientation', onOrientation)

  composer?.dispose()
  material?.dispose()
  quad?.geometry.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
})
</script>

<template>
  <div ref="container" class="gridscan" />
</template>

<style scoped>
.gridscan {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gridscan :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
}

</style>
