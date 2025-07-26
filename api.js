// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyAHTXAicYGQ2GxIXFoS0Ws9oitWB4KBtZ0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Call Gemini API to generate trip
async function callGeminiAPI(formData) {
    try {
        const prompt = createTripPrompt(formData);
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 4096,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response structure');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        return parseAIResponse(generatedText, formData);
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Return fallback data if API fails
        return generateFallbackTrip(formData);
    }
}

// Create detailed prompt for trip planning
function createTripPrompt(formData) {
    const { destination, startDate, endDate, travelers, budget, interests, specialRequests } = formData;
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const duration = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    
    let budgetDescription = '';
    switch(budget) {
        case 'budget':
            budgetDescription = 'budget-conscious (around $50-100 per day)';
            break;
        case 'mid-range':
            budgetDescription = 'mid-range (around $100-300 per day)';
            break;
        case 'luxury':
            budgetDescription = 'luxury (around $300+ per day)';
            break;
    }
    
    const interestsText = interests.length > 0 ? interests.join(', ') : 'general sightseeing';
    
    return `Create a detailed ${duration}-day travel itinerary for ${destination} for ${travelers} travelers with a ${budgetDescription} budget.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} days (${startDate} to ${endDate})
- Travelers: ${travelers}
- Budget: ${budgetDescription}
- Interests: ${interestsText}
- Special Requests: ${specialRequests || 'None'}

Please provide a comprehensive travel plan in the following JSON format:

{
  "tripTitle": "Trip to [Destination]",
  "overview": {
    "destination": "${destination}",
    "duration": "${duration} days",
    "travelers": "${travelers}",
    "budget": "${budget}",
    "bestTimeToVisit": "information about weather/season",
    "estimatedCost": "cost breakdown"
  },
  "dailyItinerary": [
    {
      "day": 1,
      "date": "${startDate}",
      "title": "Day title",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "description": "Detailed description",
          "location": "Address/location",
          "duration": "2 hours",
          "cost": "$XX",
          "tips": "Helpful tips"
        }
      ]
    }
  ],
  "recommendations": {
    "restaurants": [
      {
        "name": "Restaurant name",
        "type": "Cuisine type",
        "priceRange": "$$ - $$$",
        "description": "Why it's recommended",
        "location": "Area/address"
      }
    ],
    "attractions": [
      {
        "name": "Attraction name",
        "type": "Type of attraction",
        "description": "What makes it special",
        "bestTime": "Best time to visit",
        "cost": "$XX"
      }
    ],
    "accommodation": [
      {
        "name": "Hotel/accommodation name",
        "type": "Hotel/hostel/apartment",
        "priceRange": "$XX-$XX per night",
        "description": "Why it's recommended",
        "location": "Area"
      }
    ],
    "localTips": [
      "Practical tip 1",
      "Practical tip 2",
      "Cultural insight 1"
    ]
  },
  "budgetBreakdown": {
    "accommodation": "$XXX",
    "food": "$XXX",
    "transportation": "$XXX",
    "activities": "$XXX",
    "shopping": "$XXX",
    "total": "$XXX"
  }
}

Make sure to:
1. Include specific activities that match the traveler's interests (${interestsText})
2. Consider the budget level when recommending restaurants, hotels, and activities
3. Provide realistic timing and costs
4. Include practical tips and local insights
5. Make the itinerary engaging and well-paced
6. Suggest the best times to visit attractions to avoid crowds
7. Include transportation recommendations between activities
8. Consider the season and weather for the travel dates

Return only the JSON format without any additional text or formatting.`;
}

// Parse AI response and structure data
function parseAIResponse(aiResponse, originalFormData) {
    try {
        // Clean the response to extract JSON
        let jsonText = aiResponse.trim();
        
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Find JSON content between curly braces
        const jsonStart = jsonText.indexOf('{');
        const jsonEnd = jsonText.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonText = jsonText.substring(jsonStart, jsonEnd);
        }
        
        const parsedData = JSON.parse(jsonText);
        
        // Validate and enhance the parsed data
        return validateAndEnhanceData(parsedData, originalFormData);
        
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.log('Raw AI response:', aiResponse);
        
        // Return fallback data if parsing fails
        return generateFallbackTrip(originalFormData);
    }
}

// Validate and enhance parsed data
function validateAndEnhanceData(data, originalFormData) {
    // Ensure required fields exist
    if (!data.tripTitle) {
        data.tripTitle = `Amazing Trip to ${originalFormData.destination}`;
    }
    
    if (!data.overview) {
        data.overview = createDefaultOverview(originalFormData);
    }
    
    if (!data.dailyItinerary || !Array.isArray(data.dailyItinerary)) {
        data.dailyItinerary = createDefaultItinerary(originalFormData);
    }
    
    if (!data.recommendations) {
        data.recommendations = createDefaultRecommendations(originalFormData);
    }
    
    if (!data.budgetBreakdown) {
        data.budgetBreakdown = createDefaultBudget(originalFormData);
    }
    
    return data;
}

// Create default overview
function createDefaultOverview(formData) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
        destination: formData.destination,
        duration: `${duration} days`,
        travelers: formData.travelers,
        budget: formData.budget,
        bestTimeToVisit: "Great time to visit with pleasant weather",
        estimatedCost: getBudgetEstimate(formData.budget, duration)
    };
}

