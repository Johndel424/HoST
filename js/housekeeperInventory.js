 
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


// Add event listener for form submission
// document.getElementById('createAccountForm').addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent form from submitting the default way

//     const item = document.getElementById('itemType').value;
//     const quantity = parseInt(document.getElementById('quantity').value);

//     // Reference to the item in the inventory
//     const itemRef = database.ref('inventory/' + item);

//     // Check if the item exists in the database
//     itemRef.once('value').then(snapshot => {
//         if (snapshot.exists()) {
//             // Item exists, update the quantity
//             const currentData = snapshot.val();
//             const currentQuantity = currentData.quantity || 0;
//             itemRef.update({ quantity: currentQuantity + quantity });
//         } else {
//             // Item does not exist, create a new entry with item name and quantity
//             itemRef.set({
//                 itemName: item, // Store the item name
//                 quantity: quantity
//             });
//         }
//     }).then(() => {
//         Swal.fire({
            
//             icon: 'success',
//             title: 'Stock added successfully!',
//             showConfirmButton: false,
//             timer: 1500
//         });
//         accountContainer.style.display = 'none';
//         document.getElementById('createAccountForm').reset(); // Reset the form
//     }).catch(error => {
//         console.error("Error adding stock: ", error);
//         Swal.fire({
//             icon: 'error',
//             title: 'Error adding stock',
//             text: error.message
//         });
//     });
// });
document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting the default way

    const item = document.getElementById('itemType').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Reference to the item in the inventory
    const itemRef = database.ref('inventory/' + item);
    const notificationsRef = database.ref('notifications'); // Reference for notifications

    // Check if the item exists in the database
    itemRef.once('value').then(snapshot => {
        let previousQuantity = 0; // Initialize previous quantity

        if (snapshot.exists()) {
            // Item exists, get the current quantity
            const currentData = snapshot.val();
            previousQuantity = currentData.quantity || 0;
            // Update the quantity
            itemRef.update({ quantity: previousQuantity + quantity });
        } else {
            // Item does not exist, create a new entry with item name and quantity
            itemRef.set({
                itemName: item, // Store the item name
                quantity: quantity
            });
            previousQuantity = 0; // If it's a new item, previous quantity is 0
        }

        // Prepare notification message
        const newQuantity = previousQuantity + quantity; // Calculate new quantity
        const message = `Item: ${item} added. Quantity added: ${quantity}. Previous stock: ${previousQuantity}. New stock: ${newQuantity}.`;

        // Write to notifications table
        return notificationsRef.push({
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Stock added successfully!',
            showConfirmButton: false,
            timer: 1500
        });
        accountContainer.style.display = 'none';
        document.getElementById('createAccountForm').reset(); // Reset the form
    }).catch(error => {
        console.error("Error adding stock: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error adding stock',
            text: error.message
        });
    });
});


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
