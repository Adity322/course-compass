export const getRecommendations = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "description is required" });
    }

    // Mock recommendations based on description keywords
    // Replace this logic with real Gemini API call when key is available
    let suggestions = [];

    if (description.toLowerCase().includes("data") || description.toLowerCase().includes("analytics")) {
      suggestions = [
        { courseName: "Data Science Fundamentals", universityName: "MIT OpenCourseWare", matchScore: 95, rationale: "Strong match for data-focused interests." },
        { courseName: "Python for Data Analysis", universityName: "Stanford University", matchScore: 88, rationale: "Python is the industry standard for data work." },
        { courseName: "Machine Learning Basics", universityName: "Carnegie Mellon", matchScore: 82, rationale: "Great next step after data fundamentals." }
      ];
    } else if (description.toLowerCase().includes("web") || description.toLowerCase().includes("frontend")) {
      suggestions = [
        { courseName: "Full Stack Web Development", universityName: "University of Helsinki", matchScore: 93, rationale: "Covers both frontend and backend comprehensively." },
        { courseName: "JavaScript Essentials", universityName: "freeCodeCamp University", matchScore: 87, rationale: "Core language for all web development." },
        { courseName: "React for Beginners", universityName: "Scrimba Institute", matchScore: 80, rationale: "Most in-demand frontend framework today." }
      ];
    } else if (description.toLowerCase().includes("ai") || description.toLowerCase().includes("machine learning")) {
      suggestions = [
        { courseName: "Introduction to Artificial Intelligence", universityName: "Stanford University", matchScore: 96, rationale: "Perfect for AI-focused learners." },
        { courseName: "Deep Learning Specialization", universityName: "DeepLearning.AI", matchScore: 91, rationale: "Industry-leading deep learning curriculum." },
        { courseName: "Neural Networks from Scratch", universityName: "Oxford University", matchScore: 85, rationale: "Builds strong theoretical foundations." }
      ];
    } else {
      suggestions = [
        { courseName: "Computer Science Fundamentals", universityName: "Harvard University", matchScore: 78, rationale: "Broad foundation suitable for any tech path." },
        { courseName: "Software Engineering Principles", universityName: "UC Berkeley", matchScore: 74, rationale: "Great for building professional engineering skills." },
        { courseName: "Problem Solving and Algorithms", universityName: "Princeton University", matchScore: 70, rationale: "Core skill for any programming career." }
      ];
    }

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};