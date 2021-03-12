var accessToken =
"pk.eyJ1IjoicnlhbmJ1bGNoZXIiLCJhIjoiY2tsd2w3OTA3MDBmZzJ1azJrNzU2ZWd1eiJ9.VyczYMv752tJuJd4cjsKhg"

document.getElementById('input-file')
  .addEventListener('change', getFile)
  

  // *EXAMPLE* 
  // mapbox api call for address with proximity near oxford ohio
  // https://api.mapbox.com/geocoding/v5/mapbox.places/326%20South%20Poplar%20St.json?proximity=-84.75,39.506&access_token=pk.eyJ1IjoicnlhbmJ1bGNoZXIiLCJhIjoiY2tsd2w3OTA3MDBmZzJ1azJrNzU2ZWd1eiJ9.VyczYMv752tJuJd4cjsKhg

    
  navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
    })

    var userLocation = [-84.74232, 39.51019];
function successLocation(position) {
    userLocation = [position.coords.longitude, position.coords.latitude]
}

function errorLocation() {
    alert("Location services needs to be enabled to properly work. Defaulted to Oxford, Ohio")
}

function getFile(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	   placeFileContent(
      document.getElementById('content-target'),
      input.files[0])
  }
}

var addresses =[];
var geoCodes = [[]];

 function placeFileContent(target, file) {
	readFileContent(file).then(content => {
      var lines = content.split("\n");
      
    lines.forEach( line => {
          var currentAddress = line.split(",")[0]
        addresses.push("\n" + currentAddress)
        getGeoCode(currentAddress)
      })
  }).catch(error => console.log(error))
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

document.getElementById("submitData").addEventListener("click", function(event){
    event.preventDefault();
    
    // SEND DATA TO DB HERE

    var textArea = document.getElementById('content-target')
    if(textArea.value != ''){
        alert("Data Sent");
        textArea.value = '';
    }else {
        alert("Data required");
    }

  });

async function getGeoCode(address) {
        var formatAddress = "";
        for(var i = 0; i < address.length; i++) {
            formatAddress += address[i] + "%20";
        }
        // Above adds an extra %20 to string, this removes it
        var geoJsonAddress = formatAddress.slice(0,-3);
        var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + geoJsonAddress + ".json?proximity=+" + userLocation + "&access_token=" + accessToken;
        
        await fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(jsonResponse) {
    var addressLongitude = jsonResponse.features[0].geometry.coordinates[1]
    var addressLatitude = jsonResponse.features[0].geometry.coordinates[0]
    let longLat = [addressLongitude, addressLatitude];

    var target = document.getElementById('content-target')
    
       target.value += address + " - Longitude: " + longLat[0] + " Latitude: " + longLat[1] + "\n"
    
  });
}
