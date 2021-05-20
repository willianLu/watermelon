import * as THREE from 'three';
import Matter from 'matter-js'
import config from '@/config'
import { singleton, getCanvas } from '@/utils'
import type { PlaneImg } from "@/objects";

export type Data = {to: PlaneImg, from: Matter.Body}

/*
* 物理引擎
* */

@singleton
class MatterEngine {
    private readonly engine: Matter.Engine
    private readonly data: Array<Data>

    constructor() {
        this.engine = Matter.Engine.create({
            enableSleeping: true
        })
        this.engine.world.gravity.x = 0;
        this.engine.world.gravity.y = -5;
        this.data = []
    }

    init(callback: any) {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const bodyA = pairs[i].bodyA
                const bodyB = pairs[i].bodyB
                // console.log(bodyA.label, '----------', bodyB.label)
                if (bodyA.label === bodyB.label && !bodyA.isStatic && !bodyB.isStatic) {
                    bodyA.isStatic = true
                    bodyB.isStatic = true

                    callback(this.getData(bodyA), this.getData(bodyB))
                }
            }
        });

        Matter.Engine.run(this.engine)
    }

    getData(body: Matter.Body): Data {
        return this.data.find(d => d.from === body) as Data
    }

    add(data: PlaneImg, name: string) {
        const { x, y } = data.instance.position
        const box = Matter.Bodies.circle(x, y, data.width / 2, {
            restitution: 0.4,
            density: 0.68
        })
        box.label = name
        this.data.push({
            to: data,
            from: box
        })
        Matter.World.add(this.engine.world, box)
    }

    remove(body: Matter.Body) {
        Matter.World.remove(this.engine.world, body)
        const index = this.data.findIndex(d => d.from === body)
        if(index !== -1) {
            this.data.splice(index, 1)
        }
    }

    setEnd(end: PlaneImg) {
        const {x, y} = end.instance.position
        const endLine =  Matter.Bodies.rectangle(x, y, end.width, end.height, { isStatic: true, isSensor: true });
        endLine.label = 'endLine'

        Matter.World.add(this.engine.world, [endLine])
    }

    setBounds(bounds: PlaneImg) {
        const {x, y} = bounds.instance.position
        const { aspect } = getCanvas()
        const height = config.frustumSize * aspect
        const left = Matter.Bodies.rectangle(-config.frustumSize / 2 - 1, 0, 1, height, { isStatic: true });
        const right = Matter.Bodies.rectangle(config.frustumSize / 2 + 1, 0, 1, height, { isStatic: true });
        const bottom = Matter.Bodies.rectangle(x, y, bounds.width, bounds.height, { isStatic: true, friction: 1 });
        bottom.label = 'bottom'

        Matter.World.add(this.engine.world, [left, right, bottom])
    }

    update() {
        for (let i = 0; i < this.data.length; i ++) {
            const obj = this.data[i]
            const body = obj.from
            if(body && body.position) {
                const { x, y } = body.position
                obj.to.instance.position.set(x, y, obj.to.instance.position.z)
                obj.to.instance.setRotationFromEuler(new THREE.Euler(0, 0, body.angle))
            }
        }
    }
}

export default MatterEngine