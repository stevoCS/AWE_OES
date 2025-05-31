# AWE Electronics Frontend

Modern e-commerce frontend built with React + Vite

## Features
- 🛍️ Product showcase and shopping cart
- 👤 User registration and login
- 💳 Payment and order management
- 🎨 Dark/Light theme toggle

## Usage

```bash
# Install
npm install

# Start
npm run dev

# Build
npm run build
```
## Tech Stack
React 18 + Vite + React Router + Context API

## Overview 
Our payment system now uses the standard Luhn algorithm (mod 10 algorithm) to verify the validity of credit card numbers.

## Test Cases 
### Valid Card Numbers (Will Succeed) 
```
4532015112830366 - Visa (16 digits) 
4000056655665556 - Visa (16 digits) 5
555555555554444 - Mastercard (16 digits) 
5105105105105100 - Mastercard (16 digits) 
378282246310005 - American Express (15 digits) 
371449635398431 - American Express (15 digits) 
6011111111111117 - Discover (16 digits) 
6011000990139424 - Discover (16 digits)

### Special Failure Conditions

#### 1. Card Number Last Digit Rules
- Last digit is 0 or 5: Simulates insufficient balance
- Last digit is 1 or 6: Simulates bank rejection

#### 2. CVV Special Values
- `000`: Triggers payment failure
- `999`: Triggers payment failure