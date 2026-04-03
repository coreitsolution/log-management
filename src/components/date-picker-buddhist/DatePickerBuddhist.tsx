import dayjs, { Dayjs } from 'dayjs';
import "dayjs/locale/th";

// Material UI
import Typography from "@mui/material/Typography";
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers"
import type { DateView, DateOrTimeView } from '@mui/x-date-pickers/models';

// Utils
import buddhistEraAdapter from "../../utils/buddhistEraAdapter"

dayjs.locale("th");

type CustomDatePickerProps = Omit<
  DatePickerProps,
  'value' | 'onChange'
> & {
  id?: string
  label?: string
  labelFontSize?: string
  className?: string
  value: Date | null
  onChange: (date: Date | null, context: any) => void
  isWithTime?: boolean
  error?: boolean
  register?: any
  sx?: object
  maxDate?: Dayjs
  slotProps?: any
}

const DatePickerBuddhist: React.FC<CustomDatePickerProps> = ({
  id,
  label,
  labelFontSize = "14px",
  onChange,
  value,
  isWithTime,
  error = false, 
  register,
  sx = {},
  maxDate,
  className,
  ...props
}) => {
  const dayjsValue = value ? dayjs(value) : null;

  const dateViews: readonly DateView[] = ["year", "month", "day"];
  const dateTimeViews: readonly DateOrTimeView[] = [
    "year",
    "month",
    "day",
    "hours",
    "minutes",
  ];
  
  const handleDateChange = (date: Dayjs | null, context: any) => {
    if (onChange) {
      onChange(date?.toDate() || null, context);
      if (register) {
        register.onChange({
          target: { name: register.name, value: date?.toDate() || null },
        });
      }
    }
  }

  const textFieldProps = {
    size: 'medium' as 'medium',
    style: { height: '30px', justifyContent: 'center' },
    fullWidth: true,
    inputProps: {
      placeholder: isWithTime ? "DD/MM/YYYY hh:mm" : "DD/MM/YYYY",
    },
    error: error,
    sx: {
      '& .MuiPickersInputBase-root': {
        height: '30px',
        fontSize: labelFontSize,
      },
      '& .MuiOutlinedInput-root': {
        height: '30px',
        borderRadius: '5px',
        backgroundColor: 'white',

        '& input': {
          padding: '0 14px',
          height: '30px',
          boxSizing: 'border-box',
        },

        '& fieldset': {
          borderColor: error ? 'red' : 'default',
          borderWidth: '2px',
        },
        '&:hover fieldset': {
          borderColor: error ? 'red' : 'default',
        },
        '&.Mui-focused fieldset': {
          borderColor: error ? 'red' : 'default',
        },
      },
      '& .MuiSvgIcon-root': {
        color: '#81898E',
      },
      ...sx,
    }
  }

  const commonProps = {
    value: dayjsValue,
    onChange: handleDateChange,
    slotProps: { 
      ...props.slotProps,
      textField: textFieldProps,
      toolbar: {
        toolbarFormat:
          isWithTime ? "D MMMM HH:mm" : "D MMMM",
      },
    },
    ...(maxDate && { maxDate }),
    desktopModeMediaQuery: "@media (min-width: 0px)",
  };

  return (
    <div id={id} className={`flex flex-col w-full ${className || ''}`}>
      {label && (
        <Typography
          variant="subtitle1"
          color="var(--component-color)"
          sx={{ fontSize: labelFontSize }}
        >
          {label}
        </Typography>
      )}
      <LocalizationProvider 
        dateAdapter={buddhistEraAdapter} 
        adapterLocale={"th"}
      >
        {!isWithTime ? (
          <DatePicker
            {...props}
            {...commonProps}
            views={props.views ?? dateViews}
            openTo={props.openTo || "day"}
          />
        ) : (
          <DateTimePicker
            {...props as DateTimePickerProps}
            {...commonProps}
            views={dateTimeViews}
            openTo="day"
          />
        )}
      </LocalizationProvider>
    </div>
  )
}

export default DatePickerBuddhist