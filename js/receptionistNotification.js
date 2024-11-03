 
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

//display items
var itemsRef = firebase.database().ref('notifications');

// Reference to the items container
var itemsContainer = document.getElementById('itemsContainer');

function displayItems(snapshot) {
    itemsContainer.innerHTML = ''; // Clear previous items
  
    // Convert snapshot to an array and sort by timestamp in descending order
    var itemsArray = [];
    snapshot.forEach(function(childSnapshot) {
        itemsArray.push(childSnapshot.val());
    });
  
    itemsArray.sort(function(a, b) {
        return (b.timestamp || 0) - (a.timestamp || 0); // Sort by timestamp (newest first)
    });
  
    // Render items in sorted order
    itemsArray.forEach(function(item) {
        // Ensure that item.description exists and is a string
        var formattedTimestamp = item.timestamp ? formatTimestamp(item.timestamp) : '';
        var itemHtml = `
            <div style="display: flex; justify-content: space-between; flex-direction: column; background-color: white; border-radius: 10px; padding: 10px;">
                <p style="margin: 2px; color: black; font-size:15px;">${item.message}</p>
                <p style="margin: 2px; color: black; font-size:15px;">${formattedTimestamp}</p>
            </div>
        `;
  
        itemsContainer.innerHTML += itemHtml;
    });
  }
  

// Listen for value changes in Firebase
itemsRef.on('value', function(snapshot) {
  displayItems(snapshot);
});

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    
    // Options for a readable date with AM/PM
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true // This will display the time in AM/PM format
    };
  
    return date.toLocaleString('en-US', options); // Adjust locale as needed
  }



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
