angular.module('app.layouts').controller('DefaultLayoutController', function(
    $scope,
    $state,
    $log,
    $Configuration,
    $Identity,
    $ionicHistory,
    $Localization,
    $timeout,
    CONFIGURATION
) {

    //------------------------------------------------------------------------------------
    // Model
    $scope.config = {
        identity: $Identity,
        application: $Configuration.get("application"),
        notifications: 0,
        menu:  [{
            route: "app.home",
            icon: "ion-ios-bookmarks",
            label: "Guía Maestra",
            active: true
        }, {
            route: "app.store-selector/index",
            icon: "ion-ios-location",
            label: "Locales"
        }, {
            route: "app.estimations/index",
            icon: "ion-ios-paper",
            label: "Cotizaciones"
        }, {
            route: "app.notifications/index",
            icon: "ion-ios-bell",
            label: "Notificaciones"
        }]
    };

    // Only if the user is Authenticated
    // Set the model user
    if ($Identity.isAuthenticated()) {
        $scope.config.user = $Identity.getCurrent();
    }

    //------------------------------------------------------------------------------------
    // Layout Actions
    $scope.throwError = function(code, exception) {

        var description = $Localization.get("ERR." + code);

        switch (code) {
            case "PRODUCTS_NOT_FOUND":
                code = "Producto Inválido";
                break;
            case "PRODUCT_NOT_IN_YARD":
                code = "Producto Inválido";
                break;
        }


        Toaster.error(description, code);



        //Debugger?
        if (exception && CONFIGURATION.debugging) {
            $log.error(exception);
        }

    };

    $scope.navigateTo = function(item) {

        //----------------------------------- 
        //Mark as Active
        angular.forEach($scope.config.menu, function(item) {
            item.active = false;
        });
        item.active = true;

        //----------------------------------- 
        // If the current View is the clicked menu item, do nothing ;)
        if ($ionicHistory.currentView().stateId == item.route) {
            return;
        };

        //----------------------------------- 
        // Try to remove the cache from history if view exist's , 
        // (always try to reload if clicked from menu)
        $ionicHistory.clearCache([item.route]).then(function() {
            //-----------------------------------
            // Navigate
            $state.go(item.route);
        })

    };

    $scope.logOut = function() {

        ApplicationCleanse.clean(false).then(function() {

            $state.go("app.home/index");
            var delay = $timeout(function() {
                $timeout.cancel(delay);

                $Identity.logOut();
            }, 200);

        });
    };

});
