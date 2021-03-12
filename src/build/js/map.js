mapboxgl.accessToken =
"pk.eyJ1IjoicnlhbmJ1bGNoZXIiLCJhIjoiY2tsd2w3OTA3MDBmZzJ1azJrNzU2ZWd1eiJ9.VyczYMv752tJuJd4cjsKhg"
var loader = document.getElementById('loader');
var mapDiv = document.getElementById('map');
mapDiv.style.opacity = 0.25;
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
enableHighAccuracy: true
})
var userLocation = [-84.74232, 39.51019];

function successLocation(position) {
userLocation = [position.coords.longitude, position.coords.latitude]
setupMap(userLocation)
}



function errorLocation() {
setupMap(userLocation)
alert("Location services needs to be enabled to properly work. Defaulted to Oxford, Ohio")
//If browser declines location: 
//default location Oxford, Ohio

}
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 8,
  center: userLocation
})

var canvas = map.getCanvasContainer();

function setupMap(center) {
  mapDiv.style.opacity = 1;
  loader.style.display = 'none';
  map.flyTo({
    center: userLocation,
    zoom:15
  })

const nav = new mapboxgl.NavigationControl()
map.addControl(nav)

var geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
  enableHighAccuracy: true
  },
  trackUserLocation: true
  });
  // Add the control to the map.
  map.addControl(geolocate);

  geolocate.on('geolocate', (e) => {
    console.log(e)
});


}

function getRoute(end) {
  // make a directions request using driving profile
  // an arbitrary start will always be the userLocation
  // only the end or destination will change
  var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + userLocation[0] + ',' + userLocation[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

  // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function() {
    var json = JSON.parse(req.response);
    var data = json.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    // if the route already exists on the map, reset it using setData
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    } else { // otherwise, make a new request
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojson
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    var instructions = document.getElementById('instructions');
var steps = data.legs[0].steps;

var tripInstructions = [];
if(steps.length !== 0 && data.duration !== 0) {
  instructions.style.display = 'block';
}

for (var i = 0; i < steps.length; i++) {
  tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
  instructions.innerHTML = '<span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min  </span>' + tripInstructions;
}
  };
  req.send();
  
}

map.on('load', function () {
  // make an initial directions request that
  // starts and ends at the same location
  getRoute(userLocation);

  // Add destination to the map
  map.addLayer({
    'id': 'point',
    'type': 'circle',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'Point',
              'coordinates': userLocation
            }
          }
        ]
      }
    },
    'paint': {
      'circle-radius': 0
    }
  });



map.on('click', function(e) {
  var coordsObj = e.lngLat;
  canvas.style.cursor = '';
  var coords = Object.keys(coordsObj).map(function(key) {
    return coordsObj[key];
  });
  var end = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: coords
      }
    }
    ]
  };
  if (map.getLayer('end')) {
    map.getSource('end').setData(end);
  } else {
    map.addLayer({
      id: 'end',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: coords
            }
          }]
        }
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#f30'
      }
    });
  }
  getRoute(coords);
});
});
