
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('promocodeForm');
    const list = document.getElementById('promocodes');

    async function loadPromocodes() {
        const rows = await apiFetch('/api/v1/promocodes');

        list.replaceChildren();

        rows.forEach(promo => {
            const row = document.createElement('tr');

            const values = [
                promo.code,
                promo.discount_percent > 0
                    ? `${promo.discount_percent}%`
                    : `${promo.discount_amount} грн`,
                promo.min_order,
                promo.expires_at || 'Безстроково',
                promo.active ? 'Так' : 'Ні'
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                cell.className = 'p-2';
                row.append(cell);
            });

            const actions = document.createElement('td');
            const button = document.createElement('button');

            button.textContent = 'Видалити';

            button.onclick = async () => {
                if (!confirm('Видалити промокод?')) return;

                try {
                    await apiFetch(
                        `/api/v1/promocodes/${promo.id}`,
                        { method: 'DELETE' }
                    );

                    row.remove();

                    showToast('Промокод видалено', 'success');

                } catch (error) {
                    showToast(error.message, 'error');
                }
            };

            actions.append(button);
            row.append(actions);

            list.append(row);
        });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const fields = form.elements;

        const code = fields.code.value.trim();
        const percent = Number(fields.discount_percent.value || 0);
        const amount = Number(fields.discount_amount.value || 0);
        const minimum = Number(fields.min_order.value || 0);
        const date = fields.expires_at.value || null;

        if (!code || code.length > 50) {
            showToast('Перевірте код промокоду', 'error');
            return;
        }

        if (percent < 0 || percent > 100 ||
            amount < 0 || minimum < 0 ||
            (percent === 0 && amount === 0)) {
            showToast('Перевірте розмір знижки', 'error');
            return;
        }

        const button = form.querySelector('[type="submit"]');
        button.disabled = true;

        try {
            await apiFetch('/api/v1/promocodes', {
                method: 'POST',
                body: {
                    code,
                    discount_percent: percent,
                    discount_amount: amount,
                    min_order: minimum,
                    active: fields.active.checked,
                    expires_at: date
                }
            });

            form.reset();

            showToast('Промокод створено', 'success');

            await loadPromocodes();

        } catch (error) {
            if (error.status === 409) {
                showToast('Такий промокод вже існує', 'error');
            } else {
                showToast(error.message, 'error');
            }
        } finally {
            button.disabled = false;
        }
    });

    loadPromocodes().catch(error => {
        showToast(error.message, 'error');
    });
});
