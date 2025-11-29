const registerForm = document.getElementById('registerForm');
const messageElement = document.getElementById('regMsg');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emailR').value;
    const password = document.getElementById('passwordR').value;
    const role = document.getElementById('role').value;

    if (email === '' || password === '' || role === '') {
        showMessage(messageElement, 'All fields are required.', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageElement, 'Password must be at least 6 characters long.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(messageElement, 'Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = '../login/index.html';
            }, 1500);
        } else {
            showMessage(messageElement, data.message || 'Registration failed.', 'error');
        }
    } catch (error) {
        console.error('Registration Error:', error);
        showMessage(messageElement, 'An error occurred. Please try again.', 'error');
    }
});

function showMessage(element, text, type) {
    element.textContent = text;
    element.classList.remove('success', 'error');
    element.classList.add(type);
}
