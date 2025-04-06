const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHJsXSQSvCORpjRZesi-B6BOF0Cf-1m06a5KT-XTYIOlCW3olGIRZI-Rq18AE1R3Pg/exec';
        const PASSWORD = '110119';
        const ITEMS_PER_PAGE = 10; // Number of items to show per page

        // Pagination variables
        let ordersData = [];
        let inventoryData = [];
        let currentOrdersPage = 1;
        let currentInventoryPage = 1;

        // Tab functionality
        function openTab(evt, tabName) {
            // Hide all tab content
            const tabContents = document.getElementsByClassName("tab-content");
            for (let i = 0; i < tabContents.length; i++) {
                tabContents[i].style.display = "none";
            }

            // Remove active class from all tab buttons
            const tabButtons = document.getElementsByClassName("tab-button");
            for (let i = 0; i < tabButtons.length; i++) {
                tabButtons[i].className = tabButtons[i].className.replace(" active", "");
            }

            // Show the current tab and add active class to the button
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";

            // Refresh content when switching tabs
            if (tabName === "ordersTab") {
                fetchOrders();
            } else if (tabName === "inventoryTab") {
                fetchInventory();
            }
        }

        // Load data on page load
        window.onload = () => {
            fetchOrders();
            fetchInventory();
        };

        function formatDate(timestamp) {
            if (!timestamp) return 'N/A';

            // Check if timestamp is already a Date object
            const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${day}-${month}-${year} (${hours}:${minutes})`;
        }

        function renderOrdersPagination() {
            const totalPages = Math.ceil((ordersData.length - 1) / ITEMS_PER_PAGE);
            const startIndex = (currentOrdersPage - 1) * ITEMS_PER_PAGE + 1;
            const endIndex = Math.min(currentOrdersPage * ITEMS_PER_PAGE, ordersData.length - 1);

            // Update page info
            document.getElementById('ordersPageInfo').textContent =
                `Showing ${startIndex} to ${endIndex} of ${ordersData.length - 1} entries`;

            // Enable/disable pagination buttons
            document.getElementById('ordersPrevBtn').disabled = currentOrdersPage === 1;
            document.getElementById('ordersNextBtn').disabled = currentOrdersPage === totalPages;

            // Render current page of orders
            const tbody = document.getElementById('ordersBody');
            const pageData = ordersData.slice(startIndex, endIndex + 1);

            tbody.innerHTML = pageData.map((row, index) => {
                let statusClass = 'status-new';
                if (row[11] === 'Processing') {
                    statusClass = 'status-processing';
                } else if (row[11] === 'Completed') {
                    statusClass = 'status-completed';
                } else if (row[11] === 'Canceled') {
                    statusClass = 'status-canceled';
                }

                // Format payment proof
                let proofContent = 'N/A';
                if (row[10] && row[10] !== 'No image' && row[10] !== 'Image upload failed') {
                    proofContent = `<a class="proof-link" onclick="showProof('${row[10]}', '${row[12] || 'No verification details'}')">View Proof</a>`;
                } else {
                    proofContent = row[10] || 'N/A';
                }

                return `
                <tr>
                    <td>${formatDate(row[0])}</td>
                    <td class="text-nowrap">${row[1] || 'N/A'}</td>
                    <td>${row[2] || 'N/A'}</td>
                    <td>${row[3] || 'N/A'}</td>
                    <td class="text-center">${row[4] || 'N/A'}</td>
                    <td>${row[5] ? 'RM' + parseFloat(row[5]).toFixed(2) : 'N/A'}</td>
                    <td>${row[6] || 'N/A'}</td>
                    <td>${row[7] || 'N/A'}</td>
                    <td>${row[8] || 'N/A'}</td>
                    <td>${row[9] || 'N/A'}</td>
                    <td>${proofContent}</td>
                    <td class="text-nowrap text-center"><span class="status-badge ${statusClass}">${row[11] || 'N/A'}</span></td>
                    <td class="align-middle">
                        <div class="d-flex gap-2 justify-content-center align-items-center flex-wrap">
                            ${row[11] !== 'Processing' ? `<button class="action-btn btn-processing" onclick="pendingOrder(${startIndex + index}, '${row[2] || ''}', '${row[1] || ''}', '${row[3] || ''}')"><i class="bi bi-clock"></i></button>` : ''}
                            ${row[11] !== 'Completed' ? `<button class="action-btn btn-completed" onclick="completeOrder(${startIndex + index}, '${row[2] || ''}', '${row[1] || ''}', '${row[3] || ''}')"><i class="bi bi-check2-all"></i></button>` : ''}
                            ${row[11] !== 'Canceled' ? `<button class="action-btn btn-canceled" onclick="cancelOrder(${startIndex + index}, '${row[2] || ''}', '${row[1] || ''}', '${row[3] || ''}')"><i class="bi bi-x"></i></button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        }

        function renderInventoryPagination() {
            const totalPages = Math.ceil((inventoryData.length - 1) / ITEMS_PER_PAGE);
            const startIndex = (currentInventoryPage - 1) * ITEMS_PER_PAGE + 1;
            const endIndex = Math.min(currentInventoryPage * ITEMS_PER_PAGE, inventoryData.length - 1);

            // Update page info
            document.getElementById('inventoryPageInfo').textContent =
                `Showing ${startIndex} to ${endIndex} of ${inventoryData.length - 1} entries`;

            // Enable/disable pagination buttons
            document.getElementById('inventoryPrevBtn').disabled = currentInventoryPage === 1;
            document.getElementById('inventoryNextBtn').disabled = currentInventoryPage === totalPages;

            // Render current page of inventory
            const tbody = document.getElementById('inventoryBody');
            const pageData = inventoryData.slice(startIndex, endIndex + 1);

            tbody.innerHTML = pageData.map(row => `
                <tr>
                    <td>${row[0] || 'N/A'}</td>
                    <td>${row[1] ? 'RM' + row[1] : 'N/A'}</td>
                    <td>
                        <input type="number" class="form-control" value="${row[2] || 0}" id="qty-${row[0]}">
                    </td>
                    <td>
                        <button class="update-btn" onclick="updateStock('${row[0]}')">
                            <i class="bi bi-check-lg"></i> Update
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function changePage(type, direction) {
            if (type === 'orders') {
                currentOrdersPage += direction;
                renderOrdersPagination();
            } else if (type === 'inventory') {
                currentInventoryPage += direction;
                renderInventoryPagination();
            }
        }

        async function fetchOrders() {
            showLoader('Fetching orders...');
            try {
                const url = `${SCRIPT_URL}?type=orders&password=${PASSWORD}`;
                const response = await fetch(url);
                ordersData = await response.json();

                // Reset page to 1 when fetching new data
                currentOrdersPage = 1;
                renderOrdersPagination();

                // Force UI update before hiding loader
                await new Promise(resolve => requestAnimationFrame(resolve));

                // Update the orders count badge based on the number of rows
                const orderCount = ordersData.length - 1; // Subtracting header row
                document.getElementById('ordersBadge').textContent = orderCount;

                showAlert('orderAlert');
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                hideLoader();
            }
        }

        async function fetchInventory() {
            showLoader('Fetching inventory...');
            try {
                const url = `${SCRIPT_URL}?type=items&password=${PASSWORD}`;
                const response = await fetch(url);
                inventoryData = await response.json();

                // Reset page to 1 when fetching new data
                currentInventoryPage = 1;
                renderInventoryPagination();

                // Force UI update before hiding loader
                await new Promise(resolve => requestAnimationFrame(resolve));

                showAlert('inventoryAlert');
            } catch (error) {
                console.error('Error fetching inventory:', error);
            } finally {
                hideLoader();
            }
        }

        async function updateStock(itemName) {
            showLoader('Updating stock...');
            try {
                const newQty = document.getElementById(`qty-${itemName}`).value;

                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateInventory',
                        item: itemName,
                        newQuantity: newQty,
                        password: PASSWORD
                    })
                });

                if (response.ok) {
                    showAlert('inventoryAlert');
                    fetchInventory();
                }
            } catch (error) {
                console.error('Error updating stock:', error);
            } finally {
                hideLoader();
            }
        }

        async function updateOrderStatus(rowIndex, newStatus) {
            showLoader('Updating order status...');
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateOrderStatus',
                        rowIndex: rowIndex,
                        newStatus: newStatus,
                        password: PASSWORD
                    })
                });
                if (response.ok) {
                    // Wait for both network and DOM updates
                    await Promise.all([
                        response.json(),
                        new Promise(resolve => {
                            fetchOrders().then(resolve);
                            requestAnimationFrame(resolve);
                        })
                    ]);
                    showAlert('orderAlert');
                }
            } catch (error) {
                console.error('Error updating order status:', error);
            } finally {
                hideLoader();
            }
        }

        function showAlert(alertId) {
            const alert = document.getElementById(alertId);
            alert.style.display = 'block';

            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        }

        // Modal functions for payment proof
        function showProof(imageUrl, verificationText) {
            const modal = document.getElementById('proofModal');
            const img = document.getElementById('proofImage');
            const text = document.getElementById('proofText');

            // Reset modal content
            img.style.display = 'none';
            img.src = '';
            text.textContent = verificationText || 'No verification details available';

            if (!imageUrl || imageUrl === 'No image' || imageUrl === 'Image upload failed') {
                modal.style.display = 'block';
                return;
            }

            // Handle Google Drive links differently
            if (imageUrl.includes('drive.google.com')) {
                const fileIdMatch = imageUrl.match(/[-\w]{25,}/);

                if (fileIdMatch) {
                    const fileId = fileIdMatch[0];
                    // Use Google Drive's embeddable viewer
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
                    iframe.style.width = '100%';
                    iframe.style.height = '500px';
                    iframe.style.border = 'none';

                    // Clear previous content and add iframe
                    const proofContent = document.getElementById('proofContent');
                    proofContent.innerHTML = '';
                    proofContent.appendChild(iframe);

                    // Add direct link as fallback
                    const directLink = document.createElement('a');
                    directLink.href = imageUrl;
                    directLink.target = '_blank';
                    directLink.textContent = 'Open in Google Drive';
                    directLink.style.display = 'block';
                    directLink.style.marginTop = '10px';
                    proofContent.appendChild(directLink);

                    modal.style.display = 'block';
                    return;
                }
            }

            // Regular image handling for non-Google Drive URLs
            if (imageUrl.startsWith('http')) {
                img.src = imageUrl;
                img.style.display = 'block';
                img.onerror = () => {
                    img.style.display = 'none';
                    text.innerHTML = `Unable to load image. <a href="${imageUrl}" target="_blank">Click here to view directly</a><br>${verificationText || ''}`;
                };
            }

            modal.style.display = 'block';
        }


        function closeModal() {
            document.getElementById('proofModal').style.display = 'none';
            window.location.replace("admin.html");
        }

        // Close modal when clicking outside the content
        window.onclick = function (event) {
            const modal = document.getElementById('proofModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }

        //whatsapp on complete action
        async function completeOrder(rowIndex, phoneNumber, customerName, orderDetails) {
            showLoader('Completing order...');
            try {
                // First update the order status to "Completed"
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateOrderStatus',
                        rowIndex: rowIndex,
                        newStatus: 'Completed',
                        password: PASSWORD
                    })
                });

                if (response.ok) {
                    showAlert('orderAlert');
                    fetchOrders();

                    // Send WhatsApp message if phone number exists
                    if (phoneNumber) {
                        const cleanNumber = formatPhoneNumber(phoneNumber);
                        if (cleanNumber) {
                            const presetMessage = `Hi ${customerName || 'there'}! Your order has been completed:\n\n` +
                                `Order Details: ${orderDetails || 'N/A'}\n\n` +
                                `Thank you for your purchase!`;

                            const encodedMessage = encodeURIComponent(presetMessage);
                            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
                            window.open(whatsappUrl, '_blank');
                        }
                    }
                }
            } catch (error) {
                console.error('Error completing order:', error);
            } finally {
                hideLoader();
            }
        }
        //whatsapp on cancel action
        async function cancelOrder(rowIndex, phoneNumber, customerName, orderDetails) {
            showLoader('Canceling order...');
            try {
                // First update the order status to "Completed"
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateOrderStatus',
                        rowIndex: rowIndex,
                        newStatus: 'Canceled',
                        password: PASSWORD
                    })
                });

                if (response.ok) {
                    showAlert('orderAlert');
                    fetchOrders();

                    // Send WhatsApp message if phone number exists
                    if (phoneNumber) {
                        const cleanNumber = formatPhoneNumber(phoneNumber);
                        if (cleanNumber) {
                            const presetMessage = `Sorry ${customerName || 'there'}! Your order has been canceled due to: insertreasonhere.\n\n` +
                                `Order Details: ${orderDetails || 'N/A'}\n\n` +
                                `We sincerely apologize for this inconvenience.\nYou may reclaim a full refund automatically via the phone number linked to DuitNow or by sending a QR Code!\n\nIf you have any questions, please message us here.`;

                            const encodedMessage = encodeURIComponent(presetMessage);
                            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
                            window.open(whatsappUrl, '_blank');
                        }
                    }
                }
            } catch (error) {
                console.error('Error completing order:', error);
            } finally {
                hideLoader();
            }
        }

        //whatsapp on cancel action
        async function pendingOrder(rowIndex, phoneNumber, customerName, orderDetails) {
            showLoader('Waiting to Pickup...');
            try {
                // First update the order status to "Completed"
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'updateOrderStatus',
                        rowIndex: rowIndex,
                        newStatus: 'Pending',
                        password: PASSWORD
                    })
                });

                if (response.ok) {
                    showAlert('orderAlert');
                    fetchOrders();

                    // Send WhatsApp message if phone number exists
                    if (phoneNumber) {
                        const cleanNumber = formatPhoneNumber(phoneNumber);
                        if (cleanNumber) {
                            const presetMessage = `Hi ${customerName || 'there'}! Your order is ready for pickup:\n\n` +
                                `Order Details: ${orderDetails || 'N/A'}\n\n` +
                                `You can collect it at Room KASA204 or in front of the Kolej Office if you are a SUTERA student.\n\n` +
                                `Thank you for your purchase! If you have any questions, please message us here.`;

                            const encodedMessage = encodeURIComponent(presetMessage);
                            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
                            window.open(whatsappUrl, '_blank');
                        }
                    }
                }
            } catch (error) {
                console.error('Error completing order:', error);
            } finally {
                hideLoader();
            }
        }

        // Helper function to format phone numbers (Malaysia specific)
        function formatPhoneNumber(phoneNumber) {
            if (!phoneNumber) return null;

            // Remove all non-digit characters
            let cleanNumber = phoneNumber.replace(/\D/g, '');

            // Malaysia number formatting
            if (cleanNumber.startsWith('0')) {
                cleanNumber = '60' + cleanNumber.substring(1);
            } else if (!cleanNumber.startsWith('60')) {
                cleanNumber = '60' + cleanNumber;
            }

            // Validate the number (Malaysian numbers are typically 10-11 digits with country code)
            if (cleanNumber.length >= 10 && cleanNumber.length <= 12) {
                return cleanNumber;
            }

            return null;
        }

        // Loader functions
        function showLoader(text = 'Loading...') {
            const loader = document.getElementById('loader');
            const loaderText = document.getElementById('loaderText');

            // Force reflow to ensure loader is visible before operations start
            void loader.offsetHeight;

            loaderText.textContent = text;
            loader.style.display = 'flex';
        }

        function hideLoader() {
            const loader = document.getElementById('loader');
            // Add slight delay to ensure UI updates are complete
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }