// 1. เลือกเมนูหลายรายการพร้อมตัวเลือก
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
                    itemData.serve = card.querySelector('.serve-type').value;
                    itemData.sweet = card.querySelector('.sweetness').value;
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

// 3. แสดงผลหน้า Order Tag หลายรายการ
const nameInput = document.getElementById('nameInput');
const customerNameDisplay = document.getElementById('customerName');
const selectedDrinkList = document.getElementById('selectedDrinkList');
const finishBtn = document.getElementById('finishBtn');

if (selectedDrinkList) {
    const savedMenus = JSON.parse(localStorage.getItem('selectedDrinks')) || [{ name: 'เอสเปรสโซ (Espresso)', serve: 'เย็น', sweet: 'หวาน 100%' }];
    
    selectedDrinkList.innerHTML = '';
    savedMenus.forEach((item, index) => {
        const itemP = document.createElement('div');
        if (item.serve) {
            itemP.innerText = `${index + 1}. ${item.name} (${item.serve}, ${item.sweet})`;
        } else {
            itemP.innerText = `${index + 1}. ${item.name} (เบเกอรี)`;
        }
        selectedDrinkList.appendChild(itemP);
    });
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
        window.location.href = 'thankyou.html';
    });
}