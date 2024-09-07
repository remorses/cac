

export const applyImageEffect = async ({
    imageBitmap,
    rotationX = deg * 10,
    rotationY = deg * 20,
    rotationZ = deg * 0,
}: {
    imageBitmap: ImageBitmap
    rotationX?: number
    rotationY?: number
    rotationZ?: number
}) => {
    const scene = new THREE.Scene()

    const renderer = new THREE.WebGLRenderer({ antialias: true })

    const texture = new THREE.Texture()
    texture.image = imageBitmap
    texture.needsUpdate = true

    const aspectRatio = texture.image.width / texture.image.height
    console.log('texture size', texture.image.width, texture.image.height)

    renderer.setSize(texture.image.width, texture.image.height)
    renderer.setViewport(0, 0, texture.image.width, texture.image.height)

    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000)
    camera.updateProjectionMatrix()

    const geometry = new THREE.PlaneGeometry(aspectRatio, 1)
    const material = new THREE.MeshBasicMaterial({ map: texture })
    const plane = new THREE.Mesh(geometry, material)

    plane.rotation.set(rotationX, rotationY, rotationZ)

    scene.add(plane)
    camera.position.z = 0.6

    camera.lookAt(plane.position)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const bokehPass = new BokehPass(scene, camera, {
        focus: camera.position.z,
        aperture: 0.1,
        maxblur: 0.03,
    })
    composer.addPass(bokehPass)
    // Function to find the key of the maximum value in an object
    
   

    // Render the scene
    composer.render()

    // Return the canvas as a bitmap
    const bitmap = await createImageBitmap(renderer.domElement, {
        imageOrientation: 'flipY',
    })
    return bitmap
}
