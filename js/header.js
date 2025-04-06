const texts = ["AF Shopping", "One Stop Center", "Shop Now"];
        const brandText = document.getElementById('brand-text');
        let textIndex = 0;
        let charIndex = 0;

        function typeText() {
            if (charIndex < texts[textIndex].length) {
                brandText.textContent += texts[textIndex].charAt(charIndex);
                charIndex++;
                setTimeout(typeText, 150);
            } else {
                setTimeout(eraseText, 2000);
            }
        }

        function eraseText() {
            if (brandText.textContent.length > 0) {
                brandText.textContent = brandText.textContent.slice(0, -1);
                setTimeout(eraseText, 50);
            } else {
                textIndex = (textIndex + 1) % texts.length;
                charIndex = 0;
                setTimeout(typeText, 500);
            }
        }

        typeText();