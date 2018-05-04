# vuejs-quiz

![vuejs-quiz](relative/path/to/img.jpg?raw=true "vuejs-quiz")

# for what?

> VueJS component for creating quizes where user should choose 1 right answer of 4 variants

# where could i use it?

> Anywhere. As for me: this component was created for quiz-game multipage site on CMS Wordpress. Questions and Answers were released with help of [Advanced Custom List plugin](https://ru.wordpress.org/plugins/advanced-custom-fields/). I wrote php page template that gets data from acl fields, makes some logic and send json answers to VueJS component.

> backend-script you can see in *example/online-game.php*

# usage

> How to install and correctly use component you can see in *'example/index.js'*.

* Install Vue;
* Install VueCookie, tell Vue to use it;
* Add component in Vue;
* Create object/class that implements all methods, that are present in *src/assets/js/iServer.js*;
* If you have any problems on this step - see examples in **src/assets/js* folder;
* Add html-placeholder for component;
* Pass object from p.4 as *iServer* prop to component;

### attention

> One important think - as you could see, component need one prop to be set = **iServer**. In OOP terms, this object is implementation of server-communication interface. You can see it structure in *src/assets/js/iServer.js*. 

In example, there are 2 implementation of **iServer**: 
* **iServerLocal.js** - just returning json objects with required fields, backend is not needed;
* **iServerRemote.js** - axios-based implementation, that could get data over HTTP-GET requests from server;

As an example, you could use **iServerLocal.js** and start project on local machine, no backend needed.

# can i see examples?

> In folder "templates". 