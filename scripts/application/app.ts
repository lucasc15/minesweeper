/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
'use strict';
module MinesweeperApp {

    var routeConfig = function ($stateProvider) {
        $stateProvider
            .state('default', {
                url: '/',
                templateUrl: "templates/home.html",
                controller: HomeController
            })
            .state('home', {
                url: '/home',
                templateUrl: "templates/home.html",
                controller: HomeController
            })
            .state('game-config-size', {
                url: '/game-config',
                templateUrl: "templates/game-config.html",
                controller: GameConfigController
            })
            .state('game-config-difficulty', {
                url: '/game-config/:x/:y',
                templateUrl: "templates/game-config.html",
                controller: GameConfigController,
                // params: {x: 10, y: 10}
            })
            .state('game', {
                url: '/game/:x/:y/:difficulty',
                templateUrl: "templates/game.html",
                controller: GameController,
                // params: {x: 10, y: 10, difficulty: 10}
            })
            .state('score', {
                url: '/scores',
                templateUrl: "templates/score.html",
                controller: ScoreController
            })
    }
    routeConfig.$inject = ['$stateProvider']

    angular.module('minesweeperApp', ['ui.router', 'ngRoute'])
        .controller('homeController', HomeController)
        .controller('gameConfigController', GameConfigController)
        .controller('gameController', GameController)
        .controller('scoreController', ScoreController)
        .service('gameService', GameService)
        .config(routeConfig);
}