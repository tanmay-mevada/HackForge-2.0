# PrintIt  
### Smart Remote Printing Web Application

## Overview
PrintIt is a remote-first web application designed to streamline and modernize the student printing experience. It eliminates long queues, manual file sharing, and payment friction by allowing students to upload documents, configure print options, pay online, and collect pre-printed documents instantly from nearby print shops.

The system is built with scalability, security, and real-world usability in mind, targeting a common yet overlooked problem in campus ecosystems.

---

## Problem Statement
Students frequently face inefficiencies in traditional printing systems, including:
- Long waiting queues during peak hours
- Productivity loss due to printer malfunctions and manual coordination
- Inconvenient file transfer methods such as WhatsApp or pen drives
- Manual payment processes and pricing confusion

These challenges significantly disrupt academic workflows and demand a more efficient solution.

---

## Proposed Solution
PrintIt introduces a smart remote printing workflow:
1. Students upload a PDF and select a nearby print shop  
2. Print specifications are configured (color mode, sides, binding)  
3. Payment is completed online using UPI  
4. The print shop receives the job instantly via a dashboard  
5. Documents are printed before the student arrives  
6. Secure pickup using OTP or QR verification  

**Objective:** Zero waiting time, fast pickup, and a significantly improved user experience.

---

## Key Features
- Remote PDF upload and job scheduling  
- Print shop discovery and selection  
- Customizable print options  
- Secure UPI-based online payments  
- OTP / QR-based verification for pickup  
- Pre-printed orders to eliminate queues  
- Privacy-first auto file deletion  

---

## Technology Stack
### Frontend
- Next.js for a fast and responsive user interface

### Backend
- Next.js Serverless API routes and Server Actions

### Database and Storage
- Supabase for authentication, database management, and secure PDF storage

### Payments
- PayU UPI integration for seamless and reliable transactions

---

## System Architecture and Workflow
1. Student initiates a print request via the web app  
2. PDF is stored securely in Supabase  
3. Payment confirmation triggers job processing  
4. Print job is dispatched in real time to the shop dashboard  
5. Shop prints the document in advance  
6. Student collects the print using OTP or QR verification  

This architecture ensures speed, reliability, and scalability.

---

## Innovation and Uniqueness
- Dynamic pricing based on shop rates, page count, and print options  
- Elimination of verbal or WhatsApp-based miscommunication  
- Shop-side dashboard for efficient order management  
- Support for bulk and group printing  
- Transparent and cashless payment flow  

---

## Team Information
**Team Name:** Turbo Cpp  

| Name | GitHub Profile |
|-----|---------------|
| Tanmay Mevada | https://github.com/tanmay-mevada |
| Aum Ghodasara | https://github.com/Ghatak18005 |
| Urvi Ladhani | https://github.com/Urvi-Ladhani |

---

## Conclusion
PrintIt addresses a real and recurring student problem with a practical, scalable, and technology-driven solution. By rethinking campus printing as a remote-first service, it significantly improves efficiency, reduces friction, and enhances the overall student experience.

---
