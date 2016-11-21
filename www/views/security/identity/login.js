angular.route('security/identity/login/:redirect?', function(
    $log,
    $Configuration,
    $state,
    $location,
    $scope,
    $stateParams,
    $ionicHistory,
    $cordovaSingleSignOn
) {
    var vm = $scope.model = {
        apps: [{
            name: "App Sodimac",
            client_id: "789156083925170982900",
            selected: true,
            scope: [
                "profile",
                "delivery",
                "payment"
            ]
        }, {
            name: "Cotizador Virtual (no-consent)",
            prompt: "none",
            client_id: "704082870266602389600",
            scope: [
                "profile"
            ]
        }]
    };
    $scope.setApp = function(app) {
        angular.forEach(vm.apps, function(a) {
            a.selected = false;
        });
        app.selected = true;

        //FOR DEMO PURPOSES
        delete vm.user;
        delete vm.error;
    };

    $scope.authenticate = function() {
        var app = _.find(vm.apps, {
            selected: true
        });

        //FOR DEMO PURPOSES
        delete vm.user;
        delete vm.error;

        var features = {};
        if (app.prompt) {
            features["prompt"] = app.prompt;
        };

        $cordovaSingleSignOn.setAppId(app.client_id);
        $cordovaSingleSignOn.login(app.scope, features)
            .then(function(oauth) {
                $log.debug(oauth);
                $cordovaSingleSignOn.api("me")
                    .then(function(user) {
                        vm.user = user;
                    });
            }, function(e) {
                $log.debug(e);
                vm.error = e;
            });
    };

    $scope.onCancel = function() {
        $ionicHistory.goBack();
    }

});
