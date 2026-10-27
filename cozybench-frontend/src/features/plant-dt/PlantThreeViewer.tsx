import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadPlantModelFiles } from "./plantDtService";

export default function PlantThreeViewer(props: { plantId: string }) {
    let host!: HTMLDivElement;

    const [error, setError] = createSignal("");

    createEffect(() => {
        const plantId = props.plantId;

        if (!plantId || !host) {
            return;
        }

        setError("");

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#e4ebee");

        const camera = new THREE.PerspectiveCamera(
            45,
            1,
            0.01,
            1000,
        );

        camera.position.set(0, -3, 2);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2),
        );

        renderer.outputColorSpace = THREE.SRGBColorSpace;

        host.replaceChildren(renderer.domElement);

        // Ambient / sky-like light.
        const hemisphereLight = new THREE.HemisphereLight(
            0xf1f3f2,
            0x4d4936,
            2,
        );

        scene.add(hemisphereLight);

        // Main directional light.
        const keyLight = new THREE.DirectionalLight(
            0xffffff,
            2.5,
        );

        keyLight.position.set(3, -4, 5);

        scene.add(keyLight);

        const controls = new OrbitControls(
            camera,
            renderer.domElement,
        );

        controls.enableDamping = true;

        const resize = () => {
            const { width, height } =
                host.getBoundingClientRect();

            if (!width || !height) {
                return;
            }

            renderer.setSize(
                width,
                height,
                false,
            );

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const observer = new ResizeObserver(resize);

        observer.observe(host);

        resize();

        let disposed = false;
        let model: THREE.Group | undefined;

        void loadPlantModelFiles(plantId)
            .then(({ obj, mtl }) => {
                if (disposed) {
                    return;
                }

                const materials = new MTLLoader().parse(
                    mtl,
                    "",
                );

                materials.preload();

                const loader = new OBJLoader();

                loader.setMaterials(materials);

                const object = loader.parse(obj);

                /*
                 * Plant leaves are effectively zero-thickness surfaces.
                 *
                 * Three.js renders only FrontSide by default, so when the
                 * camera looks at the back of a leaf the triangle disappears.
                 *
                 * DoubleSide makes both sides visible without changing
                 * the OBJ geometry itself.
                 */
                object.traverse((child) => {
                    if (!(child instanceof THREE.Mesh)) {
                        return;
                    }

                    const childMaterials = Array.isArray(
                        child.material,
                    )
                        ? child.material
                        : [child.material];

                    for (const material of childMaterials) {
                        material.side = THREE.DoubleSide;
                        material.needsUpdate = true;
                    }
                });

                if (disposed) {
                    /*
                     * The component may have been destroyed while the model
                     * was loading. Dispose the newly created resources before
                     * returning.
                     */
                    object.traverse((child) => {
                        if (!(child instanceof THREE.Mesh)) {
                            return;
                        }

                        child.geometry.dispose();

                        const childMaterials = Array.isArray(
                            child.material,
                        )
                            ? child.material
                            : [child.material];

                        for (const material of childMaterials) {
                            material.dispose();
                        }
                    });

                    return;
                }

                model = object;

                /*
                 * Calculate the dimensions of the imported model.
                 */
                const box = new THREE.Box3().setFromObject(
                    object,
                );

                const size = box.getSize(
                    new THREE.Vector3(),
                );

                const center = box.getCenter(
                    new THREE.Vector3(),
                );

                /*
                 * Move the object so that its bounding-box center
                 * is located at the scene origin.
                 */
                object.position.sub(center);

                const largest =
                    Math.max(
                        size.x,
                        size.y,
                        size.z,
                    ) || 1;

                /*
                 * Automatically position the camera according to
                 * the size of the plant.
                 */
                camera.position.set(
                    0,
                    -largest * 1.8,
                    largest * 1.15,
                );

                camera.near = largest / 100;
                camera.far = largest * 100;

                camera.updateProjectionMatrix();

                controls.target.set(
                    0,
                    0,
                    0,
                );

                controls.update();

                scene.add(object);
            })
            .catch(() => {
                setError(
                    "The authenticated plant model could not be loaded from Spring.",
                );
            });

        let frame = 0;

        const render = () => {
            controls.update();

            renderer.render(
                scene,
                camera,
            );

            frame = requestAnimationFrame(render);
        };

        render();

        onCleanup(() => {
            disposed = true;

            cancelAnimationFrame(frame);

            observer.disconnect();

            controls.dispose();

            if (model) {
                scene.remove(model);

                model.traverse((child) => {
                    if (!(child instanceof THREE.Mesh)) {
                        return;
                    }

                    child.geometry.dispose();

                    const materials = Array.isArray(
                        child.material,
                    )
                        ? child.material
                        : [child.material];

                    for (const material of materials) {
                        material.dispose();
                    }
                });
            }

            renderer.dispose();

            renderer.domElement.remove();
        });
    });

    return (
        <div class="relative h-full min-h-80 overflow-hidden rounded-2xl border border-warm-stone/20 bg-sky-mist/20">
            <div
                ref={host}
                class="absolute inset-0"
            />

            <Show when={error()}>
                <div class="absolute inset-0 grid place-items-center bg-cloud-white/90 p-6 text-center text-sm font-semibold text-error">
                    {error()}
                </div>
            </Show>

            <div class="pointer-events-none absolute bottom-3 left-3 rounded-full bg-graphite/70 px-3 py-1.5 text-xs text-cloud-white backdrop-blur">
                Drag to rotate · Scroll to zoom
            </div>
        </div>
    );
}