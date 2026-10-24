# 🛒 KD SUPERMARKET — Premium Grocery E-Commerce Platform

A complete, modern, mobile-responsive full-stack grocery supermarket e-commerce web platform built for **KD SUPERMARKET**, located at **STATE BANK MORE, Watson High School, Tirhut Colony, Madhubani, Bihar 847211**.

---

## 🌟 Key Features

### 1. Brand Identity & Design System
* **Deep Forest Green** (`#176B45`), **Fresh Green** (`#35A853`), **Warm Yellow** (`#FFC857`), and **Soft Ivory** (`#FAFCF7`).
* Custom SVG Grocery Basket & Leaf emblem logo.
* Clean typography using **Inter** and **Poppins**.
* Consistent aspect ratios, smooth hover effects, skeleton loaders, and interactive toast notifications.
* Sticky navigation bar on desktop and dedicated fixed bottom navigation on mobile.

### 2. Header & Search
* Real-time search with live autocomplete suggestions dropdown.
* Delivery locality selector for Madhubani neighbourhoods (Tirhut Colony, State Bank More, Babu Saheb Colony, Suratganj, etc.).
* Live cart count badge and subtotal indicator.
* Wishlist toggle and instant WhatsApp store chat link.

### 3. All 20 Core Grocery Categories
1. Rice, Atta & Grains (with authentic Madhubani Katarni Chawal)
2. Dal & Pulses (Tata Sampann unpolished dals, Chana, Rajma)
3. Cooking Oil & Ghee (Fortune Kachi Ghani Mustard Oil, Amul Desi Ghee)
4. Spices & Masalas (Everest Garam Masala, MDH Deggi Mirch, Catch Haldi)
5. Salt, Sugar & Sweeteners (Tata Salt, Sulphurless Sugar)
6. Biscuits & Cookies (Britannia Good Day, Parle-G Gold, Dark Fantasy)
7. Chips, Namkeen & Snacks (Haldiram's Bhujia, Lay's)
8. Chocolates & Candies (Dairy Milk Silk, KitKat)
9. Tea, Coffee & Drinks (Tata Tea Premium, Nescafe Classic)
10. Dairy & Packaged Foods (Amul Butter, Fresh Paneer)
11. Breakfast & Cereals (Kellogg's Corn Flakes)
12. Instant Noodles & Pasta (Maggi 2-Minute Noodles)
13. Packaged Water & Juices (Real Mixed Fruit Juice)
14. Personal Care (Colgate Strong Teeth)
15. Soaps, Shampoo & Hygiene (Dettol Soap, Dove Shampoo)
16. Home Cleaning Products (Lizol Disinfectant)
17. Detergents & Dishwashing (Surf Excel Easy Wash, Vim Bar)
18. Kitchen & Household Essentials (Scotch-Brite Pads)
19. Baby Care Essentials (Pampers Diaper Pants)
20. Other General Store Products (Mangaldeep Bhimseni Kapoor, Cycle Agarbathi)

### 4. Interactive Shopping Cart & Checkout
* Quantity adjustment steppers, pack size selectors (500g, 1kg, 5kg).
* Server-side subtotal and discount calculations.
* Free delivery goal progress bar (Free above ₹499 in Madhubani town).
* **Share Cart on WhatsApp**: 1-click formatted grocery summary sent to store WhatsApp (+91 98113 40853).
* Payment options: **UPI** (Interactive QR & ID verification), **Cards & Netbanking** (Razorpay Test Mode integration), **Cash on Delivery (COD)**, and **WhatsApp Assisted Booking**.

### 5. Live Order Tracking System
* Dedicated `/track-order` page supporting lookup by Order ID (e.g., `KD-847211-1021`).
* 6-Stage progress timeline:
  1. Order Placed
  2. Order Confirmed
  3. Preparing Your Order
  4. Ready for Dispatch
  5. Out for Delivery
  6. Delivered (or Cancelled)
* Real-time polling & persistent backend updates.

### 6. Admin Dashboard (`/admin`)
* Protected store admin login.
* Overview statistics: Total orders, today's revenue, pending orders, preparing orders, delivered orders, and low-stock alerts.
* **Order Management**: Search, filter, 1-click status update, delivery notes.
* **Product Management**: Add new products, update prices/MRP, toggle in-stock status, adjust inventory counts.
* **Store Settings**: Configure delivery charges, free delivery threshold, and announcement banner.

---

## 🚀 Running on Localhost

The server is currently running live on:
**[http://localhost:3000](http://localhost:3000)**

### Quick Start Commands
```bash
# Navigate to the project directory
cd C:\Users\admin\.gemini\antigravity\scratch\kd-supermarket

# Start the development server (with full backend API middleware)
npm run dev
```

### Seed Data
The database is initialized in `server/data/store.json`. To re-seed fresh demo data at any time:
```bash
node server/data/seed.js
```

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `admin@kdsupermarket.com` | `kdadmin123` | Full access to `/admin` dashboard, order status changes, product catalogue CRUD, stock adjustment |
| **Customer Demo** | `customer@example.com` | `password123` | Browsing, cart persistence, placing orders, order history, saved addresses |

---

## 📍 Business Details Configured
* **Name:** KD SUPERMARKET
* **Address:** STATE BANK MORE, Watson High School, Tirhut Colony, Madhubani, Bihar 847211
* **WhatsApp / Phone:** +91 98113 40853 (formatted: `919811340853`)
* **Google Rating:** 4.8 / 5 from 31 verified reviews
