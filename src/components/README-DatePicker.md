# DatePicker Component

A reusable date picker component that provides a consistent calendar interface across all forms.

## Usage

```tsx
import DatePicker from '@/components/DatePicker';

// Basic usage
<DatePicker 
  selected={selectedDate} 
  onSelect={setSelectedDate} 
/>

// With custom placeholder
<DatePicker 
  selected={startDate} 
  onSelect={setStartDate} 
  placeholder="Select start date"
/>

// Disabled state
<DatePicker 
  selected={endDate} 
  onSelect={setEndDate} 
  disabled={isDisabled}
/>
```

## Features

- Uses shadcn/ui Calendar and Popover components
- Consistent date formatting with date-fns
- Responsive design
- Accessible keyboard navigation
- Custom placeholder text support
- Disabled state support

## Already Implemented

All existing forms already use Calendar/Popover components for date selection:
- ProjectForm.tsx (start_date, end_date)
- LogForm.tsx (date)
- PaymentForm.tsx (date_paid)
- WorkPeriodForm.tsx (start_date, end_date with date range support)

This DatePicker component is provided for future forms or components that need date selection functionality.
