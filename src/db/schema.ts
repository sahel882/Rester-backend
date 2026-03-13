import { pgTable, text, timestamp, boolean, integer, decimal, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", [
    "client",
    "freelancer",
    "both",
    "admin"
]);

export const statusEnum = pgEnum("status", [
    "pending",
    "active",
    "delivered",
    "completed",
    "cancelled",
]);

export const paymentStatusEnum = pgEnum("paymentStatusEnum", [
    "pending",
    "completed",
    "refunded"
]);

export const planEnum = pgEnum("plan", [
    "personal",
    "business"
]);

export const planStatusEnum = pgEnum("planStatusEnum", [
    "active",
    "cancelled",
    "expired"
]);

export const typeEnum = pgEnum("typeEnum", [
    "fulltime",
    "parttime",
    "remote"
]);

export const jobStatusEnum = pgEnum("jobStatusEnum", [
    "pending",
    "reviewed",
    "accepted",
    "rejected"
]);

// ADD THESE with other enums at the top of schema.ts:
export const verificationStatusEnum = pgEnum("verificationStatus", [
    "pending",
    "active",
    "expired"
])

export const promotionStatusEnum = pgEnum("promotionStatus", [
    "pending",
    "active",
    "expired"
])

export const notificationTypeEnum = pgEnum("notificationTypeEnum", [
    "order",
    "message",
    "review",
    "payment"
]);

export const disputesStatusEnum = pgEnum("disputesStatusEnum", [
    "open",
    "reviewing",
    "resolved"
]);

export const subscriptionPlanEnum = pgEnum("subscriptionPlanEnum", [
    "pro",
    "business"
])

export const promotionTypeEnum = pgEnum("promotionTypeEnum", [
    "job",
    "internship"
])

