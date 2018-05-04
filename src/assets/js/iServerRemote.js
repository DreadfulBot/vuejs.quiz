import axios from 'axios/dist/axios.min'

class iServerRemote {
	constructor () {
		this.url = isDev
			? 'http://localhost:81/mamochkagoda/online-game/'
			: 'http://quiz.kondratest.ru/online-game/'
	}

	async loadStatistics (secret) {
		return axios.get(`${this.url}?game_mode=load_discount_code&secret=${secret}`);
	}

	async loadNewQuestions () {
		return axios.get(`${this.url}?game_mode=start_new_game`);
	}

	async loadQuestionsFromCookieQuestionContext(ids) {
		return axios.get(`${this.url}?game_mode=continue_game&question_index=${ids.join(',')}`);
	}

	async loadSecret () {
		return axios.get(`${this.url}?game_mode=generate_secret`);
	}
	async processAnswer (question, secret) {
		return axios.get(`${this.url}?game_mode=load_correct_answer&question_index=${question.id}&secret=${secret}`);
	}
}

export {iServerRemote as iServer};