import { Router } from "express";
import { countVideos, createVideo, deleteVideo, getVideo, getVideos, getVideosByPage, updateVideo, getVideosTags } from '../controllers/videos.controller.js';

const router = Router();

router.get('/videos', getVideos);
router.get('/videos/page/:page', getVideosByPage);
router.get('/videos/tags/', getVideosTags);
router.get('/videos/count', countVideos);
router.get('/videos/:id', getVideo);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

export default router;