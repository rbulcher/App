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
  

  function routeMonday() {
        displayCurrentDay("Monday","Mon");
      }



      function routeTuesday() {
        displayCurrentDay("Tuesday","Tue");

      }

      function routeWednesday() {
        displayCurrentDay("Wednesday","Wed");
      }
      function routeThursday() {

        displayCurrentDay("Thursday","Thur");
      }

      function routeFriday() {
        displayCurrentDay("Friday","Fri");
      }

      function routeSaturday() {
        displayCurrentDay("Saturday","Sat");
      }

      function routeSunday() {
        displayCurrentDay("Sunday","Sun");
      }

      
      function displayCurrentDay(day, dayAbreviation) {
        displayRoutes.textContent = '';
        const header = document.createElement("h2");
        header.textContent = day + " Route";
        displayRoutes.appendChild(header);
       fetch(API_URL, {mode: 'cors',headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },})
    .then(response => response.json())
    .then(locations => {
          locations.forEach(location => {
            if(location.deliverDateAndType.includes(dayAbreviation)){
            const div = document.createElement("div");
            const header = document.createElement("h4");
            const longLatVals = document.createElement("p");
            const deliverDateAndType = document.createElement("p");
            const descriptionVal = document.createElement("p");
            header.textContent = location.address;

            deliverDateAndType.textContent = location.deliverDateAndType;
            longLatVals.textContent =
              "Longitude: " + location.location.longitude + " Latitude: " + location.location.latitude;
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