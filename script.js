// Global variables
let currentStep = 1;
let formData = {};
let selectedBudget = '';
let selectedInterests = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupFormHandlers();
    setupAnimations();
    setMinDate();
}

// Navigation setup
function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Form handlers setup
function setupFormHandlers() {
    const tripForm = document.getElementById('tripForm');
    if (!tripForm) return;
    
    // Next step buttons
    const nextButtons = document.querySelectorAll('.next-step');
    nextButtons.forEach(button => {
        button.addEventListener('click', handleNextStep);
    });
    
    // Previous step buttons
    const prevButtons = document.querySelectorAll('.prev-step');
    prevButtons.forEach(button => {
        button.addEventListener('click', handlePrevStep);
    });
    
    // Budget selection
    const budgetCards = document.querySelectorAll('.budget-card');
    budgetCards.forEach(card => {
        card.addEventListener('click', function() {
            budgetCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedBudget = this.dataset.budget;
        });
    });
    
    // Interest selection
    const interestCards = document.querySelectorAll('.interest-card');
    interestCards.forEach(card => {
        card.addEventListener('click', function() {
            const interest = this.dataset.interest;
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                selectedInterests = selectedInterests.filter(i => i !== interest);
            } else {
                this.classList.add('selected');
                selectedInterests.push(interest);
            }
        });
    });
    
    // Form submission
    tripForm.addEventListener('submit', handleFormSubmit);
    
    // Destination suggestions
    const destinationInput = document.getElementById('destination');
    if (destinationInput) {
        setupDestinationSuggestions(destinationInput);
    }
}

// Set minimum date for date inputs
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate) startDate.min = today;
    if (endDate) endDate.min = today;
    
    // Update end date minimum when start date changes
    if (startDate && endDate) {
        startDate.addEventListener('change', function() {
            endDate.min = this.value;
            if (endDate.value && endDate.value < this.value) {
                endDate.value = this.value;
            }
        });
    }
}

// Handle next step
function handleNextStep() {
    if (validateCurrentStep()) {
        currentStep++;
        updateFormStep();
        updateProgressBar();
    }
}

// Handle previous step
function handlePrevStep() {
    currentStep--;
    updateFormStep();
    updateProgressBar();
}

// Validate current step
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });
    
    // Special validation for step 2 (budget)
    if (currentStep === 2 && !selectedBudget) {
        showNotification('Please select a budget range', 'error');
        return false;
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

// Update form step display
function updateFormStep() {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
    
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
}

// Update progress bar
function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    if (progressFill) {
        const progress = (currentStep / 3) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    progressSteps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    // Collect form data
    collectFormData();
    
    // Show loading modal
    showLoadingModal();
    
    // Generate trip using AI
    try {
        await generateTrip();
    } catch (error) {
        console.error('Error generating trip:', error);
        hideLoadingModal();
        showNotification('Failed to generate trip. Please try again.', 'error');
    }
}

// Collect form data
function collectFormData() {
    formData = {
        destination: document.getElementById('destination').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        travelers: document.getElementById('travelers').value,
        budget: selectedBudget,
        interests: selectedInterests,
        specialRequests: document.getElementById('specialRequests').value
    };
    
    // Store in localStorage for results page
    localStorage.setItem('tripData', JSON.stringify(formData));
}

// Generate trip using AI
async function generateTrip() {
    const loadingTexts = [
        'Analyzing destinations...',
        'Finding the best activities...',
        'Optimizing your itinerary...',
        'Adding local recommendations...',
        'Finalizing your perfect trip...'
    ];
    
    let textIndex = 0;
    const loadingTextElement = document.getElementById('loadingText');
    
    // Update loading text every 2 seconds
    const loadingInterval = setInterval(() => {
        if (loadingTextElement && textIndex < loadingTexts.length) {
            loadingTextElement.textContent = loadingTexts[textIndex];
            textIndex++;
        }
    }, 2000);
    
    try {
        // Call AI API (this will be implemented in api.js)
        const tripData = await callGeminiAPI(formData);
        
        // Store the generated trip data
        localStorage.setItem('generatedTrip', JSON.stringify(tripData));
        
        // Clear loading interval
        clearInterval(loadingInterval);
        
        // Redirect to results page
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 1000);
        
    } catch (error) {
        clearInterval(loadingInterval);
        throw error;
    }
}

// Show loading modal
function showLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide loading modal
function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Setup destination suggestions
function setupDestinationSuggestions(input) {
    const suggestionsContainer = document.getElementById('destinationSuggestions');
    
    const popularDestinations = [
        'Paris, France',
        'Tokyo, Japan',
        'New York, USA',
        'London, UK',
        'Rome, Italy',
        'Barcelona, Spain',
        'Amsterdam, Netherlands',
        'Istanbul, Turkey',
        'Bangkok, Thailand',
        'Dubai, UAE',
        'Sydney, Australia',
        'Los Angeles, USA',
        'Berlin, Germany',
        'Prague, Czech Republic',
        'Vienna, Austria'
    ];
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        
        if (value.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        const filtered = popularDestinations.filter(dest => 
            dest.toLowerCase().includes(value)
        );
        
        if (filtered.length > 0) {
            suggestionsContainer.innerHTML = '';
            filtered.slice(0, 5).forEach(dest => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = dest;
                div.addEventListener('click', () => {
                    input.value = dest;
                    suggestionsContainer.style.display = 'none';
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// Setup animations
function setupAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.feature-card, .step, .team-member, .value-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#fee2e2' : '#dbeafe'};
        color: ${type === 'error' ? '#dc2626' : '#1d4ed8'};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for internal links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    // Adjust mobile navigation if needed
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Export functions for use in other files
window.TravelAI = {
    showNotification,
    scrollToFeatures,
    showLoadingModal,
    hideLoadingModal
};