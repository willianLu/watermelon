import { defineComponent, onMounted } from 'vue';
import Game from './game'

export default defineComponent({
    name: 'App',

    setup() {
        onMounted(() => {
            const game = new Game()
            game.init()
        })

        return () => (<canvas id="canvas"></canvas>)
    }
});