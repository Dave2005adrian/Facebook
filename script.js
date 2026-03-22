// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpD6McUzeBg8Dv6GdL_UwuJDEby4BWa4g",
  authDomain: "cred-96ec7.firebaseapp.com",
  projectId: "cred-96ec7",
  storageBucket: "cred-96ec7.firebasestorage.app",
  messagingSenderId: "301625816407",
  appId: "1:301625816407:web:139a82523524d9cf4a3a12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple password hashing function (for demo purposes)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Add test users to database (run this once to populate test data)
async function addTestUsers() {
  const testUsers = [
    { email: "test@example.com", password: "password123" },
    { email: "dave@example.com", password: "test1234" }
  ];

  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", user.email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Only add if user doesn't exist
      console.log(`Would add test user: ${user.email}`);
    }
  }
}

// Verify user credentials
async function verifyCredentials(email, password) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "Email or password is incorrect" };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const hashedInputPassword = await hashPassword(password);

    if (userData.passwordHash === hashedInputPassword) {
      return { success: true, user: userData };
    } else {
      return { success: false, message: "Email or password is incorrect" };
    }
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// Handle login form submission
document.addEventListener("DOMContentLoaded", async function() {
  const loginForm = document.querySelector("form");
  const emailInput = loginForm.querySelector('input[type="text"]');
  const passwordInput = loginForm.querySelector('input[type="password"]');
  const loginBtn = loginForm.querySelector(".login-btn");

  // TEST DATA - Add test users on first load
  // Comment this out after first run
  // await addTestUsers();

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate inputs
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    // Show loading state
    loginBtn.textContent = "Logging in...";
    loginBtn.disabled = true;

    try {
      // Verify credentials against database
      const result = await verifyCredentials(email, password);

      if (result.success) {
        console.log("User logged in successfully:", result.user);
        
        // Store user info in localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(result.user));
        
        // Redirect to Facebook after successful login
        window.location.href = "https://www.facebook.com";

      } else {
        alert(result.message);
        loginBtn.textContent = "Log In";
        loginBtn.disabled = false;
        passwordInput.value = "";
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
      loginBtn.textContent = "Log In";
      loginBtn.disabled = false;
      passwordInput.value = "";
    }
  });

  // Handle Create New Account button
  const createBtn = document.querySelector(".create-btn");
  createBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Test credentials:\nEmail: test@example.com\nPassword: password123\n\nOr set up your own test users in Firebase Console");
  });

  // Check if user is already logged in
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    console.log("User already logged in:", loggedInUser);
  }
});
