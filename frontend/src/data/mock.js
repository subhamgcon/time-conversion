// Mock data for timezone converter

export const mockTimezones = [
  // North America
  { id: "America/New_York", name: "New York", offset: "-05:00", region: "North America" },
  { id: "America/Chicago", name: "Chicago", offset: "-06:00", region: "North America" },
  { id: "America/Denver", name: "Denver", offset: "-07:00", region: "North America" },
  { id: "America/Los_Angeles", name: "Los Angeles", offset: "-08:00", region: "North America" },
  { id: "America/Vancouver", name: "Vancouver", offset: "-08:00", region: "North America" },
  { id: "America/Toronto", name: "Toronto", offset: "-05:00", region: "North America" },
  { id: "America/Mexico_City", name: "Mexico City", offset: "-06:00", region: "North America" },

  // Europe
  { id: "Europe/London", name: "London", offset: "+00:00", region: "Europe" },
  { id: "Europe/Paris", name: "Paris", offset: "+01:00", region: "Europe" },
  { id: "Europe/Berlin", name: "Berlin", offset: "+01:00", region: "Europe" },
  { id: "Europe/Rome", name: "Rome", offset: "+01:00", region: "Europe" },
  { id: "Europe/Madrid", name: "Madrid", offset: "+01:00", region: "Europe" },
  { id: "Europe/Amsterdam", name: "Amsterdam", offset: "+01:00", region: "Europe" },
  { id: "Europe/Zurich", name: "Zurich", offset: "+01:00", region: "Europe" },
  { id: "Europe/Vienna", name: "Vienna", offset: "+01:00", region: "Europe" },
  { id: "Europe/Stockholm", name: "Stockholm", offset: "+01:00", region: "Europe" },
  { id: "Europe/Helsinki", name: "Helsinki", offset: "+02:00", region: "Europe" },
  { id: "Europe/Moscow", name: "Moscow", offset: "+03:00", region: "Europe" },

  // Asia
  { id: "Asia/Tokyo", name: "Tokyo", offset: "+09:00", region: "Asia" },
  { id: "Asia/Seoul", name: "Seoul", offset: "+09:00", region: "Asia" },
  { id: "Asia/Shanghai", name: "Shanghai", offset: "+08:00", region: "Asia" },
  { id: "Asia/Hong_Kong", name: "Hong Kong", offset: "+08:00", region: "Asia" },
  { id: "Asia/Singapore", name: "Singapore", offset: "+08:00", region: "Asia" },
  { id: "Asia/Bangkok", name: "Bangkok", offset: "+07:00", region: "Asia" },
  { id: "Asia/Jakarta", name: "Jakarta", offset: "+07:00", region: "Asia" },
  { id: "Asia/Manila", name: "Manila", offset: "+08:00", region: "Asia" },
  { id: "Asia/Kuala_Lumpur", name: "Kuala Lumpur", offset: "+08:00", region: "Asia" },
  { id: "Asia/Dubai", name: "Dubai", offset: "+04:00", region: "Asia" },
  { id: "Asia/Riyadh", name: "Riyadh", offset: "+03:00", region: "Asia" },
  { id: "Asia/Tehran", name: "Tehran", offset: "+03:30", region: "Asia" },
  { id: "Asia/Kolkata", name: "Kolkata", offset: "+05:30", region: "Asia" },
  { id: "Asia/Dhaka", name: "Dhaka", offset: "+06:00", region: "Asia" },
  { id: "Asia/Karachi", name: "Karachi", offset: "+05:00", region: "Asia" },

  // Australia & Oceania
  { id: "Australia/Sydney", name: "Sydney", offset: "+11:00", region: "Australia & Oceania" },
  { id: "Australia/Melbourne", name: "Melbourne", offset: "+11:00", region: "Australia & Oceania" },
  { id: "Australia/Brisbane", name: "Brisbane", offset: "+10:00", region: "Australia & Oceania" },
  { id: "Australia/Perth", name: "Perth", offset: "+08:00", region: "Australia & Oceania" },
  { id: "Pacific/Auckland", name: "Auckland", offset: "+13:00", region: "Australia & Oceania" },
  { id: "Pacific/Honolulu", name: "Honolulu", offset: "-10:00", region: "Australia & Oceania" },

  // Africa
  { id: "Africa/Cairo", name: "Cairo", offset: "+02:00", region: "Africa" },
  { id: "Africa/Lagos", name: "Lagos", offset: "+01:00", region: "Africa" },
  { id: "Africa/Johannesburg", name: "Johannesburg", offset: "+02:00", region: "Africa" },
  { id: "Africa/Nairobi", name: "Nairobi", offset: "+03:00", region: "Africa" },
  { id: "Africa/Casablanca", name: "Casablanca", offset: "+01:00", region: "Africa" },

  // South America
  { id: "America/Sao_Paulo", name: "São Paulo", offset: "-03:00", region: "South America" },
  { id: "America/Argentina/Buenos_Aires", name: "Buenos Aires", offset: "-03:00", region: "South America" },
  { id: "America/Lima", name: "Lima", offset: "-05:00", region: "South America" },
  { id: "America/Bogota", name: "Bogotá", offset: "-05:00", region: "South America" },
  { id: "America/Santiago", name: "Santiago", offset: "-03:00", region: "South America" },
];

export const mockSavedTimezones = [
  { id: "America/New_York", name: "New York", offset: "-05:00" },
  { id: "Europe/London", name: "London", offset: "+00:00" },
];

// Mock conversion functions
export const mockConvertToIST = (sourceTime, sourceTimezone) => {
  // This would normally use a proper timezone conversion library
  // For now, returning mock data
  const now = new Date();
  
  return {
    time: now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    }),
    date: now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    }),
    offset: "+05:30"
  };
};