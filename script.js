// โหลดข้อมูลตะกร้าที่เคยเลือกค้างไว้
let cart = JSON.parse(localStorage.getItem('teddyCart')) || [];

// ฟังก์ชันดึงวันที่และเวลาปัจจุบันรูปแบบอ่านง่าย
function getCurrentFormattedDateTime() {
    const now = new Date();
    return now.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' น.';
}

// ==========================================
// 1. หน้าเลือกเมนู (drink.html)
// ==========================================
const drinkCards = document.querySelectorAll('.drink-card');
const nextBtn = document.getElementById('nextBtn');
const cartSummaryBox = document.getElementById('cartSummaryBox');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const liveTotalDisplay = document.getElementById('liveTotalDisplay');
const clearCartBtn = document.getElementById('clearCartBtn');

function saveCart() {
    localStorage.setItem('teddyCart', JSON.stringify(cart));
}

function renderCartUI() {
    if (!nextBtn) return;

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (totalItems > 0) {
        nextBtn.classList.remove('disabled');
        nextBtn.removeAttribute('disabled');
        nextBtn.innerText = `ต่อไป (${totalItems} รายการ - ${totalPrice} บาท)`;
        cartSummaryBox.classList.remove('hidden');
    } else {
        nextBtn.classList.add('disabled');
        nextBtn.setAttribute('disabled', 'true');
        nextBtn.innerText = 'กรุณาเลือกเมนูก่อน';
        cartSummaryBox.classList.add('hidden');
    }

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'cart-item-row';

            const detailText = item.serve 
                ? `${item.name} (${item.serve}, ${item.sweet})` 
                : `${item.name}`;

            row.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-title">${detailText}</span>
                    <span class="cart-item-price">${item.price * item.qty}.-</span>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="qty-btn minus-btn" data-index="${index}">-</button>
                    <span class="qty-num">${item.qty}</span>
                    <button type="button" class="qty-btn plus-btn" data-index="${index}">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });

        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if (cart[idx].qty > 1) {
                    cart[idx].qty -= 1;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
                renderCartUI();
                highlightSelectedCards();
            });
        });

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                cart[idx].qty += 1;
                saveCart();
                renderCartUI();
            });
        });
    }

    if (liveTotalDisplay) {
        liveTotalDisplay.innerText = `ยอดรวมทั้งหมด: ${totalPrice} บาท`;
    }
}

function highlightSelectedCards() {
    drinkCards.forEach(card => {
        const name = card.getAttribute('data-name');
        const isInCart = cart.some(item => item.name === name);
        if (isInCart) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

if (drinkCards.length > 0 && nextBtn) {
    renderCartUI();
    highlightSelectedCards();

    drinkCards.forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        
        addBtn.addEventListener('click', () => {
            const menuName = card.getAttribute('data-name');
            const menuType = card.getAttribute('data-type');
            
            let newItem = { name: menuName, qty: 1 };

            if (menuType === 'drink') {
                const serveSelect = card.querySelector('.serve-type');
                const selectedOption = serveSelect.options[serveSelect.selectedIndex];
                newItem.serve = selectedOption.value;
                newItem.price = parseInt(selectedOption.getAttribute('data-price')) || 0;
                newItem.sweet = card.querySelector('.sweetness').value;
            } else {
                newItem.serve = null;
                newItem.sweet = null;
                newItem.price = parseInt(card.getAttribute('data-price')) || 0;
            }

            const existingIndex = cart.findIndex(item => 
                item.name === newItem.name && 
                item.serve === newItem.serve && 
                item.sweet === newItem.sweet
            );

            if (existingIndex > -1) {
                cart[existingIndex].qty += 1;
            } else {
                cart.push(newItem);
            }

            saveCart();
            renderCartUI();
            highlightSelectedCards();

            const originalText = addBtn.innerText;
            addBtn.innerText = '✓ เพิ่มแล้ว!';
            addBtn.classList.add('added-feedback');
            setTimeout(() => {
                addBtn.innerText = originalText;
                addBtn.classList.remove('added-feedback');
            }, 600);
        });
    });

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            saveCart();
            renderCartUI();
            highlightSelectedCards();
        });
    }

    nextBtn.addEventListener('click', () => {
        if (!nextBtn.classList.contains('disabled')) {
            window.location.href = 'name.html';
        }
    });
}

