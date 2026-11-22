import sqlite3

from flask import Blueprint, abort, flash, redirect, render_template, request, url_for

import models

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')



# ------------------------------------------------- замовлення та відгуки

@admin_bp.route('/')
def admin():
    return render_template(
        'admin.html',
        orders=models.get_orders(),
        feedback=models.get_feedback(),
    )


@admin_bp.route('/order/<int:order_id>')
def order_details(order_id):
    order, items = models.get_order_details(order_id)
    if order is None:
        abort(404)
    return render_template(
        'order_details.html', order=order, items=items, statuses=models.ORDER_STATUSES
    )


@admin_bp.route('/order/<int:order_id>/status', methods=['POST'])
def update_order(order_id):
    try:
        models.update_order_status(order_id, request.form.get('status', ''))
        flash(f'Статус замовлення №{order_id} оновлено.', 'success')
    except ValueError:
        flash('Невідомий статус замовлення.', 'error')
    return redirect(url_for('admin.order_details', order_id=order_id))


@admin_bp.route('/order/<int:order_id>/delete', methods=['POST'])
def delete_order(order_id):
    models.delete_order(order_id)
    flash(f'Замовлення №{order_id} видалено.', 'success')
    return redirect(url_for('admin.admin'))


@admin_bp.route('/feedback/<int:feedback_id>/delete', methods=['POST'])
def delete_feedback(feedback_id):
    models.delete_feedback(feedback_id)
    flash('Відгук видалено.', 'success')
    return redirect(url_for('admin.admin'))


# ------------------------------------------------------------- товари


@admin_bp.route('/products')
def products():
    return render_template('admin_products.html')


@admin_bp.route('/products/new')
def new_product():
    return render_template(
        'product_form.html',
        is_new=True,
        product_id=None,
    )


@admin_bp.route('/products/<int:product_id>/edit')
def edit_product(product_id):
    if models.get_product(product_id) is None:
        abort(404)

    return render_template(
        'product_form.html',
        is_new=False,
        product_id=product_id,
    )


# -------------------------------------------------------- категорії та промокоди

@admin_bp.route('/categories', methods=['GET', 'POST'])
def categories():
    if request.method == 'POST':
        try:
            parent_id = int(request.form.get('parent_id')) if request.form.get('parent_id') else None
            models.add_category(request.form.get('name', ''), parent_id)
            flash('Категорію додано.', 'success')
        except (ValueError, sqlite3.IntegrityError) as error:
            flash(str(error), 'error')
        return redirect(url_for('admin.categories'))
    return render_template(
        'admin_categories.html',
        categories=models.get_category_tree(),
        all_categories=models.get_categories(),
    )


@admin_bp.route('/categories/<int:category_id>/delete', methods=['POST'])
def delete_category(category_id):
    models.delete_category(category_id)
    flash('Категорію видалено.', 'success')
    return redirect(url_for('admin.categories'))


@admin_bp.route('/promocodes')
def promocodes():
    return render_template('admin_promocodes.html')
