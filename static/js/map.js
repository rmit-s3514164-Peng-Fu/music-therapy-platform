// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var positionMarker=null;
var prev_infowindow =false;
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 15
  });

  var info = new google.maps.Marker({
    map: map
  });

  var infowindow = new google.maps.InfoWindow({
    map: map
  });

  var bounds = {
    north: -25.363882,
    south: -31.203405,
    east: 131.044922,
    west: 125.244141
  };



  // Add 5 markers to map at random locations.
  // For each of these markers, give them a title with their index, and when
  // they are clicked they should open an infowindow with text from a secret
  // message.
  var secretMessages = ['ABC contact Number:------',
                        'DEF contact Number:------',
                        'HiJ contact Number:------',
                        'opQ contact Number:------',
                        'xyz contact Number:------'];

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var location = {
        lat:  pos.lat-5,
        lng:  pos.lng-5
      };
      info.setPosition(pos);
      map.setCenter(pos);
      // for marker
      var image = {
        url: '/static/images/flag.png',
   // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(20,32 ),
   // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
   // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
  };
 // Shapes define the clickable region of the icon. The type defines an HTML
 // <area> element 'poly' which traces out a polygon as a series of X,Y points.
 // The final coordinate closes the poly by connecting to the first coordinate.
 var shape = {
   coords: [1, 1, 1, 20, 18, 20, 18, 1],
   type: 'poly'
 };
      for (var i = 0; i < 5; ++i) {
        var marker = new google.maps.Marker({
          position: {
            lat: pos.lat + 0.005 * Math.random(),
            lng: pos.lng + 0.025 * Math.random()
          },
          map: map,
          icon: image,
          shape: shape,
          zIndex: 4
        });
        attachSecretMessage(marker, secretMessages[i]);
      }
    }, function() {
      handleLocationError(true, infowindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infowindow, map.getCenter());
  }
}

function attachSecretMessage(marker, secretMessage) {

  var infowindow = new google.maps.InfoWindow({
    content: secretMessage
  });


  marker.addListener('click', function() {
    if (prev_infowindow){
      prev_infowindow.close();
    }
    prev_infowindow= infowindow;
    infowindow.open(marker.get('map'), marker);
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