// ==========================================
// 2. กรองหมวดหมู่ (Filter)
// ==========================================
const filterButtons = document.querySelectorAll('.filter-btn');
if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            drinkCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ==========================================
// 3. หน้าป้ายชื่อออเดอร์ (name.html)
// ==========================================
const nameInput = document.getElementById('nameInput');
const noteInput = document.getElementById('noteInput');
const nameErrorMsg = document.getElementById('nameErrorMsg');
const customerNameDisplay = document.getElementById('customerName');
const tagDateTime = document.getElementById('tagDateTime');
const selectedDrinkList = document.getElementById('selectedDrinkList');
const tagNoteDisplay = document.getElementById('tagNoteDisplay');
const totalPriceDisplay = document.getElementById('totalPriceDisplay');
const orderNumberDisplay = document.getElementById('orderNumberDisplay');
const finishBtn = document.getElementById('finishBtn');

if (selectedDrinkList) {
    if (cart.length === 0) {
        window.location.href = 'drink.html';
    }

    // แสดงวัน-เวลาบนป้าย Tag
    if (tagDateTime) {
        tagDateTime.innerText = getCurrentFormattedDateTime();
    }

    selectedDrinkList.innerHTML = '';
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        const subTotal = item.price * item.qty;
        if (item.serve) {
            itemDiv.innerText = `${index + 1}. ${item.name} (${item.serve}, ${item.sweet}) x${item.qty} = ${subTotal}.-`;
        } else {
            itemDiv.innerText = `${index + 1}. ${item.name} x${item.qty} = ${subTotal}.-`;
        }
        selectedDrinkList.appendChild(itemDiv);
        totalPrice += subTotal;
    });

    if (totalPriceDisplay) {
        totalPriceDisplay.innerText = `รวมทั้งหมด: ${totalPrice} บาท`;
    }

    let currentOrderNo = localStorage.getItem('orderCounter') ? parseInt(localStorage.getItem('orderCounter')) : 1;
    let formattedOrderNo = String(currentOrderNo).padStart(3, '0');
    if (orderNumberDisplay) {
        orderNumberDisplay.innerText = `ORDER #${formattedOrderNo}`;
    }
}

if (nameInput && customerNameDisplay) {
    nameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        customerNameDisplay.innerText = val === "" ? "Your Name" : val;
        if (val !== "") {
            nameErrorMsg.classList.add('hidden');
            nameInput.classList.remove('input-error');
        }
    });
}

if (noteInput && tagNoteDisplay) {
    noteInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val !== "") {
            tagNoteDisplay.innerText = `หมายเหตุ: ${val}`;
            tagNoteDisplay.classList.remove('hidden');
        } else {
            tagNoteDisplay.classList.add('hidden');
        }
    });
}

if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        const customerName = nameInput.value.trim();
        
        if (customerName === "") {
            nameErrorMsg.classList.remove('hidden');
            nameInput.classList.add('input-error');
            nameInput.focus();
            return;
        }

        let currentOrderNo = localStorage.getItem('orderCounter') ? parseInt(localStorage.getItem('orderCounter')) : 1;
        let formattedOrderNo = String(currentOrderNo).padStart(3, '0');

        // บันทึกใบเสร็จพร้อมวัน-เวลาที่สั่งซื้อ
        const completedOrder = {
            orderNo: formattedOrderNo,
            customerName: customerName,
            dateTime: getCurrentFormattedDateTime(),
            note: noteInput ? noteInput.value.trim() : "",
            items: cart
        };
        localStorage.setItem('lastCompletedOrder', JSON.stringify(completedOrder));

        localStorage.setItem('orderCounter', currentOrderNo + 1);
        localStorage.removeItem('teddyCart');
        
        window.location.href = 'thankyou.html';
    });
}

