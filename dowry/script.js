// Array of funny reaction images (to be added by user)
const funnyImages = [
    'images/funny1.jpg',
    'images/funny2.jpg',
    'images/funny3.jpg',
    'images/funny4.jpg',
    'images/funny5.jpg',
    // More images can be added here
    'images/placeholder.svg' // Fallback placeholder
];

// Funny messages to go with the images
const funnyMessages = [
    "Wait, someone's actually calculating this? 😂",
    "The audacity! Your worth can't be measured in rupees! 💎",
    "Breaking news: Human value crashes the calculator! 🤖",
    "Error 404: Self-worth not found in dowry system! 🚫",
    "Plot twist: You're priceless! 💖",
    "Calculator says: 'This is ridiculous!' 🙄",
    "Your value > Any amount of money 📈",
    "Fun fact: The dowry system is expired! ⚠️"
];

// DOM Elements
const form = document.getElementById('dowryForm');
const resultSection = document.getElementById('result');
const dowryAmountSpan = document.getElementById('dowryAmount');
const popup = document.getElementById('popup');
const funnyImageElement = document.getElementById('funnyImage');
const closeBtn = document.querySelector('.close-btn');
const closePopupBtn = document.getElementById('closePopup');

// Form submission handler
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const formData = new FormData(form);
    const values = {
        salary: parseInt(formData.get('salary')) || 0,
        education: parseInt(formData.get('education')) || 0,
        looks: parseInt(formData.get('looks')) || 0,
        family: parseInt(formData.get('family')) || 0,
        skills: parseInt(formData.get('skills')) || 0,
        location: parseInt(formData.get('location')) || 0
    };
    
    // Validate that all fields are filled
    if (Object.values(values).some(val => val === 0)) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Calculate the "dowry" (this is satirical!)
    calculateDowry(values);
});

function calculateDowry(values) {
    // Add loading animation to button
    const submitBtn = document.querySelector('.calculate-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Calculating... <div class="loading"></div>';
    submitBtn.disabled = true;
    
    // Simulate calculation delay for dramatic effect
    setTimeout(() => {
        // Complex satirical calculation formula
        let baseAmount = values.salary * 0.5; // Base on salary
        let multiplier = 1;
        
        // Add "value" based on other factors (satirical)
        multiplier += (values.education / 100);
        multiplier += (values.looks / 100);
        multiplier += (values.family / 100);
        multiplier += (values.skills / 100);
        multiplier += (values.location / 100);
        
        // Add some randomness to make it more ridiculous
        const randomFactor = Math.random() * 0.5 + 0.75; // Between 0.75 and 1.25
        multiplier *= randomFactor;
        
        let calculatedAmount = Math.round(baseAmount * multiplier);
        
        // Ensure it's not too crazy
        calculatedAmount = Math.max(10000, Math.min(calculatedAmount, 5000000));
        
        // Display result
        displayResult(calculatedAmount);
        
        // Show popup after a short delay
        setTimeout(() => {
            showFunnyPopup();
        }, 1500);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    }, 2000);
}

function displayResult(amount) {
    // Format amount in Indian currency format
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
    
    dowryAmountSpan.textContent = formattedAmount;
    resultSection.style.display = 'block';
    
    // Smooth scroll to result
    resultSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function showFunnyPopup() {
    // Get random funny image and message
    const randomImageIndex = Math.floor(Math.random() * funnyImages.length);
    const randomMessageIndex = Math.floor(Math.random() * funnyMessages.length);
    
    // Set image source
    funnyImageElement.src = funnyImages[randomImageIndex];
    
    // Handle image load error (fallback to placeholder)
    funnyImageElement.onerror = function() {
        this.src = 'images/placeholder.svg';
        // If placeholder also fails, hide image
        this.onerror = function() {
            this.style.display = 'none';
        };
    };
    
    // Update message
    const messageElement = document.querySelector('.popup-body p');
    messageElement.textContent = funnyMessages[randomMessageIndex];
    
    // Show popup
    popup.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hidePopup() {
    popup.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Event listeners for closing popup
closeBtn.addEventListener('click', hidePopup);
closePopupBtn.addEventListener('click', hidePopup);

// Close popup when clicking outside
popup.addEventListener('click', function(e) {
    if (e.target === popup) {
        hidePopup();
    }
});

// Close popup with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup.classList.contains('show')) {
        hidePopup();
    }
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to form groups
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const select = group.querySelector('select');
        
        select.addEventListener('change', function() {
            if (this.value) {
                group.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    group.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // Add some fun easter eggs
    let clickCount = 0;
    const title = document.querySelector('h1');
    
    title.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5) {
            alert('🎉 You found the easter egg! Remember: You are valuable beyond measure! 💎');
            clickCount = 0;
        }
    });
    
    // Animate elements on load
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.5s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
});

// Fun facts that appear randomly
const funFacts = [
    "Fun Fact: The dowry system has been illegal in India since 1961! 📚",
    "Did you know? Your worth isn't determined by your wallet! 💡",
    "True story: The best relationships are built on love and respect! ❤️",
    "Reality check: You're awesome just the way you are! 🌟",
    "Breaking: Studies show that happiness can't be bought! 📊"
];

// Show random fun fact occasionally
setInterval(() => {
    if (!popup.classList.contains('show') && Math.random() < 0.1) { // 10% chance every 30 seconds
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 999;
            animation: slideInRight 0.5s ease;
            max-width: 300px;
            font-size: 0.9em;
            cursor: pointer;
        `;
        
        notification.textContent = randomFact;
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
        
        // Remove on click
        notification.addEventListener('click', () => {
            document.body.removeChild(notification);
        });
    }
}, 30000); // Check every 30 seconds

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
