require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas!");

    const passwordHash = await bcrypt.hash("Password123!", 10);

    // Profile photos (Unsplash high quality portrait CDN URLs)
    const avatars = {
      sidharth: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      rahul: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80",
      ananya: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      priya: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      aarav: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      sanjey: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    };

    const usersData = [
      {
        email: "sidharthmalik135@gmail.com",
        firstName: "Sidharth",
        lastName: "Malik",
        role: "student",
        password: passwordHash,
        picturePath: avatars.sidharth,
        batch: "MCA 2024-2026",
        occupation: "Full-Stack Developer | MCA '26",
        skills: ["React", "Node.js", "MongoDB", "Redis", "TypeScript", "Docker"],
        location: "Delhi, India",
        githubUrl: "https://github.com/sidharthmalik",
        linkedinUrl: "https://linkedin.com/in/sidharthmalik",
        portfolioUrl: "https://sidharthmalik.dev",
        viewedProfile: 284,
        impressions: 1140,
      },
      {
        email: "rahulsharma@gmail.com",
        firstName: "Rahul",
        lastName: "Sharma",
        role: "student",
        password: passwordHash,
        picturePath: avatars.rahul,
        batch: "B.Tech CSE 2022-2026",
        occupation: "DSA Enthusiast & Competitive Programmer",
        skills: ["C++", "Java", "Python", "Algorithms", "LeetCode 500+"],
        location: "Noida, UP, India",
        githubUrl: "https://github.com/rahulsharma",
        linkedinUrl: "https://linkedin.com/in/rahulsharma",
        portfolioUrl: "",
        viewedProfile: 195,
        impressions: 730,
      },
      {
        email: "ananya.verma@dtu.ac.in",
        firstName: "Ananya",
        lastName: "Verma",
        role: "alumni",
        password: passwordHash,
        picturePath: avatars.ananya,
        batch: "B.Tech 2020-2024 (Alumni)",
        occupation: "Software Development Engineer @ Microsoft",
        skills: ["System Design", "Go", "TypeScript", "Microservices", "Azure"],
        location: "Bengaluru, Karnataka, India",
        githubUrl: "https://github.com/ananyaverma",
        linkedinUrl: "https://linkedin.com/in/ananyaverma",
        portfolioUrl: "https://ananyaverma.io",
        viewedProfile: 512,
        impressions: 3420,
      },
      {
        email: "priya.patel@mca.ac.in",
        firstName: "Priya",
        lastName: "Patel",
        role: "student",
        password: passwordHash,
        picturePath: avatars.priya,
        batch: "MCA 2024-2026",
        occupation: "AI & ML Researcher | Open Source Contributor",
        skills: ["Python", "PyTorch", "FastAPI", "Computer Vision", "LangChain"],
        location: "Mumbai, Maharashtra, India",
        githubUrl: "https://github.com/priyapatel",
        linkedinUrl: "https://linkedin.com/in/priyapatel",
        portfolioUrl: "",
        viewedProfile: 168,
        impressions: 890,
      },
      {
        email: "aarav.sharma@btech2026.nit.ac.in",
        firstName: "Aarav",
        lastName: "Sharma",
        role: "student",
        password: passwordHash,
        picturePath: avatars.aarav,
        batch: "B.Tech IT 2022-2026",
        occupation: "DevOps & Cloud Engineer in Training",
        skills: ["AWS", "Kubernetes", "Terraform", "Docker", "Linux"],
        location: "Gurugram, Haryana, India",
        githubUrl: "https://github.com/aaravsharma",
        linkedinUrl: "https://linkedin.com/in/aaravsharma",
        portfolioUrl: "",
        viewedProfile: 142,
        impressions: 560,
      },
      {
        email: "sanjeydev@123gmail.com",
        firstName: "Sanjey",
        lastName: "Dev",
        role: "developer",
        password: passwordHash,
        picturePath: avatars.sanjey,
        batch: "B.Tech 2021-2025",
        occupation: "Mobile & Web Developer | Hackathon Finalist",
        skills: ["React Native", "Flutter", "Firebase", "Node.js", "GraphQL"],
        location: "Pune, Maharashtra, India",
        githubUrl: "https://github.com/sanjeydev",
        linkedinUrl: "https://linkedin.com/in/sanjeydev",
        portfolioUrl: "",
        viewedProfile: 220,
        impressions: 910,
      },
    ];

    console.log("Upserting users with rich profiles and avatars...");
    const userDocs = {};
    for (const u of usersData) {
      let doc = await User.findOne({ email: u.email });
      if (doc) {
        Object.assign(doc, u);
        await doc.save();
      } else {
        doc = await User.create(u);
      }
      userDocs[u.firstName.toLowerCase()] = doc;
    }

    // Connect mutual friends
    const allUserIds = Object.values(userDocs).map((u) => u._id);
    for (const key of Object.keys(userDocs)) {
      const user = userDocs[key];
      const friends = allUserIds.filter((id) => !id.equals(user._id));
      user.friends = friends;
      await user.save();
    }
    console.log("Updated users and interconnected friends.");

    // Clean up empty / authorless posts
    console.log("Cleaning up old incomplete posts...");
    await Post.deleteMany({
      $or: [
        { userId: { $exists: false } },
        { firstName: { $exists: false } },
        { firstName: "" },
        { postType: { $exists: false } },
      ],
    });
    await Comment.deleteMany({});

    // Sample Media URLs
    const media = {
      systemDesignImg: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      hackathonImg: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      studyNotesImg: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      campusViewImg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
      aiArtImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      codeSnippetImg: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      projectVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      festVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    };

    // Helper to generate like map
    function makeLikes(...users) {
      const map = new Map();
      users.forEach((u) => map.set(u._id.toString(), true));
      return map;
    }

    const postsToCreate = [
      {
        user: userDocs.sidharth,
        postType: "resource",
        description: "🚀 Complete System Design & Microservices Architecture Cheat Sheet!\n\nWe compiled high-level architectural patterns covering API Gateways, Redis distributed caching, event-driven architecture with Kafka, and database sharding techniques. Perfect for your upcoming technical interviews and semester project presentations!",
        picturePath: media.systemDesignImg,
        mediaType: "image",
        tags: ["systemdesign", "architecture", "microservices", "interviewprep", "resources"],
        likes: makeLikes(userDocs.rahul, userDocs.ananya, userDocs.priya, userDocs.aarav),
        comments: [
          { user: userDocs.rahul, text: "Bookmarked! The Redis caching section is exceptionally clear." },
          { user: userDocs.ananya, text: "Nice breakdown Sidharth! Make sure to also add circuit breakers and rate limiting." },
          { user: userDocs.priya, text: "Thanks for sharing! This is so helpful for our final year project architecture." },
        ],
      },
      {
        user: userDocs.rahul,
        postType: "doubt",
        description: "❓ Quick doubt on LeetCode 72 (Edit Distance) & Dynamic Programming memoization:\n\nWhen transforming word1 to word2, is it always optimal to initialize the DP table with base cases (i=0, j=0)? I'm getting a Time Limit Exceeded (TLE) on edge case test inputs with large string prefixes. Has anyone optimized the space complexity down to O(min(m, n))?",
        picturePath: media.codeSnippetImg,
        mediaType: "image",
        tags: ["doubt", "dsa", "dynamicprogramming", "leetcode", "algorithms"],
        likes: makeLikes(userDocs.sidharth, userDocs.sanjey, userDocs.priya),
        comments: [
          { user: userDocs.sidharth, text: "Yes Rahul! You only need two rows `prev` and `curr` instead of the full M x N matrix. That drops space complexity to O(min(m, n)). Let's discuss in the lab tomorrow." },
          { user: userDocs.sanjey, text: "Also check the rolling array optimization pattern in Striver's DP playlist!" },
        ],
      },
      {
        user: userDocs.ananya,
        postType: "general", // Thought
        description: "💡 Thoughts on modern engineering:\n\nWriting boilerplate code is becoming 10x faster with AI tooling, but knowing *what* to build, understanding distributed systems deeply, and debugging race conditions is more critical than ever. To all college juniors — focus on fundamentals, OS concurrency, database indices, and network protocols. Tools change, but fundamentals are timeless.",
        picturePath: "",
        mediaType: null,
        tags: ["thought", "careeradvice", "softwareengineering", "techtrends", "mindset"],
        likes: makeLikes(userDocs.sidharth, userDocs.rahul, userDocs.priya, userDocs.aarav, userDocs.sanjey),
        comments: [
          { user: userDocs.priya, text: "Couldn't agree more Ananya di! Fundamentals never get obsolete." },
          { user: userDocs.aarav, text: "Golden advice! Really puts things into perspective." },
          { user: userDocs.sidharth, text: "100%. Understanding how things work under the hood makes all the difference." },
        ],
      },
      {
        user: userDocs.priya,
        postType: "project",
        description: "🎥 Here is a quick video demo of our real-time collaborative canvas app!\n\nBuilt with React, Canvas API, and Node.js WebSockets for sub-20ms multi-cursor sync and audio rooms. What do you think of the whiteboard latency?",
        picturePath: media.projectVideo,
        mediaType: "video",
        tags: ["project", "video", "demo", "websockets", "react", "showcase"],
        likes: makeLikes(userDocs.sidharth, userDocs.rahul, userDocs.sanjey),
        comments: [
          { user: userDocs.sidharth, text: "The cursor synchronization looks buttery smooth! Are you using CRDTs or operational transforms?" },
          { user: userDocs.rahul, text: "Insane work Priya! Left a star on your repository ⭐" },
        ],
      },
      {
        user: userDocs.sanjey,
        postType: "project",
        description: "🏆 We took 2nd place at the HackCampus 2026 36-hour Hackathon!\n\nNon-stop coding, energy drinks, and deploying an AI disaster response coordination platform. Huge shoutout to my amazing teammates! Proud moment for our college.",
        picturePath: media.hackathonImg,
        mediaType: "image",
        tags: ["hackathon", "winners", "campuslife", "ai", "teamwork"],
        likes: makeLikes(userDocs.sidharth, userDocs.ananya, userDocs.rahul, userDocs.aarav),
        comments: [
          { user: userDocs.sidharth, text: "Huge congratulations team! Well deserved 👏" },
          { user: userDocs.ananya, text: "Brilliant achievement! Keep pushing boundaries." },
        ],
      },
      {
        user: userDocs.aarav,
        postType: "doubt",
        description: "⚠️ Anyone faced this Docker networking issue?\n\nMy frontend React container can't connect to `http://backend:5000` when running in Docker Compose with bridge network, throwing `ECONNREFUSED`. Ports 5000:5000 are mapped properly in the compose file. Any pointers?",
        picturePath: "",
        mediaType: null,
        tags: ["doubt", "docker", "devops", "containers", "networking"],
        likes: makeLikes(userDocs.sidharth, userDocs.sanjey),
        comments: [
          { user: userDocs.sidharth, text: "Check your client-side axios call! If it runs in the user's browser, it must point to `localhost:5000` rather than the Docker internal container name `backend` because the browser runs outside Docker." },
          { user: userDocs.aarav, text: "That was exactly it! Changed to localhost and it immediately worked. Thank you Sidharth!" },
        ],
      },
      {
        user: userDocs.sidharth,
        postType: "resource",
        description: "📚 Comprehensive MCA & B.Tech Semester Exam Preparation Drive:\n\nCurated previous year question papers (PYQs), DBMS notes, Computer Networks packet captures, and Operating System CPU scheduling algorithms summaries. Let's ace the finals together!",
        picturePath: media.studyNotesImg,
        mediaType: "image",
        tags: ["resource", "mca", "btech", "notes", "pyq", "semesterexams"],
        likes: makeLikes(userDocs.rahul, userDocs.priya, userDocs.aarav, userDocs.sanjey),
        comments: [
          { user: userDocs.rahul, text: "Saved my semester! Thanks a ton!" },
          { user: userDocs.sanjey, text: "Super helpful collection. Shared with our batch group." },
        ],
      },
      {
        user: userDocs.rahul,
        postType: "general", // Thought
        description: "🎬 The energy at the CampusConnect Tech Fest auditorium this evening was electric! Over 600 students attending the opening keynote and robotics exhibition. Here is a short highlight clip from the main stage.",
        picturePath: media.festVideo,
        mediaType: "video",
        tags: ["video", "techfest", "campuslife", "keynote", "robotics"],
        likes: makeLikes(userDocs.ananya, userDocs.priya, userDocs.sidharth),
        comments: [
          { user: userDocs.ananya, text: "Wish I was there on campus! Looks incredible." },
          { user: userDocs.priya, text: "The vibe was unmatched tonight!" },
        ],
      },
      {
        user: userDocs.priya,
        postType: "general", // Thought
        description: "🌱 Daily thought: Consistency beats intensity.\n\nSolving 1 LeetCode problem every single day for 6 months (180 problems) is infinitely better than grinding 15 problems a day for a week and burning out. Build sustainable habits early.",
        picturePath: "",
        mediaType: null,
        tags: ["thought", "productivity", "habits", "consistency", "collegelife"],
        likes: makeLikes(userDocs.sidharth, userDocs.rahul, userDocs.ananya),
        comments: [
          { user: userDocs.sidharth, text: "100%. Small steps compound massively." },
          { user: userDocs.rahul, text: "Starting my 1-problem-a-day streak today!" },
        ],
      },
      {
        user: userDocs.ananya,
        postType: "placement",
        description: "🎯 Amazon SDE-1 Placement Breakdown:\n\n1. Online Assessment: 2 LeetCode Mediums + Work Simulation\n2. Technical Round 1: Graphs (BFS/DFS) + Data structures optimization\n3. Technical Round 2: Object-Oriented Design (Parking Lot / Elevator system)\n4. Bar Raiser: Leadership Principles + Behavioral STAR format.\n\nFeel free to connect or drop a message if you need resume reviews or mock interviews!",
        picturePath: "",
        mediaType: null,
        tags: ["placement", "amazon", "sde", "interviewprep", "experience", "career"],
        likes: makeLikes(userDocs.sidharth, userDocs.rahul, userDocs.priya, userDocs.aarav, userDocs.sanjey),
        comments: [
          { user: userDocs.sidharth, text: "Extremely valuable breakdown Ananya! DMed you my resume for review." },
          { user: userDocs.aarav, text: "Thank you for giving back to the campus community!" },
        ],
      },
      {
        user: userDocs.sanjey,
        postType: "general", // Thought with image
        description: "🌅 Beautiful view of the campus library at sunset after a long day of lectures and coding labs. Make sure to step away from your screens and take a walk once in a while!",
        picturePath: media.campusViewImg,
        mediaType: "image",
        tags: ["campus", "library", "sunset", "collegelife", "wellness"],
        likes: makeLikes(userDocs.sidharth, userDocs.priya),
        comments: [
          { user: userDocs.priya, text: "Such a peaceful shot!" },
        ],
      },
    ];

    console.log("Creating new posts with comments and likes...");
    for (const p of postsToCreate) {
      const post = await Post.create({
        userId: p.user._id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        userPicturePath: p.user.picturePath || "",
        role: p.user.role,
        postType: p.postType,
        description: p.description,
        picturePath: p.picturePath,
        mediaType: p.mediaType,
        tags: p.tags,
        likes: p.likes,
      });

      const commentIds = [];
      for (const c of p.comments) {
        const comment = await Comment.create({
          postId: post._id,
          userId: c.user._id,
          text: c.text,
        });
        commentIds.push(comment._id);
      }

      post.comments = commentIds;
      await post.save();
    }

    console.log("Successfully seeded random data!");
    console.log(`Users count: ${await User.countDocuments()}`);
    console.log(`Posts count: ${await Post.countDocuments()}`);
    console.log(`Comments count: ${await Comment.countDocuments()}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
