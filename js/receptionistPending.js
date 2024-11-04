 
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

  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();

      if (item.cleaner === "none"&& item.status === "Pending") {
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
                  onclick="showHousekeepers('${item.id}')">
                  Choose a Housekeeper
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

function formatDateTime(timestamp) {
  const date = new Date(timestamp);

  // Format date as MM/DD/YYYY
  const formattedDate = date.toLocaleDateString();

  // Format time as HH:MM AM/PM
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  // Combine date and time
  return `${formattedDate} ${formattedTime}`; // Example: "11/01/2024 02:30 PM"
}

function showHousekeepers(roomId) {
  const housekeepersRef = firebase.database().ref('users'); 
  housekeepersRef.orderByChild('userType').equalTo('housekeeper').once('value')
  .then(snapshot => {
      let housekeepers = [];
      snapshot.forEach(childSnapshot => {
          const housekeeper = childSnapshot.val();
          housekeepers.push({
              id: childSnapshot.key,
              email: housekeeper.email 
          });
      });

      // Prepare the HTML for the list of housekeepers
      let housekeeperListHtml = housekeepers.map(housekeeper => 
          `<li style="padding: 5px; cursor: pointer;" onclick="selectHousekeeper('${housekeeper.email}', '${roomId}')">${housekeeper.email}</li>`
      ).join('');

      // Show SweetAlert2 modal with housekeepers
      Swal.fire({
          title: 'Choose a Housekeeper',
          html: `<ul style="list-style-type: none; padding: 0;">${housekeeperListHtml}</ul>`,
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: 'Cancel'
      });
  })
  .catch(error => {
      console.error('Error fetching housekeepers:', error);
      Swal.fire('Error!', 'Failed to load housekeepers.', 'error');
  });
}

function selectHousekeeper(housekeeperEmail, roomId) {
  console.log('Selected Housekeeper Email:', housekeeperEmail);

  Swal.fire({
      title: 'Confirm Selection',
      text: `You have selected the housekeeper with email: ${housekeeperEmail}. Do you want to proceed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel'
  }).then((result) => {
      if (result.isConfirmed) {
          const bookingRef = firebase.database().ref('bookings/' + roomId); // Adjust the path as necessary
          
          bookingRef.update({
              cleaner: housekeeperEmail, // Update housekeeper email in bookings
              status: 'Pending' // Change status to 'Pending' or any other logic you need
          })
          .then(() => {
              Swal.fire('Success!', 'The housekeeper has been updated successfully.', 'success');
          })
          .catch(error => {
              console.error('Error updating booking:', error);
              Swal.fire('Error!', 'Failed to update the booking.', 'error');
          });
      }
  });
}


document.querySelector('.changePassword').addEventListener('click', function () {
  Swal.fire({
      title: 'Change Password',
      html:
          '<input id="current-password" type="password" class="swal2-input" placeholder="Current Password">' +
          '<input id="new-password" type="password" class="swal2-input" placeholder="New Password">' +
          '<input id="confirm-password" type="password" class="swal2-input" placeholder="Confirm New Password">' +
          '<div style="display: flex; justify-content: space-between; margin-top: 10px;">' +
          '<label><input type="checkbox" id="show-current-password"> Show Current</label>' +
          '<label><input type="checkbox" id="show-new-password"> Show New</label>' +
          '<label><input type="checkbox" id="show-confirm-password"> Show Confirm</label>' +
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

  // Toggle show/hide password functionality for each password input
  document.getElementById('show-current-password').addEventListener('change', function() {
      const currentPasswordField = document.getElementById('current-password');
      currentPasswordField.type = this.checked ? 'text' : 'password';
  });
  document.getElementById('show-new-password').addEventListener('change', function() {
      const newPasswordField = document.getElementById('new-password');
      newPasswordField.type = this.checked ? 'text' : 'password';
  });
  document.getElementById('show-confirm-password').addEventListener('change', function() {
      const confirmPasswordField = document.getElementById('confirm-password');
      confirmPasswordField.type = this.checked ? 'text' : 'password';
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

sidebar.classList.toggle('hide');



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