export const payoutStatusEnum = pgEnum("payoutStatusEnum", [
    "pending",
    "completed",
    "rejected"
]);

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    imageUrl: text("image_url"),
    role: roleEnum("role").default("client"),
    bio: text("bio"),
    skill: text("skill"),
    country: text("country"),
    plan: text("plan").default("free"),
    pendingBalance: decimal("pending_balance", {
        precision: 10, scale: 2
    }).default("0"),
    isVerified: boolean("is_verified").default(false),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
    totalReviews: integer("total_reviews").default(0),
    totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const gigs = pgTable("gigs", {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: text("seller_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
    deliveryDays: integer("delivery_days").notNull().default(2),
    revisions: integer("revisions").notNull().default(1),
    imageUrl: text("image_url"),
    tags: text("tags"),
    isActive: boolean("is_active").default(false),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
    totalOrders: integer("total_orders").default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    gigId: uuid("gig_id").notNull().references(() => gigs.id),
    buyerId: text("buyer_id").notNull().references(() => users.id),
    sellerId: text("seller_id").notNull().references(() => users.id),
    price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
    commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
    sellerEarning: decimal("seller_earning", { precision: 10, scale: 2 }).notNull(),
    status: statusEnum("status").default("pending"),
    deliveryDays: integer("delivery_days").notNull().default(2),
    requirements: text("requirements").notNull(),
    deliveredAt: timestamp("delivered_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id),
    gigId: uuid("gig_id").notNull().references(() => gigs.id),
    buyerId: text("buyer_id").notNull().references(() => users.id),
    sellerId: text("seller_id").notNull().references(() => users.id),
    rating: integer("rating").notNull().default(5),
    comment: text("comment"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    buyerId: text("buyer_id").notNull().references(() => users.id),
    sellerId: text("seller_id").notNull().references(() => users.id),
    lastMessage: text("last_message"),
    lastMessageAt: timestamp("last_message_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id),
    senderId: text("sender_id").notNull().references(() => users.id),
    receiverId: text("receiver_id").notNull().references(() => users.id),
    content: text("content").notNull(),
    fileURL: text("file_url"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id),
    payerId: text("payer_id").notNull().references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull().default("0"),
    commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum("status").default("pending"),
    payHereRef: text("payhere_ref"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const payouts = pgTable("payouts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountName: text("account_name").notNull(),
    status: payoutStatusEnum("status").default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    plan: subscriptionPlanEnum("plan").notNull(),
    status: planStatusEnum("status").default("active"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    payHereRef: text("payhere_ref"),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// VERIFICATION
export const verifications = pgTable("verifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    status: verificationStatusEnum("status").default("pending"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    payHereRef: text("payhere_ref"),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// PROMOTION
export const promotions = pgTable("promotions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    type: promotionTypeEnum("type").notNull(),
    referenceId: text("reference_id").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    payHereRef: text("payhere_ref"),
    status: promotionStatusEnum("status").default("pending"),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
    id: uuid("id").primaryKey().defaultRandom(),
    postedBy: text("posted_by").notNull().references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    type: typeEnum("type").default("parttime"),
    salary: decimal("salary", { precision: 10, scale: 2 }).notNull().default("0"),
    location: text("location"),
    requirements: text("requirements"),
    isPromoted: boolean("is_promoted").default(false),
    promotionFee: decimal("promotion_fee", { precision: 10, scale: 2 }),
    deadline: timestamp("deadline", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const internships = pgTable("internships", {
    id: uuid("id").primaryKey().defaultRandom(),
    postedBy: text("posted_by").notNull().references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    company: text("company"),
    location: text("location"),
    duration: text("duration"),
    stipend: decimal("stipend", { precision: 10, scale: 2 }),
    requirements: text("requirements"),
    isPromoted: boolean("is_promoted").default(false),
    promotionFee: decimal("promotion_fee", { precision: 10, scale: 2 }),
    deadline: timestamp("deadline", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").notNull().references(() => jobs.id),
    applicantId: text("applicant_id").notNull().references(() => users.id),
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"),
    status: jobStatusEnum("status").default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    type: notificationTypeEnum("type").default("message"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),
    link: text("link"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const disputes = pgTable("disputes", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id),
    raisedBy: text("raised_by").notNull().references(() => users.id),
    reason: text("reason").notNull(),
    description: text("description").notNull(),
    status: disputesStatusEnum("status").default("open"),
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    icon: text("icon").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// USER RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
    gigs: many(gigs),
    buyerOrders: many(orders, { relationName: "buyer" }),
    sellerOrders: many(orders, { relationName: "seller" }),
    reviews: many(reviews),
    conversations: many(conversations),
    messages: many(messages),
    payments: many(payments),
    verifications: many(verifications),
    promotions: many(promotions),
    payouts: many(payouts),
    subscriptions: many(subscriptions),
    jobs: many(jobs),
    internships: many(internships),
    jobApplications: many(jobApplications),
    notifications: many(notifications),
    disputes: many(disputes),
}))

export const gigsRelations = relations(gigs, ({ one, many }) => ({
    seller: one(users, {
        fields: [gigs.sellerId],
        references: [users.id],
    }),
    orders: many(orders),
    reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    gig: one(gigs, {
        fields: [orders.gigId],
        references: [gigs.id],
    }),
    buyer: one(users, {
        fields: [orders.buyerId],
        references: [users.id],
        relationName: "buyer",
    }),
    seller: one(users, {
        fields: [orders.sellerId],
        references: [users.id],
        relationName: "seller",
    }),
    review: many(reviews),
    payment: many(payments),
    dispute: many(disputes),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    order: one(orders, {
        fields: [reviews.orderId],
        references: [orders.id],
    }),
    gig: one(gigs, {
        fields: [reviews.gigId],
        references: [gigs.id],
    }),
    buyer: one(users, {
        fields: [reviews.buyerId],
        references: [users.id],
        relationName: "buyer",
    }),
    seller: one(users, {
        fields: [reviews.sellerId],
        references: [users.id],
        relationName: "seller",
    }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    buyer: one(users, {
        fields: [conversations.buyerId],
        references: [users.id],
        relationName: "buyer",
    }),
    seller: one(users, {
        fields: [conversations.sellerId],
        references: [users.id],
        relationName: "seller",
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: "sender",
    }),
    receiver: one(users, {
        fields: [messages.receiverId],
        references: [users.id],
        relationName: "receiver",
    }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
    payer: one(users, {
        fields: [payments.payerId],
        references: [users.id],
    }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
    user: one(users, {
        fields: [payouts.userId],
        references: [users.id],
    }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
    user: one(users, {
        fields: [verifications.userId],
        references: [users.id],
    }),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
    user: one(users, {
        fields: [promotions.userId],
        references: [users.id],
    }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    postedBy: one(users, {
        fields: [jobs.postedBy],
        references: [users.id],
    }),
    applications: many(jobApplications),
}));

export const internshipsRelations = relations(internships, ({ one }) => ({
    postedBy: one(users, {
        fields: [internships.postedBy],
        references: [users.id],
    }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
    job: one(jobs, {
        fields: [jobApplications.jobId],
        references: [jobs.id],
    }),
    applicant: one(users, {
        fields: [jobApplications.applicantId],
        references: [users.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
    order: one(orders, {
        fields: [disputes.orderId],
        references: [orders.id],
    }),
    raisedBy: one(users, {
        fields: [disputes.raisedBy],
        references: [users.id],
    }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    gigs: many(gigs),
}));

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Gig = typeof gigs.$inferSelect
export type NewGig = typeof gigs.$inferInsert

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

export type Payout = typeof payouts.$inferSelect
export type NewPayout = typeof payouts.$inferInsert

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert

export type Promotion = typeof promotions.$inferSelect
export type NewPromotion = typeof promotions.$inferInsert

export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert

export type Internship = typeof internships.$inferSelect
export type NewInternship = typeof internships.$inferInsert

export type JobApplication = typeof jobApplications.$inferSelect
export type NewJobApplication = typeof jobApplications.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

export type Dispute = typeof disputes.$inferSelect
export type NewDispute = typeof disputes.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert