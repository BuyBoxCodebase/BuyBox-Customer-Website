# 🛒 Treides

**Making online shopping in Zimbabwe less intimidating.**

Treides is a technology-driven, multi-vendor eCommerce marketplace designed to simplify how people discover, understand, compare and purchase products online.

Built with a modern web architecture, Treides connects customers with independent sellers through a unified shopping experience. Instead of navigating multiple stores, searching through fragmented catalogues and manually comparing products, customers can discover products across the marketplace in one place.

Treides is also developing an AI-powered shopping experience through **Lino**, its intelligent shopping assistant, which helps customers express what they need and discover relevant products based on their intent.

Our goal is to make online shopping more accessible, convenient and trustworthy while giving independent sellers the infrastructure to participate in digital commerce.

---

## 🚀 Technology Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI
- **HTTP Client:** Axios
- **Rendering:** Server-side and client-side rendering where appropriate
- **Hosting:** Vercel

### Backend
- **Framework:** NestJS
- **Runtime:** Node.js
- **Language:** TypeScript
- **Architecture:** Modular, service-oriented backend
- **API:** RESTful APIs
- **ORM:** Prisma
- **Database:** MongoDB
- **Validation:** Zod
- **Authentication:** Backend-managed authentication, including Google sign-in
- **Hosting:** Vercel, with dedicated background processing infrastructure being introduced

### AI & Intelligent Systems
- **AI Provider:** OpenAI API
- **Primary Model:** GPT-4o-mini
- **AI Assistant:** Lino
- **Intent Extraction:** Structured intent recognition
- **Product Discovery:** Intent-based catalogue search
- **Validation:** Zod
- **Machine Learning:** Separate Python-based infrastructure for future advanced personalization and recommendation capabilities

### Background Processing & Infrastructure
- **Job Queue:** BullMQ
- **Queue Storage:** Redis
- **Worker Infrastructure:** Dedicated worker deployment planned outside Vercel serverless functions
- **Event Processing:** Event-driven product availability and notification workflows

---

## ✨ Core Platform Capabilities

### 1. Multi-Vendor Marketplace

Treides brings independent sellers into one unified marketplace.

- Centralized product discovery across multiple sellers.
- Independent seller product listings and inventory.
- Unified product catalogue.
- Seller-specific pricing and availability.
- Product categorization and subcategorization.
- Marketplace-wide product discovery.
- Product variants, including size and colour.
- Inventory and stock management.

### 2. Product Discovery & Search

The marketplace is designed to help customers find products without navigating complicated search filters.

- Product search and filtering.
- Category-based discovery.
- Brand-based discovery.
- Variant-aware product matching.
- Price-based filtering.
- Product availability checks.
- Relevance-based product ranking.

### 3. Lino — AI Shopping Assistant

Lino is Treides' intelligent shopping assistant, designed to understand customer intent rather than simply match search keywords.

Traditional shopping:

`Search → Filters → Browse → Compare → Choose`

Treides' vision:

`Intent → Understanding → Personalization → Recommendation → Buy`

Customers can express what they want naturally, including:
- Product preferences.
- Brands and colours.
- Occasions and intended use.
- Sizes and variants.
- Budget constraints.
- Delivery preferences.

Lino processes shopping intent, translates it into structured information and uses controlled backend search capabilities to discover relevant products.

Lino is designed to become the conversational interface through which customers interact with the Treides marketplace.

### 4. Product Watch & Availability Notifications

Treides is developing a marketplace-wide product availability notification system.

Customers can request notifications when a product becomes available, even if the original seller does not have stock.

The system is designed to:
- Allow customers to watch products and specific variants.
- Monitor availability across different sellers.
- Match products using canonical product and variant information.
- Notify customers when matching inventory becomes available.
- Support notification preferences and cancellation.
- Integrate conversational product watching through Lino.
- Use background processing for reliable notification delivery.

### 5. Seller Infrastructure

