/*
 * login-logic.js
 * Handles fake login, SHA-256 hashing, and Mediarithmics identity events.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Get references to all the new HTML elements
  const loginForm = document.getElementById("login-form");
  const loginEmailInput = document.getElementById("login-email");
  const loginButton = document.getElementById("login-button");
  const userInfoDiv = document.getElementById("user-info");
  const userEmailDisplay = document.getElementById("user-email-display");
  const logoutButton = document.getElementById("logout-button");

  // --- 1. SHA-256 Hashing Function ---
  // This is an async function because the Web Crypto API is promise-based.
  async function hashEmailSHA256(email) {
    // Normalize: lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    
    // Encode the string as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(normalizedEmail);

    // Perform the hash
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

    // Convert the ArrayBuffer to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
      
    return hexHash;
  }

  // --- 2. Login Event Handler ---
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Stop the form from submitting normally
    const email = loginEmailInput.value;

    if (!email) return; // Do nothing if email is empty

    try {
      // 1. Hash the email
      const hashedEmail = await hashEmailSHA256(email);
      
      console.log(`Login successful for: ${email}`);
      console.log(`SHA-256 Hash: ${hashedEmail}`);

      // 2. Send events to Mediarithmics
      // This is the key event for identity resolution.
      // It links the current cookie (mics_vid) to the $email_hash identifier.
      if (window.demomediaretailsite) {
        
        // Event 1: $user_identification
        // This explicitly tells Mediarithmics to associate the hash with this user profile.
        const identificationProps = {
          $email_hash: hashedEmail
          // You could also add the plain-text email if your schema supports it
          // $email: email 
        };
        window.demomediaretailsite.push("$user_identification", identificationProps);
        console.log("Pushed $user_identification event", identificationProps);

        // Event 2: $user_login (as requested)
        // This logs the specific action of logging in.
        const loginProps = {
          $email_hash: hashedEmail
        };
        window.demomediaretailsite.push("$user_login", loginProps);
        console.log("Pushed $user_login event", loginProps);

      } else {
        console.warn("Mediarithmics tracker (demomediaretailsite) not found.");
      }

      // 3. Update the UI and save "session"
      updateUIAfterLogin(email);

    } catch (error) {
      console.error("Error during login or hashing:", error);
    }
  });
  
  // --- 3. Logout Event Handler ---
  logoutButton.addEventListener("click", () => {
    // 1. Clear the "session"
    sessionStorage.removeItem("demoUserEmail");

    // 2. Send $user_logout event (good practice)
    if (window.demomediaretailsite) {
        window.demomediaretailsite.push("$user_logout");
        console.log("Pushed $user_logout event");
    }

    // 3. Update the UI
    loginForm.style.display = "flex";
    userInfoDiv.style.display = "none";
    loginEmailInput.value = ""; // Clear input field
  });
  
  // --- 4. Helper function to update UI ---
  function updateUIAfterLogin(email) {
    // Save email to session storage to persist login across pages
    sessionStorage.setItem("demoUserEmail", email);

    // Update the display text
    userEmailDisplay.textContent = `Welcome, ${email}`;
    
    // Toggle visibility
    loginForm.style.display = "none";
    userInfoDiv.style.display = "flex";
  }
  
  // --- 5. Check login state on page load ---
  // This makes the login "stick" when you navigate to other pages.
  const loggedInEmail = sessionStorage.getItem("demoUserEmail");
  if (loggedInEmail) {
    updateUIAfterLogin(loggedInEmail);
  }

});