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

  loadLocations.then((locations) => {
    locations.forEach((location) => {
      if (location.deliverDateAndType.includes(dayAbreviation)) {
        const div = document.createElement("div");
        div.id = location._id;
        const header = document.createElement("h4");
        header.id = location._id + "header";
        const longLatVals = document.createElement("p");
        longLatVals.id = location._id + "longLatVals";
        const deliverDateAndType = document.createElement("p");
        deliverDateAndType.id = location._id + "deliverDateAndType";
        const descriptionVal = document.createElement("p");
        descriptionVal.id = location._id + "descriptionVal";

        const editButton = document.createElement("BUTTON");
        editButton.id = location._id + "editButton";
        editButton.textContent = "EDIT";
        editButton.className = "btn btn-sm btn-primary";
        editButton.addEventListener("click", () =>
          editEntry(location._id, day, dayAbreviation)
        );
        const deleteButton = document.createElement("BUTTON");
        deleteButton.id = location._id + "deleteButton";
        deleteButton.textContent = "DELETE";
        deleteButton.className = "btn btn-sm btn-danger";
        deleteButton.addEventListener("click", () =>
          deleteEntry(location._id, location.address)
        );

        header.textContent = location.address;

        deliverDateAndType.textContent = location.deliverDateAndType;
        longLatVals.textContent =
          "Longitude: " +
          location.location.longitude +
          " Latitude: " +
          location.location.latitude;
        if (location.description.length > 3) {
          descriptionVal.textContent = "Description:" + location.description;
        } else {
          descriptionVal.textContent = "No Description";
        }

        div.appendChild(header);
        div.appendChild(longLatVals);
        div.appendChild(deliverDateAndType);
        div.appendChild(descriptionVal);
        div.appendChild(editButton);
        div.appendChild(deleteButton);
        displayRoutes.appendChild(div);
      }
    });
  });
}

function deleteEntry(id, address) {
  const API_DELETE_ONE = "https://www.routeplan.xyz/api/logs/deleteOne/" + id;
  const confirmDelete = confirm("Delete Address: " + address);
  if (confirmDelete) {
    try {
      fetch(API_DELETE_ONE);
      alert("Successfully Deleted");
      document.getElementById(id).remove();
    } catch (error) {
      alert("ERROR: " + error);
    }
  }
}

function editEntry(id, day, dayAbreviation) {
  const API_EDIT_URL = "https://www.routeplan.xyz/api/logs/updateEntry/" + id;
  const div = document.getElementById(id);
  const header = document.getElementById(id + "header");
  const deliverDateAndType = document.getElementById(id + "deliverDateAndType");
  const descriptionVal = document.getElementById(id + "descriptionVal");
  const editButton = document.getElementById(id + "editButton");
  const deleteButton = document.getElementById(id + "deleteButton");
  editButton.style.display = "none";
  deleteButton.style.display = "none";

  const submitChangeButton = document.createElement("BUTTON");
  submitChangeButton.textContent = "SUBMIT";
  submitChangeButton.className = "btn btn-sm btn-primary";
  submitChangeButton.addEventListener("click", () => {
    //send data changes to DB
    if (headerEdit.value == "") {
      headerEdit.value = header.textContent;
    }
    if (deliveryDateAndTypeEdit.value == "") {
      deliveryDateAndTypeEdit.value = deliverDateAndType.textContent;
    }
    if (descriptionEdit.value == "") {
      descriptionEdit.value = descriptionVal.textContent.substring(
        12,
        descriptionVal.length
      );
    }

    const sendBody = {
      address: headerEdit.value,
      deliveryDateAndType: deliveryDateAndTypeEdit.value,
      description: descriptionEdit.value,
    };

    try {
      fetch(API_EDIT_URL, {
        method: "POST",
        body: JSON.stringify(sendBody),
        headers: {
          "content-type": "application/json",
        },
      }).then((response) => response.json());

      header.textContent = headerEdit.value;
      deliverDateAndType.textContent = deliveryDateAndTypeEdit.value;
      descriptionVal.textContent = "Description: " + descriptionEdit.value;

      headerEdit.remove();
      deliveryDateAndTypeEdit.remove();
      descriptionEdit.remove();
      submitChangeButton.remove();
      cancelChangeButton.remove();
      editButton.style.display = "";
      alert("Successfully Updated Data Entry");
    } catch (error) {
      console.log(error);
      alert("Error updating address");
    }
  });
  const cancelChangeButton = document.createElement("BUTTON");
  cancelChangeButton.textContent = "CANCEL";
  cancelChangeButton.className = "btn btn-sm btn-danger";

  cancelChangeButton.addEventListener("click", () => {
    headerEdit.remove();
    deliveryDateAndTypeEdit.remove();
    descriptionEdit.remove();
    submitChangeButton.remove();
    cancelChangeButton.remove();
    editButton.style.display = "";
    deleteButton.style.display = "";
  });

  const headerEdit = document.createElement("INPUT");
  headerEdit.setAttribute("placeholder", "Address");
  const deliveryDateAndTypeEdit = document.createElement("INPUT");
  deliveryDateAndTypeEdit.setAttribute("placeholder", "Day & Type");
  const descriptionEdit = document.createElement("INPUT");
  descriptionEdit.setAttribute("placeholder", "Description");
  div.appendChild(headerEdit);
  div.appendChild(deliveryDateAndTypeEdit);
  div.appendChild(descriptionEdit);
  div.appendChild(submitChangeButton);
  div.appendChild(cancelChangeButton);
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

function deleteRoutes() {
  var confirmDelete = confirm("Are you sure you want to delete every address?");
  if (confirmDelete) {
    try {
      fetch("https://www.routeplan.xyz/api/logs/deleteAllRoutes");
      alert("Successfully deleted all address entries!");
    } catch (error) {
      alert("ERROR: " + error);
    }
  }
}
