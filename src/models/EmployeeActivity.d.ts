import mongoose from 'mongoose';
export declare const EmployeeActivity: mongoose.Model<{
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
}, mongoose.Document<unknown, {}, {
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    description: string;
    orderId: string;
    timestamp: NativeDate;
    employeeId: string;
    employeeName: string;
    actionType: "Assigned" | "Status Update" | "Comment" | "System";
    durationHours: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=EmployeeActivity.d.ts.map