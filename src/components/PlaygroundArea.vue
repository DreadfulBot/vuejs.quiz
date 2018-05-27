<template lang="pug">

	.playground-area(v-bind:class="{notAllowed: isIE}")
		.alert(v-if="isIE")
			p Игра для обозревателей InternetExplorer не поддерживается.

		.main-area(v-if="!isIE")
			.top-bar
				ul(v-if="isQuestionsLoaded")
					li(v-for="(question, index) in questions" v-bind:key="(question, index)")
						a(v-on:click="goToQuestion(index)" v-bind:id="index")
							i.fa.fa-circle(v-bind:class=" { green: isDotGreen(index), red: isDotRed(index) }")

			.question-area
				a.start-game(v-if="!isGameStarted && !isGameFinished" v-on:click="onGameStart" v-bind:class="{ attention: !isBorderShow }") Начать игру
				a.start-game(v-if="isGameFinished" v-on:click="onGameRestarted" v-bind:class="{ attention: !isBorderShow }") Запустить заново

				transition(appear name="custom-classes-transition" enter-active-class="animated slideInUp")
					div(v-if="isQuestionsLoaded" v-html="questions[currentQuestionIndex].text" v-bind:key="currentQuestionIndex")
					div(v-else-if="isErrorObtained") Не удалось начать игру. Попробуйте перезагрузить страницу.
					div(v-else) Загрузка игры...

			template(v-if="isQuestionsLoaded")
				transition-group.answers-area(appear tag="div" name="custom-classes-transition" enter-active-class="answers-area-enter")
					.answer-button(v-for="(answer, index) in questions[currentQuestionIndex].answers" v-on:click="submitAnswer" v-bind:key="`ab-${index}-${currentQuestionIndex}`" v-bind:id="index" v-bind:class=" { 'gradient-grey': isButtonGrey(currentQuestionIndex, index), 'gradient-green': isButtonGreen(currentQuestionIndex, index), 'gradient-orange' : isButtonRed(currentQuestionIndex, index) } ")
						.wrapper(v-html="answer.text" v-bind:key="`at-${index}-${currentQuestionIndex}`")

			a.sign-in.sign-in-button.show-callback(ref="show-callback") Записаться на игру

		.sidebar(v-if="!isIE")
			.wrapper(ref="statistics")
				h3 Игровая статистика
				p Вопрос:
					span.fillable(v-if="isQuestionsLoaded")
						|
						| {{ currentQuestionIndex + 1 }} /
						|
						| {{ Object.keys(questions).length }}
					span.fillable(v-else) 0/0
				p Неверных ответов:
					span.fillable(v-if="isQuestionsLoaded")
						|
						| {{ wrongAnswers }} /
						|
						| {{ Object.keys(questions).length }}
					span.fillable(v-else) 0/0
				p Затраченное время:
					span.fillable(v-if="gameStartTime")
						|
						| {{ days }} : {{ hours }} : {{ minutes }} : {{ seconds }}
					span.fillable(v-else)
						|
						| 0 : 0 : 0 : 0
				.winner(v-if="discountCode")
					p Поздравляем! Ваш код на 5% скидку:
					span
						|
						| {{ discountCode }}
						|
					p Назовите его, когда придете <a href="/gde-i-kogda-igrayem/">записываться к нам на игру!</a>
			.logo
</template>

<script>

import { Core } from './Core';
import 'babel-polyfill'

export default {
	extends: Core,

	props: ['settings'],

	created () {
		this.onCreated();
		this.onGameStart();
	},

	mounted () {
		this.onMounted();
	},

	methods: {

	}
}
</script>

<style lang="stylus">
	@require '../assets/style/media-mixins.styl'
	@require '../assets/style/common.styl'
</style>
