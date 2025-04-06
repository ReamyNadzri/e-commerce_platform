

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHJsXSQSvCORpjRZesi-B6BOF0Cf-1m06a5KT-XTYIOlCW3olGIRZI-Rq18AE1R3Pg/exec';

var totalPrice = 0;

document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const buyButton = document.getElementById('buyButton');
    const originalButtonText = buyButton.innerText;
    buyButton.innerText = 'Please wait...';
    buyButton.disabled = true;
    buyButton.style.backgroundColor = 'lightslategray';
    buyButton.style.cursor = 'not-allowed';

    const roomNumber = document.getElementById('roomNumber').value;
    const fileInput = document.getElementById('paymentProof');

    // Function to read the file and get Base64 data
    const getImageData = () => {
        return new Promise((resolve, reject) => {
            const file = fileInput.files[0]; // Get the first selected file
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result); // Base64-encoded data URL
                reader.onerror = (error) => reject(error); // Handle error
                reader.readAsDataURL(file); // Convert file to Data URL
            } else {
                resolve('None'); // Default value if no file is uploaded
            }
        });
    };

try {
    const imageData = await getImageData(); // Wait for image data

    const orderData = {
        name: document.getElementById('customerName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        item: document.getElementById('productName').value,
        quantity: document.getElementById('quantity').value,
        total: totalPrice,
        cook: document.querySelector('input[name="cook"]:checked').value,
        deliveryType: document.querySelector('input[name="delivery"]:checked').value,
        paymentType: document.querySelector('input[name="payment"]:checked').value,
        room: roomNumber.trim() === '' ? 'None' : roomNumber,
        ewallet: imageData, // Base64-encoded payment proof
        action: 'placeOrder',
    };

    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    
    document.getElementById('message').textContent = "Order placed successfully!";
    document.getElementById('orderForm').reset();

    setTimeout(function() {
        // Create and show popup
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.innerHTML = '<div class="popup-content"><h3>Order placed!</h3><p>Your order has been successfully placed. Returning home..</p></div>';
        document.body.appendChild(popup);
 
        createConfetti();

        setTimeout(function() {
          window.location.href = 'index.html';
          
          // Reset button (although the page will redirect)
          buyButton.innerText = originalButtonText;
          buyButton.disabled = false;
        }, 7000);
      }, 500);

} catch (error) {
    document.getElementById('message').textContent = "Error placing order!";

    document.getElementById('orderForm').reset();

    setTimeout(function() {
        
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.innerHTML = '<div class="popup-content"><h3>Error when placing order!</h3><p>Your order could not be placed.<br>This may be caused by the item being out of stock or a domain problem.<br>Please contact the admin. Returning you to home..</p></div>';
        document.body.appendChild(popup);
        
        
        setTimeout(function() {
          window.location.href = 'index.html'; 
          
          // Reset button (although the page will redirect)
          buyButton.innerText = originalButtonText;
          buyButton.disabled = false;
        }, 9000);
      }, 500);
}
});

function createConfetti() {
    const confettiCount = 100;
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      container.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
      container.remove();
    }, 3000);
  }

function calculateTotal() {
    const item = document.getElementById('productPrice').value;
    const quantity = document.getElementById('quantity').value;
    return item * quantity;
}

function changeImage(imageSrc) {
    if (imageSrc === 'back') {
        imageSrc = image
    }
            document.getElementById('productImage').src = imageSrc;
}


    const urlParams = new URLSearchParams(window.location.search);
    const item = urlParams.get('item');
    let price = urlParams.get('price');
    const image = urlParams.get('image');
    const weight = urlParams.get('weight');
    

    document.addEventListener('DOMContentLoaded', () => {
        if (item && price) {
            document.getElementById('main-name').innerHTML = item;
            document.getElementById('productName').value = item;
            document.getElementById('productPrice').value = price;
            document.getElementById('productImage').src = image;
            document.getElementById('weight').innerHTML = weight;
            document.getElementById('smallimage').src = image;
        }
    });

    //quantity 
    const pricePerItem = price;
    

    function updateBuyButton() {
        var quantity = document.getElementById('quantity').value;
        var cookType = document.querySelector('input[name="cook"]:checked').value;
        var deliveryType = document.querySelector('input[name="delivery"]:checked').value;
        message.innerHTML = document.getElementById('phoneNumber').value;
        
        var additionalCost = 0;
        if (cookType === 'cook') {
            additionalCost += 0.5;
        }
        if (deliveryType === 'delivery') {
            additionalCost += 1;
        }

        totalPrice = (parseFloat(pricePerItem) + additionalCost) * quantity;
        var buyButton = document.getElementById('buyButton');
        buyButton.innerHTML = `Beli - RM${totalPrice.toFixed(2)}`;
    }

    function increaseQuantity() {
        var quantity = document.getElementById('quantity');
        quantity.value = parseInt(quantity.value) + 1;
        updateBuyButton();
    }

    function decreaseQuantity() {
        var quantity = document.getElementById('quantity');
        if (quantity.value > 1) {
            quantity.value = parseInt(quantity.value) - 1;
            updateBuyButton();
        }
    }

    // Initialize the button text on page load
    updateBuyButton();

    function toggleRoomNumber() {
            var deliveryType = document.querySelector('input[name="delivery"]:checked').value;
            var roomNumberDiv = document.getElementById('roomNumberDiv');
            if (deliveryType === 'delivery' || deliveryType === 'delivery_sutera') {
                roomNumberDiv.style.display = 'block';
            } else {
                roomNumberDiv.style.display = 'none';
            }
        }
    
        function togglePaymentOptions() {
            const eWalletOptions = document.getElementById('eWalletOptions');
            const paymentProof = document.getElementById('paymentProof');
            if (document.getElementById('paymentEWallet').checked) {
                eWalletOptions.style.display = 'block';
                paymentProof.required = true;
            } else {
                eWalletOptions.style.display = 'none';
                paymentProof.required = false;
            }
        }
        // Initialize on page load
        togglePaymentOptions();
