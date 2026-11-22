
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('adminProducts');

    async function loadProducts() {
        try {
            const products = await apiFetch('/api/v1/products');

            root.replaceChildren();

            if (!products.length) {
                root.textContent = 'Товарів поки немає.';
                return;
            }

            products.forEach(product => {
                const card = document.createElement('article');

                card.className =
                    'rounded-xl border border-line bg-white/30 p-4';

                const image = document.createElement('img');

                image.src = product.image_url || '';
                image.alt = product.name;

                image.className =
                    'mb-3 h-40 w-full object-contain';

                const name = document.createElement('h2');

                name.textContent = product.name;
                name.className = 'font-bold';

                const category = document.createElement('p');

                category.textContent =
                    product.category_name || 'Без категорії';

                const price = document.createElement('p');

                price.textContent =
                    `${product.final_price} грн`;

                const edit = document.createElement('a');

                edit.href =
                    `/admin/products/${product.id}/edit`;

                edit.textContent = 'Редагувати';

                edit.className =
                    'mr-3 text-accent underline';

                const remove = document.createElement('button');

                remove.textContent = 'Видалити';
                remove.className = 'text-red-700 underline';

                remove.onclick = async () => {
                    if (!confirm('Видалити товар?')) return;

                    try {
                        await apiFetch(
                            `/api/v1/products/${product.id}`,
                            { method: 'DELETE' }
                        );

                        card.remove();

                        if (!root.children.length) {
                            root.textContent = 'Товарів поки немає.';
                        }

                        showToast('Товар видалено', 'success');

                    } catch (error) {
                        if (error.status === 404) {
                            card.remove();
                        } else {
                            showToast(error.message, 'error');
                        }
                    }
                };

                card.append(
                    image,
                    name,
                    category,
                    price,
                    edit,
                    remove
                );

                root.append(card);
            });

        } catch (error) {
            root.replaceChildren();

            const message = document.createElement('p');
            message.textContent = error.message;

            const retry = document.createElement('button');
            retry.textContent = 'Повторити';
            retry.onclick = loadProducts;

            root.append(message, retry);
        }
    }

    loadProducts();
});
