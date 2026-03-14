import { Router } from "express"
import { requireAuth } from "@clerk/express"
import { followUser, unfollowUser, getFollowers, getFollowing, getFollowCounts } from "../controllers/followContoller";

const router = Router()

router.post("/follow", requireAuth(), followUser);

router.post("/unfollow", requireAuth(), unfollowUser);

router.get("/:id/followers", getFollowers);

router.get("/:id/following", getFollowing);

router.get("/:id/counts", getFollowCounts);

export default router