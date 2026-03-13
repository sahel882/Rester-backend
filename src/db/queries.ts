import { db } from "./index";
import { eq, lte, and, sql } from "drizzle-orm";
import {
    users,
    gigs,
    orders,
    reviews,
    conversations,
    messages,
    payments,
    payouts,
    subscriptions,
    jobs,
    internships,
    jobApplications,
    notifications,
    disputes,
    categories,
    type NewUser,
    type NewGig,
    type NewOrder,
    type NewReview,
    type NewConversation,
    type NewMessage,
    type NewPayment,
    type NewPayout,
    type NewSubscription,
    type NewJob,
    type NewInternship,
    type NewJobApplication,
    type NewNotification,
    type NewDispute,
    type NewCategory,
} from "./schema";

// USERS
export const createUser = async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
};

export const getUserById = async (id: string) => {
    return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
    const existingUser = await getUserById(id);
    if (!existingUser) {
        throw new Error(`User with id ${id} not found`);
    }

    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
};

export const getUserByEmail = async (email: string) => {
    return db.query.users.findFirst({ where: eq(users.email, email) });
};

export const deleteUser = async (id: string) => {
    const existingUser = await getUserById(id);
    if (!existingUser) {
        throw new Error(`User with this ${id} not found`);
    }

    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user;
};

export const upsertUser = async (data: NewUser) => {
    const [user] = await db
        .insert(users)
        .values(data)
        .onConflictDoUpdate({
            target: users.id,
            set: data,
        })
        .returning();
    return user;
};

// GIGS
export const createGig = async (data: NewGig) => {
    const [gig] = await db.insert(gigs).values(data).returning();
    return gig;
};

export const getGigById = async (id: string) => {
    return db.query.gigs.findFirst({ where: eq(gigs.id, id) });
}

export const getAllGigs = async () => {
    return db.query.gigs.findMany({
        with: { seller: true },
        orderBy: (gigs, { desc }) => [desc(gigs.createdAt)]
    });
};

export const getGigsBySeller = async (sellerId: string) => {
    return db.query.gigs.findMany({
        with: { seller: true },
        where: eq(gigs.sellerId, sellerId)
    });
};

export const getGigsByCategory = async (catergory: string) => {
    return db.query.gigs.findMany({
        where: eq(gigs.category, catergory)
    });
};

export const updateGig = async (id: string, data: Partial<NewGig>) => {
    const existingGig = await getGigById(id);
    if (!existingGig) {
        throw new Error(`Gig with id ${id} not found`)
    }

    const [gig] = await db.update(gigs).set(data).where(eq(gigs.id, id)).returning();
    return gig;
};

export const deleteGig = async (id: string) => {
    const existingGig = await getGigById(id);
    if (!existingGig) {
        throw new Error(`Gig with id ${id} not found`)
    }

    const [gig] = await db.delete(gigs).where(eq(gigs.id, id)).returning();
    return gig;
};

// ORDERS
export const createOrder = async (data: NewOrder) => {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
};

export const getOrderById = async (id: string) => {
    return db.query.orders.findFirst({ where: eq(orders.id, id) });
};

export const getOrdersByBuyer = async (BuyerId: string) => {
    return db.query.orders.findMany({
        where: eq(orders.buyerId, BuyerId),
        with: {
            gig: true,
            buyer: true,
        }
    });
};

export const getOrdersBySeller = async (SellerId: string) => {
    return db.query.orders.findMany({
        where: eq(orders.sellerId, SellerId),
        with: {
            gig: true,
            seller: true
        }
    });
};

export const updateOrderStatus = async (
    id: string,
    status: "pending" | "active" | "delivered" | "completed" | "cancelled"
) => {
    const existingOrder = await getOrderById(id)
    if (!existingOrder) {
        throw new Error(`Order with id ${id} not found`)
    }

    const [order] = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning()
    return order;
};

export const autoCompleteOrder = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orderCompleted = await db
        .update(orders)
        .set({
            status: "completed",
            completedAt: new Date()
        })
        .where(
            and(
                eq(orders.status, "delivered"),
                lte(orders.deliveredAt, sevenDaysAgo)
            )
        )
        .returning()

    return orderCompleted;
};