// ==========================================
// 4. หน้าใบเสร็จขอบคุณ + แถบติดตามสถานะ (thankyou.html)
// ==========================================
const receiptOrderNo = document.getElementById('receiptOrderNo');
const receiptCustomerName = document.getElementById('receiptCustomerName');
const receiptDateTime = document.getElementById('receiptDateTime');
const receiptItemsList = document.getElementById('receiptItemsList');
const receiptNote = document.getElementById('receiptNote');
const receiptTotal = document.getElementById('receiptTotal');
const copyReceiptBtn = document.getElementById('copyReceiptBtn');

if (receiptItemsList) {
    const lastOrder = JSON.parse(localStorage.getItem('lastCompletedOrder'));
    if (lastOrder) {
        receiptOrderNo.innerText = `ORDER #${lastOrder.orderNo}`;
        receiptCustomerName.innerText = lastOrder.customerName;
        if (receiptDateTime) {
            receiptDateTime.innerText = `เวลาที่สั่ง: ${lastOrder.dateTime || getCurrentFormattedDateTime()}`;
        }

        let total = 0;
        let plainTextItems = [];
        receiptItemsList.innerHTML = '';

        lastOrder.items.forEach((item, index) => {
            const div = document.createElement('div');
            const subTotal = item.price * item.qty;
            const lineText = item.serve 
                ? `${index + 1}. ${item.name} (${item.serve}, ${item.sweet}) x${item.qty} = ${subTotal}.-`
                : `${index + 1}. ${item.name} x${item.qty} = ${subTotal}.-`;
            
            div.innerText = lineText;
            receiptItemsList.appendChild(div);
            plainTextItems.push(lineText);
            total += subTotal;
        });

        if (lastOrder.note) {
            receiptNote.innerText = `หมายเหตุ: ${lastOrder.note}`;
            receiptNote.classList.remove('hidden');
        }

        receiptTotal.innerText = `ยอดชำระสุทธิ: ${total} บาท`;

        // ระบบปุ่มคัดลอกใบเสร็จ
        if (copyReceiptBtn) {
            copyReceiptBtn.addEventListener('click', () => {
                let receiptText = `🧸 Teddy Brew Cafe\n`;
                receiptText += `ออเดอร์: #${lastOrder.orderNo} | คุณ ${lastOrder.customerName}\n`;
                receiptText += `เวลา: ${lastOrder.dateTime}\n`;
                receiptText += `------------------------\n`;
                receiptText += plainTextItems.join('\n') + `\n`;
                if (lastOrder.note) {
                    receiptText += `หมายเหตุ: ${lastOrder.note}\n`;
                }
                receiptText += `------------------------\n`;
                receiptText += `ยอดรวม: ${total} บาท`;

                navigator.clipboard.writeText(receiptText).then(() => {
                    const orig = copyReceiptBtn.innerText;
                    copyReceiptBtn.innerText = '✅ คัดลอกรายการเรียบร้อย!';
                    copyReceiptBtn.classList.add('copied');
                    setTimeout(() => {
                        copyReceiptBtn.innerText = orig;
                        copyReceiptBtn.classList.remove('copied');
                    }, 2000);
                });
            });
        }
    }

    // ระบบจำลองสถานะการทำเครื่องดื่ม (Order Status Tracker)
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const statusMessageText = document.getElementById('statusMessageText');
    const statusEmoji = document.getElementById('statusEmoji');

    if (step2 && step3) {
        // วินาทีที่ 2: เปลี่ยนเป็นกำลังชง
        setTimeout(() => {
            line1.style.width = '100%';
            step2.classList.add('active');
            statusEmoji.innerText = '👨‍🍳☕';
            statusMessageText.innerText = 'บาริสต้ากำลังชงเครื่องดื่มและเตรียมขนมให้คุณ...';
        }, 2000);

        // วินาทีที่ 6: เปลี่ยนเป็นพร้อมเสิร์ฟ
        setTimeout(() => {
            line2.style.width = '100%';
            step3.classList.add('active', 'completed');
            statusEmoji.innerText = '🧸🔔✨';
            statusMessageText.innerText = 'ออเดอร์พร้อมเสิร์ฟแล้ว! มารับที่เคาน์เตอร์ได้เลยครับ';
            statusMessageText.classList.add('status-done');
        }, 6000);
    }
}