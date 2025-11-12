export interface KeyStatus {
    success: boolean;
    key_found: boolean;
    valid: boolean;
    expires_at: number | null;
    current_time: number;
    days_remaining: number | null;
    error: string | null;
}