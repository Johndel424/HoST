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
  
// function loginUser(event) {
//   event.preventDefault();
//   var email = document.getElementById('loginEmail').value;
//   var password = document.getElementById('loginPassword').value;

//   // Show the loading spinner
//   document.getElementById("loadingSpinner").style.display = "flex";

//   firebase.auth().signInWithEmailAndPassword(email, password)
//     .then((userCredential) => {
//       var user = userCredential.user;
//       console.log("Login successful:", user);

//       var usersRef = firebase.database().ref("users").child(user.uid);

//       usersRef.once('value')
//         .then((snapshot) => {
//           document.getElementById("loadingSpinner").style.display = "none"; // Hide spinner

//           if (snapshot.exists()) {
//               var userData = snapshot.val();
//               var userType = userData.userType;
//               var accountStatus = userData.accountStatus; // Get the account status

//               if (accountStatus === 'deactivated') {
//                   // Account is deactivated, show an alert and log out the user
//                   Swal.fire({
//                       title: "Account Deactivated",
//                       text: "Your account has been deactivated. Please contact support.",
//                       icon: "error",
//                       showConfirmButton: true
//                   }).then(() => {
//                       firebase.auth().signOut(); // Sign out the user
//                       window.location.href = "index.html"; // Redirect to login page
//                   });
//               } else {
//                   // Proceed with normal login process if account is not deactivated
//                   Swal.fire({
//                       title: "Login Successful",
//                       text: "Click OK to continue...",
//                       icon: "success",
//                       showConfirmButton: true,
//                       allowOutsideClick: false
//                   }).then((result) => {
//                       if (result.isConfirmed) {
//                           if (userType === 'housekeeper') {
//                               window.location.href = "housekeeper.html";
//                           } else if (userType === 'receptionist') {
//                               window.location.href = "receptionist.html";
//                           } else {
//                               window.location.href = "home.html";
//                           }
//                       }
//                   });
//               }
//           } else {
//               console.error("User data not found in the database.");
//               alert("User data not found. Please try again.");
//           }
//         })
//         .catch((error) => {
//           document.getElementById("loadingSpinner").style.display = "none"; // Hide spinner
//           console.error("Error fetching user data:", error);
//           alert("Error fetching user data. Please try again.");
//         });
//     })
//     .catch((error) => {
//       document.getElementById("loadingSpinner").style.display = "none"; // Hide spinner
//       console.error("Login error:", error.message);
//       alert("Login failed: " + error.message);
//     });
// }
function loginUser(event) {
  event.preventDefault();
  var email = document.getElementById('loginEmail').value;
  var password = document.getElementById('loginPassword').value;

  // Show the loading spinner
  document.getElementById("loadingSpinner").style.display = "flex";

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      var user = userCredential.user;
      console.log("Login successful:", user);

      var usersRef = firebase.database().ref("users").child(user.uid);

      usersRef.once('value')
        .then((snapshot) => {
          document.getElementById("loadingSpinner").style.display = "none"; // Hide spinner

          if (snapshot.exists()) {
            var userData = snapshot.val();
            var userType = userData.userType;
            var accountStatus = userData.accountStatus; // Get the account status

            if (accountStatus === 'deactivated') {
              // Account is deactivated, show an alert and log out the user
              Swal.fire({
                title: "Account Deactivated",
                text: "Your account has been deactivated. Please contact support.",
                icon: "error",
                showConfirmButton: true
              }).then(() => {
                firebase.auth().signOut(); // Sign out the user
                window.location.href = "index.html"; // Redirect to login page
              });
            } else {
              // Check if userType is 'manager', if so show specific SweetAlert and prevent login
              if (userType === 'manager') {
                Swal.fire({
                  title: "Access Denied",
                  text: "Managers are not allowed to log in.",
                  icon: "error",
                  showConfirmButton: true
                }).then(() => {
                  firebase.auth().signOut(); // Sign out the user
                  window.location.href = "index.html"; // Redirect to login page
                });
              } else {
                // Proceed with normal login for non-manager users
                Swal.fire({
                  title: "Login Successful",
                  text: "Click OK to continue...",
                  icon: "success",
                  showConfirmButton: true,
                  allowOutsideClick: false
                }).then((result) => {
                  if (result.isConfirmed) {
                    if (userType === 'housekeeper') {
                      window.location.href = "housekeeper.html";
                    } else if (userType === 'receptionist') {
                      window.location.href = "receptionist.html";
                    } else {
                      window.location.href = "home.html";
                    }
                  }
                });
              }
            }
          } else {
            console.error("User data not found in the database.");
            alert("User data not found. Please try again.");
          }
        })
        .catch((error) => {
          document.getElementById("loadingSpinner").style.display = "none"; // Hide spinner
          console.error("Error fetching user data:", error);
          alert("Error fetching user data. Please try again.");
        });
    })
    .catch((error) => {
      document.getElementById("loadingSpinner").style.display = "none"; // Hide spinner
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
    });
}


