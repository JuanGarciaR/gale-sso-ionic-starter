/*

    gale:                   ANGULAR-GALE LIBRARY
    ionic:                  IONIC SDK
    app:                    CUSTOM PROJECT LIBRARY
    sodimac:                SODIMAC COMPONENTS
    mocks:                  MOCKS ONLY FOR TESTING
    ngCordova:              CORDOVA LIBRARY
    angularMoment:          ANGULAR MOMENT JS
    ngIOS9UIWebViewPatch:   IOS 9 FICKLERING PATCH (https://gist.github.com/IgorMinar/863acd413e3925bf282c)

*/
angular.module('App', [
        'gale',
        'gale-sso',
        'ionic',
        'app',

        'ngCordova'
    ])
    .run(function($location, $Configuration, $log) {

        //REDIRECT TO MAIN HOME (ONLY WHEN NO HAVE PATH)
        var currentPath = $location.url();
        var boot = $location.path("boot").search({
            path: currentPath
        });
        $location.url(boot.url());

    })
    //CHANGE STATUS BAR TO LIGHT CONTENT
    .run(function($ionicPlatform) {
        //IOS, SET Light Background in Fullscreen mode
        $ionicPlatform.ready(function() {
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
            //Disable Keyboard Scroll
            if (ionic.Platform.isWebView()) {
                cordova.plugins.Keyboard.disableScroll(true);
            }
        });
    })
    .config(function($cordovaSingleSignOnProvider, $ApiProvider, CONFIGURATION) {
        var Endpoints = CONFIGURATION.Endpoints;

        //API Base Endpoint
        $ApiProvider.setEndpoint(Endpoints.SSO);

        //Single Sign On Configuration
        $cordovaSingleSignOnProvider
            .setAppId("ODIzNzNkZjItYmU3Mi00ZGQ3LWExNmMtNzUwYWU4ZDM2MGNh")
            .setApiUrl(Endpoints.SSO);
    })
    .config(function($IdentityProvider) {
        $IdentityProvider
            .enable() //Enable
            .setLogInRoute("security/identity/login")
            .setWhiteListResolver(function(toState, current) {

                //Only Enable Access to Exception && Public State's
                if (toState.name.startsWith("boot") ||
                    toState.name.startsWith("blank.") ||
                    toState.name.startsWith("exception.") ||
                    toState.name.startsWith("public.")) {
                    return true;
                }

                //Restrict Other State's
                return false;

            });
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                // ---------------------------------------------
                // DEFAULT LAYOUT (LOGGED USER)
                // ---------------------------------------------
                templateUrl: "views/layouts/default.html",
                controller: "DefaultLayoutController"
            })
            .state('public', {
                url: "/public",
                abstract: true,
                // ---------------------------------------------
                // PUBLIC LAYOUT (ANONYMOUS)
                // ---------------------------------------------
                templateUrl: "views/layouts/public.html",
                controller: "PublicLayoutController"
            })
            .state('exception', {
                url: "/exception",
                abstract: true,
                // ---------------------------------------------
                // EXCEPTION TEMPLATE
                // ---------------------------------------------
                templateUrl: "views/layouts/exception.html",
                controller: "ExceptionLayoutController"
            });

        $urlRouterProvider.otherwise(function($injector, $location) {
            if ($location.path() !== "/") {
                var $state = $injector.get("$state");
                var $log = $injector.get("$log");

                $log.error("404", $location);
                $state.go("exception.error/404");
            }
        });
    })
    .config(function($logProvider, CONFIGURATION) {
        $logProvider.debugEnabled(CONFIGURATION.debugging || false);
    });
