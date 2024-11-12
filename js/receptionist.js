 
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
// async function handleSubmit(event) {
//   event.preventDefault(); // Prevent default form submission

//   const roomId = document.getElementById('room').value; // Use this as UID
//   const roomType = document.getElementById('roomType').value;
//   const price = document.getElementById('price').value;
//   const description = document.getElementById('description').value;
//   const fileInput = document.getElementById('profileImage');
//   const file = fileInput.files[0]; // Get the file

//   // Check if an image file is selected
//   if (!file) {
//     Swal.fire("Error", "You need to input an image.", "error");
//     return; // Exit the function if no file is selected
//   }

//   // Check if roomId already exists
//   const roomRef = database.ref('rooms/' + roomId);
//   const snapshot = await roomRef.once('value');
//   if (snapshot.exists()) {
//     Swal.fire("Error", "Room ID already exists. Please choose a different ID.", "error");
//     return;
//   }

//   // Upload image to Firebase Storage
//   const storageRef = storage.ref('images/' + roomId + '/' + file.name);
//   const uploadTask = storageRef.put(file);

//   uploadTask.on('state_changed', 
//     (snapshot) => {
//       // You can add progress indication here if needed
//     }, 
//     (error) => {
//       console.error('Upload failed:', error);
//       Swal.fire("Upload Failed", "There was an error uploading the image. Please try again.", "error");
//     }, 
//     async () => {
//       // Get the download URL
//       const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

//       // Save data to Realtime Database
//       const roomData = {
//         roomId,
//         roomType,
//         price,
//         description,
//         imageUrl: downloadURL,
//         status: "available" // Add default status as "available"
//       };

