 
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

//display items
var itemsRef = firebase.database().ref('chatrooms');

// Reference to the items container
var itemsContainer = document.getElementById('itemsContainer');
function displayItems(snapshot) {
itemsContainer.innerHTML = ''; // Clear previous items

snapshot.forEach(function(childSnapshot) {
    var item = childSnapshot.val();

    function formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
          month: "short", // Short month name (e.g., Jan, Feb)
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
      });
  }
  
  if (item.lastMessage !== "none") {
      var readableTimestamp = formatTimestamp(item.timestamp); // Format the timestamp
  
      var itemHtml = `
      <a href="receptionistMessage.html?chatRoomId=${encodeURIComponent(item.chatRoomid)}" style="text-decoration: none;">
        <div style="display: flex; justify-content: space-between; flex-direction: column; background-color: white; border-radius: 10px; padding: 10px;">
            <div class="mainImg" style="display: flex; flex-direction: column;">
                <div class="left" style="display: flex; align-items: center;">
                  <div class="circle-pic" style="margin-right: 10px;">
                      <img src="${item.currentUserImg}" alt="" style="width: 40px; height: 40px; border-radius: 50%;">
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: start;">
                      <p style="margin: 0; color: black;">${item.currentUserUsername}</p>
                      <p style="margin: 0; color: black; font-size: 10px;">${item.lastMessage}</p>
                  </div>
                </div>  
                <div style="display: flex; font-size: 10px; align-items: center; justify-content: flex-end; margin-top: 5px;">
                    <p style="margin: 0; color: black;">${readableTimestamp}</p> <!-- Centered timestamp -->
                </div>
            </div>
        </div>
      </a>

      `;
      itemsContainer.innerHTML += itemHtml;
  }
  
  
});
}
itemsRef.on('value', function(snapshot) {
displayItems(snapshot);
});
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
