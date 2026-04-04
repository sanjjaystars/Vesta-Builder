import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clothingRouter from "./clothing";
import outfitsRouter from "./outfits";
import favoritesRouter from "./favorites";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clothingRouter);
router.use(outfitsRouter);
router.use(favoritesRouter);
router.use(dashboardRouter);

export default router;
