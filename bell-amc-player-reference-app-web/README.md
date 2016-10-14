# Bell AMC Player Web Reference App

A copy of the reference application provided by Ericsson that instantiate the [Bell AMC Flash Player](https://github.com/mirego/bell-amc-player-flash) for which we must modify the UI and the API. It allows us to test our changes in a simple web application.

This project must be in sync with the new versions provided by Ericsson (see [zip folder](https://github.com/mirego/bell-amc-player-reference-app-web/tree/master/zip)).

## Running / Development

N.B.: This application is tightly coupled with the [Bell AMC Flash Player](https://github.com/mirego/bell-amc-player-flash) project. 

Initially, make sure to checkout both projects in the same base folder as follow:

![projects folder structure](https://cloud.githubusercontent.com/assets/513491/16659070/9dde9964-4436-11e6-965c-990b6249236d.png)

* In a terminal, go to your base folder.
* Run `python -m SimpleHTTPServer 8080`
* Visit your app at [http://localhost:8080/bell-amc-player-reference-app-web/](http://localhost:8080/bell-amc-player-reference-app-web/).

This will allow you to build the Flash version directly in `Flash Builder` and run the Flash project on this URL directly for easy debugging.
