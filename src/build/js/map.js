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
var userStartLocation = [-84.74232, 39.51019];

function successLocation(position) {
  userLocation = [position.coords.longitude, position.coords.latitude];
  setupMap();
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

  map.on("click", function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["deliveriesLayer"], // replace this with the name of the layer
    });

    if (!features.length) {
      return;
    }

    var feature = features[0];
    var popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML("<h3>" + feature.properties.address + "</h3>")
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
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

function setStartLocation(position) {
  userStartLocation = [position.coords.longitude, position.coords.latitude];
}

function updateUserLocation() {
  navigator.geolocation.getCurrentPosition(updateSuccess, errorLocation, {
    enableHighAccuracy: true,
  });
}

function getStartLocation() {
  navigator.geolocation.getCurrentPosition(setStartLocation, errorLocation, {
    enableHighAccuracy: true,
  });
}

function routeBuild(day, currentRoute) {
  setInterval(updateUserLocation, 1000);
  if (currentRoute == 0) {
    getStartLocation();
  }
  instructions.style.display = "";
  updateUserLocation();
  // map.flyTo({
  //   center: userLocation,
  //   zoom: 17,
  // });
  //mapDiv.style.height = "90vh";
  //document.getElementById("nextRouteButton").style.display = "";
  const API_URL_DAY = "https://www.routeplan.xyz/api/logs/find" + day;

  const locations = getLocations(API_URL_DAY);

  var addresses = [];
  locations
    .then((data) => (addresses = data))
    .then(() => {
      const coords = [];

      var sortedAddresses = sortAddresses(addresses);

      var seperatedSections = [];

      while (sortedAddresses.length > 0) {
        var section = [];
        section = sortedAddresses.splice(0, 11);
        updateUserLocation();
        section.unshift({
          address: "Start Point",
          location: {
            longitude: userLocation[1],
            latitude: userLocation[0],
          },
        });

        seperatedSections.push(section);
      }

      if (currentRoute < seperatedSections.length) {
        var currentAddresses = seperatedSections[currentRoute];

        currentAddresses.forEach((address) => {
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
        optimizeUrl +=
          "&geometries=geojson&overview=full&steps=true&source=first&destination=last&roundtrip=false";
        optimizeUrl += "&approaches=" + approachParam.repeat(coords.length - 1);

        fetch(optimizeUrl)
          .then((res) => res.json())
          .then((res) => {
            res.waypoints.forEach((waypoint, i) => {
              waypoint.address =
                waypoint[i] == 0 ? "Start" : currentAddresses[i].address;
            });
            // Add the distance, duration, and turn-by-turn instructions to the sidebar
            setOverview(res, day);

            // Draw the route anps on the map
            setTripLine(res.trips[0]);
            setStops(res.waypoints);

            let button = document.getElementById("finished-route-button");
            button.textContent = "Continue";
            button.onclick = () => {
              currentRoute += 1;
              routeBuild(day, currentRoute, sortedAddresses);
            };
          });
      } else {
        alert("Finished Route");
        location.reload();
      }
    });

  async function getLocations(API_URL) {
    var response = await fetch(API_URL);
    return response.json();
  }
}

const titleText = document.getElementById("title");
const addressList = document.getElementById("addresses");

const setOverview = async function (route, day) {
  const API_URL_DAY = "https://www.routeplan.xyz/api/logs/find" + day;
  const locations = getLocations(API_URL_DAY);

  var addresses = [];
  await locations.then((data) => (addresses = data));

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
    if (i < trip.legs.length) {
      const nextDelivery = waypoints.find(
        ({ waypoint_index }) => waypoint_index === i
      );
      if (i == 0) {
        listItem.innerHTML = `<b>Proceed With Route</b>`;
      } else {
        let dateAndType = "";
        for (let i = 0; i < addresses.length; i++) {
          const address = addresses[i];
          if (address.address == nextDelivery.address) {
            dateAndType = address.deliverDateAndType;
            let dayAbreviation = "";
            if (day === "Monday") {
              dayAbreviation = "Mon";
            }
            if (day === "Tuesday") {
              dayAbreviation = "Tue";
            }
            if (day === "Wednesday") {
              dayAbreviation = "Wed";
            }
            if (day === "Thursday") {
              dayAbreviation = "Thur";
            }
            if (day === "Friday") {
              dayAbreviation = "Fri";
            }
            if (day === "Saturday") {
              dayAbreviation = "Sat";
            }
            if (day === "Sunday") {
              dayAbreviation = "Sun";
            }

            let start = dateAndType.search(dayAbreviation);
            let splitFromStart = dateAndType.substring(
              start,
              dateAndType.length - 1
            );
            let findFinish = "";

            if (day === "Monday") {
              findFinish = "Tue";
            }
            if (day === "Tuesday") {
              findFinish = "Wed";
            }
            if (day === "Wednesday") {
              findFinish = "Thur";
            }
            if (day === "Thursday") {
              findFinish = "Fri";
            }
            if (day === "Friday") {
              findFinish = "Sat";
            }
            if (day === "Saturday") {
              findFinish = "Sun";
            }

            let finish = splitFromStart.search(findFinish);
            if (finish == "") {
              finish = splitFromStart.length - 1;
            }

            dateAndType = splitFromStart.substring(0, finish);
            newsPaperType = dateAndType.substring(4, dateAndType.length);
          }
        }
        listItem.innerHTML = `<b>Deliver to: ${nextDelivery.address} : Paper Type - [${newsPaperType}]</b>`;
      }
    }

    addressList.appendChild(listItem);
    // add the TBT instructions for this leg
    setInterval(() => {
      console.log("checkStep");
      leg.steps.forEach((step) => {
        stepX = step.geometry.coordinates[0][0];
        stepY = step.geometry.coordinates[0][1];
        userX = userLocation[0];
        userY = userLocation[1];
        if (userX <= stepX + 0.0008 && userX >= stepX - 0.0008) {
          if (userY <= stepY + 0.0008 && userY >= stepY - 0.0008) {
            if (!alreadyVisitedStops.includes(step.name)) {
              alreadyVisitedStops.push(step.name);
              var msg = new SpeechSynthesisUtterance();
              msg.text = step.maneuver.instruction;
              window.speechSynthesis.speak(msg);
            }
          }
        }
      });
    }, 1000);
    let alreadyVisitedStops = [];

    leg.steps.forEach((step) => {
      // stepX = step.geometry.coordinates[0][0];
      // stepY = step.geometry.coordinates[0][1];
      // userX = userLocation[0];
      // userY = userLocation[1];
      // if (userX <= stepX + 0.0008 && userX >= stepX - 0.0008) {
      //   if (userY <= stepY + 0.0008 && userY >= stepY - 0.0008) {
      //     if (!alreadyVisitedStops.includes(step.name)) {
      //       alreadyVisitedStops.push(step.name);
      //       var msg = new SpeechSynthesisUtterance();
      //       msg.text = step.maneuver.instruction;
      //       window.speechSynthesis.speak(msg);
      //     }
      //   }
      // }
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
        address: stop.address,
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

function sortAddresses(addresses) {
  var allDistancesAndAddress = [];

  for (var i = 0; i < addresses.length; i++) {
    var currentAddress = addresses[i];
    var lat = currentAddress.location.latitude;
    var lon = currentAddress.location.longitude;

    var distanceFromUser = getDistanceFromLatLonInKm(
      userLocation[0],
      userLocation[1],
      lat,
      lon
    );
    allDistancesAndAddress.push({
      distanceFromUser,
      currentAddress,
    });
  }

  var sorted = allDistancesAndAddress.sort((a, b) => {
    return a.distanceFromUser - b.distanceFromUser;
  });

  var sortedAddressObjects = [];
  sorted.forEach((obj) => {
    sortedAddressObjects.push(obj.currentAddress);
  });
  return sortedAddressObjects;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d; // distance returned
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
