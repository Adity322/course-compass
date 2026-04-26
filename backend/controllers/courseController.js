import Course from "../models/Course.js";
import csv from "csv-parser";
import stream from "stream";
import redisClient from "../config/redis.js";

export const uploadCourses = async (req, res) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const courses = [];

    bufferStream
      .pipe(csv())
      .on("data", (data) => {
        courses.push({
          course_id: data["Unique ID"],
          title: data["Course Name"],
          description: data["Overview/Description"],
          category: data["Discipline/Major"],
          instructor: data["University Name"], 
          duration: data["Duration (Months)"]
        });
      })
      .on("end", async () => {
        await Course.insertMany(courses);
        res.json({ message: "Courses uploaded successfully", count: courses.length });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;

    // 1. Check Redis Cache
    const cachedData = await redisClient.get(query);

    if (cachedData) {
      console.log("Cached Data:", cachedData);
      return res.json(JSON.parse(cachedData));
    }

    // 2. Fetch from MongoDB
    console.log("Cached Data:", cachedData);

    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { instructor: { $regex: query, $options: "i" } }
      ]
    });

    // 3. Store in Redis (expiry 60 sec)
    await redisClient.setEx(query, 60, JSON.stringify(courses));

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getCourses = async (req, res) => {
  try {
    const cacheKey = "all_courses";

    // Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Fetch from MongoDB
    const courses = await Course.find({});

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(courses));

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};