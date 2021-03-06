angular
	.module('productFinder')
	.controller('homeCtrl', homeCtrl);



function homeCtrl($scope, $location, $window, $timeout, productData, auth, locService) { // service as parameter

	/*Geolocation*/
	$scope.lon2 = "";
	$scope.lat2 = "";


	if (typeof(localStorage) != "undefined") { // if localStorage is not set, set it to stotre lat and lon

		navigator.geolocation.getCurrentPosition(function(position) {
			$scope.lon2 = position.coords.longitude;
			$scope.lat2 = position.coords.latitude;

			localStorage.setItem('latitude', position.coords.latitude); // store in localStorage
			localStorage.setItem('longitude', position.coords.longitude);

			// compare current location and localStorage location 
			if ($scope.lon2 != localStorage.getItem('longitude')) {
				localStorage.removeItem('latitude');
				localStorage.removeItem('longitude');
			}


		});


		if (localStorage.getItem('longitude')) {
			$scope.geolocation = true;
		} else {
			$scope.geolocation = false;
		}

	}


	$("#wait").show(); // wait page to load. set timeout function called
	$('#show-products').css("display", "none");

	/* For Pagination */
	$scope.filteredItems = [];
	$scope.currentPage = 0;
	$scope.numPerPage = $('#selectItem').val(); // get value of numPerPage from select in view
	$scope.maxSize = 5;

	$timeout(function() { // timeout just for testing purpose
		$("#wait").css("display", "none");
		$('#show-products').show();
		$("#search").show();
		//Sort: default is by name
		$scope.sortBy = 'name';

		/* list of products from server */
		productData.productList()
			.success(function(data) {
				// $scope.data = {
				// 	products: data
				// };
				$('#selectItem').change(function() {
					$scope.numPerPage = $(this).val();
				});
				$scope.makeItems = function() {
					$scope.items = [];
					for (i = 0; i < data.length; i++) {
						$scope.items.push(data[i]);
					}
				};
				$scope.makeItems();

				$scope.numberOfPages = function() {
					return Math.ceil($scope.items.length / $scope.numPerPage);
				};
				$scope.$watch('currentPage', function() {
					var begin = (($scope.currentPage) * $scope.numPerPage);
					$scope.end = begin + $scope.numPerPage;
					$scope.filteredItems = $scope.items.slice(begin);
				});

				$scope.totalItemsLength = data.length;

				//call distance from locationService
				if ($scope.geolocation == true) { // if geolocation is on and lat lon is provided 
					$scope.disCalc = function(storelon, storelat, disObj) {
						return (locService.distance(storelon, storelat, localStorage.getItem('longitude'), localStorage.getItem('latitude'), disObj));

					};
				}

			})
			.error(function(e) {
				console.log(e);
			});
	});

	/* scroll to top when page changed */
	$('#pager').click(function() {
		$(window).scrollTop(0);
	});


	/* calculate average rating of each products */
	$scope.rating = function(product) {
		//Calculating Average rating
		var arr = []; // storage for ratings
		var ratingSum = 0;
		var actualRating = 0; // average rating

		for (var i = 0; i < product.review.length; i++) {
			arr.push(product.review[i].rating);
		}

		for (var i = 0; i < arr.length; i++) {
			ratingSum = arr[i] + ratingSum;
		}
		//console.log(ratingSum);
		actualRating = (ratingSum / arr.length) || 0;
		$scope.actual = Math.round(actualRating * 100) / 100;
		$scope.average = parseInt(actualRating);
		return $scope.average;
	};

	/* selectItem-div number display per page  */
	setTimeout(function() {
		$('#selectItem').show();
	}, 1000);



}