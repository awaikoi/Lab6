
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('filterForm');
    const products = document.getElementById('products');
    const pagination = document.getElementById('pagination');

    let page = 1;
    let requestNumber = 0;
    let searchTimer;

    async function loadCategories() {
        const response = await apiFetch(
            '/api/v2/categories'
        );

        const select = form.elements.category;

        response.data.forEach(category => {
            select.add(
                new Option(
                    '— '.repeat(category.level) + category.name,
                    category.id
                )
            );
        });
    }

    function createProductCard(product) {
        const card = document.createElement('article');

        card.className =
            'overflow-hidden rounded-xl border border-line bg-white/30 p-4';

        const image = document.createElement('img');

        image.src = product.image_url || '';
        image.alt = product.name;

        image.className =
            'mb-3 h-48 w-full rounded-lg object-contain';

        if (!product.image_url) {
            image.classList.add('hidden');
        }

        const name = document.createElement('h2');
        name.textContent = product.name;
        name.className = 'font-semibold';

        const category = document.createElement('p');
        category.textContent =
            product.category_name || 'Без категорії';

        category.className = 'text-xs text-ink/60';

        card.append(image, name, category);

        if (Number(product.discount_percent) > 0) {
            const oldPrice = document.createElement('p');

            oldPrice.textContent =
                `${product.price} грн`;

            oldPrice.className =
                'text-sm line-through text-ink/50';

            const discount = document.createElement('span');

            discount.textContent =
                `-${product.discount_percent}%`;

            discount.className =
                'rounded bg-accent px-2 py-1 text-white';

            card.append(oldPrice, discount);
        }

        const price = document.createElement('p');

        price.textContent =
            `${product.final_price} грн`;

        price.className = 'my-3 font-bold';

        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = 'В кошик';

        button.className =
            'rounded-lg bg-accent px-4 py-2 text-white';

        button.addEventListener('click', () => {
            Cart.add(product.id);

            showToast(
                `«${product.name}» додано до кошика`,
                'success'
            );
        });

        card.append(price, button);

        return card;
    }

    function renderPagination(meta) {
        pagination.replaceChildren();

        const previous = document.createElement('button');
        previous.textContent = '←';
        previous.disabled = page <= 1;

        previous.onclick = () => {
            page--;
            loadProducts();
        };

        pagination.append(previous);

        for (let i = 1; i <= meta.pages; i++) {
            const button = document.createElement('button');

            button.textContent = i;
            button.disabled = i === page;

            button.className =
                'rounded border border-line px-3 py-1';

            button.onclick = () => {
                page = i;
                loadProducts();
            };

            pagination.append(button);
        }

        const next = document.createElement('button');

        next.textContent = '→';
        next.disabled = page >= meta.pages;

        next.onclick = () => {
            page++;
            loadProducts();
        };

        pagination.append(next);
    }

    async function loadProducts() {
        const currentRequest = ++requestNumber;

        const min = form.elements.min_price.value;
        const max = form.elements.max_price.value;

        if (min && max && Number(min) > Number(max)) {
            showToast(
                'Мінімальна ціна більша за максимальну.',
                'error'
            );
            return;
        }

        const params = new URLSearchParams();

        params.set('page', page);
        params.set('per_page', 12);

        const fields = [
            ['q', 'q'],
            ['category', 'category_id'],
            ['min_price', 'min_price'],
            ['max_price', 'max_price'],
            ['sort', 'sort']
        ];

        fields.forEach(([field, parameter]) => {
            const value = form.elements[field].value;

            if (value) {
                params.set(parameter, value);
            }
        });

        if (form.elements.on_sale.checked) {
            params.set('on_sale', 'true');
        }

        try {
            setLoading(true);

            const response = await apiFetch(
                `/api/v2/products?${params}`
            );

            if (currentRequest !== requestNumber) return;

            products.replaceChildren();

            if (!response.data.length) {
                products.textContent = 'Товарів не знайдено.';
            }

            response.data.forEach(product => {
                products.append(
                    createProductCard(product)
                );
            });

            renderPagination(response.meta);

        } catch (error) {
            products.replaceChildren();

            const message = document.createElement('p');
            message.textContent = error.message;

            const retry = document.createElement('button');
            retry.textContent = 'Повторити';
            retry.onclick = loadProducts;

            products.append(message, retry);

        } finally {
            setLoading(false);
        }
    }

    form.addEventListener('input', event => {
        page = 1;

        if (event.target.name === 'q') {
            clearTimeout(searchTimer);

            searchTimer = setTimeout(
                loadProducts,
                400
            );
        } else {
            loadProducts();
        }
    });

    form.addEventListener('change', () => {
        page = 1;
        loadProducts();
    });

    form.addEventListener('reset', () => {
        setTimeout(() => {
            page = 1;
            loadProducts();
        }, 0);
    });

    loadCategories()
        .then(loadProducts)
        .catch(error => showToast(error.message, 'error'));
});
