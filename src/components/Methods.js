export default {
	// ******************************
	// game life cycle
	// ******************************
	onCreated () {
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

				if(this.settings.onCreated) this.settings.onCreated(this);
			})
			.catch((e) => {
				console.log('unable to load secret');
				this.isErrorObtained = true;
			})
	},

	onMounted () {
		this.isIE = this.checkIsIE();

		if (this.isIE) {
			return -1;
		}

		if(this.settings.onMounted) this.settings.onMounted();
	},

	onGameStart () {
		this.currentQuestionIndex = 0;
		this.questionsAnswered = 0;
		this.gameEndTime = null;

		this.setRunButtonBorder(false);

		this.isGameStarted = true;
		this.isGameFinished = false;
		this.wrongAnswers = 0;

		this.initTimer();
		this.saveCookieContext();

		if(this.settings.onStarted) this.settings.onStarted(this);
	},

	onGameFinished () {
		this.isGameFinished = true;
		this.gameEndTime = Math.trunc((new Date()).getTime() / 1000);
		this.stopTimer();

		this.loadStatistics().then(() => {
			this.saveQuestionContextToCookies();
			this.saveCookieContext();

			if(this.settings.onFinished) this.settings.onFinished(this);
		})
	},

	onQuestionChanged () {
		this.currentQuestionIndex = (this.currentQuestionIndex + 1) % Object.keys(this.questions).length;
		this.saveQuestionContextToCookies();
		this.saveCookieContext();

		if(this.settings.onQuestionChanged) this.settings.onQuestionChanged(this);
	},

	onGameRestarted () {
		this.isQuestionsLoaded = false;
		this.isGameFinished = false;
		this.loadNewQuestions().then(() => {
			this.onGameStart();
			if(this.settings.onGameRestarted) this.settings.onGameRestarted(this);
		})
	},

	// ******************************
	// other stuff
	// ******************************

	async loadStatistics () {
		if (this.discountCode === null && this.wrongAnswers === 0) {
			let response = await this.settings.iServer.loadStatistics(this.secret);
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

	async loadNewQuestions () {
		let response = await this.settings.iServer.loadNewQuestions();

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
		let ids = this.questionsContext.map((v) => {
			return v.id
		});
		let response = await this.settings.iServer.loadQuestionsFromCookieQuestionContext(ids);

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
		let secret = await this.settings.iServer.loadSecret();
		this.secret = secret.data.data;
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

		let response = await this.settings.iServer.processAnswer(question, this.secret);

		if (response.data.data !== answerIndex) {
			this.wrongAnswers++;
		}

		this.questionsAnswered++;

		question.userIndex = answerIndex;
		question.correctIndex = response.data.data;

		if (this.questionsAnswered === Object.keys(this.questions).length) {
			this.onGameFinished();
		} else {
			this.onQuestionChanged();
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

		this.processAnswer(event).then(() => {
			this.isBusy = false
		})
	}
}
