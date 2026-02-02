'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation data
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    "nav-home": "Home",
    "nav-services": "Services",
    "nav-government": "Government",
    "nav-statistics": "Statistics",
    "nav-legislative": "Legislative",
    "nav-transparency": "Transparency",
    "nav-contact": "Contact",

    // Appointment CTA
    "appointment-cta-heading": "Enhancing Appointment Services of LGU Solano Mayor's Office",
    "appointment-cta-subtitle": "No lines. No back-and-forth. Just efficient appointments.",
    "appointment-schedule-btn": "Schedule Appointment",
    "appointment-create-btn": "Create Account",

    // Hero Section
    "hero-welcome": "Welcome to BetterSolano.org",
    "hero-subtitle": "Access government services, information, and resources for the people of Solano, Nueva Vizcaya.",
    "hero-find-service": "Find a Service",

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

    // Latest Updates
    "section-updates": "Latest Updates",
    "btn-view-all": "View All",

    // Municipal Leadership
    "section-leadership": "Municipal Leadership",
    "title-mayor": "Municipal Mayor",
    "title-vice-mayor": "Municipal Vice Mayor",
    "btn-view-officials": "View All Officials",

    // Contact Section
    "section-contact": "Contact Information",
    "contact-phone": "Phone",
    "contact-email": "Email",
    "contact-address": "Address",
    "contact-hours": "Mon-Fri: 8:00 AM - 5:00 PM",
    "contact-response": "We'll respond within 24 hours",
    "contact-municipal-hall": "Municipal Hall",

    // Services Page
    "services-title": "Municipal Services Directory",
    "services-subtitle": "Browse all services offered by the Municipality of Solano",
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

    // Service Categories
    "cat-certificates": "Certificates & Vital Records",
    "cat-certificates-desc": "Birth, death, marriage certificates, and other vital records.",
    "cat-business": "Business & Trade",
    "cat-business-desc": "Business permits, licenses, and trade registration services.",
    "cat-social": "Social Services",
    "cat-social-desc": "Welfare programs, senior citizen services, PWD benefits, and financial aid.",
    "cat-health": "Health & Wellness",
    "cat-health-desc": "Vaccination programs, health certificates, and medical assistance.",
    "cat-tax": "Taxation & Payments",
    "cat-tax-desc": "Property tax, business tax, payments, and tax clearance.",
    "cat-agriculture": "Agriculture",
    "cat-agriculture-desc": "Agricultural loans, crop insurance, fertilizer assistance, and training.",
    "cat-infrastructure": "Infrastructure",
    "cat-infrastructure-desc": "Construction permits, road maintenance requests, and public facilities.",
    "cat-education": "Education & Scholarship",
    "cat-education-desc": "Scholarship programs, student assistance, and educational grants.",
    "cat-safety": "Public Safety",
    "cat-safety-desc": "Emergency services, disaster preparedness, and community safety programs.",
    "cat-environment": "Environment",
    "cat-environment-desc": "Environmental permits, waste management, and conservation programs.",

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
    "faq-contact-help": "If you didn't find the answer you were looking for, please don't hesitate to contact us.",

    // Common Labels
    "label-fee": "Fee:",
    "label-time": "Time:",
    "label-free": "Free",
    "label-varies": "Varies",
    "label-walk-in": "Walk-in",
    "label-seasonal": "Seasonal",
    "label-1-day": "1 day",
    "label-1-2-days": "1-2 days",
    "label-3-5-days": "3-5 days",
    "section-responsible-offices": "Responsible Offices",

    // Health Page
    "health-page-title": "Health Services",
    "health-page-desc": "Medical consultations, vaccinations, and health programs",
    "health-page-badge": "Health",
    "health-consultation": "Medical Consultation",
    "health-consultation-desc": "Free consultation at Rural Health Units",
    "health-vaccination": "Vaccination Programs",
    "health-vaccination-desc": "Free immunization for children and adults",
    "health-prenatal": "Prenatal Care",
    "health-prenatal-desc": "Free prenatal checkups and services",
    "health-dental": "Dental Services",
    "health-dental-desc": "Basic dental care and extraction",
    "health-stats-title": "Health Statistics",
    "health-rhu": "Rural Health Units",
    "health-bhw": "Barangay Health Workers",
    "health-hospitals-title": "Hospitals in the Area",

    // Agriculture Page
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
    "biz-permit-new-desc": "Apply for a new mayor's permit for your business",
    "biz-permit-renew": "Business Permit Renewal",
    "biz-permit-renew-desc": "Renew your annual business permit",
    "biz-closure": "Business Closure",
    "biz-closure-desc": "Process business closure and clearance",
    "biz-cedula": "Cedula (CTC)",
    "biz-cedula-desc": "Community tax certificate for individuals and businesses",
    "biz-online-badge": "Online Services via Filipizen",
    "biz-online-title": "Online Business Transactions",
    "biz-online-subtitle": "Complete your business transactions online through the official Filipizen portal",
    "biz-billing": "Business Online Billing & Payment",
    "biz-billing-desc": "View and pay your business tax bills online",

    // Tax & Payments Page
    "tax-page-title": "Tax & Payments",
    "tax-page-desc": "Property tax, business tax, and other municipal payments",
    "tax-page-badge": "Tax & Payments",
    "tax-property": "Real Property Tax",
    "tax-property-desc": "Annual tax on land and improvements",
    "tax-business": "Business Tax",
    "tax-business-desc": "Quarterly and annual business tax payments",
    "tax-online-badge": "Online Services via Filipizen",
    "tax-online-title": "Online Tax Transactions",
    "tax-online-subtitle": "Complete your tax payments online through the official Filipizen portal",

    // Social Services Page
    "social-page-title": "Social Services",
    "social-page-desc": "Support programs for vulnerable sectors and communities",
    "social-page-badge": "Social Services",
    "social-senior": "Senior Citizen ID",
    "social-senior-desc": "ID for citizens 60 years and above",
    "social-pwd": "PWD ID",
    "social-pwd-desc": "Identification for persons with disabilities",
    "social-assistance": "Financial Assistance",
    "social-assistance-desc": "Emergency financial aid for medical, burial, and education",

    // Education Page
    "edu-page-title": "Education Services",
    "edu-page-desc": "Scholarship programs and educational assistance",
    "edu-page-badge": "Education",
    "edu-scholarship": "Scholarship Programs",
    "edu-scholarship-desc": "Municipal scholarships for students",
    "edu-training": "Educational Assistance",
    "edu-training-desc": "Financial aid for education",

    // Infrastructure Page
    "infra-page-title": "Infrastructure Services",
    "infra-page-desc": "Building permits, construction, and engineering services",
    "infra-page-badge": "Infrastructure",
    "infra-building": "Building Permit",
    "infra-building-desc": "Permit for new construction and renovation",
    "infra-occupancy": "Occupancy Permit",
    "infra-occupancy-desc": "Certificate of occupancy for completed buildings",
    "infra-engineering": "Engineering Services",
    "infra-engineering-desc": "Technical assistance and plan review",

    // Public Safety Page
    "safety-page-title": "Public Safety Services",
    "safety-page-desc": "Emergency response and disaster preparedness",
    "safety-page-badge": "Public Safety",
    "safety-disaster": "Emergency Response",
    "safety-disaster-desc": "24/7 emergency response and rescue services",
    "safety-relief": "Disaster Assistance",
    "safety-relief-desc": "Relief goods and evacuation support",
    "safety-preparedness": "Disaster Preparedness",
    "safety-preparedness-desc": "Training and resources for disaster readiness",

    // Environment Page
    "env-page-title": "Environment Services",
    "env-page-desc": "Waste management and environmental protection",
    "env-page-badge": "Environment",
    "env-waste": "Garbage Collection",
    "env-waste-desc": "Waste collection schedules by barangay",
    "env-recycling": "Recycling Program",
    "env-recycling-desc": "Segregation and recycling initiatives",
  },
  fil: {
    // Navigation - Filipino
    "nav-home": "Tahanan",
    "nav-services": "Mga Serbisyo",
    "nav-government": "Pamahalaan",
    "nav-statistics": "Estadistika",
    "nav-legislative": "Lehislatura",
    "nav-transparency": "Transparensiya",
    "nav-contact": "Makipag-ugnayan",

    // Appointment CTA
    "appointment-cta-heading": "Pagpapahusay ng Serbisyo sa Appointment ng Opisina ng Alkalde ng LGU Solano",
    "appointment-cta-subtitle": "Walang pila. Walang pabalik-balik. Mahusay na appointment lang.",
    "appointment-schedule-btn": "Mag-iskedyul ng Appointment",
    "appointment-create-btn": "Gumawa ng Account",

    // Hero Section
    "hero-welcome": "Maligayang Pagdating sa BetterSolano.org",
    "hero-subtitle": "I-access ang mga serbisyo ng pamahalaan, impormasyon, at mga mapagkukunan para sa mga mamamayan ng Solano, Nueva Vizcaya.",
    "hero-find-service": "Maghanap ng Serbisyo",

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

    // Latest Updates
    "section-updates": "Pinakabagong mga Update",
    "btn-view-all": "Tingnan Lahat",

    // Municipal Leadership
    "section-leadership": "Pamunuan ng Munisipalidad",
    "title-mayor": "Punong Bayan",
    "title-vice-mayor": "Bise Punong Bayan",
    "btn-view-officials": "Tingnan Lahat ng Opisyal",

    // Contact Section
    "section-contact": "Impormasyon sa Pakikipag-ugnayan",
    "contact-phone": "Telepono",
    "contact-email": "Email",
    "contact-address": "Adres",
    "contact-hours": "Lunes-Biyernes: 8:00 AM - 5:00 PM",
    "contact-response": "Sasagutin namin sa loob ng 24 na oras",
    "contact-municipal-hall": "Munisipyo",

    // Services Page
    "services-title": "Direktoryo ng Serbisyong Munisipal",
    "services-subtitle": "Tingnan ang lahat ng serbisyong inaalok ng Munisipalidad ng Solano",
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

    // Service Categories
    "cat-certificates": "Mga Sertipiko at Vital Records",
    "cat-certificates-desc": "Sertipiko ng kapanganakan, kamatayan, kasal, at iba pang vital records.",
    "cat-business": "Negosyo at Kalakalan",
    "cat-business-desc": "Mga permit sa negosyo, lisensya, at serbisyo sa pagpaparehistro ng kalakalan.",
    "cat-social": "Serbisyong Panlipunan",
    "cat-social-desc": "Mga programa sa kapakanan, serbisyo para sa senior citizen, benepisyo ng PWD, at tulong pinansyal.",
    "cat-health": "Kalusugan at Kagalingan",
    "cat-health-desc": "Mga programa sa bakuna, health certificates, at tulong medikal.",
    "cat-tax": "Pagbubuwis at Pagbabayad",
    "cat-tax-desc": "Buwis sa ari-arian, buwis sa negosyo, pagbabayad, at tax clearance.",
    "cat-agriculture": "Agrikultura",
    "cat-agriculture-desc": "Mga pautang sa agrikultura, insurance sa pananim, tulong sa pataba, at pagsasanay.",
    "cat-infrastructure": "Imprastraktura",
    "cat-infrastructure-desc": "Mga permit sa konstruksyon, kahilingan sa pagpapanatili ng kalsada, at pampublikong pasilidad.",
    "cat-education": "Edukasyon at Iskolarship",
    "cat-education-desc": "Mga programa sa iskolarship, tulong sa estudyante, at mga grant sa edukasyon.",
    "cat-safety": "Kaligtasan ng Publiko",
    "cat-safety-desc": "Mga serbisyong pang-emergency, paghahanda sa sakuna, at mga programa sa kaligtasan ng komunidad.",
    "cat-environment": "Kapaligiran",
    "cat-environment-desc": "Mga permit sa kapaligiran, pamamahala ng basura, at mga programa sa konserbasyon.",

    // FAQ Page
    "faq-title": "Mga Madalas Itanong",
    "faq-subtitle": "Hanapin ang mga sagot sa mga karaniwang tanong tungkol sa mga serbisyong munisipal",
    "faq-general": "Mga Pangkalahatang Tanong",
    "faq-certificates": "Mga Sertipiko at Dokumento",
    "faq-business": "Negosyo at Permit",
    "faq-payments": "Pagbabayad at Bayarin",
    "faq-social": "Serbisyong Panlipunan",
    "faq-technical": "Mga Teknikal na Tanong",
    "faq-still-questions": "May tanong pa ba kayo?",
    "faq-contact-help": "Kung hindi ninyo nakita ang sagot na hinahanap, huwag mag-atubiling makipag-ugnayan sa amin.",

    // Common Labels - Filipino
    "label-fee": "Bayad:",
    "label-time": "Oras:",
    "label-free": "Libre",
    "label-varies": "Nag-iiba",
    "label-walk-in": "Walk-in",
    "label-seasonal": "Pana-panahon",
    "label-1-day": "1 araw",
    "label-1-2-days": "1-2 araw",
    "label-3-5-days": "3-5 araw",
    "section-responsible-offices": "Mga Responsableng Opisina",

    // Health Page - Filipino
    "health-page-title": "Serbisyong Pangkalusugan",
    "health-page-desc": "Mga konsultasyong medikal, bakuna, at programa sa kalusugan",
    "health-page-badge": "Kalusugan",
    "health-consultation": "Konsultasyong Medikal",
    "health-consultation-desc": "Libreng konsultasyon sa Rural Health Units",
    "health-vaccination": "Mga Programa sa Bakuna",
    "health-vaccination-desc": "Libreng immunization para sa mga bata at matatanda",
    "health-prenatal": "Prenatal Care",
    "health-prenatal-desc": "Libreng prenatal checkups at serbisyo",
    "health-dental": "Serbisyong Dental",
    "health-dental-desc": "Basic dental care at bunot",
    "health-stats-title": "Estadistika ng Kalusugan",
    "health-rhu": "Rural Health Units",
    "health-bhw": "Barangay Health Workers",
    "health-hospitals-title": "Mga Ospital sa Lugar",

    // Agriculture Page - Filipino
    "agri-page-title": "Serbisyong Agrikultura",
    "agri-page-desc": "Suporta para sa mga magsasaka at pag-unlad ng agrikultura",
    "agri-page-badge": "Agrikultura",
    "agri-seedling": "Pamamahagi ng Binhi",
    "agri-seedling-desc": "Libreng buto at binhi para sa mga magsasaka",
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
    "biz-permit-new": "Permit ng Negosyo (Bago)",
    "biz-permit-new-desc": "Mag-apply ng bagong mayor's permit para sa iyong negosyo",
    "biz-permit-renew": "Pag-renew ng Permit ng Negosyo",
    "biz-permit-renew-desc": "I-renew ang taunang permit ng negosyo",
    "biz-closure": "Pagsasara ng Negosyo",
    "biz-closure-desc": "Proseso ng pagsasara at clearance ng negosyo",
    "biz-cedula": "Sedula (CTC)",
    "biz-cedula-desc": "Community tax certificate para sa mga indibidwal at negosyo",
    "biz-online-badge": "Online Services sa pamamagitan ng Filipizen",
    "biz-online-title": "Online na Transaksyon sa Negosyo",
    "biz-online-subtitle": "Kumpletuhin ang iyong mga transaksyon sa negosyo online sa pamamagitan ng opisyal na portal ng Filipizen",
    "biz-billing": "Online Billing at Pagbabayad ng Negosyo",
    "biz-billing-desc": "Tingnan at bayaran ang iyong business tax bills online",

    // Tax & Payments Page - Filipino
    "tax-page-title": "Buwis at Pagbabayad",
    "tax-page-desc": "Buwis sa ari-arian, buwis sa negosyo, at iba pang bayarin sa munisipalidad",
    "tax-page-badge": "Buwis at Pagbabayad",
    "tax-property": "Real Property Tax",
    "tax-property-desc": "Taunang buwis sa lupa at mga pagpapabuti",
    "tax-business": "Buwis sa Negosyo",
    "tax-business-desc": "Quarterly at taunang pagbabayad ng buwis sa negosyo",
    "tax-online-badge": "Online Services sa pamamagitan ng Filipizen",
    "tax-online-title": "Online na Transaksyon sa Buwis",
    "tax-online-subtitle": "Kumpletuhin ang iyong mga pagbabayad ng buwis online sa pamamagitan ng opisyal na portal ng Filipizen",

    // Social Services Page - Filipino
    "social-page-title": "Serbisyong Panlipunan",
    "social-page-desc": "Mga programa ng suporta para sa mga vulnerable na sektor at komunidad",
    "social-page-badge": "Serbisyong Panlipunan",
    "social-senior": "Senior Citizen ID",
    "social-senior-desc": "ID para sa mga mamamayang 60 taong gulang pataas",
    "social-pwd": "PWD ID",
    "social-pwd-desc": "Pagkakakilanlan para sa mga may kapansanan",
    "social-assistance": "Tulong Pinansyal",
    "social-assistance-desc": "Emergency na tulong pinansyal para sa medikal, libing, at edukasyon",

    // Education Page - Filipino
    "edu-page-title": "Serbisyong Pang-edukasyon",
    "edu-page-desc": "Mga programa ng iskolarship at tulong pang-edukasyon",
    "edu-page-badge": "Edukasyon",
    "edu-scholarship": "Mga Programa ng Iskolarship",
    "edu-scholarship-desc": "Mga iskolarship ng munisipalidad para sa mga estudyante",
    "edu-training": "Tulong Pang-edukasyon",
    "edu-training-desc": "Tulong pinansyal para sa edukasyon",

    // Infrastructure Page - Filipino
    "infra-page-title": "Serbisyong Imprastraktura",
    "infra-page-desc": "Building permits, konstruksyon, at serbisyong engineering",
    "infra-page-badge": "Imprastraktura",
    "infra-building": "Building Permit",
    "infra-building-desc": "Permit para sa bagong konstruksyon at renovation",
    "infra-occupancy": "Occupancy Permit",
    "infra-occupancy-desc": "Certificate of occupancy para sa natapos na mga gusali",
    "infra-engineering": "Serbisyong Engineering",
    "infra-engineering-desc": "Teknikal na tulong at pagsusuri ng plano",

    // Public Safety Page - Filipino
    "safety-page-title": "Serbisyong Pangkaligtasan",
    "safety-page-desc": "Tugon sa emergency at paghahanda sa kalamidad",
    "safety-page-badge": "Kaligtasang Pampubliko",
    "safety-disaster": "Tugon sa Emergency",
    "safety-disaster-desc": "24/7 na tugon at serbisyong rescue sa emergency",
    "safety-relief": "Tulong sa Kalamidad",
    "safety-relief-desc": "Relief goods at suporta sa paglikas",
    "safety-preparedness": "Paghahanda sa Kalamidad",
    "safety-preparedness-desc": "Pagsasanay at mga resources para sa disaster readiness",

    // Environment Page - Filipino
    "env-page-title": "Serbisyong Pangkapaligiran",
    "env-page-desc": "Pamamahala ng basura at proteksyon sa kapaligiran",
    "env-page-badge": "Kapaligiran",
    "env-waste": "Pangongolekta ng Basura",
    "env-waste-desc": "Mga iskedyul ng pangongolekta ng basura ayon sa barangay",
    "env-recycling": "Programa sa Recycling",
    "env-recycling-desc": "Segregasyon at mga inisyatiba sa recycling",
  },
  ilo: {
    // Navigation - Ilocano
    "nav-home": "Pagtaengan",
    "nav-services": "Dagiti Serbisyo",
    "nav-government": "Gobierno",
    "nav-statistics": "Estadistika",
    "nav-legislative": "Lehislatura",
    "nav-transparency": "Transparensiya",
    "nav-contact": "Kontaken",

    // Appointment CTA
    "appointment-cta-heading": "Panagpasayaat ti Serbisio ti Appointment ti Opisina ti Alkalde ti LGU Solano",
    "appointment-cta-subtitle": "Awan pila. Awan agpapasubli. Nasayaat nga appointment laeng.",
    "appointment-schedule-btn": "Ag-iskedyul ti Appointment",
    "appointment-create-btn": "Agaramid ti Account",

    // Hero Section
    "hero-welcome": "Naragsak nga Isasangbay iti BetterSolano.org",
    "hero-subtitle": "Aksesen dagiti serbisyo ti gobierno, impormasyon, ken dagiti resources para kadagiti umili ti Solano, Nueva Vizcaya.",
    "hero-find-service": "Agsapul ti Serbisyo",

    // Popular Services
    "section-popular": "Dagiti Popular a Serbisyo",
    "service-certificates": "Dagiti Sertipiko",
    "service-certificates-desc": "Sertipiko ti pannakayanak, kasar, ken patay",
    "service-business": "Permit ti Negosyo",
    "service-business-desc": "Baro a permit ken panagrenew",
    "service-tax": "Panagbayad ti Buwis",
    "service-tax-desc": "Buwis ti sanikua ken negosyo",
    "service-social": "Serbisyo Sosyal",
    "service-social-desc": "Serbisyo para kadagiti senior citizen ken PWD",
    "service-health": "Serbisyo ti Salun-at",
    "service-health-desc": "Tulong medikal ken dagiti programa",
    "btn-view-all-services": "Kitaen Amin a Serbisyo",

    // Latest Updates
    "section-updates": "Kabarbaro nga Update",
    "btn-view-all": "Kitaen Amin",

    // Municipal Leadership
    "section-leadership": "Panguluan ti Munisipalidad",
    "title-mayor": "Mayor ti Munisipalidad",
    "title-vice-mayor": "Bise Mayor ti Munisipalidad",
    "btn-view-officials": "Kitaen Amin nga Opisyal",

    // Contact Section
    "section-contact": "Impormasyon ti Panagkontak",
    "contact-phone": "Telepono",
    "contact-email": "Email",
    "contact-address": "Adres",
    "contact-hours": "Lunes-Biernes: 8:00 AM - 5:00 PM",
    "contact-response": "Sumungbat kami iti uneg ti 24 nga oras",
    "contact-municipal-hall": "Munisipio",

    // Services Page
    "services-title": "Direktorio ti Serbisyo ti Munisipalidad",
    "services-subtitle": "Kitaen amin a serbisyo nga idatag ti Munisipalidad ti Solano",
    "life-events-title": "Agsapul Segun iti Pasamak iti Biag",
    "life-events-subtitle": "Biroken dagiti serbisyo segun iti mapasamak iti biagmo",
    "life-starting-business": "Mangrugi ti Negosyo",
    "life-getting-married": "Agkasar",
    "life-having-baby": "Addaan ti Ubing",
    "life-financial-help": "Kasapulan ti Tulong Pinansyal",
    "life-senior": "Serbisyo para kadagiti Senior Citizen",
    "life-pwd": "Tao nga Addaan Kapansanan",
    "life-building": "Panagbangon/Panagpasayaat ti Balay",
    "life-trouble": "Nairaman iti Problema",

    // Service Categories
    "cat-certificates": "Dagiti Sertipiko ken Vital Records",
    "cat-certificates-desc": "Sertipiko ti pannakayanak, patay, kasar, ken dadduma pay a vital records.",
    "cat-business": "Negosyo ken Kalakalan",
    "cat-business-desc": "Dagiti permit ti negosyo, lisensya, ken serbisyo ti panagparehistro ti kalakalan.",
    "cat-social": "Serbisyo Sosyal",
    "cat-social-desc": "Dagiti programa ti welfare, serbisyo para kadagiti senior citizen, benepisyo ti PWD, ken tulong pinansyal.",
    "cat-health": "Salun-at ken Wellness",
    "cat-health-desc": "Dagiti programa ti bakuna, health certificates, ken tulong medikal.",
    "cat-tax": "Panagbuwis ken Panagbayad",
    "cat-tax-desc": "Buwis ti sanikua, buwis ti negosyo, panagbayad, ken tax clearance.",
    "cat-agriculture": "Agrikultura",
    "cat-agriculture-desc": "Dagiti pautang ti agrikultura, insurance ti mula, tulong ti abono, ken panagsanay.",
    "cat-infrastructure": "Imprastraktura",
    "cat-infrastructure-desc": "Dagiti permit ti konstruksyon, dawat ti panagmantener ti kalsada, ken pampubliko a pasilidad.",
    "cat-education": "Edukasyon ken Iskolarship",
    "cat-education-desc": "Dagiti programa ti iskolarship, tulong ti estudiante, ken dagiti grant ti edukasyon.",
    "cat-safety": "Kinatalged ti Publiko",
    "cat-safety-desc": "Dagiti serbisyo ti emergency, panagisagana ti kalamidad, ken dagiti programa ti kinatalged ti komunidad.",
    "cat-environment": "Aglawlaw",
    "cat-environment-desc": "Dagiti permit ti aglawlaw, panagtaripato ti basura, ken dagiti programa ti konserbasyon.",

    // FAQ Page
    "faq-title": "Masansan a Maisaludsod",
    "faq-subtitle": "Biruken dagiti sungbat kadagiti gagangay a saludsod maipapan kadagiti serbisyo ti munisipalidad",
    "faq-general": "Dagiti Gagangay a Saludsod",
    "faq-certificates": "Dagiti Sertipiko ken Dokumento",
    "faq-business": "Negosyo ken Permit",
    "faq-payments": "Panagbayad ken Bayadan",
    "faq-social": "Serbisyo Sosyal",
    "faq-technical": "Dagiti Teknikal a Saludsod",
    "faq-still-questions": "Adda pay saludsodyo?",
    "faq-contact-help": "No saandayo a nasarakan ti sungbat a sapulenyo, dikay agmuna nga agkontak kadakami.",

    // Common Labels - Ilocano
    "label-fee": "Bayad:",
    "label-time": "Tiempo:",
    "label-free": "Libre",
    "label-varies": "Agdumaduma",
    "label-walk-in": "Walk-in",
    "label-seasonal": "Panawen",
    "label-1-day": "1 aldaw",
    "label-1-2-days": "1-2 aldaw",
    "label-3-5-days": "3-5 aldaw",
    "section-responsible-offices": "Dagiti Responsable nga Opisina",

    // Health Page - Ilocano
    "health-page-title": "Serbisio ti Salun-at",
    "health-page-desc": "Dagiti konsulta medikal, bakuna, ken programa ti salun-at",
    "health-page-badge": "Salun-at",
    "health-consultation": "Konsulta Medikal",
    "health-consultation-desc": "Libre a konsulta kadagiti Rural Health Units",
    "health-vaccination": "Dagiti Programa ti Bakuna",
    "health-vaccination-desc": "Libre nga immunization para kadagiti ubbing ken nataengan",
    "health-prenatal": "Prenatal Care",
    "health-prenatal-desc": "Libre a prenatal checkups ken serbisio",
    "health-dental": "Serbisio Dental",
    "health-dental-desc": "Basiko a dental care ken panagbunot",
    "health-stats-title": "Estadistika ti Salun-at",
    "health-rhu": "Rural Health Units",
    "health-bhw": "Barangay Health Workers",
    "health-hospitals-title": "Dagiti Ospital iti Lugar",

    // Agriculture Page - Ilocano
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
    "biz-closure-desc": "Proseso ti panagrikep ken clearance ti negosio",
    "biz-cedula": "Sedula (CTC)",
    "biz-cedula-desc": "Community tax certificate para kadagiti indibidual ken negosio",
    "biz-online-badge": "Online Services babaen ti Filipizen",
    "biz-online-title": "Online a Transaksion ti Negosio",
    "biz-online-subtitle": "Kompleto dagiti transaksionmo iti negosio online babaen ti opisial a portal ti Filipizen",
    "biz-billing": "Online Billing ken Panagbayad ti Negosio",
    "biz-billing-desc": "Kitaen ken bayadan dagiti business tax bills online",

    // Tax & Payments Page - Ilocano
    "tax-page-title": "Buwis ken Panagbayad",
    "tax-page-desc": "Buwis ti sanikua, buwis ti negosio, ken dadduma pay a bayadan iti munisipalidad",
    "tax-page-badge": "Buwis ken Panagbayad",
    "tax-property": "Real Property Tax",
    "tax-property-desc": "Tawenantawen a buwis ti daga ken dagiti pagpasayaat",
    "tax-business": "Buwis ti Negosio",
    "tax-business-desc": "Quarterly ken tawenantawen a panagbayad ti buwis ti negosio",
    "tax-online-badge": "Online Services babaen ti Filipizen",
    "tax-online-title": "Online a Transaksion ti Buwis",
    "tax-online-subtitle": "Kompleto dagiti panagbayad ti buwis online babaen ti opisial a portal ti Filipizen",

    // Social Services Page - Ilocano
    "social-page-title": "Serbisio Sosyal",
    "social-page-desc": "Dagiti programa ti suporta para kadagiti vulnerable a sektor ken komunidad",
    "social-page-badge": "Serbisio Sosyal",
    "social-senior": "Senior Citizen ID",
    "social-senior-desc": "ID para kadagiti umili nga 60 a tawen pataas",
    "social-pwd": "PWD ID",
    "social-pwd-desc": "Pagbibiagian para kadagiti addaan ti kapansanan",
    "social-assistance": "Tulong Pinansyal",
    "social-assistance-desc": "Emergency a tulong pinansyal para iti medikal, libing, ken edukasion",

    // Education Page - Ilocano
    "edu-page-title": "Serbisio ti Edukasion",
    "edu-page-desc": "Dagiti programa ti iskolarship ken tulong pang-edukasion",
    "edu-page-badge": "Edukasion",
    "edu-scholarship": "Dagiti Programa ti Iskolarship",
    "edu-scholarship-desc": "Dagiti iskolarship ti munisipalidad para kadagiti estudiante",
    "edu-training": "Tulong Pang-edukasion",
    "edu-training-desc": "Tulong pinansyal para iti edukasion",

    // Infrastructure Page - Ilocano
    "infra-page-title": "Serbisio ti Imprastraktura",
    "infra-page-desc": "Building permits, konstruksion, ken serbisio ti engineering",
    "infra-page-badge": "Imprastraktura",
    "infra-building": "Building Permit",
    "infra-building-desc": "Permit para iti baro a konstruksion ken renovation",
    "infra-occupancy": "Occupancy Permit",
    "infra-occupancy-desc": "Certificate of occupancy para kadagiti nalpas a pasdek",
    "infra-engineering": "Serbisio ti Engineering",
    "infra-engineering-desc": "Teknikal a tulong ken panagrepaso ti plano",

    // Public Safety Page - Ilocano
    "safety-page-title": "Serbisio ti Kaligtasan Pampubliko",
    "safety-page-desc": "Tugon iti emergency ken panagisagana iti kalamidad",
    "safety-page-badge": "Kaligtasan Pampubliko",
    "safety-disaster": "Tugon iti Emergency",
    "safety-disaster-desc": "24/7 a tugon ken serbisio ti rescue iti emergency",
    "safety-relief": "Tulong iti Kalamidad",
    "safety-relief-desc": "Relief goods ken suporta iti panaglikas",
    "safety-preparedness": "Panagisagana iti Kalamidad",
    "safety-preparedness-desc": "Panagsanay ken dagiti resources para iti disaster readiness",

    // Environment Page - Ilocano
    "env-page-title": "Serbisio ti Aglawlaw",
    "env-page-desc": "Panagtaripato ti basura ken proteksion ti aglawlaw",
    "env-page-badge": "Aglawlaw",
    "env-waste": "Panangurnong ti Basura",
    "env-waste-desc": "Dagiti iskedyul ti panangurnong ti basura segun iti barangay",
    "env-recycling": "Programa ti Recycling",
    "env-recycling-desc": "Segregasion ken dagiti inisyatiba ti recycling",
  }
};

type Language = 'en' | 'fil' | 'ilo';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('bettersolano_lang') as Language;
    if (savedLang && ['en', 'fil', 'ilo'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bettersolano_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