export const approveOrder = async (id: string) => {

    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
        throw new Error(`Order with id ${id} not found`);
    }

    const orderCompleted = await db
        .update(orders)
        .set({
            status: "completed",
            completedAt: new Date()
        })
        .where(
            and(
                eq(orders.status, "delivered"),
                eq(orders.id, id)
            )
        )
        .returning()

    return orderCompleted;
};


// Review
export const createReview = async (data: NewReview) => {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
};

export const getReviewsByGig = async (gigId: string) => {
    return db.query.reviews.findMany({
        where: eq(reviews.gigId, gigId),
        with: {
            gig: true,
            seller: true,
            buyer: true
        }
    });
};

export const getReviewById = async (id: string) => {
    return db.query.reviews.findFirst({ where: eq(reviews.id, id) });
};

export const deleteReview = async (id: string) => {
    const existingReview = await getReviewById(id);
    if (!existingReview) {
        throw new Error(`Review with this id ${id} is not found`);
    }

    const [review] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return review;
};

// CONVERSATION
export const createConversation = async (data: NewConversation) => {
    const [conversation] = await db.insert(conversations).values(data).returning();
    return conversation;
};

export const getConversationById = async (id: string) => {
    return db.query.conversations.findFirst({ where: eq(conversations.id, id) });
};

export const getConversationsByUser = async (userId: string) => {
    return db.query.conversations.findMany({
        where: eq(conversations.buyerId, userId),
        with: {
            buyer: true,
            seller: true,
            messages: true
        }
    });
};

export const updateLastMessage = async (id: string, lastMessage: string) => {
    const existingConversation = await getConversationById(id);
    if (!existingConversation) {
        throw new Error(`subscription with this is ${id} is not found`)
    }

    const [conversation] = await db.update(conversations)
        .set({
            lastMessage,
            lastMessageAt: new Date()
        })
        .where(eq(conversations.id, id))
        .returning()
    return conversation;
};

// messages
export const createMessage = async (data: NewMessage) => {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
};

export const getMessagesByConversation = async (conversationId: string) => {
    return db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        with: {
            sender: true,
            receiver: true,
        }
    });
};

export const markMessagesAsRead = async (conversationId: string) => {
    await db
        .update(messages)
        .set({ isRead: true })
        .where(
            and(
                eq(messages.conversationId, conversationId),
                eq(messages.isRead, false)
            )
        )
};

// PAYMENT
export const createPayment = async (data: NewPayment) => {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
};

export const getPaymentById = async (id: string) => {
    return db.query.payments.findFirst({ where: eq(payments.id, id) });
};

export const getPaymentsByUser = async (userId: string) => {
    return db.query.payments.findMany({
        where: eq(payments.payerId, userId),
        with: {
            order: true,
            payer: true
        }
    })
};

export const updatePaymentStatus = async (
    id: string,
    status: "pending" | "completed" | "refunded"
) => {

    const existingPayment = await getPaymentById(id)
    if (!existingPayment) {
        throw new Error(`Payment with id ${id} not found`)
    }

    const [payment] = await db.update(payments)
        .set({ status })
        .where(eq(payments.id, id))
        .returning()
    return payment
};

// PAYOUT
export const createPayoutRequest = async (data: NewPayout) => {
    const [payout] = await db.insert(payouts).values(data).returning()
    return payout
}

export const getPayoutById = async (id: string) => {
    return db.query.payouts.findFirst({
        where: eq(payouts.id, id),
        with: { user: true }
    })
}

export const getPendingPayouts = async () => {
    return db.query.payouts.findMany({
        where: eq(payouts.status, "pending"),
        with: { user: true },
        orderBy: (payouts, { desc }) => [desc(payouts.createdAt)]
    })
}

export const updatePayoutStatus = async (
    id: string,
    status: "pending" | "completed" | "rejected"
) => {
    const [payout] = await db.update(payouts)
        .set({ status })
        .where(eq(payouts.id, id))
        .returning()
    return payout
}

