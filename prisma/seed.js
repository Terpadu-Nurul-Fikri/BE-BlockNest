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
    {
        publicId: 'meja_makan_f1an7v',
        name: 'Meja Makan Solid Wood',
        categorySlug: 'dining',
        categoryLabel: 'Dining Tables',
        price: '2450.00',
        rating: '4.90',
        reviewCount: 87,
        isNew: false,
        stockQuantity: 12,
        imageAlt: 'Meja makan solid wood'
    },
    {
        publicId: 'lampu_gantung_njeplk',
        name: 'Lampu Gantung Opal Glass',
        categorySlug: 'living-room',
        categoryLabel: 'Lighting',
        price: '320.00',
        rating: '4.70',
        reviewCount: 203,
        isNew: false,
        stockQuantity: 24,
        imageAlt: 'Lampu gantung opal glass'
    },
    {
        publicId: 'meja_rias_mlnjlv',
        name: 'Meja Rias Minimalis',
        categorySlug: 'bedroom',
        categoryLabel: 'Bedroom Tables',
        price: '690.00',
        rating: '4.60',
        reviewCount: 41,
        isNew: true,
        stockQuantity: 15,
        imageAlt: 'Meja rias minimalis'
    },
    {
        publicId: 'Workstation_Office_vuhhjl',
        name: 'Workstation Office Desk',
        categorySlug: 'office',
        categoryLabel: 'Desks',
        price: '1850.00',
        rating: '4.80',
        reviewCount: 77,
        isNew: true,
        stockQuantity: 8,
        imageAlt: 'Workstation office desk'
    },
    {
        publicId: 'Meja_mini_s0osdb',
        name: 'Meja Mini Side Table',
        categorySlug: 'living-room',
        categoryLabel: 'Side Tables',
        price: '280.00',
        rating: '4.40',
        reviewCount: 55,
        isNew: false,
        stockQuantity: 30,
        imageAlt: 'Meja mini side table'
    },
    {
        publicId: 'meja_nakas_iym4yt',
        name: 'Meja Nakas Oak',
        categorySlug: 'bedroom',
        categoryLabel: 'Bedside Tables',
        price: '310.00',
        rating: '4.60',
        reviewCount: 89,
        isNew: false,
        stockQuantity: 26,
        imageAlt: 'Meja nakas oak'
    },
    {
        publicId: 'Fabloft_gtltcg',
        name: 'Fabloft Accent Chair',
        categorySlug: 'living-room',
        categoryLabel: 'Armchairs',
        price: '1290.00',
        rating: '4.80',
        reviewCount: 124,
        isNew: true,
        stockQuantity: 9,
        imageAlt: 'Fabloft accent chair'
    },
    {
        publicId: 'beutiful_woodwork_lemari',
        name: 'Beautiful Woodwork Wardrobe',
        categorySlug: 'bedroom',
        categoryLabel: 'Wardrobes',
        price: '2100.00',
        rating: '4.70',
        reviewCount: 41,
        isNew: false,
        stockQuantity: 6,
        imageAlt: 'Beautiful woodwork wardrobe'
    },
    {
        publicId: 'Rak_abstrak_fjn1dr',
        name: 'Rak Abstrak Storage Shelf',
        categorySlug: 'living-room',
        categoryLabel: 'Storage',
        price: '780.00',
        rating: '4.50',
        reviewCount: 98,
        isNew: false,
        stockQuantity: 14,
        imageAlt: 'Rak abstrak storage shelf'
    },
    {
        publicId: 'Sofa_Putih_axyek6',
        name: 'Sofa Putih Modular',
        categorySlug: 'living-room',
        categoryLabel: 'Sofas',
        price: '3200.00',
        rating: '4.60',
        reviewCount: 142,
        isNew: false,
        stockQuantity: 5,
        imageAlt: 'Sofa putih modular'
    },
    {
        publicId: 'Tempat_Tisu_pdnab6',
        name: 'Tempat Tisu Stone',
        categorySlug: 'living-room',
        categoryLabel: 'Decor',
        price: '120.00',
        rating: '4.30',
        reviewCount: 61,
        isNew: false,
        stockQuantity: 40,
        imageAlt: 'Tempat tisu stone'
    },
    {
        publicId: 'stand_tv_ojiali',
        name: 'Stand TV Low Cabinet',
        categorySlug: 'living-room',
        categoryLabel: 'Storage',
        price: '1450.00',
        rating: '4.70',
        reviewCount: 72,
        isNew: false,
        stockQuantity: 11,
        imageAlt: 'Stand TV low cabinet'
    },
    {
        publicId: 'rak_sepatu_jshhhl',
        name: 'Rak Sepatu Slim',
        categorySlug: 'living-room',
        categoryLabel: 'Storage',
        price: '390.00',
        rating: '4.50',
        reviewCount: 93,
        isNew: false,
        stockQuantity: 19,
        imageAlt: 'Rak sepatu slim'
    },
    {
        publicId: 'lampu_tidur_zbct5z',
        name: 'Lampu Tidur Warm Glow',
        categorySlug: 'bedroom',
        categoryLabel: 'Lighting',
        price: '140.00',
        rating: '4.50',
        reviewCount: 93,
        isNew: false,
        stockQuantity: 33,
        imageAlt: 'Lampu tidur warm glow'
    },
    {
        publicId: 'Kursi_Kecil_nqtiag',
        name: 'Kursi Kecil Compact',
        categorySlug: 'dining',
        categoryLabel: 'Chairs',
        price: '260.00',
        rating: '4.70',
        reviewCount: 63,
        isNew: true,
        stockQuantity: 22,
        imageAlt: 'Kursi kecil compact'
    },
    {
        publicId: 'kursi_kerja_guepi4',
        name: 'Kursi Kerja Ergonomic',
        categorySlug: 'office',
        categoryLabel: 'Chairs',
        price: '640.00',
        rating: '4.70',
        reviewCount: 211,
        isNew: false,
        stockQuantity: 17,
        imageAlt: 'Kursi kerja ergonomic'
    },
    {
        publicId: 'Kitchen_set_lymtfg',
        name: 'Kitchen Set Natural Oak',
        categorySlug: 'dining',
        categoryLabel: 'Kitchen Storage',
        price: '4200.00',
        rating: '4.80',
        reviewCount: 29,
        isNew: true,
        stockQuantity: 4,
        imageAlt: 'Kitchen set natural oak'
    },
    {
        publicId: 'kitchen_set_x1dd7m',
        name: 'Kitchen Set White Birch',
        categorySlug: 'dining',
        categoryLabel: 'Kitchen Storage',
        price: '3850.00',
        rating: '4.70',
        reviewCount: 25,
        isNew: false,
        stockQuantity: 7,
        imageAlt: 'Kitchen set white birch'
    },
    {
        publicId: 'Rak_buku_qwvc43',
        name: 'Rak Buku Open Shelf',
        categorySlug: 'living-room',
        categoryLabel: 'Storage',
        price: '980.00',
        rating: '4.60',
        reviewCount: 88,
        isNew: false,
        stockQuantity: 13,
        imageAlt: 'Rak buku open shelf'
    },
    {
        publicId:
            'LITFAD_Modern_Upholstered_Rocking_Chair_-_Tufted_Seat_and_Metal_Legs_Stylish_Lounge_Chair_for_Living_Room_Bedroom_-_Coffee_ixdlbc',
        name: 'LITFAD Modern Rocking Chair',
        categorySlug: 'living-room',
        categoryLabel: 'Armchairs',
        price: '1490.00',
        rating: '4.80',
        reviewCount: 52,
        isNew: true,
        stockQuantity: 3,
        imageAlt: 'LITFAD modern upholstered rocking chair'
    },
    {
        publicId: 'Kasur_hitam_kvwwxd',
        name: 'Kasur Hitam Platform Bed',
        categorySlug: 'bedroom',
        categoryLabel: 'Beds',
        price: '1890.00',
        rating: '4.90',
        reviewCount: 56,
        isNew: true,
        stockQuantity: 8,
        imageAlt: 'Kasur hitam platform bed'
    },
    {
        publicId: 'lemari_ueen0p',
        name: 'Lemari Sliding Wardrobe',
        categorySlug: 'bedroom',
        categoryLabel: 'Wardrobes',
        price: '2350.00',
        rating: '4.70',
        reviewCount: 44,
        isNew: false,
        stockQuantity: 5,
        imageAlt: 'Lemari sliding wardrobe'
    },
    {
        publicId: 'Hiasan2_dbgqgx',
        name: 'Hiasan Dinding Abstract II',
        categorySlug: 'living-room',
        categoryLabel: 'Decor',
        price: '180.00',
        rating: '4.40',
        reviewCount: 37,
        isNew: false,
        stockQuantity: 42,
        imageAlt: 'Hiasan dinding abstract II'
    },
    {
        publicId: 'tempat_tidur_dipan_phbr5z',
        name: 'Tempat Tidur Dipan Oak',
        categorySlug: 'bedroom',
        categoryLabel: 'Beds',
        price: '1720.00',
        rating: '4.80',
        reviewCount: 64,
        isNew: false,
        stockQuantity: 9,
        imageAlt: 'Tempat tidur dipan oak'
    },
    {
        publicId: 'meja_tamu_hweev1',
        name: 'Meja Tamu Coffee Table',
        categorySlug: 'living-room',
        categoryLabel: 'Coffee Tables',
        price: '590.00',
        rating: '4.80',
        reviewCount: 67,
        isNew: true,
        stockQuantity: 18,
        imageAlt: 'Meja tamu coffee table'
    },
    {
        publicId: 'Hiasan1_rzdnn7',
        name: 'Hiasan Dinding Abstract I',
        categorySlug: 'living-room',
        categoryLabel: 'Decor',
        price: '150.00',
        rating: '4.30',
        reviewCount: 31,
        isNew: false,
        stockQuantity: 50,
        imageAlt: 'Hiasan dinding abstract I'
    },
    {
        publicId: 'Minimalist_Headphone_Stand_d0i9ge',
        name: 'Minimalist Headphone Stand',
        categorySlug: 'office',
        categoryLabel: 'Accessories',
        price: '90.00',
        rating: '4.60',
        reviewCount: 73,
        isNew: false,
        stockQuantity: 60,
        imageAlt: 'Minimalist headphone stand'
    },
    {
        publicId: 'Minecraft_room_decor__Yes_sirrr_h16gx8',
        name: 'Minecraft Room Decor',
        categorySlug: 'sale',
        categoryLabel: 'Decor',
        price: '110.00',
        rating: '4.20',
        reviewCount: 28,
        isNew: true,
        stockQuantity: 21,
        imageAlt: 'Minecraft room decor'
    }
]

function normalizeSlug(value) {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')        // semua spasi → _
        .replace(/_+/g, '_')         // multiple _ → single _
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
        const slug = normalizeSlug(item.name)
        const category = categoryMap[item.categorySlug] ?? categoryMap['living-room']
        const imageUrl = getImageUrl(item.publicId)

        const record = await prisma.product.upsert({
            where: { slug },
            update: {
                name: item.name,
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
                price: toMoney(item.price),
                rating: toRating(item.rating),
                reviewCount: item.reviewCount,
                isNew: item.isNew,
                stockQuantity: item.stockQuantity,
                categoryId: category.id
            }
        })

        productMap.set(item.publicId, record)

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
