mapboxgl.accessToken =
  "pk.eyJ1IjoicnlhbmJ1bGNoZXIiLCJhIjoiY2tsd2w3OTA3MDBmZzJ1azJrNzU2ZWd1eiJ9.VyczYMv752tJuJd4cjsKhg";
var loader = document.getElementById("loader");
var mapDiv = document.getElementById("map");
var instructions = document.getElementById("map-overlay-container");
instructions.style.display = "none";
mapDiv.style.opacity = 0.25;

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});
var userLocation = [-84.74232, 39.51019];

function successLocation(position) {
  userLocation = [position.coords.longitude, position.coords.latitude];
  setupMap();
}

function finishRoute() {
  location.reload();
}

function errorLocation() {
  setupMap();
  alert(
    "Location services needs to be enabled to properly work. Defaulted to Oxford, Ohio"
  );
  //If browser declines location:
  //default location Oxford, Ohio
}
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 8,
  center: userLocation,
});

function setupMap() {
  mapDiv.style.opacity = 1;
  loader.style.display = "none";
  map.flyTo({
    center: userLocation,
    zoom: 15,
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

  var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  });
  // Add the control to the map.
  map.addControl(geolocate);

  geolocate.on("geolocate", (e) => {
    console.log(e);
  });
}

function getRoute(end) {
  // make a directions request using driving profile
  // an arbitrary start will always be the userLocation
  // only the end or destination will change
  var url =
    "https://api.mapbox.com/directions/v5/mapbox/driving/" +
    userLocation[0] +
    "," +
    userLocation[1] +
    ";" +
    end[0] +
    "," +
    end[1] +
    "?steps=true&geometries=geojson&access_token=" +
    mapboxgl.accessToken;

  // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = function () {
    var json = JSON.parse(req.response);
    var data = json.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };
    // if the route already exists on the map, reset it using setData
    if (map.getSource("route")) {
      map.getSource("route").setData(geojson);
    } else {
      // otherwise, make a new request
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: geojson,
            },
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    }
  };
  req.send();
}

map.on("load", function () {
  map.addSource("route", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer(
    {
      id: "routeLayer",
      type: "line",
      source: "route",
      layout: {},
      paint: {
        "line-color": "cornflowerblue",
        "line-width": 10,
      },
    },
    "road-label"
  );

  map.addLayer(
    {
      id: "routeArrows",
      source: "route",
      type: "symbol",
      layout: {
        "symbol-placement": "line",
        "text-field": "→",
        "text-rotate": 0,
        "text-keep-upright": false,
        "symbol-spacing": 30,
        "text-size": 22,
        "text-offset": [0, -0.1],
      },
      paint: {
        "text-color": "white",
        "text-halo-color": "white",
        "text-halo-width": 1,
      },
    },
    "road-label"
  );

  map.addSource("deliveries", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer(
    {
      id: "deliveriesLayer",
      type: "circle",
      source: "deliveries",
      layout: {},
      paint: {
        "circle-color": "#444",
        "circle-stroke-color": "#444",
        "circle-radius": 12,
      },
    },
    "road-label"
  );

  map.addLayer({
    id: "deliveriesLabels",
    type: "symbol",
    source: "deliveries",
    layout: {
      "text-field": ["get", "stop_number"],
    },
    paint: {
      "text-color": "white",
    },
  });
});

function updateSuccess(position) {
  userLocation = [position.coords.longitude, position.coords.latitude];
}

function updateUserLocation() {
  navigator.geolocation.getCurrentPosition(updateSuccess, errorLocation, {
    enableHighAccuracy: true,
  });
}

function routeBuild(day) {
  instructions.style.display = "";
  updateUserLocation();
  map.flyTo({
    center: userLocation,
    zoom: 17,
  });
  //mapDiv.style.height = "90vh";
  //document.getElementById("nextRouteButton").style.display = "";
  const API_URL_MONDAY = "https://www.routeplan.xyz/api/logs/find" + day;

  const locations = getLocations(API_URL_MONDAY);

  var addresses = [];
  locations
    .then((data) => (addresses = data))
    .then(() => {
      updateUserLocation();
      const coords = [];

      addresses.unshift({
        address: "Start Point",
        location: {
          longitude: userLocation[1],
          latitude: userLocation[0],
        },
      });

      addresses.forEach((address) => {
        coords.push(address.location);
      });

      const approachParam = ";curb";
      let optimizeUrl = "https://api.mapbox.com/optimized-trips/v1/";
      optimizeUrl += "mapbox/driving-traffic/";
      coords.forEach((coord) => {
        optimizeUrl += coord.latitude + "," + coord.longitude + ";";
      });
      optimizeUrl = optimizeUrl.slice(0, -1);
      optimizeUrl += "?access_token=" + mapboxgl.accessToken;
      optimizeUrl += "&geometries=geojson&&overview=full&steps=true";
      optimizeUrl += "&approaches=" + approachParam.repeat(coords.length - 1);
      // To inspect the response in the browser, remove for production

      fetch(optimizeUrl)
        .then((res) => res.json())
        .then((res) => {
          res.waypoints.forEach((waypoint, i) => {
            waypoint.address =
              waypoint[i] == 0 ? "Start" : addresses[i].address;
          });

          // Add the distance, duration, and turn-by-turn instructions to the sidebar
          setOverview(res);

          // Draw the route anps on the map
          setTripLine(res.trips[0]);
          setStops(res.waypoints);
        });
    });

  async function getLocations(API_URL) {
    var response = await fetch(API_URL);
    return response.json();
  }
}

const titleText = document.getElementById("title");
const addressList = document.getElementById("addresses");

const setOverview = function (route) {
  const trip = route.trips[0];
  const waypoints = route.waypoints;
  // Set some basic stats for the route in the sidebar
  titleText.innerText = `${(trip.distance / 1609.344).toFixed(1)} miles | ${(
    trip.duration / 60
  ).toFixed(0)} minutes`;
  addressList.innerText = "";

  // Add the delivery addresses and turn-by-turn instructions to the sidebar for each leg of the trip
  trip.legs.forEach((leg, i) => {
    const listItem = document.createElement("li");
    // We want the destination address when we depart, hence index + 1
    if (i < trip.legs.length - 1) {
      const nextDelivery = waypoints.find(
        ({ waypoint_index }) => waypoint_index === i + 1
      );

      listItem.innerHTML = `<b>Deliver to: ${nextDelivery.address}</b>`;
    } else {
      // We're outside the range of deliveries, so let's go home
      listItem.innerHTML = `<b>Return to Start Location</b>`;
    }
    addressList.appendChild(listItem);
    // add the TBT instructions for this leg
    leg.steps.forEach((step) => {
      const listItem = document.createElement("li");
      listItem.innerText = step.maneuver.instruction;
      addressList.appendChild(listItem);
    });
  });
};

const setTripLine = function (trip) {
  const routeLine = {
    type: "FeatureCollection",
    features: [
      {
        properties: {},
        geometry: trip.geometry,
      },
    ],
  };
  map.getSource("route").setData(routeLine);
};

const setStops = function (stops) {
  const deliveries = {
    type: "FeatureCollection",
    features: [],
  };

  stops.forEach((stop) => {
    const delivery = {
      properties: {
        name: stop.name,
        stop_number: stop.waypoint_index,
      },
      geometry: {
        type: "Point",
        coordinates: stop.location,
      },
    };
    deliveries.features.push(delivery);
  });
  map.getSource("deliveries").setData(deliveries);
};
