 
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
                <!-- Update Button -->
                <button onclick="openUpdateModal('${item.roomId}', '${item.roomType}', ${item.price}, '${item.description.replace(/'/g, "\\'")}')" style="background-color: #4caf50; margin-top: 10px; border: none; padding: 5px 10px; width: 100%; cursor: pointer;">
                    Update
                </button>

                <!-- Delete Button -->
                <button onclick="confirmDelete('${item.roomId}')" style="background-color: #f44336; margin-top: 10px; border: none; padding: 5px 10px; width: 100%; cursor: pointer;">
                    Delete
                </button>


            </div>

          `;
          itemsContainer.innerHTML += itemHtml;
  });
}
itemsRef.on('value', function(snapshot) {
  displayItems(snapshot);
});


// function confirmDelete(roomId) {
//   const userConfirmed = confirm("Are you sure you want to delete this item?");
//   if (userConfirmed) {
//       deleteRoom(roomId);
//   }
// }

// function deleteRoom(roomId) {
//   database.ref('rooms/' + roomId).remove()
//   .then(() => {
//       alert('Room deleted successfully.');
//       // Optionally, refresh the list or update the UI
//   })
//   .catch((error) => {
//       console.error('Error deleting room:', error);
//       alert('An error occurred while deleting the room.');
//   });
// }
function confirmDelete(roomId) {
  Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
      if (result.isConfirmed) {
          deleteRoom(roomId);
      }
  });
}

function deleteRoom(roomId) {
  database.ref('rooms/' + roomId).remove()
      .then(() => {
          Swal.fire(
              'Deleted!',
              'Room deleted successfully.',
              'success'
          );
          // Optionally, refresh the list or update the UI
      })
      .catch((error) => {
          console.error('Error deleting room:', error);
          Swal.fire(
              'Error!',
              'An error occurred while deleting the room.',
              'error'
          );
      });
}

function openUpdateModal(roomId, roomType, price, description) {
  // Get the modal element
  const modal = document.getElementById('updateModal');
  
  // Populate modal fields
  document.getElementById('modalRoomId').value = roomId;
  document.getElementById('modalRoomType').value = roomType;
  document.getElementById('modalPrice').value = price;
  document.getElementById('modalDescription').value = description;

  // Display the modal
  modal.style.display = 'block';
}

// Function to update the room in Firebase
function updateRoom() {
  const roomId = document.getElementById('modalRoomId').value;
  const roomType = document.getElementById('modalRoomType').value;
  const price = parseFloat(document.getElementById('modalPrice').value);
  const description = document.getElementById('modalDescription').value;

  const roomRef = firebase.database().ref('rooms/' + roomId);

  // Update the room details in Firebase
  roomRef.update({
      roomType: roomType,
      price: price,
      description: description
  })
  .then(() => {
      // Show success message using SweetAlert
      swal("Room updated successfully!", {
          icon: "success",
      });
      // Close the modal after successful update
      closeModal();
  })
  .catch((error) => {
      console.error('Error updating room: ', error);
      // Show error message using SweetAlert
      swal("An error occurred while updating the room.", {
          icon: "error",
      });
  });
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('updateModal');
  modal.style.display = 'none';
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
