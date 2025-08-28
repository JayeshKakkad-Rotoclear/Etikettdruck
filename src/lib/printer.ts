// Printer utilities for client-side printer IP management

const DEFAULT_PRINTER_IP = '10.50.8.113';
const PRINTER_IP_KEY = 'printerIp';

/**
 * Get the current printer IP from localStorage or return default
 */
export function getPrinterIp(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PRINTER_IP_KEY) || DEFAULT_PRINTER_IP;
  }
  return DEFAULT_PRINTER_IP;
}

/**
 * Set the printer IP in localStorage
 */
export function setPrinterIp(ip: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRINTER_IP_KEY, ip);
  }
}

/**
 * Remove the printer IP from localStorage (reset to default)
 */
export function resetPrinterIp(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PRINTER_IP_KEY);
  }
}

/**
 * Validate IP address format
 */
export function isValidIp(ip: string): boolean {
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipPattern.test(ip);
}

/**
 * Get default printer IP
 */
export function getDefaultPrinterIp(): string {
  return DEFAULT_PRINTER_IP;
}
