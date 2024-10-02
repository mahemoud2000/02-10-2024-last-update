const deletedSalesRef = firebase.database().ref('deletedSales');

window.onload = function() {
    loadDeletedSales();
};

function loadDeletedSales() {
    deletedSalesRef.on('value', (snapshot) => {
        const sales = snapshot.val();
        const tableBody = document.getElementById('deletedSalesTable').getElementsByTagName('tbody')[0];
        if (!tableBody) {
            console.error('لم يتم العثور على tbody في جدول العمليات المحذوفة.');
            return;
        }
        tableBody.innerHTML = ''; // مسح الجدول الحالي

        if (sales) {
            for (let id in sales) {
                const sale = sales[id];
                const row = tableBody.insertRow();
                row.insertCell(0).innerText = id; // رقم العملية
                row.insertCell(1).innerText = new Date(sale.timestamp).toLocaleString('ar-EG') || 'غير متوفر'; // تاريخ الحذف
                row.insertCell(2).innerText = sale.reason || 'لا يوجد سبب'; // سبب الحذف

                // حساب الإجمالي
                let total = 0;
                const itemsCell = row.insertCell(3);
                itemsCell.innerHTML = ''; // إفراغ الخلية
                if (sale.items) {
                    sale.items.forEach(item => {
                        const itemTotal = item.price * item.quantity; // حساب إجمالي العنصر
                        total += itemTotal; // جمع الإجمالي
                        itemsCell.innerHTML += `
                            <div>
                                <strong>اسم المنتج:</strong> ${item.name} <br>
                                <strong>معرف المنتج:</strong> ${item.id} <br>
                                <strong>السعر:</strong> ${item.price} <br>
                                <strong>الكمية:</strong> ${item.quantity} <br>
                                <strong>الإجمالي:</strong> ${itemTotal} <br>
                                <hr>
                            </div>
                        `;
                    });
                } else {
                    itemsCell.innerText = 'لا توجد عناصر';
                }

                // إضافة إجمالي العملية
                const totalCell = row.insertCell(4);
                totalCell.innerText = total.toFixed(2); // عرض الإجمالي مع خانتين عشريتين

                const deleteCell = row.insertCell(5);
                const deleteButton = document.createElement('button');
                deleteButton.innerText = 'حذف نهائي';
                deleteButton.onclick = () => deleteSale(id);
                deleteCell.appendChild(deleteButton);

                // زر الطباعة لكل عملية
                const printButton = document.createElement('button');
                printButton.innerText = 'طباعة فاتورة';
                printButton.className = 'print-button';
                printButton.onclick = () => printInvoice(sale);
                deleteCell.appendChild(printButton);
            }
        } else {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6; // دمج الأعمدة في صف واحد
            cell.innerText = 'لا توجد عمليات محذوفة حالياً.';
            cell.style.textAlign = 'center'; // توسيط النص
        }
    });
}

function deleteSale(saleId) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذه العملية نهائيًا؟')) {
        deletedSalesRef.child(saleId).remove()
            .then(() => {
                alert('تم حذف العملية نهائيًا.');
                loadDeletedSales(); // تحديث العرض بعد الحذف
            })
            .catch((error) => {
                alert('حدث خطأ أثناء الحذف: ' + error.message);
            });
    }
}

function printInvoice(sale) {
    // إعداد محتوى الفاتورة
    let content = `
        <div style="text-align: right; direction: rtl;">
            <h2>فاتورة - عملية محذوفة</h2>
            <h3>رقم العملية: ${sale.saleId}</h3>
            <h4>تاريخ الحذف: ${new Date(sale.timestamp).toLocaleString('ar-EG')}</h4>
            <h4>سبب الحذف: ${sale.reason}</h4>
            <h4>تفاصيل العناصر:</h4>
    `;

    let total = 0; // متغير لحساب الإجمالي
    if (sale.items) {
        sale.items.forEach(item => {
            const itemTotal = item.price * item.quantity; // حساب إجمالي العنصر
            total += itemTotal; // جمع الإجمالي
            content += `
                <div>
                    <strong>اسم المنتج:</strong> ${item.name} <br>
                    <strong>معرف المنتج:</strong> ${item.id} <br>
                    <strong>السعر:</strong> ${item.price} <br>
                    <strong>الكمية:</strong> ${item.quantity} <br>
                    <strong>الإجمالي:</strong> ${itemTotal} <br>
                    <hr>
                </div>
            `;
        });
    } else {
        content += 'لا توجد عناصر<br>';
    }

    content += `
        <h4>الإجمالي الكلي: ${total.toFixed(2)}</h4>
        </div>
    `;

    // إنشاء نافذة جديدة للطباعة
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

window.printAllSales = function printAllSales() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // إعداد محتوى PDF لكل العمليات
    let content = 'العمليات المحذوفة:\n\n';

    deletedSalesRef.once('value').then((snapshot) => {
        const sales = snapshot.val();
        if (sales) {
            for (let id in sales) {
                const sale = sales[id];
                content += `رقم العملية: ${sale.saleId}\n`;
                content += `تاريخ الحذف: ${new Date(sale.timestamp).toLocaleString('ar-EG')}\n`;
                content += `سبب الحذف: ${sale.reason}\n\n`;
                content += 'تفاصيل العناصر:\n';

                let total = 0; // متغير لحساب الإجمالي
                if (sale.items) {
                    sale.items.forEach(item => {
                        const itemTotal = item.price * item.quantity; // حساب إجمالي العنصر
                        total += itemTotal; // جمع الإجمالي
                        content += `اسم المنتج: ${item.name}\n`;
                        content += `معرف المنتج: ${item.id}\n`;
                        content += `السعر: ${item.price}\n`;
                        content += `الكمية: ${item.quantity}\n`;
                        content += `الإجمالي: ${itemTotal}\n\n`;
                    });
                } else {
                    content += 'لا توجد عناصر\n';
                }

                content += `الإجمالي الكلي: ${total.toFixed(2)}\n\n`;
                content += '==========================\n\n';
            }
        } else {
            content += 'لا توجد عمليات محذوفة.\n';
        }

        doc.text(content, 10, 10);
        doc.save('deleted_sales.pdf');
    });
}