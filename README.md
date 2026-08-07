# Aurie admin

Standalone React admin console for `aurie-api`. Separate app, separate build,
separate token — it does not import from `aurie-storefront` and nothing needs to
change in the storefront for this to work.

```
aurie-storefront/   customers        :5173
aurie-admin/        you              :5174   <- this
aurie-api/          shared backend   :4000
```

## Run it

```bash
cd aurie-admin
npm install
cp .env.example .env
npm run dev          # http://localhost:5174
```

Vite proxies `/api` to `http://localhost:4000`, so the browser sees same-origin
requests and you will not hit CORS in development. Change `VITE_PROXY_TARGET` in
`.env` if your API runs elsewhere.

**No backend running?** Set `VITE_MOCK=1` and every screen works on generated
data. Useful for demos and for building UI before an endpoint exists.

**No admin account yet?** Run `createAdmin.js` in `aurie-api` first.

## Screens

**Dashboard** — 14-day revenue, average order value, count waiting on you, COD
share, best sellers, and a queue of orders that need action. Orders open in the
same drawer used on the Orders page, so you can advance status without leaving.

**Orders** — filter by status, search by order number, customer name, email or
phone. The drawer walks status forward one step at a time rather than offering a
dropdown, and refuses to mark anything shipped without a courier and tracking
number, because the customer's tracking page displays both.

**Products** — edit names, per-size prices, scent, burn time and photos; hide a
product from the storefront without deleting it; upload images; delete with a
confirmation that explains past orders are unaffected.

## Wiring it to your API

**`src/api/endpoints.js` is the only file you should need to touch.** Every URL,
request body and response shape assumption lives there. If your `routes/admin.js`
differs, edit that file and the rest of the app follows.

What it currently assumes:

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/admin/login` | `{ email, password }` | `{ token, admin }` |
| GET | `/admin/me` | | `{ admin }` |
| GET | `/admin/orders` | | `{ orders: [...] }` |
| PATCH | `/admin/orders/:id` | `{ status, courier, trackingNumber }` | `{ order }` |
| GET | `/admin/products` | | `{ products: [...] }` |
| POST | `/admin/products` | product fields | `{ product }` |
| PATCH | `/admin/products/:id` | product fields | `{ product }` |
| DELETE | `/admin/products/:id` | | |
| POST | `/admin/products/:id/image` | multipart, field `image` | `{ url }` |
| GET | `/admin/stats` | | `{ stats }` — **optional** |

Three things it already handles without you changing anything:

- **Mongo `_id`.** Every read runs through a normaliser that maps `_id` to `id`,
  so components only ever use `.id`.
- **Response wrapping.** `res.json(order)`, `res.json({ order })` and
  `res.json({ data: order })` all work.
- **Missing stats route.** If `GET /admin/stats` is absent or returns an
  unfamiliar shape, the dashboard computes the same numbers from the orders list
  and shows a small note saying so. Build that route later, or never.

If your multer setup is `upload.single('file')` rather than `'image'`, change
`IMAGE_FIELD` in `endpoints.js`.

## Things worth checking on the API side

**The role check has to be server-side.** The login gate in `App.jsx` is
convenience — it stops you seeing a broken dashboard, nothing more. Anyone can
bypass it in devtools. `requireAdmin.js` on every `/admin/*` route is the actual
security boundary, and a customer JWT hitting one should get a 403.

**Status values must match.** `STATUS_FLOW` in `src/api/endpoints.js` is
`placed → confirmed → shipped → out_for_delivery → delivered`. The same array
exists in the storefront's `src/api/orders.js` and should match your Mongoose
enum. If the three drift, the customer timeline and the admin controls disagree
about what state an order is in.

**Product ids.** The storefront seeds from `products.js` with string ids like
`laddoo`. If Mongoose is generating ObjectIds instead, the normaliser handles
display fine, but make sure `seed.js` is consistent about which one it writes.

**CORS in production.** The dev proxy hides this. When you deploy, either serve
the admin build from the same origin as the API, or add its origin to the API's
`cors()` allowlist. The `Authorization` header must be in `allowedHeaders`.

## Design

Shares the storefront's tokens — same palette, same Fraunces and Instrument Sans
pairing — so the two feel like one product. It diverges where the job differs: a
dark sidebar instead of marketing chrome, denser rows, `ember` reserved for
things that need action rather than decoration. If you change a colour in
`tailwind.config.js`, change it in both apps.
