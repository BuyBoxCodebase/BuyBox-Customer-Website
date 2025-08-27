# 🛒 BuyBox

**BuyBox** is a modern, minimalist eCommerce web application built using **Next.js** for the frontend and **NestJS** for the backend. It features a clean UI with **Tailwind CSS** and **ShadCN UI**, Google login handled via the **NestJS backend**, and a robust product system supporting **categories, subcategories, and variants**.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)

### Backend
- **Server:** [NestJS](https://nestjs.com/)
- **Authentication:** Google Login via NestJS (session-based auth)
- **Database:** [MongoDB](https://www.mongodb.com/) (using Mongoose)
- **API:** RESTful APIs consumed by frontend via Axios

---

## ✨ Features

- 🔐 **Google Sign-In** (via custom NestJS session-based flow)
- 🛍️ Dynamic product system with **variants** (e.g., size, color)
- 🗂️ Organized product display by **categories** and **subcategories**
- 💬 Minimal UI powered by utility-first Tailwind styling
- 🔄 Clean and modular Axios-based API integration

---

## 📁 Project Structure (Frontend)

```
/app              → App Router pages
/components       → ShadCN + custom reusable UI components
/lib              → Helpers, Axios setup, API services
/styles           → Tailwind and global styles
```

---

## 🧾 Example Product Features

- 👟 Shoes
  - Sizes: 6, 7, 8, 9
  - Colors: Black, White

- 👕 Clothing
  - Sizes: S, M, L, XL
  - Variants: Fabric type, color

---

## 💡 Future Enhancements

- 💳 Payment integration
- 🧑‍💬 User reviews and ratings

---

## 🖼️ Screenshots

![Screenshot 2025-06-18 231737](https://github.com/user-attachments/assets/093de6d0-76cd-4e9e-9501-13a299e8d840)
![Screenshot 2025-06-18 231538](https://github.com/user-attachments/assets/7e55b6cb-4d61-47d3-8ff7-82790ef72163)
![Screenshot 2025-06-18 231458](https://github.com/user-attachments/assets/36de7c76-0a77-4263-a671-8087a5126986)


---

## 🧑‍💻 Author

Made with ❤️ by [Soumya Raj Sarkar](https://github.com/Snaju003)

---

## 📄 License

MIT License © 2025 BuyBox
