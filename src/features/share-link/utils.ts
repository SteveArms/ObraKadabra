import { whatsappUrl } from "@/lib/whatsapp";

export function whatsappShareUrl(link: string): string {
  return whatsappUrl(`Follow how our future home is coming along: ${link}`);
}
