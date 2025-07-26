// Results page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeResultsPage();
});

function initializeResultsPage() {
    loadTripData();
    setupTabs();
    setupRating();
    setupResultsActions();
}

// Load and display trip data
function loadTripData() {
    const tripData = JSON.parse(localStorage.getItem('generatedTrip') || '{}');
    const formData = JSON.parse(localStorage.getItem('tripData') || '{}');
    
    if (Object.keys(tripData).length === 0) {
        // Redirect back to planner if no data
        window.location.href = 'planner.html';
        return;
    }
    
    displayTripOverview(tripData, formData);
    displayItinerary(tripData);
    displayRecommendations(tripData);
    displayBudget(tripData);
}

// Display trip overview
function displayTripOverview(tripData, formData) {
    const tripTitle = document.getElementById('tripTitle');
    const tripSubtitle = document.getElementById('tripSubtitle');
    const tripOverview = document.getElementById('tripOverview');
    
    if (tripTitle) {
        tripTitle.textContent = tripData.tripTitle || `Trip to ${formData.destination}`;
    }
    
    if (tripSubtitle) {
        const startDate = new Date(formData.startDate).toLocaleDateString();
        const endDate = new Date(formData.endDate).toLocaleDateString();
        tripSubtitle.textContent = `${startDate} - ${endDate} • ${formData.travelers} travelers`;
    }
    
    if (tripOverview && tripData.overview) {
        tripOverview.innerHTML = `
            <div class="overview-item">
                <i class="fas fa-map-marker-alt"></i>
                <strong>Destination</strong>
                <span>${tripData.overview.destination}</span>
            </div>
            <div class="overview-item">
                <i class="fas fa-calendar"></i>
                <strong>Duration</strong>
                <span>${tripData.overview.duration}</span>
            </div>
            <div class="overview-item">
                <i class="fas fa-users"></i>
                <strong>Travelers</strong>
                <span>${tripData.overview.travelers}</span>
            </div>
            <div class="overview-item">
                <i class="fas fa-wallet"></i>
                <strong>Budget</strong>
                <span>${capitalizeFirst(tripData.overview.budget)}</span>
            </div>
            <div class="overview-item">
                <i class="fas fa-sun"></i>
                <strong>Best Time</strong>
                <span>${tripData.overview.bestTimeToVisit}</span>
            </div>
            <div class="overview-item">
                <i class="fas fa-dollar-sign"></i>
                <strong>Estimated Cost</strong>
                <span>${tripData.overview.estimatedCost}</span>
            </div>
        `;
    }
}