export const releaseEscrow = async (orderId: string) => {
    const payment = await db.query.payments.findFirst({
        where: eq(payments.orderId, orderId)
    })
    if (!payment) throw new Error("Payment not found")

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId)
    })
    if (!order) throw new Error("Order not found")

    await db.update(users)
        .set({
            pendingBalance: sql`pending_balance + ${order.sellerEarning}`
        })
        .where(eq(users.id, order.sellerId))

    const [released] = await db.update(payments)
        .set({ status: "completed" })
        .where(eq(payments.orderId, orderId))
        .returning()

    return released
}

// SUBSCRIPTION
export const createSubscription = async (data: NewSubscription) => {
    const [subscription] = await db.insert(subscriptions).values(data).returning();
    return subscription;
};

export const getSubscriptionByUser = async (userId: string) => {
    return db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
    });
};

export const updateSubscription = async (id: string, data: Partial<NewSubscription>) => {
    const existingSubscription = await getSubscriptionByUser(id);
    if (!existingSubscription) {
        throw new Error(`subscription with this is ${id} is not found`)
    }

    const [subscription] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return subscription;
};

export const cancelSubscription = async (id: string) => {
    const existingSubscription = await getSubscriptionByUser(id)
    if (!existingSubscription) {
        throw new Error(`subscription with this is ${id} is not found`)
    }

    const [subscription] = await db.update(subscriptions)
        .set({
            status: "cancelled",
            endDate: new Date()
        })
        .where(eq(subscriptions.id, id))
        .returning();

    return subscription;
};

// JOB
export const createJob = async (data: NewJob) => {
    const [job] = await db.insert(jobs).values(data).returning();
    return job;
};

export const getJobById = async (id: string) => {
    return db.query.jobs.findFirst({ where: eq(jobs.id, id) });
};

export const getAllJobs = async () => {
    return db.query.jobs.findMany({
        with: { postedBy: true },
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)]
    });
};

export const getJobsByUser = async (userId: string) => {
    return db.query.jobs.findMany({
        where: eq(jobs.postedBy, userId),
    });
};

export const updateJob = async (id: string, data: Partial<NewJob>) => {
    const existingjob = await getJobById(id);
    if (!existingjob) {
        throw new Error(`Job with this is ${id} is not found`)
    }

    const [job] = await db.update(jobs).set(data).where(eq(jobs.id, id)).returning();
    return job;
};

export const deleteJob = async (id: string) => {
    const existingjob = await getJobById(id);
    if (!existingjob) {
        throw new Error(`Job with this is ${id} is not found`)
    }

    const [job] = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return job;
};

export const promoteJob = async (id: string, fee: number) => {
    const existingJob = await getJobById(id)
    if (!existingJob) {
        throw new Error(`Job with id ${id} not found`)
    }

    const [job] = await db.update(jobs)
        .set({
            isPromoted: true,
            promotionFee: fee.toString()
        })
        .where(eq(jobs.id, id))
        .returning()
    return job;
};

// INTERNSHIP
export const createInternship = async (data: NewInternship) => {
    const [internship] = await db.insert(internships).values(data).returning();
    return internship;
};

export const getInternshipById = async (id: string) => {
    return db.query.internships.findFirst({ where: eq(internships.id, id) });
};

export const getAllInternships = async () => {
    return db.query.internships.findMany({
        with: { postedBy: true },
        orderBy: (internships, { desc }) => [desc(internships.createdAt)]
    });
};

export const getInternshipsByUser = async (userId: string) => {
    return db.query.internships.findMany({
        where: eq(internships.postedBy, userId),
    });
};

export const updateInternship = async (id: string, data: Partial<NewInternship>) => {
    const existingInternship = await getInternshipById(id);
    if (!existingInternship) {
        throw new Error(`Internship with this is ${id} is not found`)
    }

    const [internship] = await db.update(internships).set(data).where(eq(internships.id, id)).returning();
    return internship;
};

export const deleteInternship = async (id: string) => {
    const existingInternship = await getInternshipById(id);
    if (!existingInternship) {
        throw new Error(`Internship with this is ${id} is not found`)
    }

    const [internship] = await db.delete(internships).where(eq(internships.id, id)).returning();
    return internship;
};

export const promoteInternship = async (id: string, fee: number) => {
    const existingInternship = await getInternshipById(id);
    if (!existingInternship) {
        throw new Error(`Internship with this is ${id} is not found`)
    }

    const [internship] = await db.update(internships)
        .set({
            isPromoted: true,
            promotionFee: fee.toString()
        })
        .where(eq(internships.id, id))
        .returning()
    return internship;
};

