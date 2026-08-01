import mongoose from 'mongoose';
export declare const Order: mongoose.Model<{
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    status: "Received" | "Assigned" | "Editing" | "Printing" | "Ready" | "Delivered" | "Cancelled";
    customer: mongoose.Types.ObjectId;
    service: string;
    quantity: number;
    price: number;
    totalAmount: number;
    paidAmount: number;
    expectedDeliveryDate: NativeDate;
    priority: "Low" | "Normal" | "High" | "Urgent";
    assignedEmployee: string;
    timeline: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }, {}, {}> & {
        timestamp: NativeDate;
        notes?: string | null;
        status?: string | null;
    }>;
    activityLogs: mongoose.Types.DocumentArray<{
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }, {}, {}> & {
        changedAt: NativeDate;
        notes?: string | null;
        changedBy?: string | null;
        previousStatus?: string | null;
        newStatus?: string | null;
    }>;
    orderId?: string | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Order.d.ts.map