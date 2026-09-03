# Contact Form

Add a contact page to the F1 ticket booking site so visitors can reach support before or after booking.

## What to build

1. **Route** — `src/routes/contact.tsx` with its own `head()` metadata (title, description, og tags).
2. **Form UI** — name, email, subject (select), and message fields styled with the existing carbon/speed design system and shadcn `Input`, `Textarea`, `Label`, `Button`, and `Select` components.
3. **Validation** — `react-hook-form` + `zod` with client-side error messages and server-side re-validation in a `createServerFn`.
4. **Submission handler** — a server function that validates the payload and returns a success state. If a verified email domain is available, wire it to the app email helper to send a confirmation to the user and a notice to the site owner; otherwise the handler returns success and logs the submission.
5. **Navigation** — add a "Contact" link in the booking page header/navigation so the form is reachable from the main funnel.
6. **Verification** — run a build check and a Playwright smoke test to confirm the form submits and shows success/error states.

## Out of scope for this pass

- Database persistence for submissions (can be added later if Lovable Cloud is enabled).
- Marketing emails or newsletter opt-in.
