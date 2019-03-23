# Multithreading
Node.js is single-threaded. So is Jamment. In high performance environments, several instances of Node programs are usually launched in parallel. [PM2](https://pm2.io/runtime/) is genrally used for that.

Nevertheless, as said in introduction, the API only works when there is a **write task**. As everything is cached, 99% of the work is done by the webserver.

The API only works when a comment is submitted, edited or deleted. And even when this happens, as these tasks are mostly IO (DB read/write and FS write) and due to the async nature of Node, you shouldn't need more than a single thread, unless you are facing hundreds of new comments per minute.
