/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { printIonWarning } from "../../../utils/logging/index";
import { isAfter, isBefore } from "./comparison";
import { getNumDaysInMonth } from "./helpers";
const ISO_8601_REGEXP = 
// eslint-disable-next-line no-useless-escape
/^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;
// eslint-disable-next-line no-useless-escape
const TIME_REGEXP = /^((\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;
/**
 * Use to convert a string of comma separated numbers or
 * an array of numbers, and clean up any user input
 */
export const convertToArrayOfNumbers = (input) => {
    if (input === undefined) {
        return;
    }
    let processedInput = input;
    if (typeof input === 'string') {
        // convert the string to an array of strings
        // auto remove any whitespace and [] characters
        processedInput = input.replace(/\[|\]|\s/g, '').split(',');
    }
    let values;
    if (Array.isArray(processedInput)) {
        // ensure each value is an actual number in the returned array
        values = processedInput.map((num) => parseInt(num, 10)).filter(isFinite);
    }
    else {
        values = [processedInput];
    }
    return values;
};
/**
 * Extracts date information
 * from a .calendar-day element
 * into DatetimeParts.
 */
export const getPartsFromCalendarDay = (el) => {
    return {
        month: parseInt(el.getAttribute('data-month'), 10),
        day: parseInt(el.getAttribute('data-day'), 10),
        year: parseInt(el.getAttribute('data-year'), 10),
        dayOfWeek: parseInt(el.getAttribute('data-day-of-week'), 10),
    };
};
export function parseDate(val) {
    if (Array.isArray(val)) {
        const parsedArray = [];
        for (const valStr of val) {
            const parsedVal = parseDate(valStr);
            /**
             * If any of the values weren't parsed correctly, consider
             * the entire batch incorrect. This simplifies the type
             * signatures by having "undefined" be a general error case
             * instead of returning (Datetime | undefined)[], which is
             * harder for TS to perform type narrowing on.
             */
            if (!parsedVal) {
                return undefined;
            }
            parsedArray.push(parsedVal);
        }
        return parsedArray;
    }
    // manually parse IS0 cuz Date.parse cannot be trusted
    // ISO 8601 format: 1994-12-15T13:47:20Z
    let parse = null;
    if (val != null && val !== '') {
        // try parsing for just time first, HH:MM
        parse = TIME_REGEXP.exec(val);
        if (parse) {
            // adjust the array so it fits nicely with the datetime parse
            parse.unshift(undefined, undefined);
            parse[2] = parse[3] = undefined;
        }
        else {
            // try parsing for full ISO datetime
            parse = ISO_8601_REGEXP.exec(val);
        }
    }
    if (parse === null) {
        // wasn't able to parse the ISO datetime
        printIonWarning(`[ion-datetime] - Unable to parse date string: ${val}. Please provide a valid ISO 8601 datetime string.`);
        return undefined;
    }
    // ensure all the parse values exist with at least 0
    for (let i = 1; i < 8; i++) {
        parse[i] = parse[i] !== undefined ? parseInt(parse[i], 10) : undefined;
    }
    // can also get second and millisecond from parse[6] and parse[7] if needed
    return {
        year: parse[1],
        month: parse[2],
        day: parse[3],
        hour: parse[4],
        minute: parse[5],
        ampm: parse[4] < 12 ? 'am' : 'pm',
    };
}
export const clampDate = (dateParts, minParts, maxParts) => {
    if (minParts && isBefore(dateParts, minParts)) {
        return minParts;
    }
    else if (maxParts && isAfter(dateParts, maxParts)) {
        return maxParts;
    }
    return dateParts;
};
/**
 * Parses an hour and returns if the value is in the morning (am) or afternoon (pm).
 * @param hour The hour to format, should be 0-23
 * @returns `pm` if the hour is greater than or equal to 12, `am` if less than 12.
 */
export const parseAmPm = (hour) => {
    return hour >= 12 ? 'pm' : 'am';
};
/**
 * Takes a max date string and creates a DatetimeParts
 * object, filling in any missing information.
 * For example, max="2012" would fill in the missing
 * month, day, hour, and minute information.
 */
export const parseMaxParts = (max, todayParts) => {
    const result = parseDate(max);
    /**
     * If min was not a valid date then return undefined.
     */
    if (result === undefined) {
        return;
    }
    const { month, day, year, hour, minute } = result;
    /**
     * When passing in `max` or `min`, developers
     * can pass in any ISO-8601 string. This means
     * that not all of the date/time fields are defined.
     * For example, passing max="2012" is valid even though
     * there is no month, day, hour, or minute data.
     * However, all of this data is required when clamping the date
     * so that the correct initial value can be selected. As a result,
     * we need to fill in any omitted data with the min or max values.
     */
    const yearValue = year !== null && year !== void 0 ? year : todayParts.year;
    const monthValue = month !== null && month !== void 0 ? month : 12;
    return {
        month: monthValue,
        day: day !== null && day !== void 0 ? day : getNumDaysInMonth(monthValue, yearValue),
        /**
         * Passing in "HH:mm" is a valid ISO-8601
         * string, so we just default to the current year
         * in this case.
         */
        year: yearValue,
        hour: hour !== null && hour !== void 0 ? hour : 23,
        minute: minute !== null && minute !== void 0 ? minute : 59,
    };
};
/**
 * Takes a min date string and creates a DatetimeParts
 * object, filling in any missing information.
 * For example, min="2012" would fill in the missing
 * month, day, hour, and minute information.
 */
export const parseMinParts = (min, todayParts) => {
    const result = parseDate(min);
    /**
     * If min was not a valid date then return undefined.
     */
    if (result === undefined) {
        return;
    }
    const { month, day, year, hour, minute } = result;
    /**
     * When passing in `max` or `min`, developers
     * can pass in any ISO-8601 string. This means
     * that not all of the date/time fields are defined.
     * For example, passing max="2012" is valid even though
     * there is no month, day, hour, or minute data.
     * However, all of this data is required when clamping the date
     * so that the correct initial value can be selected. As a result,
     * we need to fill in any omitted data with the min or max values.
     */
    return {
        month: month !== null && month !== void 0 ? month : 1,
        day: day !== null && day !== void 0 ? day : 1,
        /**
         * Passing in "HH:mm" is a valid ISO-8601
         * string, so we just default to the current year
         * in this case.
         */
        year: year !== null && year !== void 0 ? year : todayParts.year,
        hour: hour !== null && hour !== void 0 ? hour : 0,
        minute: minute !== null && minute !== void 0 ? minute : 0,
    };
};
