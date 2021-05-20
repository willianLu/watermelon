import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import Matter, { Data } from './matter'
import config from '@/config'
import {off, on, getCanvas, pxToCanvas} from '@/utils'
import { Scene, Camera } from '@/scene'
import { PlaneImg } from "@/objects";
import boundsImg from '@/assets/images/ground.png'
import endImg from '@/assets/images/endLine.png'
import ic1 from '@/assets/images/icon_1.png'
import ic2 from '@/assets/images/icon_2.png'
import ic from '@/assets/images/icon.png'

const fruitsConfig: any = config.fruits

enum Status {
    'start',
    'stop'
}

/*
* 游戏入口
* */
class Game {
    private scene: Scene
    private camera: Camera
    private matter: Matter

    private canvas?: HTMLCanvasElement
    private currentFruits: PlaneImg
    private status: Status

    constructor() {
        this.scene = new Scene()
        this.camera = new Camera()
        this.matter = new Matter()
        this.currentFruits = this.addFruits()
        this.status = Status.start
    }

    init() {
        this.matter.init(this.onComplete.bind(this))
        this.canvas = document.querySelector('#canvas') as HTMLCanvasElement
        // this.openAn(0, 0, pxToCanvas(50))
        this.setEnd()
        this.setBounds()
        this.render()
        this.bindTouchStart()
    }

    onComplete(dA: Data, dB: Data) { // 碰撞处理
        const { x, y } = dA.from.position
        const { x: _x, y: _y } = dB.from.position
        const an = new TWEEN.Tween({x: _x, y: _y}).to({x, y}, 150).start()
        an.onUpdate(({ x, y }) => {
            dB.from.position.x = x
            dB.from.position.y = y
        })

        an.onComplete(() => {
            const { x, y } = dA.from.position
            const index = +dA.from.label.split('-')[1]
            this.scene.instance.remove(dA.to.instance)
            this.scene.instance.remove(dB.to.instance)
            this.matter.remove(dA.from)
            this.matter.remove(dB.from)

            const score = index + 1
            const fruits = this.addFruits(score)
            fruits.instance.position.set(x, y, 0)
            this.matter.add(fruits, fruits.instance.name)
            this.openAn(x, y, fruits.width)
        })

    }

    fadeOut(particle: PlaneImg) {
        const an = new TWEEN.Tween({ opacity: 1 }).to({opacity: 0}, 1000).start()
        an.onUpdate(({ opacity }) => {
            particle.material.opacity = opacity
        })
        an.onComplete(() => {
            this.scene.instance.remove(particle.instance)
        })
    }

