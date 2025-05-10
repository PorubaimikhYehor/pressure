// Глобальна змінна для збереження інформації про користувача Google
let currentUserEmail = null;
let currentUserName = null;
// `googleAuthInstance` no longer directly used with GIS as it was with gapi.auth2
// let googleAuthInstance = null; // No longer needed in the same way

// URL вашого Google Apps Script (замініть на ваш реальний URL)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHeFN2RoFI1XCNLPAVBOvzEi8OzttxmsRdEkX6_RGwPSmKUWsotAZJTY_cs9snKET7/exec';

// Елементи DOM
const signInButtonContainer = document.getElementById('signInButtonContainer');
const signOutButton = document.getElementById('signOutButton');
const userInfoDiv = document.getElementById('userInfo');
const pressureForm = document.getElementById('pressureForm');
const statusMessageDiv = document.getElementById('statusMessage');
const currentYearSpan = document.getElementById('currentYear');

/**
 * Helper function to decode the JWT for client-side UI purposes.
 * IMPORTANT: The actual verification of the ID token MUST be done on your backend server.
 * This client-side decode is for displaying user info only.
 * @param {string} token - The JWT received from Google.
 * @returns {object|null} Decoded payload or null if invalid.
 */
function decodeJwtResponse(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}


/**
 * Функція, що викликається при успішній авторизації Google (GIS callback).
 * @param {CredentialResponse} response - Об'єкт відповіді від Google, що містить JWT.
 */
function handleCredentialResponse(response) {
    if (response.credential) {
        console.log('Отримано відповідь на авторизацію GIS.');
        const decodedToken = decodeJwtResponse(response.credential);

        if (decodedToken) {
            currentUserEmail = decodedToken.email;
            currentUserName = decodedToken.name; // Or decodedToken.given_name + ' ' + decodedToken.family_name

            console.log('Користувач успішно увійшов (GIS).');
            console.log('Email: ' + currentUserEmail);
            console.log('Ім\'я: ' + currentUserName);

            updateUI(true); // Оновити інтерфейс для авторизованого користувача
        } else {
            console.error('Не вдалося розкодувати JWT.');
            statusMessageDiv.textContent = 'Помилка авторизації: недійсний токен.';
            statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
            updateUI(false);
        }
    } else {
        console.error('Не отримано облікових даних у відповіді GIS.');
        statusMessageDiv.textContent = 'Помилка авторизації: облікові дані не отримано.';
        statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
        updateUI(false);
    }
}

/**
 * Функція для виходу з системи Google (GIS).
 */
function signOut() {
    // GIS doesn't provide a direct "sign out" function in the same way as gapi.auth2.
    // `disableAutoSelect` clears the user's session for your app in the browser.
    google.accounts.id.disableAutoSelect();
    console.log('Користувач вийшов (GIS).');
    currentUserEmail = null;
    currentUserName = null;
    updateUI(false); // Оновити інтерфейс для неавторизованого користувача
}

/**
 * Оновлює інтерфейс користувача залежно від статусу авторизації.
 * @param {boolean} isSignedIn - True, якщо користувач авторизований, інакше false.
 */
function updateUI(isSignedIn) {
    if (isSignedIn) {
        signInButtonContainer.style.display = 'none';
        signOutButton.style.display = 'block'; // Або 'inline-block' чи 'flex' залежно від стилів
        userInfoDiv.textContent = `Вітаємо, ${currentUserName}!`;
        pressureForm.style.display = 'block';
        statusMessageDiv.textContent = ''; // Очистити попередні повідомлення
    } else {
        // Display the Google Sign-In button again if signed out
        signInButtonContainer.style.display = 'flex'; // Or 'block'
        // Re-render the button if it was dynamically removed/hidden
        if (typeof google !== 'undefined' && typeof google.accounts !== 'undefined') {
            google.accounts.id.renderButton(
                signInButtonContainer, // Your button container
                { theme: "outline", size: "large" } // Customization options
            );
        }

        signOutButton.style.display = 'none';
        userInfoDiv.textContent = '';
        pressureForm.style.display = 'none';
        statusMessageDiv.textContent = 'Будь ласка, авторизуйтесь, щоб продовжити.';
    }
}

