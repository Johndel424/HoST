 
const firebaseConfig = {
    apiKey: "AIzaSyC3rfHsxIKQYXnsi4m0UXLtRxyyc9KJaMI",
    authDomain: "host-9d733.firebaseapp.com",
    databaseURL: "https://host-9d733-default-rtdb.firebaseio.com",
    projectId: "host-9d733",
    storageBucket: "host-9d733.appspot.com",
    messagingSenderId: "1096872763965",
    appId: "1:1096872763965:web:21cd243ed87f2d649ac054"
  };
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

//lgogout
function logoutUser() {
firebase.auth().signOut().then(() => {
    // Sign-out successful.
    //alert("User logged out successfully!");
    window.location = 'index.html'; // Redirect to login page after logout
}).catch((error) => {
    // An error happened.
    console.error("Logout Error:", error);
    alert("Error logging out!");
});
}


  //display items
  var itemsRef = firebase.database().ref('bookings');
  
  // Reference to the items container
  var itemsContainer = document.getElementById('itemsContainer');
  
  function displayItems(snapshot) {
    itemsContainer.innerHTML = ''; // Clear previous items

    // Get the email of the logged-in user
    const userEmail = firebase.auth().currentUser ? firebase.auth().currentUser.email : null;

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();

        // Check if the cleaner matches the logged-in user's email
        if (item.cleaner !== "none" && item.cleaner === userEmail && item.status === "Pending") {
            var itemHtml = `
              <div style="display: flex; flex-direction: column; background-color: white; border-radius: 10px; padding: 10px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;"> <!-- Columns container -->
                      <!-- Left Column -->
                      <div class="mainImg" style="flex: 1; padding-right: 10px;">
                          <div>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Room #</p>
                              <p style="margin: 2px; font-size: 15px; font-weight: bold; color: #ef53a3;">ROOM ${item.roomId}</p>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Room Type</p>
                              <p style="margin: 2px; font-size: 15px; text-transform: uppercase;color: black;">${item.roomType}</p>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Check-in Date</p>
                              <p style="margin: 2px; font-size: 15px; color: black;">${formatDateTime(item.checkinTime)}</p>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Check-out Date</p>
                              <p style="margin: 2px; font-size: 15px; color: black;">${formatDateTime(item.checkoutDateTime)}</p>
                          </div>
                      </div>
                      
                      <!-- Right Column -->
                      <div class="mainImg" style="flex: 1; padding-left: 10px;">
                          <div>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Customer Name</p>
                              <p style="margin: 2px; color: black; font-size: 15px;">${item.name}</p>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Total Price</p>
                              <p style="margin: 2px; color: black; font-size: 15px; ">₱${item.totalPrice}</p>
                              <p style="margin: 2px; font-size: 10px; color: grey;">Description</p>
                              <p style="margin: 2px; color: black; font-size: 15px;">${item.status}</p>
                          </div>
                      </div>
                  </div>
                  <div style="text-align: center;">
    <button onclick="markAsClean('${item.roomId}', '${item.id}')" 
            style="padding: 10px 20px; border-radius: 5px; background-color: #ef53a3; color: white; border: none; cursor: pointer;">
        Mark as Clean
    </button>
</div>

              </div>
            `;
            itemsContainer.innerHTML += itemHtml;
        }
    });
}

itemsRef.on('value', function(snapshot) {
displayItems(snapshot);
});

function formatDateTime(timestamp) {
const date = new Date(timestamp);

// Format date as MM/DD/YYYY
const formattedDate = date.toLocaleDateString();

// Format time as HH:MM AM/PM
const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

// Combine date and time
return `${formattedDate} ${formattedTime}`; // Example: "11/01/2024 02:30 PM"
}

