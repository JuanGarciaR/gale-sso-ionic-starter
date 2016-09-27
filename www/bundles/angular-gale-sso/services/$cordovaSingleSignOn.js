angular.module('gale.services')

.provider('$cordovaSingleSignOn', function() {
    var $this = this;

    //Configurable Variable on .config Step
    var _appId = null;
    var _ssoBaseURL = null;

    this.setAppId = function(value) {
        _appId = value;
        return $this;
    };

    this.setApiUrl = function(value) {
        //ADD THE "/" AT THE END IF NOT SET
        if (value && !value.endsWith("/")) {
            value += "/";
        }

        _ssoBaseURL = value;
        return $this;
    };

    this.$get = function($q, $Api) {
        var self = this;
        var _authResponse = null;

        self.getAppId = function() {
            if (!_appId) {
                throw Error("APP_ID_NOT_SET");
            }
            return _appId;
        };

        self.getApiUrl = function() {
            if (!_ssoBaseURL) {
                throw Error("SSO_BASEURL_NOT_SET");
            }
            return _ssoBaseURL;
        };

        self.getAccessToken = function() {
            if (!_authResponse) {
                throw Error("MUST_CALL_LOGIN_BEFORE_GET_ACCESSTOKEN");
            }
            return _authResponse.access_token;
        };

        self.login = function(permissions, settings) {
            var defer = $q.defer();
            var mode = typeof ionic == "object" ? "ionic" : "browser";

            //Check if Develop in a browser :P
            if (mode == "ionic") {
                //If Not in WebView (Device) , set mode browser
                if (!ionic.Platform.isWebView()) {
                    mode = "browser";
                }
            }

            var scopes = permissions.join(","); //Scopes requested
            var response_type = "token"; //Better for javascript is token
            var redirect_uri = "oauth2/v2/connect/oauth2_callback.html?origin="; //Dummy redirect uri
            var state = null; //some usefully text?
            var prompt = (settings.prompt || "consent"); //Always show consent dialog
            var sso_baseURL = (function() {
                var pathArray = self.getApiUrl().split('/');
                var protocol = pathArray[0];
                var host = pathArray[2];
                return url = protocol + '//' + host;
            })();
            var oauth2URL = [
                self.getApiUrl(), "oauth2/v2/auth",
                "?response_type=", response_type,
                "&client_id=", self.getAppId(),
                "&redirect_uri=", self.getApiUrl(), redirect_uri, location.origin,
                "&scope=", scopes,
                "&prompt=", prompt,
                "&state=", state
            ].join("");

            var parseFragment = function(uri) {
                var parsed = $q.defer();
                var qs = uri.substring(uri.indexOf("#") + 1).split("&");

                var build = function(tokens) {
                    var j = {};
                    for (var q in qs) {
                        var text = qs[q];
                        for (var prop in tokens) {
                            var name = tokens[prop];
                            if (text.indexOf(name) == 0) {
                                var value = text.replace(name + "=", "");
                                j[tokens[prop]] = (name == "expires_in" ? parseInt(value) : value);
                                continue;
                            }
                        };
                    };
                    return j;
                };

                setTimeout(function() {
                    var isSuccess = (function(uri) {
                        var ok = false;
                        angular.forEach(qs, function(q) {
                            if (q.indexOf("access_token") == 0) {
                                ok = true;
                                return false;
                            };
                        });
                        return ok;
                    })();

                    //Is Authenticate
                    if (isSuccess) {
                        var j = build(["access_token",
                            "expires_in",
                            "token_type"
                        ]);
                        _authResponse = j; //Set the authResponse, for after call's
                        parsed.resolve({
                            authResponse: j,
                            status: "connected"
                        });
                    } else {
                        var j = build([
                            "error"
                        ]);
                        parsed.reject({
                            status: "not_connected",
                            error: j
                        });
                    }

                }, 10);

                return parsed.promise;
            };

            //URI to match
            var callback_match = self.getApiUrl() + redirect_uri + location.origin;
            switch (mode) {
                case "ionic":
                    //Open a Browser Plugin
                    var features = [
                        "toolbar=no",
                        "location=no",
                        "clearsessioncache=no",
                        "clearcache=no"
                    ].join(",");

                    var browser = cordova.InAppBrowser.open(oauth2URL, '_blank', features);
                    browser.addEventListener('loadstop', function(e) {
                        if (e.url.indexOf(callback_match) == 0) {
                            parseFragment(e.url).then(function(data) {
                                browser.close();
                                defer.resolve(data);

                            }, function(e) {
                                browser.close();
                                defer.reject(e);
                            });
                        }
                    });
                    break;
                case "browser":
                    var height = 600;
                    var width = 650;
                    var left = (screen.width / 2) - (width / 2);
                    var top = (screen.height / 2) - (height / 2);
                    var features = [
                        "toolbar=0",
                        "location=0",
                        "directories=0",
                        "status=0",
                        "menubar=0",
                        "scrollbars=0",
                        "resizable=0",
                        "copyhistory=0",
                        "width=" + width,
                        "height=" + height,
                        "top=" + top,
                        "left=" + left
                    ].join(",");

                    var finaly = false;
                    var opener = window.open(oauth2URL, "oauth2_sso", features);
                    var fn = function(e) {
                        if (!finaly && e.origin == sso_baseURL && e.data.indexOf(callback_match) == 0) {
                            //AUTH SUCCESS OR ERROR
                            window.removeEventListener("message", fn);
                            parseFragment(e.data).then(function(data) {
                                defer.resolve(data);
                            }, function(e) {
                                defer.reject(e);
                            });
                            finaly = true;
                        }
                    };
                    window.addEventListener("message", fn);
                    break;
            };

            return defer.promise;
        };

        self.api = function(query) {
            var defer = $q.defer();
            var accessToken = self.getAccessToken();
            $Api.read("{sso_url}Accounts/{query}", {
                    sso_url: _ssoBaseURL,
                    query: query
                }, {
                    Authorization: "Bearer " + accessToken
                })
                .success(function(data) {
                    defer.resolve(data);
                })
                .error(function(err) {
                    defer.reject(err);
                });

            return defer.promise;
        };

        return self;
    };
});
