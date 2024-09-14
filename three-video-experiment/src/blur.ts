import * as THREE from 'three'
/**
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

import {
    WebGLRenderTarget,
    NearestFilter,
    HalfFloatType,
    MeshDepthMaterial,
    RGBADepthPacking,
    NoBlending,
    UniformsUtils,
    ShaderMaterial,
    Color,
} from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

const BokehShader = {
    name: 'BokehShader',

    defines: {
        DEPTH_PACKING: 1,
        PERSPECTIVE_CAMERA: 1,
    },

    uniforms: {
        tColor: { value: null },
        tDepth: { value: null },
        imageSize: { value: new THREE.Vector2(1920, 1080) },
        uPixelSize: { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
        uFar: { value: 1000.0 },
        uNear: { value: 0.1 },
        focus: { value: 10.0 },
        uFStop: { value: 5.6 },
        uFocalLength: { value: 35.0 },
        uDOFDebug: { value: true },

        uSensorHeight: { value: 24.0 },
    },

    vertexShader: /* glsl */ `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: /* glsl */ `
        precision highp float;

        varying vec2 vUv;
        uniform sampler2D tColor;
        uniform sampler2D tDepth;
        uniform vec2 imageSize;
        uniform vec2 uPixelSize;
        uniform float uFar;
        uniform float uNear;
        uniform float focus;
        // https://github.com/pex-gl/pex-renderer/blob/5eca8e77d98d996fb36c42d5a9e7da068819be68/README.md?plain=1#L320
        uniform float uFStop;
        // camera focal length in mm
        uniform float uFocalLength;
        uniform bool uDOFDebug;
        // camera sensor height in mm
        uniform float uSensorHeight;

        const float GOLDEN_ANGLE = 2.39996323;
        const float MAX_BLUR_SIZE = 30.0;
        const float RAD_SCALE = 1.0;
        const float NUM_ITERATIONS = 50.0;

        float perspectiveDepthToViewZ(float invClipZ, float near, float far) {
            return (near * far) / ((far - near) * invClipZ - far);
        }

        float viewZToOrthographicDepth(float viewZ, float near, float far) {
            return (viewZ + near) / (near - far);
        }

        float readDepth(sampler2D depthSampler, vec2 coord) {
            float fragCoordZ = texture2D(depthSampler, coord).x;
            float viewZ = perspectiveDepthToViewZ(fragCoordZ, uNear, uFar);
            return viewZToOrthographicDepth(viewZ, uNear, uFar);
        }

        float getBlurSize(float depth, float focusPoint, float maxCoC) {
            float coc = clamp((1.0 / focusPoint - 1.0 / depth) * maxCoC, -1.0, 1.0);
            return abs(coc) * MAX_BLUR_SIZE;
        }

        vec3 depthOfField(vec2 texCoord, float focusPoint, float maxCoC) {
            float resolutionScale = imageSize.y / 1080.0;

            float centerDepth = readDepth(tDepth, texCoord) * uFar;
            float centerSize = getBlurSize(centerDepth, focusPoint, maxCoC);

            if (uDOFDebug && texCoord.x > 0.1) {
                float focusDistance = focus;
                float c = 0.03; // 0.03mm for 35mm format
                float H = uFocalLength * uFocalLength / (uFStop * c); // mm
                float Dn = H * focusDistance / (H + focusDistance);
                float Df = H * focusDistance / (H - focusDistance);

                float coc = (1.0 - focusDistance / centerDepth) * maxCoC;
                if (texCoord.x > 0.90) {
                    float depth = texCoord.y * 1000.0 * 100.0; // 100m
                    if (texCoord.x <= 0.95) {
                        float t = (texCoord.x - 0.9) * 20.0;
                        float cocBar = abs((1.0 - focusDistance / depth) * maxCoC * 10.0);
                        if (cocBar > t) return vec3(1.0);
                        return vec3(0.0);
                    }
                    if (texCoord.x > 0.97) {
                        if (depth > focusDistance - 250.0 && depth < focusDistance + 250.0) {
                            return vec3(1.0, 1.0, 0.0);
                        }
                        return vec3(floor(texCoord.y * 10.0)) / 10.0;
                    }
                    if (depth > H - 250.0 && depth < H + 250.0) return vec3(1.0, 1.0, 0.0);
                    if (depth < Dn) return vec3(1.0, 0.0, 0.0);
                    if (depth > Df) return vec3(1.0, 0.0, 0.0);
                    return vec3(0.0, 1.0, 0.0);
                }
                
                float cocAbs = abs(coc);
                cocAbs = cocAbs / (1.0 + cocAbs); // tonemapping to avoid burning the color
                cocAbs = pow(cocAbs, 2.2); // gamma to linear

                if (coc > 0.0) return vec3(cocAbs, 0.0, 0.0);
                else return vec3(0.0, 0.0, cocAbs);
            }

            vec3 color = texture2D(tColor, vUv).rgb;
            float tot = 1.0;
            float radius = RAD_SCALE;

            for (float ang = 0.0; radius < MAX_BLUR_SIZE && ang < GOLDEN_ANGLE * NUM_ITERATIONS; ang += GOLDEN_ANGLE) {
                vec2 tc = texCoord + vec2(cos(ang), sin(ang)) * uPixelSize * radius * resolutionScale;
                vec3 sampleColor = texture2D(tColor, tc).rgb;
                float sampleDepth = readDepth(tDepth, tc) * uFar;
                float sampleSize = getBlurSize(sampleDepth, focusPoint, maxCoC);
                
                if (sampleDepth > centerDepth)
                    sampleSize = clamp(sampleSize, 0.0, centerSize * 2.0);
                
                float m = smoothstep(radius - 0.5, radius + 0.5, sampleSize);
                color += mix(color/tot, sampleColor, m);
                tot += 1.0;
                radius += RAD_SCALE / radius;
            }
            return color /= tot;
        }

        void main() {
            float F = uFocalLength; // Convert mm to meters
            float A = F / uFStop;
            float focusPoint = focus; // Use focus directly, assuming it's already in the correct unit (meters)
            float maxCoC = A * F / (focusPoint - F);

            vec3 color = depthOfField(vUv, focusPoint, maxCoC);
            gl_FragColor = vec4(color, 1.0);
        }
    `,
}

export { BokehShader }

export class BokehPass extends Pass {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderTargetDepth: THREE.WebGLRenderTarget
    materialDepth: THREE.MeshDepthMaterial
    materialBokeh: THREE.ShaderMaterial
    _oldClearColor: THREE.Color
    uniforms: any
    fsQuad: FullScreenQuad
    constructor(
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        params: any,
    ) {
        super()

        const size: THREE.Vector2 = params.size
        this.scene = scene

        this.camera = camera

        console.log(camera)

        let focus = params.focus !== undefined ? params.focus : 1.0
        let aperture = params.aperture !== undefined ? params.aperture : 0.025

        aperture = 0.9
        // focus = 1
        const maxblur = params.maxblur !== undefined ? params.maxblur : 1.0

        // render targets

        this.renderTargetDepth = new WebGLRenderTarget(1, 1, {
            // will be resized later
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            type: HalfFloatType,
        })

        this.renderTargetDepth.texture.name = 'BokehPass.depth'

        // depth material

        this.materialDepth = new MeshDepthMaterial()
        this.materialDepth.depthPacking = RGBADepthPacking
        this.materialDepth.blending = NoBlending

        // bokeh material

        const bokehShader = BokehShader
        const bokehUniforms = UniformsUtils.clone(bokehShader.uniforms)
        // bokehUniforms['tColor'].value = null
        bokehUniforms['tDepth'].value = this.renderTargetDepth.texture as any
        bokehUniforms['imageSize'].value = new THREE.Vector2(
            size.width,
            size.height,
        )
        bokehUniforms['uPixelSize'].value = new THREE.Vector2(
            1 / size.width,
            1 / size.height,
        )
        bokehUniforms['uFar'].value = camera.far
        bokehUniforms['uNear'].value = camera.near
        bokehUniforms['focus'].value = focus
        bokehUniforms['uFStop'].value = aperture
        bokehUniforms['uFocalLength'].value = params.focalLength || 35.0
        bokehUniforms['uDOFDebug'].value = params.dofDebug || false
        bokehUniforms['uSensorHeight'].value = params.sensorHeight || 24.0

        this.materialBokeh = new ShaderMaterial({
            defines: Object.assign({}, bokehShader.defines),
            uniforms: bokehUniforms,
            vertexShader: bokehShader.vertexShader,
            fragmentShader: bokehShader.fragmentShader,
        })

        this.uniforms = bokehUniforms

        this.fsQuad = new FullScreenQuad(this.materialBokeh)

        this._oldClearColor = new Color()
    }

    render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/) {
        // Render depth into texture

        this.scene.overrideMaterial = this.materialDepth

        renderer.getClearColor(this._oldClearColor)
        const oldClearAlpha = renderer.getClearAlpha()
        const oldAutoClear = renderer.autoClear
        renderer.autoClear = false

        renderer.setClearColor(0xffffff)
        renderer.setClearAlpha(1.0)
        renderer.setRenderTarget(this.renderTargetDepth)
        renderer.clear()
        renderer.render(this.scene, this.camera)

        // Render bokeh composite

        this.uniforms['tColor'].value = readBuffer.texture
        this.uniforms['uNear'].value = this.camera.near
        this.uniforms['uFar'].value = this.camera.far

        if (this.renderToScreen) {
            renderer.setRenderTarget(null)
            this.fsQuad.render(renderer)
        } else {
            renderer.setRenderTarget(writeBuffer)
            renderer.clear()
            this.fsQuad.render(renderer)
        }

        this.scene.overrideMaterial = null
        renderer.setClearColor(this._oldClearColor)
        renderer.setClearAlpha(oldClearAlpha)
        renderer.autoClear = oldAutoClear
    }

    setSize(width, height) {
        console.log('setsize', width, height)
        this.uniforms['imageSize'].value.set(width, height)
        this.uniforms['uPixelSize'].value.set(1 / width, 1 / height)

        this.renderTargetDepth.setSize(width, height)
    }

    dispose() {
        this.renderTargetDepth.dispose()

        this.materialDepth.dispose()
        this.materialBokeh.dispose()

        this.fsQuad.dispose()
    }
}
