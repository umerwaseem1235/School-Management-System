# PDF Export Files - Simple Professional Design Update Plan

## Design System Overview

All PDF exports will follow a clean, simple, professional business-standard design with:

### Color Palette
- **Dark Gray Text**: `#2c3e50` (RGB: 0.17, 0.24, 0.31)
- **Medium Text**: `#6c757d` (RGB: 0.42, 0.46, 0.49)
- **Light Text**: `#7f8c8d` (RGB: 0.50, 0.55, 0.55)
- **Light Gray Background**: `#f8f9fa` (RGB: 0.97, 0.98, 0.98)
- **Table Header**: `#ecf0f1` (RGB: 0.93, 0.94, 0.95)
- **Border Light**: `#dee2e6` (RGB: 0.87, 0.89, 0.90)
- **Border Medium**: `#bdc3c7` (RGB: 0.74, 0.77, 0.78)

### Document Structure

#### 1. Header (Every Page)
```
┌────────────────────────────────────────┐
│ [School Name - Bold, Centered, 12pt]  │
│ [Document Title - Bold, 10pt]         │
│ [Subtitle/Date - Normal, 8pt]         │
│ ───────────────────────────────────── │
└────────────────────────────────────────┘
```

#### 2. Summary Box (Optional)
```
┌─────────────────────────────────────────┐
│  Light gray background (#f8f9fa)        │
│  Simple border                          │
│  Key metrics in clean layout           │
└─────────────────────────────────────────┘
```

#### 3. Tables
- Header: Light gray background (#ecf0f1), bold text
- Rows: Alternating white/light gray
- Borders: Simple, light gray (#dee2e6)
- Text: 9pt normal, headers 9pt bold

#### 4. Footer (Every Page)
```
───────────────────────────────────────────
Official School Document    Page X of Y
```

## Files to Update (14 Total)

### ✓ Attendance Module (2 files)
1. `attendance/reports/attendance-report-export.ts` - NEEDS UPDATE
2. `attendance/staff-reports/staff-report-export.ts` - NEEDS UPDATE

### ✓ Transport Module (1 file)
3. `transport/transport-export.ts` - NEEDS UPDATE

### ✓ Accounts Module (1 file)
4. `accounts/accounts-export.ts` - NEEDS UPDATE

### ✓ Inventory Module (1 file)
5. `inventory/inventory-export.ts` - NEEDS UPDATE

### ✓ Assets Module (1 file)
6. `assets/assets-export.ts` - NEEDS UPDATE

### ✓ Expenses Module (1 file)
7. `expenses/expenses-export.ts` - NEEDS UPDATE

### ✓ Fees Module (7 files)
8. `fees/scholarships/scholarships-export.ts` - NEEDS UPDATE
9. `fees/fee-configuration/fee-configuration-export.ts` - NEEDS UPDATE
10. `fees/reports/reports-export.ts` - NEEDS UPDATE
11. `fees/adjustments/adjustments-export.ts` - NEEDS UPDATE
12. `fees/refund/refund-export.ts` - NEEDS UPDATE
13. `fees/fines/fines-export.ts` - NEEDS UPDATE
14. `fees/payroll/payroll-export.ts` - NEEDS UPDATE

## Update Strategy

### For each file:

1. **Remove fancy styling**:
   - Navy blue headers → Simple gray
   - Gold accents → Removed
   - Complex KPI cards → Simple summary boxes
   - Gradients → Solid colors

2. **Simplify headers**:
   - Remove brand emblems
   - Remove vertical dividers
   - Simple centered school name + title

3. **Clean up tables**:
   - Light gray header (#ecf0f1)
   - Simple alternating rows
   - Light borders (#dee2e6)
   - Professional spacing

4. **Professional footers**:
   - Single line separator
   - "Official School Document" text
   - Page numbers

5. **Consistent spacing**:
   - Adequate margins (15mm)
   - Clear visual hierarchy
   - Easy to read fonts

## Expected Outcome

All PDFs will have a clean, professional, business-standard appearance suitable for:
- Official school records
- Audit documentation
- Parent distribution
- Government submissions
- Professional archival

**No premium styling, no fancy colors - just clean, professional documents.**
