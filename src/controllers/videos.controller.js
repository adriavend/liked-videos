import { v4 } from 'uuid';
import { getConnection } from '../database.js';
import { getCombinations, compareByMatch } from '../utils/utils.js'

export const getVideos = (req, res) => {
    const db = getConnection();
    res.json(db.data.videos);
}

export const getVideosByPage = (req, res) => {
    let tags = req.query.tags;

    let currentPage = req.params.page;
    
    const pageSize = 12;

    const db = getConnection();
    let videos = db.data.videos;

    /* filter by tags */
    if (tags != '') {
        const selectedTags = tags.split(',');
        var matrizTagCombinations = getCombinations(selectedTags);

        videos.forEach(obj => {
            let arrayObjTags = obj.tags.split(',').sort();
    
            for (var i = matrizTagCombinations.length - 1; i > -1; i--) {
                let intersection = arrayObjTags.filter(element => matrizTagCombinations[i].includes(element));
    
                if (intersection.length == matrizTagCombinations[i].length) {
                    obj['match'] = parseInt(matrizTagCombinations[i].length / selectedTags.length * 100);
                    //filterItems.push({ ...obj });
                    break;
                }
                else {
                    obj['match'] = 0;
                }
            }
        });

        videos = videos.sort(compareByMatch);
    } else {
        // if not exists tags then sort by id desc
        videos = videos.sort((a, b) => b.id - a.id);
    }
    /* end filter tags */

    videos = videos.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    res.json(videos);
}

export const getVideosTags = (req, res) => {
    const db = getConnection();
    let videos = db.data.videos;

    let aTags = videos.map(x => x.tags.split(','));
    let b = [];
    b = b.concat(...aTags); // set 2D to 1D array

    b = b.filter((v, i, a) => a.indexOf(v) == i); // remove duplicates

    let allTags = b.filter(x => x.length > 0).sort();

    // group by Letter
    let letters = allTags.map(x => x[0].toUpperCase()).filter((v, i, a) => a.indexOf(v) === i);

    let results = [];
    for (let letter of letters) {
        results.push({
            letter: letter,
            items: allTags.filter(x => x[0].toLowerCase() == letter.toLowerCase())
        });
    }

    res.json(results);
}

export const getVideo = (req, res) => {
    const videos = getConnection().data.videos;
    const videoFound = videos.find(x => x.id == req.params.id);
    if (!videoFound) return res.sendStatus(404);
    res.json(videoFound);
}

export const createVideo = async (req, res) => {
    const newVideo = {
        id: 0,
        uniqueId: v4(),
        createAt: new Date(),
        modifiedAt: null,
        ...req.body,
    };

    try {
        const db = getConnection();
        newVideo.id = db.data.videos.length + 1;
        db.data.videos.push(newVideo);
        await db.write();

        res.json(newVideo);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

export const updateVideo = async (req, res) => {
    const db = getConnection();
    const videoFound = db.data.videos.find(x => x.id == req.params.id);
    if (!videoFound) return res.sendStatus(404);

    const propsValues = req.body;
    for (var [key, value] of Object.entries(propsValues)) {
        videoFound[key] = value;
    }

    // videoFound.name = req.body.name;
    // videoFound.url = req.body.url;
    // videoFound.photo = req.body.photo;
    // videoFound.tags = req.body.tags;
    // videoFound.rate = req.body.rate;
    // videoFound.model = req.body.model;
    videoFound.modifiedAt = new Date();

    db.data.videos.map(t => t.id == req.params.id ? videoFound : t);

    await db.write();

    res.json(videoFound);
}

export const deleteVideo = async (req, res) => {
    const db = getConnection();
    const videoFound = db.data.videos.find((t) => t.id == req.params.id);
    if (!videoFound) return res.sendStatus(404);

    const newVideos = db.data.videos.filter(t => t.id !== req.params.id);
    db.data.videos = newVideos;
    await db.write();
    res.json(videoFound);
}

export const countVideos = (req, res) => {
    const totalVideos = getConnection().data.videos.length;
    res.json(totalVideos);
}
