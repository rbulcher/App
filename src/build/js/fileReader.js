var accessToken =
  "pk.eyJ1IjoicnlhbmJ1bGNoZXIiLCJhIjoiY2tsd2w3OTA3MDBmZzJ1azJrNzU2ZWd1eiJ9.VyczYMv752tJuJd4cjsKhg";


const API_URL = "https://www.routeplan.xyz/api/logs";

document.getElementById("input-file").addEventListener("change", getFile);

// *EXAMPLE*
// mapbox api call for address with proximity near oxford ohio
// https://api.mapbox.com/geocoding/v5/mapbox.places/326%20South%20Poplar%20St.json?proximity=-84.75,39.506&access_token=pk.eyJ1IjoicnlhbmJ1bGNoZXIiLCJhIjoiY2tsd2w3OTA3MDBmZzJ1azJrNzU2ZWd1eiJ9.VyczYMv752tJuJd4cjsKhg

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

var userLocation = [-84.74232, 39.51019];
const addressesElement = document.getElementById("entries");

function successLocation(position) {
  userLocation = [position.coords.longitude, position.coords.latitude];
}

function errorLocation() {
  alert(
    "Location services needs to be enabled to properly work. Defaulted to Oxford, Ohio"
  );
}

function getFile(event) {
  const input = event.target;
  if ("files" in input && input.files.length > 0) {
    placeFileContent(document.getElementById("content-target"), input.files[0]);
  }
}

var addresses = [];
var descriptions = [];
var newsPaperDateAndType = [];
var geoCodes = [];
var monday = [],
  tuesday = [],
  wednesday = [],
  thursday = [],
  friday = [],
  saturday = [],
  sunday = [];

function placeFileContent(target, file) {
  readFileContent(file)
    .then((content) => {
      var lines = content.split("\n");
      lines.shift(); //remove title
      lines.shift(); //removes example
      lines.forEach((line) => {
        var splitLine = line.split(",");
        var address = splitLine[0];
        var description = splitLine[8];
        var monday = splitLine[1];
        var tuesday = splitLine[2];
        var wednesday = splitLine[3];
        var thursday = splitLine[4];
        var friday = splitLine[5];
        var saturday = splitLine[6];
        var sunday = splitLine[7];

        addresses.push(address);
        descriptions.push(description);
        var formatAddress = "";
        var splitAddress = address.split(" ");
        for (var i = 0; i < splitAddress.length; i++) {
          formatAddress += splitAddress[i] + "%20";
        }
        // Above adds an extra %20 to string, this removes it
        var geoJsonAddress = formatAddress.slice(0, -3);
        geoJsonAddress += "%2C%20Oxford%2C%20Ohio%2045056"
        var url =
          "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
          geoJsonAddress +
          ".json?address" +
          "&access_token=" +
          accessToken;

        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(function (jsonResponse) {
            var addressLongitude =
              jsonResponse.features[0].center[1];
            var addressLatitude =
              jsonResponse.features[0].center[0];
            let longLat = [addressLongitude, addressLatitude];

            const div = document.createElement("div");
            const header = document.createElement("h4");
            const longLatVals = document.createElement("p");
            const deliverDateAndType = document.createElement("p");
            const descriptionVal = document.createElement("p");
            header.textContent = address;
            var deliveryDateandTypeString = getDeliveryDateAndType(
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday
            );
            deliverDateAndType.textContent = deliveryDateandTypeString;
            newsPaperDateAndType.push(deliveryDateandTypeString);
            longLatVals.textContent =
              "Longitude: " + longLat[0] + " Latitude: " + longLat[1];
            if (description.length > 3) {
              descriptionVal.textContent = "Description: " + description;
            } else {
              descriptionVal.textContent = "No Description";
            }
            div.appendChild(header);
            div.appendChild(longLatVals);
            div.appendChild(deliverDateAndType);
            div.appendChild(descriptionVal);
            addressesElement.appendChild(div);

            geoCodes.push(longLat);
          });
      });
    })
    .catch((error) => console.log(error));
}

function readFileContent(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

document
  .getElementById("submitData")
  .addEventListener("click", function (event) {
    event.preventDefault();
    try {

      var sortedAddresses = [];
      var unsortedAddresses = [];
      if (addresses.length > 0) {
        var message;

        for (var i = 0; i < addresses.length; i++) {
          message = {
            address: addresses[i],
            deliverDateAndType: newsPaperDateAndType[i],
            description: descriptions[i],
            location: {
              longitude: geoCodes[i][0],
              latitude: geoCodes[i][1],
            },
          };
          unsortedAddresses.push(message);
        }
      }
      sortedAddresses = sortAddresses(unsortedAddresses);

      uploadSortedAddressesToDatabase(sortedAddresses);

      alert("Successfully loaded addresses");
     location.reload();
    } catch (error) {
      alert("Error uploading to DB:\n" + error);
    }
  });

function uploadSortedAddressesToDatabase(data) {

  for(let i = 0; i < data.length; i++) {
    console.log(data[i])
    fetch(API_URL, {
          method: "POST",
          body: JSON.stringify(data[i]),
          headers: {
            "content-type": "application/json",
          },
        })
  }
}

function sortAddresses(addresses) {
  var allDistancesAndAddress = [];

  for(var i = 0; i < addresses.length; i++) {
    var currentAddress = addresses[i];
    var lat = currentAddress.location.latitude;
    var lon = currentAddress.location.longitude;
    
    var distanceFromUser = getDistanceFromLatLonInKm(userLocation[0],userLocation[1],lat,lon);
    allDistancesAndAddress.push({
      distanceFromUser,
      currentAddress
    });
  }

  var sorted = allDistancesAndAddress.sort((a,b) => {
    return a.distanceFromUser - b.distanceFromUser;
  })

  var sortedAddressObjects =  [];
  sorted.forEach((obj) => {
      sortedAddressObjects.push(obj.currentAddress);
  })
  return sortedAddressObjects;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;  // distance returned
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDeliveryDateAndType(
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday
) {
  var response = "";
  if (monday.length > 1) response += "Mon: " + monday + "  ";
  if (tuesday.length > 1) response += "Tue: " + tuesday + "  ";
  if (wednesday.length > 1) response += "Wed: " + wednesday + "  ";
  if (thursday.length > 1) response += "Thur: " + thursday + "  ";
  if (friday.length > 1) response += "Fri: " + friday + "  ";
  if (saturday.length > 1) response += "Sat: " + saturday + "  ";
  if (sunday.length > 1) response += "Sun: " + sunday + "  ";

  return response;
}

async function getGeoCode(address) {
  var formatAddress = "";
  for (var i = 0; i < address.length; i++) {
    formatAddress += address[i] + "%20";
  }
  // Above adds an extra %20 to string, this removes it
  var geoJsonAddress = formatAddress.slice(0, -3);
  var url =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    geoJsonAddress +
    ".json?proximity=+" +
    userLocation +
    "&access_token=" +
    accessToken;

  await fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (jsonResponse) {
      var addressLongitude = jsonResponse.features[0].geometry.coordinates[1];
      var addressLatitude = jsonResponse.features[0].geometry.coordinates[0];
      let longLat = [addressLongitude, addressLatitude];

      const div = document.createElement("div");
      const header = document.createElement("h4");
      const contents = document.createElement("p");
      header.textContent = address;
      contents.textContent =
        "Longitude: " + longLat[0] + " Latitude: " + longLat[1];
      div.appendChild(header);
      div.appendChild(contents);
      addressesElement.appendChild(div);

      geoCodes.push(contents.textContent);
    });
}
