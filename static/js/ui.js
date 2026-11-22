function showToast(message, type = 'info') {
    const container = document.getElementById('toasts');

    const toast = document.createElement('div');

    const colors = {
        success: '#166534',
        error: '#991b1b',
        info: '#4c0519'
    };

    toast.textContent = message;

    toast.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 8px;
        background: white;
        color: ${colors[type] || colors.info};
        border: 1px solid #ffd1df;
        border-radius: 10px;
        box-shadow: 0 4px 12px #0002;
    `;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

function flashNext(message, type = 'success') {
    sessionStorage.setItem(
        'flashNext',
        JSON.stringify({ message, type })
    );
}

function setLoading(value) {
    const bar = document.getElementById('loading-bar');

    if (!bar) return;

    bar.style.width = value ? '70%' : '0';
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem('flashNext');

    if (!saved) return;

    sessionStorage.removeItem('flashNext');

    try {
        const data = JSON.parse(saved);

        showToast(data.message, data.type);
    } catch {
    }
});

