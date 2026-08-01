import mongoose from 'mongoose';
export declare const Schedule: mongoose.Model<{
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    date: string;
    type: string;
    title: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    location?: string | null;
    customerName?: string | null;
    customerNumber?: string | null;
    assignedTo?: string | null;
    orderId?: mongoose.Types.ObjectId | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Schedule.d.ts.map