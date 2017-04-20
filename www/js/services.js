angular.module('app.services', [])
        .service("apiHandler", function($http, $q, authService, Config) {

        this.executeRequest = function (url, data, method) {

            //var baseUrl = 'http://api.petbondweb.com';
            var baseUrl = Config.base_url;
            var deferred = $q.defer();
            var endpoint = baseUrl + url;

            console.log("Endpoint: " + endpoint);
            console.log("Data:");
            console.log(JSON.stringify(data));

            $http({
                method: method || 'POST',
                data: data || {},
                dataType: 'json',
                url: baseUrl + url,
                headers: {
                    'content-type': 'application/json',
                    'x-authorization': authService.getApiKey()
                }
            }).success(function(data) {
                deferred.resolve(data);
            }).error(function(data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        // Signup
        this.signup = function (data) {
            return this.executeRequest('/users/signup', data);
        };

        // User View
        this.viewUser = function (data) {

            var sufix = "";
            if (typeof data != 'undefined' && typeof data.id != 'undefined') {
                suffix = "/" + data.id;
            } else {
                suffix = "";
            }
            return this.executeRequest('/users/view' + suffix);
        };

        // User Edit
        this.editUser = function (data) {

            var sufix = "";
            if (typeof data != 'undefined' && typeof data.id != 'undefined') {
              suffix = "/" + data.id;
            } else {
              suffix = "";
            }

            return this.executeRequest('/users/edit'+ suffix, data);
        };

        // User Edit
        this.updateImage = function (data) {
            return this.executeRequest('/users/update/image', data);
        };

        // User Edit
        this.updateGeolocation = function (data) {
            return this.executeRequest('/users/update/geolocation', data);
        };

        // Publicacion List
        this.listPublicacions = function (data) {
            return this.executeRequest('/publications/list', data);
        };

        // Publicacion List All
        this.listPublicacionsAll = function (data) {
            return this.executeRequest('/publications/list/all', data);
        };

        // Publicacion List
        this.listPublicacionsUser = function (data) {
            return this.executeRequest('/publications/user/' + data["id"], data);
        };

        // Publicacion View
        this.viewPublicacion = function (data) {
            return this.executeRequest('/publications/view/' + data["id"], data);
        };

        // Publicacion add favorito
        this.addFavoritoPublicacion = function (data) {
            return this.executeRequest('/publications/favorito/add/' + data["id"], data);
        };

        // Publicacion remove favorito
        this.removeFavoritoPublicacion = function (data) {
            return this.executeRequest('/publications/favorito/remove/' + data["id"], data);
        };

        // Publicacion New
        this.newPublicacion = function (data) {
            return this.executeRequest('/publications/new', data);
        };

        // Publicacion Edit
        this.editPublicacion = function (data) {
            return this.executeRequest('/publications/edit/' + data["id"], data);
        };

        // Publicacion Contact to User own
        this.contactUserPublicacion = function (data) {
            return this.executeRequest('/publications/contact/user/' + data["id"], data);
        };

          // Publicacion set estado
        this.estadoPublicacion = function (data) {
          return this.executeRequest('/publications/estado/' + data["id"], data);
        };

        // Publicacion Join
        this.joinPublicacion = function (data) {
            return this.executeRequest('/publications/join', data);
        };

        // Publicacion Cancel
        this.cancelPublicacion = function (data) {
            return this.executeRequest('/publications/cancel', data);
        };

        // Publicacion Delete
        this.deletePublicacion = function (data) {
            return this.executeRequest('/publications/delete/' + data["id"], data);
        };

        // Publicacion Participants
        this.viewPublicacionParticipants = function (data) {
            return this.executeRequest('/publications/participants/' + data["id"], data);
        };

         // Publicacion subir imagen base64
         this.loadImageBase64Publicacion = function (data) {
            return this.executeRequest('/publications/load/image/base64', data);
         };

         // Eliminar imagen de publicacion
         this.deleteImagePublicacion = function (data) {
            return this.executeRequest('/publications/delete/image/' + data['id'], data);
         };

        //  Message List
        this.listMessage = function (data) {
            return this.executeRequest('/message/list', data);
        };

        // Message New
        this.newMessage = function (data) {
            return this.executeRequest('/message/new', data)
        };

        // Message Delete
        this.deleteMessage = function (data) {
            return this.executeRequest('/message/delete', data);
        };

    })
    .factory('authService', function($http, $q, $log, $state, $timeout, $localStorage, Config) {
        var obj =  {};
        obj.user = {};

        obj.setUser = function (user) {
            obj.user = {};
            obj.user = user;
            $localStorage.set('user', user, true);
            return obj.user;
        };

        obj.getUser = function () {
            return obj.user;
        };

        obj.getApiKey = function () {
            return (typeof obj.user === "undefined" ? '' : obj.user.apiKey) || '';
        };

        obj.executeRequest = function (url, data) {
            //var baseUrl = 'http://api.petbondweb.com';
            var baseUrl = Config.base_url;
            var deferred = $q.defer();
            var endpoint = baseUrl + url;

            console.log("Endpoint: " + endpoint);
            console.log("Data:");
            console.log(JSON.stringify(data));

            $http({
                method: 'POST',
                data: data || {},
                dataType: 'json',
                url: endpoint,
                headers: {
                    'content-type': 'application/json',
                    'x-authorization': (typeof obj.user != "undefined" ? obj.user.apiKey : '') || ''
                }
            }).success(function(data) {
                deferred.resolve(data);
            }).error(function(data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        obj.login = function (data) {
            return obj.executeRequest('/security/login', data);
        };

        obj.check = function (data) {
            return obj.executeRequest('/security/check', data);
        };

        obj.config = function (data) {

            var sufix = "";
            if (typeof data != 'undefined' && typeof data.id != 'undefined') {
                suffix = "/" + data.id;
            } else {
                suffix = "";
            }
            return obj.executeRequest('/security/config' + suffix);
        };

        obj.recoverPassword = function(data){
            return obj.executeRequest('/users/recover/password', data);
        };

        obj.logout = function () {
            return obj.executeRequest('/security/logout')
        };

        obj.changePassword = function(data){
            return obj.executeRequest('/users/change/password',data);
        };

        obj.confirmEmail = function(data){
            return obj.executeRequest('/users/confirm/email',data);
        };

        obj.init = function () {
            obj.user = $localStorage.get('user', {}, true);
        };

        obj.init();
        return obj;
    })

    .factory('$localStorage', ['$window', function ($window) {
        return {
            set: function(key, value, isJson) {
                if (typeof isJson === 'undefined') { isJson = false; }
                if(isJson) { value = JSON.stringify(value); }
                if (typeof $window.localStorage != "undefined") {
                    $window.localStorage[key] = value;
                } else {
                    $window.sessionStorage[key] = value;
                }

            },
            get: function(key, defaultValue, isJson) {
                if (typeof isJson === 'undefined') { isJson = false; }
                if (isJson) {
                    if (typeof $window.localStorage != "undefined") {
                        return JSON.parse($window.localStorage[key] || '{}');
                    } else {
                        return JSON.parse($window.sessionStorage[key] || '{}');
                    }
                } else {
                    if (typeof $window.localStorage != "undefined") {
                        return $window.localStorage[key] || defaultValue;
                    } else {
                        return $window.sessionStorage[key] || defaultValue;
                    }

                }
            }
        }
    }])

    .factory('responseObserver', ['$q','$rootScope', function responseObserver($q, $rootScope) {
        return {
            // optional method
            'request': function(config) {
                $rootScope.showLoader(true);
                return config;
            },
            // optional method
            'requestError': function(rejection) {
                // do something on error
                return $q.reject(rejection);
            },
            // optional method
            'response': function(response) {
                $rootScope.showLoader(false);
                return response;
            },
            // optional method
            'responseError': function(rejection) {
                // do something on error
                switch (rejection.status) {
                    case 403:
                        $rootScope.error('Tu sesión ha expirado, favor de inciar sesión de nuevo.');
                        $rootScope.showLoader(false);
                        $rootScope.forceLogout();
                        break;
                    case 500:
                        $rootScope.error('Ocurrió un error en el servidor, favor de intentar más tarde.');
                        $rootScope.showLoader(false);
                        break;
                    default:
                        $rootScope.error('Ocurrió un error en la conexión, favor de intentar más tarde. [' + rejection.status + ']');
                        $rootScope.showLoader(false);
                        break;
                }
                return $q.reject(rejection);
            }
        };
    }])

    .factory('jsonUtility', function ($localStorage) {
        var favoritos = [];
        return {
            isObjectEmpty: function(obj) {
                // null and undefined are "empty"
                if (obj == null) return true;

                // Otherwise, does it have any properties of its own?
                // Note that this doesn't handle
                // toString and valueOf enumeration bugs in IE < 9
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) return false;
                }
                return true;
            },
            isFavorite: function(publicacion){
              var favorito = false;
              if(favoritos.length == 0){
                favoritos = $localStorage.get('favoritos',[],true);
              }
              for(var cont=0; cont<favoritos.length; cont++){
                if(favoritos[cont].id == publicacion.id){
                  favorito = true;
                  break;
                }
              }
              return favorito;
            },
            isCantEdit: function (publicacion) {
              var user = $localStorage.get('user',{},true);

              if(user.is_admin) return true;

              if(publicacion.usuario.id == user.id){
                return true;
              }else{
                return false;
              }
            },
            addFavorite: function(publicacion){
              if(favoritos.length == 0){
                favoritos = $localStorage.get('favoritos',[],true);
              }
              if(!Array.isArray(favoritos)){
                favoritos = [];
              }
              favoritos.push(publicacion);
              $localStorage.set('favoritos', favoritos, true);
            },
            removeFavorite: function(publicacion){
              if(favoritos.length == 0){
                favoritos = $localStorage.get('favoritos',[],true);
              }
              if(!Array.isArray(favoritos)){
                favoritos = [];
              }
              favoritos.splice(favoritos.indexOf(publicacion),1);
              $localStorage.set('favoritos', favoritos, true);
            }
        }
    })

    .factory('dateUtility', function ($rootScope) {
        return {
            monthName: function(m) {
                var month = new Array();
                month[0] = "Ene";
                month[1] = "Feb";
                month[2] = "Mar";
                month[3] = "Abr";
                month[4] = "May";
                month[5] = "Jun";
                month[6] = "Jul";
                month[7] = "Ago";
                month[8] = "Sep";
                month[9] = "Oct";
                month[10] = "Nov";
                month[11] = "Dic";

                if (m >= 0 && m <= 11) {
                    return month[m];
                }
                return '??';
            },
            dayName: function(d) {
                var day = new Array();
                day[0] = 'Do';
                day[1] = 'Lu';
                day[2] = 'Ma';
                day[3] = 'Mi';
                day[4] = 'Ju';
                day[5] = 'Vi';
                day[6] = 'Sa';

                if (d >= 0 && d <= 6) {
                    return day[d];
                }
                return '??';
            },
            getDateFromString: function(date){
                if($rootScope.isIOS){
                    return date;
                }else{
                    var datos = date.split("-");
                    var fecha = new Date(datos[0],datos[1],datos[2]);
                    return fecha;
                }
            },
            getStringFromDate: function(date){
                if($rootScope.isIOS){
                    return date;
                }else{
                    var ano = parseInt(date.getFullYear(),10);
                    var mes = parseInt(date.getMonth(),10) + 1;
                    var dia = parseInt(date.getDate(),10);
                    var string = (dia>=10?dia:"0" + dia) + "\/" + (mes>=10?mes:"0" + mes) + "\/" + ano;
                    return string;
                }
            },
            getStringFromTime: function(time){
                if($rootScope.isIOS){
                    return time;
                }else{
                    var horas = parseInt(time.getHours(),10);
                    var minutos = parseInt(time.getMinutes(),10);
                    var string = '';
                    if(horas >= 12 && horas <= 23){
                        horas = (horas == 12?horas: horas - 12);
                        string = (horas>=10?horas:"0" + horas) + ":" + (minutos>=10?minutos:"0" + minutos) + " pm";
                    }else{
                        string = (horas>=10?horas:"0" + horas) + ":" + (minutos>=10?minutos:"0" + minutos) + " am";
                    }
                    return string;
                }
            }
        }
    })

    .factory("facebookHandler", function($http, $q, $localStorage) {
        var obj =  {};
        obj.user = {};

        obj.setUser = function (facebookId, facebookToken) {
            obj.user.facebookId = facebookId;
            obj.user.facebookToken = facebookToken;
            $localStorage.set('userFacebook', obj.user, true);
            return obj.user;
        };

        obj.setUserImageFacebook = function(url){
            this.getUser();
            obj.user.image = url;
            $localStorage.set('userFacebook',obj.user,true);
        };

        obj.getUser = function () {
            obj.user = $localStorage.get('userFacebook', {}, true);
            return obj.user;
        };

        obj.clear = function () {
            obj.user = {};
            $localStorage.set('userFacebook', obj.user, true);
            return obj.user;
        };

        obj.me = function (authToken) {

            var baseUrl = 'https://graph.facebook.com/v2.7/me?fields=first_name,last_name,email,picture.height(200).width(200)' +
                '&access_token=' + authToken +
                '&format=json&method=get&pretty=0&suppress_http_code=1';
            var deferred = $q.defer();

            console.log("Endpoint: " + baseUrl);
            console.log("API Token: " + authToken);

            $http({
                method: 'GET',
                dataType: 'json',
                url: baseUrl,
                headers: {
                    'content-type': 'application/json'
                }
            }).success(function(data) {
                deferred.resolve(data);
            }).error(function(data, status) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        return obj;
    })
  .factory('FileService', function($cordovaFile, $q) {
    var images;

    return {
      storeImage: function(img) {
        images.push(img);
        window.localStorage.setItem('images', JSON.stringify(images));
      },
      images: function() {
        var img = window.localStorage.getItem('images');
        if (img) {
          images = JSON.parse(img);
        } else {
          images = [];
        }
        return images;
      },
      getUrlForImage: function(imageName) {
        var trueOrigin = cordova.file.dataDirectory + imageName;
        return trueOrigin;
      },
      removeImage: function (image) {
        var self = this;
        return $q(function(resolve, reject){
          console.log("Remove Image");
          var imagenes = self.images();
          var indexImage = imagenes.indexOf(image);
          var name = imagenes[indexImage].substr(imagenes[indexImage].lastIndexOf('/') + 1);
          console.log(self.getUrlForImage(image));
          $cordovaFile.removeFile(cordova.file.dataDirectory, name)
            .then(function (success) {
              imagenes.splice(indexImage, 1);
              window.localStorage.setItem('images', JSON.stringify(imagenes));
              resolve(imagenes);
            }, function (error) {
              reject(imagenes);
            });
        });
      },
      removeImageBase64: function (image) {
        var self = this;
        return $q(function(resolve, reject){
          console.log("Remove Image");
          var imagenes = self.images();
          var indexImage = imagenes.indexOf(image);
          imagenes.splice(indexImage, 1);
          window.localStorage.setItem('images', JSON.stringify(imagenes));
          resolve(imagenes);
        });
      },
      empty: function () {
        var images = this.images();
        var self = this;
        if (images.length > 0) {
          this.removeImage(images[0], storageKey).then(function (imagenes) {
            return self.emtpy();
          }, function (err) {
            return err;
          })
        }else{
          return images;
        }
      }
    }
  })
  .factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile, $cordovaFileTransfer,
                                    authService, Config, $ionicLoading) {

    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    function optionsForType(type) {
      var source;
      switch (type) {
        case 0:
          source = Camera.PictureSourceType.CAMERA;
          break;
        case 1:
          source = Camera.PictureSourceType.PHOTOLIBRARY;
          break;
      }
      return {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: source,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        targetWidth: 800,
        targetHeight: 1200
      };
          
    };

    function saveMedia(type) {
      return $q(function(resolve, reject) {
        var options = optionsForType(type);
        console.log(options);
        $cordovaCamera.getPicture(options).then(function(imageUrl) {
          console.log(imageUrl);
          var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
          var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
          var newName = makeid() + name;
          $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
            .then(function(info) {
              console.log(imageUrl);
              console.log(JSON.stringify(info));
              FileService.storeImage(newName);
              resolve(info);
            }, function(e) {
              console.log(JSON.stringify(e));
              reject(e);
            });
        });
      })
    };

    function saveMediaBase64(type) {
      return $q(function(resolve, reject) {
        var options = optionsForType(type);
        console.log(options);
        $cordovaCamera.getPicture(options).then(function (imageData) {
            console.log(imageData.length);  
            //FileService.storeImage(imageData);
            resolve(imageData);
        }, function (err) {
          // error
            reject(err);
        });
      })
    };

    function getImageUploadOptions(imageURI, params, headers) {
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
      options.mimeType = "image/" + imageURI.substr(imageURI.lastIndexOf('.')+1);
      options.params = params;
      options.httpMethod = "POST";
      options.headers = headers || {'content-type': 'application/json','x-authorization': authService.getApiKey()};
      return options;
    }

    function savedFile(file, cb) {
      return function () {
        cb(file);
      };
    }

    return {
      createId: makeid,
      handleMediaDialog: saveMedia,
      handleMediaBase64: saveMediaBase64,
      uploadImages: function (image, params) {
        return $q(function(resolve, reject) {
          var url = Config.base_url + '/publications/new/image';
          var filePath = FileService.getUrlForImage(image);
          var options = getImageUploadOptions(filePath, params, headers);
          $cordovaFileTransfer.upload(url, filePath, options)
            .then(function(result) {
              console.log("Exito");
              console.log(JSON.stringify(result));
              $ionicLoading.hide().then(function(){
                console.log("The loading indicator is now hidden");
              });
              resolve(result);
            }, function(err) {
              console.log("Error");
              console.log(JSON.stringify(err));
              $ionicLoading.hide().then(function(){
                console.log("The loading indicator is now hidden");
              });
              reject(err);
            }, function (progress) {
              $ionicLoading.show({
                template: Math.ceil((progress.loaded / progress.total) * 100)+'%'
              }).then(function(){
                console.log("The loading indicator is now displayed");
              });
            });
        });
      }
    }
  })
;
