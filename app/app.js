(
    function(){
        var module = angular.module('viewAccess',['ui.router']);
        
        /// config -route
        var state = function(state, urlRouter){
            urlRouter.otherwise('/home')
            state
            .state('home',{url: '/home', templateUrl: 'home.html'})
            .state('secret',{url: '/secret', templateUrl: 'secret.html', controller: 'secretController'})
            .state('auth',{url: '/auth', templateUrl: 'authorizedView.html', controller: 'authController'})
            .state('unAuth',{url: '/unAuth', templateUrl: 'unAuthorizedView.html', controller: 'unAuthController'})
            ;
        }
        state.$inject = ['$stateProvider', '$urlRouterProvider'];
        module.config(state);
        
        
        /// value - state access control
        var accessControl = {
            'secret' : ['auth']     // 'secret' is ok to be accessed from 'auth' -> to allow more states to access 'secret' provide them into this array
        };
        module.value('accessControl', accessControl);
        
        
        /// service
        var service = function() {
            var secretViewAccess = false;
            var readSecretAccess = function(){return secretViewAccess;}
            var setSecretAccess = function(){secretViewAccess = true;}
            var clearSecretAccess = function(){secretViewAccess = false;}
            
            return {
                clearSecretViewAccess: clearSecretAccess
                ,setSecretViewAccess: setSecretAccess
                ,readSecretViewAccess: readSecretAccess
            }
        }
        module.factory('authService', service);
        
        
        /// controller - unauthorized
        var unAuthController = function(model, state, authService){            
            // route to Secret view
            model.toSecretView = function(){
                state.go('secret');
            }
        }
        unAuthController.$inject = ['$scope', '$state', 'authService'];
        module.controller('unAuthController', unAuthController);
        
        
        /// controller - authorized
        var authController = function(model, state){
            // route to Secret view
            model.toSecretView = function(){
                state.go('secret');
            }
        }
        authController.$inject = ['$scope', '$state'];
        module.controller('authController', authController);
        
        
        /// controller - secret
        var secretController = function(model){
            //
        }
        secretController.$inject = ['$scope'];
        module.controller('secretController', secretController);
        

        /// run
        var interState = function registerEventHandler($rootScope, $state, accessControl) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                
                var fromStateName = fromState.name,
                    toStateName = toState.name;
                var isRestrictedState = angular.isDefined(accessControl[toStateName]);
                
                if(isRestrictedState && accessControl[toStateName].indexOf(fromStateName) < 0){
                    event.preventDefault();
                    return $state.go('home');
                }

            });
        }
        interState.$inject = ['$rootScope', '$state', 'accessControl'];
        module.run(interState);
    }()
)