Treides aims to make selling online easier for independent businesses.

The marketplace provides infrastructure for:
- Product listing and management.
- Inventory updates.
- Variant management.
- Order management.
- Seller-specific product availability.
- Marketplace participation.
- Payment and delivery workflows.

The objective is to reduce the operational complexity of selling online.

### 6. Order & Delivery Management

Treides is building an integrated order and delivery experience.

Key capabilities include:
- Customer order management.
- Seller order workflows.
- Delivery and pickup options.
- Delivery status tracking.
- Order notifications.
- Customer and seller communication.
- Returns and post-purchase workflows.

### 7. Customer Experience & Marketplace Trust

Treides is designed to create a more dependable shopping environment.

The platform focuses on:
- Structured customer and seller interactions.
- Order lifecycle visibility.
- Product and inventory accuracy.
- Transaction monitoring.
- Customer notifications.
- Seller accountability.
- Improved post-purchase experiences.

---

## 🧠 Lino Architecture

Lino is designed as an AI orchestration layer within the NestJS backend.

Its architecture separates AI reasoning from direct access to critical marketplace systems.

Core architectural components:

- **Brain:** Interprets customer intent and determines the appropriate action.
- **Context:** Provides relevant shopping and conversational context.
- **Tools:** Controlled access to marketplace functionality.
- **Search:** Retrieves relevant products from the catalogue.
- **Ranking:** Prioritizes products based on customer intent and relevance.
- **Response:** Converts results into natural conversational responses.

Lino operates through controlled backend capabilities rather than having unrestricted direct access to the database, payments or other sensitive systems.

---

## 🏗️ System Architecture

```text
                 TREIDES PLATFORM
                        |
          +-------------+-------------+
          |                           |
      FRONTEND                    BACKEND
      Next.js                     NestJS
          |                           |
          |                     RESTful APIs
          |                           |
          |               +-----------+-----------+
          |               |           |           |
          |             Auth       Marketplace    Lino
          |                           |           |
          |                       Products      OpenAI
          |                       Sellers       Intent
          |                       Orders        Search
          |                       Inventory     Ranking
          |                           |
          |                       Prisma ORM
          |                           |
          |                        MongoDB
          |
          +--------------------------------

                BACKGROUND PROCESSING
                         |
                       Redis
                         |
                       BullMQ
                         |
                 Dedicated Workers
                         |
              Notifications & Events
```

---

## 📁 Project Structure

### Frontend

```text
/app
/components
/lib
/styles
```

- `/app` — Next.js App Router pages and layouts.
- `/components` — Reusable UI components and interfaces.
- `/lib` — Utilities, Axios configuration and API services.
- `/styles` — Global styling and Tailwind configuration.

### Backend

```text
/src
  /auth
  /users
  /products
  /categories
  /sellers
  /orders
  /inventory
  /lino
  /notifications
  /common
  /prisma
```

*Module names represent the platform's architectural domains; exact module organization may differ across implementation stages.*

---

## 🔮 Development Roadmap

Treides is continuously evolving.

Areas of ongoing development and expansion include:

- Intelligent product recommendations and personalization.
- Conversational shopping through Lino.
- Marketplace-wide product watch and automated notifications.
- Background job processing and event-driven infrastructure.
- Payment gateway infrastructure and automated checkout.
- Seller onboarding and operational tools.
- Improved order and delivery tracking.
- Marketplace trust and transaction monitoring.
- Advanced analytics and marketplace intelligence.
- Infrastructure scalability and performance optimization.


## 🎯 Our Mission

Building a safe and reliable online shopping experience for Zimbabwe

Treides exists to make discovering, understanding and purchasing products online easier for everyone.

We believe independent sellers should have access to the technology and infrastructure needed to participate in digital commerce without having to build everything themselves.

**Treides is building the infrastructure for a simpler way to shop and sell online.**



## 📄 License

MIT License © 2026 Treides

