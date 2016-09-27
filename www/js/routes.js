angular.module('app.routes', [])

        .config(function ($stateProvider, $urlRouterProvider, $httpProvider,
        $ionicConfigProvider) {

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js

            // Handle HTTP errors.
            $httpProvider.interceptors.push('responseObserver');

            // Disable "Swipe to go back"
            $ionicConfigProvider.views.swipeBackEnabled(false);


            $stateProvider

                    .state('login', {
                        url: '/login',
                        cache: false,
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    })
                    .state('sign-up', {
                        url: '/sign-up',
                        cache:false,
                        templateUrl: 'templates/sign-up.html',
                        controller: 'SignUpCtrl'
                    })
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('app.home', {
                        url: '/home',
                        cache: false,
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/home.html',
                                controller: 'HomeCtrl'
                            }
                        }
                    })
                    .state('app.nueva_publicacion', {
                        url: '/nueva_publicacion',
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/nueva_publicacion.html',
                                controller: 'NuevaPublicacionCtrl'
                            }
                        },
                        params: {
                            post: null
                        },
                    })
                    .state('app.2Contacto', {
                        url: '/create_post_2',
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/contact.html',
                                controller: '2ContactoCtrl'
                            }
                        }
                    })

                    .state('app.admin-fotos', {
                        url: '/admin-fotos',
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/publicacion_images.html',
                                controller: 'AdminFotosCtrl'
                            }
                        },
                        params: {
                            post: null
                        },
                    })

                    .state('app.profile', {
                        url: '/profile',
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/profile.html',
                                controller: 'ProfileCtrl'
                            }
                        }
                    })

                    .state('app.post-details', {
                        url: '/post-details',
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/publicacion.html',
                                controller: 'PostDetailsCtrl',
                            }
                        },
                        params: {
                            post: null
                        },
                        controller: 'PostDetailsCtrl'
                    })

                    .state('app.map', {
                        url: '/map',
                        views: {
                            'side-menu': {
                                templateUrl: 'templates/map.html',
                                controller: 'MapCtrl'
                            }
                        }
                    })

            $urlRouterProvider.otherwise('app/home')

        })
        .controller('AppCtrl', function ($scope, $rootScope, $state) {

            $scope.admin_photos = function () {
                $state.go('app.admin-fotos', {
                    id_publicacion: 518
                });
            }

            $scope.logout = function(){
                $rootScope.forceLogout();
            }

        })
        .controller('LoginCtrl', function ($scope, $state, $cordovaOauth,
                                           $ionicHistory, OAuth, $http, Settings, User, Config, $ionicLoading,
                                           $ionicPopup, Util, $localStorage) {

            if(User.hasUser()){
                $state.go('app.home');
            }

            $scope.Config = Config;
            $scope.login = {
                email: '',
                password: ''
            };

            $scope.fb_config = OAuth.fb;
            $scope.fb_app_id = $scope.fb_config.app_id;
            $scope.fb_scope = ["email"];

            $scope.init = function () {
                goToPage('app.home');
            }

            // Login via cuenta Facebook.
            $scope.fbLogin = function () {
                $cordovaOauth.facebook($scope.fb_app_id, $scope.fb_scope).then(function (result) {
                    console.log("Result login facebook ")
                    console.log(JSON.stringify(result));
                    $scope.setProfile(result.access_token);
                }, function (error) {
                    console.log(JSON.stringify(error));
                });
            }

            // Almacenar datos del perfil de usuario FB.
            $scope.setProfile = function (access_token) {
                $scope.fb_profile_url = $scope.fb_config.profile_url;
                var params = {
                        access_token: access_token,
                        fields: "id,first_name,last_name,email,link,picture",
                        format: "json"
                };

                $http.get($scope.fb_profile_url, params).then(function (result) {
                    console.log("Result me facebook ")
                    console.log(JSON.stringify(result));
                    var fb_user_profile = getUserDataFromFBProfile(result.data);

                    User.saveOrUpdateUser(fb_user_profile).then(function (resp) {
                        if (!resp.data.success) {
                            alert('No se almacenó el perfil FB');
                            console.log(JSON.stringify(resp.data.errors));
                            //goToPage('login');
                            return;
                        }
                        // Recuperar datos de usuario.
                        Settings.user = resp.data.usuario;
                        goToPage('app.home');
                    }, function (error) {
                        alert('No se almacenó el perfil FB');
                        goToPage('login');
                        console.log(JSON.stringify(error));
                    });
                }, function (error) {
                    alert(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                });

                function getUserDataFromFBProfile(fb_profile) {
                    return {
                        fb_id: fb_profile.id,
                        nombre: fb_profile.first_name,
                        apellido: fb_profile.last_name,
                        email: fb_profile.email,
                        tipo: 'FB'
                    };
                }
            }

            // Ir a la siguiente página.
            function goToPage(view) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go(view);
                $ionicHistory.clearHistory();
            }

            $scope.logIn = function () {
                if (!validate()) {
                    return;
                }

                doLogIn();
            }

            function validate() {
                if (!$scope.login.email || !$scope.login.password) {
                    alert('Ingrese email y contraseña');
                    return false;
                }

                return true;
            }

            function doLogIn() {
                var
                        url = Util.create_url(Config.custom_login_action),
                        config = {
                            params: {
                                email: $scope.login.email,
                                password: $scope.login.password
                            }
                        };

                $http.get(url, config).then(function (resp) {
                    console.log("Login normal")
                    console.log(JSON.stringify(resp.data.usuario));

                    debugger;

                    // Login incorrecto.
                    if (!resp.data.success) {
                        $ionicPopup.alert({
                            scope: $scope,
                            title: 'Error',
                            template: '<div class="assertive">Credenciales no válidas, intenta nuevamente.</div>',
                            buttons: [{
                                    text: 'Aceptar',
                                    type: 'button-dark'
                                }]
                        });

                        return;
                    }

                    // Login correcto.
                    // Recuperar datos de usuario.
                    $localstorage.set('user',resp.data.usuario, true);
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $ionicHistory.clearHistory();
                    $state.go('app.home');
                }, function (resp) {
                    $ionicLoading.hide();
                });
            }

            // Ir al formualrio de registro.
            $scope.signUp = function () {
                $state.go('sign-up');
            }


        })
        .controller('SignUpCtrl', function ($scope, $state, User, $ionicPopup) {
            $scope.user = {
                nombre: '',
                apellido: '',
                telefono: '',
                email: '',
                password: '',
                tipo: 'PB'
            };

            $scope.signUp = function () {
                console.log("usuario");
                console.log(JSON.stringify($scope.user));
                User.saveOrUpdateUser($scope.user).then(function (resp) {

                    // Mostrar errores.
                    if (!resp.data.success) {
                        $scope.errors = resp.data.errors;
                        $ionicPopup.alert({
                            scope: $scope,
                            title: 'Error en la registración',
                            templateUrl: 'templates/signup-error.html',
                            buttons: [{
                                    text: 'OK',
                                    type: 'button-positive'
                                }]
                        });

                        return;
                    }

                    // Registración completa.

                    var alertPopup = $ionicPopup.alert({
                        title: 'Registración completa',
                        template: 'El proceso de registración ha finalizado, ahora puedes ingresar con tus credenciales.',
                        buttons: [{
                            text: 'OK',
                            type: 'button-positive'
                        }]
                    });

                    alertPopup.then(function(res) {
                        $state.go('login');
                    });


                }, function (resp) {
                    console.log(resp);
                })
            }

        })


        .controller('HomeCtrl', function ($scope, Settings, Config, Util, $http,
            $q, $state, $ionicLoading, ModalService, User) {

            $scope.Config = Config;
            $scope.base_url = Config.base_url;
            $scope.criteria = Settings.search_options;
            $scope.selected_tipos = {};
            $scope.current_page = 0;
            $scope.min_posts = 20;
            $scope.max_posts = 150;
            $scope.posts = [];
            $scope.get_posts_url = Util.create_url(Config.get_posts_action);



            $scope.isFavorite = function (post) {
                return Util.isFavorite(post);
            }


            // Editar opciones de búsqueda.
            $scope.searchOptions = function () {
                ModalService
                        .init('templates/search.html', $scope)
                        .then(function (modal) {
                            modal.show();
                        });
            };

            // Inyectar criterios adicionales y realizar búsqueda.
            $scope.doSearch = function () {
                $scope.closeModal();

                // Inyectar tipos_csv.
                $scope.criteria["Publicacion[tiposCSV]"] = $scope.getSelectedTipos();

                // Inyectar favs_ids
                $scope.criteria["Publicacion[favsCSV]"] = Settings.favs.join(',');

                // Inyectar id_usuario.
                $scope.criteria["Publicacion[id_usuario]"] = Settings.user.id_usuario;

                // Buscar publicaciones.
                $scope.getPosts();
            }

            $scope.getSelectedTipos = function () {
                var tipos_csv = [];

                for (var key in $scope.selected_tipos) {
                    if ($scope.selected_tipos.hasOwnProperty(key)) {
                        if ($scope.selected_tipos[key]) {
                            tipos_csv.push(key);
                        }
                    }
                }

                return tipos_csv.join(',');
            }

            // Recuperar la primera página de publicaciones.
            $scope.getPosts = function () {
                $scope.loadPosts($scope.criteria, 0).then(function (posts) {
                    $scope.posts = posts;
                    $scope.current_page = 0;
                    $scope.$broadcast('scroll.refreshComplete');
                }, function (data) {
                    console.log(JSON.stringify(data));
                });
            };

            // Recuperar la próxima página de publicaciones.
            $scope.getMorePosts = function () {
                $scope.loadPosts($scope.criteria, ++$scope.current_page).then(function (posts) {
                    $scope.posts = $scope.posts.concat(posts);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (data) {
                    console.log(JSON.stringify(data));
                });
            };

            // Cargar publicaciones de la página indicada y con los filtros ingresados.
            $scope.loadPosts = function (criteria, page) {
                var
                        deferred = $q.defer(),
                        params_criteria = criteria;

                // Inyectar page.
                params_criteria.page = page;

                var
                        config = {
                            params: params_criteria
                        };

                $http.get($scope.get_posts_url, config).then(function (resp) {
                    deferred.resolve(resp.data.publicaciones);
                }, function (data) {
                    $ionicLoading.hide();
                    console.log(JSON.stringify(data));
                    deferred.reject(data);
                });
                return deferred.promise;
            }

            $scope.viewPost = function (post) {
                $state.go('app.post-details', {
                    post: post
                });
            }

            if(!User.hasUser()){
               $state.go('login');
            }else{
                $scope.getPosts();
            }
        })

        .controller('buscarCtrl', function ($scope) {

        })

        // Crear o editar publicación.
        .controller('NuevaPublicacionCtrl', function ($scope, $ionicPopup, $ionicHistory, $http, $ionicLoading, Util, Config, $state, $stateParams, $cordovaToast, Settings) {
            // Inicializar post con datos de publicación existente a editar, o con valores por defecto para
            // crear nueva publicación.
            $scope.post = $stateParams.post != null ? $stateParams.post : {
                id_publicacion: null,
                id_usuario: Settings.user.id_usuario,
                titulo: 'Nueva publicación',
                tipo: 'P',
                mascota: 'Perro',
                raza: '',
                sexo: 'M',
                color: 'Negro',
                edad: 'C',
                estado: 'A' // Activo
            };
            $scope.tipos = Config.tipos;
            $scope.sexos = Config.sexos;
            $scope.mascotas = Config.mascotas;
            $scope.colores = Config.colores;
            $scope.edad = Config.edades;

            $scope.submit = function () {
                if (!validate()) {
                    return;
                }

                $scope.createPost($scope.post);
                console.log($scope.post);
            }

            // Crear nueva publicación y administrar fotos.
            $scope.saveAndGoToPhotosAdmin = function () {
                Util.save_or_update($scope.post, 'Publicacion', Config.post_save_or_update_action).then(function (resp) {
                    if (!resp.data.success) {
                        $cordovaToast.showShortCenter('No se ha creado la publicación.');
                        return;
                    }

                    // Ir a administrar fotos.
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $state.go('app.admin-fotos', {
                        post: $scope.post
                    });
                    $ionicHistory.clearHistory();
                }, function (error) {
                    console.log(error);
                });
            }

            // Grabar cambios en la publicación actual.
            $scope.save = function () {
                Util.save_or_update($scope.post, 'Publicacion', Config.post_save_or_update_action).then(function () {
                    $cordovaToast.showShortCenter('Cambios grabados');
                }, function (error) {
                    $cordovaToast.showShortCenter('Se ha producido un error');
                    console.log(error);
                });
            }

            // Ir a administrar fotos.
            $scope.goToAdminPhotos = function () {
                $state.go('app.admin-fotos', {
                    post: $scope.post
                });
            }

            $scope.createPost = function (post) {
                var
                        url = Util.create_url(Config.create_post_action),
                        config = {
                            params: {}
                        };

                Util.set_array_params(config.params, post, 'Publicacion');
                $ionicLoading.show({template: 'Enviando publicación...'});
                $http.get(url, config).then(function (resp) {
                    $ionicLoading.hide();

                    if (!resp.data.success == true) {
                        return;
                    }

                    $state.go('app.admin-fotos', {
                        id_publicacion: resp.data.id_publicacion
                    });
                }, function () {
                    $ionicLoading.hide();
                    $scope.alert('Error al enviar datos', 'Intente nuevamente.');
                });
            }

            function validate() {
                // titulo no nulo.
                if (!$scope.post.titulo) {
                    $scope.alert('Datos de entrada', 'Agregar el título de la publicación.');
                    return false;
                }

                return true;
            }

            $scope.alert = function (title, template) {
                $ionicPopup.alert({
                    title: title,
                    template: template
                });
            }
        })

        .controller('2ContactoCtrl', function ($scope) {

        })

        .controller('AdminFotosCtrl', function ($scope, $state, $stateParams, $cordovaToast, $ionicViewService, $ionicPopup, $ionicLoading, $window, $http, $q, Config, Camera, Util) {
            var
                    post = $stateParams.post;

            $scope.base_url = Config.base_url;
            $scope.photo_height_pc = .5;
            $scope.photo_height_px = Math.floor($window.screen.height * $scope.photo_height_pc);
            $scope.last_photo = '';
            $scope.photos = [];

            // Recuperar lista de fotos de la publicación actual.
            $scope.getPhotos = function () {
                $ionicLoading.show({template: 'Cargando fotos...'});
                loadPhotos(post).then(function (resp) {
                    $ionicLoading.hide();
                    $scope.photos = resp.data.photos;
                }, function () {
                    $ionicLoading.hide();
                });
            }

            function loadPhotos(post) {
                var
                        deferred = $q.defer(),
                        url = Util.create_url(Config.get_photos_action),
                        config = {
                            params: {
                                id_publicacion: post.id_publicacion
                            }
                        };

                $http.get(url, config).then(function (resp) {
                    deferred.resolve(resp);
                }, function (data) {
                    console.log(data);
                    deferred.reject(data);
                });

                return deferred.promise;
            }

            // Tomar foto.
            $scope.takePhoto = function () {
                Camera.getPicture().then(function (imageUri) {
                    $scope.last_photo = imageUri;
                    $scope.preview();
                }, function (err) {
                    console.log(err);
                })
            }

            // Vista preliminar de la foto tomada.
            $scope.preview = function () {
                $ionicPopup.show({
                    template: '\n\
        <div style="height:{{photo_height_px}}px;min-width:100%;">\n\
          <img ng-src="{{last_photo}}" class="fullscreen-image"/>\n\
        </div>',
                    title: 'Vista preliminar',
                    scope: $scope,
                    buttons: [{
                            text: 'Cancelar'
                        }, {
                            text: '<b>Subir</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                $scope.sendPhoto($scope.last_photo, post);
                                return;
                            }
                        }]
                });
            }

            // Enviar foto al server remoto.
            $scope.sendPhoto = function (photo_url, post) {
                var
                        url = Util.create_url(Config.upload_photo_action),
                        opt = new FileUploadOptions(),
                        ft = new FileTransfer();

                opt.chunkedMode = false;
                opt.mimeType = 'image/png';
                opt.params = {
                    id_publicacion: post.id_publicacion,
                    fileKey: 'file',
                    fileName: $scope.generateFileName(photo_url, post.id_publicacion)
                },
                opt.headers = {
                    Connection: 'close'
                };

                $ionicLoading.show({template: 'Subiendo foto...'});
                ft.upload(photo_url, url, function (r) {
                    $ionicLoading.hide();
                    //$scope.photos = r.response.photos;
                    $scope.getPhotos();
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                }, function (error) {
                    $ionicLoading.hide();
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("upload error code" + error.code);
                }, opt);
            }

            // Generar nombre de la foto.
            $scope.generateFileName = function (photo_url, id_publicacion) {
                return id_publicacion + '__' + photo_url.split('/').pop();
            }

            // Eliminar foto.
            $scope.deletePhoto = function (foto) {
                var
                        url = Util.create_url(Config.foto_delete_action),
                        config = {
                            params: {}
                        };

                Util.set_array_params(config.params, foto, 'Foto');
                $http.get(url, config).then(function (resp) {
                    if (!resp.data.success) {
                        $cordovaToast.showShortCenter('La foto no fue eliminada.');
                        return;
                    }

                    deleteFromPhotosList(foto);
                }, function (error) {
                    console.log(error);
                });
            }

            // Eliminar un ítem de la lista de fotos.
            function deleteFromPhotosList(item) {
                var
                        foto;

                for (var i = 0; i < $scope.photos.length; i++) {
                    foto = $scope.photos[i];

                    if (item.id_foto == foto.id_foto) {
                        $scope.photos.splice(i, 1);
                        return;
                    }
                }
            }

            $scope.finish = function () {
                $ionicViewService.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });

                $state.go('app.home');
            }

            $scope.getPhotos();
        })

        .controller('PostDetailsCtrl', function ($scope, $state, $stateParams, $ionicModal, Util, Config, Settings) {
            $scope.Config = Config;
            $scope.base_url = Config.base_url;
            $scope.post = $stateParams.post;
            $scope.fotos = $scope.post.photos;
            $scope.can_edit = $scope.post.id_usuario == Settings.user.id_usuario;
            $scope.is_favorite = Util.isFavorite($scope.post);
            $scope.is_active = $scope.post.estado == 'A';

            // Slideshow de fotos.
            $scope.showPhoto = function () {
                $ionicModal.fromTemplateUrl('templates/post-photos.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            }

            // Editar contenido de la publicación.
            $scope.edit = function () {
                $state.go('app.nueva_publicacion', {
                    post: $scope.post
                });
            }

            // Ir a administrar fotos.
            $scope.goToAdminPhotos = function () {
                $state.go('app.admin-fotos', {
                    post: $scope.post
                });
            }

            // Modificar el estado de la publicación.
            $scope.setEstado = function (estado) {
                $scope.post.estado = estado;

                Util.save_or_update($scope.post, 'Publicacion', Config.post_set_estado_action).then(function (resp) {
                    if (!resp.data.success) {
                        $cordovaToast.showShortCenter('No se actualizó el estado de la publicación.');
                        return;
                    }
                    $scope.is_active = $scope.post.estado == 'A';
                }, function (error) {
                    console.log(error);
                });
            }

            // Marcar esta publicación como favorita.
            $scope.setFavorite = function () {
                Settings.favs.push($scope.post.id_publicacion);
                $scope.is_favorite = true;
            }

        })

        .controller('ProfileCtrl', function ($scope, $ionicPopup, Settings, User) {
            $scope.user = Settings.user;

            // Grabar cambios en el perfil.
            $scope.save = function () {
                User.saveOrUpdateUser($scope.user).then(function (resp) {
                    if (!resp.data.success) {
                        alert('error');
                        return;
                    }

                    $ionicPopup.alert({
                        scope: $scope,
                        title: 'Actualizar perfil',
                        template: 'Los cambios se realizaron correctamente.',
                        buttons: [{
                                text: 'OK',
                                type: 'button-positive'
                            }]
                    });
                }, function (error) {
                    console.log(error);
                });
            }
        })
        .controller('MapCtrl', function ($scope, $ionicLoading, $compile) {

            $scope.init = function () {
                console.log('INIT');
                var myLatlng = new google.maps.LatLng(43.07493, -89.381388);

                var mapOptions = {
                    center: myLatlng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var map = new google.maps.Map(document.getElementById("map"),
                        mapOptions);

                //Marker + infowindow + angularjs compiled ng-click
                var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
                var compiled = $compile(contentString)($scope);

                var infowindow = new google.maps.InfoWindow({
                    content: compiled[0]
                });

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: 'Uluru (Ayers Rock)'
                });

                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.open(map, marker);
                });

                google.maps.event.addListener(map, 'click', function (event) {
                    //alert(JSON.stringify(event));
                    map.setCenter(event.latLng);
                    new google.maps.Marker({
                        position: event.latLng,
                        map: map,
                        title: 'Here'
                    });
                });

                $scope.map = map;
            }

            $scope.centerOnMe = function () {
                if (!$scope.map) {
                    return;
                }

                $ionicLoading.show({
                    content: 'Getting current location...',
                    showBackdrop: false
                });

                navigator.geolocation.getCurrentPosition(function (pos) {
                    $ionicLoading.hide();
                    $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                        map: $scope.map,
                        title: 'Me'
                    });
                }, function (error) {
                    alert('Unable to get location: ' + error.message);
                });
            };

            $scope.clickTest = function () {
                alert('Example of infowindow with ng-click')
            };

        })
;

/**
 * Modelo de Usuario
 */
function ModelUser() {
    this.nombre = '';
    this.apellido = '';
    this.telefono = '';
    this.email = '';
    this.password = '';
    this.errors = [];

    this.validate = function () {
        this.errors = [];

        this.validateRequired('nombre');
        this.validateRequired('apellido');
        this.validateRequired('telefono');
        this.validateRequired('email');
        this.validateRequired('password');

        return this.errors.length == 0;
    }

    this.validateRequired = function (field) {
        if (this[field].length == 0) {
            this.errors.push('Ingresar ' + field);
        }
    }

    this.getErrors = function () {
        return this.errors.join('\n');
    }
}
