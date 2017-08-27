var app = angular.module('myApp', ['angularUtils.directives.dirPagination','ngStorage']);
app.controller('tableController',function($scope, $http, $localStorage){
    
    $scope.favorites = [];
    $scope.numOfLegislatorFavorites = 0;
    $scope.numOfBillFavorites = 0;
    $scope.numOfCommitteeFavorites = 0;
    $scope.isFavorite = [];
   
    for (var i = 0; i < localStorage.length; i++){
        
        if (localStorage.key(i) != "showIcon" && localStorage.key(i) != "urlBlackList") {
            $scope.isFavorite[localStorage.key(i)] = true;

            if(JSON.parse(localStorage.getItem(localStorage.key(i))).govtrack_id)
                $scope.numOfLegislatorFavorites++;
            else if(JSON.parse(localStorage.getItem(localStorage.key(i))).bill_id)
                $scope.numOfBillFavorites++;
            else
                $scope.numOfCommitteeFavorites++;
        }
    }
    
    $http({
    url: 'http://sample-env.k7fuibzcdm.us-east-1.elasticbeanstalk.com',
    method: "GET",
    params: {action: 'legislators'}
    }).then(function(response) {
        $scope.legislators = [];
        var obj = JSON.parse(response.data);
        $scope.legislators = obj.results;
    });
    
    $scope.applyLegislatorFilter = function(keyname, sortKeyName){
        $scope.filterValue = keyname;   
        $scope.sortKey = sortKeyName;
        $scope.stateName = '';
        $scope.search = '';
        
        if (keyname == 'house') {
            $scope.myHeader = "Legislators by House";
        }
        else if (keyname == 'senate') {
            $scope.myHeader = "Legislators by Senate";
        }
        else {
            $scope.myHeader = "Legislators by State";
        }
    }
    
    $scope.applyBillTab = function(billType){
        $scope.billHeader = billType + " Bills";
        $http({ 
        url: 'http://sample-env.k7fuibzcdm.us-east-1.elasticbeanstalk.com',
        method: "GET",
        params: {action: 'bills', type: billType}
        }).then(function(response) {
            $scope.bills = [];
            var obj = JSON.parse(response.data);
            $scope.bills = obj.results;
        });
    }
    
    $scope.applyCommitteeTab = function(committeeType){
        $scope.committeeHeader = committeeType;
        $scope.committeeFilter = committeeType;
    }
    
    $scope.applyFavoritesTab = function(favoriteType){
        $scope.favoritesHeader = "Favorite " +favoriteType;
    }
       
       
    $scope.getStateLegislators = function() {
        $scope.stateName = $scope.selectedState;
    }
    
    $scope.showDetails = function(tabName) {
        $scope.activeTab = tabName;
        if ($scope.activeTab == "Bills") {
            $http({ 
            url: 'http://sample-env.k7fuibzcdm.us-east-1.elasticbeanstalk.com',
            method: "GET",
            params: {action: 'bills', type: 'Active'}
            }).then(function(response) {
                $scope.bills = [];
                var obj = JSON.parse(response.data);
                $scope.bills = obj.results;
            });
        }
        
        else if ($scope.activeTab == "Committees") {
            $scope.committeeFilter = 'House';
            $http({ 
            url: 'http://sample-env.k7fuibzcdm.us-east-1.elasticbeanstalk.com',
            method: "GET",
            params: {action: 'committees'}
            }).then(function(response) {
                $scope.committees = [];
                var obj = JSON.parse(response.data);
                $scope.committees = obj.results;
            });
        }
        
        else if ($scope.activeTab == "Favorites") {
            for (var i = 0; i < localStorage.length; i++){
               $scope.favorites[i]  = JSON.parse(localStorage.getItem(localStorage.key(i)));
            }
            
        }
    }
    
    $scope.addToFavorites = function() {
        $(this).attr('id', 'favIcon');
        $("#favIcon").removeClass("fa-star-o");
        $("#favIcon").addClass("fa-star");
        $("#favIcon").css("color", "yellow");
        $("#favIcon").css("border-color", "grey");
    }
    
    $scope.viewBillDetails = function(bill) { 
        $scope.billRow = bill;
        $('#billCarousel').carousel('next');
    }
    
    $scope.viewLegislatorDetails = function(legislator) {
        $scope.legislatorRow = legislator;
        $scope.legislatorID = legislator.bioguide_id;
        $('#legislatorCarousel').carousel('next');
        
        $http({ 
            url: 'http://sample-env.k7fuibzcdm.us-east-1.elasticbeanstalk.com',
            method: "GET",
            params: {action: 'committees', type: 'legislators'}
            }).then(function(response) {
                $scope.legislatorCommittees = [];
                var obj = JSON.parse(response.data);
                $scope.legislatorCommittees = obj.results;
            });
        
        $http({
            url: 'http://sample-env.k7fuibzcdm.us-east-1.elasticbeanstalk.com',
            method: "GET",
            params: {action: 'bills', type: 'legislators', id: legislator.bioguide_id}
            }).then(function(response) {
                $scope.legislatorBills = [];
                var obj = JSON.parse(response.data);
                $scope.legislatorBills = obj.results;
            });
        
        var termStart = new Date(legislator.term_start);
        var termEnd = new Date(legislator.term_end);
        var startDate = termStart.getTime();
        var endDate = termEnd.getTime();
        var todayDate = new Date();
        var total = endDate - startDate;
        var current = todayDate.getTime() - startDate;
        $scope.termPercentage = Math.round((current / total) * 100);
    }
    
    $scope.addRemoveFavorites = function(id, Row) {
                    if (localStorage.getItem(id) && JSON.parse(localStorage.getItem(id)).bioguide_id == id) {
                        localStorage.removeItem(id);
                        $scope.isFavorite[id] = false;
                        $scope.numOfLegislatorFavorites--;
                    }
                    else {
                        localStorage.setItem(id, JSON.stringify(Row));
                        $scope.isFavorite[id] = true;
                        $scope.numOfLegislatorFavorites++;
                    }
        
                }
    
     $scope.addRemoveCommitteeFavorites = function(id, Row) {
                    if (localStorage.getItem(id) && JSON.parse(localStorage.getItem(id)).committee_id == id) {
                        localStorage.removeItem(id);
                        $scope.isFavorite[id] = false;
                        $scope.numOfCommitteeFavorites--;
                    }
                    else {
                        localStorage.setItem(id, JSON.stringify(Row));
                        $scope.isFavorite[id] = true;
                        $scope.numOfCommitteeFavorites++;
                    }
        
                }
    
  $scope.addRemoveBillFavorites = function(id, Row) {
                    if (localStorage.getItem(id) && JSON.parse(localStorage.getItem(id)).bill_id == id) {
                        localStorage.removeItem(id);
                        $scope.isFavorite[id] = false;
                        $scope.numOfBillFavorites--;
                    }
                    else {
                        localStorage.setItem(id, JSON.stringify(Row));
                        $scope.isFavorite[id] = true;
                        $scope.numOfBillFavorites++;
                    }
        
                }
  
  $scope.removeLegislatorFavorite = function(id) {
      var index = -1;
      for( var i = 0; i < $scope.favorites.length; i++ ) {
            if( $scope.favorites[i].bioguide_id == id ) {
                index = i;
                break;
             }
      }
      
      localStorage.removeItem(id);
      $scope.isFavorite[id] = false;
      $scope.favorites.splice( index, 1 );
      $scope.numOfLegislatorFavorites--;
  }
  
    $scope.removeBillFavorite = function(id) {
      var index = -1;
      for( var i = 0; i < $scope.favorites.length; i++ ) {
            if( $scope.favorites[i].bill_id == id ) {
                index = i;
                break;
             }
      }
      
      localStorage.removeItem(id);
      $scope.isFavorite[id] = false;
      $scope.favorites.splice( index, 1 );
      $scope.numOfBillFavorites--;
  }
    
  $scope.removeCommitteeFavorite = function(id) {
      var index = -1;
      for( var i = 0; i < $scope.favorites.length; i++ ) {
            if( $scope.favorites[i].committee_id == id ) {
                index = i;
                break;
             }
      }
      
      localStorage.removeItem(id);
      $scope.isFavorite[id] = false;
      $scope.favorites.splice( index, 1 );
      $scope.numOfCommitteeFavorites--;
  }
    
  $scope.jumpToLegislatorDetails = function(data) {
      $scope.activeTab = "Legislators";
      window.location = '#legislatorsDiv';
      $scope.viewLegislatorDetails(data);
  }
   
  $scope.jumpToBillDetails = function(data) {
      $scope.activeTab = "Bills";
      window.location = '#billsDiv';
      $scope.viewBillDetails(data);
  }
    
});