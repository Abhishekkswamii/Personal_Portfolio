import type { SiteContent } from "./types";

/**
 * The bundled seed.
 *
 * This is the site's content until Redis is configured, and the exact payload
 * the admin writes on first run ("Copy content into the database").
 * Everything here is transcribed from the résumé — no metric, client, outcome
 * or claim has been invented. Fields that were never supplied are `null`.
 */

const PORTRAIT = {
  url: "/images/profile-cutout.png",
  alt: "Portrait of Abhishek Swami",
  width: 1200,
  height: 1359,
};

export const seed: SiteContent = {
  live: false,

  profile: {
    name: "Abhishek Swami",
    firstName: "Abhishek",
    lastName: "Swami",
    title: "Software Engineer",
    secondary: "AI · Full-Stack · Systems",
    lede: "I build intelligent software across AI, backend systems and modern web applications.",
    bio: [
      "I work across software engineering and AI, with a focus on building systems that are useful, reliable and thoughtfully engineered.",
      "From backend APIs and databases to AI workflows and user-facing products, I enjoy moving between layers of the stack — and I care about the parts that are easy to skip: validation, failure paths, the behaviour of a system when the network is bad or the input is wrong.",
      "Most of my recent work sits where AI meets real constraints: retrieval that has to stay grounded, inference that has to run on-device, interfaces that have to work for someone on a feature phone.",
    ],
    availability: "Available for opportunities",
    availabilityOpen: true,
    email: "abhishekswami.dev@gmail.com",
    phone: "+91-9999789843",
    location: "India — Remote",
    image: PORTRAIT,
  },

  settings: {
    siteTitle: "Abhishek Swami",
    seoTitle: "Abhishek Swami — Software Engineer",
    seoDescription:
      "Abhishek Swami — software engineer working across AI workflows, backend systems and the modern web. Selected work, experience and contact.",
    // Set NEXT_PUBLIC_CONTACT_FORM_URL, or edit this in Admin → Site Settings.
    contactFormUrl: "",
    contactFormHeading: "Let’s talk",
    contactFormBlurb:
      "Have a project, a role, a collaboration or an idea? Tell me about it and I’ll get back to you.",
    contactHeadline: ["Let’s build", "something useful."],
    footerText: "Software Engineer · AI · Full-Stack",
    siteUrl: "https://abhishekswami.dev",
  },

  socials: [
    { id: "github", label: "GitHub", url: "https://github.com/Abhishekkswamii", handle: "Abhishekkswamii", sortOrder: 1, published: true },
    { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/abhishekswamii/", handle: "abhishekswamii", sortOrder: 2, published: true },
  ],

  projects: [
    {
      id: "sehatconnect",
      slug: "sehatconnect",
      number: "01",
      title: "SehatConnect",
      subtitle: "Privacy-Aware Rural Healthcare Access System",
      category: "AI / Healthcare",
      year: "2026",
      period: "March 2026",
      summary:
        "A low-bandwidth healthcare system reaching patients without smartphones — IVR, offline reminders and voice support alongside a full mobile client.",
      technologies: ["React Native", "Node.js", "MongoDB", "TensorFlow Lite", "WebRTC", "SQLite", "Twilio IVR"],
      highlights: [
        "Designed a low-bandwidth healthcare system with IVR, offline reminders, WebRTC, and Node.js/MongoDB.",
        "Built accessibility-first workflows for non-smartphone users through IVR and voice support.",
        "Integrated AI workflows for prescription verification, chatbot support, and hospital/pharmacy discovery.",
      ],
      problem:
        "Rural healthcare access is constrained long before software is: intermittent connectivity, feature phones, and patients who cannot rely on an app being reachable when they need it. A conventional mobile-only product excludes the people it is meant to serve.",
      approach: [
        "Treat the phone call as a first-class interface, not a fallback — IVR and voice workflows carry the full core journey.",
        "Keep state local first. Reminders and records work offline through SQLite and sync when a connection returns.",
        "Run inference on-device with TensorFlow Lite where the network cannot be trusted.",
        "Use WebRTC for consultations so sessions degrade gracefully rather than failing outright.",
      ],
      architecture: [
        { step: "Access", detail: "Twilio IVR + React Native client" },
        { step: "Local state", detail: "SQLite — offline reminders and records" },
        { step: "Consultation", detail: "WebRTC session layer" },
        { step: "Intelligence", detail: "TensorFlow Lite on-device inference" },
        { step: "Services", detail: "Node.js API, MongoDB persistence" },
      ],
      details: null,
      outcomes: null,
      images: {
        thumbnail: { url: "/images/sehatconnect/sehat1.png", alt: "SehatConnect Home", width: 893, height: 1761 },
        hero: { url: "/images/sehatconnect/sehat1.png", alt: "SehatConnect Home", width: 893, height: 1761 },
        architecture: null,
        gallery: [
          { url: "/images/sehatconnect/sehat1.png", alt: "Home Screen", width: 893, height: 1761 },
          { url: "/images/sehatconnect/sehat2.png", alt: "Consultation Details", width: 876, height: 1795 },
          { url: "/images/sehatconnect/sehat3.png", alt: "Doctor Selection", width: 888, height: 1771 },
          { url: "/images/sehatconnect/sehat4.png", alt: "Appointment Booking", width: 888, height: 1771 },
          { url: "/images/sehatconnect/sehat6.png", alt: "Prescription View", width: 888, height: 1771 },
        ],
      },
      links: { github: null, live: null },
      diagram: "sehat",
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      id: "vyapariq",
      slug: "vyapariq",
      number: "02",
      title: "VyaparIQ",
      subtitle: "AI-Powered Smart Shopping Assistant",
      category: "E-Commerce / AI",
      year: "2026",
      period: "Mar 2026",
      summary:
        "A full-stack AI-powered e-commerce platform featuring budget tracking, spending analytics, and a Gemini-powered multilingual chatbot.",
      technologies: ["React.js", "Node.js", "FastAPI", "PostgreSQL", "Redis", "Google Cloud Run", "Firebase"],
      highlights: [
        "Engineered a full-stack AI-powered e-commerce platform with React, Node.js, Express.js, FastAPI, PostgreSQL, and Redis.",
        "Implemented budget tracking, spending analytics, product catalog, personalized recommendations, and deal comparison.",
        "Integrated Gemini-powered chatbot, camera product scanning, Google OAuth, and English, Hindi, and Hinglish support.",
      ],
      problem:
        "Users struggle to track budgets and compare deals dynamically across multiple platforms while navigating language barriers in e-commerce.",
      approach: [
        "Developed a unified shopping platform where budget constraints drive personalized recommendations.",
        "Integrated a Gemini-powered chatbot that supports conversational commerce in English, Hindi, and Hinglish.",
        "Implemented product scanning via camera for quick discovery and comparisons.",
        "Architected a scalable backend using Express.js and FastAPI, with PostgreSQL for relational data and Redis for caching.",
      ],
      architecture: [
        { step: "Frontend", detail: "React.js + Google OAuth" },
        { step: "Core API", detail: "Node.js / Express.js for business logic" },
        { step: "AI Services", detail: "FastAPI + Gemini for chatbot & recommendations" },
        { step: "Persistence", detail: "PostgreSQL for products & users, Redis for caching" },
        { step: "Deployment", detail: "Docker + Google Cloud Run" },
      ],
      details: null,
      outcomes: null,
      images: {
        thumbnail: { url: "/images/vyapariq/vyapariq1.png", alt: "VyaparIQ Dashboard", width: 2936, height: 1442 },
        hero: { url: "/images/vyapariq/vyapariq1.png", alt: "VyaparIQ Dashboard", width: 2936, height: 1442 },
        architecture: null,
        gallery: [
          { url: "/images/vyapariq/vyapariq1.png", alt: "VyaparIQ Main Interface", width: 2936, height: 1442 },
          { url: "/images/vyapariq/vyapariq2.png", alt: "VyaparIQ Product Analysis", width: 2940, height: 1452 },
          { url: "/images/vyapariq/vyapariq3.png", alt: "VyaparIQ Chatbot", width: 2940, height: 1448 },
        ],
      },
      links: { github: "https://github.com/Abhishekkswamii", live: null },
      diagram: "vyapariq",
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      id: "file-intelligence",
      slug: "file-intelligence",
      number: "03",
      title: "File Intelligence",
      subtitle: "AI-Powered File Intelligence Infrastructure",
      category: "Developer Infrastructure",
      year: "2025",
      period: "December 2025",
      summary:
        "Local-first semantic search across your own files. Embeddings and vector search run on the machine, with cloud models as an option rather than a requirement.",
      technologies: ["React.js", "FastAPI", "Python", "ChromaDB", "Ollama", "TypeScript", "Zustand"],
      highlights: [
        "Developed a privacy-aware semantic search system using embeddings and ChromaDB for local-first organization.",
        "Designed a modular FastAPI backend supporting offline/local and cloud-based LLM workflows.",
        "Built a React/TypeScript interface for file exploration, semantic search, and AI-assisted understanding.",
      ],
      problem:
        "Understanding your own files usually means uploading them somewhere. That is an unacceptable trade for anything sensitive, and an unnecessary one when the hardware to run the model is already on the desk.",
      approach: [
        "Make local the default path: Ollama for inference, ChromaDB for vectors, nothing leaves the machine unless asked.",
        "Keep the backend provider-agnostic so local and cloud LLM workflows are swappable behind one FastAPI interface.",
        "Index by meaning rather than filename — embeddings drive exploration and search.",
        "Build the client in React and TypeScript with Zustand holding search and exploration state.",
      ],
      architecture: [
        { step: "Ingest", detail: "File traversal and chunking" },
        { step: "Embed", detail: "Local embedding model" },
        { step: "Store", detail: "ChromaDB vector index" },
        { step: "Serve", detail: "Modular FastAPI — local or cloud provider" },
        { step: "Explore", detail: "React + TypeScript + Zustand client" },
      ],
      details: null,
      outcomes: null,
      images: {
        thumbnail: { url: "/images/fileint/fileint1.png", alt: "File Intelligence Dashboard", width: 2792, height: 1670 },
        hero: { url: "/images/fileint/fileint1.png", alt: "File Intelligence Dashboard", width: 2792, height: 1670 },
        architecture: null,
        gallery: [
          { url: "/images/fileint/fileint1.png", alt: "File Intelligence View 1", width: 2792, height: 1670 },
          { url: "/images/fileint/fileint2.png", alt: "File Intelligence View 2", width: 2794, height: 1674 },
          { url: "/images/fileint/fileint3.png", alt: "File Intelligence View 3", width: 2788, height: 1688 },
          { url: "/images/fileint/fileint4.png", alt: "File Intelligence View 4", width: 2790, height: 1676 },
        ],
      },
      links: { github: null, live: null },
      diagram: "fileint",
      featured: true,
      published: true,
      sortOrder: 3,
    },
  ],

  experiences: [
    {
      id: "webeeld",
      company: "WEBeeld",
      role: "Software Engineer",
      location: "Remote",
      period: "Jul 2026 — Present",
      current: true,
      points: [
        "Build custom websites and software solutions for small businesses.",
        "Develop full-stack features across frontend, backend, databases, and deployment.",
        "Design, test, and deploy reliable software solutions for client requirements.",
      ],
      sortOrder: 1,
      published: true,
    },
    {
      id: "iit-jodhpur",
      company: "IIT Jodhpur",
      role: "Research Intern",
      location: "Jodhpur, Rajasthan",
      period: "Jun 2026 — Jul 2026",
      current: false,
      points: [
        "Worked on generative AI for earthquake and landslide classification from tabular datasets.",
        "Synthesized tabular datasets to support model training and classification experiments.",
        "Built and evaluated models under real research constraints and experimental requirements.",
      ],
      sortOrder: 2,
      published: true,
    },
    {
      id: "pearlthoughts",
      company: "PearlThoughts",
      role: "Software Engineering Intern",
      location: "Thoothukudi, India",
      period: "Jul 2025 — Aug 2025",
      current: false,
      points: [
        "Developed 5 AI-integrated web applications using Python backends, REST APIs, and LLM workflows.",
        "Built backend services in Agile sprints with a 10-member engineering team.",
        "Applied secure coding and data validation across 15+ workflows for healthcare initiatives.",
      ],
      sortOrder: 3,
      published: true,
    },
  ],

  services: [
    {
      id: "ai-engineering",
      number: "01",
      title: "AI Engineering",
      description: "LLM workflows, RAG systems, semantic search and AI-assisted applications.",
      detail:
        "Retrieval pipelines that stay grounded, embedding stores, intent and risk gating, and the schema work that keeps model output usable downstream.",
      capabilities: ["RAG pipelines", "Semantic search", "LLM workflows", "Embeddings"],
      sortOrder: 1,
      published: true,
    },
    {
      id: "full-stack",
      number: "02",
      title: "Full-Stack Development",
      description: "Production-ready frontend, backend, APIs, databases and deployment.",
      detail:
        "End-to-end feature work — interface through to persistence and the deploy that puts it in front of people.",
      capabilities: ["React / Next.js", "TypeScript", "Databases", "Deployment"],
      sortOrder: 2,
      published: true,
    },
    {
      id: "backend-api",
      number: "03",
      title: "Backend & API Systems",
      description: "FastAPI, Node.js, REST APIs, validation, architecture and integrations.",
      detail:
        "Services designed around clear contracts — typed boundaries, validated input, and integrations that fail loudly rather than quietly.",
      capabilities: ["FastAPI", "Node.js / Express", "REST", "Pydantic"],
      sortOrder: 3,
      published: true,
    },
    {
      id: "product-systems",
      number: "04",
      title: "Intelligent Product Systems",
      description: "Applications combining software engineering, AI and real-world workflows.",
      detail:
        "Products where the intelligence has to survive contact with reality — low bandwidth, offline states, and users who are not using the happy path.",
      capabilities: ["Offline-first", "Accessibility", "Workflow design", "On-device ML"],
      sortOrder: 4,
      published: true,
    },
  ],

  skillCategories: [
    { id: "languages", title: "Languages", skills: ["Python", "TypeScript", "JavaScript", "C/C++", "SQL", "Java"], sortOrder: 1, published: true },
    { id: "backend", title: "Backend", skills: ["FastAPI", "Node.js", "Express.js", "REST APIs", "Pydantic"], sortOrder: 2, published: true },
    { id: "ai-ml", title: "AI / ML", skills: ["TensorFlow", "Scikit-learn", "Sentence Transformers", "LangGraph", "RAG"], sortOrder: 3, published: true },
    { id: "data", title: "Data", skills: ["MongoDB", "SQLite", "ChromaDB"], sortOrder: 4, published: true },
    { id: "infrastructure", title: "Infrastructure", skills: ["Docker", "Google Cloud Platform", "AWS", "Git"], sortOrder: 5, published: true },
    { id: "frontend", title: "Frontend", skills: ["React", "React Native", "TypeScript", "HTML5", "CSS3"], sortOrder: 6, published: true },
  ],

  education: [
    {
      id: "lpu",
      institution: "Lovely Professional University",
      degree: "B.Tech",
      field: "Computer Science and Engineering",
      grade: "CGPA 7.01",
      period: "Since Aug 2024",
      description: null,
      sortOrder: 1,
      published: true,
    },
    {
      id: "khms-12",
      institution: "Kulachi Hansraj Model School",
      degree: "Intermediate",
      field: null,
      grade: "69%",
      period: "Apr 2022 — Mar 2023",
      description: null,
      sortOrder: 2,
      published: true,
    },
    {
      id: "khms-10",
      institution: "Kulachi Hansraj Model School",
      degree: "Matriculation",
      field: null,
      grade: "91%",
      period: "Apr 2020 — Mar 2021",
      description: null,
      sortOrder: 3,
      published: true,
    },
  ],

  patent: {
    id: "ecospark-ev",
    title: "EcoSpark EV",
    type: "Design Patent",
    description:
      "Smart dual-axis solar tracking system with automated self-cleaning and integrated EV charging.",
    applicationNumber: "202511095417",
    status: "Published",
    year: null,
    published: true,
  },
};
