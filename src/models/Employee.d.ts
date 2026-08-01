import mongoose from 'mongoose';
export declare const Employee: mongoose.Model<{
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
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
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    phone: string;
    email: string;
    status: "Active" | "On Leave" | "Former";
    role: "Owner" | "Manager" | "Editor" | "Printer Operator" | "Photographer" | "Receptionist";
    dateJoined: NativeDate;
    totalOrdersHandled: number;
    averageCompletionTime: number;
    photo?: string | null;
    salary?: number | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Employee.d.ts.map