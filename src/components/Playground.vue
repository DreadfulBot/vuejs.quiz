<template lang="pug">
    .playground.container
        .wrap-content
            h4.title Клуб интеллектуальных игр<br/>“Genium Паб-Квиз”
            h2.title Приглашает Вас сыграть в быструю онлайн игру и заработать 5% скидки на живое участие
            PlaygroundArea

</template>

<script>
    import PlaygroundArea from "./PlaygroundArea.vue"

    export default {
        components: {
            PlaygroundArea
        }
    }
</script>

<style lang="stylus" scoped>
    @import "../assets/style/common.styl"
</style>