// JOB APPLICATION
export const createJobApplication = async (data: NewJobApplication) => {
    const [jobApplication] = await db.insert(jobApplications).values(data).returning();
    return jobApplication;
};

export const getApplicationById = async (id: string) => {
    return db.query.jobApplications.findFirst({ where: eq(jobApplications.id, id) });
};

export const getApplicationsByJob = async (JobId: string) => {
    return db.query.jobApplications.findMany({
        where: eq(jobApplications.jobId, JobId),
        with: {
            job: true,
            applicant: true,
        }
    });
};

export const getApplicationsByUser = async (userId: string) => {
    return db.query.jobApplications.findMany({
        where: eq(jobApplications.applicantId, userId)
    });
};

export const updateApplicationStatus = async (
    id: string,
    status: "pending" | "reviewed" | "accepted" | "rejected"
) => {

    const existingJobApplication = await getApplicationById(id);
    if (!existingJobApplication) {
        throw new Error(`No job application found with id ${id} not found`)
    }

    const [jobApplication] = await db.update(jobApplications)
        .set({ status })
        .where(eq(jobApplications.id, id))
        .returning()
    return jobApplication
};

// NOTIFICATION
export const createNotification = async (data: NewNotification) => {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
};

export const getNotificationsByUser = async (userId: string) => {
    return db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
    });
};

export const getNotificationById = async (id: string) => {
    return db.query.notifications.findFirst({
        where: eq(notifications.id, id)
    })
}

export const markNotificationAsRead = async (id: string) => {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
}

export const markAllNotificationsAsRead = async (userId: string) => {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId))
}

export const deleteNotification = async (id: string) => {
    const existingNotification = await getNotificationById(id)
    if (!existingNotification) {
        throw new Error(`notifications with this is ${id} is not found`)
    }

    const [notification] = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return notification;
};

// DISPUTE
export const createDispute = async (data: NewDispute) => {
    const [dispute] = await db.insert(disputes).values(data).returning();
    return dispute;
};

export const getDisputeById = async (id: string) => {
    return db.query.disputes.findFirst({
        where: eq(disputes.id, id)
    });
};

export const getDisputesByOrder = async (orderId: string) => {
    return db.query.disputes.findMany({
        where: eq(disputes.orderId, orderId),
        with: {
            order: true,
            raisedBy: true
        }
    });
};

export const updateDisputeStatus = async (
    id: string,
    status: "open" | "reviewing" | "resolved"
) => {

    const existingDispute = await getDisputeById(id);
    if (!existingDispute) {
        throw new Error(`No Dispute found with id ${id} not found`)
    }

    const [dispute] = await db.update(disputes)
        .set({ status })
        .where(eq(disputes.id, id))
        .returning()
    return dispute;
};

export const resolveDispute = async (id: string, resolution: string) => {
    const existingDispute = await getDisputeById(id)
    if (!existingDispute) {
        throw new Error(`Dispute with id ${id} not found`)
    }

    const [dispute] = await db.update(disputes)
        .set({
            status: "resolved",
            resolution
        })
        .where(eq(disputes.id, id))
        .returning()
    return dispute;
};

// CATEGORY
export const createCategory = async (data: NewCategory) => {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
};

export const getAllCategories = async () => {
    return db.query.categories.findMany({
        orderBy: (category, { desc }) => [desc(categories.createdAt)]
    });
};

export const getCategoryBySlug = async (slug: string) => {
    return db.query.categories.findFirst({
        where: eq(categories.slug, slug)
    })
};

export const getCategoryById = async (id: string) => {
    return db.query.categories.findFirst({
        where: eq(categories.id, id)
    })
}

export const updateCategory = async (id: string, data: Partial<NewCategory>) => {
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
        throw new Error(`category with this is ${id} is not found`)
    }

    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category;
};

export const deleteCategory = async (id: string) => {
    const existingCategory = await getCategoryById(id)
    if (!existingCategory) {
        throw new Error(`Category with this is ${id} is not found`)
    }

    const [category] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return category;
};