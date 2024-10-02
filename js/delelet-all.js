let deleteAllData = `
    <div class="btns">
        <button onclick="deleteAllData()">مسح كل البيانات</button>
    </div>
`;

document.getElementById('deleteData').innerHTML = deleteAllData;


// دالة حذف جميع العمليات 
window.deleteAllData = function deleteAllData() {
    const password = prompt('أدخل كلمة المرور لمسح جميع البيانات:');
    if (password === '000') {
        if (confirm('هل أنت متأكد أنك تريد مسح كل البيانات؟')) {
            Promise.all([
                productsRef.remove(),
                salesRef.remove()
            ]).then(() => {
                alert('تم مسح جميع البيانات بنجاح.');
            }).catch(error => {
                alert('حدث خطأ: ' + error.message);
            });
        }
    } else {
        alert('كلمة المرور غير صحيحة.');
    }
}
