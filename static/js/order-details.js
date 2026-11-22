
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('orderDetails');

    const id = root.dataset.orderId;

    const ORDER_STATUSES = [
        'Нове',
        'В обробці',
        'Відправлено',
        'Доставлено',
        'Скасовано'
    ];

    function createText(tag, text) {
        const element = document.createElement(tag);
        element.textContent = text;
        return element;
    }

    async function loadOrder() {
        const order = await apiFetch(
            `/api/v1/orders/${id}`
        );

        root.replaceChildren();

        const information = document.createElement('div');

        information.className =
        'rounded-xl border border-line bg-white/30 p-5 space-y-2';

        const fields = [
            ['Email', order.email],
            ['Адреса', order.address],
            ['Промокод', order.promo_code || 'Немає'],
            ['Сума товарів', `${order.subtotal} грн`],
            ['Знижка', `${order.discount_amount} грн`],
            ['Загальна сума', `${order.total_price} грн`],
            ['Дата', order.date]
        ];

        fields.forEach(([label, value]) => {
            const p = createText(
                'p',
                `${label}: ${value ?? '—'}`
            );

            information.append(p);
        });

        const status = createText(
            'p',
            `Статус: ${order.status}`
        );

        status.id = 'currentStatus';

        information.append(status);

        root.append(information);

        const heading = createText(
            'h2',
            'Товари в замовленні'
        );

        heading.className = 'text-xl font-bold';

        const table = document.createElement('table');

        table.className = 'w-full text-left text-sm';

        const header = document.createElement('tr');

        [
            'Назва',
            'Ціна',
            'Кількість',
            'Сума'
        ].forEach(value => {
            const th = createText('th', value);
            th.className = 'p-3';
            header.append(th);
        });

        const thead = document.createElement('thead');
        thead.append(header);

        const tbody = document.createElement('tbody');

        (order.items || []).forEach(item => {
            const row = document.createElement('tr');

            row.className = 'border-t border-line';

            const values = [
                item.name,
                `${item.unit_price} грн`,
                item.quantity,
                `${(
                    item.unit_price * item.quantity
                ).toFixed(2)} грн`
            ];

            values.forEach(value => {
                const cell = createText('td', value);
                cell.className = 'p-3';
                row.append(cell);
            });

            tbody.append(row);
        });

        table.append(thead, tbody);

        root.append(heading, table);

        const statusHeading = createText(
            'h2',
            'Зміна статусу'
        );

        statusHeading.className = 'text-xl font-bold';

        const select = document.createElement('select');

        select.className =
        'rounded-lg border border-line bg-white p-2';

        ORDER_STATUSES.forEach(value => {
            select.add(new Option(value, value));
        });

        select.value = order.status;

        const button = createText(
            'button',
            'Оновити статус'
        );

        button.type = 'button';

        button.className =
        'ml-3 rounded-lg bg-accent px-4 py-2 text-white';

        button.onclick = async () => {
            button.disabled = true;

            try {
                const updated = await apiFetch(
                    `/api/v1/orders/${id}/status`,
                    {
                        method: 'PATCH',
                        body: {
                            status: select.value
                        }
                    }
                );

                status.textContent =
                `Статус: ${updated.status}`;

                showToast(
                    'Статус замовлення оновлено',
                    'success'
                );

            } catch (error) {
                showToast(error.message, 'error');

            } finally {
                button.disabled = false;
            }
        };

        root.append(
            statusHeading,
            select,
            button
        );
    }

    loadOrder().catch(error => {
        root.textContent =
        error.status === 404
        ? 'Замовлення не знайдено.'
        : error.message;
    });
});
