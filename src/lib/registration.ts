// Full statutory identity of the company.
//
// NOT IMPORTED BY ANY PAGE, on purpose. The site shows masked numbers
// (see `company` in content.ts); anything imported by a client component
// ships to every visitor's browser. Use these for invoices, applications
// and documents — not the website.
//
// ⚠️ Verify `cin` against the Certificate of Incorporation: the state code
// reads "UW", and Uttar Pradesh is "UP" (consistent with the GSTIN's 09
// prefix and the Udyam number). Left exactly as supplied.

export const registration = {
  legalName: "Airimation Technologies Private Limited",
  cin: "U82300UW2026PTC257648",
  incorporatedOn: "22 August 2026",
  gstin: "09ABGCA5420J1ZN",
  udyam: "UDYAM-UP-28-0243960",
  dpiit: "DIPP285551",
  registeredOffice:
    "CF-132G, Ansal Golf Links, Pari Chowk, Knowledge Park-I, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh 201310, India",
} as const;
