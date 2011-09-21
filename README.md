Description
===========
This tool was made for catching player related information from the [dotalicious gaming platform](http://www.dotalicious-gaming.com) in a redis database.
It catches the information for according ids and saves it for a certain period of time in the redis database.
Heavy load will therefor only affect the performance to a certain degree (because we don't fetch the information all the time from the DLG web page).

Supported json exports
======================

These are accessible by http://localhost:3000/user/id and so on

* /user/id
* /achievements/id
* /heroes/id

Webfrontend
===========
This project comes with a build in webfrontend (since it is build on top of express, there was no other way to for me ).

Install
=======

In order to install the used modules with npm, just write the following command line:
```sh
npm install express socket.io redis-node jsdom request jade
```
