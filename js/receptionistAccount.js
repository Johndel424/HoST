 
var firebaseConfig = {
    apiKey: "AIzaSyC3rfHsxIKQYXnsi4m0UXLtRxyyc9KJaMI",
    authDomain: "host-9d733.firebaseapp.com",
    databaseURL: "https://host-9d733-default-rtdb.firebaseio.com",
    projectId: "host-9d733",
    storageBucket: "host-9d733.appspot.com",
    messagingSenderId: "1096872763965",
    appId: "1:1096872763965:web:21cd243ed87f2d649ac054"
  };
firebase.initializeApp(firebaseConfig);

var itemsRef = firebase.database().ref('users');

// Reference to the items container
var itemsContainer = document.getElementById('itemsContainer');


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

 // Initialize Firebase
 const auth = firebase.auth();
 const database = firebase.database();
 function previewImage(event) {
  const profilePreview = document.getElementById('profilePreview');
  const file = event.target.files[0];

  if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
          profilePreview.src = e.target.result; // Set the image preview
      };
      reader.readAsDataURL(file);
  }
}

document.getElementById('createAccountForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const userType = document.getElementById('userType').value;
  const password = 'password123'; // Default password
  const timestamp = Date.now();
  const profileImageFile = document.getElementById('profileImage').files[0];

 // Assuming you have the old account credentials stored
const oldEmail = 'admin@gmail.com'; // Old account email
const oldPassword = 'password123'; // Old account password

// Create user account in Firebase Authentication
auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const uid = userCredential.user.uid; // Get the uid here

        let profileImageUrl;

        // Check if a file was selected
        if (profileImageFile) {
            // Create a storage reference
            const storageRef = firebase.storage().ref();
            const profileImageRef = storageRef.child(`profileImages/${uid}.jpg`); // Use uid as unique filename

            // Upload the file to Firebase Storage
            return profileImageRef.put(profileImageFile).then(() => {
                // Get the download URL after upload
                return profileImageRef.getDownloadURL();
            }).then((url) => {
                profileImageUrl = url; // Set the URL
                return saveUserToDatabase(uid, name, email, userType, profileImageUrl, timestamp);
            });
        } else {
            // Upload the default profile image to Firebase Storage
            const defaultImageUrl = 'img/defaultProfile.png'; // Local default image path
            const storageRef = firebase.storage().ref();
            const defaultImageRef = storageRef.child(`profileImages/${uid}_default.jpg`); // Unique filename for the default image

            // Fetch the default image as a Blob
            return fetch(defaultImageUrl)
                .then(response => response.blob())
                .then(blob => {
                    // Upload the default image Blob to Firebase Storage
                    return defaultImageRef.put(blob);
                }).then(() => {
                    // Get the download URL after upload
                    return defaultImageRef.getDownloadURL();
                }).then((url) => {
                    profileImageUrl = url; // Set the URL
                    return saveUserToDatabase(uid, name, email, userType, profileImageUrl, timestamp);
                });
        }
    })
    .then(() => {
        document.getElementById('createAccountForm').reset();
        document.getElementById('profilePreview').src = 'img/defaultProfile.png'; // Reset the preview

        // Log out the newly created account
        return auth.signOut();
    })
    .then(() => {
        // Automatically log back into the old account
        return auth.signInWithEmailAndPassword(oldEmail, oldPassword);
    })
    .then(() => {
        window.location.href = 'receptionistAccount.html'; // Redirect to the home page of the old account
    })
    .catch((error) => {
        console.error('Error:', error.message);
        alert(`Error: ${error.message}`);
    });

});

function saveUserToDatabase(uid, name, email, userType, profileImageUrl, timestamp) {
  const newUser = {
      uid: uid,
      username: name,
      email: email,
      userType: userType,
      profileImageUrl: profileImageUrl,
      timestamp: timestamp,
      accountStatus: 'Activate', // New field added
      passwordChange: 'NotYet' // New field added
  };

  // Assuming you are using Firebase to save the user data
  firebase.database().ref('users/' + uid).set(newUser)
      .then(() => {
        accountContainer.style.display = 'none';
          // Show SweetAlert on successful save
          Swal.fire({
              icon: 'success',
              title: 'User Saved!',
              text: 'The user has been successfully saved to the database.',
              confirmButtonText: 'OK'
          });
      })
      .catch((error) => {
          // Handle errors here
          Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong: ' + error.message,
              confirmButtonText: 'Try Again'
          });
      });
}



function displayItems(snapshot) {
  itemsContainer.innerHTML = ''; // Clear previous items

  snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();

      if ((item.userType === "housekeeper" || item.userType === "user") && item.accountStatus === "Activate") {
          var itemHtml = `
          <div style="display: flex; justify-content: space-between; align-items: center; background-color: white; border-radius: 10px; padding: 10px;">
            <div class="mainImg" style="display: flex; align-items: center;">
                <div class="circle-pic" style="margin-right: 5px;">
                    <img src="${item.profileImageUrl}" alt="" style="width: 40px; height: 40px; border-radius: 50%;">
                </div>
                <div style="display: flex; flex-direction: column;">
                    <p style="margin: 0; color: black;">${item.username}</p>
                    <p style="margin: 0; color: black; font-size:12px;">${item.email}</p>
                    <p style="margin: 0; color: black; font-size:12px;">${item.userType}</p>
                </div>
            </div>
            <!-- Deactivate Image Button -->
            <button onclick="confirmDeactivateAccount('${item.uid}')" style="background-color: red; margin: 10px; border: none; padding: 3px; width: 60px; cursor: pointer;">
                  Delete
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

function confirmDeactivateAccount(uid) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Once deactivated, you will not be able to recover this account!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, deactivate it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deactivateAccount(uid);
        } else {
            Swal.fire('Account is safe!');
        }
    });
}

function deactivateAccount(uid) {
    // Update account status in Firebase Realtime Database
    database.ref('users/' + uid).update({
        accountStatus: 'deactivated'
    }).then(() => {
        console.log("Account status updated to deactivated for UID: " + uid);
        Swal.fire('Success!', 'Account status updated to deactivated!', 'success');
        // Optional: Add code to reflect this change in the UI or notify the user
    }).catch((error) => {
        console.error("Error updating account status: ", error);
        Swal.fire('Error!', 'There was an error updating the account status.', 'error');
    });
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


//make visible the account creation
document.getElementById('toggleButton').addEventListener('click', function() {
  const accountContainer = document.getElementById('accountContainer');
  if (accountContainer.style.display === 'none' || accountContainer.style.display === '') {
      accountContainer.style.display = 'block'; // Show the container
  } else {
      accountContainer.style.display = 'none'; // Hide the container
  }
});