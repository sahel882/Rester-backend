import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import { clerkMiddleware } from '@clerk/express';
import userRoutes from './routes/userRoutes';
import gigRoutes from './routes/gigRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import conversationRoutes from './routes/conversationRoutes';
import messageRoutes from './routes/messageRoutes';
import paymentRoutes from './routes/paymentRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import jobRoutes from './routes/jobRoutes';
import internshipRoutes from './routes/internshipRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import disputeRoutes from './routes/disputeRoutes';
import categoryRoutes from './routes/categoryRoutes';
import followRoutes from "./routes/followRoutes";
import { generalLimiter, paymentLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:8081",
        "https://rester.lk",
        "*"
    ],
    credentials: true
}));
app.use(clerkMiddleware())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Rester API" });
});

app.use("/api/users", userRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentLimiter);
app.use("/api/payments", paymentRoutes);
app.use("/api/follows", followRoutes)
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/jobApplications", jobApplicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(ENV.PORT, () => console.log(`Server is running on PORT ${ENV.PORT}`));