// script.js
// Purpose: Simple client-side data store and renderer for country cards used
// by the country selector UI. Add/extend `countryInfo` for more entries.
const countryInfo = {
    usa: {
        name: "United States",
        continent: "North America",
        visa: "H1B, F1, L1, B1/B2",
        expenses: "High – Rent $1200+, Health insurance mandatory",
        lifestyle: "Fast-paced, professional, multicultural"
    },
    canada: {
        name: "Canada",
        continent: "North America",
        visa: "PR, Work Permit, Student Visa",
        expenses: "Medium – Rent $900+, public healthcare",
        lifestyle: "Balanced life, immigrant-friendly"
    },
    germany: {
        name: "Germany",
        continent: "Europe",
        visa: "Job Seeker, Blue Card, Student Visa",
        expenses: "Medium – Rent €700–1300",
        lifestyle: "Structured, punctual, strong economy"
    },
    belgium: {
        name: "Belgium",
        continent: "Europe",
        visa: "Work Permit, Student, Schengen",
        expenses: "Medium – Rent €800–1400",
        lifestyle: "Peaceful, multilingual society"
    },
    australia: {
        name: "Australia",
        continent: "Oceania",
        visa: "Skilled Migration, Student Visa",
        expenses: "High – Rent AUD 1200+",
        lifestyle: "Outdoor life, work-life balance"
    }
};

/* Default fallback for countries not detailed yet */
function loadCountry() {
    const selected = document.getElementById("countrySelect").value;
    const container = document.getElementById("countryData");
    container.innerHTML = "";

    if (!selected) return;

    const data = countryInfo[selected] || {
        name: selected.toUpperCase(),
        continent: "Global",
        visa: "Work Visa, Student Visa, Tourist Visa",
        expenses: "Depends on city and lifestyle",
        lifestyle: "Varies by country and culture"
    };

    container.innerHTML = `
        <div class="card">
            <h3>${data.name}</h3>
            <p><strong>Continent:</strong> ${data.continent}</p>
        </div>
        <div class="card">
            <h3>Visa Information</h3>
            <p>${data.visa}</p>
        </div>
        <div class="card">
            <h3>Living Expenses</h3>
            <p>${data.expenses}</p>
        </div>
        <div class="card">
            <h3>Lifestyle</h3>
            <p>${data.lifestyle}</p>
        </div>
    `;
}
