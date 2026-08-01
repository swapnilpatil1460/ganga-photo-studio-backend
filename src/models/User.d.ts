import mongoose from 'mongoose';
export declare const User: mongoose.Model<{
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
}, mongoose.Document<unknown, {}, {
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    email: string;
    role: "owner" | "employee" | "customer";
    password: string;
    settings?: {
        phone: string;
        email: string;
        address: string;
        theme: string;
        studioName: string;
        gstId: string;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=User.d.ts.map