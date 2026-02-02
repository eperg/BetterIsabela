/**
 * Better Solano - Enhanced Translation System
 * Supports: English (en), Filipino (fil), Ilocano (ilo)
 * Updated: 2025-12-10
 */

const translations = {
    en: {
        // Navigation
        "nav-home": "Home",
        "nav-services": "Services",
        "nav-government": "Government",
        "nav-statistics": "Statistics",
        "nav-legislative": "Legislative",
        "nav-transparency": "Transparency",
        "nav-contact": "Contact",
        "nav-budget": "Budget",
        "nav-news": "News",
        "nav-faq": "FAQ",
        "nav-sitemap": "Sitemap",
        "nav-privacy": "Privacy",
        "nav-terms": "Terms",
        "nav-accessibility": "Accessibility",

        // Statistics Page
        "stats-title": "Municipal Statistics",
        "stats-subtitle": "Data and statistics about Solano, Nueva Vizcaya",
        "stats-demographics": "Demographics Overview",
        "stats-economic": "Economic Indicators",
        "stats-barangay": "Population by Barangay",
        "stats-population": "Population",
        "stats-land-area": "Land Area",
        "stats-density": "Population Density",
        "stats-households": "Households",
        "stats-growth-rate": "Growth Rate",

        // Breadcrumbs
        "breadcrumb-home": "Home",
        "breadcrumb-services": "Services",
        "breadcrumb-government": "Government",
        "breadcrumb-budget": "Budget & Transparency",
        "breadcrumb-contact": "Contact",
        "breadcrumb-faq": "FAQ",
        "breadcrumb-accessibility": "Accessibility",
        "breadcrumb-statistics": "Statistics",
        "breadcrumb-legislative": "Legislative",
        "breadcrumb-news": "News",
        "breadcrumb-sitemap": "Sitemap",
        "breadcrumb-privacy": "Privacy Policy",
        "breadcrumb-terms": "Terms of Use",

        // Hero Section
        "hero-welcome": "Welcome to BetterSolano.org",
        "hero-subtitle": "Access government services, information, and resources for the people of Solano, Nueva Vizcaya.",
        "hero-browse": "Browse Services",
        "hero-contact": "Contact Us",
        "hero-search-placeholder": "Search for services...",
        "hero-find-service": "Find a Service",

        // Appointment CTA
        "appointment-cta-heading": "Enhancing Appointment Services of LGU Solano Mayor's Office",
        "appointment-cta-subtitle": "No lines. No back-and-forth. Just efficient appointments.",
        "appointment-schedule-btn": "Schedule Appointment",
        "appointment-create-btn": "Create Account",

        // Popular Services
        "section-popular": "Popular Services",
        "service-certificates": "Certificates",
        "service-certificates-desc": "Birth, marriage, death certificates",
        "service-business": "Business Permits",
        "service-business-desc": "New permits and renewals",
        "service-tax": "Tax Payments",
        "service-tax-desc": "Property and business taxes",
        "service-social": "Social Services",
        "service-social-desc": "Senior citizen & PWD services",
        "service-health": "Health Services",
        "service-health-desc": "Medical assistance & programs",
        "btn-view-all-services": "View All Services",
        "btn-view-services": "View Services",
        "btn-learn-more": "Learn More",
        "btn-apply-now": "Apply Now",
        "btn-download": "Download",
        "btn-get-started": "Get Started",
        "btn-submit": "Submit",

        // Latest Updates
        "section-updates": "Latest Updates",
        "btn-view-all": "View All",
        "btn-read-more": "Read More",

        // Municipal Leadership
        "section-leadership": "Municipal Leadership",
        "title-mayor": "Municipal Mayor",
        "title-vice-mayor": "Municipal Vice Mayor",
        "title-councilor": "Councilor",
        "title-secretary": "Secretary",
        "btn-view-officials": "View All Officials",

        // Contact Section
        "section-contact": "Contact Information",
        "contact-phone": "Phone",
        "contact-email": "Email",
        "contact-address": "Address",
        "contact-visit": "Visit Us",
        "contact-hours": "Mon-Fri: 8:00 AM - 5:00 PM",
        "contact-response": "We'll respond within 24 hours",
        "contact-municipal-hall": "Municipal Hall",
        "contact-location": "Location",
        "contact-directions": "Get Directions",

        // Footer
        "footer-title": "Better Solano",
        "footer-desc": "A service-first information portal for the Municipality of Solano, Nueva Vizcaya.",
        "footer-quick-links": "Quick Links",
        "footer-all-services": "All Services",
        "footer-officials": "Officials",
        "footer-contact-us": "Contact Us",
        "footer-faq": "FAQ",
        "footer-contact": "Contact",
        "footer-copyright": "Better Solano. All rights reserved.",
        "accessibility-statement": "Accessibility Statement",
        "footer-privacy": "Privacy Policy",
        "footer-terms": "Terms of Use",
        "footer-resources": "Resources",
        "footer-volunteer": "Volunteer with us",
        "footer-contribute": "Contribute code with us",

        // Services Page
        "services-title": "Municipal Services Directory",
        "services-subtitle": "Browse all services offered by the Municipality of Solano",
        "search-placeholder": "Search services...",
        "search-no-results": "No services found",
        "search-try-different": "Try different keywords or browse categories below",
        "search-results": "Search Results",
        "search-showing": "Showing {{count}} results",
        "life-events-title": "Browse by Life Event",
        "life-events-subtitle": "Find services based on what's happening in your life",
        "life-starting-business": "Starting a Business",
        "life-getting-married": "Getting Married",
        "life-having-baby": "Having a Baby",
        "life-financial-help": "Need Financial Help",
        "life-senior": "Senior Citizen Services",
        "life-pwd": "Person with Disability",
        "life-building": "Building/Home Improvement",
        "life-trouble": "Got in Trouble",
        "life-death": "Death in Family",
        "life-education": "Education & Scholarship",
        "life-employment": "Looking for Employment",
        "life-property": "Property Matters",

        // Service Categories
        "cat-certificates": "Certificates & Vital Records",
        "cat-certificates-desc": "Birth, death, marriage certificates, and other vital records.",
        "cat-business": "Business, Trade & Investment",
        "cat-business-desc": "Business permits, licenses, and trade registration services.",
        "cat-social": "Social Services & Assistance",
        "cat-social-desc": "Welfare programs, senior citizen services, PWD benefits, and financial aid.",
        "cat-health": "Health & Wellness",
        "cat-health-desc": "Vaccination programs, health certificates, and medical assistance.",
        "cat-tax": "Taxation & Payments",
        "cat-tax-desc": "Property tax, business tax, payments, and tax clearance.",
        "cat-agriculture": "Agriculture & Economic Development",
        "cat-agriculture-desc": "Agricultural loans, crop insurance, fertilizer assistance, and training.",
        "cat-infrastructure": "Infrastructure & Public Works",
        "cat-infrastructure-desc": "Construction permits, road maintenance requests, and public facilities.",
        "cat-education": "Education & Scholarship",
        "cat-education-desc": "Scholarship programs, student assistance, and educational grants.",
        "cat-safety": "Public Safety & Security",
        "cat-safety-desc": "Emergency services, disaster preparedness, and community safety programs.",
        "cat-environment": "Environment & Natural Resources",
        "cat-environment-desc": "Environmental permits, waste management, and conservation programs.",
        "cat-online": "Online Services",
        "cat-online-desc": "Digital services available through Filipizen and other online platforms.",
        "cat-government": "Government Services",
        "cat-government-desc": "General municipal services and administrative functions.",

        // Service Details
        "service-requirements": "Requirements",
        "service-steps": "Steps",
        "service-fees": "Fees",
        "service-processing-time": "Processing Time",
        "service-office": "Office",
        "service-schedule": "Schedule",
        "service-contact": "Contact",
        "service-notes": "Important Notes",
        "service-related": "Related Services",
        "service-how-to-apply": "How to Apply",
        "service-documents-needed": "Documents Needed",
        "service-where-to-go": "Where to Go",
        "service-online-available": "Online Available",
        "service-walk-in": "Walk-in",
        "service-by-appointment": "By Appointment",
        "service-free": "Free",
        "service-varies": "Varies",
        "service-same-day": "Same Day",
        "service-instant": "Instant",

        // Certificates Page - Page Header
        "cert-page-title": "Certificates & Vital Records",
        "cert-page-desc": "Official documents for birth, death, marriage, and other vital records",
        "cert-page-badge": "Certificates",

        // Certificates Page - Service Items
        "cert-birth": "Birth Certificate",
        "cert-birth-desc": "Get a certified copy of birth certificate registered in Solano",
        "cert-marriage": "Marriage Certificate",
        "cert-marriage-desc": "Register or request certified true copy of marriage certificate",
        "cert-death": "Death Certificate",
        "cert-death-desc": "Register death certificate and obtain burial/transfer permit",
        "cert-brgy-clearance": "Barangay Clearance",
        "cert-brgy-clearance-desc": "Certificate of residence from your barangay",
        "cert-brgy-id": "Barangay ID",
        "cert-brgy-id-desc": "Official barangay identification card",
        "cert-police-clearance": "Police Clearance",
        "cert-police-clearance-desc": "Police clearance coordination through municipal office",

        // Certificates Page - Section Titles
        "cert-offices-title": "Responsible Offices",
        "cert-office-mcr": "Municipal Civil Registrar",
        "cert-office-mcr-desc": "Birth, death, marriage registration, corrections, and certified copies",
        "cert-office-hrm": "Human Resource Management",
        "cert-office-hrm-desc": "Service records, employment certificates, leave credits for LGU employees",

        // Common Labels
        "label-fee": "Fee:",
        "label-time": "Time:",
        "label-same-day": "Same day",
        "label-walk-in": "Walk-in",
        "label-schedule-varies": "Schedule varies",
        "label-by-appointment": "By appointment",
        "label-free": "Free",
        "label-free-subsidy": "Free (subsidy)",
        "label-1-3-days": "1-3 days",
        "label-seasonal": "Seasonal",
        "label-subsidized": "Subsidized",
        "label-by-schedule": "By schedule",
        "label-varies": "Varies",

        // Health Services Page
        "health-page-title": "Health Services",
        "health-page-desc": "Medical consultations, vaccinations, and health programs",
        "health-page-badge": "Health",
        "health-consultation": "Medical Consultation",
        "health-consultation-desc": "Free consultation at Rural Health Units",
        "health-vaccination": "Vaccination Programs",
        "health-vaccination-desc": "Immunization services for children and adults",
        "health-maternal": "Maternal Care",
        "health-maternal-desc": "Prenatal and postnatal health services",
        "health-medicine": "Medicine Assistance",
        "health-medicine-desc": "Financial assistance for medicines through MSWDO",
        "health-stat-facilities": "Total Health Facilities",
        "health-stat-hospitals": "Major Hospitals",
        "health-stat-bhs": "Barangay Health Stations",
        "health-stat-mho": "Municipal Health Office",
        "health-section-hospitals": "Hospitals in Solano",
        "health-section-mho": "Municipal Health Office",
        "health-section-bhs": "Barangay Health Stations",
        "health-bhs-subtitle": "22 Barangay Health Stations/Centers serving all barangays of Solano",
        "health-mho-title": "Solano Municipal Health Office",
        "health-mho-desc": "The Municipal Health Office provides primary healthcare services including a lying-in facility and laboratory services. It serves as the main public health center for the municipality.",
        "health-service-lying-in": "Lying-in Facility",
        "health-service-laboratory": "Laboratory Services",
        "health-service-immunization": "Immunization",
        "health-service-prenatal": "Prenatal Care",
        "health-service-family-planning": "Family Planning",
        "health-service-tb-dots": "TB-DOTS",

        // Agriculture Services Page
        "agri-page-title": "Agriculture Services",
        "agri-page-desc": "Support for farmers and agricultural development",
        "agri-page-badge": "Agriculture",
        "agri-seedling": "Seedling Distribution",
        "agri-seedling-desc": "Free seeds and seedlings for farmers",
        "agri-equipment": "Farm Equipment",
        "agri-equipment-desc": "Equipment rental and assistance",
        "agri-livelihood": "Livelihood Programs",
        "agri-livelihood-desc": "Training and support for farmers",
        "agri-office-mao": "Municipal Agriculture Office",
        "agri-office-mao-desc": "RSBSA registration, certifications, rice/corn programs, livestock, fishery services",

        // Ordinance Framework Page
        "ord-page-title": "Ordinance Framework",
        "ord-page-desc": "Municipal ordinances enacted by the Sangguniang Bayan ng Solano",
        "ord-page-badge": "Legislative",
        "ord-what-is": "What is an Ordinance?",
        "ord-what-is-p1": "A municipal ordinance is a local law enacted by the Sangguniang Bayan (Municipal Council) that governs the municipality and its residents. Ordinances have the force and effect of law within the territorial jurisdiction of the municipality.",
        "ord-what-is-p2": "Ordinances may cover various subjects including but not limited to: taxation, business regulations, public safety, environmental protection, traffic management, and zoning.",
        "ord-categories-title": "Ordinance Categories",
        "ord-cat-revenue": "Revenue & Taxation",
        "ord-cat-business": "Business & Trade",
        "ord-cat-safety": "Public Safety",
        "ord-cat-environment": "Environment",
        "ord-cat-traffic": "Traffic & Transportation",
        "ord-cat-zoning": "Zoning & Land Use",
        "ord-2025-title": "2025 Ordinances",
        "ord-2025-subtitle": "Official ordinances enacted by the Sangguniang Bayan ng Solano in 2025",
        "ord-table-number": "Ordinance No.",
        "ord-table-title": "Title",
        "ord-table-date": "Session Date",
        "ord-view-all": "View All Ordinances on SB Website",

        // Resolution Framework Page
        "reso-page-title": "Resolution Framework",
        "reso-page-desc": "Resolutions passed by the Sangguniang Bayan ng Solano",
        "reso-page-badge": "Legislative",
        "reso-what-is": "What is a Resolution?",
        "reso-what-is-p1": "A resolution is a formal expression of the opinion or will of the Sangguniang Bayan. Unlike ordinances, resolutions do not have the force and effect of law but serve as official statements of the legislative body.",
        "reso-what-is-p2": "Resolutions are commonly used for: commendations, requests to higher government agencies, expressions of support or opposition, and administrative matters of the Sangguniang Bayan.",
        "reso-types-title": "Types of Resolutions",
        "reso-type-commendation": "Commendation",
        "reso-type-request": "Request/Appeal",
        "reso-type-support": "Support/Endorsement",
        "reso-type-condolence": "Condolence",
        "reso-type-authorization": "Authorization",
        "reso-type-appropriation": "Appropriation",
        "reso-2025-title": "2025 Resolutions",
        "reso-2025-subtitle": "Official resolutions passed by the Sangguniang Bayan ng Solano in 2025",
        "reso-table-number": "Resolution No.",
        "reso-table-title": "Title",
        "reso-table-date": "Session Date",
        "reso-view-all": "View All Resolutions on SB Website",

        // Business Services Page
        "biz-page-title": "Business Services",
        "biz-page-desc": "Permits, licenses, and support for businesses in Solano",
        "biz-page-badge": "Business",
        "biz-permit-new": "Business Permit (New)",
        "biz-permit-new-desc": "Apply for a new mayor's permit to operate a business",
        "biz-permit-renew": "Business Permit Renewal",
        "biz-permit-renew-desc": "Renew your annual business permit",
        "biz-closure": "Business Closure",
        "biz-closure-desc": "File for business closure/termination",
        "biz-cedula": "Community Tax Certificate",
        "biz-cedula-desc": "Obtain cedula for individuals and businesses",
        "biz-online-title": "Online Business Transactions",
        "biz-online-subtitle": "Complete your business transactions online through the official Filipizen portal",
        "biz-online-badge": "Online Services via Filipizen",
        "biz-billing": "Business Online Billing & Payment",
        "biz-billing-desc": "View and pay your business tax bills online",
        "biz-new-app": "New Business Application",
        "biz-new-app-desc": "Apply for a new business permit online",
        "biz-renewal": "Business Permit Renewal",
        "biz-renewal-desc": "Renew your existing business permit online",
        "label-3-5-days": "3-5 days",
        "label-1-2-days": "1-2 days",

        // Tax & Payments Page
        "tax-page-title": "Tax & Payments",
        "tax-page-desc": "Property tax, fees, and payment services",
        "tax-page-badge": "Taxation",
        "tax-real-property": "Real Property Tax",
        "tax-real-property-desc": "Annual tax payment for land and buildings",
        "tax-business": "Business Tax",
        "tax-business-desc": "Business-related tax payments",
        "tax-online-title": "Online Tax Transactions",
        "tax-online-subtitle": "Pay your taxes and fees online through the official Filipizen portal",
        "tax-rpt-billing": "Real Property Tax Billing & Payment",
        "tax-rpt-billing-desc": "View and pay your real property tax (amilyar) online",
        "tax-payment-order": "Online Payment Order",
        "tax-payment-order-desc": "Process payment orders for various municipal fees",
        "label-based-on-value": "Based on assessed value",

        // Social Services Page
        "social-page-title": "Social Services",
        "social-page-desc": "Welfare programs, assistance, and community support",
        "social-page-badge": "Social Welfare",
        "social-senior": "Senior Citizen Services",
        "social-senior-desc": "ID, benefits, and discounts for senior citizens",
        "social-pwd": "PWD Services",
        "social-pwd-desc": "ID, benefits, and assistance for persons with disabilities",
        "social-solo": "Solo Parent Benefits",
        "social-solo-desc": "ID and benefits for solo parents",
        "social-4ps": "4Ps Program",
        "social-4ps-desc": "Pantawid Pamilyang Pilipino Program registration",
        "social-assistance": "Financial Assistance",
        "social-assistance-desc": "Emergency aid and burial assistance programs",

        // Education Page
        "edu-page-title": "Education Services",
        "edu-page-desc": "Scholarships, training programs, and educational support",
        "edu-page-badge": "Education",
        "edu-scholarship": "Scholarship Programs",
        "edu-scholarship-desc": "Financial assistance for deserving students",
        "edu-tle": "TLE Equipment",
        "edu-tle-desc": "Technology and livelihood equipment for schools",
        "edu-training": "Skills Training",
        "edu-training-desc": "Vocational and skills development programs",

        // Infrastructure Page
        "infra-page-title": "Infrastructure Services",
        "infra-page-desc": "Road maintenance, facilities, and public utilities",
        "infra-page-badge": "Infrastructure",
        "infra-road": "Road Maintenance",
        "infra-road-desc": "Request for road repairs and maintenance",
        "infra-water": "Water Services",
        "infra-water-desc": "Water system connection and services",
        "infra-building": "Building Permits",
        "infra-building-desc": "Construction and renovation permits",

        // Public Safety Page
        "safety-page-title": "Public Safety",
        "safety-page-desc": "Police services, disaster preparedness, and emergency response",
        "safety-page-badge": "Public Safety",
        "safety-police": "Police Services",
        "safety-police-desc": "Clearances, blotter reports, and assistance",
        "safety-fire": "Fire Safety",
        "safety-fire-desc": "Fire clearance and inspection services",
        "safety-disaster": "Disaster Services",
        "safety-disaster-desc": "MDRRMO emergency response and preparedness",

        // Environment Page
        "env-page-title": "Environment Services",
        "env-page-desc": "Environmental permits, waste management, and sustainability",
        "env-page-badge": "Environment",
        "env-clearance": "Environmental Clearance",
        "env-clearance-desc": "Environmental permits for projects and businesses",
        "env-waste": "Waste Management",
        "env-waste-desc": "Garbage collection and waste disposal services",
        "env-tree": "Tree Cutting Permit",
        "env-tree-desc": "Permit for tree cutting and removal",

        // Common Section Titles
        "section-responsible-offices": "Responsible Offices",

        // Government Page
        "gov-title": "Government Structure & Officials",
        "gov-subtitle": "Meet the leadership and offices serving Solano",
        "gov-executive": "Executive Branch",
        "gov-sb-members": "Sangguniang Bayan Members",
        "gov-sb-subtitle": "Municipal Councilors serving the people of Solano",
        "gov-departments": "Department Heads & Key Offices",
        "gov-dept-subtitle": "Municipal offices providing services to citizens",
        "gov-barangays": "Barangays of Solano",
        "gov-barangays-count": "22 Barangays serving our community",
        "gov-organizational-chart": "Organizational Chart",
        "gov-term": "Term",

        // Budget Page
        "budget-title": "Budget & Financial Transparency",
        "budget-subtitle": "Tracking municipal finances and projects for accountability",
        "budget-overview": "2025 Municipal Budget Overview",
        "budget-total": "Total Budget",
        "budget-personnel": "Personnel Services",
        "budget-operations": "Operations",
        "budget-capital": "Capital Outlay",
        "budget-by-dept": "Budget by Department",
        "budget-projects": "Major Projects 2025",
        "budget-reports": "Financial Reports & Documents",
        "budget-metrics": "Transparency Metrics",
        "budget-utilization": "Budget Utilization Rate",
        "budget-foi": "Freedom of Information Requests",
        "budget-response-time": "Average Response Time",
        "budget-annual-report": "Annual Financial Report",
        "budget-quarterly": "Quarterly Report",

        // FAQ Page
        "faq-title": "Frequently Asked Questions",
        "faq-subtitle": "Find answers to common questions about municipal services",
        "faq-general": "General Questions",
        "faq-certificates": "Certificates & Documents",
        "faq-business": "Business & Permits",
        "faq-payments": "Payments & Fees",
        "faq-social": "Social Services",
        "faq-technical": "Technical Questions",
        "faq-still-questions": "Still have questions?",
        "faq-contact-help": "If you didn't find the answer you were looking for, please don't hesitate to contact us. We're here to help!",
        "faq-search": "Search FAQ",

        // Contact Page
        "contact-title": "Contact Us",
        "contact-subtitle": "We're here to help. Reach out to us through any of these channels.",
        "contact-send-message": "Send Us a Message",
        "contact-form-subtitle": "Have a question, suggestion, or feedback? Fill out the form below.",
        "contact-office-hours": "Office Hours",
        "contact-regular-hours": "Regular Hours",
        "contact-closed": "Closed",
        "contact-emergency": "Emergency Hotline",
        "contact-hotlines": "Emergency Hotlines",
        "contact-hotlines-desc": "For emergencies and inquiries, contact these numbers anytime.",
        "contact-weekends": "Weekends & Holidays",
        "contact-send-btn": "Send Message",
        "contact-police": "Police",
        "contact-fire": "Fire",
        "contact-medical": "Medical",
        "contact-disaster": "Disaster Response",

        // Form Labels
        "form-name": "Full Name",
        "form-email": "Email Address",
        "form-phone": "Phone Number",
        "form-subject": "Subject",
        "form-message": "Message",
        "form-select-subject": "Select a subject...",
        "form-service-inquiry": "Service Inquiry",
        "form-complaint": "Complaint",
        "form-suggestion": "Suggestion",
        "form-general": "General Question",
        "form-website-issue": "Website Issue",
        "form-request-response": "I would like to receive a response",
        "form-required": "Required",
        "form-optional": "Optional",
        "form-submit": "Submit",
        "form-cancel": "Cancel",
        "form-success": "Your message has been sent successfully!",
        "form-error": "There was an error sending your message. Please try again.",
        "form-sending": "Sending...",
        "form-clear": "Clear Form",

        // Accessibility Page
        "access-title": "Accessibility Statement",
        "access-subtitle": "Our commitment to digital accessibility for all citizens",
        "access-commitment": "Our Commitment",
        "access-conformance": "Conformance Status",
        "access-features": "Accessibility Features",
        "access-limitations": "Known Limitations",
        "access-alternative": "Alternative Access",
        "access-feedback": "Feedback",
        "access-technical": "Technical Specifications",
        "access-assessment": "Assessment Approach",
        "access-promise": "Our Promise",

        // Legislative Page
        "legislative-title": "Legislative Information",
        "legislative-subtitle": "Ordinances, resolutions, and legislative records",
        "legislative-ordinances": "Ordinances",
        "legislative-resolutions": "Resolutions",
        "legislative-pending": "Pending",
        "legislative-approved": "Approved",
        "legislative-enacted": "Enacted",

        // News Page
        "news-title": "News & Announcements",
        "news-subtitle": "Latest updates from the Municipality of Solano",
        "news-latest": "Latest News",
        "news-announcements": "Announcements",
        "news-events": "Events",
        "news-posted": "Posted",
        "news-by": "By",

        // Sitemap Page
        "sitemap-title": "Sitemap",
        "sitemap-subtitle": "Complete directory of all pages on this website",

        // Privacy Page
        "privacy-title": "Privacy Policy",
        "privacy-subtitle": "How we collect, use, and protect your information",

        // Terms Page
        "terms-title": "Terms of Use",
        "terms-subtitle": "Terms and conditions for using this website",

        // Common UI Elements
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "warning": "Warning",
        "info": "Information",
        "close": "Close",
        "back": "Back",
        "next": "Next",
        "previous": "Previous",
        "save": "Save",
        "delete": "Delete",
        "edit": "Edit",
        "view": "View",
        "print": "Print",
        "share": "Share",
        "copy": "Copy",
        "search": "Search",
        "filter": "Filter",
        "sort": "Sort",
        "all": "All",
        "none": "None",
        "yes": "Yes",
        "no": "No",
        "or": "or",
        "and": "and",
        "more": "More",
        "less": "Less",
        "show-more": "Show More",
        "show-less": "Show Less",
        "expand": "Expand",
        "collapse": "Collapse",
        "refresh": "Refresh",
        "reset": "Reset",
        "apply": "Apply",
        "confirm": "Confirm",
        "cancel": "Cancel",
        "ok": "OK",
        "done": "Done",
        "continue": "Continue",
        "skip": "Skip",
        "help": "Help",
        "about": "About",
        "home": "Home",
        "menu": "Menu",
        "settings": "Settings",
        "language": "Language",
        "date": "Date",
        "time": "Time",
        "today": "Today",
        "yesterday": "Yesterday",
        "tomorrow": "Tomorrow",
        "week": "Week",
        "month": "Month",
        "year": "Year",
        "total": "Total",
        "available": "Available",
        "unavailable": "Unavailable",
        "online": "Online",
        "offline": "Offline",
        "open": "Open",
        "closed": "Closed",
        "new": "New",
        "updated": "Updated",
        "popular": "Popular",
        "featured": "Featured",
        "recommended": "Recommended",

        // Time-related
        "minutes": "minutes",
        "hours": "hours",
        "days": "days",
        "weeks": "weeks",
        "months": "months",
        "same-day": "Same day",
        "instant": "Instant",
        "varies": "Varies",

        // Currency
        "peso": "Peso",
        "free": "Free",

        // Hotline labels
        "hotline-police": "Police",
        "hotline-fire": "Fire",
        "hotline-mswdo": "MSWDO",
        "hotline-mdrrmo": "MDRRMO",
        "hotline-dilg": "DILG"
    },


    fil: {
        // Navigation - Filipino (Tagalog)
        "nav-home": "Tahanan",
        "nav-services": "Mga Serbisyo",
        "nav-government": "Pamahalaan",
        "nav-statistics": "Estadistika",
        "nav-legislative": "Lehislatura",
        "nav-transparency": "Transparensiya",
        "nav-contact": "Makipag-ugnayan",
        "nav-budget": "Badyet",
        "nav-news": "Balita",
        "nav-faq": "Mga Tanong",
        "nav-sitemap": "Mapa ng Site",
        "nav-privacy": "Pagkapribado",
        "nav-terms": "Mga Tuntunin",
        "nav-accessibility": "Aksesibilidad",

        // Statistics Page
        "stats-title": "Estadistika ng Munisipalidad",
        "stats-subtitle": "Datos at estadistika tungkol sa Solano, Nueva Vizcaya",
        "stats-demographics": "Pangkalahatang-ideya ng Demograpiya",
        "stats-economic": "Mga Tagapagpahiwatig ng Ekonomiya",
        "stats-barangay": "Populasyon Ayon sa Barangay",
        "stats-population": "Populasyon",
        "stats-land-area": "Lawak ng Lupa",
        "stats-density": "Densidad ng Populasyon",
        "stats-households": "Mga Sambahayan",
        "stats-growth-rate": "Rate ng Paglago",

        // Breadcrumbs
        "breadcrumb-home": "Tahanan",
        "breadcrumb-services": "Mga Serbisyo",
        "breadcrumb-government": "Pamahalaan",
        "breadcrumb-budget": "Badyet at Transparensiya",
        "breadcrumb-contact": "Makipag-ugnayan",
        "breadcrumb-faq": "Mga Madalas Itanong",
        "breadcrumb-accessibility": "Aksesibilidad",
        "breadcrumb-statistics": "Estadistika",
        "breadcrumb-legislative": "Lehislatura",
        "breadcrumb-news": "Balita",
        "breadcrumb-sitemap": "Mapa ng Site",
        "breadcrumb-privacy": "Patakaran sa Pagkapribado",
        "breadcrumb-terms": "Mga Tuntunin ng Paggamit",

        // Hero Section
        "hero-welcome": "Maligayang Pagdating sa BetterSolano.org",
        "hero-subtitle": "I-access ang mga serbisyo ng pamahalaan, impormasyon, at mga mapagkukunan para sa mga mamamayan ng Solano, Nueva Vizcaya.",
        "hero-browse": "Tingnan ang mga Serbisyo",
        "hero-contact": "Makipag-ugnayan sa Amin",
        "hero-search-placeholder": "Maghanap ng serbisyo...",
        "hero-find-service": "Maghanap ng Serbisyo",

        // Appointment CTA
        "appointment-cta-heading": "Pagpapahusay ng Serbisyo sa Appointment ng Opisina ng Alkalde ng LGU Solano",
        "appointment-cta-subtitle": "Walang pila. Walang pabalik-balik. Mahusay na appointment lang.",
        "appointment-schedule-btn": "Mag-iskedyul ng Appointment",
        "appointment-create-btn": "Gumawa ng Account",

        // Popular Services
        "section-popular": "Mga Sikat na Serbisyo",
        "service-certificates": "Mga Sertipiko",
        "service-certificates-desc": "Sertipiko ng kapanganakan, kasal, at kamatayan",
        "service-business": "Mga Permit sa Negosyo",
        "service-business-desc": "Bagong permit at pag-renew",
        "service-tax": "Pagbabayad ng Buwis",
        "service-tax-desc": "Buwis sa ari-arian at negosyo",
        "service-social": "Serbisyong Panlipunan",
        "service-social-desc": "Serbisyo para sa senior citizen at PWD",
        "service-health": "Serbisyong Pangkalusugan",
        "service-health-desc": "Tulong medikal at mga programa",
        "btn-view-all-services": "Tingnan Lahat ng Serbisyo",
        "btn-view-services": "Tingnan ang mga Serbisyo",
        "btn-learn-more": "Alamin Pa",
        "btn-apply-now": "Mag-apply Ngayon",
        "btn-download": "I-download",
        "btn-get-started": "Magsimula",
        "btn-submit": "Isumite",

        // Latest Updates
        "section-updates": "Pinakabagong mga Update",
        "btn-view-all": "Tingnan Lahat",
        "btn-read-more": "Magbasa Pa",

        // Municipal Leadership
        "section-leadership": "Pamunuan ng Munisipalidad",
        "title-mayor": "Punong Bayan",
        "title-vice-mayor": "Bise Punong Bayan",
        "title-councilor": "Konsehal",
        "title-secretary": "Kalihim",
        "btn-view-officials": "Tingnan Lahat ng Opisyal",

        // Contact Section
        "section-contact": "Impormasyon sa Pakikipag-ugnayan",
        "contact-phone": "Telepono",
        "contact-email": "Email",
        "contact-address": "Adres",
        "contact-visit": "Bisitahin Kami",
        "contact-hours": "Lunes-Biyernes: 8:00 AM - 5:00 PM",
        "contact-response": "Sasagutin namin sa loob ng 24 na oras",
        "contact-municipal-hall": "Munisipyo",
        "contact-location": "Lokasyon",
        "contact-directions": "Kumuha ng Direksyon",

        // Footer
        "footer-title": "Better Solano",
        "footer-desc": "Isang portal ng impormasyon na inuuna ang serbisyo para sa Munisipalidad ng Solano, Nueva Vizcaya.",
        "footer-quick-links": "Mabilis na Links",
        "footer-all-services": "Lahat ng Serbisyo",
        "footer-officials": "Mga Opisyal",
        "footer-contact-us": "Makipag-ugnayan sa Amin",
        "footer-faq": "Mga Madalas Itanong",
        "footer-contact": "Makipag-ugnayan",
        "footer-copyright": "Better Solano. Nakalaan ang lahat ng karapatan.",
        "accessibility-statement": "Pahayag ng Aksesibilidad",
        "footer-privacy": "Patakaran sa Pagkapribado",
        "footer-terms": "Mga Tuntunin ng Paggamit",
        "footer-resources": "Mga Mapagkukunan",
        "footer-volunteer": "Mag-volunteer sa amin",
        "footer-contribute": "Mag-ambag ng code sa amin",

        // Services Page
        "services-title": "Direktoryo ng Serbisyong Munisipal",
        "services-subtitle": "Tingnan ang lahat ng serbisyong inaalok ng Munisipalidad ng Solano",
        "search-placeholder": "Maghanap ng serbisyo...",
        "search-no-results": "Walang nahanap na serbisyo",
        "search-try-different": "Subukan ang ibang mga keyword o tingnan ang mga kategorya sa ibaba",
        "search-results": "Mga Resulta ng Paghahanap",
        "search-showing": "Nagpapakita ng {{count}} resulta",
        "life-events-title": "Maghanap Ayon sa Pangyayari sa Buhay",
        "life-events-subtitle": "Hanapin ang mga serbisyo batay sa nangyayari sa iyong buhay",
        "life-starting-business": "Magsimula ng Negosyo",
        "life-getting-married": "Magpakasal",
        "life-having-baby": "Magkaanak",
        "life-financial-help": "Kailangan ng Tulong Pinansyal",
        "life-senior": "Serbisyo para sa Senior Citizen",
        "life-pwd": "Taong may Kapansanan",
        "life-building": "Pagtatayo/Pagpapabuti ng Bahay",
        "life-trouble": "Nalagay sa Problema",
        "life-death": "Pagkamatay sa Pamilya",
        "life-education": "Edukasyon at Iskolarship",
        "life-employment": "Naghahanap ng Trabaho",
        "life-property": "Mga Bagay sa Ari-arian",

        // Service Categories
        "cat-certificates": "Mga Sertipiko at Vital Records",
        "cat-certificates-desc": "Sertipiko ng kapanganakan, kamatayan, kasal, at iba pang vital records.",
        "cat-business": "Negosyo, Kalakalan at Pamumuhunan",
        "cat-business-desc": "Mga permit sa negosyo, lisensya, at serbisyo sa pagpaparehistro ng kalakalan.",
        "cat-social": "Serbisyong Panlipunan at Tulong",
        "cat-social-desc": "Mga programa sa kapakanan, serbisyo para sa senior citizen, benepisyo ng PWD, at tulong pinansyal.",
        "cat-health": "Kalusugan at Kagalingan",
        "cat-health-desc": "Mga programa sa bakuna, health certificates, at tulong medikal.",
        "cat-tax": "Pagbubuwis at Pagbabayad",
        "cat-tax-desc": "Buwis sa ari-arian, buwis sa negosyo, pagbabayad, at tax clearance.",
        "cat-agriculture": "Agrikultura at Pag-unlad ng Ekonomiya",
        "cat-agriculture-desc": "Mga pautang sa agrikultura, insurance sa pananim, tulong sa pataba, at pagsasanay.",
        "cat-infrastructure": "Imprastraktura at Pampublikong Gawa",
        "cat-infrastructure-desc": "Mga permit sa konstruksyon, kahilingan sa pagpapanatili ng kalsada, at pampublikong pasilidad.",
        "cat-education": "Edukasyon at Iskolarship",
        "cat-education-desc": "Mga programa sa iskolarship, tulong sa estudyante, at mga grant sa edukasyon.",
        "cat-safety": "Kaligtasan at Seguridad ng Publiko",
        "cat-safety-desc": "Mga serbisyong pang-emergency, paghahanda sa sakuna, at mga programa sa kaligtasan ng komunidad.",
        "cat-environment": "Kapaligiran at Likas na Yaman",
        "cat-environment-desc": "Mga permit sa kapaligiran, pamamahala ng basura, at mga programa sa konserbasyon.",
        "cat-online": "Mga Online na Serbisyo",
        "cat-online-desc": "Mga digital na serbisyo na makukuha sa Filipizen at iba pang online platform.",
        "cat-government": "Mga Serbisyo ng Pamahalaan",
        "cat-government-desc": "Pangkalahatang serbisyo ng munisipalidad at mga administratibong tungkulin.",

        // Service Details
        "service-requirements": "Mga Kinakailangan",
        "service-steps": "Mga Hakbang",
        "service-fees": "Mga Bayarin",
        "service-processing-time": "Oras ng Pagproseso",
        "service-office": "Opisina",
        "service-schedule": "Iskedyul",
        "service-contact": "Makipag-ugnayan",
        "service-notes": "Mahahalagang Paalala",
        "service-related": "Mga Kaugnay na Serbisyo",
        "service-how-to-apply": "Paano Mag-apply",
        "service-documents-needed": "Mga Dokumentong Kailangan",
        "service-where-to-go": "Saan Pupunta",
        "service-online-available": "Available Online",
        "service-walk-in": "Walk-in",
        "service-by-appointment": "Sa Pamamagitan ng Appointment",
        "service-free": "Libre",
        "service-varies": "Nag-iiba",
        "service-same-day": "Parehong Araw",
        "service-instant": "Agad-agad",

        // Certificates Page - Page Header - Filipino
        "cert-page-title": "Mga Sertipiko at Vital Records",
        "cert-page-desc": "Mga opisyal na dokumento para sa kapanganakan, kamatayan, kasal, at iba pang vital records",
        "cert-page-badge": "Mga Sertipiko",

        // Certificates Page - Service Items - Filipino
        "cert-birth": "Sertipiko ng Kapanganakan",
        "cert-birth-desc": "Kumuha ng certified copy ng sertipiko ng kapanganakan na nakarehistro sa Solano",
        "cert-marriage": "Sertipiko ng Kasal",
        "cert-marriage-desc": "Magrehistro o humiling ng certified true copy ng sertipiko ng kasal",
        "cert-death": "Sertipiko ng Kamatayan",
        "cert-death-desc": "Magrehistro ng sertipiko ng kamatayan at kumuha ng permit para sa libing/paglipat",
        "cert-brgy-clearance": "Barangay Clearance",
        "cert-brgy-clearance-desc": "Sertipiko ng paninirahan mula sa iyong barangay",
        "cert-brgy-id": "Barangay ID",
        "cert-brgy-id-desc": "Opisyal na identification card ng barangay",
        "cert-police-clearance": "Police Clearance",
        "cert-police-clearance-desc": "Koordinasyon sa police clearance sa pamamagitan ng munisipal na opisina",

        // Certificates Page - Section Titles - Filipino
        "cert-offices-title": "Mga Responsableng Opisina",
        "cert-office-mcr": "Municipal Civil Registrar",
        "cert-office-mcr-desc": "Pagpaparehistro ng kapanganakan, kamatayan, kasal, mga pagwawasto, at mga certified copy",
        "cert-office-hrm": "Human Resource Management",
        "cert-office-hrm-desc": "Mga service record, employment certificate, at mga leave credit para sa mga empleyado ng LGU",

        // Common Labels - Filipino
        "label-fee": "Bayad:",
        "label-time": "Oras:",
        "label-same-day": "Parehong araw",
        "label-walk-in": "Walk-in",
        "label-schedule-varies": "Iba-iba ang iskedyul",
        "label-by-appointment": "Sa pamamagitan ng appointment",
        "label-free": "Libre",
        "label-free-subsidy": "Libre (subsidiya)",
        "label-1-3-days": "1-3 araw",
        "label-seasonal": "Pana-panahon",
        "label-subsidized": "May subsidiya",
        "label-by-schedule": "Ayon sa iskedyul",
        "label-varies": "Nag-iiba",

        // Health Services Page - Filipino
        "health-page-title": "Serbisyong Pangkalusugan",
        "health-page-desc": "Konsultasyong medikal, bakuna, at mga programa sa kalusugan",
        "health-page-badge": "Kalusugan",
        "health-consultation": "Konsultasyong Medikal",
        "health-consultation-desc": "Libreng konsultasyon sa Rural Health Units",
        "health-vaccination": "Mga Programa sa Bakuna",
        "health-vaccination-desc": "Serbisyo sa immunization para sa mga bata at matatanda",
        "health-maternal": "Pangangalaga sa Ina",
        "health-maternal-desc": "Serbisyo sa kalusugan bago at pagkatapos manganak",
        "health-medicine": "Tulong sa Gamot",
        "health-medicine-desc": "Tulong pinansyal para sa gamot sa pamamagitan ng MSWDO",
        "health-stat-facilities": "Kabuuang Pasilidad sa Kalusugan",
        "health-stat-hospitals": "Mga Pangunahing Ospital",
        "health-stat-bhs": "Barangay Health Stations",
        "health-stat-mho": "Opisina ng Kalusugan ng Munisipalidad",
        "health-section-hospitals": "Mga Ospital sa Solano",
        "health-section-mho": "Opisina ng Kalusugan ng Munisipalidad",
        "health-section-bhs": "Barangay Health Stations",
        "health-bhs-subtitle": "22 Barangay Health Stations/Centers na naglilingkod sa lahat ng barangay ng Solano",
        "health-mho-title": "Solano Municipal Health Office",
        "health-mho-desc": "Ang Municipal Health Office ay nagbibigay ng pangunahing serbisyo sa kalusugan kabilang ang lying-in facility at laboratory services. Ito ang pangunahing public health center ng munisipalidad.",
        "health-service-lying-in": "Lying-in Facility",
        "health-service-laboratory": "Serbisyo sa Laboratoryo",
        "health-service-immunization": "Immunization",
        "health-service-prenatal": "Pangangalaga Bago Manganak",
        "health-service-family-planning": "Pagpaplano ng Pamilya",
        "health-service-tb-dots": "TB-DOTS",

        // Agriculture Services Page - Filipino
        "agri-page-title": "Serbisyo sa Agrikultura",
        "agri-page-desc": "Suporta sa mga magsasaka at pag-unlad ng agrikultura",
        "agri-page-badge": "Agrikultura",
        "agri-seedling": "Pamamahagi ng Punla",
        "agri-seedling-desc": "Libreng buto at punla para sa mga magsasaka",
        "agri-equipment": "Kagamitan sa Bukid",
        "agri-equipment-desc": "Renta at tulong sa kagamitan",
        "agri-livelihood": "Mga Programa sa Kabuhayan",
        "agri-livelihood-desc": "Pagsasanay at suporta para sa mga magsasaka",
        "agri-office-mao": "Opisina ng Agrikultura ng Munisipalidad",
        "agri-office-mao-desc": "Pagpaparehistro sa RSBSA, mga sertipikasyon, programa sa palay/mais, livestock, serbisyo sa pangisdaan",

        // Ordinance Framework Page - Filipino
        "ord-page-title": "Balangkas ng Ordinansa",
        "ord-page-desc": "Mga ordinansang ipinasa ng Sangguniang Bayan ng Solano",
        "ord-page-badge": "Lehislatura",
        "ord-what-is": "Ano ang Ordinansa?",
        "ord-what-is-p1": "Ang munisipal na ordinansa ay lokal na batas na ipinasa ng Sangguniang Bayan (Konseho ng Munisipalidad) na namamahala sa munisipalidad at mga residente nito. Ang mga ordinansa ay may bisa at epekto ng batas sa saklaw ng munisipalidad.",
        "ord-what-is-p2": "Ang mga ordinansa ay maaaring sumasaklaw sa iba't ibang paksa kabilang ngunit hindi limitado sa: pagbubuwis, regulasyon sa negosyo, kaligtasang pampubliko, proteksyon sa kapaligiran, pamamahala ng trapiko, at zoning.",
        "ord-categories-title": "Mga Kategorya ng Ordinansa",
        "ord-cat-revenue": "Kita at Pagbubuwis",
        "ord-cat-business": "Negosyo at Kalakalan",
        "ord-cat-safety": "Kaligtasang Pampubliko",
        "ord-cat-environment": "Kapaligiran",
        "ord-cat-traffic": "Trapiko at Transportasyon",
        "ord-cat-zoning": "Zoning at Paggamit ng Lupa",
        "ord-2025-title": "Mga Ordinansa ng 2025",
        "ord-2025-subtitle": "Mga opisyal na ordinansang ipinasa ng Sangguniang Bayan ng Solano sa 2025",
        "ord-table-number": "Numero ng Ordinansa",
        "ord-table-title": "Pamagat",
        "ord-table-date": "Petsa ng Sesyon",
        "ord-view-all": "Tingnan Lahat ng Ordinansa sa SB Website",

        // Resolution Framework Page - Filipino
        "reso-page-title": "Balangkas ng Resolusyon",
        "reso-page-desc": "Mga resolusyong ipinasa ng Sangguniang Bayan ng Solano",
        "reso-page-badge": "Lehislatura",
        "reso-what-is": "Ano ang Resolusyon?",
        "reso-what-is-p1": "Ang resolusyon ay pormal na pagpapahayag ng opinyon o kalooban ng Sangguniang Bayan. Hindi tulad ng mga ordinansa, ang mga resolusyon ay walang bisa at epekto ng batas ngunit nagsisilbing opisyal na pahayag ng lehislatura.",
        "reso-what-is-p2": "Ang mga resolusyon ay karaniwang ginagamit para sa: mga pagpupugay, mga kahilingan sa mas mataas na ahensya ng pamahalaan, mga pagpapahayag ng suporta o pagtutol, at mga administratibong bagay ng Sangguniang Bayan.",
        "reso-types-title": "Mga Uri ng Resolusyon",
        "reso-type-commendation": "Pagpupugay",
        "reso-type-request": "Kahilingan/Apela",
        "reso-type-support": "Suporta/Endorsement",
        "reso-type-condolence": "Pakikiramay",
        "reso-type-authorization": "Awtorisasyon",
        "reso-type-appropriation": "Apropriyasyon",
        "reso-2025-title": "Mga Resolusyon ng 2025",
        "reso-2025-subtitle": "Mga opisyal na resolusyong ipinasa ng Sangguniang Bayan ng Solano sa 2025",
        "reso-table-number": "Numero ng Resolusyon",
        "reso-table-title": "Pamagat",
        "reso-table-date": "Petsa ng Sesyon",
        "reso-view-all": "Tingnan Lahat ng Resolusyon sa SB Website",

        // Business Services Page - Filipino
        "biz-page-title": "Serbisyo sa Negosyo",
        "biz-page-desc": "Mga permit, lisensya, at suporta para sa mga negosyo sa Solano",
        "biz-page-badge": "Negosyo",
        "biz-permit-new": "Permit sa Negosyo (Bago)",
        "biz-permit-new-desc": "Mag-apply ng bagong mayor's permit para sa negosyo",
        "biz-permit-renew": "Pag-renew ng Permit sa Negosyo",
        "biz-permit-renew-desc": "I-renew ang taunang permit sa negosyo",
        "biz-closure": "Pagsasara ng Negosyo",
        "biz-closure-desc": "Mag-file para sa pagsasara ng negosyo",
        "biz-cedula": "Community Tax Certificate",
        "biz-cedula-desc": "Kumuha ng cedula para sa mga indibidwal at negosyo",
        "biz-online-title": "Online na Transaksiyon sa Negosyo",
        "biz-online-subtitle": "Kumpletuhin ang mga transaksiyon sa negosyo online sa pamamagitan ng opisyal na Filipizen portal",
        "biz-online-badge": "Mga Online na Serbisyo sa Filipizen",
        "biz-billing": "Online Billing at Pagbabayad para sa Negosyo",
        "biz-billing-desc": "Tingnan at bayaran ang mga bill sa buwis ng negosyo online",
        "biz-new-app": "Bagong Aplikasyon sa Negosyo",
        "biz-new-app-desc": "Mag-apply ng bagong permit sa negosyo online",
        "biz-renewal": "Pag-renew ng Permit sa Negosyo",
        "biz-renewal-desc": "I-renew ang umiiral na permit sa negosyo online",
        "label-3-5-days": "3-5 araw",
        "label-1-2-days": "1-2 araw",

        // Tax & Payments Page - Filipino
        "tax-page-title": "Buwis at Pagbabayad",
        "tax-page-desc": "Buwis sa ari-arian, mga bayarin, at serbisyo sa pagbabayad",
        "tax-page-badge": "Pagbubuwis",
        "tax-real-property": "Real Property Tax",
        "tax-real-property-desc": "Taunang bayad sa buwis para sa lupa at gusali",
        "tax-business": "Buwis sa Negosyo",
        "tax-business-desc": "Mga bayad sa buwis na may kaugnayan sa negosyo",
        "tax-online-title": "Online na Transaksiyon sa Buwis",
        "tax-online-subtitle": "Magbayad ng buwis at bayarin online sa pamamagitan ng opisyal na Filipizen portal",
        "tax-rpt-billing": "Billing at Pagbabayad ng Real Property Tax",
        "tax-rpt-billing-desc": "Tingnan at bayaran ang real property tax (amilyar) online",
        "tax-payment-order": "Online na Payment Order",
        "tax-payment-order-desc": "Iproseso ang mga payment order para sa iba't ibang bayad sa munisipalidad",
        "label-based-on-value": "Batay sa natatasa na halaga",

        // Social Services Page - Filipino
        "social-page-title": "Serbisyong Panlipunan",
        "social-page-desc": "Mga programa sa kapakanan, tulong, at suporta sa komunidad",
        "social-page-badge": "Kapakanan ng Lipunan",
        "social-senior": "Serbisyo sa Senior Citizens",
        "social-senior-desc": "ID, benepisyo, at diskwento para sa mga senior citizens",
        "social-pwd": "Serbisyo sa PWD",
        "social-pwd-desc": "ID, benepisyo, at tulong para sa mga may kapansanan",
        "social-solo": "Benepisyo ng Solo Parent",
        "social-solo-desc": "ID at benepisyo para sa mga solo parents",
        "social-4ps": "Programa ng 4Ps",
        "social-4ps-desc": "Pagpaparehisto sa Pantawid Pamilyang Pilipino Program",
        "social-assistance": "Tulong Pinansyal",
        "social-assistance-desc": "Pang-emergency na tulong at programa sa pagpapalibing",

        // Education Page - Filipino
        "edu-page-title": "Serbisyo sa Edukasyon",
        "edu-page-desc": "Mga iskolarship, programa sa pagsasanay, at suportang pang-edukasyon",
        "edu-page-badge": "Edukasyon",
        "edu-scholarship": "Mga Programa sa Iskolarship",
        "edu-scholarship-desc": "Tulong pinansyal para sa mga karapat-dapat na estudyante",
        "edu-tle": "Kagamitan sa TLE",
        "edu-tle-desc": "Kagamitan sa teknolohiya at pangkabuhayan para sa mga paaralan",
        "edu-training": "Pagsasanay sa Kasanayan",
        "edu-training-desc": "Mga programa sa bokasyonal at pagpapaunlad ng kasanayan",

        // Infrastructure Page - Filipino
        "infra-page-title": "Serbisyo sa Imprastraktura",
        "infra-page-desc": "Pagpapanatili ng daan, pasilidad, at mga pampublikong utility",
        "infra-page-badge": "Imprastraktura",
        "infra-road": "Pagpapanatili ng Daan",
        "infra-road-desc": "Kahilingan para sa pagkukumpuni at pagpapanatili ng daan",
        "infra-water": "Serbisyo sa Tubig",
        "infra-water-desc": "Koneksyon at serbisyo sa sistema ng tubig",
        "infra-building": "Mga Permit sa Gusali",
        "infra-building-desc": "Mga permit sa konstruksiyon at renobasyón",

        // Public Safety Page - Filipino
        "safety-page-title": "Kaligtasang Pampubliko",
        "safety-page-desc": "Serbisyo ng pulis, paghahanda sa sakuna, at pagtugon sa emerhensiya",
        "safety-page-badge": "Kaligtasang Pampubliko",
        "safety-police": "Serbisyo ng Pulis",
        "safety-police-desc": "Mga clearance, police blotter, at tulong",
        "safety-fire": "Kaligtasan sa Sunog",
        "safety-fire-desc": "Fire clearance at serbisyo sa inspeksyon",
        "safety-disaster": "Serbisyo sa Sakuna",
        "safety-disaster-desc": "MDRRMO pagtugon sa emerhensiya at paghahanda",

        // Environment Page - Filipino
        "env-page-title": "Serbisyo sa Kapaligiran",
        "env-page-desc": "Mga permit sa kapaligiran, pamamahala ng basura, at sustainability",
        "env-page-badge": "Kapaligiran",
        "env-clearance": "Environmental Clearance",
        "env-clearance-desc": "Mga permit sa kapaligiran para sa mga proyekto at negosyo",
        "env-waste": "Pamamahala ng Basura",
        "env-waste-desc": "Koleksyon ng basura at serbisyo sa pagtatapon",
        "env-tree": "Permit sa Pagputol ng Puno",
        "env-tree-desc": "Permit para sa pagputol at pag-aalis ng puno",

        // Common Section Titles - Filipino
        "section-responsible-offices": "Mga Responsableng Opisina",

        // Government Page
        "gov-title": "Istruktura at Opisyal ng Pamahalaan",
        "gov-subtitle": "Kilalanin ang pamunuan at mga opisina na naglilingkod sa Solano",
        "gov-executive": "Ehekutibong Sangay",
        "gov-sb-members": "Mga Miyembro ng Sangguniang Bayan",
        "gov-sb-subtitle": "Mga Konsehal na naglilingkod sa mga tao ng Solano",
        "gov-departments": "Mga Pinuno ng Departamento at Pangunahing Opisina",
        "gov-dept-subtitle": "Mga opisina ng munisipalidad na nagbibigay ng serbisyo sa mga mamamayan",
        "gov-barangays": "Mga Barangay ng Solano",
        "gov-barangays-count": "22 Barangay na naglilingkod sa ating komunidad",
        "gov-organizational-chart": "Tsart ng Organisasyon",
        "gov-term": "Termino",

        // Budget Page
        "budget-title": "Badyet at Transparensiya sa Pananalapi",
        "budget-subtitle": "Pagsubaybay sa pananalapi at proyekto ng munisipalidad para sa pananagutan",
        "budget-overview": "Pangkalahatang-ideya ng Badyet ng Munisipalidad 2025",
        "budget-total": "Kabuuang Badyet",
        "budget-personnel": "Serbisyo sa Tauhan",
        "budget-operations": "Operasyon",
        "budget-capital": "Capital Outlay",
        "budget-by-dept": "Badyet Ayon sa Departamento",
        "budget-projects": "Mga Pangunahing Proyekto 2025",
        "budget-reports": "Mga Ulat at Dokumento sa Pananalapi",
        "budget-metrics": "Mga Sukatan ng Transparensiya",
        "budget-utilization": "Rate ng Paggamit ng Badyet",
        "budget-foi": "Mga Kahilingan sa Freedom of Information",
        "budget-response-time": "Average na Oras ng Pagtugon",
        "budget-annual-report": "Taunang Ulat sa Pananalapi",
        "budget-quarterly": "Quarterly na Ulat",

        // FAQ Page
        "faq-title": "Mga Madalas Itanong",
        "faq-subtitle": "Hanapin ang mga sagot sa mga karaniwang tanong tungkol sa mga serbisyong munisipal",
        "faq-general": "Mga Pangkalahatang Tanong",
        "faq-certificates": "Mga Sertipiko at Dokumento",
        "faq-business": "Negosyo at Permit",
        "faq-payments": "Pagbabayad at Bayarin",
        "faq-social": "Serbisyong Panlipunan",
        "faq-technical": "Mga Teknikal na Tanong",
        "faq-still-questions": "May tanong pa ba?",
        "faq-contact-help": "Kung hindi mo nahanap ang sagot na hinahanap mo, huwag mag-atubiling makipag-ugnayan sa amin. Nandito kami para tumulong!",
        "faq-search": "Maghanap sa FAQ",

        // Contact Page
        "contact-title": "Makipag-ugnayan sa Amin",
        "contact-subtitle": "Nandito kami para tumulong. Makipag-ugnayan sa amin sa alinman sa mga channel na ito.",
        "contact-send-message": "Magpadala ng Mensahe",
        "contact-form-subtitle": "May tanong, mungkahi, o feedback? Punan ang form sa ibaba.",
        "contact-office-hours": "Oras ng Opisina",
        "contact-regular-hours": "Regular na Oras",
        "contact-closed": "Sarado",
        "contact-emergency": "Emergency Hotline",
        "contact-hotlines": "Mga Emergency Hotline",
        "contact-hotlines-desc": "Para sa mga emergency at katanungan, tawagan ang mga numerong ito anumang oras.",
        "contact-weekends": "Sabado, Linggo at Piyesta Opisyal",
        "contact-send-btn": "Ipadala ang Mensahe",
        "contact-police": "Pulis",
        "contact-fire": "Bumbero",
        "contact-medical": "Medikal",
        "contact-disaster": "Pagtugon sa Sakuna",

        // Form Labels
        "form-name": "Buong Pangalan",
        "form-email": "Email Address",
        "form-phone": "Numero ng Telepono",
        "form-subject": "Paksa",
        "form-message": "Mensahe",
        "form-select-subject": "Pumili ng paksa...",
        "form-service-inquiry": "Katanungan sa Serbisyo",
        "form-complaint": "Reklamo",
        "form-suggestion": "Mungkahi",
        "form-general": "Pangkalahatang Tanong",
        "form-website-issue": "Problema sa Website",
        "form-request-response": "Nais kong makatanggap ng tugon",
        "form-required": "Kinakailangan",
        "form-optional": "Opsyonal",
        "form-submit": "Isumite",
        "form-cancel": "Kanselahin",
        "form-success": "Matagumpay na naipadala ang iyong mensahe!",
        "form-error": "May error sa pagpapadala ng iyong mensahe. Pakisubukan muli.",
        "form-sending": "Ipinapadala...",
        "form-clear": "I-clear ang Form",

        // Accessibility Page
        "access-title": "Pahayag ng Aksesibilidad",
        "access-subtitle": "Ang aming dedikasyon sa digital na aksesibilidad para sa lahat ng mamamayan",
        "access-commitment": "Ang Aming Dedikasyon",
        "access-conformance": "Katayuan ng Pagsunod",
        "access-features": "Mga Feature ng Aksesibilidad",
        "access-limitations": "Mga Kilalang Limitasyon",
        "access-alternative": "Alternatibong Paraan ng Pag-access",
        "access-feedback": "Puna",
        "access-technical": "Mga Teknikal na Detalye",
        "access-assessment": "Paraan ng Pagsusuri",
        "access-promise": "Ang Aming Pangako",

        // Legislative Page
        "legislative-title": "Impormasyon sa Lehislatura",
        "legislative-subtitle": "Mga ordinansa, resolusyon, at mga rekord ng lehislatura",
        "legislative-ordinances": "Mga Ordinansa",
        "legislative-resolutions": "Mga Resolusyon",
        "legislative-pending": "Nakabinbin",
        "legislative-approved": "Naaprubahan",
        "legislative-enacted": "Naisabatas",

        // News Page
        "news-title": "Balita at Anunsyo",
        "news-subtitle": "Pinakabagong balita mula sa Munisipalidad ng Solano",
        "news-latest": "Pinakabagong Balita",
        "news-announcements": "Mga Anunsyo",
        "news-events": "Mga Kaganapan",
        "news-posted": "Nai-post",
        "news-by": "Ni",

        // Sitemap Page
        "sitemap-title": "Mapa ng Site",
        "sitemap-subtitle": "Kumpletong direktoryo ng lahat ng pahina sa website na ito",

        // Privacy Page
        "privacy-title": "Patakaran sa Pagkapribado",
        "privacy-subtitle": "Paano namin kinokolekta, ginagamit, at pinoprotektahan ang iyong impormasyon",

        // Terms Page
        "terms-title": "Mga Tuntunin ng Paggamit",
        "terms-subtitle": "Mga tuntunin at kondisyon sa paggamit ng website na ito",

        // Common UI Elements
        "loading": "Naglo-load...",
        "error": "Error",
        "success": "Tagumpay",
        "warning": "Babala",
        "info": "Impormasyon",
        "close": "Isara",
        "back": "Bumalik",
        "next": "Susunod",
        "previous": "Nakaraan",
        "save": "I-save",
        "delete": "Burahin",
        "edit": "I-edit",
        "view": "Tingnan",
        "print": "I-print",
        "share": "Ibahagi",
        "copy": "Kopyahin",
        "search": "Maghanap",
        "filter": "Salain",
        "sort": "Ayusin",
        "all": "Lahat",
        "none": "Wala",
        "yes": "Oo",
        "no": "Hindi",
        "or": "o",
        "and": "at",
        "more": "Higit pa",
        "less": "Mas kaunti",
        "show-more": "Ipakita ang Higit Pa",
        "show-less": "Ipakita ang Mas Kaunti",
        "expand": "Palawakin",
        "collapse": "I-collapse",
        "refresh": "I-refresh",
        "reset": "I-reset",
        "apply": "Ilapat",
        "confirm": "Kumpirmahin",
        "cancel": "Kanselahin",
        "ok": "OK",
        "done": "Tapos na",
        "continue": "Magpatuloy",
        "skip": "Laktawan",
        "help": "Tulong",
        "about": "Tungkol sa",
        "home": "Tahanan",
        "menu": "Menu",
        "settings": "Mga Setting",
        "language": "Wika",
        "date": "Petsa",
        "time": "Oras",
        "today": "Ngayon",
        "yesterday": "Kahapon",
        "tomorrow": "Bukas",
        "week": "Linggo",
        "month": "Buwan",
        "year": "Taon",
        "total": "Kabuuan",
        "available": "Magagamit",
        "unavailable": "Hindi Magagamit",
        "online": "Online",
        "offline": "Offline",
        "open": "Bukas",
        "closed": "Sarado",
        "new": "Bago",
        "updated": "Na-update",
        "popular": "Sikat",
        "featured": "Tampok",
        "recommended": "Inirerekomenda",

        // Time-related
        "minutes": "minuto",
        "hours": "oras",
        "days": "araw",
        "weeks": "linggo",
        "months": "buwan",
        "same-day": "Parehong araw",
        "instant": "Agad-agad",
        "varies": "Nag-iiba",

        // Currency
        "peso": "Piso",
        "free": "Libre",

        // Hotline labels
        "hotline-police": "Pulis",
        "hotline-fire": "Bumbero",
        "hotline-mswdo": "MSWDO",
        "hotline-mdrrmo": "MDRRMO",
        "hotline-dilg": "DILG"
    },


    ilo: {
        // Navigation - Ilocano (Iloko)
        "nav-home": "Pagtaengan",
        "nav-services": "Dagiti Serbisio",
        "nav-government": "Gobierno",
        "nav-statistics": "Estadistika",
        "nav-legislative": "Lehislatura",
        "nav-transparency": "Kinasiluag",
        "nav-contact": "Kontaken",
        "nav-budget": "Badyet",
        "nav-news": "Damag",
        "nav-faq": "Saludsod",
        "nav-sitemap": "Mapa ti Site",
        "nav-privacy": "Pagkapribado",
        "nav-terms": "Dagiti Kondision",
        "nav-accessibility": "Aksesibilidad",

        // Statistics Page
        "stats-title": "Estadistika ti Munisipalidad",
        "stats-subtitle": "Datos ken estadistika maipapan iti Solano, Nueva Vizcaya",
        "stats-demographics": "Pakabuklan ti Demograpiya",
        "stats-economic": "Dagiti Pagilasinan ti Ekonomiya",
        "stats-barangay": "Populasion Sigun iti Barangay",
        "stats-population": "Populasion",
        "stats-land-area": "Kalawa ti Daga",
        "stats-density": "Densidad ti Populasion",
        "stats-households": "Dagiti Sangakabbalayan",
        "stats-growth-rate": "Rate ti Panagdakkel",

        // Breadcrumbs
        "breadcrumb-home": "Pagtaengan",
        "breadcrumb-services": "Dagiti Serbisio",
        "breadcrumb-government": "Gobierno",
        "breadcrumb-budget": "Badyet ken Kinasiluag",
        "breadcrumb-contact": "Kontaken",
        "breadcrumb-faq": "Masansan a Maisaludsod",
        "breadcrumb-accessibility": "Aksesibilidad",
        "breadcrumb-statistics": "Estadistika",
        "breadcrumb-legislative": "Lehislatura",
        "breadcrumb-news": "Damag",
        "breadcrumb-sitemap": "Mapa ti Site",
        "breadcrumb-privacy": "Pagannurotan ti Pagkapribado",
        "breadcrumb-terms": "Dagiti Kondision ti Panagusar",

        // Hero Section
        "hero-welcome": "Naragsak a Panangyawat iti BetterSolano.org",
        "hero-subtitle": "Aksesen dagiti serbisio ti gobierno, impormasion, ken dagiti rekurso para kadagiti umili ti Solano, Nueva Vizcaya.",
        "hero-browse": "Kitaen dagiti Serbisio",
        "hero-contact": "Kontaken Dakami",
        "hero-search-placeholder": "Agsapul ti serbisio...",
        "hero-find-service": "Agsapul ti Serbisio",

        // Appointment CTA
        "appointment-cta-heading": "Panagpasayaat ti Serbisio ti Appointment ti Opisina ti Alkalde ti LGU Solano",
        "appointment-cta-subtitle": "Awan pila. Awan agpapasubli. Nasayaat nga appointment laeng.",
        "appointment-schedule-btn": "Ag-iskedyul ti Appointment",
        "appointment-create-btn": "Agaramid ti Account",

        // Popular Services
        "section-popular": "Dagiti Popular a Serbisio",
        "service-certificates": "Dagiti Sertipiko",
        "service-certificates-desc": "Sertipiko ti pannakayanak, kasar, ken ipapatay",
        "service-business": "Dagiti Permit ti Negosio",
        "service-business-desc": "Baro a permit ken panagpabaro",
        "service-tax": "Panagbayad ti Buis",
        "service-tax-desc": "Buis ti sanikua ken negosio",
        "service-social": "Serbisio Sosial",
        "service-social-desc": "Serbisio para kadagiti senior citizen ken PWD",
        "service-health": "Serbisio ti Salun-at",
        "service-health-desc": "Tulong medikal ken dagiti programa",
        "btn-view-all-services": "Kitaen Amin a Serbisio",
        "btn-view-services": "Kitaen dagiti Serbisio",
        "btn-learn-more": "Ammuem Pay",
        "btn-apply-now": "Ag-apply Itan",
        "btn-download": "I-download",
        "btn-get-started": "Mangrugi",
        "btn-submit": "Iysubmit",

        // Latest Updates
        "section-updates": "Kabarbaro nga Update",
        "btn-view-all": "Kitaen Amin",
        "btn-read-more": "Agbasa Pay",

        // Municipal Leadership
        "section-leadership": "Panangidaulo ti Munisipalidad",
        "title-mayor": "Mayor ti Munisipalidad",
        "title-vice-mayor": "Bise Mayor ti Munisipalidad",
        "title-councilor": "Konsehal",
        "title-secretary": "Sekretario",
        "btn-view-officials": "Kitaen Amin nga Opisial",

        // Contact Section
        "section-contact": "Impormasion ti Panagkontak",
        "contact-phone": "Telepono",
        "contact-email": "Email",
        "contact-address": "Adres",
        "contact-visit": "Bisitaen Dakami",
        "contact-hours": "Lunes-Biernes: 8:00 AM - 5:00 PM",
        "contact-response": "Sumungbat kami iti uneg ti 24 nga oras",
        "contact-municipal-hall": "Munisipio",
        "contact-location": "Lokasion",
        "contact-directions": "Alaen ti Direksion",

        // Footer
        "footer-title": "Better Solano",
        "footer-desc": "Maysa a portal ti impormasion a mangipangpangruna ti serbisio para iti Munisipalidad ti Solano, Nueva Vizcaya.",
        "footer-quick-links": "Dagiti Napartak a Silpo",
        "footer-all-services": "Amin a Serbisio",
        "footer-officials": "Dagiti Opisial",
        "footer-contact-us": "Kontaken Dakami",
        "footer-faq": "Masansan a Maisaludsod",
        "footer-contact": "Kontak",
        "footer-copyright": "Better Solano. Amin a karbengan ket naireserbado.",
        "accessibility-statement": "Pahayag ti Aksesibilidad",
        "footer-privacy": "Pagannurotan ti Pagkapribado",
        "footer-terms": "Dagiti Kondision ti Panagusar",
        "footer-resources": "Dagiti Rekurso",
        "footer-volunteer": "Ag-volunteer kadakami",
        "footer-contribute": "Ag-ambag ti code kadakami",

        // Services Page
        "services-title": "Direktorio ti Serbisio ti Munisipalidad",
        "services-subtitle": "Kitaen amin a serbisio nga i-alok ti Munisipalidad ti Solano",
        "search-placeholder": "Agsapul ti serbisio...",
        "search-no-results": "Awan ti nasarakan a serbisio",
        "search-try-different": "Padasem ti sabali a keyword wenno kitaem dagiti kategorya iti baba",
        "search-results": "Dagiti Resulta ti Panagsapul",
        "search-showing": "Mangipakita ti {{count}} a resulta",
        "life-events-title": "Agsapul Sigun iti Pasamak iti Biag",
        "life-events-subtitle": "Biroken dagiti serbisio a naibatay iti mapasamak iti biagmo",
        "life-starting-business": "Mangrugi ti Negosio",
        "life-getting-married": "Agkasar",
        "life-having-baby": "Aganak",
        "life-financial-help": "Kasapulan ti Tulong Pinansia",
        "life-senior": "Serbisio para kadagiti Senior Citizen",
        "life-pwd": "Tao nga Addaan Kapansanan",
        "life-building": "Panagpatakder/Panagpasayaat ti Balay",
        "life-trouble": "Nairaman iti Problema",
        "life-death": "Ipapatay iti Pamilia",
        "life-education": "Edukasion ken Iskolarship",
        "life-employment": "Agsapsapul ti Trabaho",
        "life-property": "Dagiti Banag ti Sanikua",

        // Service Categories
        "cat-certificates": "Dagiti Sertipiko ken Vital Records",
        "cat-certificates-desc": "Sertipiko ti pannakayanak, ipapatay, kasar, ken dadduma pay a vital records.",
        "cat-business": "Negosio, Komersio ken Panagpamuhunan",
        "cat-business-desc": "Dagiti permit ti negosio, lisensia, ken serbisio ti panagparehistro ti komersio.",
        "cat-social": "Serbisio Sosial ken Tulong",
        "cat-social-desc": "Dagiti programa ti welfare, serbisio para kadagiti senior citizen, benepisio ti PWD, ken tulong pinansia.",
        "cat-health": "Salun-at ken Kinasalun-at",
        "cat-health-desc": "Dagiti programa ti bakuna, health certificates, ken tulong medikal.",
        "cat-tax": "Panagbuis ken Panagbayad",
        "cat-tax-desc": "Buis ti sanikua, buis ti negosio, panagbayad, ken tax clearance.",
        "cat-agriculture": "Agrikultura ken Panagrang-ay ti Ekonomiya",
        "cat-agriculture-desc": "Dagiti pautang ti agrikultura, insurance ti mula, tulong ti abono, ken panagsanay.",
        "cat-infrastructure": "Imprastraktura ken Pampubliko nga Obra",
        "cat-infrastructure-desc": "Dagiti permit ti konstruksion, dawat ti panagmantener ti kalsada, ken pampubliko a pasilidad.",
        "cat-education": "Edukasion ken Iskolarship",
        "cat-education-desc": "Dagiti programa ti iskolarship, tulong ti estudiante, ken dagiti grant ti edukasion.",
        "cat-safety": "Kinatalged ken Seguridad ti Publiko",
        "cat-safety-desc": "Dagiti serbisio ti emergency, panagisagana iti didigra, ken dagiti programa ti kinatalged ti komunidad.",
        "cat-environment": "Aglawlaw ken Dagiti Natural a Rekurso",
        "cat-environment-desc": "Dagiti permit ti aglawlaw, panagtaripato ti basura, ken dagiti programa ti konserbasion.",
        "cat-online": "Dagiti Online a Serbisio",
        "cat-online-desc": "Dagiti digital a serbisio a magun-od iti Filipizen ken dadduma pay nga online platform.",
        "cat-government": "Dagiti Serbisio ti Gobierno",
        "cat-government-desc": "Sapasap a serbisio ti munisipalidad ken dagiti administratibo a tungkulin.",

        // Service Details
        "service-requirements": "Dagiti Kasapulan",
        "service-steps": "Dagiti Addang",
        "service-fees": "Dagiti Bayadan",
        "service-processing-time": "Tiempo ti Panagproseso",
        "service-office": "Opisina",
        "service-schedule": "Iskedyul",
        "service-contact": "Kontaken",
        "service-notes": "Napateg a Paammo",
        "service-related": "Dagiti Mainaig a Serbisio",
        "service-how-to-apply": "Kasano ti Ag-apply",
        "service-documents-needed": "Dagiti Dokumento a Kasapulan",
        "service-where-to-go": "Sadino ti Papanan",
        "service-online-available": "Magun-od Online",
        "service-walk-in": "Walk-in",
        "service-by-appointment": "Babaen ti Appointment",
        "service-free": "Libre",
        "service-varies": "Agduduma",
        "service-same-day": "Iti Isu Met Laeng nga Aldaw",
        "service-instant": "Dagus",

        // Certificates Page - Page Header - Ilocano
        "cert-page-title": "Dagiti Sertipiko ken Vital Records",
        "cert-page-desc": "Dagiti opisial a dokumento para iti pannakayanak, ipapatay, kasar, ken dadduma pay a vital records",
        "cert-page-badge": "Dagiti Sertipiko",

        // Certificates Page - Service Items - Ilocano
        "cert-birth": "Sertipiko ti Pannakayanak",
        "cert-birth-desc": "Mangala ti certified copy ti sertipiko ti pannakayanak a nakarehistro idiay Solano",
        "cert-marriage": "Sertipiko ti Kasar",
        "cert-marriage-desc": "Agrehistro wenno agkiddaw ti certified true copy ti sertipiko ti kasar",
        "cert-death": "Sertipiko ti Ipapatay",
        "cert-death-desc": "Irehistro ti sertipiko ti ipapatay ken mangala ti permit para iti panagiponpon/panagyalis",
        "cert-brgy-clearance": "Barangay Clearance",
        "cert-brgy-clearance-desc": "Sertipiko ti panagnaed manipud iti barangay mo",
        "cert-brgy-id": "Barangay ID",
        "cert-brgy-id-desc": "Opisial a tarjeta ti panakilala ti barangay",
        "cert-police-clearance": "Police Clearance",
        "cert-police-clearance-desc": "Koordinasion ti police clearance babaen iti opisina ti munisipalidad",

        // Certificates Page - Section Titles - Ilocano
        "cert-offices-title": "Dagiti Responsable nga Opisina",
        "cert-office-mcr": "Municipal Civil Registrar",
        "cert-office-mcr-desc": "Panagirehistro ti pannakayanak, ipapatay, kasar, dagiti pannakabaliw, ken dagiti certified copy",
        "cert-office-hrm": "Human Resource Management",
        "cert-office-hrm-desc": "Dagiti service record, employment certificate, ken dagiti leave credit para kadagiti empleyado ti LGU",

        // Common Labels - Ilocano
        "label-fee": "Bayad:",
        "label-time": "Tiempo:",
        "label-same-day": "Iti dayta met laeng nga aldaw",
        "label-walk-in": "Walk-in",
        "label-schedule-varies": "Agduduma ti iskedyul",
        "label-by-appointment": "Babaen ti appointment",
        "label-free": "Libre",
        "label-free-subsidy": "Libre (subsidiya)",
        "label-1-3-days": "1-3 nga aldaw",
        "label-seasonal": "Panawen-panawen",
        "label-subsidized": "May subsidiya",
        "label-by-schedule": "Sigun iti iskedyul",
        "label-varies": "Agduduma",

        // Health Services Page - Ilocano
        "health-page-title": "Serbisio ti Salun-at",
        "health-page-desc": "Konsulta medikal, bakuna, ken dagiti programa ti salun-at",
        "health-page-badge": "Salun-at",
        "health-consultation": "Konsulta Medikal",
        "health-consultation-desc": "Libre a konsulta kadagiti Rural Health Units",
        "health-vaccination": "Dagiti Programa ti Bakuna",
        "health-vaccination-desc": "Serbisio ti immunization para kadagiti ubbing ken nataengan",
        "health-maternal": "Panangaywan iti Ina",
        "health-maternal-desc": "Serbisio ti salun-at sakbay ken kalpasan ti panaganak",
        "health-medicine": "Tulong iti Agas",
        "health-medicine-desc": "Tulong pinansyal para iti agas babaen ti MSWDO",
        "health-stat-facilities": "Dagup a Pasilidad ti Salun-at",
        "health-stat-hospitals": "Dagiti Kangrunaan nga Ospital",
        "health-stat-bhs": "Barangay Health Stations",
        "health-stat-mho": "Opisina ti Salun-at ti Munisipalidad",
        "health-section-hospitals": "Dagiti Ospital idiay Solano",
        "health-section-mho": "Opisina ti Salun-at ti Munisipalidad",
        "health-section-bhs": "Barangay Health Stations",
        "health-bhs-subtitle": "22 a Barangay Health Stations/Centers a mangserserbisio iti amin a barangay ti Solano",
        "health-mho-title": "Solano Municipal Health Office",
        "health-mho-desc": "Ti Municipal Health Office ket mangted ti kangrunaan a serbisio ti salun-at a mairaman ti lying-in facility ken serbisio ti laboratorio. Daytoy ti kangrunaan a public health center ti munisipalidad.",
        "health-service-lying-in": "Lying-in Facility",
        "health-service-laboratory": "Serbisio ti Laboratorio",
        "health-service-immunization": "Immunization",
        "health-service-prenatal": "Panangyawan Sakbay Panaganak",
        "health-service-family-planning": "Panagplano ti Pamilya",
        "health-service-tb-dots": "TB-DOTS",

        // Agriculture Services Page - Ilocano
        "agri-page-title": "Serbisio ti Agrikultura",
        "agri-page-desc": "Suporta kadagiti mannalon ken progreso ti agrikultura",
        "agri-page-badge": "Agrikultura",
        "agri-seedling": "Panangibuno ti Mula",
        "agri-seedling-desc": "Libre a buto ken mula para kadagiti mannalon",
        "agri-equipment": "Gamit iti Talon",
        "agri-equipment-desc": "Pagrenta ken tulong iti gamit",
        "agri-livelihood": "Dagiti Programa ti Panagbiag",
        "agri-livelihood-desc": "Panagsanay ken suporta para kadagiti mannalon",
        "agri-office-mao": "Opisina ti Agrikultura ti Munisipalidad",
        "agri-office-mao-desc": "Panagrehistro iti RSBSA, sertipikasion, programa ti irik/mais, livestock, serbisio ti panagkalap",

        // Ordinance Framework Page - Ilocano
        "ord-page-title": "Balangkas ti Ordinansa",
        "ord-page-desc": "Dagiti ordinansa a naipasa ti Sangguniang Bayan ng Solano",
        "ord-page-badge": "Lehislatura",
        "ord-what-is": "Ania ti Ordinansa?",
        "ord-what-is-p1": "Ti munisipal nga ordinansa ket lokal a linteg a naipasa ti Sangguniang Bayan (Konseho ti Munisipalidad) a mangituray ti munisipalidad ken dagiti residente na. Dagiti ordinansa ket addaan ti pigsa ken epekto ti linteg iti saklaw ti munisipalidad.",
        "ord-what-is-p2": "Dagiti ordinansa ket mabalin a manakup kadagiti nadumaduma a paksa a mairaman ngem saan a limitado iti: panagbuwis, regulasion ti negosio, kaligtasan pampubliko, proteksion ti aglawlaw, panagtaripato ti trapiko, ken zoning.",
        "ord-categories-title": "Dagiti Kategorya ti Ordinansa",
        "ord-cat-revenue": "Kita ken Panagbuwis",
        "ord-cat-business": "Negosio ken Kalakalan",
        "ord-cat-safety": "Kaligtasan Pampubliko",
        "ord-cat-environment": "Aglawlaw",
        "ord-cat-traffic": "Trapiko ken Transportasion",
        "ord-cat-zoning": "Zoning ken Panagusar ti Daga",
        "ord-2025-title": "Dagiti Ordinansa ti 2025",
        "ord-2025-subtitle": "Dagiti opisial nga ordinansa a naipasa ti Sangguniang Bayan ng Solano iti 2025",
        "ord-table-number": "Numero ti Ordinansa",
        "ord-table-title": "Titulo",
        "ord-table-date": "Petsa ti Sesion",
        "ord-view-all": "Kitaen Amin nga Ordinansa iti SB Website",

        // Resolution Framework Page - Ilocano
        "reso-page-title": "Balangkas ti Resolusion",
        "reso-page-desc": "Dagiti resolusion a naipasa ti Sangguniang Bayan ng Solano",
        "reso-page-badge": "Lehislatura",
        "reso-what-is": "Ania ti Resolusion?",
        "reso-what-is-p1": "Ti resolusion ket pormal a panangibaga ti opinion wenno pagayatan ti Sangguniang Bayan. Saan a kas kadagiti ordinansa, dagiti resolusion ket awan ti pigsa ken epekto ti linteg ngem agserbida a kas opisial a pahayag ti lehislatura.",
        "reso-what-is-p2": "Dagiti resolusion ket kadawyan a mausar para iti: panangpadayaw, dawat kadagiti nangatngato nga ahensya ti gobierno, panangibaga ti suporta wenno supiat, ken dagiti administratibo a banag ti Sangguniang Bayan.",
        "reso-types-title": "Dagiti Kita ti Resolusion",
        "reso-type-commendation": "Panangpadayaw",
        "reso-type-request": "Dawat/Apela",
        "reso-type-support": "Suporta/Endorsement",
        "reso-type-condolence": "Pakipaglungkot",
        "reso-type-authorization": "Awtorisasion",
        "reso-type-appropriation": "Apropriyasion",
        "reso-2025-title": "Dagiti Resolusion ti 2025",
        "reso-2025-subtitle": "Dagiti opisial a resolusion a naipasa ti Sangguniang Bayan ng Solano iti 2025",
        "reso-table-number": "Numero ti Resolusion",
        "reso-table-title": "Titulo",
        "reso-table-date": "Petsa ti Sesion",
        "reso-view-all": "Kitaen Amin a Resolusion iti SB Website",

        // Business Services Page - Ilocano
        "biz-page-title": "Serbisio ti Negosio",
        "biz-page-desc": "Dagiti permit, lisensya, ken suporta para kadagiti negosio idiay Solano",
        "biz-page-badge": "Negosio",
        "biz-permit-new": "Permit ti Negosio (Baro)",
        "biz-permit-new-desc": "Agaplikar ti baro a mayor's permit para iti negosio",
        "biz-permit-renew": "Panag-renew ti Permit ti Negosio",
        "biz-permit-renew-desc": "I-renew ti tawenantawen a permit ti negosio",
        "biz-closure": "Panagrikep ti Negosio",
        "biz-closure-desc": "Agpaila para iti panagrikep ti negosio",
        "biz-cedula": "Community Tax Certificate",
        "biz-cedula-desc": "Umala ti cedula para kadagiti indibidual ken negosio",
        "biz-online-title": "Online a Transaksiyon ti Negosio",
        "biz-online-subtitle": "Kompleto dagiti transaksiyon iti negosio online babaen ti opisial a Filipizen portal",
        "biz-online-badge": "Dagiti Online a Serbisio iti Filipizen",
        "biz-billing": "Online Billing ken Panagbayad para iti Negosio",
        "biz-billing-desc": "Kitaen ken bayadan dagiti bill ti buwis ti negosio online",
        "biz-new-app": "Baro nga Aplikasion iti Negosio",
        "biz-new-app-desc": "Agaplikar ti baro a permit ti negosio online",
        "biz-renewal": "Panag-renew ti Permit ti Negosio",
        "biz-renewal-desc": "I-renew ti adda a permit ti negosio online",
        "label-3-5-days": "3-5 nga aldaw",
        "label-1-2-days": "1-2 nga aldaw",

        // Tax & Payments Page - Ilocano
        "tax-page-title": "Buwis ken Panagbayad",
        "tax-page-desc": "Buwis ti daga, dagiti bayad, ken serbisio ti panagbayad",
        "tax-page-badge": "Panagbuwis",
        "tax-real-property": "Real Property Tax",
        "tax-real-property-desc": "Tawenantawen a bayad ti buwis para iti daga ken pasdek",
        "tax-business": "Buwis ti Negosio",
        "tax-business-desc": "Dagiti bayad ti buwis a mainaig iti negosio",
        "tax-online-title": "Online a Transaksiyon ti Buwis",
        "tax-online-subtitle": "Agbayad ti buwis ken bayad online babaen ti opisial a Filipizen portal",
        "tax-rpt-billing": "Billing ken Panagbayad ti Real Property Tax",
        "tax-rpt-billing-desc": "Kitaen ken bayadan ti real property tax (amilyar) online",
        "tax-payment-order": "Online a Payment Order",
        "tax-payment-order-desc": "Iproseso dagiti payment order para kadagiti nagduduma a bayad ti munisipalidad",
        "label-based-on-value": "Sigun iti napatasa a pateg",

        // Social Services Page - Ilocano
        "social-page-title": "Serbisio Panlipunan",
        "social-page-desc": "Dagiti programa ti kapakanan, tulong, ken suporta iti komunidad",
        "social-page-badge": "Kapakanan ti Lipunan",
        "social-senior": "Serbisio kadagiti Senior Citizens",
        "social-senior-desc": "ID, benepisio, ken diskwento para kadagiti senior citizens",
        "social-pwd": "Serbisio ti PWD",
        "social-pwd-desc": "ID, benepisio, ken tulong para kadagiti addaan kapansanan",
        "social-solo": "Benepisio ti Solo Parent",
        "social-solo-desc": "ID ken benepisio para kadagiti solo parents",
        "social-4ps": "Programa ti 4Ps",
        "social-4ps-desc": "Panagrehistro iti Pantawid Pamilyang Pilipino Program",
        "social-assistance": "Tulong Pinansyal",
        "social-assistance-desc": "Pang-emergensiya a tulong ken programa iti panagilibing",

        // Education Page - Ilocano
        "edu-page-title": "Serbisio ti Edukasion",
        "edu-page-desc": "Dagiti iskolarship, programa ti panagsanay, ken suporta iti edukasion",
        "edu-page-badge": "Edukasion",
        "edu-scholarship": "Dagiti Programa ti Iskolarship",
        "edu-scholarship-desc": "Tulong pinansyal para kadagiti maikari nga estudyante",
        "edu-tle": "Gamit ti TLE",
        "edu-tle-desc": "Gamit ti teknolohia ken pangkabuhayan para kadagiti eskuela",
        "edu-training": "Panagsanay ti Kasanayan",
        "edu-training-desc": "Dagiti programa ti bokasyonal ken panagtaray ti kasanayan",

        // Infrastructure Page - Ilocano
        "infra-page-title": "Serbisio ti Imprastraktura",
        "infra-page-desc": "Panagtartaripato ti dalan, pasilidad, ken dagiti pampubliko a utility",
        "infra-page-badge": "Imprastraktura",
        "infra-road": "Panagtartaripato ti Dalan",
        "infra-road-desc": "Dawat para iti panangaywan ken panagtartaripato ti dalan",
        "infra-water": "Serbisio ti Danum",
        "infra-water-desc": "Koneksion ken serbisio ti sistema ti danum",
        "infra-building": "Dagiti Permit ti Pasdek",
        "infra-building-desc": "Dagiti permit ti konstruksion ken renobasyón",

        // Public Safety Page - Ilocano
        "safety-page-title": "Kaligtasan Pampubliko",
        "safety-page-desc": "Serbisio ti pulis, panagsakana iti kalamidad, ken pagtugon iti emergensiya",
        "safety-page-badge": "Kaligtasan Pampubliko",
        "safety-police": "Serbisio ti Pulis",
        "safety-police-desc": "Dagiti clearance, police blotter, ken tulong",
        "safety-fire": "Kaligtasan iti Apuy",
        "safety-fire-desc": "Fire clearance ken serbisio ti inspeksion",
        "safety-disaster": "Serbisio iti Kalamidad",
        "safety-disaster-desc": "MDRRMO pagtugon iti emergensiya ken panagsakana",

        // Environment Page - Ilocano
        "env-page-title": "Serbisio ti Aglawlaw",
        "env-page-desc": "Dagiti permit ti aglawlaw, panagtaripato ti basura, ken sustainability",
        "env-page-badge": "Aglawlaw",
        "env-clearance": "Environmental Clearance",
        "env-clearance-desc": "Dagiti permit ti aglawlaw para kadagiti proyekto ken negosio",
        "env-waste": "Panagtaripato ti Basura",
        "env-waste-desc": "Koleksion ti basura ken serbisio ti panangipupo",
        "env-tree": "Permit ti Panagputol ti Kayo",
        "env-tree-desc": "Permit para iti panagputol ken panagikkat ti kayo",

        // Common Section Titles - Ilocano
        "section-responsible-offices": "Dagiti Responsable nga Opisina",

        // Government Page
        "gov-title": "Estruktura ken Opisial ti Gobierno",
        "gov-subtitle": "Ammoen dagiti lider ken opisina a mangserserbisio iti Solano",
        "gov-executive": "Ehekutibo a Sanga",
        "gov-sb-members": "Dagiti Kameng ti Sangguniang Bayan",
        "gov-sb-subtitle": "Dagiti Konsehal a mangserserbisio kadagiti umili ti Solano",
        "gov-departments": "Dagiti Ulo ti Departamento ken Kangrunaan nga Opisina",
        "gov-dept-subtitle": "Dagiti opisina ti munisipalidad a mangted ti serbisio kadagiti umili",
        "gov-barangays": "Dagiti Barangay ti Solano",
        "gov-barangays-count": "22 a Barangay a mangserserbisio iti komunidad tayo",
        "gov-organizational-chart": "Tsart ti Organisasion",
        "gov-term": "Termino",

        // Budget Page
        "budget-title": "Badyet ken Kinasiluag ti Pinansia",
        "budget-subtitle": "Panagsubaybay ti pinansia ken proyekto ti munisipalidad para iti panagresponsable",
        "budget-overview": "Pakabuklan ti Badyet ti Munisipalidad 2025",
        "budget-total": "Dagup a Badyet",
        "budget-personnel": "Serbisio ti Tauhan",
        "budget-operations": "Operasion",
        "budget-capital": "Capital Outlay",
        "budget-by-dept": "Badyet Sigun iti Departamento",
        "budget-projects": "Dagiti Kangrunaan a Proyekto 2025",
        "budget-reports": "Dagiti Report ken Dokumento ti Pinansia",
        "budget-metrics": "Dagiti Sukatan ti Kinasiluag",
        "budget-utilization": "Rate ti Panagusar ti Badyet",
        "budget-foi": "Dagiti Dawat ti Freedom of Information",
        "budget-response-time": "Average a Tiempo ti Panagsungbat",
        "budget-annual-report": "Tinawen a Report ti Pinansia",
        "budget-quarterly": "Quarterly a Report",

        // FAQ Page
        "faq-title": "Dagiti Masansan a Maisaludsod",
        "faq-subtitle": "Biroken dagiti sungbat kadagiti gagangay a saludsod maipapan kadagiti serbisio ti munisipalidad",
        "faq-general": "Dagiti Sapasap a Saludsod",
        "faq-certificates": "Dagiti Sertipiko ken Dokumento",
        "faq-business": "Negosio ken Permit",
        "faq-payments": "Panagbayad ken Bayadan",
        "faq-social": "Serbisio Sosial",
        "faq-technical": "Dagiti Teknikal a Saludsod",
        "faq-still-questions": "Adda pay saludsodmo?",
        "faq-contact-help": "No saanmo a nasarakan ti sungbat a birbiroken mo, saan ka nga agduadua a mangkontak kadakami. Adda kami ditoy tapno tumulong!",
        "faq-search": "Agsapul iti FAQ",

        // Contact Page
        "contact-title": "Kontaken Dakami",
        "contact-subtitle": "Adda kami ditoy tapno tumulong. Kontaken dakami babaen kadagitoy a pamuspusan.",
        "contact-send-message": "Mangiypatulod ti Mensahe",
        "contact-form-subtitle": "Adda saludsod, singasing, wenno feedback? Punnoen ti form iti baba.",
        "contact-office-hours": "Oras ti Opisina",
        "contact-regular-hours": "Regular nga Oras",
        "contact-closed": "Nakaserra",
        "contact-emergency": "Emergency Hotline",
        "contact-hotlines": "Dagiti Emergency Hotline",
        "contact-hotlines-desc": "Para kadagiti emergency ken saludsod, tawagan dagitoy a numero iti aniaman nga oras.",
        "contact-weekends": "Sabado, Domingo ken Piyesta Opisial",
        "contact-send-btn": "Iypatulod ti Mensahe",
        "contact-police": "Polis",
        "contact-fire": "Bumbero",
        "contact-medical": "Medikal",
        "contact-disaster": "Panagsungbat iti Didigra",

        // Form Labels
        "form-name": "Kompleto a Nagan",
        "form-email": "Email Address",
        "form-phone": "Numero ti Telepono",
        "form-subject": "Suheto",
        "form-message": "Mensahe",
        "form-select-subject": "Agpili ti suheto...",
        "form-service-inquiry": "Saludsod ti Serbisio",
        "form-complaint": "Reklamo",
        "form-suggestion": "Singasing",
        "form-general": "Sapasap a Saludsod",
        "form-website-issue": "Problema ti Website",
        "form-request-response": "Kayatko a makaawat ti sungbat",
        "form-required": "Kasapulan",
        "form-optional": "Opsional",
        "form-submit": "Iysubmit",
        "form-cancel": "Ikansela",
        "form-success": "Balligi a naiypatulod ti mensahem!",
        "form-error": "Adda error iti panangiypatulod ti mensahem. Pangngaasi a padasem manen.",
        "form-sending": "Agiypatpatulod...",
        "form-clear": "Dalusan ti Form",

        // Accessibility Page
        "access-title": "Pahayag ti Aksesibilidad",
        "access-subtitle": "Ti dedikasion mi iti digital nga aksesibilidad para iti amin nga umili",
        "access-commitment": "Ti Dedikasion Mi",
        "access-conformance": "Kasasaad ti Panagtungpal",
        "access-features": "Dagiti Feature ti Aksesibilidad",
        "access-limitations": "Dagiti Ammo a Limitasion",
        "access-alternative": "Alternatibo a Pamuspusan ti Panag-akses",
        "access-feedback": "Puna",
        "access-technical": "Dagiti Teknikal a Detalye",
        "access-assessment": "Pamuspusan ti Panag-assess",
        "access-promise": "Ti Kari Mi",

        // Legislative Page
        "legislative-title": "Impormasion ti Lehislatura",
        "legislative-subtitle": "Dagiti ordinansa, resolusion, ken rekord ti lehislatura",
        "legislative-ordinances": "Dagiti Ordinansa",
        "legislative-resolutions": "Dagiti Resolusion",
        "legislative-pending": "Nakabinbin",
        "legislative-approved": "Naaprubaran",
        "legislative-enacted": "Naisabatas",

        // News Page
        "news-title": "Damag ken Anunsiasion",
        "news-subtitle": "Kabarbaro a damag manipud iti Munisipalidad ti Solano",
        "news-latest": "Kabarbaro a Damag",
        "news-announcements": "Dagiti Anunsiasion",
        "news-events": "Dagiti Pasamak",
        "news-posted": "Naipablaak",
        "news-by": "Ni",

        // Sitemap Page
        "sitemap-title": "Mapa ti Site",
        "sitemap-subtitle": "Kompleto a direktorio ti amin a panid iti daytoy a website",

        // Privacy Page
        "privacy-title": "Pagannurotan ti Pagkapribado",
        "privacy-subtitle": "Kasano mi a kolektaen, usaren, ken protektaran ti impormasionmo",

        // Terms Page
        "terms-title": "Dagiti Kondision ti Panagusar",
        "terms-subtitle": "Dagiti kondision ken termino iti panagusar ti daytoy a website",

        // Common UI Elements
        "loading": "Agkarkarga...",
        "error": "Error",
        "success": "Balligi",
        "warning": "Pakdaar",
        "info": "Impormasion",
        "close": "Iserra",
        "back": "Agsubli",
        "next": "Sumaruno",
        "previous": "Napalabas",
        "save": "I-save",
        "delete": "Ikkaten",
        "edit": "I-edit",
        "view": "Kitaen",
        "print": "I-print",
        "share": "Ibingay",
        "copy": "Kopiaen",
        "search": "Agsapul",
        "filter": "Saguten",
        "sort": "Urnosen",
        "all": "Amin",
        "none": "Awan",
        "yes": "Wen",
        "no": "Saan",
        "or": "wenno",
        "and": "ken",
        "more": "Ad-adu pay",
        "less": "Basbassit",
        "show-more": "Ipakita ti Ad-adu Pay",
        "show-less": "Ipakita ti Basbassit",
        "expand": "Palawaan",
        "collapse": "Ikkisen",
        "refresh": "I-refresh",
        "reset": "I-reset",
        "apply": "Ipatungpal",
        "confirm": "Pasingkedan",
        "cancel": "Ikansela",
        "ok": "OK",
        "done": "Nalpas",
        "continue": "Ituloy",
        "skip": "Labsan",
        "help": "Tulong",
        "about": "Maipapan",
        "home": "Pagtaengan",
        "menu": "Menu",
        "settings": "Dagiti Setting",
        "language": "Pagsasao",
        "date": "Petsa",
        "time": "Oras",
        "today": "Ita nga aldaw",
        "yesterday": "Idi kalman",
        "tomorrow": "Inton bigat",
        "week": "Lawas",
        "month": "Bulan",
        "year": "Tawen",
        "total": "Dagup",
        "available": "Magun-od",
        "unavailable": "Saan a Magun-od",
        "online": "Online",
        "offline": "Offline",
        "open": "Nakalukat",
        "closed": "Nakaserra",
        "new": "Baro",
        "updated": "Na-update",
        "popular": "Pagpilian",
        "featured": "Naiparang",
        "recommended": "Nairekomendar",

        // Time-related
        "minutes": "minuto",
        "hours": "oras",
        "days": "aldaw",
        "weeks": "lawas",
        "months": "bulan",
        "same-day": "Iti isu met laeng nga aldaw",
        "instant": "Dagus",
        "varies": "Agduduma",

        // Currency
        "peso": "Piso",
        "free": "Libre",

        // Hotline labels
        "hotline-police": "Polis",
        "hotline-fire": "Bumbero",
        "hotline-mswdo": "MSWDO",
        "hotline-mdrrmo": "MDRRMO",
        "hotline-dilg": "DILG"
    }
};


