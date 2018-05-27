class Settings {
	constructor(iServer) {
		this.iServer = iServer;
	}

	bindOnCreated(onCreated) {
		this.onCreated = onCreated;
	}

	bindOnMounted(onMounted) {
		this.onMounted = onMounted;
	}

	bindOnStarted(onStarted) {
		this.onStarted = onStarted;
	}

	bindOnFinished(onFinished) {
		this.onFinished = onFinished;
	}

	bindOnQuestionChanged(onQuestionChanged) {
		this.onQuestionChanged = onQuestionChanged;
	}

	bindOnGameRestarted(onGameRestarted) {
		this.onGameRestarted = onGameRestarted;
	}
}

export {Settings};
