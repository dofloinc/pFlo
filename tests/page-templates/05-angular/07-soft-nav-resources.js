/*eslint-env mocha*/
/*global PFLO_test*/

/*
* This app uses a delayed angular.bootstrap (and no ng-app)
* directive.
*/
describe("e2e/05-angular/07-soft-nav-resources", function() {
	PFLO_test.templates.SPA["07-soft-nav-resources"]();
});
