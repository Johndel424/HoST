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

function registerUser(email, password, username, profileImg) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            Swal.fire({
                title: "Creating account",
                text: "Successful",
                icon: "success",
                showConfirmButton: true,
                confirmButtonText: "OK"
            }).then((result) => {
                if (result.isConfirmed) {
                    // Optional: Redirect to home.html after successful registration
                    // window.location.href = "home.html";
                }
            });

            var userId = userCredential.user.uid;
            var usersRef = firebase.database().ref("users");

            // Reference to Firebase Storage
            var storageRef = firebase.storage().ref();

            // Function to save user data to Firebase Realtime Database
            function saveUserData(profileImageUrl) {
                usersRef.child(userId).set({
                    uid: userId,
                    email: email,
                    accountStatus: 'Activate', // Default to 'Activate' if not provided
                    passwordChange: 'NotYet', // Default to 'NotYet' if not provided
                    username: username,
                    profileImageUrl: profileImageUrl,
                    userType: "user", // Default user type
                    timestamp: firebase.database.ServerValue.TIMESTAMP // Add server timestamp
                })
                .then(() => {
                    console.log("User details saved successfully to database");
                    window.location.href = "home.html"; // Redirect to home.html
                })
                .catch((error) => {
                    console.error("Error saving user details to database:", error);
                    alert("Error saving user details to database");
                });
            }

            // Check if there is a profile image uploaded
            if (profileImg) {
                // Upload the user's profile image
                var imgRef = storageRef.child('profileImages/' + userId + '.jpg');
                imgRef.put(profileImg).then((snapshot) => {
                    imgRef.getDownloadURL().then((downloadURL) => {
                        saveUserData(downloadURL);
                    });
                }).catch((error) => {
                    console.error("Error uploading profile image:", error);
                    alert("Error uploading profile image");
                });
            } else {
                // Upload the default profile image
                var defaultImgRef = storageRef.child('profileImages/' + userId + '_default.jpg');
                fetch('img/defaultProfile.png')
                    .then(response => response.blob())
                    .then(blob => {
                        defaultImgRef.put(blob).then((snapshot) => {
                            defaultImgRef.getDownloadURL().then((downloadURL) => {
                                saveUserData(downloadURL); // Use default image URL
                            });
                        });
                    })
                    .catch((error) => {
                        console.error("Error fetching default profile image:", error);
                    });
            }
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error("Error creating user:", errorMessage);
            alert(errorMessage);
        });
}

function saveUserData(usersRef, userId, email, accountStatus, passwordChange, username, profileImageUrl, userType = 'user') {
    // Prepare the user data object
    const userData = {
        uid: userId,
        email: email,
        accountStatus: accountStatus , // Default to 'Activate' if not provided
        passwordChange: passwordChange , // Default to 'NotYet' if not provided
        username: username,
        profileImageUrl: profileImageUrl,
        userType: userType, // Default value for userType is 'user'
        timestamp: firebase.database.ServerValue.TIMESTAMP // Add server timestamp
    };

    // Save the user data to the database
    usersRef.child(userId).set(userData)
        .then(() => {
            console.log("User details saved successfully to database");
            window.location.href = "home.html"; // Redirect to home.html after saving user details
        })
        .catch((error) => {
            console.error("Error saving user details to database:", error);
            alert("Error saving user details to database");
        });
}


document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var username = document.getElementById("username").value;
    var profileImg = null; 
    registerUser(email, password, username, profileImg);
}); 



document.getElementById('loginBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    history.back(); // Go back to the previous page
});