function markAsClean(roomId, id) {
    // Fetch inventory items from Firebase
    const inventoryRef = firebase.database().ref("inventory");
    inventoryRef.once("value").then(snapshot => {
        let inventoryItems = [];
        snapshot.forEach(childSnapshot => {
            const item = childSnapshot.val();
            inventoryItems.push({
                id: childSnapshot.key,
                name: item.itemName,
                quantity: item.quantity
            });
        });

        // Generate HTML for inventory list in SweetAlert
        let inventoryHTML = inventoryItems.map(item => `
            <div style="margin-bottom: 10px;">
                <label>
                    ${item.name} (Available: ${item.quantity})
                    <input type="number" id="${item.id}" min="0" max="${item.quantity}" placeholder="Enter Quantity" style="width: 60px;">
                </label>
            </div>
        `).join("");

        // Show SweetAlert with inventory list
        Swal.fire({
            title: "Select items to use for cleaning",
            html: inventoryHTML,
            showCancelButton: true,
            confirmButtonText: "Confirm",
            preConfirm: () => {
                let selectedItems = {};
                inventoryItems.forEach(item => {
                    const quantity = document.getElementById(item.id).value;
                    if (quantity > 0) {
                        selectedItems[item.id] = parseInt(quantity);
                    }
                });
                return selectedItems;
            }
        }).then(result => {
            if (result.isConfirmed) {
                const selectedItems = result.value;
                updateInventoryAndRoomStatus(roomId, id, selectedItems);
            }
        });
    });
}
function updateInventoryAndRoomStatus(roomId, bookingId, selectedItems) {
    const inventoryRef = firebase.database().ref("inventory");
    const roomRef = firebase.database().ref("rooms/" + roomId);
    const bookingsRef = firebase.database().ref("bookings/" + bookingId);
    const notificationsRef = firebase.database().ref("notifications");

    // Get the logged-in user's email
    const userEmail = firebase.auth().currentUser.email;

    // Prepare inventory updates
    const updates = {};
    let itemsUsed = []; // Store details of items used for notification message
    for (const itemId in selectedItems) {
        const quantityToDeduct = selectedItems[itemId];
        updates[`inventory/${itemId}/quantity`] = firebase.database.ServerValue.increment(-quantityToDeduct);
        
        // Push item details for notification
        itemsUsed.push(`${selectedItems[itemId]} x ${itemId}`);
    }

    // Update inventory, room status, and booking status
    firebase.database().ref().update(updates).then(() => {
        return roomRef.update({ status: "available" });
    }).then(() => {
        // Update booking status and collector name
        return bookingsRef.update({
            status: "clean"
        });
    }).then(() => {
        // Prepare notification message
        const itemsSummary = itemsUsed.join(", ");
        const message = `Room ${roomId} has been cleaned by ${userEmail}. Items used: ${itemsSummary}.`;

        // Create a new notification with a generated ID
        const newNotificationRef = notificationsRef.push();
        const notificationId = newNotificationRef.key;

        // Write notification data including the generated ID
        return newNotificationRef.set({
            id: notificationId,
            roomId: roomId,
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }).then(() => {
        Swal.fire("Room Marked Clean", "Inventory, room status, booking, and notification updated successfully", "success");
    }).catch(error => {
        Swal.fire("Error", "Failed to update inventory, room status, booking, or notification", "error");
    });
}

// function updateInventoryAndRoomStatus(roomId, bookingId, selectedItems) {
//     const inventoryRef = firebase.database().ref("inventory");
//     const roomRef = firebase.database().ref("rooms/" + roomId);
//     const bookingsRef = firebase.database().ref("bookings/" + bookingId);

//     // Batch update for inventory
//     const updates = {};
//     for (const itemId in selectedItems) {
//         const quantityToDeduct = selectedItems[itemId];
//         updates[`inventory/${itemId}/quantity`] = firebase.database.ServerValue.increment(-quantityToDeduct);
//     }

//     // Update inventory, room status, and booking status
//     firebase.database().ref().update(updates).then(() => {
//         return roomRef.update({ status: "available" });
//     }).then(() => {
//         // Update booking status and collector name
//         return bookingsRef.update({
//             status: "clean",
//             collectorName: "done"
//         });
//     }).then(() => {
//         Swal.fire("Room Marked Clean", "Inventory, room status, and booking updated successfully", "success");
//     }).catch(error => {
//         Swal.fire("Error", "Failed to update inventory, room status, or booking", "error");
//     });
// }

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in, get the user ID
    var uid = user.uid;
    
    // Reference to the user's profile in the database
    var userProfileRef = firebase.database().ref('users/' + uid);

    // Get the profile data from the database
    userProfileRef.once('value').then(function(snapshot) {
      var profileData = snapshot.val(); // Makuha ang lahat ng data ng profile
      
      // Get the profile image URL
      var profileImgUrl = profileData.profileImageUrl;

      // Get the username
      var username = profileData.username;

      // Set the profile image src attribute
      if (profileImgUrl) { 
        document.getElementById('userProfileImage').src = profileImgUrl;
      }

      // Set the username inside the div
      if (username) {
        document.getElementById('usernameParagraph').innerText = username;
      }
    }).catch(function(error) {
      console.log("Error fetching user data:", error);
    });
  } else {
    // No user is signed in.
    console.log("No user is signed in.");
  }
});
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})
sidebar.classList.toggle('hide');


const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})



const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
})