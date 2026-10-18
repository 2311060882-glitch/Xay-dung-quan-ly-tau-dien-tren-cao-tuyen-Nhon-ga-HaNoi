export interface User {
    id: number;
    fullname: string;
    phone: string;
    avatar?: string;
}

export interface Wallet {
    balance: number;
    linked_bank: boolean;
}

export interface TicketType {
    id: number;
    name: string;
    price: number;
    duration_days: number;
}

export interface Ticket {
    id: number;
    ticket_code: string;
    ticket_type: string;
    line_name: string;
    owner_name: string;
    expire_date: string;
    status: 'ACTIVE' | 'EXPIRED';
    qr_code?: string;
}