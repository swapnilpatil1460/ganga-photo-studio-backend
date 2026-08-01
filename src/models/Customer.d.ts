import mongoose from 'mongoose';
export declare const Customer: mongoose.Model<{
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE" | "VIP";
    totalOrders: number;
    totalSpent: number;
    deleted: boolean;
    customerId?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Customer.d.ts.map