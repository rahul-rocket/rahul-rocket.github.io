// Project data with detailed information for dynamic pages

import type { Project, ProjectsData } from "./types"

export const projectsData: ProjectsData = {
  "ecommerce-platform": {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    subtitle: "A full-featured online shopping experience",
    category: "Full Stack",
    status: "Live",
    duration: "4 months",
    role: "Lead Developer",
    client: "RetailTech Inc.",
    year: "2024",
    
    // Links
    github: "https://github.com",
    demo: "https://demo.example.com",
    
    // Images
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop",
        caption: "Homepage with featured products and categories"
      },
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
        caption: "Admin dashboard with analytics and inventory management"
      },
      {
        url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=800&fit=crop",
        caption: "Shopping cart and checkout flow"
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
        caption: "Order tracking and customer dashboard"
      }
    ],
    
    // Overview
    overview: "A comprehensive e-commerce platform built from the ground up to handle high-traffic retail operations. The platform features real-time inventory management, secure payment processing, and an intuitive admin dashboard for store management.",
    
    // Problem Statement
    problemStatement: "The client needed a modern, scalable e-commerce solution to replace their outdated system. The existing platform suffered from slow load times, poor mobile experience, limited payment options, and couldn't handle traffic spikes during sales events. They were losing an estimated 30% of potential customers due to cart abandonment caused by technical issues.",
    
    // Solution Approach
    solutionApproach: [
      "Implemented a headless architecture using Next.js for the frontend, enabling blazing-fast page loads with server-side rendering and static generation for product pages.",
      "Built a robust Node.js backend with NestJS framework, implementing clean architecture principles for maintainability and scalability.",
      "Integrated Stripe for secure payment processing with support for multiple payment methods including cards, wallets, and buy-now-pay-later options.",
      "Designed a real-time inventory system using PostgreSQL with Redis caching to handle concurrent orders without overselling.",
      "Created a comprehensive admin dashboard with analytics, order management, and inventory controls."
    ],
    
    // Tech Stack with categories
    techStack: {
      frontend: ["Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "React Query"],
      backend: ["Node.js", "NestJS", "PostgreSQL", "Redis", "Prisma ORM"],
      services: ["Stripe", "AWS S3", "SendGrid", "Cloudinary"],
      devops: ["Docker", "GitHub Actions", "Vercel", "AWS"]
    },
    
    // Features
    features: [
      "Real-time inventory tracking and management",
      "Secure checkout with multiple payment options",
      "Advanced product search with filters and sorting",
      "Customer accounts with order history and wishlist",
      "Admin dashboard with sales analytics",
      "Automated email notifications for orders",
      "Mobile-responsive design",
      "SEO optimized product pages"
    ],
    
    // Challenges & Solutions
    challenges: [
      {
        challenge: "Handling high traffic during flash sales",
        solution: "Implemented Redis caching, database query optimization, and CDN for static assets. Added queue-based order processing to handle traffic spikes gracefully."
      },
      {
        challenge: "Preventing inventory overselling",
        solution: "Built a reservation system with database-level locking and real-time inventory sync across all channels using WebSockets."
      },
      {
        challenge: "Complex product variants and pricing",
        solution: "Designed a flexible schema supporting unlimited product variants with individual pricing, inventory, and images."
      }
    ],
    
    // Key Learnings
    learnings: [
      "The importance of database indexing for e-commerce queries - reduced average query time by 80%",
      "Caching strategies are crucial for scalability - implemented multi-layer caching with Redis",
      "Payment integration requires careful error handling and idempotency for reliability",
      "Real-time features significantly improve user experience in e-commerce applications"
    ],
    
    // Results/Impact
    results: [
      { metric: "Page Load Time", value: "< 1s", improvement: "70% faster" },
      { metric: "Cart Abandonment", value: "18%", improvement: "40% reduction" },
      { metric: "Mobile Conversions", value: "+45%", improvement: "vs. old site" },
      { metric: "Monthly Active Users", value: "50K+", improvement: "Served reliably" }
    ],
    
    // Related projects
    relatedProjects: ["task-management-app", "real-estate-portal"]
  },
  
  "task-management-app": {
    id: "task-management-app",
    title: "TaskFlow - Project Management",
    subtitle: "Collaborative project management for modern teams",
    category: "Full Stack",
    status: "Live",
    duration: "3 months",
    role: "Full Stack Developer",
    client: "Internal Project",
    year: "2023",
    
    github: "https://github.com",
    demo: "https://demo.example.com",
    
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=500&fit=crop",
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=800&fit=crop",
        caption: "Kanban board with drag-and-drop functionality"
      },
      {
        url: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&h=800&fit=crop",
        caption: "Task detail view with comments and attachments"
      },
      {
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop",
        caption: "Team dashboard and project overview"
      }
    ],
    
    overview: "A modern project management application inspired by tools like Trello and Asana. Features real-time collaboration, customizable workflows, and integrations with popular development tools.",
    
    problemStatement: "Remote teams struggle with project visibility and coordination. Existing tools were either too complex or lacked real-time collaboration features. The team needed a lightweight, intuitive solution that could integrate with their existing GitHub workflow.",
    
    solutionApproach: [
      "Built a real-time collaborative platform using React and Socket.io for instant updates across all connected clients.",
      "Implemented drag-and-drop kanban boards with optimistic UI updates for a smooth user experience.",
      "Created a flexible permission system allowing teams to customize access levels and workflows.",
      "Integrated with GitHub for automatic issue syncing and commit tracking."
    ],
    
    techStack: {
      frontend: ["React", "TypeScript", "Material-UI", "Redux", "React DnD"],
      backend: ["Node.js", "Express", "MongoDB", "Socket.io"],
      services: ["GitHub API", "Slack API", "AWS S3"],
      devops: ["Docker", "Nginx", "DigitalOcean"]
    },
    
    features: [
      "Real-time kanban boards with drag-and-drop",
      "Team collaboration with @mentions and comments",
      "Custom workflows and task statuses",
      "Time tracking and reporting",
      "GitHub and Slack integrations",
      "File attachments and sharing",
      "Activity timeline and notifications"
    ],
    
    challenges: [
      {
        challenge: "Real-time sync across multiple users",
        solution: "Implemented operational transformation for conflict resolution and used Socket.io rooms for efficient broadcasting."
      },
      {
        challenge: "Smooth drag-and-drop with many items",
        solution: "Used virtualization for large lists and optimistic updates with rollback on failure."
      }
    ],
    
    learnings: [
      "Real-time applications require careful consideration of conflict resolution",
      "Optimistic UI updates significantly improve perceived performance",
      "WebSocket connection management is crucial for reliability"
    ],
    
    results: [
      { metric: "Active Teams", value: "200+", improvement: "Using daily" },
      { metric: "Tasks Managed", value: "50K+", improvement: "Per month" },
      { metric: "User Satisfaction", value: "4.8/5", improvement: "Rating" }
    ],
    
    relatedProjects: ["ecommerce-platform", "ai-content-generator"]
  },
  
  "ai-content-generator": {
    id: "ai-content-generator",
    title: "AI Content Studio",
    subtitle: "AI-powered content generation platform",
    category: "AI/ML",
    status: "Live",
    duration: "2 months",
    role: "Lead Developer",
    client: "ContentAI Labs",
    year: "2024",
    
    github: "https://github.com",
    demo: "https://demo.example.com",
    
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
        caption: "AI content generation interface"
      },
      {
        url: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&h=800&fit=crop",
        caption: "Template selection and customization"
      },
      {
        url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=800&fit=crop",
        caption: "Content history and analytics"
      }
    ],
    
    overview: "An AI-powered content generation platform that helps marketers and content creators produce high-quality blog posts, social media content, and marketing copy in minutes instead of hours.",
    
    problemStatement: "Content creators spend hours writing and editing content. Marketing teams struggle to maintain consistent brand voice across multiple channels. There was a need for an AI tool that could generate quality content while maintaining brand guidelines.",
    
    solutionApproach: [
      "Integrated OpenAI's GPT-4 API with custom prompting strategies for different content types.",
      "Built a brand voice configuration system that learns from existing content.",
      "Implemented a template system for common content formats with customizable parameters.",
      "Created a collaborative editing interface with AI-assisted suggestions."
    ],
    
    techStack: {
      frontend: ["Next.js", "TypeScript", "Tailwind CSS", "TipTap Editor"],
      backend: ["Next.js API Routes", "Supabase", "PostgreSQL"],
      services: ["OpenAI API", "Vercel AI SDK", "Stripe"],
      devops: ["Vercel", "Supabase", "GitHub Actions"]
    },
    
    features: [
      "Multiple content types (blogs, social, ads, emails)",
      "Brand voice customization",
      "Template library with customization",
      "Collaborative editing",
      "Content history and versioning",
      "Export to multiple formats",
      "Usage analytics and insights"
    ],
    
    challenges: [
      {
        challenge: "Ensuring consistent output quality",
        solution: "Developed sophisticated prompt engineering techniques and implemented output validation with fallback regeneration."
      },
      {
        challenge: "Managing API costs at scale",
        solution: "Implemented token usage optimization, caching for similar requests, and tiered pricing based on usage."
      }
    ],
    
    learnings: [
      "Prompt engineering is crucial for consistent AI outputs",
      "Users prefer guided experiences over blank canvas approaches",
      "Streaming responses significantly improve perceived performance for AI applications"
    ],
    
    results: [
      { metric: "Content Generated", value: "100K+", improvement: "Pieces/month" },
      { metric: "Time Saved", value: "75%", improvement: "Per piece" },
      { metric: "User Retention", value: "85%", improvement: "Monthly" }
    ],
    
    relatedProjects: ["task-management-app", "real-estate-portal"]
  },
  
  "real-estate-portal": {
    id: "real-estate-portal",
    title: "PropertyHub - Real Estate Platform",
    subtitle: "Modern property listing and search platform",
    category: "Full Stack",
    status: "Live",
    duration: "5 months",
    role: "Full Stack Developer",
    client: "PropertyHub Realty",
    year: "2023",
    
    github: "https://github.com",
    demo: "https://demo.example.com",
    
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
    screenshots: [
      {
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop",
        caption: "Property search with map integration"
      },
      {
        url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=800&fit=crop",
        caption: "Property detail page with virtual tour"
      },
      {
        url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&h=800&fit=crop",
        caption: "Agent dashboard and lead management"
      }
    ],
    
    overview: "A comprehensive real estate platform connecting buyers, sellers, and agents. Features advanced property search, virtual tours, mortgage calculators, and agent management tools.",
    
    problemStatement: "The real estate industry needed a modern platform that could handle complex property searches, provide immersive property viewing experiences, and streamline the connection between agents and potential buyers.",
    
    solutionApproach: [
      "Built a powerful search engine with geographic filtering using PostGIS and Elasticsearch.",
      "Integrated Google Maps API for interactive property exploration.",
      "Implemented 3D virtual tours using Matterport integration.",
      "Created agent dashboards with lead scoring and CRM features."
    ],
    
    techStack: {
      frontend: ["React", "Next.js", "TypeScript", "Mapbox GL"],
      backend: ["Node.js", "NestJS", "PostgreSQL", "PostGIS", "Elasticsearch"],
      services: ["Google Maps API", "Matterport", "AWS", "Twilio"],
      devops: ["Docker", "Kubernetes", "AWS EKS"]
    },
    
    features: [
      "Advanced property search with map",
      "Virtual property tours",
      "Mortgage calculator",
      "Save searches and favorites",
      "Agent profiles and reviews",
      "Lead management for agents",
      "Property comparison tools"
    ],
    
    challenges: [
      {
        challenge: "Fast geographic search with many properties",
        solution: "Used PostGIS with spatial indexing and Elasticsearch for full-text search, reducing search time from seconds to milliseconds."
      },
      {
        challenge: "Smooth map experience with many markers",
        solution: "Implemented marker clustering and viewport-based loading to handle thousands of properties."
      }
    ],
    
    learnings: [
      "Spatial databases are essential for location-based applications",
      "Map performance requires careful optimization and clustering strategies",
      "Real estate users expect rich media experiences"
    ],
    
    results: [
      { metric: "Properties Listed", value: "10K+", improvement: "Active listings" },
      { metric: "Monthly Searches", value: "500K+", improvement: "Queries" },
      { metric: "Agent Leads", value: "+60%", improvement: "Conversion rate" }
    ],
    
    relatedProjects: ["ecommerce-platform", "ai-content-generator"]
  }
}

// Get all project slugs for static generation
export function getAllProjectSlugs(): string[] {
  return Object.keys(projectsData)
}

// Get project by slug
export function getProjectBySlug(slug: string): Project | null {
  return projectsData[slug] ?? null
}

// Get related projects
export function getRelatedProjects(slugs: string[]): Project[] {
  return slugs
    .map((slug) => projectsData[slug])
    .filter((project): project is Project => Boolean(project))
}