//       roomRef.set(roomData)
//         .then(() => {
//           accountContainer.style.display = 'none';
//           Swal.fire("Success", "Room created successfully!", "success");
//           document.getElementById('createAccountForm').reset(); // Reset form after submission
//         })
//         .catch((error) => {
//           console.error('Error saving data:', error);
//           Swal.fire("Error", "There was an error saving the room data. Please try again.", "error");
//         });
//     }
//   );
// }


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
        // Check if there is a promo percentage and calculate total price
        let displayPrice = item.price;
        let promoMessage = ""; // Initialize promo message
    
        if (item.promoPercentage && item.promoPercentage > 0) {
            const discountAmount = (item.price * item.promoPercentage) / 100;
            displayPrice = item.price - discountAmount; // Apply promo discount to price
            promoMessage = `<p style="color: green; font-size: 12px;">Promo: ${item.promoPercentage}% OFF!</p>`; // Promo message
        } else {
            promoMessage = `<p style="color: grey; font-size: 12px;">No promo available</p>`; // No promo message
        }
    
        var itemHtml = `
            <div style="display: display; justify-content: space-between; flex-direction: column; background-color: white; border-radius: 10px; padding: 10px;">
                <div class="mainImg" style="display: flex; flex-direction: column;">
                    <div style="margin-bottom: 5px;">
                        <img src="${item.imageUrl}">
                    </div>
                    <div>
                        <p style="margin: 2px; font-size: 10px; color: grey;">Room #</p>
                        <p style="margin: 2px; font-size: 15px; font-weight: bold; color: #ef53a3;">ROOM${item.roomId}</p>
                        <p style="margin: 2px; font-size: 10px; color: grey;">Price</p>
                        <p style="margin: 2px; font-size: 15px; color: black;">₱${displayPrice.toFixed(2)}</p> <!-- Show discounted price -->
                        ${promoMessage} <!-- Promo message added here -->
                        <p style="margin: 2px; font-size: 10px; color: grey;">Room Type</p>
                        <p style="margin: 2px; color: black; font-size: 15px; text-transform: uppercase;">${item.roomType}</p>
                        <p style="margin: 2px; font-size: 10px; color: grey;">Description</p>
                        <p style="margin: 2px; color: black; font-size: 15px; min-height: 150px;">${item.description}</p>
                    </div>
                </div>
                <button onclick="openModal('${item.roomId}', '${item.roomType}', ${item.totalPrice}, '${item.description.replace(/'/g, "\\'")}')" style="background-color: #ef53a3; margin-top: 10px; border: none; padding: 5px 10px; width: 100%; cursor: pointer;">
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

// // Function to open the modal and display room details
// function openModal(roomId, roomType, roomPrice, description) {
//   document.getElementById('modalRoomId').textContent = roomId;
//   document.getElementById('modalRoomType').textContent = roomType;
//   document.getElementById('modalRoomPrice').textContent = roomPrice.toFixed(2);
//   document.getElementById('modalRoomDescription').textContent = description;
//    // Set the current date and time as check-in time
//    const now = new Date();
//    document.getElementById('checkinTime').textContent = now.toLocaleString(); // Format: MM/DD/YYYY, HH:MM:SS AM/PM
//   document.getElementById('totalPrice').textContent = '0';
//   document.getElementById('checkoutDateTime').value = '';
//   document.getElementById('bookingModal').style.display = 'block';
// }
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
  
  // Show the modal
  document.getElementById('bookingModal').style.display = 'block';

  // Add an event listener to the checkout date input
  const checkoutInput = document.getElementById('checkoutDateTime');
  checkoutInput.addEventListener('input', function() {
    validateCheckoutDateTime(now, checkoutInput);
  });
}

// Function to validate checkout date and time
function validateCheckoutDateTime(currentDate, checkoutInput) {
  const selectedDate = new Date(checkoutInput.value);
  
  // Check if the selected date and time is in the past
  if (selectedDate < currentDate) {
    // Disable input and change its color to gray if date is in the past
    checkoutInput.disabled = true;
    checkoutInput.style.color = 'gray';
    checkoutInput.style.backgroundColor = '#e0e0e0';
    checkoutInput.title = "Selected date and time are in the past. Please choose a future date and time.";
  } else {
    // Enable input if date is in the future and reset styling
    checkoutInput.disabled = false;
    checkoutInput.style.color = '';
    checkoutInput.style.backgroundColor = '';
    checkoutInput.title = '';
  }
}

// Function to close the modal
function closeModal() {
  document.getElementById('bookingModal').style.display = 'none';
}

// function calculateTotal() {
//   // Get the room price from the modal
//   const roomPrice = parseFloat(document.getElementById('modalRoomPrice').textContent);

//   // Get the current check-in time (assuming it's now)
//   const checkinDateTime = new Date(); // Assuming check-in is now
//   const checkoutDateTimeInput = document.getElementById('checkoutDateTime').value;

//   // Check if the user has entered a checkout date
//   if (!checkoutDateTimeInput) {
//       document.getElementById('totalPrice').textContent = "0.00"; // Reset total price if no checkout date is set
//       document.getElementById('durationOfStay').textContent = "0"; // Reset duration if no checkout date is set
//       return;
//   }

//   const checkoutDateTime = new Date(checkoutDateTimeInput);

//   // Validate the check-out date and time
//   if (isNaN(checkoutDateTime.getTime())) {
//       alert('Please select a valid check-out date and time.');
//       return;
//   }

//   // Check if checkout time is in the past
//   if (checkoutDateTime <= checkinDateTime) {
//       alert('Check-out time must be later than the current time.');
//       document.getElementById('totalPrice').textContent = "0.00"; // Reset total price if invalid
//       document.getElementById('durationOfStay').textContent = "0"; // Reset duration if invalid
//       return;
//   }

//   // Calculate the duration in hours
//   const durationInHours = Math.abs(checkoutDateTime - checkinDateTime) / (1000 * 60 * 60);

//   // Update the duration of stay in the modal
//   document.getElementById('durationOfStay').textContent = Math.ceil(durationInHours); // Round up the hours

//   // Calculate total price based on hours and room price
//   const totalPrice = roomPrice * Math.ceil(durationInHours);

//   // Update the total price in the modal
//   document.getElementById('totalPrice').textContent = totalPrice.toFixed(2); // Display total price with 2 decimal places
// }
function setMinCheckoutDate() {
  // Set the minimum date and time to the current date and time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // Format for min attribute
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  document.getElementById('checkoutDateTime').setAttribute('min', minDateTime);
}

function validateCheckoutDateTime() {
  const checkinDateTime = new Date(); // Assume check-in is now
  const checkoutDateTimeInput = document.getElementById('checkoutDateTime').value;
  
  // Check if the checkout date is selected and valid
  if (checkoutDateTimeInput) {
      const checkoutDateTime = new Date(checkoutDateTimeInput);
      const durationInHours = (checkoutDateTime - checkinDateTime) / (1000 * 60 * 60);

      if (checkoutDateTime < checkinDateTime) {
          alert("Check-out time must be later than the current time.");
          document.getElementById('checkoutDateTime').value = ""; // Clear invalid date
      } else if (durationInHours < 1) {
          alert("Minimum stay duration is 1 hour.");
          document.getElementById('checkoutDateTime').value = ""; // Clear invalid date
      } else {
          calculateTotal(); // Proceed to calculate total if date is valid
      }
  }
}

function calculateTotal() {
  const roomPrice = parseFloat(document.getElementById('modalRoomPrice').textContent);
  const checkinDateTime = new Date();
  const checkoutDateTimeInput = document.getElementById('checkoutDateTime').value;

  if (!checkoutDateTimeInput) {
      document.getElementById('totalPrice').textContent = "0.00";
      document.getElementById('durationOfStay').textContent = "0";
      return;
  }

  const checkoutDateTime = new Date(checkoutDateTimeInput);
  if (isNaN(checkoutDateTime.getTime()) || checkoutDateTime <= checkinDateTime) {
      alert('Please select a valid check-out date and time.');
      document.getElementById('totalPrice').textContent = "0.00";
      document.getElementById('durationOfStay').textContent = "0";
      return;
  }

  const durationInHours = Math.ceil((checkoutDateTime - checkinDateTime) / (1000 * 60 * 60));

  // Check for minimum stay duration of 1 hour
  if (durationInHours < 1) {
      alert("Minimum stay duration is 1 hour.");
      document.getElementById('totalPrice').textContent = "0.00";
      document.getElementById('durationOfStay').textContent = "0";
      return;
  }

  document.getElementById('durationOfStay').textContent = durationInHours;
  const totalPrice = roomPrice * durationInHours;
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}

// Set the min attribute for checkout datetime on page load
window.onload = setMinCheckoutDate;


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

document.querySelector('.changePassword').addEventListener('click', function () {
  Swal.fire({
      title: 'Change Password',
      html:
          '<input id="current-password" type="password" class="swal2-input" placeholder="Current Password" style="height: 30px; font-size: 14px;">' +
          '<input id="new-password" type="password" class="swal2-input" placeholder="New Password" style="height: 30px; font-size: 14px;">' +
          '<input id="confirm-password" type="password" class="swal2-input" placeholder="Confirm New Password" style="height: 30px; font-size: 14px;">' +
          '<div style="display: flex; justify-content: space-between; margin-top: 10px;">' +
          '<label><input type="checkbox" id="show-passwords"> Show All Passwords</label>' +
          '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Change Password',
      preConfirm: () => {
          const currentPassword = document.getElementById('current-password').value;
          const newPassword = document.getElementById('new-password').value;
          const confirmPassword = document.getElementById('confirm-password').value;

          if (!currentPassword || !newPassword || !confirmPassword) {
              Swal.showValidationMessage('Please enter all password fields');
              return false;
          }
          if (newPassword !== confirmPassword) {
              Swal.showValidationMessage('New passwords do not match');
              return false;
          }
          return { currentPassword, newPassword };
      },
      willOpen: () => {
          // Prevent scrolling and set max height to control the modal size
          const swalContent = document.querySelector('.swal2-html-container');
          swalContent.style.overflowY = 'hidden';
          swalContent.style.maxHeight = '400px'; // Set a maximum height for the modal content
      }
  }).then((result) => {
      if (result.isConfirmed) {
          const { currentPassword, newPassword } = result.value;
          
          // Re-authenticate user with current password and then update password
          const user = firebase.auth().currentUser;
          const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);

          user.reauthenticateWithCredential(credential).then(() => {
              return user.updatePassword(newPassword);
          }).then(() => {
              Swal.fire('Password Changed', 'Your password has been updated successfully.', 'success');
          }).catch((error) => {
              Swal.fire('Error', error.message, 'error');
          });
      }
  });

  // Toggle show/hide password functionality for all password fields
  document.getElementById('show-passwords').addEventListener('change', function() {
      const passwordFields = ['current-password', 'new-password', 'confirm-password'];
      passwordFields.forEach(fieldId => {
          const passwordField = document.getElementById(fieldId);
          passwordField.type = this.checked ? 'text' : 'password';
      });
  });
});


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
