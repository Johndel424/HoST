 
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
var itemsRef = firebase.database().ref('rooms');

// Reference to the items container
var itemsContainer = document.getElementById('itemsContainer');
function displayItems(snapshot) {
  itemsContainer.innerHTML = ''; // Clear previous items

  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();

      if (item.status === "available") {
          var itemHtml = `
            <div style="display: display; justify-content: space-between; flex-direction: column; background-color: white; border-radius: 10px; padding: 10px;">
                <div class="mainImg" style="display: flex; flex-direction: column;">
                    <div style="margin-bottom: 5px;">
                        <img src="${item.imageUrl}">
                    </div>
                    <div >
                        <p style="margin: 2px; font-size: 10px;  color: grey;">Room #</p>
                        <p style="margin: 2px; font-size: 15px; font-weight: bold; color: #ef53a3;">ROOM${item.roomId}</p>
                        <p style="margin: 2px; font-size: 10px;  color: grey;">Price</p>
                        <p style="margin: 2px; font-size: 15px;  color: black;">₱${item.price}</p>
                         <p style="margin: 2px; font-size: 10px;  color: grey;">Room Type</p>
                        <p style="margin: 2px; color: black; font-size: 15px; text-transform: uppercase;">${item.roomType}</p>
                         <p style="margin: 2px; font-size: 10px;  color: grey;">Description</p>
                        <p style="margin: 2px; color: black; font-size:15px; min-height: 150px;">${item.description}</p>
                    </div>
                </div>
                <button onclick="openModal('${item.roomId}', '${item.roomType}', ${item.price}, '${item.description.replace(/'/g, "\\'")}')" style="background-color: #ef53a3; margin-top: 10px; border: none; padding: 5px 10px; width: 100%; cursor: pointer;">
                    Book Now
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

// Function to open the modal and display room details
function openModal(roomId, roomType, roomPrice, description) {
  document.getElementById('modalRoomId').textContent = roomId;
  document.getElementById('modalRoomType').textContent = roomType;
  document.getElementById('modalRoomPrice').textContent = roomPrice.toFixed(2);
  document.getElementById('modalRoomDescription').textContent = description;
   // Set the current date and time as check-in time
   const now = new Date();
   document.getElementById('checkinTime').textContent = now.toLocaleString(); // Format: MM/DD/YYYY, HH:MM:SS AM/PM
  document.getElementById('totalPrice').textContent = '0';
  document.getElementById('checkoutDateTime').value = '';
  document.getElementById('bookingModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
  document.getElementById('bookingModal').style.display = 'none';
}

function calculateTotal() {
  // Get the room price from the modal
  const roomPrice = parseFloat(document.getElementById('modalRoomPrice').textContent);

  // Get the current check-in time (assuming it's now)
  const checkinDateTime = new Date(); // Assuming check-in is now
  const checkoutDateTimeInput = document.getElementById('checkoutDateTime').value;

  // Check if the user has entered a checkout date
  if (!checkoutDateTimeInput) {
      document.getElementById('totalPrice').textContent = "0.00"; // Reset total price if no checkout date is set
      document.getElementById('durationOfStay').textContent = "0"; // Reset duration if no checkout date is set
      return;
  }

  const checkoutDateTime = new Date(checkoutDateTimeInput);

  // Validate the check-out date and time
  if (isNaN(checkoutDateTime.getTime())) {
      alert('Please select a valid check-out date and time.');
      return;
  }

  // Check if checkout time is in the past
  if (checkoutDateTime <= checkinDateTime) {
      alert('Check-out time must be later than the current time.');
      document.getElementById('totalPrice').textContent = "0.00"; // Reset total price if invalid
      document.getElementById('durationOfStay').textContent = "0"; // Reset duration if invalid
      return;
  }

  // Calculate the duration in hours
  const durationInHours = Math.abs(checkoutDateTime - checkinDateTime) / (1000 * 60 * 60);

  // Update the duration of stay in the modal
  document.getElementById('durationOfStay').textContent = Math.ceil(durationInHours); // Round up the hours

  // Calculate total price based on hours and room price
  const totalPrice = roomPrice * Math.ceil(durationInHours);

  // Update the total price in the modal
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2); // Display total price with 2 decimal places
}



function confirmBooking() {
  const roomId = document.getElementById('modalRoomId').textContent;
  const roomType = document.getElementById('modalRoomType').textContent;
  const roomPrice = parseFloat(document.getElementById('modalRoomPrice').textContent);
  const name = document.getElementById('nameInput').value.trim();
  const checkinTime = document.getElementById('checkinTime').textContent;
  const checkoutDateTime = document.getElementById('checkoutDateTime').value;
  const durationOfStay = parseFloat(document.getElementById('durationOfStay').textContent);
  const totalPrice = parseFloat(document.getElementById('totalPrice').textContent);
  
  // User UID
  const userUid = "nouser"; // Set to "nouser" as requested
  const status = "checkin";
  const cleaner = "none";
  // Validate required fields
  if (!roomId || !roomType || !roomPrice || !name || !checkinTime || !checkoutDateTime || !durationOfStay || !totalPrice) {
      Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please fill in all fields before confirming the booking.'
      });
      return; // Exit the function if validation fails
  }

  // Create booking data object
  const bookingData = {
      roomId: roomId,
      roomType: roomType,
      roomPrice: roomPrice,
      name: name,
      checkinTime: checkinTime,
      checkoutDateTime: checkoutDateTime,
      durationOfStay: durationOfStay,
      totalPrice: totalPrice,
      userUid: userUid,
      status: status,
      cleaner: cleaner
  };

  // Save booking to Firebase with a unique key
  const bookingsRef = firebase.database().ref('bookings'); // Adjust the reference path as needed
  const newBookingRef = bookingsRef.push(); // Create a new reference with a unique key
  bookingData.id = newBookingRef.key; // Add the unique ID to the booking data

  newBookingRef.set(bookingData)
      .then(() => {
          // Update the room status to 'unavailable'
          const roomRef = firebase.database().ref('rooms/' + roomId); // Reference to the specific room
          return roomRef.update({ status: 'unavailable' }); // Update room status
      })
      .then(() => {
          // Create notification data object
          const notificationData = {
              roomId: roomId,
              timestamp: firebase.database.ServerValue.TIMESTAMP, // Automatically generate timestamp
              id: bookingData.id, // The booking ID
              message: `Room ${roomId} has been booked by ${name}` // Custom message
          };

          // Save notification to Firebase
          const notificationsRef = firebase.database().ref('notifications'); // Adjust the reference path as needed
          return notificationsRef.push(notificationData); // Save notification
      })
      .then(() => {
          Swal.fire({
              icon: 'success',
              title: 'Booking Confirmed!',
              text: 'The room status has been occupied!'
          });
          closeModal(); // Close the modal after booking
      })
      .catch((error) => {
          console.error('Error saving booking or updating room:', error);
          Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to confirm booking. Please try again.'
          });
      });
}

// function confirmBooking() {
//   const roomId = document.getElementById('modalRoomId').textContent;
//   const roomType = document.getElementById('modalRoomType').textContent;
//   const roomPrice = parseFloat(document.getElementById('modalRoomPrice').textContent);
//   const name = document.getElementById('nameInput').value.trim();
//   const checkinTime = document.getElementById('checkinTime').textContent;
//   const checkoutDateTime = document.getElementById('checkoutDateTime').value;
//   const durationOfStay = parseFloat(document.getElementById('durationOfStay').textContent);
//   const totalPrice = parseFloat(document.getElementById('totalPrice').textContent);
  
//   // User UID
//   const userUid = "nouser"; // Set to "nouser" as requested

//   // Validate required fields
//   if (!roomId || !roomType || !roomPrice || !name || !checkinTime || !checkoutDateTime || !durationOfStay || !totalPrice) {
//       Swal.fire({
//           icon: 'error',
//           title: 'Oops...',
//           text: 'Please fill in all fields before confirming the booking.'
//       });
//       return; // Exit the function if validation fails
//   }

//   // Create booking data object
//   const bookingData = {
//       roomId: roomId,
//       roomType: roomType,
//       roomPrice: roomPrice,
//       name: name,
//       checkinTime: checkinTime,
//       checkoutDateTime: checkoutDateTime,
//       durationOfStay: durationOfStay,
//       totalPrice: totalPrice,
//       userUid: userUid
//   };

//   // Save booking to Firebase with a unique key
//   const bookingsRef = firebase.database().ref('bookings'); // Adjust the reference path as needed
//   const newBookingRef = bookingsRef.push(); // Create a new reference with a unique key
//   bookingData.id = newBookingRef.key; // Add the unique ID to the booking data

//   newBookingRef.set(bookingData)
//       .then(() => {
//           // Update the room status to 'unavailable'
//           const roomRef = firebase.database().ref('rooms/' + roomId); // Reference to the specific room
//           return roomRef.update({ status: 'unavailable' }); // Update room status
//       })
//       .then(() => {
//           Swal.fire({
//               icon: 'success',
//               title: 'Booking Confirmed!',
//               text: 'The room status has been occupied!'
//           });
//           closeModal(); // Close the modal after booking
//       })
//       .catch((error) => {
//           console.error('Error saving booking or updating room:', error);
//           Swal.fire({
//               icon: 'error',
//               title: 'Error!',
//               text: 'Failed to confirm booking. Please try again.'
//           });
//       });
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
