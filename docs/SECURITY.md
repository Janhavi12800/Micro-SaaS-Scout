# Security Notes

## API keys

AI provider keys, Supabase service role keys, Clerk secret keys, and Stripe secret keys must stay on the backend.

## Extension CSP

The extension manifest uses a strict MV3 content security policy:

```txt
script-src 'self'; object-src 'self'; connect-src 'self' http://localhost:8787 https:;
```

Update `connect-src` for your production API if needed.

## Rate limiting and validation

The API uses:

- `express-rate-limit`
- Zod request schemas
- Helmet headers
- CORS origin checks

## Data handling

Page analysis can contain proprietary or sensitive website text. For production:

- Display clear user consent.
- Add workspace-level retention controls.
- Avoid logging raw snapshots in production.
- Encrypt sensitive report fields if your compliance needs require it.

## Auth

`server/src/middleware/auth.ts` includes a local/demo fallback. Replace or extend it with Clerk JWT verification for production API access.