/**
 * Enhanced Translation Engine
 * Features: Auto-detection, fallback support, dynamic content, pluralization
 * Updated: 2025-12-10
 */
const TranslationEngine = {
    currentLang: 'en',
    defaultLang: 'en',
    supportedLangs: ['en', 'fil', 'ilo'],
    langNames: {
        'en': 'English',
        'fil': 'Filipino',
        'ilo': 'Ilocano'
    },
    langCodes: {
        'en': 'en',
        'fil': 'fil',
        'ilo': 'ilo'
    },
    initialized: false,
    observers: [],

    /**
     * Initialize the translation engine
     */
    init: function () {
        if (this.initialized) return;

        // Try to get saved language, then browser preference
        let savedLang = localStorage.getItem('selectedLang');
        if (!savedLang || !this.supportedLangs.includes(savedLang)) {
            savedLang = this.detectBrowserLanguage();
        }

        this.currentLang = savedLang;
        this.applyTranslations(this.currentLang);
        this.updateActiveButton(this.currentLang);
        this.setupEventListeners();
        this.setupMutationObserver();
        this.initialized = true;

        console.log('[TranslationEngine] Initialized with language:', this.currentLang);
    },

    /**
     * Detect browser language preference
     */
    detectBrowserLanguage: function () {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();

        // Map common codes
        if (langCode === 'tl' || langCode === 'fil') return 'fil';
        if (langCode === 'ilo') return 'ilo';
        if (langCode === 'en') return 'en';

        return this.defaultLang;
    },

    /**
     * Get translation with fallback support
     */
    getTranslation: function (key, lang, params) {
        lang = lang || this.currentLang;
        let translation = null;

        // Try current language
        if (translations[lang] && translations[lang][key]) {
            translation = translations[lang][key];
        }
        // Fallback to default language
        else if (translations[this.defaultLang] && translations[this.defaultLang][key]) {
            translation = translations[this.defaultLang][key];
        }

        // Apply parameters if provided
        if (translation && params) {
            translation = this.interpolate(translation, params);
        }

        return translation;
    },

    /**
     * Interpolate parameters into translation string
     * Usage: getTranslation('greeting', 'en', { name: 'Juan' })
     * Translation: "Hello, {{name}}!" -> "Hello, Juan!"
     */
    interpolate: function (text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, function (match, key) {
            return params.hasOwnProperty(key) ? params[key] : match;
        });
    },

    /**
     * Get plural form of translation
     * Usage: getPlural('items', 5, 'en')
     */
    getPlural: function (key, count, lang) {
        lang = lang || this.currentLang;
        const singularKey = key;
        const pluralKey = key + '_plural';

        if (count === 1) {
            return this.getTranslation(singularKey, lang, { count: count });
        }

        // Try plural form first
        let translation = this.getTranslation(pluralKey, lang, { count: count });
        if (!translation) {
            translation = this.getTranslation(singularKey, lang, { count: count });
        }

        return translation;
    },

    /**
     * Translate a specific element
     */
    translateElement: function (element, lang) {
        lang = lang || this.currentLang;

        // Text content
        const i18nKey = element.getAttribute('data-i18n');
        if (i18nKey) {
            const translation = this.getTranslation(i18nKey, lang);
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.type === 'submit' || element.type === 'button') {
                        element.value = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        }

        // Placeholder
        const placeholderKey = element.getAttribute('data-i18n-placeholder');
        if (placeholderKey) {
            const translation = this.getTranslation(placeholderKey, lang);
            if (translation) element.placeholder = translation;
        }

        // Title attribute
        const titleKey = element.getAttribute('data-i18n-title');
        if (titleKey) {
            const translation = this.getTranslation(titleKey, lang);
            if (translation) element.title = translation;
        }

        // Aria-label
        const ariaKey = element.getAttribute('data-i18n-aria');
        if (ariaKey) {
            const translation = this.getTranslation(ariaKey, lang);
            if (translation) element.setAttribute('aria-label', translation);
        }

        // Alt text for images
        const altKey = element.getAttribute('data-i18n-alt');
        if (altKey) {
            const translation = this.getTranslation(altKey, lang);
            if (translation) element.alt = translation;
        }
    },

    /**
     * Apply translations to all elements
     */
    applyTranslations: function (lang) {
        if (!translations[lang]) {
            console.warn('[TranslationEngine] Language not found:', lang, '- using default');
            lang = this.defaultLang;
        }

        const self = this;

        // Translate all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            self.translateElement(el, lang);
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            self.translateElement(el, lang);
        });

        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            self.translateElement(el, lang);
        });

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            self.translateElement(el, lang);
        });

        // Translate alt texts
        document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            self.translateElement(el, lang);
        });

        // Update document language attribute
        document.documentElement.lang = this.langCodes[lang] || lang;

        // Save preference
        this.currentLang = lang;
        localStorage.setItem('selectedLang', lang);

        // Dispatch event for other scripts
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: {
                language: lang,
                langCode: this.langCodes[lang],
                langName: this.langNames[lang]
            }
        }));

        // Notify observers
        this.notifyObservers(lang);
    },

    /**
     * Update active state on language buttons
     */
    updateActiveButton: function (lang) {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            btn.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    },

    /**
     * Setup event listeners for language buttons
     */
    setupEventListeners: function () {
        const self = this;

        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const lang = this.dataset.lang;
                if (self.supportedLangs.includes(lang)) {
                    self.switchLanguage(lang);
                }
            });
        });

        // Also handle select dropdowns
        document.querySelectorAll('.lang-select').forEach(function (select) {
            select.addEventListener('change', function (e) {
                const lang = this.value;
                if (self.supportedLangs.includes(lang)) {
                    self.switchLanguage(lang);
                }
            });
        });
    },

    /**
     * Setup mutation observer for dynamically added content
     */
    setupMutationObserver: function () {
        const self = this;

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Translate the new element if it has i18n attributes
                        if (node.hasAttribute && (
                            node.hasAttribute('data-i18n') ||
                            node.hasAttribute('data-i18n-placeholder') ||
                            node.hasAttribute('data-i18n-title') ||
                            node.hasAttribute('data-i18n-aria') ||
                            node.hasAttribute('data-i18n-alt')
                        )) {
                            self.translateElement(node, self.currentLang);
                        }

                        // Also check children
                        if (node.querySelectorAll) {
                            node.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-title], [data-i18n-aria], [data-i18n-alt]').forEach(function (el) {
                                self.translateElement(el, self.currentLang);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * Switch to a different language
     */
    switchLanguage: function (lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn('[TranslationEngine] Unsupported language:', lang);
            return false;
        }

        this.applyTranslations(lang);
        this.updateActiveButton(lang);

        console.log('[TranslationEngine] Switched to:', lang);
        return true;
    },

    /**
     * Get current language
     */
    getCurrentLanguage: function () {
        return this.currentLang;
    },

    /**
     * Get language name
     */
    getLanguageName: function (lang) {
        return this.langNames[lang || this.currentLang] || lang;
    },

    /**
     * Get all supported languages
     */
    getSupportedLanguages: function () {
        return this.supportedLangs.map(function (lang) {
            return {
                code: lang,
                name: this.langNames[lang],
                htmlCode: this.langCodes[lang]
            };
        }, this);
    },

    /**
     * Add observer for language changes
     */
    addObserver: function (callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    },

    /**
     * Remove observer
     */
    removeObserver: function (callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    },

    /**
     * Notify all observers of language change
     */
    notifyObservers: function (lang) {
        this.observers.forEach(function (callback) {
            try {
                callback(lang);
            } catch (e) {
                console.error('[TranslationEngine] Observer error:', e);
            }
        });
    },

    /**
     * Translate text directly (for dynamic content)
     */
    t: function (key, params) {
        return this.getTranslation(key, this.currentLang, params) || key;
    },

    /**
     * Check if a translation key exists
     */
    hasTranslation: function (key, lang) {
        lang = lang || this.currentLang;
        return !!(translations[lang] && translations[lang][key]);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        TranslationEngine.init();
    });
} else {
    TranslationEngine.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TranslationEngine, translations };
}

// Global access
if (typeof window !== 'undefined') {
    window.TranslationEngine = TranslationEngine;
    window.t = function (key, params) {
        return TranslationEngine.t(key, params);
    };
}