document.addEventListener("DOMContentLoaded", function() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      const userRef = firebase.database().ref(`users/${userId}`);
      
      userRef.once('value').then((snapshot) => {
        const userData = snapshot.val();
        
        if (userData) {
          const userType = userData.userType;
          const accountStatus = userData.accountStatus; // Fetch accountStatus

          console.log("User Type:", userType);
          console.log("Account Status:", accountStatus);

          if (accountStatus === 'deactivated') {
            // Account is deactivated, sign out the user and redirect to login page
            firebase.auth().signOut().then(() => {
              Swal.fire({
                title: "Account Deactivated",
                text: "Your account has been deactivated. Please contact support.",
                icon: "error",
                showConfirmButton: true
              }).then(() => {
                window.location = 'index.html'; // Redirect to login page
              });
            }).catch((error) => {
              console.error("Error signing out:", error);
            });
          } else if (userType === 'manager') {
            // If the user is a manager, restrict access
            firebase.auth().signOut().then(() => {
              Swal.fire({
                title: "Access Denied",
                text: "Managers are not allowed to log in.",
                icon: "error",
                showConfirmButton: true
              }).then(() => {
                window.location = 'index.html'; // Redirect to login page
              });
            }).catch((error) => {
              console.error("Error signing out:", error);
            });
          } else {
            // Redirect based on userType if the account is active and not manager
            switch (userType) {
              case 'receptionist':
                window.location = 'receptionist.html';
                break;
              case 'housekeeper':
                window.location = 'housekeeper.html';
                break;
              case 'user':
                window.location = 'home.html';
                break;
              default:
                console.log("Unknown user type");
                // Optional: Redirect to a default page or show an error message
            }
          }
        } else {
          console.log("User data not found.");
          // Optional: Handle case where user data is not found
        }
      }).catch((error) => {
        console.error("Error fetching user data:", error);
      });
      
    } else {
      // No user is signed in, stay on index.html
      console.log("No user is signed in.");
    }
  });
});




  document.getElementById('login').addEventListener('click', GoogleLogin)
  let provider = new firebase.auth.GoogleAuthProvider()
  
  function GoogleLogin() {
    console.log('Login Btn Call');
    firebase.auth().signInWithPopup(provider).then(res => {
        console.log(res.user);
        
        // Call saveUserData function to store user information
        if (res.user) {
            saveUserData1(res.user);
            document.getElementById('LoginScreen').style.display = "none";
            document.getElementById('dashboard').style.display = "block";
            showUserDetails(res.user);
        } else {
            console.error('No user data returned from login.');
        }
    }).catch(e => {
        console.log('Error during sign in:', e);
    });
}

// Google login save details
function saveUserData1(user) {
    const userRef = firebase.database().ref('users/' + user.uid);

    const userData = {
        uid: user.uid,
        username: user.displayName,
        email: user.email,
        profileImageUrl: user.photoURL,
        userType: 'user',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    userRef.set(userData)
        .then(() => {
            console.log('User data saved successfully!');
            // Redirect to home.html after successful data save
            window.location.href = 'home.html';
        })
        .catch(error => {
            console.error('Error saving user data:', error);
        });
}



    //email login save details
    function saveUserData(user) {
        // Reference sa iyong Firebase Realtime Database
        const userRef = firebase.database().ref('users/' + user.uid);
        
        // User data na isasave
        const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            profilePic: user.photoURL
        };
    
        // Isave ang user data
        userRef.set(userData)
            .then(() => {
                console.log('User data saved successfully!');
            })
            .catch(error => {
                console.error('Error saving user data:', error);
            });
    }
