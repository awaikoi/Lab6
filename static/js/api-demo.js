
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryForm');
    const list = document.getElementById('categoryList');
    const parent = form.elements.parent_id;

    async function loadCategories() {
        try {
            setLoading(true);

            const categories = await apiFetch(
                '/api/v1/categories'
            );

            list.replaceChildren();

            parent.replaceChildren(
                new Option('Коренева категорія', '')
            );

            categories.forEach(category => {
                const item = document.createElement('li');

                item.textContent =
                    `${category.name} — ` +
                    `${category.parent_name || 'Коренева'}`;

                list.appendChild(item);

                parent.add(
                    new Option(category.name, category.id)
                );
            });

        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = form.elements.name.value.trim();

        if (name.length < 2 || name.length > 100) {
            showToast(
                'Назва має містити від 2 до 100 символів.',
                'error'
            );
            return;
        }

        try {
            await apiFetch('/api/v1/categories', {
                method: 'POST',
                body: {
                    name,
                    parent_id: parent.value
                        ? Number(parent.value)
                        : null
                }
            });

            form.reset();

            showToast(
                'Категорію додано!',
                'success'
            );

            await loadCategories();

        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    loadCategories();
});

