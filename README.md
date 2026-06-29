# IdeaOne
I started Vantage & Co because I noticed that many great brands looked weak online. They had strong ideas, but their websites, content, and digital presence didn’t reflect their actual value. I wanted to build something that brought all of that together — strategy, design, content, and growth systems — into one premium service.

Vantage & Co was created to help ambitious businesses and creators show up online with clarity, confidence, and credibility. We don’t just make things look good — we help brands convert attention into real business growth.

## Vercel deployment
The contact form posts to /api/contact and is ready for Vercel serverless deployment.

### Required environment variables
Add these in your Vercel project settings:
- MONGODB_URI: your MongoDB Atlas connection string
- MONGODB_DB: optional database name, defaults to ideaone

### Deploy
1. Push these changes to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables above.
4. Redeploy.
