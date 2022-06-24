import { v4 } from 'uuid';
import { getConnection } from '../database.js';

export const getTasks = (req, res) => {
    const db = getConnection();
    res.json(db.data.tasks);
}

export const getTask = (req, res) => {
    const tasks = getConnection().data.tasks;
    const taskFound = tasks.find(x => x.id == req.params.id);
    if (!taskFound) return res.sendStatus(404);
    res.json(taskFound);
}

export const createTask = async (req, res) => {
    const newTask = {
        id: v4(),
        ...req.body
    };

    try {
        const db = getConnection();
        db.data.tasks.push(newTask);
        await db.write();

        res.json(newTask);    
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

export const updateTask = async (req, res) => {
    const db = getConnection();
    const taskFound = tasks.find(x => x.id == req.params.id);
    if (!taskFound) return res.sendStatus(404);

    taskFound.name = req.body.name;
    taskFound.description = req.body.description;

    db.data.tasks.map(t => t.id == req.params.id ? taskFound : t);

    await db.write();

    res.json(taskFound);
}

export const deleteTask = async (req, res) => {
    const db = getConnection();
    const taskFound = db.data.tasks.find((t) => t.id == req.params.id);
    if (!taskFound) return res.sendStatus(404);

    const newTasks = db.data.tasks.filter(t => t.id !== req.params.id);
    db.data.tasks = newTasks;
    await db.write();
    res.json(taskFound);
}

export const countTasks = (req, res) => {
    const totalTasks =  dbTasks.length;
    res.json(totalTasks);
}

function dbTasks() {
    return getConnection().data.tasks;
}
