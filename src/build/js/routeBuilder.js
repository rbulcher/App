const API_URL = "https://www.routeplan.xyz/api/logs";

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

var userLocation = [-84.74232, 39.51019];
function successLocation(position) {
  userLocation = [position.coords.longitude, position.coords.latitude];
}

function errorLocation() {
  alert(
    "Location services needs to be enabled to properly work. Defaulted to Oxford, Ohio"
  );
}

const displayRoutes = document.getElementById("routes");

async function getLocations() {
  var response = await fetch(API_URL);
  return response.json();
}
var loadLocations = getLocations();

function displayDayRoute(day, dayAbreviation) {
    displayRoutes.textContent = "";
  const header = document.createElement("h2");
  header.textContent = day + " Route";
  displayRoutes.appendChild(header);

  loadLocations.then(locations => {
      locations.forEach((location) => {
        if (location.deliverDateAndType.includes(dayAbreviation)) {
          const div = document.createElement("div");
          const header = document.createElement("h4");
          const longLatVals = document.createElement("p");
          const deliverDateAndType = document.createElement("p");
          const descriptionVal = document.createElement("p");
          header.textContent = location.address;

          deliverDateAndType.textContent = location.deliverDateAndType;
          longLatVals.textContent =
            "Longitude: " +
            location.location.longitude +
            " Latitude: " +
            location.location.latitude;
          if (location.description.length > 3) {
            descriptionVal.textContent = "Description: " + location.description;
          } else {
            descriptionVal.textContent = "No Description";
          }

          div.appendChild(header);
          div.appendChild(longLatVals);
          div.appendChild(deliverDateAndType);
          div.appendChild(descriptionVal);
          displayRoutes.appendChild(div);

        }
      });
  })
}

function routeMonday() {
 displayDayRoute("Monday", "Mon");
}

function routeTuesday() {
  displayDayRoute("Tuesday", "Tue");
}

function routeWednesday() {
  displayDayRoute("Wednesday", "Wed");
}
function routeThursday() {
  displayDayRoute("Thursday", "Thur");
}

function routeFriday() {
  displayDayRoute("Friday", "Fri");
}

function routeSaturday() {
  displayDayRoute("Saturday", "Sat");
}

function routeSunday() {
  displayDayRoute("Sunday", "Sun");
}




