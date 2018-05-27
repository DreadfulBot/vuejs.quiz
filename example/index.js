import Vue from 'vue';
import VueCookie from 'vue-cookie';

import PlaygroundArea from '../src/components/PlaygroundArea.vue';

import {iServer} from '../src/assets/js/iServerRemote';
import {Settings} from '../src/assets/js/Settings';
import {bindModal} from '../src/assets/js/modal'


Vue.config.productionTip = isDev;
Vue.use(VueCookie);

let settings = new Settings(new iServer());

settings.bindOnCreated(function(context) {
	context.ya = new window.Ya.Metrika({id: 48835910});
});

settings.bindOnMounted(function (context) {
	bindModal(context.$refs['show-callback'], document.querySelector('form#callback'));
});

settings.bindOnStarted(function (context) {
	context.ya.reachGoal('quiz_started');
});

settings.bindOnFinished(function (context) {
	context.ya.reachGoal('quiz_finished');
});

settings.bindOnQuestionChanged(function (context) {
	context.ya.reachGoal('quiz_next_question');
});

settings.bindOnGameRestarted(function (context) {
	context.ya.reachGoal('quiz_restarted');
});

new Vue({
	el: '#app',
	components: { PlaygroundArea },
	computed: {
		settings () {
			return settings;
		}
	},
	template: '<PlaygroundArea :settings="settings" />',
});

