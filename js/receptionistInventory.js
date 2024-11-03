 
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

function fetchInventory() {
  const inventoryRef = database.ref('inventory');

  inventoryRef.on('value', (snapshot) => {
      const inventoryData = snapshot.val();
      const inventoryBody = document.getElementById('inventoryBody');
      inventoryBody.innerHTML = ''; // Clear the table body before adding new data

      if (inventoryData) {
          // Iterate through each item in the inventory
          for (const item in inventoryData) {
              const itemName = inventoryData[item].itemName;
              const quantity = inventoryData[item].quantity;

              // Create a new row for the table
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td style="border: 1px solid #ccc; padding: 10px;">${itemName}</td>
                  <td style="border: 1px solid #ccc; padding: 10px;">${quantity}</td>
              `;
              inventoryBody.appendChild(row); // Append the row to the table body
          }
      }
  });
}

// Call fetchInventory after Firebase initialization
fetchInventory();


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
