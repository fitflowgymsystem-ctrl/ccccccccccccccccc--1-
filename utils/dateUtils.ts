import { MembershipType } from '../types';

/**
 * يحسب تاريخ الانتهاء بناءً على نوع الاشتراك وتاريخ البدء
 * @param type نوع العضوية (يومي، شهري، الخ)
 * @param startDate تاريخ البدء بتنسيق ISO
 * @returns تاريخ الانتهاء بتنسيق YYYY-MM-DD
 */
export const calculateExpiry = (type: MembershipType, startDate: string): string => {
    if (!startDate) return '';
    
    const date = new Date(startDate);
    
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) return '';

    const startDay = date.getDate();

    switch (type) {
        case MembershipType.DAILY:
            date.setDate(date.getDate() + 1);
            return date.toISOString().split('T')[0];
        case MembershipType.MONTHLY:
            date.setMonth(date.getMonth() + 1);
            break;
        case MembershipType.QUARTERLY:
            date.setMonth(date.getMonth() + 3);
            break;
        case MembershipType.BIANNUAL:
            date.setMonth(date.getMonth() + 6);
            break;
        case MembershipType.YEARLY:
            date.setFullYear(date.getFullYear() + 1);
            break;
        case MembershipType.LIFETIME:
            date.setFullYear(date.getFullYear() + 99);
            break;
        default:
            date.setMonth(date.getMonth() + 1);
    }
    
    // معالجة حالة تجاوز الأيام (مثلاً 31 يناير + شهر لا يجب أن يصبح 2 مارس)
    // إذا اختلف اليوم الحالي عن يوم البداية، فهذا يعني أننا انتقلنا لشهر أبعد
    // نقوم بالرجوع لآخر يوم في الشهر المقصود عبر ضبط اليوم على 0
    // Fixed: Removed redundant comparison 'type !== MembershipType.DAILY' because DAILY case returns early above
    if (date.getDate() !== startDay) {
        date.setDate(0);
    }
    
    try {
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};