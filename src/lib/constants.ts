export const COUNTRIES = [
    // CONCACAF (Hosts + Likely)
    "Mexico", "United States", "Canada", "Costa Rica", "Panama", "Jamaica", "El Salvador", "Honduras", "Nicaragua", "Guatemala",
    // CONMEBOL
    "Argentina", "Brazil", "Uruguay", "Colombia", "Ecuador", "Chile", "Paraguay", "Peru", "Venezuela", "Bolivia",
    // UEFA
    "France", "England", "Spain", "Germany", "Portugal", "Netherlands", "Italy", "Belgium", "Croatia", "Denmark", "Switzerland", "Serbia", "Poland", "Sweden", "Ukraine", "Scotland", "Wales",
    // CAF
    "Morocco", "Senegal", "Nigeria", "Egypt", "Algeria", "Cameroon", "Mali", "Ivory Coast", "Tunisia", "Ghana", "South Africa",
    // AFC
    "Japan", "Iran", "South Korea", "Australia", "Saudi Arabia", "Qatar", "Iraq", "Uzbekistan",
    // OFC
    "New Zealand",
    // Others
    "Dominican Republic",
] as const;

export const REGISTRATION_COUNTRIES = [
    "El Salvador",
    "Honduras",
    "Guatemala",
    "Mexico",
    "Nicaragua",
    "Costa Rica",
    "Panama",
    "Colombia",
    "United States"
] as const;

// ISO 3166-1 alpha-2 codes for flagcdn.com
export const COUNTRY_FLAG_MAP: Record<string, string> = {
    "Mexico": "mx", "United States": "us", "Canada": "ca", "Costa Rica": "cr", "Panama": "pa", "Jamaica": "jm",
    "El Salvador": "sv", "Honduras": "hn", "Nicaragua": "ni", "Guatemala": "gt", "Dominican Republic": "do",
    "Argentina": "ar", "Brazil": "br", "Uruguay": "uy", "Colombia": "co", "Ecuador": "ec", "Chile": "cl", "Paraguay": "py", "Peru": "pe", "Venezuela": "ve", "Bolivia": "bo",
    "France": "fr", "England": "gb-eng", "Spain": "es", "Germany": "de", "Portugal": "pt", "Netherlands": "nl", "Italy": "it", "Belgium": "be", "Croatia": "hr", "Denmark": "dk", "Switzerland": "ch", "Serbia": "rs", "Poland": "pl", "Sweden": "se", "Ukraine": "ua", "Scotland": "gb-sct", "Wales": "gb-wls",
    "Morocco": "ma", "Senegal": "sn", "Nigeria": "ng", "Egypt": "eg", "Algeria": "dz", "Cameroon": "cm", "Mali": "ml", "Ivory Coast": "ci", "Tunisia": "tn", "Ghana": "gh", "South Africa": "za",
    "Japan": "jp", "Iran": "ir", "South Korea": "kr", "Australia": "au", "Saudi Arabia": "sa", "Qatar": "qa", "Iraq": "iq", "Uzbekistan": "uz",
    "New Zealand": "nz",
};

export const GROUPS = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"
] as const;

export type Group = typeof GROUPS[number];
