-- Lead qualification captured on the public quote form.
-- All nullable: existing quotes predate the fields, and the contact form
-- writes a Quote with none of them.
ALTER TABLE "Quote" ADD COLUMN     "industry" TEXT;
ALTER TABLE "Quote" ADD COLUMN     "designation" TEXT;
ALTER TABLE "Quote" ADD COLUMN     "deliveryLocation" TEXT;
ALTER TABLE "Quote" ADD COLUMN     "annualVolumeUsd" TEXT;