/**
 * Обробник відправки форми.
 * @param {Event} event - Подія відправки форми.
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Запобігти стандартній відправці форми

    if (!currentUserEmail) {
        statusMessageDiv.textContent = 'Помилка: Користувач не авторизований.';
        statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
        return;
    }

    const systolic = document.getElementById('systolic').value;
    const diastolic = document.getElementById('diastolic').value;
    const pulse = document.getElementById('pulse').value;
    const comment = document.getElementById('comment').value;
    const datetime = document.getElementById('datetime').value;

    // Проста валідація
    if (!systolic || !diastolic) {
        statusMessageDiv.textContent = 'Будь ласка, заповніть поля систолічного та діастолічного тиску.';
        statusMessageDiv.className = 'mt-6 text-center text-sm text-yellow-400 min-h-[20px]';
        return;
    }

    const dataToSend = {
        email: currentUserEmail,
        systolic,
        diastolic,
        pulse: pulse,
        comment,
        timestamp: datetime,
    };

    statusMessageDiv.textContent = 'Збереження даних...';
    statusMessageDiv.className = 'mt-6 text-center text-sm text-sky-400 min-h-[20px]';

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors', // Обов'язково для крос-доменних запитів до Apps Script
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script очікує text/plain для e.postData.contents
            },
            body: JSON.stringify(dataToSend) // Надсилаємо дані як JSON рядок
        });

        if (!response.ok) {
            // Якщо відповідь не ОК, спробуємо прочитати текст помилки
            const errorText = await response.text();
            throw new Error(`Помилка сервера: ${response.status}. ${errorText}`);
        }

        const result = await response.json(); // Очікуємо JSON відповідь від Apps Script

        if (result.status === "success") {
            statusMessageDiv.textContent = result.message || 'Дані успішно збережено!';
            statusMessageDiv.className = 'mt-6 text-center text-sm text-green-400 min-h-[20px]';
            pressureForm.reset(); // Очистити форму
        } else {
            statusMessageDiv.textContent = `Помилка збереження: ${result.message || 'Невідома помилка від скрипта.'}`;
            statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
        }
    } catch (error) {
        console.error('Помилка надсилання даних:', error);
        statusMessageDiv.textContent = `Помилка надсилання: ${error.message}. Перевірте консоль.`;
        statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
    }
}

/**
 * Ініціалізація Google Identity Services (GIS).
 * Ця функція викликається після завантаження DOM та після завантаження бібліотеки GIS.
 */
function initGoogleIdentityServices() {
    console.log("Ініціалізація Google Identity Services...");
    try {
        google.accounts.id.initialize({
            client_id: document.querySelector('meta[name="google-signin-client_id"]').content,
            callback: handleCredentialResponse, // This callback receives the JWT
            auto_select: true
        });

        // Render the "Sign in with Google" button
        // It will look for an element with the ID 'signInButtonContainer'
        // and render the button inside it.
        google.accounts.id.renderButton(
            signInButtonContainer, // Assuming this is the element where you want the button
            { theme: "outline", size: "large" } // Customize button appearance
        );

        // You can also enable One Tap prompt if desired
        google.accounts.id.prompt(n => console.log(n)); // For automatic sign-in prompt

        console.log("Google Identity Services ініціалізовано.");
        // Initially, update UI to reflect no user signed in.
        updateUI(false); // Show sign-in button by default
    } catch (error) {
        console.error("Помилка ініціалізації Google Identity Services:", error);
        statusMessageDiv.textContent = "Помилка ініціалізації Google Автентифікації. Перевірте Client ID.";
        statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
    }
}


// Додавання слухачів подій після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    signOutButton.addEventListener('click', signOut);
    pressureForm.addEventListener('submit', handleFormSubmit);

    document.getElementById('datetime').value = new Date((d = new Date()) && d.setMinutes(d.getMinutes() - d.getTimezoneOffset())).toJSON().substring(0, 16); 

    if(currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // `initGoogleIdentityServices` should be called after the GIS client library loads.
    // The most reliable way is to use `window.onload` or ensure the script is `async defer`
    // and your custom script is placed after the GIS script in the HTML.
    // Or, define `initGoogleIdentityServices` globally and use `?onload=initGoogleIdentityServices`
    // in the GIS script URL, similar to the old platform.js approach.
    // For simplicity here, let's rely on the GIS script loading and making `google.accounts.id` available
    // before `DOMContentLoaded` if it's placed correctly with `async defer`.
    // If not, a slight delay or `window.onload` might be needed if `google` is not yet defined.
    
    // It's safer to ensure `google` is defined before calling it,
    // but typically with `async defer`, it should be.
    // For this example, assuming the GIS script has loaded.
    // If you experience "google is undefined", wrap this in window.onload or check for google:
    // window.onload = initGoogleIdentityServices;
    // OR:
    if (typeof google !== 'undefined' && typeof google.accounts !== 'undefined') {
        initGoogleIdentityServices();
    } else {
        console.warn("Google Identity Services library not yet loaded at DOMContentLoaded. This might be a timing issue. Ensure 'https://accounts.google.com/gsi/client' is loaded first or use window.onload.");
        // Fallback if needed, e.g., a deferred call
        setTimeout(() => {
            if (typeof google !== 'undefined' && typeof google.accounts !== 'undefined') {
                initGoogleIdentityServices();
            } else {
                 console.error("Google Identity Services library still not loaded after delay.");
            }
        }, 500); // Small delay to check again
    }
});

// Important: `handleCredentialResponse` needs to be globally accessible for the GIS library to call it.
window.handleCredentialResponse = handleCredentialResponse;
// Also, if you're using `onload` parameter in the GIS script URL, this function needs to be global.
window.initGoogleIdentityServices = initGoogleIdentityServices;