// Display daily itinerary
function displayItinerary(tripData) {
    const itineraryTimeline = document.getElementById('itineraryTimeline');
    
    if (!itineraryTimeline || !tripData.dailyItinerary) return;
    
    itineraryTimeline.innerHTML = '';
    
    tripData.dailyItinerary.forEach((day, index) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'itinerary-day';
        dayElement.style.animationDelay = `${index * 0.1}s`;
        
        const dayDate = new Date(day.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let activitiesHTML = '';
        if (day.activities && day.activities.length > 0) {
            activitiesHTML = day.activities.map(activity => `
                <div class="activity">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-details">
                        <h4>${activity.activity}</h4>
                        <p>${activity.description}</p>
                        <div class="activity-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>
                            <span><i class="fas fa-clock"></i> ${activity.duration}</span>
                            <span><i class="fas fa-dollar-sign"></i> ${activity.cost}</span>
                        </div>
                        ${activity.tips ? `<div class="activity-tips"><i class="fas fa-lightbulb"></i> ${activity.tips}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        dayElement.innerHTML = `
            <div class="day-header">
                <div class="day-number">${day.day}</div>
                <div class="day-info">
                    <h3>${day.title}</h3>
                    <p>${dayDate}</p>
                </div>
            </div>
            <div class="day-activities">
                ${activitiesHTML}
            </div>
        `;
        
        itineraryTimeline.appendChild(dayElement);
    });
}

// Display recommendations
function displayRecommendations(tripData) {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    
    if (!recommendationsGrid || !tripData.recommendations) return;
    
    const { restaurants, attractions, accommodation, localTips } = tripData.recommendations;
    
    recommendationsGrid.innerHTML = `
        <div class="recommendation-section">
            <h3><i class="fas fa-utensils"></i> Restaurants</h3>
            <div class="recommendation-cards">
                ${restaurants ? restaurants.map(restaurant => `
                    <div class="recommendation-card">
                        <h4>${restaurant.name}</h4>
                        <p class="card-type">${restaurant.type} • ${restaurant.priceRange}</p>
                        <p>${restaurant.description}</p>
                        <span class="card-location"><i class="fas fa-map-marker-alt"></i> ${restaurant.location}</span>
                    </div>
                `).join('') : '<p>No restaurant recommendations available.</p>'}
            </div>
        </div>
        
        <div class="recommendation-section">
            <h3><i class="fas fa-star"></i> Attractions</h3>
            <div class="recommendation-cards">
                ${attractions ? attractions.map(attraction => `
                    <div class="recommendation-card">
                        <h4>${attraction.name}</h4>
                        <p class="card-type">${attraction.type}</p>
                        <p>${attraction.description}</p>
                        <div class="card-meta">
                            <span><i class="fas fa-clock"></i> ${attraction.bestTime}</span>
                            <span><i class="fas fa-dollar-sign"></i> ${attraction.cost}</span>
                        </div>
                    </div>
                `).join('') : '<p>No attraction recommendations available.</p>'}
            </div>
        </div>
        
        <div class="recommendation-section">
            <h3><i class="fas fa-bed"></i> Accommodation</h3>
            <div class="recommendation-cards">
                ${accommodation ? accommodation.map(hotel => `
                    <div class="recommendation-card">
                        <h4>${hotel.name}</h4>
                        <p class="card-type">${hotel.type} • ${hotel.priceRange}</p>
                        <p>${hotel.description}</p>
                        <span class="card-location"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</span>
                    </div>
                `).join('') : '<p>No accommodation recommendations available.</p>'}
            </div>
        </div>
        
        <div class="recommendation-section">
            <h3><i class="fas fa-lightbulb"></i> Local Tips</h3>
            <div class="tips-list">
                ${localTips ? localTips.map(tip => `
                    <div class="tip-item">
                        <i class="fas fa-check-circle"></i>
                        <span>${tip}</span>
                    </div>
                `).join('') : '<p>No local tips available.</p>'}
            </div>
        </div>
    `;
}

// Display budget breakdown
function displayBudget(tripData) {
    const budgetBreakdown = document.getElementById('budgetBreakdown');
    
    if (!budgetBreakdown || !tripData.budgetBreakdown) return;
    
    const budget = tripData.budgetBreakdown;
    
    budgetBreakdown.innerHTML = `
        <div class="budget-chart">
            <h3>Budget Breakdown</h3>
            <div class="budget-items">
                <div class="budget-item">
                    <div class="budget-label">
                        <i class="fas fa-bed"></i>
                        <span>Accommodation</span>
                    </div>
                    <div class="budget-amount">${budget.accommodation}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">
                        <i class="fas fa-utensils"></i>
                        <span>Food & Dining</span>
                    </div>
                    <div class="budget-amount">${budget.food}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">
                        <i class="fas fa-car"></i>
                        <span>Transportation</span>
                    </div>
                    <div class="budget-amount">${budget.transportation}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">
                        <i class="fas fa-camera"></i>
                        <span>Activities</span>
                    </div>
                    <div class="budget-amount">${budget.activities}</div>
                </div>
                <div class="budget-item">
                    <div class="budget-label">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Shopping</span>
                    </div>
                    <div class="budget-amount">${budget.shopping}</div>
                </div>
            </div>
            <div class="budget-total">
                <div class="budget-label">
                    <strong>Total Estimated Cost</strong>
                </div>
                <div class="budget-amount total">
                    <strong>${budget.total}</strong>
                </div>
            </div>
        </div>
        
        <div class="budget-tips">
            <h4>Money-Saving Tips</h4>
            <ul>
                <li>Book accommodations in advance for better rates</li>
                <li>Use public transportation when possible</li>
                <li>Look for free walking tours and attractions</li>
                <li>Eat where locals eat for authentic and affordable meals</li>
                <li>Consider travel insurance to protect your investment</li>
            </ul>
        </div>
    `;
}

// Setup tab functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Setup rating functionality
function setupRating() {
    const ratingStars = document.querySelectorAll('.rating-stars i');
    let currentRating = 0;
    
    ratingStars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
        
        star.addEventListener('click', () => {
            currentRating = index + 1;
            highlightStars(currentRating);
            
            // Store rating
            localStorage.setItem('tripRating', currentRating);
            
            // Show thank you message
            setTimeout(() => {
                if (window.TravelAI && window.TravelAI.showNotification) {
                    window.TravelAI.showNotification('Thank you for your feedback!', 'success');
                }
            }, 300);
        });
    });
    
    // Reset on mouse leave
    document.querySelector('.rating-stars').addEventListener('mouseleave', () => {
        highlightStars(currentRating);
    });
    
    function highlightStars(count) {
        ratingStars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
}

// Setup results page actions
function setupResultsActions() {
    // Print functionality is handled by the global function
    // Share functionality is handled by the global function
}

// Print itinerary
function printItinerary() {
    const printWindow = window.open('', '_blank');
    const tripData = JSON.parse(localStorage.getItem('generatedTrip') || '{}');
    const formData = JSON.parse(localStorage.getItem('tripData') || '{}');
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Trip Itinerary - ${tripData.tripTitle}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
                .overview { margin-bottom: 30px; }
                .day { margin-bottom: 25px; break-inside: avoid; }
                .day h3 { color: #1e40af; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .activity { margin: 15px 0; padding: 10px; background: #f8f9fa; border-left: 3px solid #1e40af; }
                .activity-time { font-weight: bold; color: #1e40af; }
                .budget { margin-top: 30px; }
                .budget-item { display: flex; justify-content: space-between; padding: 5px 0; }
                .total { font-weight: bold; border-top: 2px solid #ddd; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${tripData.tripTitle}</h1>
                <p>Generated by TravelAI</p>
            </div>
            ${generatePrintContent(tripData)}
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Generate print content
function generatePrintContent(tripData) {
    let content = '';
    
    // Overview
    if (tripData.overview) {
        content += `
            <div class="overview">
                <h2>Trip Overview</h2>
                <p><strong>Destination:</strong> ${tripData.overview.destination}</p>
                <p><strong>Duration:</strong> ${tripData.overview.duration}</p>
                <p><strong>Budget:</strong> ${capitalizeFirst(tripData.overview.budget)}</p>
                <p><strong>Estimated Cost:</strong> ${tripData.overview.estimatedCost}</p>
            </div>
        `;
    }
    
    // Itinerary
    if (tripData.dailyItinerary) {
        content += '<h2>Daily Itinerary</h2>';
        tripData.dailyItinerary.forEach(day => {
            const dayDate = new Date(day.date).toLocaleDateString();
            content += `
                <div class="day">
                    <h3>Day ${day.day}: ${day.title} (${dayDate})</h3>
                    ${day.activities ? day.activities.map(activity => `
                        <div class="activity">
                            <div class="activity-time">${activity.time}</div>
                            <strong>${activity.activity}</strong>
                            <p>${activity.description}</p>
                            <p><em>Location: ${activity.location} | Duration: ${activity.duration} | Cost: ${activity.cost}</em></p>
                        </div>
                    `).join('') : ''}
                </div>
            `;
        });
    }
    
    // Budget
    if (tripData.budgetBreakdown) {
        content += `
            <div class="budget">
                <h2>Budget Breakdown</h2>
                <div class="budget-item">
                    <span>Accommodation:</span>
                    <span>${tripData.budgetBreakdown.accommodation}</span>
                </div>
                <div class="budget-item">
                    <span>Food & Dining:</span>
                    <span>${tripData.budgetBreakdown.food}</span>
                </div>
                <div class="budget-item">
                    <span>Transportation:</span>
                    <span>${tripData.budgetBreakdown.transportation}</span>
                </div>
                <div class="budget-item">
                    <span>Activities:</span>
                    <span>${tripData.budgetBreakdown.activities}</span>
                </div>
                <div class="budget-item">
                    <span>Shopping:</span>
                    <span>${tripData.budgetBreakdown.shopping}</span>
                </div>
                <div class="budget-item total">
                    <span><strong>Total:</strong></span>
                    <span><strong>${tripData.budgetBreakdown.total}</strong></span>
                </div>
            </div>
        `;
    }
    
    return content;
}

// Share itinerary
function shareItinerary() {
    const tripData = JSON.parse(localStorage.getItem('generatedTrip') || '{}');
    const formData = JSON.parse(localStorage.getItem('tripData') || '{}');
    
    const shareText = `Check out my ${tripData.tripTitle || 'travel itinerary'} created with TravelAI! 
    
Destination: ${formData.destination}
Duration: ${calculateDuration(formData.startDate, formData.endDate)} days
Budget: ${capitalizeFirst(formData.budget)}

Generated at: ${window.location.origin}`;
    
    if (navigator.share) {
        navigator.share({
            title: tripData.tripTitle || 'My Travel Itinerary',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
            if (window.TravelAI && window.TravelAI.showNotification) {
                window.TravelAI.showNotification('Itinerary details copied to clipboard!', 'success');
            }
        }).catch(() => {
            // Final fallback - show modal with share text
            showShareModal(shareText);
        });
    }
}

// Show share modal (fallback)
function showShareModal(text) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Share Your Itinerary</h3>
            <textarea readonly style="width: 100%; height: 200px; margin: 20px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">${text}</textarea>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${text.replace(/'/g, "\\'")}'); this.closest('.modal').remove(); if(window.TravelAI) window.TravelAI.showNotification('Copied to clipboard!', 'success');">Copy Text</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// Make functions available globally
window.printItinerary = printItinerary;
window.shareItinerary = shareItinerary;

// Add additional CSS for results page
const additionalCSS = `
    .recommendation-section {
        margin-bottom: 3rem;
    }
    
    .recommendation-section h3 {
        color: #1f2937;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .recommendation-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .recommendation-card {
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        transition: transform 0.3s ease;
    }
    
    .recommendation-card:hover {
        transform: translateY(-3px);
    }
    
    .recommendation-card h4 {
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    
    .card-type {
        color: #3b82f6;
        font-weight: 500;
        margin-bottom: 0.75rem;
    }
    
    .card-location,
    .card-meta {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #6b7280;
    }
    
    .card-meta span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .tips-list {
        display: grid;
        gap: 1rem;
    }
    
    .tip-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .tip-item i {
        color: #10b981;
        margin-top: 0.25rem;
        flex-shrink: 0;
    }
    
    .budget-chart {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
    }
    
    .budget-items {
        margin: 1.5rem 0;
    }
    
    .budget-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .budget-item:last-child {
        border-bottom: none;
    }
    
    .budget-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #374151;
    }
    
    .budget-amount {
        font-weight: 600;
        color: #1f2937;
    }
    
    .budget-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-top: 2px solid #e5e7eb;
        margin-top: 1rem;
    }
    
    .budget-total .budget-amount {
        font-size: 1.25rem;
        color: #1e40af;
    }
    
    .budget-tips {
        background: #f8fafc;
        padding: 2rem;
        border-radius: 15px;
        border: 1px solid #e5e7eb;
    }
    
    .budget-tips h4 {
        color: #1f2937;
        margin-bottom: 1rem;
    }
    
    .budget-tips ul {
        list-style: none;
        padding: 0;
    }
    
    .budget-tips li {
        padding: 0.5rem 0;
        position: relative;
        padding-left: 1.5rem;
    }
    
    .budget-tips li::before {
        content: '•';
        color: #3b82f6;
        font-weight: bold;
        position: absolute;
        left: 0;
    }
    
    .activity-meta {
        display: flex;
        gap: 1rem;
        margin: 0.5rem 0;
        font-size: 0.9rem;
        color: #6b7280;
        flex-wrap: wrap;
    }
    
    .activity-meta span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .activity-tips {
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: #eff6ff;
        border-radius: 8px;
        font-size: 0.9rem;
        color: #1e40af;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .activity-tips i {
        margin-top: 0.1rem;
        flex-shrink: 0;
    }
`;

// Add the CSS to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);