// Create default itinerary
function createDefaultItinerary(formData) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const itinerary = [];
    
    for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        itinerary.push({
            day: i + 1,
            date: currentDate.toISOString().split('T')[0],
            title: i === 0 ? "Arrival & City Introduction" : 
                   i === duration - 1 ? "Final Exploration & Departure" : 
                   `Discover ${formData.destination}`,
            activities: createDefaultActivities(formData, i + 1)
        });
    }
    
    return itinerary;
}

// Create default activities for a day
function createDefaultActivities(formData, dayNumber) {
    const baseActivities = [
        {
            time: "09:00 AM",
            activity: "Morning Exploration",
            description: `Start your day exploring the highlights of ${formData.destination}`,
            location: "City Center",
            duration: "2-3 hours",
            cost: "$25-50",
            tips: "Start early to avoid crowds"
        },
        {
            time: "12:30 PM",
            activity: "Local Lunch",
            description: "Experience authentic local cuisine",
            location: "Recommended restaurant",
            duration: "1 hour",
            cost: "$15-30",
            tips: "Ask locals for their favorite spots"
        },
        {
            time: "02:00 PM",
            activity: "Cultural Experience",
            description: "Immerse yourself in local culture and history",
            location: "Cultural district",
            duration: "2-3 hours",
            cost: "$20-40",
            tips: "Consider guided tours for deeper insights"
        },
        {
            time: "06:00 PM",
            activity: "Evening Relaxation",
            description: "Unwind and enjoy the local atmosphere",
            location: "Popular area",
            duration: "2 hours",
            cost: "$30-60",
            tips: "Great time for photos during golden hour"
        }
    ];
    
    return baseActivities;
}

// Create default recommendations
function createDefaultRecommendations(formData) {
    return {
        restaurants: [
            {
                name: "Local Favorite Restaurant",
                type: "Traditional Cuisine",
                priceRange: getBudgetRange(formData.budget),
                description: "Highly recommended by locals for authentic flavors",
                location: "City Center"
            },
            {
                name: "Trendy Cafe",
                type: "International/Fusion",
                priceRange: getBudgetRange(formData.budget),
                description: "Perfect for breakfast or light meals",
                location: "Tourist Area"
            }
        ],
        attractions: [
            {
                name: "Main Attraction",
                type: "Historical/Cultural",
                description: `Must-see landmark in ${formData.destination}`,
                bestTime: "Early morning or late afternoon",
                cost: "$15-25"
            },
            {
                name: "Local Experience",
                type: "Cultural Activity",
                description: "Unique experience that showcases local culture",
                bestTime: "Depends on schedule",
                cost: "$20-40"
            }
        ],
        accommodation: [
            {
                name: "Recommended Hotel",
                type: getAccommodationType(formData.budget),
                priceRange: getAccommodationPrice(formData.budget),
                description: "Well-located with good amenities",
                location: "Central Area"
            }
        ],
        localTips: [
            "Learn a few basic phrases in the local language",
            "Carry cash as some places may not accept cards",
            "Respect local customs and dress codes",
            "Try street food from busy vendors",
            "Keep important documents in a safe place"
        ]
    };
}

// Create default budget breakdown
function createDefaultBudget(formData) {
    const duration = calculateDuration(formData.startDate, formData.endDate);
    const dailyBudget = getBudgetAmount(formData.budget);
    
    const accommodation = Math.floor(dailyBudget * 0.4 * duration);
    const food = Math.floor(dailyBudget * 0.3 * duration);
    const transportation = Math.floor(dailyBudget * 0.15 * duration);
    const activities = Math.floor(dailyBudget * 0.1 * duration);
    const shopping = Math.floor(dailyBudget * 0.05 * duration);
    
    return {
        accommodation: `$${accommodation}`,
        food: `$${food}`,
        transportation: `$${transportation}`,
        activities: `$${activities}`,
        shopping: `$${shopping}`,
        total: `$${accommodation + food + transportation + activities + shopping}`
    };
}

// Generate complete fallback trip if AI fails
function generateFallbackTrip(formData) {
    return {
        tripTitle: `Amazing Journey to ${formData.destination}`,
        overview: createDefaultOverview(formData),
        dailyItinerary: createDefaultItinerary(formData),
        recommendations: createDefaultRecommendations(formData),
        budgetBreakdown: createDefaultBudget(formData)
    };
}

// Utility functions
function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getBudgetAmount(budget) {
    switch(budget) {
        case 'budget': return 75;
        case 'mid-range': return 200;
        case 'luxury': return 400;
        default: return 150;
    }
}

function getBudgetEstimate(budget, duration) {
    const dailyAmount = getBudgetAmount(budget);
    const total = dailyAmount * duration;
    return `$${total} (approximately $${dailyAmount} per day)`;
}

function getBudgetRange(budget) {
    switch(budget) {
        case 'budget': return '$ - $$';
        case 'mid-range': return '$$ - $$$';
        case 'luxury': return '$$$ - $$$$';
        default: return '$$ - $$$';
    }
}

function getAccommodationType(budget) {
    switch(budget) {
        case 'budget': return 'Hostel/Budget Hotel';
        case 'mid-range': return '3-4 Star Hotel';
        case 'luxury': return '5 Star Hotel/Resort';
        default: return 'Mid-range Hotel';
    }
}

function getAccommodationPrice(budget) {
    switch(budget) {
        case 'budget': return '$25-60 per night';
        case 'mid-range': return '$80-200 per night';
        case 'luxury': return '$250+ per night';
        default: return '$80-150 per night';
    }
}

// Export for use in other files
window.callGeminiAPI = callGeminiAPI;