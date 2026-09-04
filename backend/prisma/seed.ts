import { PrismaClient, Role, VerificationStatus, Category, BudgetBand, KycDocumentType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding curated experiences across Ahmedabad, Mumbai, and Jaipur...');

  // 1. Create Admin User
  const adminPassword = await argon2.hash('AdminSecurePass123!');
  await prisma.user.upsert({
    where: { email: 'admin@experienceplatform.in' },
    update: {},
    create: {
      email: 'admin@experienceplatform.in',
      passwordHash: adminPassword,
      name: 'Platform Compliance Officer',
      role: Role.ADMIN,
    },
  });

  // 2. Create Verified Sample Providers
  const providerPassword = await argon2.hash('ProviderSecurePass123!');
  
  const providerAhmedabadUser = await prisma.user.upsert({
    where: { email: 'ahmedabad.heritage@experienceplatform.in' },
    update: {},
    create: {
      email: 'ahmedabad.heritage@experienceplatform.in',
      passwordHash: providerPassword,
      name: 'Hitesh Patel',
      role: Role.PROVIDER,
      mfaEnabled: true,
      providerProfile: {
        create: {
          businessName: 'Amdavad Heritage Walkers Guild',
          businessType: 'Cultural Guided Tours',
          phone: '+919876543210',
          city: 'Ahmedabad',
          verificationStatus: VerificationStatus.VERIFIED,
          kycDocumentRef: 'kyc/verified/ahmedabad_guild_gst.pdf',
          kycDocumentType: KycDocumentType.GST_CERTIFICATE,
          kycVerifiedAt: new Date(),
        },
      },
    },
    include: { providerProfile: true },
  });

  const providerMumbaiUser = await prisma.user.upsert({
    where: { email: 'mumbai.foodies@experienceplatform.in' },
    update: {},
    create: {
      email: 'mumbai.foodies@experienceplatform.in',
      passwordHash: providerPassword,
      name: 'Rohan Deshmukh',
      role: Role.PROVIDER,
      mfaEnabled: true,
      providerProfile: {
        create: {
          businessName: 'Bombay Coastal Bites & Walks',
          businessType: 'Culinary Experiences',
          phone: '+919820123456',
          city: 'Mumbai',
          verificationStatus: VerificationStatus.VERIFIED,
          kycDocumentRef: 'kyc/verified/mumbai_food_reg.pdf',
          kycDocumentType: KycDocumentType.BUSINESS_REGISTRATION,
          kycVerifiedAt: new Date(),
        },
      },
    },
    include: { providerProfile: true },
  });

  const providerJaipurUser = await prisma.user.upsert({
    where: { email: 'jaipur.artisan@experienceplatform.in' },
    update: {},
    create: {
      email: 'jaipur.artisan@experienceplatform.in',
      passwordHash: providerPassword,
      name: 'Gayatri Shekhawat',
      role: Role.PROVIDER,
      mfaEnabled: true,
      providerProfile: {
        create: {
          businessName: 'Pink City Royal Guild Crafts',
          businessType: 'Artisan Workshops & Heritage',
          phone: '+919414012345',
          city: 'Jaipur',
          verificationStatus: VerificationStatus.VERIFIED,
          kycDocumentRef: 'kyc/verified/jaipur_craft_fssai.pdf',
          kycDocumentType: KycDocumentType.GOVERNMENT_ID,
          kycVerifiedAt: new Date(),
        },
      },
    },
    include: { providerProfile: true },
  });

  // 3. Seed Curated Experiences with PostGIS Points
  const experiences = [
    // --- AHMEDABAD ---
    {
      providerId: providerAhmedabadUser.providerProfile!.id,
      title: 'Old Ahmedabad Heritage & Pol Food Trail',
      description: 'Discover the UNESCO World Heritage City pols, tasting 100-year-old traditional delicacies like fafda-jalebi, hand-churned kulfi, and maska bun while exploring hidden wooden havelis.',
      category: 'FOOD' as Category,
      lat: 23.0225,
      lng: 72.5714,
      address: 'Bhadra Fort Gates, Old City',
      city: 'Ahmedabad',
      state: 'Gujarat',
      priceMin: 450,
      priceMax: 750,
      budgetBand: 'MODERATE' as BudgetBand,
      ratingAverage: 4.85,
      reviewCount: 124,
      authenticityRating: 0.98,
      accessibilityTags: ['GUIDED_AUDIO', 'WALKING_FRIENDLY'],
      mediaUrls: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b'],
      availabilityRules: [{ daysOfWeek: [0, 1, 2, 3, 4, 5, 6], openTime: '07:30', closeTime: '12:00' }],
    },
    {
      providerId: providerAhmedabadUser.providerProfile!.id,
      title: 'Traditional Mata ni Pachedi Textile Masterclass',
      description: 'Hands-on ritual sacred textile painting workshop guided by 7th generation master artisans preserving GI-tagged craft.',
      category: 'WORKSHOPS' as Category,
      lat: 23.0300,
      lng: 72.5800,
      address: 'Usmanpura Art Studio',
      city: 'Ahmedabad',
      state: 'Gujarat',
      priceMin: 1200,
      priceMax: 1800,
      budgetBand: 'PREMIUM' as BudgetBand,
      ratingAverage: 4.92,
      reviewCount: 56,
      authenticityRating: 0.99,
      accessibilityTags: ['WHEELCHAIR_ACCESSIBLE', 'INDOOR'],
      mediaUrls: ['https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb'],
      availabilityRules: [{ daysOfWeek: [2, 3, 4, 5, 6], openTime: '10:00', closeTime: '16:00' }],
    },
    {
      providerId: providerAhmedabadUser.providerProfile!.id,
      title: 'Sabarmati Dusk Kayaking & Skyline Drift',
      description: 'Paddle along the Sabarmati Riverfront during the golden hour sunset with safety equipment and professional river guides.',
      category: 'ADVENTURE' as Category,
      lat: 23.0384,
      lng: 72.5698,
      address: 'Sabarmati Riverfront Boating Station',
      city: 'Ahmedabad',
      state: 'Gujarat',
      priceMin: 600,
      priceMax: 900,
      budgetBand: 'MODERATE' as BudgetBand,
      ratingAverage: 4.70,
      reviewCount: 88,
      authenticityRating: 0.90,
      accessibilityTags: ['LIFE_JACKETS_PROVIDED'],
      mediaUrls: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5'],
      availabilityRules: [{ daysOfWeek: [0, 5, 6], openTime: '16:30', closeTime: '19:30' }],
    },

    // --- MUMBAI ---
    {
      providerId: providerMumbaiUser.providerProfile!.id,
      title: 'Dawn at Sassoon Docks: Fisherfolk Culture & Fresh Catch',
      description: 'Witness the bustling vibrant dawn auction of Koli fisherfolk, 140-year-old clock tower history, and authentic seafood breakfast.',
      category: 'CULTURE' as Category,
      lat: 18.9137,
      lng: 72.8258,
      address: 'Sassoon Dock Entrance, Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      priceMin: 800,
      priceMax: 1200,
      budgetBand: 'MODERATE' as BudgetBand,
      ratingAverage: 4.88,
      reviewCount: 94,
      authenticityRating: 0.97,
      accessibilityTags: ['EARLY_MORNING'],
      mediaUrls: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f'],
      availabilityRules: [{ daysOfWeek: [1, 2, 3, 4, 5, 6], openTime: '05:30', closeTime: '08:30' }],
    },
    {
      providerId: providerMumbaiUser.providerProfile!.id,
      title: 'Secret Irani Cafes & Art Deco Architecture Walk',
      description: 'Stroll through Oval Maidan UNESCO Art Deco ensemble, ending with bun maska, mawa cake, and chai in 90-year-old legendary cafes.',
      category: 'FOOD' as Category,
      lat: 18.9322,
      lng: 72.8264,
      address: 'Churchgate Railway Station Heritage Concourse',
      city: 'Mumbai',
      state: 'Maharashtra',
      priceMin: 500,
      priceMax: 850,
      budgetBand: 'MODERATE' as BudgetBand,
      ratingAverage: 4.90,
      reviewCount: 160,
      authenticityRating: 0.96,
      accessibilityTags: ['WHEELCHAIR_ACCESSIBLE', 'PET_FRIENDLY'],
      mediaUrls: ['https://images.unsplash.com/photo-1567157577867-05ccb1388e66'],
      availabilityRules: [{ daysOfWeek: [0, 2, 4, 6], openTime: '09:00', closeTime: '13:00' }],
    },

    // --- JAIPUR ---
    {
      providerId: providerJaipurUser.providerProfile!.id,
      title: 'Bagru Natural Indigo Hand-Block Printing Workshop',
      description: 'Immerse in a 350-year-old craft village, carving wooden blocks, mixing natural plant dyes, and printing your own handcrafted scarf.',
      category: 'WORKSHOPS' as Category,
      lat: 26.8122,
      lng: 75.5458,
      address: 'Chhipa Mohalla, Bagru Village',
      city: 'Jaipur',
      state: 'Rajasthan',
      priceMin: 1500,
      priceMax: 2200,
      budgetBand: 'PREMIUM' as BudgetBand,
      ratingAverage: 4.95,
      reviewCount: 78,
      authenticityRating: 0.99,
      accessibilityTags: ['INDOOR', 'MATERIALS_INCLUDED'],
      mediaUrls: ['https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5'],
      availabilityRules: [{ daysOfWeek: [1, 2, 3, 4, 5, 6], openTime: '10:00', closeTime: '17:00' }],
    },
    {
      providerId: providerJaipurUser.providerProfile!.id,
      title: 'Sunset Rooftop Astronomy & Rajput Lore at Nahargarh',
      description: 'Telescopic stargazing session combined with ancient Rajput astronomy storytelling perched high above the illuminated Pink City.',
      category: 'NIGHTLIFE' as Category,
      lat: 26.9372,
      lng: 75.8155,
      address: 'Nahargarh Fort Ridge Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      priceMin: 950,
      priceMax: 1600,
      budgetBand: 'PREMIUM' as BudgetBand,
      ratingAverage: 4.82,
      reviewCount: 110,
      authenticityRating: 0.94,
      accessibilityTags: ['PARKING_AVAILABLE'],
      mediaUrls: ['https://images.unsplash.com/photo-1475274047050-1d0c0975c63e'],
      availabilityRules: [{ daysOfWeek: [4, 5, 6, 0], openTime: '18:00', closeTime: '22:30' }],
    },
  ];

  for (const exp of experiences) {
    await prisma.$queryRawUnsafe(
      `
      INSERT INTO "experiences" (
        "id", "provider_id", "title", "description", "category",
        "location", "latitude", "longitude", "address", "city", "state", "country",
        "price_min", "price_max", "currency", "budget_band", "accessibility_tags",
        "media_urls", "availability_rules", "rating_average", "review_count", "authenticity_rating", "updated_at"
      ) VALUES (
        gen_random_uuid(), $1::uuid, $2, $3, $4::"Category",
        ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $6, $5, $7, $8, $9, 'India',
        $10, $11, 'INR', $12::"BudgetBand", $13::text[],
        $14::text[], $15::jsonb, $16, $17, $18, NOW()
      )
      ON CONFLICT DO NOTHING;
      `,
      exp.providerId,
      exp.title,
      exp.description,
      exp.category,
      exp.lng,
      exp.lat,
      exp.address,
      exp.city,
      exp.state,
      exp.priceMin,
      exp.priceMax,
      exp.budgetBand,
      exp.accessibilityTags,
      exp.mediaUrls,
      JSON.stringify(exp.availabilityRules),
      exp.ratingAverage,
      exp.reviewCount,
      exp.authenticityRating,
    );
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
