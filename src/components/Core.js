import Methods from './Methods';

let Core = {
	data: () => {
		return {
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
		}
	},

	props: ['settings'],

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

	methods: Methods
}

export {Core};
