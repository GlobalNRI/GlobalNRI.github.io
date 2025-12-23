# Copilot Instructions for GlobalNRI

## Project Overview
**GlobalNRI** is a lightweight, client-side web application providing information for Non-Resident Indians about visa requirements, living expenses, and lifestyle in 35+ countries across 6 continents.

**Stack**: Vanilla HTML/CSS/JavaScript (no build tools, frameworks, or dependencies)
**Architecture**: Single-page static site with data-driven country cards

## Core Architecture & Data Flow

### Data Model (script.js)
- **countryInfo object**: Central data source containing visa, expenses, and lifestyle for ~5 countries (USA, Canada, Germany, Belgium, Australia)
- **Fallback pattern**: Countries without detailed data use a generic template with placeholders
- **Why this approach**: Simplifies adding new countries—just add a key-value pair to the object; no database needed

### UI Components (index.html)
1. **Header**: Branding (gradient background #1d2671 → #c33764)
2. **Navigation**: 3 links (Home, Country Info, About)
3. **Country Selector**: `<select>` dropdown grouped by continent (6 optgroups)
4. **Card Grid** (style.css): Auto-responsive grid (minmax 250px) displaying 4 cards per country:
   - Country name & continent
   - Visa types
   - Living expenses
   - Lifestyle description

### Data Binding (script.js)
- `loadCountry()` fires on dropdown change
- Reads `countryInfo[selected]` or uses fallback
- Renders 4 `.card` elements into `#countryData` container using template literals
- Clear pattern: **data → lookup → render**

## Development Workflows

### Adding a New Country
1. Add entry to `countryInfo` object (script.js, line ~5):
   ```javascript
   france: {
       name: "France",
       continent: "Europe",
       visa: "Long-stay, Student, Work",
       expenses: "Medium – Rent €700–1200",
       lifestyle: "Cultural, elegant, work-life balance"
   }
   ```
2. Dropdown option auto-works (already in select optgroups)
3. Test: Select from dropdown—4 cards render instantly

### Styling Patterns
- **Color scheme**: Header gradient (#1d2671/#c33764), neutral grays (#333, #f4f6f8)
- **Card design**: White bg, 10px radius, shadow (0 5px 15px rgba(0,0,0,0.1))
- **Responsive**: Grid uses `repeat(auto-fit, minmax(250px, 1fr))`—mobile-first, no breakpoints needed
- **No custom fonts**: Uses system font-family "Segoe UI"

### Static Hosting
- No build process or npm scripts
- Drop files directly to server (GitHub Pages, Netlify, etc.)
- CSS/JS loaded via simple `<link>` and `<script>` tags—ensure paths match deployment

## Project-Specific Conventions

### Naming
- **camelCase**: Functions (`loadCountry`), variables (`countryInfo`, `selected`)
- **kebab-case**: CSS classes (`.country-select`, `.card-grid`) — note: currently all lowercase single-word (`.card`, `.section`)
- **id attributes**: `camelCase` (`countrySelect`, `countryData`)

### File Organization
```
index.html      → Structure + form elements
style.css       → All styling (single file, ~80 lines)
script.js       → Data + logic (single file, ~60 lines)
README.md       → Minimal placeholder
```

### Error Handling
- **Graceful degradation**: No data validation needed—fallback handles unknown countries
- **Empty state**: `if (!selected) return;` clears cards if dropdown resets
- **No console errors expected**: Simple data lookups can't fail; template literals are safe

## Integration Points & Future Extensions

### Potential Add-Ons
- **Search/filter**: Add text input to filter countries by name/continent
- **Detailed pages**: Link cards to `/country/{name}.html` for expanded info
- **JSON data file**: Extract `countryInfo` to `data.json` if list grows beyond 50 countries
- **Translations**: Add language selector (fallback to English key names)

### External Dependencies
- **None currently**—intentionally kept simple
- If adding: Consider lightweight CDNs (animate.css for transitions, unpkg for small utilities)
- Avoid npm/build tools unless feature complexity demands it

## Testing & Debugging
- **Manual testing**: Open in browser, test each country dropdown option
- **DevTools**: Inspect Network tab (all local resources) and Console (no errors expected)
- **Edge cases**: Test with countries not in `countryInfo`—should show generic fallback card
- **No unit tests**: Project scale doesn't warrant Jest/Vitest; manual QA sufficient

## Key Files Reference
- [index.html](index.html) — HTML structure & country options
- [script.js](script.js#L1-L10) — `countryInfo` data model  
- [script.js](script.js#L14-L30) — `loadCountry()` rendering logic
- [style.css](style.css) — Responsive grid & color scheme
