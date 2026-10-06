import {
  createLegacyGoneResponse,
} from "@/lib/legacy-gone-response";

export function GET() {
  return createLegacyGoneResponse();
}
