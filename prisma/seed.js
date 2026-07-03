import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from '@prisma/client'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'drjrvrdnw'
const getImageUrl = (publicId) => {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_800/${publicId}`
}

const toMoney = (value) => Number.parseFloat(Number(value).toFixed(2))
const toRating = (value) => Number.parseFloat(Math.max(0, Math.min(5, Number(value))).toFixed(2))

const categories = [
    {
        slug: 'living-room',
        label: 'Living Room',
        headline: 'Living Room Furniture',
        description:
            'Create a space that invites you to slow down. Sofas, armchairs, coffee tables, and shelving designed to live well every day.',
        seoDescription:
            'Shop minimalist living room furniture — sofas, armchairs, coffee tables, shelving, and decor crafted for calm, modern interiors.',
        heroImage:
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85&fit=crop',
        heroAlt:
            'Bright Scandinavian living room with grey modular sofa, oak coffee table, and large windows',
        ogImage:
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&fit=crop'
    },
    {
        slug: 'bedroom',
        label: 'Bedroom',
        headline: 'Bedroom Furniture',
        description:
            'Low-profile beds, minimal wardrobes, and bedside tables designed to calm, not clutter.',
        seoDescription:
            'Discover bedroom furniture — solid wood bed frames, bedside tables, and wardrobes in a clean Scandinavian style.',
        heroImage:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=85&fit=crop',
        heroAlt:
            'Minimalist bedroom with low smoked oak bed frame, white linen, and natural light',
        ogImage:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&fit=crop'
    },
    {
        slug: 'dining',
        label: 'Dining',
        headline: 'Dining Furniture',
        description:
            'Tables and chairs made for long meals and longer conversations.',
        seoDescription:
            'Shop dining tables and chairs — solid wood designs that bring people together with a warm, modern feel.',
        heroImage:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=85&fit=crop',
        heroAlt:
            'Scandinavian dining room with solid oak table, linen chairs, and soft pendant light',
        ogImage:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80&fit=crop'
    },
    {
        slug: 'office',
        label: 'Office',
        headline: 'Home Office Furniture',
        description:
            'Desks, chairs, and storage built to help you focus and still look good at the end of the day.',
        seoDescription:
            'Home office furniture — minimalist desks, ergonomic chairs, and smart storage for productive spaces.',
        heroImage:
            'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=85&fit=crop',
        heroAlt:
            'Clean Scandinavian home office with oak desk, ergonomic chair, and task lamp',
        ogImage:
            'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80&fit=crop'
    },
    {
        slug: 'outdoor',
        label: 'Outdoor',
        headline: 'Outdoor Furniture',
        description:
            'Weather-ready pieces for terraces, balconies, and gardens.',
        seoDescription:
            'Outdoor furniture for garden and balcony spaces — teak, steel, and all-weather materials.',
        heroImage:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&fit=crop',
        heroAlt:
            'Sunny garden terrace with Scandinavian outdoor dining table and chairs',
        ogImage:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&fit=crop'
    },
    {
        slug: 'sale',
        label: 'Sale',
        headline: 'Sale - Up to 40% Off',
        description:
            'Selected pieces at reduced prices, while stock lasts.',
        seoDescription:
            'Sale furniture collection with selected items discounted while stock lasts.',
        heroImage:
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85&fit=crop',
        heroAlt: 'Minimalist living room showing sale furniture pieces',
        ogImage:
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&fit=crop'
    }
]

const products = [
    // ── Living Room ──────────────────────────────────────────────────────────
    {
        publicId: 'Sofa_Putih_axyek6',
        name: 'Saga Modular Sofa',
        subCategory: 'Sofas',
        categorySlug: 'living-room',
        price: '3200.00',
        rating: '4.60',
        reviewCount: 142,
        isNew: false,
        stockQuantity: 5,
        imageAlt: 'Saga modular sofa in natural linen',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=left'
    },
    {
        publicId: 'Fabloft_gtltcg',
        name: 'Fjord Lounge Chair',
        subCategory: 'Armchairs',
        categorySlug: 'living-room',
        price: '1290.00',
        rating: '4.80',
        reviewCount: 124,
        isNew: true,
        stockQuantity: 9,
        imageAlt: 'Fjord lounge chair with walnut legs and cream boucle fabric',
        imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop'
    },
    {
        publicId: 'meja_tamu_hweev1',
        name: 'Eken Coffee Table',
        subCategory: 'Tables',
        categorySlug: 'living-room',
        price: '590.00',
        rating: '4.80',
        reviewCount: 67,
        isNew: true,
        stockQuantity: 18,
        imageAlt: 'Eken coffee table with travertine top and steel frame',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom'
    },
    {
        publicId: 'Rak_abstrak_fjn1dr',
        name: 'Nord Bookshelf',
        subCategory: 'Storage',
        categorySlug: 'living-room',
        price: '780.00',
        rating: '4.50',
        reviewCount: 98,
        isNew: false,
        stockQuantity: 14,
        imageAlt: 'Nord open-back bookshelf in lacquered birch plywood',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'
    },
    {
        publicId: 'lampu_gantung_njeplk',
        name: 'Tove Pendant Light',
        subCategory: 'Lighting',
        categorySlug: 'living-room',
        price: '320.00',
        rating: '4.70',
        reviewCount: 203,
        isNew: false,
        stockQuantity: 24,
        imageAlt: 'Tove pendant light with hand-blown opal glass globe',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Meja_mini_s0osdb',
        name: 'Alva Side Table',
        subCategory: 'Tables',
        categorySlug: 'living-room',
        price: '280.00',
        rating: '4.40',
        reviewCount: 55,
        isNew: false,
        stockQuantity: 30,
        imageAlt: 'Alva side table in solid ash wood',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=right'
    },
    // ── Bedroom ──────────────────────────────────────────────────────────────
    {
        publicId: 'Kasur_hitam_kvwwxd',
        name: 'Lund Bed Frame',
        subCategory: 'Beds',
        categorySlug: 'bedroom',
        price: '1890.00',
        rating: '4.90',
        reviewCount: 56,
        isNew: true,
        stockQuantity: 8,
        imageAlt: 'Lund low-profile platform bed frame in smoked oak',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop'
    },
    {
        publicId: 'meja_nakas_iym4yt',
        name: 'Hagen Bedside Table',
        subCategory: 'Bedside Tables',
        categorySlug: 'bedroom',
        price: '310.00',
        rating: '4.60',
        reviewCount: 89,
        isNew: false,
        stockQuantity: 26,
        imageAlt: 'Hagen bedside table in natural oak',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop&crop=right'
    },
    {
        publicId: 'beutiful_woodwork_lemari',
        name: 'Nora Wardrobe',
        subCategory: 'Storage',
        categorySlug: 'bedroom',
        price: '2100.00',
        rating: '4.70',
        reviewCount: 41,
        isNew: false,
        stockQuantity: 6,
        imageAlt: 'Nora two-door wardrobe in white lacquer',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'
    },
    {
        publicId: 'lemari_ueen0p',
        name: 'Berg Blanket Chest',
        subCategory: 'Storage',
        categorySlug: 'bedroom',
        price: '490.00',
        rating: '4.50',
        reviewCount: 32,
        isNew: true,
        stockQuantity: 11,
        imageAlt: 'Berg blanket chest in natural linen finish',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom'
    },
    // ── Dining ───────────────────────────────────────────────────────────────
    {
        publicId: 'meja_makan_f1an7v',
        name: 'Holm Dining Table',
        subCategory: 'Dining',
        categorySlug: 'dining',
        price: '2450.00',
        rating: '4.90',
        reviewCount: 87,
        isNew: false,
        stockQuantity: 12,
        imageAlt: 'Holm dining table in solid white oak with tapered legs',
        imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Ris_Dining_Chair',
        name: 'Ris Dining Chair',
        subCategory: 'Chairs',
        categorySlug: 'dining',
        price: '380.00',
        rating: '4.70',
        reviewCount: 116,
        isNew: false,
        stockQuantity: 20,
        imageAlt: 'Ris dining chair in upholstered stone linen',
        imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Kursi_Kecil_nqtiag',
        name: 'Sel Bar Stool',
        subCategory: 'Stools',
        categorySlug: 'dining',
        price: '260.00',
        rating: '4.50',
        reviewCount: 63,
        isNew: true,
        stockQuantity: 22,
        imageAlt: 'Sel bar stool in natural ash with footrest',
        imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80&fit=crop&crop=right'
    },
    {
        publicId: 'Klar_Sideboard',
        name: 'Klar Sideboard',
        subCategory: 'Storage',
        categorySlug: 'dining',
        price: '1640.00',
        rating: '4.80',
        reviewCount: 49,
        isNew: false,
        stockQuantity: 8,
        imageAlt: 'Klar low sideboard in oiled walnut',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'
    },
    // ── Office ───────────────────────────────────────────────────────────────
    {
        publicId: 'kursi_kerja_guepi4',
        name: 'Birk Desk Chair',
        subCategory: 'Chairs',
        categorySlug: 'office',
        price: '640.00',
        rating: '4.70',
        reviewCount: 211,
        isNew: false,
        stockQuantity: 17,
        imageAlt: 'Birk ergonomic desk chair in molded plywood with chrome legs',
        imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop&crop=right'
    },
    {
        publicId: 'Workstation_Office_vuhhjl',
        name: 'Verk Standing Desk',
        subCategory: 'Desks',
        categorySlug: 'office',
        price: '1850.00',
        rating: '4.80',
        reviewCount: 77,
        isNew: true,
        stockQuantity: 8,
        imageAlt: 'Verk height-adjustable desk in solid ash',
        imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Pin_Monitor_Shelf',
        name: 'Pin Monitor Shelf',
        subCategory: 'Accessories',
        categorySlug: 'office',
        price: '180.00',
        rating: '4.40',
        reviewCount: 139,
        isNew: false,
        stockQuantity: 35,
        imageAlt: 'Pin bamboo monitor shelf with cable slot',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Ark_Filing_Cabinet',
        name: 'Ark Filing Cabinet',
        subCategory: 'Storage',
        categorySlug: 'office',
        price: '560.00',
        rating: '4.30',
        reviewCount: 44,
        isNew: false,
        stockQuantity: 12,
        imageAlt: 'Ark two-drawer filing cabinet in white lacquer',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=left'
    },
    // ── Outdoor ──────────────────────────────────────────────────────────────
    {
        publicId: 'Sol_Outdoor_Sofa',
        name: 'Sol Outdoor Sofa',
        subCategory: 'Sofas',
        categorySlug: 'outdoor',
        price: '2800.00',
        rating: '4.80',
        reviewCount: 38,
        isNew: true,
        stockQuantity: 6,
        imageAlt: 'Sol outdoor sofa in teak and all-weather canvas',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Teak_Dining_Set',
        name: 'Teak Dining Set',
        subCategory: 'Dining',
        categorySlug: 'outdoor',
        price: '3400.00',
        rating: '4.90',
        reviewCount: 22,
        isNew: false,
        stockQuantity: 4,
        imageAlt: 'Outdoor teak dining table with four chairs',
        imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80&fit=crop'
    },
    {
        publicId: 'Kust_Lounger',
        name: 'Kust Lounger',
        subCategory: 'Loungers',
        categorySlug: 'outdoor',
        price: '890.00',
        rating: '4.60',
        reviewCount: 57,
        isNew: false,
        stockQuantity: 10,
        imageAlt: 'Kust teak sun lounger with adjustable back',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=right'
    },
    {
        publicId: 'Lykt_Outdoor_Lantern',
        name: 'Lykt Outdoor Lantern',
        subCategory: 'Lighting',
        categorySlug: 'outdoor',
        price: '140.00',
        rating: '4.50',
        reviewCount: 93,
        isNew: false,
        stockQuantity: 33,
        imageAlt: 'Lykt matte black outdoor lantern',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop'
    },
    // ── Sale ─────────────────────────────────────────────────────────────────
    {
        slug: 'fjord-lounge-chair-sale',
        publicId: 'Fabloft_gtltcg',
        name: 'Fjord Lounge Chair',
        subCategory: 'Armchairs',
        categorySlug: 'sale',
        price: '849.00',
        rating: '4.80',
        reviewCount: 124,
        isNew: false,
        stockQuantity: 9,
        imageAlt: 'Fjord lounge chair — sale price',
        imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop'
    },
    {
        slug: 'nord-bookshelf-sale',
        publicId: 'Rak_abstrak_fjn1dr',
        name: 'Nord Bookshelf',
        subCategory: 'Storage',
        categorySlug: 'sale',
        price: '490.00',
        rating: '4.50',
        reviewCount: 98,
        isNew: false,
        stockQuantity: 14,
        imageAlt: 'Nord bookshelf — sale price',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop'
    },
    {
        slug: 'ris-dining-chair-sale',
        publicId: 'Ris_Dining_Chair',
        name: 'Ris Dining Chair',
        subCategory: 'Chairs',
        categorySlug: 'sale',
        price: '220.00',
        rating: '4.70',
        reviewCount: 116,
        isNew: false,
        stockQuantity: 20,
        imageAlt: 'Ris dining chair — sale price',
        imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop&crop=right'
    },
    {
        slug: 'sel-bar-stool-sale',
        publicId: 'Kursi_Kecil_nqtiag',
        name: 'Sel Bar Stool',
        subCategory: 'Stools',
        categorySlug: 'sale',
        price: '170.00',
        rating: '4.50',
        reviewCount: 63,
        isNew: false,
        stockQuantity: 22,
        imageAlt: 'Sel bar stool — sale price',
        imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80&fit=crop'
    },
    {
        slug: 'tove-pendant-light-sale',
        publicId: 'lampu_gantung_njeplk',
        name: 'Tove Pendant Light',
        subCategory: 'Lighting',
        categorySlug: 'sale',
        price: '199.00',
        rating: '4.70',
        reviewCount: 203,
        isNew: false,
        stockQuantity: 24,
        imageAlt: 'Tove pendant light — sale price',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop'
    },
    {
        slug: 'alva-side-table-sale',
        publicId: 'Meja_mini_s0osdb',
        name: 'Alva Side Table',
        subCategory: 'Tables',
        categorySlug: 'sale',
        price: '169.00',
        rating: '4.40',
        reviewCount: 55,
        isNew: false,
        stockQuantity: 30,
        imageAlt: 'Alva side table — sale price',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom'
    }
]

function normalizeSlug(value) {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')        // semua spasi → -
        .replace(/-+/g, '-')         // multiple - → single -
        .replace(/[^a-z0-9_-]/g, '')
}


async function main() {
    const categoryMap = {}

    for (const category of categories) {
        const record = await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category
        })
        categoryMap[category.slug] = record
    }

    const adminPassword = await bcrypt.hash('adminpass', 10)
    const userPassword = await bcrypt.hash('userpass', 10)

    await prisma.user.upsert({
        where: { email: 'admin@blocknest.local' },
        update: {
            firstName: 'Admin',
            lastName: 'BlockNest',
            userName: 'admin',
            role: UserRole.ADMIN
        },
        create: {
            email: 'admin@blocknest.local',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'BlockNest',
            userName: 'admin',
            role: UserRole.ADMIN
        }
    })

    const customer = await prisma.user.upsert({
        where: { email: 'customer@blocknest.local' },
        update: {
            firstName: 'Nia',
            lastName: 'Customer',
            userName: 'nia.customer',
            role: UserRole.CUSTOMER
        },
        create: {
            email: 'customer@blocknest.local',
            password: userPassword,
            firstName: 'Nia',
            lastName: 'Customer',
            userName: 'nia.customer',
            role: UserRole.CUSTOMER
        }
    })

    const productMap = new Map()

    for (const item of products) {
        const slug = item.slug || normalizeSlug(item.name)
        const category = categoryMap[item.categorySlug] ?? categoryMap['living-room']
        const imageUrl = item.imageUrl || getImageUrl(item.publicId)

        const record = await prisma.product.upsert({
            where: { slug },
            update: {
                name: item.name,
                subCategory: item.subCategory || null,
                price: toMoney(item.price),
                rating: toRating(item.rating),
                reviewCount: item.reviewCount,
                isNew: item.isNew,
                stockQuantity: item.stockQuantity,
                categoryId: category.id
            },
            create: {
                slug,
                name: item.name,
                subCategory: item.subCategory || null,
                price: toMoney(item.price),
                rating: toRating(item.rating),
                reviewCount: item.reviewCount,
                isNew: item.isNew,
                stockQuantity: item.stockQuantity,
                categoryId: category.id
            }
        })

        productMap.set(item.publicId || slug, record)

        const existingImage = await prisma.productImage.findFirst({
            where: {
                productId: record.id,
                imageUrl
            }
        })

        if (!existingImage) {
            await prisma.productImage.create({
                data: {
                    productId: record.id,
                    imageUrl,
                    imageAlt: item.imageAlt,
                    isPrimary: true,
                    sortOrder: 0
                }
            })
        }
    }

    const seededProducts = Array.from(productMap.values())

    for (let index = 0; index < seededProducts.length; index += 1) {
        if (index >= 5) break

        const product = seededProducts[index]
        const reviewExists = await prisma.review.findFirst({
            where: {
                userId: customer.id,
                productId: product.id
            }
        })

        if (!reviewExists) {
            await prisma.review.create({
                data: {
                    userId: customer.id,
                    productId: product.id,
                    rating: 5 - (index % 2),
                    comment: `Review contoh untuk ${product.name}`
                }
            })
        }
    }

    for (let index = 0; index < 3 && index < seededProducts.length; index += 1) {
        const product = seededProducts[index]
        const cartExists = await prisma.cartItem.findFirst({
            where: {
                userId: customer.id,
                productId: product.id
            }
        })

        if (!cartExists) {
            await prisma.cartItem.create({
                data: {
                    userId: customer.id,
                    productId: product.id,
                    quantity: index + 1
                }
            })
        }

    }

    console.log(`Seed complete: ${categories.length} categories, ${products.length} products, 2 users`)
    console.log(`Admin login: admin@blocknest.local / adminpass`)
    console.log(`Customer login: customer@blocknest.local / userpass`)
}

try {
    await main()
} catch (error) {
    console.error(error)
    process.exitCode = 1
} finally {
    await prisma.$disconnect()
}
