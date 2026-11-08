/**
 * Official provinces, federal territories, and major administrative cities of Pakistan.
 */
export const PROVINCES_AND_CITIES: Record<string, string[]> = {
  Punjab: [
    "Lahore",
    "Faisalabad",
    "Rawalpindi",
    "Gujranwala",
    "Multan",
    "Sialkot",
    "Bahawalpur",
    "Sargodha",
    "Gujrat",
    "Sheikhupura",
    "Sahiwal",
    "Jhelum",
    "Rahim Yar Khan",
    "Okara",
    "Kasur",
    "Dera Ghazi Khan",
  ],
  Sindh: [
    "Karachi",
    "Hyderabad",
    "Sukkur",
    "Larkana",
    "Nawabshah",
    "Mirpur Khas",
    "Jacobabad",
    "Shikarpur",
    "Thatta",
  ],
  "Islamabad Capital Territory": ["Islamabad"],
  "Khyber Pakhtunkhwa": [
    "Peshawar",
    "Abbottabad",
    "Mardan",
    "Swat",
    "Kohat",
    "Dera Ismail Khan",
    "Haripur",
    "Mansehra",
    "Bannu",
  ],
  Balochistan: [
    "Quetta",
    "Gwadar",
    "Turbat",
    "Khuzdar",
    "Sibi",
    "Hub",
    "Chaman",
  ],
  "Azad Jammu & Kashmir": [
    "Muzaffarabad",
    "Mirpur",
    "Rawalakot",
    "Kotli",
    "Bagh",
  ],
  "Gilgit-Baltistan": [
    "Gilgit",
    "Skardu",
    "Hunza",
    "Chilas",
  ],
};

export const PROVINCE_OPTIONS = Object.keys(PROVINCES_AND_CITIES);

/**
 * Automatically resolves the corresponding province for a given city name.
 */
export function getProvinceForCity(cityName: string): string {
  if (!cityName) return "Punjab";
  const clean = cityName.trim().toLowerCase();
  for (const [province, cities] of Object.entries(PROVINCES_AND_CITIES)) {
    if (cities.some((c) => c.toLowerCase() === clean)) {
      return province;
    }
  }
  return "Punjab";
}
