// Глобальна змінна для збереження інформації про користувача Google
let currentUserEmail = null;
let currentUserName = null;
let googleAuthInstance = null;

// URL вашого Google Apps Script (замініть на ваш реальний URL)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXLf6iMfC1TBL9ySjkQaYW7w7dEUV-TFZi4nTLlaLn_cLhtJ1xEWgqCXDW2zx2TyaT/exec';

// Елементи DOM
const signInButtonContainer = document.getElementById('signInButtonContainer');
const signOutButton = document.getElementById('signOutButton');
const userInfoDiv = document.getElementById('userInfo');
const pressureForm = document.getElementById('pressureForm');
const statusMessageDiv = document.getElementById('statusMessage');
const currentYearSpan = document.getElementById('currentYear');

/**
 * Функція, що викликається при успішній авторизації Google.
 * @param {object} googleUser - Об'єкт користувача Google.
 */
function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    currentUserEmail = profile.getEmail();
    currentUserName = profile.getName();

    console.log('Користувач успішно увійшов.');
    console.log('Email: ' + currentUserEmail);
    console.log('Ім\'я: ' + currentUserName);

    updateUI(true); // Оновити інтерфейс для авторизованого користувача
}

/**
 * Функція для виходу з системи Google.
 */
function signOut() {
    if (googleAuthInstance) {
        googleAuthInstance.signOut().then(function () {
            console.log('Користувач вийшов.');
            currentUserEmail = null;
            currentUserName = null;
            updateUI(false); // Оновити інтерфейс для неавторизованого користувача
        });
    }
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
        signInButtonContainer.style.display = 'flex'; // Або 'block'
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

    // Проста валідація
    if (!systolic || !diastolic) {
        statusMessageDiv.textContent = 'Будь ласка, заповніть поля систолічного та діастолічного тиску.';
        statusMessageDiv.className = 'mt-6 text-center text-sm text-yellow-400 min-h-[20px]';
        return;
    }

    const dataToSend = {
        email: currentUserEmail,
        systolic: systolic,
        diastolic: diastolic,
        pulse: pulse
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
 * Ініціалізація Google Auth клієнта та слухачів подій.
 */
function initializeGoogleAuth() {
    gapi.load('auth2', function() {
        // Ініціалізація Google Auth2
        gapi.auth2.init({
            client_id: document.querySelector('meta[name="google-signin-client_id"]').content
        }).then(function (authInstance) {
            googleAuthInstance = authInstance; // Зберігаємо екземпляр для signOut

            // Слухати зміни статусу авторизації
            googleAuthInstance.isSignedIn.listen(updateSigninStatus);

            // Обробити початковий статус авторизації
            updateSigninStatus(googleAuthInstance.isSignedIn.get());

        }).catch(function(error) {
            console.error("Помилка ініціалізації Google Auth: ", JSON.stringify(error, undefined, 2));
            statusMessageDiv.textContent = "Помилка ініціалізації Google Автентифікації. Перевірте Client ID.";
            statusMessageDiv.className = 'mt-6 text-center text-sm text-red-400 min-h-[20px]';
        });
    });
}

/**
 * Оновлює UI в залежності від статусу авторизації (викликається слухачем).
 * @param {boolean} isSignedIn - Статус авторизації.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // Якщо користувач вже увійшов, викликаємо onSignIn для отримання даних профілю
        onSignIn(googleAuthInstance.currentUser.get());
    } else {
        updateUI(false);
    }
}


// Додавання слухачів подій після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    // Ініціалізація Google Auth відбувається через platform.js,
    // але ми можемо перевірити стан після завантаження gapi
    if (typeof gapi !== 'undefined') {
        initializeGoogleAuth();
    } else {
        // Якщо gapi ще не завантажено, platform.js викличе onSignIn автоматично
        // або можна спробувати завантажити його тут, але async defer має впоратися
        console.warn("gapi не завантажено при DOMContentLoaded, platform.js має впоратися.");
    }
    
    signOutButton.addEventListener('click', signOut);
    pressureForm.addEventListener('submit', handleFormSubmit);

    if(currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});

// Важливо: функція onSignIn має бути глобальною, оскільки її викликає бібліотека Google
window.onSignIn = onSignIn;
