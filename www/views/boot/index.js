angular.route('boot/index', function(
    $state,
    $log,
    $Configuration,
    $location,
    $LocalStorage,
    $q,
    $Identity,
    $cordovaSplashscreen,
    $cordovaAppVersion
) {

    //Wait for Platform Ready
    ionic.Platform.ready(function() {
        var stamps = $Configuration.get("localstorageStamps");
        var new_version_defer = $q.defer();

        var onBooted = function() {
            // --------------------------------
            //FIRST TIME???, CONFIGURE!!
            if (!$LocalStorage.get(stamps.personal_data)) {
                $state.go("public.firstRun/configure");
                return;
            }
            // --------------------------------

            // --------------------------------
            // MANUAL BOOT
            var path = $location.search().path;

            //Reset when path are in "boot" or "exception"
            if (path.length <= 2 ||
                path.indexOf("/boot") == 0 ||
                path.indexOf("exception") > 0) {
                var url = $Configuration.get("application");
                path = url.home;
            }

            $location.url(path);
            // --------------------------------
        };

        //When all Process are Checked, run APP
        $q.all([
            new_version_defer.promise
        ]).then(onBooted, function(err) {
            if (err == "NEW_VERSION") {
                onBooted(); //Go to the first Page
            } else {
                $log.error(err);
            }
        });


        // ---------------------------------------------------------
        // NEW VERSION! (ONLY WHEN NEW VERSION IS ACQUIRED)
        if ($LocalStorage.get(stamps.new_version)) {

            new_version_defer.resolve(); //Do something??

            //Remove new Version Flag
            $LocalStorage.remove(stamps.new_version);

        } else {
            new_version_defer.resolve();
        }
        // ---------------------------------------------------------

        //Hide Splash Screen 
        if (ionic.Platform.isWebView()) {
            $cordovaSplashscreen.hide();
        }
    });

});
