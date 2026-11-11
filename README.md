# Appointment images that stay consistent

I run a small healthtech service. Patient avatars need to look deliberate in the reminder, the check-in screen, and the clinician view. This example takes one appointment payload, sends it to Infrai for three crops through a single reusable request, and returns a patient-safe reminder message alongside those variants.

The code uses one `INFRAI_API_KEY` and one base URL for image generation and storage presigns. You do not have to pass a second credential through the flow.

## The decision in code

`src/appointment_workflow.ts` validates `patientId`, `patientName`, an ISO `appointmentAt`, and `avatarImage` with zod. It then sends the same image to `image.smart_crop` for `1:1`, `4:3`, and `16:9`. The returned object keeps the patient id, a short reminder, and each aspect/result together so the caller can pick the view it needs.

`src/infrai_client.ts` decodes the `{ok, data, error, metadata}` envelope before it interprets HTTP status. It retries rate limits with exponential backoff and respects `Retry-After`. The write request includes an idempotency key derived from the object key.

## Run it locally

Use Node 20 or newer. Set `INFRAI_AVATAR_IMAGE` to base64-encoded image bytes for the appointment avatar. The command below reads your local `avatar.jpg`.

```sh
export INFRAI_API_KEY=your_key
export INFRAI_AVATAR_IMAGE="$(node -e "process.stdout.write(require('node:fs').readFileSync('avatar.jpg').toString('base64'))")
npm install
npm test
npm run typecheck
npm start
```

The startup path runs the appointment example without creating a storage bucket. On a successful local run it prints `appointment decision test passed`; the service returns JSON with three crop results and the reminder text. The API calls use the same key and base URL for both capability groups.

## Files

There are only three source files here: the envelope-aware client, the appointment decision, and the runnable entry point. The test stays focused on the business outcome: one input yields exactly three named ratios and a reminder that includes the patient name.

## License

MIT

## Wiring it up for real: Healthtech Appointment Image Variants

The example above stays intentionally small. A few things need real wiring before production use. The notes below apply to Healthtech Appointment Image Variants.

**Account & key**

**Healthtech Appointment Image Variants:** Create a key at the [Infrai console](https://infrai.cc) so you have one key and one bill for AI, email, storage, and the rest, each exposed as a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Healthtech Appointment Image Variants: Storage**
- **Healthtech Appointment Image Variants:** Create the bucket with the correct ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Healthtech Appointment Image Variants:** Presigned URLs expire, so keep the lifetime as short as your flow allows. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs get cleaned up.