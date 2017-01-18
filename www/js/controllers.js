angular.module('app.controllers', [])
  .controller('AppCtrl', function ($scope) {

    // Form data for the login modal
    $scope.loginData = {};

  })

  .controller('LoginCtrl', function ($rootScope, $scope, $timeout, $log,
                                     $state, authService, $ionicHistory, $cordovaFacebook,
                                     facebookHandler, $localStorage) {

    $scope.loginData = {
      'devicePlatform': $rootScope.devicePlatform,
      'deviceToken': $rootScope.deviceToken
    };

    // Login function
    $scope.doLogin = function (data) {

      if ($rootScope.deviceToken == "undefined") {
        var token = $localStorage.get("deviceToken", "{}", true);
        $rootScope.deviceToken = token.registrationId;
      }
      // obligando a que ponga los datos.
      $scope.loginData.devicePlatform = $rootScope.devicePlatform;
      $scope.loginData.deviceToken = $rootScope.deviceToken;
      $scope.loginData.latitude = $rootScope.lat;
      $scope.loginData.longitude = $rootScope.lng;

      var promise = authService.login($scope.loginData);
      promise.then(function (result) {
        console.log("Login: ")
        console.log(JSON.stringify(result));
        if (result.error == 26) {
          $state.go('app.signup');
        } else if (result.error != 0) {
          $rootScope.error(
            $rootScope.getErrorDescription(result.error)
          );
        } else {
          authService.setUser(result.data.user);
          $localStorage.set('colores', result.data.colores,true);
          $localStorage.set('tipos_mascota', result.data.tipos_mascota,true);
          $localStorage.set('razas', result.data.razas,true);

          $state.go('app.home'); // Default screen after login
          $ionicHistory.nextViewOptions({disableBack: 'true'});
          $ionicHistory.clearHistory();
          $ionicHistory.clearCache();
        }
      });
    };
    // END login function

    // GoTo Sign Up
    $scope.goToSignUp = function () {
      //$ionicHistory.clearHistory();
      //$ionicHistory.clearCache();
      $state.go('app.signup');
    };
    // END Sign Up function

    // Facebook Login
    $scope.facebookLogin = function () {
      // Business Logic
      $cordovaFacebook.login(["public_profile", "email", "user_birthday", "user_about_me"]).then(function (response) {
        console.log("Login Facebook");
        console.log(JSON.stringify(response));
        if (response.hasOwnProperty('authResponse')) {
          $scope.loginData.facebookId = response.authResponse.userID;
          facebookHandler.setUser(response.authResponse.userID, response.authResponse.accessToken);
          $rootScope.facebookId = response.authResponse.userID;
          $rootScope.facebookToken = response.authResponse.accessToken;

          $scope.doLogin($scope.loginData);
        } else {
          $rootScope.error(
            $rootScope.getErrorDescription(26)
          );
        }
      }, function (error) {
        console.log(error);
        $rootScope.error(
          $rootScope.getErrorDescription(26)
        );
      });
    };
    // End facebook login

    $scope.recuperarContrasena = function () {
      if ($scope.loginData.email && $scope.loginData.email.length > 0) {
        authService.recoverPassword($scope.loginData).then(function (result) {
          console.log(result);
          if (result.error == 0) {
            console.log(result)
            $rootScope.showMessage("Se ha enviado una nueva contraseña a su correo");
          } else {
            $rootScope.error(
              $rootScope.getErrorDescription(data.error)
            );
          }
        }, function (err) {
          console.log(err);
          $rootScope.showMessage("Error al recuperar contraseña");
        });
      } else {
        var email = document.getElementById('login-email');
        email.focus();
        $rootScope.showMessage('Ingresa tu correo y presiona "Recuperar Contraseña"');
      }
    }
  })

  .controller('SignupCtrl', function ($scope, apiHandler, $state,
                                      $rootScope, $ionicHistory, $cordovaFacebook, facebookHandler,
                                      authService, $localStorage, $cordovaCamera, dateUtility) {

    // Initialize variables
    $scope.user = {};

    $scope.facebookConnected = false;
    $scope.facebookHasEmail = false;

    $scope.isIOS = $rootScope.isIOS;

    // Check for parameters
    if ($rootScope.facebookId && $rootScope.facebookToken) {
      $scope.user.facebookId = $rootScope.facebookId;
      $scope.user.facebookToken = $rootScope.facebookToken;
      $scope.user.password = $rootScope.facebookToken;

      var promise = facebookHandler.me($scope.user.facebookToken);

      promise.then(function (apiResponse) {
        console.log(JSON.stringify(apiResponse));

        if (!apiResponse.hasOwnProperty('email')) {
          $rootScope.error(
            $rootScope.getErrorDescription(28)
          );
        }

        if (apiResponse.hasOwnProperty('birthday')) {
          $scope.user.date = new Date(Date.parse(apiResponse.birthday));
        }

        if (apiResponse.hasOwnProperty('email')) {
          $scope.user.email = apiResponse.email;
          $scope.facebookHasEmail = true;
        }

        if (apiResponse.hasOwnProperty('first_name')) {
          $scope.user.nombre = apiResponse.first_name;
        }

        if (apiResponse.hasOwnProperty('last_name')) {
          $scope.user.apellido = apiResponse.last_name;
        }

        if (apiResponse.hasOwnProperty('picture')) {
          $scope.user.image = apiResponse.picture.data.url;
          $localStorage.set('user', $scope.user, true);
        } else {
          $scope.user.image = null;
        }

        $scope.facebookConnected = true;
      });
    }

    // Facebook Signup
    $scope.facebookSignup = function () {
      // Business Logic
      $cordovaFacebook.login(["public_profile", "email", "user_birthday", "user_about_me"]).then(function (response) {

        $scope.user.facebookId = response.authResponse.userID;
        $scope.user.facebookToken = response.authResponse.accessToken;
        $scope.user.password = response.authResponse.accessToken;

        var promise = facebookHandler.me($scope.user.facebookToken);

        promise.then(function (apiResponse) {
          console.log(JSON.stringify(apiResponse));

          if (apiResponse.hasOwnProperty('birthday')) {
            $scope.user.date = new Date(Date.parse(apiResponse.birthday));
          }

          if (apiResponse.hasOwnProperty('email')) {
            $scope.user.email = apiResponse.email;
            $scope.facebookHasEmail = true;
          }

          if (apiResponse.hasOwnProperty('first_name')) {
            $scope.user.nombre = apiResponse.first_name;
          }

          if (apiResponse.hasOwnProperty('last_name')) {
            $scope.user.apellido = apiResponse.last_name;
          }

          if (apiResponse.hasOwnProperty('picture')) {
            $scope.user.image = apiResponse.picture.data.url;
            $localStorage.set('user', $scope.user, true);
          } else {
            $scope.user.image = null;
          }

          $scope.facebookConnected = true;

        });

      }, function (error) {
        console.log(error);
      });

    };
    // End facebook signup

    // Do Signup
    $scope.doSignup = function (data) {
      $rootScope.showLoader(true);
      var promise = apiHandler.signup($scope.user);
      promise.then(function (result) {
        console.log(result);
        $rootScope.showLoader(false);
        if (result.error != 0) {
          $rootScope.error(
            $rootScope.getErrorDescription(result.error)
          );
        } else {

          if ($rootScope.deviceToken == "undefined") {
            var token = $localStorage.get("deviceToken", "{}", true);
            $rootScope.deviceToken = token.registrationId;
          }
          // obligando a que ponga los datos.
          $scope.user.devicePlatform = $rootScope.devicePlatform;
          $scope.user.deviceToken = $rootScope.deviceToken;
          $scope.user.lat = $rootScope.lat;
          $scope.user.lng = $rootScope.lng;

          $rootScope.showLoader(true);
          // Sign up successful
          var loginPromise = authService.login($scope.user);
          loginPromise.then(function (loginResult) {
            $rootScope.showLoader(false);
            if (result.error != 0) {
              $rootScope.error(
                $rootScope.getErrorDescription(loginResult.error)
              );
            } else {
              authService.setUser(loginResult.data.user);
              $localStorage.set('colores', loginResult.data.colores,true);
              $localStorage.set('tipos_mascota', loginResult.data.tipos_mascota,true);
              $localStorage.set('razas', loginResult.data.razas,true);

              $state.go('app.home'); // Default screen after login
              $ionicHistory.nextViewOptions({disableBack: 'true'});
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
            }
          });
        }
      }, function(err){
        $rootScope.showLoader(false);
        $rootScope.getErrorDescription("Error al registrar");
        console.log(err);
      });
    };
    // END Do Signup function

    $scope.cancelSignUp = function () {
      $scope.user = {};
      $scope.facebookConnected = false;
      $scope.user.facebookId = null;
      $rootScope.facebookToken = null;
      facebookHandler.clear();
      $state.go('app.login'); // Default screen after login
      $ionicHistory.nextViewOptions({disableBack: 'true'});
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    };


    // Get Picture
    $scope.editProfilePicture = function () {
      document.addEventListener("deviceready", function () {

        var options = {
          quality: 80,
          destinationType: Camera.DestinationType.DATA_URL,
          cameraDirection: Camera.Direction.FRONT,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 800,
          targetHeight: 1200,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
          /*
           var image = document.getElementById('profilePicture');
           image.src = "data:image/jpeg;base64," + imageData;
           */
          $scope.user.image = imageData;
          $scope.$apply();


        }, function (err) {
          // error
        });

      }, false);
    };
    // End Get Picture

  })

  .controller('LogoutCtrl', function ($scope, authService, $state, $ionicHistory, $localStorage) {
    var promise = authService.logout();
    promise.then(function (data) {
      if (data.error == 0) {
        authService.setUser({});
        $localStorage.set('userFacebook', {}, true);
        $ionicHistory.nextViewOptions({disableBack: 'true'});
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $state.go('app.login');
      }
    });
  })

  .controller('ContactCtrl', function ($scope) {
    $scope.sendEmail = function () {
      window.location.replace('mailto:info@petbond.com');
    };

    $scope.callPhone = function () {
      window.location.replace('tel:5521093249');
    };
  })

  .controller('HomeCtrl', function ($scope, $rootScope, $state, $ionicHistory, Config,
                                    authService, jsonUtility, apiHandler, $cordovaGeolocation, $timeout,
                                    $localStorage, $ionicModal, $stateParams, $ionicNavBarDelegate) {

    $scope.tipoController = $stateParams.tipoController;

    $scope.data = {};
    $scope.data.currentPage = 0;
    
    $scope.setupSlider = function() {
      //some options to pass to our slider
      $scope.data.sliderOptions = {
        initialSlide: 0,
        direction: 'horizontal', //or vertical
        speed: 300 //0.3s transition
      };

      //create delegate reference to link with slider
      $scope.data.sliderDelegate = null;

      //watch our sliderDelegate reference, and use it when it becomes available
      $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
        if (newVal != null) {
          $scope.data.sliderDelegate.on('slideChangeEnd', function() {
            $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
            //use $scope.$apply() to refresh any content external to the slider
            $scope.$apply();
          });
        }
      });
    };

    $scope.setGeolocalizacion = function(){
      // obtiene la posicion actual, para mantener actualizado su posicion.
      console.log("Entrando a geolocalizacion");
      var user = authService.getUser();
      var posOptions = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        console.log(position);
        if ($rootScope.lat === undefined) {
          $rootScope.lat = position.coords.latitude;
          $rootScope.lng = position.coords.longitude;
          user.latitude = $rootScope.lat;
          user.longitude = $rootScope.lng;
          apiHandler.updateGeolocation(user).then(function (response) {
            console.log(response);
            if (response.error != 0) {
              // Error Handling
            } else {
              authService.setUser(user);
            }
          });
        }
      }, function (err) {
        console.info('Returned a Geo error');
        console.log(err)
      });
    }

    $scope.setGeolocalizacion();

    $scope.criteria = { isDistance: false };
    $scope.user = authService.getUser();
    $scope.sexos  = $rootScope.sexos;
    $scope.edades = $rootScope.edades;
    $scope.tipos  = $rootScope.tipos;
    $scope.base_url = Config.base_url_web_images;

    $scope.colores        = $localStorage.get('colores', [], true);
    $scope.tipos_mascota  = $localStorage.get('tipos_mascota', [], true);
    $scope.razas          = $localStorage.get('razas', [], true);
    $scope.more_publicaciones = true;

    $scope.getPublicaciones2 = function(){
      console.log("Entro a getPublicaciones");
      var fecha = 10000;
      console.log(fecha);
      $scope.page = 1;
      $scope.more_publicaciones = true;
      apiHandler.listPublicacionsAll({'timestamp': fecha, 'page': $scope.page}).then(function(result){
        console.log(result);
        $scope.publicaciones = result.data;
        $localStorage.set('publicaciones', result.data, true);

        var posts = result.data;
        $scope.publicaciones = [];

        for(var cont=0; cont < posts.length; cont++){
          if(posts[cont].estado != 'B'){
            $scope.publicaciones.push(posts[cont]);
          }
        }
        $scope.setupSlider();
        $scope.setGeolocalizacion();
        //$scope.$apply();
      }, function(err){
        console.log(err);
      });
    }

    $scope.getPublicaciones = function(){
      $scope.user = $localStorage.get('user',{}, true);
      $scope.criteria.distance = 100;
      $scope.criteria.latitude = $rootScope.lat || $scope.user.latitude;
      $scope.criteria.longitude = $rootScope.lng || $scope.user.longitude;
      console.log($scope.criteria);
      apiHandler.listPublicacions($scope.criteria).then(function(result){
        console.log(result);
        if(result.data.length > 0){
          $localStorage.set('publicaciones',result.data,true);
          var posts = result.data;
          $scope.publicaciones = [];

          for(var cont=0; cont < posts.length; cont++){
            if(posts[cont].estado != 'B'){
              $scope.publicaciones.push(posts[cont]);
            }
          }
          $scope.setupSlider();
          $scope.setGeolocalizacion();
        }else{
          $scope.getPublicaciones2();
        }
      },function(err){
        console.log(err);
      });
    }


    $scope.getPublicacionesMore = function(){
      console.log("Entro a getPublicacionesMore");
      var fecha = 10000;
      console.log(fecha);
      $scope.page = $scope.page + 1;
      apiHandler.listPublicacionsAll({'timestamp': fecha, 'page': $scope.page}).then(function(result){
        console.log(result);
        var posts = result.data;
        for(var cont=0; cont < posts.length; cont++){
          if(posts[cont].estado != 'B'){
            $scope.publicaciones.push(posts[cont]);
          }
        }
        $localStorage.set('publicaciones', $scope.publicaciones, true);
        $scope.$broadcast('scroll.infiniteScrollComplete');

        if(result.data.length == 0){
          $scope.more_publicaciones = false;
        }

        //$scope.$apply();
      }, function(err){
        $scope.$broadcast('scroll.infiniteScrollComplete');
        console.log(err);
      });
    }

    // Editar opciones de búsqueda.
    $ionicModal.fromTemplateUrl('templates/search.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    $scope.doSearch = function(){
      $scope.user = $localStorage.get('user',{}, true);
  		if($scope.criteria.isDistance){
  			$scope.criteria.latitude = $rootScope.lat || $scope.user.latitude;
        $scope.criteria.longitude = $rootScope.lng || $scope.user.longitude;
  		}
      console.log($scope.criteria);
      apiHandler.listPublicacions($scope.criteria).then(function(response){
        console.log(response);
        $localStorage.set('resultados',response.data,true);
        $scope.closeModal();
        $state.go('app.resultados');
      },function(err){
        console.log(err);
      });
    };

    $scope.viewPublicacion = function (publicacion) {
      console.log(publicacion)
      $state.go('app.publicacion', {
        publicacionId: publicacion.id
      });
    };

    $scope.isFavorite = function(publicacion){
      return jsonUtility.isFavorite(publicacion);
    };

    $scope.addFavorite = function(publicacion){
        if(jsonUtility.isFavorite(publicacion)){
            jsonUtility.removeFavorite(publicacion);
        }else {
            jsonUtility.addFavorite(publicacion);
        }
    };

    // Check for auth
    if (typeof authService.getUser() === "undefined" || jsonUtility.isObjectEmpty(authService.getUser())) {
      $rootScope.forceLogout();
    }else{
    	if($scope.tipoController=='favoritos') {
	      	$scope.publicaciones = $localStorage.get('favoritos', [], true);
	      	$ionicNavBarDelegate.showBackButton(true);
	    }else{
	    	$scope.publicaciones = $localStorage.get('publicaciones', [], true);
	      	$scope.getPublicaciones2();
	      	$ionicNavBarDelegate.showBackButton(false);
	    }
    }

  })

  .controller('ResultadosCtrl', function ($scope, $stateParams, jsonUtility, Config, 
                                          $localStorage, $ionicNavBarDelegate, $state) {

    $scope.publicaciones = $localStorage.get('resultados', [], true);
    $scope.cards = [];

    $scope.tipoController = $stateParams.tipoController;
    $scope.base_url = Config.base_url_web_images;

    $ionicNavBarDelegate.showBackButton(true);

    $scope.viewPublicacion = function (publicacion) {
      $state.go('app.publicacion', {
        publicacionId: publicacion.id
      });
    };

    $scope.isFavorite = function(publicacion){
      return jsonUtility.isFavorite(publicacion);
    };

    $scope.addCard = function(i) {
        //var newCard = $scope.publicaciones[Math.floor(Math.random() * $scope.publicaciones.length)];
        //newCard.id = Math.random();
        var newCard = $scope.publicaciones[i];
        $scope.cards.push(angular.extend({}, newCard));
    }
 
    for(var i = 0; i < $scope.publicaciones.length; i++) $scope.addCard(i);
 
    $scope.cardSwipedLeft = function(index) {
        console.log('Left swipe');
    }
 
    $scope.cardSwipedRight = function(index) {
        console.log('Right swipe');
    }
 
    $scope.cardDestroyed = function(index) {
        $scope.cards.splice(index, 1);
        console.log('Card removed');
    }

    $scope.addFavorite = function(publicacion){
        if(jsonUtility.isFavorite(publicacion)){
            jsonUtility.removeFavorite(publicacion);
        }else {
            jsonUtility.addFavorite(publicacion);
        }
    };

  })

  .controller('MisPublicacionesCtrl', function ($scope, $stateParams, jsonUtility, Config, apiHandler, 
                                                $localStorage, $ionicNavBarDelegate, $state, $rootScope) {

    $scope.publicaciones = $localStorage.get('mis-publicaciones',[],true);;
    $scope.user = $localStorage.get('user',{},true);

    $scope.tipoController = $stateParams.tipoController;
    $scope.base_url = Config.base_url_web_images;
    $scope.tipos  = $rootScope.tipos;

    $ionicNavBarDelegate.showBackButton(true);

    $scope.viewPublicacion = function (publicacion) {
      $state.go('app.publicacion', {
        publicacionId: publicacion.id
      });
    };

    $scope.isFavorite = function(publicacion){
      return jsonUtility.isFavorite(publicacion);
    };

    apiHandler.listPublicacionsUser($scope.user).then(function(result){
        console.log(result);
        $localStorage.set('mis-publicaciones',result.data,true);
        $scope.publicaciones = result.data;
    },function(err){
        console.log(err);
    });
    

  })

  .controller('ProfileCtrl', function ($scope, $stateParams, apiHandler, $rootScope, 
                                      $state, $localStorage, $ionicNavBarDelegate) {

    $scope.user = $localStorage.get('user',{}, true);

    var promise = apiHandler.viewUser({'id': $scope.user.id});

    $scope.isIOS = $rootScope.isIOS;

    $ionicNavBarDelegate.showBackButton(true);

    promise.then(function (response) {
      console.log(response);
      if (response.error != 0) {
        // Error Handling
      } else {
        $scope.user = response.data;
      }
    });

    // GoTo Edit Profile
    $scope.goToEditProfile = function () {
      $state.go('app.profile-edit');
    };

    $scope.goToChangePassword = function () {
      $state.go('app.change-password');
    }


  })

  .controller('ProfileEditCtrl', function ($scope, apiHandler, $state, $rootScope,
                                           $cordovaCamera, $cordovaDatePicker, facebookHandler, $localStorage,
                                           dateUtility, $ionicNavBarDelegate) {

    var user = $localStorage.get('user',{}, true);

    $ionicNavBarDelegate.showBackButton(true);

    // Initialize user
    $scope.user = {};
    $scope.imageData = {};

    $scope.isIOS = $rootScope.isIOS;

    $scope.userFacebook = $localStorage.get('userFacebook', {}, true);

    var promise = apiHandler.viewUser({'id': user.id});

    promise.then(function (response) {
      console.log("Perfil: " + JSON.stringify(response));
      if (response.error != 0) {
        // Error Handling
      } else {
        $scope.user = response.data;
        // Check for parameters
        if ($scope.userFacebook.facebookToken) {

          var promise = facebookHandler.me($scope.userFacebook.facebookToken);

          promise.then(function (apiResponse) {
            console.log(JSON.stringify(apiResponse));

            if (apiResponse.hasOwnProperty('picture')) {
              var image = apiResponse.picture.data.url;

              if (!$scope.user.image || $scope.user.image != image) {
                $scope.user.image = image;
                apiHandler.updateImage($scope.user).then(function (imageData) {
                  $localStorage.set('user', user, true);
                  $state.transitionTo($state.current, {}, {
                    reload: true,
                    inherit: false,
                    notify: true
                  });
                }, function (err) {
                  console.log(err);
                  alert("Error al guardar la imagen")
                })
              }

            } else {
              $scope.user.image = null;
            }

            $scope.facebookConnected = true;
          });

          $scope.facebookConnected = true;
        } else {
          $scope.facebookConnected = false;
        }
      }
    });


    // Save Profile
    $scope.saveProfile = function (data) {

      var promise = apiHandler.editUser($scope.user);

      promise.then(function (response) {
        console.log("Response:");
        console.log(response);

        $scope.user = response.data;
        $state.go('app.profile');
      });

    };
    // END Save Profile function


    // Get Picture
    $scope.editProfilePicture = function () {
      document.addEventListener("deviceready", function () {

        var options = {
          quality: 80,
          destinationType: Camera.DestinationType.DATA_URL,
          cameraDirection: Camera.Direction.FRONT,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 800,
          targetHeight: 1200,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
          /*
           var image = document.getElementById('profilePicture');
           image.src = "data:image/jpeg;base64," + imageData;
           */
          $scope.user.image = "data:image/jpeg;base64," + imageData;
          $scope.imageData.image = imageData;

          // Save picture on
          var promise = apiHandler.updateImage($scope.imageData);

          promise.then(function (response) {
            console.log("Response:");
            console.log(response);
          });


        }, function (err) {
          // error
        });

      }, false);
    };
    // End Get Picture
  })


  .controller('changePasswordCtl', function ($scope, $rootScope, $state, authService, 
                        apiHandler, $localStorage, $ionicNavBarDelegate) {

    $scope.loginData = {
      'email': '',
      'password': '',
      'new_password': '',
      'repeat_password': ''
    };

    var user = $localStorage.get('user',{}, true);

    $ionicNavBarDelegate.showBackButton(true);

    var promise = apiHandler.viewUser({'id': user.id});

    promise.then(function (response) {
      console.log(response);

      if (response.error != 0) {
        // Error Handling
      } else {
        $scope.user = response.data;

        $scope.loginData.email = $scope.user.email;
        $scope.loginData.password = $scope.user.password;

      }
    });

    // SendForm function
    $scope.doSendForm = function () {
      //validaciones
      if ($scope.loginData.new_password.length <= 4) {
        $rootScope.showMessage("La contraseña es demasiado corta");
      } else if ($scope.loginData.new_password == $scope.loginData.password) {
        $rootScope.showMessage("El nuevo password es la misma contraseña actual");
      } else if ($scope.loginData.repeat_password != $scope.loginData.new_password) {
        $rootScope.showMessage("No coinciden las contraseñas");
      } else {
        $scope.loginData.password = $scope.loginData.new_password;
        authService.changePassword($scope.loginData).then(function (data) {
          if (data.error == 0) {
            $rootScope.showMessage("Se ha realizado el cambio de contraseña");
            console.log(data);
            $state.go('app.profile');
          } else {
            $rootScope.error(
              $rootScope.getErrorDescription(data.error)
            );
          }
        }, function (err) {
          console.log(err);
          $rootScope.showMessage("Error en cambio de contraseña");
        });
      }

    };
    // END sendform function


  })

  .controller('NoInternetCtrl', function ($scope, $state, $ionicHistory) {
    $scope.goBack = function () {
      $ionicHistory.goBack();
    };
  })



  .controller('PublicacionNewCtrl', function ($rootScope, $scope, $location, $stateParams,
                                              apiHandler, $state, $ionicHistory, uiGmapGoogleMapApi,
                                              $ionicModal, $ionicPopup, $localStorage, $cordovaGeolocation,
                                              dateUtility, Config, $ionicNavBarDelegate) {
    // Needed variables
    $scope.publicacion = {
      tipo: 'P'
    };

    $ionicNavBarDelegate.showBackButton(true);

    $scope.title="Nueva Publicación";
    $scope.base_url = Config.base_url_web;

    $scope.sexos  = $rootScope.sexos;
    $scope.edades = $rootScope.edades;
    $scope.tipos  = $rootScope.tipos;

    $scope.colores        = $localStorage.get('colores', [], true);
    $scope.tipos_mascota  = $localStorage.get('tipos_mascota', [], true);
    $scope.razas          = $localStorage.get('razas', [], true);

    // Config for autocomplete
    $scope.autocompleteOptions = {
      location: new google.maps.LatLng($rootScope.lat, $rootScope.lng),
      radius: 2000
    };


    // Modal definition
    $ionicModal.fromTemplateUrl('templates/location-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      $scope.modal.show();
    };
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // End modal

    // Detect places
    $scope.$watch("publicacion.direction", function (newValue, oldValue) {
      if (typeof $scope.publicacion.direction != "string" && typeof $scope.publicacion.direction != "undefined" && $scope.publicacion.direction != null) {
        $scope.publicacion.address = $scope.publicacion.direction.formatted_address;
        $scope.map.center.latitude = $scope.publicacion.direction.geometry.location.lat();
        $scope.map.center.longitude = $scope.publicacion.direction.geometry.location.lng();

      }else if(typeof $scope.publicacion.direction == "string" && $scope.publicacion.direction == "Mi ubicacion"){
        $scope.publicacion.address = " Mi ubicacion";
        $scope.map.center.latitude = $rootScope.lat;
        $scope.map.center.longitude = $rootScope.lng;
      }
    });

    // Clear function
    $scope.clearDirection = function () {
      $scope.publicacion.direction = '';
    };

    // Create publicacion function
    $scope.createPublicacion = function () {

      console.log("Entro a validar formulario")

      $scope.publicacion.latitude = $scope.map.center.latitude;
      $scope.publicacion.longitude = $scope.map.center.longitude;

      var todoCorrecto = true;
      var formulario = document.getElementById('publicacionForm');
      for (var i = 0; i < formulario.length; i++) {
        if (formulario[i].type == 'text' || formulario[i].type == 'tel' || formulario[i].type == 'email' || formulario[i].type == 'password') {
          if (formulario[i].value === null || formulario[i].value.length == 0 || /^\s*$/.test(formulario[i].value)) {
            $ionicPopup.alert({
              title: 'Error de llenado!',
              template: formulario[i].name + ' no puede estar vacío o contener sólo espacios en blanco'
            });
            todoCorrecto = false;
            break;
          }
        }
      }

      if (!todoCorrecto)
        return false;


      console.log("Nuevo publicacion: " + JSON.stringify($scope.publicacion));

      var promise = apiHandler.newPublicacion($scope.publicacion);

      promise.then(function (response) {
        console.log("Response:");
        console.log(response);

        $scope.returnedPublicacion = response.data;
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({disableBack: 'true'});

        $state.go('app.publicacion-images', {'publicacionId': $scope.returnedPublicacion.id});
      });
    };
    // End create publicacion function

    uiGmapGoogleMapApi.then(function (maps) {
      console.log(maps);
      $scope.map = {
        center: {latitude: -34.6156541, longitude: -58.5734051},
        zoom: 15,
        options: {mapTypeControl: false, streetViewControl: false, mapTypeId: maps.MapTypeId.ROADMAP}
      };
    });

    $scope.centerOnMe = function () {
      if (!$scope.map)
        return;
      var posOptions = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $rootScope.lat = position.coords.latitude;
          $rootScope.lng = position.coords.longitude;
          $scope.publicacion.direction = "Mi ubicacion";
        }, function (err) {
          $ionicPopup.alert({
            title: 'Error de localizacion!',
            template: 'No esta activa la localizacion'
          });
        });
    }

  })

  .controller('PublicacionEditCtrl', function ($rootScope, $scope, $location, $stateParams,
                                              apiHandler, $state, $ionicHistory, uiGmapGoogleMapApi,
                                              $ionicModal, $ionicPopup, $localStorage, $cordovaGeolocation,
                                              dateUtility, $timeout, Config, $ionicNavBarDelegate) {

    var publicacionId = $stateParams["publicacionId"];

    $ionicNavBarDelegate.showBackButton(true);

    var data = {"id": publicacionId};

    $scope.title="Publicacion " + publicacionId;
    $scope.base_url = Config.base_url_web_images;

    var promise = apiHandler.viewPublicacion(data);

    promise.then(function (response) {
      console.log("Response:");
      console.log(response);

      if (response.error != 0) {
        // TODO: throw popup
        $rootScope.error('Ocurrió un error en la operación.');
        window.history.back();
      } else {
        $scope.publicacion = {};
        $scope.publicacion.tipoMascota = response.data.tipoMascota.id;
        $scope.publicacion.color = response.data.color.id;
        $scope.publicacion.raza = response.data.raza.id;
        $scope.publicacion.titulo = response.data.titulo;
        $scope.publicacion.descripcion = response.data.descripcion;
        $scope.publicacion.edad = response.data.edad;
        $scope.publicacion.sexo = response.data.sexo;
        $scope.publicacion.tipo = response.data.tipo;
        $scope.publicacion.fotos = response.data.fotos || [];
        $scope.publicacion.id = response.data.id;
        $scope.publicacion.usuario = response.data.usuario;
        $scope.publicacion.latitude = response.data.latitude;
        $scope.publicacion.longitude = response.data.longitude;
        $scope.publicacion.estado = response.data.estado;
        $scope.publicacion.direction = '';

        // Config for autocomplete
        $scope.autocompleteOptions = {
          location: new google.maps.LatLng($scope.publicacion.latitude, $scope.publicacion.longitude),
          radius: 2000
        };

        $timeout(function(){
          var raza = document.getElementById('raza');
          var razaValue = $scope.publicacion.raza;
          for(var cont=0; cont<raza.options.length; cont++){
            if(raza.options[cont].value==razaValue){
              console.log("tipo de raza encontrada")
              raza.selectedIndex = cont;
              break;
            }else{
              console.log(razaValue + " -> " + raza.options[cont].value);
            }
          }
        },1000);



        $scope.publicacion.direction = null;
        console.log($scope.publicacion);
      }
    });

    $scope.sexos  = $rootScope.sexos;
    $scope.edades = $rootScope.edades;
    $scope.tipos  = $rootScope.tipos;

    $scope.colores        = $localStorage.get('colores', [], true);
    $scope.tipos_mascota  = $localStorage.get('tipos_mascota', [], true);
    $scope.razas          = $localStorage.get('razas', [], true);

    // Modal definition
    $ionicModal.fromTemplateUrl('templates/location-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      $scope.modal.show();
    };
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    // End modal

    // Detect places
    $scope.$watch("publicacion.direction", function (newValue, oldValue) {
      if (typeof $scope.publicacion.direction != "string" && typeof $scope.publicacion.direction != "undefined" && $scope.publicacion.direction != null) {
        $scope.publicacion.address = $scope.publicacion.direction.formatted_address;
        $scope.map.center.latitude = $scope.publicacion.direction.geometry.location.lat();
        $scope.map.center.longitude = $scope.publicacion.direction.geometry.location.lng();
      }else if(typeof $scope.publicacion.direction == "string" && $scope.publicacion.direction == "Mi ubicacion"){
        $scope.publicacion.address = "Mi ubicacion";
        $scope.map.center.latitude = $rootScope.lat;
        $scope.map.center.longitude = $rootScope.lng;
      }
    });

    // Clear function
    $scope.clearDirection = function () {
      $scope.publicacion.direction = '';
    };

    // Actualizar publicacion function
    $scope.updatePublicacion = function () {

      console.log("Entro a validar formulario")

      $scope.publicacion.latitude = $scope.map.center.latitude;
      $scope.publicacion.longitude = $scope.map.center.longitude;

      var todoCorrecto = true;
      var formulario = document.getElementById('publicacionForm');
      for (var i = 0; i < formulario.length; i++) {
        if (formulario[i].type == 'text' || formulario[i].type == 'tel' || formulario[i].type == 'email' || formulario[i].type == 'password') {
          if (formulario[i].value === null || formulario[i].value.length == 0 || /^\s*$/.test(formulario[i].value)) {
            $ionicPopup.alert({
              title: 'Error de llenado!',
              template: formulario[i].name + ' no puede estar vacío o contener sólo espacios en blanco'
            });
            todoCorrecto = false;
            break;
          }
        }
      }

      if (!todoCorrecto)
        return false;


      console.log("Editar publicacion: " + JSON.stringify($scope.publicacion));

      var promise = apiHandler.editPublicacion($scope.publicacion);

      promise.then(function (response) {
        console.log("Response:");
        console.log(response);

        $scope.returnedPublicacion = response.data;
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({disableBack: 'true'});

        $state.go('app.publicacion-images', {'publicacionId': $scope.returnedPublicacion.id});
      });
    };
    // End create publicacion function

    uiGmapGoogleMapApi.then(function (maps) {
      console.log(maps);
      $scope.map = {
        center: {latitude: -34.6156541, longitude: -58.5734051},
        zoom: 15,
        options: {mapTypeControl: false, streetViewControl: false, mapTypeId: maps.MapTypeId.ROADMAP}
      };
    });

    $scope.centerOnMe = function () {
      if (!$scope.map)
        return;
      var posOptions = {timeout: 10000, enableHighAccuracy: true};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $rootScope.lat = position.coords.latitude;
          $rootScope.lng = position.coords.longitude;
          $scope.publicacion.direction = "Mi ubicacion";
        }, function (err) {
          $ionicPopup.alert({
            title: 'Error de localizacion!',
            template: 'No esta activa la localizacion'
          });
        });
    }

  })

  .controller('PublicacionImagesCtrl', function ($scope, $state, $stateParams, $ionicViewService, $ionicPopup,
                                                 $window, $http, $q, $cordovaCamera, FileService, apiHandler,
                                                 ImageService, $rootScope, $ionicActionSheet, 
                                                 $localStorage, Config, $ionicNavBarDelegate) {

    var publicacionId = $stateParams["publicacionId"];

    $ionicNavBarDelegate.showBackButton(true);

    var data = {"id": publicacionId};

    $scope.sexos  = $rootScope.sexos;
    $scope.edades = $rootScope.edades;
    $scope.tipos  = $rootScope.tipos;
    $scope.base_url = Config.base_url_web_images;

    $scope.getPublicacion = function(){

      var promise = apiHandler.viewPublicacion(data);

      promise.then(function (response) {
        console.log("Response:");
        console.log(response);

        if (response.error != 0) {
          // TODO: throw popup
          $rootScope.error('Ocurrió un error en la operación.');
          window.history.back();
        } else {
          $scope.publicacion = response.data;
         // $localStorage.set('images',$scope.publicacion.fotos,true);
          $scope.fotos = response.data.fotos;

          if ($scope.fotos.length == 0) {
            $ionicScrollDelegate.scrollTop();
          }
        }
      });

    }

    $scope.getPublicacion();

    function eliminarImagenPublicacion(foto){
      var data = {id: foto.id, publicacion: $scope.publicacion.id};
      var promise = apiHandler.deleteImagePublicacion(data);
      promise.then(function(response){
        console.log("Response:" + JSON.stringify(response));

        if (response.error != 0) {
          // TODO: throw popup
          $rootScope.error('Ocurrió un error en la operación.');
          window.history.back();
        } else {
          $scope.getPublicacion();
        }
      });
    }

    $scope.addPhoto = function () {
      $scope.hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: 'Tomar foto'},
          {text: 'Foto de la galeria'}
        ],
        titleText: 'Agregar imagenes',
        cancelText: 'Cancelar',
        buttonClicked: function (index) {
          $scope.takePhoto(index);
        }
      });
    };


    // Get Picture
    $scope.takePhoto = function (type) {
      $scope.hideSheet();
      ImageService.handleMediaBase64(type).then(function (result) {
        //console.log(result);
        var imagen = {id: 0, image: result};
        $scope.transferirImagen(imagen);
      },function(err){
        console.log("Error en tomar imagen: ");
        console.log(err);
      });
    };
    // End Get Picture

    $scope.removeImage = function (foto) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirmar quitar la imagen',
        template: 'Deseas quitar la imagen?',
        cancelText: "No",
        okText: "Si"
      });
      confirmPopup.then(function (res) {
        if (res) {
          apiHandler.deleteImagePublicacion(foto).then(function (result) {

              console.log(result);

              $scope.publicacion = result.data;
              $scope.fotos = result.data.fotos;
              if ($scope.fotos.length == 0) {
                $ionicScrollDelegate.scrollTop();
              }
              $scope.$apply();
            }, function(err){
              $ionicPopup.alert({
                title: 'Error al eliminar la imagen!',
                template: err.detail
              });
            });
        }
      });
    };

    $scope.finish = function(){
      $state.go('app.publicacion', {'publicacionId': $scope.publicacion.id});
    };

    $scope.urlForImage = function (imageName) {
      if(imageName.length > 250 ){
        return "data:image/jpeg;base64," + imageName;
      }else{
        return $scope.base_url + imageName;
      }

    };

    $scope.transferirImagen = function(imagen) {
      var params = params || { "publicacion": $scope.publicacion.id , "encode": "jpg"};
      params.image = imagen.image;
      apiHandler.loadImageBase64Publicacion(params).then(function (result) {
          $scope.getPublicacion();
      }, function (err) {
          console.log(err);
          $ionicPopup.alert({
            title: 'Error en la carga de imagen!',
            template: err.detail
          });
      });

    };

    $scope.goToPublicacionImages = function(){
      $state.go('app.publicacion-images', {'publicacionId': $scope.publicacion.id});
    }

  })

  .controller('PublicacionCtrl', function ($rootScope, $scope, $stateParams, $window, apiHandler, $state,
                                           $ionicPopup, uiGmapGoogleMapApi, $cordovaSocialSharing,
                                           $localStorage, jsonUtility,Config, $ionicNavBarDelegate,
                                           $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicModal, $timeout, $ionicLoading) {

    var publicacionId = $stateParams["publicacionId"];

    $ionicNavBarDelegate.showBackButton(true);

    var data = {"id": publicacionId};

    $scope.sexos  = $rootScope.sexos;
    $scope.edades = $rootScope.edades;
    $scope.tipos  = $rootScope.tipos;
    $scope.base_url = Config.base_url_web_images;

    $scope.user = $localStorage.get('user',{},true);

    var promise = apiHandler.viewPublicacion(data);

    promise.then(function (response) {
      console.log("Response:");
      console.log(JSON.stringify(response.data));

      if (response.error != 0) {
        // TODO: throw popup
        $rootScope.error('Ocurrió un error en la operación.');
        window.history.back();
      } else {
        $scope.publicacion = response.data;
        $scope.is_favorite = jsonUtility.isFavorite($scope.publicacion);
        $scope.can_edit = jsonUtility.isCantEdit($scope.publicacion);

        uiGmapGoogleMapApi.then(function (maps) {
    	  console.log(maps);
          $scope.marker = {
            id: 1,
            coords: {
              latitude: $scope.publicacion.latitude,
              longitude: $scope.publicacion.longitude
            }
          };
          $scope.map = {
            center: {latitude: $scope.publicacion.latitude, longitude: $scope.publicacion.longitude},
            zoom: 15,
            options: {mapTypeControl: false, streetViewControl: false, mapTypeId: maps.MapTypeId.ROADMAP}
          };

        });

      }
    });



    // Delete Publicacion Function
    $scope.deletePublicacion = function (publicacionId) {
      var promise = apiHandler.deletePublicacion({'id': publicacionId});

      promise.then(function (result) {
        if (result.error != 0) {
          $rootScope.error(
            $rootScope.getErrorDescription(result.error)
          );
        } else {
          $state.reload();
        }
      });
    };
    // End Cancel Publicacion Function


    $scope.edit = function(){
      $state.go('app.publicacion-edit', {'publicacionId': $scope.publicacion.id});
    };

    $scope.setFavorite = function(){
      if(!$scope.is_favorite){
        jsonUtility.addFavorite($scope.publicacion);
      }else{
        jsonUtility.removeFavorite($scope.publicacion);
      }
      $scope.is_favorite = jsonUtility.isFavorite($scope.publicacion);
    };

    $scope.setEstado = function(estado){
      $scope.publicacion.estado = estado;
      var promise = apiHandler.estadoPublicacion({'id': $scope.publicacion.id, 'estado': estado});

      promise.then(function (result) {
        if (result.error != 0) {
          $rootScope.error(
            $rootScope.getErrorDescription(result.error)
          );
        } else {
          $state.reload();
        }
      });
    };

    $scope.goToPublicacionImages = function(){
      $state.go('app.publicacion-images', {'publicacionId': $scope.publicacion.id});
    };

    $scope.zoomMin = 1;

    $scope.showImages = function(index) {
          $scope.activeSlide = index;
          $scope.showModal('templates/fotos-zoomview.html');
    };

    $scope.showModal = function(templateUrl) {
          $ionicModal.fromTemplateUrl(templateUrl, {
              scope: $scope
          }).then(function(modal) {
              $scope.modal = modal;
              $scope.modal.show();
          });
    };

    $scope.closeModal = function() {
          $scope.modal.hide();
          $scope.modal.remove()
    };

    $scope.updateSlideStatus = function(slide) {
          var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
          if (zoomFactor == $scope.zoomMin) {
              $ionicSlideBoxDelegate.enableSlide(true);
          } else {
              $ionicSlideBoxDelegate.enableSlide(false);
          }
    };

    $scope.contactoData = {
      message: ''
    };

    // Accion para cerrar el formContacto
    $scope.closeFormContacto = function () {
        console.log("Cerrar form contacto");
        $scope.modalFormContacto.hide();
    };

    // Accion para mostrar el formContacto
    $scope.showFormContacto = function () {
        $ionicLoading.show({
          template: 'Loading...'
        }).then(function(){
           console.log("The loading indicator is now displayed");
        });
        // Creamos un modal enviar un mensaje al usuario que creo la publicacion
        $ionicModal.fromTemplateUrl('templates/modalFormContacto.html', {
              scope: $scope
        }).then(function (modalFormContacto) {
              $scope.modalFormContacto = modalFormContacto;
        });
        $timeout(function(){
          $ionicLoading.hide().then(function(){
             console.log("The loading indicator is now hidden");
          });
          $scope.modalFormContacto.show();
        },1000);
        
    };

    $scope.doFormContacto = function () {
      $scope.contactoData.id = publicacionId;

      var promise = apiHandler.contactUserPublicacion($scope.contactoData);

      promise.then(function (result) {
        console.log(result);
        if (result.error != 0) {
          $rootScope.error(
            $rootScope.getErrorDescription(result.error)
          );
        } else {
          $ionicPopup.alert({
                title: 'Contacto solicitado',
                template: result.message
            });
            $scope.closeFormContacto();
        }
      });
      
    };


  })

;
