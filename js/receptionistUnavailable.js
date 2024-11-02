 
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
const storage = firebase.storage();

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
//create room
async function handleSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  const roomId = document.getElementById('room').value; // Use this as UID
  const roomType = document.getElementById('roomType').value;
  const price = document.getElementById('price').value;
  const description = document.getElementById('description').value;
  const fileInput = document.getElementById('profileImage');
  const file = fileInput.files[0]; // Get the file

  // Check if roomId already exists
  const roomRef = database.ref('rooms/' + roomId);
  const snapshot = await roomRef.once('value');
  if (snapshot.exists()) {
    Swal.fire("Error", "Room ID already exists. Please choose a different ID.", "error");
    return;
  }

  // Upload image to Firebase Storage
  const storageRef = storage.ref('images/' + roomId + '/' + file.name);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      // You can add progress indication here if needed
    }, 
    (error) => {
      console.error('Upload failed:', error);
      Swal.fire("Upload Failed", "There was an error uploading the image. Please try again.", "error");
    }, 
    async () => {
      // Get the download URL
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

      // Save data to Realtime Database
      const roomData = {
        roomId,
        roomType,
        price,
        description,
        imageUrl: downloadURL,
        status: "available" // Add default status as "available"
      };

      roomRef.set(roomData)
        .then(() => {
          accountContainer.style.display = 'none';
          Swal.fire("Success", "Room created successfully!", "success");
          document.getElementById('createAccountForm').reset(); // Reset form after submission
        })
        .catch((error) => {
          console.error('Error saving data:', error);
          Swal.fire("Error", "There was an error saving the room data. Please try again.", "error");
        });
    }
  );
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('createAccountForm').addEventListener('submit', handleSubmit);
});


//display items
var itemsRef = firebase.database().ref('bookings');

// Reference to the items container
var itemsContainer = document.getElementById('itemsContainer');

function displayItems(snapshot) {
  itemsContainer.innerHTML = ''; // Clear previous items

  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();

      if (item.status === "checkin") {
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

                <!-- Button Below the Columns -->
                <button 
                    style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; background-color: #ef53a3; color: white; font-size: 15px; cursor: pointer;" 
                    onclick="updateStatus('${item.id}', '${item.roomId}')">  <!-- Pass roomId here -->
                    CheckOut
                </button>

            </div>


          `;
          itemsContainer.innerHTML += itemHtml;
      }
  });
}
itemsRef.on('value', function(snapshot) {
  displayItems(snapshot);
});



// function updateStatus(id) {
//   Swal.fire({
//       title: 'Confirm Check Out',
//       text: "Are you sure you want to check out? This will change the status to Pending.",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, check out!',
//       cancelButtonText: 'No, cancel'
//   }).then((result) => {
//       if (result.isConfirmed) {
//           const statusRef = firebase.database().ref('bookings/' + id);

//           statusRef.update({
//               status: 'Pending'
//           })
//           .then(() => {
//               Swal.fire(
//                   'Checked Out!',
//                   'Your check out has been processed and the status is now Pending.',
//                   'success'
//               );
//           })
//           .catch((error) => {
//               console.error('Error updating status:', error);
//               Swal.fire(
//                   'Error!',
//                   'There was an error processing your check out. Please try again.',
//                   'error'
//               );
//           });
//       }
//   });
// }
function updateStatus(bookingId, roomId) { // Accept both bookingId and roomId
  Swal.fire({
      title: 'Confirm Check Out',
      text: "Are you sure you want to check out? This will change the status to Pending.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, check out!',
      cancelButtonText: 'No, cancel'
  }).then((result) => {
      if (result.isConfirmed) {
          const statusRef = firebase.database().ref('bookings/' + bookingId);
          const notificationsRef = firebase.database().ref("notifications");

          // Update booking status to 'Pending'
          statusRef.update({ status: 'Pending' })
          .then(() => {
              // Prepare notification message
              const message = `Room #${roomId} is ready for cleaning.`; // Use the passed roomId

              // Create a new notification with a generated ID
              const newNotificationRef = notificationsRef.push();
              const notificationId = newNotificationRef.key;

              // Write notification data including the generated ID
              return newNotificationRef.set({
                  notifId: notificationId,
                  roomId: roomId,
                  message: message,
                  timestamp: firebase.database.ServerValue.TIMESTAMP
              });
          })
          .then(() => {
              Swal.fire(
                  'Checked Out!',
                  'Your check out has been processed and the status is now Pending.',
                  'success'
              );
          })
          .catch((error) => {
              console.error('Error updating status or sending notification:', error);
              Swal.fire(
                  'Error!',
                  'There was an error processing your check out. Please try again.',
                  'error'
              );
          });
      }
  });
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);

  // Format date as MM/DD/YYYY
  const formattedDate = date.toLocaleDateString();

  // Format time as HH:MM AM/PM
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  // Combine date and time
  return `${formattedDate} ${formattedTime}`; // Example: "11/01/2024 02:30 PM"
}

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