    openAn(x: number, y: number, w: number) {

        for (let i = 0; i < 10; i++) {
            const particle = new PlaneImg({
                img: ic,
                width: 24,
                height: 41
            })

            particle.instance.position.set(x, y, 2)

            const a = 359 * Math.random()
            const i = pxToCanvas(30) * Math.random() + w / 2
            const scale = .5 * Math.random() + w / pxToCanvas(100);
            const px = Math.sin(a * Math.PI / 180) * i
            const py = Math.cos(a * Math.PI / 180) * i
            const rotation = Math.floor(Math.random() * (360 - -360) + -360)
            const time = .5 * Math.random();

            const anMove = new TWEEN.Tween({x, y}).to({x: x + px, y: y + py}, time * 1000).start()
            anMove.onUpdate(({ x, y }) => {
                particle.instance.position.set(x, y, 2)
            })

            particle.instance.scale.set(scale, scale, 0)
            const anScale = new TWEEN.Tween({ scale }).to({scale: 0.3}, (time + .5) * 1000).start()
            anScale.onUpdate(({ scale }) => {
                particle.instance.scale.set(scale, scale, 0)
            })

            const anRotation = new TWEEN.Tween({ rotation: 0 }).to({rotation}, (time + .5) * 1000).start()
            anRotation.onUpdate(({ rotation }) => {
                particle.instance.rotation.z = rotation
            })
            anRotation.onComplete(() => {

            })
            this.fadeOut(particle)

            this.scene.instance.add(particle.instance)

        }

        for(let i = 0; i < 20; i ++) {
            const particle = new PlaneImg({
                img: ic2,
                width: 38,
                height: 40
            })

            const a = 359 * Math.random()
            const i = 30 * Math.random() + w / 2
            const px = Math.sin(a * Math.PI / 180) * i
            const py = Math.cos(a * Math.PI / 180) * i
            const scale = .5 * Math.random() + w / 100;
            const time = .5 * Math.random();

            particle.instance.position.set(x, y, 2)

            const anMove = new TWEEN.Tween({x, y}).to({x: x + px, y: y + py}, time * 1000).start()
            anMove.onUpdate(({ x, y }) => {
                particle.instance.position.set(x, y, 2)
            })

            particle.instance.scale.set(scale, scale, 0)
            const anScale = new TWEEN.Tween({ scale }).to({scale: 0.3}, (time + .5) * 1000).start()
            anScale.onUpdate(({ scale }) => {
                particle.instance.scale.set(scale, scale, 0)
            })

            anScale.onComplete(() => {

            })
            this.fadeOut(particle)

            this.scene.instance.add(particle.instance)
        }

        const bg = new PlaneImg({
            img: ic1,
            width: 319,
            height: 292
        })

        bg.instance.rotation.z = Math.floor(Math.random() * 360)
        bg.instance.position.set(x, y, 1)
        bg.instance.scale.set(0, 0, 1)

        const anBg = new TWEEN.Tween({scale: 0}).to({scale: w / pxToCanvas(150)}, 200).start()
        anBg.onUpdate(({ scale }) => {
            bg.instance.scale.set(scale, scale, 1)
        })
        anBg.onComplete(() => {

        })
        this.fadeOut(bg)

        this.scene.instance.add(bg.instance)
    }



    setEnd() {
        const end = new PlaneImg({
            img: endImg,
            width: 711,
            height: 8,
            top: 240
        })
        this.matter.setEnd(end)
        this.scene.instance.add(end.instance)
    }

    setBounds() {
        const bounds = new PlaneImg({
            img: boundsImg,
            width: 720,
            height: 80,
            bottom: 0
        })
        this.matter.setBounds(bounds)
        this.scene.instance.add(bounds.instance)
    }

    addFruits(key?: number): PlaneImg {
        const name = `Fruits-${key || Math.round(Math.random() * 4) + 1}`
        const fruits = new PlaneImg({
            img: fruitsConfig[name].img,
            width: fruitsConfig[name].width,
            height: fruitsConfig[name].height,
            top: 60
        })
        fruits.instance.name = name
        this.scene.instance.add(fruits.instance)
        fruits.instance.scale.set(0.2, 0.2, 0)
        new TWEEN.Tween({x: 0.2, y: 0.2}).to({x: 1, y: 1}, 150).start().onUpdate(({x, y}) => {
            fruits.instance.scale.set(x, y, 0)
        })
        return fruits
    }

    render() {
        TWEEN.update()
        this.matter.update()
        this.scene.render()
        requestAnimationFrame(this.render.bind(this))
    }

    touchStartFun = (event: any) => {
        if(this.status === Status.start) {
            this.status =Status.stop
            const x = event.touches ? event.touches[0].clientX : event.offsetX
            const { width } = getCanvas()
            const px = (x / width * 2 - 1) * config.frustumSize / 2
            const an = new TWEEN.Tween({x: this.currentFruits.instance.position.x}).to({x: px}, 400).start()
            an.onUpdate(({ x }) => {
                this.currentFruits.instance.position.x = x
            })
            an.onComplete(() => {
                this.matter.add(this.currentFruits, this.currentFruits.instance.name)
                setTimeout(() => {
                    this.status =Status.start
                    this.currentFruits = this.addFruits()
                }, 1000)
            })
        }
    }

    bindTouchStart() {
        if(this.canvas) on(this.canvas, this.touchStartFun)
    }

    removeTouchStart() {
        if(this.canvas) off(this.canvas, this.touchStartFun)
    }
}

export default Game