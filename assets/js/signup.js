export function setupForm() {
    const form = document.getElementById('signup-form');

    function showError(input, message) {
        input.classList.add('input-error');
        let el = input.nextElementSibling;
        if (!el || !el.classList.contains('error-message')) {
            el = document.createElement('div');
            el.className = 'error-message';
            input.parentNode.insertBefore(el, input.nextSibling);
        }
        el.textContent = message;
    }

    function clearErrors() {
        document.querySelectorAll('.input-error').forEach(i => i.classList.remove('input-error'));
        document.querySelectorAll('.error-message').forEach(e => e.remove());
    }

    function validateEmail(email) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    }

    async function domainHasMailServer(domain) {
        const doh = 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(domain) + '&type=';
        try {
            const mxResp = await fetch(doh + 'MX', { headers: { Accept: 'application/dns-json' } });
            if (mxResp.ok) {
                const mxJson = await mxResp.json();
                if (mxJson && Array.isArray(mxJson.Answer) && mxJson.Answer.length > 0) return true;
            }
            const aResp = await fetch(doh + 'A', { headers: { Accept: 'application/dns-json' } });
            if (aResp.ok) {
                const aJson = await aResp.json();
                if (aJson && Array.isArray(aJson.Answer) && aJson.Answer.length > 0) return true;
            }
        } catch (err) {
            console.warn('DNS lookup failed', err);
            return null;
        }
        return false;
    }

    function showSuccess(data, domainCheck) {
        const container = document.createElement('div');
        container.className = 'signup-success';
        const domainNote = domainCheck === true ? '' : (domainCheck === false ? '<p style="color:#ffd6d6;">Note: the email domain did not appear to accept mail.</p>' : '');
        container.innerHTML = `
            <h2>You're in — welcome!</h2>
            <p>Thanks ${data.get('first_name') || ''}, we've received your sign up.</p>
            <p>We'll send any updates to <strong>${data.get('email_address') || ''}</strong>.</p>
            ${domainNote}
            <div style="margin-top:12px;"><button class="home-button">Back to home</button></div>
        `;
        form.replaceWith(container);
        const btn = container.querySelector('.home-button');
        if (btn) btn.addEventListener('click', () => { window.location.href = 'index.html'; });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();
        const first = document.getElementById('first-name');
        const last = document.getElementById('last-name');
        const email = document.getElementById('email-address');
        const pref = form.querySelector('input[name="running_preference"]:checked');
        let valid = true;

        if (!first.value.trim()) { showError(first, 'Please enter your first name'); valid = false; }
        if (!last.value.trim()) { showError(last, 'Please enter your last name'); valid = false; }
        if (!email.value.trim() || !validateEmail(email.value)) { showError(email, 'Enter a valid email address'); valid = false; }
        if (!pref) { const rb = form.querySelector('.radio-buttons'); showError(rb, 'Please choose a running preference'); valid = false; }

        if (!valid) return;
        const emailVal = email.value.trim();
        const domain = emailVal.split('@')[1] || '';
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Checking…'; }

        let domainCheck = null;
        if (domain) {
            domainCheck = await domainHasMailServer(domain);
        }

        if (domainCheck === false) {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
            showError(email, 'The email domain does not appear to accept mail. Please check the address.');
            return;
        }
        const formData = new FormData(form);

        try {
            await fetch(form.action, { method: 'POST', body: formData, mode: 'no-cors' });
        } catch (err) {
            console.warn('Form submission (no-cors) experienced an error:', err);
        }

        if (submitBtn) { submitBtn.textContent = originalBtnText; }
        showSuccess(formData, domainCheck);
    });
}

if (typeof window !== 'undefined' && !window.__signup_module_attached) {
    document.addEventListener('DOMContentLoaded', function () { if (window.setupForm) { setupForm(); } else { /* nothing */ } });
    window.__signup_module_attached = true;
}