// wa.me opens WhatsApp with the message ready and lets the user pick the chat (the hardware store, the family)
export function whatsappUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
