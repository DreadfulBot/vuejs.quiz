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
								a.start-game(v-if="!isGameStarted && !isGameFinished" v-on:click="startNewGame" v-bind:class="{ attention: !isBorderShow }") Начать игру
								a.start-game(v-if="isGameFinished" v-on:click="reloadGame" v-bind:class="{ attention: !isBorderShow }") Запустить заново

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

import {bindModal, showModal} from '../assets/js/modal'
import 'babel-polyfill'

export default {
	data: () => ({
		questions: null,
		questionsContext: null,

		isQuestionsLoaded: false,

		currentQuestionIndex: 0,

		wrongAnswers: 0,
		questionsAnswered: 0,

		isGameStarted: false,
		isGameFinished: false,
		isBorderShow: true,
		gameStartTime: null,
		gameEndTime: null,
		now: Math.trunc((new Date()).getTime() / 1000),
		isErrorObtained: false,

		timerInterval: null,
		borderInterval: null,
		isBusy: false,
		secret: null,
		discountCode: null,
		isIE: false,
	}),

    props: ['iServer'],

	computed: {
		seconds () {
			return this.gameEndTime
				? (this.gameEndTime - this.gameStartTime) % 60
				: (this.now - this.gameStartTime) % 60 > 0 ? (this.now - this.gameStartTime) % 60 : 0;
		},

		minutes () {
			return this.gameEndTime
				? Math.trunc((this.gameEndTime - this.gameStartTime) / 60) % 60
				: Math.trunc((this.now - this.gameStartTime) / 60) % 60;
		},

		hours () {
			return this.gameEndTime
				? Math.trunc((this.gameEndTime - this.gameStartTime) / 60 / 60) % 24
				: Math.trunc((this.now - this.gameStartTime) / 60 / 60) % 24;
		},

		days () {
			return this.gameEndTime
				? Math.trunc((this.gameEndTime - this.gameStartTime) / 60 / 60 / 24)
				: Math.trunc((this.now - this.gameStartTime) / 60 / 60 / 24);
		}
	},

	created () {
		this.isIE = this.checkIsIE();

		if (this.isIE) {
			return;
		}

		this.loadSecret()
			.then(() => {
				this.loadCookieContext();
				this.loadQuestionContextFromCookies();

				if (!this.questionsContext) {
					this.loadNewQuestions();
				} else {
					this.loadQuestionsFromCookieQuestionContext().then(() => {
						if (!this.isGameFinished) {
							this.initTimer(this.gameStartTime);
						}
						this.saveCookieContext();
					}).catch((e) => {
						console.log('unable to continue game');
						this.isErrorObtained = true;
					})
				}
			})
			.catch((e) => {
				console.log('unable to load secret');
				this.isErrorObtained = true;
			})
	},

	mounted () {
		this.isIE = this.checkIsIE();

		if (this.isIE) {
			return;
		}

		bindModal(this.$refs['show-callback'], document.querySelector('form#callback'));
	},

	methods: {
		async loadStatistics () {
			if (this.discountCode === null && this.wrongAnswers === 0) {
				let response = await this.iServer.loadStatistics(this.secret);
				this.discountCode = response.data.data.code;
			}

			setTimeout(() => {
				showModal(this.$refs['statistics'].cloneNode(true));
			}, 1000)
		},

		checkIsIE () {
			return !!window.MSInputMethodContext && !!document.documentMode;
		},

		findQuestionContext (questionId) {
			return this.questionsContext[questionId];
		},

		findQuestion (questionId) {
			return this.questions.find((element, index, array) => {
				return element.id === questionId;
			})
		},

		c (name) {
			console.log(name);
		},

		saveCookieContext () {
			this.$cookie.set('currentQuestionIndex', this.currentQuestionIndex, 1);
			this.$cookie.set('isGameFinished', this.isGameFinished, 1);
			this.$cookie.set('isGameStarted', this.isGameStarted, 1);
			this.$cookie.set('wrongAnswers', this.wrongAnswers, 1);
			this.$cookie.set('questionsAnswered', this.questionsAnswered, 1);
			this.$cookie.set('gameStartTime', this.gameStartTime, 1);
			this.$cookie.set('gameEndTime', this.gameEndTime, 1);
			this.$cookie.set('discountCode', this.discountCode, 1);
		},

		loadCookieContext () {
			this.currentQuestionIndex = this.$cookie.get('currentQuestionIndex') !== null
				? parseInt(this.$cookie.get('currentQuestionIndex'))
				: 0;

			this.isGameFinished = (this.$cookie.get('isGameFinished') === 'true');

			this.gameStartTime = this.$cookie.get('gameStartTime') !== null
				? this.$cookie.get('gameStartTime')
				: Math.trunc(new Date().getTime() / 1000);

			this.gameEndTime = this.$cookie.get('gameEndTime') !== null && this.$cookie.get('gameEndTime') !== 'null'
				? this.$cookie.get('gameEndTime')
				: null;

			this.isGameStarted = (this.$cookie.get('isGameStarted') === 'true');

			this.wrongAnswers = this.$cookie.get('wrongAnswers') !== null
				? parseInt(this.$cookie.get('wrongAnswers'))
				: 0;

			this.questionsAnswered = this.$cookie.get('questionsAnswered') !== null
				? parseInt(this.$cookie.get('questionsAnswered'))
				: 0;

			this.discountCode = this.$cookie.get('discountCode') !== null && this.$cookie.get('discountCode') !== 'null'
				? this.$cookie.get('discountCode')
				: null;
		},

		isDotGreen (questionIndex) {
			let question = this.findQuestionContext(questionIndex);

			if (question.userIndex === undefined || question.userIndex === null) {
				return false;
			}

			return question.userIndex === question.correctIndex;
		},

		isButtonGreen (questionId, answerIndex) {
			let question = this.findQuestionContext(questionId);

			if (question.userIndex === undefined || question.userIndex === null) {
				return false;
			}

			return question.correctIndex === answerIndex;
		},

		isDotRed (questionId) {
			let question = this.findQuestionContext(questionId);

			if (question.userIndex === undefined || question.userIndex === null) {
				return false;
			}

			return question.userIndex !== question.correctIndex;
		},

		isButtonRed (questionId, answerIndex) {
			let question = this.findQuestionContext(questionId);

			if (question.userIndex === undefined || question.userIndex === null) {
				return false;
			}

			return question.userIndex === answerIndex && question.correctIndex !== answerIndex;
		},

		isButtonGrey (questionId, answerIndex) {
			let question = this.findQuestionContext(questionId);

			if (question.userIndex === undefined || question.userIndex === null) {
				return true;
			}

			return question.userIndex !== answerIndex && question.correctIndex !== answerIndex;
		},

		reloadGame () {
			this.isQuestionsLoaded = false;
			this.isGameFinished = false;
			this.loadNewQuestions().then(() =>
				this.startNewGame()
			)
		},

		async loadNewQuestions () {
			let response = await this.iServer.loadNewQuestions();

			this.questions = Object.keys(response.data.data).map((key) => {
				return response.data.data[key];
			})

			this.questionsContext = this.questions.map((value) => {
				return {
					userIndex: value.userIndex,
					correctIndex: value.correctIndex,
					id: value.id
				};
			})

			this.saveQuestionContextToCookies();
			this.isQuestionsLoaded = true;
		},

		loadQuestionContextFromCookies () {
			this.questionsContext = JSON.parse(this.$cookie.get('questionsContext'));
		},

		saveQuestionContextToCookies () {
			this.$cookie.set('questionsContext', JSON.stringify(this.questionsContext));
		},

		async loadQuestionsFromCookieQuestionContext () {
			let ids = this.questionsContext.map((v) => { return v.id });
			let response = await this.iServer.loadQuestionsFromCookieQuestionContext(ids);

			this.questions = Object.keys(response.data.data).map((key) => {
				return response.data.data[key];
			})

			this.isQuestionsLoaded = true;
		},

		initTimer (gameStartTime) {
			this.gameStartTime = typeof gameStartTime !== 'undefined'
				? gameStartTime
				: Math.trunc(new Date().getTime() / 1000);

			if (!this.timerInterval) {
				this.timerInterval = window.setInterval(() => {
					this.now = Math.trunc((new Date()).getTime() / 1000)
				}, 1000);
			}
		},

		stopTimer () {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		},

		async loadSecret () {
			let secret = await this.iServer.loadSecret();
			this.secret = secret.data.data;
		},

		startNewGame () {
			this.currentQuestionIndex = 0;
			this.questionsAnswered = 0;
			this.gameEndTime = null;

			this.setRunButtonBorder(false);

			this.isGameStarted = true;
			this.isGameFinished = false;
			this.wrongAnswers = 0;

			this.initTimer();
			this.saveCookieContext();
		},

		setRunButtonBorder (isVisible) {
			switch (isVisible) {
				case true:
					if (!this.borderInterval) {
						this.borderInterval = window.setInterval(() => {
							this.isBorderShow = !this.isBorderShow;
						}, 1000);
					}
                break
				case false:
					if (this.borderInterval) {
						clearInterval(this.borderInterval);
					}
					this.isBorderShow = false;
                break;
			}
		},

		prologue () {
			if (!this.isGameStarted) {
				this.setRunButtonBorder(true);
				return false;
			} else {
				this.setRunButtonBorder(false);
				return true;
			}
		},

		goToQuestion (index) {
			if (!this.prologue()) {
				return;
			}
			if (this.isGameStarted) {
				this.currentQuestionIndex = index;
			} else {
				this.setRunButtonBorder(true);
			}
		},

		async processAnswer (event) {
			let question = this.findQuestionContext(this.currentQuestionIndex);

			if (question.userIndex !== undefined) {
				return;
			}

			let answerIndex = parseInt(event.currentTarget.id);

			let response = await this.iServer.processAnswer(question, this.secret);

			if (response.data.data !== answerIndex) {
				this.wrongAnswers++;
			}

			this.questionsAnswered++;

			question.userIndex = answerIndex;
			question.correctIndex = response.data.data;

			if (this.questionsAnswered === Object.keys(this.questions).length) {
				/* end of game */
				this.isGameFinished = true;
				this.gameEndTime = Math.trunc((new Date()).getTime() / 1000);
				this.stopTimer();
				this.loadStatistics().then(() => {
					this.saveQuestionContextToCookies();
					this.saveCookieContext();
				})
			} else {
				/* next question */
				this.currentQuestionIndex = (this.currentQuestionIndex + 1) % Object.keys(this.questions).length;
				this.saveQuestionContextToCookies();
				this.saveCookieContext();
			}
		},

		submitAnswer (event) {
			if (!this.prologue()) {
				return;
			}

			if (this.isGameFinished) {
				return;
			}

			if (this.isBusy) {
				return;
			}

			this.isBusy = true

			this.processAnswer(event).then(() => { this.isBusy = false })
		}
	}
}
</script>