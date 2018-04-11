let map;
let geocoder;
let placeService;
let directionsService;
let directionsDisplay;
// let distanceService;

let places = [];
let origin;
let twoDeep = [];
let panoramas = [];


function initAutocomplete() {
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 8,
        mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    let input = document.getElementById('search');
    let searchBox = new google.maps.places.SearchBox(input);
    let options = {
        componentRestrictions: { country: 'us' }
    };

    autocomplete = new google.maps.places.Autocomplete(input, options);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    placeService = new google.maps.places.PlacesService(map);
    directionsDisplay.setMap(map);
}


function search(userInput) {
    codeAddress(userInput);
}

function codeAddress(userInput) {
    let ul = $('.address-list');
    let liOrigin = `<li class="list-group-item" style="border: none;">${userInput}</li>`;

    ul.append(liOrigin);

    geocoder.geocode({ 'address': userInput }, function (results, status) {

        if (status == 'OK') {
            origin = results[0].geometry.location;
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            var request = {
                location: results[0].geometry.location,
                radius: '50000',
                type: ['restaurant']
            };

            placeService = new google.maps.places.PlacesService(map);
            placeService.nearbySearch(request, callback);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        let destinations = [];
        for (var i = 0; i < 3; i++) {
            let randomChoice = results[Math.floor(Math.random() * results.length)];
            // var marker = new google.maps.Marker({
            //     map: map,
            //     position: randomChoice.geometry.location
            // });
            createListOfAddresses(randomChoice.vicinity)
            createPanoramas(randomChoice.vicinity, i);
            destinations.push(randomChoice.geometry.location);
        }
        calcRoute(origin, destinations);
    }
}

function calcRoute(origin, destinations) {

    var request = {
        origin,
        destination: destinations[2],
        waypoints: [
            {
                location: destinations[0],
                stopover: true
            }, {
                location: destinations[1],
                stopover: true
            }],
        optimizeWaypoints: true,
        travelMode: 'DRIVING',
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
}

function createListOfAddresses(address) {
    let ul = $('.address-list');
    let li = `<li class="list-group-item" style="border: none;">
            <a class="btn btn-light" data-toggle="modal" data-target="#exampleModal">${address}</a>
        </li>`;

    ul.append(li);
}

function createPanoramas(address, index) {
    geocoder.geocode({ address }, function (results, status) {
        if (status == 'OK') {
            let latlng = results[0].geometry.location;


            let panorama = new google.maps.StreetViewPanorama(
                document.getElementById(`map-${index + 1}`), {
                    position: latlng,
                    pov: { heading: 165, pitch: 0 },
                    visible: true
                });

            let slidePanorama = new google.maps.StreetViewPanorama(
                document.getElementById(`slidePano-${index + 1}`), {
                    position: latlng,
                    pov: { heading: 165, pitch: 0 },
                    visible: true,
                    streetViewControl: false
                });
        }
    })
}


// function findDistantLocations(results) {
//     let placeService = new google.maps.places.PlacesService(map);
//     let latlng = [];
//     let placeResultslatlng = [];
//     let randomThree = [];
//     // let furtherlatlng = [];

//     results.map((result) => {
//         latlng.push({
//             location: result.geometry.location,
//             radius: '50000',
//             address_components: ['street_address']
//         });
//     });

//     latlng.map((location) => {
//         placeService.nearbySearch(location, (results, status) => {
//             if (status == google.maps.places.PlacesServiceStatus.OK) {
//                 results.map((result) => {
//                     console.log(result.vicinity);

//                     // let origin;
//                     geocoder.geocode({ address: result.vicinity }, function (results, status) {
//                         if (status == 'OK') {
//                             placeResultslatlng.push(results[0].geometry.location);

//                             //grab three lat long
//                             if(randomThree.length < 3){
//                                 randomThree.push(results[0].geometry.location);
//                                 grabImages(results[0].geometry.location);
//                             }
//                         } else {
//                             alert('Geocode was not successful for the following reason: ' + status);
//                         }
//                     });
//                 });
//             }
//         });
//     });
// ${randomThree[0].lat},${randomThree[0].lng}

// console.log('3', randomThree);
// fetch(`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${randomThree[0].lat},${randomThree[0].lng}&heading=151.78&pitch=-0.76&key=AIzaSyB_tYDz6NtovaYqteStFfBKeNT9BGIf0Zc`)
// .then((response) => {
//     console.log(response.url);
// });
// distanceMatrix(placeResultslatlng);
// };


// function distanceMatrix(latlng) {
//     let distanceService = new google.maps.DistanceMatrixService();
//     distanceService.getDistanceMatrix(
//         {
//             origins: [origin],
//             destinations: latlng,
//             travelMode: 'DRIVING',
//             unitSystem: google.maps.UnitSystem.IMPERIAL,
//         }, getDistance);
// }

// function getDistance(response, status) {
//     console.log('get distance', response);
//     let twoDeep = [];
//     // let elements = response.rows[0].elements;

//     // for (var i = 0; i < elements.length; i++) {
//     //     let distance = elements[i].distance.value * 0.00062137;
//     //     if (distance >= 30) {
//     //         twoDeep.push(response.destinationAddresses[i]);
//     //     }
//     // }

//     // console.log('twoDeep', twoDeep);
// }


$('#search-btn').on('click', (event) => {
    event.preventDefault();
    $('.address-list').html('');
    let addressInput = $('#search').val();
    search(addressInput);
});
