import Vue from 'vue';
import VueCookie from 'vue-cookie';

import PlaygroundArea from '../src/components/PlaygroundArea.vue';
import {iServer} from '../src/assets/js/iServerRemote';

Vue.config.productionTip = isDev;
Vue.use(VueCookie);

new Vue({
	el: '#app',
	components: { PlaygroundArea },
	computed: {
		iServer () {
			return new iServer();
		}
	},
	template: '<PlaygroundArea :iServer="iServer"/>',
});

