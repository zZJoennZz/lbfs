---
# 🏗️ LBfs

LBfs is a file sharing app developed using Django for the REST API, NextJS for the frontend UI, and MySQL as the database. This app offers ease of sharing files while keeping them organized with folders.
---

## 📁 Repository Structure

```
├── backend/          # Django project
│   ├── backend/      # project settings, URLs, ASGI/WSGI, middleware
│   ├── files/        # app for file uploads / management
│   ├── users/        # app handling user models and auth
|   └── media/        # uploaded files
├── frontend/         # Next.js (TypeScript) application
│   ├── app/           # app routes (pages) and layouts
│   ├── components/    # reusable UI pieces
│   ├── context/       # React contexts (auth, toast)
│   ├── lib/           # API client, utilities
│   └── package.json      # JS dependencies
└──  requirements.txt  # Python dependencies
```

---

## 📎 Features

- **User management** with custom serializers, views & JWT/session support
- **File upload & organization** (see `files` app)
- **TypeScript‑strict React frontend** using Next.js App Router
- Context providers for auth and toast notifications
- Middleware & error boundaries for robustness

---

## 🛠️ Development Tips

- Django settings in settings.py
- Next.js routing: create new pages inside app
- Reusable UI components under components
- API helper (`fetch` wrapper) in api.ts
- Customize ESLint/TS config via top‑level files

---

## ✅ Testing

- Django tests live in each app (`files/tests.py`, `users/tests.py`)
- Run with:

  ```bash
  python manage.py test
  ```

- Frontend tests not included but can be added via Jest/React Testing Library.

---

## 📦 Deployment

- Backend: standard Django deployment (WSGI/ASGI). Configure `MEDIA_ROOT`/`STATIC_ROOT`.
- Frontend: build with `npm run build` and host on Vercel, Netlify, or a Node server.
- Ensure CORS and environment variables (API URL, secret keys) are set appropriately.

---

## 📄 License

MIT

---

> **Note:** this README assumes a local dev environment; adjust settings and commands for production use.
