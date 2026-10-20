// 1. เลือกเมนูและดึงราคามาคำนวณ
const drinkCards = document.querySelectorAll('.drink-card');
const nextBtn = document.getElementById('nextBtn');
let selectedMenus = [];

if (drinkCards.length > 0 && nextBtn) {
    drinkCards.forEach(card => {
        const selects = card.querySelectorAll('select');
        selects.forEach(sel => {
            sel.addEventListener('click', (e) => e.stopPropagation());
        });

        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            const menuName = card.getAttribute('data-name');
            const menuType = card.getAttribute('data-type');

            if (card.classList.contains('selected')) {
                let itemData = { name: menuName };
                if (menuType === 'drink') {
                    const serveSelect = card.querySelector('.serve-type');
                    const selectedOption = serveSelect.options[serveSelect.selectedIndex];
                    itemData.serve = selectedOption.value;
                    itemData.price = parseInt(selectedOption.getAttribute('data-price')) || 0;
                    itemData.sweet = card.querySelector('.sweetness').value;
                } else {
                    itemData.price = parseInt(card.getAttribute('data-price')) || 0;
                }
                selectedMenus.push(itemData);
            } else {
                selectedMenus = selectedMenus.filter(item => item.name !== menuName);
            }

            if (selectedMenus.length > 0) {
                nextBtn.classList.remove('disabled');
                nextBtn.removeAttribute('disabled');
                nextBtn.innerText = `ต่อไป (${selectedMenus.length} รายการ)`;
            } else {
                nextBtn.classList.add('disabled');
                nextBtn.setAttribute('disabled', 'true');
                nextBtn.innerText = 'กรุณาเลือกเมนูก่อน';
            }
        });
    });

    nextBtn.addEventListener('click', () => {
        if (!nextBtn.classList.contains('disabled')) {
            localStorage.setItem('selectedDrinks', JSON.stringify(selectedMenus));
            window.location.href = 'name.html';
        }
    });
}

// 2. กรองหมวดหมู่
const filterButtons = document.querySelectorAll('.filter-btn');
if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            drinkCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// 3. แสดงผลหน้า Order Tag (คำนวณราคารวมและรันเลขออเดอร์อัตโนมัติ)
const nameInput = document.getElementById('nameInput');
const customerNameDisplay = document.getElementById('customerName');
const selectedDrinkList = document.getElementById('selectedDrinkList');
const totalPriceDisplay = document.getElementById('totalPriceDisplay');
const orderNumberDisplay = document.getElementById('orderNumberDisplay');
const finishBtn = document.getElementById('finishBtn');

if (selectedDrinkList) {
    const savedMenus = JSON.parse(localStorage.getItem('selectedDrinks')) || [];
    
    selectedDrinkList.innerHTML = '';
    let totalPrice = 0;

    savedMenus.forEach((item, index) => {
        const itemP = document.createElement('div');
        if (item.serve) {
            itemP.innerText = `${index + 1}. ${item.name} (${item.serve}, ${item.sweet}) - ${item.price}.-`;
        } else {
            itemP.innerText = `${index + 1}. ${item.name} - ${item.price}.-`;
        }
        selectedDrinkList.appendChild(itemP);
        totalPrice += item.price || 0;
    });

    if (totalPriceDisplay) {
        totalPriceDisplay.innerText = `รวมทั้งหมด: ${totalPrice} บาท`;
    }

    // ระบบรันเลขออเดอร์อัตโนมัติ (เพิ่มทีละ 1 ทุกออเดอร์)
    let currentOrderNo = localStorage.getItem('orderCounter') ? parseInt(localStorage.getItem('orderCounter')) : 1;
    let formattedOrderNo = String(currentOrderNo).padStart(3, '0');
    if (orderNumberDisplay) {
        orderNumberDisplay.innerText = `ORDER #${formattedOrderNo}`;
    }
}

if (nameInput && customerNameDisplay) {
    nameInput.value = "";
    customerNameDisplay.innerText = "Your Name";

    nameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        customerNameDisplay.innerText = val === "" ? "Your Name" : val;
    });
}

if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        // เมื่อกดสั่งซื้อสำเร็จ ให้บวกเลขออเดอร์เพิ่มขึ้น 1 สำหรับออเดอร์ถัดไป
        let currentOrderNo = localStorage.getItem('orderCounter') ? parseInt(localStorage.getItem('orderCounter')) : 1;
        localStorage.setItem('orderCounter', currentOrderNo + 1);
        
        window.location.href = 'thankyou.html';
    });
}