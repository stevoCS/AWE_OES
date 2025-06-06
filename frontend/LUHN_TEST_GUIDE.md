# AWE Electronics - Luhn Algorithm Payment Testing Guide

## Overview
Our payment system now uses the standard Luhn algorithm (modulus 10 algorithm) to validate credit card numbers. This ensures a more realistic payment verification experience.

## Luhn Algorithm Validation Rules

### 1. Card Number Format Requirements
- Card number length: 13-19 digits
- Contains only numeric characters
- Must pass Luhn algorithm checksum

### 2. Supported Card Types
- **Visa**: Starts with 4, 13/16/19 digits
- **Mastercard**: Starts with 51-55 or 22-27, 16 digits
- **American Express**: Starts with 34 or 37, 15 digits
- **Discover**: Starts with 6011 or 65, 16 digits
- **JCB**: Starts with 35, 16 digits

## Test Cases
### Valid Card Numbers (Will Succeed)
```
4532015112830366 - Visa 
4000056655665556 - Visa 
5555555555554444 - Mastercard 
5105105105105100 - Mastercard 

```

### Invalid Card Numbers (Will Fail)
```
4532015112830367 - 

```

### Special Failure Conditions

#### 1. Card Number Last Digit Rules
- Last digit is 0 or 5: Simulates insufficient balance
- Last digit is 1 or 6: Simulates bank rejection

#### 2. CVV Special Values
- `000`: Triggers payment failure
- `999`: Triggers payment failure

#### 3. Cardholder Name Keywords
- Contains "fail" or "decline": Triggers payment failure

#### 4. CVV Length Validation
- American Express (15 digits): Requires 4-digit CVV
- Other cards: Requires 3-digit CVV

## Testing Recommendations

### Successful Payment Testing
1. Use valid Luhn algorithm card numbers (as listed above)
2. Ensure card number does not end with 0, 1, 5, or 6
3. Use normal CVV values (123, 456, etc.)
4. Use normal cardholder names

### Failed Payment Testing
1. Use invalid Luhn algorithm card numbers
2. Use valid card numbers ending with 0, 1, 5, or 6
3. Use special CVV values (000, 999)
4. Include "fail" or "decline" in cardholder name

## Algorithm Explanation

Luhn Algorithm Steps:
1. Traverse the card number from right to left
2. Multiply digits in even positions by 2
3. If the result is greater than 9, subtract 9
4. Sum all the digits
5. If the total is divisible by 10, the card number is valid

This ensures our payment system uses real bank card validation standards.