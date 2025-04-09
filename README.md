# Loan Tracker Application

A mobile application built with **React Native (Expo)** and a backend powered by **Node.js** to help users manage loans, track installments, and set reminders. The app allows users to create loans, add partial payments or installments, and receive notifications for due dates.

## Features

- **Loan Management:**
  - Add loans with borrower name, amount, and due date.
  - Delete loans when fully settled or no longer needed.
  - Update loan details (e.g., due date adjustments).

- **Installment Methods:**
  - **Equal Installments:** Divide the loan amount into fixed monthly payments with interest (annuity method).
  - **Decreasing Installments:** Pay a fixed principal amount each month with decreasing interest as the remaining balance reduces.
  - **Custom Installments:** Manually set payment amounts for flexible repayment schedules.
  - Track partial payments and see remaining balance updates.

- **Notifications:**
  - Schedule reminders for due dates using Expo Notifications.

- **Cross-Platform:**
  - Works on both Android and iOS via Expo Go.

- **Backend:**
  - RESTful API with Node.js and SQLite for persistent storage of loans and payments.

## Demo
*(Add a link to a live demo or screenshot here if hosted, e.g., via Expo or a video/gif.)*

## Technologies Used

- **Frontend:**
  - React Native (Expo)
  - Expo DateTimePicker
  - Expo Notifications
  - React Navigation
  - Axios (for API calls)

- **Backend:**
  - Node.js
  - Express.js
  - SQLite (lightweight database)

## Prerequisites

- **Node.js**: v18.x or higher
- **npm** or **yarn**
- **Expo CLI**: For running the frontend
- **Android/iOS Device**: With Expo Go app installed (or emulators)
- A computer with internet access for backend hosting

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-username/LoanTracker.git
cd LoanTracker
