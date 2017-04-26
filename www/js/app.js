// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', [
    'ionic',
    'ui.router',
    'ngCordova',
    'app.controllers',
    'app.services',
    'app.filters',
    'nemLogging',
    'uiGmapgoogle-maps',
    'google.places',
    'ngIOS9UIWebViewPatch',
    'ionicLazyLoad',
    'ionic.contrib.ui.tinderCards'
])
        .value('OAuth', {
            fb: {
                app_id: '1780795122136268',
                client_id: '5cc15374b0353ae0e66a4d664b8b67d8',
                profile_url: 'https://graph.facebook.com/v2.7/me',
                picture_url: 'https://graph.facebook.com/v2.7/me'
            }
        })
        .value('Config', {
            base_url: 'http://api.petbondweb.com/api',
            //base_url: 'http://localhost:8022/app_dev.php/api',
            base_url_web: 'http://api.petbondweb.com/',
            base_url_web_images: 'http://api.petbondweb.com/uploads/imagenes/',
            //base_url_web_images: 'http://localhost:8022/uploads/imagenes/'
            // com.ionicframework.petmatch649866
            version: '2.3.1'
        })
        .run(function ($http, $ionicPlatform, authService, $rootScope, $state,
                       $ionicHistory, $cordovaNetwork, $cordovaGeolocation, $localStorage,
                       $ionicLoading, $ionicPopup, $cordovaToast, $location) {
            $rootScope.showLoader = function (enabled) {
                if (enabled) {
                    $ionicLoading.show({
                        template: '<ion-spinner class="spinner-calm" icon="android"></ion-spinner>',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 120,
                        showDelay: 0
                    });
                } else {
                    $ionicLoading.hide();
                }
            };

            // Error Handler
            $rootScope.error = function (text) {
                $ionicPopup.alert({
                    title: 'Lo sentimos',
                    template: text
                });
            };

            // Message Handler
            $rootScope.showMessage = function (text) {
                $ionicPopup.alert({
                    title: 'Petbond',
                    template: text
                });
            };

            // Force Logout
            $rootScope.forceLogout = function () {
                authService.setUser({});
                $localStorage.set('userFacebook', {}, true);
                $state.go('app.login');
                $ionicHistory.nextViewOptions({disableBack: 'true'});
                $ionicHistory.clearHistory();
                $ionicHistory.clearCache();
            };


            // API Preset Error Definition
            $rootScope.getErrorDescription = function (code) {
                var description = '';
                switch (code) {
                    case 0:
                        description = "La operación fue realizada con exito!";
                        break;
                    case 1:
                        // Invalid HTTP Method
                        description = "#001 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 2:
                        // Invalid request content-type
                        description = "#002 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 3:
                        // Malformed request: Empty request body
                        description = "#003 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 4:
                        // Malformed request: Bad JSON
                        description = "#004 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 5:
                        // Malformed request: Missing Parameters
                        description = "#005 - Por favor llena todos los campos obligatorios y vuelve a intentarlo.";
                        break;
                    case 6:
                        // Object requested was not found in database
                        description = "#006 - No se encontró lo que quieres ver, por favor intenta más tarde.";
                        break;
                    case 7:
                        // Method disabled
                        description = "#007 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 8:
                        // Relation was not found in database
                        description = "#008 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 9:
                        // File not allowed
                        description = "#009 - El archivo no cumple con los requisitos, favor de intentar de nuevo.";
                        break;
                    case 10:
                        // Authentication error, username not found in databse
                        description = "#010 - Usuario y/o contraseña incorrectos, por favor intenta de nuevo.";
                        break;
                    case 11:
                        // Authentication error, please check username and password combination
                        description = "#011 - Usuario y/o contraseña incorrectos, por favor intenta de nuevo.";
                        break;
                    case 12:
                        // Access forbidden
                        description = "#012 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 13:
                        // Authentication failed
                        description = "#013 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 14:
                        // Invalid email address provided
                        description = "#014 - El correo electrónico ingresado no tiene el formato correcto.";
                        break;
                    case 15:
                        // Email address is already registered
                        description = "#015 - El correo electrónico ya esta registrado en la aplicación.";
                        break;
                    case 16:
                        // User not found
                        description = "#016 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 17:
                        // Event not found
                        description = "#017 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 18:
                        // Sport code not found
                        description = "#018 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 19:
                        // Invalid datestamp format
                        description = "#019 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                    case 20:
                        // User has already joined the event
                        description = "#020 - Ya eres parte de esta comunidad!";
                        break;
                    case 21:
                        // User has not joined the event
                        description = "#021 - No eres parte de esta comunidad!";
                        break;
                    case 22:
                        // No messages found for event
                        description = "#022 - No hay mensajes que mostrar";
                        break;
                    case 23:
                        // Message not found
                        description = "#023 - No se encontró el mensaje.";
                        break;
                    case 25:
                        // User is not owner
                        description = "#025 - Únicamente el creador de la publicacion puede eliminarla.";
                        break;
                    case 27:
                        // Facebook didn't get right token
                        description = "#027 - Ha ocurrido un error con la autenticación por Facebook, por favor intenta más tarde.";
                        break;
                    case 28:
                        // Facebook didn't get the info
                        description = "#028 - Ha ocurrido un error con la autenticación por Facebook, por favor intenta más tarde.";
                        break;
                    default:
                        // Uknown internal error
                        description = "#099 - Ha ocurrido un error en la aplicación, por favor intenta más tarde.";
                        break;
                }

                return description;
            };

            // Presets
            $rootScope.filters = [
                {value: 'M', texto: 'Mis publicaciones'},
                {value: 'F', texto: 'Favoritos'}
            ];

            $rootScope.tipos = [
                {value: 'P', texto: 'Mascota perdida'},
                {value: 'E', texto: 'Mascota encontrada'},
                {value: 'A', texto: 'Mascota en adopción'},
                {value: 'N', texto: 'Buscando novio / novia'}
            ];

            $rootScope.getTipos = function(){
                var arreglo = [];
                arreglo.push({value: '' , texto: 'Todos'});
                return arreglo.concat($rootScope.tipos);
            };

            $rootScope.sexos = [
                {value: 'M', texto: 'Macho'},
                {value: 'H', texto: 'Hembra'}
            ];

            $rootScope.getSexos = function(){
                var arreglo = [];
                arreglo.push({value: '' , texto: 'Todos'});
                return arreglo.concat($rootScope.sexos);
            };

            $rootScope.edades = [
                {value: 'C', texto: 'Cachorro'},
                {value: 'J', texto: 'Joven'},
                {value: 'A', texto: 'Adulto'}
            ];

            $rootScope.getEdades = function(){
                var arreglo = [];
                arreglo.push({value: '' , texto: 'Todas'});
                return arreglo.concat($rootScope.edades);
            };

            $rootScope.getCiudades = function(){
                var ciudades  = $localStorage.get('ciudades', [], true);
                var arreglo = [];
                arreglo.push({value: '' , texto: 'Todas'});
                for (var i = 0; ciudades.length > i; i++) {
                    arreglo.push({value: ciudades[i].ciudad, texto: ciudades[i].ciudad});
                }
                return arreglo;
            };

            $rootScope.getTiposMascota = function(){
                var tipos_mascota  = $localStorage.get('tipos_mascota', [], true);
                var arreglo = [];
                arreglo.push({id: 0 , nombre: 'Todos'});
                return arreglo.concat(tipos_mascota);
            };

            $rootScope.getRazas = function(){
                var razas  = $localStorage.get('razas', [], true);
                var arreglo = [];
                arreglo.push({id: 0 , nombre: 'Todas'});
                return arreglo.concat(razas);
            };

            $rootScope.getColores = function(){
                var colores  = $localStorage.get('colores', [], true);
                var arreglo = [];
                arreglo.push({id: 0 , nombre: 'Todos'});
                return arreglo.concat(colores);
            };

            $ionicPlatform.ready(function () {

                console.log("Iniciando en ionic platform ready");

                document.addEventListener('deviceready', function () {
                    // Start Network
                    // Cordova Network - Listeners
                    $rootScope.networkType = $cordovaNetwork.getNetwork();
                    $rootScope.isOnline = $cordovaNetwork.isOnline();

                    if (!$rootScope.isOnline) {
                        $state.go('app.no-internet');
                    }

                    // listen for Online event
                    $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                        $rootScope.isOnline = true;
                    });

                    // listen for Offline event
                    $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                        $rootScope.isOnline = false;
                        $state.go('app.no-internet')
                    });
                    // End Cordova Network - Listeners
                }, false);

                document.addEventListener('deviceready', function () {
                    // Start GeoLocation
                    // Initialize variables (Monterrey)
                    // Default position if no GPS data was found
                    $rootScope.lat = -34.6156541;
                    $rootScope.lng = -58.5734051;


                    var posOptions = {timeout: 10000, enableHighAccuracy: true};
                    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                        $rootScope.lat = position.coords.latitude;
                        $rootScope.lng = position.coords.longitude;
                        console.log("Entro a geolocalizacion");
                        console.log(position);
                    }, function (err) {
                        console.info('Returned a Geo error');
                        console.log(err);
                    });
                    // End GeoLocation
                }, false);

                // Initialize Facebook ID and Token
                $rootScope.facebookId = false;
                $rootScope.facebookToken = false;

                // Identify platform
                $rootScope.isWebView = ionic.Platform.isWebView();
                $rootScope.isAndroid = ionic.Platform.isAndroid();
                $rootScope.isIOS = ionic.Platform.isIOS();

                if ($rootScope.isAndroid) {
                    $rootScope.devicePlatform = 'android';
                } else if ($rootScope.isIOS) {
                    $rootScope.devicePlatform = 'ios';
                } else {
                    $rootScope.devicePlatform = 'webView';
                }

                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                    // For now, enable the keyboard accessories on iOS
                    if (ionic.Platform.isIOS()) {
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                    }

                    // Ugly hotfix
                    $rootScope.isIOS = ionic.Platform.isIOS();

                    cordova.plugins.Keyboard.disableScroll(true);
                }

                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.style(1);
                }

            });

        })

        .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, uiGmapGoogleMapApiProvider,
                $cordovaFacebookProvider) {
            // Handle HTTP errors.
            $httpProvider.interceptors.push('responseObserver');

            // Disable "Swipe to go back"
            $ionicConfigProvider.views.swipeBackEnabled(false);

            // Google Maps configuration
            uiGmapGoogleMapApiProvider.configure({
                key: 'AIzaSyC8ub2E-fBAo6O-cnEcK93QyGnuEnYRSwA',
                v: '3.20', //defaults to latest 3.X anyhow
                libraries: 'weather,geometry,visualization'
            });

            // Facebook configuration
            if (window.cordova && window.cordova.plugins) {
                var appID = 1780795122136268;
                var version = "v2.7"; // or leave blank and default is v2.0
                $cordovaFacebookProvider.browserInit(appID, version);
            }

            $stateProvider

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl',
                        data: {
                            requireLogin: true
                        }
                    })

                    .state('app.login', {
                        url: '/login',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/login.html',
                                controller: 'LoginCtrl'
                            }
                        },
                        data: {
                            requireLogin: false
                        }
                    })

                      .state('app.logout', {
                        url: '/logout',
                        views: {
                            'menuContent': {
                                controller: 'LogoutCtrl'
                            }
                        },
                        data: {
                          requireLogin: true
                        }
                      })

                    .state('app.signup', {
                        url: '/signup',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/signup.html',
                                controller: 'SignupCtrl'
                            }
                        },
                        data: {
                            requireLogin: false
                        }
                    })

                    .state('app.home', {
                        url: '/home',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/home.html',
                                controller: 'HomeCtrl'
                            }
                        },
                        params : {
                          tipoController : 'inicio'
                        },
                        data: {
                            requireLogin: true
                        }
                    })

                    .state('app.resultados', {
                      url: '/resultados',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/home.html',
                          controller: 'ResultadosCtrl'
                        }
                      },
                      params : {
                        tipoController : 'resultados'
                      },
                      data: {
                        requireLogin: true
                      }
                    })

                    .state('app.favoritos', {
                      url: '/favoritos',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/home.html',
                          controller: 'HomeCtrl'
                        }
                      },
                      params : {
                        tipoController : 'favoritos'
                      },
                      data: {
                        requireLogin: true
                      }
                    })

                    .state('app.mis-publicaciones', {
                      url: '/mis/publicaciones',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/mis_publicaciones.html',
                          controller: 'MisPublicacionesCtrl'
                        }
                      },
                      params : {
                        tipoController : 'mis-publicaciones'
                      },
                      data: {
                        requireLogin: true
                      }
                    })

                    .state('app.contact', {
                      url: '/contact',
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/contact.html',
                          controller: 'ContactCtrl'
                        }
                      },
                      data: {
                        requireLogin: false
                      }
                    })

                    .state('app.publicacion-new', {
                        cache: false,
                        url: '/publicacion/new',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/publicacion_new.html',
                                controller: 'PublicacionNewCtrl'
                            }
                        },
                        data: {
                            requireLogin: true
                        }
                    })

                    .state('app.publicacion-images', {
                      url: '/publicacion/:publicacionId/fotos',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/publicacion_images.html',
                          controller: 'PublicacionImagesCtrl'
                        }
                      },
                      data: {
                        requireLogin: true
                      }
                    })

                    .state('app.publicacion', {
                      url: '/publicacion/:publicacionId',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/publicacion.html',
                          controller: 'PublicacionCtrl'
                        }
                      },
                      data: {
                        requireLogin: true
                      }
                    })

                    .state('app.publicacion-edit', {
                      url: '/publicacion/edit/:publicacionId',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/publicacion_new.html',
                          controller: 'PublicacionEditCtrl'
                        }
                      },
                      data: {
                        requireLogin: true
                      }
                    })

                    .state('app.profile', {
                        url: '/profile',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/profile.html',
                                controller: 'ProfileCtrl'
                            }
                        },
                        data: {
                            requireLogin: true
                        }
                    })

                    .state('app.profile-edit', {
                      url: '/profile-edit',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/profile_edit.html',
                          controller: 'ProfileEditCtrl'
                        }
                      },
                      data: {
                        requireLogin: true
                      }
                    })


                    .state('app.change-password', {
                      url: '/change/password',
                      cache: false,
                      views: {
                        'menuContent': {
                          templateUrl: 'templates/changePassword.html',
                          controller: 'changePasswordCtl'
                        }
                      },
                      data: {
                        requireLogin: true
                      }
                    })


                    .state('app.no-internet', {
                        url: '/no-internet',
                        cache: true,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/no-internet.html',
                                controller: 'NoInternetCtrl'
                            }
                        },
                        data: {
                            requireLogin: false
                        }
                    });
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('app/home');
        });
