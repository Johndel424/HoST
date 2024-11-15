 
const firebaseConfig = {
    apiKey: "AIzaSyC3rfHsxIKQYXnsi4m0UXLtRxyyc9KJaMI",
    authDomain: "host-9d733.firebaseapp.com",
    databaseURL: "https://host-9d733-default-rtdb.firebaseio.com",
    projectId: "host-9d733",
    storageBucket: "host-9d733.appspot.com",
    messagingSenderId: "1096872763965",
    appId: "1:1096872763965:web:21cd243ed87f2d649ac054"
  };
  firebase.initializeApp(firebaseConfig);
    
// Get the item ID from the URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('itemId');

// Reference to the Firebase database
const database = firebase.database();

// Add event listener to the publish button
document.getElementById('publishButton').addEventListener('click', function() {
    // Get the UID of the current user
    const currentUserUid = firebase.auth().currentUser.uid;

    // Get the other UID from the item
    const otherUid = "zmd0K02Z3wY6oRlQ8k0zFRmsmep1";

    // Determine the chat room ID
    let chatRoomId;
    if (currentUserUid.localeCompare(otherUid) > 0) {
        chatRoomId = currentUserUid + "_" + otherUid;
    } else {
        chatRoomId = otherUid + "_" + currentUserUid;
    }

    // Check if chat room already exists
    database.ref('chatrooms/' + chatRoomId).once('value')
    .then((snapshot) => {
        if (snapshot.exists()) {
            // Chat room already exists, start the conversation directly
            const intent = `message.html?chatRoomId=${encodeURIComponent(chatRoomId)}`;
            window.location.href = intent;
        } else {
            // Fetch details of the other user
            return database.ref('users/' + otherUid).once('value')
            .then((otherUserSnapshot) => {
                if (otherUserSnapshot.exists()) {
                    const otherUserData = otherUserSnapshot.val();
                    const otherUserImg = otherUserData.profileImageUrl;
                    const otherUsername = otherUserData.username;

                    // Fetch details of the current user
                    return database.ref('users/' + currentUserUid).once('value')
                    .then((currentUserSnapshot) => {
                        if (currentUserSnapshot.exists()) {
                            const currentUserData = currentUserSnapshot.val();
                            const currentUserImg = currentUserData.profileImageUrl;
                            const currentUsername = currentUserData.username;

                            // Save the chat room data to the database under 'chatrooms'
                            return database.ref('chatrooms/' + chatRoomId).set({
                                chatRoomId: true,
                                userId: currentUserUid,
                                otherId: otherUid,
                                currentUserImg: currentUserImg,
                                currentUserUsername: currentUsername,
                                otherUserImg: otherUserImg,
                                otherUsername: otherUsername,
                                chatRoomid: chatRoomId,
                                lastMessage: "none", // Add the lastMessage field with "none" as the value
                                timestamp: firebase.database.ServerValue.TIMESTAMP
                            });
                        } else {
                            console.error("Current user snapshot does not exist.");
                            throw new Error("Current user data not found.");
                        }
                    });
                } else {
                    console.error("Other user snapshot does not exist.");
                    throw new Error("Other user data not found.");
                }
            })
            .then(() => {
                // If the chat room data is saved successfully, start the conversation
                const intent = `message.html?chatRoomId=${encodeURIComponent(chatRoomId)}`;
                window.location.href = intent;
            });
        }
    })
    .catch(error => {
        console.error("Error in setting chat room or fetching data:", error);
    });
});

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
   //display items
   var itemsRef2 = firebase.database().ref('rooms');
  
   // Reference to the items container
   var itemsContainer2 = document.getElementById('itemsContainer2');
   function displayItems2(snapshot) {
     itemsContainer2.innerHTML = ''; // Clear previous items
   
     let promoFound = false; // Flag to track if any promo items are found

snapshot.forEach(function(childSnapshot) {
    var item = childSnapshot.val();

    if (item.status === "available" && item.promoPercentage != null && item.promoPercentage !== 0) {
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
            <div onclick="openModal('${item.roomId}', '${item.roomType}', ${item.totalPrice}, '${item.description.replace(/'/g, "\\'")}')" style="display: flex; justify-content: space-between; flex-direction: column; background-color: white; border-radius: 10px; padding: 10px; cursor: pointer;">
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
            </div>
        `;
        itemsContainer2.innerHTML += itemHtml;
        promoFound = true; // Set flag to true when a promo item is found
    }
});

// If no promo items were found, display the "No deals so far" message with inline styling
if (!promoFound) {
    itemsContainer2.innerHTML = "<p style='font-size: 20px; font-weight: bold; text-align: center; color: #ef53a3; padding: 20px; background-color: #f5f5f5; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-top: 20px; width: 100%; display: flex; justify-content: center; align-items: center; height: 100px;'>No deals so far</p>";
}

   }
   itemsRef2.on('value', function(snapshot) {
     displayItems2(snapshot);
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
    // Get the current date and time in the correct format for datetime-local input
    function setMinDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        // Set min attribute in the format "YYYY-MM-DDTHH:MM"
        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        document.getElementById("checkoutDateTime").min = minDateTime;
    }

    // Call the function on page load
    setMinDateTime();
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
    const checkinTime = document.getElementById('checkinTime').textContent;
    const checkoutDateTime = document.getElementById('checkoutDateTime').value;
    const durationOfStay = parseFloat(document.getElementById('durationOfStay').textContent);
    const totalPrice = parseFloat(document.getElementById('totalPrice').textContent);
    const status = "checkin";
    const cleaner = "none";

    // Validate required fields
    if (!roomId || !roomType || !roomPrice || !checkinTime || !checkoutDateTime || !durationOfStay || !totalPrice) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in all fields before confirming the booking.'
        });
        return; // Exit the function if validation fails
    }

    // Get the currently logged-in user's UID
    const user = firebase.auth().currentUser;
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'No user is logged in.'
        });
        return;
    }
    const userUid = user.uid;

    // Retrieve the user's name from the users node in Firebase
    const userRef = firebase.database().ref('users/' + userUid);
    userRef.once('value')
        .then(snapshot => {
            const name = snapshot.val().username; // Assuming 'username' is the field for the user's name

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

            return newBookingRef.set(bookingData)
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
                });
        })
        .catch(error => {
            console.error('Error retrieving user name or saving booking:', error);
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
