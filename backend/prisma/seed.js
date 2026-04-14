const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ReWear database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@rewear.com" },
    update: {},
    create: {
      email: "admin@rewear.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "ReWear",
      role: "ADMIN",
      points: 9999,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create sample users
  const userPassword = await bcrypt.hash("password123", 12);
  const user1 = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      email: "sarah@example.com",
      password: userPassword,
      firstName: "Sarah",
      lastName: "Martinez",
      bio: "Fashion enthusiast and sustainability advocate!",
      location: "Delhi, India",
      points: 245,
      rating: 4.9,
      reviewCount: 15,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      email: "priya@example.com",
      password: userPassword,
      firstName: "Priya",
      lastName: "Sharma",
      bio: "Slow fashion lover from Mumbai.",
      location: "Mumbai, India",
      points: 180,
    },
  });

  console.log("✅ Sample users created");

  // Create sample items
  const items = [
    {
      title: "Floral Maxi Dress",
      description: "Beautiful floral maxi dress in excellent condition. Worn only twice.",
      brand: "Zara",
      category: "DRESSES",
      size: "M",
      condition: "EXCELLENT",
      points: 800,
      images: ["https://ritikamittal-19.github.io/Re-Wear-website/images/item1.jpg"],
      tags: ["floral", "summer", "dress"],
      sellerId: user1.id,
    },
    {
      title: "Striped Cotton Shirt",
      description: "Classic striped shirt. Great for casual and smart casual looks.",
      brand: "H&M",
      category: "TOPS",
      size: "L",
      condition: "GOOD",
      points: 500,
      images: ["https://ritikamittal-19.github.io/Re-Wear-website/images/item3.jpg"],
      tags: ["stripes", "casual", "shirt"],
      sellerId: user2.id,
    },
    {
      title: "Boho Skirt",
      description: "Flowy boho skirt, perfect for festivals and summer outings.",
      brand: "FabIndia",
      category: "BOTTOMS",
      size: "S",
      condition: "LIKE_NEW",
      points: 700,
      images: ["https://ritikamittal-19.github.io/Re-Wear-website/images/item4.jpg"],
      tags: ["boho", "skirt", "ethnic"],
      sellerId: user1.id,
    },
    {
      title: "Denim Jacket",
      description: "Classic blue denim jacket. Timeless and versatile.",
      brand: "Levi's",
      category: "OUTERWEAR",
      size: "M",
      condition: "GOOD",
      points: 600,
      images: ["https://ritikamittal-19.github.io/Re-Wear-website/images/item2.jpg"],
      tags: ["denim", "jacket", "casual"],
      sellerId: user2.id,
    },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  console.log("✅ Sample items created");
  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Admin login: admin@rewear.com / admin123");
  console.log("User login:  sarah@example.com / password123");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
