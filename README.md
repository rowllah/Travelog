# Rowllah's Travelog ✈︎

My travel history in one place: day-by-day itineraries, real budgets (converted live into any currency), and the hotels, restaurants, activities and local operators I'd recommend. Visitors can use any trip as a starting point in the planner.

**Live site:** https://rowllah.github.io/travelog/

## What's inside

| Page | What it does |
| --- | --- |
| `/` | All trips with filters (region, style, company, length, search) and a timeline |
| `/trips/<id>` | Itinerary, filterable places, budget with live currency conversion, tips, photos, journal posts |
| `/explore` | Every hotel, restaurant, activity, experience and operator across all trips, with filters and price sorting |
| `/plan` | Itinerary builder: start from a trip, keep/reorder/add days, set travellers and style, add extras, then save, share, copy or print |
| `/blog` | Journal posts (Markdown) |
| `/toolkit` | Master packing checklist (saved on your device) and a live currency converter |
| `/add` | Forms that generate a new trip or post and open GitHub with the file prefilled |

Exchange rates come from [open.er-api.com](https://open.er-api.com) (free, no key). Rates are fetched at build time and refreshed in the browser every 6 hours.

## Adding things

**Easiest:** open `/add` on the live site, fill in the form, click **Publish on GitHub**, then **Commit changes**. GitHub Actions rebuilds the site in about a minute.

**By hand:**

- **New trip:** add `src/content/trips/<country-year>.yaml`. Copy an existing trip as a template. The schema is in `src/content.config.ts`.
- **Journal post:** add `src/content/blog/<slug>.md` with front matter `title`, `date`, and optionally `trip: <trip-id>`, `excerpt`, `cover` and `tags`. Use `draft: true` to hide it.
- **Photos:** put them in `public/photos/<trip-id>/` (about 1600 px wide), then reference them in the trip YAML:

  ```yaml
  cover: /photos/andaman-2022/radhanagar.jpg
  photos:
    - { src: /photos/andaman-2022/radhanagar.jpg, caption: Radhanagar at sunset }
  ```

### Trip file cheat sheet

```yaml
title: Japan — Tokyo & Kyoto
country: Japan
flag: 🇯🇵
region: East Asia
startDate: 2027-03-20
endDate: 2027-03-30
company: Friends
travellers: 3
styles: [City, Food, Culture]
localCurrency: JPY
upcoming: true            # shows in "Coming up next"
summary: One-paragraph overview.
budget:
  travellers: 1           # amounts below are for this many people
  items:
    - { label: Flights, category: flights, amount: 55000, currency: INR }
    - { label: Hotels, category: stay, amount: 900, currency: USD, estimate: true }
days:
  - title: Arrive in Tokyo
    base: Tokyo
    stay: Hotel Gracery
    items: ["10:40 Land at Haneda", "Shinjuku walk"]
places:
  - { name: Ichiran, type: food, location: Shibuya, favourite: true }
  - { name: teamLab Planets, type: experience, cost: 3800, currency: JPY, per: person }
```

`type` is one of `stay`, `food`, `activity`, `experience` or `operator`. Budget `category` is one of `flights`, `visa`, `insurance`, `stay`, `food`, `transport`, `activities`, `shopping`, `package` or `other`. In the planner, flights, visa and insurance stay fixed while everything else scales with the number of days.

## Running locally

```bash
npm install
npm run dev      # http://localhost:4321/travelog/
npm run build    # outputs to dist/
```

## Privacy

The original spreadsheets and PDFs live in `source/`, which is git-ignored because they contain PNRs, booking IDs and phone numbers. Only the cleaned-up YAML is published.
