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

type BokehUniforms = {
    tColor: { value: THREE.Texture | null }
    tDepth: { value: THREE.Texture | null }
    imageSize: { value: THREE.Vector2 }
    uPixelSize: { value: THREE.Vector2 }
    uFar: { value: number }
    uNear: { value: number }
    focus: { value: number }
    uFStop: { value: number }
    uFocalLength: { value: number }
    uDOFDebug: { value: boolean }
    uSensorHeight: { value: number }
}

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
        focus: { value: 1.0 },
        uFStop: { value: 5.6 },
        uFocalLength: { value: 50 },
        uDOFDebug: { value: true },
        uSensorHeight: { value: 24.0 },
    } satisfies BokehUniforms,

    vertexShader: /* glsl */ `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: /* glsl */ `

    #include <common>

    #include <packing>


    // based on Bokeh depth of field in a single pass
    // http://blog.tuxedolabs.com/2018/05/04/bokeh-depth-of-field-in-single-pass.html
    precision highp float;
    

    varying vec2 vUv;
    uniform sampler2D tColor; //Image to be processed
    uniform vec2 imageSize;
    uniform sampler2D tDepth; //Linear depth, where 1.0 == far plane
    
    uniform vec2 uPixelSize; //The size of a pixel: vec2(1.0/width, 1.0/height)
    uniform float uFar; // Far plane
    uniform float uNear;
    uniform float focus;
    uniform float uFStop;
    uniform float uFocalLength;
    uniform bool uDOFDebug;
    uniform float uSensorHeight;
    
    const float GOLDEN_ANGLE = 2.39996323;  // rad
    const float MAX_BLUR_SIZE = 30.0;
    const float RAD_SCALE = 1.0; // Smaller = nicer blur, larger = faster
    const float NUM_ITERATIONS = 50.0;
    
    float unpackDepth (const in vec4 rgba_depth) {
        const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
        float depth = dot(rgba_depth, bit_shift);
        return depth;
    }

    float getCoCSize(float depth, float focusDistance, float maxCoC) {
      float coc = clamp((1.0 - focusDistance / depth) * maxCoC, -1.0, 1.0); // (1 - mm/mm) * mm = mm
      return abs(coc) * MAX_BLUR_SIZE;
    }


    float getDepth( const in vec2 screenPosition ) {
        #if DEPTH_PACKING == 1
        return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
        #else
        return texture2D( tDepth, screenPosition ).x;
        #endif
    }

    float readDepth(const in sampler2D depthMap, const in vec2 coord, const in float near, const in float far) {
        #if DEPTH_PACKING == 1
        float z_b = unpackRGBAToDepth( texture2D( depthMap, coord ) );
        #else
        float z_b = texture2D( depthMap, coord ).x;
        #endif
        float z_n = 2.0 * z_b - 1.0;
        float z_e = 2.0 * near * far / (far + near - z_n * (far - near));
        return z_e;
    }
    
    
    vec3 depthOfField(vec2 texCoord, float focusDistance, float maxCoC) {
      float resolutionScale = imageSize.y / 1080.0;
    
      float centerDepth = readDepth(tDepth, texCoord, uNear, uFar) * 1000.0; //m -> mm
      float centerSize = getCoCSize(centerDepth, focusDistance, maxCoC);
    
      if (uDOFDebug) {
        float coc = (1.0 - focusDistance / centerDepth) * maxCoC;
        if (texCoord.x > 0.90) {
          float depth = texCoord.y * 1000.0 * 100.0; //100m
          if (texCoord.x <= 0.95) {
            float t = (texCoord.x - 0.9) * 20.0;
            float coc = (1.0 - focusDistance / depth) * maxCoC * 10.0;
            coc = abs(coc);
            if (coc > t) return vec3(1.0);
            return vec3(0.0);
          }
          if (texCoord.x > 0.97) {
            if (depth > focusDistance - 250.0 && depth < focusDistance + 250.0) {
              return vec3(1.0, 1.0, 0.0);
            }
            return vec3(floor(texCoord.y * 10.0)) / 10.0;
          }
          float c = 0.03; //0.03mm for 35mm format
          float H = uFocalLength * uFocalLength / (uFStop * c); //mm
          float Dn = H * focusDistance / (H + focusDistance);
          float Df = H * focusDistance / (H - focusDistance);
          if (depth > H - 250.0 && depth < H + 250.0) return vec3(1.0, 1.0, 0.0);
          if (depth < Dn) return vec3(1.0, 0.0, 0.0);
          if (depth > Df) return vec3(1.0, 0.0, 0.0);
          return vec3(0.0, 1.0, 0.0);
        }
        return vec3(floor(abs(coc) / 0.1 * 100.0) / 100.0, 0.0, 0.0);
    
        float c = abs(coc);
        c = c / (1.0 + c); // tonemapping to avoid burning the color
        c = pow(c, 2.2); // gamma to linear
    
        if (coc > 0.0) return vec3(c, 0.0, 0.0);
        else return vec3(0.0, 0.0, c);
      }
      vec3 color = texture2D(tColor, vUv).rgb;
      float tot = 1.0;
      float radius = RAD_SCALE;
      for (float ang = 0.0; ang < GOLDEN_ANGLE * NUM_ITERATIONS; ang += GOLDEN_ANGLE){
        vec2 tc = texCoord + vec2(cos(ang), sin(ang)) * uPixelSize * radius * resolutionScale;
        vec3 sampleColor = texture2D(tColor, tc).rgb;
        float sampleDepth = readDepth(tDepth, tc, uNear, uFar) * 1000.0; //m -> mm;
        float sampleSize = getCoCSize(sampleDepth, focusDistance, maxCoC);
        if (sampleDepth > centerDepth)
          sampleSize = clamp(sampleSize, 0.0, centerSize * 2.0);
        float m = smoothstep(radius - 0.5, radius + 0.5, sampleSize);
        color += mix(color/tot, sampleColor, m);
        tot += 1.0;
        radius += RAD_SCALE / radius;
    
        // Not sure if this ever happens as we exit after 50 iterations anyway
        if (radius > MAX_BLUR_SIZE) {
           break;
        }
      }
      return color /= tot;
    }
    
    void main () {
      float F = uFocalLength;
    
      float A = F / uFStop;
      float focusDistance = focus * 1000.0; // m -> mm
      float maxCoC = A * F / (focusDistance - F); //mm * mm / mm = mm
    
      vec3 color = depthOfField(vUv, focusDistance, maxCoC);
      gl_FragColor = vec4(color, 1.0);
    //   float depth = readDepth(tDepth, vUv, uNear, uFar);
    //   gl_FragColor = vec4(depth, depth, depth, 1.0);
    }
    
    `,
}

export { BokehShader }

type Params = {
    /** The focus distance in meters */
    focus: number
    /**
     * The focal length of the camera lens in millimeters.
     * This value is used only in the depth of field (DOF) shader calculations and does not affect the field of view.
     *
     * In the DOF shader:
     * - Longer focal lengths create a shallower depth of field (more background blur)
     * - Shorter focal lengths create a deeper depth of field (less background blur)
     *
     * Typical values:
     * - Wide-angle: 14-35mm
     * - Standard: 50mm
     * - Telephoto: 85-300mm
     *
     * The focus distance (set separately) determines the plane of sharp focus.
     * Changing the focus distance affects the range of distances that appear in focus:
     * - Closer focus distances generally result in a narrower depth of field
     * - Farther focus distances generally allow for a wider range of distances to be in focus
     *
     * The actual depth of field effect depends on the interplay between focal length, 
     * aperture (f-stop), focus distance, and the size of the image sensor or film.
     */
    focalLength?: number
    /**
     * The aperture in f-stops (f-number).
     * This value represents the ratio of the focal length to the diameter of the entrance pupil.
     * A smaller f-number (lower value) results in a larger aperture opening, creating a shallower depth of field,
     * while a larger f-number (higher value) results in a smaller aperture opening, creating a larger depth of field.
     *
     * Typical values for f-stops:
     * - Wide aperture (shallow depth of field): f/1.4, f/2
     * - Medium aperture: f/2.8, f/4
     * - Small aperture (large depth of field): f/5.6, f/8
     *
     * Note: The actual depth of field effect will depend on other factors as well,
     * such as the focal length of the lens and the distance to the subject.
     */
    fStops?: number
    /** The size of the render target */
    size: THREE.Vector2
    /** Whether to enable depth of field debug visualization */
    dofDebug?: boolean
    /** The height of the camera sensor in millimeters */
    sensorHeight?: number
}

export class BokehPass extends Pass {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderTargetDepth: THREE.WebGLRenderTarget
    materialDepth: THREE.MeshDepthMaterial
    materialBokeh: THREE.ShaderMaterial
    _oldClearColor: THREE.Color
    uniforms: BokehUniforms
    fsQuad: FullScreenQuad
    constructor(
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        params: Params,
    ) {
        super()

        const size: THREE.Vector2 = params.size
        this.scene = scene

        this.camera = camera

        console.log(camera)

        let focus = params.focus !== undefined ? params.focus : 1.0
        let focalLength =
            params.focalLength !== undefined ? params.focalLength : 3

        const aperture = params.fStops !== undefined ? params.fStops : 3
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
        const bokehUniforms = UniformsUtils.clone(
            bokehShader.uniforms,
        ) as BokehUniforms
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
        bokehUniforms['uFocalLength'].value = focalLength || 35.0
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
