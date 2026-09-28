# Zepto Storefront

A small React storefront that displays products from FakeStore API. The cart supports quantity changes and is saved in the browser.

## Run the frontend

```bash
cd Frontend
npm install
npm run dev
```

## Frontend notes

- Products and categories are loaded with `fetch` and cached with TanStack Query. FakeStore API is the primary source; DummyJSON is used if FakeStore is unavailable.
- React Context manages the cart, and `localStorage` keeps it after a page reload.
- Category tabs and the search box filter the products.
- FakeStore API prices are shown in USD.

## Optional backend

The `Backend` folder is a separate Express and MongoDB authentication API. It has registration and login routes at `/api/auth/register` and `/api/auth/login`. The storefront does not currently depend on the backend, so it can be run or deployed separately. You can connect the frontend to these routes later if you want accounts and sign-in.

To start the backend separately:

```bash
cd Backend
npm install
npm run dev
```

The backend needs `MONGO_URI`, `JWT_SECRET`, and optionally `PORT` in its own `.env` file. Do not commit `.env` or share its secret values.